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
  const [formData, setFormData] = useState({
    can350ml: {
      price: '',
      alcoholContent: '',
      name: ''
    },
    can500ml: {
      price: '',
      alcoholContent: '',
      name: ''
    }
  })
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  useEffect(() => {
    if (isOpen) {
      const loadSettings = async () => {
        const currentSettings = await settingsService.getBeerCanSettings()
        setSettings(currentSettings)
        setFormData({
          can350ml: {
            price: currentSettings.can350ml.price.toString(),
            alcoholContent: currentSettings.can350ml.alcoholContent.toString(),
            name: currentSettings.can350ml.name
          },
          can500ml: {
            price: currentSettings.can500ml.price.toString(),
            alcoholContent: currentSettings.can500ml.alcoholContent.toString(),
            name: currentSettings.can500ml.name
          }
        })
        setErrors({})
      }
      loadSettings()
    }
  }, [isOpen])

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}
    
    // 350ml缶のバリデーション
    if (!formData.can350ml.name.trim()) {
      newErrors['can350ml.name'] = '商品名を入力してください'
    }
    if (!formData.can350ml.price || formData.can350ml.price.trim() === '') {
      newErrors['can350ml.price'] = '価格を入力してください'
    } else if (isNaN(parseInt(formData.can350ml.price)) || parseInt(formData.can350ml.price) < 0) {
      newErrors['can350ml.price'] = '有効な価格を入力してください（0以上）'
    }
    if (!formData.can350ml.alcoholContent || formData.can350ml.alcoholContent.trim() === '') {
      newErrors['can350ml.alcoholContent'] = '純アルコール量を入力してください'
    } else if (isNaN(parseFloat(formData.can350ml.alcoholContent)) || parseFloat(formData.can350ml.alcoholContent) < 0) {
      newErrors['can350ml.alcoholContent'] = '有効な純アルコール量を入力してください（0以上）'
    }
    
    // 500ml缶のバリデーション
    if (!formData.can500ml.name.trim()) {
      newErrors['can500ml.name'] = '商品名を入力してください'
    }
    if (!formData.can500ml.price || formData.can500ml.price.trim() === '') {
      newErrors['can500ml.price'] = '価格を入力してください'
    } else if (isNaN(parseInt(formData.can500ml.price)) || parseInt(formData.can500ml.price) < 0) {
      newErrors['can500ml.price'] = '有効な価格を入力してください（0以上）'
    }
    if (!formData.can500ml.alcoholContent || formData.can500ml.alcoholContent.trim() === '') {
      newErrors['can500ml.alcoholContent'] = '純アルコール量を入力してください'
    } else if (isNaN(parseFloat(formData.can500ml.alcoholContent)) || parseFloat(formData.can500ml.alcoholContent) < 0) {
      newErrors['can500ml.alcoholContent'] = '有効な純アルコール量を入力してください（0以上）'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }
    
    try {
      const settingsToSave: BeerCanSettings = {
        can350ml: {
          name: formData.can350ml.name.trim(),
          price: parseInt(formData.can350ml.price),
          alcoholContent: parseFloat(formData.can350ml.alcoholContent)
        },
        can500ml: {
          name: formData.can500ml.name.trim(),
          price: parseInt(formData.can500ml.price),
          alcoholContent: parseFloat(formData.can500ml.alcoholContent)
        }
      }
      
      const success = await settingsService.updateBeerCanSettings(settingsToSave)
      if (success) {
        onSave(settingsToSave)
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
        setFormData({
          can350ml: {
            price: defaultSettings.can350ml.price.toString(),
            alcoholContent: defaultSettings.can350ml.alcoholContent.toString(),
            name: defaultSettings.can350ml.name
          },
          can500ml: {
            price: defaultSettings.can500ml.price.toString(),
            alcoholContent: defaultSettings.can500ml.alcoholContent.toString(),
            name: defaultSettings.can500ml.name
          }
        })
        setErrors({})
      } else {
        alert('設定のリセットに失敗しました')
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
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
                    value={formData.can350ml.name}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      can350ml: { ...prev.can350ml, name: e.target.value }
                    }))}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-base ${errors['can350ml.name'] ? 'border-red-500' : 'border-amber-300'}`}
                    placeholder="商品名を入力"
                  />
                  {errors['can350ml.name'] && (
                    <p className="text-red-500 text-sm mt-1">{errors['can350ml.name']}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-amber-700 mb-1">
                    価格 (円)
                  </label>
                  <input
                    type="text"
                    value={formData.can350ml.price}
                    onChange={(e) => {
                      const value = e.target.value
                      if (value === '' || /^[0-9]+$/.test(value)) {
                        setFormData(prev => ({
                          ...prev,
                          can350ml: { ...prev.can350ml, price: value }
                        }))
                      }
                    }}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-base ${errors['can350ml.price'] ? 'border-red-500' : 'border-amber-300'}`}
                    placeholder="価格を入力（例：204）"
                  />
                  {errors['can350ml.price'] && (
                    <p className="text-red-500 text-sm mt-1">{errors['can350ml.price']}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-amber-700 mb-1">
                    純アルコール量 (g)
                  </label>
                  <input
                    type="text"
                    value={formData.can350ml.alcoholContent}
                    onChange={(e) => {
                      const value = e.target.value
                      if (value === '' || /^[0-9]+\.?[0-9]*$/.test(value)) {
                        setFormData(prev => ({
                          ...prev,
                          can350ml: { ...prev.can350ml, alcoholContent: value }
                        }))
                      }
                    }}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-base ${errors['can350ml.alcoholContent'] ? 'border-red-500' : 'border-amber-300'}`}
                    placeholder="純アルコール量を入力（例：14.0）"
                  />
                  {errors['can350ml.alcoholContent'] && (
                    <p className="text-red-500 text-sm mt-1">{errors['can350ml.alcoholContent']}</p>
                  )}
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
                    value={formData.can500ml.name}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      can500ml: { ...prev.can500ml, name: e.target.value }
                    }))}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base ${errors['can500ml.name'] ? 'border-red-500' : 'border-orange-300'}`}
                    placeholder="商品名を入力"
                  />
                  {errors['can500ml.name'] && (
                    <p className="text-red-500 text-sm mt-1">{errors['can500ml.name']}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-orange-700 mb-1">
                    価格 (円)
                  </label>
                  <input
                    type="text"
                    value={formData.can500ml.price}
                    onChange={(e) => {
                      const value = e.target.value
                      if (value === '' || /^[0-9]+$/.test(value)) {
                        setFormData(prev => ({
                          ...prev,
                          can500ml: { ...prev.can500ml, price: value }
                        }))
                      }
                    }}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base ${errors['can500ml.price'] ? 'border-red-500' : 'border-orange-300'}`}
                    placeholder="価格を入力（例：268）"
                  />
                  {errors['can500ml.price'] && (
                    <p className="text-red-500 text-sm mt-1">{errors['can500ml.price']}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-orange-700 mb-1">
                    純アルコール量 (g)
                  </label>
                  <input
                    type="text"
                    value={formData.can500ml.alcoholContent}
                    onChange={(e) => {
                      const value = e.target.value
                      if (value === '' || /^[0-9]+\.?[0-9]*$/.test(value)) {
                        setFormData(prev => ({
                          ...prev,
                          can500ml: { ...prev.can500ml, alcoholContent: value }
                        }))
                      }
                    }}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base ${errors['can500ml.alcoholContent'] ? 'border-red-500' : 'border-orange-300'}`}
                    placeholder="純アルコール量を入力（例：20.0）"
                  />
                  {errors['can500ml.alcoholContent'] && (
                    <p className="text-red-500 text-sm mt-1">{errors['can500ml.alcoholContent']}</p>
                  )}
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