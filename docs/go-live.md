# 本番リリースチェックリスト（Go-Live）

## 環境変数（Vercel）
- `NEXT_PUBLIC_SITE_URL=https://choicememo.com`
- `NEXTAUTH_URL=https://choicememo.com`
- `NEXTAUTH_SECRET`（長い乱数）
- `GITHUB_ID` / `GITHUB_SECRET`
- `GITHUB_OWNER` / `GITHUB_REPO` / `GITHUB_BRANCH`
- `NEXT_PUBLIC_ENABLE_ADMIN=false`（本番は通常オフ）

## ルーティング/SEO
- `/sitemap.xml` と `/rss.xml` の URL が `https://choicememo.com` で出力される
- ページの OGP/Twitter メタに正しい絶対URL/画像が入る（`hero`）
- JSON-LD（Article/FAQ）が出力される

## 収益
- `src/app/layout.tsx` と `AdSenseUnit.tsx` の `ca-pub-XXXX` を publisher ID に置換
- `public/ads.txt` を更新

## セキュリティ
- 本番で `/admin` を開く場合のみ `NEXT_PUBLIC_ENABLE_ADMIN=true`
- Cloudflare Access で `/admin` を保護
- 必要なら CSP を設定（AdSense ドメイン許可）

## ドメイン
- Cloudflare: `choicememo.com` を追加し NS を向ける
- Vercel: Domain に `choicememo.com` を追加（wwwあり/なしは Vercel 側リダイレクトで統一）

## 検索
- Search Console 登録 → サイトマップ送信
- Analytics（Cloudflare Web Analytics or gtag）

## 動作確認
- `npm run build && npm start` で本番相当テスト
- トップ/各一覧/各詳細/タグ/robots/sitemap/rss を確認
- draft 記事が出ていないこと

## 運用メモ
- 記事は `content/posts/*.mdx`（`draft: true` は非公開）
- /admin（任意）でライブプレビュー＋GitHub保存可能
