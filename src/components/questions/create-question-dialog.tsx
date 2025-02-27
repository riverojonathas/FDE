'use client'

import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useToast } from '@/components/ui/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import { CreateQuestionInput, BaseGradingRules, EssayGradingRules } from '@/types/common'
import { GradingRulesConfig } from './grading-rules-config'
import { supabase } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'
import { Label } from '@/components/ui/label'

interface CreateQuestionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onQuestionCreated?: () => void
}

interface GradingCriterion {
  name: string
  weight: number
  description: string
  rubric: {
    excellent: string
    good: string
    regular: string
    poor: string
  }
}

interface GradingRules {
  criteria: GradingCriterion[]
  maxScore: number
}

interface QuestionFormData {
  title: string
  description: string
  type: 'dissertativa' | 'redacao' | 'argumentativa'
  level: 'facil' | 'medio' | 'dificil'
  subject: string
  theme: string
  base_text: string
  expected_answer: string
  grading_rules: GradingRules
}

export function CreateQuestionDialog({ open, onOpenChange, onQuestionCreated }: CreateQuestionDialogProps) {
  const { toast } = useToast()
  const addQuestion = useAppStore((state) => state.addQuestion)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CreateQuestionInput>({
    title: '',
    description: '',
    type: 'dissertativa',
    level: 'medio',
    subject: 'portugues',
    theme: '',
    base_text: '',
    expected_answer: '',
    grading_rules: {
      content: 40,
      clarity: 20,
      grammar: 20,
      structure: 20
    } as BaseGradingRules
  })

  const handleTypeChange = (type: 'dissertativa' | 'redacao' | 'argumentativa') => {
    setFormData(prev => ({
      ...prev,
      type,
      subject: type === 'redacao' ? 'redacao' : type === 'argumentativa' ? 'argumentativa' : prev.subject,
      base_text: type === 'dissertativa' ? '' : prev.base_text,
      theme: type === 'dissertativa' ? '' : prev.theme,
      grading_rules: type === 'redacao' 
        ? {
            competencia1: 20,
            competencia2: 20,
            competencia3: 20,
            competencia4: 20,
            competencia5: 20
          } as EssayGradingRules
        : {
            content: 40,
            clarity: 20,
            grammar: 20,
            structure: 20
          } as BaseGradingRules
    }))
  }

  const isRedacao = formData.type === 'redacao'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.description) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha todos os campos obrigatórios.',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)

    try {
      const questionData = {
        id: uuidv4(),
        ...formData,
        code: uuidv4().split('-')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('questions')
        .insert(questionData)

      if (error) throw error

      toast({
        title: "Questão criada",
        description: "A questão foi criada com sucesso.",
      })
      
      onQuestionCreated?.()
      onOpenChange(false)
      setFormData({
        title: '',
        description: '',
        type: 'dissertativa',
        level: 'medio',
        subject: 'portugues',
        theme: '',
        base_text: '',
        expected_answer: '',
        grading_rules: {
          content: 40,
          clarity: 20,
          grammar: 20,
          structure: 20
        } as BaseGradingRules
      })
    } catch (error) {
      console.error('Erro ao criar questão:', error)
      toast({
        variant: "destructive",
        title: "Erro ao criar questão",
        description: "Não foi possível criar a questão. Tente novamente."
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
            <DialogTitle className="text-slate-100">Criar Nova Questão</DialogTitle>
            <DialogDescription>
              Crie uma nova questão para avaliação. Preencha os campos abaixo com as informações necessárias.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Tipo</Label>
                <Select
                  value={formData.type}
                  onValueChange={handleTypeChange}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="dissertativa" className="text-slate-100 focus:bg-slate-700">Dissertativa</SelectItem>
                    <SelectItem value="redacao" className="text-slate-100 focus:bg-slate-700">Redação</SelectItem>
                    <SelectItem value="argumentativa" className="text-slate-100 focus:bg-slate-700">Argumentativa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {!isRedacao && (
                <div className="grid gap-2">
                  <Label htmlFor="subject">Disciplina</Label>
                  <Select
                    value={formData.subject}
                    onValueChange={(value) => setFormData({ ...formData, subject: value as any })}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                      <SelectValue placeholder="Selecione a disciplina" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="portugues" className="text-slate-100 focus:bg-slate-700">Português</SelectItem>
                      <SelectItem value="matematica" className="text-slate-100 focus:bg-slate-700">Matemática</SelectItem>
                      <SelectItem value="historia" className="text-slate-100 focus:bg-slate-700">História</SelectItem>
                      <SelectItem value="geografia" className="text-slate-100 focus:bg-slate-700">Geografia</SelectItem>
                      <SelectItem value="ciencias" className="text-slate-100 focus:bg-slate-700">Ciências</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="level">Nível</Label>
                <Select
                  value={formData.level}
                  onValueChange={(value) => setFormData({ ...formData, level: value as any })}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                    <SelectValue placeholder="Selecione o nível" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="facil" className="text-slate-100 focus:bg-slate-700">Fácil</SelectItem>
                    <SelectItem value="medio" className="text-slate-100 focus:bg-slate-700">Médio</SelectItem>
                    <SelectItem value="dificil" className="text-slate-100 focus:bg-slate-700">Difícil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Digite o título da questão"
                required
                className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Digite a descrição da questão"
                required
                className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 min-h-[100px]"
              />
            </div>

            {isRedacao ? (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="theme">Tema</Label>
                  <Input
                    id="theme"
                    value={formData.theme}
                    onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                    placeholder="Digite o tema"
                    required
                    className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="base_text">Texto Base</Label>
                  <Textarea
                    id="base_text"
                    value={formData.base_text}
                    onChange={(e) => setFormData({ ...formData, base_text: e.target.value })}
                    placeholder="Digite o texto base, se houver"
                    required
                    className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 min-h-[200px]"
                  />
                </div>
                <div className="space-y-4">
                  <div className="text-sm font-medium text-slate-100">Critérios de avaliação (ENEM)</div>
                  <GradingRulesConfig
                    type="redacao"
                    rules={formData.grading_rules}
                    onChange={(rules) => setFormData({ ...formData, grading_rules: rules })}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="expected_answer">Resposta Esperada</Label>
                  <Textarea
                    id="expected_answer"
                    value={formData.expected_answer}
                    onChange={(e) => setFormData({ ...formData, expected_answer: e.target.value })}
                    placeholder="Digite a resposta esperada"
                    required
                    className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 min-h-[100px]"
                  />
                </div>
                <div className="space-y-4">
                  <div className="text-sm font-medium text-slate-100">Critérios de avaliação</div>
                  <GradingRulesConfig
                    type="dissertativa"
                    rules={formData.grading_rules}
                    onChange={(rules) => setFormData({ ...formData, grading_rules: rules })}
                  />
                </div>
              </>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Questão
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 