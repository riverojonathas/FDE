/**
 * Função para gerar prompts de acordo com o agente e os inputs fornecidos
 */
export function mockGetPrompt(agentId: string, inputs: any): string {
  const { textContent, theme } = inputs;
  
  // Verificar se o texto foi fornecido
  if (!textContent) {
    return "Erro: Texto não fornecido";
  }
  
  // Prompts específicos para cada agente
  switch (agentId) {
    case 'grammar-analysis':
      return `
Você é um especialista em análise gramatical de textos em português.

TEXTO PARA ANÁLISE:
"""
${textContent}
"""

Analise o texto acima e identifique erros gramaticais, ortográficos e de pontuação.
Avalie a qualidade da escrita em uma escala de 0 a 10.

Forneça sua resposta no seguinte formato JSON:
{
  "errors": [
    {"type": "ortográfico", "text": "texto incorreto", "correction": "texto correto", "explanation": "explicação"},
    {"type": "gramatical", "text": "texto incorreto", "correction": "texto correto", "explanation": "explicação"},
    {"type": "pontuação", "text": "texto incorreto", "correction": "texto correto", "explanation": "explicação"}
  ],
  "quality_metrics": {
    "grammar": 0-10,
    "spelling": 0-10,
    "punctuation": 0-10
  },
  "summary": "Resumo da análise gramatical em um parágrafo",
  "score": 0-10
}`;

    case 'cohesion-analysis':
      return `
Você é um especialista em análise de coesão e coerência textual em português.

TEXTO PARA ANÁLISE:
"""
${textContent}
"""

Analise o texto acima e avalie a coesão, coerência, estrutura e organização do texto.
Avalie a qualidade da coesão em uma escala de 0 a 10.

Forneça sua resposta no seguinte formato JSON:
{
  "issues": [
    {"type": "coesão", "paragraph": "número", "issue": "descrição do problema", "suggestion": "sugestão de melhoria"},
    {"type": "coerência", "paragraph": "número", "issue": "descrição do problema", "suggestion": "sugestão de melhoria"},
    {"type": "estrutura", "paragraph": "número", "issue": "descrição do problema", "suggestion": "sugestão de melhoria"}
  ],
  "quality_metrics": {
    "cohesion": 0-10,
    "coherence": 0-10,
    "structure": 0-10,
    "flow": 0-10
  },
  "summary": "Resumo da análise de coesão em um parágrafo",
  "score": 0-10
}`;

    case 'theme-analysis':
      // Se o tema estiver disponível, incluí-lo no prompt
      const themeInfo = theme ? `
TEMA PROPOSTO:
Título: ${theme.title}
Descrição: ${theme.description}
Critérios de Avaliação: ${theme.gradingRules || 'Não especificados'}
` : 'TEMA PROPOSTO: Não especificado';

      return `
Você é um especialista em análise temática e argumentativa de textos em português.

${themeInfo}

TEXTO PARA ANÁLISE:
"""
${textContent}
"""

Analise o texto acima e avalie a aderência ao tema proposto, a qualidade da argumentação e a profundidade do desenvolvimento.
Avalie a qualidade da análise temática em uma escala de a 10.

Forneça sua resposta no seguinte formato JSON:
{
  "theme_analysis": {
    "adherence": 0-10,
    "development": 0-10,
    "examples": 0-10,
    "arguments": 0-10
  },
  "strengths": [
    "ponto forte 1",
    "ponto forte 2"
  ],
  "weaknesses": [
    "ponto fraco 1",
    "ponto fraco 2"
  ],
  "improvement_suggestions": [
    "sugestão 1",
    "sugestão 2"
  ],
  "summary": "Resumo da análise temática em um parágrafo",
  "score": 0-10
}`;

    default:
      return "Agente não reconhecido";
  }
}

/**
 * Calcula um custo aproximado baseado no tempo de execução e no modelo
 */
export function calculateApproximateCost(executionTimeMs: number, model: string): number {
  // Valores fictícios para demonstração
  const baseCostPerSecond = {
    "gpt-4": 0.03,
    "gpt-3.5-turbo": 0.002,
    "claude-3-opus": 0.025,
    "gemini-pro": 0.0035,
    "default": 0.01
  };
  
  const modelRate = baseCostPerSecond[model as keyof typeof baseCostPerSecond] || baseCostPerSecond.default;
  const executionTimeSeconds = executionTimeMs / 1000;
  
  return parseFloat((modelRate * executionTimeSeconds).toFixed(4));
} 