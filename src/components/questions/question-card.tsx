import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MoreVertical } from "lucide-react"
import { cn } from "@/lib/utils"

interface QuestionCardProps {
  id: string
  title: string
  code: string
  description?: string
  type: string
  subject: string
  level: string
  theme?: string
  grading_rules?: {
    criteria?: {
      argumentacao?: number
      coerencia?: number
      conclusao?: number
      gramatica?: number
    }
  }
  selected?: boolean
  onSelect: (id: string) => void
}

export function QuestionCard({
  id,
  title,
  code,
  description,
  type,
  subject,
  level,
  theme,
  grading_rules,
  selected = false,
  onSelect
}: QuestionCardProps) {
  // Mapeia os tipos para labels em português
  const typeLabels: Record<string, string> = {
    essay: 'redação',
    dissertation: 'dissertativa',
    argumentation: 'argumentativa'
  }

  // Mapeia os níveis para labels em português
  const levelLabels: Record<string, string> = {
    facil: 'fácil',
    medio: 'médio',
    dificil: 'difícil'
  }

  // Mapeia os tipos para cores de badge
  const typeColors: Record<string, string> = {
    essay: 'bg-blue-500',
    dissertation: 'bg-purple-500',
    argumentation: 'bg-green-500'
  }

  return (
    <Card
      className={cn(
        "relative p-4 cursor-pointer transition-all hover:shadow-md",
        selected && "ring-2 ring-primary"
      )}
      onClick={() => onSelect(id)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3 flex-1">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg leading-none">{title}</h3>
            <p className="text-sm text-muted-foreground">Código: {code}</p>
          </div>
          
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className={cn("capitalize", typeColors[type] || 'bg-gray-500')}>
              {typeLabels[type] || type}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {levelLabels[level] || level}
            </Badge>
            {subject && (
              <Badge variant="outline" className="capitalize">
                {subject}
              </Badge>
            )}
            {theme && (
              <Badge variant="outline" className="capitalize">
                {theme}
              </Badge>
            )}
          </div>

          {grading_rules?.criteria && (
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {grading_rules.criteria.argumentacao && (
                <span>Argumentação: {grading_rules.criteria.argumentacao}%</span>
              )}
              {grading_rules.criteria.coerencia && (
                <span>Coerência: {grading_rules.criteria.coerencia}%</span>
              )}
              {grading_rules.criteria.conclusao && (
                <span>Conclusão: {grading_rules.criteria.conclusao}%</span>
              )}
              {grading_rules.criteria.gramatica && (
                <span>Gramática: {grading_rules.criteria.gramatica}%</span>
              )}
            </div>
          )}
        </div>

        <Button 
          variant="ghost" 
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation()
            // Aqui podemos adicionar um menu de ações posteriormente
          }}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
} 