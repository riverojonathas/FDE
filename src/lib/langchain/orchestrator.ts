import { IAgent, AgentExecutionResult } from "./agents/agent-interface";
import { supabase } from "@/lib/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { GrammarAnalysisAgent } from "./agents/grammar-analysis-agent";
import { CoherenceAnalysisAgent } from "./agents/coherence-agent";
import { ThemeAnalysisAgent } from "./agents/theme-analysis-agent";
import { AgentExecutionService } from "./services/agent-execution-service";

export interface OrchestrationInput {
  text: string;
  studentId?: string;
  questionId?: string;
  theme?: {
    title: string;
    description?: string;
    expectedPoints?: string[];
  };
  options?: {
    includePlagiarismCheck?: boolean;
    customAgentOptions?: Record<string, any>;
  };
}

export interface OrchestrationOutput {
  correctionId: string;
  textAnalysis: any;
  coherenceAnalysis: any;
  themeAnalysis: any;
  plagiarismResult?: any;
  feedback?: any;
  scoring?: any;
  completeResult: boolean;
  metadata: {
    studentId?: string;
    questionId?: string;
    created_at: string;
    updated_at: string;
    processing_time: number;
    word_count: number;
    status: "complete" | "partial" | "error";
    error?: string;
  };
}

interface AgentRegistration {
  agent: IAgent;
  required: boolean;
  dependsOn?: string[];
}

/**
 * Orquestrador responsável por coordenar a execução dos agentes de correção
 */
export class CorrectionOrchestrator {
  private agents: Map<string, AgentRegistration> = new Map();
  private executionOrder: string[] = [];
  private defaultAgents: boolean = false;
  
  constructor() {
    // Por padrão, não registra agentes automaticamente
  }
  
  /**
   * Registra os agentes padrão para a pipeline de correção
   */
  registerDefaultAgents() {
    if (this.defaultAgents) return;
    
    // Agentes básicos
    this.registerAgent(new GrammarAnalysisAgent(), true);
    this.registerAgent(new CoherenceAnalysisAgent(), true);
    this.registerAgent(new ThemeAnalysisAgent(), true);
    
    this.defaultAgents = true;
  }
  
  /**
   * Registra um agente no orquestrador
   */
  registerAgent(agent: IAgent, required: boolean = false, dependsOn: string[] = []) {
    this.agents.set(agent.id, { agent, required, dependsOn });
    
    // Atualizar ordem de execução baseado nas dependências
    this.updateExecutionOrder();
    
    return this;
  }
  
  /**
   * Atualiza a ordem de execução dos agentes baseada nas dependências
   */
  private updateExecutionOrder() {
    // Algoritmo simples para ordenação topológica
    const visited = new Set<string>();
    const order: string[] = [];
    
    const visit = (agentId: string) => {
      if (visited.has(agentId)) return;
      visited.add(agentId);
      
      const registration = this.agents.get(agentId);
      if (!registration) return;
      
      // Visitar dependências primeiro
      for (const depId of registration.dependsOn || []) {
        visit(depId);
      }
      
      order.push(agentId);
    };
    
    // Visitar todos os agentes
    for (const [agentId] of this.agents) {
      visit(agentId);
    }
    
    this.executionOrder = order;
  }
  
  /**
   * Calcula o número de palavras em um texto
   */
  private countWords(text: string): number {
    return text.split(/\s+/).filter(Boolean).length;
  }
  
