'use client'

import { useState, useEffect, useCallback } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { IPipelineStep } from '@/types/manual-pipeline'
import { GrammarAnalysisResult } from '@/lib/langchain/agents/grammar-analysis-agent'
import { GrammarReview } from '@/components/manual-pipeline/review/grammar-review'
import { AgentStepBase } from '@/components/manual-pipeline/base/agent-step-base'
import { useGrammarAgentConfiguration } from '@/hooks/use-agent-configuration'
import { GrammarAnalysisService } from '@/lib/services/grammar-analysis-service'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Clipboard, ClipboardCheck, AlertCircle } from 'lucide-react'
import { PromptDisplay } from '../base/prompt-display'
import { AgentConfigurationModal } from '../base/agent-configuration-modal'

interface GrammarAnalysisProps {
  step: IPipelineStep
  text: string
  onComplete: (response: string) => void
  isActive: boolean
  hideTextDisplay?: boolean
  correctionId: string
}

/**
 * Componente de análise gramatical refatorado usando a arquitetura componentizada
 */
export function GrammarAnalysisRefactored({
  step,
  text,
  onComplete,
  isActive,
  hideTextDisplay = false,
  correctionId
}: GrammarAnalysisProps) {
  const {
    config,
    updateConfig,
    updateNestedConfig,
    isConfigDialogOpen,
    setIsConfigDialogOpen,
    getConfigSummary
  } = useGrammarAgentConfiguration()

  const [analysisId, setAnalysisId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [agentStatus, setAgentStatus] = useState<string>("pending")
  const [analysisResults, setAnalysisResults] = useState<GrammarAnalysisResult | null>(null)
  const [analysisInitialized, setAnalysisInitialized] = useState(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [connectionStatus, setConnectionStatus] = useState<{
    checked: boolean;
    success: boolean;
    message: string;
  }>({ checked: false, success: false, message: '' })

  console.log('Renderizando GrammarAnalysisRefactored:', { 
    stepId: step?.id, 
    isActive, 
    correctionId,
    analysisInitialized 
  })

  // Inicializa a análise gramatical no Supabase quando o componente monta
  useEffect(() => {
    if (isActive && !analysisInitialized && correctionId) {
      console.log('Inicializando análise gramatical...')
      initializeAnalysis()
      setAnalysisInitialized(true)
    }
  }, [isActive, analysisInitialized, correctionId])

  // Função para inicializar a análise gramatical
  const initializeAnalysis = async () => {
    console.log('Iniciando inicialização da análise gramatical...');
    console.log('Dados disponíveis:', { 
      correctionId, 
      stepId: step?.id, 
      isActive, 
      serviceDisponível: !!GrammarAnalysisService 
    });
    
    if (!correctionId) {
      console.error('Não é possível inicializar análise gramatical: correctionId ausente');
      toast.error('ID de correção não fornecido. Impossível inicializar análise.');
      return;
    }

    try {
      console.log(`Inicializando análise gramatical para correção: ${correctionId}`);
      
      // Verificar o objeto do serviço antes de chamar
      if (!GrammarAnalysisService || typeof GrammarAnalysisService.getOrCreate !== 'function') {
        throw new Error('Serviço de análise gramatical não disponível ou método getOrCreate não encontrado');
      }
      
      // Usar correctionId em vez de step.id
      const response = await GrammarAnalysisService.getOrCreate(correctionId);
      console.log('Resposta do serviço:', response);
      
      if (!response.success || !response.data) {
        console.error('Detalhes do erro em getOrCreate:', response);
        throw new Error(response.error || 'Falha ao verificar/criar análise gramatical');
      }
      
      console.log('Análise gramatical inicializada com sucesso:', response.data);
      // Possível processamento adicional do resultado...
      
    } catch (error) {
      // Capturar e registrar o erro de forma mais detalhada
      console.error('Erro ao inicializar análise gramatical:', error);
      console.error('Detalhes do erro:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        context: { correctionId, step: step?.id }
      });
      toast.error('Erro ao inicializar análise gramatical. Verifique o console para mais detalhes.');
    }
  };

  // Função para testar a conexão com o Supabase
  const testConnection = async () => {
    console.log('Testando conexão com o Supabase...')
    try {
      const result = await GrammarAnalysisService.testConnection()
      console.log('Resultado do teste de conexão:', result)
      
      setConnectionStatus({
        checked: true,
        success: result.success,
        message: result.message
      })
      
      if (result.success) {
        toast.success('Conexão com o Supabase estabelecida com sucesso!')
      } else {
        toast.error(`Erro na conexão: ${result.message}`)
      }
    } catch (error) {
      console.error('Erro ao testar conexão:', error)
      setConnectionStatus({
        checked: true,
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      })
      toast.error('Falha ao testar conexão com o Supabase')
    }
  }

  const generatePrompt = () => {
    const enabledChecks = Object.entries(config.checkTypes)
      .filter(([_, enabled]) => enabled)
      .map(([type]) => type)
      .join(', ')

    let advancedInstructions = ""
    if (config.advanced.formalityCheck) {
      advancedInstructions += "Analise também o nível de formalidade do texto.\n"
    }
    if (config.advanced.styleConsistency) {
      advancedInstructions += "Verifique a consistência de estilo ao longo do texto.\n"
    }
    
    const detailLevelMap = {
      'basic': 'Forneça apenas os erros principais.',
      'detailed': 'Forneça uma análise detalhada de cada erro.',
      'comprehensive': 'Faça uma análise completa, incluindo sugestões de reformulação para melhorar clareza e fluidez.'
    }
    
    advancedInstructions += detailLevelMap[config.advanced.detailLevel]

    return `
TEXTO A SER ANALISADO:
${text}

INSTRUÇÕES:
Você é um especialista em análise gramatical de textos em português brasileiro.
  
Analise o texto acima e identifique os seguintes tipos de erros:
${config.checkTypes.grammar ? '- Erros gramaticais' : ''}
${config.checkTypes.spelling ? '- Erros ortográficos' : ''}
${config.checkTypes.punctuation ? '- Erros de pontuação' : ''}
${config.checkTypes.agreement ? '- Erros de concordância' : ''}

${config.severityFilter !== 'all' ? `Considere apenas erros de severidade ${config.severityFilter}.` : ''}
${config.readabilityCheck ? 'Inclua uma análise de legibilidade do texto.' : ''}

${advancedInstructions}

Para cada erro encontrado, forneça:
1. O texto com erro
2. A correção sugerida
3. Uma explicação da regra gramatical aplicável
4. A severidade do erro (baixa, média, alta)
5. A localização do erro no texto

IMPORTANTE: Forneça sua análise no seguinte formato JSON:

{
  "errors": [
    {
      "error": "texto com erro",
      "correction": "texto corrigido",
      "type": "gramática|ortografia|pontuação|concordância",
      "explanation": "explicação da regra",
      "severity": "baixa|média|alta",
      "position": {
        "paragraph": number,
        "sentence": "frase contendo o erro"
      }
    }
  ],
  "summary": {
    "totalErrors": number,
    "grammarErrors": number,
    "spellingErrors": number,
    "punctuationErrors": number,
    "agreementErrors": number,
    "overallQuality": "excelente|bom|regular|ruim|péssimo",
    "readabilityScore": number, // 0 a 10
    "suggestions": [
      "sugestão para melhorar a escrita"
    ]
  }
}

Configurações do Agente:
- Modelo: ${config.model}
- Temperatura: ${config.temperature}
- Tipos de Verificação: ${enabledChecks}
- Filtro de Severidade: ${config.severityFilter}
- Análise de Legibilidade: ${config.readabilityCheck ? 'Sim' : 'Não'}
- Tamanho do Contexto: ${config.advanced.contextSize} parágrafos
- Nível de Detalhes: ${config.advanced.detailLevel}
- Verificação de Formalidade: ${config.advanced.formalityCheck ? 'Sim' : 'Não'}
- Consistência de Estilo: ${config.advanced.styleConsistency ? 'Sim' : 'Não'}
`
  }

  const validateResponse = (text: string): boolean => {
    try {
      const json = JSON.parse(text) as GrammarAnalysisResult
      return (
        Array.isArray(json.errors) &&
        json.errors.every(error => 
          typeof error.error === 'string' &&
          typeof error.correction === 'string' &&
          ['gramática', 'ortografia', 'pontuação', 'concordância'].includes(error.type) &&
          typeof error.explanation === 'string' &&
          ['baixa', 'média', 'alta'].includes(error.severity) &&
          typeof error.position.paragraph === 'number' &&
          typeof error.position.sentence === 'string'
        ) &&
        typeof json.summary === 'object' &&
        typeof json.summary.totalErrors === 'number' &&
        typeof json.summary.grammarErrors === 'number' &&
        typeof json.summary.spellingErrors === 'number' &&
        typeof json.summary.punctuationErrors === 'number' &&
        typeof json.summary.agreementErrors === 'number' &&
        ['excelente', 'bom', 'regular', 'ruim', 'péssimo'].includes(json.summary.overallQuality) &&
        typeof json.summary.readabilityScore === 'number' &&
        Array.isArray(json.summary.suggestions)
      )
    } catch {
      return false
    }
  }

  // Configurações básicas do agente
  const renderBasicConfig = () => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Modelo</Label>
          <Select 
            value={config.model} 
            onValueChange={(value) => updateConfig('model', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o modelo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-4">GPT-4</SelectItem>
              <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
              <SelectItem value="claude-2">Claude 2</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Temperatura</Label>
          <Select 
            value={config.temperature.toString()} 
            onValueChange={(value) => updateConfig('temperature', parseFloat(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a temperatura" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">0 - Determinístico</SelectItem>
              <SelectItem value="0.3">0.3 - Conservador</SelectItem>
              <SelectItem value="0.7">0.7 - Balanceado</SelectItem>
              <SelectItem value="1">1.0 - Criativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <Label>Tipos de Verificação</Label>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={config.checkTypes.grammar}
              onCheckedChange={(checked) => 
                updateNestedConfig('checkTypes', 'grammar', checked)
              }
            />
            <Label>Gramática</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={config.checkTypes.spelling}
              onCheckedChange={(checked) => 
                updateNestedConfig('checkTypes', 'spelling', checked)
              }
            />
            <Label>Ortografia</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={config.checkTypes.punctuation}
              onCheckedChange={(checked) => 
                updateNestedConfig('checkTypes', 'punctuation', checked)
              }
            />
            <Label>Pontuação</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={config.checkTypes.agreement}
              onCheckedChange={(checked) => 
                updateNestedConfig('checkTypes', 'agreement', checked)
              }
            />
            <Label>Concordância</Label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Filtro de Severidade</Label>
          <Select 
            value={config.severityFilter} 
            onValueChange={(value: 'all' | 'high' | 'medium' | 'low') => 
              updateConfig('severityFilter', value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o filtro" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Erros</SelectItem>
              <SelectItem value="high">Apenas Alta Severidade</SelectItem>
              <SelectItem value="medium">Média ou Alta Severidade</SelectItem>
              <SelectItem value="low">Apenas Baixa Severidade</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            checked={config.readabilityCheck}
            onCheckedChange={(checked) => 
              updateConfig('readabilityCheck', checked)
            }
          />
          <Label>Incluir Análise de Legibilidade</Label>
        </div>
      </div>
    </>
  )

  // Configurações avançadas do agente
  const renderAdvancedConfig = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Nível de Detalhes</Label>
          <span className="text-xs text-muted-foreground capitalize">{config.advanced.detailLevel}</span>
        </div>
        <Select 
          value={config.advanced.detailLevel} 
          onValueChange={(value: 'basic' | 'detailed' | 'comprehensive') => 
            updateNestedConfig('advanced', 'detailLevel', value)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o nível de detalhes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="basic">Básico - Apenas erros principais</SelectItem>
            <SelectItem value="detailed">Detalhado - Análise completa de erros</SelectItem>
            <SelectItem value="comprehensive">Abrangente - Inclui sugestões de melhoria</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Tamanho do Contexto</Label>
          <span className="text-xs text-muted-foreground">
            {config.advanced.contextSize} {config.advanced.contextSize === 1 ? 'parágrafo' : 'parágrafos'}
          </span>
        </div>
        <Slider 
          value={[config.advanced.contextSize]} 
          min={1} 
          max={5} 
          step={1} 
          onValueChange={(value) => 
            updateNestedConfig('advanced', 'contextSize', value[0])
          }
        />
        <p className="text-xs text-muted-foreground">
          Define quantos parágrafos ao redor de um erro serão considerados para contexto
        </p>
      </div>
      
      <div className="space-y-4 pt-2">
        <Label>Verificações Adicionais</Label>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={config.advanced.formalityCheck}
              onCheckedChange={(checked) => 
                updateNestedConfig('advanced', 'formalityCheck', checked)
              }
            />
            <Label>Nível de Formalidade</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={config.advanced.styleConsistency}
              onCheckedChange={(checked) => 
                updateNestedConfig('advanced', 'styleConsistency', checked)
              }
            />
            <Label>Consistência de Estilo</Label>
          </div>
        </div>
      </div>
    </div>
  )

  // Renderiza a revisão gramatical quando concluída
  const renderReview = (analysis: GrammarAnalysisResult) => (
    <GrammarReview
      correctionId={correctionId}
      analysis={analysis}
      text={text}
      onRequestNewAnalysis={() => {
        // Limpar análise e iniciar nova análise
        if (analysisId) {
          GrammarAnalysisService.updateStatus(analysisId, 'pending')
            .then(() => {
              onComplete('')
              toast.success('Nova análise iniciada')
            })
            .catch(err => {
              console.error('Erro ao iniciar nova análise:', err)
              toast.error('Erro ao iniciar nova análise')
            })
        }
      }}
      hideTextDisplay={hideTextDisplay}
    />
  )

  // Gera um resumo das configurações baseado no estado atual
  const getCustomConfigSummary = () => {
    const checks = Object.entries(config.checkTypes)
      .filter(([_, enabled]) => enabled)
      .map(([type]) => type.charAt(0).toUpperCase() + type.slice(1))
      .join(', ');
    
    return `${config.model} | ${checks} | ${config.advanced.detailLevel}`;
  }

  // Função de submit personalizada para salvar no Supabase
  const handleSubmitResponse = async (responseText: string): Promise<boolean> => {
    if (!analysisId) {
      toast.error('ID de análise não encontrado. Tente reiniciar o processo.')
      return false
    }
    
    try {
      // Atualizar status para "in_progress" enquanto processa
      await GrammarAnalysisService.updateStatus(analysisId, 'in_progress')
      
      // Fazer o parse do JSON da resposta
      const analysisData = JSON.parse(responseText) as GrammarAnalysisResult
      
      // Salvar os resultados da análise
      const { success, error } = await GrammarAnalysisService.saveResults(analysisId, analysisData)
      
      if (!success || error) {
        console.error('Erro ao salvar resultados:', error)
        toast.error('Erro ao salvar resultados da análise')
        return false
      }
      
      // Se for bem-sucedido, notificar o componente pai
      onComplete(responseText)
      
      toast.success('Análise gramatical salva com sucesso')
      return true
    } catch (err) {
      console.error('Erro ao processar resposta:', err)
      toast.error('Erro ao processar resposta da análise')
      return false
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Análise Gramatical</h2>
        <div className="space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={testConnection}
            disabled={loading}
          >
            Diagnosticar Conexão
          </Button>
        </div>
      </div>
      
      {connectionStatus.checked && (
        <div className={`p-4 rounded-md ${connectionStatus.success ? 'bg-green-100' : 'bg-red-100'}`}>
          <p className={connectionStatus.success ? 'text-green-700' : 'text-red-700'}>
            {connectionStatus.message}
          </p>
        </div>
      )}
      
      <AgentStepBase
        title="Correção de Gramática"
        description="Análise detalhada de erros gramaticais, ortográficos, pontuação e concordância"
        step={step}
        isActive={isActive}
        onComplete={handleSubmitResponse}
        generatePrompt={generatePrompt}
        validateResponse={validateResponse}
        configSummary={getCustomConfigSummary()}
        renderBasicConfig={renderBasicConfig}
        renderAdvancedConfig={renderAdvancedConfig}
        renderReview={renderReview}
      />
    </div>
  )
} 