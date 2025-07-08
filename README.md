# Beer Can Tracker

ビール缶の消費量を記録・管理するためのWebアプリケーション

## 機能

- 🍺 **ビール記録の追加**: 350ml/500ml缶の消費時間を記録
- 📋 **記録一覧の表示**: 過去の記録を日付でフィルタリング
- 📊 **統計機能**: 総摂取量、1日平均、缶サイズ別内訳、飲酒ペース分析
- 🗑️ **記録の削除**: 不要な記録を削除
- 📤 **データエクスポート**: CSV形式でデータをエクスポート・インポート
- 🔐 **認証機能**: Supabase認証によるセキュアなデータ管理
- 🗂️ **アカウント管理**: アカウント削除機能
- 📱 **モバイル対応**: レスポンシブデザインによるモバイルファースト設計

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

## 主な機能の使い方

### 1. 認証
- 初回アクセス時にGoogleアカウントでログイン
- 匿名認証も利用可能

### 2. ビール記録の追加
- メインページの缶画像をクリック
- 350ml/500ml缶を選択
- 自動で現在時刻で記録が保存

### 3. 記録一覧の確認
- 「Records」ページで過去の記録を確認
- 日付でフィルタリング可能
- 個別削除も可能

### 4. 統計の確認
- 「Stats」ページで詳細な統計を表示
- 期間別集計、缶サイズ別内訳
- 飲酒ペース分析

### 5. データエクスポート
- CSV形式でデータをエクスポート
- 他のデバイスからのインポートも可能

## データ管理について

このアプリケーションは、データをSupabaseのPostgreSQLデータベースに保存します。
- セキュアなクラウドストレージ
- リアルタイムでのデータ同期
- 認証によるデータ保護
- 自動バックアップ

## 転職活動での活用ポイント

このプロジェクトは以下のスキルを示すことができます：

### フロントエンド開発
- **Next.js App Router**: 最新のNext.js機能とファイルベースルーティング
- **TypeScript**: 型安全性を重視した開発
- **React Hooks**: 状態管理とライフサイクル管理
- **Tailwind CSS**: モダンなCSS設計手法

### バックエンド・データベース
- **Supabase**: PostgreSQLデータベースの設計と操作
- **認証システム**: セキュアなユーザー管理
- **データモデリング**: 正規化されたデータベース設計

### ユーザー体験・設計
- **レスポンシブデザイン**: モバイルファースト設計
- **PWA対応**: プログレッシブウェブアプリ機能
- **直感的なUI**: 使いやすいインターフェース設計

### 開発プロセス
- **コード品質**: ESLintによるコード品質管理
- **モジュール化**: 保守性の高いファイル構成
- **エラーハンドリング**: 適切なエラー処理
- **パフォーマンス**: 最適化されたコンポーネント設計

## ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。