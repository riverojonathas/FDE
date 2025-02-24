import { QuestionAnswerList } from "@/components/answer/question-answer-list"

export default function AnswerPage() {
  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Responder Questões</h1>
        <p className="text-muted-foreground mt-2">
          Selecione uma questão para responder e receber feedback da IA.
        </p>
      </div>
      
      <QuestionAnswerList />
    </div>
  )
} 