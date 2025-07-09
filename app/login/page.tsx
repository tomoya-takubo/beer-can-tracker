'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [testEmail, setTestEmail] = useState('')
  const [testPassword, setTestPassword] = useState('')

  // 認証状態の変更を監視してデバッグ
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('=== Login Page: Auth Event ===')
        console.log('Event:', event)
        console.log('Session:', !!session)
        console.log('User:', session?.user?.email || 'None')
        console.log('User confirmed:', session?.user?.email_confirmed_at || 'Not confirmed')
        
        if (event === 'SIGNED_IN' && session) {
          console.log('Login successful, redirecting to home...')
          router.push('/')
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router])

  // エラーハンドリング
  useEffect(() => {
    const checkAuthError = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Auth session error:', error)
        }
      } catch (err) {
        console.error('Auth check error:', err)
      }
    }

    checkAuthError()
  }, [])

  // 手動ログインテスト
  const handleTestLogin = async () => {
    console.log('=== Manual Login Test ===')
    console.log('Email:', testEmail)
    console.log('Password:', testPassword ? '[HIDDEN]' : 'None')
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      })
      
      if (error) {
        console.error('Login error:', error)
      } else {
        console.log('Login success:', data)
      }
    } catch (err) {
      console.error('Login exception:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-amber-200">
          {/* ヘッダー */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-amber-800 mb-2">🍺</h1>
            <h2 className="text-2xl font-bold text-amber-800 mb-2">BeerCan Tracker</h2>
            <p className="text-amber-600">缶ビール専用記録アプリ</p>
          </div>

          {/* 認証UI */}
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#d97706',
                    brandAccent: '#92400e',
                    brandButtonText: 'white',
                    defaultButtonBackground: '#f3f4f6',
                    defaultButtonBackgroundHover: '#e5e7eb',
                    inputBackground: 'white',
                    inputBorder: '#d1d5db',
                    inputBorderHover: '#d97706',
                    inputBorderFocus: '#d97706',
                  },
                },
              },
            }}
            theme="light"
            providers={['google']}
            redirectTo={typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '/auth/callback'}
            onlyThirdPartyProviders={false}
            magicLink={true}
            view="sign_in"
            showLinks={true}
            additionalData={{
              email_confirm: true,
            }}
            queryParams={{
              access_type: 'offline',
              prompt: 'consent',
            }}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'メールアドレス',
                  password_label: 'パスワード',
                  button_label: 'ログイン',
                  loading_button_label: 'ログイン中...',
                  social_provider_text: '{{provider}}でログイン',
                  link_text: 'アカウントをお持ちの方はこちら',
                  email_input_placeholder: 'メールアドレスを入力',
                  password_input_placeholder: 'パスワードを入力',
                },
                sign_up: {
                  email_label: 'メールアドレス',
                  password_label: 'パスワード',
                  button_label: 'アカウント作成',
                  loading_button_label: '作成中...',
                  social_provider_text: '{{provider}}でアカウント作成',
                  link_text: 'アカウントをお持ちでない方はこちら',
                  email_input_placeholder: 'メールアドレスを入力',
                  password_input_placeholder: 'パスワードを入力',
                },
                forgotten_password: {
                  email_label: 'メールアドレス',
                  button_label: 'パスワードリセット',
                  loading_button_label: '送信中...',
                  link_text: 'パスワードをお忘れですか？',
                  email_input_placeholder: 'メールアドレスを入力',
                },
                magic_link: {
                  email_input_label: 'メールアドレス',
                  button_label: 'マジックリンクを送信',
                  loading_button_label: '送信中...',
                  link_text: 'パスワードなしでログイン',
                  email_input_placeholder: 'メールアドレスを入力',
                  confirmation_text: 'ログイン用のマジックリンクを送信しました。',
                },
              },
            }}
          />
        </div>

        {/* デバッグ用テストフォーム */}
        <div className="mt-4 bg-red-50 p-4 rounded-lg border border-red-200">
          <h3 className="text-sm font-bold text-red-800 mb-2">デバッグ用テストログイン</h3>
          <input
            type="email"
            placeholder="メールアドレス"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="w-full p-2 border rounded mb-2"
          />
          <input
            type="password"
            placeholder="パスワード"
            value={testPassword}
            onChange={(e) => setTestPassword(e.target.value)}
            className="w-full p-2 border rounded mb-2"
          />
          <button
            onClick={handleTestLogin}
            className="w-full bg-red-600 text-white p-2 rounded hover:bg-red-700"
          >
            手動ログインテスト
          </button>
        </div>

        {/* フッター */}
        <div className="text-center mt-6 text-amber-600 text-sm">
          <p className="mb-2">アカウントを作成してデータを安全に保存</p>
          <div className="text-xs text-amber-500 space-y-1">
            <p>• メール認証: 確認メール送信後ログイン可能</p>
            <p>• マジックリンク: パスワード不要でログイン</p>
            <p>• Google認証: 即座にログイン可能</p>
          </div>
        </div>
      </div>
    </div>
  )
}