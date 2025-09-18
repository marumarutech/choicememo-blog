import { getAllPosts, getPopularPosts } from '@lib/posts-fs'
import PostCard from '@components/PostCard'
import { CATEGORY_ORDER, CATEGORIES } from '@config/categories'

export const dynamic = 'force-static'

export default async function HomePage() {
  const posts = await getAllPosts({ limit: 24 })
  const popular = await getPopularPosts(10)
  const recommended = posts.slice(0, 3)
  const latest = posts.slice(0, 12)

  const categoryBuckets = CATEGORY_ORDER.map((key) => ({
    key,
    meta: CATEGORIES[key],
    items: posts.filter((post) => post.category === key).slice(0, 4),
  }))

  return (
    <div className="container py-8 md:py-12">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
        <div className="space-y-10">
          <section className="rounded-2xl border border-brand-border bg-brand-surface p-6 shadow-subtle md:p-8 md:shadow-soft">
            <p className="text-sm uppercase tracking-[0.2em] text-brand-primary">Featured</p>
            <h1 className="mt-4 max-w-2xl font-heading text-3xl font-semibold text-brand-text lg:text-4xl">
              6つの主要カテゴリから『今押さえたい』選択肢を素早く比較
            </h1>
            <p className="mt-4 max-w-3xl text-sm text-brand-muted">
              投資・筋トレ・ダイエット・ガジェット・IT・テクノロジー・セール・トピックスをワンストップでチェック。
              比較表とレビューで『読んですぐ行動できる』構成に整えました。
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-brand-muted sm:grid-cols-3 md:flex md:flex-wrap">
              {CATEGORY_ORDER.map((key) => (
                <a
                  key={key}
                  href={CATEGORIES[key].path}
                  className="rounded-full border border-brand-border bg-brand-surface px-3 py-1 shadow-subtle transition hover:border-brand-primaryHover/40 hover:text-brand-primaryHover sm:px-4"
                >
                  {CATEGORIES[key].label}
                </a>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-2xl font-semibold text-brand-text">最新記事</h2>
              <a href="/topics" className="text-sm text-brand-accent transition hover:text-brand-primaryHover">
                すべて見る
              </a>
            </div>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {latest.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </section>

          <section className="space-y-8">
            {categoryBuckets.map(({ key, meta, items }) => (
              <div key={key}>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-heading text-xl font-semibold text-brand-text">{meta.label}</h3>
                  <a href={meta.path} className="text-sm text-brand-accent transition hover:text-brand-primaryHover">
                    {meta.label}の記事一覧へ
                  </a>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  {items.map((post) => (
                    <PostCard key={post.id} post={post} compact />
                  ))}
                  {!items.length && (
                    <p className="rounded-xl border border-dashed border-brand-border bg-brand-surface p-6 text-sm text-brand-muted">
                      まだ記事がありません。投稿するとここに表示されます。
                    </p>
                  )}
                </div>
              </div>
            ))}
          </section>
        </div>

        <aside className="space-y-8">
          <section className="rounded-2xl border border-brand-border bg-brand-surface p-5 shadow-subtle md:p-6 md:shadow-soft">
            <h2 className="font-heading text-lg font-semibold text-brand-text">おすすめTOP3</h2>
            <p className="mt-2 text-xs text-brand-muted">編集部が直近で押さえている記事を厳選。</p>
            <div className="mt-4 space-y-4">
              {recommended.map((post) => (
                <PostCard key={`recommend-${post.id}`} post={post} compact />
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-brand-border bg-brand-surface p-5 shadow-subtle md:p-6 md:shadow-soft">
            <h2 className="font-heading text-lg font-semibold text-brand-text">人気記事</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {popular.map((post) => (
                <li key={`popular-${post.id}`}>
                  <a className="transition hover:text-brand-primaryHover" href={post.url}>
                    {post.title}
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-brand-border bg-brand-surface p-5 shadow-subtle md:p-6 md:shadow-soft">
            <h2 className="font-heading text-lg font-semibold text-brand-text">カテゴリ</h2>
            <ul className="mt-3 space-y-2 text-sm text-brand-muted">
              {CATEGORY_ORDER.map((key) => (
                <li key={`side-${key}`}>
                  <a className="transition hover:text-brand-primaryHover" href={CATEGORIES[key].path}>
                    {CATEGORIES[key].label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  )
}

