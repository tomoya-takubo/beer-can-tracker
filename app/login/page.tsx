'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()

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