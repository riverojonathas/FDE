export interface DashboardMetrics {
  totalCorrections: number
  averageTimePerCorrection: number
  averageScore: number
  estimatedCostPer1000: number
  scoreDistribution: Record<string, number>
  strengths: Array<{ strength: string; count: number }>
  weaknesses: Array<{ weakness: string; count: number }>
}

export interface AnalyticsSummary {
  totalCorrections: number
  averageTime: number
  totalCost: number
  byType: {
    redacao: number
    resposta: number
  }
  topImprovementAreas: string[]
  recommendedActions: string[]
  performanceTrend: 'improving' | 'stable' | 'declining'
  confidenceScore: number
}

export interface CorrectionAnalytics {
  correctionId: string
  processingTime: number
  cost: number
  type: 'redacao' | 'resposta'
}

export interface BatchAnalytics {
  totalTime: number
  averageTimePerCorrection: number
  totalCost: number
  successRate: number
}

export interface CorrectionMethod {
  name: string
  type: 'ai' | 'human'
  timePerCorrection: number // segundos
  costPerCorrection: number // USD
  accuracy: number // porcentagem
  details: {
    pros: string[]
    cons: string[]
  }
}

export interface CorrectionComparison {
  methods: CorrectionMethod[]
  scalability: {
    corrections: number
    timeComparison: Record<string, number>
    costComparison: Record<string, number>
  }
} 