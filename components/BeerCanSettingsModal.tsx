'use client'

import { useState, useEffect } from 'react'
import { BeerCanSettings } from '@/types/drink'
import { settingsService } from '@/lib/settingsService'

interface BeerCanSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (settings: BeerCanSettings) => void
}

export default function BeerCanSettingsModal({ isOpen, onClose, onSave }: BeerCanSettingsModalProps) {
  const [settings, setSettings] = useState<BeerCanSettings>({
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
  })

  useEffect(() => {
    if (isOpen) {
      const loadSettings = async () => {
        const currentSettings = await settingsService.getBeerCanSettings()
        setSettings(currentSettings)
      }
      loadSettings()
    }
  }, [isOpen])

  const handleSave = async () => {
    try {
      const success = await settingsService.updateBeerCanSettings(settings)
      if (success) {
        onSave(settings)
        onClose()
      } else {
        alert('設定の保存に失敗しました。もう一度お試しください。')
      }
    } catch (error) {
      console.error('設定保存中にエラーが発生しました:', error)
      alert('設定の保存中にエラーが発生しました。ネットワーク接続を確認してください。')
    }
  }

  const handleReset = async () => {
    if (confirm('設定をデフォルト値にリセットしますか？')) {
      const success = await settingsService.resetToDefaults()
      if (success) {
        const defaultSettings = await settingsService.getBeerCanSettings()
        setSettings(defaultSettings)
      } else {
        alert('設定のリセットに失敗しました')
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-amber-800 mb-6 flex items-center">
            <span className="text-2xl mr-3">⚙️</span>
            缶ビール設定
          </h2>

          <div className="space-y-6">
            {/* 350ml缶設定 */}
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-4 rounded-xl border border-amber-200">
              <h3 className="text-lg font-semibold text-amber-800 mb-4 flex items-center">
                <span className="text-xl mr-2">🍺</span>
                350ml缶設定
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-amber-700 mb-1">
                    商品名
                  </label>
                  <input
                    type="text"
                    value={settings.can350ml.name}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      can350ml: { ...prev.can350ml, name: e.target.value }
                    }))}
                    className="w-full p-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="商品名を入力"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-amber-700 mb-1">
                    価格 (円)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={settings.can350ml.price}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      can350ml: { ...prev.can350ml, price: parseInt(e.target.value) || 0 }
                    }))}
                    className="w-full p-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-amber-700 mb-1">
                    純アルコール量 (g)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={settings.can350ml.alcoholContent}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      can350ml: { ...prev.can350ml, alcoholContent: parseFloat(e.target.value) || 0 }
                    }))}
                    className="w-full p-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* 500ml缶設定 */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-xl border border-orange-200">
              <h3 className="text-lg font-semibold text-orange-800 mb-4 flex items-center">
                <span className="text-xl mr-2">🍺</span>
                500ml缶設定
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-orange-700 mb-1">
                    商品名
                  </label>
                  <input
                    type="text"
                    value={settings.can500ml.name}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      can500ml: { ...prev.can500ml, name: e.target.value }
                    }))}
                    className="w-full p-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="商品名を入力"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-orange-700 mb-1">
                    価格 (円)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={settings.can500ml.price}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      can500ml: { ...prev.can500ml, price: parseInt(e.target.value) || 0 }
                    }))}
                    className="w-full p-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-orange-700 mb-1">
                    純アルコール量 (g)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={settings.can500ml.alcoholContent}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      can500ml: { ...prev.can500ml, alcoholContent: parseFloat(e.target.value) || 0 }
                    }))}
                    className="w-full p-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ボタン */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              onClick={handleReset}
              className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all duration-200"
            >
              デフォルトに戻す
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-all duration-200"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2 rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-200"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}