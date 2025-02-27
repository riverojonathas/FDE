'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useManualPipelineStore } from '@/store/manual-pipeline'
import { ManualPipelineService } from '@/lib/services/manual-pipeline'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle2, Circle, ArrowRight } from 'lucide-react'
import { GrammarAnalysisRefactored } from './steps/grammar-analysis-refactored'
import { ThemeAnalysis } from './steps/theme-analysis'
import { cn } from '@/lib/utils'
import { GrammarAnalysisResult } from '@/lib/langchain/agents/grammar-analysis-agent'

// Definindo a interface do passo de pipeline
interface IPipelineStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'active' | 'completed';
  order: number;
  response: string | null;
}

interface PipelineOrchestratorProps {
  correctionId: string
}

export function PipelineOrchestrator({ correctionId }: PipelineOrchestratorProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStep, setSelectedStep] = useState<number | null>(null)
  const [highlightedText, setHighlightedText] = useState<string | null>(null)
  const {
    pipeline,
    setPipeline,
  } = useManualPipelineStore()

  // Carregar pipeline ao montar o componente
  useEffect(() => {
    const loadPipeline = async () => {
      console.log('Carregando pipeline...', correctionId)
      setIsLoading(true)
      try {
        const response = await ManualPipelineService.getPipeline(correctionId)
        console.log('Resposta do getPipeline:', response)
        
        if (response.success && response.data) {
          console.log('Pipeline carregada:', response.data)
          
          // Filtrar para manter apenas os dois primeiros passos (gramática e tema)
          const filteredData = {
            ...response.data,
            steps: response.data.steps.slice(0, 2)
          }
          
          setPipeline(filteredData)
          
          // Ajustar o current_step se necessário
          if (filteredData.current_step >= filteredData.steps.length) {
            filteredData.current_step = filteredData.steps.length - 1
          }
          
          // Seleciona o step atual se nenhum estiver selecionado
          if (selectedStep === null) {
            setSelectedStep(filteredData.current_step)
          } else if (selectedStep >= filteredData.steps.length) {
            // Ajustar se o selectedStep estiver fora do intervalo disponível
            setSelectedStep(filteredData.steps.length - 1)
          }
        } else {
          throw new Error(response.message || 'Erro ao carregar pipeline')
        }
      } catch (error) {
        console.error('Erro ao carregar pipeline:', error)
        toast.error(error instanceof Error ? error.message : 'Erro ao carregar pipeline')
      } finally {
        setIsLoading(false)
      }
    }

    loadPipeline()
  }, [correctionId, setPipeline, selectedStep])

  // Efeito para atualizar o texto destacado com base no step selecionado
  useEffect(() => {
    if (!pipeline || selectedStep === null) return

    const step = pipeline.steps[selectedStep]
    if (step.status === 'completed' && step.response && selectedStep === 0) {
      try {
        // Tenta aplicar as correções gramaticais
        const grammarResult = JSON.parse(step.response) as GrammarAnalysisResult
        
        // Função para aplicar destaques com base na análise gramatical
        const applyGrammarHighlights = () => {
          let highlightedText = pipeline.text_content
          const sortedErrors = [...grammarResult.errors].sort((a, b) => {
            return b.error.length - a.error.length
          })

          sortedErrors.forEach(error => {
            const errorHtml = `<mark class="bg-yellow-200 cursor-help" title="${error.explanation}">${error.error}</mark>`
            highlightedText = highlightedText.replace(error.error, errorHtml)
          })

          return highlightedText
        }

        setHighlightedText(applyGrammarHighlights())
      } catch (e) {
        console.error('Erro ao processar destacamento do texto:', e)
        setHighlightedText(null)
      }
    } else {
      // Para outros steps ou quando não há response, mostra o texto original
      setHighlightedText(null)
    }
  }, [pipeline, selectedStep])

  const handleStepComplete = async (stepId: string, response: any) => {
    try {
      if (!pipeline) return;

      // Encontrar o índice do step pelo ID
      const stepIndex = pipeline.steps.findIndex(s => s.id === stepId);
      if (stepIndex === -1) {
        console.error(`Step com ID ${stepId} não encontrado na pipeline`);
        return;
      }

      const currentStep = pipeline.steps[stepIndex];
      
      console.log(`Completando etapa ${stepIndex} (${currentStep.name})`, {
        responseType: typeof response,
        responseLength: typeof response === 'string' ? response.length : JSON.stringify(response).length,
        firstChars: typeof response === 'string' 
          ? response.substring(0, 100) + '...' 
          : JSON.stringify(response).substring(0, 100) + '...',
        stepId: currentStep.id
      });
      
      // Garantir que a resposta é uma string
      const responseString = typeof response === 'string' 
        ? response 
        : JSON.stringify(response);
      
      const updateResponse = await ManualPipelineService.updatePipelineStep(correctionId, {
        ...currentStep,
        status: 'completed',
        response: responseString
      });

      if (!updateResponse.success) {
        console.error('Erro ao atualizar etapa:', updateResponse);
        throw new Error(updateResponse.message || 'Erro ao atualizar etapa');
      }

      console.log(`Etapa ${stepIndex} atualizada com sucesso`);

      // Verificar se é o último step (agora temos apenas 2 steps)
      const isLastStep = stepIndex === 1;

      if (isLastStep) {
        console.log('Finalizando pipeline (último passo)');
        // Finalizar o pipeline
        const finalResponse = await ManualPipelineService.completePipeline(correctionId, {
          ...pipeline,
          status: 'completed',
          current_step: pipeline.steps.length
        });

        if (!finalResponse.success) {
          console.error('Erro ao finalizar pipeline:', finalResponse);
          throw new Error(finalResponse.message || 'Erro ao finalizar pipeline');
        }

        toast.success('Pipeline concluído com sucesso!');
        return;
      }

      // Atualizar o pipeline local
      console.log('Buscando pipeline atualizada após completar etapa');
      const updatedResponse = await ManualPipelineService.getPipeline(correctionId);
      if (updatedResponse.success && updatedResponse.data) {
        // Filtrar para manter apenas os dois primeiros passos (gramática e tema)
        const filteredData = {
          ...updatedResponse.data,
          steps: updatedResponse.data.steps.slice(0, 2)
        }
        
        console.log('Pipeline atualizada recebida:', filteredData);
        setPipeline(filteredData);
        
        // Avançar automaticamente para o próximo step se o atual foi concluído
        if (selectedStep === stepIndex) {
          console.log(`Avançando automaticamente para o step ${stepIndex + 1}`);
          setSelectedStep(stepIndex + 1);
        }
        
        toast.success('Etapa concluída com sucesso!');
      }
    } catch (err) {
      console.error('Erro ao completar etapa:', err);
      toast.error(err instanceof Error ? err.message : 'Erro ao completar etapa');
    }
  };

  const handleStepSelect = (stepIndex: number) => {
    if (!pipeline) return;
    
    setSelectedStep(stepIndex)
    
    // Log para diagnosticar o problema com o agente de tema
    if (stepIndex === 1) {
      console.log('Selecionando agente de tema:')
      console.log('Step atual:', pipeline.steps[1])
      console.log('Status do step:', pipeline.steps[1]?.status)
      console.log('pipeline.current_step:', pipeline.current_step)
      console.log('Análise gramatical anterior:', pipeline.steps[0]?.response ? 'Disponível' : 'Indisponível')
      
      try {
        // Verificar se a resposta da análise gramatical é um JSON válido
        if (pipeline.steps[0]?.response) {
          const parsedResponse = JSON.parse(pipeline.steps[0].response)
          console.log('Resposta da gramática é um JSON válido:', !!parsedResponse)
        }
      } catch (e) {
        console.error('Erro ao analisar resposta da gramática:', e)
      }
    }
  }

  /**
   * Verifica se um step está ativo baseado no passo atual da pipeline
   */
  const isStepActive = (stepId: string): boolean => {
    if (!pipeline) return false;
    
    // Encontra o índice do step pelo ID
    const stepIndex = pipeline.steps.findIndex(s => s.id === stepId);
    if (stepIndex === -1) return false;
    
    // Um step está ativo se:
    // 1. É o step atual da pipeline, ou
    // 2. Está selecionado pelo usuário, ou
    // 3. Já foi completado
    return (
      pipeline.current_step === stepIndex ||
      selectedStep === stepIndex ||
      pipeline.steps[stepIndex].status === 'completed'
    );
  }
  
  /**
   * Obtém a resposta de um step anterior pelo ID
   */
  const getPreviousStepResponse = (stepId: string): any => {
    if (!pipeline) return null;
    
    const step = pipeline.steps.find(s => s.id === stepId);
    if (!step || step.status !== 'completed' || !step.response) return null;
    
    try {
      // Tenta fazer parse da resposta para JSON
      return typeof step.response === 'string'
        ? JSON.parse(step.response)
        : step.response;
    } catch (e) {
      console.error(`Erro ao fazer parse da resposta do step ${stepId}:`, e);
      return null;
    }
  }

  const renderStepComponent = (step: IPipelineStep) => {
    // Log para depuração
    console.log(`Renderizando componente para passo: ${step.id}, usando correctionId: ${pipeline?.id || correctionId}`);
    
    // Garantir que temos um ID de correção válido
    if (!pipeline?.id && !correctionId) {
      console.error('ID de correção não disponível para renderizar o componente');
      return null;
    }
    
    // Usar o ID da correção carregada ou o ID passado como prop
    const currentCorrectionId = pipeline?.id || correctionId;

    // Renderizar apenas os componentes de gramática e tema
    switch (step.id) {
      case 'grammar-analysis':
        return (
          <GrammarAnalysisRefactored
            step={step}
            text={pipeline?.text_content || ''}
            onComplete={(response) => handleStepComplete(step.id, response)}
            isActive={isStepActive(step.id)}
            correctionId={currentCorrectionId}
          />
        );
      case 'theme-analysis':
        return (
          <ThemeAnalysis
            step={step}
            text={pipeline?.text_content || ''}
            onComplete={(response) => handleStepComplete(step.id, response)}
            isActive={isStepActive(step.id)}
            correctionId={currentCorrectionId}
            previousAnalysis={getPreviousStepResponse('grammar-analysis')}
          />
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Carregando pipeline...
          </CardTitle>
        </CardHeader>
      </Card>
    )
  }

  if (!pipeline || !pipeline.steps || pipeline.steps.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Nenhum dado encontrado</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Não foi possível carregar os dados da pipeline. Tente novamente mais tarde.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Cabeçalho e Navegação Superior */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Pipeline Manual</h1>
        <p className="text-muted-foreground mb-4">
          Siga as etapas abaixo para completar a correção manual.
        </p>
        
        {/* Navegação entre Steps - Layout Compacto */}
        <div className="flex flex-wrap gap-2 mb-2">
          {pipeline.steps.map((step, index) => (
            <Button
              key={step.id}
              variant={selectedStep === index ? "default" : "outline"}
              size="sm"
              className={cn(
                "flex items-center gap-2",
                step.status === 'completed' && "border-green-500",
                step.status === 'active' && "border-blue-500"
              )}
              onClick={() => handleStepSelect(index)}
            >
              {step.status === 'completed' ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : step.status === 'active' ? (
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              ) : (
                <Circle className="h-4 w-4 text-gray-400" />
              )}
              <span className="text-sm">
                {index === 0 ? "Gramática" : "Tema"}
              </span>
              {index === pipeline.current_step && (
                <ArrowRight className="h-4 w-4 text-primary ml-1" />
              )}
            </Button>
          ))}
        </div>
        
        {/* Progresso Visual */}
        <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
          <div 
            className="bg-primary h-full transition-all duration-300"
            style={{ 
              width: `${(pipeline.steps.filter(s => s.status === 'completed').length / pipeline.steps.length) * 100}%` 
            }}
          />
        </div>
        
        {/* Navegação de Etapas */}
        <div className="flex items-center justify-between gap-2 mt-2">
          {/* O botão de voltar foi removido conforme solicitado */}
          
          <div className="flex items-center gap-2">
            {selectedStep !== null && selectedStep > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedStep(selectedStep - 1)}
                className="text-sm"
              >
                Anterior
              </Button>
            )}
            
            {selectedStep !== null && selectedStep < pipeline.steps.length - 1 && (
              <Button
                size="sm"
                onClick={() => setSelectedStep(selectedStep + 1)}
                disabled={pipeline.steps[selectedStep].status !== 'completed'}
                className="text-sm"
              >
                Próxima
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Questão com Texto Destacado */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Questão</CardTitle>
          <CardDescription>Texto a ser analisado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            {highlightedText ? (
              <div 
                className="text-sm" 
                dangerouslySetInnerHTML={{ __html: highlightedText }}
              />
            ) : (
              <p className="text-sm">{pipeline.text_content}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Renderize apenas os componentes de gramática e tema */}
      {selectedStep === 0 && (
        renderStepComponent(pipeline.steps[0])
      )}

      {selectedStep === 1 && (
        <>
          {/* Debug info para o ThemeAnalysis */}
          <div className="hidden bg-muted p-4 mb-4 rounded-md text-xs">
            <p>Debug: ThemeAnalysis</p>
            <pre>
              {JSON.stringify({
                stepExists: !!pipeline.steps[1],
                stepStatus: pipeline.steps[1]?.status,
                isCurrentStep: pipeline.current_step === 1,
                hasPreviousAnalysis: !!pipeline.steps[0]?.response,
                previousAnalysisLength: pipeline.steps[0]?.response?.length,
                isActive: pipeline.current_step === 1 || (pipeline.steps[1].status === 'completed')
              }, null, 2)}
            </pre>
          </div>
          
          {renderStepComponent(pipeline.steps[1])}
        </>
      )}
    </div>
  )
} 