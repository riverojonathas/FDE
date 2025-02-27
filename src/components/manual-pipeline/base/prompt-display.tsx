'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Copy, Check, Eye } from 'lucide-react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'

interface PromptDisplayProps {
  prompt: string
  getPromptSummary?: (prompt: string) => string
}

/**
 * Componente para exibição padronizada de prompts com botões para copiar e visualizar
 */
export function PromptDisplay({ 
  prompt, 
  getPromptSummary = defaultGetPromptSummary 
}: PromptDisplayProps) {
  const [copied, setCopied] = useState(false)
  const [isPromptDialogOpen, setIsPromptDialogOpen] = useState(false)
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(prompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Erro ao copiar:', err)
    }
  }
  
  // Reset copied state after 2 seconds
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [copied])
  
  return (
    <div className="border rounded-md p-3 bg-muted/40">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-medium">Prompt:</h4>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={copyToClipboard}
            className="h-8 px-3 text-xs gap-1"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copiado" : "Copiar Prompt"}
          </Button>
          
          <Dialog open={isPromptDialogOpen} onOpenChange={setIsPromptDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-3 text-xs gap-1"
              >
                <Eye className="h-3.5 w-3.5" />
                Ver Prompt
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Prompt Completo</DialogTitle>
              </DialogHeader>
              <div className="mt-4 bg-muted p-4 rounded-md max-h-[60vh] overflow-y-auto">
                <pre className="text-sm whitespace-pre-wrap font-mono">{prompt}</pre>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Preview do prompt */}
      <p className="text-xs text-muted-foreground font-mono">{getPromptSummary(prompt)}</p>
    </div>
  )
}

// Função padrão para extrair um resumo do prompt
function defaultGetPromptSummary(prompt: string): string {
  const lines = prompt.split('\n').filter(line => line.trim())
  if (lines.length === 0) return ""
  
  const firstLine = lines[0] || ''
  const secondLine = lines.length > 1 ? lines[1] : ''
  
  return `${firstLine}\n${secondLine}${lines.length > 2 ? '...' : ''}`
} 