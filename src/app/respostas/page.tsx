'use client'

import { MainLayout } from "@/components/layout/main-layout"
import { PageHeader } from "@/components/ui/page-header"
import { QuestionAnswerList } from '@/components/answer/question-answer-list'

export default function RespostasPage() {
  return (
    <MainLayout>
      <div className="space-y-8">
        <PageHeader
          title="Respostas"
          description="Responda às questões e receba feedback em tempo real"
        />
        
        <QuestionAnswerList />
      </div>
    </MainLayout>
  )
} 