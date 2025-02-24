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
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

interface GradingRules {
  content: number;
  clarity: number;
  grammar: number;
  structure: number;
}

interface GradingRulesDialogProps {
  questionId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GradingRulesDialog({ questionId, open, onOpenChange }: GradingRulesDialogProps) {
  const { toast } = useToast()
  const questions = useAppStore((state) => state.questions)
  const updateQuestion = useAppStore((state) => state.updateQuestion)
  const [loading, setLoading] = useState(false)
  const [rules, setRules] = useState<GradingRules>({
    content: 40,
    clarity: 20,
    grammar: 20,
    structure: 20,
  })

  useEffect(() => {
    if (questionId) {
      const question = questions.find(q => q.id === questionId)
      if (question?.gradingRules) {
        setRules(question.gradingRules)
      }
    }
  }, [questionId, questions])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!questionId) return

    setLoading(true)
    try {
      await updateQuestion(questionId, { gradingRules: rules })
      toast({
        title: "Critérios atualizados",
        description: "Os critérios de correção foram atualizados com sucesso.",
      })
      onOpenChange(false)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar",
        description: "Não foi possível salvar os critérios.",
      })
    } finally {
      setLoading(false)
    }
  }

  const total = Object.values(rules).reduce((sum, value) => sum + value, 0)
  const isValid = total === 100

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Critérios de Correção</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Conteúdo ({rules.content}%)</Label>
              <Slider
                value={[rules.content]}
                onValueChange={([value]) => setRules({ ...rules, content: value })}
                max={100}
                step={5}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Clareza ({rules.clarity}%)</Label>
              <Slider
                value={[rules.clarity]}
                onValueChange={([value]) => setRules({ ...rules, clarity: value })}
                max={100}
                step={5}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Gramática ({rules.grammar}%)</Label>
              <Slider
                value={[rules.grammar]}
                onValueChange={([value]) => setRules({ ...rules, grammar: value })}
                max={100}
                step={5}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Estrutura ({rules.structure}%)</Label>
              <Slider
                value={[rules.structure]}
                onValueChange={([value]) => setRules({ ...rules, structure: value })}
                max={100}
                step={5}
              />
            </div>

            <div className={`text-sm text-center ${isValid ? 'text-muted-foreground' : 'text-red-500'}`}>
              Total: {total}% {!isValid && '(deve somar 100%)'}
            </div>
          </div>
          
          <DialogFooter>
            <Button type="submit" disabled={loading || !isValid}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Critérios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 