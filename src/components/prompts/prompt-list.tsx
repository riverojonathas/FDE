'use client'

import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from '@/components/ui/button'
import { Edit2, Trash2 } from 'lucide-react'
import { EditPromptDialog } from './edit-prompt-dialog'

export function PromptList() {
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null)
  const { prompts, deletePrompt } = useAppStore()

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este prompt?')) {
      deletePrompt(id)
    }
  }

  const editingPrompt = editingPromptId 
    ? prompts.find(p => p.id === editingPromptId)
    : null

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Versão</TableHead>
              <TableHead>Questões</TableHead>
              <TableHead>Atualizado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prompts.map((prompt) => (
              <TableRow key={prompt.id}>
                <TableCell>{prompt.title}</TableCell>
                <TableCell>v{prompt.version}</TableCell>
                <TableCell>{prompt.questionIds.length}</TableCell>
                <TableCell>
                  {new Date(prompt.updatedAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setEditingPromptId(prompt.id)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDelete(prompt.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editingPrompt && (
        <EditPromptDialog
          prompt={editingPrompt}
          open={!!editingPromptId}
          onOpenChange={(open) => !open && setEditingPromptId(null)}
        />
      )}
    </>
  )
} 