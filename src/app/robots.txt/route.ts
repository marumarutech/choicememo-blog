import { SITE_URL } from '@lib/seo'

export function GET() {
  const base = SITE_URL.replace(/\/$/, '')
  const body = `User-agent: *
Allow: /

Sitemap: ${base}/sitemap.xml
`
  return new Response(body, { headers: { 'Content-Type': 'text/plain' } })
}
