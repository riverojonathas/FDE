'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Question, StudentResponse, Correction } from '@/types/common'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Search, Filter, FileText, CheckCircle2, AlertCircle } from 'lucide-react'
import { CorrectionDetails } from './correction-details'

interface GroupedResponses {
  [questionId: string]: {
    question: Question;
    responses: StudentResponse[];
    corrections: Correction[];
  }
}

export function CorrectionList() {
  const { questions, getStudentResponses, getCorrections } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedQuestion, setSelectedQuestion] = useState<string>('all')
  const [groupedResponses, setGroupedResponses] = useState<GroupedResponses>({})
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all')

  useEffect(() => {
    loadResponses()
  }, [])

  const loadResponses = async () => {
    setLoading(true)
    try {
      const grouped: GroupedResponses = {}

      for (const question of questions) {
        const responses = await getStudentResponses(question.id)
        const allCorrections: Correction[] = []

        for (const response of responses) {
          const corrections = await getCorrections(response.id)
          allCorrections.push(...corrections)
        }

        grouped[question.id] = {
          question,
          responses,
          corrections: allCorrections
        }
      }

      setGroupedResponses(grouped)
    } catch (error) {
      console.error('Erro ao carregar respostas:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredGroups = Object.entries(groupedResponses).filter(([questionId, group]) => {
    if (selectedQuestion !== 'all' && selectedQuestion !== questionId) return false
    
    const matchesSearch = group.responses.some(response => 
      response.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      response.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (!matchesSearch) return false

    if (statusFilter === 'pending') {
      return group.responses.some(response => 
        !group.corrections.find(c => c.answer_id === response.id)
      )
    }

    if (statusFilter === 'completed') {
      return group.responses.some(response => 
        group.corrections.find(c => c.answer_id === response.id)
      )
    }

    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-slate-400">Carregando respostas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por aluno ou resposta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-400" />
              <Select value={selectedQuestion} onValueChange={setSelectedQuestion}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                  <SelectValue placeholder="Filtrar por questão" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all" className="text-slate-100">Todas as questões</SelectItem>
                  {questions.map((question) => (
                    <SelectItem key={question.id} value={question.id} className="text-slate-100">
                      {question.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all" className="text-slate-100">Todos os status</SelectItem>
                  <SelectItem value="pending" className="text-slate-100">Pendentes</SelectItem>
                  <SelectItem value="completed" className="text-slate-100">Corrigidas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredGroups.map(([questionId, group]) => (
        <Card key={questionId} className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-slate-100">
              <span>{group.question.title}</span>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-slate-400">
                    {group.responses.filter(r => 
                      group.corrections.find(c => c.answer_id === r.id)
                    ).length} corrigidas
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-400" />
                  <span className="text-slate-400">
                    {group.responses.filter(r => 
                      !group.corrections.find(c => c.answer_id === r.id)
                    ).length} pendentes
                  </span>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {group.responses.map((response) => {
                  const correction = group.corrections.find(c => 
                    c.answer_id === response.id
                  )
                  
                  return (
                    <div 
                      key={response.id}
                      className="p-4 rounded-lg bg-slate-800/50 border border-slate-700"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-slate-100">
                          {response.student_name}
                        </span>
                        {correction ? (
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            <span className="text-slate-400">Nota: {correction.score}/10</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-sm">
                            <AlertCircle className="h-4 w-4 text-amber-400" />
                            <span className="text-slate-400">Pendente</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-slate-400 mb-4">
                        {response.answer}
                      </p>
                      {correction && (
                        <CorrectionDetails
                          correction={correction}
                          studentResponse={response}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 