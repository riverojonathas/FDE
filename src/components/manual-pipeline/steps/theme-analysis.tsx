'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Clipboard, ClipboardCheck, AlertCircle, Tag, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { AgentStepBase } from '@/components/manual-pipeline/base/agent-step-base'
import { PromptDisplay } from '../base/prompt-display'
import { useThemeAgentConfiguration } from '@/hooks/use-agent-configuration'
import { AgentConfigurationModal } from '../base/agent-configuration-modal'
import { ThemeReview } from '../review/theme-review'
import { Input } from '@/components/ui/input'
import { ThemeAnalysisService } from '@/lib/services/theme-analysis-service'

// Definindo a interface do resultado da análise temática
export interface ThemeAnalysisResult {
  thematicAnalysis: {
    mainTheme: string;
    themeDevelopment: string;
    relevance: 'Alta' | 'Média' | 'Baixa';
    subthemes: string[];
  };
  argumentativeAnalysis: {
    argumentQuality: 'Excelente' | 'Boa' | 'Regular' | 'Insuficiente';
    evidenceUse: string;
    reasoning: string;
    fallacies: string[];
  };
  adherenceScore: number;
  relevanceScore: number;
  overallScore: number;
  recommendations: string[];
}

// Interface para as props do componente
interface ThemeAnalysisProps {
  step: any;
  text: string;
  previousAnalysis?: any;
  onComplete: (response: ThemeAnalysisResult) => void;
  isActive: boolean;
  hideTextDisplay?: boolean;
  correctionId: string;
}

// Interface para a configuração do agente
interface AgentConfig {
  model: string;
  temperature: number;
  enableThemeDescription: boolean;
  themeTitle: string;
  themeDescription: string;
  enableArgumentAnalysis: boolean;
  enableSubthemes: boolean;
  enableRecommendations: boolean;
}

/**
 * Componente para análise temática de textos
 */
