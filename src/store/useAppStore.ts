import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import { Answer, CorrectionResponse, Question, Student, StudentResponse } from '@/types/common';
import { correctAnswer } from '@/lib/ai'

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
}

interface Prompt {
  id: string;
  title: string;
  content: string;
  version: number;
  questionIds: string[];
  createdAt: string;
  updatedAt: string;
}

interface Correction {
  id: string;
  answer_id: string;
  prompt: string;
  score: number;
  feedback: string;
  details: any[];
  created_at: string;
  student_id?: string;
  student_name?: string;
}

interface City {
  id: string;
  name: string;
  state: string;
}

interface BatchCorrectionResult {
  success: boolean;
  studentId: string;
  questionId: string;
  correctionId?: string;
  error?: string;
}

interface AppState {
  prompts: Prompt[];
  loading: boolean;
  corrections: CorrectionResponse[];
  questions: Question[];
  answers: Answer[];
  studentAnswers: StudentAnswer[];
  corrections: Correction[];
  students: Student[];
  studentResponses: StudentResponse[];
  addPrompt: (prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePrompt: (id: string, data: Partial<Prompt>) => void;
  deletePrompt: (id: string) => void;
  addCorrection: (correctionData: {
    answer_id: string;
    prompt: string;
    score: number;
    feedback: string;
    details: any;
    student_id: string;
    student_name: string;
  }) => Promise<Correction>;
  deleteCorrection: (id: string) => void;
  addQuestion: (question: Omit<Question, 'id' | 'code' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateQuestion: (id: string, data: Partial<Question>) => Promise<void>;
  deleteQuestion: (id: string) => Promise<void>;
  addAnswer: (answer: {
    question_id: string;
    answer: string;
  }) => Promise<void>;
  getAnswerByQuestionId: (questionId: string) => Promise<Answer | undefined>;
  setQuestions: (questions: Question[]) => void;
  addStudentAnswer: (answer: Omit<StudentAnswer, 'id' | 'createdAt'>) => Promise<void>;
  getStudentAnswers: (questionId: string) => Promise<StudentAnswer[]>;
  getCorrections: (answerId: string) => Promise<Correction[]>;
  addStudent: (student: { name: string; email: string; }) => Promise<void>;
  getStudents: () => Promise<Student[]>;
  addStudentResponse: (responseData: {
    student_id: string;
    question_id: string;
    answer: string;
  }) => Promise<StudentResponse>;
  getStudentResponses: (questionId: string) => Promise<StudentResponse[]>;
  getStudentResponsesByStudent: (studentId: string) => Promise<StudentResponse[]>;
  getAnswers: (questionId: string) => Promise<Answer[]>;
  getCities: () => Promise<City[]>;
  getSchoolsByCity: (cityId: string) => Promise<Student[]>;
  supabase: typeof supabase;
  loadQuestions: () => Promise<void>;
  addBatchCorrections: (data: Array<{
    student_id: string;
    question_id: string;
    answer: string;
  }>) => Promise<BatchCorrectionResult[]>;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

interface AddStudentResponseData {
  student_id: string;
  question_id: string;
  answer: string;
}

const generateQuestionCode = (subject: string) => {
  const prefix = subject.substring(0, 3).toUpperCase()
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `${prefix}-${year}-${random}`
}

const validateQuestion = (question: Partial<Question>) => {
  if (question.type === 'redacao') {
    if (question.subject !== 'redacao') {
      throw new Error('Questões do tipo redação devem ter disciplina = redação')
    }
    if (!question.theme || !question.baseText) {
      throw new Error('Questões do tipo redação precisam ter tema e texto base')
    }
  }
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      prompts: [],
      loading: false,
      corrections: [],
      questions: [],
      answers: [],
      studentAnswers: [],
      corrections: [],
      students: [],
      studentResponses: [],
      supabase,
      isSidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),

      setQuestions: (questions) => set({ questions }),

      addPrompt: (promptData) => set((state) => ({
        prompts: [
          ...state.prompts,
          {
            ...promptData,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        ]
      })),
      updatePrompt: (id, data) => set((state) => ({
        prompts: state.prompts.map((prompt) =>
          prompt.id === id
            ? { ...prompt, ...data, updatedAt: new Date().toISOString() }
            : prompt
        )
      })),
      deletePrompt: (id) => set((state) => ({
        prompts: state.prompts.filter((prompt) => prompt.id !== id)
      })),
      addCorrection: async (correctionData) => {
        try {
          // 1. Criar correção inicial com status "processando"
          const { data: initialData, error: initialError } = await supabase
            .from('corrections')
            .insert({
              answer_id: correctionData.answer_id,
              prompt: correctionData.prompt,
              score: 0,
              feedback: "Em processamento...",
              details: [],
              student_id: correctionData.student_id,
              student_name: correctionData.student_name
            })
            .select('*')
            .single()

          if (initialError) {
            console.error('Erro inicial:', initialError)
            throw initialError
          }

          try {
            // 2. Enviar para correção no Gemini
            console.log('Iniciando correção com IA:', correctionData.prompt)
            const aiResult = await correctAnswer(correctionData.prompt)
            console.log('Resultado da IA:', aiResult)

            // 3. Atualizar correção com resultado
            const { data: updatedData, error: updateError } = await supabase
              .from('corrections')
              .update({
                score: aiResult.score,
                feedback: aiResult.feedback,
                details: aiResult.details
              })
              .eq('id', initialData.id)
              .select('*')
              .single()

            if (updateError) throw updateError

            return updatedData
          } catch (aiError) {
            // Se houver erro na IA, atualizar com erro
            const { data: errorData } = await supabase
              .from('corrections')
              .update({
                score: 0,
                feedback: "Erro na correção: " + (aiError.message || 'Erro desconhecido'),
                details: []
              })
              .eq('id', initialData.id)
              .select('*')
              .single()

            return errorData
          }
        } catch (error) {
          console.error('Erro ao salvar correção:', error)
          throw error
        }
      },
      deleteCorrection: (id) => set((state) => ({
        corrections: state.corrections.filter((c) => c.id !== id)
      })),
      addQuestion: async (questionData) => {
        try {
          validateQuestion(questionData)
          const code = generateQuestionCode(questionData.subject)
          
          const { data, error } = await supabase
            .from('questions')
            .insert({
              code,
              title: questionData.title,
              description: questionData.description,
              subject: questionData.subject,
              type: questionData.type,
              level: questionData.level,
              expected_answer: questionData.expectedAnswer,
              base_text: questionData.baseText,
              theme: questionData.theme,
              grading_rules: questionData.gradingRules
            })
            .select()
            .single()

          if (error) throw error

          set((state) => ({
            questions: [
              {
                id: data.id,
                code: data.code,
                title: data.title,
                description: data.description,
                subject: data.subject,
                type: data.type,
                level: data.level,
                expectedAnswer: data.expected_answer,
                baseText: data.base_text,
                theme: data.theme,
                gradingRules: data.grading_rules,
                createdAt: data.created_at,
                updatedAt: data.updated_at
              },
              ...state.questions
            ]
          }))
        } catch (error) {
          console.error('Erro ao salvar questão:', error)
          throw error
        }
      },
      updateQuestion: async (id: string, data: Partial<Question>) => {
        try {
          validateQuestion(data)
          
          const { error } = await supabase
            .from('questions')
            .update({
              title: data.title,
              description: data.description,
              subject: data.subject,
              type: data.type,
              level: data.level,
              expected_answer: data.expectedAnswer,
              base_text: data.baseText,
              theme: data.theme,
              grading_rules: data.gradingRules,
              updated_at: new Date().toISOString()
            })
            .eq('id', id)

          if (error) throw error

          set((state) => ({
            questions: state.questions.map((question) =>
              question.id === id
                ? { ...question, ...data, updatedAt: new Date().toISOString() }
                : question
            )
          }))
        } catch (error) {
          console.error('Erro ao atualizar questão:', error)
          throw error
        }
      },
      deleteQuestion: async (id) => {
        try {
          const { error } = await supabase
            .from('questions')
            .delete()
            .eq('id', id)

          if (error) throw error

          set((state) => ({
            questions: state.questions.filter((question) => question.id !== id)
          }))
        } catch (error) {
          console.error('Erro ao excluir questão:', error)
          throw error
        }
      },
      addAnswer: async (answerData) => {
        try {
          const { data, error } = await supabase
            .from('answers')
            .insert({
              question_id: answerData.question_id,
              answer: answerData.answer,
            })
            .select()
            .single()

          if (error) throw error

          set((state) => ({
            answers: [
              ...state.answers,
              {
                id: data.id,
                questionId: data.question_id,
                answer: data.answer,
                createdAt: data.created_at,
              }
            ]
          }))
        } catch (error) {
          console.error('Erro ao salvar resposta:', error)
        }
      },
      getAnswerByQuestionId: async (questionId) => {
        try {
          const { data, error } = await supabase
            .from('answers')
            .select('*')
            .eq('question_id', questionId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          if (error) {
            if (error.code === 'PGRST116') return undefined
            throw error
          }

          return {
            id: data.id,
            questionId: data.question_id,
            answer: data.answer,
            createdAt: data.created_at,
          }
        } catch (error) {
          console.error('Erro ao buscar resposta:', error)
          return undefined
        }
      },
      addStudentAnswer: async (answerData) => {
        try {
          const { data, error } = await supabase
            .from('student_answers')
            .insert({
              student_id: answerData.studentId,
              student_name: answerData.studentName,
              question_id: answerData.questionId,
              answer: answerData.answer
            })
            .select()
            .single()

          if (error) throw error

          const newAnswer: StudentAnswer = {
            id: data.id,
            studentId: data.student_id,
            studentName: data.student_name,
            questionId: data.question_id,
            answer: data.answer,
            createdAt: data.created_at
          }

          set((state) => ({
            studentAnswers: [...state.studentAnswers, newAnswer]
          }))
        } catch (error) {
          console.error('Erro ao salvar resposta:', error)
          throw error
        }
      },
      getStudentAnswers: async (questionId) => {
        try {
          const { data, error } = await supabase
            .from('student_answers')
            .select('*')
            .eq('question_id', questionId)
            .order('created_at', { ascending: false })

          if (error) throw error

          return data.map((item): StudentAnswer => ({
            id: item.id,
            studentId: item.student_id,
            studentName: item.student_name,
            questionId: item.question_id,
            answer: item.answer,
            createdAt: item.created_at
          }))
        } catch (error) {
          console.error('Erro ao buscar respostas:', error)
          return []
        }
      },
      addStudent: async (studentData) => {
        try {
          const { data, error } = await supabase
            .from('students')
            .insert({
              name: studentData.name,
              email: studentData.email,
            })
            .select()
            .single()

          if (error) throw error

          set((state) => ({
            students: [
              ...state.students,
              {
                id: data.id,
                name: data.name,
                email: data.email,
                created_at: data.created_at,
              },
            ]
          }))
        } catch (error) {
          console.error('Erro ao salvar aluno:', error)
          throw error
        }
      },
      getStudents: async () => {
        try {
          const { data, error } = await supabase
            .from('students')
            .select('*')

          if (error) throw error

          return data.map((item): Student => ({
            id: item.id,
            name: item.name,
            email: item.email,
            created_at: item.created_at,
          }))
        } catch (error) {
          console.error('Erro ao buscar alunos:', error)
          return []
        }
      },
      addStudentResponse: async (data: AddStudentResponseData) => {
        try {
          const { data: response, error } = await supabase
            .from('student_responses')
            .insert({
              student_id: data.student_id,
              question_id: data.question_id,
              answer: data.answer
            })
            .select('*')
            .single()

          if (error) throw error

          return response
        } catch (error) {
          console.error('Erro ao salvar resposta:', error)
          throw error
        }
      },
      getStudentResponses: async (questionId) => {
        try {
          const { data, error } = await supabase
            .from('student_responses')
            .select('*')
            .eq('question_id', questionId)
            .order('created_at', { ascending: false })

          if (error) throw error

          return data.map((item): StudentResponse => ({
            id: item.id,
            studentId: item.student_id,
            questionId: item.question_id,
            answer: item.answer,
            created_at: item.created_at,
          }))
        } catch (error) {
          console.error('Erro ao buscar respostas:', error)
          return []
        }
      },
      getStudentResponsesByStudent: async (studentId) => {
        try {
          const { data, error } = await supabase
            .from('student_responses')
            .select('*')
            .eq('student_id', studentId)
            .order('created_at', { ascending: false })

          if (error) throw error

          return data.map((item): StudentResponse => ({
            id: item.id,
            studentId: item.student_id,
            questionId: item.question_id,
            answer: item.answer,
            created_at: item.created_at,
          }))
        } catch (error) {
          console.error('Erro ao buscar respostas:', error)
          return []
        }
      },
      getAnswers: async (questionId) => {
        try {
          const { data, error } = await supabase
            .from('answers')
            .select('*')
            .eq('question_id', questionId)
            .order('created_at', { ascending: false })

          if (error) throw error

          return data.map((item): Answer => ({
            id: item.id,
            questionId: item.question_id,
            answer: item.answer,
            createdAt: item.created_at,
          }))
        } catch (error) {
          console.error('Erro ao buscar respostas:', error)
          return []
        }
      },
      getCorrections: async (answerId) => {
        try {
          const { data, error } = await supabase
            .from('corrections')
            .select('*')
            .eq('answer_id', answerId)
            .order('created_at', { ascending: false })

          if (error) throw error

          return data.map((item): Correction => ({
            id: item.id,
            answer_id: item.answer_id,
            prompt: item.prompt,
            score: item.score,
            feedback: item.feedback,
            details: item.details,
            created_at: item.created_at,
            student_id: item.student_id,
            student_name: item.student_name
          }))
        } catch (error) {
          console.error('Erro ao buscar correções:', error)
          return []
        }
      },
      getCities: async () => {
        try {
          const { data, error } = await supabase
            .from('cities')
            .select('*')
            .order('name')

          if (error) throw error
          return data
        } catch (error) {
          console.error('Erro ao buscar cidades:', error)
          return []
        }
      },
      getSchoolsByCity: async (cityId: string) => {
        try {
          const { data, error } = await supabase
            .from('schools')
            .select('*')
            .eq('city_id', cityId)
            .order('name')

          if (error) throw error
          return data
        } catch (error) {
          console.error('Erro ao buscar escolas:', error)
          return []
        }
      },
      loadQuestions: async () => {
        try {
          const { data, error } = await supabase
            .from('questions')
            .select(`
              id,
              code,
              title,
              description,
              type,
              subject,
              level,
              expected_answer,
              base_text,
              theme,
              grading_rules,
              created_at,
              updated_at
            `)
            .order('created_at', { ascending: false })

          if (error) {
            console.error('Erro ao carregar questões:', error)
            throw error
          }

          set({ questions: data || [] })
        } catch (error) {
          console.error('Erro ao carregar questões:', error)
          throw error
        }
      },
      addBatchCorrections: async (data) => {
        const results: BatchCorrectionResult[] = [];
        
        for (const item of data) {
          try {
            // 1. Adicionar resposta do estudante
            const response = await get().addStudentResponse({
              student_id: item.student_id,
              question_id: item.question_id,
              answer: item.answer
            });

            // 2. Criar correção
            const correction = await get().addCorrection({
              answer_id: response.id,
              prompt: item.answer,
              score: 0,
              feedback: "Em processamento...",
              details: {},
              student_id: item.student_id,
              student_name: 'Aluno'
            });

            results.push({
              success: true,
              studentId: item.student_id,
              questionId: item.question_id,
              correctionId: correction.id
            });

          } catch (error) {
            console.error('Erro no processamento em lote:', error);
            results.push({
              success: false,
              studentId: item.student_id,
              questionId: item.question_id,
              error: error instanceof Error ? error.message : 'Erro desconhecido'
            });
          }

          // Pequena pausa para não sobrecarregar a API
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        return results;
      },
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        questions: state.questions,
        studentAnswers: state.studentAnswers,
        corrections: state.corrections,
        students: state.students,
        studentResponses: state.studentResponses
      }),
    }
  )
); 