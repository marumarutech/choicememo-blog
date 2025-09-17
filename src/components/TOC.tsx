'use client'

import { useEffect, useState } from 'react'

type Head = {
  id: string
  text: string
  level: number
}

export default function TOC() {
  const [heads, setHeads] = useState<Head[]>([])

  useEffect(() => {
    const headings = Array.from(document.querySelectorAll('h2, h3')) as HTMLHeadingElement[]
    setHeads(
      headings
        .filter((h) => h.id)
        .map((h) => ({
          id: h.id,
          text: h.textContent ?? '',
          level: h.tagName === 'H2' ? 2 : 3,
        })),
    )
  }, [])

  if (!heads.length) return null

  return (
    <nav className="rounded-2xl border border-brand-border bg-brand-surface p-3 text-sm shadow-subtle md:p-4 md:shadow-soft">
      <div className="mb-2 font-heading text-sm font-semibold uppercase tracking-wide text-brand-muted">目次</div>
      <ul className="space-y-2">
        {heads.map((h) => (
          <li key={h.id} className={h.level === 3 ? 'pl-4 text-brand-muted' : ''}>
            <a className="transition hover:text-brand-accent" href={`#${h.id}`}>
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
