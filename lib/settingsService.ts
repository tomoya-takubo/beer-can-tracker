import { AppSettings, BeerCanSettings } from '@/types/drink'
import { supabase } from './supabase'

// デフォルト設定値
const DEFAULT_BEER_CAN_SETTINGS: BeerCanSettings = {
  can350ml: {
    price: 204,
    alcoholContent: 14,
    name: 'ビール缶(350ml)'
  },
  can500ml: {
    price: 268,
    alcoholContent: 20,
    name: 'ビール缶(500ml)'
  }
}

interface UserSettingsRow {
  id: string
  user_id: string
  can350ml_price: number
  can350ml_alcohol_content: number
  can350ml_name: string
  can500ml_price: number
  can500ml_alcohol_content: number
  can500ml_name: string
  created_at: string
  updated_at: string
}

export const settingsService = {
  // 認証チェック
  async getAuthenticatedUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('認証エラー:', error)
      throw new Error('認証の確認に失敗しました')
    }
    
    if (!user) {
      throw new Error('ログインが必要です')
    }
    
    return user
  },

  // データベースの行をAppSettingsに変換
  rowToAppSettings(row: UserSettingsRow): AppSettings {
    return {
      beerCanSettings: {
        can350ml: {
          price: row.can350ml_price,
          alcoholContent: row.can350ml_alcohol_content,
          name: row.can350ml_name
        },
        can500ml: {
          price: row.can500ml_price,
          alcoholContent: row.can500ml_alcohol_content,
          name: row.can500ml_name
        }
      },
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }
  },

  // 設定を取得
  async getSettings(): Promise<AppSettings> {
    try {
      const user = await this.getAuthenticatedUser()

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) {
        console.error('設定の取得に失敗しました:', error)
        // エラーの場合はデフォルト設定を返す
        return {
          beerCanSettings: DEFAULT_BEER_CAN_SETTINGS,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }

      if (data) {
        return this.rowToAppSettings(data)
      }

      // データが存在しない場合はデフォルト設定を作成して返す
      return await this.createDefaultSettings()
    } catch (error) {
      console.error('設定の取得中にエラーが発生しました:', error)
      // エラーの場合はデフォルト設定を返す
      return {
        beerCanSettings: DEFAULT_BEER_CAN_SETTINGS,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }
  },

  // デフォルト設定を作成
  async createDefaultSettings(): Promise<AppSettings> {
    try {
      const user = await this.getAuthenticatedUser()

      const { data, error } = await supabase
        .from('user_settings')
        .insert([
          {
            user_id: user.id,
            can350ml_price: DEFAULT_BEER_CAN_SETTINGS.can350ml.price,
            can350ml_alcohol_content: DEFAULT_BEER_CAN_SETTINGS.can350ml.alcoholContent,
            can350ml_name: DEFAULT_BEER_CAN_SETTINGS.can350ml.name,
            can500ml_price: DEFAULT_BEER_CAN_SETTINGS.can500ml.price,
            can500ml_alcohol_content: DEFAULT_BEER_CAN_SETTINGS.can500ml.alcoholContent,
            can500ml_name: DEFAULT_BEER_CAN_SETTINGS.can500ml.name
          }
        ])
        .select()
        .single()

      if (error) {
        console.error('デフォルト設定の作成に失敗しました:', error)
        // エラーの場合はローカルデフォルト設定を返す
        return {
          beerCanSettings: DEFAULT_BEER_CAN_SETTINGS,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }

      return this.rowToAppSettings(data)
    } catch (error) {
      console.error('デフォルト設定の作成中にエラーが発生しました:', error)
      return {
        beerCanSettings: DEFAULT_BEER_CAN_SETTINGS,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }
  },

  // 設定を保存
  async saveSettings(settings: AppSettings): Promise<boolean> {
    try {
      const user = await this.getAuthenticatedUser()

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          can350ml_price: settings.beerCanSettings.can350ml.price,
          can350ml_alcohol_content: settings.beerCanSettings.can350ml.alcoholContent,
          can350ml_name: settings.beerCanSettings.can350ml.name,
          can500ml_price: settings.beerCanSettings.can500ml.price,
          can500ml_alcohol_content: settings.beerCanSettings.can500ml.alcoholContent,
          can500ml_name: settings.beerCanSettings.can500ml.name
        })

      if (error) {
        console.error('設定の保存に失敗しました:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('設定の保存中にエラーが発生しました:', error)
      return false
    }
  },

  // 缶ビール設定のみを更新
  async updateBeerCanSettings(beerCanSettings: BeerCanSettings): Promise<boolean> {
    const currentSettings = await this.getSettings()
    const updatedSettings: AppSettings = {
      ...currentSettings,
      beerCanSettings,
      updatedAt: new Date()
    }
    return await this.saveSettings(updatedSettings)
  },

  // デフォルト設定にリセット
  async resetToDefaults(): Promise<boolean> {
    const defaultSettings: AppSettings = {
      beerCanSettings: DEFAULT_BEER_CAN_SETTINGS,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    return await this.saveSettings(defaultSettings)
  },

  // 缶ビール設定のみを取得
  async getBeerCanSettings(): Promise<BeerCanSettings> {
    const settings = await this.getSettings()
    return settings.beerCanSettings
  }
}