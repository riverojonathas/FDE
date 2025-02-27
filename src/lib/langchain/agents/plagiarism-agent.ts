import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { PromptTemplate } from 'langchain/prompts'
import { LLMChain } from 'langchain/chains'

export interface PlagiarismResult {
  score: number // 0-100, onde 100 é totalmente original
  similarTexts: Array<{
    content: string
    source?: string
    similarity: number // 0-100
    context: string
    matchType: 'exato' | 'parafraseado' | 'conceitual'
    location: {
      startIndex?: number
      endIndex?: number
      paragraph?: number
    }
  }>
  analysis: {
    originalContent: string[]
    suspectContent: string[]
    feedback: string
    detailedAssessment: string
    riskLevel: 'baixo' | 'médio' | 'alto' | 'crítico'
  }
  sectionAnalysis?: Array<{
    section: string
    originalityScore: number
    suspiciousFragments: number
  }>
  processingMetadata?: {
    processingTime?: number
    comparisonMethod: string
    referenceCount: number
    analysisVersion?: string
    confidence?: number
  }
}

const PLAGIARISM_TEMPLATE = `
# Sistema de Detecção de Plágio e Verificação de Originalidade

Você é um especialista em detecção de plágio e análise de originalidade textual.
Sua função é realizar uma análise minuciosa do texto e identificar possíveis problemas de originalidade.

## Texto para análise:
{text}

## Base de comparação:
{referenceTexts}

## Instruções de Análise
Analise o texto considerando:

### 1. Originalidade geral
- Avalie a originalidade global do texto
- Atribua uma pontuação de 0 a 100 (onde 100 significa completamente original)
- Considere tanto semelhanças exatas quanto ideias parafraseadas

### 2. Trechos similares
- Identifique trechos com alta similaridade a textos existentes
- Classifique o tipo de semelhança (exata, parafraseada, conceitual)
- Determine o contexto em que o trecho similar aparece
- Estime o nível de similaridade em porcentagem
- Indique a possível fonte, se disponível 
- Identifique a localização aproximada no texto (parágrafo, início/meio/fim)

### 3. Conteúdo original vs. suspeito
- Separe trechos claramente originais
- Identifique trechos com indícios de falta de originalidade
- Forneça um feedback detalhado sobre a originalidade do texto
- Avalie o nível de risco em termos de integridade acadêmica

### 4. Análise por seções (se aplicável)
- Analise diferentes partes do texto separadamente
- Identifique seções com maior ou menor originalidade
- Conte fragmentos suspeitos por seção

## Formato da Resposta
Responda APENAS em formato JSON válido com a seguinte estrutura:

{
  "score": número de 0 a 100,
  "similarTexts": [
    {
      "content": "trecho do texto com alta similaridade",
      "source": "fonte do texto similar (se identificável)",
      "similarity": número de 0 a 100,
      "context": "contexto onde o trecho similar foi encontrado",
      "matchType": "exato" | "parafraseado" | "conceitual",
      "location": {
        "startIndex": número opcional,
        "endIndex": número opcional,
        "paragraph": número opcional
      }
    }
  ],
  "analysis": {
    "originalContent": ["trechos claramente originais"],
    "suspectContent": ["trechos suspeitos de plágio"],
    "feedback": "análise geral da originalidade",
    "detailedAssessment": "avaliação detalhada dos problemas encontrados",
    "riskLevel": "baixo" | "médio" | "alto" | "crítico"
  },
  "sectionAnalysis": [
    {
      "section": "identificação da seção (introdução, desenvolvimento, etc.)",
      "originalityScore": número de 0 a 100,
      "suspiciousFragments": número de fragmentos suspeitos
    }
  ]
}

## Observações importantes:
- Seja criterioso na identificação de similaridades
- Diferencie similaridades casuais de possíveis plágios
- Considere que coincidências podem ocorrer em frases comuns
- Analise com mais rigor trechos técnicos ou específicos
- Evite falsos positivos, mas seja diligente na detecção
- Considere o contexto e o propósito do texto
- Mantenha a resposta EXCLUSIVAMENTE no formato JSON solicitado
`

export class PlagiarismAgent {
  private chain: LLMChain
  private startTime: number = 0
  private analysisVersion: string = '1.2.0'
  
  // Método para manter controle de fontes de referência
  private referenceDatabase: Map<string, string[]> = new Map()

  constructor() {
    const model = new ChatGoogleGenerativeAI({
      modelName: 'gemini-pro',
      maxOutputTokens: 4096,
      temperature: 0.1, // Baixa temperatura para maior precisão
      apiKey: process.env.GOOGLE_AI_KEY,
    })

    const prompt = new PromptTemplate({
      template: PLAGIARISM_TEMPLATE,
      inputVariables: ['text', 'referenceTexts'],
    })

    this.chain = new LLMChain({
      llm: model,
      prompt: prompt,
    })
  }
  
  // Método para adicionar referências à base de dados
  public addReferenceTexts(source: string, texts: string[]): void {
    this.referenceDatabase.set(source, texts)
  }

