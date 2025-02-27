'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { supabase } from '@/lib/supabase'

interface EditQuestionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  questionId?: string
  onQuestionUpdated?: () => void
}

export function EditQuestionDialog({ open, onOpenChange, questionId, onQuestionUpdated }: EditQuestionDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'dissertativa',
    level: 'médio',
    subject: '',
    theme: '',
    code: '',
    base_text: '',
    expected_answer: '',
    grading_rules: {
      criteria: [],
      maxScore: 10,
      rubric: {}
    }
  })

  useEffect(() => {
    if (questionId && open) {
      loadQuestion()
    }
  }, [questionId, open])

  const loadQuestion = async () => {
    if (!questionId) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('id', questionId)
        .single()

      if (error) throw error
      if (data) {
        setFormData(data)
      }
    } catch (error) {
      console.error('Erro ao carregar questão:', error)
      toast({
        title: 'Erro ao carregar questão',
        description: 'Não foi possível carregar os dados da questão.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!questionId) return
    
    if (!formData.title || !formData.description) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha todos os campos obrigatórios.',
        variant: 'destructive'
      })
      return
    }

    try {
      setLoading(true)

      const { error } = await supabase
        .from('questions')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', questionId)

      if (error) throw error

      toast({
        title: 'Questão atualizada',
        description: 'A questão foi atualizada com sucesso.'
      })

      onQuestionUpdated?.()
      onOpenChange(false)
    } catch (error) {
      console.error('Erro ao atualizar questão:', error)
      toast({
        title: 'Erro ao atualizar questão',
        description: 'Não foi possível atualizar a questão. Tente novamente.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Questão</DialogTitle>
            <DialogDescription>
              Edite as informações da questão selecionada.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Digite o título da questão"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Digite a descrição da questão"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Tipo</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dissertativa">Dissertativa</SelectItem>
                    <SelectItem value="redação">Redação</SelectItem>
                    <SelectItem value="argumentativa">Argumentativa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="level">Nível</Label>
                <Select
                  value={formData.level}
                  onValueChange={(value) => setFormData({ ...formData, level: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o nível" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fácil">Fácil</SelectItem>
                    <SelectItem value="médio">Médio</SelectItem>
                    <SelectItem value="difícil">Difícil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="subject">Disciplina</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Digite a disciplina"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="theme">Tema</Label>
              <Input
                id="theme"
                value={formData.theme}
                onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                placeholder="Digite o tema"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="base_text">Texto Base (opcional)</Label>
              <Textarea
                id="base_text"
                value={formData.base_text}
                onChange={(e) => setFormData({ ...formData, base_text: e.target.value })}
                placeholder="Digite o texto base, se houver"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="expected_answer">Resposta Esperada (opcional)</Label>
              <Textarea
                id="expected_answer"
                value={formData.expected_answer}
                onChange={(e) => setFormData({ ...formData, expected_answer: e.target.value })}
                placeholder="Digite a resposta esperada"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 