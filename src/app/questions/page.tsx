'use client'

import { MainLayout } from "@/components/layout/main-layout"
import { PageHeader } from "@/components/ui/page-header"
import { CreateQuestionButton } from "@/components/questions/create-question-button"
import { QuestionList } from "@/components/questions/question-list"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default function QuestionsPage() {
  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <PageHeader
            title="Questões"
            description="Gerencie suas questões para correção."
          />
          <CreateQuestionButton />
        </div>

        <div className="flex items-center space-x-2 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Buscar questões..." 
              className="pl-9 bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500"
            />
          </div>
        </div>

        <QuestionList />
      </div>
    </MainLayout>
  )
} 