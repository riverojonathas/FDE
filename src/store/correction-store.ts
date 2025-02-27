import { create } from 'zustand'

interface GrammarResult {
  score: number;
  feedback: string;
  errors: {
    text: string;
    suggestion: string;
    context: string;
  }[];
}

interface CoherenceResult {
  score: number;
  feedback: string;
  strengths: string[];
  suggestions: string[];
}

interface ThemeResult {
  score: number;
  feedback: string;
  arguments: {
    title: string;
    description: string;
  }[];
  suggestions: string[];
}

interface PlagiarismResult {
  score: number;
  aiScore: number;
  detected: boolean;
  aiDetected: boolean;
  feedback: string;
  similarTexts: {
    content: string;
    source: string;
    similarity: number;
  }[];
}

export interface ICorrectionResult {
  grammar: GrammarResult;
  coherence: CoherenceResult;
  theme: ThemeResult;
  plagiarism: PlagiarismResult;
  score: number;
  status: "approved" | "review" | "rejected";
  feedback: {
    general: string;
  };
  metadata: {
    wordCount: number;
    sentenceCount: number;
    paragraphCount: number;
    analysisTime: number;
    analyzedAt: string;
    name?: string;
    id?: string;
    class?: string;
    type?: string;
    subject?: string;
    topic?: string;
  };
}

export interface ILangChainConfig {
  model: {
    name: string;
    temperature: number;
    maxTokens: number;
    topP: number;
    frequencyPenalty: number;
    presencePenalty: number;
  };
  memory: {
    type: string;
    maxTokens: number;
    returnMessages: boolean;
  };
  tools: {
    useSearch: boolean;
    useCalculator: boolean;
    useDatabase: boolean;
    usePlagiarismCheck: boolean;
    useGrammarCheck: boolean;
  };
  agents: {
    useGrammarAgent: boolean;
    useCoherenceAgent: boolean;
    useThemeAgent: boolean;
    usePlagiarismAgent: boolean;
  };
  prompts: {
    systemPrompt: string;
    grammarPrompt: string;
    coherencePrompt: string;
    themePrompt: string;
    plagiarismPrompt: string;
  };
  chain: {
    type: string;
    maxRetries: number;
    verbose: boolean;
  };
}

interface CorrectionStore {
  // Estado
  currentResult: ICorrectionResult | null;
  correctionHistory: ICorrectionResult[];
  config: ILangChainConfig;
  isLoading: boolean;

  // Ações
  setCurrentResult: (result: ICorrectionResult | null) => void;
  addToHistory: (result: ICorrectionResult) => void;
  clearHistory: () => void;
  updateConfig: (config: Partial<ILangChainConfig>) => void;
  setLoading: (loading: boolean) => void;
}

export const useCorrectionStore = create<CorrectionStore>((set) => ({
  // Estado inicial
  currentResult: null,
  correctionHistory: [],
  config: {
    model: {
      name: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2000,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0
    },
    memory: {
      type: 'buffer',
      maxTokens: 1000,
      returnMessages: true
    },
    tools: {
      useSearch: true,
      useCalculator: true,
      useDatabase: true,
      usePlagiarismCheck: true,
      useGrammarCheck: true
    },
    agents: {
      useGrammarAgent: true,
      useCoherenceAgent: true,
      useThemeAgent: true,
      usePlagiarismAgent: true
    },
    prompts: {
      systemPrompt: 'Você é um assistente especializado em correção de textos em português.',
      grammarPrompt: 'Analise a gramática do texto fornecido.',
      coherencePrompt: 'Avalie a coerência e coesão do texto.',
      themePrompt: 'Analise o desenvolvimento do tema.',
      plagiarismPrompt: 'Verifique indícios de plágio ou uso de IA.'
    },
    chain: {
      type: 'sequential',
      maxRetries: 3,
      verbose: true
    }
  },
  isLoading: false,

  // Ações
  setCurrentResult: (result) => set({ currentResult: result }),
  
  addToHistory: (result) => set((state) => ({
    correctionHistory: [...state.correctionHistory, result]
  })),
  
  clearHistory: () => set({ correctionHistory: [] }),
  
  updateConfig: (config) => set((state) => ({
    config: { ...state.config, ...config }
  })),
  
  setLoading: (loading) => set({ isLoading: loading })
})) 