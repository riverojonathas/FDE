'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { 
  AlertCircle, 
  Check,
  FileText,
  Loader2, 
  UploadCloud 
} from 'lucide-react'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'

import { CorrectionOrchestrator } from '@/lib/langchain/orchestrator'

// Mock de temas/questões disponíveis
const availableQuestions = [
  {
    id: "q1",
    title: "Os desafios da educação no Brasil contemporâneo",
    description: "Discuta os principais desafios enfrentados pela educação brasileira na atualidade, considerando aspectos sociais, econômicos e tecnológicos.",
    type: "redação",
    expectedPoints: [
      "Desigualdade de acesso à educação de qualidade",
      "Formação e valorização dos professores",
      "Infraestrutura das escolas públicas",
      "Implementação de tecnologias educacionais",
      "Currículo e metodologias de ensino"
    ]
  },
  {
    id: "q2",
    title: "O papel das redes sociais na formação da opinião pública",
    description: "Analise como as redes sociais influenciam a formação da opinião pública e as consequências desse fenômeno para a democracia.",
    type: "dissertativa",
    expectedPoints: [
      "Bolhas de informação e polarização",
      "Disseminação de fake news",
      "Algoritmos e personalização de conteúdo",
      "Participação política e ativismo digital",
      "Liberdade de expressão e regulação"
    ]
  },
  {
    id: "q3",
    title: "Sustentabilidade e desenvolvimento econômico",
    description: "Discuta a relação entre sustentabilidade ambiental e desenvolvimento econômico, abordando possíveis conciliações entre esses dois aspectos.",
    type: "argumentativa",
    expectedPoints: [
      "Economia verde e empregos sustentáveis",
      "Tecnologias limpas e inovação",
      "Políticas públicas e acordos internacionais",
      "Consumo consciente e responsabilidade corporativa",
      "Justiça ambiental e social"
    ]
  }
]

// Mock de turmas disponíveis
const availableClasses = [
  { id: "c1", name: "3º Ano A - Ensino Médio" },
  { id: "c2", name: "3º Ano B - Ensino Médio" },
  { id: "c3", name: "2º Ano A - Ensino Médio" },
  { id: "c4", name: "Turma de Redação - Curso Preparatório" }
]

// Mock de alunos disponíveis
const availableStudents = [
  { id: "s1", name: "Ana Silva", classId: "c1" },
  { id: "s2", name: "Bruno Oliveira", classId: "c1" },
  { id: "s3", name: "Carla Pereira", classId: "c2" },
  { id: "s4", name: "Diego Souza", classId: "c2" },
  { id: "s5", name: "Eduarda Santos", classId: "c3" },
  { id: "s6", name: "Fernando Lima", classId: "c3" },
  { id: "s7", name: "Gabriela Costa", classId: "c4" },
  { id: "s8", name: "Henrique Martins", classId: "c4" }
]

