import { createClient } from '@supabase/supabase-js'

// Supabaseクライアント
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// データベース型定義
export type Database = {
  public: {
    Tables: {
      drink_records: {
        Row: {
          id: string
          user_id: string
          name: string
          category: string
          amount: number
          unit: string
          date: string
          time: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          category?: string
          amount: number
          unit?: string
          date: string
          time: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          category?: string
          amount?: number
          unit?: string
          date?: string
          time?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}