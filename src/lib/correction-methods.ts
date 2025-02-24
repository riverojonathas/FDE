export const CORRECTION_METHODS = {
  gemini: {
    name: 'Google Gemini',
    type: 'ai' as const,
    timePerCorrection: {
      redacao: 45,
      resposta: 20
    },
    costPerCorrection: {
      redacao: 0.05,
      resposta: 0.02
    },
    accuracy: 98.5,
    details: {
      pros: [
        'Correção instantânea',
        'Consistência nos critérios',
        'Disponibilidade 24/7',
        'Escalabilidade ilimitada'
      ],
      cons: [
        'Requer validação em casos complexos',
        'Limitações em análises subjetivas'
      ]
    }
  },
  gpt4: {
    name: 'GPT-4',
    type: 'ai' as const,
    timePerCorrection: {
      redacao: 60,
      resposta: 25
    },
    costPerCorrection: {
      redacao: 0.08,
      resposta: 0.03
    },
    accuracy: 99,
    details: {
      pros: [
        'Alta precisão',
        'Melhor compreensão contextual',
        'Feedback mais detalhado'
      ],
      cons: [
        'Custo mais elevado',
        'Tempo de processamento maior'
      ]
    }
  },
  claude: {
    name: 'Claude',
    type: 'ai' as const,
    timePerCorrection: {
      redacao: 50,
      resposta: 22
    },
    costPerCorrection: {
      redacao: 0.06,
      resposta: 0.025
    },
    accuracy: 98.8,
    details: {
      pros: [
        'Bom equilíbrio custo-benefício',
        'Explicações detalhadas',
        'Boa performance em textos longos'
      ],
      cons: [
        'Menos recursos que GPT-4',
        'Variação na qualidade do feedback'
      ]
    }
  },
  professor: {
    name: 'Professor',
    type: 'human' as const,
    timePerCorrection: {
      redacao: 600, // 10 minutos
      resposta: 300  // 5 minutos
    },
    costPerCorrection: {
      redacao: 5.00, // USD
      resposta: 2.50
    },
    accuracy: 95,
    details: {
      pros: [
        'Compreensão profunda do contexto',
        'Feedback personalizado',
        'Consideração de aspectos subjetivos',
        'Experiência pedagógica'
      ],
      cons: [
        'Tempo significativo por correção',
        'Custo elevado',
        'Disponibilidade limitada',
        'Possível inconsistência entre corretores',
        'Fadiga pode afetar qualidade'
      ]
    }
  }
}

export function calculateComparison(quantity: number, type: 'redacao' | 'resposta') {
  const methods = Object.entries(CORRECTION_METHODS).map(([key, method]) => ({
    name: method.name,
    type: method.type,
    timeTotal: method.timePerCorrection[type] * quantity,
    costTotal: method.costPerCorrection[type] * quantity,
    accuracy: method.accuracy,
    details: method.details
  }))

  return {
    methods,
    summary: {
      fastestMethod: methods.reduce((a, b) => a.timeTotal < b.timeTotal ? a : b),
      cheapestMethod: methods.reduce((a, b) => a.costTotal < b.costTotal ? a : b),
      mostAccurate: methods.reduce((a, b) => a.accuracy > b.accuracy ? a : b),
      humanVsAI: {
        timeReduction: Math.round((1 - (methods.find(m => m.type === 'ai')?.timeTotal || 0) / 
          (methods.find(m => m.type === 'human')?.timeTotal || 1)) * 100),
        costReduction: Math.round((1 - (methods.find(m => m.type === 'ai')?.costTotal || 0) / 
          (methods.find(m => m.type === 'human')?.costTotal || 1)) * 100)
      }
    }
  }
} 