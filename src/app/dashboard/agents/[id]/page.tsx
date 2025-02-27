'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, ArrowRight, ClipboardCopy, Code, Copy, Play, Save, Settings } from 'lucide-react'
import { toast } from 'sonner'

// Os agentes que temos implementados
const availableAgents = [
  {
    id: "grammar-analysis",
    name: "Análise Gramatical",
    description: "Analisa o texto em busca de erros gramaticais, ortográficos e de pontuação, fornecendo correções e explicações.",
    icon: "📝",
    color: "blue",
  },
  {
    id: "coherence-analysis",
    name: "Análise de Coerência e Coesão",
    description: "Avalia a estrutura lógica do texto, conexões entre ideias, progressão argumentativa e organização dos parágrafos.",
    icon: "🔄",
    color: "purple",
  },
  {
    id: "theme-analysis",
    name: "Análise de Desenvolvimento do Tema",
    description: "Avalia como o texto aborda e desenvolve o tema proposto, analisando argumentação, recursos utilizados e progressão das ideias.",
    icon: "📊",
    color: "green",
  }
]

// Modelos de IA disponíveis
const availableModels = [
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo", provider: "openai" },
  { value: "gpt-4", label: "GPT-4", provider: "openai" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo", provider: "openai" },
  { value: "claude-3-opus", label: "Claude 3 Opus", provider: "anthropic" },
  { value: "claude-3-sonnet", label: "Claude 3 Sonnet", provider: "anthropic" },
  { value: "claude-3-haiku", label: "Claude 3 Haiku", provider: "anthropic" },
]

// Exemplo de template de prompt
const examplePrompt = `Você é um especialista em análise gramatical de textos em português brasileiro.
  
Analise o seguinte texto e identifique todos os erros gramaticais, ortográficos, de pontuação e de concordância.
Para cada erro encontrado, forneça a correção adequada e uma breve explicação sobre a regra aplicável.

TEXTO:
"{text}"

{additionalInstructions}

Responda no seguinte formato JSON:
{
  "errors": [
    {
      "error": "texto com erro",
      "correction": "texto corrigido",
      "type": "gramática|ortografia|pontuação|concordância",
      "explanation": "explicação breve",
      "severity": "baixa|média|alta",
      "position": {
        "paragraph": 1,
        "sentence": "Frase contendo o erro"
      }
    }
  ],
  "summary": {
    "totalErrors": 0,
    "grammarErrors": 0,
    "spellingErrors": 0,
    "punctuationErrors": 0,
    "agreementErrors": 0,
    "overallQuality": "excelente|bom|regular|ruim|péssimo",
    "readabilityScore": 8.5,
    "suggestions": [
      "Sugestão para melhorar a escrita"
    ]
  }
}

Seja preciso e detalhado na análise. Não invente erros onde não existem.`

// Exemplo de texto para teste
const exampleText = `O texto a seguir contém diversos tipos de erros para análise.

Este texto serve como um exemplo para verificar o funcionamento do sistema de correçao automática. Haveram vários erros intencionáis para que o sistema identifique os problemas.

A educação no Brasil enconta-se em uma fase crítica, com diversos desafios a serem enfrentados as decisões tomadas hoje impactarão diretamente o futuro das proximas gerações.

Entre as principais dificuldades estão a falta de investimento em infraestrutura, a qualidade da formação dos professores e a adessão a novas tecnologias.`

// Componente principal da página
export default function AgentDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const agentId = params.id as string
  
  // Estado para o agente atual
  const [agent, setAgent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Estado para o prompt atual
  const [currentTemplate, setCurrentTemplate] = useState<any>(null)
  const [promptText, setPromptText] = useState('')
  const [templateName, setTemplateName] = useState('')
  const [templateVersion, setTemplateVersion] = useState('1.0')
  const [isDefaultTemplate, setIsDefaultTemplate] = useState(false)
  
  // Estado para configurações do modelo
  const [modelName, setModelName] = useState('gpt-4')
  const [provider, setProvider] = useState('openai')
  const [temperature, setTemperature] = useState(0.3)
  const [maxTokens, setMaxTokens] = useState(2000)
  
  // Estado para teste do prompt
  const [testText, setTestText] = useState(exampleText)
  const [testResult, setTestResult] = useState<any>(null)
  const [testLoading, setTestLoading] = useState(false)
  const [generatedPrompt, setGeneratedPrompt] = useState('')
  
  // Feedback sobre a execução
  const [satisfactionScore, setSatisfactionScore] = useState(0)
  const [feedbackComments, setFeedbackComments] = useState('')
  const [feedbackIssues, setFeedbackIssues] = useState('')
  const [feedbackSuggestions, setFeedbackSuggestions] = useState('')
  
  // Carregar dados do agente
  useEffect(() => {
    const loadAgent = async () => {
      try {
        // Em uma implementação real, buscaríamos da API
        // const response = await fetch(`/api/agents/${agentId}`)
        // const data = await response.json()
        
        // Para demonstração, usamos o mock
        const foundAgent = availableAgents.find(a => a.id === agentId)
        if (!foundAgent) {
          throw new Error('Agente não encontrado')
        }
        
        setAgent(foundAgent)
        
        // Carregar template padrão
        // Em uma implementação real, buscaríamos da API
        // const templateResponse = await fetch(`/api/agents/${agentId}/templates/default`)
        // const templateData = await templateResponse.json()
        
        // Para demonstração, usamos o mock
        setCurrentTemplate({
          id: `template_${foundAgent.id}_default`,
          name: `Template Padrão - ${foundAgent.name}`,
          version: '1.0',
          isDefault: true,
          template: examplePrompt,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          variables: ['text', 'additionalInstructions']
        })
        
        setPromptText(examplePrompt)
        setTemplateName(`Template Padrão - ${foundAgent.name}`)
        setTemplateVersion('1.0')
        setIsDefaultTemplate(true)
        
        setLoading(false)
      } catch (err: any) {
        console.error('Erro ao carregar agente:', err)
        setError(err.message || 'Erro ao carregar dados do agente')
        setLoading(false)
      }
    }
    
    if (agentId) {
      loadAgent()
    }
  }, [agentId])
  
  // Funções para gerenciar o template
  const handleSaveTemplate = async () => {
    try {
      // Em uma implementação real, chamaríamos a API
      // const response = await fetch(`/api/agents/${agentId}/templates`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     name: templateName,
      //     version: templateVersion,
      //     isDefault: isDefaultTemplate,
      //     template: promptText,
      //   }),
      // })
      
      // Para demonstração, apenas atualizamos o estado
      setCurrentTemplate({
        ...currentTemplate,
        name: templateName,
        version: templateVersion,
        isDefault: isDefaultTemplate,
        template: promptText,
        updatedAt: new Date().toISOString()
      })
      
      toast.success('Template salvo com sucesso')
    } catch (err: any) {
      console.error('Erro ao salvar template:', err)
      toast.error('Erro ao salvar template: ' + (err.message || 'Erro desconhecido'))
    }
  }
  
  // Funções para testar o prompt
  const handleGeneratePrompt = () => {
    try {
      // Em uma implementação real, chamaríamos uma função para gerar o prompt
      // baseado no template e nas variáveis
      let generatedPrompt = promptText
      
      // Substituir variáveis básicas
      generatedPrompt = generatedPrompt.replace('{text}', testText)
      generatedPrompt = generatedPrompt.replace('{additionalInstructions}', '')
      
      setGeneratedPrompt(generatedPrompt)
      toast.info('Prompt gerado com sucesso')
    } catch (err: any) {
      console.error('Erro ao gerar prompt:', err)
      toast.error('Erro ao gerar prompt: ' + (err.message || 'Erro desconhecido'))
    }
  }
  
  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt || promptText)
      .then(() => toast.success('Prompt copiado para a área de transferência'))
      .catch(() => toast.error('Erro ao copiar prompt'))
  }
  
  const handleTestPrompt = async () => {
    try {
      setTestLoading(true)
      
      // Em uma implementação real, chamaríamos a API
      // const response = await fetch(`/api/agents/${agentId}/test`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     text: testText,
      //     modelSettings: {
      //       provider,
      //       modelName,
      //       temperature,
      //       maxTokens
      //     }
      //   }),
      // })
      // const data = await response.json()
      
      // Para demonstração, simulamos uma chamada com atraso
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Resultado simulado
      const mockResult = {
        success: true,
        result: {
          errors: [
            {
              error: "correçao",
              correction: "correção",
              type: "ortografia",
              explanation: "A palavra 'correção' é escrita com 'ç', não com 's'.",
              severity: "média",
              position: {
                paragraph: 2,
                sentence: "Este texto serve como um exemplo para verificar o funcionamento do sistema de correçao automática."
              }
            },
            {
              error: "Haveram",
              correction: "Haverá",
              type: "concordância",
              explanation: "O verbo 'haver' no sentido de 'existir' é impessoal, devendo ficar na 3ª pessoa do singular.",
              severity: "alta",
              position: {
                paragraph: 2,
                sentence: "Haveram vários erros intencionáis para que o sistema identifique os problemas."
              }
            },
            {
              error: "intencionáis",
              correction: "intencionais",
              type: "ortografia",
              explanation: "Palavras terminadas em 'al' formam plural em 'ais', sem acento.",
              severity: "média",
              position: {
                paragraph: 2,
                sentence: "Haveram vários erros intencionáis para que o sistema identifique os problemas."
              }
            },
            {
              error: "enconta-se",
              correction: "encontra-se",
              type: "ortografia",
              explanation: "A palavra correta é 'encontra-se', com a letra 'r' após o 't'.",
              severity: "média",
              position: {
                paragraph: 3,
                sentence: "A educação no Brasil enconta-se em uma fase crítica, com diversos desafios a serem enfrentados as decisões tomadas hoje impactarão diretamente o futuro das proximas gerações."
              }
            },
            {
              error: "enfrentados as decisões",
              correction: "enfrentados. As decisões",
              type: "pontuação",
              explanation: "Falta um ponto entre as orações independentes.",
              severity: "alta",
              position: {
                paragraph: 3,
                sentence: "A educação no Brasil enconta-se em uma fase crítica, com diversos desafios a serem enfrentados as decisões tomadas hoje impactarão diretamente o futuro das proximas gerações."
              }
            },
            {
              error: "proximas",
              correction: "próximas",
              type: "ortografia",
              explanation: "A palavra 'próximas' é proparoxítona e deve ser acentuada.",
              severity: "baixa",
              position: {
                paragraph: 3,
                sentence: "A educação no Brasil enconta-se em uma fase crítica, com diversos desafios a serem enfrentados as decisões tomadas hoje impactarão diretamente o futuro das proximas gerações."
              }
            },
            {
              error: "adessão",
              correction: "adesão",
              type: "ortografia",
              explanation: "A grafia correta é 'adesão', com apenas um 's'.",
              severity: "média",
              position: {
                paragraph: 4,
                sentence: "Entre as principais dificuldades estão a falta de investimento em infraestrutura, a qualidade da formação dos professores e a adessão a novas tecnologias."
              }
            }
          ],
          summary: {
            totalErrors: 7,
            grammarErrors: 0,
            spellingErrors: 5,
            punctuationErrors: 1,
            agreementErrors: 1,
            overallQuality: "regular",
            readabilityScore: 7.5,
            suggestions: [
              "Revise a ortografia, especialmente em palavras com letras especiais como 'ç'.",
              "Atente-se à pontuação para separar orações independentes.",
              "Verifique a concordância verbal, especialmente com verbos impessoais."
            ]
          }
        },
        executionTimeMs: 1245,
        modelInfo: {
          provider,
          modelName,
          tokensUsed: 425
        }
      }
      
      setTestResult(mockResult)
      setTestLoading(false)
    } catch (err: any) {
      console.error('Erro ao testar prompt:', err)
      toast.error('Erro ao testar prompt: ' + (err.message || 'Erro desconhecido'))
      setTestLoading(false)
    }
  }
  
  // Funções para submeter feedback
  const handleSubmitFeedback = async () => {
    try {
      if (!testResult) {
        toast.error('Execute o teste antes de enviar feedback')
        return
      }
      
      if (satisfactionScore === 0) {
        toast.error('Selecione um nível de satisfação')
        return
      }
      
      // Em uma implementação real, chamaríamos a API
      // const response = await fetch(`/api/agents/${agentId}/feedback`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     correctionId: testResult.correctionId,
      //     satisfactionScore,
      //     comments: feedbackComments,
      //     issues: feedbackIssues.split('\n').filter(Boolean),
      //     suggestions: feedbackSuggestions,
      //   }),
      // })
      
      toast.success('Feedback enviado com sucesso')
      
      // Resetar o formulário de feedback
      setSatisfactionScore(0)
      setFeedbackComments('')
      setFeedbackIssues('')
      setFeedbackSuggestions('')
    } catch (err: any) {
      console.error('Erro ao enviar feedback:', err)
      toast.error('Erro ao enviar feedback: ' + (err.message || 'Erro desconhecido'))
    }
  }
  
  if (loading) {
    return (
      <div className="container py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-40" />
        </div>
        <Skeleton className="h-[600px] w-full" />
      </div>
    )
  }
  
  if (error || !agent) {
    return (
      <div className="container py-6">
        <div className="flex items-center space-x-2 text-red-600 mb-4">
          <AlertCircle className="h-5 w-5" />
          <p>{error || 'Agente não encontrado'}</p>
        </div>
        <Button onClick={() => router.back()}>Voltar</Button>
      </div>
    )
  }
  
  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-2xl">
            {agent.icon}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{agent.name}</h1>
            <p className="text-muted-foreground">
              {agent.description}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/dashboard/agents')}>
            Voltar para Agentes
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="prompt" className="w-full">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="prompt">
            <Code className="h-4 w-4 mr-2" />
            Prompt Template
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </TabsTrigger>
          <TabsTrigger value="test">
            <Play className="h-4 w-4 mr-2" />
            Testar
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="prompt" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Template do Prompt</CardTitle>
              <CardDescription>
                Edite o template do prompt usado pelo agente para gerar resultados.
                Use {"{variável}"} para indicar campos que serão substituídos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="templateName">Nome do Template</Label>
                    <Input 
                      id="templateName" 
                      value={templateName} 
                      onChange={e => setTemplateName(e.target.value)} 
                      placeholder="Ex: Template Padrão"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="templateVersion">Versão</Label>
                    <Input 
                      id="templateVersion" 
                      value={templateVersion} 
                      onChange={e => setTemplateVersion(e.target.value)} 
                      placeholder="Ex: 1.0"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="promptText">Template</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isDefault"
                        checked={isDefaultTemplate}
                        onCheckedChange={setIsDefaultTemplate}
                      />
                      <Label htmlFor="isDefault">Template Padrão</Label>
                    </div>
                  </div>
                  
                  <Textarea 
                    id="promptText" 
                    value={promptText} 
                    onChange={e => setPromptText(e.target.value)} 
                    placeholder="Insira o template do prompt aqui..."
                    className="font-mono min-h-[400px]"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setPromptText(examplePrompt)}>
                Restaurar Padrão
              </Button>
              <Button onClick={handleSaveTemplate}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Template
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Modelo</CardTitle>
              <CardDescription>
                Configure o modelo de IA que será usado para execução deste agente.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="provider">Provedor</Label>
                <Select value={provider} onValueChange={setProvider}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um provedor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="anthropic">Anthropic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="modelName">Modelo</Label>
                <Select value={modelName} onValueChange={setModelName}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um modelo" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels
                      .filter(model => model.provider === provider)
                      .map(model => (
                        <SelectItem key={model.value} value={model.value}>
                          {model.label}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="temperature">Temperatura: {temperature}</Label>
                  <span className="text-xs text-muted-foreground">
                    {temperature <= 0.3 ? "Mais determinístico" : 
                     temperature >= 0.7 ? "Mais criativo" : 
                     "Equilibrado"}
                  </span>
                </div>
                <Slider
                  id="temperature"
                  min={0}
                  max={1}
                  step={0.1}
                  defaultValue={[temperature]}
                  onValueChange={([value]) => setTemperature(value)}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="maxTokens">Máximo de Tokens: {maxTokens}</Label>
                </div>
                <Slider
                  id="maxTokens"
                  min={500}
                  max={4000}
                  step={100}
                  defaultValue={[maxTokens]}
                  onValueChange={([value]) => setMaxTokens(value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => {
                setModelName('gpt-4');
                setProvider('openai');
                setTemperature(0.3);
                setMaxTokens(2000);
              }}>
                Restaurar Padrão
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="test" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="md:row-span-2">
              <CardHeader>
                <CardTitle>Texto para Teste</CardTitle>
                <CardDescription>
                  Insira um texto para testar o agente de análise gramatical.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea 
                  value={testText} 
                  onChange={e => setTestText(e.target.value)} 
                  placeholder="Insira o texto para teste aqui..."
                  className="min-h-[300px]"
                />
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <div className="flex items-center gap-2 w-full">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={handleGeneratePrompt}
                  >
                    <Code className="h-4 w-4 mr-2" />
                    Gerar Prompt
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleCopyPrompt}
                    disabled={!generatedPrompt}
                  >
                    <ClipboardCopy className="h-4 w-4" />
                  </Button>
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={handleTestPrompt}
                  disabled={testLoading}
                >
                  <Play className="h-4 w-4 mr-2" />
                  {testLoading ? 'Executando...' : 'Executar Teste'}
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Prompt Gerado</CardTitle>
                <CardDescription>
                  Visualize o prompt que será enviado para o modelo de IA.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-md p-4 font-mono text-sm overflow-auto max-h-[200px]">
                  {generatedPrompt || 'Clique em "Gerar Prompt" para visualizar o prompt que será enviado.'}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Modelo de IA</CardTitle>
                <CardDescription>
                  Informe o modelo de IA utilizado para teste manual.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Provedor</Label>
                    <Select defaultValue="openai">
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um provedor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="openai">OpenAI</SelectItem>
                        <SelectItem value="anthropic">Anthropic</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Modelo</Label>
                    <Input placeholder="Ex: GPT-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {testResult && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Resultado do Teste</CardTitle>
                  <CardDescription>
                    Análise retornada pelo agente para o texto fornecido.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-muted p-4 rounded-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            Tempo: {testResult.executionTimeMs}ms
                          </Badge>
                          <Badge variant="outline">
                            Modelo: {testResult.modelInfo.modelName}
                          </Badge>
                          {testResult.modelInfo.tokensUsed && (
                            <Badge variant="outline">
                              Tokens: {testResult.modelInfo.tokensUsed}
                            </Badge>
                          )}
                        </div>
                        <Badge variant={testResult.success ? "success" : "destructive"}>
                          {testResult.success ? "Sucesso" : "Erro"}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="border rounded-md">
                      <div className="p-4 border-b bg-muted font-medium">
                        Resumo da Análise
                      </div>
                      <div className="p-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Total de Erros</p>
                            <p className="text-2xl font-bold">{testResult.result.summary.totalErrors}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Qualidade Geral</p>
                            <p className="text-2xl font-bold capitalize">{testResult.result.summary.overallQuality}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Legibilidade</p>
                            <p className="text-2xl font-bold">{testResult.result.summary.readabilityScore}</p>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <p className="text-sm text-muted-foreground">Sugestões</p>
                          <ul className="list-disc pl-5 mt-2 space-y-1">
                            {testResult.result.summary.suggestions.map((suggestion: string, i: number) => (
                              <li key={i} className="text-sm">{suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-md">
                      <div className="p-4 border-b bg-muted font-medium">
                        Erros Encontrados
                      </div>
                      <div className="divide-y">
                        {testResult.result.errors.map((error: any, i: number) => (
                          <div key={i} className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="font-medium">
                                <span className="text-red-500">{error.error}</span>
                                {" → "}
                                <span className="text-green-500">{error.correction}</span>
                              </div>
                              <Badge>{error.type}</Badge>
                            </div>
                            <p className="text-sm mt-1">{error.explanation}</p>
                            {error.position && (
                              <div className="mt-2 text-xs text-muted-foreground">
                                <p>Localização: Parágrafo {error.position.paragraph}</p>
                                {error.position.sentence && (
                                  <p className="mt-1 italic">"{error.position.sentence}"</p>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Feedback</CardTitle>
                  <CardDescription>
                    Avalie a qualidade da análise realizada pelo agente.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Nível de Satisfação</Label>
                      <div className="flex items-center space-x-2">
                        {[1, 2, 3, 4, 5].map(value => (
                          <Button 
                            key={value}
                            variant={satisfactionScore === value ? "default" : "outline"}
                            size="icon"
                            className="h-10 w-10 rounded-full"
                            onClick={() => setSatisfactionScore(value)}
                          >
                            {value}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="feedbackComments">Comentários</Label>
                      <Textarea 
                        id="feedbackComments" 
                        value={feedbackComments} 
                        onChange={e => setFeedbackComments(e.target.value)} 
                        placeholder="Compartilhe sua opinião sobre os resultados..."
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="feedbackIssues">Problemas Identificados</Label>
                      <Textarea 
                        id="feedbackIssues" 
                        value={feedbackIssues} 
                        onChange={e => setFeedbackIssues(e.target.value)} 
                        placeholder="Liste problemas encontrados (um por linha)..."
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="feedbackSuggestions">Sugestões de Melhoria</Label>
                      <Textarea 
                        id="feedbackSuggestions" 
                        value={feedbackSuggestions} 
                        onChange={e => setFeedbackSuggestions(e.target.value)} 
                        placeholder="Sugestões para melhorar o agente..."
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSubmitFeedback} className="w-full">
                    Enviar Feedback
                  </Button>
                </CardFooter>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 