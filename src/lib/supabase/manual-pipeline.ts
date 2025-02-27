import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase';
import { calculateApproximateCost } from '@/data/prompts';
import { IManualPipeline } from '@/types/manual-pipeline';
import { ManualPipelineService } from '@/lib/services/manual-pipeline';

// Verificando se as variáveis de ambiente estão definidas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'As variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY precisam ser definidas.'
  );
}

// Usando o cliente centralizado do Supabase
export const supabaseClient = supabase;

/**
 * Salva uma resposta e inicia uma nova correção
 */
export async function saveStudentResponseAndStartCorrection(data: {
  respondent_identifier: string;
  question_id: string;
  text_content: string;
  prompt: string;
  metadata: {
    aiProvider: string;
    aiModel: string;
    steps: any[];
  };
}) {
  try {
    console.log('Iniciando saveStudentResponseAndStartCorrection com dados:', data);
    
    // Criar a pipeline com os dados iniciais
    const pipeline: IManualPipeline = {
      question_id: data.question_id,
      respondent_identifier: data.respondent_identifier,
      text_content: data.text_content,
      current_step: 0,
      status: 'running',
      steps: data.metadata.steps,
      metadata: {
        aiProvider: data.metadata.aiProvider,
        aiModel: data.metadata.aiModel,
        started_at: new Date().toISOString(),
        steps: data.metadata.steps,
        current_step: 0,
        status: 'running'
      }
    };
    
    console.log('Pipeline formatada para criação:', pipeline);
    
    // Criar a pipeline usando o serviço
    const result = await ManualPipelineService.createPipeline(pipeline);
    
    if (!result.success) {
      throw new Error(result.message);
    }
    
    console.log('Pipeline criada com sucesso:', result.data);
    
    return result.data;
  } catch (error) {
    console.error('Erro em saveStudentResponseAndStartCorrection:', error);
    throw error;
  }
}

/**
 * Salva o resultado de um agente de análise
 */
export async function saveAgentResult(data: {
  correction_id: string;
  agent_id: string;
  result: any;
  raw_response: string;
  prompt_used: string;
  execution_time_ms: number;
  model_info: any;
  execution_batch?: string;
}) {
  const { 
    correction_id, 
    agent_id, 
    result, 
    raw_response, 
    prompt_used,
    execution_time_ms, 
    model_info,
    execution_batch = `batch_${Date.now()}`
  } = data;
  
  // 1. Buscar dados atuais da correção
  const { data: correction, error: fetchError } = await supabaseClient
    .from('corrections')
    .select('details, status_details')
    .eq('id', correction_id)
    .single();
  
  if (fetchError) {
    console.error('Erro ao buscar correção:', fetchError);
    throw fetchError;
  }
  
  // 2. Atualizar os detalhes da correção
  const details = {
    ...correction.details,
    agent_results: {
      ...(correction.details?.agent_results || {}),
      [agent_id]: result
    }
  };
  
  // 3. Atualizar status_details
  const completedSteps = [...(correction.status_details?.completed_steps || [])];
  if (!completedSteps.includes(agent_id)) {
    completedSteps.push(agent_id);
  }

  // Determinar próximo passo
  let nextStep = 'started';
  const steps = ['grammar-analysis', 'coherence-analysis', 'theme-analysis', 'orchestrator'];
  const currentIndex = steps.indexOf(agent_id);
  
  if (currentIndex < steps.length - 1) {
    nextStep = steps[currentIndex + 1];
  } else {
    nextStep = 'completed';
  }
  
  const statusDetails = {
    ...correction.status_details,
    current_step: nextStep,
    completed_steps: completedSteps,
    last_update: new Date().toISOString()
  };
  
  // 4. Atualizar a correção
  const { error: updateError } = await supabaseClient
    .from('corrections')
    .update({ 
      details, 
      status_details: statusDetails,
      ...(nextStep === 'completed' && result.score ? { score: result.score } : {}),
      ...(nextStep === 'completed' && result.feedback ? { feedback: result.feedback } : {})
    })
    .eq('id', correction_id);
  
  if (updateError) {
    console.error('Erro ao atualizar detalhes da correção:', updateError);
    throw updateError;
  }
  
  // 5. Salvar analytics da execução
  const analyticsData = {
    id: uuidv4(),
    correction_id,
    agent_id,
    result,
    raw_response,
    prompt_used,
    execution_time_ms,
    model_info,
    execution_batch,
    created_at: new Date().toISOString()
  };
  
  const { error: analyticsError } = await supabaseClient
    .from('correction_history')
    .insert(analyticsData);
  
  if (analyticsError) {
    console.error('Erro ao salvar histórico:', analyticsError);
    throw analyticsError;
  }
  
  return { success: true };
}

