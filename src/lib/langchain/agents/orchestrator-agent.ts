import { LLMChain } from 'langchain/chains';
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';
import { IAgent, AgentExecutionResult } from './agent-interface';
import { PromptService } from '../services/prompt-service';
import { TextAnalysisAgent } from './text-analysis-agent';
import { CriteriaAnalysisAgent } from './criteria-analysis-agent';
import { FeedbackAgent } from './feedback-agent';

interface IOrchestratorConfig {
  useTextAnalysis: boolean;
  useCriteriaAnalysis: boolean;
  useFeedback: boolean;
  maxRetries: number;
  verbose: boolean;
}

const defaultConfig: IOrchestratorConfig = {
  useTextAnalysis: true,
  useCriteriaAnalysis: true,
  useFeedback: true,
  maxRetries: 3,
  verbose: true,
};

export interface IPromptStep {
  id: string;
  agentId: string;
  prompt: string;
  response?: string;
  status: 'pending' | 'completed' | 'failed';
  error?: string;
  timestamp: string;
}

export interface IPromptFlow {
  id: string;
  steps: IPromptStep[];
  currentStep: number;
  status: 'in_progress' | 'completed' | 'failed';
  startTime: string;
  endTime?: string;
}

export class OrchestratorAgent implements IAgent {
  id: string = 'orchestrator';
  name: string = 'Orquestrador de Correção';
  description: string = 'Coordena o fluxo de análise e correção entre os agentes';
  
  private config: IOrchestratorConfig;
  private textAnalysisAgent: TextAnalysisAgent;
  private criteriaAnalysisAgent: CriteriaAnalysisAgent;
  private feedbackAgent: FeedbackAgent;
  private activeFlows: Map<string, IPromptFlow>;

  modelSettings = {
    provider: 'openai',
    modelName: 'gpt-4',
    temperature: 0.2,
  };

  constructor(config: Partial<IOrchestratorConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.textAnalysisAgent = new TextAnalysisAgent();
    this.criteriaAnalysisAgent = new CriteriaAnalysisAgent();
    this.feedbackAgent = new FeedbackAgent();
    this.activeFlows = new Map();
  }

  async getPrompt(input: any, context?: any): Promise<string> {
    const template = await PromptService.getDefaultTemplate(this.id);
    if (!template) {
      throw new Error('Template padrão não encontrado para o orquestrador');
    }
    return template.template;
  }

  async execute(input: {
    text: string;
    questionType?: string;
    criteria?: Record<string, any>;
  }): Promise<AgentExecutionResult> {
    const flowId = crypto.randomUUID();
    const flow: IPromptFlow = {
      id: flowId,
      steps: [],
      currentStep: 0,
      status: 'in_progress',
      startTime: new Date().toISOString(),
    };

    this.activeFlows.set(flowId, flow);

    try {
      // 1. Análise do Texto
      if (this.config.useTextAnalysis) {
        const textAnalysisStep = await this.executeStep({
          flowId,
          agentId: 'text-analysis',
          prompt: await this.textAnalysisAgent.getPrompt(input),
        });
        flow.steps.push(textAnalysisStep);
      }

      // 2. Análise dos Critérios
      if (this.config.useCriteriaAnalysis) {
        const criteriaAnalysisStep = await this.executeStep({
          flowId,
          agentId: 'criteria-analysis',
          prompt: await this.criteriaAnalysisAgent.getPrompt({
            text: input.text,
            questionType: input.questionType,
            criteria: input.criteria,
          }),
        });
        flow.steps.push(criteriaAnalysisStep);
      }

      // 3. Geração de Feedback
      if (this.config.useFeedback) {
        const feedbackStep = await this.executeStep({
          flowId,
          agentId: 'feedback',
          prompt: await this.feedbackAgent.getPrompt({
            textAnalysis: flow.steps[0]?.response,
            criteriaAnalysis: flow.steps[1]?.response,
          }),
        });
        flow.steps.push(feedbackStep);
      }

      flow.status = 'completed';
      flow.endTime = new Date().toISOString();

      return {
        success: true,
        agentId: this.id,
        result: {
          flowId,
          steps: flow.steps,
          status: flow.status,
          startTime: flow.startTime,
          endTime: flow.endTime,
        },
        executionTimeMs: new Date(flow.endTime).getTime() - new Date(flow.startTime).getTime(),
        timestamp: new Date().toISOString(),
        modelInfo: this.modelSettings,
      };
    } catch (error) {
      flow.status = 'failed';
      flow.endTime = new Date().toISOString();

      return {
        success: false,
        agentId: this.id,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        executionTimeMs: new Date(flow.endTime).getTime() - new Date(flow.startTime).getTime(),
        timestamp: new Date().toISOString(),
        modelInfo: this.modelSettings,
      };
    }
  }

  private async executeStep({
    flowId,
    agentId,
    prompt,
  }: {
    flowId: string;
    agentId: string;
    prompt: string;
  }): Promise<IPromptStep> {
    const step: IPromptStep = {
      id: crypto.randomUUID(),
      agentId,
      prompt,
      status: 'pending',
      timestamp: new Date().toISOString(),
    };

    try {
      // Aqui você pode implementar a lógica para aguardar a resposta manual
      // Por enquanto, vamos apenas marcar como pendente
      step.status = 'pending';
      
      return step;
    } catch (error) {
      step.status = 'failed';
      step.error = error instanceof Error ? error.message : 'Erro desconhecido';
      throw error;
    }
  }

  // Método para atualizar a resposta de um passo manualmente
  async updateStepResponse(flowId: string, stepId: string, response: string): Promise<void> {
    const flow = this.activeFlows.get(flowId);
    if (!flow) {
      throw new Error('Fluxo não encontrado');
    }

    const step = flow.steps.find(s => s.id === stepId);
    if (!step) {
      throw new Error('Passo não encontrado');
    }

    step.response = response;
    step.status = 'completed';
  }

  // Método para obter o status atual de um fluxo
  getFlowStatus(flowId: string): IPromptFlow | undefined {
    return this.activeFlows.get(flowId);
  }

  // Método para limpar fluxos antigos
  cleanupOldFlows(maxAgeMs: number = 24 * 60 * 60 * 1000): void {
    const now = Date.now();
    for (const [flowId, flow] of this.activeFlows.entries()) {
      const flowAge = now - new Date(flow.startTime).getTime();
      if (flowAge > maxAgeMs) {
        this.activeFlows.delete(flowId);
      }
    }
  }
} 