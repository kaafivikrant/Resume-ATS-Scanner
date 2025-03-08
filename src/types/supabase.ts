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
      users: {
        Row: {
          id: string
          name: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      resumes: {
        Row: {
          id: string
          name: string
          content: string
          file_path: string
          file_type: string
          file_size: number
          upload_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          content: string
          file_path: string
          file_type: string
          file_size: number
          upload_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          name?: string
          content?: string
          file_path?: string
          file_type?: string
          file_size?: number
          upload_date?: string
          updated_at?: string
          user_id?: string
        }
      }
      job_descriptions: {
        Row: {
          id: string
          title: string
          company: string | null
          content: string
          source: string
          url: string | null
          save_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          title: string
          company?: string | null
          content: string
          source: string
          url?: string | null
          save_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          title?: string
          company?: string | null
          content?: string
          source?: string
          url?: string | null
          save_date?: string
          updated_at?: string
          user_id?: string
        }
      }
      analysis_results: {
        Row: {
          id: string
          overall_score: number
          categories: Json
          recommendations: string[]
          timestamp: string
          resume_id: string
          job_description_id: string
          user_id: string
        }
        Insert: {
          id?: string
          overall_score: number
          categories: Json
          recommendations: string[]
          timestamp?: string
          resume_id: string
          job_description_id: string
          user_id: string
        }
        Update: {
          id?: string
          overall_score?: number
          categories?: Json
          recommendations?: string[]
          timestamp?: string
          resume_id?: string
          job_description_id?: string
          user_id?: string
        }
      }
      subscription_plans: {
        Row: {
          id: string
          plan_id: string
          name: string
          price: number
          features: string[]
          limits: Json
          stripe_price_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          plan_id: string
          name: string
          price: number
          features: string[]
          limits: Json
          stripe_price_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          plan_id?: string
          name?: string
          price?: number
          features?: string[]
          limits?: Json
          stripe_price_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          active: boolean
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          created_at: string
          updated_at: string
          user_id: string
          plan_id: string
        }
        Insert: {
          id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          active?: boolean
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string
          updated_at?: string
          user_id: string
          plan_id: string
        }
        Update: {
          id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          active?: boolean
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string
          updated_at?: string
          user_id?: string
          plan_id?: string
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