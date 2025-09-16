# コンテンツ執筆（MDX）

## 基本
- 置き場所: `content/posts/*.mdx`
- 文字コード: UTF-8
- ファイル名: スラッグ（英小文字＋ハイフン）に合わせることを推奨（例: `protein-powder.mdx`）

## Frontmatter（必須）
```mdx
---
title: "おすすめプロテイン10選（2025年版）"
slug: "protein-powder"
description: "初心者〜コスパ重視まで徹底比較。最後に用途別の結論を提示。"
type: "best"               # best | review | guide | news | deals
tags: ["健康","プロテイン","比較"]
publishedAt: "2025-09-15"
updatedAt: "2025-09-15"
hero: "/images/protein-hero.jpg"
draft: false
# 任意: FAQ（構造化データに反映）
faqs:
  - question: "初心者はどれを選ぶべき？"
    answer: "価格・味・溶けやすさのバランスでA社が無難です。"
---
```

## MDX コンポーネント
- `<Lead>要点</Lead>`: 導入の要点カード
- `<ProsCons pros={["良い点"]} cons={["悪い点"]} />`: 長所短所
- `<CTAButtons links={[{ label: "Amazon", href: "https://" }, { label: "楽天", href: "https://" }]} />`: CTA群
- `<ComparisonTable columns={["項目","値"]} rows={[{"項目":"例","値":"123"}]} />`: 比較表

## タイプ別テンプレ
- Best: 導入（結論要約）→ 要約比較表 → 個別短評 → 用途別おすすめ → FAQ
- Review: 結論カード（買う/買わない）→ Pros/Cons → 競合比較 → Bestへ内部リンク
- Guide: 前提/対象 → 手順 → よくある質問 → Best/Review へ誘導
- News: 要点 3 行 → 本文 → 関連 Best/Review へ送客
- Deals: 割引要点 → 期間/条件 → 対象商品（CTA）→ 関連 Best/Review

## ルール
- ドラフト（`draft: true`）は一覧・詳細・RSS・サイトマップから除外
- News の URL は `publishedAt` の年月から自動で `/news/yyyy-mm/slug`
- スラッグは英小文字＋ハイフン、日本語URLは使用しない

## サムネイル/ヒーロー画像（`hero`）
- 設定: frontmatter の `hero` にパス（例: `/images/xxx.jpg`）
- 推奨サイズ: 1200×630（16:9）。JPG推奨
- 置き場所: `public/images/` 配下に保存
- 一覧カードと詳細ページ上部に表示され、OGP/Twitter 画像にも利用
- 外部CDN画像を使う場合は `next.config.mjs` の `images.remotePatterns` にドメインを追加

## 関連記事
- 記事末尾に type/tags を基準に自動で3件表示

## プレビュー
- ローカル: `npm run dev` → ページで確認
- 管理UI: `/admin` のライブプレビューを利用可
