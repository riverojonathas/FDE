import { TextAnalysisAgent, TextAnalysisResult } from './agents/text-analysis-agent'
import { CriteriaAnalysisAgent, CriteriaAnalysisResult } from './agents/criteria-analysis-agent'
import { PlagiarismAgent, PlagiarismResult } from './agents/plagiarism-agent'
import { FeedbackAgent, FeedbackResult } from './agents/feedback-agent'
import { createClient } from '@supabase/supabase-js'

// Interface para entrada da correção
export interface CorrectionInput {
  text: string
  student?: {
    id: string
    name: string
    class_id?: string
    history?: any[]
  }
  question?: {
    id: string
    type: 'redação' | 'dissertativa' | 'discursiva' | 'argumentativa'
    title: string
    description?: string
    criteria?: any[]
    maxScore?: number
  }
  options?: {
    skipPlagiarismCheck?: boolean
    detailedFeedback?: boolean
    saveToDB?: boolean
    priority?: 'speed' | 'accuracy' | 'balanced'
    language?: 'pt-BR' | 'en-US'
  }
}

// Interface para resultado da correção
export interface CorrectionResult {
  id?: string
  textAnalysis: TextAnalysisResult
  criteriaAnalysis: CriteriaAnalysisResult
  plagiarismResult?: PlagiarismResult
  feedback: FeedbackResult
  metadata: {
    student_id?: string
    question_id?: string
    created_at: string
    processing_time: number
    word_count: number
    version: string
    status: 'complete' | 'partial' | 'error'
    error?: string
  }
  humanReview?: {
    reviewed: boolean
    reviewedBy?: string
    reviewedAt?: string
    adjustedScore?: number
    comments?: string
    status?: 'approved' | 'rejected' | 'adjusted'
  }
}

export class CorrectionOrchestrator {
  private textAnalysisAgent: TextAnalysisAgent
  private criteriaAnalysisAgent: CriteriaAnalysisAgent
  private plagiarismAgent: PlagiarismAgent
  private feedbackAgent: FeedbackAgent
  private supabase: any
  private version = '1.3.0'
  private metrics: {
    totalCorrections: number
    averageTime: number
    errorRate: number
    lastProcessingTimes: number[]
  }

