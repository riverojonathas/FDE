import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'
import type { Database, Json } from './schema'
import { Database as SupabaseDatabase } from './types'

// Tipagem para os dados de correção
export interface CorrectionData {
  id: string
  student_id?: string
  question_id?: string
  input: {
    text: string
    student_id?: string
    question_id?: string
    options?: Record<string, any>
  }
  result?: {
    textAnalysis: any
    criteriaAnalysis: any
    plagiarismResult?: any
    feedback: any
  }
  metadata: {
    student_id?: string
    question_id?: string
    created_at: string
    processing_time?: number
    word_count?: number
    version: string
    status: 'complete' | 'partial' | 'error'
    error?: string
  }
  human_review?: {
    reviewed: boolean
    reviewedBy?: string
    reviewedAt?: string
    adjustedScore?: number
    comments?: string
    status?: 'approved' | 'rejected' | 'adjusted'
  }
  created_at?: string
  updated_at?: string
  reviewed_at?: string
  reviewed_by?: string
}

// Tipagem para os dados de aluno
export interface StudentData {
  id: string
  name: string
  email?: string
  class_id?: string
  metadata?: Record<string, any>
  created_at?: string
  updated_at?: string
  active?: boolean
}

// Tipagem para os dados de questão
export interface QuestionData {
  id: string
  title: string
  description?: string
  type: 'redação' | 'dissertativa' | 'discursiva' | 'argumentativa'
  criteria?: any[]
  max_score?: number
  metadata?: Record<string, any>
  created_at?: string
  updated_at?: string
  created_by?: string
  active?: boolean
}

// Tipagem para os dados de classe/turma
export interface ClassData {
  id: string
  name: string
  description?: string
  created_at?: string
  updated_at?: string
  active?: boolean
}

// Tipagem para configurações do sistema
export interface SystemSettingData {
  id: string
  name: string
  value: any
  description?: string
  updated_at?: string
  updated_by?: string
}

// Essa verificação garante que o código é executado apenas no navegador
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Verificar se as variáveis de ambiente estão disponíveis
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Variáveis de ambiente do Supabase não encontradas. Verifique seu arquivo .env.local',
    { supabaseUrl: !!supabaseUrl, supabaseAnonKey: !!supabaseAnonKey }
  )
}

// Variável global para armazenar a instância única do cliente
// Usando Symbol para garantir um identificador único global
const SUPABASE_INSTANCE_KEY = Symbol.for('app.supabase.instance');

// Função para obter a instância do cliente Supabase usando padrão singleton
export const getSupabaseClient = () => {
  const globalWithInstance = global as any;
  
  // Verifica se já existe uma instância criada
  if (!globalWithInstance[SUPABASE_INSTANCE_KEY]) {
    console.log('Inicializando instância única do cliente Supabase...');
    
    // Cria uma nova instância
    globalWithInstance[SUPABASE_INSTANCE_KEY] = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  
  return globalWithInstance[SUPABASE_INSTANCE_KEY];
}

// Exporta a instância do cliente para compatibilidade com código existente
export const supabase = getSupabaseClient();

// Função de teste para verificar a conexão
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('corrections').select('count').limit(1);
    console.log('=== TESTE DE CONEXÃO SUPABASE ===', { 
      data, 
      error, 
      key: !!supabaseAnonKey,
      url: supabaseUrl
    });
    return { success: !error, data, error };
  } catch (e) {
    console.error('Erro ao testar conexão com Supabase:', e);
    return { success: false, error: e };
  }
}

// Tipos exportados
export type Tables = SupabaseDatabase['public']['Tables']
export type CorrectionRow = Tables['corrections']['Row']
export type StudentRow = Tables['students']['Row']
export type QuestionRow = Tables['questions']['Row']
export type ClassRow = Tables['classes']['Row']
export type EvaluatorRow = Tables['evaluators']['Row']
export type SystemSettingRow = Tables['system_settings']['Row']
export type ReferenceTextRow = Tables['reference_texts']['Row']

// Interfaces específicas para facilitar o uso
export interface CorrectionFilter {
  studentId?: string
  questionId?: string
  startDate?: string
  endDate?: string
  reviewed?: boolean
}

