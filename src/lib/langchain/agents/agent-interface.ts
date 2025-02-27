import { z } from "zod";

/**
 * Interface base para todos os agentes do sistema de correção
 * Cada agente implementa esta interface para garantir consistência
 */
export interface IAgent {
  id: string;
  name: string;
  description: string;
  
  /**
   * Configurações do modelo de IA para este agente
   */
  modelSettings: {
    provider: string;
    modelName: string;
    temperature: number;
    maxTokens?: number;
  };
  
  /**
   * Retorna o prompt formatado para este agente com base nos dados de entrada
   */
  getPrompt: (input: any, context?: any) => string;
  
  /**
   * Executa o agente com os dados de entrada e retorna o resultado
   */
  execute: (input: any, context?: any) => Promise<AgentExecutionResult>;
  
  /**
   * Valida a saída da IA usando Zod
   */
  validateOutput?: (output: any) => Promise<boolean>;
  
  /**
   * Esquema Zod para validação do resultado
   */
  outputSchema?: z.ZodType<any>;
}

/**
 * Resultado da execução de um agente
 */
export interface AgentExecutionResult {
  success: boolean;
  agentId: string;
  prompt?: string;
  rawOutput?: string;
  result?: any;
  error?: string;
  executionTimeMs: number;
  timestamp: string;
  modelInfo: {
    provider: string;
    modelName: string;
    tokensUsed?: number;
  };
}

/**
 * Histórico de feedback para um agente
 */
export interface AgentFeedback {
  correctionId: string;
  agentId: string;
  satisfactionScore: number; // 1-5
  comments?: string;
  issues?: string[];
  suggestions?: string;
  reviewedBy: string;
  reviewedAt: string;
}

/**
 * Histórico de execução de um agente
 */
export interface AgentExecutionHistory {
  id?: string; // ID único da execução
  correctionId: string;
  agentId: string;
  input: any;
  promptUsed: string;
  rawOutput: string;
  processedResult: any;
  executionTimeMs: number;
  timestamp: string;
  feedback?: AgentFeedback;
}

/**
 * Configuração para prompt template de um agente
 */
export interface PromptTemplate {
  id: string;
  name: string;
  template: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  isDefault: boolean;
  variables: string[]; // Lista de variáveis no template
  agentId: string; // ID do agente ao qual este template pertence
} 