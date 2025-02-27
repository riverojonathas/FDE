export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

/**
 * Definição de tipos para o Supabase
 */
export interface Database {
  public: {
    Tables: {
      corrections: {
        Row: {
          id: string
          created_at: string
          student_id: string | null
          theme_id: string
          text_content: string
          status: string
          review_status: string | null
          score: number | null
          metadata: Json
          updated_at: string | null
        }
        Insert: {
          id: string
          created_at?: string
          student_id?: string | null
          theme_id: string
          text_content: string
          status: string
          review_status?: string | null
          score?: number | null
          metadata: Json
          updated_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          student_id?: string | null
          theme_id?: string
          text_content?: string
          status?: string
          review_status?: string | null
          score?: number | null
          metadata?: Json
          updated_at?: string | null
        }
      }
      agent_executions: {
        Row: {
          id: string
          created_at: string
          correction_id: string
          agent_id: string
          result: Json
          raw_response: string
          prompt_used: string
          execution_time_ms: number
          model_info: Json
        }
        Insert: {
          id?: string
          created_at?: string
          correction_id: string
          agent_id: string
          result: Json
          raw_response: string
          prompt_used: string
          execution_time_ms: number
          model_info: Json
        }
        Update: {
          id?: string
          created_at?: string
          correction_id?: string
          agent_id?: string
          result?: Json
          raw_response?: string
          prompt_used?: string
          execution_time_ms?: number
          model_info?: Json
        }
      }
      themes: {
        Row: {
          id: string
          title: string
          description: string
          created_at: string
          category: string | null
          expected_points: Json | null
          difficulty: string | null
          active: boolean
        }
        Insert: {
          id?: string
          title: string
          description: string
          created_at?: string
          category?: string | null
          expected_points?: Json | null
          difficulty?: string | null
          active?: boolean
        }
        Update: {
          id?: string
          title?: string
          description?: string
          created_at?: string
          category?: string | null
          expected_points?: Json | null
          difficulty?: string | null
          active?: boolean
        }
      }
      students: {
        Row: {
          id: string
          name: string
          email: string | null
          created_at: string
          class_id: string | null
          metadata: Json | null
          active: boolean
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          created_at?: string
          class_id?: string | null
          metadata?: Json | null
          active?: boolean
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          created_at?: string
          class_id?: string | null
          metadata?: Json | null
          active?: boolean
        }
      }
      classes: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          teacher_id: string | null
          active: boolean
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          teacher_id?: string | null
          active?: boolean
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          teacher_id?: string | null
          active?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 