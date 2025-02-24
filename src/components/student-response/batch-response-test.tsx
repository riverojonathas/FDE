'use client'

import { useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { Question, Student, StudentResponse } from '@/types/common'
import { useAppStore } from '@/store/useAppStore'

interface BatchResponseTestProps {
  question: Question;
  onComplete: (responses: StudentResponse[]) => void;
}

export function BatchResponseTest({ question, onComplete }: BatchResponseTestProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const addStudentResponse = useAppStore((state) => state.addStudentResponse)
  const getStudents = useAppStore((state) => state.getStudents)

  const handleClick = async () => {
    setLoading(true)
    try {
      // Buscar alunos
      const students = await getStudents()
      const savedResponses: StudentResponse[] = []

      // Criar respostas para cada aluno
      for (const student of students) {
        try {
          const response = await addStudentResponse({
            student_id: student.id,
            question_id: question.id,
            answer: `Resposta teste do aluno ${student.name} para a questão "${question.title}"`
          })
          savedResponses.push(response)
        } catch (error) {
          console.error('Erro ao salvar resposta:', error)
        }
      }

      toast({
        title: "Respostas criadas",
        description: `${savedResponses.length} respostas de teste foram criadas.`,
      })
      onComplete(savedResponses)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível criar as respostas de teste.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      onClick={handleClick} 
      disabled={loading}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Criar Respostas de Teste
    </Button>
  )
} 