# セキュリティ / アクセス制御

## /admin の保護
- 既定で本番では無効化（`NEXT_PUBLIC_ENABLE_ADMIN=false`）
- 必要時のみ有効化し、Cloudflare Access 等で `/admin` を保護
- GitHub OAuth のスコープは必要最小限（公開 repo だけなら `public_repo`）

## コンテンツ書き込み制限
- API 側で書き込み先を `content/posts/{slug}.mdx` に固定
- スラッグ制約: `^[a-z0-9-]+$`
- Frontmatter の基本検証を実施（`gray-matter` + `zod`）

## CSP 検討（任意）
- AdSense を利用するため、厳格なCSP適用時は `pagead2.googlesyndication.com` 等の許可が必要

## 認証情報
- `NEXTAUTH_SECRET` は十分に長いランダム文字列
- GitHub OAuth の Client Secret は環境変数で管理