export interface StudentFilter {
  classId?: string
  active?: boolean
  searchTerm?: string
}

export interface QuestionFilter {
  type?: string
  active?: boolean
  searchTerm?: string
}

// Classe para gerenciar operações relacionadas a correções
export class CorrectionManager {
  /**
   * Salva uma nova correção ou atualiza uma existente
   * @param correction Dados da correção
   * @returns ID da correção
   */
  static async saveCorrection(correction: CorrectionData): Promise<string> {
    const { data, error } = await supabase
      .from('corrections')
      .upsert(correction)
      .select('id')
      .single()

    if (error) {
      console.error('Erro ao salvar correção:', error)
      throw new Error(`Falha ao salvar correção: ${error.message}`)
    }

    return data.id
  }

  /**
   * Obtém uma correção pelo ID
   * @param id ID da correção
   * @returns Dados da correção
   */
  static async getCorrection(id: string): Promise<CorrectionData | null> {
    const { data, error } = await supabase
      .from('corrections')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // PGRST116 é o código de "não encontrado"
        return null
      }
      console.error('Erro ao buscar correção:', error)
      throw new Error(`Falha ao buscar correção: ${error.message}`)
    }

    return data as CorrectionData
  }

  /**
   * Registra uma revisão humana para uma correção
   * @param correctionId ID da correção
   * @param reviewData Dados da revisão
   * @returns Verdadeiro se bem-sucedido
   */
  static async reviewCorrection(
    correctionId: string,
    reviewData: {
      reviewedBy: string
      adjustedScore?: number
      comments?: string
      status: 'approved' | 'rejected' | 'adjusted'
    }
  ): Promise<boolean> {
    const humanReview = {
      reviewed: true,
      reviewedBy: reviewData.reviewedBy,
      reviewedAt: new Date().toISOString(),
      adjustedScore: reviewData.adjustedScore,
      comments: reviewData.comments,
      status: reviewData.status
    }

    const { error } = await supabase
      .from('corrections')
      .update({
        human_review: humanReview,
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewData.reviewedBy
      })
      .eq('id', correctionId)

    if (error) {
      console.error('Erro ao revisar correção:', error)
      throw new Error(`Falha ao revisar correção: ${error.message}`)
    }

    return true
  }

  /**
   * Obtém as correções de um aluno
   * @param studentId ID do aluno
   * @param limit Limite de resultados (padrão: 10)
   * @returns Lista de correções
   */
  static async getStudentCorrections(
    studentId: string,
    limit = 10
  ): Promise<CorrectionData[]> {
    const { data, error } = await supabase
      .from('corrections')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Erro ao buscar correções do aluno:', error)
      throw new Error(`Falha ao buscar correções: ${error.message}`)
    }

    return data as CorrectionData[]
  }

  /**
   * Obtém as correções para uma questão específica
   * @param questionId ID da questão
   * @param limit Limite de resultados (padrão: 20)
   * @returns Lista de correções
   */
  static async getQuestionCorrections(
    questionId: string,
    limit = 20
  ): Promise<CorrectionData[]> {
    const { data, error } = await supabase
      .from('corrections')
      .select('*')
      .eq('question_id', questionId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Erro ao buscar correções da questão:', error)
      throw new Error(`Falha ao buscar correções: ${error.message}`)
    }

    return data as CorrectionData[]
  }

  /**
   * Busca correções com filtros
   * @param filters Filtros de busca
   * @returns Dados das correções e contagem total
   */
  static async searchCorrections(filters: {
    studentId?: string
    questionId?: string
    status?: 'complete' | 'partial' | 'error'
    reviewStatus?: 'approved' | 'rejected' | 'adjusted' | 'pending'
    dateFrom?: string
    dateTo?: string
    limit?: number
    offset?: number
  }): Promise<{ data: CorrectionData[]; count: number }> {
    let query = supabase
      .from('corrections')
      .select('*', { count: 'exact' })

    // Aplica filtros
    if (filters.studentId) {
      query = query.eq('student_id', filters.studentId)
    }

    if (filters.questionId) {
      query = query.eq('question_id', filters.questionId)
    }

    if (filters.status) {
      query = query.eq('metadata->status', filters.status)
    }

    if (filters.reviewStatus) {
      if (filters.reviewStatus === 'pending') {
        query = query.is('reviewed_at', null)
      } else {
        query = query.eq('human_review->status', filters.reviewStatus)
      }
    }

    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom)
    }

    if (filters.dateTo) {
      query = query.lte('created_at', filters.dateTo)
    }

    // Paginação
    query = query.order('created_at', { ascending: false })
    
    if (filters.limit) {
      query = query.limit(filters.limit)
    }
    
    if (filters.offset) {
      query = query.range(
        filters.offset,
        filters.offset + (filters.limit || 10) - 1
      )
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Erro ao buscar correções:', error)
      throw new Error(`Falha ao buscar correções: ${error.message}`)
    }

    return {
      data: (data as CorrectionData[]) || [],
      count: count || 0
    }
  }
}

