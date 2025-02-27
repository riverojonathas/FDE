'use client'

import { useState, ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { IPipelineStep } from '@/types/manual-pipeline'
import { PromptDisplay } from './prompt-display'
import { AgentConfigurationModal } from './agent-configuration-modal'
import { Sliders } from 'lucide-react'
import { toast } from 'sonner'

interface AgentStepBaseProps {
  title: string
  description: string
  step: IPipelineStep
  isActive: boolean
  onComplete: (response: string) => void
  generatePrompt: () => string
  validateResponse: (text: string) => boolean
  configSummary: string
  renderBasicConfig: () => ReactNode
  renderAdvancedConfig?: () => ReactNode
  renderReview: (analysis: any) => ReactNode
  additionalTabs?: {
    id: string
    label: string
    content: ReactNode
  }[]
}

/**
 * Componente base para os passos de agentes de correção
 * Fornece estrutura padronizada e comportamento comum para todos os agentes
 */
export function AgentStepBase({
  title,
  description,
  step,
  isActive,
  onComplete,
  generatePrompt,
  validateResponse,
  configSummary,
  renderBasicConfig,
  renderAdvancedConfig,
  renderReview,
  additionalTabs = []
}: AgentStepBaseProps) {
  const [response, setResponse] = useState(step?.response ? String(step.response) : '')
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Se não estiver ativo e não estiver concluído, não mostrar nada
  if (!isActive && step?.status !== 'completed') return null
  
  // Se já tiver uma resposta válida e estiver concluído, mostrar revisão
  if (step?.status === 'completed' && step?.response) {
    return renderReview(JSON.parse(String(step.response)))
  }
  
  const prompt = generatePrompt()
  
  const handleFinalizeAnalysis = () => {
    console.log('AgentStepBase: Finalizando análise com resposta de', response.length, 'caracteres');
    
    if (!response.trim()) {
      toast.error('Por favor, cole a resposta do modelo antes de finalizar a análise.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Verificar se a resposta é válida
      if (!validateResponse(response)) {
        console.error('AgentStepBase: Validação falhou');
        toast.error('A resposta fornecida não está no formato correto. Por favor, verifique e tente novamente.');
        setIsSubmitting(false);
        return;
      }
      
      console.log('AgentStepBase: Validação passou, completando análise...');
      onComplete(response);
    } catch (error) {
      console.error('AgentStepBase: Erro ao completar análise:', error);
      toast.error('Ocorreu um erro ao processar a resposta. Por favor, tente novamente.');
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Resumo das configurações e botão de configuração */}
        <div className="flex justify-between items-center border rounded-md p-3 bg-muted/40">
          <div>
            <h4 className="font-medium text-sm">Configurações de Análise:</h4>
            <p className="text-xs text-muted-foreground">{configSummary}</p>
          </div>
          
          <AgentConfigurationModal
            title={`Configurações: ${title}`}
            open={isConfigDialogOpen}
            onOpenChange={setIsConfigDialogOpen}
            basicConfig={renderBasicConfig()}
            advancedConfig={renderAdvancedConfig && renderAdvancedConfig()}
            additionalTabs={additionalTabs}
          />
        </div>
        
        {/* Prompt com opções de copiar e visualizar */}
        <PromptDisplay prompt={prompt} />
        
        {/* Área de resposta */}
        <div className="space-y-2">
          <Label>Resposta (formato JSON):</Label>
          <Textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Cole aqui a resposta do modelo..."
            className="min-h-[200px] font-mono"
          />
        </div>
        
        {/* Botão de Conclusão */}
        <div className="flex justify-end">
          <Button
            onClick={handleFinalizeAnalysis}
            disabled={!validateResponse(response) || isSubmitting}
          >
            Concluir {title}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 