'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, AlertTriangle, CheckCircle2, Lightbulb, User, Clock, BookOpen, FileQuestion } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { useCorrectionStore } from '@/store/correction-store'
import { Badge } from "@/components/ui/badge"

export function CorrectionOutput() {
  const { currentResult } = useCorrectionStore()

  if (!currentResult) {
    return (
      <Card className="min-h-[500px] flex flex-col items-center justify-center">
        <div className="text-center p-6">
          <FileQuestion className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Nenhuma correção realizada</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Insira uma resposta no campo à esquerda e clique em "Corrigir" para ver os resultados aqui.
          </p>
        </div>
      </Card>
    )
  }

  const { grammar, coherence, theme, score, plagiarism, feedback, metadata } = currentResult

  return (
    <Card className="min-h-[500px]">
      <CardHeader className="pb-2">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle>Resultado da Correção</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={score >= 7 ? "success" : score >= 5 ? "warning" : "destructive"}>
                {score.toFixed(1)}
              </Badge>
            </div>
          </div>
          
          {/* Informações do aluno e da questão */}
          {metadata.name && (
            <div className="flex flex-col md:flex-row gap-x-6 gap-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                <span>{metadata.name}</span>
                {metadata.id && (
                  <span className="text-xs text-muted-foreground/70 ml-1">
                    ({metadata.id})
                  </span>
                )}
                {metadata.class && (
                  <span className="text-xs text-muted-foreground/70 ml-1">
                    - Turma: {metadata.class}
                  </span>
                )}
              </div>
              
              {metadata.id && (
                <div className="flex items-center gap-1">
                  <FileQuestion className="h-3.5 w-3.5" />
                  <span>{metadata.id}</span>
                  {metadata.type && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 ml-1 font-normal">
                      {metadata.type.charAt(0).toUpperCase() + metadata.type.slice(1)}
                    </Badge>
                  )}
                </div>
              )}
              
              {metadata.subject && (
                <div className="flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>
                    {metadata.subject.charAt(0).toUpperCase() + metadata.subject.slice(1)}
                  </span>
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>
                  {new Date(metadata.analyzedAt).toLocaleDateString('pt-BR')} às {new Date(metadata.analyzedAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="resumo">
          <TabsList className="mb-4">
            <TabsTrigger value="resumo">Resumo</TabsTrigger>
            <TabsTrigger value="gramatica">Gramática</TabsTrigger>
            <TabsTrigger value="coerencia">Coerência</TabsTrigger>
            <TabsTrigger value="tema">Tema</TabsTrigger>
            <TabsTrigger value="integridade">Integridade</TabsTrigger>
          </TabsList>
          
          <TabsContent value="resumo" className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Avaliação Geral</h3>
              <p className="text-sm text-muted-foreground">{feedback.general}</p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Gramática</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold">{grammar.score.toFixed(1)}</span>
                    <Progress value={grammar.score * 10} className="w-2/3" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Coerência</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold">{coherence.score.toFixed(1)}</span>
                    <Progress value={coherence.score * 10} className="w-2/3" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Tema</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold">{theme.score.toFixed(1)}</span>
                    <Progress value={theme.score * 10} className="w-2/3" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Integridade</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold">{(10 - plagiarism.score).toFixed(1)}</span>
                    <Progress value={(10 - plagiarism.score) * 10} className="w-2/3" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="gramatica">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Análise Gramatical</h3>
                <p className="text-sm text-muted-foreground">{grammar.feedback}</p>
              </div>
              
              {grammar.errors.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Erros Encontrados</h4>
                  <ul className="space-y-2">
                    {grammar.errors.map((error, i) => (
                      <li key={i} className="text-sm border rounded-md p-2">
                        <span className="font-medium">{error.text}</span>
                        <p className="text-muted-foreground mt-1">{error.suggestion}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="coerencia">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Análise de Coerência e Coesão</h3>
                <p className="text-sm text-muted-foreground">{coherence.feedback}</p>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Pontos Fortes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {coherence.strengths.map((strength, i) => (
                        <li key={i} className="text-sm flex gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Pontos para Melhorar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {coherence.suggestions.map((suggestion, i) => (
                        <li key={i} className="text-sm flex gap-2">
                          <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="tema">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Análise do Desenvolvimento do Tema</h3>
                <p className="text-sm text-muted-foreground">{theme.feedback}</p>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Argumentos Desenvolvidos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {theme.arguments.map((arg, i) => (
                        <li key={i} className="text-sm border rounded-md p-2">
                          <span className="font-medium">{arg.title}</span>
                          <p className="text-muted-foreground mt-1">{arg.description}</p>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Sugestões para Aprimoramento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {theme.suggestions.map((suggestion, i) => (
                        <li key={i} className="text-sm flex gap-2">
                          <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="integridade">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Análise de Integridade</h3>
                <p className="text-sm text-muted-foreground">{plagiarism.feedback}</p>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Detecção de Plágio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {plagiarism.detected ? (
                          <AlertTriangle className="h-5 w-5 text-amber-500" />
                        ) : (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        )}
                        <span className="font-medium">
                          {plagiarism.detected ? "Detectado" : "Não Detectado"}
                        </span>
                      </div>
                      <Badge variant={plagiarism.score > 3 ? "destructive" : "outline"}>
                        {plagiarism.score.toFixed(1)}
                      </Badge>
                    </div>
                    <Progress 
                      value={plagiarism.score * 10} 
                      className={plagiarism.score > 6 ? "bg-red-200" : ""}
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Detecção de Uso de IA</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {plagiarism.aiDetected ? (
                          <AlertTriangle className="h-5 w-5 text-amber-500" />
                        ) : (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        )}
                        <span className="font-medium">
                          {plagiarism.aiDetected ? "Suspeito" : "Não Detectado"}
                        </span>
                      </div>
                      <Badge variant={plagiarism.aiScore > 6 ? "destructive" : "outline"}>
                        {plagiarism.aiScore.toFixed(1)}
                      </Badge>
                    </div>
                    <Progress 
                      value={plagiarism.aiScore * 10} 
                      className={plagiarism.aiScore > 6 ? "bg-red-200" : ""}
                    />
                  </CardContent>
                </Card>
                
                {plagiarism.similarTexts.length > 0 && (
                  <Card className="md:col-span-2">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Similaridade entre Respostas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-4">
                        {plagiarism.similarTexts.map((text, i) => (
                          <li key={i} className="text-sm border rounded-md p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{text.source}</span>
                              <Badge variant={text.similarity > 0.7 ? "destructive" : "outline"}>
                                {(text.similarity * 100).toFixed(0)}%
                              </Badge>
                            </div>
                            <p className="text-muted-foreground text-xs italic mb-2">{text.content}</p>
                            <Progress 
                              value={text.similarity * 100} 
                              className={text.similarity > 0.7 ? "bg-red-200" : ""}
                            />
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 