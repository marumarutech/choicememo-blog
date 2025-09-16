import { getAllPosts } from '@lib/posts-fs'

export async function GET() {
  const posts = await getAllPosts().catch(() => [])
  const slugs = posts.map((p) => p.slug)
  const tags = Array.from(new Set(posts.flatMap((p) => p.tags)))
  return Response.json({ slugs, tags })
}

