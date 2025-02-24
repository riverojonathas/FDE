'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info, AlertCircle, CheckCircle2 } from 'lucide-react'

interface TestResponse {
  id: string
  content: string
  manualGrade: number
  aiGrade?: number
  feedback?: string
  status: 'pending' | 'success' | 'error'
}

export function PromptCalibration() {
  const [prompt, setPrompt] = useState('')
  const [testResponses, setTestResponses] = useState<TestResponse[]>([
    {
      id: '1',
      content: 'O Brasil é um país localizado na América do Sul...',
      manualGrade: 8.5,
      status: 'pending'
    },
    // Adicione mais respostas de teste
  ])
  const [isCalibrating, setIsCalibrating] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null)

  const handleCalibrate = async () => {
    setIsCalibrating(true)
    try {
      // Simular calibração com cada resposta
      const updatedResponses = await Promise.all(
        testResponses.map(async (response) => {
          try {
            // Aqui você chamaria sua API de IA
            const result = await simulateAIGrading(prompt, response.content)
            return {
              ...response,
              aiGrade: result.grade,
              feedback: result.feedback,
              status: 'success' as const
            }
          } catch (error) {
            return {
              ...response,
              status: 'error' as const,
              feedback: 'Erro ao processar resposta'
            }
          }
        })
      )
      setTestResponses(updatedResponses)
    } finally {
      setIsCalibrating(false)
    }
  }

  // Simulação de chamada à IA
  const simulateAIGrading = async (prompt: string, response: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return {
      grade: Math.random() * 10,
      feedback: 'Feedback da IA sobre a resposta'
    }
  }

  const getAccuracyStats = () => {
    const gradedResponses = testResponses.filter(r => r.aiGrade !== undefined)
    if (gradedResponses.length === 0) return null

    const differences = gradedResponses.map(r => 
      Math.abs((r.aiGrade || 0) - r.manualGrade)
    )
    const avgDiff = differences.reduce((a, b) => a + b, 0) / differences.length
    const maxDiff = Math.max(...differences)

    return {
      accuracy: ((1 - avgDiff / 10) * 100).toFixed(1),
      avgDifference: avgDiff.toFixed(1),
      maxDifference: maxDiff.toFixed(1),
      totalTests: gradedResponses.length
    }
  }

  return (
    <div className="grid gap-6">
      <Tabs defaultValue="editor">
        <TabsList>
          <TabsTrigger value="editor">Editor de Prompt</TabsTrigger>
          <TabsTrigger value="test">Testes</TabsTrigger>
          <TabsTrigger value="results">Resultados</TabsTrigger>
        </TabsList>

        <TabsContent value="editor">
          <Card>
            <CardHeader>
              <CardTitle>Editor de Prompt</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Variáveis Disponíveis</h4>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline">{'{{questao}}'}</Badge>
                    <Badge variant="outline">{'{{resposta}}'}</Badge>
                    <Badge variant="outline">{'{{gabarito}}'}</Badge>
                    <Badge variant="outline">{'{{criterios}}'}</Badge>
                  </div>
                </div>
                <Textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Digite o prompt base para correção..."
                  className="min-h-[300px] font-mono"
                />
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Use as variáveis disponíveis para criar um prompt dinâmico que será preenchido durante a correção.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test">
          <Card>
            <CardHeader>
              <CardTitle>Respostas de Teste</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {testResponses.map((response) => (
                    <div key={response.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">Resposta #{response.id}</Badge>
                        <Badge 
                          variant={
                            response.status === 'success' ? 'default' :
                            response.status === 'error' ? 'destructive' : 
                            'secondary'
                          }
                        >
                          {response.status === 'success' ? 'Corrigido' :
                           response.status === 'error' ? 'Erro' : 
                           'Pendente'}
                        </Badge>
                      </div>
                      <p className="text-sm mb-4">{response.content}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Nota Manual: </span>
                          <span className="font-medium">{response.manualGrade}</span>
                        </div>
                        {response.aiGrade !== undefined && (
                          <div>
                            <span className="text-muted-foreground">Nota IA: </span>
                            <span className="font-medium">{response.aiGrade.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      {response.feedback && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          <p>{response.feedback}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="mt-4">
                <Button 
                  onClick={handleCalibrate}
                  disabled={isCalibrating || !prompt}
                >
                  {isCalibrating ? 'Calibrando...' : 'Testar Prompt'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Resultados da Calibração</CardTitle>
              </CardHeader>
              <CardContent>
                {getAccuracyStats() ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Precisão</div>
                      <div className="text-2xl font-bold">{getAccuracyStats()?.accuracy}%</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Diferença Média</div>
                      <div className="text-2xl font-bold">{getAccuracyStats()?.avgDifference}</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Diferença Máxima</div>
                      <div className="text-2xl font-bold">{getAccuracyStats()?.maxDifference}</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Total de Testes</div>
                      <div className="text-2xl font-bold">{getAccuracyStats()?.totalTests}</div>
                    </div>
                  </div>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Execute os testes para ver os resultados da calibração.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {getAccuracyStats() && (
              <Card>
                <CardHeader>
                  <CardTitle>Recomendações</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Number(getAccuracyStats()?.accuracy) < 90 && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          A precisão está abaixo do ideal (90%). Considere ajustar o prompt.
                        </AlertDescription>
                      </Alert>
                    )}
                    {Number(getAccuracyStats()?.maxDifference) > 2 && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Existem discrepâncias significativas em algumas correções.
                        </AlertDescription>
                      </Alert>
                    )}
                    {Number(getAccuracyStats()?.accuracy) >= 90 && (
                      <Alert className="bg-green-50 border-green-200">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-600">
                          O prompt está bem calibrado e pronto para uso!
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 