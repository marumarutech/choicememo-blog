# 収益設計（AdSense / アフィリエイト）

## AdSense
- スクリプト読込: `src/app/layout.tsx`（afterInteractive）
- 広告ユニット: `src/components/AdSenseUnit.tsx`（高さ予約でCLS回避）
- 設置推奨:
  - H1 の直前に 1 枠
  - 本文末に 1 枠
- `public/ads.txt` を publisher ID で更新

## アフィリエイト
- CTA ボタン: `CTAButtons`（Amazon/楽天/公式 並び）
- a要素: `rel="sponsored noopener" target="_blank"` 強制
- 記事レイアウト推奨: 2つ目の H2 直後に比較表 or CTA群
