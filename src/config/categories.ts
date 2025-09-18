export type CategoryMeta = {
  label: string
  path: string
  blurb: string
  monetization: string
}

export const CATEGORY_KEYS = ['invest', 'fitness', 'gadgets', 'technology', 'deals', 'topics'] as const
export type CategoryKey = typeof CATEGORY_KEYS[number]

export const CATEGORIES: Record<CategoryKey, CategoryMeta> = {
  invest: {
    label: '投資・マーケット',
    path: '/invest',
    blurb: '市場動向や投資アイデアを整理し、実践に役立つ視点をまとめるカテゴリです。',
    monetization: '証券会社のキャンペーンや投資サービスの紹介による収益化を想定しています。'
  },
  fitness: {
    label: '筋トレ・ダイエット',
    path: '/fitness',
    blurb: 'トレーニングメニューや栄養管理、サプリ選びをわかりやすく整理するカテゴリです。',
    monetization: 'プロテイン・サプリ・ホームジム用品などのアフィリエイト連携を中心に想定しています。'
  },
  gadgets: {
    label: 'ガジェット・家電',
    path: '/gadgets',
    blurb: '生活を効率化するデバイスやツールをレビューし、比較できるように整理するカテゴリです。',
    monetization: 'Amazonや家電量販店のアフィリエイト、スポンサー連携を想定しています。'
  },
  technology: {
    label: 'IT・テクノロジー',
    path: '/technology',
    blurb: 'IT業界の最新動向やプロダクト、サービス活用術を横断的に整理するカテゴリです。',
    monetization: 'SaaSやITスクール、ガジェット関連サービスの紹介による収益化を想定しています。'
  },
  deals: {
    label: 'セール・お得情報',
    path: '/deals',
    blurb: 'タイムセールやクーポン情報を厳選して紹介するカテゴリです。',
    monetization: 'セール情報のアフィリエイトや還元プログラムを通じた収益化を想定しています。'
  },
  topics: {
    label: 'ニュース・雑談',
    path: '/topics',
    blurb: '話題のトピックや雑談ネタ、運営の気づきを共有するカテゴリです。',
    monetization: '関連書籍やサービスの紹介、他カテゴリへの導線強化を目的としています。'
  },
}

export const CATEGORY_ORDER: CategoryKey[] = [...CATEGORY_KEYS]
