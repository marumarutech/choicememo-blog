import fs from 'node:fs/promises'
import path from 'node:path'

const CONTENT_DIR = path.join(process.cwd(), 'content', 'posts')

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  const file = searchParams.get('file')
  try {
    let filename: string | null = null
    if (file) filename = file
    else if (slug) filename = `${slug}.mdx`
    if (!filename) return new Response(JSON.stringify({ error: 'Missing slug or file' }), { status: 400 })
    const full = path.join(CONTENT_DIR, filename)
    const raw = await fs.readFile(full, 'utf-8')
    return new Response(raw, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Not found' }), { status: 404 })
  }
}

