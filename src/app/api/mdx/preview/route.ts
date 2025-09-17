import { NextRequest } from 'next/server'
import matter from 'gray-matter'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeStringify from 'rehype-stringify'

export async function POST(req: NextRequest) {
  const { content } = await req.json()
  if (typeof content !== 'string') {
    return new Response(JSON.stringify({ error: 'Invalid content' }), { status: 400 })
  }

  const parsed = matter(content)
  let body = parsed.content

  body = body.replace(/<Lead>([\s\S]*?)<\/Lead>/g, (_m, p1) => `> ${p1.trim()}`)
  body = body.replace(/<ProsCons[^>]*\/>/g, () => `\n**Pros/Cons プレビュー**（本番で整形表示）\n`)
  body = body.replace(/<Pros[^>]*\/>/g, () => `\n**長所リスト**（本番で整形表示）\n`)
  body = body.replace(/<Cons[^>]*\/>/g, () => `\n**短所リスト**（本番で整形表示）\n`)
  body = body.replace(/<CTAButtons[^>]*\/>/g, () => `\n**CTA Buttons プレビュー**（本番で整形表示）\n`)
  body = body.replace(/<ComparisonTable[^>]*\/>/g, () => `\n**比較表プレビュー**（本番でテーブル表示）\n`)
  body = body.replace(/<CompareTable[^>]*\/>/g, () => `\n**比較表プレビュー**（本番でテーブル表示）\n`)
  body = body.replace(/<ReviewCard[\s\S]*?\/>/g, () => `\n**レビューカード（プレビュー簡略化）**\n`)
  body = body.replace(/<Button[^>]*>[\s\S]*?<\/Button>/g, () => `\n[CTAボタン]`)
  body = body.replace(/<TOC[^>]*\/>/g, () => `\n**目次（プレビューでは表示されません）**\n`)
  body = body.replace(/<Rating[^>]*\/>/g, () => '★ ★ ★ ★ ★')

  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: 'wrap' })
    .use(rehypeStringify)
    .process(body)

  const html = `<div class="prose prose-neutral max-w-none">${String(file)}</div>`
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}
