'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GrammarAgent } from '@/components/correction-agents/grammar'
import { Separator } from '@/components/ui/separator'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CorrectionDetailsPageProps {
  params: {
    id: string
  }
}

export default function CorrectionDetailsPage({ params }: CorrectionDetailsPageProps) {
  const correctionId = params.id
  const router = useRouter()
  const { toast } = useToast()
  
  // Estados
  const [correction, setCorrection] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('grammar')
  
  // Buscar os dados da correção
  useEffect(() => {
    const fetchCorrection = async () => {
      try {
        // Aqui você buscaria os dados do Supabase
        // Por enquanto, simularemos uma resposta
        setTimeout(() => {
          setCorrection({
            id: correctionId,
            question_id: '123',
            question: {
              title: 'Como a inteligência artificial impacta o mercado de trabalho?',
              code: 'Q2023-005'
            },
            respondent_identifier: 'Candidato #42',
            text_content: 'A inteligência artificial tem provocado profundas mudanças no mercado de trabalho. Muitas funções estão sendo automatizadas, enquanto novas oportunidades surgem em áreas relacionadas à própria IA. Isso gera tanto otimismo quanto preocupação em diversos setores da economia. Por um lado, a automatização de tarefas repetitivas pode liberar as pessoas para trabalhos mais criativos e estratégicos. Por outro lado, há o temor de desemprego em setores mais suscetíveis à substituição por sistemas inteligentes. O futuro provavelmente envolverá uma reconfiguração do mercado, com valorização de habilidades humanas únicas como criatividade, empatia e pensamento crítico.',
            model: 'gpt-4',
            provider: 'openai',
            status: 'in_progress',
            created_at: new Date().toISOString()
          })
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error('Erro ao buscar dados da correção:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados da correção',
          variant: 'destructive'
        })
        setLoading(false)
      }
    }
    
    fetchCorrection()
  }, [correctionId, toast])
  
  // Renderização de estados de carregamento
  if (loading) {
    return (
      <div className="container py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  if (!correction) {
    return (
      <div className="container py-6 flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-xl font-semibold mb-2">Correção não encontrada</h1>
        <p className="text-muted-foreground mb-4">
          Não foi possível encontrar os dados para esta correção
        </p>
        <Button onClick={() => router.push('/dashboard')}>
          Voltar para o Dashboard
        </Button>
      </div>
    )
  }
  
  return (
    <div className="container py-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Correção #{correction.id.substring(0, 8)}</h1>
          <p className="text-muted-foreground">
            {correction.question.code} - {correction.respondent_identifier}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push('/dashboard')}>
          <ChevronLeft className="mr-1 h-4 w-4" />
          Voltar
        </Button>
      </div>
      
      {/* Informações da Questão e Texto */}
      <Card>
        <CardHeader>
          <CardTitle>{correction.question.title}</CardTitle>
          <CardDescription>
            Texto submetido em {new Date(correction.created_at).toLocaleDateString('pt-BR')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-md overflow-auto max-h-[300px]">
            {correction.text_content}
          </div>
        </CardContent>
      </Card>
      
      {/* Navegação entre agentes */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Agentes de Correção</h2>
          <TabsList>
            <TabsTrigger value="grammar">Gramática</TabsTrigger>
            <TabsTrigger value="technical" disabled>Avaliação Técnica</TabsTrigger>
            <TabsTrigger value="theme" disabled>Tema</TabsTrigger>
            <TabsTrigger value="feedback" disabled>Feedback</TabsTrigger>
            <TabsTrigger value="synthesis" disabled>Síntese</TabsTrigger>
          </TabsList>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <TabsContent value="grammar" className="m-0">
              <GrammarAgent
                correctionId={correction.id}
                textContent={correction.text_content}
                onStatusChange={(status) => {
                  console.log('Status da análise gramatical alterado:', status)
                  // Aqui você poderia atualizar o status geral da correção
                }}
              />
            </TabsContent>
            
            <TabsContent value="technical" className="m-0">
              <div className="flex flex-col items-center justify-center py-10">
                <h3 className="text-lg font-medium mb-2">Avaliação Técnica</h3>
                <p className="text-muted-foreground mb-4 text-center max-w-md">
                  Este agente será implementado em breve para avaliar aspectos técnicos do texto como coerência, argumentação e evidências.
                </p>
                <Button disabled>Implementação Pendente</Button>
              </div>
            </TabsContent>
            
            <TabsContent value="theme" className="m-0">
              <div className="flex flex-col items-center justify-center py-10">
                <h3 className="text-lg font-medium mb-2">Análise de Tema e Conteúdo</h3>
                <p className="text-muted-foreground mb-4 text-center max-w-md">
                  Este agente será implementado em breve para avaliar a aderência ao tema proposto e a qualidade do conteúdo.
                </p>
                <Button disabled>Implementação Pendente</Button>
              </div>
            </TabsContent>
            
            <TabsContent value="feedback" className="m-0">
              <div className="flex flex-col items-center justify-center py-10">
                <h3 className="text-lg font-medium mb-2">Feedback Detalhado</h3>
                <p className="text-muted-foreground mb-4 text-center max-w-md">
                  Este agente será implementado em breve para fornecer feedback detalhado e construtivo sobre o texto.
                </p>
                <Button disabled>Implementação Pendente</Button>
              </div>
            </TabsContent>
            
            <TabsContent value="synthesis" className="m-0">
              <div className="flex flex-col items-center justify-center py-10">
                <h3 className="text-lg font-medium mb-2">Síntese Final</h3>
                <p className="text-muted-foreground mb-4 text-center max-w-md">
                  Este agente será implementado em breve para gerar uma síntese final consolidando todas as análises.
                </p>
                <Button disabled>Implementação Pendente</Button>
              </div>
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
      
      {/* Navegação entre etapas */}
      <div className="flex justify-between items-center pt-4">
        <Button
          variant="outline"
          onClick={() => {
            const tabs = ['grammar', 'technical', 'theme', 'feedback', 'synthesis']
            const currentIndex = tabs.indexOf(activeTab)
            if (currentIndex > 0) {
              setActiveTab(tabs[currentIndex - 1])
            }
          }}
          disabled={activeTab === 'grammar'}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Etapa Anterior
        </Button>
        
        <div className="flex space-x-1">
          {['grammar', 'technical', 'theme', 'feedback', 'synthesis'].map((tab, index) => (
            <div
              key={tab}
              className={cn(
                "h-2 w-8 rounded-full transition-colors",
                activeTab === tab 
                  ? "bg-primary" 
                  : "bg-muted"
              )}
              onClick={() => setActiveTab(tab)}
            />
          ))}
        </div>
        
        <Button
          variant="outline"
          onClick={() => {
            const tabs = ['grammar', 'technical', 'theme', 'feedback', 'synthesis']
            const currentIndex = tabs.indexOf(activeTab)
            if (currentIndex < tabs.length - 1) {
              setActiveTab(tabs[currentIndex + 1])
            }
          }}
          disabled={activeTab === 'synthesis'}
        >
          Próxima Etapa
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
} 