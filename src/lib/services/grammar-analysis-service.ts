import { supabase } from '@/lib/supabase/client'
import { v4 as uuidv4 } from 'uuid'
import { 
  AgentApiResponse, 
  AgentStatus, 
  IGrammarAnalysis 
} from '@/types/correction-agents'

/**
 * Valida se uma string é um UUID válido
 */
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Converte dados genéricos para o tipo IGrammarAnalysis de forma segura
 */
function convertToGrammarAnalysis(data: any): IGrammarAnalysis | null {
  // Faz uma conversão segura verificando se os campos obrigatórios existem
  if (!data) return null;
  
  return {
    id: data.id || '',
    correction_id: data.correction_id || '',
    status: data.status || 'pending',
    analysis_data: data.analysis_data || null,
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || new Date().toISOString()
  } as IGrammarAnalysis;
}

/**
 * Classe de serviço para gerenciar análises gramaticais
 */
export class GrammarAnalysisService {
  private static TABLE_NAME = 'grammar_analyses';

  /**
   * Testa a conexão com o Supabase
   */
  static async testConnection(): Promise<{
    success: boolean;
    message: string;
    data?: any;
    error?: any;
  }> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('id')
        .limit(1);
        
      if (error) {
        return {
          success: false,
          message: `Erro na conexão: ${error.message}`,
          error
        };
      }

      return {
        success: true,
        message: 'Conexão estabelecida com sucesso',
        data
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido na conexão',
        error
      };
    }
  }

  /**
   * Busca ou cria uma análise gramatical para uma correção
   */
  static async getOrCreate(correctionId: string): Promise<{
    success: boolean;
    data?: IGrammarAnalysis;
    error?: string;
  }> {
    try {
      if (!isValidUUID(correctionId)) {
        return {
          success: false,
          error: 'ID da correção inválido'
        };
      }

      console.log(`[GrammarAnalysis] Iniciando busca/criação para correção: ${correctionId}`);
      
      // Primeiro, tenta buscar uma análise existente usando uma query mais simples
      const { data: existingAnalyses, error: fetchError } = await supabase
        .from(this.TABLE_NAME)
        .select()
        .eq('correction_id', correctionId);

      console.log('[GrammarAnalysis] Resultado da busca:', {
        existingAnalyses,
        fetchError
      });

      if (fetchError) {
        console.error('[GrammarAnalysis] Erro ao buscar análise:', {
          code: fetchError.code,
          message: fetchError.message,
          details: fetchError.details
        });
        return {
          success: false,
          error: `Erro ao buscar análise: ${fetchError.message}`
        };
      }

      // Verifica se encontrou alguma análise existente
      const existingAnalysis = existingAnalyses?.[0];
      if (existingAnalysis) {
        console.log('[GrammarAnalysis] Análise existente encontrada:', existingAnalysis);
        return {
          success: true,
          data: existingAnalysis
        };
      }

      console.log('[GrammarAnalysis] Criando nova análise gramatical');
      
      const newAnalysisData = {
        correction_id: correctionId,
        status: 'pending',
        errors: [],
        suggestions: [],
        metrics: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('[GrammarAnalysis] Dados para nova análise:', newAnalysisData);

      // Simplifica a query de inserção
      const { data: newAnalyses, error: insertError } = await supabase
        .from(this.TABLE_NAME)
        .insert([newAnalysisData])
        .select();

      console.log('[GrammarAnalysis] Resultado da inserção:', {
        newAnalyses,
        insertError
      });

      if (insertError) {
        console.error('[GrammarAnalysis] Erro detalhado ao criar análise:', {
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          data: newAnalysisData
        });
        return {
          success: false,
          error: `Erro ao criar análise: ${insertError.message}`
        };
      }

      const newAnalysis = newAnalyses?.[0];
      if (!newAnalysis) {
        return {
          success: false,
          error: 'Falha ao criar análise: nenhum dado retornado'
        };
      }

      console.log('[GrammarAnalysis] Nova análise criada com sucesso:', newAnalysis);
      return {
        success: true,
        data: newAnalysis
      };
    } catch (error) {
      const errorDetails = {
        error,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined,
        correctionId
      };
      console.error('[GrammarAnalysis] Erro detalhado em getOrCreate:', errorDetails);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido ao processar análise'
      };
    }
  }

  /**
   * Atualiza uma análise gramatical existente
   */
  static async update(analysisId: string, updates: Partial<IGrammarAnalysis>): Promise<IGrammarAnalysis> {
    if (!isValidUUID(analysisId)) {
      throw new Error('ID da análise inválido');
    }

    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', analysisId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar análise:', error);
      throw new Error(`Erro ao atualizar análise: ${error.message}`);
    }

    return data;
  }

  /**
   * Obtém uma análise gramatical pelo ID da correção
   */
  static async getByCorrection(correctionId: string): Promise<{
    success: boolean;
    data?: IGrammarAnalysis;
    error?: string;
  }> {
    try {
      // Verificar se o ID é válido
      if (!correctionId || !isValidUUID(correctionId)) {
        return {
          success: false,
          error: 'ID de correção inválido. Deve ser um UUID válido.'
        };
      }

      console.log(`Buscando análise gramatical para correção: ${correctionId}`);
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('correction_id', correctionId)
        .single();

      if (error) {
        // Se não encontrou, retornar dados nulos, mas sem erro
        if (error.code === 'PGRST116') {
          console.log(`Análise gramatical não encontrada para correção: ${correctionId}`);
          return {
            success: true,
            data: undefined
          };
        }
        
        console.error('Erro ao buscar análise gramatical:', error);
        throw new Error(`Erro ao buscar: ${error.message}`);
      }

      console.log('Análise gramatical encontrada:', data);
      return {
        success: true,
        data: data as IGrammarAnalysis
      };
    } catch (error) {
      console.error('Erro ao buscar análise gramatical:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Atualiza o status de uma análise
   */
  static async updateStatus(analysisId: string, status: AgentStatus): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      if (!isValidUUID(analysisId)) {
        return {
          success: false,
          error: 'ID da análise inválido'
        };
      }

      const { error } = await supabase
        .from(this.TABLE_NAME)
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', analysisId);

      if (error) {
        console.error('[GrammarAnalysis] Erro ao atualizar status:', error);
        return {
          success: false,
          error: `Erro ao atualizar status: ${error.message}`
        };
      }

      return { success: true };
    } catch (error) {
      console.error('[GrammarAnalysis] Erro ao atualizar status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido ao atualizar status'
      };
    }
  }

  /**
   * Salva os resultados da análise
   */
  static async saveResults(analysisId: string, results: any): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      if (!isValidUUID(analysisId)) {
        return {
          success: false,
          error: 'ID da análise inválido'
        };
      }

      const { error } = await supabase
        .from(this.TABLE_NAME)
        .update({
          errors: results.errors || [],
          suggestions: results.summary?.suggestions || [],
          metrics: {
            ...results.summary,
            suggestions: undefined // Removemos as sugestões pois já estão em outro campo
          },
          status: 'completed' as AgentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', analysisId);

      if (error) {
        console.error('[GrammarAnalysis] Erro ao salvar resultados:', error);
        return {
          success: false,
          error: `Erro ao salvar resultados: ${error.message}`
        };
      }

      return { success: true };
    } catch (error) {
      console.error('[GrammarAnalysis] Erro ao salvar resultados:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido ao salvar resultados'
      };
    }
  }
} 