# セットアップ（ゼロから開始）

この文書は「何もしていない」状態から、ローカル実行→GitHub→Vercel→ドメイン/Cloudflare→AdSense/Search Console の順に、最短で運用開始する手順をまとめています。

関連資料: `docs/env.md`, `docs/cms-admin.md`, `docs/operations.md`, `docs/seo.md`

## 0. 前提
- Node.js 18 以上（LTS 推奨）
- GitHub アカウント（リポジトリ作成権限）
- ドメイン: `choicememo.com`（取得済み or 取得予定）

## 1. ローカルセットアップ（最短）
1) 依存インストール
- `npm install`

2) 環境変数の用意
- `.env.example` を `.env.local` にコピーし、以下だけ先に設定
  - `NEXTAUTH_URL=http://localhost:3000`
  - `NEXTAUTH_SECRET`（十分に長い乱数）
  - `NEXT_PUBLIC_ENABLE_ADMIN=true`（ローカルで /admin を使うため）

3) 開発サーバー起動
- `npm run dev` → `http://localhost:3000`（トップ）
- `http://localhost:3000/admin`（記事エディタ）

4) 記事の作成と表示確認
- `/admin` で雛形作成 → `.mdx をダウンロード` or `GitHubに保存（後述）`
- `content/posts/` に `{slug}.mdx` を配置 → トップ/一覧/詳細で表示されるか確認

5) AdSense のプレースホルダ確認（後で本番IDに置換）
- `src/app/layout.tsx` と `src/components/AdSenseUnit.tsx` に `ca-pub-XXXX` があることを確認

## 2. GitHub リポジトリと OAuth（NextAuth）
1) GitHub リポジトリ作成
- 例: `choicememo-blog`（このリポジトリを push）

2) GitHub OAuth App を作成（/admin の GitHub保存に必要）
- Developer settings → OAuth Apps → New OAuth App
  - Homepage URL: `http://localhost:3000`
  - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
- 作成後の `Client ID/Secret` を `.env.local` に設定
  - `GITHUB_ID=...`
  - `GITHUB_SECRET=...`
  - `GITHUB_OWNER=あなたのGitHubユーザー名 or Org 名`
  - `GITHUB_REPO=choicememo-blog`
  - `GITHUB_BRANCH=main`

3) /admin からの保存テスト
- `http://localhost:3000/admin` を開き、右上「Sign in with GitHub」
- 何か記事を作って「GitHubに保存」→ リポジトリの `content/posts/{slug}.mdx` にコミットされることを確認

（公開リポのみなら OAuth スコープは `public_repo` に縮小可能。既定は `repo`）

## 3. Vercel でデプロイ
1) Vercel に GitHub リポジトリを Import
2) Project Settings → Environment Variables に `.env.example` の値を設定
   - 本番用設定例:
     - `NEXTAUTH_URL=https://choicememo.com`
     - `NEXTAUTH_SECRET`（長い乱数）
     - `GITHUB_ID/SECRET/OWNER/REPO/BRANCH`
     - `NEXT_PUBLIC_ENABLE_ADMIN=false`（本番は通常閉じる）
3) Deploy を実行し、 `https://<project>.vercel.app` で動作確認

## 4. ドメイン/Cloudflare の設定
1) ドメインを取得し、ネームサーバーを Cloudflare に向ける
2) Cloudflare で `choicememo.com` を追加
3) Vercel の Project → Domains に `choicememo.com` を追加
4) www あり/なしの統一（301）。Vercel のドメイン設定でリダイレクトを構成
5) WAF/CDN/SSL は Cloudflare Free の既定でOK（問題時はルールを調整）

## 5. AdSense/アフィリエイト
1) AdSense 審査が通ったら以下を設定
- `src/app/layout.tsx` と `src/components/AdSenseUnit.tsx` の `ca-pub-XXXX` を publisher ID に置換
- `public/ads.txt` を公式の行で更新

2) アフィリエイトリンク
- `CTAButtons` / `AffiliateLink` を使用（`rel="sponsored noopener" target="_blank"` 強制）
- 記事では「2つ目のH2直後」に比較表 or CTA群を推奨

## 6. 検索エンジン連携
1) Search Console
- プロパティを追加（`https://choicememo.com`）→ 所有権確認
- サイトマップ: `https://choicememo.com/sitemap.xml` を送信

2) アナリティクス
- Cloudflare Web Analytics か gtag を導入（必要に応じて）

## 7. 本番で /admin を使う場合
- `NEXT_PUBLIC_ENABLE_ADMIN=true` にして有効化
- Cloudflare Access 等で `/admin` を保護
- GitHub OAuth の `Authorization callback URL` を本番ドメイン用に追加
  - 例: `https://choicememo.com/api/auth/callback/github`

## 8. 動作確認チェックリスト
- トップ（ヒーロー/ピックアップ/最新/人気）が表示される
- 一覧 `/best` などで 10件/ページのページネーションが機能
- 詳細ページで Article JSON-LD（必要に応じて FAQ も）が出力
- RSS: `https://<host>/rss.xml` が最新50件を返す
- サイトマップ: `https://<host>/sitemap.xml` に公開記事+静的ページが載る
- robots: `https://<host>/robots.txt`

## 9. よくある詰まりどころ
- GitHub サインインできない → OAuth の callback URL/環境変数を確認
- /admin が 404 → 本番では既定で無効。`NEXT_PUBLIC_ENABLE_ADMIN=true` を設定
- OGP が出ない → frontmatter に `hero` を設定
- AdSense が出ない → `ca-pub-XXXX` 置換/ads.txt/CSP を確認

## 10. 次の一歩（任意）
- Cloudflare Access 手順の追加（/admin保護）
- 画像アップロードの導入（GitHub Upload API or Supabase Storage）
- PR フロー（ブランチ→PR自動作成）
