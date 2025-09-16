# ChoiceMemo ブログ（Next.js + MDX）

本リポジトリは ChoiceMemo のMVP実装です。App Router + TypeScript + Tailwind(@typography) + MDX による静的生成、OGP/JSON-LD、RSS/サイトマップ、AdSense、軽量CMS（GitHub連携）を含みます。

## セットアップ

1) 依存インストール
- `npm install`

2) 環境変数
- `.env.example` を `.env.local` にコピーし、値を設定
- 必須: `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GITHUB_ID`, `GITHUB_SECRET`, `GITHUB_OWNER`, `GITHUB_REPO`
- 本番で `/admin` を開く場合のみ `NEXT_PUBLIC_ENABLE_ADMIN=true`（Cloudflare Access などで保護推奨）

3) 開発サーバー
- `npm run dev` → `http://localhost:3000`
- 記事作成UI: `http://localhost:3000/admin`

## デプロイ（Vercel）
- GitHub リポジトリをインポート
- 環境変数を Vercel に設定（`.env.example` 参照）
- カスタムドメインを割当て（`choicememo.com`）

## コンテンツ作成
- 記事は `content/posts/*.mdx` に配置（Frontmatter 必須）
- draft 記事は一覧/詳細/フィード/サイトマップから除外
- News は `publishedAt` の年月から URL を `/news/yyyy-mm/slug` に自動マップ
- MDX コンポーネント: `<Lead/>`, `<ProsCons/>`, `<CTAButtons/>`, `<ComparisonTable/>`
- FAQ構造化データ: frontmatter に `faqs: [{question, answer}]` を追加すると FAQ JSON-LD を自動出力

## 収益（AdSense）
- `src/app/layout.tsx` と `src/components/AdSenseUnit.tsx` の `ca-pub-XXXX` を置換
- `public/ads.txt` を publisher ID で更新

## ルーティング
- 一覧: `/best`, `/reviews`, `/guides`, `/news`, `/deals`（10件/ページ）
- 詳細: `/best/[slug]`, `/reviews/[slug]`, `/guides/[slug]`, `/deals/[slug]`, `/news/[yyyy-mm]/[slug]`
- タグ: `/topics/[tag]`
- トップ: `/`

## SEO/フィード
- サイトマップ: `src/app/sitemap.ts`（公開記事のみ）
- RSS: `src/app/rss.xml/route.ts`（最新50件）
- robots: `src/app/robots.txt/route.ts`
- OGP/Twitter: 各詳細ページで frontmatter 由来のタイトル/説明/画像を自動設定
- JSON-LD: Article + 任意で FAQ（frontmatter `faqs`）

## 管理画面（軽量CMS）
- `/admin`：MDX雛形のフォーム + ライブプレビュー + GitHub保存
- GitHubサインイン（NextAuth）→ そのまま `content/posts/{slug}.mdx` にコミット
- 環境変数 `NEXT_PUBLIC_ENABLE_ADMIN=true` で有効化（本番では必ず保護）

## 将来拡張（Phase B）
- Supabase で posts テーブル運用 → `/admin` の保存先をDBに切替 → ISR再生成
- 画像を Supabase Storage/R2 へ移行

## 注意
- `README.md` は既存の文字コードの都合で未更新です。日本語READMEは本ファイルを参照してください。