export default function NewCorrectionPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  // Estado do formulário
  const [selectedClassId, setSelectedClassId] = useState("")
  const [selectedStudentId, setSelectedStudentId] = useState("")
  const [selectedQuestionId, setSelectedQuestionId] = useState("")
  const [textContent, setTextContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionResult, setSubmissionResult] = useState<any>(null)
  
  // Alunos filtrados pela turma selecionada
  const filteredStudents = selectedClassId 
    ? availableStudents.filter(student => student.classId === selectedClassId)
    : availableStudents
  
  // Questão selecionada
  const selectedQuestion = availableQuestions.find(q => q.id === selectedQuestionId)
  
  // Handler para submissão do formulário
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Em uma implementação real, usaríamos o orquestrador real
      // const orchestrator = new CorrectionOrchestrator();
      // const result = await orchestrator.execute({
      //   text: textContent,
      //   studentId: selectedStudentId,
      //   questionId: selectedQuestionId,
      //   theme: selectedQuestion ? {
      //     title: selectedQuestion.title,
      //     description: selectedQuestion.description,
      //     expectedPoints: selectedQuestion.expectedPoints
      //   } : undefined
      // });
      
      // Simulação de uma chamada assíncrona
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Resultado simulado
      const mockResult = {
        correctionId: `cor_${Date.now()}`,
        completeResult: true,
        metadata: {
          created_at: new Date().toISOString(),
          processing_time: 4.7,
          word_count: textContent.split(/\s+/).filter(Boolean).length
        }
      };
      
      setSubmissionResult(mockResult);
      
      toast({
        title: "Correção concluída com sucesso!",
        description: `Correção ID: ${mockResult.correctionId}`,
        variant: "default",
      });
      
    } catch (error: any) {
      console.error("Erro ao processar correção:", error);
      
      toast({
        title: "Erro ao processar correção",
        description: error.message || "Ocorreu um erro ao processar sua correção. Por favor, tente novamente.",
        variant: "destructive",
      });
      
      setSubmissionResult(null);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Validação do formulário
  const validateForm = () => {
    if (!textContent.trim()) {
      toast({
        title: "Texto é obrigatório",
        description: "Por favor, insira o texto para correção.",
        variant: "destructive",
      });
      return false;
    }
    
    if (textContent.trim().split(/\s+/).length < 50) {
      toast({
        title: "Texto muito curto",
        description: "O texto deve ter no mínimo 50 palavras para uma análise adequada.",
        variant: "destructive",
      });
      return false;
    }
    
    if (!selectedQuestionId) {
      toast({
        title: "Tema não selecionado",
        description: "Por favor, selecione um tema/questão para a correção.",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };
  
  // Resetar o formulário
  const handleReset = () => {
    setSelectedClassId("");
    setSelectedStudentId("");
    setSelectedQuestionId("");
    setTextContent("");
    setSubmissionResult(null);
  };
  
  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nova Correção</h1>
        <p className="text-muted-foreground">
          Submeta um texto para análise e correção automatizada.
        </p>
      </div>
      
      <Tabs defaultValue="manual" className="space-y-4">
        <TabsList>
          <TabsTrigger value="manual">
            <FileText className="h-4 w-4 mr-2" />
            Entrada Manual
          </TabsTrigger>
          <TabsTrigger value="upload">
            <UploadCloud className="h-4 w-4 mr-2" />
            Upload de Arquivo
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="manual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Correção</CardTitle>
              <CardDescription>
                Selecione o aluno e o tema/questão para a correção.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="class">Turma</Label>
                <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma turma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as turmas</SelectItem>
                    {availableClasses.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="student">Aluno</Label>
                <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um aluno" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sem aluno específico</SelectItem>
                    {filteredStudents.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="question">Tema/Questão</Label>
                <Select value={selectedQuestionId} onValueChange={setSelectedQuestionId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um tema" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableQuestions.map(q => (
                      <SelectItem key={q.id} value={q.id}>
                        {q.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedQuestion && (
                <div className="bg-muted p-3 rounded-md border mt-2">
                  <p className="text-sm font-medium">{selectedQuestion.title}</p>
                  <p className="text-sm mt-1">{selectedQuestion.description}</p>
                  {selectedQuestion.expectedPoints && (
                    <div className="mt-2">
                      <p className="text-xs font-medium">Pontos esperados:</p>
                      <ul className="text-xs list-disc pl-5 mt-1">
                        {selectedQuestion.expectedPoints.map((point, index) => (
                          <li key={index}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Texto para Correção</CardTitle>
              <CardDescription>
                Insira o texto a ser analisado e corrigido.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea 
                value={textContent}
                onChange={e => setTextContent(e.target.value)}
                placeholder="Digite ou cole o texto aqui..."
                className="min-h-[300px]"
              />
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>Mínimo de 50 palavras recomendado</span>
                <span>{textContent.split(/\s+/).filter(Boolean).length} palavras</span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleReset}>Limpar Formulário</Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>Enviar para Correção</>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload de Arquivo</CardTitle>
              <CardDescription>
                Upload de arquivos para correção em lote ainda não disponível.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-center text-muted-foreground max-w-md">
                Esta funcionalidade estará disponível em breve. 
                Por enquanto, use a entrada manual para submeter textos para correção.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {submissionResult && (
        <Card className="border-green-500">
          <CardHeader className="bg-green-50 dark:bg-green-950/20">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mr-3">
                <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle>Correção Processada com Sucesso</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium">ID da Correção</p>
                <p className="font-mono">{submissionResult.correctionId}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Tempo de Processamento</p>
                <p>{submissionResult.metadata.processing_time.toFixed(2)} segundos</p>
              </div>
              <div>
                <p className="text-sm font-medium">Total de Palavras</p>
                <p>{submissionResult.metadata.word_count} palavras</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleReset}>
              Nova Correção
            </Button>
            <Button 
              onClick={() => router.push(`/dashboard/corrections/${submissionResult.correctionId}`)}
            >
              Ver Detalhes da Correção
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
} 