  constructor() {
    // Inicializa os agentes sem necessidade de chave de API
    this.textAnalysisAgent = new TextAnalysisAgent()
    this.criteriaAnalysisAgent = new CriteriaAnalysisAgent()
    this.plagiarismAgent = new PlagiarismAgent()
    this.feedbackAgent = new FeedbackAgent()
    
    // Inicializa o cliente Supabase se as variáveis de ambiente estiverem disponíveis
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      this.supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )
    }
    
    // Inicializa métricas
    this.metrics = {
      totalCorrections: 0,
      averageTime: 0,
      errorRate: 0,
      lastProcessingTimes: []
    }
  }
  
  /**
   * Realiza a correção de um texto com base nos parâmetros fornecidos
   * @param input Dados para a correção incluindo texto, aluno e questão
   * @returns Resultado da correção com análises e feedback
   */
  async correct(input: CorrectionInput): Promise<CorrectionResult> {
    const startTime = Date.now()
    const correctionId = this.generateCorrectionId()
    
    try {
      console.log(`Iniciando correção ${correctionId}`)
      
      // Inicializa o resultado com status parcial
      const partialResult: Partial<CorrectionResult> = {
        id: correctionId,
        metadata: {
          student_id: input.student?.id,
          question_id: input.question?.id,
          created_at: new Date().toISOString(),
          processing_time: 0,
          word_count: input.text.split(/\s+/).length,
          version: this.version,
          status: 'partial'
        }
      }
      
      // Verifica se o texto é válido
      if (!input.text || input.text.trim().length < 10) {
        throw new Error('O texto fornecido é muito curto ou inválido')
      }
      
      // Se configurado para salvar no DB, registra o início da correção
      if (input.options?.saveToDB && this.supabase) {
        await this.saveRequestToDB(input, correctionId)
      }
      
      // 1. Análise textual
      console.log(`[${correctionId}] Iniciando análise textual`)
      const textAnalysis = await this.textAnalysisAgent.analyze(input.text)
      console.log(`[${correctionId}] Análise textual concluída`)
      partialResult.textAnalysis = textAnalysis
      
      // 2. Análise de critérios
      console.log(`[${correctionId}] Iniciando análise de critérios`)
      const criteriaAnalysis = await this.criteriaAnalysisAgent.analyze(
        input.text,
        input.question?.type || 'dissertativa',
        input.question?.criteria ? JSON.stringify(input.question.criteria) : ''
      )
      console.log(`[${correctionId}] Análise de critérios concluída`)
      partialResult.criteriaAnalysis = criteriaAnalysis
      
      // 3. Verificação de plágio (opcional)
      let plagiarismResult: PlagiarismResult | undefined
      if (!input.options?.skipPlagiarismCheck) {
        console.log(`[${correctionId}] Iniciando verificação de plágio`)
        plagiarismResult = await this.plagiarismAgent.analyze(input.text)
        console.log(`[${correctionId}] Verificação de plágio concluída`)
        partialResult.plagiarismResult = plagiarismResult
      }
      
      // 4. Geração de feedback
      console.log(`[${correctionId}] Iniciando geração de feedback`)
      
      const feedback = await this.feedbackAgent.generateFeedback(
        textAnalysis,
        criteriaAnalysis,
        plagiarismResult || { score: 100, similarTexts: [], analysis: 'Não verificado' } as any,
        {
          name: input.student?.name || 'Aluno',
          questionType: input.question?.type || 'dissertativa',
          questionTitle: input.question?.title,
        },
        {
          feedbackLevel: input.options?.detailedFeedback ? 'detalhado' as const : 'básico' as const
        }
      )
      console.log(`[${correctionId}] Geração de feedback concluída`)
      
      // Calcula o tempo total de processamento
      const processingTime = Date.now() - startTime
      
      // Cria o resultado final
      const finalResult: CorrectionResult = {
        ...partialResult as CorrectionResult,
        feedback,
        metadata: {
          ...partialResult.metadata!,
          processing_time: processingTime,
          status: 'complete'
        }
      }
      
      // Atualiza métricas
      this.updateMetrics(processingTime, false)
      
      // Se configurado para salvar no DB, registra o resultado
      if (input.options?.saveToDB && this.supabase) {
        await this.saveResultToDB(finalResult)
      }
      
      console.log(`Correção ${correctionId} concluída em ${processingTime}ms`)
      return finalResult
      
    } catch (error: any) {
      const processingTime = Date.now() - startTime
      console.error(`Erro na correção ${correctionId}:`, error)
      
      // Atualiza métricas de erro
      this.updateMetrics(processingTime, true)
      
      // Cria um resultado com erro
      const errorResult: CorrectionResult = {
        id: correctionId,
        textAnalysis: {} as TextAnalysisResult,
        criteriaAnalysis: {} as CriteriaAnalysisResult,
        feedback: {} as FeedbackResult,
        metadata: {
          student_id: input.student?.id,
          question_id: input.question?.id,
          created_at: new Date().toISOString(),
          processing_time: processingTime,
          word_count: input.text.split(/\s+/).length,
          version: this.version,
          status: 'error',
          error: error.message || 'Erro desconhecido na correção'
        }
      }
      
      // Se configurado para salvar no DB, registra o erro
      if (input.options?.saveToDB && this.supabase) {
        await this.saveResultToDB(errorResult)
      }
      
      throw new Error(`Falha na correção: ${error.message}`)
    }
  }
  
  /**
   * Permite que um revisor humano ajuste o resultado da correção
   * @param correctionId ID da correção a ser revisada
   * @param reviewData Dados da revisão humana
   * @returns Resultado atualizado após revisão
   */
  async reviewCorrection(
    correctionId: string,
    reviewData: {
      reviewedBy: string,
      adjustedScore?: number,
      comments?: string,
      status: 'approved' | 'rejected' | 'adjusted'
    }
  ): Promise<CorrectionResult | null> {
    if (!this.supabase) {
      throw new Error('Supabase não está configurado para persistência de dados')
    }
    
    try {
      // Busca a correção no banco de dados
      const { data, error } = await this.supabase
        .from('corrections')
        .select('*')
        .eq('id', correctionId)
        .single()
        
      if (error) throw error
      if (!data) return null
      
      // Prepara os dados de revisão
      const humanReview = {
        reviewed: true,
        reviewedBy: reviewData.reviewedBy,
        reviewedAt: new Date().toISOString(),
        adjustedScore: reviewData.adjustedScore,
        comments: reviewData.comments,
        status: reviewData.status
      }
      
      // Atualiza a correção com a revisão humana
      const { data: updatedData, error: updateError } = await this.supabase
        .from('corrections')
        .update({
          human_review: humanReview,
          updated_at: new Date().toISOString()
        })
        .eq('id', correctionId)
        .select()
        .single()
        
      if (updateError) throw updateError
      
      // Converte o resultado do DB para o formato CorrectionResult
      return this.dbRecordToCorrectionResult(updatedData)
    } catch (error) {
      console.error('Erro ao revisar correção:', error)
      throw new Error('Falha ao revisar a correção')
    }
  }
  
  /**
   * Recupera os resultados de correções anteriores para um aluno
   * @param studentId ID do aluno
   * @param limit Número máximo de resultados (padrão: 10)
   * @returns Lista de correções para o aluno
   */
  async getStudentCorrections(studentId: string, limit = 10): Promise<CorrectionResult[]> {
    if (!this.supabase) {
      throw new Error('Supabase não está configurado para persistência de dados')
    }
    
    try {
      const { data, error } = await this.supabase
        .from('corrections')
        .select('*')
        .eq('metadata->student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(limit)
        
      if (error) throw error
      
      // Converte os resultados do DB para o formato CorrectionResult
      return data.map(this.dbRecordToCorrectionResult)
    } catch (error) {
      console.error('Erro ao buscar correções do aluno:', error)
      return []
    }
  }
  
  /**
   * Obtém métricas de desempenho do orquestrador
   * @returns Métricas atuais
   */
  getMetrics() {
    return {
      ...this.metrics,
      version: this.version
    }
  }
  
  /**
   * Gera um ID único para a correção
   * @returns ID único
   */
  private generateCorrectionId(): string {
    return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  /**
   * Atualiza as métricas de desempenho
   * @param processingTime Tempo de processamento da correção
   * @param isError Indica se ocorreu um erro
   */
  private updateMetrics(processingTime: number, isError: boolean): void {
    // Atualiza o contador de correções
    this.metrics.totalCorrections++
    
    // Mantém apenas os últimos 100 tempos de processamento
    this.metrics.lastProcessingTimes.push(processingTime)
    if (this.metrics.lastProcessingTimes.length > 100) {
      this.metrics.lastProcessingTimes.shift()
    }
    
    // Recalcula o tempo médio
    this.metrics.averageTime = this.metrics.lastProcessingTimes.reduce((a, b) => a + b, 0) / 
      this.metrics.lastProcessingTimes.length
    
    // Atualiza a taxa de erro
    if (isError) {
      const errorWeight = 1 / Math.min(this.metrics.totalCorrections, 100)
      this.metrics.errorRate = this.metrics.errorRate * (1 - errorWeight) + errorWeight
    } else {
      const successWeight = 1 / Math.min(this.metrics.totalCorrections, 100)
      this.metrics.errorRate = this.metrics.errorRate * (1 - successWeight)
    }
  }
  
  /**
   * Salva a requisição de correção no banco de dados
   * @param input Dados da requisição
   * @param correctionId ID da correção
   */
  private async saveRequestToDB(input: CorrectionInput, correctionId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('corrections')
        .insert({
          id: correctionId,
          input: {
            text: input.text,
            student_id: input.student?.id,
            question_id: input.question?.id,
            options: input.options
          },
          metadata: {
            student_id: input.student?.id,
            question_id: input.question?.id,
            created_at: new Date().toISOString(),
            word_count: input.text.split(/\s+/).length,
            version: this.version,
            status: 'partial'
          },
          created_at: new Date().toISOString()
        })
        
      if (error) {
        console.error('Erro ao salvar requisição:', error)
      }
    } catch (error) {
      console.error('Falha ao salvar requisição no DB:', error)
    }
  }
  
  /**
   * Salva o resultado da correção no banco de dados
   * @param result Resultado da correção
   */
  private async saveResultToDB(result: CorrectionResult): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('corrections')
        .upsert({
          id: result.id,
          result: {
            textAnalysis: result.textAnalysis,
            criteriaAnalysis: result.criteriaAnalysis,
            plagiarismResult: result.plagiarismResult,
            feedback: result.feedback
          },
          metadata: result.metadata,
          updated_at: new Date().toISOString()
        })
        
      if (error) {
        console.error('Erro ao salvar resultado:', error)
      }
    } catch (error) {
      console.error('Falha ao salvar resultado no DB:', error)
    }
  }
  
  /**
   * Converte um registro do banco de dados para o formato CorrectionResult
   * @param record Registro do banco de dados
   * @returns Resultado formatado
   */
  private dbRecordToCorrectionResult(record: any): CorrectionResult {
    return {
      id: record.id,
      textAnalysis: record.result?.textAnalysis || {} as TextAnalysisResult,
      criteriaAnalysis: record.result?.criteriaAnalysis || {} as CriteriaAnalysisResult,
      plagiarismResult: record.result?.plagiarismResult,
      feedback: record.result?.feedback || {} as FeedbackResult,
      metadata: record.metadata,
      humanReview: record.human_review
    }
  }
} 