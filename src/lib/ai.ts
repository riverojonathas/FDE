import { GoogleGenerativeAI } from "@google/generative-ai";
import { CorrectionResult } from "@/types/common";

if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
  throw new Error('NEXT_PUBLIC_GEMINI_API_KEY não está definida');
}

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

export async function correctAnswer(prompt: string, type: 'redacao' | 'resposta'): Promise<CorrectionResult> {
  const startTime = Date.now()
  
  try {
    const structuredPrompt = `
      Você é um professor experiente corrigindo uma avaliação. Analise a resposta do aluno seguindo estes critérios:

      QUESTÃO:
      ${prompt}

      CRITÉRIOS DE AVALIAÇÃO:
      1. Compreensão do tema (0-2 pontos)
      2. Argumentação e fundamentação (0-3 pontos)
      3. Clareza e coerência (0-3 pontos)
      4. Uso correto da língua portuguesa (0-2 pontos)

      IMPORTANTE: Responda apenas com o JSON, sem marcadores de código.

      {
        "score": <nota_final>,
        "feedback": "<feedback_geral>",
        "details": {
          "strengths": [
            "<ponto_forte_1>",
            "<ponto_forte_2>"
          ],
          "weaknesses": [
            "<ponto_fraco_1>",
            "<ponto_fraco_2>"
          ],
          "suggestions": [
            "<sugestao_1>",
            "<sugestao_2>"
          ],
          "annotations": [
            {
              "text": "<trecho_do_texto>",
              "type": "<correct|incorrect|suggestion>",
              "comment": "<comentario_sobre_o_trecho>"
            }
          ]
        }
      }
    `;

    console.log('Enviando prompt para correção:', structuredPrompt);
    
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(structuredPrompt);
    const text = result.response.text();
    
    console.log('Resposta do Gemini:', text);

    try {
      const cleanJson = text.replace(/```json\n|\n```/g, '').trim();
      const parsedResponse = JSON.parse(cleanJson);

      const endTime = Date.now()
      const processingTime = (endTime - startTime) / 1000

      // Criar o objeto de correção
      const correction: CorrectionResult = {
        score: parsedResponse.score,
        feedback: parsedResponse.feedback,
        details: {
          strengths: parsedResponse.details.strengths || [],
          weaknesses: parsedResponse.details.weaknesses || [],
          suggestions: parsedResponse.details.suggestions || [],
          annotations: parsedResponse.details.annotations || []
        },
        processingTime,
        type
      };

      return correction;

    } catch (parseError) {
      console.error('Erro ao parsear resposta:', parseError);
      console.log('Texto que falhou o parse:', text);
      return {
        score: 0,
        feedback: 'Erro ao processar a resposta',
        details: {
          strengths: [],
          weaknesses: [],
          suggestions: [],
          annotations: []
        },
        processingTime: 0,
        type
      };
    }
  } catch (error) {
    console.error('Erro na correção:', error);
    return {
      score: 0,
      feedback: 'Erro na correção automática',
      details: {
        strengths: [],
        weaknesses: [],
        suggestions: [],
        annotations: []
      },
      processingTime: 0,
      type
    };
  }
}

function generateQuestionPrompt(expectedAnswer: string, studentAnswer: string, gradingRules: any): string {
  // ... implementar geração do prompt para questão dissertativa
}

function generateEssayPrompt(theme: string, baseText: string, studentAnswer: string, gradingRules: any): string {
  // ... implementar geração do prompt para redação
} 