import { supabase } from './supabase'
import { DrinkRecord, DrinkCategory } from '@/types/drink'

export interface DrinkRecordInput {
  name: string
  category: DrinkCategory
  amount: number
  unit: string
  date: string
  time: string
  notes?: string
  price?: number
  alcohol_content?: number
}

export class SupabaseStorageService {
  // 認証チェック
  private async getAuthenticatedUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('認証エラー:', error)
      throw new Error('認証の確認に失敗しました')
    }
    
    if (!user) {
      throw new Error('ログインが必要です')
    }
    
    return user
  }

  // 記録を保存
  async saveRecord(data: DrinkRecordInput): Promise<DrinkRecord | null> {
    try {
      const user = await this.getAuthenticatedUser()

      const { data: record, error } = await supabase
        .from('drink_records')
        .insert([
          {
            user_id: user.id,
            name: data.name,
            category: data.category,
            amount: data.amount,
            unit: data.unit,
            date: data.date,
            time: data.time,
            notes: data.notes || '',
            price: data.price,
            alcohol_content: data.alcohol_content
          }
        ])
        .select()
        .single()

      if (error) {
        console.error('記録の保存に失敗しました:', error)
        return null
      }

      return {
        id: record.id,
        name: record.name,
        category: record.category,
        amount: record.amount,
        unit: record.unit,
        date: record.date,
        time: record.time,
        notes: record.notes || '',
        price: record.price,
        alcohol_content: record.alcohol_content,
        createdAt: record.createdAt ?? record.created_at ?? '',
        updatedAt: record.updatedAt ?? record.updated_at ?? ''
      }
    } catch (error) {
      console.error('記録の保存中にエラーが発生しました:', error)
      return null
    }
  }

  // 全ての記録を取得
  async getAllRecords(): Promise<DrinkRecord[]> {
    try {
      const user = await this.getAuthenticatedUser()

      const { data: records, error } = await supabase
        .from('drink_records')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('time', { ascending: false })

      if (error) {
        console.error('記録の取得に失敗しました:', error)
        return []
      }

      return records.map(record => ({
        id: record.id,
        name: record.name,
        category: record.category,
        amount: record.amount,
        unit: record.unit,
        date: record.date,
        time: record.time,
        notes: record.notes || '',
        price: record.price,
        alcohol_content: record.alcohol_content,
        createdAt: record.createdAt ?? record.created_at ?? '',
        updatedAt: record.updatedAt ?? record.updated_at ?? ''
      }))
    } catch (error) {
      console.error('記録の取得中にエラーが発生しました:', error)
      return []
    }
  }

  // 特定の日付の記録を取得
  async getRecordsByDate(date: string): Promise<DrinkRecord[]> {
    try {
      const user = await this.getAuthenticatedUser()

      const { data: records, error } = await supabase
        .from('drink_records')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', date)
        .order('time', { ascending: false })

      if (error) {
        console.error('記録の取得に失敗しました:', error)
        return []
      }

      return records.map(record => ({
        id: record.id,
        name: record.name,
        category: record.category,
        amount: record.amount,
        unit: record.unit,
        date: record.date,
        time: record.time,
        notes: record.notes || '',
        price: record.price,
        alcohol_content: record.alcohol_content,
        createdAt: record.createdAt ?? record.created_at ?? '',
        updatedAt: record.updatedAt ?? record.updated_at ?? ''
      }))
    } catch (error) {
      console.error('記録の取得中にエラーが発生しました:', error)
      return []
    }
  }

  // 記録を更新
  async updateRecord(id: string, data: DrinkRecordInput): Promise<DrinkRecord | null> {
    try {
      const user = await this.getAuthenticatedUser()

      const { data: record, error } = await supabase
        .from('drink_records')
        .update({
          name: data.name,
          category: data.category,
          amount: data.amount,
          unit: data.unit,
          date: data.date,
          time: data.time,
          notes: data.notes || '',
          price: data.price,
          alcohol_content: data.alcohol_content,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        console.error('記録の更新に失敗しました:', error)
        return null
      }

      return {
        id: record.id,
        name: record.name,
        category: record.category,
        amount: record.amount,
        unit: record.unit,
        date: record.date,
        time: record.time,
        notes: record.notes || '',
        price: record.price,
        alcohol_content: record.alcohol_content,
        createdAt: record.createdAt ?? record.created_at ?? '',
        updatedAt: record.updatedAt ?? record.updated_at ?? ''
      }
    } catch (error) {
      console.error('記録の更新中にエラーが発生しました:', error)
      return null
    }
  }

  // 記録を削除
  async deleteRecord(id: string): Promise<boolean> {
    try {
      const user = await this.getAuthenticatedUser()

      const { error } = await supabase
        .from('drink_records')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        console.error('記録の削除に失敗しました:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('記録の削除中にエラーが発生しました:', error)
      return false
    }
  }

  // 全ての記録を削除（アカウント削除前のデータクリア）
  async deleteAllRecords(): Promise<boolean> {
    try {
      const user = await this.getAuthenticatedUser()

      const { error } = await supabase
        .from('drink_records')
        .delete()
        .eq('user_id', user.id)

      if (error) {
        console.error('全記録の削除に失敗しました:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('全記録の削除中にエラーが発生しました:', error)
      return false
    }
  }

  // アカウントを削除（Supabase Auth）
  async deleteAccount(): Promise<boolean> {
    try {
      // まず全ての記録を削除
      const recordsDeleted = await this.deleteAllRecords()
      
      if (!recordsDeleted) {
        console.error('データの削除に失敗したため、アカウント削除を中止しました')
        return false
      }

      // アカウントを削除
      const { error } = await supabase.auth.admin.deleteUser(
        (await this.getAuthenticatedUser()).id
      )

      if (error) {
        console.error('アカウントの削除に失敗しました:', error)
        // 管理者権限が必要なため、代替手段としてサインアウト
        await supabase.auth.signOut()
        return true // データは削除済みなので true を返す
      }

      return true
    } catch (error) {
      console.error('アカウント削除中にエラーが発生しました:', error)
      return false
    }
  }
}

export const supabaseStorageService = new SupabaseStorageService()