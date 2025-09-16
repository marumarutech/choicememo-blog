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
  // Frontmatter を除去
  const parsed = matter(content)
  let body = parsed.content

  // 簡易プレースホルダ（MDXコンポーネントをMarkdown相当へ）
  body = body.replace(/<Lead>([\s\S]*?)<\/Lead>/g, (_m, p1) => `> ${p1.trim()}`)
  body = body.replace(/<ProsCons[^>]*\/>/g, () => `\n**Pros/Cons プレビュー**（本番で整形表示）\n`)
  body = body.replace(/<CTAButtons[^>]*\/>/g, () => `\n**CTA Buttons プレビュー**（本番でボタン表示）\n`)
  body = body.replace(/<ComparisonTable[^>]*\/>/g, () => `\n**比較表プレビュー**（本番でテーブル表示）\n`)

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
