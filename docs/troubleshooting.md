# トラブルシュート

## npm install 時の警告
- 一部の deprecated 警告や開発依存の脆弱性は、MVP動作に影響しない場合が多い。`npm audit` で詳細確認 → 可能なら `npm audit fix`。破壊的変更は要検証。

### 脆弱性をできるだけ安全に解消する
- まず `npm audit` で詳細を確認し、`npm audit fix` を実行（force なし）。
- それでも残る transitive（間接依存）は、`package.json` の `overrides` で安全なパッチ版へ固定（本プロジェクトは代表的なものを定義済み）。
- 変更後は `npm install` を実行 → `npm run build` / `npm run dev` で画面確認。
- どうしても残る場合のみ `npm audit fix --force` を検討（ビルド/画面の崩れがないか要確認）。

## Windows の SWC ファイルロック（EPERM）
- 事象: `EPERM: operation not permitted, unlink ... @next\.swc-win32-x64-msvc ... next-swc.win32-x64-msvc.node`
- 原因: Windows で dev サーバーやウイルス対策が SWC バイナリをロックしている場合に発生。
- 影響: インストール自体が完了していれば警告のみで無視可。
- 対処手順（必要時）:
  1) 実行中の Node/Next を停止（ターミナルの dev を落とす。必要なら PowerShell で `Get-Process node | Stop-Process -Force`）
  2) Next キャッシュ削除: `rmdir /s /q .next`
  3) 再ビルド（任意）: `npm rebuild next`
  4) それでも解消しなければ `rmdir /s /q node_modules` → `npm install`
  5) 必要ならプロジェクトをウイルス対策のリアルタイムスキャン除外へ

## `next.config.ts` エラーで dev が起動しない
- エラーメッセージ例: `Configuring Next.js via 'next.config.ts' is not supported`
- 対処: ファイル名を `next.config.mjs`（または `next.config.js`）に変更し、ESM 形式で `export default` を使う

## /admin でログインできない
- GitHub OAuth の設定（callback URL）と `.env.local` の `GITHUB_ID/SECRET` を確認
- `NEXTAUTH_URL` が実URLと一致しているか確認

## プレビューが表示されない
- `/api/mdx/preview` のネットワークエラー確認。Frontmatter の `---` が閉じているか確認

## GitHub 保存で 401/403
- GitHub OAuth スコープ（repo / public_repo）とリポジトリの権限を確認
- `GITHUB_OWNER/REPO/BRANCH` が正しいか確認

## OGP が出ない / 画像が表示されない
- frontmatter の `hero` を設定しているか
- 外部画像の場合は CORS/HTTPS を確認

## AdSense が表示されない
- 審査状況、`ca-pub-XXXX` の置換漏れ、ads.txt 設定、CSP を確認
