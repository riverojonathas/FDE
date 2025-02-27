'use client'

import { useState } from 'react'

/**
 * Hook para gerenciar configurações do agente
 * @param defaultConfig Configuração padrão do agente
 * @returns Objeto com o estado atual da configuração e funções para manipulá-lo
 */
export function useAgentConfiguration<T extends Record<string, any>>(defaultConfig: T) {
  // Estado para a configuração atual
  const [config, setConfig] = useState<T>(defaultConfig)
  
  // Estado para controlar a visibilidade do modal de configuração
  const [showConfig, setShowConfig] = useState(false)
  
  /**
   * Atualiza um valor específico na configuração
   * @param key Chave do valor a ser atualizado
   * @param value Novo valor
   */
  const setConfigValue = <K extends keyof T>(key: K, value: T[K]) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }))
  }
  
  /**
   * Reseta a configuração para os valores padrão
   */
  const resetConfig = () => {
    setConfig(defaultConfig)
  }
  
  /**
   * Gera um resumo da configuração atual
   * Método para ser sobrescrito pelos componentes filho
   */
  const getCustomConfigSummary = () => {
    return ""
  }
  
  return {
    config,
    setConfig,
    setConfigValue,
    resetConfig,
    showConfig,
    setShowConfig,
    getCustomConfigSummary
  }
}

// Configurações base que todos os agentes compartilham
interface BaseAgentConfig {
  model: string
  temperature: number
}

// Função genérica para criar um hook de configuração de agente
export function createAgentConfigHook<T extends BaseAgentConfig>(defaultConfig: T) {
  return function useAgentConfiguration() {
    const [config, setConfig] = useState<T>(defaultConfig)
    const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false)
    
    // Função para atualizar uma propriedade específica da configuração
    const updateConfig = <K extends keyof T>(key: K, value: T[K]) => {
      setConfig(prev => ({
        ...prev,
        [key]: value
      }))
    }
    
    // Função para atualizar uma propriedade aninhada da configuração
    const updateNestedConfig = <K extends keyof T, NK extends keyof T[K]>(
      key: K, 
      nestedKey: NK, 
      value: T[K][NK]
    ) => {
      setConfig(prev => ({
        ...prev,
        [key]: {
          ...prev[key],
          [nestedKey]: value
        }
      }))
    }
    
    // Função para gerar um resumo das configurações atuais
    const getConfigSummary = (configToSummary: T = config, fields: (keyof T)[] = ['model']): string => {
      return fields
        .map(field => {
          if (typeof configToSummary[field] === 'object') {
            return `${String(field)}: {...}`
          }
          return `${configToSummary[field]}`
        })
        .join(' | ')
    }
    
    return {
      config,
      setConfig,
      updateConfig,
      updateNestedConfig,
      isConfigDialogOpen,
      setIsConfigDialogOpen,
      getConfigSummary
    }
  }
}

// Hook específico para configuração de agente de gramática
export interface GrammarAgentConfig extends BaseAgentConfig {
  checkTypes: {
    grammar: boolean
    spelling: boolean
    punctuation: boolean
    agreement: boolean
  }
  severityFilter: 'all' | 'high' | 'medium' | 'low'
  readabilityCheck: boolean
  advanced: {
    contextSize: number
    detailLevel: 'basic' | 'detailed' | 'comprehensive'
    formalityCheck: boolean
    styleConsistency: boolean
  }
}

// Hook para configuração de agente de gramática com valores padrão
export const useGrammarAgentConfiguration = createAgentConfigHook<GrammarAgentConfig>({
  model: 'gpt-4',
  temperature: 0.7,
  checkTypes: {
    grammar: true,
    spelling: true,
    punctuation: true,
    agreement: true
  },
  severityFilter: 'all',
  readabilityCheck: true,
  advanced: {
    contextSize: 3,
    detailLevel: 'detailed',
    formalityCheck: false,
    styleConsistency: false
  }
})

// Hook específico para configuração de agente de avaliação técnica
export interface TechnicalEvaluationAgentConfig extends BaseAgentConfig {
  criteriaToEvaluate: {
    argumentation: boolean
    coherence: boolean
    relevance: boolean
    evidence: boolean
  }
  evaluationDepth: 'surface' | 'moderate' | 'deep'
  scoreSystem: 'points' | 'percentage' | 'descriptive'
  advanced: {
    comparativeAnalysis: boolean
    subjectSpecificCriteria: boolean
    detailedExplanation: boolean
    strengthsWeaknessesHighlight: boolean
  }
}

// Hook para configuração de agente de avaliação técnica com valores padrão
export const useTechnicalEvaluationAgentConfiguration = createAgentConfigHook<TechnicalEvaluationAgentConfig>({
  model: 'gpt-4',
  temperature: 0.7,
  criteriaToEvaluate: {
    argumentation: true,
    coherence: true,
    relevance: true,
    evidence: true
  },
  evaluationDepth: 'moderate',
  scoreSystem: 'points',
  advanced: {
    comparativeAnalysis: false,
    subjectSpecificCriteria: true,
    detailedExplanation: true,
    strengthsWeaknessesHighlight: true
  }
})

// Hook específico para configuração de agente de feedback detalhado
export interface DetailedFeedbackAgentConfig extends BaseAgentConfig {
  feedbackStyle: 'formal' | 'constructive' | 'motivational'
  includeSuggestions: boolean
  highlightPositives: boolean
  includeFinalScore: boolean
  advanced: {
    examplesOfImprovement: boolean
    resourcesForLearning: boolean
    customizedRecommendations: boolean
    progressTracking: boolean
  }
}

// Hook para configuração de agente de feedback detalhado com valores padrão
export const useDetailedFeedbackAgentConfiguration = createAgentConfigHook<DetailedFeedbackAgentConfig>({
  model: 'gpt-4',
  temperature: 0.7,
  feedbackStyle: 'constructive',
  includeSuggestions: true,
  highlightPositives: true,
  includeFinalScore: true,
  advanced: {
    examplesOfImprovement: true,
    resourcesForLearning: false,
    customizedRecommendations: true,
    progressTracking: false
  }
})

// Hook específico para configuração de agente de análise temática
export interface ThemeAgentConfig extends BaseAgentConfig {
  themeConfig: {
    enableThemeDescription: boolean
    themeTitle: string
    themeDescription: string
  }
  analysisOptions: {
    enableArgumentAnalysis: boolean
    enableSubthemes: boolean
    enableRecommendations: boolean
  }
  advanced: {
    detailLevel: 'basic' | 'moderate' | 'comprehensive'
    focusOnTextStructure: boolean
    compareToThemeStandards: boolean
  }
}

// Hook para configuração de agente de análise temática com valores padrão
export const useThemeAgentConfiguration = createAgentConfigHook<ThemeAgentConfig>({
  model: 'gpt-4',
  temperature: 0.7,
  themeConfig: {
    enableThemeDescription: false,
    themeTitle: '',
    themeDescription: ''
  },
  analysisOptions: {
    enableArgumentAnalysis: true,
    enableSubthemes: true,
    enableRecommendations: true
  },
  advanced: {
    detailLevel: 'moderate',
    focusOnTextStructure: false,
    compareToThemeStandards: false
  }
}) 