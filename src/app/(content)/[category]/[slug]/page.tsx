import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { CATEGORIES, CATEGORY_KEYS, type CategoryKey } from '@config/categories'
import { getPostBySlug, getRelatedPosts } from '@lib/posts-fs'
import { renderMDX } from '@lib/mdx'
import PostCard from '@components/PostCard'
import { Breadcrumb } from '@components/Breadcrumb'

export const dynamic = 'force-static'

function isCategory(value: string): value is CategoryKey {
  return (CATEGORY_KEYS as readonly string[]).includes(value)
}

export async function generateStaticParams() {
  const { getAllPosts } = await import('@lib/posts-fs')
  const posts = await getAllPosts()
  return posts.map((post) => ({ category: post.category, slug: post.slug }))
}

export async function generateMetadata({ params }: { params: { category: string; slug: string } }): Promise<Metadata> {
  if (!isCategory(params.category)) return {}
  const post = await getPostBySlug(params.category, params.slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      url: post.url,
      type: 'article',
      images: post.hero ? [{ url: post.hero }] : undefined,
    },
  }
}

export default async function ArticlePage({ params }: { params: { category: string; slug: string } }) {
  if (!isCategory(params.category)) {
    notFound()
  }

  const post = await getPostBySlug(params.category, params.slug)
  if (!post) {
    notFound()
  }

  const body = await renderMDX(post)
  const related = await getRelatedPosts(post)
  const categoryMeta = CATEGORIES[post.category]

  return (
    <div className="container py-10">
      <Breadcrumb category={post.category} title={post.title} />

      <article className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
        <div className="space-y-8">
          <header className="space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-soft">
            <span className="inline-flex items-center rounded-full bg-brand-primary/20 px-3 py-1 text-xs font-semibold text-brand-primary">
              {categoryMeta.label}
            </span>
            <h1 className="font-heading text-3xl font-semibold text-brand-text">{post.title}</h1>
            {post.description ? (
              <p className="text-sm text-brand-mute">{post.description}</p>
            ) : null}
            <div className="flex flex-wrap items-center gap-3 text-xs text-brand-mute">
              <time dateTime={post.publishedAt}>公開: {post.publishedAt}</time>
              {post.updatedAt && post.updatedAt !== post.publishedAt ? (
                <span>更新: {post.updatedAt}</span>
              ) : null}
              {post.affiliate ? (
                <span className="rounded-full bg-brand-accent/20 px-2 py-1 text-[11px] text-brand-accent">PR含む</span>
              ) : null}
            </div>
            {post.hero ? (
              <div className="relative overflow-hidden rounded-2xl border border-slate-200">
                <Image
                  src={post.hero}
                  alt={post.title}
                  width={960}
                  height={540}
                  className="h-auto w-full object-cover"
                  sizes="(min-width: 1024px) 640px, 100vw"
                  priority
                />
              </div>
            ) : null}
          </header>

          <div className="prose prose-invert max-w-none">
            {body}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft text-sm text-brand-mute">
            <div className="font-heading text-sm font-semibold uppercase tracking-[0.3em] text-brand-accent">About</div>
            <p className="mt-3 text-brand-text/80">{categoryMeta.blurb}</p>
            <a className="mt-4 inline-flex items-center text-brand-accent hover:text-brand-primary" href={categoryMeta.path}>
              {categoryMeta.label}の記事一覧へ
            </a>
          </div>

                    {related.length ? (
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
              <h2 className="font-heading text-lg font-semibold text-brand-text">関連記事</h2>
              <div className="space-y-4">
                {related.map((item) => (
                  <PostCard key={`related-${item.id}`} post={item} compact />
                ))}
              </div>
            </div>
          ) : null}
        </aside>
      </article>
    </div>
  )
}


