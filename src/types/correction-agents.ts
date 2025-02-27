export type AgentStatus = 'pending' | 'in_progress' | 'completed';

// Interface base para todos os agentes
export interface IBaseAgent {
  id: string;
  correction_id: string;
  status: AgentStatus;
  created_at: string;
  updated_at: string;
}

// Análise Gramatical
export interface GrammarError {
  error: string;
  correction: string;
  type: 'gramática' | 'ortografia' | 'pontuação' | 'concordância';
  explanation: string;
  severity: 'baixa' | 'média' | 'alta';
  position: {
    paragraph: number;
    sentence: string;
  };
}

export interface GrammarSummary {
  totalErrors: number;
  grammarErrors: number;
  spellingErrors: number;
  punctuationErrors: number;
  agreementErrors: number;
  overallQuality: 'excelente' | 'bom' | 'regular' | 'ruim' | 'péssimo';
  readabilityScore: number;
  suggestions: string[];
}

export interface GrammarAnalysisResult {
  errors: GrammarError[];
  summary: GrammarSummary;
}

export interface IGrammarAnalysis extends IBaseAgent {
  analysis_data: GrammarAnalysisResult | null;
}

// Análise Temática
export interface ThemeAnalysisResult {
  thematicAnalysis: {
    mainTheme: string;
    themeDevelopment: string;
    relevance: 'Alta' | 'Média' | 'Baixa';
    subthemes: string[];
  };
  argumentativeAnalysis: {
    argumentQuality: 'Excelente' | 'Boa' | 'Regular' | 'Insuficiente';
    evidenceUse: string;
    reasoning: string;
    fallacies: string[];
  };
  adherenceScore: number; // 0-10
  relevanceScore: number; // 0-10
  overallScore: number; // 0-10
  recommendations: string[];
}

export interface IThemeAnalysis extends IBaseAgent {
  analysis_data: ThemeAnalysisResult | null;
}

// Avaliação Técnica
export interface EvaluationCriteria {
  score: number;
  maxScore: number;
  comments: string;
}

export interface TechnicalEvaluationResult {
  criteria: {
    argumentation: EvaluationCriteria;
    coherence: EvaluationCriteria;
    relevance: EvaluationCriteria;
    evidence: EvaluationCriteria;
  };
  overall: {
    totalScore: number;
    maxScore: number;
    percentage: number;
    grade: string;
    generalComments: string;
    strengths: string[];
    areasForImprovement: string[];
  };
}

export interface ITechnicalEvaluation extends IBaseAgent {
  evaluation_data: TechnicalEvaluationResult | null;
}

// Feedback Detalhado
export interface DetailedFeedbackResult {
  feedback_geral: string;
  pontos_fortes: string[];
  pontos_fracos: string[];
  sugestoes: {
    aspecto: string;
    sugestao: string;
    exemplo: string;
  }[];
  score_final: number; // 0-100
}

export interface IDetailedFeedback extends IBaseAgent {
  feedback_data: DetailedFeedbackResult | null;
}

// Síntese Final
export interface FinalSynthesisResult {
  overview: string;
  grade: {
    final_score: number; // 0-100
    letter_grade: 'A' | 'B' | 'C' | 'D' | 'F';
    classification: string;
  };
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  detailed_analysis: {
    grammar: {
      summary: string;
      score: number; // 0-100
    };
    theme: {
      summary: string;
      score: number; // 0-100
    };
    technical: {
      summary: string;
      score: number; // 0-100
    };
  };
}

export interface IFinalSynthesis extends IBaseAgent {
  synthesis_data: FinalSynthesisResult | null;
}

// Interfaces para operações e API
export interface AgentApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface AgentServiceMethods<T> {
  getByCorrection: (correctionId: string) => Promise<AgentApiResponse<T>>;
  create: (correctionId: string) => Promise<AgentApiResponse<T>>;
  updateStatus: (agentId: string, status: AgentStatus) => Promise<AgentApiResponse<void>>;
  getOrCreate: (correctionId: string) => Promise<AgentApiResponse<T>>;
} 