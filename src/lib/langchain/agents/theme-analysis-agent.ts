import { BaseAgent } from './base-agent';

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
  adherenceScore: number;
  relevanceScore: number;
  overallScore: number;
  recommendations: string[];
}

export class ThemeAnalysisAgent extends BaseAgent {
  constructor() {
    super('theme-analysis');
  }

  async analyze(text: string, theme?: { title: string; description: string }): Promise<ThemeAnalysisResult> {
    const prompt = this.generatePrompt(text, theme);
    const result = await this.execute(prompt);
    return this.processResult(result);
  }

  private generatePrompt(text: string, theme?: { title: string; description: string }): string {
    return `Você é um especialista em análise de desenvolvimento de temas e argumentação em redações e textos dissertativos.

Analise o seguinte texto quanto à sua abordagem do tema proposto, qualidade da argumentação, e adequação ao gênero.
Avalie se o texto desenvolve de forma adequada o tema, apresenta argumentos sólidos, e mantém-se fiel à proposta.

${theme ? `TEMA:
"${theme.title}"

DESCRIÇÃO DO TEMA:
"${theme.description}"` : 'TEMA: Não especificado'}

TEXTO:
"${text}"

Responda no seguinte formato JSON:
{
  "thematicAnalysis": {
    "mainTheme": "Tema principal identificado no texto",
    "themeDevelopment": "Análise de como o tema foi desenvolvido",
    "relevance": "Alta|Média|Baixa",
    "subthemes": ["Subtema 1", "Subtema 2"]
  },
  "argumentativeAnalysis": {
    "argumentQuality": "Excelente|Boa|Regular|Insuficiente",
    "evidenceUse": "Análise do uso de evidências",
    "reasoning": "Análise da linha de raciocínio",
    "fallacies": ["Falácia 1", "Falácia 2"]
  },
  "adherenceScore": 8.5,
  "relevanceScore": 7.5,
  "overallScore": 8.0,
  "recommendations": [
    "Recomendação 1 para melhorar",
    "Recomendação 2 para melhorar"
  ]
}`;
  }

  private processResult(result: any): ThemeAnalysisResult {
    try {
      // Tentar fazer o parse do JSON na resposta
      const jsonMatch = result.match(/```json\n([\s\S]*?)\n```/) || 
                       result.match(/```\n([\s\S]*?)\n```/) ||
                       result.match(/{[\s\S]*?}/);
                         
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        
        // Validar e garantir a estrutura correta
        return {
          thematicAnalysis: {
            mainTheme: parsed.thematicAnalysis?.mainTheme || '',
            themeDevelopment: parsed.thematicAnalysis?.themeDevelopment || '',
            relevance: parsed.thematicAnalysis?.relevance || 'Média',
            subthemes: Array.isArray(parsed.thematicAnalysis?.subthemes) ? parsed.thematicAnalysis.subthemes : []
          },
          argumentativeAnalysis: {
            argumentQuality: parsed.argumentativeAnalysis?.argumentQuality || 'Regular',
            evidenceUse: parsed.argumentativeAnalysis?.evidenceUse || '',
            reasoning: parsed.argumentativeAnalysis?.reasoning || '',
            fallacies: Array.isArray(parsed.argumentativeAnalysis?.fallacies) ? parsed.argumentativeAnalysis.fallacies : []
          },
          adherenceScore: parsed.adherenceScore || 0,
          relevanceScore: parsed.relevanceScore || 0,
          overallScore: parsed.overallScore || 0,
          recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : []
        };
      }
      
      throw new Error('Formato de resposta inválido');
    } catch (error) {
      console.error('Erro ao processar resultado:', error);
      return {
        thematicAnalysis: {
          mainTheme: 'Não foi possível identificar o tema principal',
          themeDevelopment: 'Não foi possível analisar o desenvolvimento do tema',
          relevance: 'Média',
          subthemes: []
        },
        argumentativeAnalysis: {
          argumentQuality: 'Regular',
          evidenceUse: 'Não foi possível analisar o uso de evidências',
          reasoning: 'Não foi possível analisar o raciocínio',
          fallacies: []
        },
        adherenceScore: 0,
        relevanceScore: 0,
        overallScore: 0,
        recommendations: ['Não foi possível gerar recomendações']
      };
    }
  }
} 