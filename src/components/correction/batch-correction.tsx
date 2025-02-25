'use client'

import { useState, useEffect, useRef } from 'react'
import { useToast } from '@/components/ui/use-toast'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Download, FileText, Upload } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { StudentResponse } from '@/types/common'
import Papa from 'papaparse'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from '@/lib/supabase'
import { CSVUpload } from './csv-upload'

interface CSVData {
  email: string
  codigo_questao: string
  resposta: string
}

interface BatchResponse {
  student_id: string;
  question_id: string;
  answer: string;
}

interface BatchCorrectionResult {
  success: boolean;
  studentId: string;
  questionId: string;
  correctionId?: string;
}

export function BatchCorrection() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const { questions, loadQuestions, addBatchCorrections } = useAppStore()
  const [answers, setAnswers] = useState<StudentResponse[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadQuestions()
  }, [loadQuestions])

  const handleUpload = async (data: any[]) => {
    setLoading(true)
    setProgress(0)
    setError(null)

    try {
      console.log('Resultado do parse:', data)
      const validRows = data.filter(row => {
        const isValid = row.email && row.codigo_questao && row.resposta
        if (!isValid) {
          console.log('Linha inválida:', row)
        }
        return isValid
      })

      if (!validRows.length) {
        throw new Error('Nenhuma linha válida encontrada no CSV')
      }

      // Antes de processar as respostas, vamos criar/buscar os alunos
      const uniqueEmails = [...new Set(validRows.map(row => row.email))]
      const students: Record<string, string> = {} // email -> id

      for (const email of uniqueEmails) {
        try {
          // Primeiro tenta buscar o aluno
          const { data: existingStudents } = await supabase
            .from('students')
            .select('id, email')
            .eq('email', email)
            .single()

          if (existingStudents) {
            students[email] = existingStudents.id
          } else {
            // Se não existe, cria um novo aluno
            const { data: newStudent, error: createError } = await supabase
              .from('students')
              .insert({
                email: email,
                name: email.split('@')[0].replace(/[.]/g, ' '),
                school_id: 'default', // Você precisa definir um valor padrão
                grade_id: 'default',  // Você precisa definir um valor padrão
              })
              .select('id')
              .single()

            if (createError) throw createError
            if (newStudent) students[email] = newStudent.id
          }
        } catch (error) {
          console.error('Erro ao processar aluno:', email, error)
          toast({
            variant: "destructive",
            title: "Erro ao processar aluno",
            description: `Não foi possível processar o aluno ${email}`
          })
        }
      }

      const respostasPorQuestao = validRows.reduce<Record<string, BatchResponse[]>>((acc, row) => {
        const questao = questions.find(q => q.code === row.codigo_questao)
        const studentId = students[row.email]

        if (questao && studentId) {
          if (!acc[questao.id]) {
            acc[questao.id] = []
          }
          acc[questao.id].push({
            student_id: studentId,
            question_id: questao.id,
            answer: row.resposta.trim()
          })
        } else {
          const reason = !questao 
            ? `Código de questão não encontrado: ${row.codigo_questao}`
            : `Aluno não processado: ${row.email}`
          toast({
            variant: "destructive",
            title: "Erro no processamento",
            description: reason
          })
        }
        return acc
      }, {})

      let totalProcessado = 0
      let totalSucesso = 0
      let totalErro = 0

      for (const [questionId, respostas] of Object.entries(respostasPorQuestao)) {
        const results = await addBatchCorrections(respostas) as BatchCorrectionResult[]
        
        const sucessos = results.filter(r => r.success).length
        totalSucesso += sucessos
        totalErro += results.length - sucessos

        totalProcessado += respostas.length
        const progressoAtual = Math.round((totalProcessado / validRows.length) * 100)
        setProgress(progressoAtual)

        if (sucessos > 0) {
          setAnswers(prev => [...prev, ...results
            .filter(r => r.success)
            .map(r => ({
              id: r.correctionId!,
              student_id: r.studentId,
              question_id: r.questionId,
              answer: data.find(d => d.email === r.studentId)?.resposta || '',
              created_at: new Date().toISOString()
            }))
          ])
        }
      }

      if (totalSucesso > 0) {
        toast({
          title: "Processamento concluído",
          description: `${totalSucesso} respostas processadas com sucesso. ${totalErro} erros.`
        })
      } else {
        toast({
          variant: "destructive",
          title: "Nenhuma resposta processada",
          description: "Verifique se os códigos das questões estão corretos."
        })
      }

    } catch (error) {
      console.error('Erro ao processar CSV:', error)
      setError(error instanceof Error ? error.message : 'Erro desconhecido')
      toast({
        variant: "destructive",
        title: "Erro ao importar CSV",
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      })
    } finally {
      setLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const downloadTemplate = () => {
    const content = [
      'email;codigo_questao;resposta',
      'aluno@escola.com;RED-2024-001;"Resposta do aluno aqui"'
    ].join('\n')

    const blob = new Blob([content], { 
      type: 'text/csv;charset=utf-8;' 
    })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'template_respostas.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader>
        <CardTitle className="text-slate-100">Upload de Respostas</CardTitle>
        <CardDescription className="text-slate-400">
          Faça upload de um arquivo CSV com as respostas dos alunos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <CSVUpload onUpload={handleUpload} />

        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 space-y-3">
          <div className="flex items-center gap-2 text-slate-100">
            <FileText className="h-4 w-4" />
            <span className="text-sm font-medium">Formato do CSV:</span>
          </div>
          <code className="block text-sm bg-slate-800 p-2 rounded text-slate-300">
            email;codigo_questao;resposta<br />
            aluno@escola.com;RED-2024-001;"Resposta do aluno aqui"
          </code>
          <p className="text-sm text-slate-400">
            O código da questão pode ser encontrado na página de questões
          </p>
        </div>

        {loading && (
          <div className="space-y-2">
            <Progress value={progress} className="bg-slate-800" />
            <p className="text-sm text-center text-slate-400">
              Processando... {progress}%
            </p>
          </div>
        )}

        {answers.length > 0 && (
          <div className="rounded-lg border border-slate-800 p-4">
            <h4 className="font-medium text-slate-100 mb-2">Respostas Processadas:</h4>
            <p className="text-sm text-slate-400">
              {answers.length} respostas foram processadas com sucesso
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 