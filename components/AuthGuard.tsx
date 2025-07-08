'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './AuthProvider'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // ローディング中
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🍺</div>
          <div className="text-xl text-amber-800 font-bold">読み込み中...</div>
        </div>
      </div>
    )
  }

  // 未認証の場合は何も表示しない（リダイレクト処理中）
  if (!user) {
    return null
  }

  // 認証済みの場合は子コンポーネントを表示
  return <>{children}</>
}