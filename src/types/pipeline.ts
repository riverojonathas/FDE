// Se o arquivo não existe, criar com o seguinte conteúdo:

// Tipos para a pipeline manual
export interface PipelineStep {
  id: string;
  order: number;
  name: string;
  description: string;
  prompt?: string;
  status: 'pending' | 'active' | 'completed';
  response?: string;
}

export interface Pipeline {
  id: string;
  user_id: string;
  question_id: string;
  respondent_identifier: string;
  text_content: string;
  model: string;
  provider: string;
  status: 'pending' | 'in_progress' | 'completed';
  current_step: number;
  steps: PipelineStep[];
  created_at: string;
  updated_at: string;
}

// Tipos para resultados de agentes
export interface GrammarAnalysisResult {
  errors: {
    error: string;
    correction: string;
    type: 'gramática' | 'ortografia' | 'pontuação' | 'concordância';
    explanation: string;
    severity: 'baixa' | 'média' | 'alta';
    position: {
      paragraph: number;
      sentence: string;
    };
  }[];
  summary: {
    totalErrors: number;
    grammarErrors: number;
    spellingErrors: number;
    punctuationErrors: number;
    agreementErrors: number;
    overallQuality: 'excelente' | 'bom' | 'regular' | 'ruim' | 'péssimo';
    readabilityScore: number; // 0-10
    suggestions: string[];
  };
}

export interface ThemeAnalysisResult {
  content: {
    relevance: number; // 0-10
    adherence: number; // 0-10
    development: number; // 0-10
    originality: number; // 0-10
    comments: string;
    strengths: string[];
    weaknesses: string[];
  };
  keypoints: {
    mainIdea: string;
    supportingPoints: string[];
    missingPoints: string[];
  };
  overall: {
    score: number; // 0-10
    summary: string;
    recommendations: string[];
  };
}

// Helper para type-checking das respostas
export function isGrammarAnalysisResult(data: any): data is GrammarAnalysisResult {
  return (
    data &&
    Array.isArray(data.errors) &&
    typeof data.summary === 'object' &&
    typeof data.summary.totalErrors === 'number'
  );
}

export function isThemeAnalysisResult(data: any): data is ThemeAnalysisResult {
  return (
    data &&
    typeof data.content === 'object' &&
    typeof data.keypoints === 'object' &&
    typeof data.overall === 'object' &&
    typeof data.content.relevance === 'number'
  );
} 