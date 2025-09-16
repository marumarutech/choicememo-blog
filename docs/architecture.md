# アーキテクチャ

## 技術スタック
- Next.js (App Router) + TypeScript
- Tailwind CSS + @tailwindcss/typography
- MDX（`next-mdx-remote/rsc`）
- コンテンツ: Filesystem（`content/posts/*.mdx`）

## ディレクトリ構成（抜粋）
```
content/
  posts/            # .mdx（frontmatter 必須）
public/
  ads.txt
src/
  app/
    (public)/
    best/[slug]/page.tsx
    reviews/[slug]/page.tsx
    guides/[slug]/page.tsx
    news/[yyyy-mm]/[slug]/page.tsx
    deals/[slug]/page.tsx
    topics/[tag]/page.tsx
    rss.xml/route.ts
    robots.txt/route.ts
    sitemap.ts
    admin/            # 管理UI
  components/
  lib/
    posts-fs.ts      # FS 読み（Phase A）
    mdx.ts           # MDX コンパイル設定
    seo.ts           # OGP/JSON-LD
    pagination.ts
```

## レンダリング
- 一覧ページ: static（10件/ページ）
- 詳細ページ: static。MDX を RSC でサーバーコンパイル
- RSS/サイトマップ/robots: Edgeで動作するroute handler

## コンテンツ読み込み
- `lib/posts-fs.ts`
  - `gray-matter` + `zod` で frontmatter を検証
  - `draft: true` は除外
  - News の URL は `publishedAt` の年月から `/news/yyyy-mm/<slug>` を自動生成
  - 関連記事は type/tags マッチで3件

## 管理UI（軽量CMS）
- `/admin`: NextAuth + GitHub OAuth + Octokit
- 機能: MDX 雛形生成、ライブプレビュー、GitHub コミット保存
- 本番では既定で無効（`NEXT_PUBLIC_ENABLE_ADMIN=false`）。必要時のみ有効化し、Cloudflare Access 等で保護

## 将来拡張（Phase B）
- Supabase への移行: `posts-db.ts` を用意し、`posts-fs.ts` と差し替え
- 画像ストレージ: Supabase Storage / R2
