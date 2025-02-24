'use client'

import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AnswerDialog } from './answer-dialog'

export function QuestionAnswerList() {
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null)
  const questions = useAppStore((state) => state.questions)

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {questions.map((question) => (
          <Card key={question.id} className="bg-slate-900/50 border-slate-800 hover:bg-slate-900 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-slate-100">{question.title}</CardTitle>
                  <CardDescription className="text-slate-400">
                    {question.subject} - {question.level}
                  </CardDescription>
                </div>
                <div className="text-xs font-medium text-slate-500">
                  {question.code}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400 mb-4">
                {question.description}
              </p>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setSelectedQuestion(question.id)}
              >
                Responder
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <AnswerDialog
        questionId={selectedQuestion}
        open={!!selectedQuestion}
        onOpenChange={(open) => !open && setSelectedQuestion(null)}
      />
    </>
  )
} 