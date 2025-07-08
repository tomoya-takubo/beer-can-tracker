'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabaseStorageService } from '@/lib/supabaseStorage'
import { beerStatsService } from '@/lib/beerStats'
import { DrinkRecord, DrinkCategory } from '@/types/drink'
import ExportImportModal from '@/components/ExportImportModal'

export default function RecordsPage() {
  const [records, setRecords] = useState<DrinkRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<DrinkRecord[]>([])
  const [filterCanSize, setFilterCanSize] = useState<string>('all')
  const [filterDate, setFilterDate] = useState<string>('')
  const [showExportModal, setShowExportModal] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const loadRecords = async () => {
      const allRecords = await supabaseStorageService.getAllRecords()
      const sortedRecords = allRecords.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`)
        const dateB = new Date(`${b.date}T${b.time}`)
        return dateB.getTime() - dateA.getTime()
      })
      setRecords(sortedRecords)
      setFilteredRecords(sortedRecords)
    }
    
    loadRecords()
  }, [refreshKey])

  useEffect(() => {
    let filtered = records

    if (filterCanSize !== 'all') {
      const targetAmount = filterCanSize === '350ml' ? 350 : 500
      filtered = filtered.filter(record => record.amount === targetAmount)
    }

    if (filterDate) {
      filtered = filtered.filter(record => record.date === filterDate)
    }

    setFilteredRecords(filtered)
  }, [records, filterCanSize, filterDate])

  const handleDelete = async (id: string) => {
    const success = await supabaseStorageService.deleteRecord(id)
    if (success) {
      const updatedRecords = records.filter(record => record.id !== id)
      setRecords(updatedRecords)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const beerStats = records.length > 0 ? beerStatsService.calculateBeerStats(records) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-100">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-amber-800 mb-2">🍺 缶ビール記録一覧</h1>
            <p className="text-sm sm:text-base text-amber-700">過去の缶ビール記録を確認・管理できます</p>
          </div>
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => setShowExportModal(true)}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg flex items-center gap-1 sm:gap-2 text-sm sm:text-base flex-1 sm:flex-initial justify-center"
            >
              📊 <span className="hidden sm:inline">データ管理</span><span className="sm:hidden">管理</span>
            </button>
            <Link href="/" className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-200 shadow-lg text-sm sm:text-base flex-1 sm:flex-initial text-center">
              <span className="hidden sm:inline">ホームに戻る</span><span className="sm:hidden">ホーム</span>
            </Link>
          </div>
        </div>

        {/* 缶ビール統計サマリー */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-xl shadow-lg border-2 border-amber-200">
            <div className="text-center">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-amber-700">{beerStats?.totalCans || 0}</div>
              <div className="text-xs sm:text-sm lg:text-base text-amber-600 font-medium">総缶数</div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-amber-200">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-700">{beerStats?.totalAmount.toFixed(0) || 0}ml</div>
              <div className="text-orange-600 font-medium">総容量</div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-amber-200">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-700">{beerStats?.can350Count || 0}</div>
              <div className="text-red-600 font-medium">350ml缶</div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-amber-200">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-700">{beerStats?.can500Count || 0}</div>
              <div className="text-purple-600 font-medium">500ml缶</div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-amber-200">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-700">¥{(beerStats?.totalCost || 0).toLocaleString()}</div>
              <div className="text-green-600 font-medium">総金額</div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-amber-200">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-700">{beerStats?.totalAlcohol || 0}g</div>
              <div className="text-indigo-600 font-medium">純アルコール量</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg mb-6 sm:mb-8 border-2 border-amber-200">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center text-amber-800">
            <span className="text-xl sm:text-2xl mr-2 sm:mr-3">🔍</span>
            フィルター
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-amber-700">缶サイズ</label>
              <select
                value={filterCanSize}
                onChange={(e) => setFilterCanSize(e.target.value)}
                className="w-full p-2 sm:p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base"
              >
                <option value="all">すべてのサイズ</option>
                <option value="350ml">350ml缶</option>
                <option value="500ml">500ml缶</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-amber-700">日付</label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full p-2 sm:p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-amber-200">
          <div className="p-4 sm:p-6 border-b border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50">
            <h2 className="text-lg sm:text-xl font-semibold flex items-center text-amber-800">
              <span className="text-xl sm:text-2xl mr-2 sm:mr-3">🍺</span>
              <span className="hidden sm:inline">缶ビール記録一覧 ({filteredRecords.length} 件)</span>
              <span className="sm:hidden">記録一覧 ({filteredRecords.length})</span>
            </h2>
          </div>
        
        {filteredRecords.length === 0 ? (
          <div className="p-6 sm:p-8 text-center text-amber-600">
            <div className="text-3xl sm:text-4xl mb-4">🍺</div>
            <p className="text-sm sm:text-base">記録がありません</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-amber-100 to-yellow-100">
                <tr>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-amber-700 uppercase tracking-wider">
                    <span className="hidden sm:inline">画像</span><span className="sm:hidden">缶</span>
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-amber-700 uppercase tracking-wider">
                    日時
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-amber-700 uppercase tracking-wider">
                    サイズ
                  </th>
                  <th className="hidden md:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-amber-700 uppercase tracking-wider">
                    備考
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-amber-700 uppercase tracking-wider">
                    <span className="hidden sm:inline">操作</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-amber-100">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-amber-50 transition-colors duration-200">
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="flex items-end justify-center">
                        <Image 
                          src={record.amount === 350 ? '/images/drink_beer_can_short.png' : '/images/drink_beer_can_long.png'}
                          alt={`${record.amount}ml缶ビール`}
                          width={24}
                          height={record.amount === 350 ? 30 : 36}
                          className="opacity-80 sm:w-8 sm:h-10"
                        />
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-amber-800">
                      <div className={`font-medium ${
                        (() => {
                          const weekday = new Date(record.date).getDay()
                          return weekday === 0 ? 'text-red-600' : weekday === 6 ? 'text-blue-600' : 'text-amber-800'
                        })()
                      }`}>
                        <span className="hidden sm:inline">{formatDate(record.date)} ({new Date(record.date).toLocaleDateString('ja-JP', { weekday: 'short' })})</span>
                        <span className="sm:hidden">{new Date(record.date).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}</span>
                      </div>
                      <div className="text-amber-600">{record.time.slice(0, 5)}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-amber-800">
                      <span className={`inline-flex px-2 sm:px-3 py-1 text-xs font-semibold rounded-full ${
                        record.amount === 350 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {record.amount}ml
                      </span>
                    </td>
                    <td className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-amber-700 max-w-xs truncate">
                      <input
                        type="text"
                        value={record.notes || ''}
                        onChange={async (e) => {
                          const formData = {
                            name: record.name,
                            category: record.category,
                            amount: record.amount,
                            unit: record.unit,
                            date: record.date,
                            time: record.time,
                            notes: e.target.value
                          }
                          const updatedRecord = await supabaseStorageService.updateRecord(record.id, formData)
                          if (updatedRecord) {
                            const updatedRecords = records.map(r => r.id === record.id ? updatedRecord : r)
                            setRecords(updatedRecords)
                          }
                        }}
                        placeholder="自由にメモを残せます（飲んだ場所、気分など）"
                        className="w-full p-1 border border-amber-300 rounded focus:ring-1 focus:ring-amber-500 focus:border-transparent text-xs sm:text-sm"
                      />
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="bg-gradient-to-r from-red-500 to-red-600 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg text-xs sm:text-sm"
                      >
                        <span className="hidden sm:inline">削除</span><span className="sm:hidden">×</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </div>

        {/* エクスポート・インポートモーダル */}
        <ExportImportModal
          records={records}
          stats={beerStats}
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          onImportComplete={() => setRefreshKey(prev => prev + 1)}
        />
      </div>
    </div>
  )
}