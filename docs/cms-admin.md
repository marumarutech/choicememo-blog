# 管理画面（/admin）

## 概要
- 目的: ブラウザ上で MDX を作成・ライブプレビューし、GitHub に直接コミット保存
- 技術: NextAuth（GitHub OAuth）+ Octokit（GitHub API）
- 既定: 本番では無効（`NEXT_PUBLIC_ENABLE_ADMIN=false`）。必要時のみ有効化し、Cloudflare Access などで保護

## 使い方（ローカル）
1. `npm run dev` → http://localhost:3000/admin
2. 右上から GitHub でサインイン
3. フォームに frontmatter と本文（MD/MDX）を入力
4. プレビュー領域で反映を確認
5. 「GitHubに保存」で `content/posts/{slug}.mdx` にコミット
   - コミットメッセージ欄（任意）あり

## GitHub OAuth 設定
- Developer settings → OAuth Apps → New OAuth App
  - Homepage URL: `http://localhost:3000`
  - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
- Client ID/Secret を `.env.local` に設定（`docs/env.md` 参照）
- スコープ: 既定 `repo`（公開のみなら `public_repo` へ縮小可）

## セキュリティ
- 本番で /admin を開く場合は `NEXT_PUBLIC_ENABLE_ADMIN=true` に加え、必ず Cloudflare Access 等で保護
- 書き込み先は `content/posts/*.mdx` に限定。スラッグは `^[a-z0-9-]+$` のみ許可

## よくある質問
- 「保存に失敗」: GitHub OAuth 設定・環境変数・権限（repo）を確認
- プレビューが反映しない: ネットワーク（/api/mdx/preview）を確認、Frontmatter を閉じているか確認
