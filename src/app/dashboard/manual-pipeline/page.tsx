'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { 
  ArrowRight,
  Loader2,
  Search,
  Database
} from 'lucide-react'
import { QuestionSelector } from '@/components/questions/question-selector'
import { 
  saveStudentResponseAndStartCorrection,
} from '@/lib/supabase/manual-pipeline'

// Definição dos passos padrão da pipeline manual
const DEFAULT_STEPS = [
  {
    id: 'grammar-analysis',
    order: 0,
    name: 'Gramática',
    description: 'Revisão gramatical e de estrutura textual',
    prompt: '',
    status: 'pending',
    response: null
  },
  {
    id: 'theme-analysis',
    order: 1,
    name: 'Tema',
    description: 'Análise temática e argumentativa',
    prompt: '',
    status: 'pending',
    response: null
  },
  {
    id: 'technical-evaluation',
    order: 2,
    name: 'Avaliação',
    description: 'Avaliação técnica do texto',
    prompt: '',
    status: 'pending',
    response: null
  },
  {
    id: 'detailed-feedback',
    order: 3,
    name: 'Feedback',
    description: 'Feedback detalhado e sugestões',
    prompt: '',
    status: 'pending',
    response: null
  }
]

/**
 * Calcula o número de palavras em um texto
 */
const calculateWordCount = (text: string): number => {
  if (!text) return 0;
  // Remove espaços extras e quebras de linha
  const cleanText = text.trim().replace(/\s+/g, ' ');
  // Divide o texto em palavras e conta
  return cleanText.split(' ').length;
};

export default function ManualPipelinePage() {
  const router = useRouter()
  const { toast } = useToast()
  
  // Estados para seleção inicial
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>("")
  const [respondentIdentifier, setRespondentIdentifier] = useState<string>("")
  const [textContent, setTextContent] = useState<string>("")
  
  // Estados para controle do modelo/provedor
  const [selectedModel, setSelectedModel] = useState<string>("gpt-4")
  const [selectedProvider, setSelectedProvider] = useState<string>("openai")
  
  // Estados de controle de carregamento
  const [isLoading, setIsLoading] = useState<boolean>(false)
  
  // Iniciar a pipeline
  const handleStart = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const correctionData = await saveStudentResponseAndStartCorrection({
        respondent_identifier: respondentIdentifier,
        question_id: selectedQuestionId,
        text_content: textContent,
        prompt: "Iniciando correção manual",
        metadata: {
          aiProvider: selectedProvider,
          aiModel: selectedModel,
          steps: DEFAULT_STEPS.map(step => ({
            ...step,
            status: step.order === 1 ? 'active' : 'pending'
          }))
        }
      })

      if (correctionData?.id) {
        toast({
          title: 'Pipeline iniciada!',
          description: `Correção ID: ${correctionData.id}`,
        })
        router.push(`/dashboard/manual-pipeline/${correctionData.id}`)
      } else {
        throw new Error('Falha ao criar correção')
      }
    } catch (error) {
      console.error('Erro ao iniciar a pipeline:', error)
      toast({
        title: 'Erro ao iniciar pipeline',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // Validar o formulário inicial
  const validateForm = () => {
    if (!textContent.trim()) {
      toast({
        title: "Texto é obrigatório",
        description: "Por favor, insira o texto para análise.",
        variant: "destructive",
      })
      return false
    }
    
    if (!selectedQuestionId) {
      toast({
        title: "Questão não selecionada",
        description: "Por favor, selecione uma questão para continuar.",
        variant: "destructive",
      })
      return false
    }

    if (!respondentIdentifier) {
      toast({
        title: "Identificador obrigatório",
        description: "Por favor, insira um identificador para o respondente.",
        variant: "destructive",
      })
      return false
    }
    
    return true
  }
  
  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Componente removido como solicitado */}
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Pipeline Manual</h1>
          <p className="text-muted-foreground mb-6">
            Configure e inicie uma nova pipeline de correção manual.
          </p>
        </div>
      </div>
      
      {/* Formulário diretamente na página, sem Card */}
      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="text-base font-medium flex items-center gap-2">
            <Search className="h-4 w-4" />
            Selecionar Questão
          </Label>
          <QuestionSelector 
            onSelect={setSelectedQuestionId}
            selectedId={selectedQuestionId}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="respondentIdentifier" className="text-base font-medium">
              Identificador do Respondente
            </Label>
            <Input
              id="respondentIdentifier"
              value={respondentIdentifier}
              onChange={(e) => setRespondentIdentifier(e.target.value)}
              placeholder="Digite um nome ou identificador para o respondente"
            />
          </div>
          
          <div className="space-y-2 hidden md:block">
            {/* Espaço reservado para futuramente adicionar configurações de modelos */}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="textContent" className="text-base font-medium">Texto para Análise</Label>
          <Textarea
            id="textContent"
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder="Cole aqui o texto a ser analisado"
            className="min-h-[200px] font-mono"
          />
          <p className="text-sm text-muted-foreground">
            Contagem de palavras: {calculateWordCount(textContent)}
          </p>
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            Cancelar
          </Button>
          <Button onClick={handleStart} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Iniciando...
              </>
            ) : (
              <>
                Iniciar Pipeline
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
} 