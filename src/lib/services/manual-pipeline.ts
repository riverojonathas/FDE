import { supabase } from '@/lib/supabase'
import { IManualPipeline, IPipelineStep, IPipelineResponse, IPipelineMetadata } from '@/types/manual-pipeline'

export class ManualPipelineService {
  static async createPipeline(data: IManualPipeline): Promise<IPipelineResponse> {
    try {
      console.log('Criando pipeline com dados:', data)
      
      // Primeiro, criar a student_response
      const { data: studentResponse, error: studentResponseError } = await supabase
        .from('student_responses')
        .insert({
          question_id: data.question_id,
          respondent_identifier: data.respondent_identifier,
          answer: data.text_content,
        })
        .select()
        .single()

      if (studentResponseError) throw studentResponseError

      // Depois, criar a correction
      const { data: correction, error: correctionError } = await supabase
        .from('corrections')
        .insert({
          answer_id: studentResponse.id,
          student_name: data.respondent_identifier,
          prompt: "Iniciando correção manual",
          pipeline_type: 'manual',
          details: {
            steps: data.steps,
            aiProvider: data.metadata.aiProvider,
            aiModel: data.metadata.aiModel,
          },
          status_details: {
            current_step: 0,
            status: 'running',
            started_at: data.metadata.started_at,
            completed_steps: []
          }
        })
        .select()
        .single()

      if (correctionError) throw correctionError

      // Formatar a resposta no formato esperado
      const pipeline: IManualPipeline = {
        id: correction.id,
        question_id: data.question_id,
        respondent_identifier: data.respondent_identifier,
        text_content: data.text_content,
        current_step: 0,
        status: 'running',
        steps: data.steps,
        metadata: {
          aiProvider: data.metadata.aiProvider,
          aiModel: data.metadata.aiModel,
          started_at: data.metadata.started_at,
          completed_at: undefined,
          steps: data.steps,
          current_step: 0,
          status: 'running'
        }
      }

      return {
        success: true,
        data: pipeline
      }
    } catch (error) {
      console.error('Erro ao criar pipeline:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro ao criar pipeline'
      }
    }
  }

  static async updatePipelineStep(
    correctionId: string,
    step: IPipelineStep
  ): Promise<IPipelineResponse> {
    try {
      // Primeiro, buscar a correção atual
      const { data: currentCorrection, error: fetchError } = await supabase
        .from('corrections')
        .select('details, status_details')
        .eq('id', correctionId)
        .single()

      if (fetchError) throw fetchError

      const details = currentCorrection.details || {}
      const statusDetails = currentCorrection.status_details || {}
      const steps = details.steps || []
      
      // Atualizar o passo específico no array de steps
      const updatedSteps = steps.map((s: IPipelineStep) =>
        s.id === step.id ? { ...s, ...step } : s
      )

      // Atualizar a correção
      const { data: correction, error: updateError } = await supabase
        .from('corrections')
        .update({
          details: {
            ...details,
            steps: updatedSteps
          },
          status_details: {
            ...statusDetails,
            current_step: statusDetails.current_step + 1,
            completed_steps: [...(statusDetails.completed_steps || []), step.id]
          }
        })
        .eq('id', correctionId)
        .select()
        .single()

      if (updateError) throw updateError

      // Formatar a resposta
      const pipeline: IManualPipeline = {
        id: correction.id,
        question_id: correction.student_response?.question_id,
        respondent_identifier: correction.student_name,
        text_content: correction.student_response?.answer,
        current_step: correction.status_details.current_step,
        status: correction.status_details.status,
        steps: correction.details.steps,
        metadata: {
          aiProvider: correction.details.aiProvider,
          aiModel: correction.details.aiModel,
          started_at: correction.status_details.started_at,
          completed_at: correction.status_details.completed_at,
          steps: correction.details.steps,
          current_step: correction.status_details.current_step,
          status: correction.status_details.status
        }
      }

      return {
        success: true,
        data: pipeline
      }
    } catch (error) {
      console.error('Erro ao atualizar etapa:', error)
      return {
        success: false,
        message: 'Erro ao atualizar etapa'
      }
    }
  }

  static async completePipeline(
    correctionId: string,
    finalData: Partial<IManualPipeline>
  ): Promise<IPipelineResponse> {
    try {
      // Primeiro, buscar a correção atual
      const { data: currentCorrection, error: fetchError } = await supabase
        .from('corrections')
        .select('details, status_details')
        .eq('id', correctionId)
        .single()

      if (fetchError) throw fetchError

      const details = currentCorrection.details || {}
      const statusDetails = currentCorrection.status_details || {}

      // Atualizar a correção
      const { data: correction, error } = await supabase
        .from('corrections')
        .update({
          details: {
            ...details,
            aiProvider: finalData.metadata?.aiProvider,
            aiModel: finalData.metadata?.aiModel,
            steps: finalData.steps || details.steps,
          },
          status_details: {
            ...statusDetails,
            current_step: finalData.current_step,
            status: 'completed',
            completed_at: new Date().toISOString(),
            completed_steps: [...(statusDetails.completed_steps || []), 'final']
          }
        })
        .eq('id', correctionId)
        .select()
        .single()

      if (error) throw error

      // Formatar a resposta
      const pipeline: IManualPipeline = {
        id: correction.id,
        question_id: correction.student_response?.question_id,
        respondent_identifier: correction.student_name,
        text_content: correction.student_response?.answer,
        current_step: correction.status_details.current_step,
        status: correction.status_details.status,
        steps: correction.details.steps,
        metadata: {
          aiProvider: correction.details.aiProvider,
          aiModel: correction.details.aiModel,
          started_at: correction.status_details.started_at,
          completed_at: correction.status_details.completed_at,
          steps: correction.details.steps,
          current_step: correction.status_details.current_step,
          status: correction.status_details.status
        }
      }

      return {
        success: true,
        data: pipeline
      }
    } catch (error) {
      console.error('Erro ao finalizar pipeline:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro ao finalizar pipeline'
      }
    }
  }

  static async getPipeline(correctionId: string): Promise<IPipelineResponse> {
    try {
      console.log('Buscando pipeline:', correctionId)
      
      // Buscar a correção com a resposta do estudante
      const { data: correction, error: correctionError } = await supabase
        .from('corrections')
        .select(`
          *,
          student_response:answer_id (
            answer,
            question_id,
            respondent_identifier
          )
        `)
        .eq('id', correctionId)
        .single()

      if (correctionError) throw correctionError

      console.log('Dados brutos da correção:', correction)

      // Formatar a pipeline para o formato esperado
      const pipeline: IManualPipeline = {
        id: correction.id,
        question_id: correction.student_response?.question_id,
        respondent_identifier: correction.student_name,
        text_content: correction.student_response?.answer,
        current_step: correction.status_details?.current_step || 0,
        status: correction.status_details?.status || 'running',
        steps: correction.details?.steps || [],
        metadata: {
          aiProvider: correction.details?.aiProvider || 'openai',
          aiModel: correction.details?.aiModel || 'gpt-4',
          started_at: correction.status_details?.started_at || new Date().toISOString(),
          completed_at: correction.status_details?.completed_at,
          steps: correction.details?.steps || [],
          current_step: correction.status_details?.current_step || 0,
          status: correction.status_details?.status || 'running'
        }
      }

      console.log('Pipeline formatada:', pipeline)

      return {
        success: true,
        data: pipeline
      }
    } catch (error) {
      console.error('Erro ao buscar pipeline:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro ao buscar pipeline'
      }
    }
  }
} 