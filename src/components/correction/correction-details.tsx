import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Correction, StudentResponse } from '@/types/common'

interface CorrectionDetailsProps {
  correction: Correction
  studentResponse: StudentResponse
}

export function CorrectionDetails({ correction, studentResponse }: CorrectionDetailsProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Ver Correção</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>Detalhes da Correção</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-full pr-4">
          <div className="space-y-6">
            {/* Resposta Original do Aluno */}
            <Card>
              <CardHeader>
                <CardTitle>Resposta do Aluno</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-md whitespace-pre-wrap">
                  {studentResponse.answer}
                </div>
              </CardContent>
            </Card>

            {/* Nota e Feedback Geral */}
            <Card>
              <CardHeader>
                <CardTitle>Avaliação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Nota Final:</h4>
                  <div className="text-2xl font-bold">{correction.score}/10</div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Feedback Geral:</h4>
                  <p className="text-muted-foreground">{correction.feedback}</p>
                </div>
              </CardContent>
            </Card>

            {/* Pontos Fortes e Fracos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-green-50/50">
                <CardHeader>
                  <CardTitle className="text-green-700">Pontos Fortes</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-4 space-y-2">
                    {correction.details.strengths.map((strength, i) => (
                      <li key={i} className="text-green-700">{strength}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-red-50/50">
                <CardHeader>
                  <CardTitle className="text-red-700">Pontos a Melhorar</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-4 space-y-2">
                    {correction.details.weaknesses.map((weakness, i) => (
                      <li key={i} className="text-red-700">{weakness}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Sugestões de Melhoria */}
            <Card>
              <CardHeader>
                <CardTitle>Sugestões de Melhoria</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-4 space-y-2">
                  {correction.details.suggestions.map((suggestion, i) => (
                    <li key={i} className="text-blue-700">{suggestion}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Anotações no Texto */}
            <Card>
              <CardHeader>
                <CardTitle>Anotações Específicas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {correction.details.annotations.map((annotation, index) => (
                    <div 
                      key={index}
                      className={`p-4 rounded-md ${
                        annotation.type === 'correct' ? 'bg-green-50 border-l-4 border-green-500' :
                        annotation.type === 'incorrect' ? 'bg-red-50 border-l-4 border-red-500' :
                        'bg-yellow-50 border-l-4 border-yellow-500'
                      }`}
                    >
                      <div className="font-medium mb-2">{annotation.text}</div>
                      <div className={`text-sm ${
                        annotation.type === 'correct' ? 'text-green-700' :
                        annotation.type === 'incorrect' ? 'text-red-700' :
                        'text-yellow-700'
                      }`}>
                        {annotation.comment}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
} 