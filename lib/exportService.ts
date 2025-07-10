import { DrinkRecord } from '@/types/drink'

export class ExportService {
  // CSVファイルとしてエクスポート
  static exportToCSV(records: DrinkRecord[], filename?: string): void {
    if (records.length === 0) {
      alert('エクスポートするデータがありません')
      return
    }

    // CSVヘッダー
    const headers = [
      'ID',
      '名前',
      'カテゴリ',
      '容量',
      '単位',
      '日付',
      '時間',
      '備考'
    ]

    // CSVデータの生成
    const csvContent = [
      headers.join(','),
      ...records.map(record => [
        record.id,
        `"${record.name}"`,
        record.category,
        record.amount,
        record.unit,
        record.date,
        record.time,
        `"${record.notes || ''}"`
      ].join(','))
    ].join('\n')

    // BOMを追加してExcelで正しく日本語表示されるようにする
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
    
    // ファイル名の生成
    const defaultFilename = `drink-records-${new Date().toISOString().split('T')[0]}.csv`
    const finalFilename = filename || defaultFilename

    // ダウンロード実行
    this.downloadFile(blob, finalFilename)
  }

  // JSONファイルとしてエクスポート（バックアップ用）
  static exportToJSON(records: DrinkRecord[], filename?: string): void {
    if (records.length === 0) {
      alert('エクスポートするデータがありません')
      return
    }

    const exportData = {
      exportDate: new Date().toISOString(),
      recordCount: records.length,
      version: '1.0',
      records: records
    }

    const jsonContent = JSON.stringify(exportData, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
    
    // ファイル名の生成
    const defaultFilename = `drink-records-backup-${new Date().toISOString().split('T')[0]}.json`
    const finalFilename = filename || defaultFilename

    // ダウンロード実行
    this.downloadFile(blob, finalFilename)
  }

  // 統計データもまとめてエクスポート
  static exportDetailedReport(records: DrinkRecord[], stats: any): void {
    if (records.length === 0) {
      alert('エクスポートするデータがありません')
      return
    }

    // 詳細レポートのCSV作成
    const reportContent = [
      '# BeerCan Tracker - 詳細レポート',
      `# エクスポート日時: ${new Date().toLocaleString('ja-JP')}`,
      `# 総記録数: ${records.length}件`,
      '',
      '## 統計サマリー',
      `総缶数,${stats?.totalCans || 0}`,
      `350ml缶数,${stats?.can350Count || 0}`,
      `500ml缶数,${stats?.can500Count || 0}`,
      `総容量(ml),${stats?.totalAmount?.toFixed(0) || 0}`,
      `総金額(円),${stats?.totalCost || 0}`,
      `純アルコール量(g),${stats?.totalAlcohol || 0}`,
      `1日平均容量(ml),${stats?.averagePerDay?.toFixed(1) || 0}`,
      '',
      '## 詳細記録',
      'ID,名前,カテゴリ,容量,単位,日付,時間,備考',
      ...records.map(record => [
        record.id,
        `"${record.name}"`,
        record.category,
        record.amount,
        record.unit,
        record.date,
        record.time,
        `"${record.notes || ''}"`
      ].join(','))
    ].join('\n')

    const BOM = '\uFEFF'
    const blob = new Blob([BOM + reportContent], { type: 'text/csv;charset=utf-8;' })
    
    const filename = `drink-detailed-report-${new Date().toISOString().split('T')[0]}.csv`
    this.downloadFile(blob, filename)
  }

  // 期間別エクスポート
  static exportByDateRange(
    records: DrinkRecord[], 
    startDate: string, 
    endDate: string,
    format: 'csv' | 'json' = 'csv'
  ): void {
    const filteredRecords = records.filter(record => 
      record.date >= startDate && record.date <= endDate
    )

    if (filteredRecords.length === 0) {
      alert(`${startDate} から ${endDate} の期間にデータがありません`)
      return
    }

    const filename = `drink-records-${startDate}-to-${endDate}`
    
    if (format === 'csv') {
      this.exportToCSV(filteredRecords, `${filename}.csv`)
    } else {
      this.exportToJSON(filteredRecords, `${filename}.json`)
    }
  }

  // ファイルダウンロードの共通処理
  private static downloadFile(blob: Blob, filename: string): void {
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // メモリ解放
    URL.revokeObjectURL(url)
  }
}

// インポート用のファイル読み込みサービス
export class ImportService {
  // JSONファイルからインポート
  static async importFromJSON(file: File): Promise<DrinkRecord[] | null> {
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      
      // バックアップファイル形式の場合
      if (data.records && Array.isArray(data.records)) {
        return data.records
      }
      
      // 直接配列の場合
      if (Array.isArray(data)) {
        return data
      }
      
      throw new Error('無効なファイル形式です')
    } catch (error) {
      console.error('JSONインポートエラー:', error)
      return null
    }
  }

  // CSVファイルからインポート
  static async importFromCSV(file: File): Promise<DrinkRecord[] | null> {
    try {
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())
      
      if (lines.length < 2) {
        throw new Error('CSVファイルにデータが含まれていません')
      }
      
      // ヘッダー行をスキップ
      const dataLines = lines.slice(1)
      const records: DrinkRecord[] = []
      
      for (const line of dataLines) {
        // シンプルなCSVパース（クォートを考慮）
        const columns = line.split(',').map(col => col.replace(/^"|"$/g, ''))
        
        if (columns.length >= 7) {
          records.push({
            id: columns[0],
            name: columns[1],
            category: columns[2] as any,
            amount: parseInt(columns[3]),
            unit: columns[4],
            date: columns[5],
            time: columns[6],
            notes: columns[7] || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          })
        }
      }
      
      return records
    } catch (error) {
      console.error('CSVインポートエラー:', error)
      return null
    }
  }
}