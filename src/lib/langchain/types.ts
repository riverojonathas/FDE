export interface ILangChainConfig {
  // Configurações básicas do modelo
  model: {
    name: string // nome do modelo (gpt-4, gpt-3.5-turbo, etc)
    temperature: number
    maxTokens: number
    topP: number
    frequencyPenalty: number
    presencePenalty: number
  }

  // Configurações de memória
  memory: {
    type: 'buffer' | 'conversation' | 'summary'
    maxTokens?: number
    returnMessages?: boolean
    inputKey?: string
    outputKey?: string
  }

  // Configurações de ferramentas
  tools: {
    useSearch: boolean // pesquisa na web
    useCalculator: boolean // cálculos matemáticos
    useDatabase: boolean // consulta ao banco de dados
    usePlagiarismCheck: boolean // verificação de plágio
    useGrammarCheck: boolean // verificação gramatical
  }

  // Configurações de agentes
  agents: {
    useGrammarAgent: boolean // agente especializado em gramática
    useCoherenceAgent: boolean // agente especializado em coerência
    useThemeAgent: boolean // agente especializado no tema
    usePlagiarismAgent: boolean // agente especializado em plágio
  }

  // Configurações de prompts
  prompts: {
    systemPrompt: string
    grammarPrompt: string
    coherencePrompt: string
    themePrompt: string
    plagiarismPrompt: string
  }

  // Configurações de chain
  chain: {
    type: 'sequential' | 'router' | 'parallel'
    maxRetries: number
    verbose: boolean
  }
}

export interface ICorrectionResult {
  // Resultado geral
  score: number
  feedback: string
  status: 'approved' | 'rejected' | 'needs_review'

  // Resultados específicos
  grammar: {
    score: number
    feedback: string
    errors: Array<{
      type: string
      description: string
      suggestion: string
      context: string
    }>
  }

  coherence: {
    score: number
    feedback: string
    analysis: {
      structure: string
      flow: string
      arguments: string
      conclusion: string
    }
  }

  theme: {
    score: number
    feedback: string
    analysis: {
      understanding: string
      development: string
      relevance: string
      examples: string
    }
  }

  plagiarism: {
    score: number
    feedback: string
    analysis: {
      similarityScore: number
      matches: Array<{
        text: string
        source: string
        similarity: number
      }>
      aiProbability: number
    }
  }

  // Metadados da correção
  metadata: {
    modelUsed: string
    timestamp: string
    processingTime: number
    toolsUsed: string[]
    agentsUsed: string[]
  }
}

export interface IPromptTemplate {
  template: string
  inputVariables: string[]
  partialVariables?: Record<string, string>
  validateTemplate?: boolean
} 