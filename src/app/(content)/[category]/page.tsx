import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { CATEGORIES, CATEGORY_KEYS, type CategoryKey } from '@config/categories'
import { getPostsByCategory } from '@lib/posts-fs'
import { paginate } from '@lib/pagination'
import PostCard from '@components/PostCard'
import Pagination from '@components/Pagination'

export const dynamic = 'force-static'

function isCategory(value: string): value is CategoryKey {
  return (CATEGORY_KEYS as readonly string[]).includes(value)
}

export async function generateStaticParams() {
  return CATEGORY_KEYS.map((category) => ({ category }))
}

export async function generateMetadata({ params }: { params: { category: string } }): Promise<Metadata> {
  if (!isCategory(params.category)) return {}
  const meta = CATEGORIES[params.category]
  return {
    title: `${meta.label}の記事一覧`,
    description: meta.blurb,
  }
}

export default async function CategoryIndex({ params, searchParams }: { params: { category: string }; searchParams: { page?: string } }) {
  if (!isCategory(params.category)) {
    notFound()
  }

  const page = Number(searchParams.page ?? '1') || 1
  const posts = await getPostsByCategory(params.category)
  const { items, meta } = paginate(posts, page, 12)
  const categoryMeta = CATEGORIES[params.category]

  return (
    <div className="container py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-soft">
        <p className="text-xs uppercase tracking-[0.3em] text-brand-accent">Category</p>
        <h1 className="mt-4 font-heading text-3xl font-semibold text-brand-text">{categoryMeta.label}</h1>
        <p className="mt-3 max-w-3xl text-sm text-brand-mute">{categoryMeta.blurb}</p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {items.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
        {!items.length && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-brand-mute">
            記事がまだありません。公開するとここに表示されます。
          </div>
        )}
      </div>

      <Pagination meta={meta} basePath={categoryMeta.path} />
    </div>
  )
}

