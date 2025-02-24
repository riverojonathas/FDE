export interface IUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
}

export interface IQuestion {
  id: string;
  title: string;
  description: string;
  promptId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPrompt {
  id: string;
  title: string;
  content: string;
  version: number;
  questionIds: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface IStudentResponse {
  id: string;
  questionId: string;
  studentId: string;
  content: string;
  platform: string;
  metadata: {
    examId: string;
    timestamp: string;
    platformData: Record<string, unknown>;
  };
  createdAt: Date;
}

export interface Answer {
  id: string;
  question_id: string;
  answer: string;
  created_at: string;
}

export interface CorrectionResponse {
  score: number;
  feedback: string;
  details: string[];
}

export interface BaseGradingRules {
  content: number;
  clarity: number;
  grammar: number;
  structure: number;
}

export interface EssayGradingRules {
  competencia1: number; // Domínio da norma culta
  competencia2: number; // Compreensão da proposta
  competencia3: number; // Argumentação
  competencia4: number; // Coesão textual
  competencia5: number; // Proposta de intervenção
}

export interface Question {
  id: string;
  code: string;
  title: string;
  description: string;
  subject: string;
  type: string;
  level: string;
  expected_answer: string;
  base_text?: string;
  theme?: string;
  grading_rules: any;
  created_at: string;
  updated_at: string;
}

export type CreateQuestionInput = Omit<Question, 'id' | 'code' | 'created_at' | 'updated_at'>

export interface StudentAnswer {
  id: string;
  student_id: string;
  student_name: string;
  question_id: string;
  answer: string;
  created_at: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  school_id: string;
  grade_id: string;
  created_at: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  subjects: {
    id: string;
    name: string;
  }[];
  schools: {
    id: string;
    name: string;
  }[];
  created_at: string;
}

export interface School {
  id: string;
  name: string;
  city_id: string;
  type: 'public' | 'private';
  created_at: string;
}

export interface StudentResponse {
  id: string;
  student_id: string;
  question_id: string;
  answer: string;
  created_at: string;
}

export interface Correction {
  id: string;
  answer_id: string;
  prompt: string;
  score: number;
  feedback: string;
  details: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    annotations: {
      text: string;
      type: 'correct' | 'incorrect' | 'suggestion';
      comment: string;
    }[];
  };
  created_at: string;
  student_id?: string;
  student_name?: string;
}

export interface BatchCorrectionResult {
  success: boolean;
  corrections: Correction[];
  errors?: string[];
}

export interface CorrectionStatus {
  studentName: string;
  status: 'pending' | 'completed' | 'error';
  score?: number;
  feedback?: string;
  correction?: Correction;
  response?: StudentResponse;
}

export interface CorrectionResult {
  score: number;
  feedback: string;
  details: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    annotations: {
      text: string;
      type: 'correct' | 'incorrect' | 'suggestion';
      comment: string;
    }[];
  };
  processingTime: number;
  type: 'redacao' | 'resposta';
} 