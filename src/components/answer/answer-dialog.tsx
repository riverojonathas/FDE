'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { Answer, CorrectionResponse } from '@/types/common'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from 'lucide-react'
import { correctAnswer } from '@/lib/ai'
import { CorrectionResultDialog } from './correction-result-dialog'

interface AnswerDialogProps {
  questionId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AnswerDialog({ questionId, open, onOpenChange }: AnswerDialogProps) {
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CorrectionResponse | null>(null)
  const [showResult, setShowResult] = useState(false)
  
  const { questions, addCorrection, addAnswer, getAnswerByQuestionId } = useAppStore()
  const question = questions.find(q => q.id === questionId)

  // Carrega a resposta salva quando a questão muda
  useEffect(() => {
    async function loadAnswer() {
      if (questionId) {
        const saved = await getAnswerByQuestionId(questionId)
        if (saved) {
          setAnswer(saved.answer)
        } else {
          setAnswer('')
        }
      }
    }
    loadAnswer()
  }, [questionId, getAnswerByQuestionId])

  if (!question) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Salva a resposta antes de enviar para correção
      if (questionId) {
        await addAnswer({
          questionId,
          answer,
        })
      }

      // Gera o prompt baseado na questão
      const prompt = `
        Questão: ${question.description}
        
        Resposta Esperada: ${question.expectedAnswer}
        
        Critérios de Avaliação:
        - Conteúdo (${question.gradingRules.content}%): Avalie a precisão e completude do conteúdo
        - Clareza (${question.gradingRules.clarity}%): Avalie a organização e clareza da resposta
        - Gramática (${question.gradingRules.grammar}%): Avalie a correção gramatical
        - Estrutura (${question.gradingRules.structure}%): Avalie a estruturação da resposta
        
        Nível esperado: ${question.level}
        Tipo: ${question.type}
        
        Por favor, avalie a seguinte resposta considerando os critérios acima.
      `.trim()

      const result = await correctAnswer(prompt, answer)
      
      // Salva a correção
      addCorrection({
        prompt: question.description,
        answer,
        score: result.score,
        feedback: result.feedback,
        details: result.details,
      })

      setResult(result)
      onOpenChange(false)
      setShowResult(true)
      
    } catch (error) {
      console.error(error)
      // Adicionar toast de erro
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-[600px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="text-slate-100">{question.title}</DialogTitle>
              <DialogDescription className="text-slate-400">
                {question.description}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <Textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Digite sua resposta aqui..."
                rows={8}
                className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 resize-none"
              />
            </div>
            
            <DialogFooter>
              <Button 
                type="submit" 
                disabled={loading || !answer.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar Resposta
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <CorrectionResultDialog
        open={showResult}
        onOpenChange={setShowResult}
        result={result}
      />
    </>
  )
} 