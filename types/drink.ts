export interface DrinkRecord {
  id: string
  name: string
  category: DrinkCategory
  amount: number
  unit: string
  date: string
  time: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export enum DrinkCategory {
  ALCOHOL = 'alcohol'
}

export interface BeerStats {
  totalAmount: number
  totalCans: number
  can350Count: number
  can500Count: number
  totalCost: number
  totalAlcohol: number
  averagePerDay: number
  averageCansPerDay: number
  daysWithBeer: number
  maxCansInDay: number
  drinkingPaceStats?: DrinkingPaceStats
}

export interface DrinkingPaceStats {
  can350: {
    averageTime: number // 分単位での平均飲みきり時間
    fastestTime: number // 最速記録
    slowestTime: number // 最遅記録
    totalSessions: number // 連続飲酒セッション数
    paceData: Array<{
      sessionStart: string
      sessionEnd: string
      duration: number // 分
      cansCount: number
    }>
  }
  can500: {
    averageTime: number
    fastestTime: number
    slowestTime: number
    totalSessions: number
    paceData: Array<{
      sessionStart: string
      sessionEnd: string
      duration: number
      cansCount: number
    }>
  }
  consecutiveDrinkingSessions: Array<{
    startTime: string
    endTime: string
    totalDuration: number // 分
    cans: Array<{
      size: 350 | 500
      time: string
      duration?: number // 次の缶までの時間
    }>
  }>
}

export interface DrinkFormData {
  name: string
  category: DrinkCategory
  amount: number
  unit: string
  date: string
  time: string
  notes?: string
}

export interface DrinkingGoals {
  id: string
  userId: string
  // 日別目標
  dailyLimits: {
    maxAmount: number // 最大容量(ml)
    maxCost: number // 最大金額(円)
  }
  // 週別目標
  weeklyLimits: {
    maxAmount: number
    maxCost: number
  }
  // 月別目標
  monthlyLimits: {
    maxAmount: number
    maxCost: number
  }
  // 休肝日設定
  alcoholFreeDays: {
    enabled: boolean
    targetDaysPerWeek: number // 週の目標休肝日数
    specificDays?: number[] // 特定の曜日 (0=日曜日, 1=月曜日, ...)
  }
  // アラート設定
  alerts: {
    dailyWarningThreshold: number // 日別制限の何%で警告 (0.8 = 80%)
    weeklyWarningThreshold: number
    monthlyWarningThreshold: number
    enablePushNotifications: boolean
  }
  // 目標期間
  startDate: string
  endDate?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface GoalProgress {
  period: 'daily' | 'weekly' | 'monthly'
  current: {
    amount: number
    cost: number
  }
  limits: {
    amount: number
    cost: number
  }
  percentage: {
    amount: number
    cost: number
  }
  status: 'safe' | 'warning' | 'danger' | 'exceeded'
  daysInPeriod: number
  remainingDays: number
}

export interface BeerCanSettings {
  can350ml: {
    price: number // 円
    alcoholContent: number // g
    name: string
  }
  can500ml: {
    price: number // 円
    alcoholContent: number // g
    name: string
  }
}

export interface AppSettings {
  beerCanSettings: BeerCanSettings
  createdAt: Date
  updatedAt: Date
}