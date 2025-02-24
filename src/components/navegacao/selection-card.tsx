'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LucideIcon } from "lucide-react"

interface SelectionCardProps {
  titulo: string
  descricao: string
  icone: LucideIcon
  aoClicar: () => void
  selecionado: boolean
}

export function SelectionCard({
  titulo,
  descricao,
  icone: Icone,
  aoClicar,
  selecionado
}: SelectionCardProps) {
  return (
    <Card 
      className={`
        cursor-pointer transition-all duration-200
        hover:border-primary/50 hover:shadow-md
        ${selecionado ? 'border-primary bg-primary/5' : ''}
      `}
      onClick={aoClicar}
    >
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icone className={`h-5 w-5 ${selecionado ? 'text-primary' : ''}`} />
          <CardTitle className={`text-lg ${selecionado ? 'text-primary' : ''}`}>
            {titulo}
          </CardTitle>
        </div>
        <CardDescription>{descricao}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          variant={selecionado ? "default" : "secondary"} 
          className="w-full"
        >
          {selecionado ? 'Selecionado' : 'Selecionar'}
        </Button>
      </CardContent>
    </Card>
  )
} 