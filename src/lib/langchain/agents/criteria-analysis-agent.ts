import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { PromptTemplate } from 'langchain/prompts'
import { LLMChain } from 'langchain/chains'

export interface CriteriaAnalysisResult {
  competencies: Array<{
    name: string
    score: number
    feedback: string
    examples: string[]
    weightPercent: number // Peso percentual da competência
  }>
  themeAdherence: {
    score: number
    feedback: string
    mainPoints: string[]
    missingPoints: string[]
    keywordPresence: {
      expected: string[]
      found: string[]
      missing: string[]
    }
  }
  argumentQuality: {
    score: number
    feedback: string
    strongArguments: string[]
    weakArguments: string[]
    fallacies: string[]
    evidenceUsage: {
      score: number
      feedback: string
    }
  }
  criteriaSpecificAnalysis: {
    [key: string]: {
      score: number
      feedback: string
      details?: any
    }
  }
  overallScore: number
  processingMetadata?: {
    processingTime?: number
    questionType: string
    appliedCriteria: string[]
    analysisVersion?: string
  }
}

const CRITERIA_ANALYSIS_TEMPLATE = `
# Sistema de Avaliação de Critérios

Você é um avaliador especializado em redações e textos dissertativos.
Sua função é avaliar com precisão o texto de acordo com critérios específicos.

## Texto para análise:
{text}

## Tipo de questão: 
{questionType}

## Critérios específicos a serem aplicados:
{criteria}

## Instruções de Avaliação
Analise o texto considerando:

### 1. Competências esperadas para este tipo de questão
- Identifique as competências relevantes
- Atribua uma pontuação justa para cada competência
- Forneça feedback específico com exemplos do texto
- Indique o peso relativo de cada competência

### 2. Aderência ao tema
- Verifique se o texto aborda o tema proposto
- Identifique pontos principais abordados
- Aponte tópicos importantes não abordados
- Verifique a presença de palavras-chave relevantes

### 3. Qualidade da argumentação
- Avalie a força e relevância dos argumentos
- Identifique argumentos bem desenvolvidos
- Aponte argumentos fracos ou incompletos
- Detecte possíveis falácias argumentativas
- Avalie o uso de evidências e exemplos

### 4. Análise específica para critérios adicionais
- Aplique os critérios específicos informados
- Atribua pontuações individuais para cada critério
- Forneça feedback detalhado para cada aspecto

## Formato da Resposta
Responda APENAS em formato JSON válido com a seguinte estrutura:

{
  "competencies": [
    {
      "name": "nome da competência",
      "score": número de 0 a 10,
      "feedback": "feedback detalhado baseado no texto",
      "examples": ["exemplos específicos extraídos do texto"],
      "weightPercent": número (soma de todas deve ser 100)
    }
  ],
  "themeAdherence": {
    "score": número de 0 a 10,
    "feedback": "análise detalhada da aderência ao tema",
    "mainPoints": ["pontos principais efetivamente abordados no texto"],
    "missingPoints": ["pontos importantes não abordados"],
    "keywordPresence": {
      "expected": ["palavras-chave esperadas para o tema"],
      "found": ["palavras-chave encontradas no texto"],
      "missing": ["palavras-chave importantes não encontradas"]
    }
  },
  "argumentQuality": {
    "score": número de 0 a 10,
    "feedback": "análise da qualidade argumentativa",
    "strongArguments": ["argumentos bem desenvolvidos com citação direta"],
    "weakArguments": ["argumentos que precisam ser melhorados com citação"],
    "fallacies": ["possíveis falácias identificadas"],
    "evidenceUsage": {
      "score": número de 0 a 10,
      "feedback": "avaliação do uso de evidências e exemplos"
    }
  },
  "criteriaSpecificAnalysis": {
    "critério1": {
      "score": número de 0 a 10,
      "feedback": "análise específica para este critério"
    },
    "critério2": {
      "score": número de 0 a 10,
      "feedback": "análise específica para este critério"
    }
  },
  "overallScore": número de 0 a 10 (ponderado conforme os pesos)
}

## Observações importantes:
- Baseie sua avaliação exclusivamente no texto e nos critérios fornecidos
- Seja justo e consistente em suas pontuações
- Forneça exemplos concretos extraídos do texto para fundamentar suas avaliações
- Considere o tipo de questão ao aplicar os critérios
- Leve em conta os pesos relativos de cada competência ao calcular a nota final
- Mantenha a resposta EXCLUSIVAMENTE no formato JSON solicitado
`

