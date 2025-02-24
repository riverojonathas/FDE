'use client'

import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface EditPromptDialogProps {
  prompt: {
    id: string
    title: string
    content: string
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditPromptDialog({ prompt, open, onOpenChange }: EditPromptDialogProps) {
  const [title, setTitle] = useState(prompt.title)
  const [content, setContent] = useState(prompt.content)
  const updatePrompt = useAppStore((state) => state.updatePrompt)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updatePrompt(prompt.id, { title, content })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Prompt</DialogTitle>
            <DialogDescription>
              Faça as alterações necessárias no prompt.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Digite o título do prompt"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">Conteúdo</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Digite o conteúdo do prompt"
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Salvar Alterações</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 