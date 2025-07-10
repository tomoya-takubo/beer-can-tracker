'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { DrinkCategory } from '@/types/drink'
import { supabaseStorageService } from '@/lib/supabaseStorage'
import { settingsService } from '@/lib/settingsService'

interface BeerCanTrackerProps {
  onAdd: () => void
  viewPeriod: 'today' | 'week' | 'month'
  onPeriodChange: (period: 'today' | 'week' | 'month') => void
}

interface BeerCan {
  id: string
  size: '350ml' | '500ml'
  amount: number
  image: string
  added: boolean
}

export default function BeerCanTracker({ onAdd, viewPeriod, onPeriodChange }: BeerCanTrackerProps) {
  const [todayBeers, setTodayBeers] = useState<BeerCan[]>([])
  const [totalCans, setTotalCans] = useState({ can350: 0, can500: 0 })

  useEffect(() => {
    const loadRecords = async () => {
      let records: Array<{
        name: string
        category: DrinkCategory
        amount: number
        unit: string
        date: string
        time: string
        notes: string
      }> = []
      
      if (viewPeriod === 'today') {
        // 日本時間での今日の日付を取得
        const now = new Date()
        const jstDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }))
        const year = jstDate.getFullYear()
        const month = String(jstDate.getMonth() + 1).padStart(2, '0')
        const day = String(jstDate.getDate()).padStart(2, '0')
        const today = `${year}-${month}-${day}`
        
        records = (await supabaseStorageService.getRecordsByDate(today)).map(record => ({
          ...record,
          notes: record.notes ?? ''
        }))
      } else if (viewPeriod === 'week') {
        const allRecords = await supabaseStorageService.getAllRecords()
        const now = new Date()
        const weekStart = new Date(now)
        weekStart.setDate(now.getDate() - 7)
        records = allRecords
          .filter(record => new Date(record.date) >= weekStart)
          .map(record => ({
            ...record,
            notes: record.notes ?? ''
          }))
      } else if (viewPeriod === 'month') {
        const allRecords = await supabaseStorageService.getAllRecords()
        const now = new Date()
        const monthStart = new Date(now)
        monthStart.setMonth(now.getMonth() - 1)
        records = allRecords
          .filter(record => new Date(record.date) >= monthStart)
          .map(record => ({
            ...record,
            notes: record.notes ?? ''
          }))
      }
      
      const beerRecords = records.filter(record => record.category === DrinkCategory.ALCOHOL)
      
      const cans350 = beerRecords.filter(record => record.amount === 350).length
      const cans500 = beerRecords.filter(record => record.amount === 500).length
      
      setTotalCans({ can350: cans350, can500: cans500 })
      
      // 期間内の缶ビールを表示用に生成
      const beers: BeerCan[] = []
      for (let i = 0; i < cans350; i++) {
        beers.push({
          id: `350-${i}`,
          size: '350ml',
          amount: 350,
          image: '/images/drink_beer_can_short.png',
          added: true
        })
      }
      for (let i = 0; i < cans500; i++) {
        beers.push({
          id: `500-${i}`,
          size: '500ml',
          amount: 500,
          image: '/images/drink_beer_can_long.png',
          added: true
        })
      }
      setTodayBeers(beers)
    }
    
    loadRecords()
  }, [viewPeriod])

  const addBeer = async (size: '350ml' | '500ml') => {
    const amount = size === '350ml' ? 350 : 500
    const now = new Date()
    
    // 日本時間で正確な日付と時刻を取得
    const jstTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }))
    const year = jstTime.getFullYear()
    const month = String(jstTime.getMonth() + 1).padStart(2, '0')
    const day = String(jstTime.getDate()).padStart(2, '0')
    const hours = String(jstTime.getHours()).padStart(2, '0')
    const minutes = String(jstTime.getMinutes()).padStart(2, '0')
    
    const dateString = `${year}-${month}-${day}`
    const timeString = `${hours}:${minutes}`
    
    // 設定から商品名を取得
    const settings = settingsService.getBeerCanSettings()
    const productName = size === '350ml' ? settings.can350ml.name : settings.can500ml.name
    
    const formData = {
      name: productName,
      category: DrinkCategory.ALCOHOL,
      amount: amount,
      unit: 'ml',
      date: dateString,
      time: timeString,
      notes: ''
    }
    
    const savedRecord = await supabaseStorageService.saveRecord(formData)
    
    if (savedRecord) {
      // 状態更新
      if (size === '350ml') {
        setTotalCans(prev => ({ ...prev, can350: prev.can350 + 1 }))
        setTodayBeers(prev => [...prev, {
          id: `350-${prev.filter(b => b.size === '350ml').length}`,
          size: '350ml',
          amount: 350,
          image: '/images/drink_beer_can_short.png',
          added: true
        }])
      } else {
        setTotalCans(prev => ({ ...prev, can500: prev.can500 + 1 }))
        setTodayBeers(prev => [...prev, {
          id: `500-${prev.filter(b => b.size === '500ml').length}`,
          size: '500ml',
          amount: 500,
          image: '/images/drink_beer_can_long.png',
          added: true
        }])
      }
      
      onAdd()
    }
  }


  const totalAmount = totalCans.can350 * 350 + totalCans.can500 * 500
  const totalCanCount = totalCans.can350 + totalCans.can500

  return (
    <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-100 p-4 sm:p-6 lg:p-8 rounded-2xl shadow-xl border border-amber-200">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-amber-800 mb-2">🍺 今日の飲酒記録</h2>
        <div className="bg-gradient-to-br from-blue-100 via-blue-50 to-cyan-100 p-3 sm:p-4 rounded-xl shadow-lg border-2 border-blue-200">
          <div className="text-center">
            <h3 className="text-base sm:text-lg font-bold text-blue-800 mb-2">📈 今日の飲酒量の目安</h3>
            <div className="text-sm sm:text-base text-blue-700">
              今日の飲酒量は<span className="font-bold text-base sm:text-lg text-blue-900"> {totalAmount}ml</span>
            </div>
            <div className="text-sm text-blue-600 mt-1">
              {(() => {
                if (totalAmount >= 2000) return "🍺 ペットボトル1本以上です！"
                else if (totalAmount >= 1500) return "🍺 大きなペットボトル3/4本分です！"
                else if (totalAmount >= 1000) return "🍺 ペットボトル半分程度です！"
                else if (totalAmount >= 500) return "🥤 コップ約２杯分です！"
                else if (totalAmount >= 350) return "🥤 コップ約１杯分です！"
                else if (totalAmount > 0) return "🥤 コップ半分程度です！"
                else return "🍺 まだ今日は飲酒していません"
              })()
              }
            </div>
            <div className="text-sm text-purple-600 mt-1 font-semibold">
              純アルコール量: {((totalAmount / 500) * 20).toFixed(1)}g
            </div>
          </div>
        </div>
      </div>

      {/* 今日の進捗バー */}
      {true && (
        <div className="bg-gradient-to-br from-amber-100 via-yellow-100 to-orange-100 p-6 rounded-2xl shadow-xl border-2 border-amber-300 mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-amber-800 font-bold text-lg">今日の進捗</span>
            <span className={`font-bold text-lg ${
              totalAmount >= 750 ? 'text-red-700' :
              totalAmount >= 500 ? 'text-orange-700' :
              totalAmount >= 250 ? 'text-yellow-700' :
              totalAmount >= 1 ? 'text-amber-700' :
              'text-gray-700'
            }`}>
              {totalAmount}ml ({((totalAmount / 500) * 100).toFixed(0)}%)
            </span>
          </div>
          <div className="w-full bg-amber-200 rounded-full h-6 overflow-hidden">
            <div 
              className={`${
                totalAmount >= 750 
                  ? 'bg-gradient-to-r from-red-500 via-red-600 to-red-700'
                  : totalAmount >= 500
                  ? 'bg-gradient-to-r from-orange-500 via-orange-600 to-red-500'
                  : totalAmount >= 250
                  ? 'bg-gradient-to-r from-yellow-500 via-yellow-600 to-orange-500'
                  : totalAmount >= 1
                  ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500'
                  : 'bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600'
              } h-6 rounded-full transition-all duration-1000 flex items-center justify-center text-white font-bold text-sm`} 
              style={{width: `${Math.min(150, (totalAmount / 500) * 100)}%`}}
            >
              {totalAmount > 0 && `${((totalAmount / 500) * 100).toFixed(0)}%`}
            </div>
          </div>
          <div className={`text-center mt-2 text-sm ${
            totalAmount >= 750 ? 'text-red-700 font-bold' :
            totalAmount >= 500 ? 'text-orange-700 font-bold' :
            totalAmount >= 250 ? 'text-yellow-700' :
            'text-amber-700'
          }`}>
            {totalAmount >= 750
              ? '⚠️ 非常に危険な飲酒量です（適正量: 500ml以下）' 
              : totalAmount >= 500
              ? '⚠️ 適正量を超過しています（適正量: 500ml以下）'
              : totalAmount >= 250
              ? '👌適正な飲酒量の範囲内です'
              : totalAmount >= 1
              ? '参考: 一日の適正な飲酒量は500ml以下です'
              : '今日はまだ飲酒していません'
            }
          </div>
        </div>
      )}

      {/* ワンタップ追加ボタン */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
        <div className="text-center">
          <div 
            className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border-2 border-amber-300 hover:border-amber-500 active:scale-105 transition-all duration-200 cursor-pointer h-48 sm:h-56 lg:h-64 flex flex-col justify-between"
            onClick={() => addBeer('350ml')}
          >
            <h3 className="text-lg sm:text-xl font-bold text-amber-800 mb-2">350ml缶</h3>
            <div className="flex justify-center flex-1 items-center">
              <Image 
                src="/images/drink_beer_can_short.png" 
                alt="350ml缶ビール" 
                width={50} 
                height={80}
                className="transition-transform duration-200 sm:w-15 sm:h-25"
              />
            </div>
            <div className="text-center text-amber-700 text-xs sm:text-sm mb-2">
              タップして追加
            </div>
            <div className="text-xl sm:text-2xl font-bold text-amber-700">
              {totalCans.can350}缶
            </div>
          </div>
        </div>

        <div className="text-center">
          <div 
            className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border-2 border-amber-300 hover:border-amber-500 active:scale-105 transition-all duration-200 cursor-pointer h-48 sm:h-56 lg:h-64 flex flex-col justify-between"
            onClick={() => addBeer('500ml')}
          >
            <h3 className="text-lg sm:text-xl font-bold text-amber-800 mb-2">500ml缶</h3>
            <div className="flex justify-center flex-1 items-center">
              <Image 
                src="/images/drink_beer_can_long.png" 
                alt="500ml缶ビール" 
                width={50} 
                height={80}
                className="transition-transform duration-200 sm:w-15 sm:h-25"
              />
            </div>
            <div className="text-center text-amber-700 text-xs sm:text-sm mb-2">
              タップして追加
            </div>
            <div className="text-xl sm:text-2xl font-bold text-amber-700">
              {totalCans.can500}缶
            </div>
          </div>
        </div>
      </div>

      {/* 今日飲んだ缶ビールの視覚的表示 */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-amber-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-amber-800">
            {viewPeriod === 'today' ? '今日' : viewPeriod === 'week' ? '今週' : '今月'}の飲酒記録
          </h3>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => {
                const periods: ('today' | 'week' | 'month')[] = ['today', 'week', 'month']
                const currentIndex = periods.indexOf(viewPeriod)
                const prevIndex = currentIndex === 0 ? periods.length - 1 : currentIndex - 1
                onPeriodChange(periods[prevIndex])
              }}
              className="bg-amber-500 text-white px-2 sm:px-3 py-1 rounded-lg hover:bg-amber-600 transition-all duration-200 text-xs sm:text-sm"
            >
              ←
            </button>
            <button
              onClick={() => {
                const periods: ('today' | 'week' | 'month')[] = ['today', 'week', 'month']
                const currentIndex = periods.indexOf(viewPeriod)
                const nextIndex = currentIndex === periods.length - 1 ? 0 : currentIndex + 1
                onPeriodChange(periods[nextIndex])
              }}
              className="bg-amber-500 text-white px-2 sm:px-3 py-1 rounded-lg hover:bg-amber-600 transition-all duration-200 text-xs sm:text-sm"
            >
              →
            </button>
          </div>
        </div>
        {totalCanCount > 0 ? (
          <div className="flex flex-wrap justify-center gap-2 items-end">
            {todayBeers.map((beer, index) => (
              <div key={`${beer.id}-${index}`} className="relative flex flex-col items-center">
                <div className="relative">
                  <Image 
                    src={beer.image} 
                    alt={`${beer.size}缶ビール`} 
                    width={40} 
                    height={beer.size === '350ml' ? 50 : 60}
                    className="opacity-80 hover:opacity-100 transition-opacity duration-200"
                  />
                  <div className="absolute -top-2 -right-2 bg-amber-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-amber-600">
            <div className="text-4xl mb-2">🍺</div>
            <p>{viewPeriod === 'today' ? 'まだ今日は' : viewPeriod === 'week' ? 'この1週間は' : 'この1ヶ月は'}飲酒していません</p>
          </div>
        )}
      </div>
    </div>
  )
}