import { createClient } from '@supabase/supabase-js'

console.log('=== CONFIGURANDO SUPABASE ===');
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Erro: Variáveis de ambiente do Supabase não definidas');
  throw new Error('Supabase URL and Anon Key must be defined');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Teste de conexão imediato
supabase.from('cities').select('*')
  .then(({ data, error }) => {
    console.log('=== TESTE DE CONEXÃO SUPABASE ===', { 
      data, 
      error,
      count: data?.length || 0 
    });
  })
  .catch(error => {
    console.error('Erro no teste de conexão:', error);
  });

// Função para testar a conexão
export async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('cities')
      .select('*');

    console.log('Teste de conexão detalhado:', { 
      success: !error,
      dataExists: !!data,
      count: data?.length || 0,
      firstItem: data?.[0],
      error 
    });

    if (error) {
      console.error('Erro na conexão:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao conectar:', error);
    return false;
  }
}

// Função para verificar se há dados na tabela cities
export async function checkCitiesData() {
  try {
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Erro ao verificar dados:', error);
      return false;
    }

    console.log('Dados encontrados:', data);
    return data && data.length > 0;
  } catch (error) {
    console.error('Erro ao verificar dados:', error);
    return false;
  }
}

export async function criarMatricula(
  studentId: string, 
  classId: string, 
  gradeId: string
) {
  const { data, error } = await supabase
    .from('student_class_enrollments')
    .insert({
      student_id: studentId,
      class_id: classId,
      grade_id: gradeId
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function obterAlunosDaTurma(classId: string) {
  const { data, error } = await supabase
    .from('student_class_enrollments')
    .select(`
      student:student_id (
        id,
        name,
        email
      )
    `)
    .eq('class_id', classId);

  if (error) throw error;
  return data;
}

export async function obterTurmasDoAluno(studentId: string) {
  const { data, error } = await supabase
    .from('student_class_enrollments')
    .select(`
      class:class_id (
        id,
        name,
        grade:grade_id (
          name,
          education_level:education_level_id (
            name
          )
        )
      )
    `)
    .eq('student_id', studentId);

  if (error) throw error;
  return data;
}

export async function fetchCidades() {
  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .order('name')

  if (error) throw error
  return data
}

export async function fetchEscolas(cidadeId: string) {
  const { data, error } = await supabase
    .from('schools')
    .select(`
      id,
      name,
      city:cities(
        id,
        name,
        state
      )
    `)
    .eq('city_id', cidadeId)
    .order('name')

  if (error) throw error
  return data
}

export async function fetchTurmas(serieId: string) {
  const { data, error } = await supabase
    .from('classes')
    .select(`
      id,
      name,
      period,
      grade:grades(
        id,
        name,
        education_level:education_levels(
          id,
          name
        )
      )
    `)
    .eq('grade_id', serieId)
    .order('name')

  if (error) throw error
  return data
}

export async function fetchAlunos(turmaId: string) {
  const { data, error } = await supabase
    .from('student_class_enrollments')
    .select(`
      student:students(
        id,
        name,
        email,
        registration_number
      )
    `)
    .eq('class_id', turmaId)
    .order('student(name)')

  if (error) throw error
  return data?.map(d => d.student) || []
} 