'use client'

import { useAppStore } from '@/store/useAppStore'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Correction {
  id: string
  prompt: string
  answer: string
  score: number
  feedback: string
  createdAt: string
  studentName?: string
}

export function CorrectionsTable() {
  // Aqui viria a integração com o estado real
  const corrections: Correction[] = [
    {
      id: '1',
      prompt: 'Explique o conceito de fotossíntese',
      answer: 'É o processo onde plantas produzem energia...',
      score: 8.5,
      feedback: 'Boa explicação, mas faltaram alguns detalhes...',
      createdAt: '2024-02-20T10:00:00Z',
      studentName: 'João Silva'
    },
    // ... mais correções
  ]

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Aluno</TableHead>
            <TableHead>Prompt</TableHead>
            <TableHead>Nota</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {corrections.map((correction) => (
            <TableRow key={correction.id}>
              <TableCell>{correction.studentName || 'Anônimo'}</TableCell>
              <TableCell>{correction.prompt}</TableCell>
              <TableCell>{correction.score}</TableCell>
              <TableCell>
                {new Date(correction.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                {/* Adicionar ações como visualizar detalhes, exportar, etc */}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 