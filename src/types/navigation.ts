// Tipos básicos
export type ItemTipo = 'cidade' | 'escola' | 'tipo-ensino' | 'serie' | 'turma' | 'aluno';

// Interfaces base
export interface BaseItem {
  id: string;
  name: string;
}

// Interfaces de navegação
export interface ItemHierarquico {
  id: string;
  nome: string;
  tipo: ItemTipo;
  descricao: string;
}

export interface ItemSelecionado {
  id: string;
  nome: string;
  tipo: ItemTipo;
}

// Estado da navegação
export type NavigationState = Record<ItemTipo, ItemSelecionado | null>;

// Interfaces de dados
export interface City extends BaseItem {
  state: string;
}

export interface School extends BaseItem {
  type: 'public' | 'private';
  city_id: string;
  city?: {
    name: string;
  };
}

export interface EducationLevel extends BaseItem {}

export interface Grade extends BaseItem {
  education_level_id: string;
  education_level?: {
    name: string;
  };
}

export interface Class extends BaseItem {
  grade_id: string;
  year: number;
  grade?: {
    name: string;
  };
}

export interface Student extends BaseItem {
  email: string;
}

export interface StudentEnrollment {
  id: string;
  student_id: string;
  class_id: string;
  grade_id: string;
  education_level_id: string;
  school_id: string;
  ano: string;
  
  // Relacionamentos
  student?: {
    id: string;
    name: string;
    email: string;
  };
  class?: {
    id: string;
    name: string;
    year: number;
    grade?: {
      id: string;
      name: string;
      education_level?: {
        id: string;
        name: string;
      };
    };
  };
  school?: {
    id: string;
    name: string;
    type: 'public' | 'private';
    city?: {
      id: string;
      name: string;
      state: string;
    };
  };
}

// Tipos para queries
export interface NavigationQuery {
  cidade: null;
  escola: { city_id: string };
  'tipo-ensino': { school_id: string };
  serie: { education_level_id: string };
  turma: { grade_id: string };
  aluno: { class_id: string };
}

// Funções auxiliares para formatação
export function formatarItens(data: any[], tipo: ItemTipo): ItemHierarquico[] {
  if (!Array.isArray(data)) return [];
  
  return data.map(item => ({
    id: item.id,
    nome: item.name,
    tipo,
    descricao: getDescricao(item, tipo)
  }));
}

export function formatarItensUnicos(data: any[], tipo: ItemTipo): ItemHierarquico[] {
  const map = new Map<string, ItemHierarquico>();
  
  data.forEach(item => {
    const educationLevel = item.education_level;
    if (educationLevel && !map.has(educationLevel.id)) {
      map.set(educationLevel.id, {
        id: educationLevel.id,
        nome: educationLevel.name,
        tipo,
        descricao: `Nível: ${educationLevel.name}`
      });
    }
  });

  return Array.from(map.values());
}

function getDescricao(item: any, tipo: ItemTipo): string {
  if (!item) return '';
  
  switch (tipo) {
    case 'cidade':
      return `${item.name || ''} - ${item.state || ''}`;
    case 'escola':
      return `${item.type === 'public' ? 'Escola Pública' : 'Escola Particular'} - ${item.city?.name || ''}`;
    case 'serie':
      return `${item.education_level?.name || ''} - ${item.name}`;
    case 'turma':
      return `${item.grade?.name || ''} - Ano: ${item.year}`;
    case 'aluno':
      return `${item.email} - ${item.class?.grade?.name || ''}`;
    default:
      return item.name;
  }
}

export interface Cidade extends BaseItem {
  state: string;
}

export interface Escola extends BaseItem {
  city_id: string;
  type: 'public' | 'private';
}

export interface TipoEnsino extends BaseItem {
  code: string; // 'EF' | 'EM'
}

export interface Serie extends BaseItem {
  education_level_id: string;
  order: number; // 1, 2, 3...
}

export interface Turma extends BaseItem {
  grade_id: string;
  period: 'morning' | 'afternoon' | 'night';
}

export interface Professor extends BaseItem {
  email: string;
  subjects: string[];
}

export interface Aluno extends BaseItem {
  email: string;
  class_id: string;
}

export type NavigationLevel = 'cidade' | 'escola' | 'tipo-ensino' | 'serie' | 'turma' | 'professor' | 'aluno';

export interface NavigationData {
  cities: Array<{
    id: string
    name: string
    state: string
  }>
  schools: Array<{
    id: string
    name: string
    type: 'public' | 'private'
  }>
  grades: Array<{
    id: string
    name: string
    education_level_id: string
  }>
  classes: Array<{
    id: string
    name: string
    year: number
    grade_id: string
  }>
  students: Array<{
    id: string
    name: string
    email: string
    class_id: string
  }>
}

export interface GradeWithEducationLevel {
  id: string;
  name: string;
  education_levels: {
    id: string;
    name: string;
  }[];
}

export interface TeacherSchoolSubject {
  id: string
  grade_id: string
  school_id: string
  subjects: Array<{
    id: string
    name: string
  }>
  teachers: Array<{
    id: string
    name: string
  }>
}

export interface StudentClass {
  id: string
  student: {
    id: string
    name: string
    email: string
  }
  class: {
    id: string
    name: string
    grade: {
      id: string
      name: string
      education_level: {
        name: string
      }
    }
  }
}

export interface Class {
  id: string
  grade_id: string
  grades: {
    id: string
    name: string
    education_levels: {
      id: string
      name: string
    }
  }
}

export interface DatabaseSchema {
  students: {
    id: string;
    name: string;
    email: string;
  };
  student_class_enrollments: {
    id: string;
    student_id: string;
    class_id: string;
    created_at: Date;
  };
}

// Interfaces para navegação
export type NavigationLevel = 'cidade' | 'escola' | 'tipo-ensino' | 'serie' | 'turma' | 'aluno';

export interface NavigationItem {
  id: string;
  name: string;
  description: string;
  type: NavigationLevel;
}

export interface NavigationState {
  cidade?: NavigationItem;
  escola?: NavigationItem;
  'tipo-ensino'?: NavigationItem;
  serie?: NavigationItem;
  turma?: NavigationItem;
  aluno?: NavigationItem;
}

interface GradeResponse {
  id: string;
  name: string;
  education_level?: {
    id: string;
    name: string;
  };
}

interface EnrollmentWithGrade {
  grade: GradeResponse;
}

// Interfaces para dados do Supabase
export interface EnrollmentWithSchool {
  school?: {
    city?: {
      id: string;
      name: string;
      state: string;
    };
  };
} 