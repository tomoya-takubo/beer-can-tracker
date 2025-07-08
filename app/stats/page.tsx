'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabaseStorageService } from '@/lib/supabaseStorage'
import { beerStatsService } from '@/lib/beerStats'
import { DrinkRecord, BeerStats } from '@/types/drink'

export default function StatsPage() {
  const [records, setRecords] = useState<DrinkRecord[]>([])
  const [stats, setStats] = useState<BeerStats | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [showHourlyDetail, setShowHourlyDetail] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showBeerCans, setShowBeerCans] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showAllSessions, setShowAllSessions] = useState(false)

  useEffect(() => {
    const loadRecords = async () => {
      setLoading(true)
      const allRecords = await supabaseStorageService.getAllRecords()
      setRecords(allRecords)
    
    let filteredRecords = allRecords
    
    if (startDate && endDate) {
      filteredRecords = allRecords.filter(record => 
        record.date >= startDate && record.date <= endDate
      )
    } else if (selectedPeriod !== 'all') {
      const now = new Date()
      const cutoffDate = new Date()
      
      switch (selectedPeriod) {
        case 'week':
          cutoffDate.setDate(now.getDate() - 7)
          break
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1)
          break
        case 'year':
          cutoffDate.setFullYear(now.getFullYear() - 1)
          break
      }
      
      filteredRecords = allRecords.filter(record => 
        new Date(record.date) >= cutoffDate
      )
    }
    
      const calculatedStats = beerStatsService.calculateBeerStats(filteredRecords)
      setStats(calculatedStats)
      setLoading(false)
    }
    
    loadRecords()
  }, [selectedPeriod, startDate, endDate])

  const dailyData = records.length > 0 ? beerStatsService.getDailyConsumption(records) : []
  const hourlyData = (() => {
    if (selectedDate) {
      const dayRecords = records.filter(record => record.date === selectedDate)
      return beerStatsService.getHourlyPattern(dayRecords)
    }
    
    // カスタム期間や期間選択を考慮してフィルターされたレコードを使用
    let targetRecords = records
    if (startDate && endDate) {
      targetRecords = records.filter(record => 
        record.date >= startDate && record.date <= endDate
      )
    } else if (selectedPeriod !== 'all') {
      const now = new Date()
      const cutoffDate = new Date()
      
      switch (selectedPeriod) {
        case 'week':
          cutoffDate.setDate(now.getDate() - 7)
          break
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1)
          break
        case 'year':
          cutoffDate.setFullYear(now.getFullYear() - 1)
          break
      }
      
      targetRecords = records.filter(record => 
        new Date(record.date) >= cutoffDate
      )
    }
    
    return beerStatsService.getHourlyPattern(targetRecords)
  })()
  const preference = records.length > 0 ? beerStatsService.getBeerTypePreference(records) : null

  // 期間の総日数を計算
  const getTotalDaysInPeriod = (): number => {
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const diffTime = Math.abs(end.getTime() - start.getTime())
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    } else if (selectedPeriod !== 'all') {
      switch (selectedPeriod) {
        case 'week': return 7
        case 'month': return 30
        case 'year': return 365
      }
    }
    // 全期間の場合は記録のある最初の日から今日までの日数
    if (records.length > 0) {
      const firstRecord = records.sort((a, b) => a.date.localeCompare(b.date))[0]
      const firstDate = new Date(firstRecord.date)
      const today = new Date()
      const diffTime = Math.abs(today.getTime() - firstDate.getTime())
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    }
    return 0
  }

  // フィルター後のレコードから缶ビールデータを生成
  const filteredRecords = (() => {
    if (startDate && endDate) {
      return records.filter(record => 
        record.date >= startDate && record.date <= endDate
      )
    } else if (selectedPeriod !== 'all') {
      const now = new Date()
      const cutoffDate = new Date()
      
      switch (selectedPeriod) {
        case 'week':
          cutoffDate.setDate(now.getDate() - 7)
          break
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1)
          break
        case 'year':
          cutoffDate.setFullYear(now.getFullYear() - 1)
          break
      }
      
      return records.filter(record => 
        new Date(record.date) >= cutoffDate
      )
    }
    return records
  })()

  const periodBeerCans = filteredRecords
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`)
      const dateB = new Date(`${b.date}T${b.time}`)
      return dateB.getTime() - dateA.getTime()
    })
    .map((record, index) => ({
      id: record.id,
      size: record.amount === 350 ? '350ml' : '500ml',
      amount: record.amount,
      image: record.amount === 350 ? '/images/drink_beer_can_short.png' : '/images/drink_beer_can_long.png',
      date: record.date,
      time: record.time,
      index: index + 1
    }))

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-100 flex justify-center items-center">
        <div className="text-xl text-amber-800">🍺 缶ビール統計を計算中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-100">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-amber-800 mb-2">🍺 缶ビール統計分析</h1>
            <p className="text-sm sm:text-base text-amber-700">あなたの缶ビール摂取パターンを詳細分析します</p>
          </div>
          <Link href="/" className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-200 shadow-lg text-sm sm:text-base w-full sm:w-auto text-center">
            ホームに戻る
          </Link>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center">
            <span className="text-xl sm:text-2xl mr-2 sm:mr-3">📅</span>
            期間選択
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-3 text-amber-800">プリセット期間</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { setSelectedPeriod('all'); setStartDate(''); setEndDate(''); }}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    selectedPeriod === 'all' && !startDate && !endDate
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  すべて
                </button>
                <button
                  onClick={() => { setSelectedPeriod('week'); setStartDate(''); setEndDate(''); }}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    selectedPeriod === 'week' && !startDate && !endDate
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  過去1週間
                </button>
                <button
                  onClick={() => { setSelectedPeriod('month'); setStartDate(''); setEndDate(''); }}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    selectedPeriod === 'month' && !startDate && !endDate
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  過去1ヶ月
                </button>
                <button
                  onClick={() => { setSelectedPeriod('year'); setStartDate(''); setEndDate(''); }}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    selectedPeriod === 'year' && !startDate && !endDate
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  過去1年
                </button>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-3 text-amber-800">カスタム期間</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1 text-amber-700">開始日</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => { setStartDate(e.target.value); setSelectedPeriod('custom'); }}
                    className="w-full p-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-amber-700">終了日</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => { setEndDate(e.target.value); setSelectedPeriod('custom'); }}
                    className="w-full p-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 期間内ビール缶表示 */}
        {filteredRecords.length > 0 && (
          <div className="bg-white p-8 rounded-xl shadow-xl border-2 border-amber-200 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold flex items-center text-amber-800">
                <span className="text-2xl mr-3">🍺</span>
                期間内の飲酒記録 ({filteredRecords.length}缶)
              </h3>
              <button
                onClick={() => setShowBeerCans(!showBeerCans)}
                className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-all duration-200 flex items-center gap-2"
              >
                {showBeerCans ? '閉じる' : '表示する'}
                <span className={`transform transition-transform duration-200 ${showBeerCans ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
            </div>
            {showBeerCans && (
              <div className="space-y-4">
                <div className="text-sm text-amber-600 mb-4">
                  * 最新の記録から順に表示されています
                </div>
                <div className="flex flex-wrap justify-center gap-2 items-end">
                  {periodBeerCans.map((beer) => (
                    <div key={beer.id} className="relative flex flex-col items-center group">
                      <div className="relative">
                        <Image 
                          src={beer.image} 
                          alt={`${beer.size}缶ビール`} 
                          width={40} 
                          height={beer.size === '350ml' ? 50 : 60}
                          className="opacity-80 hover:opacity-100 transition-opacity duration-200"
                        />
                        <div className="absolute -top-2 -right-2 bg-amber-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                          {beer.index}
                        </div>
                      </div>
                      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                        {beer.date} {beer.time.slice(0, 5)}
                      </div>
                    </div>
                  ))}
                </div>
                {periodBeerCans.length > 100 && (
                  <div className="text-sm text-amber-600 text-center mt-4">
                    ⚠️ 大量の記録があります。スクロールして確認してください。
                  </div>
                )}
              </div>
            )}
          </div>
        )}


        {/* 時間別消費パターン */}
        {true && (
          <div className="bg-white p-8 rounded-xl shadow-xl border-2 border-amber-200 mb-8" data-hourly-pattern>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-12 gap-4">
              <h3 className="text-xl font-semibold flex items-center text-amber-800">
                <span className="text-2xl mr-3">🕐</span>
                時間別飲酒パターン{selectedDate && ` - ${selectedDate}`}
              </h3>
              {selectedDate && (
                <button
                  onClick={() => { setSelectedDate(''); setShowHourlyDetail(false); }}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all duration-200 w-full sm:w-auto flex-shrink-0"
                >
                  全体表示に戻る
                </button>
              )}
            </div>
            <div className="relative pl-16 mt-4">
              {(() => {
                // maxAmountを一度だけ計算
                const maxAmount = Math.max(...hourlyData.map(h => h.amount), 100)
                const step = Math.ceil(maxAmount / 4 / 100) * 100
                const adjustedMaxAmount = step * 4 // Y軸の最大値に合わせる
                
                return (
                  <>
                    <div className="border-l-2 border-b-2 border-amber-400">
                      <div className="flex h-32 gap-1 px-2 relative">
                        {hourlyData.map((hourData, index) => {
                          const height = (hourData.amount / adjustedMaxAmount) * 128
                          
                          return (
                            <div key={index} className="relative" style={{ width: 'calc((100% - 48px) / 24)' }}>
                              <div 
                                className="bg-gradient-to-t from-amber-500 to-amber-300 w-full rounded-t-lg transition-all duration-1000 ease-out hover:from-amber-600 hover:to-amber-400 cursor-pointer absolute bottom-0"
                                style={{ height: `${height > 0 ? Math.max(height, 4) : 0}px` }}
                                title={`${index}:00-${index}:59: ${hourData.cans} 缶 (${hourData.amount} ml)`}
                              />
                            </div>
                          )
                        })}
                      </div>
                      <div className="flex gap-1 px-2 mt-2">
                        {hourlyData.map((hourData, index) => (
                          <div key={index} className="text-center" style={{ width: 'calc((100% - 48px) / 24)' }}>
                            <div className="text-xs text-amber-700 font-medium">
                              {index}
                            </div>
                            <div className="text-xs font-bold text-amber-800">
                              {hourData.amount > 0 ? `${hourData.amount}ml` : '-'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Y軸メモリ */}
                    <div className="absolute left-0 top-0 h-32 flex flex-col justify-between text-xs text-amber-600 pl-2">
                      {[step * 4, step * 3, step * 2, step, 0].map(value => (
                        <div key={value} className="text-right">
                          {value}ml
                        </div>
                      ))}
                    </div>
                  </>
                )
              })()}
            </div>
          </div>
        )}

        {/* カレンダー形式ヒートマップ */}
        <div className="bg-white p-8 rounded-xl shadow-xl border-2 border-amber-200 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold flex items-center text-amber-800">
              <span className="text-2xl mr-3">📅</span>
              飲酒ヒートマップ
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  const newMonth = new Date(currentMonth)
                  newMonth.setMonth(newMonth.getMonth() - 1)
                  setCurrentMonth(newMonth)
                }}
                className="bg-amber-500 text-white px-3 py-1 rounded-lg hover:bg-amber-600 transition-all duration-200"
              >
                ←
              </button>
              <span className="text-lg font-semibold text-amber-800 min-w-32 text-center">
                {currentMonth.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}
              </span>
              <button
                onClick={() => {
                  const newMonth = new Date(currentMonth)
                  newMonth.setMonth(newMonth.getMonth() + 1)
                  setCurrentMonth(newMonth)
                }}
                className="bg-amber-500 text-white px-3 py-1 rounded-lg hover:bg-amber-600 transition-all duration-200"
              >
                →
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {(() => {
              const year = currentMonth.getFullYear()
              const month = currentMonth.getMonth()
              const daysInMonth = new Date(year, month + 1, 0).getDate()
              const firstDay = new Date(year, month, 1).getDay()
              
              const heatmapData = []
              
              // 月の最初の日の曜日まで空白を追加
              for (let i = 0; i < firstDay; i++) {
                heatmapData.push(null)
              }
              
              // 月の全日を追加
              for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month, day)
                const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
                const dayRecords = records.filter(record => record.date === dateStr)
                const weekdayNum = date.getDay()
                
                heatmapData.push({
                  date: dateStr,
                  day: day,
                  weekday: date.toLocaleDateString('ja-JP', { weekday: 'narrow' }),
                  cans: dayRecords.length,
                  amount: dayRecords.reduce((sum, r) => sum + r.amount, 0),
                  isWeekend: weekdayNum === 0 || weekdayNum === 6,
                  isSunday: weekdayNum === 0
                })
              }
              
              return heatmapData.map((day, index) => {
                if (!day) {
                  return <div key={index} className="p-2"></div>
                }
                
                let bgColor = 'bg-gray-100'
                if (day.amount >= 750) bgColor = 'bg-red-500'
                else if (day.amount >= 500) bgColor = 'bg-orange-500' 
                else if (day.amount >= 250) bgColor = 'bg-yellow-500'
                else if (day.amount >= 1) bgColor = 'bg-amber-400'
                else bgColor = 'bg-gray-100'
                
                return (
                  <div 
                    key={index} 
                    className={`${bgColor} p-2 rounded-lg text-center cursor-pointer transition-colors duration-300 hover:opacity-80 border border-amber-300 min-h-16`}
                    title={`${day.date}: ${day.amount}ml (${day.cans}缶)`}
                    onClick={() => {
                      setSelectedDate(day.date)
                      setShowHourlyDetail(true)
                      // 時間別パターンセクションまでスクロール
                      setTimeout(() => {
                        const hourlySection = document.querySelector('[data-hourly-pattern]')
                        if (hourlySection) {
                          hourlySection.scrollIntoView({ behavior: 'smooth' })
                        }
                      }, 100)
                    }}
                  >
                    <div className={`text-xs font-medium ${
                      day.isWeekend 
                        ? day.isSunday 
                          ? 'text-red-600' 
                          : 'text-blue-600'
                        : 'text-gray-700'
                    }`}>{day.weekday}</div>
                    <div className="text-sm font-bold text-gray-800">{day.day}</div>
                    <div className="text-xs text-gray-600">{day.amount > 0 ? `${day.amount}ml` : ''}</div>
                  </div>
                )
              })
            })()}
          </div>
          <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-amber-700">
            <span>少ない</span>
            <div className="flex space-x-1">
              <div className="w-3 h-3 bg-gray-100 rounded border border-amber-300"></div>
              <div className="w-3 h-3 bg-amber-200 rounded border border-amber-300"></div>
              <div className="w-3 h-3 bg-amber-400 rounded border border-amber-300"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded border border-amber-300"></div>
              <div className="w-3 h-3 bg-orange-500 rounded border border-amber-300"></div>
              <div className="w-3 h-3 bg-red-500 rounded border border-amber-300"></div>
            </div>
            <span>多い</span>
          </div>
        </div>

        {/* 飲みきり時間統計 */}
        {stats?.drinkingPaceStats && (
          <div className="bg-white p-8 rounded-xl shadow-xl border-2 border-amber-200 mb-8">
            <h3 className="text-xl font-semibold mb-6 flex items-center text-amber-800">
              <span className="text-2xl mr-3">⏱️</span>
              飲みきり時間統計
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* 350ml缶統計 */}
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-6 rounded-xl border border-amber-200">
                <h4 className="text-lg font-bold text-amber-800 mb-4 flex items-center">
                  <span className="text-xl mr-2">🍺</span>
                  350ml缶
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-amber-700">平均飲みきり時間</span>
                    <span className="font-bold text-amber-800">
                      {stats.drinkingPaceStats.can350.averageTime > 0 
                        ? `${Math.round(stats.drinkingPaceStats.can350.averageTime)}分`
                        : 'データなし'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-amber-700">最速記録</span>
                    <span className="font-bold text-green-700">
                      {stats.drinkingPaceStats.can350.fastestTime > 0 
                        ? `${Math.round(stats.drinkingPaceStats.can350.fastestTime)}分`
                        : 'データなし'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-amber-700">最遅記録</span>
                    <span className="font-bold text-red-700">
                      {stats.drinkingPaceStats.can350.slowestTime > 0 
                        ? `${Math.round(stats.drinkingPaceStats.can350.slowestTime)}分`
                        : 'データなし'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-amber-700">測定回数</span>
                    <span className="font-bold text-amber-800">
                      {stats.drinkingPaceStats.can350.totalSessions}回
                    </span>
                  </div>
                </div>
              </div>

              {/* 500ml缶統計 */}
              <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl border border-orange-200">
                <h4 className="text-lg font-bold text-orange-800 mb-4 flex items-center">
                  <span className="text-xl mr-2">🍺</span>
                  500ml缶
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-orange-700">平均飲みきり時間</span>
                    <span className="font-bold text-orange-800">
                      {stats.drinkingPaceStats.can500.averageTime > 0 
                        ? `${Math.round(stats.drinkingPaceStats.can500.averageTime)}分`
                        : 'データなし'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-orange-700">最速記録</span>
                    <span className="font-bold text-green-700">
                      {stats.drinkingPaceStats.can500.fastestTime > 0 
                        ? `${Math.round(stats.drinkingPaceStats.can500.fastestTime)}分`
                        : 'データなし'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-orange-700">最遅記録</span>
                    <span className="font-bold text-red-700">
                      {stats.drinkingPaceStats.can500.slowestTime > 0 
                        ? `${Math.round(stats.drinkingPaceStats.can500.slowestTime)}分`
                        : 'データなし'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-orange-700">測定回数</span>
                    <span className="font-bold text-orange-800">
                      {stats.drinkingPaceStats.can500.totalSessions}回
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 連続飲酒セッション */}
            {stats.drinkingPaceStats.consecutiveDrinkingSessions.length > 0 && (
              <div className="mt-8 bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-200">
                <h4 className="text-lg font-bold text-purple-800 mb-4 flex items-center">
                  <span className="text-xl mr-2">🔄</span>
                  連続飲酒セッション ({stats.drinkingPaceStats.consecutiveDrinkingSessions.length}回)
                </h4>
                <div className={`space-y-3 overflow-y-auto ${showAllSessions ? 'max-h-96' : 'max-h-48'}`}>
                  {stats.drinkingPaceStats.consecutiveDrinkingSessions
                    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
                    .slice(0, showAllSessions ? undefined : 5)
                    .map((session, index) => (
                    <div key={index} className="bg-white p-3 rounded-lg border border-purple-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-purple-800">
                          {new Date(session.startTime).toLocaleDateString('ja-JP')} 
                          {' '}
                          {new Date(session.startTime).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                          〜
                          {new Date(session.endTime).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-sm font-bold text-purple-700">
                          {Math.round(session.totalDuration)}分間
                        </span>
                      </div>
                      <div className="text-xs text-purple-600">
                        {session.cans.map((can, i) => (
                          <span key={i} className="inline-block mr-1">
                            {can.size}ml
                            {can.duration !== undefined && i < session.cans.length - 1 ? `(${Math.round(can.duration)}分)` : ''}
                            {i < session.cans.length - 1 ? ' → ' : ''}
                          </span>
                        ))}
                      </div>
                      <div className="text-xs text-purple-500 mt-2 border-t border-purple-200 pt-2">
                        詳細時刻: {session.cans.map((can, i) => (
                          <span key={i} className="inline-block mr-2">
                            {new Date(can.time).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                            {i < session.cans.length - 1 ? ' → ' : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {stats.drinkingPaceStats.consecutiveDrinkingSessions.length > 5 && (
                  <div className="text-center mt-4">
                    <button
                      onClick={() => setShowAllSessions(!showAllSessions)}
                      className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-all duration-200 text-sm"
                    >
                      {showAllSessions 
                        ? '最新5件のみ表示' 
                        : `他 ${stats.drinkingPaceStats.consecutiveDrinkingSessions.length - 5} セッションを表示`
                      }
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 缶サイズ別統計 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-8 rounded-xl shadow-xl border-2 border-amber-200 h-full">
            <h3 className="text-xl font-semibold mb-6 flex items-center text-amber-800">
              <span className="text-2xl mr-3">📊</span>
              缶サイズ別統計
            </h3>
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-amber-100 to-yellow-100 p-4 rounded-xl">
                <div className="text-lg font-bold text-amber-800 mb-3">容量別内訳</div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white rounded-lg border border-amber-200">
                    <div className="text-2xl font-bold text-amber-700">{stats?.can350Count}</div>
                    <div className="text-sm text-amber-600">350ml缶</div>
                    <div className="text-xs text-amber-600">({(stats?.can350Count || 0) * 350}ml)</div>
                    <div className="text-xs text-green-600 font-semibold">¥{((stats?.can350Count || 0) * 204).toLocaleString()}</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border border-orange-200">
                    <div className="text-2xl font-bold text-orange-700">{stats?.can500Count}</div>
                    <div className="text-sm text-orange-600">500ml缶</div>
                    <div className="text-xs text-orange-600">({(stats?.can500Count || 0) * 500}ml)</div>
                    <div className="text-xs text-green-600 font-semibold">¥{((stats?.can500Count || 0) * 268).toLocaleString()}</div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-4 rounded-xl">
                  <div className="text-lg font-bold text-green-800 mb-3">総金額</div>
                  <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-700">¥{(stats?.totalCost || 0).toLocaleString()}</div>
                    <div className="text-sm text-green-600">総額</div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-100 to-indigo-100 p-4 rounded-xl">
                  <div className="text-lg font-bold text-purple-800 mb-3">純アルコール量</div>
                  <div className="text-center p-4 bg-white rounded-lg border border-purple-200">
                    <div className="text-2xl font-bold text-purple-700">{stats?.totalAlcohol || 0}g</div>
                    <div className="text-sm text-purple-600">総アルコール</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-xl border-2 border-amber-200 h-full flex flex-col">
            <h3 className="text-xl font-semibold mb-6 flex items-center text-amber-800">
              <span className="text-2xl mr-3">📈</span>
              飲酒パターン分析
            </h3>
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              <div className="text-center p-4 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-xl">
                <div className="text-2xl font-bold text-amber-700">{stats?.daysWithBeer || 0}</div>
                <div className="text-sm text-amber-600">飲酒日数</div>
                <div className="text-xs text-amber-600">{getTotalDaysInPeriod()}日中</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl">
                <div className="text-2xl font-bold text-orange-700">{stats?.averagePerDay.toFixed(0) || 0}ml</div>
                <div className="text-sm text-orange-600">1日平均容量</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                <div className="text-2xl font-bold text-purple-700">{stats?.totalAmount.toFixed(0) || 0}ml</div>
                <div className="text-sm text-purple-600">期間内総容量</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}