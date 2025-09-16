import fs from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'

const CONTENT_DIR = path.join(process.cwd(), 'content', 'posts')

export async function GET() {
  try {
    const files = await fs.readdir(CONTENT_DIR)
    const items = [] as any[]
    for (const name of files) {
      if (!name.endsWith('.mdx')) continue
      const full = path.join(CONTENT_DIR, name)
      const raw = await fs.readFile(full, 'utf-8')
      const { data } = matter(raw)
      items.push({
        file: name,
        slug: data?.slug ?? null,
        title: data?.title ?? null,
        type: data?.type ?? null,
        draft: !!data?.draft,
        publishedAt: data?.publishedAt ?? null,
      })
    }
    return Response.json({ items })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Failed to list posts' }), { status: 500 })
  }
}

