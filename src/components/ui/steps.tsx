'use client'

import { StepStatus } from '@/types/manual-pipeline'
import { CheckCircle, Circle, Loader2 } from 'lucide-react'

interface Step {
  id: string
  name: string
  status: StepStatus
}

interface StepsProps {
  steps: Step[]
  currentStep: number
}

export function Steps({ steps, currentStep }: StepsProps) {
  return (
    <div className="relative">
      {/* Linha de Progresso */}
      <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-200">
        <div
          className="absolute top-0 left-0 h-full bg-primary transition-all duration-300"
          style={{
            width: `${(currentStep / (steps.length - 1)) * 100}%`,
          }}
        />
      </div>

      {/* Steps */}
      <div className="relative flex justify-between">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className="flex flex-col items-center"
          >
            {/* Indicador */}
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center border-2
                transition-all duration-300 relative z-10 bg-white
                ${index === currentStep
                  ? 'border-primary text-primary'
                  : step.status === 'completed'
                  ? 'border-green-500 text-green-500'
                  : 'border-gray-300 text-gray-400'
                }
              `}
            >
              {step.status === 'completed' ? (
                <CheckCircle className="w-5 h-5" />
              ) : step.status === 'active' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Circle className="w-5 h-5" />
              )}
            </div>

            {/* Nome do Step */}
            <span
              className={`
                mt-2 text-sm font-medium text-center
                ${index === currentStep
                  ? 'text-primary'
                  : step.status === 'completed'
                  ? 'text-green-500'
                  : 'text-gray-500'
                }
              `}
            >
              {step.name}
            </span>

            {/* Status */}
            <span className="text-xs text-gray-400 mt-1">
              {step.status === 'completed'
                ? 'Concluído'
                : step.status === 'active'
                ? 'Em progresso'
                : 'Pendente'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
} 