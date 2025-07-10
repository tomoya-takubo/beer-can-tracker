import { DrinkRecord, BeerStats, DrinkingPaceStats, BeerCanSettings } from '@/types/drink'
import { settingsService } from './settingsService'

export const beerStatsService = {
  calculateBeerStats: (records: DrinkRecord[]): BeerStats => {
    if (records.length === 0) {
      return {
        totalAmount: 0,
        totalCans: 0,
        can350Count: 0,
        can500Count: 0,
        totalCost: 0,
        totalAlcohol: 0,
        averagePerDay: 0,
        averageCansPerDay: 0,
        daysWithBeer: 0,
        maxCansInDay: 0
      }
    }

    // 設定値を取得
    const settings = settingsService.getBeerCanSettings()

    const can350Records = records.filter(record => record.amount === 350)
    const can500Records = records.filter(record => record.amount === 500)
    
    const can350Count = can350Records.length
    const can500Count = can500Records.length
    const totalCans = can350Count + can500Count
    const totalAmount = can350Count * 350 + can500Count * 500
    const totalCost = can350Count * settings.can350ml.price + can500Count * settings.can500ml.price
    const totalAlcohol = can350Count * settings.can350ml.alcoholContent + can500Count * settings.can500ml.alcoholContent

    // 日別集計
    const dailyData = records.reduce((acc, record) => {
      const date = record.date
      if (!acc[date]) {
        acc[date] = { amount: 0, cans: 0 }
      }
      acc[date].amount += record.amount
      acc[date].cans += 1
      return acc
    }, {} as Record<string, { amount: number; cans: number }>)

    const daysWithBeer = Object.keys(dailyData).length
    const averagePerDay = daysWithBeer > 0 ? totalAmount / daysWithBeer : 0
    const averageCansPerDay = daysWithBeer > 0 ? totalCans / daysWithBeer : 0
    const maxCansInDay = Math.max(...Object.values(dailyData).map(d => d.cans), 0)

    // 飲みきり時間統計を計算
    const drinkingPaceStats = beerStatsService.calculateDrinkingPaceStats(records)

    return {
      totalAmount,
      totalCans,
      can350Count,
      can500Count,
      totalCost,
      totalAlcohol,
      averagePerDay,
      averageCansPerDay,
      daysWithBeer,
      maxCansInDay,
      drinkingPaceStats
    }
  },

  getDailyConsumption: (records: DrinkRecord[]): Array<{date: string, amount: number, cans: number, can350: number, can500: number}> => {
    const dailyData = records.reduce((acc, record) => {
      const date = record.date
      if (!acc[date]) {
        acc[date] = { amount: 0, cans: 0, can350: 0, can500: 0 }
      }
      acc[date].amount += record.amount
      acc[date].cans += 1
      if (record.amount === 350) {
        acc[date].can350 += 1
      } else if (record.amount === 500) {
        acc[date].can500 += 1
      }
      return acc
    }, {} as Record<string, { amount: number; cans: number; can350: number; can500: number }>)

    return Object.entries(dailyData)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date))
  },

  getWeeklyTrend: (records: DrinkRecord[]): Array<{week: string, amount: number, cans: number}> => {
    const weeklyData = records.reduce((acc, record) => {
      const date = new Date(record.date)
      const year = date.getFullYear()
      const week = Math.ceil((date.getDate() - date.getDay()) / 7)
      const weekKey = `${year}-W${week.toString().padStart(2, '0')}`
      
      if (!acc[weekKey]) {
        acc[weekKey] = { amount: 0, cans: 0 }
      }
      acc[weekKey].amount += record.amount
      acc[weekKey].cans += 1
      return acc
    }, {} as Record<string, { amount: number; cans: number }>)

    return Object.entries(weeklyData)
      .map(([week, data]) => ({ week, ...data }))
      .sort((a, b) => a.week.localeCompare(b.week))
  },

  getHourlyPattern: (records: DrinkRecord[]): Array<{hour: number, amount: number, cans: number}> => {
    const hourlyData = records.reduce((acc, record) => {
      const hour = parseInt(record.time.split(':')[0])
      if (!acc[hour]) {
        acc[hour] = { amount: 0, cans: 0 }
      }
      acc[hour].amount += record.amount
      acc[hour].cans += 1
      return acc
    }, {} as Record<number, { amount: number; cans: number }>)

    return Array.from({ length: 24 }, (_, hour) => ({
      hour,
      amount: hourlyData[hour]?.amount || 0,
      cans: hourlyData[hour]?.cans || 0
    }))
  },

  getBeerTypePreference: (records: DrinkRecord[]): {can350Percentage: number, can500Percentage: number} => {
    const can350Count = records.filter(record => record.amount === 350).length
    const can500Count = records.filter(record => record.amount === 500).length
    const total = can350Count + can500Count

    if (total === 0) {
      return { can350Percentage: 0, can500Percentage: 0 }
    }

    return {
      can350Percentage: (can350Count / total) * 100,
      can500Percentage: (can500Count / total) * 100
    }
  },

  calculateDrinkingPaceStats: (records: DrinkRecord[]): DrinkingPaceStats => {
    // 記録を時間順にソート
    const sortedRecords = records
      .map(record => ({
        ...record,
        dateTime: new Date(`${record.date}T${record.time}`)
      }))
      .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime())

    const can350Sessions: Array<{
      sessionStart: string
      sessionEnd: string
      duration: number
      cansCount: number
    }> = []
    
    const can500Sessions: Array<{
      sessionStart: string
      sessionEnd: string
      duration: number
      cansCount: number
    }> = []

    const consecutiveDrinkingSessions: Array<{
      startTime: string
      endTime: string
      totalDuration: number
      cans: Array<{
        size: 350 | 500
        time: string
        duration?: number
      }>
    }> = []

    // 日別に飲酒セッションを検出（より包括的なアプローチ）
    const sessionsByDate = new Map<string, Array<{
      record: DrinkRecord & { dateTime: Date }
      nextRecord?: DrinkRecord & { dateTime: Date }
    }>>()

    // 日付ごとにグループ化
    sortedRecords.forEach((record, i) => {
      const date = record.date
      if (!sessionsByDate.has(date)) {
        sessionsByDate.set(date, [])
      }
      sessionsByDate.get(date)!.push({
        record,
        nextRecord: sortedRecords[i + 1]
      })
    })

    // 各日の飲酒を処理
    sessionsByDate.forEach((dayRecords, date) => {
      let currentSession: {
        startTime: string
        endTime: string
        cans: Array<{
          size: 350 | 500
          time: string
          duration?: number
        }>
      } | null = null

      dayRecords.forEach((item, i) => {
        const record = item.record
        const nextRecord = item.nextRecord
        
        // 新しいセッションを開始するか判定（同日内で3時間以上空いた場合）
        if (
          currentSession === null ||
          (i > 0 &&
            ((record.dateTime.getTime() - dayRecords[i - 1].record.dateTime.getTime()) / (1000 * 60)) > 180)
        ) {
          // 前のセッションがあれば記録（2缶以上の場合のみ）
          if (currentSession !== null && (currentSession as any).cans.length > 1) {
            consecutiveDrinkingSessions.push({
              ...(currentSession as any),
              totalDuration:
                (new Date((currentSession as any).endTime).getTime() -
                  new Date((currentSession as any).startTime).getTime()) /
                (1000 * 60)
            })
          }

          // 新しいセッション開始
          currentSession = {
            startTime: `${record.date}T${record.time}`,
            endTime: `${record.date}T${record.time}`,
            cans: [
              {
                size: record.amount as 350 | 500,
                time: `${record.date}T${record.time}`
              }
            ]
          }
        } else if (currentSession !== null) {
          // 現在のセッションに追加
          currentSession.endTime = `${record.date}T${record.time}`
          currentSession.cans.push({
            size: record.amount as 350 | 500,
            time: `${record.date}T${record.time}`
          })
        }

        // 次の記録との時間差を計算（同日内かつセッション内の場合のみ）
        if (nextRecord && nextRecord.date === record.date) {
          const timeDiff = nextRecord.dateTime.getTime() - record.dateTime.getTime()
          const minutesDiff = timeDiff / (1000 * 60)
          
          // セッション内の次の缶までの時間を設定（3時間以内の場合のみ）
          if (minutesDiff <= 180) {
            const currentCan = currentSession.cans[currentSession.cans.length - 1]
            currentCan.duration = minutesDiff
          }
        }
      })

      // 各日の最後のセッションを記録（2缶以上の場合のみ）
      if (currentSession && (currentSession as any).cans.length > 1) {
        consecutiveDrinkingSessions.push({
          ...(currentSession as any),
          totalDuration: (new Date((currentSession as any).endTime).getTime() - new Date((currentSession as any).startTime).getTime()) / (1000 * 60)
        })
      }
    })

    // 缶サイズ別の統計を計算（セッションベース）
    const calculateCanStats = (canSize: 350 | 500) => {
      const durations: number[] = []
      const sessions: Array<{
        sessionStart: string
        sessionEnd: string
        duration: number
        cansCount: number
      }> = []

      // セッションから該当する缶サイズの時間を抽出
      consecutiveDrinkingSessions.forEach(session => {
        session.cans.forEach((can, index) => {
          if (can.size === canSize && can.duration !== undefined) {
            durations.push(can.duration)
            sessions.push({
              sessionStart: can.time,
              sessionEnd: session.cans[index + 1]?.time || can.time,
              duration: can.duration,
              cansCount: 1
            })
          }
        })
      })

      return {
        averageTime: durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0,
        fastestTime: durations.length > 0 ? Math.min(...durations) : 0,
        slowestTime: durations.length > 0 ? Math.max(...durations) : 0,
        totalSessions: sessions.length,
        paceData: sessions
      }
    }

    return {
      can350: calculateCanStats(350),
      can500: calculateCanStats(500),
      consecutiveDrinkingSessions
    }
  }
}