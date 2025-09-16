import { getPostsByTag } from '@lib/posts-fs'

export const dynamic = 'force-static'

export async function generateStaticParams() {
  // Simple derivation from all tags
  const tags = new Set<string>()
  const posts = await (await import('@lib/posts-fs')).getAllPosts()
  posts.forEach(p => p.tags.forEach(t => tags.add(t)))
  return Array.from(tags).map(tag => ({ tag }))
}

export default async function TagPage({ params }: { params: { tag: string } }) {
  const posts = await getPostsByTag(params.tag)
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">タグ: {params.tag}</h1>
      <ul className="space-y-3">
        {posts.map(p => (
          <li key={p.id}><a className="hover:underline" href={p.url}>{p.title}</a></li>
        ))}
      </ul>
    </div>
  )
}

