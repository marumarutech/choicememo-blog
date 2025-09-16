import { notFound } from 'next/navigation'
import { getPostBySlug, getPostsByType, getRelatedPosts } from '@lib/posts-fs'
import { postMetadata } from '@lib/seo'
import { renderMDX } from '@lib/mdx'
import Image from 'next/image'

export async function generateStaticParams() {
  const posts = await getPostsByType('news')
  return posts.map(p => ({ 'yyyy-mm': p.segment ?? '1970-01', slug: p.slug }))
}

export default async function NewsPost({ params }: { params: { 'yyyy-mm': string, slug: string } }) {
  const post = await getPostBySlug('news', params.slug)
  if (!post) return notFound()
  const MDX = await renderMDX(post)
  const related = await getRelatedPosts(post, 3)

  return (
    <article className="prose prose-neutral max-w-none">
      {post.hero ? (
        <div className="relative mb-4 aspect-[16/9] w-full">
          <Image src={post.hero} alt={post.title} fill sizes="100vw" className="object-cover rounded" />
        </div>
      ) : null}
      <h1>{post.title}</h1>
      <p className="text-sm text-gray-500">公開日: {post.publishedAt}</p>
      <div className="my-6">{MDX}</div>
      <hr />
      <h3>関連記事</h3>
      <ul>
        {related.map(r => (
          <li key={r.id}><a href={r.url}>{r.title}</a></li>
        ))}
      </ul>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(post.jsonld) }} />
      {post.faqJsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(post.faqJsonLd) }} />
      ) : null}
    </article>
  )
}

export async function generateMetadata({ params }: { params: { 'yyyy-mm': string, slug: string } }) {
  const post = await getPostBySlug('news', params.slug)
  if (!post) return {}
  return postMetadata({ title: post.title, description: post.description, url: post.url, image: post.hero })
}
