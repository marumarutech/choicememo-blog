const DEFAULT_SITE_URL = 'http://localhost:3000'

function resolveSiteUrl() {
  const candidates: Array<{ source: string; value?: string }> = [
    { source: 'NEXT_PUBLIC_SITE_URL', value: process.env.NEXT_PUBLIC_SITE_URL?.trim() },
    { source: 'VERCEL_URL', value: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL.trim()}` : undefined },
  ]

  for (const candidate of candidates) {
    if (!candidate.value) continue
    try {
      const parsed = new URL(candidate.value)
      return parsed.toString()
    } catch {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`Invalid ${candidate.source}: "${candidate.value}". Ignoring.`)
      }
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    console.warn(`Falling back to default SITE_URL: ${DEFAULT_SITE_URL}.`)
  }

  return DEFAULT_SITE_URL
}

export const SITE_URL = resolveSiteUrl()

export function articleJsonLd(input: {
  url: string
  headline: string
  description?: string
  datePublished: string
  dateModified?: string
  image?: string
  authorName?: string
  tags?: string[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': SITE_URL + input.url,
    },
    headline: input.headline,
    description: input.description,
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    image: input.image ? [input.image] : undefined,
    author: input.authorName ? [{ '@type': 'Person', name: input.authorName }] : undefined,
    keywords: input.tags?.join(', '),
  }
}

export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }
}

export function postMetadata(input: {
  title: string
  description?: string
  url: string
  image?: string
}) {
  const absoluteUrl = SITE_URL.replace(/\/$/, '') + input.url
  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: absoluteUrl },
    openGraph: {
      title: input.title,
      description: input.description,
      url: absoluteUrl,
      images: input.image ? [{ url: input.image }] : undefined,
      type: 'article',
      siteName: 'ChoiceMemo',
    },
    twitter: {
      card: input.image ? 'summary_large_image' : 'summary',
      title: input.title,
      description: input.description,
      images: input.image ? [input.image] : undefined,
    },
  }
}
