import { DrinkingGoals, GoalProgress, DrinkRecord } from '@/types/drink'

export const goalsService = {
  // 目標を保存/更新（ローカルストレージ使用）
  saveGoals: async (goals: Omit<DrinkingGoals, 'id' | 'createdAt' | 'updatedAt'>): Promise<DrinkingGoals | null> => {
    try {
      const now = new Date()
      const savedGoals: DrinkingGoals = {
        ...goals,
        id: `goal-${goals.userId}-${Date.now()}`,
        createdAt: now,
        updatedAt: now
      }

      const storageKey = `goals-${goals.userId}`
      localStorage.setItem(storageKey, JSON.stringify(savedGoals))
      
      return savedGoals
    } catch (error) {
      console.error('Error saving goals:', error)
      return null
    }
  },

  // 目標を取得（ローカルストレージ使用）
  getGoals: async (userId: string): Promise<DrinkingGoals | null> => {
    try {
      const storageKey = `goals-${userId}`
      const storedGoals = localStorage.getItem(storageKey)
      
      if (!storedGoals) {
        return null
      }

      const goals = JSON.parse(storedGoals)
      return {
        ...goals,
        createdAt: new Date(goals.createdAt),
        updatedAt: new Date(goals.updatedAt)
      }
    } catch (error) {
      console.error('Error fetching goals:', error)
      return null
    }
  },

  // 進捗計算
  calculateProgress: (records: DrinkRecord[], goals: DrinkingGoals, period: 'daily' | 'weekly' | 'monthly'): GoalProgress => {
    const now = new Date()
    let startDate: Date
    let endDate: Date
    let limits: DrinkingGoals['dailyLimits']

    // 期間設定
    switch (period) {
      case 'daily':
        // 今日の日付文字列を取得
        const todayStr = now.toISOString().split('T')[0]
        startDate = new Date(todayStr + 'T00:00:00')
        endDate = new Date(todayStr + 'T23:59:59')
        limits = goals.dailyLimits
        break
      case 'weekly':
        const dayOfWeek = now.getDay()
        startDate = new Date(now.getTime() - dayOfWeek * 24 * 60 * 60 * 1000)
        startDate.setHours(0, 0, 0, 0)
        endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000)
        limits = goals.weeklyLimits
        break
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
        limits = goals.monthlyLimits
        break
    }

    // 期間内のレコードを絞り込み
    const periodRecords = records.filter(record => {
      if (period === 'daily') {
        // 日別の場合は今日の日付と完全一致
        const todayStr = now.toISOString().split('T')[0]
        return record.date === todayStr
      } else {
        // 週別・月別の場合は従来の計算
        const recordDate = new Date(record.date + 'T00:00:00')
        return recordDate >= startDate && recordDate < endDate
      }
    })


    // 現在の数値を計算
    const current = {
      amount: periodRecords.reduce((sum, r) => sum + r.amount, 0),
      cost: periodRecords.reduce((sum, r) => {
        const price = r.amount === 350 ? 204 : 268
        return sum + price
      }, 0)
    }

    // パーセンテージ計算
    const percentage = {
      amount: limits.maxAmount > 0 ? (current.amount / limits.maxAmount) * 100 : 0,
      cost: limits.maxCost > 0 ? (current.cost / limits.maxCost) * 100 : 0
    }

    // ステータス判定
    const maxPercentage = Math.max(percentage.amount, percentage.cost)
    let status: GoalProgress['status']
    if (maxPercentage >= 100) {
      status = 'exceeded'
    } else if (maxPercentage >= 90) {
      status = 'danger'
    } else if (maxPercentage >= 70) {
      status = 'warning'
    } else {
      status = 'safe'
    }

    // 期間情報
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const elapsedDays = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const remainingDays = Math.max(0, totalDays - elapsedDays)

    return {
      period,
      current,
      limits: {
        amount: limits.maxAmount,
        cost: limits.maxCost
      },
      percentage,
      status,
      daysInPeriod: totalDays,
      remainingDays
    }
  },

  // デフォルト目標を生成
  getDefaultGoals: (userId: string): Omit<DrinkingGoals, 'id' | 'createdAt' | 'updatedAt'> => {
    return {
      userId,
      dailyLimits: {
        maxAmount: 500,
        maxCost: 500
      },
      weeklyLimits: {
        maxAmount: 3500,
        maxCost: 3500
      },
      monthlyLimits: {
        maxAmount: 14000,
        maxCost: 14000
      },
      alcoholFreeDays: {
        enabled: true,
        targetDaysPerWeek: 2,
        specificDays: [0, 3] // 日曜日と水曜日
      },
      alerts: {
        dailyWarningThreshold: 0.8,
        weeklyWarningThreshold: 0.8,
        monthlyWarningThreshold: 0.8,
        enablePushNotifications: false
      },
      startDate: new Date().toISOString().split('T')[0],
      isActive: true
    }
  },

  // アラートチェック
  checkAlerts: (progress: GoalProgress, goals: DrinkingGoals): { shouldAlert: boolean; message: string; type: 'warning' | 'danger' } | null => {
    const thresholds = {
      daily: goals.alerts.dailyWarningThreshold * 100,
      weekly: goals.alerts.weeklyWarningThreshold * 100,
      monthly: goals.alerts.monthlyWarningThreshold * 100
    }

    const threshold = thresholds[progress.period]
    const maxPercentage = Math.max(
      progress.percentage.amount,
      progress.percentage.cost
    )

    if (maxPercentage >= 100) {
      return {
        shouldAlert: true,
        message: `${progress.period === 'daily' ? '今日' : progress.period === 'weekly' ? '今週' : '今月'}の飲酒量が目標を超過しました！`,
        type: 'danger'
      }
    } else if (maxPercentage >= threshold) {
      return {
        shouldAlert: true,
        message: `${progress.period === 'daily' ? '今日' : progress.period === 'weekly' ? '今週' : '今月'}の飲酒量が目標の${Math.round(maxPercentage)}%に達しました`,
        type: 'warning'
      }
    }

    return null
  },

  // 休肝日の達成状況を計算
  calculateAlcoholFreeDaysProgress: (records: DrinkRecord[], goals: DrinkingGoals | null) => {
    // 目標が設定されていない場合はデフォルト値を使用
    const targetDaysPerWeek = goals?.alcoholFreeDays?.enabled ? goals.alcoholFreeDays.targetDaysPerWeek : 2
    const isEnabled = goals?.alcoholFreeDays?.enabled || false

    const now = new Date()
    const currentWeekStart = new Date(now.getTime() - now.getDay() * 24 * 60 * 60 * 1000)
    currentWeekStart.setHours(0, 0, 0, 0)
    
    // 今週の日付を生成
    const weekDates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(currentWeekStart.getTime() + i * 24 * 60 * 60 * 1000)
      return date.toISOString().split('T')[0]
    })
    
    // 今週の飲酒日を特定
    const drinkingDays = weekDates.filter(date => 
      records.some(record => record.date === date)
    )
    
    // 休肝日を計算
    const alcoholFreeDays = weekDates.filter(date => 
      !records.some(record => record.date === date)
    )
    
    // 今日までの経過日数
    const today = now.toISOString().split('T')[0]
    const todayIndex = weekDates.indexOf(today)
    const daysSoFar = todayIndex >= 0 ? todayIndex + 1 : 7
    
    // 今日までの実際の休肝日数
    const actualFreeDaysSoFar = alcoholFreeDays.filter(date => 
      weekDates.indexOf(date) <= todayIndex
    ).length
    
    // 今日までに必要だった休肝日数の計算
    const expectedFreeDaysSoFar = Math.floor((targetDaysPerWeek * daysSoFar) / 7)
    
    return {
      targetDaysPerWeek,
      actualFreeDaysThisWeek: alcoholFreeDays.length,
      actualFreeDaysSoFar,
      expectedFreeDaysSoFar,
      drinkingDaysThisWeek: drinkingDays.length,
      weekDates,
      alcoholFreeDays,
      drinkingDays,
      daysSoFar,
      isOnTrack: actualFreeDaysSoFar >= expectedFreeDaysSoFar,
      remainingDaysInWeek: 7 - daysSoFar,
      remainingFreeDaysNeeded: Math.max(0, targetDaysPerWeek - alcoholFreeDays.length),
      isEnabled
    }
  },

  // 休肝日アラートをチェック
  checkAlcoholFreeDayAlert: (records: DrinkRecord[], goals: DrinkingGoals | null) => {
    const progress = goalsService.calculateAlcoholFreeDaysProgress(records, goals)
    if (!progress || !progress.isEnabled) return null

    const today = new Date().toISOString().split('T')[0]
    const todayHasDrinking = records.some(record => record.date === today)
    
    // 今日飲酒した場合のアラート
    if (todayHasDrinking && !progress.isOnTrack) {
      return {
        type: 'warning' as const,
        message: `今週の休肝日が目標より少なくなっています。残り${progress.remainingDaysInWeek}日で${progress.remainingFreeDaysNeeded}日の休肝日が必要です。`
      }
    }
    
    // 今日休肝日を守った場合の励まし
    if (!todayHasDrinking && progress.isOnTrack) {
      return {
        type: 'success' as const,
        message: `今日は休肝日です！今週の休肝日目標${progress.targetDaysPerWeek}日に向けて順調です。`
      }
    }
    
    return null
  }
}