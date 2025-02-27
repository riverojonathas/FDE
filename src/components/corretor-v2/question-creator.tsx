'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export interface IQuestionConfig {
  title: string
  description: string
  prompt: string
  evaluationCriteria: {
    grammar: string
    coherence: string
    theme: string
  }
  modelConfig: {
    temperature: number
    maxTokens: number
    systemPrompt: string
  }
  chainConfig: {
    useMemory: boolean
    useTools: boolean
    useAgents: boolean
  }
}

export function QuestionCreator() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Criar Nova Questão</CardTitle>
          <CardDescription>
            Configure os parâmetros da questão e critérios de avaliação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
              <TabsTrigger value="criteria">Critérios de Avaliação</TabsTrigger>
              <TabsTrigger value="advanced">Configurações Avançadas</TabsTrigger>
            </TabsList>

            {/* Informações Básicas */}
            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título da Questão</Label>
                <Input id="title" placeholder="Ex: Redação sobre Sustentabilidade" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea 
                  id="description" 
                  placeholder="Descreva o contexto e objetivos da questão..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prompt">Prompt Principal</Label>
                <Textarea 
                  id="prompt" 
                  placeholder="Digite o enunciado da questão..."
                  className="min-h-[150px]"
                />
              </div>
            </TabsContent>

            {/* Critérios de Avaliação */}
            <TabsContent value="criteria" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="grammar-criteria">Critérios Gramaticais</Label>
                <Textarea 
                  id="grammar-criteria" 
                  placeholder="Defina os critérios de avaliação gramatical..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coherence-criteria">Critérios de Coerência</Label>
                <Textarea 
                  id="coherence-criteria" 
                  placeholder="Defina os critérios de coerência e coesão..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme-criteria">Critérios Temáticos</Label>
                <Textarea 
                  id="theme-criteria" 
                  placeholder="Defina os critérios de desenvolvimento do tema..."
                  className="min-h-[100px]"
                />
              </div>
            </TabsContent>

            {/* Configurações Avançadas */}
            <TabsContent value="advanced" className="space-y-6">
              {/* Configurações do Modelo */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Configurações do Modelo</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature</Label>
                  <Input 
                    id="temperature" 
                    type="number" 
                    min="0" 
                    max="1" 
                    step="0.1" 
                    defaultValue="0.7"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-tokens">Max Tokens</Label>
                  <Input 
                    id="max-tokens" 
                    type="number" 
                    min="100" 
                    max="4000" 
                    step="100" 
                    defaultValue="2000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="system-prompt">System Prompt</Label>
                  <Textarea 
                    id="system-prompt" 
                    placeholder="Configure o prompt do sistema para o modelo..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>

              {/* Configurações do LangChain */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Recursos do LangChain</h3>
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Estes recursos avançados permitem uma correção mais precisa e contextualizada
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="use-memory" />
                    <Label htmlFor="use-memory">
                      Usar Memória Conversacional
                      <span className="block text-xs text-muted-foreground">
                        Mantém contexto entre múltiplas correções
                      </span>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="use-tools" />
                    <Label htmlFor="use-tools">
                      Usar Ferramentas Externas
                      <span className="block text-xs text-muted-foreground">
                        Permite consulta a fontes externas durante a correção
                      </span>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="use-agents" />
                    <Label htmlFor="use-agents">
                      Usar Agentes Especializados
                      <span className="block text-xs text-muted-foreground">
                        Divide a correção entre agentes especializados
                      </span>
                    </Label>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline">Cancelar</Button>
            <Button>Salvar Questão</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 