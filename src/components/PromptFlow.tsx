import React, { useState } from 'react';
import { usePromptFlow } from '@/hooks/usePromptFlow';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface PromptFlowProps {
  text: string;
  questionType?: string;
  criteria?: Record<string, any>;
  onComplete?: (result: any) => void;
}

export function PromptFlow({ text, questionType, criteria, onComplete }: PromptFlowProps) {
  const {
    flow,
    currentStep,
    isLoading,
    error,
    startFlow,
    submitResponse,
    getPromptForCurrentStep,
  } = usePromptFlow({ text, questionType, criteria });

  const [response, setResponse] = useState('');

  const handleSubmit = async () => {
    if (!response.trim()) return;
    await submitResponse(response);
    setResponse('');
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!flow) {
    return (
      <div className="flex flex-col items-center gap-4">
        <Button
          onClick={startFlow}
          disabled={isLoading}
          className="w-full max-w-md"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Iniciando análise...
            </>
          ) : (
            'Iniciar Análise'
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status do Fluxo */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Passo {flow.currentStep + 1} de {flow.steps.length}
        </div>
        <div className="text-sm font-medium">
          Status: {flow.status === 'completed' ? 'Concluído' : 'Em andamento'}
        </div>
      </div>

      {/* Prompt Atual */}
      {currentStep && (
        <Card className="p-4">
          <h3 className="font-medium mb-2">Prompt para {currentStep.agentId}</h3>
          <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-md">
            {currentStep.prompt}
          </pre>
        </Card>
      )}

      {/* Área de Resposta */}
      {currentStep && currentStep.status === 'pending' && (
        <div className="space-y-4">
          <Textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Digite a resposta do modelo..."
            className="min-h-[200px]"
          />
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !response.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              'Enviar Resposta'
            )}
          </Button>
        </div>
      )}

      {/* Histórico de Passos */}
      <div className="space-y-4">
        <h3 className="font-medium">Histórico</h3>
        {flow.steps.map((step, index) => (
          <Card key={step.id} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">
                Passo {index + 1}: {step.agentId}
              </span>
              <span
                className={`text-sm ${
                  step.status === 'completed'
                    ? 'text-green-600'
                    : step.status === 'failed'
                    ? 'text-red-600'
                    : 'text-yellow-600'
                }`}
              >
                {step.status}
              </span>
            </div>
            {step.response && (
              <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-md mt-2">
                {step.response}
              </pre>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
} 