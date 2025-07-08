'use client'

import { useState, useRef } from 'react'
import { DrinkRecord } from '@/types/drink'
import { ExportService, ImportService } from '@/lib/exportService'
import { supabaseStorageService } from '@/lib/supabaseStorage'

interface ExportImportModalProps {
  records: DrinkRecord[]
  stats?: any
  isOpen: boolean
  onClose: () => void
  onImportComplete?: () => void
}

export default function ExportImportModal({ 
  records, 
  stats, 
  isOpen, 
  onClose, 
  onImportComplete 
}: ExportImportModalProps) {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleExportAll = (format: 'csv' | 'json') => {
    if (format === 'csv') {
      ExportService.exportToCSV(records)
    } else {
      ExportService.exportToJSON(records)
    }
  }

  const handleExportDetailed = () => {
    ExportService.exportDetailedReport(records, stats)
  }

  const handleExportDateRange = (format: 'csv' | 'json') => {
    if (!startDate || !endDate) {
      alert('開始日と終了日を設定してください')
      return
    }
    ExportService.exportByDateRange(records, startDate, endDate, format)
  }

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImporting(true)
    
    try {
      let importedRecords: DrinkRecord[] | null = null
      
      if (file.name.endsWith('.json')) {
        importedRecords = await ImportService.importFromJSON(file)
      } else if (file.name.endsWith('.csv')) {
        importedRecords = await ImportService.importFromCSV(file)
      } else {
        alert('対応していないファイル形式です。JSONまたはCSVファイルを選択してください。')
        return
      }

      if (!importedRecords || importedRecords.length === 0) {
        alert('インポートできるデータが見つかりませんでした')
        return
      }

      // データをSupabaseに保存
      let successCount = 0
      let errorCount = 0

      for (const record of importedRecords) {
        try {
          const result = await supabaseStorageService.saveRecord({
            name: record.name,
            category: record.category,
            amount: record.amount,
            unit: record.unit,
            date: record.date,
            time: record.time,
            notes: record.notes
          })
          
          if (result) {
            successCount++
          } else {
            errorCount++
          }
        } catch (error) {
          console.error('Record import error:', error)
          errorCount++
        }
      }

      alert(`インポート完了\n成功: ${successCount}件\nエラー: ${errorCount}件`)
      
      if (successCount > 0 && onImportComplete) {
        onImportComplete()
      }
      
      onClose()
    } catch (error) {
      console.error('Import error:', error)
      alert('インポート中にエラーが発生しました')
    } finally {
      setImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-amber-800">📊 データ管理</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-3xl sm:text-2xl min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              ×
            </button>
          </div>

          {/* タブ */}
          <div className="flex mb-4 sm:mb-6 border-b border-amber-200">
            <button
              onClick={() => setActiveTab('export')}
              className={`px-3 sm:px-4 py-3 sm:py-2 font-medium transition-colors duration-200 min-h-[48px] flex-1 sm:flex-initial ${
                activeTab === 'export'
                  ? 'text-amber-800 border-b-2 border-amber-600'
                  : 'text-gray-600 hover:text-amber-700'
              }`}
            >
              📤 エクスポート
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`px-3 sm:px-4 py-3 sm:py-2 font-medium transition-colors duration-200 min-h-[48px] flex-1 sm:flex-initial ${
                activeTab === 'import'
                  ? 'text-amber-800 border-b-2 border-amber-600'
                  : 'text-gray-600 hover:text-amber-700'
              }`}
            >
              📥 インポート
            </button>
          </div>

          {/* エクスポートタブ */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              {/* 全データエクスポート */}
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <h3 className="text-lg font-semibold text-amber-800 mb-3">全データエクスポート</h3>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => handleExportAll('csv')}
                      className="bg-green-500 text-white px-3 sm:px-4 py-3 sm:py-2 rounded-lg hover:bg-green-600 transition-all duration-200 flex items-center gap-2 min-h-[48px] text-sm sm:text-base w-full sm:w-auto justify-center"
                    >
                      📄 CSV形式でダウンロード
                    </button>
                    <button
                      onClick={() => handleExportAll('json')}
                      className="bg-blue-500 text-white px-3 sm:px-4 py-3 sm:py-2 rounded-lg hover:bg-blue-600 transition-all duration-200 flex items-center gap-2 min-h-[48px] text-sm sm:text-base w-full sm:w-auto justify-center"
                    >
                      💾 JSON形式でダウンロード
                    </button>
                  </div>
                  <p className="text-sm text-amber-600">
                    CSV: Excel等で開いて分析可能 | JSON: バックアップ・復元用
                  </p>
                </div>
              </div>

              {/* 詳細レポート */}
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h3 className="text-lg font-semibold text-purple-800 mb-3">詳細レポート</h3>
                <div className="space-y-3">
                  <button
                    onClick={handleExportDetailed}
                    className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-all duration-200 flex items-center gap-2"
                  >
                    📈 統計付きレポートをダウンロード
                  </button>
                  <p className="text-sm text-purple-600">
                    統計情報と詳細記録をまとめたレポートを生成します
                  </p>
                </div>
              </div>

              {/* 期間指定エクスポート */}
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h3 className="text-lg font-semibold text-orange-800 mb-3">期間指定エクスポート</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-orange-700 mb-1">開始日</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full p-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-orange-700 mb-1">終了日</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full p-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => handleExportDateRange('csv')}
                      className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-all duration-200"
                    >
                      CSV形式
                    </button>
                    <button
                      onClick={() => handleExportDateRange('json')}
                      className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-all duration-200"
                    >
                      JSON形式
                    </button>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                💡 <strong>ヒント:</strong> エクスポートしたデータは他のデバイスや別のアカウントでインポートして使用できます。
              </div>
            </div>
          )}

          {/* インポートタブ */}
          {activeTab === 'import' && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">ファイルからインポート</h3>
                <div className="space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,.csv"
                    onChange={handleFileImport}
                    disabled={importing}
                    className="w-full p-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-blue-600">
                    JSON形式またはCSV形式のファイルをアップロードしてください
                  </p>
                  {importing && (
                    <div className="flex items-center gap-2 text-blue-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      インポート中...
                    </div>
                  )}
                </div>
              </div>

              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                ⚠️ <strong>注意:</strong> インポートしたデータは現在のデータに追加されます。重複した記録が作成される可能性があります。
              </div>

              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg space-y-2">
                <div><strong>対応形式:</strong></div>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>JSON:</strong> このアプリからエクスポートしたバックアップファイル</li>
                  <li><strong>CSV:</strong> Excel等で編集したCSVファイル（UTF-8エンコード推奨）</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}