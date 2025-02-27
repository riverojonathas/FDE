'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, CheckCircle, Clock, Edit, Tag } from 'lucide-react'
import { CorrectionData } from '@/lib/supabase/client'
import { getCorrectionById, saveAgentResult, generateAgentPrompt } from '@/lib/supabase/manual-pipeline'
import { useToast } from '@/components/ui/use-toast'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'

// Componente que exibe informações de texto
const TextAnalysisView = ({ data }: { data: any }) => {
  if (!data) return <div>Análise de texto não disponível</div>

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Legibilidade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.readabilityScore?.toFixed(1) || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">
              {data.readabilityLevel || 'Não disponível'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Formalidade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.formalityScore?.toFixed(1) || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">
              {data.formalityLevel || 'Não disponível'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Vocabulário</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.vocabularyScore?.toFixed(1) || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">
              {data.vocabularyLevel || 'Não disponível'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Coerência</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.coherenceScore?.toFixed(1) || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">
              {data.coherenceLevel || 'Não disponível'}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Problemas Gramaticais</CardTitle>
        </CardHeader>
        <CardContent>
          {data.grammaticalIssues && data.grammaticalIssues.length > 0 ? (
            <ul className="space-y-2">
              {data.grammaticalIssues.map((issue: any, index: number) => (
                <li key={index} className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="font-medium">{issue.type}</p>
                    <p className="text-sm text-muted-foreground">{issue.suggestion}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>Nenhum problema gramatical significativo encontrado.</p>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Análise Detalhada</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Estrutura do Texto</h4>
              <p className="text-sm">{data.structuralAnalysis || 'Não disponível'}</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Análise de Coerência</h4>
              <p className="text-sm">{data.coherenceAnalysis || 'Não disponível'}</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Análise de Vocabulário</h4>
              <p className="text-sm">{data.vocabularyAnalysis || 'Não disponível'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Componente que exibe análise de critérios
const CriteriaAnalysisView = ({ data }: { data: any }) => {
  if (!data) return <div>Análise de critérios não disponível</div>

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Pontuação Global</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{data.overall?.score?.toFixed(1) || 'N/A'}</div>
              <p className="text-sm text-muted-foreground">
                {data.overall?.level || 'Não disponível'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm">{data.overall?.summary || ''}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Competências</CardTitle>
        </CardHeader>
        <CardContent>
          {data.competencies ? (
            <div className="space-y-4">
              {Object.entries(data.competencies).map(([key, value]: [string, any]) => (
                <div key={key} className="border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium">{value.name || key}</div>
                    <Badge variant={value.score >= 7 ? "success" : value.score >= 5 ? "warning" : "destructive"}>
                      {value.score?.toFixed(1) || 'N/A'}
                    </Badge>
                  </div>
                  <p className="text-sm">{value.analysis || 'Não disponível'}</p>
                  {value.suggestions && (
                    <div className="mt-2">
                      <p className="text-xs font-semibold">Sugestões:</p>
                      <ul className="text-xs list-disc pl-4 mt-1">
                        {value.suggestions.map((sugg: string, i: number) => (
                          <li key={i}>{sugg}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p>Nenhuma competência avaliada</p>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Aderência ao Tema</CardTitle>
        </CardHeader>
        <CardContent>
          {data.themeAdherence ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div>Pontuação</div>
                <Badge>{data.themeAdherence.score?.toFixed(1) || 'N/A'}</Badge>
              </div>
              <p className="text-sm">{data.themeAdherence.analysis || 'Não disponível'}</p>
              {data.themeAdherence.keywordPresence && (
                <div className="mt-4">
                  <p className="text-xs font-medium mb-2">Palavras-chave relevantes:</p>
                  <div className="flex flex-wrap gap-2">
                    {data.themeAdherence.keywordPresence.map((word: string, i: number) => (
                      <Badge key={i} variant="outline">
                        <Tag className="h-3 w-3 mr-1" />
                        {word}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p>Análise de aderência ao tema não disponível</p>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Qualidade da Argumentação</CardTitle>
        </CardHeader>
        <CardContent>
          {data.argumentQuality ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div>Pontuação</div>
                <Badge>{data.argumentQuality.score?.toFixed(1) || 'N/A'}</Badge>
              </div>
              <p className="text-sm">{data.argumentQuality.analysis || 'Não disponível'}</p>
              {data.argumentQuality.strengths && (
                <div className="mt-2">
                  <p className="text-xs font-medium">Pontos fortes:</p>
                  <ul className="text-xs list-disc pl-4 mt-1">
                    {data.argumentQuality.strengths.map((item: string, i: number) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {data.argumentQuality.weaknesses && (
                <div className="mt-2">
                  <p className="text-xs font-medium">Pontos a melhorar:</p>
                  <ul className="text-xs list-disc pl-4 mt-1">
                    {data.argumentQuality.weaknesses.map((item: string, i: number) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p>Análise de qualidade da argumentação não disponível</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Componente que exibe resultado de plágio
const PlagiarismView = ({ data }: { data: any }) => {
  if (!data) return <div>Verificação de plágio não disponível</div>

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Resumo de Originalidade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{data.score?.toFixed(1) || 'N/A'}</div>
              <Badge 
                variant={
                  !data.score ? "outline" :
                  data.score >= 8 ? "success" : 
                  data.score >= 5 ? "warning" : 
                  "destructive"
                }
              >
                {data.riskLevel || 'Não avaliado'}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-sm">{data.analysis || ''}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {data.similarTexts && data.similarTexts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Trechos Similares</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.similarTexts.map((item: any, index: number) => (
                <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between mb-2">
                    <div className="font-medium">Trecho {index + 1}</div>
                    <Badge variant={
                      item.similarityScore >= 0.8 ? "destructive" : 
                      item.similarityScore >= 0.6 ? "warning" : 
                      "outline"
                    }>
                      {(item.similarityScore * 100).toFixed(0)}% similar
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-muted p-3 rounded text-sm">
                      <p className="font-medium text-xs mb-1">Texto do Estudante:</p>
                      <p>{item.suspectText}</p>
                    </div>
                    <div className="bg-muted p-3 rounded text-sm">
                      <p className="font-medium text-xs mb-1">Fonte Original:</p>
                      <p>{item.originalText}</p>
                      {item.source && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Fonte: {item.source}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {data.sectionAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle>Análise por Seção</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(data.sectionAnalysis).map(([key, value]: [string, any]) => (
                <div key={key} className="flex justify-between items-center">
                  <div>{key}</div>
                  <div className="flex items-center">
                    <div className="w-40 h-2 bg-muted rounded-full mr-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          value >= 0.8 ? "bg-green-500" : 
                          value >= 0.6 ? "bg-amber-500" : 
                          value >= 0.4 ? "bg-orange-500" : 
                          "bg-red-500"
                        }`}
                        style={{ width: `${value * 100}%` }}
                      />
                    </div>
                    <span className="text-sm">{(value * 100).toFixed(0)}% original</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Componente que exibe feedback
const FeedbackView = ({ data, reviewed }: { data: any, reviewed?: any }) => {
  if (!data) return <div>Feedback não disponível</div>

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Feedback para o Estudante</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 prose prose-sm max-w-none">
            <div>
              <h3 className="text-lg font-medium">Resumo Geral</h3>
              <p>{data.summary || 'Não disponível'}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Pontos Fortes</h3>
              {data.strengths && data.strengths.length > 0 ? (
                <ul>
                  {data.strengths.map((item: string, index: number) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p>Nenhum ponto forte específico destacado</p>
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Áreas para Melhoria</h3>
              {data.weaknesses && data.weaknesses.length > 0 ? (
                <ul>
                  {data.weaknesses.map((item: string, index: number) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p>Nenhuma área específica para melhoria destacada</p>
              )}
            </div>
            
            {data.criteriaSpecific && (
              <div>
                <h3 className="text-lg font-medium">Feedback por Critério</h3>
                <div className="space-y-2">
                  {Object.entries(data.criteriaSpecific).map(([key, value]: [string, any]) => (
                    <div key={key} className="border-b pb-2 last:border-0">
                      <h4 className="font-medium">{key}</h4>
                      <p>{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {data.improvement && (
              <div>
                <h3 className="text-lg font-medium">Sugestões de Melhoria</h3>
                <p>{data.improvement}</p>
              </div>
            )}
            
            {data.resources && data.resources.length > 0 && (
              <div>
                <h3 className="text-lg font-medium">Recursos para Estudo</h3>
                <ul>
                  {data.resources.map((item: any, index: number) => (
                    <li key={index}>
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {item.title}
                      </a>
                      {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {reviewed && (
            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center space-x-2 mb-2">
                <Edit className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">Revisão Manual</p>
              </div>
              <div className="bg-muted p-3 rounded">
                <p className="text-sm">{reviewed.comments || 'Sem comentários adicionais'}</p>
                {reviewed.adjustedScore !== undefined && (
                  <div className="mt-2 pt-2 border-t border-border">
                    <p className="text-sm">
                      Nota ajustada: <span className="font-bold">{reviewed.adjustedScore}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Componente que exibe o texto original
const OriginalTextView = ({ text }: { text: string }) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Texto Original</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-muted rounded whitespace-pre-wrap">
            {text || 'Texto não disponível'}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const AgentExecutionForm = ({ 
  agentId,
  correction,
  onExecute 
}: { 
  agentId: string
  correction: any
  onExecute: (result: any) => void
}) => {
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (correction?.student_responses?.answer && correction?.questions?.[0]) {
      const generatedPrompt = generateAgentPrompt(agentId, {
        text: correction.student_responses.answer,
        question: correction.questions[0]
      })
      setPrompt(generatedPrompt)
    }
  }, [agentId, correction])

  const handleExecute = async () => {
    if (!response.trim()) {
      toast({
        title: 'Resposta obrigatória',
        description: 'Por favor, insira a resposta do agente',
        variant: 'destructive'
      })
      return
    }

    try {
      setIsLoading(true)
      let parsedResponse
      try {
        parsedResponse = JSON.parse(response)
      } catch (err) {
        toast({
          title: 'Erro ao processar resposta',
          description: 'A resposta deve estar em formato JSON válido',
          variant: 'destructive'
        })
        return
      }

      onExecute(parsedResponse)
      toast({
        title: 'Agente executado',
        description: 'O resultado foi salvo com sucesso'
      })
    } catch (err) {
      console.error('Erro ao executar agente:', err)
      toast({
        title: 'Erro ao executar agente',
        description: `${err}`,
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="capitalize">
          {agentId.replace(/-/g, ' ')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Prompt</Label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Cole aqui o prompt para o agente..."
            className="font-mono"
            rows={10}
            readOnly
          />
        </div>

        <div className="space-y-2">
          <Label>Resposta do Agente</Label>
          <Textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Cole aqui a resposta do agente em formato JSON..."
            className="font-mono min-h-[200px]"
            rows={10}
          />
        </div>

        <Button 
          onClick={handleExecute} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : (
            'Processar Resposta'
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

// Componente principal da página
export default function CorrectionPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const correctionId = params.id as string
  
  const [correction, setCorrection] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  useEffect(() => {
    const fetchCorrection = async () => {
      try {
        setLoading(true)
        setError('')
        
        const data = await getCorrectionById(correctionId)
        console.log('Dados da correção:', data)
        
        if (!data) {
          setError('Correção não encontrada')
          return
        }
        
        setCorrection(data)
      } catch (err) {
        console.error('Erro ao buscar correção:', err)
        setError('Erro ao carregar os dados da correção')
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados da correção',
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchCorrection()
  }, [correctionId, toast])
  
  // Exibe carregamento
  if (loading) {
    return (
      <div className="container py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    )
  }
  
  // Exibe erro
  if (error || !correction) {
    return (
      <div className="container py-6">
        <Card className="bg-destructive/10">
          <CardHeader>
            <CardTitle className="text-destructive">Erro ao carregar correção</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error || 'Correção não encontrada'}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => router.push('/dashboard/manual-pipeline')}
            >
              Voltar para Pipeline Manual
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  // Formata a data
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Correção #{correction.id.slice(0, 8)}
          </h1>
          <p className="text-muted-foreground">
            Respondente: {correction.student_name}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            {formatDate(correction.created_at)}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Tag className="h-3 w-3" />
            {correction.pipeline_type}
          </Badge>
          {correction.status_details?.current_step === 'completed' && (
            <Badge variant="success" className="gap-1">
              <CheckCircle className="h-3 w-3" />
              Concluída
            </Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="text" className="space-y-4">
        <TabsList>
          <TabsTrigger value="text">Texto Original</TabsTrigger>
          <TabsTrigger value="analysis">Análise</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Texto do Respondente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap font-mono">
                  {correction.student_responses?.answer}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detalhes da Questão</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Título</h4>
                  <p className="text-sm text-muted-foreground">
                    {correction.questions?.[0]?.title}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium">Descrição</h4>
                  <p className="text-sm text-muted-foreground">
                    {correction.questions?.[0]?.description}
                  </p>
                </div>

                {correction.questions?.[0]?.base_text && (
                  <div>
                    <h4 className="font-medium">Texto Base</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {correction.questions[0].base_text}
                    </p>
                  </div>
                )}

                {correction.questions?.[0]?.expected_answer && (
                  <div>
                    <h4 className="font-medium">Resposta Esperada</h4>
                    <p className="text-sm text-muted-foreground">
                      {correction.questions[0].expected_answer}
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    {correction.questions?.[0]?.subject}
                  </Badge>
                  <Badge variant="outline">
                    Nível: {correction.questions?.[0]?.level}
                  </Badge>
                  {correction.questions?.[0]?.theme && (
                    <Badge variant="outline">
                      Tema: {correction.questions[0].theme}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Status da Análise</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Etapa Atual</h4>
                  <p className="text-sm text-muted-foreground">
                    {correction.status_details?.current_step || 'Não iniciada'}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium">Etapas Concluídas</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {correction.status_details?.completed_steps?.map((step: string) => (
                      <Badge key={step} variant="outline">
                        {step}
                      </Badge>
                    )) || 'Nenhuma etapa concluída'}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium">Última Atualização</h4>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(correction.status_details?.last_update)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Executar Agentes</h3>
            
            <div className="grid grid-cols-1 gap-4">
              {['grammar-analysis', 'coherence-analysis', 'theme-analysis', 'orchestrator'].map((agentId) => {
                const isCompleted = correction.status_details?.completed_steps?.includes(agentId)
                const isCurrent = correction.status_details?.current_step === agentId
                
                return (
                  <div key={agentId} className="relative">
                    {isCompleted && (
                      <Badge 
                        variant="success" 
                        className="absolute -top-2 -right-2 z-10"
                      >
                        <CheckCircle className="h-3 w-3" />
                      </Badge>
                    )}
                    
                    {isCurrent && (
                      <Badge 
                        variant="secondary" 
                        className="absolute -top-2 -right-2 z-10"
                      >
                        <Clock className="h-3 w-3" />
                      </Badge>
                    )}
                    
                    <AgentExecutionForm
                      agentId={agentId}
                      correction={correction}
                      onExecute={async (result) => {
                        try {
                          await saveAgentResult({
                            correction_id: correction.id,
                            agent_id: agentId,
                            result,
                            raw_response: JSON.stringify(result),
                            prompt_used: 'Manual execution',
                            execution_time_ms: 0,
                            model_info: {
                              model: 'manual',
                              provider: 'manual'
                            }
                          })

                          // Recarregar dados da correção
                          const updatedCorrection = await getCorrectionById(correction.id)
                          setCorrection(updatedCorrection)
                        } catch (err) {
                          console.error('Erro ao salvar resultado:', err)
                          toast({
                            title: 'Erro ao salvar resultado',
                            description: `${err}`,
                            variant: 'destructive'
                          })
                        }
                      }}
                    />
                  </div>
                )
              })}
            </div>
          </div>

          {correction.details?.agent_results && Object.keys(correction.details.agent_results).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Resultados dos Agentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(correction.details.agent_results).map(([agentId, result]) => (
                    <div key={agentId} className="space-y-2">
                      <h4 className="font-medium capitalize">{agentId.replace(/-/g, ' ')}</h4>
                      <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto">
                        {JSON.stringify(result, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feedback Final</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Pontuação</h4>
                  <div className="text-2xl font-bold">
                    {correction.score || 0}/100
                  </div>
                </div>

                <div>
                  <h4 className="font-medium">Feedback</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {correction.feedback || 'Feedback ainda não disponível'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 