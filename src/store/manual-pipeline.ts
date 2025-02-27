import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  IManualPipeline, 
  IPipelineStep, 
  PipelineStatus, 
  StepStatus 
} from '@/types/manual-pipeline'

interface ManualPipelineState {
  pipeline: IManualPipeline | null
  isLoading: boolean
  error: string | null
  
  // Ações básicas
  setPipeline: (pipeline: IManualPipeline) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  resetStore: () => void
  
  // Ações da Pipeline
  initializePipeline: (data: Partial<IManualPipeline>) => void
  updateStep: (stepId: string, updates: Partial<IPipelineStep>) => void
  moveToNextStep: () => void
  moveToPreviousStep: () => void
  setStepResponse: (stepId: string, response: string) => void
  completePipeline: () => void
}

const initialState = {
  pipeline: null,
  isLoading: false,
  error: null,
}

export const useManualPipelineStore = create<ManualPipelineState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setPipeline: (pipeline) => set({ pipeline }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      resetStore: () => set(initialState),

      initializePipeline: (data) => {
        const pipeline: IManualPipeline = {
          question_id: data.question_id || '',
          respondent_identifier: data.respondent_identifier || '',
          text_content: data.text_content || '',
          current_step: 0,
          status: 'idle',
          steps: [],
          metadata: {
            aiProvider: data.metadata?.aiProvider || 'openai',
            aiModel: data.metadata?.aiModel || 'gpt-4',
            started_at: new Date().toISOString(),
          }
        }
        set({ pipeline })
      },

      updateStep: (stepId, updates) => {
        const { pipeline } = get()
        if (!pipeline) return

        const updatedSteps = pipeline.steps.map(step =>
          step.id === stepId ? { ...step, ...updates } : step
        )

        set({
          pipeline: {
            ...pipeline,
            steps: updatedSteps
          }
        })
      },

      moveToNextStep: () => {
        const { pipeline } = get()
        if (!pipeline) return

        if (pipeline.current_step < pipeline.steps.length - 1) {
          set({
            pipeline: {
              ...pipeline,
              current_step: pipeline.current_step + 1,
              steps: pipeline.steps.map((step, index) => ({
                ...step,
                status: index === pipeline.current_step + 1 ? 'active' : step.status
              }))
            }
          })
        }
      },

      moveToPreviousStep: () => {
        const { pipeline } = get()
        if (!pipeline || pipeline.current_step === 0) return

        set({
          pipeline: {
            ...pipeline,
            current_step: pipeline.current_step - 1,
            steps: pipeline.steps.map((step, index) => ({
              ...step,
              status: index === pipeline.current_step - 1 ? 'active' : step.status
            }))
          }
        })
      },

      setStepResponse: (stepId, response) => {
        const { pipeline } = get()
        if (!pipeline) return

        const updatedSteps = pipeline.steps.map(step =>
          step.id === stepId
            ? { ...step, response, status: 'completed' as StepStatus }
            : step
        )

        set({
          pipeline: {
            ...pipeline,
            steps: updatedSteps
          }
        })
      },

      completePipeline: () => {
        const { pipeline } = get()
        if (!pipeline) return

        set({
          pipeline: {
            ...pipeline,
            status: 'completed',
            metadata: {
              ...pipeline.metadata,
              completed_at: new Date().toISOString()
            }
          }
        })
      }
    }),
    {
      name: 'manual-pipeline-storage',
      partialize: (state) => ({
        pipeline: state.pipeline
      })
    }
  )
) 