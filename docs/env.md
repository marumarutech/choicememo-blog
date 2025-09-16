# 環境変数一覧

| 変数名 | 用途 | 例 | 備考 |
|---|---|---|---|
| NEXTAUTH_URL | NextAuth 基準URL | http://localhost:3000 | 本番は https://choicememo.com |
| NEXTAUTH_SECRET | セッション暗号 | (長い乱数) | 必須 |
| NEXT_PUBLIC_SITE_URL | 生成する絶対URL | http://localhost:3000 | 本番は https://choicememo.com |
| GITHUB_ID | GitHub OAuth Client ID | | 必須 |
| GITHUB_SECRET | GitHub OAuth Client Secret | | 必須 |
| GITHUB_OWNER | 保存先リポの所有者 | your-user | 必須 |
| GITHUB_REPO | 保存先リポ名 | choicememo-blog | 必須 |
| GITHUB_BRANCH | 保存先ブランチ | main | 省略可（既定: main） |
| NEXT_PUBLIC_ENABLE_ADMIN | /admin 有効化 | false | 本番は通常 false |

補足: AdSense の publisher ID は環境変数ではなく、`layout.tsx` / `AdSenseUnit.tsx` と `public/ads.txt` に設定します。