  /**
   * Executa a pipeline de correção
   */
  async execute(input: OrchestrationInput): Promise<OrchestrationOutput> {
    // Verificar se temos agentes registrados, senão registrar os padrão
    if (this.agents.size === 0) {
      this.registerDefaultAgents();
    }
    
    // Gerar ID para esta correção
    const correctionId = uuidv4();
    const startTime = Date.now();
    const wordCount = this.countWords(input.text);
    
    // Resultados dos agentes
    const results: Record<string, any> = {};
    let hasError = false;
    
    // Contexto compartilhado entre os agentes
    const context = {
      correctionId,
      results,
      studentId: input.studentId,
      questionId: input.questionId,
      theme: input.theme,
      options: input.options
    };
    
    // Executar agentes na ordem definida
    for (const agentId of this.executionOrder) {
      const registration = this.agents.get(agentId);
      if (!registration) continue;
      
      const { agent, required } = registration;
      
      try {
        console.log(`Executando agente ${agent.name}...`);
        
        // Preparar input específico para o agente
        let agentInput: any = { text: input.text };
        
        // Adicionar opções específicas para este agente, se fornecidas
        if (input.options?.customAgentOptions?.[agentId]) {
          agentInput = {
            ...agentInput,
            ...input.options.customAgentOptions[agentId]
          };
        }
        
        // Adicionar informações de tema para o agente de análise de tema
        if (agentId === 'theme-analysis' && input.theme) {
          agentInput.theme = input.theme;
        }
        
        // Executar o agente e salvar histórico
        const result = await AgentExecutionService.executeAgent(agent, agentInput, context);
        
        // Salvar resultado no contexto para uso por outros agentes
        results[agentId] = result.success ? result.result : { error: result.error };
        
        // Se um agente obrigatório falhar, marcar erro
        if (required && !result.success) {
          hasError = true;
          console.error(`Erro no agente obrigatório ${agent.name}: ${result.error}`);
        }
        
      } catch (error: any) {
        console.error(`Erro ao executar agente ${agent.name}:`, error);
        results[agentId] = { error: error.message };
        
        if (required) {
          hasError = true;
        }
      }
    }
    
    // Calcular tempo total de processamento
    const endTime = Date.now();
    const processingTime = (endTime - startTime) / 1000; // em segundos
    
    // Montar resultado final
    const output: OrchestrationOutput = {
      correctionId,
      textAnalysis: results['grammar-analysis'],
      coherenceAnalysis: results['coherence-analysis'],
      themeAnalysis: results['theme-analysis'],
      plagiarismResult: results['plagiarism-detection'],
      feedback: results['feedback-generation'],
      scoring: results['scoring-agent'],
      completeResult: !hasError,
      metadata: {
        studentId: input.studentId,
        questionId: input.questionId,
        created_at: new Date(startTime).toISOString(),
        updated_at: new Date(endTime).toISOString(),
        processing_time: processingTime,
        word_count: wordCount,
        status: hasError ? "partial" : "complete"
      }
    };
    
    // Salvar resultado no Supabase
    try {
      await supabase.from("corrections").insert({
        id: correctionId,
        student_id: input.studentId,
        question_id: input.questionId,
        input: {
          text: input.text,
          theme: input.theme,
          options: input.options
        },
        result: {
          textAnalysis: output.textAnalysis,
          coherenceAnalysis: output.coherenceAnalysis,
          themeAnalysis: output.themeAnalysis,
          plagiarismResult: output.plagiarismResult,
          feedback: output.feedback,
          scoring: output.scoring
        },
        metadata: {
          student_id: input.studentId,
          question_id: input.questionId,
          created_at: output.metadata.created_at,
          processing_time: processingTime,
          word_count: wordCount,
          version: "1.0.0",
          status: output.metadata.status
        }
      });
    } catch (error) {
      console.error("Erro ao salvar correção no Supabase:", error);
    }
    
    return output;
  }
  
  /**
   * Recupera uma correção existente pelo ID
   */
  async getCorrection(correctionId: string): Promise<OrchestrationOutput | null> {
    try {
      const { data, error } = await supabase
        .from("corrections")
        .select("*")
        .eq("id", correctionId)
        .single();
      
      if (error) throw error;
      if (!data) return null;
      
      // Formatar dados para o formato de saída
      return {
        correctionId: data.id,
        textAnalysis: data.result?.textAnalysis,
        coherenceAnalysis: data.result?.coherenceAnalysis,
        themeAnalysis: data.result?.themeAnalysis,
        plagiarismResult: data.result?.plagiarismResult,
        feedback: data.result?.feedback,
        scoring: data.result?.scoring,
        completeResult: data.metadata?.status === "complete",
        metadata: {
          studentId: data.student_id,
          questionId: data.question_id,
          created_at: data.created_at,
          updated_at: data.updated_at,
          processing_time: data.metadata?.processing_time || 0,
          word_count: data.metadata?.word_count || 0,
          status: data.metadata?.status || "partial",
          error: data.metadata?.error
        }
      };
    } catch (error) {
      console.error(`Erro ao buscar correção ${correctionId}:`, error);
      return null;
    }
  }
} 