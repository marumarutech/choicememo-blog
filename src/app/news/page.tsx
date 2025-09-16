import { getPostsByType } from '@lib/posts-fs'
import { paginate } from '@lib/pagination'
import PostCard from '@components/PostCard'

export default async function NewsIndex({ searchParams }: { searchParams: { page?: string } }) {
  const page = Number(searchParams.page ?? '1') || 1
  const posts = await getPostsByType('news')
  const { items, meta } = paginate(posts, page, 10)
  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">News（話題/アップデート）</h1>
      <div className="space-y-3">
        {items.map(p => <PostCard key={p.id} post={p} />)}
      </div>
      <Pagination meta={meta} base="/news" />
    </div>
  )
}

function Pagination({ meta, base }: { meta: { page: number; pages: number }, base: string }) {
  const items = Array.from({ length: meta.pages }, (_, i) => i + 1)
  return (
    <nav className="mt-6 flex gap-2 text-sm">
      {items.map(p => (
        <a key={p} href={`${base}?page=${p}`} className={`rounded border px-2 py-1 ${p===meta.page? 'bg-gray-900 text-white':'hover:bg-gray-50'}`}>{p}</a>
      ))}
    </nav>
  )
}
export const metadata = {
  title: 'News（話題/アップデート）',
}
