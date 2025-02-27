import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { PromptTemplate } from 'langchain/prompts'
import { LLMChain } from 'langchain/chains'
import { TextAnalysisResult } from './text-analysis-agent'
import { CriteriaAnalysisResult } from './criteria-analysis-agent'
import { PlagiarismResult } from './plagiarism-agent'

export interface FeedbackResult {
  finalScore: number
  status: 'approved' | 'needs_review' | 'rejected'
  summary: {
    strengths: string[]
    weaknesses: string[]
    keyPoints: string[]
    improvement: string
  }
  detailedFeedback: {
    grammar: string
    content: string
    structure: string
    originality: string
    criteriaSpecific: Record<string, string>
  }
  recommendations: {
    priority: string[]
    additional: string[]
    resources: Array<{
      type: 'livro' | 'artigo' | 'vídeo' | 'exercício' | 'outro'
      title: string
      description: string
      link?: string
    }>
  }
  performanceComparison?: {
    previousSubmissions?: {
      improvement: number
      comparedToId?: string
      analysis: string
    }
    classBenchmark?: {
      percentile: number
      averageClassScore: number
      analysis: string
    }
  }
  teacherNotes?: string
  processingMetadata?: {
    processingTime?: number
    feedbackLevel: 'básico' | 'detalhado' | 'avançado'
    studentName: string
    questionType: string
    analysisVersion?: string
  }
}

const FEEDBACK_TEMPLATE = `
# Sistema de Feedback Educacional Personalizado

Você é um professor experiente especializado em fornecer feedback construtivo e detalhado para redações e textos dissertativos.
Sua função é analisar os resultados das avaliações anteriores e criar um feedback completo, personalizado e pedagogicamente útil.

## Dados de análise

### Análise textual:
{textAnalysis}

### Análise de critérios:
{criteriaAnalysis}

### Análise de plágio:
{plagiarismAnalysis}

### Informações do aluno:
{studentInfo}

## Instruções para geração de feedback

### 1. Resumo e pontuação
- Calcule uma nota final considerando todas as análises
- Determine o status do texto (aprovado, necessita revisão, reprovado)
- Identifique pontos fortes e fracos destacados
- Forneça um resumo claro e objetivo

### 2. Feedback detalhado
- Elabore feedback sobre aspectos gramaticais
- Avalie o conteúdo e argumentação
- Analise a estrutura e organização do texto
- Comente sobre originalidade e uso de fontes
- Forneça feedback específico para cada critério avaliado

### 3. Recomendações práticas
- Priorize as áreas que precisam de atenção imediata
- Sugira estratégias adicionais de melhoria
- Recomende recursos educacionais relevantes

### 4. Análise comparativa (quando aplicável)
- Compare com submissões anteriores do mesmo aluno
- Posicione o desempenho em relação à média da turma

### 5. Personalização
- Adapte o tom e o nível de detalhe ao perfil do aluno
- Seja construtivo e motivador
- Equilibre críticas com reconhecimento de pontos positivos

## Formato da Resposta
Responda APENAS em formato JSON válido com a seguinte estrutura:

{
  "finalScore": número de 0 a 10,
  "status": "approved" | "needs_review" | "rejected",
  "summary": {
    "strengths": ["pontos fortes do texto"],
    "weaknesses": ["pontos a melhorar"],
    "keyPoints": ["pontos-chave da análise"],
    "improvement": "resumo da evolução em relação a trabalhos anteriores (quando aplicável)"
  },
  "detailedFeedback": {
    "grammar": "feedback detalhado sobre aspectos gramaticais",
    "content": "feedback sobre o conteúdo e argumentação",
    "structure": "feedback sobre a estrutura e organização",
    "originality": "feedback sobre originalidade e uso de fontes",
    "criteriaSpecific": {
      "critério1": "feedback específico para este critério",
      "critério2": "feedback específico para este critério"
    }
  },
  "recommendations": {
    "priority": ["recomendações prioritárias"],
    "additional": ["recomendações adicionais"],
    "resources": [
      {
        "type": "tipo de recurso",
        "title": "título do recurso",
        "description": "descrição breve",
        "link": "link opcional"
      }
    ]
  },
  "performanceComparison": {
    "previousSubmissions": {
      "improvement": número indicando melhoria percentual,
      "comparedToId": "identificador da submissão anterior",
      "analysis": "análise comparativa detalhada"
    },
    "classBenchmark": {
      "percentile": número indicando posição relativa,
      "averageClassScore": nota média da turma,
      "analysis": "análise em relação à turma"
    }
  },
  "teacherNotes": "observações adicionais do professor (opcional)"
}

## Observações importantes:
- Seja específico e forneça exemplos concretos do texto
- Mantenha um tom construtivo e encorajador
- Forneça sugestões práticas e viáveis
- Priorize as áreas mais críticas para melhoria
- Personalize o feedback considerando as informações do aluno
- Inclua recursos educacionais relevantes e acessíveis
- Mantenha a resposta EXCLUSIVAMENTE no formato JSON solicitado
`

