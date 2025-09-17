import type { MetadataRoute } from 'next'
import { getAllPosts } from '@lib/posts-fs'
import { SITE_URL } from '@lib/seo'
import { CATEGORY_ORDER, CATEGORIES } from '@config/categories'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL.replace(/\/$/, '')
  const posts = await getAllPosts()

  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    ...CATEGORY_ORDER.map((key) => CATEGORIES[key].path),
  ].map((path) => ({ url: base + path, lastModified: new Date() }))

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: base + post.url,
    lastModified: new Date(post.updatedAt || post.publishedAt),
  }))

  return [...staticRoutes, ...postRoutes]
}