// Classe para gerenciar operações relacionadas a alunos
export class StudentManager {
  /**
   * Salva um novo aluno ou atualiza um existente
   * @param student Dados do aluno
   * @returns ID do aluno
   */
  static async saveStudent(student: StudentData): Promise<string> {
    const { data, error } = await supabase
      .from('students')
      .upsert(student)
      .select('id')
      .single()

    if (error) {
      console.error('Erro ao salvar aluno:', error)
      throw new Error(`Falha ao salvar aluno: ${error.message}`)
    }

    return data.id
  }

  /**
   * Obtém um aluno pelo ID
   * @param id ID do aluno
   * @returns Dados do aluno
   */
  static async getStudent(id: string): Promise<StudentData | null> {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      console.error('Erro ao buscar aluno:', error)
      throw new Error(`Falha ao buscar aluno: ${error.message}`)
    }

    return data as StudentData
  }

  /**
   * Obtém alunos de uma turma
   * @param classId ID da turma
   * @returns Lista de alunos
   */
  static async getClassStudents(classId: string): Promise<StudentData[]> {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('class_id', classId)
      .eq('active', true)
      .order('name')

    if (error) {
      console.error('Erro ao buscar alunos da turma:', error)
      throw new Error(`Falha ao buscar alunos: ${error.message}`)
    }

    return data as StudentData[]
  }

  /**
   * Busca alunos por nome
   * @param name Nome para busca
   * @param limit Limite de resultados
   * @returns Lista de alunos
   */
  static async searchStudents(
    name: string,
    limit = 10
  ): Promise<StudentData[]> {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .ilike('name', `%${name}%`)
      .eq('active', true)
      .order('name')
      .limit(limit)

    if (error) {
      console.error('Erro ao buscar alunos:', error)
      throw new Error(`Falha ao buscar alunos: ${error.message}`)
    }

    return data as StudentData[]
  }
}

// Classe para gerenciar operações relacionadas a questões
export class QuestionManager {
  /**
   * Salva uma nova questão ou atualiza uma existente
   * @param question Dados da questão
   * @returns ID da questão
   */
  static async saveQuestion(question: QuestionData): Promise<string> {
    const { data, error } = await supabase
      .from('questions')
      .upsert(question)
      .select('id')
      .single()

    if (error) {
      console.error('Erro ao salvar questão:', error)
      throw new Error(`Falha ao salvar questão: ${error.message}`)
    }

    return data.id
  }

  /**
   * Obtém uma questão pelo ID
   * @param id ID da questão
   * @returns Dados da questão
   */
  static async getQuestion(id: string): Promise<QuestionData | null> {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('id', id)
      .eq('active', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      console.error('Erro ao buscar questão:', error)
      throw new Error(`Falha ao buscar questão: ${error.message}`)
    }

    return data as QuestionData
  }

  /**
   * Obtém questões por tipo
   * @param type Tipo da questão
   * @param limit Limite de resultados
   * @returns Lista de questões
   */
  static async getQuestionsByType(
    type: string,
    limit = 20
  ): Promise<QuestionData[]> {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('type', type)
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Erro ao buscar questões:', error)
      throw new Error(`Falha ao buscar questões: ${error.message}`)
    }