export class CriteriaAnalysisAgent {
  private chain: LLMChain
  private startTime: number = 0
  private analysisVersion: string = '1.2.0'

  constructor() {
    const model = new ChatGoogleGenerativeAI({
      modelName: 'gemini-pro',
      maxOutputTokens: 4096, // Aumentado para comportar análises detalhadas
      temperature: 0.25,
      apiKey: process.env.GOOGLE_AI_KEY,
    })

    const prompt = new PromptTemplate({
      template: CRITERIA_ANALYSIS_TEMPLATE,
      inputVariables: ['text', 'questionType', 'criteria'],
    })

    this.chain = new LLMChain({
      llm: model,
      prompt: prompt,
    })
  }

  async analyze(text: string, questionType: string, criteria: string): Promise<CriteriaAnalysisResult> {
    this.startTime = Date.now()
    
    try {
      // Validações preliminares
      if (!text || text.trim().length === 0) {
        throw new Error('O texto para análise está vazio')
      }
      
      if (!questionType || questionType.trim().length === 0) {
        throw new Error('O tipo de questão não foi especificado')
      }
      
      // Executa a análise
      console.log(`Iniciando análise de critérios para questão do tipo: ${questionType}`)
      const result = await this.chain.call({
        text,
        questionType,
        criteria: criteria || 'Sem critérios adicionais especificados'
      })
      
      // Processa o resultado
      const processingTime = Date.now() - this.startTime
      try {
        const analysis = JSON.parse(result.text)
        
        // Validação básica
        if (!analysis.competencies || !analysis.overallScore) {
          throw new Error('O resultado da análise está incompleto')
        }
        
        // Garante que a nota final está no intervalo correto
        analysis.overallScore = Math.max(0, Math.min(10, analysis.overallScore))
        
        // Adiciona metadados
        analysis.processingMetadata = {
          processingTime,
          questionType,
          appliedCriteria: criteria.split('\n').filter(Boolean),
          analysisVersion: this.analysisVersion
        }
        
        return analysis
      } catch (jsonError) {
        console.error('Erro ao processar resultado JSON:', jsonError)
        console.error('Resultado original:', result.text)
        throw new Error('Falha ao processar o resultado da análise de critérios')
      }
    } catch (error: any) {
      console.error('Erro na análise de critérios:', error)
      
      // Recuperação com análise básica após timeout
      if (Date.now() - this.startTime > 20000) {
        return this.generateFallbackAnalysis(text, questionType, criteria)
      }
      
      throw new Error(`Falha ao realizar análise de critérios: ${error.message}`)
    }
  }
  
  // Método para geração de análise básica em caso de falha
  private generateFallbackAnalysis(text: string, questionType: string, criteria: string): CriteriaAnalysisResult {
    console.warn('Gerando análise de critérios fallback devido a erros')
    
    // Extrai critérios mencionados para usar como nomes
    const criteriaLines = criteria.split('\n').filter(Boolean)
    const criteriaNames = criteriaLines.length > 0 
      ? criteriaLines.map(c => c.split(':')[0].trim()) 
      : ['Coerência', 'Coesão', 'Argumentação']
    
    // Análise básica
    return {
      competencies: criteriaNames.map((name, index) => ({
        name,
        score: 5,
        feedback: `Não foi possível avaliar detalhadamente a competência "${name}"`,
        examples: [],
        weightPercent: Math.round(100 / criteriaNames.length)
      })),
      themeAdherence: {
        score: 5,
        feedback: "Não foi possível avaliar detalhadamente a aderência ao tema",
        mainPoints: [],
        missingPoints: [],
        keywordPresence: {
          expected: [],
          found: [],
          missing: []
        }
      },
      argumentQuality: {
        score: 5,
        feedback: "Não foi possível avaliar detalhadamente a qualidade argumentativa",
        strongArguments: [],
        weakArguments: [],
        fallacies: [],
        evidenceUsage: {
          score: 5,
          feedback: "Análise não disponível"
        }
      },
      criteriaSpecificAnalysis: {},
      overallScore: 5,
      processingMetadata: {
        processingTime: Date.now() - this.startTime,
        questionType,
        appliedCriteria: criteriaLines,
        analysisVersion: `${this.analysisVersion}-fallback`
      }
    }
  }
} 