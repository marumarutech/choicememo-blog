import fs from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'

const CONTENT_DIR = path.join(process.cwd(), 'content', 'posts')

export async function GET() {
  try {
    const files = await fs.readdir(CONTENT_DIR)
    const items: Array<{
      file: string
      slug: string | null
      title: string | null
      category: string | null
      draft: boolean
      publishedAt: string | null
    }> = []

    for (const name of files) {
      if (!name.endsWith('.mdx')) continue
      const full = path.join(CONTENT_DIR, name)
      const raw = await fs.readFile(full, 'utf-8')
      const { data } = matter(raw)
      items.push({
        file: name,
        slug: data?.slug ?? null,
        title: data?.title ?? null,
        category: data?.category ?? null,
        draft: Boolean(data?.draft),
        publishedAt: data?.date ?? null,
      })
    }

    return Response.json({ items })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to list posts'
    return new Response(JSON.stringify({ error: message }), { status: 500 })
  }
}
