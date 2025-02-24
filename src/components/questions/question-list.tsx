'use client'

import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useToast } from '@/components/ui/use-toast'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit2, MoreVertical, Settings, Trash2 } from 'lucide-react'
import { EditQuestionDialog } from './edit-question-dialog'
import { GradingRulesDialog } from './grading-rules-dialog'

export function QuestionList() {
  const { toast } = useToast()
  const questions = useAppStore((state) => state.questions)
  const deleteQuestion = useAppStore((state) => state.deleteQuestion)
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null)
  const [gradingQuestion, setGradingQuestion] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    try {
      await deleteQuestion(id)
      toast({
        title: "Questão excluída",
        description: "A questão foi excluída com sucesso.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: "Não foi possível excluir a questão.",
      })
    }
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Nenhuma questão encontrada.</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {questions.map((question) => (
          <Card key={question.id} className="bg-slate-900/50 border-slate-800 hover:bg-slate-900 transition-colors">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-lg font-medium text-slate-100">
                  {question.title}
                </CardTitle>
                <CardDescription className="mt-1 text-xs text-slate-400">
                  Código: {question.code}
                </CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-100">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="bg-slate-900 border-slate-800"
                >
                  <DropdownMenuLabel className="text-slate-400">
                    Ações
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-800" />
                  <DropdownMenuItem 
                    onClick={() => setEditingQuestion(question.id)}
                    className="text-slate-400 hover:bg-slate-800 hover:text-slate-100 cursor-pointer"
                  >
                    <Edit2 className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setGradingQuestion(question.id)}
                    className="text-slate-400 hover:bg-slate-800 hover:text-slate-100 cursor-pointer"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Configurar Correção
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-800" />
                  <DropdownMenuItem 
                    onClick={() => handleDelete(question.id)}
                    className="text-red-400 hover:bg-slate-800 hover:text-red-300 cursor-pointer"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400 line-clamp-2 mb-4">
                {question.description}
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-slate-800 text-slate-300 border-slate-700">
                  {question.subject}
                </Badge>
                <Badge variant="outline" className="bg-slate-800 text-slate-300 border-slate-700">
                  {question.type}
                </Badge>
                <Badge variant="outline" className="bg-slate-800 text-slate-300 border-slate-700">
                  {question.level}
                </Badge>
              </div>
              {question.gradingRules && (
                <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <div>Conteúdo: {question.gradingRules.content}%</div>
                  <div>Clareza: {question.gradingRules.clarity}%</div>
                  <div>Gramática: {question.gradingRules.grammar}%</div>
                  <div>Estrutura: {question.gradingRules.structure}%</div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <EditQuestionDialog
        questionId={editingQuestion}
        open={!!editingQuestion}
        onOpenChange={(open) => !open && setEditingQuestion(null)}
      />

      <GradingRulesDialog
        questionId={gradingQuestion}
        open={!!gradingQuestion}
        onOpenChange={(open) => !open && setGradingQuestion(null)}
      />
    </>
  )
} 