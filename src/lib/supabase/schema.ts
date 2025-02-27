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
      classes: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
          active: boolean
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
          active?: boolean
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
          active?: boolean
        }
        Relationships: []
      }
      students: {
        Row: {
          id: string
          name: string
          email: string | null
          class_id: string | null
          metadata: Json
          created_at: string
          updated_at: string
          active: boolean
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          class_id?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
          active?: boolean
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          class_id?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
          active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          }
        ]
      }
      evaluators: {
        Row: {
          id: string
          name: string
          email: string | null
          role: string
          metadata: Json
          created_at: string
          updated_at: string
          active: boolean
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          role?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
          active?: boolean
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          role?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
          active?: boolean
        }
        Relationships: []
      }
      questions: {
        Row: {
          id: string
          title: string
          description: string | null
          type: string
          criteria: Json
          max_score: number
          metadata: Json
          created_at: string
          updated_at: string
          created_by: string | null
          active: boolean
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          type: string
          criteria?: Json
          max_score?: number
          metadata?: Json
          created_at?: string
          updated_at?: string
          created_by?: string | null
          active?: boolean
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          type?: string
          criteria?: Json
          max_score?: number
          metadata?: Json
          created_at?: string
          updated_at?: string
          created_by?: string | null
          active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "questions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "evaluators"
            referencedColumns: ["id"]
          }
        ]
      }
      corrections: {
        Row: {
          id: string
          student_id: string | null
          question_id: string | null
          input: Json
          result: Json | null
          metadata: Json
          human_review: Json | null
          created_at: string
          updated_at: string
          reviewed_at: string | null
          reviewed_by: string | null
        }
        Insert: {
          id: string
          student_id?: string | null
          question_id?: string | null
          input: Json
          result?: Json | null
          metadata?: Json
          human_review?: Json | null
          created_at?: string
          updated_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
        }
        Update: {
          id?: string
          student_id?: string | null
          question_id?: string | null
          input?: Json
          result?: Json | null
          metadata?: Json
          human_review?: Json | null
          created_at?: string
          updated_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "corrections_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "corrections_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "corrections_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "evaluators"
            referencedColumns: ["id"]
          }
        ]
      }
      correction_history: {
        Row: {
          id: string
          correction_id: string | null
          action: string
          data: Json
          performed_by: string | null
          performed_at: string
        }
        Insert: {
          id?: string
          correction_id?: string | null
          action: string
          data: Json
          performed_by?: string | null
          performed_at?: string
        }
        Update: {
          id?: string
          correction_id?: string | null
          action?: string
          data?: Json
          performed_by?: string | null
          performed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "correction_history_correction_id_fkey"
            columns: ["correction_id"]
            isOneToOne: false
            referencedRelation: "corrections"
            referencedColumns: ["id"]
          }
        ]
      }
      system_settings: {
        Row: {
          id: string
          name: string
          value: Json
          description: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id: string
          name: string
          value: Json
          description?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          name?: string
          value?: Json
          description?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      reference_texts: {
        Row: {
          id: string
          content: string
          source: string | null
          category: string | null
          tags: string[] | null
          metadata: Json
          created_at: string
          active: boolean
        }
        Insert: {
          id?: string
          content: string
          source?: string | null
          category?: string | null
          tags?: string[] | null
          metadata?: Json
          created_at?: string
          active?: boolean
        }
        Update: {
          id?: string
          content?: string
          source?: string | null
          category?: string | null
          tags?: string[] | null
          metadata?: Json
          created_at?: string
          active?: boolean
        }
        Relationships: []
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
} 