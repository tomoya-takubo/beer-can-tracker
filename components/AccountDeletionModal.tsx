'use client'

import { useState } from 'react'
import { supabaseStorageService } from '@/lib/supabaseStorage'

interface AccountDeletionModalProps {
  isOpen: boolean
  onClose: () => void
  onDeleteComplete: () => void
}

export default function AccountDeletionModal({
  isOpen,
  onClose,
  onDeleteComplete
}: AccountDeletionModalProps) {
  const [step, setStep] = useState<'confirm' | 'typing' | 'deleting'>('confirm')
  const [confirmText, setConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (confirmText !== 'アカウントを削除') {
      alert('確認テキストが正しくありません')
      return
    }

    setIsDeleting(true)
    setStep('deleting')

    try {
      const success = await supabaseStorageService.deleteAccount()
      
      if (success) {
        alert('アカウントとすべてのデータが削除されました。ご利用ありがとうございました。')
        onDeleteComplete()
      } else {
        alert('アカウント削除に失敗しました。しばらく待ってから再試行してください。')
        setStep('confirm')
      }
    } catch (error) {
      console.error('Account deletion error:', error)
      alert('アカウント削除中にエラーが発生しました')
      setStep('confirm')
    } finally {
      setIsDeleting(false)
      onClose()
    }
  }

  const handleNext = () => {
    setStep('typing')
  }

  const handleBack = () => {
    setStep('confirm')
    setConfirmText('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          {/* ヘッダー */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-red-800">⚠️ アカウント削除</h2>
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="text-gray-500 hover:text-gray-700 text-2xl disabled:opacity-50"
            >
              ×
            </button>
          </div>

          {/* 確認ステップ */}
          {step === 'confirm' && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-bold text-red-800 mb-2">この操作は取り消せません</h3>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• すべての飲酒記録が完全に削除されます</li>
                  <li>• アカウント情報が削除されます</li>
                  <li>• データの復元はできません</li>
                  <li>• 統計情報もすべて失われます</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-blue-800 mb-2">削除前にバックアップをお勧めします</h3>
                <p className="text-sm text-blue-700">
                  記録一覧ページの「データ管理」からデータをエクスポートできます
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-500 text-white px-4 py-3 rounded-lg hover:bg-gray-600 transition-all duration-200"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition-all duration-200"
                >
                  削除を続行
                </button>
              </div>
            </div>
          )}

          {/* 確認入力ステップ */}
          {step === 'typing' && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-bold text-yellow-800 mb-2">最終確認</h3>
                <p className="text-sm text-yellow-700 mb-3">
                  本当にアカウントを削除する場合は、下記のテキストを正確に入力してください：
                </p>
                <div className="bg-gray-100 p-2 rounded font-mono text-center">
                  アカウントを削除
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  確認テキストを入力
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="アカウントを削除"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleBack}
                  className="flex-1 bg-gray-500 text-white px-4 py-3 rounded-lg hover:bg-gray-600 transition-all duration-200"
                >
                  戻る
                </button>
                <button
                  onClick={handleDelete}
                  disabled={confirmText !== 'アカウントを削除'}
                  className="flex-1 bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  完全に削除する
                </button>
              </div>
            </div>
          )}

          {/* 削除中ステップ */}
          {step === 'deleting' && (
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-red-600 mx-auto"></div>
              <div className="text-lg text-red-800 font-medium">アカウントを削除中...</div>
              <div className="text-sm text-gray-600">
                しばらくお待ちください。この処理には時間がかかる場合があります。
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}