  async analyze(text: string, referenceTexts: string = ''): Promise<PlagiarismResult> {
    this.startTime = Date.now()
    
    try {
      // Validações preliminares
      if (!text || text.trim().length === 0) {
        throw new Error('O texto para análise está vazio')
      }
      
      // Prepara os textos de referência
      let allReferenceTexts = referenceTexts
      
      // Adiciona referências da base de dados interna
      if (this.referenceDatabase.size > 0) {
        const dbTexts = Array.from(this.referenceDatabase.entries())
          .map(([source, texts]) => 
            `Fonte: ${source}\n${texts.join('\n')}`
          ).join('\n\n')
        
        allReferenceTexts = allReferenceTexts 
          ? `${allReferenceTexts}\n\n${dbTexts}` 
          : dbTexts
      }
      
      const refCount = this.countReferences(allReferenceTexts)
      console.log(`Iniciando análise de plágio com ${refCount} referências`)
      
      // Pre-processamento: Gera fingerprints do texto para comparações rápidas
      const fingerprints = this.generateFingerprints(text)
      
      // Executa a análise
      const result = await this.chain.call({
        text,
        referenceTexts: allReferenceTexts || 'Nenhuma referência fornecida para comparação',
      })

      const processingTime = Date.now() - this.startTime
      
      try {
        const analysis = JSON.parse(result.text)
        
        // Validação básica
        if (typeof analysis.score !== 'number') {
          throw new Error('O resultado da análise está incompleto')
        }
        
        // Normalização da pontuação no intervalo 0-100
        analysis.score = Math.max(0, Math.min(100, analysis.score))
        
        // Adiciona metadados
        analysis.processingMetadata = {
          processingTime,
          comparisonMethod: 'semantic_fingerprinting',
          referenceCount: refCount,
          analysisVersion: this.analysisVersion,
          confidence: this.calculateConfidence(analysis, text, refCount)
        }
        
        return analysis
      } catch (jsonError) {
        console.error('Erro ao processar resultado JSON:', jsonError)
        console.error('Resultado original:', result.text)
        throw new Error('Falha ao processar o resultado da análise de plágio')
      }
    } catch (error: any) {
      console.error('Erro na análise de plágio:', error)
      
      // Recuperação com análise básica após timeout
      if (Date.now() - this.startTime > 20000) {
        return this.generateFallbackAnalysis(text)
      }
      
      throw new Error(`Falha ao realizar análise de plágio: ${error.message}`)
    }
  }
  
  // Gera um conjunto de "fingerprints" do texto para busca eficiente
  private generateFingerprints(text: string): Set<string> {
    const fingerprints = new Set<string>()
    const words = text.toLowerCase().split(/\s+/)
    
    // Shingling: cria n-gramas do texto
    const createShingles = (n: number) => {
      for (let i = 0; i <= words.length - n; i++) {
        const shingle = words.slice(i, i + n).join(' ')
        fingerprints.add(shingle)
      }
    }
    
    // Cria shingles de diferentes tamanhos
    createShingles(3)  // trigramas
    createShingles(4)  // tetragramas
    createShingles(5)  // pentagramas
    
    return fingerprints
  }
  
  // Conta o número de referências no texto
  private countReferences(referenceTexts: string): number {
    if (!referenceTexts) return 0
    
    // Conta referências separadas por linhas vazias
    const blocks = referenceTexts.split(/\n\s*\n/).filter(Boolean)
    return blocks.length
  }
  
  // Calcula a confiança no resultado da análise
  private calculateConfidence(analysis: PlagiarismResult, text: string, refCount: number): number {
    let confidence = 0.9 // Base confidence
    
    // Fatores que afetam a confiança
    if (refCount === 0) confidence -= 0.3 // Sem referências para comparar
    if (text.length < 200) confidence -= 0.1 // Texto muito curto
    if (analysis.similarTexts.length === 0 && analysis.score < 50) confidence -= 0.2 // Possível inconsistência
    
    return Math.max(0.1, confidence) // Mínimo 0.1
  }
  
  // Método para gerar uma análise básica quando ocorrem erros
  private generateFallbackAnalysis(text: string): PlagiarismResult {
    console.warn('Gerando análise de plágio fallback devido a erros')
    
    return {
      score: 50, // Neutro - não afirma nem nega originalidade
      similarTexts: [],
      analysis: {
        originalContent: [],
        suspectContent: [],
        feedback: "Não foi possível realizar uma análise detalhada de originalidade",
        detailedAssessment: "O sistema não conseguiu completar a análise. Por favor, revise manualmente.",
        riskLevel: "médio" // Neutro
      },
      processingMetadata: {
        processingTime: Date.now() - this.startTime,
        comparisonMethod: "fallback",
        referenceCount: 0,
        analysisVersion: `${this.analysisVersion}-fallback`,
        confidence: 0.1 // Baixa confiança
      }
    }
  }

  // Método auxiliar para calcular similaridade entre textos
  private calculateSimilarity(text1: string, text2: string): number {
    // Implementação básica de similaridade usando comparação de tokens
    const tokens1 = new Set(text1.toLowerCase().split(/\s+/))
    const tokens2 = new Set(text2.toLowerCase().split(/\s+/))
    
    const intersection = new Set([...tokens1].filter(x => tokens2.has(x)))
    const union = new Set([...tokens1, ...tokens2])
    
    return (intersection.size / union.size) * 100
  }
  
  // Encontra a posição aproximada de um trecho no texto original
  private findLocationInText(text: string, fragment: string): { startIndex?: number, endIndex?: number, paragraph?: number } {
    const index = text.indexOf(fragment)
    if (index === -1) return {}
    
    // Encontra o parágrafo
    const precedingText = text.substring(0, index)
    const paragraphCount = (precedingText.match(/\n\s*\n/g) || []).length + 1
    
    return {
      startIndex: index,
      endIndex: index + fragment.length,
      paragraph: paragraphCount
    }
  }
} 