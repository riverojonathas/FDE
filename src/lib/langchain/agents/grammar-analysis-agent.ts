import { BaseAgent } from './base-agent';

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
    readabilityScore: number;
    suggestions: string[];
  };
}

export class GrammarAnalysisAgent extends BaseAgent {
  constructor() {
    super('grammar-analysis');
  }

  async analyze(text: string): Promise<GrammarAnalysisResult> {
    const prompt = this.generatePrompt(text);
    const result = await this.execute(prompt);
    return this.processResult(result);
  }

  private generatePrompt(text: string): string {
    return `Você é um especialista em análise gramatical de textos em português brasileiro.
  
Analise o seguinte texto e identifique todos os erros gramaticais, ortográficos, de pontuação e de concordância.
Para cada erro encontrado, forneça a correção adequada e uma breve explicação sobre a regra aplicável.

TEXTO:
"${text}"

Responda no seguinte formato JSON:
{
  "errors": [
    {
      "error": "texto com erro",
      "correction": "texto corrigido",
      "type": "gramática|ortografia|pontuação|concordância",
      "explanation": "explicação breve",
      "severity": "baixa|média|alta",
      "position": {
        "paragraph": 1,
        "sentence": "Frase contendo o erro"
      }
    }
  ],
  "summary": {
    "totalErrors": 0,
    "grammarErrors": 0,
    "spellingErrors": 0,
    "punctuationErrors": 0,
    "agreementErrors": 0,
    "overallQuality": "excelente|bom|regular|ruim|péssimo",
    "readabilityScore": 8.5,
    "suggestions": [
      "Sugestão para melhorar a escrita"
    ]
  }
}`;
  }

  private processResult(result: any): GrammarAnalysisResult {
    try {
      // Tentar fazer o parse do JSON na resposta
      const jsonMatch = result.match(/```json\n([\s\S]*?)\n```/) || 
                       result.match(/```\n([\s\S]*?)\n```/) ||
                       result.match(/{[\s\S]*?}/);
                         
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        
        // Validar e garantir a estrutura correta
        return {
          errors: Array.isArray(parsed.errors) ? parsed.errors : [],
          summary: {
            totalErrors: parsed.summary?.totalErrors || 0,
            grammarErrors: parsed.summary?.grammarErrors || 0,
            spellingErrors: parsed.summary?.spellingErrors || 0,
            punctuationErrors: parsed.summary?.punctuationErrors || 0,
            agreementErrors: parsed.summary?.agreementErrors || 0,
            overallQuality: parsed.summary?.overallQuality || 'regular',
            readabilityScore: parsed.summary?.readabilityScore || 5,
            suggestions: Array.isArray(parsed.summary?.suggestions) ? parsed.summary.suggestions : []
          }
        };
      }
      
      throw new Error('Formato de resposta inválido');
    } catch (error) {
      console.error('Erro ao processar resultado:', error);
      return {
        errors: [],
        summary: {
          totalErrors: 0,
          grammarErrors: 0,
          spellingErrors: 0,
          punctuationErrors: 0,
          agreementErrors: 0,
          overallQuality: 'regular',
          readabilityScore: 5,
          suggestions: ['Não foi possível analisar o texto']
        }
      };
    }
  }
} 