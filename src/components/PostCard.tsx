import Image from 'next/image'
import Link from 'next/link'
import type { Route } from 'next'
import { CATEGORIES } from '@config/categories'
import type { Post } from '@lib/posts-fs'
import { getFauxLikeCount } from '@lib/fauxEngagement'

export default function PostCard({ post, compact = false }: { post: Post; compact?: boolean }) {
  const categoryLabel = CATEGORIES[post.category]?.label ?? post.category
  const likeCount = getFauxLikeCount(post.id)

  return (
    <Link
      href={post.url as Route}
      className="group block overflow-hidden rounded-2xl border border-brand-border bg-brand-surface shadow-subtle transition md:hover:-translate-y-1 md:hover:border-brand-primaryHover/40 md:shadow-soft"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        {post.hero ? (
          <Image
            src={post.hero}
            alt={post.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-brand-surfaceMuted" />
        )}
        <span className="absolute left-4 top-4 inline-flex items-center rounded-full bg-brand-tag px-3 py-1 text-xs font-semibold text-brand-primary">
          {categoryLabel}
        </span>
      </div>
      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-center gap-2 text-xs text-brand-muted">
          <time dateTime={post.publishedAt}>{post.publishedAt}</time>
          {post.updatedAt && post.updatedAt !== post.publishedAt ? (
            <span className="rounded-full bg-brand-surfaceMuted px-2 py-0.5 text-[11px] text-brand-muted">更新 {post.updatedAt}</span>
          ) : null}
        </div>
        <h3 className="font-heading text-lg font-semibold text-brand-text transition group-hover:text-brand-primaryHover">
          {post.title}
        </h3>
        {!compact && post.description ? (
          <p className="text-sm text-brand-muted">{post.description}</p>
        ) : null}
        <div className="flex flex-wrap gap-2 text-xs text-brand-muted">
          {post.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full bg-brand-surfaceMuted px-2 py-0.5">#{tag}</span>
          ))}
        </div>
        <div
          className="mt-auto flex items-center justify-end gap-1 text-xs font-medium text-brand-muted"
          aria-label={`この投稿の擬似いいね数は${likeCount.toLocaleString('ja-JP')}です`}
        >
          <span aria-hidden="true">♡</span>
          <span>{likeCount.toLocaleString('ja-JP')}</span>
        </div>
      </div>
    </Link>
  )
}