export class FeedbackAgent {
  private chain: LLMChain
  private startTime: number = 0
  private analysisVersion: string = '1.2.0'
  
  // Base de dados de recursos educacionais para recomendações
  private resourceDatabase: Array<{
    type: 'livro' | 'artigo' | 'vídeo' | 'exercício' | 'outro'
    title: string
    description: string
    link?: string
    tags: string[]
  }> = [
    {
      type: 'livro',
      title: 'Comunicação em Prosa Moderna',
      description: 'Guia completo para escrita clara e eficaz',
      tags: ['redação', 'gramática', 'estrutura']
    },
    {
      type: 'vídeo',
      title: 'Técnicas de Argumentação',
      description: 'Aprenda a construir argumentos sólidos',
      link: 'https://example.com/argumentacao',
      tags: ['argumentação', 'redação', 'dissertativa']
    },
    {
      type: 'exercício',
      title: 'Prática de Coesão Textual',
      description: 'Exercícios para melhorar a conexão entre ideias',
      link: 'https://example.com/coesao',
      tags: ['coesão', 'conexão', 'fluidez']
    }
  ]

  constructor() {
    const model = new ChatGoogleGenerativeAI({
      modelName: 'gemini-pro',
      maxOutputTokens: 4096,
      temperature: 0.4, // Temperatura mais alta para feedback mais personalizado
      apiKey: process.env.GOOGLE_AI_KEY,
    })

    const prompt = new PromptTemplate({
      template: FEEDBACK_TEMPLATE,
      inputVariables: ['textAnalysis', 'criteriaAnalysis', 'plagiarismAnalysis', 'studentInfo'],
    })

    this.chain = new LLMChain({
      llm: model,
      prompt: prompt,
    })
  }
  
  // Método para adicionar recursos à base de dados
  public addResource(resource: {
    type: 'livro' | 'artigo' | 'vídeo' | 'exercício' | 'outro',
    title: string,
    description: string,
    link?: string,
    tags: string[]
  }): void {
    this.resourceDatabase.push(resource)
  }

  async generateFeedback(
    textAnalysis: TextAnalysisResult,
    criteriaAnalysis: CriteriaAnalysisResult,
    plagiarismAnalysis: PlagiarismResult,
    studentInfo: any,
    options: {
      previousSubmissions?: any[],
      classBenchmark?: {
        averageScore: number,
        totalStudents: number
      },
      feedbackLevel?: 'básico' | 'detalhado' | 'avançado'
    } = {}
  ): Promise<FeedbackResult> {
    this.startTime = Date.now()
    
    try {
      // Enriquece as informações do aluno com dados adicionais
      const enrichedStudentInfo = {
        ...studentInfo,
        previousSubmissionsCount: options.previousSubmissions?.length || 0,
        hasBenchmarkData: !!options.classBenchmark
      }
      
      // Encontra recursos relevantes com base nas análises
      const relevantResources = this.findRelevantResources(textAnalysis, criteriaAnalysis)
      
      // Adiciona recursos relevantes às informações
      enrichedStudentInfo.suggestedResources = relevantResources
      
      // Define o nível de feedback
      const feedbackLevel = options.feedbackLevel || this.determineFeedbackLevel(textAnalysis, criteriaAnalysis)
      
      console.log(`Gerando feedback ${feedbackLevel} para ${studentInfo.name}`)
      
      // Executa a geração de feedback
      const result = await this.chain.call({
        textAnalysis: JSON.stringify(textAnalysis),
        criteriaAnalysis: JSON.stringify(criteriaAnalysis),
        plagiarismAnalysis: JSON.stringify(plagiarismAnalysis),
        studentInfo: JSON.stringify(enrichedStudentInfo),
      })

      const processingTime = Date.now() - this.startTime
      
      try {
        const feedback = JSON.parse(result.text)
        
        // Validação básica
        if (typeof feedback.finalScore !== 'number') {
          throw new Error('O resultado da geração de feedback está incompleto')
        }
        
        // Normaliza a pontuação
        feedback.finalScore = Math.max(0, Math.min(10, feedback.finalScore))
        
        // Adiciona metadados
        feedback.processingMetadata = {
          processingTime,
          feedbackLevel,
          studentName: studentInfo.name,
          questionType: studentInfo.questionType,
          analysisVersion: this.analysisVersion
        }
        
        // Pós-processamento do feedback antes de retornar
        return this.postProcessFeedback(feedback, studentInfo)
      } catch (jsonError) {
        console.error('Erro ao processar resultado JSON:', jsonError)
        console.error('Resultado original:', result.text)
        throw new Error('Falha ao processar o resultado da geração de feedback')
      }
    } catch (error: any) {
      console.error('Erro ao gerar feedback:', error)
      
      // Recuperação com feedback básico após timeout
      if (Date.now() - this.startTime > 20000) {
        return this.generateFallbackFeedback(studentInfo)
      }
      
      throw new Error(`Falha ao gerar feedback: ${error.message}`)
    }
  }
  
