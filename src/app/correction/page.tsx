import { CorrectionForm } from "@/components/correction/correction-form"

export default function CorrectionPage() {
  return (
    <div className="container max-w-2xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Correção com IA</h1>
        <p className="text-muted-foreground mt-2">
          Digite o prompt e a resposta do aluno para receber uma correção automatizada.
        </p>
      </div>
      
      <CorrectionForm />
    </div>
  )
} 