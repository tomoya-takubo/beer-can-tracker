'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import BeerCanTracker from '@/components/BeerCanTracker'
import { AuthGuard } from '@/components/AuthGuard'
import { useAuth } from '@/components/AuthProvider'
import { supabaseStorageService } from '@/lib/supabaseStorage'
import { beerStatsService } from '@/lib/beerStats'
import { DrinkRecord, DrinkCategory, DrinkingGoals, GoalProgress as GoalProgressType } from '@/types/drink'
import { goalsService } from '@/lib/goalsService'
import ExportImportModal from '@/components/ExportImportModal'
import AccountDeletionModal from '@/components/AccountDeletionModal'
import BeerCanSettingsModal from '@/components/BeerCanSettingsModal'

export default function Home() {
  const { user, signOut } = useAuth()
  const [todayRecords, setTodayRecords] = useState<DrinkRecord[]>([])
  const [refreshKey, setRefreshKey] = useState(0)
  const [canViewPeriod, setCanViewPeriod] = useState<'today' | 'week' | 'month'>('today')
  const [showExportModal, setShowExportModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [beerStats, setBeerStats] = useState<any>(null)

  useEffect(() => {
    const loadTodayRecords = async () => {
      // 日本時間での今日の日付を取得
      const now = new Date()
      const jstDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }))
      const year = jstDate.getFullYear()
      const month = String(jstDate.getMonth() + 1).padStart(2, '0')
      const day = String(jstDate.getDate()).padStart(2, '0')
      const today = `${year}-${month}-${day}`
      
      const records = await supabaseStorageService.getRecordsByDate(today)
      setTodayRecords(records)
    }
    
    loadTodayRecords()
  }, [refreshKey])

  const handleAddRecord = () => {
    setRefreshKey((prev: number) => prev + 1)
  }

  const todayTotal = todayRecords.reduce((sum, record) => sum + record.amount, 0)
  const [allRecords, setAllRecords] = useState<DrinkRecord[]>([])
  
  useEffect(() => {
    const loadAllRecords = async () => {
      const records = await supabaseStorageService.getAllRecords()
      setAllRecords(records)
      
      // 統計を計算
      if (records.length > 0) {
        const stats = await beerStatsService.calculateBeerStats(records)
        setBeerStats(stats)
      } else {
        setBeerStats(null)
      }
    }
    
    loadAllRecords()
  }, [refreshKey])
  const todayCans = todayRecords.length

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-100">
        <div className="container mx-auto px-4 py-8">
          {/* ヘッダー（レスポンシブ対応） */}
          <div className="mb-8">
            {/* デスクトップ版レイアウト */}
            <div className="hidden sm:block relative">
              <div className="text-center">
                <h1 className="text-5xl font-bold text-amber-800 mb-4">🍺 BeerCan Tracker</h1>
                <p className="text-xl text-amber-700 font-medium">缶ビール専用記録アプリ - 飲酒量を適切に管理</p>
                <div className="mt-4 inline-block bg-amber-600 text-white px-6 py-2 rounded-full font-bold text-lg shadow-lg">
                  Alcohol Consumption Management System
                </div>
              </div>
              <div className="absolute top-0 right-0">
                <div className="bg-white p-4 rounded-xl shadow-lg border border-amber-200">
                  <div className="text-sm text-amber-600 mb-2">
                    {user?.email}
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={signOut}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-200 text-sm w-full"
                    >
                      ログアウト
                    </button>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all duration-200 text-sm w-full"
                    >
                      アカウント削除
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* モバイル版レイアウト */}
            <div className="sm:hidden">
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-amber-800 mb-4">🍺 BeerCan Tracker</h1>
                <p className="text-lg text-amber-700 font-medium">缶ビール専用記録アプリ - 飲酒量を適切に管理</p>
                <div className="mt-4 inline-block bg-amber-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                  Alcohol Consumption Management System
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-lg border border-amber-200">
                <div className="text-sm text-amber-600 mb-3 text-center">
                  {user?.email}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={signOut}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-200 text-sm flex-1"
                  >
                    ログアウト
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all duration-200 text-sm flex-1"
                  >
                    アカウント削除
                  </button>
                </div>
              </div>
            </div>
          </div>

        {/* 缶ビール記録エリア */}
        <div className="mb-8">
          <BeerCanTracker 
            onAdd={handleAddRecord} 
            viewPeriod={canViewPeriod} 
            onPeriodChange={setCanViewPeriod}
            refreshKey={refreshKey}
          />
        </div>



        {/* 缶ビール専用コンテンツ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl shadow-xl border-2 border-amber-200 flex flex-col">
            <div className="flex items-center mb-6">
              <span className="text-3xl mr-4">📋</span>
              <h2 className="text-2xl font-bold text-amber-800">最近の飲酒記録</h2>
            </div>
            <div className="space-y-3 mb-6 flex-1">
              {allRecords
                .sort((a, b) => {
                  const dateA = new Date(`${a.date}T${a.time}`)
                  const dateB = new Date(`${b.date}T${b.time}`)
                  return dateB.getTime() - dateA.getTime()
                })
                .slice(0, 11)
                .map((record, index) => (
                <div key={record.id} className={`flex items-center p-3 rounded-xl border-2 ${
                  record.amount === 350 
                    ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-300' 
                    : 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-300'
                }`}>
                  <div className="mr-4 flex items-end">
                    <Image 
                      src={record.amount === 350 ? '/images/drink_beer_can_short.png' : '/images/drink_beer_can_long.png'}
                      alt={`${record.amount}ml缶ビール`}
                      width={32}
                      height={record.amount === 350 ? 40 : 48}
                      className="opacity-80"
                    />
                  </div>
                  <div className="flex-1">
                    <div className={`font-bold ${
                      record.amount === 350 ? 'text-amber-800' : 'text-orange-800'
                    }`}>{record.name}</div>
                    <div className={`text-sm ${
                      record.amount === 350 ? 'text-amber-600' : 'text-orange-600'
                    }`}>
                      {record.amount.toFixed(0)} ml - 
                      <span className={`${
                        (() => {
                          const weekday = new Date(record.date).getDay()
                          if (weekday === 0) return 'text-red-600' // 日曜日
                          if (weekday === 6) return 'text-blue-600' // 土曜日
                          return record.amount === 350 ? 'text-amber-600' : 'text-orange-600'
                        })()
                      }`}>
                        {new Date(record.date).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', weekday: 'short' })}
                      </span>
                      {' '}{record.time.slice(0, 5)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-white px-3 py-1 rounded-full text-sm font-bold ${
                      record.amount === 350 ? 'bg-amber-600' : 'bg-orange-600'
                    }`}>
                      #{index + 1}
                    </div>
                  </div>
                </div>
              ))}
              {allRecords.length === 0 && (
                <div className="text-center flex-1 flex flex-col justify-center text-amber-600">
                  <div className="text-4xl mb-4">🍺</div>
                  <p>まだ飲酒の記録はありません</p>
                </div>
              )}
            </div>
            <div className="mt-auto">
              <Link href="/records" className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 block text-center transition-all duration-200 font-bold shadow-lg">
                📊 全記録を確認
              </Link>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl shadow-xl border-2 border-amber-200 flex flex-col">
            <div className="flex items-center mb-6">
              <span className="text-3xl mr-4">📈</span>
              <h2 className="text-2xl font-bold text-amber-800">飲酒量統計</h2>
            </div>
            <div className="space-y-6 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-xl">
                  <div className="text-2xl font-bold text-amber-700">{beerStats ? beerStats.totalCans : 0}</div>
                  <div className="text-sm text-amber-600">総缶数</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl">
                  <div className="text-2xl font-bold text-orange-700">{beerStats ? beerStats.totalAmount.toFixed(0) : 0}ml</div>
                  <div className="text-sm text-orange-600">総容量</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center p-4 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl">
                  <div className="text-2xl font-bold text-green-700">¥{beerStats ? beerStats.totalCost.toLocaleString() : 0}</div>
                  <div className="text-sm text-green-600">総金額</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl">
                  <div className="text-2xl font-bold text-purple-700">{beerStats ? beerStats.totalAlcohol : 0}g</div>
                  <div className="text-sm text-purple-600">純アルコール量</div>
                </div>
              </div>
                
              {/* 総飲酒量の例え */}
              <div className="bg-gradient-to-br from-blue-100 via-blue-50 to-cyan-100 p-4 rounded-xl border-2 border-blue-200">
                <div className="text-center">
                  <h3 className="text-lg font-bold text-blue-800 mb-2">📊 総飲酒量の目安</h3>
                  <div className="text-base text-blue-700">
                    これまでの総飲酒量は<span className="font-bold text-lg text-blue-900"> {beerStats ? beerStats.totalAmount.toFixed(0) : 0}ml</span>
                  </div>
                  <div className="text-sm text-blue-700 mt-1">
                    総純アルコール量: <span className="font-bold text-blue-900">{beerStats ? beerStats.totalAlcohol : 0}g</span>
                  </div>
                  <div className="text-sm text-blue-600 mt-1">
                    {(() => {
                      const totalAmount = beerStats ? beerStats.totalAmount : 0
                      if (totalAmount >= 20000) return "🪣 大きなバケツ約2杯分以上に相当します"
                      else if (totalAmount >= 10000) return "🪣 バケツ約1杯分以上に相当します"
                      else if (totalAmount >= 5000) return "🍼 大きなペットボトル約2.5本分以上です"
                      else if (totalAmount >= 2000) return "🥤 ペットボトル約1本分以上です"
                      else if (totalAmount >= 1000) return "🥤 ペットボトル半分程度以上です"
                      else if (totalAmount > 0) return "🥤 コップ数杯分以上です"
                      else return "📊 まだ記録がありません"
                    })()}
                  </div>
                </div>
              </div>

              {/* 飲みきり時間統計サマリー */}
              {beerStats?.drinkingPaceStats && (
                <div className="bg-gradient-to-br from-purple-100 via-purple-50 to-indigo-100 p-4 rounded-xl border-2 border-purple-200">
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-purple-800 mb-2">⏱️ 飲みきり時間</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white p-2 rounded-lg border border-purple-200">
                        <div className="text-xs text-purple-700">350ml缶 平均</div>
                        <div className="text-sm font-bold text-purple-800">
                          {beerStats.drinkingPaceStats.can350.averageTime > 0 
                            ? `${Math.round(beerStats.drinkingPaceStats.can350.averageTime)}分`
                            : 'データなし'}
                        </div>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-purple-200">
                        <div className="text-xs text-purple-700">500ml缶 平均</div>
                        <div className="text-sm font-bold text-purple-800">
                          {beerStats.drinkingPaceStats.can500.averageTime > 0 
                            ? `${Math.round(beerStats.drinkingPaceStats.can500.averageTime)}分`
                            : 'データなし'}
                        </div>
                      </div>
                    </div>
                    {beerStats.drinkingPaceStats.consecutiveDrinkingSessions.length > 0 && (
                      <div className="text-xs text-purple-600 mt-2">
                        連続飲酒セッション: {beerStats.drinkingPaceStats.consecutiveDrinkingSessions.length}回
                      </div>
                    )}
                  </div>
                </div>
              )}
                
                <div className="bg-gradient-to-r from-amber-100 to-yellow-100 p-4 rounded-xl">
                  <div className="text-lg font-bold text-amber-800 mb-4">過去7日間の推移</div>
                  <div className="relative pl-14">
                    <div className="border-l-2 border-b-2 border-amber-400">
                      {(() => {
                        const last7Days = Array.from({length: 7}, (_, i) => {
                          const date = new Date()
                          date.setDate(date.getDate() - (6 - i))
                          // 日本時間での日付文字列を生成
                          const jstDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }))
                          const year = jstDate.getFullYear()
                          const month = String(jstDate.getMonth() + 1).padStart(2, '0')
                          const day = String(jstDate.getDate()).padStart(2, '0')
                          const dateStr = `${year}-${month}-${day}`
                          const dayRecords = allRecords.filter(r => r.date === dateStr)
                          const weekday = date.getDay()
                          return {
                            date: dateStr,
                            cans: dayRecords.length,
                            amount: dayRecords.reduce((sum, r) => sum + r.amount, 0),
                            isWeekend: weekday === 0 || weekday === 6,
                            isSunday: weekday === 0
                          }
                        })
                        const maxAmount = Math.max(...last7Days.map(d => d.amount), 500)
                        const step = Math.ceil(maxAmount / 4 / 100) * 100
                        const adjustedMaxAmount = step * 4 // Y軸の最大値に合わせる
                        
                        return (
                          <>
                            <div className="flex h-40 gap-1 sm:gap-2 px-2 relative">
                              {last7Days.map((day, index) => {
                                const barColor = day.isWeekend 
                                  ? day.isSunday 
                                    ? 'bg-gradient-to-t from-red-500 to-red-300'
                                    : 'bg-gradient-to-t from-blue-500 to-blue-300'
                                  : 'bg-gradient-to-t from-amber-500 to-amber-300'
                                
                                return (
                                  <div key={index} className="relative" style={{ width: 'calc((100% - 48px) / 7)' }}>
                                    <div 
                                      className={`${barColor} w-full rounded-t-lg transition-all duration-1000 ease-out hover:opacity-80 absolute bottom-0`}
                                      style={{ 
                                        height: `${(day.amount / adjustedMaxAmount) * 160}px`, 
                                        minHeight: day.amount > 0 ? '8px' : '0px' 
                                      }}
                                      title={`${day.date}: ${day.cans}缶 (${day.amount}ml)`}
                                    />
                                  </div>
                                )
                              })}
                            </div>
                            <div className="flex gap-1 sm:gap-2 px-2 mt-2">
                              {last7Days.map((day, index) => (
                                <div key={index} className="text-center" style={{ width: 'calc((100% - 48px) / 7)' }}>
                                  <div className={`text-xs font-medium ${
                                    day.isWeekend 
                                      ? day.isSunday 
                                        ? 'text-red-600' 
                                        : 'text-blue-600'
                                      : 'text-amber-700'
                                  }`}>
                                    {new Date(day.date).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}
                                  </div>
                                  <div className="text-xs font-bold text-amber-800">
                                    {day.amount > 0 ? `${day.amount}ml` : '-'}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        )
                      })()} 
                    </div>
                    {/* Y軸メモリ */}
                    <div className="absolute -left-0 top-0 h-40 flex flex-col justify-between text-xs text-amber-600 w-10">
                      {(() => {
                        // 再計算: last7DaysとmaxAmountをここでも定義
                        const last7Days = Array.from({length: 7}, (_, i) => {
                          const date = new Date()
                          date.setDate(date.getDate() - (6 - i))
                          // 日本時間での日付文字列を生成
                          const jstDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }))
                          const year = jstDate.getFullYear()
                          const month = String(jstDate.getMonth() + 1).padStart(2, '0')
                          const day = String(jstDate.getDate()).padStart(2, '0')
                          const dateStr = `${year}-${month}-${day}`
                          const dayRecords = allRecords.filter(r => r.date === dateStr)
                          return {
                            amount: dayRecords.reduce((sum, r) => sum + r.amount, 0),
                          }
                        })
                        const maxAmount = Math.max(...last7Days.map(d => d.amount), 500)
                        const step = Math.ceil(maxAmount / 4 / 100) * 100
                        return [step * 4, step * 3, step * 2, step, 0].map(value => (
                          <div key={value} className="text-right">
                            {value}ml
                          </div>
                        ))
                      })()}
                    </div>
                  </div>
                </div>
            </div>
            <div className="mt-auto space-y-3">
              <button
                onClick={() => setShowSettingsModal(true)}
                className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-xl hover:from-gray-600 hover:to-gray-700 block w-full text-center transition-all duration-200 font-bold shadow-lg"
              >
                ⚙️ 缶ビール設定
              </button>
              <Link href="/stats" className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-purple-700 block text-center transition-all duration-200 font-bold shadow-lg">
                📊 詳細分析を見る
              </Link>
            </div>
          </div>
        </div>

        {/* エクスポート・インポートモーダル */}
        <ExportImportModal
          records={allRecords}
          stats={beerStats}
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          onImportComplete={() => setRefreshKey(prev => prev + 1)}
        />


        {/* アカウント削除モーダル */}
        <AccountDeletionModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onDeleteComplete={() => window.location.href = '/login'}
        />

        {/* 設定モーダル */}
        <BeerCanSettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          onSave={async () => {
            // 統計を再計算
            if (allRecords.length > 0) {
              const stats = await beerStatsService.calculateBeerStats(allRecords)
              setBeerStats(stats)
            }
            // BeerCanTrackerの設定表示を更新
            setRefreshKey(prev => prev + 1)
          }}
        />

        </div>
      </div>
    </AuthGuard>
  )
}