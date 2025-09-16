# 運用（デプロイ/更新手順）

## 典型ワークフロー
1. 記事作成
   - ローカルで `/admin` を使い MDX を作成 → GitHub保存
   - もしくは GitHub で `content/posts/*.mdx` を直接編集
2. 自動デプロイ
   - GitHub Push → Vercel がビルド → 本番に反映
3. 検証
   - 表示確認、OGP/Twitter、構造化データの確認
4. 記事更新
   - `updatedAt` を更新 → サイトマップ/RSSに反映

## バックアップ
- GitHub がソースオブレ truth。定期的なブランチ保護・バックアップを推奨

## アナリティクス
- Search Console, Cloudflare Web Analytics（または gtag）

## インシデント対応
- デグレ時: 前回安定リリースへロールバック（Vercel の Deployments から）
- 構成変更時は `docs/task/` に変更履歴を残す
