import type { MetadataRoute } from 'next'
import { getAllPosts } from '@lib/posts-fs'
import { SITE_URL } from '@lib/seo'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL.replace(/\/$/, '')
  const posts = await getAllPosts()
  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/best',
    '/reviews',
    '/guides',
    '/news',
    '/deals',
  ].map((p) => ({ url: base + p, lastModified: new Date() }))

  const postRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: base + p.url,
    lastModified: new Date(p.updatedAt || p.publishedAt),
  }))

  return [...staticRoutes, ...postRoutes]
}
