import { getPostsByTag } from '@lib/posts-fs'
import PostCard from '@components/PostCard'

export const dynamic = 'force-static'

export async function generateStaticParams() {
  const { getAllPosts } = await import('@lib/posts-fs')
  const posts = await getAllPosts()
  const tags = new Set<string>()
  posts.forEach((post) => post.tags.forEach((tag) => tags.add(tag)))
  return Array.from(tags).map((tag) => ({ tag }))
}

export default async function TagPage({ params }: { params: { tag: string } }) {
  const posts = await getPostsByTag(params.tag)

  return (
    <div className="container py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-soft">
        <p className="text-xs uppercase tracking-[0.3em] text-brand-accent">Tag</p>
        <h1 className="mt-4 font-heading text-3xl font-semibold text-brand-text">#{params.tag}</h1>
        <p className="mt-3 text-sm text-brand-mute">このタグに関する記事の一覧です。</p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
        {!posts.length && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-brand-mute">
            記事がまだありません。公開するとここに表示されます。
          </div>
        )}
      </div>
    </div>
  )
}
