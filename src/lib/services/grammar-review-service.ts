import { supabase } from '@/lib/supabase/client'
import { GrammarAnalysisResult } from '@/lib/langchain/agents/grammar-analysis-agent'

interface SaveReviewParams {
  correctionId: string
  rating: number
  feedback?: string
  totalErrors: number
  qualityScore: number
  analysis: GrammarAnalysisResult
}

/**
 * Serviço para gerenciar avaliações de análise gramatical no Supabase
 */
export const GrammarReviewService = {
  /**
   * Salva uma avaliação de análise gramatical
   */
  async saveReview({
    correctionId,
    rating,
    feedback,
    totalErrors,
    qualityScore,
    analysis
  }: SaveReviewParams) {
    try {
      // Validação de campos
      if (rating < 1 || rating > 5) {
        return {
          success: false,
          error: new Error('A avaliação deve estar entre 1 e 5')
        }
      }

      if (qualityScore < 0 || qualityScore > 10) {
        return {
          success: false,
          error: new Error('A pontuação de qualidade deve estar entre 0 e 10')
        }
      }

      // Salvar a avaliação na tabela grammar_reviews
      const { error: reviewError } = await supabase
        .from('grammar_reviews')
        .insert({
          correction_id: correctionId,
          rating,
          feedback: feedback || null,
          total_errors: totalErrors,
          quality_score: qualityScore
        })

      if (reviewError) {
        console.error('Erro ao salvar avaliação:', reviewError)
        return {
          success: false,
          error: reviewError
        }
      }

      // Atualizar status na tabela corrections
      const { error: updateError } = await supabase
        .from('corrections')
        .update({ 
          status_details: { 
            ...analysis, 
            reviewed: true,
            review_date: new Date().toISOString(),
            user_rating: rating,
            user_feedback: feedback
          } 
        })
        .eq('id', correctionId)

      if (updateError) {
        console.error('Erro ao atualizar status da correção:', updateError)
        return {
          success: false,
          error: updateError
        }
      }

      return {
        success: true,
        error: null
      }
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error)
      return {
        success: false,
        error
      }
    }
  },

  /**
   * Busca avaliações de uma correção específica
   */
  async getByCorrection(correctionId: string) {
    try {
      const { data, error } = await supabase
        .from('grammar_reviews')
        .select('*')
        .eq('correction_id', correctionId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar avaliações:', error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error)
      return { data: null, error }
    }
  },

  /**
   * Busca uma avaliação específica por ID
   */
  async getById(reviewId: string) {
    try {
      const { data, error } = await supabase
        .from('grammar_reviews')
        .select('*')
        .eq('id', reviewId)
        .single()

      if (error) {
        console.error('Erro ao buscar avaliação:', error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Erro ao buscar avaliação:', error)
      return { data: null, error }
    }
  }
} 