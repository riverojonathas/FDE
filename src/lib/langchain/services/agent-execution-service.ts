import { supabase } from "@/lib/supabase/client";
import { IAgent, AgentExecutionResult, AgentFeedback, AgentExecutionHistory } from "../agents/agent-interface";
import { v4 as uuidv4 } from "uuid";

/**
 * Interface para filtros de busca de execuções de agentes
 */
export interface AgentExecutionFilter {
  correctionId?: string;
  agentId?: string;
  startDate?: string;
  endDate?: string;
  successful?: boolean;
}

/**
 * Interface para métricas de um agente
 */
export interface AgentMetrics {
  agentId: string;
  totalExecutions: number;
  successRate: number;
  averageExecutionTime: number;
  averageSatisfactionScore?: number;
  errorRate: number;
  lastExecutionTime: string;
}

/**
 * Serviço para gerenciar execuções de agentes
 * Responsável por salvar histórico, métricas e feedback
 */
export class AgentExecutionService {
  
  /**
   * Executa um agente e salva os resultados
   */
  static async executeAgent(
    agent: IAgent,
    input: any,
    context?: { correctionId: string; [key: string]: any }
  ): Promise<AgentExecutionResult> {
    // Gerar ID da correção se não fornecido
    const correctionId = context?.correctionId || `cor_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    try {
      // Executar o agente
      const result = await agent.execute(input, { ...context, correctionId });
      
      // Salvar resultado no histórico
      await this.saveExecutionHistory({
        correctionId,
        agentId: agent.id,
        input,
        promptUsed: result.prompt || "",
        rawOutput: result.rawOutput || "",
        processedResult: result.result,
        executionTimeMs: result.executionTimeMs,
        timestamp: result.timestamp,
      });
      
      return result;
    } catch (error: any) {
      console.error(`Erro ao executar agente ${agent.id}:`, error);
      
      // Criar resultado de erro
      const errorResult: AgentExecutionResult = {
        success: false,
        agentId: agent.id,
        error: error.message,
        executionTimeMs: 0,
        timestamp: new Date().toISOString(),
        modelInfo: {
          provider: agent.modelSettings.provider,
          modelName: agent.modelSettings.modelName,
        },
      };
      
      // Salvar erro no histórico
      await this.saveExecutionHistory({
        correctionId,
        agentId: agent.id,
        input,
        promptUsed: "",
        rawOutput: "",
        processedResult: { error: error.message },
        executionTimeMs: 0,
        timestamp: errorResult.timestamp,
      });
      
      return errorResult;
    }
  }
  
  /**
   * Salva o histórico de execução de um agente
   */
  static async saveExecutionHistory(history: Omit<AgentExecutionHistory, "id">): Promise<string> {
    try {
      const id = uuidv4();
      
      const { error } = await supabase.from("agent_execution_history").insert({
        id,
        correction_id: history.correctionId,
        agent_id: history.agentId,
        input: history.input,
        prompt_used: history.promptUsed,
        raw_output: history.rawOutput,
        processed_result: history.processedResult,
        execution_time_ms: history.executionTimeMs,
        created_at: history.timestamp,
      });
      
      if (error) throw error;
      
      return id;
    } catch (error) {
      console.error("Erro ao salvar histórico de execução:", error);
      throw error;
    }
  }
  
  /**
   * Salva feedback para uma execução de agente
   */
  static async saveFeedback(feedback: AgentFeedback): Promise<boolean> {
    try {
      const { error } = await supabase.from("agent_feedback").insert({
        correction_id: feedback.correctionId,
        agent_id: feedback.agentId,
        satisfaction_score: feedback.satisfactionScore,
        comments: feedback.comments,
        issues: feedback.issues,
        suggestions: feedback.suggestions,
        reviewed_by: feedback.reviewedBy,
        reviewed_at: feedback.reviewedAt,
      });
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error("Erro ao salvar feedback:", error);
      return false;
    }
  }
  
  /**
   * Busca o histórico de execução para uma correção
   */
  static async getCorrectionHistory(correctionId: string): Promise<AgentExecutionHistory[]> {
    try {
      const { data, error } = await supabase
        .from("agent_execution_history")
        .select(`
          id,
          correction_id,
          agent_id,
          input,
          prompt_used,
          raw_output,
          processed_result,
          execution_time_ms,
          created_at
        `)
        .eq("correction_id", correctionId)
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      
      // Formatar dados para o formato da interface
      return (data || []).map(item => ({
        id: item.id,
        correctionId: item.correction_id,
        agentId: item.agent_id,
        input: item.input,
        promptUsed: item.prompt_used,
        rawOutput: item.raw_output,
        processedResult: item.processed_result,
        executionTimeMs: item.execution_time_ms,
        timestamp: item.created_at,
      }));
    } catch (error) {
      console.error(`Erro ao buscar histórico para correção ${correctionId}:`, error);
      return [];
    }
  }
  
  /**
   * Busca feedback para uma execução de agente
   */
  static async getAgentFeedback(correctionId: string, agentId: string): Promise<AgentFeedback | null> {
    try {
      const { data, error } = await supabase
        .from("agent_feedback")
        .select("*")
        .eq("correction_id", correctionId)
        .eq("agent_id", agentId)
        .maybeSingle();
      
      if (error) throw error;
      
      if (!data) return null;
      
      // Formatar dados para o formato da interface
      return {
        correctionId: data.correction_id,
        agentId: data.agent_id,
        satisfactionScore: data.satisfaction_score,
        comments: data.comments,
        issues: data.issues,
        suggestions: data.suggestions,
        reviewedBy: data.reviewed_by,
        reviewedAt: data.reviewed_at,
      };
    } catch (error) {
      console.error(`Erro ao buscar feedback para agente ${agentId} na correção ${correctionId}:`, error);
      return null;
    }
  }
  
  /**
   * Busca histórico de execuções com filtros
   */
  static async searchExecutionHistory(
    filters: AgentExecutionFilter,
    options: { limit?: number; offset?: number } = {}
  ): Promise<{ data: AgentExecutionHistory[]; count: number }> {
    try {
      let query = supabase
        .from("agent_execution_history")
        .select("*", { count: "exact" });
      
      if (filters.correctionId) {
        query = query.eq("correction_id", filters.correctionId);
      }
      
      if (filters.agentId) {
        query = query.eq("agent_id", filters.agentId);
      }
      
      if (filters.startDate) {
        query = query.gte("created_at", filters.startDate);
      }
      
      if (filters.endDate) {
        query = query.lte("created_at", filters.endDate);
      }
      
      if (filters.successful !== undefined) {
        query = query.eq("successful", filters.successful);
      }
      
      // Aplicar paginação
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }
      
      // Ordenar por data
      query = query.order("created_at", { ascending: false });
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      // Formatar dados para o formato da interface
      const formattedData = (data || []).map(item => ({
        id: item.id,
        correctionId: item.correction_id,
        agentId: item.agent_id,
        input: item.input,
        promptUsed: item.prompt_used,
        rawOutput: item.raw_output,
        processedResult: item.processed_result,
        executionTimeMs: item.execution_time_ms,
        timestamp: item.created_at,
      }));
      
      return {
        data: formattedData,
        count: count || 0,
      };
    } catch (error) {
      console.error("Erro ao buscar histórico de execuções:", error);
      return { data: [], count: 0 };
    }
  }
  
  /**
   * Obtém métricas de desempenho para um agente
   */
  static async getAgentMetrics(agentId: string, timeframe?: { startDate: string; endDate: string }): Promise<AgentMetrics | null> {
    try {
      let query = supabase
        .from("agent_execution_history")
        .select("*")
        .eq("agent_id", agentId);
      
      if (timeframe) {
        query = query
          .gte("created_at", timeframe.startDate)
          .lte("created_at", timeframe.endDate);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        return null;
      }
      
      // Calcular métricas
      const totalExecutions = data.length;
      const successfulExecutions = data.filter(item => !item.processed_result.error).length;
      const successRate = (successfulExecutions / totalExecutions) * 100;
      const errorRate = 100 - successRate;
      
      // Calcular tempo médio de execução
      const totalTime = data.reduce((sum, item) => sum + item.execution_time_ms, 0);
      const averageExecutionTime = totalTime / totalExecutions;
      
      // Obter data da última execução
      const lastExecution = data.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];
      
      // Buscar feedback para calcular média de satisfação
      const feedbackQuery = await supabase
        .from("agent_feedback")
        .select("satisfaction_score")
        .eq("agent_id", agentId);
      
      let averageSatisfactionScore;
      if (!feedbackQuery.error && feedbackQuery.data && feedbackQuery.data.length > 0) {
        const totalSatisfaction = feedbackQuery.data.reduce(
          (sum, item) => sum + item.satisfaction_score, 
          0
        );
        averageSatisfactionScore = totalSatisfaction / feedbackQuery.data.length;
      }
      
      return {
        agentId,
        totalExecutions,
        successRate,
        averageExecutionTime,
        averageSatisfactionScore,
        errorRate,
        lastExecutionTime: lastExecution.created_at,
      };
    } catch (error) {
      console.error(`Erro ao obter métricas para o agente ${agentId}:`, error);
      return null;
    }
  }
  
  /**
   * Obtém histórico de execução com feedback para visualização
   */
  static async getExecutionWithFeedback(
    correctionId: string, 
    agentId: string
  ): Promise<{ execution: AgentExecutionHistory; feedback: AgentFeedback | null } | null> {
    try {
      // Buscar histórico de execução
      const executionQuery = await supabase
        .from("agent_execution_history")
        .select("*")
        .eq("correction_id", correctionId)
        .eq("agent_id", agentId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      
      if (executionQuery.error || !executionQuery.data) {
        return null;
      }
      
      const execution: AgentExecutionHistory = {
        id: executionQuery.data.id,
        correctionId: executionQuery.data.correction_id,
        agentId: executionQuery.data.agent_id,
        input: executionQuery.data.input,
        promptUsed: executionQuery.data.prompt_used,
        rawOutput: executionQuery.data.raw_output,
        processedResult: executionQuery.data.processed_result,
        executionTimeMs: executionQuery.data.execution_time_ms,
        timestamp: executionQuery.data.created_at,
      };
      
      // Buscar feedback
      const feedback = await this.getAgentFeedback(correctionId, agentId);
      
      return {
        execution,
        feedback,
      };
    } catch (error) {
      console.error(`Erro ao buscar execução e feedback para correção ${correctionId}, agente ${agentId}:`, error);
      return null;
    }
  }
} 