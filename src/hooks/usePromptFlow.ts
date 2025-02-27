import { useState, useCallback } from 'react';
import { OrchestratorAgent, IPromptFlow, IPromptStep } from '@/lib/langchain/agents/orchestrator-agent';

interface UsePromptFlowProps {
  text: string;
  questionType?: string;
  criteria?: Record<string, any>;
}

interface UsePromptFlowReturn {
  flow: IPromptFlow | null;
  currentStep: IPromptStep | null;
  isLoading: boolean;
  error: string | null;
  startFlow: () => Promise<void>;
  submitResponse: (response: string) => Promise<void>;
  getPromptForCurrentStep: () => string | null;
}

export function usePromptFlow({ text, questionType, criteria }: UsePromptFlowProps): UsePromptFlowReturn {
  const [orchestrator] = useState(() => new OrchestratorAgent());
  const [flow, setFlow] = useState<IPromptFlow | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentStep = useCallback(() => {
    if (!flow) return null;
    return flow.steps[flow.currentStep];
  }, [flow]);

  const startFlow = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await orchestrator.execute({ text, questionType, criteria });
      if (!result.success) {
        throw new Error(result.error);
      }
      setFlow(result.result as IPromptFlow);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao iniciar o fluxo');
    } finally {
      setIsLoading(false);
    }
  }, [text, questionType, criteria, orchestrator]);

  const submitResponse = useCallback(async (response: string) => {
    if (!flow) {
      throw new Error('Nenhum fluxo ativo');
    }

    const currentStep = getCurrentStep();
    if (!currentStep) {
      throw new Error('Nenhum passo atual');
    }

    setIsLoading(true);
    setError(null);
    try {
      await orchestrator.updateStepResponse(flow.id, currentStep.id, response);
      
      // Atualiza o estado local
      setFlow(prev => {
        if (!prev) return null;
        const updatedSteps = prev.steps.map(step =>
          step.id === currentStep.id
            ? { ...step, response, status: 'completed' }
            : step
        );
        return {
          ...prev,
          steps: updatedSteps,
          currentStep: Math.min(prev.currentStep + 1, updatedSteps.length - 1),
          status: prev.currentStep + 1 >= updatedSteps.length ? 'completed' : 'in_progress'
        };
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao submeter resposta');
    } finally {
      setIsLoading(false);
    }
  }, [flow, getCurrentStep, orchestrator]);

  const getPromptForCurrentStep = useCallback((): string | null => {
    const currentStep = getCurrentStep();
    return currentStep?.prompt || null;
  }, [getCurrentStep]);

  return {
    flow,
    currentStep: getCurrentStep(),
    isLoading,
    error,
    startFlow,
    submitResponse,
    getPromptForCurrentStep,
  };
} 