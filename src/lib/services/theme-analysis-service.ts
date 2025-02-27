import { supabase } from '@/lib/supabase/client'
import { 
  AgentApiResponse, 
  AgentStatus, 
  ThemeAnalysisResult, 
  IThemeAnalysis 
} from '@/types/correction-agents'

/**
 * Valida se um ID é um UUID válido
 * @param id ID a ser validado
 */
function isValidUUID(id: string): boolean {
  if (typeof id !== 'string') {
    console.error(`ID inválido: não é uma string, recebeu ${typeof id}`, id);
    return false;
  }
  
  // Verifica se é 'theme-analysis' (caso específico que está causando erro)
  if (id === 'theme-analysis') {
    console.error(`ID 'theme-analysis' detectado. Este é um ID inválido e deve ser um UUID.`);
    console.trace('Stack trace para identificar a origem do ID inválido:');
    return false;
  }
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  const isValid = uuidRegex.test(id);
  
  if (!isValid) {
    console.error(`ID ${id} não é um UUID válido. Formato esperado: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`);
  }
  
  return isValid;
}

/**
 * Converte dados genéricos para o tipo IThemeAnalysis de forma segura
 */
function convertToThemeAnalysis(data: any): IThemeAnalysis | null {
  // Faz uma conversão segura verificando se os campos obrigatórios existem
  if (!data) return null;
  
  return {
    id: data.id || '',
    correction_id: data.correction_id || '',
    status: data.status || 'pending',
    analysis_data: data.analysis_data || null,
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || new Date().toISOString()
  } as IThemeAnalysis;
}

/**
 * Serviço para gerenciamento da análise temática no Supabase
 */
