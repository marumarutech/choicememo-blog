# 概要（Overview）

ChoiceMemo は「比較（Best）・レビュー（Reviews）・ハウツー（Guides）」を中心に、「ニュース（News）・セール（Deals）」で集客をブーストする技術/運用一体のブログ基盤です。低コストで運用を開始し、将来的に /admin + Supabase（Phase B）へ拡張可能です。

- 本番ドメイン: `choicememo.com`（Cloudflare DNS/CDN, Vercel Hosting）
- 技術スタック: Next.js(App Router) + TypeScript + Tailwind(@typography) + MDX
- コンテンツ格納: Filesystem（`content/posts/*.mdx`）
- 収益化: AdSense + アフィリエイト
- SEO: OGP/Twitter自動, Article/FAQ JSON-LD, Sitemap, RSS, robots
- 管理UI: `/admin`（MDX雛形生成＋ライブプレビュー＋GitHubコミット）

詳細は各ドキュメントへ:
- セットアップ: `setup.md`
- ルーティング: `routing.md`
- 執筆ガイド: `content-authoring.md`
- 管理画面: `cms-admin.md`
- SEO/構造化データ: `seo.md`
- 収益導線: `monetization.md`
- セキュリティ: `security.md`
- 運用: `operations.md`
- 環境変数: `env.md`
