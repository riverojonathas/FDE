/**
 * Lista de agentes disponíveis na pipeline de correção manual
 */
export const agentsList = [
  {
    id: 'grammar-analysis',
    name: 'Análise Gramatical',
    description: 'Analisa erros gramaticais, ortográficos e de pontuação no texto.',
    type: 'analyzer',
    steps: ['initial']
  },
  {
    id: 'cohesion-analysis',
    name: 'Análise de Coesão',
    description: 'Avalia a coesão, fluidez e organização lógica do texto.',
    type: 'analyzer',
    steps: ['grammar-analysis']
  },
  {
    id: 'theme-analysis',
    name: 'Análise de Tema',
    description: 'Verifica a aderência ao tema proposto e a qualidade do desenvolvimento.',
    type: 'analyzer',
    steps: ['cohesion-analysis']
  },
  {
    id: 'orchestrator',
    name: 'Orquestrador',
    description: 'Compila os resultados dos agentes anteriores e gera o feedback final.',
    type: 'orchestrator',
    steps: ['grammar-analysis', 'cohesion-analysis', 'theme-analysis']
  }
]; 