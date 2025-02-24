export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      questions: {
        Row: {
          id: string
          code: string
          title: string
          description: string
          subject: 'matematica' | 'portugues' | 'historia' | 'geografia' | 'ciencias' | 'redacao'
          type: 'dissertativa' | 'redacao'
          level: 'facil' | 'medio' | 'dificil'
          expected_answer: string
          base_text: string | null
          theme: string | null
          grading_rules: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          title: string
          description: string
          subject: 'matematica' | 'portugues' | 'historia' | 'geografia' | 'ciencias' | 'redacao'
          type: 'dissertativa' | 'redacao'
          level: 'facil' | 'medio' | 'dificil'
          expected_answer: string
          base_text?: string | null
          theme?: string | null
          grading_rules: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          title?: string
          description?: string
          subject?: 'matematica' | 'portugues' | 'historia' | 'geografia' | 'ciencias' | 'redacao'
          type?: 'dissertativa' | 'redacao'
          level?: 'facil' | 'medio' | 'dificil'
          expected_answer?: string
          base_text?: string | null
          theme?: string | null
          grading_rules?: Json
          created_at?: string
          updated_at?: string
        }
      }
      // ... outras tabelas
    }
  }
} 