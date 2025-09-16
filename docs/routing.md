# ルーティング / URL 設計

## パス規約
- Best:   `/best/<topic>`            例: `/best/protein-powder`
- Reviews:`/reviews/<product>`       例: `/reviews/airpods-pro-2`
- Guides: `/guides/<howto>`          例: `/guides/iphone-photo-backup`
- News:   `/news/<yyyy-mm>/<slug>`   例: `/news/2025-09/ios-19-release`
- Deals:  `/deals/<brand-or-event>`  例: `/deals/amazon-prime-day`
- Topics: `/topics/<tag>`

## ルール
- 英小文字＋ハイフンのみ（日本語URLは使用しない）
- 年を URL に含めない（News を除く）。記事本文の「最終更新日」で年更新
- `publishedAt` から News の `yyyy-mm` を自動抽出

## 一覧ページ
- `/best`, `/reviews`, `/guides`, `/news`, `/deals`
- クエリ `?page=1..` で 10件/ページのページネーション

## トップページ構成
1) ヒーロー（サイト説明 1 行）
2) Best ハブのピックアップ
3) 最新記事
4) 人気記事（固定10本 or 将来Analytics対応）
5) サイド：プロフィール → 検索 → 人気 Best → カテゴリ → アーカイブ
