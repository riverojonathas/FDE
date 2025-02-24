'use client'

import { useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import Papa from 'papaparse'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Loader2, Upload, AlertCircle, CheckCircle2, RefreshCw, Download } from 'lucide-react'
import { Question, Student, StudentResponse } from '@/types/common'
import { useAppStore } from '@/store/useAppStore'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CSVTemplate } from './csv-template'
import { CorrectionDetails } from '@/components/correction/correction-details'

interface BatchResponseUploadProps {
  question: Question;
  onComplete: (responses: StudentResponse[]) => void;
}

interface CSVRow {
  email: string;
  resposta: string;
}

interface PreviewData {
  email: string;
  resposta: string;
  status: 'valid' | 'invalid';
  error?: string;
}

interface CorrectionStatus {
  studentName: string;
  status: 'pending' | 'completed' | 'error';
  score?: number;
  feedback?: string;
  correction?: Correction;
  response?: StudentResponse;
}

export function BatchResponseUpload({ question, onComplete }: BatchResponseUploadProps) {
  const { toast } = useToast()
  const addStudentResponse = useAppStore((state) => state.addStudentResponse)
  const addCorrection = useAppStore((state) => state.addCorrection)
  const getStudents = useAppStore((state) => state.getStudents)
  const getCorrections = useAppStore((state) => state.getCorrections)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [previewData, setPreviewData] = useState<PreviewData[]>([])
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [correctionStatuses, setCorrectionStatuses] = useState<CorrectionStatus[]>([])

  // Validar dados do CSV
  const validateCSVData = async (data: CSVRow[]) => {
    const students = await getStudents()
    const studentEmails = new Set(students.map(s => s.email))
    const errors: string[] = []
    
    const validatedData: PreviewData[] = data.map((row, index) => {
      if (!row.email) {
        errors.push(`Linha ${index + 1}: Email não informado`)
        return { ...row, status: 'invalid', error: 'Email não informado' }
      }
      
      if (!studentEmails.has(row.email)) {
        errors.push(`Linha ${index + 1}: Email ${row.email} não encontrado`)
        return { ...row, status: 'invalid', error: 'Email não encontrado' }
      }

      if (!row.resposta?.trim()) {
        errors.push(`Linha ${index + 1}: Resposta vazia`)
        return { ...row, status: 'invalid', error: 'Resposta vazia' }
      }

      return { ...row, status: 'valid' }
    })

    setValidationErrors(errors)
    setPreviewData(validatedData)
    setShowPreview(true)

    return errors.length === 0
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(true)
    setProgress(0)
    setCurrentIndex(0)
    setValidationErrors([])
    setPreviewData([])
    setShowPreview(false)

    Papa.parse<CSVRow>(file, {
      header: true,
      encoding: 'UTF-8',
      complete: async (results) => {
        try {
          const isValid = await validateCSVData(results.data)
          if (!isValid) {
            toast({
              variant: "destructive",
              title: "Validação falhou",
              description: "Corrija os erros e tente novamente.",
            })
          }
        } catch (error) {
          console.error('Erro na validação:', error)
          toast({
            variant: "destructive",
            title: "Erro na validação",
            description: "Ocorreu um erro ao validar os dados.",
          })
        } finally {
          setLoading(false)
        }
      },
      error: (error) => {
        console.error('Erro ao processar CSV:', error)
        toast({
          variant: "destructive",
          title: "Erro no arquivo",
          description: "O arquivo CSV está mal formatado.",
        })
        setLoading(false)
      }
    })
  }

  // Função para verificar status das correções
  const checkCorrections = async (responses: StudentResponse[]) => {
    const statuses: CorrectionStatus[] = []

    for (const response of responses) {
      try {
        const corrections = await getCorrections(response.id)
        const latestCorrection = corrections[0]

        if (latestCorrection) {
          console.log(`Status da correção para resposta ${response.id}:`, {
            feedback: latestCorrection.feedback,
            score: latestCorrection.score,
            details: latestCorrection.details
          })
        }

        statuses.push({
          studentName: response.student_name || 'Aluno',
          status: latestCorrection ? 
            (latestCorrection.feedback === "Em processamento..." ? 'pending' : 'completed') : 
            'pending',
          score: latestCorrection?.score,
          feedback: latestCorrection?.feedback,
          correction: latestCorrection,
          response: response
        })
      } catch (error) {
        console.error('Erro ao verificar correção:', error)
        statuses.push({
          studentName: response.student_name || 'Aluno',
          status: 'error'
        })
      }
    }

    setCorrectionStatuses(statuses)
  }

  const handleSubmit = async () => {
    setLoading(true)
    const students = await getStudents()
    const studentMap = new Map(students.map(s => [s.email, { id: s.id, name: s.name }]))
    const savedResponses: StudentResponse[] = []

    try {
      for (let i = 0; i < previewData.length; i++) {
        const row = previewData[i]
        if (row.status === 'invalid') continue

        setCurrentIndex(i)
        setProgress((i / previewData.length) * 100)

        const student = studentMap.get(row.email)!
        
        try {
          // 1. Salvar a resposta do aluno
          const response = await addStudentResponse({
            student_id: student.id,
            question_id: question.id,
            answer: row.resposta
          })
          console.log('Resposta salva:', response)
          savedResponses.push(response)

          // 2. Criar a correção vinculada à resposta
          const correction = await addCorrection({
            answer_id: response.id, // ID da resposta que acabamos de criar
            prompt: `Corrija a seguinte resposta para a questão: "${question.title}"\n\nResposta: ${row.resposta}`,
            score: 0,
            feedback: "Em processamento...",
            details: [],
            student_id: student.id,
            student_name: student.name
          })
          console.log('Correção criada:', correction)

          await new Promise(resolve => setTimeout(resolve, 100))
        } catch (error) {
          console.error('Erro ao processar resposta:', error)
        }
      }

      toast({
        title: "Respostas enviadas",
        description: `${savedResponses.length} respostas foram salvas e enviadas para correção.`,
      })

      // Verificar correções uma única vez após o envio
      await checkCorrections(savedResponses)
      onComplete(savedResponses)

    } catch (error) {
      console.error('Erro no envio:', error)
      toast({
        variant: "destructive",
        title: "Erro no envio",
        description: "Ocorreu um erro ao salvar as respostas.",
      })
    } finally {
      setLoading(false)
      setProgress(0)
      setCurrentIndex(0)
      setShowPreview(false)
    }
  }

  // Download template CSV
  const downloadTemplate = () => {
    const headers = ['student_name', 'answer']
    const csvContent = Papa.unparse({
      fields: headers,
      data: [
        ['João Silva', 'Exemplo de resposta do aluno'],
        ['Maria Santos', 'Outra resposta de exemplo']
      ]
    })

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'template_respostas.csv'
    link.click()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload de Respostas</CardTitle>
        <CardDescription asChild>
          <div className="space-y-2">
            <span>Envie um arquivo CSV com as respostas dos alunos.</span>
            <span className="block text-sm text-muted-foreground">
              Faça o download do template para ver o formato correto.
            </span>
            <div>
              <CSVTemplate />
            </div>
          </div>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          disabled={loading}
          className="hidden"
          id="response-upload"
        />
        
        {loading && (
          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-sm text-muted-foreground">
              Processando resposta {currentIndex + 1}...
            </p>
          </div>
        )}

        {validationErrors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erros encontrados</AlertTitle>
            <AlertDescription>
              <ScrollArea className="h-[100px]">
                <ul className="list-disc pl-4">
                  {validationErrors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </ScrollArea>
            </AlertDescription>
          </Alert>
        )}

        {showPreview && (
          <div className="space-y-2">
            <h3 className="font-medium">Preview dos dados:</h3>
            <ScrollArea className="h-[200px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Erro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell>{row.email}</TableCell>
                      <TableCell>
                        {row.status === 'valid' ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </TableCell>
                      <TableCell>{row.error || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        )}
        
        <label htmlFor="response-upload">
          <Button 
            variant="outline" 
            disabled={loading}
            className="w-full cursor-pointer"
            asChild
          >
            <div>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              {loading ? 'Processando...' : 'Selecionar Arquivo CSV'}
            </div>
          </Button>
        </label>

        {/* Status das Correções */}
        {correctionStatuses.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Status das Correções</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => checkCorrections(savedResponses)}
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar Status
              </Button>
            </div>
            <ScrollArea className="h-[200px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Aluno</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Nota</TableHead>
                    <TableHead>Feedback</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {correctionStatuses.map((status, index) => (
                    <TableRow key={index}>
                      <TableCell>{status.studentName}</TableCell>
                      <TableCell>
                        {status.status === 'pending' && (
                          <div className="flex items-center">
                            <Loader2 className="h-4 w-4 mr-2 animate-spin text-yellow-500" />
                            <span className="text-yellow-500">Processando...</span>
                          </div>
                        )}
                        {status.status === 'completed' && (
                          <div className="flex items-center">
                            <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                            <span className="text-green-500">Concluído</span>
                          </div>
                        )}
                        {status.status === 'error' && (
                          <div className="flex items-center">
                            <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                            <span className="text-red-500">Erro</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-4">
                          <span className="font-medium">{status.score !== undefined ? status.score : '-'}/10</span>
                          {status.status === 'completed' && status.correction && status.response && (
                            <CorrectionDetails 
                              correction={status.correction}
                              studentResponse={status.response}
                            />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {status.feedback || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        )}

        {/* Template Download */}
        <Button 
          variant="outline" 
          onClick={downloadTemplate}
          className="w-full"
        >
          <Download className="h-4 w-4 mr-2" />
          Download Template CSV
        </Button>
      </CardContent>

      {showPreview && validationErrors.length === 0 && (
        <CardFooter>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full"
          >
            Enviar Respostas
          </Button>
        </CardFooter>
      )}
    </Card>
  )
} 