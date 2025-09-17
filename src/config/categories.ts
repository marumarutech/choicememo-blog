export type CategoryMeta = {
  label: string
  path: string
  blurb: string
  monetization: string
}

export const CATEGORY_KEYS = ['invest', 'fitness', 'gadgets', 'deals', 'topics'] as const
export type CategoryKey = typeof CATEGORY_KEYS[number]

export const CATEGORIES: Record<CategoryKey, CategoryMeta> = {
  invest: {
    label: '投資・マーケット',
    path: '/invest',
    blurb: '日次相場まとめや銘柄分析、売買ログで相場感を整理するカテゴリ。',
    monetization: '証券口座申込や投資ツール・書籍などのアフィリエイト導線。'
  },
  fitness: {
    label: '筋トレ・ボディメイク',
    path: '/fitness',
    blurb: 'トレーニングメニュー、器具・サプリレビュー、食事管理を扱うカテゴリ。',
    monetization: 'プロテイン・サプリ、ホームジム器具、アパレルの訴求を想定。'
  },
  gadgets: {
    label: 'ガジェット・家電',
    path: '/gadgets',
    blurb: '実機レビューや比較、用途別おすすめでギア選びをサポートするカテゴリ。',
    monetization: 'Amazon・楽天・公式ストアなど家電や周辺機器のアフィリエイト。'
  },
  deals: {
    label: 'セール・お得情報',
    path: '/deals',
    blurb: 'タイムセール速報や季節特集、クーポンまとめでお得情報を即時発信。',
    monetization: '物販アフィ全般。期間限定訴求でコンバージョンを高める導線。'
  },
  topics: {
    label: 'ニュース・雑談',
    path: '/topics',
    blurb: '時事ネタやトレンド、個人の視点を手短に共有するコラム的カテゴリ。',
    monetization: '関連書籍やツール紹介、他カテゴリ記事への内部リンク送客。'
  },
}

export const CATEGORY_ORDER: CategoryKey[] = [...CATEGORY_KEYS]
