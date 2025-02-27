import { Database } from '@/lib/database.types'

export type PipelineStatus = 'idle' | 'running' | 'completed' | 'error'
export type StepStatus = 'pending' | 'active' | 'completed' | 'error'

export interface IPipelineStep {
  id: string
  order: number
  name: string
  description: string
  prompt?: string
  status: 'pending' | 'active' | 'completed'
  response?: string
}

export interface IPipelineMetadata {
  aiProvider: string
  aiModel: string
  started_at: string
  completed_at?: string
  steps: IPipelineStep[]
  current_step?: number
  status?: PipelineStatus
}

export interface IManualPipeline {
  id: string
  user_id: string
  question_id: string
  respondent_identifier: string
  text_content: string
  model: string
  provider: string
  status: 'pending' | 'in_progress' | 'completed'
  current_step: number
  steps: IPipelineStep[]
  created_at: string
  updated_at: string
}

export interface IPipelineResponse {
  success: boolean
  message?: string
  data?: any
}

// Tipos do Supabase
export type CorrectionRow = Database['public']['Tables']['corrections']['Row']
export type QuestionRow = Database['public']['Tables']['questions']['Row']

export interface IGrammarAnalysis {
  id: string
  correction_id: string
  status: 'pending' | 'in_progress' | 'completed'
  analysis_data: any
  created_at: string
  updated_at: string
}

export interface IThemeAnalysis {
  id: string
  correction_id: string
  status: 'pending' | 'in_progress' | 'completed'
  analysis_data: any
  created_at: string
  updated_at: string
}

export interface ITechnicalEvaluation {
  id: string
  correction_id: string
  status: 'pending' | 'in_progress' | 'completed'
  evaluation_data: any
  created_at: string
  updated_at: string
}

export interface IDetailedFeedback {
  id: string
  correction_id: string
  status: 'pending' | 'in_progress' | 'completed'
  feedback_data: any
  created_at: string
  updated_at: string
}

export interface ServiceResponse<T> {
  success: boolean
  data?: T
  message?: string
  status?: number
} 