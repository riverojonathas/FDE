'use client'

import { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { IPipelineStep } from '@/types/manual-pipeline'
import { Copy, CheckCircle, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react'

interface PipelineStepProps {
  step: IPipelineStep
  isActive: boolean
  onPrevious?: () => void
  onNext?: () => void
  onComplete: (response: string) => void
  isFirst?: boolean
  isLast?: boolean
}

export function PipelineStep({
  step,
  isActive,
  onPrevious,
  onNext,
  onComplete,
  isFirst,
  isLast
}: PipelineStepProps) {
  const { toast } = useToast()
  const [response, setResponse] = useState(step.response || '')
  const [isLoading, setIsLoading] = useState(false)

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(step.prompt)
      toast({
        title: 'Prompt copiado!',
        description: 'Cole o prompt no chat da IA para continuar.',
      })
    } catch (error) {
      toast({
        title: 'Erro ao copiar',
        description: 'Não foi possível copiar o prompt.',
        variant: 'destructive',
      })
    }
  }

  const handleComplete = async () => {
    if (!validateResponse(response)) return
    
    setIsLoading(true)
    try {
      await onComplete(response)
      toast({
        title: 'Resposta salva!',
        description: 'A resposta foi processada com sucesso.',
      })
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar a resposta.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const validateResponse = (text: string): boolean => {
    if (!text.trim()) {
      toast({
        title: 'Resposta vazia',
        description: 'Por favor, insira a resposta da IA.',
        variant: 'destructive',
      })
      return false
    }
    
    if (text.length < 10) {
      toast({
        title: 'Resposta muito curta',
        description: 'A resposta parece ser muito curta. Verifique se copiou corretamente.',
        variant: 'destructive',
      })
      return false
    }
    
    return true
  }

  return (
    <Card className={`transition-all duration-200 ${
      isActive ? 'border-primary' : 'opacity-70'
    }`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{step.name}</span>
          {step.status === 'completed' && (
            <CheckCircle className="h-5 w-5 text-green-500" />
          )}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{step.description}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Área do Prompt */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Prompt para IA</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyPrompt}
              disabled={!isActive}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copiar Prompt
            </Button>
          </div>
          <div className="relative">
            <div className="bg-muted p-4 rounded-md font-mono text-sm">
              {step.prompt}
            </div>
          </div>
        </div>

        {/* Área de Resposta */}
        <div className="space-y-2">
          <span className="text-sm font-medium">Resposta da IA</span>
          <Textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Cole aqui a resposta da IA..."
            className="font-mono min-h-[200px]"
            disabled={!isActive || step.status === 'completed'}
          />
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={!isActive || isFirst || isLoading}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>

        <div className="flex gap-2">
          {!isLast && (
            <Button
              onClick={onNext}
              disabled={!isActive || step.status !== 'completed' || isLoading}
            >
              Próximo
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}

          <Button
            onClick={handleComplete}
            disabled={!isActive || isLoading || step.status === 'completed'}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              'Concluir Etapa'
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
} 