/**
 * Finaliza uma correção com os resultados compilados
 */
export async function finalizeCorrectionWithResults(data: {
  correction_id: string;
  feedback: string;
  score: number;
  details: any;
  orchestrator_result: any;
  raw_prompt: string;
  raw_response: string;
  execution_time_ms: number;
  model_info: any;
}) {
  const {
    correction_id,
    feedback,
    score,
    details,
    orchestrator_result,
    raw_prompt,
    raw_response,
    execution_time_ms,
    model_info
  } = data;

  // 1. Buscar dados atuais da correção
  const { data: correction, error: fetchError } = await supabaseClient
    .from('corrections')
    .select('details, status_details')
    .eq('id', correction_id)
    .single();

  if (fetchError) {
    console.error('Erro ao buscar correção:', fetchError);
    throw fetchError;
  }

  // 2. Atualizar os detalhes da correção
  const updatedDetails = {
    ...correction.details,
    ...details,
    agent_results: {
      ...(correction.details?.agent_results || {}),
      orchestrator: orchestrator_result
    }
  };

  // 3. Atualizar status_details
  const completedSteps = [...(correction.status_details?.completed_steps || [])];
  if (!completedSteps.includes('orchestrator')) {
    completedSteps.push('orchestrator');
  }

  const statusDetails = {
    current_step: 'completed',
    completed_steps: completedSteps,
    last_update: new Date().toISOString()
  };

  // 4. Atualizar a correção
  const { error: updateError } = await supabaseClient
    .from('corrections')
    .update({
      feedback,
      score,
      details: updatedDetails,
      status_details: statusDetails
    })
    .eq('id', correction_id);

  if (updateError) {
    console.error('Erro ao finalizar correção:', updateError);
    throw updateError;
  }

  // 5. Salvar analytics do orquestrador
  const analyticsData = {
    id: uuidv4(),
    correction_id,
    type: 'orchestrator',
    processing_time: execution_time_ms / 1000,
    cost: calculateApproximateCost(execution_time_ms, model_info.model),
    created_at: new Date().toISOString(),
    raw_prompt,
    raw_response,
    manual_execution: true,
    execution_batch: `batch_${Date.now()}`
  };

  const { error: analyticsError } = await supabaseClient
    .from('correction_analytics')
    .insert(analyticsData);

  if (analyticsError) {
    console.error('Erro ao salvar analytics do orquestrador:', analyticsError);
    throw analyticsError;
  }

  return { success: true };
}

/**
 * Busca uma correção específica
 */
export async function getCorrectionById(correctionId: string) {
  console.log('Buscando correção:', correctionId);
  
  const { data: correction, error: correctionError } = await supabaseClient
    .from('corrections')
    .select(`
      *,
      student_responses (
        id,
        respondent_identifier,
        question_id,
        answer,
        created_at
      ),
      questions:student_responses(questions(
        id,
        code,
        title,
        description,
        type,
        subject,
        level,
        theme,
        grading_rules,
        base_text,
        expected_answer,
        expected_points
      ))
    `)
    .eq('id', correctionId)
    .single();
  
  if (correctionError) {
    console.error('Erro ao buscar correção:', correctionError);
    throw correctionError;
  }

  console.log('Correção encontrada:', correction);
  return correction;
}

