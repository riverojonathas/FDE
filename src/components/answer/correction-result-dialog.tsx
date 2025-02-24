'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"

interface CorrectionResultDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  result: {
    score: number
    feedback: string
    details: string[]
  } | null
}

export function CorrectionResultDialog({ open, onOpenChange, result }: CorrectionResultDialogProps) {
  if (!result) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-slate-100">Resultado da Correção</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Nota */}
          <div className="text-center">
            <div className="text-5xl font-bold mb-2 text-slate-100">{result.score.toFixed(1)}</div>
            <Progress value={result.score * 10} className="h-2 bg-slate-800" />
          </div>

          {/* Feedback Geral */}
          <div className="space-y-2">
            <h3 className="font-medium text-slate-100">Feedback Geral</h3>
            <p className="text-sm text-slate-400">
              {result.feedback}
            </p>
          </div>

          {/* Pontos de Melhoria */}
          <div className="space-y-2">
            <h3 className="font-medium text-slate-100">Pontos para Melhoria</h3>
            <ul className="list-disc list-inside space-y-1">
              {result.details.map((detail, index) => (
                <li key={index} className="text-sm text-slate-400">
                  {detail}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 