export const ThemeAnalysisService = {
  /**
   * Obtém a análise temática de uma correção específica
   */
  async getByCorrection(correctionId: string): Promise<AgentApiResponse<IThemeAnalysis>> {
    try {
      // Validar o ID da correção
      if (!correctionId || !isValidUUID(correctionId)) {
        console.error('ID de correção inválido:', correctionId);
        return {
          data: null,
          error: `ID de correção inválido: ${correctionId}`,
          success: false
        }
      }

      console.log(`Buscando análise temática para correção: ${correctionId}`);
      
      const { data, error } = await supabase
        .from('theme_analyses')
        .select('*')
        .eq('correction_id', correctionId)
        .single();
      
      if (error) {
        console.error(`Erro ao buscar análise temática para correção ${correctionId}:`, error);
        throw error;
      }
      
      // Converte os dados para o tipo correto
      const typedData = convertToThemeAnalysis(data);
      
      return {
        data: typedData,
        error: null,
        success: true
      }
    } catch (error) {
      console.error('Erro ao buscar análise temática:', error);
      return {
        data: null,
        error: 'Falha ao buscar análise temática',
        success: false
      }
    }
  },
  
  /**
   * Cria uma nova análise temática para uma correção
   */
  async create(correctionId: string): Promise<AgentApiResponse<IThemeAnalysis>> {
    try {
      // Validar o ID da correção
      if (!correctionId || !isValidUUID(correctionId)) {
        console.error('ID de correção inválido para criação:', correctionId);
        return {
          data: null,
          error: `ID de correção inválido para criação: ${correctionId}`,
          success: false
        }
      }

      console.log(`Criando análise temática para correção: ${correctionId}`);
      
      const newAnalysis = {
        correction_id: correctionId,
        status: 'pending' as AgentStatus,
        analysis_data: null
      }
      
      const { data, error } = await supabase
        .from('theme_analyses')
        .insert(newAnalysis)
        .select()
        .single();
      
      if (error) {
        console.error(`Erro ao criar análise temática para correção ${correctionId}:`, error);
        throw error;
      }
      
      // Converte os dados para o tipo correto
      const typedData = convertToThemeAnalysis(data);
      
      return {
        data: typedData,
        error: null,
        success: true
      }
    } catch (error) {
      console.error('Erro ao criar análise temática:', error);
      return {
        data: null,
        error: 'Falha ao criar análise temática',
        success: false
      }
    }
  },
  
  /**
   * Atualiza o status de uma análise temática
   */
  async updateStatus(
    themeAnalysisId: string, 
    status: AgentStatus
  ): Promise<AgentApiResponse<void>> {
    try {
      // Validar o ID da análise
      if (!themeAnalysisId || !isValidUUID(themeAnalysisId)) {
        console.error('ID de análise inválido para atualização:', themeAnalysisId);
        return {
          data: null,
          error: `ID de análise inválido para atualização: ${themeAnalysisId}`,
          success: false
        }
      }
      
      const { error } = await supabase
        .from('theme_analyses')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', themeAnalysisId);
      
      if (error) {
        console.error(`Erro ao atualizar status da análise ${themeAnalysisId}:`, error);
        throw error;
      }
      
      return {
        data: null,
        error: null,
        success: true
      }
    } catch (error) {
      console.error('Erro ao atualizar status da análise temática:', error);
      return {
        data: null,
        error: 'Falha ao atualizar status da análise temática',
        success: false
      }
    }
  },
  
  /**
   * Salva os resultados da análise temática
   */
  async saveResults(
    themeAnalysisId: string, 
    results: ThemeAnalysisResult
  ): Promise<AgentApiResponse<void>> {
    try {
      // Validar o ID da análise
      if (!themeAnalysisId || !isValidUUID(themeAnalysisId)) {
        console.error('ID de análise inválido para salvar resultados:', themeAnalysisId);
        return {
          data: null,
          error: `ID de análise inválido para salvar resultados: ${themeAnalysisId}`,
          success: false
        }
      }
      
      const { error } = await supabase
        .from('theme_analyses')
        .update({ 
          analysis_data: results,
          status: 'completed' as AgentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', themeAnalysisId);
      
      if (error) {
        console.error(`Erro ao salvar resultados para análise ${themeAnalysisId}:`, error);
        throw error;
      }
      
      return {
        data: null,
        error: null,
        success: true
      }
    } catch (error) {
      console.error('Erro ao salvar resultados da análise temática:', error);
      return {
        data: null,
        error: 'Falha ao salvar resultados da análise temática',
        success: false
      }
    }
  },
  
  /**
   * Verifica se existe uma análise temática para a correção 
   * ou cria uma nova se não existir
   */
  async getOrCreate(correctionId: string): Promise<AgentApiResponse<IThemeAnalysis>> {
    try {
      // Log adicional para rastrear a origem da chamada
      console.log(`[ThemeAnalysisService.getOrCreate] Chamado com ID: ${correctionId}`);
      console.trace('Stack trace da chamada a getOrCreate:');
      
      // Validar o ID da correção
      if (!correctionId || !isValidUUID(correctionId)) {
        console.error('ID de correção inválido para getOrCreate:', correctionId);
        return {
          data: null,
          error: `ID de correção inválido para getOrCreate: ${correctionId}`,
          success: false
        }
      }
      
      console.log(`Verificando ou criando análise temática para correção: ${correctionId}`);
      
      // Tenta buscar primeiro
      const { data, error } = await supabase
        .from('theme_analyses')
        .select('*')
        .eq('correction_id', correctionId)
        .maybeSingle();
      
      // Se não encontrou, cria um novo
      if (!data && !error) {
        return this.create(correctionId);
      }
      
      // Se encontrou, retorna
      if (data) {
        // Converte os dados para o tipo correto
        const typedData = convertToThemeAnalysis(data);
        
        return {
          data: typedData,
          error: null,
          success: true
        }
      }
      
      // Se houve erro na busca
      if (error) {
        console.error(`Erro ao verificar análise temática para correção ${correctionId}:`, error);
        throw error;
      }
      
      return {
        data: null,
        error: 'Não foi possível verificar ou criar análise temática',
        success: false
      }
    } catch (error) {
      console.error('Erro ao verificar/criar análise temática:', error);
      return {
        data: null,
        error: 'Falha ao verificar/criar análise temática',
        success: false
      }
    }
  }
} 