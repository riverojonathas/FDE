import { Correction, StudentResponse } from '@/types/common'

interface PerformanceMetrics {
  averageScore: number
  averageTimePerCorrection: number // em segundos
  estimatedCostPer1000: number // em USD
  commonStrengths: Array<{ strength: string; count: number }>
  commonWeaknesses: Array<{ weakness: string; count: number }>
  scoreDistribution: {
    '0-2': number
    '3-4': number
    '5-6': number
    '7-8': number
    '9-10': number
  }
}

interface AIAnalysis {
  topImprovementAreas: string[]
  recommendedActions: string[]
  performanceTrend: 'improving' | 'stable' | 'declining'
  confidenceScore: number
}

export function calculatePerformanceMetrics(corrections: Correction[]): PerformanceMetrics {
  const totalCorrections = corrections.length
  if (totalCorrections === 0) {
    return {
      averageScore: 0,
      averageTimePerCorrection: 0,
      estimatedCostPer1000: 0,
      commonStrengths: [],
      commonWeaknesses: [],
      scoreDistribution: { '0-2': 0, '3-4': 0, '5-6': 0, '7-8': 0, '9-10': 0 }
    }
  }

  // Calcular média das notas
  const averageScore = corrections.reduce((sum, c) => sum + c.score, 0) / totalCorrections

  // Calcular tempo médio (usando timestamps de created_at)
  const times = corrections.map(c => {
    const createdAt = new Date(c.created_at).getTime()
    return createdAt
  })
  const averageTime = times.reduce((sum, time, i, arr) => {
    if (i === 0) return 0
    return sum + (time - arr[i - 1])
  }, 0) / (times.length - 1)

  // Estimar custo (baseado em modelos GPT-4)
  const estimatedCostPer1000 = (averageTime / 1000) * 0.03 * 1000 // $0.03 por segundo

  // Análise de pontos fortes/fracos
  const strengthsMap = new Map<string, number>()
  const weaknessesMap = new Map<string, number>()

  corrections.forEach(correction => {
    correction.details.strengths.forEach(strength => {
      strengthsMap.set(strength, (strengthsMap.get(strength) || 0) + 1)
    })
    correction.details.weaknesses.forEach(weakness => {
      weaknessesMap.set(weakness, (weaknessesMap.get(weakness) || 0) + 1)
    })
  })

  // Distribuição de notas
  const scoreDistribution = corrections.reduce((dist, c) => {
    if (c.score <= 2) dist['0-2']++
    else if (c.score <= 4) dist['3-4']++
    else if (c.score <= 6) dist['5-6']++
    else if (c.score <= 8) dist['7-8']++
    else dist['9-10']++
    return dist
  }, { '0-2': 0, '3-4': 0, '5-6': 0, '7-8': 0, '9-10': 0 })

  return {
    averageScore,
    averageTimePerCorrection: averageTime / 1000, // converter para segundos
    estimatedCostPer1000,
    commonStrengths: Array.from(strengthsMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([strength, count]) => ({ strength, count })),
    commonWeaknesses: Array.from(weaknessesMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([weakness, count]) => ({ weakness, count })),
    scoreDistribution
  }
}

export async function generateAIAnalysis(
  corrections: Correction[], 
  responses: StudentResponse[]
): Promise<AIAnalysis> {
  // Aqui você pode usar a API do Gemini para gerar insights
  // Por enquanto, retornamos dados simulados
  return {
    topImprovementAreas: [
      "Argumentação e fundamentação",
      "Uso de exemplos específicos",
      "Clareza na exposição de ideias"
    ],
    recommendedActions: [
      "Focar em exercícios de argumentação",
      "Criar banco de exemplos históricos",
      "Praticar estruturação de textos"
    ],
    performanceTrend: "improving",
    confidenceScore: 0.85
  }
} 