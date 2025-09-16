import { getAllPosts } from '@lib/posts-fs'
import { SITE_URL } from '@lib/seo'

export async function GET() {
  const base = SITE_URL.replace(/\/$/, '')
  const items = (await getAllPosts({ limit: 50 }))
    .map((p) => `
    <item>
      <title><![CDATA[${p.title}]]></title>
      <link>${base + p.url}</link>
      <guid>${base + p.url}</guid>
      <pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate>
      <description><![CDATA[${p.description ?? ''}]]></description>
    </item>`)
    .join('')

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0">
    <channel>
      <title>ChoiceMemo</title>
      <link>${base}</link>
      <description>Best/Reviews/Guides/News/Deals</description>
      ${items}
    </channel>
  </rss>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  })
}
