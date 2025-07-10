import { AppSettings, BeerCanSettings } from '@/types/drink'

const SETTINGS_STORAGE_KEY = 'beer-can-tracker-settings'

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

export const settingsService = {
  // 設定を取得
  getSettings: (): AppSettings => {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        return {
          beerCanSettings: {
            ...DEFAULT_BEER_CAN_SETTINGS,
            ...parsed.beerCanSettings
          },
          createdAt: new Date(parsed.createdAt),
          updatedAt: new Date(parsed.updatedAt)
        }
      }
    } catch (error) {
      console.error('設定の読み込みに失敗しました:', error)
    }
    
    // デフォルト設定を返す
    return {
      beerCanSettings: DEFAULT_BEER_CAN_SETTINGS,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },

  // 設定を保存
  saveSettings: (settings: AppSettings): boolean => {
    try {
      const toSave = {
        ...settings,
        updatedAt: new Date()
      }
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(toSave))
      return true
    } catch (error) {
      console.error('設定の保存に失敗しました:', error)
      return false
    }
  },

  // 缶ビール設定のみを更新
  updateBeerCanSettings: (beerCanSettings: BeerCanSettings): boolean => {
    const currentSettings = settingsService.getSettings()
    const updatedSettings: AppSettings = {
      ...currentSettings,
      beerCanSettings,
      updatedAt: new Date()
    }
    return settingsService.saveSettings(updatedSettings)
  },

  // デフォルト設定にリセット
  resetToDefaults: (): boolean => {
    const defaultSettings: AppSettings = {
      beerCanSettings: DEFAULT_BEER_CAN_SETTINGS,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    return settingsService.saveSettings(defaultSettings)
  },

  // 缶ビール設定のみを取得
  getBeerCanSettings: (): BeerCanSettings => {
    return settingsService.getSettings().beerCanSettings
  }
}