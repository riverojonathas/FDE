import { ICorrectionResult } from "@/store/correction-store";

interface CorrectionInput {
  text: string;
  student?: {
    name: string;
    id?: string;
    class?: string;
    grade?: string;
  };
  question?: {
    id: string;
    type: "dissertativa" | "redacao" | "argumentativa" | "expositiva" | string;
    subject?: string;
    topic?: string;
    maxScore?: number;
  };
}

/**
 * Função que simula a correção de texto para fins de teste
 * @param input Texto e metadados para correção
 * @returns Resultado da correção simulada
 */
export async function mockCorrection(input: string | CorrectionInput): Promise<ICorrectionResult> {
  // Processamento da entrada
  let text: string;
  let studentData = {};
  let questionData = {};
  
  if (typeof input === 'string') {
    text = input;
  } else {
    text = input.text;
    studentData = input.student ? {
      name: input.student.name,
      id: input.student.id,
      class: input.student.class
    } : {};
    
    questionData = input.question ? {
      id: input.question.id,
      type: input.question.type,
      subject: input.question.subject,
      topic: input.question.topic
    } : {};
  }

  // Simula um atraso para emular processamento
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Análise básica do texto
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const sentenceCount = text.split(/[.!?]+/).filter(Boolean).length;
  const paragraphCount = text.split(/\n\s*\n/).filter(Boolean).length;
  
  // Simula erros gramaticais (proporcionais ao tamanho do texto)
  const grammar = {
    score: Math.min(10, 6 + Math.random() * 4 - (wordCount < 50 ? 2 : 0)),
    feedback: wordCount < 50 
      ? "O texto é muito curto, o que compromete a análise gramatical completa."
      : "O texto apresenta boa estrutura gramatical, com alguns pontos para melhoria.",
    errors: [
      {
        text: "Esta frase contem um erro de acentuação",
        suggestion: "Esta frase contém um erro de acentuação",
        context: "Verificar acentuação",
      },
      {
        text: "O aluno foi na escola",
        suggestion: "O aluno foi à escola",
        context: "Uso de crase",
      },
    ],
  };
  
  // Simula análise de coerência
  const coherence = {
    score: Math.min(10, 5 + Math.random() * 4 + (paragraphCount > 3 ? 1 : 0)),
    feedback: paragraphCount < 3 
      ? "O texto possui poucos parágrafos, o que compromete o desenvolvimento das ideias."
      : "O texto apresenta boa estruturação e desenvolvimento de ideias.",
    strengths: [
      "Boa organização dos parágrafos",
      "Uso adequado de conectivos",
      "Progressão temática consistente"
    ],
    suggestions: [
      "Fortalecer a conexão entre o segundo e terceiro parágrafos",
      "Desenvolver melhor a conclusão",
    ]
  };
  
  // Simula análise do tema
  const theme = {
    score: Math.min(10, 5 + Math.random() * 4 + (wordCount > 200 ? 1 : 0)),
    feedback: wordCount < 200 
      ? "O desenvolvimento do tema ficou comprometido pela extensão limitada do texto."
      : "O tema foi desenvolvido de forma adequada, com argumentos pertinentes.",
    arguments: [
      {
        title: "Argumento principal",
        description: "Desenvolvimento do ponto central com uso de exemplos."
      },
      {
        title: "Análise de contexto",
        description: "Contextualização do tema com referências históricas."
      }
    ],
    suggestions: [
      "Aprofundar o terceiro argumento com mais dados",
      "Incluir contra-argumentos para fortalecer a tese",
      "Considerar mais perspectivas sobre o tema"
    ]
  };
  
  // Simula detecção de plágio
  const plagiarismScore = Math.random() * 3; // Valor baixo para não acusar plágio constantemente
  const aiScore = Math.random() * 4;
  
  const plagiarism = {
    score: plagiarismScore,
    aiScore: aiScore,
    detected: plagiarismScore > 5,
    aiDetected: aiScore > 5,
    feedback: "Análise de integridade realizada com sucesso. Não foram detectados sinais significativos de plágio ou uso de IA.",
    similarTexts: [] as Array<{content: string; source: string; similarity: number}>
  };
  
  // Adiciona textos similares aleatoriamente
  if (Math.random() > 0.7) {
    plagiarism.similarTexts.push({
      content: "Trecho semelhante encontrado em outra resposta do banco de dados.",
      source: "Redação #38291 - Ano 2022",
      similarity: 0.45 + Math.random() * 0.3
    });
  }
  
  // Nota final (média ponderada)
  const score = (
    grammar.score * 0.25 + 
    coherence.score * 0.35 + 
    theme.score * 0.4 - 
    (plagiarismScore > 5 ? 3 : 0)
  );
  
  // Status baseado na nota
  const status = score >= 7 ? "approved" : score >= 5 ? "review" : "rejected";
  
  // Feedback geral
  const feedback = {
    general: score >= 7 
      ? "Excelente trabalho! O texto apresenta boa estrutura gramatical, desenvolvimento coerente e abordagem adequada do tema."
      : score >= 5 
        ? "Bom trabalho, mas há pontos a melhorar. Revise especialmente a estrutura argumentativa e alguns aspectos gramaticais."
        : "O texto precisa de melhorias significativas. Recomenda-se revisão completa, especialmente nos aspectos de desenvolvimento do tema e coerência."
  };
  
  // Personaliza o feedback com base nas informações do aluno, se disponíveis
  if ('name' in studentData && studentData.name) {
    feedback.general = `${studentData.name}, ${feedback.general.charAt(0).toLowerCase()}${feedback.general.slice(1)}`;
  }
  
  // Adiciona referência ao tipo de questão, se disponível
  if ('type' in questionData && questionData.type) {
    const tipoQuestao = typeof questionData.type === 'string' ? questionData.type : 'texto';
    theme.feedback = `Para ${tipoQuestao}, ${theme.feedback.charAt(0).toLowerCase()}${theme.feedback.slice(1)}`;
  }
  
  // Metadados
  const metadata = {
    wordCount,
    sentenceCount,
    paragraphCount,
    analysisTime: 1.2 + Math.random() * 0.8,
    analyzedAt: new Date().toISOString(),
    ...studentData,
    ...questionData
  };
  
  return {
    grammar,
    coherence,
    theme,
    plagiarism,
    score,
    status,
    feedback,
    metadata
  };
} 