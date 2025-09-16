import Image from 'next/image'
import type { Post } from '@lib/posts-fs'

export default function PostCard({ post, compact = false }: { post: Post; compact?: boolean }) {
  return (
    <a href={post.url} className="block overflow-hidden rounded border hover:bg-gray-50">
      {post.hero ? (
        <div className="relative aspect-[16/9] w-full">
          <Image src={post.hero} alt={post.title} fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover" />
        </div>
      ) : (
        <div className="aspect-[16/9] w-full bg-gray-200" />
      )}
      <div className="p-4">
        <div className="text-xs uppercase tracking-wide text-gray-500">{post.type}</div>
        <h3 className="text-base font-semibold">{post.title}</h3>
        {!compact && (
          <p className="mt-1 text-sm text-gray-600">{post.description}</p>
        )}
        <div className="mt-1 text-xs text-gray-500">{post.publishedAt}</div>
      </div>
    </a>
  )
}
