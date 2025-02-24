'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useToast } from '@/components/ui/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

interface EditQuestionDialogProps {
  questionId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditQuestionDialog({ questionId, open, onOpenChange }: EditQuestionDialogProps) {
  const { toast } = useToast()
  const questions = useAppStore((state) => state.questions)
  const updateQuestion = useAppStore((state) => state.updateQuestion)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: 'portugues',
    type: 'dissertativa',
    level: 'medio',
    expectedAnswer: '',
    gradingRules: {
      content: 40,
      clarity: 20,
      grammar: 20,
      structure: 20
    }
  })

  useEffect(() => {
    if (questionId) {
      const question = questions.find(q => q.id === questionId)
      if (question) {
        setFormData({
          title: question.title,
          description: question.description,
          subject: question.subject,
          type: question.type,
          level: question.level,
          expectedAnswer: question.expectedAnswer,
          gradingRules: question.gradingRules
        })
      }
    }
  }, [questionId, questions])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!questionId) return

    setLoading(true)
    try {
      await updateQuestion(questionId, formData)
      toast({
        title: "Questão atualizada",
        description: "As alterações foram salvas com sucesso.",
      })
      onOpenChange(false)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar",
        description: "Não foi possível salvar as alterações.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-slate-100">Editar Questão</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <Select
              value={formData.subject}
              onValueChange={(value) => setFormData({ ...formData, subject: value as any })}
            >
              <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                <SelectValue placeholder="Disciplina" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="portugues">Português</SelectItem>
                <SelectItem value="matematica">Matemática</SelectItem>
                <SelectItem value="historia">História</SelectItem>
                <SelectItem value="geografia">Geografia</SelectItem>
                <SelectItem value="ciencias">Ciências</SelectItem>
                <SelectItem value="redacao">Redação</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Título da questão"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
            />

            <Textarea
              placeholder="Descrição da questão"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 min-h-[100px]"
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as any })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="dissertativa">Dissertativa</SelectItem>
                  <SelectItem value="redacao">Redação</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={formData.level}
                onValueChange={(value) => setFormData({ ...formData, level: value as any })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                  <SelectValue placeholder="Nível" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="facil">Fácil</SelectItem>
                  <SelectItem value="medio">Médio</SelectItem>
                  <SelectItem value="dificil">Difícil</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Textarea
              placeholder="Resposta esperada"
              value={formData.expectedAnswer}
              onChange={(e) => setFormData({ ...formData, expectedAnswer: e.target.value })}
              required
              className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 min-h-[100px]"
            />
          </div>
          
          <DialogFooter>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 