import { BaseAgent } from './base-agent';

export interface CoherenceAnalysisResult {
  coherence: {
    score: number;
    analysis: string;
    strengths: string[];
    weaknesses: string[];
  };
  cohesion: {
    score: number;
    analysis: string;
    connectorUse: string;
    paragraphTransitions: string;
  };
  structure: {
    introduction: {
      quality: 'boa' | 'regular' | 'ruim';
      comments: string;
    };
    development: {
      quality: 'boa' | 'regular' | 'ruim';
      comments: string;
    };
    conclusion: {
      quality: 'boa' | 'regular' | 'ruim';
      comments: string;
    };
  };
  overallScore: number;
  summary: string;
}

export class CoherenceAnalysisAgent extends BaseAgent {
  constructor() {
    super('coherence-analysis');
  }

  async analyze(text: string): Promise<CoherenceAnalysisResult> {
    const prompt = this.generatePrompt(text);
    const result = await this.execute(prompt);
    return this.processResult(result);
  }

  private generatePrompt(text: string): string {
    return `Você é um especialista em análise de coerência e coesão textual em português brasileiro.

Analise o seguinte texto quanto à sua coerência lógica, coesão entre parágrafos e sentenças, e estrutura geral.
Avalie a progressão das ideias, conexões entre parágrafos, uso adequado de conectivos, e clareza argumentativa.

TEXTO:
"${text}"

Responda no seguinte formato JSON:
{
  "coherence": {
    "score": 8.5,
    "analysis": "Análise da coerência do texto",
    "strengths": ["Ponto forte 1", "Ponto forte 2"],
    "weaknesses": ["Ponto fraco 1", "Ponto fraco 2"]
  },
  "cohesion": {
    "score": 7.5,
    "analysis": "Análise da coesão do texto",
    "connectorUse": "Análise do uso de conectores",
    "paragraphTransitions": "Análise das transições entre parágrafos"
  },
  "structure": {
    "introduction": {
      "quality": "boa|regular|ruim",
      "comments": "Comentários sobre a introdução"
    },
    "development": {
      "quality": "boa|regular|ruim",
      "comments": "Comentários sobre o desenvolvimento"
    },
    "conclusion": {
      "quality": "boa|regular|ruim",
      "comments": "Comentários sobre a conclusão"
    }
  },
  "overallScore": 8.0,
  "summary": "Resumo geral da análise de coerência e coesão"
}`;
  }

  private processResult(result: any): CoherenceAnalysisResult {
    try {
      // Tentar fazer o parse do JSON na resposta
      const jsonMatch = result.match(/```json\n([\s\S]*?)\n```/) || 
                       result.match(/```\n([\s\S]*?)\n```/) ||
                       result.match(/{[\s\S]*?}/);
                         
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        
        // Validar e garantir a estrutura correta
        return {
          coherence: {
            score: parsed.coherence?.score || 0,
            analysis: parsed.coherence?.analysis || '',
            strengths: Array.isArray(parsed.coherence?.strengths) ? parsed.coherence.strengths : [],
            weaknesses: Array.isArray(parsed.coherence?.weaknesses) ? parsed.coherence.weaknesses : []
          },
          cohesion: {
            score: parsed.cohesion?.score || 0,
            analysis: parsed.cohesion?.analysis || '',
            connectorUse: parsed.cohesion?.connectorUse || '',
            paragraphTransitions: parsed.cohesion?.paragraphTransitions || ''
          },
          structure: {
            introduction: {
              quality: parsed.structure?.introduction?.quality || 'regular',
              comments: parsed.structure?.introduction?.comments || ''
            },
            development: {
              quality: parsed.structure?.development?.quality || 'regular',
              comments: parsed.structure?.development?.comments || ''
            },
            conclusion: {
              quality: parsed.structure?.conclusion?.quality || 'regular',
              comments: parsed.structure?.conclusion?.comments || ''
            }
          },
          overallScore: parsed.overallScore || 0,
          summary: parsed.summary || ''
        };
      }
      
      throw new Error('Formato de resposta inválido');
    } catch (error) {
      console.error('Erro ao processar resultado:', error);
      return {
        coherence: {
          score: 0,
          analysis: 'Não foi possível analisar a coerência',
          strengths: [],
          weaknesses: []
        },
        cohesion: {
          score: 0,
          analysis: 'Não foi possível analisar a coesão',
          connectorUse: '',
          paragraphTransitions: ''
        },
        structure: {
          introduction: {
            quality: 'regular',
            comments: ''
          },
          development: {
            quality: 'regular',
            comments: ''
          },
          conclusion: {
            quality: 'regular',
            comments: ''
          }
        },
        overallScore: 0,
        summary: 'Não foi possível analisar o texto'
      };
    }
  }
} 