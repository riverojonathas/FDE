'use client'

import { Button } from '@/components/ui/button'
import { FileDown } from 'lucide-react'

export function CSVTemplate() {
  const handleDownload = () => {
    const BOM = new Uint8Array([0xEF, 0xBB, 0xBF])
    
    const csvContent = [
      'email,resposta',
      'maria.silva@aluno.com,"A tensão entre as grandes potências europeias já era enorme..."',
      'joao.santos@aluno.com,"As alianças militares, o desejo de expandir territórios..."',
    ].join('\n')

    const blob = new Blob([BOM, csvContent], { 
      type: 'text/csv;charset=utf-8'
    })
    
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'modelo-respostas.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={handleDownload}
      className="flex items-center gap-2"
    >
      <FileDown className="h-4 w-4" />
      Baixar Modelo CSV
    </Button>
  )
} 