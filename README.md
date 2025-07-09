# 🍺 Beer Can Tracker

缶ビール専用記録アプリ - 飲酒量を適切に管理するためのWebアプリケーション

## 🎯 概要

Beer Can Trackerは、缶ビールの消費量を記録・管理し、健康的な飲酒習慣をサポートするモダンなWebアプリケーションです。直感的なUIと詳細な統計機能により、飲酒パターンを可視化し、適切な飲酒量管理を支援します。

## ✨ 主な機能

### 🍺 **ビール記録管理**
- 350ml/500ml缶の消費時間を記録
- ワンクリックで簡単記録
- 自動時刻記録機能

### 📊 **統計・分析機能**
- 総摂取量、1日平均の計算
- 缶サイズ別内訳表示
- 飲酒ペース分析
- 期間別集計（今日・1週間・1ヶ月）

### 🔐 **認証・セキュリティ**
- Googleアカウントでのワンクリックログイン
- メールアドレス認証（パスワード・マジックリンク）
- セキュアなデータ管理

### 📱 **ユーザー体験**
- レスポンシブデザイン（PC・スマホ対応）
- 直感的なモバイルファースト設計
- CSV形式でのデータエクスポート・インポート
- アカウント削除機能

## 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **データベース**: Supabase (PostgreSQL)
- **認証**: Supabase Auth
- **状態管理**: React Hooks (useState, useEffect)
- **デプロイ**: Vercel対応

## プロジェクト構成

```
beer-can-tracker/
├── app/
│   ├── layout.tsx              # ルートレイアウト
│   ├── page.tsx                # ホームページ（メイントラッカー）
│   ├── login/
│   │   └── page.tsx            # ログインページ
│   ├── records/
│   │   └── page.tsx            # 記録一覧ページ
│   ├── stats/
│   │   └── page.tsx            # 統計ページ
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts        # 認証コールバック
│   └── globals.css             # グローバルスタイル
├── components/
│   ├── AccountDeletionModal.tsx    # アカウント削除モーダル
│   ├── AuthGuard.tsx               # 認証ガード
│   ├── AuthProvider.tsx            # 認証プロバイダー
│   ├── BeerCanTracker.tsx          # メイントラッカー
│   ├── ExportImportModal.tsx       # データエクスポート・インポート
│   └── MobileNavigation.tsx        # モバイルナビゲーション
├── lib/
│   ├── beerStats.ts               # ビール統計計算
│   ├── exportService.ts           # データエクスポート・インポート
│   ├── goalsService.ts            # 目標設定（将来機能）
│   ├── supabase.ts                # Supabase設定
│   └── supabaseStorage.ts         # データストレージ管理
├── types/
│   └── drink.ts                   # 型定義
├── public/
│   ├── images/                    # ビール缶画像
│   ├── manifest.json              # PWA設定
│   └── sw.js                      # サービスワーカー
├── next.config.js                 # Next.js設定
├── tailwind.config.js             # Tailwind CSS設定
├── tsconfig.json                  # TypeScript設定
└── package.json                   # パッケージ管理
```

## 開発の開始方法

### 1. 依存関係をインストール
```bash
npm install
```

### 2. 環境変数を設定
`.env.local`ファイルを作成し、以下を設定：
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. 開発サーバーを起動
```bash
npm run dev
```

### 4. ブラウザで http://localhost:3000 にアクセス

## 🚀 使い方

### 1. 認証・ログイン
1. アプリにアクセスすると自動でログインページに遷移
2. 以下の方法でログイン：
   - **Googleアカウント**: ワンクリックログイン
   - **メールアドレス**: パスワード認証
   - **マジックリンク**: パスワード不要の認証

### 2. ビール記録の追加
1. メインページの缶画像をクリック
2. 350ml/500ml缶を選択
3. 自動で現在時刻で記録が保存
4. 即座に統計情報が更新