    return data as QuestionData[]
  }

  /**
   * Busca questões por título
   * @param title Título para busca
   * @param limit Limite de resultados
   * @returns Lista de questões
   */
  static async searchQuestions(
    title: string,
    limit = 10
  ): Promise<QuestionData[]> {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .ilike('title', `%${title}%`)
      .eq('active', true)
      .order('title')
      .limit(limit)

    if (error) {
      console.error('Erro ao buscar questões:', error)
      throw new Error(`Falha ao buscar questões: ${error.message}`)
    }

    return data as QuestionData[]
  }
}

// Classe para gerenciar operações relacionadas a turmas
export class ClassManager {
  /**
   * Salva uma nova turma ou atualiza uma existente
   * @param classData Dados da turma
   * @returns ID da turma
   */
  static async saveClass(classData: ClassData): Promise<string> {
    const { data, error } = await supabase
      .from('classes')
      .upsert(classData)
      .select('id')
      .single()

    if (error) {
      console.error('Erro ao salvar turma:', error)
      throw new Error(`Falha ao salvar turma: ${error.message}`)
    }

    return data.id
  }

  /**
   * Obtém uma turma pelo ID
   * @param id ID da turma
   * @returns Dados da turma
   */
  static async getClass(id: string): Promise<ClassData | null> {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('id', id)
      .eq('active', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      console.error('Erro ao buscar turma:', error)
      throw new Error(`Falha ao buscar turma: ${error.message}`)
    }

    return data as ClassData
  }

  /**
   * Obtém todas as turmas ativas
   * @returns Lista de turmas
   */
  static async getAllClasses(): Promise<ClassData[]> {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('active', true)
      .order('name')

    if (error) {
      console.error('Erro ao buscar turmas:', error)
      throw new Error(`Falha ao buscar turmas: ${error.message}`)
    }

    return data as ClassData[]
  }
}

// Classe para gerenciar operações relacionadas a estatísticas
export class StatisticsManager {
  /**
   * Obtém estatísticas gerais do sistema
   * @returns Dados estatísticos
   */
  static async getSystemStats(): Promise<{
    totalStudents: number
    totalClasses: number
    totalQuestions: number
    totalCorrections: number
  }> {
    // Consulta o número de alunos ativos
    const { count: studentsCount, error: studentsError } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('active', true)

    if (studentsError) {
      console.error('Erro ao contar alunos:', studentsError)
    }

    // Consulta o número de turmas ativas
    const { count: classesCount, error: classesError } = await supabase
      .from('classes')
      .select('*', { count: 'exact', head: true })
      .eq('active', true)

    if (classesError) {
      console.error('Erro ao contar turmas:', classesError)
    }

    // Consulta o número de questões ativas
    const { count: questionsCount, error: questionsError } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('active', true)

    if (questionsError) {
      console.error('Erro ao contar questões:', questionsError)
    }

    // Consulta o número total de correções
    const { count: correctionsCount, error: correctionsError } = await supabase
      .from('corrections')
      .select('*', { count: 'exact', head: true })

    if (correctionsError) {
      console.error('Erro ao contar correções:', correctionsError)
    }

    return {
      totalStudents: studentsCount || 0,
      totalClasses: classesCount || 0,
      totalQuestions: questionsCount || 0,
      totalCorrections: correctionsCount || 0
    }
  }

  /**
   * Obtém estatísticas de correção para um aluno
   * @param studentId ID do aluno
   * @returns Estatísticas do aluno
   */
  static async getStudentStats(studentId: string): Promise<{
    totalCorrections: number
    averageScore: number
    bestScore: number
    recentScores: { date: string; score: number }[]
  }> {
    // Consulta todas as correções do aluno
    const { data, error } = await supabase
      .from('corrections')
      .select('*')
      .eq('student_id', studentId)
      .eq('metadata->status', 'complete')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar correções do aluno:', error)
      throw new Error(`Falha ao buscar estatísticas: ${error.message}`)
    }

    const corrections = data as CorrectionData[]
    const scores = corrections.map(c => {
      // Usa a nota ajustada da revisão humana, se disponível
      const humanScore = c.human_review?.adjustedScore
      // Ou a nota calculada pelo sistema
      const systemScore = c.result?.feedback?.finalScore
      return humanScore !== undefined ? humanScore : systemScore || 0
    })

