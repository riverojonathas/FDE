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

export function CreateQuestionDialog({ open, onOpenChange }: { 
  open: boolean
  onOpenChange: (open: boolean) => void 
}) {
  const { toast } = useToast()
  const addQuestion = useAppStore((state) => state.addQuestion)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CreateQuestionInput>({
    title: '',
    description: '',
    subject: 'portugues',
    type: 'dissertativa',
    level: 'medio',
    expectedAnswer: '',
    baseText: '',
    theme: '',
    gradingRules: {
      content: 40,
      clarity: 20,
      grammar: 20,
      structure: 20
    }
  })

  const handleTypeChange = (type: 'dissertativa' | 'redacao') => {
    setFormData(prev => ({
      ...prev,
      type,
      subject: type === 'redacao' ? 'redacao' : prev.subject,
      baseText: type === 'dissertativa' ? '' : prev.baseText,
      theme: type === 'dissertativa' ? '' : prev.theme,
      gradingRules: type === 'redacao' 
        ? {
            competencia1: 20,
            competencia2: 20,
            competencia3: 20,
            competencia4: 20,
            competencia5: 20,
          } as EssayGradingRules
        : {
            content: 40,
            clarity: 20,
            grammar: 20,
            structure: 20,
          } as BaseGradingRules
    }))
  }

  const isRedacao = formData.type === 'redacao'
  const total = Object.values(formData.gradingRules).reduce((sum: number, value: number) => sum + value, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (total !== 100) {
      toast({
        variant: "destructive",
        title: "Erro na configuração",
        description: "O total dos pesos deve ser igual a 100%",
      })
      return
    }

    setLoading(true)

    try {
      await addQuestion(formData)
      
      toast({
        title: "Questão criada",
        description: "A questão foi criada com sucesso.",
      })
      
      onOpenChange(false)
      setFormData({
        title: '',
        description: '',
        subject: 'portugues',
        type: 'dissertativa',
        level: 'medio',
        expectedAnswer: '',
        baseText: '',
        theme: '',
        gradingRules: {
          content: 40,
          clarity: 20,
          grammar: 20,
          structure: 20
        }
      })
    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Erro ao criar questão",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao criar a questão. Tente novamente.",
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
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <Select
                value={formData.type}
                onValueChange={handleTypeChange}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="dissertativa" className="text-slate-100 focus:bg-slate-700">Dissertativa</SelectItem>
                  <SelectItem value="redacao" className="text-slate-100 focus:bg-slate-700">Redação</SelectItem>
                </SelectContent>
              </Select>

              {!isRedacao && (
                <Select
                  value={formData.subject}
                  onValueChange={(value) => setFormData({ ...formData, subject: value as any })}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                    <SelectValue placeholder="Disciplina" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="portugues" className="text-slate-100 focus:bg-slate-700">Português</SelectItem>
                    <SelectItem value="matematica" className="text-slate-100 focus:bg-slate-700">Matemática</SelectItem>
                    <SelectItem value="historia" className="text-slate-100 focus:bg-slate-700">História</SelectItem>
                    <SelectItem value="geografia" className="text-slate-100 focus:bg-slate-700">Geografia</SelectItem>
                    <SelectItem value="ciencias" className="text-slate-100 focus:bg-slate-700">Ciências</SelectItem>
                  </SelectContent>
                </Select>
              )}

              <Select
                value={formData.level}
                onValueChange={(value) => setFormData({ ...formData, level: value as any })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                  <SelectValue placeholder="Nível" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="facil" className="text-slate-100 focus:bg-slate-700">Fácil</SelectItem>
                  <SelectItem value="medio" className="text-slate-100 focus:bg-slate-700">Médio</SelectItem>
                  <SelectItem value="dificil" className="text-slate-100 focus:bg-slate-700">Difícil</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Input
              placeholder="Título da questão"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
            />

            {isRedacao ? (
              <>
                <Input
                  placeholder="Tema da redação"
                  value={formData.theme || ''}
                  onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                  required
                  className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
                />
                <Textarea
                  placeholder="Texto base da redação"
                  value={formData.baseText || ''}
                  onChange={(e) => setFormData({ ...formData, baseText: e.target.value })}
                  required
                  className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 min-h-[200px]"
                />
                <div className="space-y-4">
                  <div className="text-sm font-medium text-slate-100">Critérios de avaliação (ENEM)</div>
                  <GradingRulesConfig
                    type="redacao"
                    rules={formData.gradingRules}
                    onChange={(rules) => setFormData({ ...formData, gradingRules: rules })}
                  />
                  <div className={`text-sm text-center ${total === 100 ? 'text-slate-400' : 'text-red-400'}`}>
                    Total: {total}% {total !== 100 && '(deve somar 100%)'}
                  </div>
                </div>
              </>
            ) : (
              <>
                <Textarea
                  placeholder="Descrição da questão"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 min-h-[100px]"
                />
                <Textarea
                  placeholder="Resposta esperada"
                  value={formData.expectedAnswer}
                  onChange={(e) => setFormData({ ...formData, expectedAnswer: e.target.value })}
                  required
                  className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 min-h-[100px]"
                />
                <div className="space-y-4">
                  <div className="text-sm font-medium text-slate-100">Critérios de avaliação</div>
                  <GradingRulesConfig
                    type="dissertativa"
                    rules={formData.gradingRules}
                    onChange={(rules) => setFormData({ ...formData, gradingRules: rules })}
                  />
                  <div className={`text-sm text-center ${total === 100 ? 'text-slate-400' : 'text-red-400'}`}>
                    Total: {total}% {total !== 100 && '(deve somar 100%)'}
                  </div>
                </div>
              </>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              type="submit" 
              disabled={loading || total !== 100}
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