### 3. 記録一覧の確認
1. 「Records」ページで過去の記録を確認
2. 日付でフィルタリング可能
3. 個別削除も可能
4. 記録の編集・修正

### 4. 統計の確認
1. 「Stats」ページで詳細な統計を表示
2. 期間別集計（今日・1週間・1ヶ月）
3. 缶サイズ別内訳とグラフ表示
4. 飲酒ペース分析

### 5. データ管理
1. CSV形式でのデータエクスポート
2. 他のデバイスからのインポート
3. アカウント削除機能（データ完全削除）

## データ管理について

このアプリケーションは、データをSupabaseのPostgreSQLデータベースに保存します。
- セキュアなクラウドストレージ
- リアルタイムでのデータ同期
- 認証によるデータ保護
- 自動バックアップ

## 🎯 技術的な特徴・学習ポイント

### 🔧 フロントエンド開発
- **Next.js 14 App Router**: 最新のNext.js機能とファイルベースルーティング
- **TypeScript**: 型安全性を重視した開発とエラー防止
- **React Hooks**: 状態管理とライフサイクル管理
- **Tailwind CSS**: ユーティリティファーストなCSS設計
- **レスポンシブデザイン**: PC・スマホ対応の実装

### 🗄️ バックエンド・データベース
- **Supabase**: PostgreSQLデータベースの設計と操作
- **認証システム**: Google OAuth、メール認証の実装
- **データモデリング**: 正規化されたデータベース設計
- **セキュリティ**: RLS（Row Level Security）によるデータ保護

### 🎨 ユーザー体験・設計
- **モバイルファースト**: スマホ優先の設計思想
- **直感的なUI**: 使いやすいインターフェース設計
- **PWA対応**: プログレッシブウェブアプリ機能
- **アクセシビリティ**: 配慮されたユーザビリティ

### 🔍 開発プロセス・品質管理
- **コード品質**: ESLintによるコード品質管理
- **モジュール化**: 保守性の高いファイル構成
- **エラーハンドリング**: 適切なエラー処理と復旧
- **パフォーマンス**: 最適化されたコンポーネント設計

## 🏆 実装上の工夫点

### 認証システム
- 複数認証方式（Google OAuth、メール認証、マジックリンク）の実装
- SSR対応による「window is not defined」エラーの解決
- 認証状態の適切な管理とリダイレクト処理

### レスポンシブデザイン
- PC・スマホでの異なるレイアウト実装
- Tailwind CSSのブレークポイントを活用した設計
- モバイルでの操作性を重視したUI設計

### データ管理
- Supabaseを活用したリアルタイムデータベース
- CSV形式でのデータエクスポート・インポート機能
- セキュアなデータ削除機能の実装

## 🚀 デプロイメント

このアプリケーションはVercelで簡単にデプロイできます：

1. GitHubリポジトリをVercelに連携
2. 環境変数を設定：
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_SITE_URL=your_production_url
   ```
3. 自動デプロイ完了

## 🎓 学習・開発のポイント

### このプロジェクトで学べること
- **モダンなReact開発**: Next.js 14とApp Routerの活用
- **TypeScript実践**: 型安全性を重視した開発手法
- **認証システム**: 複数認証方式の実装とセキュリティ
- **レスポンシブデザイン**: モバイルファーストなUI設計
- **データベース設計**: Supabaseを活用したBaaS開発
- **状態管理**: React Hooksによる効率的な状態管理

### 実際に直面した課題と解決策
- **SSRエラー**: `window is not defined`エラーの適切な解決
- **認証フロー**: 複数認証方式の統合とリダイレクト処理
- **レスポンシブ**: PC・スマホでの異なるレイアウト実装
- **データ管理**: セキュアなデータ操作とエクスポート機能

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

---

**Beer Can Tracker** - 健康的な飲酒習慣をサポートするモダンなWebアプリケーション  
開発者: [あなたの名前] | 技術スタック: Next.js, TypeScript, Supabase, Tailwind CSS