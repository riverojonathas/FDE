import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { PromptTemplate } from 'langchain/prompts'
import { LLMChain } from 'langchain/chains'

export interface TextAnalysisResult {
  wordCount: number
  sentenceCount: number
  paragraphCount: number
  grammarScore: number
  coherenceScore: number
  readabilityScore: number
  formalityScore: number
  vocabularyScore: number
  grammarErrors: Array<{
    error: string
    suggestion: string
    context: string
    type: 'ortografia' | 'pontuação' | 'concordância' | 'regência' | 'outro'
    severity: 'alta' | 'média' | 'baixa'
  }>
  structureAnalysis: {
    introductionQuality: number
    developmentQuality: number
    conclusionQuality: number
    paragraphDistribution: string
  }
  suggestions: string[]
  processingMetadata?: {
    processingTime?: number
    confidence?: number
    analysisVersion?: string
  }
}

const TEXT_ANALYSIS_TEMPLATE = `
# Instruções para Análise Textual

Você é um professor especialista em análise textual e correção de redações com vasta experiência.
Você precisa analisar o texto fornecido e fornecer uma avaliação detalhada e criteriosa.

## Texto para análise:
{text}

## Critérios de Análise
Analise o texto considerando os seguintes aspectos:

### 1. Análise estrutural
- Contagem precisa de palavras
- Contagem precisa de frases (delimitadas por pontuação final)
- Contagem precisa de parágrafos
- Distribuição do texto (introdução, desenvolvimento, conclusão)

### 2. Análise gramatical
- Erros de ortografia
- Erros de pontuação
- Erros de concordância verbal e nominal
- Erros de regência verbal e nominal
- Uso adequado de conectivos

### 3. Análise de coerência
- Clareza das ideias apresentadas
- Progressão lógica do texto
- Redundâncias ou repetições desnecessárias
- Contradições internas
- Coesão entre parágrafos e ideias

### 4. Análise de vocabulário e estilo
- Diversidade lexical
- Adequação ao registro formal
- Precisão vocabular
- Clareza na expressão

## Formato da Resposta
Responda APENAS em formato JSON conforme a estrutura abaixo:

{
  "wordCount": número,
  "sentenceCount": número,
  "paragraphCount": número,
  "grammarScore": número de 0 a 10,
  "coherenceScore": número de 0 a 10,
  "readabilityScore": número de 0 a 10,
  "formalityScore": número de 0 a 10,
  "vocabularyScore": número de 0 a 10,
  "grammarErrors": [
    {
      "error": "descrição precisa do erro",
      "suggestion": "sugestão de correção",
      "context": "trecho onde ocorre o erro",
      "type": "ortografia" | "pontuação" | "concordância" | "regência" | "outro",
      "severity": "alta" | "média" | "baixa"
    }
  ],
  "structureAnalysis": {
    "introductionQuality": número de 0 a 10,
    "developmentQuality": número de 0 a 10,
    "conclusionQuality": número de 0 a 10,
    "paragraphDistribution": "descrição da distribuição dos parágrafos"
  },
  "suggestions": [
    "sugestões específicas para melhorar o texto"
  ]
}

## Observações importantes:
- Seja preciso e objetivo em sua análise
- Fundamente todas as avaliações em elementos textuais concretos
- Detecte todos os erros gramaticais relevantes
- Forneça sugestões construtivas e aplicáveis
- Mantenha a resposta EXCLUSIVAMENTE no formato JSON solicitado
`

export class TextAnalysisAgent {
  private chain: LLMChain
  private startTime: number = 0
  private analysisVersion: string = '1.2.0' // Controle de versão da análise

  constructor() {
    const model = new ChatGoogleGenerativeAI({
      modelName: 'gemini-pro',
      maxOutputTokens: 3072, // Aumentado para acomodar análises mais detalhadas
      temperature: 0.2,
      apiKey: process.env.GOOGLE_AI_KEY,
    })

    const prompt = new PromptTemplate({
      template: TEXT_ANALYSIS_TEMPLATE,
      inputVariables: ['text'],
    })

    this.chain = new LLMChain({
      llm: model,
      prompt: prompt,
    })
  }

  async analyze(text: string): Promise<TextAnalysisResult> {
    this.startTime = Date.now()
    
    try {
      // Verificações preliminares
      if (!text || text.trim().length === 0) {
        throw new Error('O texto para análise está vazio')
      }
      
      if (text.trim().length < 50) {
        throw new Error('O texto é muito curto para uma análise completa (mínimo 50 caracteres)')
      }

      // Executa a análise
      const result = await this.chain.call({
        text: text,
      })

      // Processamento e validação do resultado
      const processingTime = Date.now() - this.startTime
      let analysis: TextAnalysisResult
      
      try {
        analysis = JSON.parse(result.text)
        
        // Validação básica dos campos obrigatórios
        if (!analysis.wordCount || !analysis.grammarScore) {
          throw new Error('O resultado da análise está incompleto')
        }
        
        // Adiciona metadados do processamento
        analysis.processingMetadata = {
          processingTime,
          confidence: this.calculateConfidence(analysis),
          analysisVersion: this.analysisVersion
        }
        
        return analysis
      } catch (jsonError) {
        console.error('Erro ao processar resultado JSON:', jsonError)
        console.error('Resultado original:', result.text)
        throw new Error('Falha ao processar o resultado da análise')
      }
    } catch (error) {
      console.error('Erro na análise textual:', error)
      
      // Tentar recuperar de forma mais suave em caso de erro
      if (Date.now() - this.startTime > 15000) {
        // Se já tentou por mais de 15 segundos, retorna um resultado parcial
        return this.generateFallbackAnalysis(text)
      }
      
      throw new Error(`Falha ao realizar análise textual: ${error.message}`)
    }
  }
  
  // Método para calcular confiança na análise com base em heurísticas
  private calculateConfidence(analysis: TextAnalysisResult): number {
    let confidence = 1.0
    
    // Verificar se os valores estão em intervalos esperados
    if (analysis.grammarScore < 0 || analysis.grammarScore > 10) confidence -= 0.2
    if (analysis.coherenceScore < 0 || analysis.coherenceScore > 10) confidence -= 0.2
    
    // Verificar coerência entre contagem de palavras e texto original
    // Implementação simplificada neste exemplo
    
    return Math.max(0.1, confidence) // Garante um mínimo de 0.1
  }
  
  // Método para gerar uma análise básica quando ocorrem erros
  private generateFallbackAnalysis(text: string): TextAnalysisResult {
    console.warn('Gerando análise de fallback devido a erros')
    
    // Análise básica com contagens simples
    const words = text.split(/\s+/).filter(Boolean)
    const sentences = text.split(/[.!?]+/).filter(Boolean)
    const paragraphs = text.split(/\n\s*\n/).filter(Boolean)
    
    return {
      wordCount: words.length,
      sentenceCount: sentences.length,
      paragraphCount: paragraphs.length,
      grammarScore: 5, // Valor neutro
      coherenceScore: 5, // Valor neutro
      readabilityScore: 5, // Valor neutro
      formalityScore: 5, // Valor neutro
      vocabularyScore: 5, // Valor neutro
      grammarErrors: [],
      structureAnalysis: {
        introductionQuality: 5,
        developmentQuality: 5,
        conclusionQuality: 5,
        paragraphDistribution: "Análise não disponível devido a erro"
      },
      suggestions: ["Tente novamente com um texto mais completo"],
      processingMetadata: {
        processingTime: Date.now() - this.startTime,
        confidence: 0.1, // Baixa confiança
        analysisVersion: `${this.analysisVersion}-fallback`
      }
    }
  }
} 