    const totalCorrections = corrections.length
    const averageScore =
      scores.length > 0
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length
        : 0
    const bestScore = scores.length > 0 ? Math.max(...scores) : 0

    // Últimos 5 resultados para gráfico de evolução
    const recentScores = corrections
      .slice(0, 5)
      .map(c => ({
        date: c.created_at || '',
        score:
          c.human_review?.adjustedScore !== undefined
            ? c.human_review.adjustedScore
            : c.result?.feedback?.finalScore || 0
      }))
      .reverse()

    return {
      totalCorrections,
      averageScore,
      bestScore,
      recentScores
    }
  }
}

// Classe para gerenciar configurações do sistema
export class SystemSettingsManager {
  /**
   * Obtém uma configuração do sistema pelo ID
   * @param id ID da configuração
   * @returns Valor da configuração
   */
  static async getSetting(id: string): Promise<any> {
    const { data, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      console.error('Erro ao buscar configuração:', error)
      throw new Error(`Falha ao buscar configuração: ${error.message}`)
    }

    return data.value
  }

  /**
   * Salva uma configuração do sistema
   * @param setting Dados da configuração
   * @returns ID da configuração
   */
  static async saveSetting(setting: SystemSettingData): Promise<string> {
    const { data, error } = await supabase
      .from('system_settings')
      .upsert(setting)
      .select('id')
      .single()

    if (error) {
      console.error('Erro ao salvar configuração:', error)
      throw new Error(`Falha ao salvar configuração: ${error.message}`)
    }

    return data.id
  }

  /**
   * Obtém todas as configurações do sistema
   * @returns Lista de configurações
   */
  static async getAllSettings(): Promise<SystemSettingData[]> {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .order('name')

    if (error) {
      console.error('Erro ao buscar configurações:', error)
      throw new Error(`Falha ao buscar configurações: ${error.message}`)
    }

    return data as SystemSettingData[]
  }
}

// Exporta as instâncias para uso direto
export const correctionManagerInstance = new CorrectionManager()
export const studentManager = new StudentManager()
export const questionManager = new QuestionManager()
export const classManager = new ClassManager()
export const systemSettingsManager = new SystemSettingsManager()
export const statisticsManager = new StatisticsManager()

// Funções auxiliares para interagir com o Supabase

/**
 * Salva uma correção manual no banco de dados
 */
export async function saveManualCorrection(correctionData: {
  id: string;
  student_id?: string;
  theme_id: string;
  text_content: string;
  status: string;
  metadata: any;
}) {
  const { data, error } = await supabase
    .from('corrections')
    .insert(correctionData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Salva o resultado de um agente de análise no banco de dados
 */
export async function saveAgentResult(resultData: {
  correction_id: string;
  agent_id: string;
  result: any;
  raw_response: string;
  prompt_used: string;
  execution_time_ms: number;
  model_info: any;
}) {
  const { data, error } = await supabase
    .from('agent_executions')
    .insert(resultData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Obtém uma correção pelo ID
 */
export async function getCorrectionById(correctionId: string) {
  const { data, error } = await supabase
    .from('corrections')
    .select('*, agent_executions(*)')
    .eq('id', correctionId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Lista todas as correções com filtros opcionais
 */
export async function listCorrections(filters?: {
  status?: string;
  theme_id?: string;
  student_id?: string;
  limit?: number;
  offset?: number;
}) {
  let query = supabase
    .from('corrections')
    .select('*, themes(title), students(name)', { count: 'exact' });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  
  if (filters?.theme_id) {
    query = query.eq('theme_id', filters.theme_id);
  }
  
  if (filters?.student_id) {
    query = query.eq('student_id', filters.student_id);
  }
  
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  
  if (filters?.offset) {
    query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1);
  }

  const { data, error, count } = await query;

  if (error) throw error;
  return { data, count };
}

/**
 * Atualiza o status de uma correção
 */
export async function updateCorrectionStatus(correctionId: string, status: string) {
  const { data, error } = await supabase
    .from('corrections')
    .update({ status })
    .eq('id', correctionId)
    .select()
    .single();

  if (error) throw error;
  return data;
} 