  // Determina o nível de detalhamento do feedback com base nas análises
  private determineFeedbackLevel(
    textAnalysis: TextAnalysisResult,
    criteriaAnalysis: CriteriaAnalysisResult
  ): 'básico' | 'detalhado' | 'avançado' {
    const overallScore = (textAnalysis.grammarScore + criteriaAnalysis.overallScore) / 2
    
    // Para notas muito baixas ou muito altas, feedback mais detalhado
    if (overallScore < 3 || overallScore > 8) return 'detalhado'
    
    // Para textos com muitos erros gramaticais, feedback básico focado em fundamentos
    if (textAnalysis.grammarErrors.length > 10) return 'básico'
    
    // Para a maioria dos casos, feedback detalhado
    return 'detalhado'
  }
  
  // Encontra recursos relevantes com base nos problemas identificados
  private findRelevantResources(
    textAnalysis: TextAnalysisResult,
    criteriaAnalysis: CriteriaAnalysisResult
  ): Array<{
    type: 'livro' | 'artigo' | 'vídeo' | 'exercício' | 'outro'
    title: string
    description: string
    link?: string
  }> {
    const problems: string[] = []
    
    // Identifica áreas problemáticas
    if (textAnalysis.grammarScore < 6) problems.push('gramática')
    if (textAnalysis.coherenceScore < 6) problems.push('coesão', 'coerência')
    
    // Adiciona competências com nota baixa
    const lowCompetencies = criteriaAnalysis.competencies
      .filter(comp => comp.score < 6)
      .map(comp => comp.name.toLowerCase())
    
    problems.push(...lowCompetencies)
    
    // Filtra recursos relevantes (máximo 3)
    return this.resourceDatabase
      .filter(resource => 
        resource.tags.some(tag => 
          problems.some(problem => tag.toLowerCase().includes(problem))
        )
      )
      .slice(0, 3)
      .map(({ type, title, description, link }) => ({ type, title, description, link }))
  }
  
  // Ajusta o feedback para torná-lo mais personalizado e útil
  private postProcessFeedback(feedback: FeedbackResult, studentInfo: any): FeedbackResult {
    // Personaliza o feedback com o nome do aluno
    if (studentInfo.name) {
      const name = studentInfo.name.split(' ')[0] // Primeiro nome
      
      // Ajusta mensagens para incluir o nome
      if (feedback.detailedFeedback.grammar) {
        feedback.detailedFeedback.grammar = feedback.detailedFeedback.grammar
          .replace(/Você precisa/g, `${name}, você precisa`)
          .replace(/Observe que/g, `${name}, observe que`)
      }
    }
    
    // Retorna o feedback processado
    return feedback
  }
  
  // Gera feedback básico em caso de falha
  private generateFallbackFeedback(studentInfo: any): FeedbackResult {
    console.warn('Gerando feedback fallback devido a erros')
    
    const studentName = studentInfo.name || 'Aluno'
    const questionType = studentInfo.questionType || 'texto'
    
    return {
      finalScore: 5, // Neutro
      status: 'needs_review',
      summary: {
        strengths: ['Não foi possível identificar pontos fortes específicos'],
        weaknesses: ['Não foi possível identificar pontos fracos específicos'],
        keyPoints: ['O texto foi analisado parcialmente devido a limitações técnicas'],
        improvement: 'Análise comparativa não disponível'
      },
      detailedFeedback: {
        grammar: `${studentName}, recomendamos revisar os aspectos gramaticais do seu texto.`,
        content: `O conteúdo do seu ${questionType} precisa ser reavaliado.`,
        structure: 'A estrutura do texto pode ser aprimorada para melhor comunicar suas ideias.',
        originality: 'Não foi possível realizar uma análise completa de originalidade.',
        criteriaSpecific: {}
      },
      recommendations: {
        priority: ['Revisar o texto com atenção a aspectos fundamentais'],
        additional: ['Procurar auxílio de um professor para orientação detalhada'],
        resources: []
      },
      teacherNotes: 'Este feedback foi gerado em modo de contingência devido a limitações técnicas. Recomenda-se uma avaliação manual.',
      processingMetadata: {
        processingTime: Date.now() - this.startTime,
        feedbackLevel: 'básico',
        studentName: studentInfo.name || 'Não identificado',
        questionType: studentInfo.questionType || 'Não identificado',
        analysisVersion: `${this.analysisVersion}-fallback`
      }
    }
  }

  // Método auxiliar para determinar o status com base nas pontuações
  private determineStatus(
    textScore: number,
    criteriaScore: number,
    plagiarismScore: number
  ): 'approved' | 'needs_review' | 'rejected' {
    const averageScore = (textScore + criteriaScore + (plagiarismScore / 10)) / 3

    if (plagiarismScore < 70) return 'rejected' // Alto índice de plágio
    if (averageScore >= 7) return 'approved'
    if (averageScore >= 5) return 'needs_review'
    return 'rejected'
  }
} 