import { getAllPosts } from '@lib/posts-fs'
import { SITE_URL } from '@lib/seo'

export async function GET() {
  const base = SITE_URL.replace(/\/$/, '')
  const items = (await getAllPosts({ limit: 50 }))
    .map((post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${base + post.url}</link>
      <guid>${base + post.url}</guid>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <description><![CDATA[${post.description ?? ''}]]></description>
    </item>`)
    .join('')

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0">
    <channel>
      <title>ChoiceMemo</title>
      <link>${base}</link>
      <description>Invest / Fitness / Gadgets / Deals / Topics</description>
      ${items}
    </channel>
  </rss>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  })
}
