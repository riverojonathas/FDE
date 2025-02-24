'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { correctAnswer } from '@/lib/ai'
import { Loader2 } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

export function CorrectionForm() {
  const [prompt, setPrompt] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CorrectionResponse | null>(null)

  const addCorrection = useAppStore((state) => state.addCorrection)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const correction = await correctAnswer(prompt, answer)
      
      // Salva no store
      addCorrection({
        prompt,
        answer,
        ...correction,
      })
      
      setResult(correction)
    } catch (error) {
      console.error(error)
      // Adicionar toast de erro
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Prompt</label>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Digite o prompt de correção..."
          rows={3}
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Resposta</label>
        <Textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Cole a resposta do aluno aqui..."
          rows={5}
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Corrigir
      </Button>

      {result && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Resultado</h3>
            <span className="text-2xl font-bold">{result.score}</span>
          </div>
          
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm">{result.feedback}</p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Pontos para melhoria:</h4>
            <ul className="list-disc pl-5 space-y-1">
              {result.details.map((detail, index) => (
                <li key={index} className="text-sm">{detail}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </form>
  )
} 