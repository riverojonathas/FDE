'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CreateQuestionDialog } from "./create-question-dialog"

export function CreateQuestionButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button 
        onClick={() => setOpen(true)}
        size="sm"
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        <Plus className="mr-2 h-4 w-4" />
        Nova Questão
      </Button>
      <CreateQuestionDialog open={open} onOpenChange={setOpen} />
    </>
  )
} 