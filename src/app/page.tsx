import { getAllPosts, getPopularPosts } from '@lib/posts-fs'
import PostCard from '@components/PostCard'

export const dynamic = 'force-static'

export default async function HomePage() {
  const posts = await getAllPosts({ limit: 10 })
  const popular = await getPopularPosts(10)
  const best = posts.filter(p => p.type === 'best').slice(0, 6)

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <section className="mb-8 rounded-lg bg-gray-50 p-6">
          <p className="text-sm text-gray-600">比較・レビュー・ハウツーで、最短で良い選択へ。</p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">Best ハブ（ピックアップ）</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {best.map((p) => (
              <PostCard key={p.id} post={p} compact />
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">最新記事</h2>
          <div className="grid grid-cols-1 gap-4">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      </div>
      <aside className="space-y-8">
        <section>
          <h3 className="mb-3 text-sm font-semibold text-gray-700">人気記事</h3>
          <ul className="space-y-3 text-sm">
            {popular.map((p) => (
              <li key={p.id}><a className="hover:underline" href={p.url}>{p.title}</a></li>
            ))}
          </ul>
        </section>
        <section>
          <h3 className="mb-3 text-sm font-semibold text-gray-700">カテゴリ</h3>
          <ul className="flex flex-wrap gap-2 text-sm">
            {['best','reviews','guides','news','deals'].map((t) => (
              <li key={t}><a className="rounded bg-gray-100 px-2 py-1 hover:bg-gray-200" href={`/${t}`}>{t}</a></li>
            ))}
          </ul>
        </section>
      </aside>
    </div>
  )
}

