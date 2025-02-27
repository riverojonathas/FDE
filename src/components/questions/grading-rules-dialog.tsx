'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { supabase } from '@/lib/supabase'
import { Plus, Trash2 } from 'lucide-react'

interface GradingRulesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionId?: string;
  onRulesUpdated?: () => void;
}

interface GradingCriterion {
  id: string;
  name: string;
  description: string;
  weight: number;
  rubric: {
    excellent: string;
    good: string;
    regular: string;
    poor: string;
  };
}

export function GradingRulesDialog({ open, onOpenChange, questionId, onRulesUpdated }: GradingRulesDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [criteria, setCriteria] = useState<GradingCriterion[]>([])
  const [maxScore, setMaxScore] = useState(10)

  useEffect(() => {
    if (questionId && open) {
      loadGradingRules()
    }
  }, [questionId, open])

  const loadGradingRules = async () => {
    if (!questionId) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('questions')
        .select('grading_rules')
        .eq('id', questionId)
        .single()

      if (error) throw error
      if (data?.grading_rules) {
        setCriteria(data.grading_rules.criteria || [])
        setMaxScore(data.grading_rules.maxScore || 10)
      }
    } catch (error) {
      console.error('Erro ao carregar critérios:', error)
      toast({
        title: 'Erro ao carregar critérios',
        description: 'Não foi possível carregar os critérios de correção.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddCriterion = () => {
    const newCriterion: GradingCriterion = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      description: '',
      weight: 1,
      rubric: {
        excellent: '',
        good: '',
        regular: '',
        poor: ''
      }
    }
    setCriteria([...criteria, newCriterion])
  }

  const handleRemoveCriterion = (id: string) => {
    setCriteria(criteria.filter(c => c.id !== id))
  }

  const handleUpdateCriterion = (id: string, field: keyof GradingCriterion | 'rubric.excellent' | 'rubric.good' | 'rubric.regular' | 'rubric.poor', value: any) => {
    setCriteria(criteria.map(c => {
      if (c.id === id) {
        if (field.startsWith('rubric.')) {
          const level = field.split('.')[1] as keyof GradingCriterion['rubric'];
          return {
            ...c,
            rubric: {
              ...c.rubric,
              [level]: value
            }
          };
        }
        return {
          ...c,
          [field]: value
        } as GradingCriterion;
      }
      return c;
    }));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!questionId) return
    
    if (criteria.some(c => !c.name || !c.description)) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha todos os campos obrigatórios dos critérios.',
        variant: 'destructive'
      })
      return
    }

    try {
      setLoading(true)

      const { error } = await supabase
        .from('questions')
        .update({
          grading_rules: {
            criteria,
            maxScore,
            updated_at: new Date().toISOString()
          }
        })
        .eq('id', questionId)

      if (error) throw error

      toast({
        title: 'Critérios atualizados',
        description: 'Os critérios de correção foram atualizados com sucesso.'
      })

      onRulesUpdated?.()
      onOpenChange(false)
    } catch (error) {
      console.error('Erro ao atualizar critérios:', error)
      toast({
        title: 'Erro ao atualizar critérios',
        description: 'Não foi possível atualizar os critérios. Tente novamente.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Critérios de Correção</DialogTitle>
            <DialogDescription>
              Configure os critérios e rubricas para correção da questão.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="maxScore">Nota Máxima</Label>
              <Input
                id="maxScore"
                type="number"
                min="1"
                max="100"
                value={maxScore}
                onChange={(e) => setMaxScore(Number(e.target.value))}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Critérios de Avaliação</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddCriterion}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Critério
                </Button>
              </div>

              {criteria.map((criterion) => (
                <div key={criterion.id} className="space-y-4 p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label>Nome do Critério</Label>
                          <Input
                            value={criterion.name}
                            onChange={(e) => handleUpdateCriterion(criterion.id, 'name', e.target.value)}
                            placeholder="Ex: Coerência"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Peso</Label>
                          <Input
                            type="number"
                            min="1"
                            max="10"
                            value={criterion.weight}
                            onChange={(e) => handleUpdateCriterion(criterion.id, 'weight', Number(e.target.value))}
                          />
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label>Descrição</Label>
                        <Textarea
                          value={criterion.description}
                          onChange={(e) => handleUpdateCriterion(criterion.id, 'description', e.target.value)}
                          placeholder="Descreva o que será avaliado neste critério"
                        />
                      </div>

                      <div className="grid gap-4">
                        <Label>Rubrica</Label>
                        <div className="grid gap-2">
                          <Label className="text-sm">Excelente</Label>
                          <Textarea
                            value={criterion.rubric.excellent}
                            onChange={(e) => handleUpdateCriterion(criterion.id, 'rubric.excellent', e.target.value)}
                            placeholder="Descrição para nota máxima"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label className="text-sm">Bom</Label>
                          <Textarea
                            value={criterion.rubric.good}
                            onChange={(e) => handleUpdateCriterion(criterion.id, 'rubric.good', e.target.value)}
                            placeholder="Descrição para nota boa"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label className="text-sm">Regular</Label>
                          <Textarea
                            value={criterion.rubric.regular}
                            onChange={(e) => handleUpdateCriterion(criterion.id, 'rubric.regular', e.target.value)}
                            placeholder="Descrição para nota regular"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label className="text-sm">Insuficiente</Label>
                          <Textarea
                            value={criterion.rubric.poor}
                            onChange={(e) => handleUpdateCriterion(criterion.id, 'rubric.poor', e.target.value)}
                            placeholder="Descrição para nota insuficiente"
                          />
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="ml-2"
                      onClick={() => handleRemoveCriterion(criterion.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Critérios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 