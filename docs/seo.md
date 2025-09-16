# SEO / 構造化データ / フィード

## メタデータ
- 各詳細ページで OGP/Twitter メタを自動生成
- 参照: `src/lib/seo.ts` の `postMetadata`
- 入力源: frontmatter（title/description/hero）

## 構造化データ
- Article JSON-LD: 全詳細ページで自動出力
- FAQ JSON-LD: frontmatter の `faqs` を検出した場合に自動出力

## サイトマップ
- 実装: `src/app/sitemap.ts`
- 対象: 公開記事のみ（draft 除外）+ 主要静的ページ

## RSS
- 実装: `src/app/rss.xml/route.ts`
- 最新 50 件を配信

## robots.txt
- 実装: `src/app/robots.txt/route.ts`
- 全面 Allow + サイトマップ URL を提示

## OGP 画像
- 基本は frontmatter の `hero` を使用
- 将来的に動的 OGP 生成へ拡張可能
