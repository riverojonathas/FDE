'use client'

import { useState, useEffect } from 'react'
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, Loader2, User, FileQuestion, Info, School } from "lucide-react"
import { useCorrectionStore } from '@/store/correction-store'
import { toast } from "sonner"
import { mockCorrection } from '@/lib/langchain/mock-correction'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { mockStudents, Student } from '@/components/corretor-v2/students-manager'

// Tipos para as questões
interface Question {
  id: string
  title: string
  type: string
  subject?: string
}

// Questões de exemplo
const mockQuestions: Question[] = [
  { id: 'q1', title: 'Redação ENEM 2023', type: 'redacao', subject: 'redacao' },
  { id: 'q2', title: 'Análise de texto literário', type: 'dissertativa', subject: 'literatura' },
  { id: 'q3', title: 'Dissertação sobre meio ambiente', type: 'argumentativa', subject: 'geografia' },
  { id: 'q4', title: 'Impactos da tecnologia na sociedade', type: 'expositiva', subject: 'sociologia' },
  { id: 'q5', title: 'Análise de obra clássica brasileira', type: 'dissertativa', subject: 'literatura' }
]

interface StudentData {
  name: string
  id?: string
  class?: string
}

interface QuestionData {
  id: string
  type: string
  subject?: string
}

export function StudentAnswerInput() {
  const [answer, setAnswer] = useState('')
  const [selectedStudent, setSelectedStudent] = useState('')
  const [questionId, setQuestionId] = useState('')
  const [selectedQuestion, setSelectedQuestion] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const { setCurrentResult, addToHistory } = useCorrectionStore()
  
  // Estados com informações derivadas
  const [studentData, setStudentData] = useState<StudentData | null>(null)
  const [questionData, setQuestionData] = useState<QuestionData | null>(null)
  
  // Efeito para atualizar dados do estudante quando selecionado
  useEffect(() => {
    if (selectedStudent) {
      const student = mockStudents.find((s: Student) => s.id === selectedStudent)
      if (student) {
        setStudentData({
          name: student.name,
          id: student.matricula || student.id,
          class: student.class
        })
      }
    } else {
      setStudentData(null)
    }
  }, [selectedStudent])
  
  // Efeito para atualizar dados da questão quando selecionada
  useEffect(() => {
    if (selectedQuestion) {
      const question = mockQuestions.find(q => q.id === selectedQuestion)
      if (question) {
        setQuestionData({
          id: question.title,
          type: question.type,
          subject: question.subject
        })
      }
    } else {
      setQuestionData(null)
    }
  }, [selectedQuestion])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!answer.trim()) {
      toast.error("Por favor, insira uma resposta para corrigir.")
      return
    }

    if (!studentData) {
      toast.error("Por favor, selecione um aluno.")
      return
    }
    
    if (!questionData) {
      toast.error("Por favor, selecione uma questão.")
      return
    }

    setIsLoading(true)
    
    try {
      // Preparar os dados para o mock
      const correctionInput = {
        text: answer,
        student: studentData,
        question: questionData
      }
      
      // Usar o mock para simular uma correção
      const result = await mockCorrection(correctionInput)
      
      // Atualiza o estado global com o resultado
      setCurrentResult(result)
      addToHistory(result)
      
      toast.success("Correção concluída com sucesso!")
    } catch (error) {
      console.error("Erro ao corrigir resposta:", error)
      toast.error("Ocorreu um erro ao corrigir sua resposta. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">Resposta do Aluno</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Seleção do Aluno */}
        <div className="space-y-2">
          <Label htmlFor="studentSelect">Selecione o Aluno</Label>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <Select 
              value={selectedStudent} 
              onValueChange={setSelectedStudent}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar aluno" />
              </SelectTrigger>
              <SelectContent>
                {mockStudents.map((student: Student) => (
                  <SelectItem key={student.id} value={student.id}>
                    <div className="flex items-center gap-2">
                      <span>{student.name}</span>
                      <span className="text-muted-foreground text-xs">
                        ({student.class})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Detalhes do aluno selecionado */}
        {studentData && (
          <div className="text-sm text-muted-foreground border rounded-md p-3">
            <div className="mb-1">
              <span className="font-medium">{studentData.name}</span>
              {studentData.id && (
                <span className="ml-2">({studentData.id})</span>
              )}
            </div>
            {studentData.class && (
              <div className="flex items-center gap-1">
                <School className="h-3.5 w-3.5" />
                <span>{studentData.class}</span>
              </div>
            )}
          </div>
        )}

        {/* Seleção da Questão */}
        <div className="space-y-2">
          <Label htmlFor="questionSelect">Selecione a Questão</Label>
          <div className="flex items-center gap-2">
            <FileQuestion className="h-4 w-4 text-muted-foreground" />
            <Select 
              value={selectedQuestion} 
              onValueChange={setSelectedQuestion}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar questão" />
              </SelectTrigger>
              <SelectContent>
                {mockQuestions.map((question) => (
                  <SelectItem key={question.id} value={question.id}>
                    <div className="flex items-center gap-2">
                      <span>{question.title}</span>
                      <span className="text-muted-foreground text-xs">
                        ({question.type})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Detalhes da questão selecionada */}
        {questionData && (
          <div className="text-sm text-muted-foreground border rounded-md p-3">
            <div className="mb-1 font-medium">{questionData.id}</div>
            <div className="flex items-center gap-x-3">
              <span className="inline-flex items-center gap-1">
                <span className="text-xs bg-primary/10 px-2 py-0.5 rounded">
                  {questionData.type.charAt(0).toUpperCase() + questionData.type.slice(1)}
                </span>
              </span>
              {questionData.subject && (
                <span className="text-xs text-muted-foreground">
                  Disciplina: {questionData.subject.charAt(0).toUpperCase() + questionData.subject.slice(1)}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Resposta do Aluno */}
        <div className="space-y-2">
          <Label htmlFor="studentAnswer">Resposta</Label>
          <Textarea 
            id="studentAnswer"
            placeholder="Digite ou cole a resposta do aluno aqui..."
            className={cn(
              "min-h-[200px] resize-none",
              !answer.trim() && "border-dashed"
            )}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
          <p className="text-xs text-muted-foreground text-right">
            {answer.trim() ? `${answer.split(/\s+/).filter(Boolean).length} palavras` : ""}
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full"
          onClick={handleSubmit}
          disabled={!answer.trim() || !selectedStudent || !selectedQuestion || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Corrigindo...
            </>
          ) : (
            <>
              <Bot className="mr-2 h-4 w-4" />
              Corrigir Resposta
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
} 