/**
 * Busca questões disponíveis
 */
export async function getAvailableQuestions() {
  try {
    console.log('Buscando questões disponíveis...');
    const { data: questions, error } = await supabase
      .from('questions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    console.log('Questões encontradas:', questions);
    return questions;
  } catch (error) {
    console.error('Erro ao buscar questões:', error);
    throw error;
  }
}

/**
 * Busca turmas disponíveis
 */
export async function getAvailableClasses() {
  const { data, error } = await supabaseClient
    .from('classes')
    .select('*')
    .order('name');
    
  if (error) throw error;
  return data;
}

interface EducationLevel {
  id: string;
  name: string;
}

interface Grade {
  id: string;
  name: string;
  education_level_id: string;
}

interface Class {
  id: string;
  name: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
}

type SupabaseEnrollment = {
  student_id: string;
  student: Student;
}

/**
 * Busca níveis de ensino disponíveis para uma escola
 */
export async function getEducationLevels(schoolId: string): Promise<EducationLevel[]> {
  // Primeiro buscar os IDs únicos dos níveis de ensino das matrículas
  const { data: enrollments, error: enrollmentsError } = await supabase
    .from('student_class_enrollments')
    .select('education_level_id')
    .eq('school_id', schoolId);

  if (enrollmentsError) {
    console.error('Erro ao buscar matrículas:', enrollmentsError);
    throw enrollmentsError;
  }

  // Extrair IDs únicos
  const uniqueLevelIds = [...new Set(enrollments.map(e => e.education_level_id))];

  if (uniqueLevelIds.length === 0) {
    return [];
  }

  // Buscar os detalhes dos níveis de ensino
  const { data: levels, error: levelsError } = await supabase
    .from('education_levels')
    .select('id, name')
    .in('id', uniqueLevelIds)
    .order('name');

  if (levelsError) {
    console.error('Erro ao buscar níveis de ensino:', levelsError);
    throw levelsError;
  }

  return levels as EducationLevel[];
}

/**
 * Busca séries disponíveis para um nível de ensino
 */
export async function getGrades(educationLevelId: string): Promise<Grade[]> {
  const { data, error } = await supabase
    .from('grades')
    .select('*')
    .eq('education_level_id', educationLevelId)
    .order('name');

  if (error) {
    console.error('Erro ao buscar séries:', error);
    throw error;
  }

  return data;
}

/**
 * Busca turmas disponíveis para uma série
 */
export async function getClasses(schoolId: string, gradeId: string): Promise<Class[]> {
  const { data, error } = await supabase
    .from('student_class_enrollments')
    .select(`
      class_id,
      classes (
        id,
        name
      )
    `)
    .eq('school_id', schoolId)
    .eq('grade_id', gradeId);

  if (error) {
    console.error('Erro ao buscar turmas:', error);
    throw error;
  }

  // Formatar resultado para remover duplicatas
  const uniqueClasses = data.reduce((acc: Class[], curr: any) => {
    const classData = curr.classes;
    if (!acc.find(c => c.id === classData.id)) {
      acc.push(classData);
    }
    return acc;
  }, []);

  return uniqueClasses;
}

/**
 * Busca alunos de uma turma específica
 */
export async function getStudentsByClass(classId: string): Promise<Student[]> {
  const { data, error } = await supabase
    .from('student_class_enrollments')
    .select(`
      students (
        id,
        name,
        email
      )
    `)
    .eq('class_id', classId);

  if (error) {
    console.error('Erro ao buscar alunos:', error);
    throw error;
  }

  // Formatar resultado removendo duplicatas
  return data.reduce((acc: Student[], curr: any) => {
    const student = curr.students;
    if (!acc.find(s => s.id === student.id)) {
      acc.push(student);
    }
    return acc;
  }, []);
}

/**
 * Busca os estudantes disponíveis
 */
export async function getAvailableStudents() {
  const { data, error } = await supabaseClient
    .from('students')
    .select('id, name, email')
    .order('name');
  
  if (error) {
    console.error('Erro ao buscar estudantes:', error);
    throw error;
  }
  
  return data;
}

/**
 * Cria uma questão de exemplo para testes
 */
export async function createSampleQuestion() {
  try {
    const { data, error } = await supabase
      .from('questions')
      .insert({
        title: 'Questão Exemplo',
        description: 'Esta é uma questão de exemplo para teste.',
        subject: 'redacao',
        type: 'redacao',
        prompt: 'Analise o texto fornecido considerando os seguintes aspectos...',
        metadata: {
          criteria: ['coesão', 'coerência', 'argumentação'],
          maxScore: 1000
        }
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao criar questão exemplo:', error);
    throw error;
  }
}

/**
 * Gera o prompt para um agente específico
 */
export function generateAgentPrompt(agentId: string, data: {
  text: string
  question: {
    title: string
    description: string
    subject: string
    theme?: string
    grading_rules?: any
  }
}) {
  const { text, question } = data

  switch (agentId) {
    case 'grammar-analysis':
      return `Analise o texto abaixo e forneça uma análise gramatical detalhada. Retorne o resultado em formato JSON com a seguinte estrutura:
{
  "score": number, // pontuação de 0 a 10
  "errors": [
    {
      "type": string, // tipo do erro (ortografia, concordância, etc)
      "description": string, // descrição do erro
      "suggestion": string // sugestão de correção
    }
  ],
  "analysis": string // análise geral da qualidade gramatical
}

Texto para análise:
${text}`;

    case 'coherence-analysis':
      return `Analise a coerência e coesão do texto abaixo. Retorne o resultado em formato JSON com a seguinte estrutura:
{
  "score": number, // pontuação de 0 a 10
  "coherence": {
    "score": number, // pontuação específica para coerência
    "analysis": string, // análise da coerência
    "issues": string[] // lista de problemas encontrados
  },
  "cohesion": {
    "score": number, // pontuação específica para coesão
    "analysis": string, // análise da coesão
    "issues": string[] // lista de problemas encontrados
  },
  "suggestions": string[] // sugestões de melhoria
}

Texto para análise:
${text}`;

    case 'theme-analysis':
      return `Analise o desenvolvimento do tema no texto abaixo. O tema é "${question.title}" e a proposta é "${question.description}".
Retorne o resultado em formato JSON com a seguinte estrutura:
{
  "score": number, // pontuação de 0 a 10
  "themeAdherence": {
    "score": number, // pontuação específica para aderência ao tema
    "analysis": string, // análise da aderência ao tema
    "keyPoints": string[] // principais pontos abordados
  },
  "argumentQuality": {
    "score": number, // pontuação específica para qualidade da argumentação
    "strengths": string[], // pontos fortes da argumentação
    "weaknesses": string[] // pontos fracos da argumentação
  },
  "suggestions": string[] // sugestões de melhoria
}

Texto para análise:
${text}`;

    case 'orchestrator':
      return `Compile os resultados das análises anteriores e gere um feedback final para o texto. Use os critérios de avaliação fornecidos:
${JSON.stringify(question.grading_rules, null, 2)}

Retorne o resultado em formato JSON com a seguinte estrutura:
{
  "score": number, // pontuação final de 0 a 100
  "feedback": string, // feedback geral
  "strengths": string[], // pontos fortes do texto
  "weaknesses": string[], // pontos fracos do texto
  "suggestions": string[] // sugestões de melhoria
}

Texto analisado:
${text}`;

    default:
      throw new Error(`Agente "${agentId}" não suportado`);
  }
} 