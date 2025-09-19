import fs from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'
import { z } from 'zod'
import { articleJsonLd, faqJsonLd } from './seo'
import { CATEGORIES, CATEGORY_KEYS, type CategoryKey } from '@config/categories'

const DraftField = z.preprocess((value) => {
  if (typeof value === 'string') {
    const lowered = value.toLowerCase()
    if (lowered === 'on') return false
    if (lowered === 'off') return true
  }
  return value
}, z.boolean().default(false))

const Frontmatter = z.object({
  title: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  category: z.enum(CATEGORY_KEYS),
  tags: z.array(z.string()).default([]),
  date: z.string(),
  updated: z.string().optional(),
  hero: z.string().optional(),
  draft: DraftField,
  affiliate: z.boolean().default(false),
  faqs: z.array(z.object({ question: z.string(), answer: z.string() })).optional(),
})

export type Post = {
  id: string
  category: CategoryKey
  slug: string
  url: string
  title: string
  description?: string
  tags: string[]
  publishedAt: string
  updatedAt?: string
  hero?: string
  draft: boolean
  affiliate: boolean
  content: string
  jsonld: ReturnType<typeof articleJsonLd>
  faqJsonLd?: ReturnType<typeof faqJsonLd>
}

const CONTENT_DIR = path.join(process.cwd(), 'content', 'posts')

export async function readAllFiles(): Promise<string[]> {
  async function walk(dir: string): Promise<string[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    const files = await Promise.all(entries.map((entry) => {
      const full = path.join(dir, entry.name)
      return entry.isDirectory() ? walk(full) : Promise.resolve([full])
    }))
    return files.flat()
  }
  try {
    const files = await walk(CONTENT_DIR)
    return files.filter((file) => file.endsWith('.mdx'))
  } catch {
    return []
  }
}

function toUrl(category: CategoryKey, slug: string) {
  const base = CATEGORIES[category]?.path ?? `/${category}`
  return base.endsWith('/') ? `${base}${slug}` : `${base}/${slug}`
}

export async function getAllPosts(opts?: { limit?: number }): Promise<Post[]> {
  const files = await readAllFiles()
  const items: Array<{ post: Post; fileBirthtimeMs: number; fileMtimeMs: number }> = []

  for (const file of files) {
    const raw = await fs.readFile(file, 'utf-8')
    const { data, content } = matter(raw)
    const parsed = Frontmatter.parse(data)
    if (parsed.draft) continue

    const stat = await fs.stat(file)
    const url = toUrl(parsed.category, parsed.slug)
    const post: Post = {
      id: file,
      category: parsed.category,
      slug: parsed.slug,
      url,
      title: parsed.title,
      description: parsed.description,
      tags: parsed.tags,
      publishedAt: parsed.date,
      updatedAt: parsed.updated,
      hero: parsed.hero,
      draft: parsed.draft,
      affiliate: parsed.affiliate,
      content,
      jsonld: articleJsonLd({
        url,
        headline: parsed.title,
        description: parsed.description,
        datePublished: parsed.date,
        dateModified: parsed.updated,
        image: parsed.hero,
        tags: parsed.tags,
      }),
      faqJsonLd: parsed.faqs?.length ? faqJsonLd(parsed.faqs) : undefined,
    }

    const birthtimeMs = Number.isFinite(stat.birthtimeMs) && stat.birthtimeMs > 0
      ? stat.birthtimeMs
      : stat.ctimeMs ?? stat.mtimeMs

    items.push({
      post,
      fileBirthtimeMs: birthtimeMs,
      fileMtimeMs: stat.mtimeMs,
    })
  }

  items.sort((a, b) => {
    const publishedDiff = b.post.publishedAt.localeCompare(a.post.publishedAt)
    if (publishedDiff !== 0) return publishedDiff

    const aBirth = a.fileBirthtimeMs ?? a.fileMtimeMs
    const bBirth = b.fileBirthtimeMs ?? b.fileMtimeMs
    if (bBirth !== aBirth) return bBirth - aBirth

    if (b.fileMtimeMs !== a.fileMtimeMs) {
      return b.fileMtimeMs - a.fileMtimeMs
    }

    return b.post.slug.localeCompare(a.post.slug)
  })

  const sortedPosts = items.map((item) => item.post)
  return typeof opts?.limit === 'number' ? sortedPosts.slice(0, opts.limit) : sortedPosts
}

export async function getPostsByCategory(category: CategoryKey) {
  const all = await getAllPosts()
  return all.filter((post) => post.category === category)
}

export async function getPostBySlug(category: CategoryKey, slug: string) {
  const all = await getAllPosts()
  return all.find((post) => post.category === category && post.slug === slug)
}

export async function getPostsByTag(tag: string) {
  const all = await getAllPosts()
  return all.filter((post) => post.tags.includes(tag))
}

export async function getRelatedPosts(post: Post, count = 3) {
  const all = await getAllPosts()
  const related = all.filter(
    (item) =>
      item.id !== post.id &&
      (item.category === post.category || item.tags.some((tag) => post.tags.includes(tag))),
  )
  return related.slice(0, count)
}

const POPULAR_SLUGS: string[] = [
  // Populate manually or compute by analytics later
]

export async function getPopularPosts(limit = 10) {
  const all = await getAllPosts()
  if (!POPULAR_SLUGS.length) return all.slice(0, limit)
  const map = new Map(all.map((post) => [post.slug, post]))
  return POPULAR_SLUGS.map((slug) => map.get(slug))
    .filter((post): post is Post => Boolean(post))
    .slice(0, limit)
}
