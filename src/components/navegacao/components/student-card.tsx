'use client'

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ItemHierarquico } from "@/types/navigation"

interface StudentCardProps {
  aluno: ItemHierarquico
  viewType?: 'grid' | 'list' | 'table'
}

export function StudentCard({ aluno, viewType = 'grid' }: StudentCardProps) {
  const iniciais = aluno.nome
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  if (viewType === 'table') {
    return (
      <tr className="hover:bg-muted/50">
        <td className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{iniciais}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{aluno.nome}</p>
              <p className="text-sm text-muted-foreground">{aluno.descricao}</p>
            </div>
          </div>
        </td>
      </tr>
    )
  }

  if (viewType === 'list') {
    return (
      <div className="flex items-center gap-3 p-4 hover:bg-muted/50 rounded-lg">
        <Avatar>
          <AvatarFallback>{iniciais}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{aluno.nome}</p>
          <p className="text-sm text-muted-foreground">{aluno.descricao}</p>
        </div>
      </div>
    )
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex items-center text-center pb-2">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="text-lg">{iniciais}</AvatarFallback>
        </Avatar>
      </CardHeader>
      <CardContent className="text-center">
        <h3 className="font-medium">{aluno.nome}</h3>
        <p className="text-sm text-muted-foreground mt-1">{aluno.descricao}</p>
      </CardContent>
    </Card>
  )
} 