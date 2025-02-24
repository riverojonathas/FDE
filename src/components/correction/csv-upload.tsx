'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Upload, FileText, Download } from 'lucide-react'
import Papa from 'papaparse'

interface CSVUploadProps {
  onUpload: (data: Array<{ 
    email: string; 
    resposta: string;
    codigo_questao: string;
  }>) => Promise<void>
}

export function CSVUpload({ onUpload }: CSVUploadProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(true)

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        try {
          const data = results.data as Array<{ 
            email: string; 
            resposta: string;
            codigo_questao: string;
          }>
          
          if (!data.length || !('email' in data[0]) || !('resposta' in data[0]) || !('codigo_questao' in data[0])) {
            throw new Error('CSV inválido. É necessário ter as colunas "email", "codigo_questao" e "resposta"')
          }

          const validData = data.filter(row => {
            const isValid = row.email?.trim() && row.resposta?.trim() && row.codigo_questao?.trim()
            if (!isValid) {
              console.warn('Linha inválida:', row)
            }
            return isValid
          })

          if (!validData.length) {
            throw new Error('Nenhum dado válido encontrado no CSV')
          }

          await onUpload(validData)

          toast({
            title: "CSV importado com sucesso",
            description: `${validData.length} respostas foram carregadas.`
          })

        } catch (error) {
          console.error('Erro ao processar CSV:', error)
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
      },
      error: (error) => {
        console.error('Erro ao ler CSV:', error)
        toast({
          variant: "destructive",
          title: "Erro ao ler CSV",
          description: "Não foi possível ler o arquivo. Verifique o formato."
        })
        setLoading(false)
      }
    })
  }

  const downloadTemplate = () => {
    const template = 'email,resposta\naluno@escola.com,"Resposta do aluno aqui"\noutro@escola.com,"Outra resposta aqui"'
    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'template_respostas.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-700"
              disabled={loading}
            >
              <Upload className="h-4 w-4 mr-2" />
              Selecionar Arquivo
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              disabled={loading}
            />
            <Button
              variant="outline"
              onClick={downloadTemplate}
              className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Template
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 