export function ThemeAnalysis({
  step,
  text,
  previousAnalysis,
  onComplete,
  isActive,
  hideTextDisplay = false,
  correctionId
}: ThemeAnalysisProps) {
  console.log('ThemeAnalysis - Renderização inicial');
  console.log('Step recebido:', step);
  console.log('correctionId recebido:', correctionId);
  console.log('isActive:', isActive);
  console.log('previousAnalysis tipo:', typeof previousAnalysis);
  console.log('previousAnalysis disponível:', !!previousAnalysis);
  
  // Estado para rastrear se a análise foi inicializada
  const [analysisInitialized, setAnalysisInitialized] = useState(false);
  
  // Efeito para inicializar a análise quando o componente se torna ativo
  useEffect(() => {
    if (isActive && !analysisInitialized && correctionId) {
      console.log('Inicializando análise temática...');
      initializeAnalysis();
      setAnalysisInitialized(true);
    }
  }, [isActive, analysisInitialized, correctionId]);
  
  // Função para processar a análise gramatical anterior
  const processGrammarAnalysis = useCallback(() => {
    if (!previousAnalysis) {
      console.log('Nenhuma análise gramatical anterior disponível');
      return null;
    }

    try {
      // Garantir que temos um objeto JSON
      const analysis = typeof previousAnalysis === 'string'
        ? JSON.parse(previousAnalysis)
        : previousAnalysis;

      console.log('Análise gramatical processada com sucesso');
      
      // Extrair informações relevantes da análise gramatical
      const grammarInfo = {
        totalErrors: analysis.summary?.totalErrors || 0,
        qualityLevel: analysis.summary?.overallQuality || 'desconhecido',
        mainIssues: analysis.errors?.slice(0, 3).map(e => e.type) || []
      };
      
      console.log('Informações extraídas da análise gramatical:', grammarInfo);
      return grammarInfo;
    } catch (error) {
      console.error('Erro ao processar análise gramatical:', error);
      return null;
    }
  }, [previousAnalysis]);

  // Use este método em useEffect para processar a análise quando necessário
  useEffect(() => {
    if (isActive && previousAnalysis) {
      const grammarInfo = processGrammarAnalysis();
      // Use grammarInfo conforme necessário...
    }
  }, [isActive, previousAnalysis, processGrammarAnalysis]);

  const [response, setResponse] = useState<string>('')
  const [copied, setCopied] = useState(false)
  
  // Hook para configuração do agente
  const { 
    config, 
    updateConfig,
    updateNestedConfig,
    isConfigDialogOpen,
    setIsConfigDialogOpen,
    getConfigSummary
  } = useThemeAgentConfiguration()
  
  /**
   * Função para gerar o prompt com base na configuração
   */
  const generatePrompt = (text: string): string => {
    let prompt = `Você é um especialista em análise de desenvolvimento de temas e argumentação em redações e textos dissertativos.

Analise o seguinte texto quanto à sua abordagem do tema${config.themeConfig.enableThemeDescription ? " proposto" : ""}, qualidade da argumentação, e adequação ao gênero.
Avalie se o texto desenvolve de forma adequada o tema, apresenta argumentos sólidos, e mantém-se fiel à proposta.
`;

    // Adicionar tema se configurado
    if (config.themeConfig.enableThemeDescription && config.themeConfig.themeTitle.trim()) {
      prompt += `\nTEMA:
"${config.themeConfig.themeTitle}"\n`;
      
      if (config.themeConfig.themeDescription.trim()) {
        prompt += `\nDESCRIÇÃO DO TEMA:
"${config.themeConfig.themeDescription}"\n`;
      }
    } else {
      prompt += '\nTEMA: Não especificado\n';
    }

    // Adicionar texto a ser analisado
    prompt += `\nTEXTO:
"${text}"

Responda no seguinte formato JSON:
{
  "thematicAnalysis": {
    "mainTheme": "Tema principal identificado no texto",
    "themeDevelopment": "Análise de como o tema foi desenvolvido",
    "relevance": "Alta|Média|Baixa"${config.analysisOptions.enableSubthemes ? `,
    "subthemes": ["Subtema 1", "Subtema 2"]` : ''}
  }${config.analysisOptions.enableArgumentAnalysis ? `,
  "argumentativeAnalysis": {
    "argumentQuality": "Excelente|Boa|Regular|Insuficiente",
    "evidenceUse": "Análise do uso de evidências",
    "reasoning": "Análise da linha de raciocínio",
    "fallacies": ["Falácia 1", "Falácia 2"]
  }` : ''},
  "adherenceScore": 8.5,
  "relevanceScore": 7.5,
  "overallScore": 8.0${config.analysisOptions.enableRecommendations ? `,
  "recommendations": [
    "Recomendação 1 para melhorar",
    "Recomendação 2 para melhorar"
  ]` : ''}
}`;

    return prompt;
  };
  
  /**
   * Função para validar o formato da resposta
   */
  const validateResponse = (responseText: string): { valid: boolean; message?: string; data?: ThemeAnalysisResult } => {
    console.log('Validando resposta do tema:', responseText.substring(0, 100) + '...');
    
    try {
      // Remover qualquer parte de texto antes ou depois do JSON
      let jsonContent = responseText;
      
      // Extrair o JSON se estiver entre delimitadores, como ```json
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                       responseText.match(/```\n([\s\S]*?)\n```/) ||
                       responseText.match(/\{[\s\S]*\}/);
                        
      if (jsonMatch) {
        jsonContent = jsonMatch[0];
        // Remover marcadores ```json e ``` se presentes
        jsonContent = jsonContent.replace(/```json\n/, '').replace(/```\n/, '').replace(/\n```$/, '');
        console.log('JSON extraído:', jsonContent.substring(0, 100) + '...');
      } else {
        console.warn('Não foi possível extrair JSON claramente. Tentando corrigir o texto...');
      }
      
      // Tentar reparar problemas comuns de JSON
      jsonContent = jsonContent.trim();
      
      // Certificar-se de que começa com { e termina com }
      if (!jsonContent.startsWith('{')) {
        const startIdx = jsonContent.indexOf('{');
        if (startIdx >= 0) {
          jsonContent = jsonContent.substring(startIdx);
        } else {
          jsonContent = '{' + jsonContent;
        }
      }
      
      if (!jsonContent.endsWith('}')) {
        const endIdx = jsonContent.lastIndexOf('}');
        if (endIdx >= 0) {
          jsonContent = jsonContent.substring(0, endIdx + 1);
        } else {
          jsonContent = jsonContent + '}';
        }
      }
      
      // Tentar remover quebras de linha e espaçamentos extras que podem causar problemas
      jsonContent = jsonContent.replace(/\n/g, ' ').replace(/\s+/g, ' ');
      
      // Substituir aspas simples por aspas duplas (alguns modelos usam aspas simples)
      jsonContent = jsonContent.replace(/'/g, '"');
      
      // Tentar adicionar aspas a chaves sem aspas (comum em respostas de modelo)
      jsonContent = jsonContent.replace(/(\{|\,|\:)\s*([a-zA-Z0-9_]+)\s*\:/g, '$1"$2":');
      
      // Tentar adicionar vírgulas faltantes entre objetos (erro comum)
      jsonContent = jsonContent.replace(/\}\s*\{/g, '},{');
      jsonContent = jsonContent.replace(/\"\s*\{/g, '",{');
      jsonContent = jsonContent.replace(/\}\s*\"/g, '},"');
      
      console.log('JSON após correções automáticas:', jsonContent.substring(0, 100) + '...');
      
      // Agora tentar fazer o parse
      let parsedData;
      try {
        parsedData = JSON.parse(jsonContent);
        console.log('JSON parseado com sucesso:', Object.keys(parsedData));
      } catch (parseError) {
        console.error('Ainda há erro ao fazer parse do JSON após correções:', parseError);
        
        // Última tentativa - usar uma abordagem mais bruta
        try {
          // Tentar criar um objeto manualmente a partir do texto
          const mainThemeMatch = responseText.match(/["']mainTheme["']\s*:\s*["']([^"']+)["']/);
          const themeDevelopmentMatch = responseText.match(/["']themeDevelopment["']\s*:\s*["']([^"']+)["']/);
          const relevanceMatch = responseText.match(/["']relevance["']\s*:\s*["']([^"']+)["']/);
          const scoreMatch = responseText.match(/["'](adherenceScore|overallScore)["']\s*:\s*([0-9.]+)/);
          
          if (mainThemeMatch || themeDevelopmentMatch) {
            // Construir manualmente o objeto mínimo necessário
            const manualObject: ThemeAnalysisResult = {
              thematicAnalysis: {
                mainTheme: mainThemeMatch ? mainThemeMatch[1] : 'Tema extraído manualmente',
                themeDevelopment: themeDevelopmentMatch ? themeDevelopmentMatch[1] : 'Desenvolvimento não especificado',
                relevance: relevanceMatch ? relevanceMatch[1] as 'Alta' | 'Média' | 'Baixa' : 'Média',
                subthemes: []
              },
              argumentativeAnalysis: {
                argumentQuality: 'Regular',
                evidenceUse: 'Extraído manualmente devido a erro no formato JSON',
                reasoning: 'Extraído manualmente devido a erro no formato JSON',
                fallacies: []
              },
              adherenceScore: scoreMatch ? parseFloat(scoreMatch[2]) : 7.0,
              relevanceScore: 7.0,
              overallScore: 7.0,
              recommendations: []
            };
            
            console.log('Objeto criado manualmente como fallback:', manualObject);
            return { valid: true, data: manualObject };
          }
        } catch (e) {
          console.error('Falha na extração manual:', e);
        }
        
        return { valid: false, message: `Erro ao analisar JSON: ${parseError}` };
      }
      
      // Verificações mais flexíveis para permitir diferentes formatos
      if (!parsedData.thematicAnalysis) {
        console.warn('Campo thematicAnalysis não encontrado, tentando inferir estrutura...');
        // Tentar criar um objeto de resultado mesmo sem a estrutura exata
        const normalizedData: ThemeAnalysisResult = {
          thematicAnalysis: {
            mainTheme: parsedData.mainTheme || parsedData.theme || 'Tema não especificado',
            themeDevelopment: parsedData.themeDevelopment || parsedData.development || 'Desenvolvimento não especificado',
            relevance: parsedData.relevance || 'Média',
            subthemes: parsedData.subthemes || []
          },
          argumentativeAnalysis: {
            argumentQuality: parsedData.argumentQuality || 'Regular',
            evidenceUse: parsedData.evidenceUse || 'Não avaliado',
            reasoning: parsedData.reasoning || 'Não avaliado',
            fallacies: parsedData.fallacies || []
          },
          adherenceScore: parsedData.adherenceScore || parsedData.adherence || 7,
          relevanceScore: parsedData.relevanceScore || parsedData.relevance || 7,
          overallScore: parsedData.overallScore || parsedData.overall || 7,
          recommendations: parsedData.recommendations || []
        };
        
        console.log('Dados normalizados manualmente:', normalizedData);
        return { valid: true, data: normalizedData };
      }
      
      // Normalizar os dados para garantir a estrutura correta
      const normalizedData: ThemeAnalysisResult = {
        thematicAnalysis: {
          mainTheme: parsedData.thematicAnalysis.mainTheme || 'Não especificado',
          themeDevelopment: parsedData.thematicAnalysis.themeDevelopment || 'Não especificado',
          relevance: parsedData.thematicAnalysis.relevance || 'Média',
          subthemes: config.analysisOptions.enableSubthemes && Array.isArray(parsedData.thematicAnalysis.subthemes) ? 
            parsedData.thematicAnalysis.subthemes : []
        },
        argumentativeAnalysis: config.analysisOptions.enableArgumentAnalysis ? {
          argumentQuality: parsedData.argumentativeAnalysis?.argumentQuality || 'Regular',
          evidenceUse: parsedData.argumentativeAnalysis?.evidenceUse || 'Não analisado',
          reasoning: parsedData.argumentativeAnalysis?.reasoning || 'Não analisado',
          fallacies: Array.isArray(parsedData.argumentativeAnalysis?.fallacies) ? 
            parsedData.argumentativeAnalysis.fallacies : []
        } : {
          argumentQuality: 'Regular',
          evidenceUse: 'Não analisado',
          reasoning: 'Não analisado',
          fallacies: []
        },
        adherenceScore: parsedData.adherenceScore || 7,
        relevanceScore: parsedData.relevanceScore || 7,
        overallScore: parsedData.overallScore || 7,
        recommendations: config.analysisOptions.enableRecommendations && Array.isArray(parsedData.recommendations) ? 
          parsedData.recommendations : []
      };
      
      console.log('Validação bem-sucedida. Dados normalizados:', normalizedData);
      return { valid: true, data: normalizedData };
    } catch (error) {
      console.error('Erro ao validar a resposta:', error);
      return { 
        valid: false, 
        message: `Erro ao validar a resposta: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  };
  
  /**
   * Função para copiar o prompt para o clipboard
   */
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        toast.error('Erro ao copiar para a área de transferência');
      });
  };
  
  /**
   * Função para concluir a análise
   */
  const handleCompleteAnalysis = () => {
    console.log('Tentando concluir análise, comprimento da resposta:', response.length);
    console.log('Resposta (primeiros 100 caracteres):', response.substring(0, 100) + '...');
    
    if (!response.trim()) {
      toast.error('Por favor, insira a resposta do modelo antes de concluir a análise.');
      return;
    }
    
    const validation = validateResponse(response);
    
    if (!validation.valid) {
      console.error('Validação falhou:', validation.message);
      toast.error('A resposta não está no formato JSON esperado. Verifique se o modelo gerou um JSON válido.', {
        duration: 5000
      });
      return;
    }
    
    console.log('Validação passou, enviando dados para completar etapa...');
    toast.success('Salvando a análise temática...', {
      duration: 3000
    });
    
    if (validation.data) {
      try {
        onComplete(validation.data);
      } catch (error) {
        console.error('Erro ao completar análise:', error);
        toast.error('Erro ao salvar análise. Tente novamente.');
      }
    }
  };
  
  /**
   * Função que renderiza a configuração básica do agente
   */
  const renderBasicConfig = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="model">Modelo</Label>
          <Select
            value={config.model}
            onValueChange={(value) => updateConfig('model', value)}
          >
            <SelectTrigger id="model">
              <SelectValue placeholder="Selecione o modelo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-4o">GPT-4o</SelectItem>
              <SelectItem value="gpt-4">GPT-4</SelectItem>
              <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
              <SelectItem value="claude-3-5-sonnet">Claude 3.5 Sonnet</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="temperature">
            Temperatura: {config.temperature.toFixed(1)}
          </Label>
          <Input
            id="temperature"
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={config.temperature}
            onChange={(e) => updateConfig('temperature', parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-2 pt-2">
        <Switch
          id="enableThemeDescription"
          checked={config.themeConfig.enableThemeDescription}
          onCheckedChange={(checked) => updateNestedConfig('themeConfig', 'enableThemeDescription', checked)}
        />
        <Label htmlFor="enableThemeDescription">Definir tema específico</Label>
      </div>
      
      {config.themeConfig.enableThemeDescription && (
        <div className="space-y-4 pl-6">
          <div className="space-y-2">
            <Label htmlFor="themeTitle">Título do tema</Label>
            <Input
              id="themeTitle"
              value={config.themeConfig.themeTitle}
              onChange={(e) => updateNestedConfig('themeConfig', 'themeTitle', e.target.value)}
              placeholder="Ex: Desafios da educação no século XXI"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="themeDescription">Descrição do tema</Label>
            <Textarea
              id="themeDescription"
              value={config.themeConfig.themeDescription}
              onChange={(e) => updateNestedConfig('themeConfig', 'themeDescription', e.target.value)}
              placeholder="Descreva o tema em mais detalhes..."
              rows={3}
            />
          </div>
        </div>
      )}
    </div>
  );
  
  /**
   * Função que renderiza a configuração avançada do agente
   */
  const renderAdvancedConfig = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch
          id="enableArgumentAnalysis"
          checked={config.analysisOptions.enableArgumentAnalysis}
          onCheckedChange={(checked) => updateNestedConfig('analysisOptions', 'enableArgumentAnalysis', checked)}
        />
        <Label htmlFor="enableArgumentAnalysis">Incluir análise de argumentação</Label>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="enableSubthemes"
          checked={config.analysisOptions.enableSubthemes}
          onCheckedChange={(checked) => updateNestedConfig('analysisOptions', 'enableSubthemes', checked)}
        />
        <Label htmlFor="enableSubthemes">Identificar subtemas</Label>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="enableRecommendations"
          checked={config.analysisOptions.enableRecommendations}
          onCheckedChange={(checked) => updateNestedConfig('analysisOptions', 'enableRecommendations', checked)}
        />
        <Label htmlFor="enableRecommendations">Incluir recomendações de melhoria</Label>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="detailLevel">Nível de Detalhes</Label>
        <Select
          value={config.advanced.detailLevel}
          onValueChange={(value: any) => updateNestedConfig('advanced', 'detailLevel', value as 'basic' | 'moderate' | 'comprehensive')}
        >
          <SelectTrigger id="detailLevel">
            <SelectValue placeholder="Nível de detalhes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="basic">Básico</SelectItem>
            <SelectItem value="moderate">Moderado</SelectItem>
            <SelectItem value="comprehensive">Abrangente</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="focusOnTextStructure"
          checked={config.advanced.focusOnTextStructure}
          onCheckedChange={(checked) => updateNestedConfig('advanced', 'focusOnTextStructure', checked)}
        />
        <Label htmlFor="focusOnTextStructure">Foco na estrutura textual</Label>
      </div>
    </div>
  );
  
  /**
   * Função que renderiza o review da análise
   */
  const renderReview = (analysis: ThemeAnalysisResult) => (
    <ThemeReview
      correctionId={step.id}
      analysis={analysis}
      text={text}
      onRequestNewAnalysis={() => {
        // Se quiser permitir uma nova análise, implemente a lógica aqui
      }}
      hideTextDisplay={hideTextDisplay}
    />
  );
  
  /**
   * Função que retorna um resumo da configuração atual
   */
  const getCustomConfigSummaryContent = () => {
    const parts = [];
    
    if (config.themeConfig.enableThemeDescription && config.themeConfig.themeTitle) {
      parts.push(`Tema: "${config.themeConfig.themeTitle.substring(0, 30)}${config.themeConfig.themeTitle.length > 30 ? '...' : ''}"`);
    } else {
      parts.push("Sem tema específico");
    }
    
    const features = [];
    if (config.analysisOptions.enableArgumentAnalysis) features.push("análise de argumentação");
    if (config.analysisOptions.enableSubthemes) features.push("identificação de subtemas");
    if (config.analysisOptions.enableRecommendations) features.push("recomendações");
    
    if (features.length > 0) {
      parts.push(`Com ${features.join(', ')}`);
    }
    
    return parts.join(' | ');
  };
  
  // Se tivermos um resultado anterior, renderizar o review
  if (step.response) {
    return renderReview(typeof step.response === 'string' ? JSON.parse(step.response) as ThemeAnalysisResult : step.response as ThemeAnalysisResult);
  }
  
  return (
    <AgentStepBase
      title="Análise Temática"
      description="Análise do desenvolvimento temático e estrutura argumentativa do texto"
      step={step}
      isActive={isActive}
      onComplete={(response) => {
        const validation = validateResponse(response);
        if (validation.valid && validation.data) {
          onComplete(validation.data);
        }
      }}
      generatePrompt={()=> generatePrompt(text)}
      validateResponse={(text) => validateResponse(text).valid}
      configSummary={getCustomConfigSummaryContent()}
      renderBasicConfig={renderBasicConfig}
      renderAdvancedConfig={renderAdvancedConfig}
      renderReview={(analysis) => renderReview(analysis as ThemeAnalysisResult)}
    />
  )
}

// Função de inicialização da análise temática
const initializeAnalysis = async () => {
  if (!correctionId) {
    console.error("Não é possível inicializar análise temática: correctionId ausente", { correctionId });
    return;
  }
  
  try {
    console.log(`Inicializando análise temática para correção: ${correctionId}`);
    
    // CORREÇÃO: Usar correctionId em vez de step.id
    const response = await ThemeAnalysisService.getOrCreate(correctionId);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || "Falha ao inicializar análise temática");
    }
    
    console.log('Análise temática inicializada com sucesso:', response.data);
  } catch (error) {
    console.error("Erro ao inicializar análise temática:", error);
    toast.error("Erro ao inicializar análise temática. Tente novamente.");
  }
}; 