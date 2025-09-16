import fs from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'
import { z } from 'zod'
import { articleJsonLd, faqJsonLd } from './seo'

export const POST_TYPES = ['best','review','guide','news','deals'] as const
export type PostType = typeof POST_TYPES[number]

const Frontmatter = z.object({
  title: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  type: z.enum(POST_TYPES),
  tags: z.array(z.string()).default([]),
  publishedAt: z.string(),
  updatedAt: z.string().optional(),
  hero: z.string().optional(),
  draft: z.boolean().default(false),
  faqs: z.array(z.object({ question: z.string(), answer: z.string() })).optional(),
})

export type Post = {
  id: string
  type: PostType
  slug: string
  segment?: string // for news yyyy-mm
  url: string
  title: string
  description?: string
  tags: string[]
  publishedAt: string
  updatedAt?: string
  hero?: string
  draft: boolean
  content: string
  jsonld: any
  faqJsonLd?: any
}

const CONTENT_DIR = path.join(process.cwd(), 'content', 'posts')

export async function readAllFiles(): Promise<string[]> {
  async function walk(dir: string): Promise<string[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    const files = await Promise.all(entries.map((e) => {
      const full = path.join(dir, e.name)
      return e.isDirectory() ? walk(full) : Promise.resolve([full])
    }))
    return files.flat()
  }
  try {
    const files = await walk(CONTENT_DIR)
    return files.filter((f) => f.endsWith('.mdx'))
  } catch {
    return []
  }
}

function toUrl(type: PostType, slug: string, publishedAt?: string) {
  if (type === 'news') {
    const seg = (publishedAt ?? '').slice(0, 7)
    return { url: `/news/${seg}/${slug}`, segment: seg }
  }
  const map: Record<PostType, string> = {
    best: 'best', review: 'reviews', guide: 'guides', news: 'news', deals: 'deals'
  }
  return { url: `/${map[type]}/${slug}` }
}

export async function getAllPosts(opts?: { limit?: number }) : Promise<Post[]> {
  const files = await readAllFiles()
  const posts: Post[] = []
  for (const file of files) {
    const raw = await fs.readFile(file, 'utf-8')
    const { data, content } = matter(raw)
    const f = Frontmatter.parse(data)
    if (f.draft) continue
    const { url, segment } = toUrl(f.type, f.slug, f.publishedAt)
    posts.push({
      id: file,
      type: f.type,
      slug: f.slug,
      segment,
      url,
      title: f.title,
      description: f.description,
      tags: f.tags,
      publishedAt: f.publishedAt,
      updatedAt: f.updatedAt,
      hero: f.hero,
      draft: f.draft,
      content,
      jsonld: articleJsonLd({
        url,
        headline: f.title,
        description: f.description,
        datePublished: f.publishedAt,
        dateModified: f.updatedAt,
        image: f.hero,
        tags: f.tags,
      }),
      faqJsonLd: f.faqs?.length ? faqJsonLd(f.faqs) : undefined,
    })
  }
  posts.sort((a, b) => (b.publishedAt.localeCompare(a.publishedAt)))
  return typeof opts?.limit === 'number' ? posts.slice(0, opts.limit) : posts
}

export async function getPostsByType(type: PostType) {
  const all = await getAllPosts()
  return all.filter(p => p.type === type)
}

export async function getPostBySlug(type: PostType, slug: string) {
  const all = await getAllPosts()
  return all.find(p => p.type === type && p.slug === slug)
}

export async function getPostsByTag(tag: string) {
  const all = await getAllPosts()
  return all.filter(p => p.tags.includes(tag))
}

export async function getRelatedPosts(post: Post, count = 3) {
  const all = await getAllPosts()
  const related = all.filter(p => p.id !== post.id && (p.type === post.type || p.tags.some(t => post.tags.includes(t))))
  return related.slice(0, count)
}

const POPULAR_SLUGS: string[] = [
  // Populate manually or compute by analytics later
]

export async function getPopularPosts(limit = 10) {
  const all = await getAllPosts()
  if (!POPULAR_SLUGS.length) return all.slice(0, limit)
  const map = new Map(all.map(p => [p.slug, p]))
  return POPULAR_SLUGS.map(s => map.get(s)).filter(Boolean).slice(0, limit) as Post[]
}
