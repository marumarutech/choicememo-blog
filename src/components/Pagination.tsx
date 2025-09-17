import Link from 'next/link'
import type { Route } from 'next'
import clsx from 'clsx'
import type { Pagination as PaginationMeta } from '@lib/pagination'

type PaginationProps = {
  meta: PaginationMeta
  basePath: string
}

export default function Pagination({ meta, basePath }: PaginationProps) {
  if (meta.pages <= 1) return null

  const pages = Array.from({ length: meta.pages }, (_, index) => index + 1)

  return (
    <nav className="mt-8 flex flex-wrap items-center gap-2 text-sm" aria-label="ページネーション">
      {pages.map((page) => {
        const href = page === 1 ? (basePath as Route) : { pathname: basePath, query: { page } }
        return (
          <Link
            key={page}
            href={href}
            aria-current={page === meta.page ? 'page' : undefined}
            className={clsx(
              'inline-flex items-center rounded-full border border-brand-border px-3 py-1.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:ring-offset-2',
              page === meta.page
                ? 'bg-brand-primary text-white shadow-subtle'
                : 'bg-brand-surface text-brand-muted hover:border-brand-primaryHover/40 hover:text-brand-primaryHover',
            )}
          >
            {page}
          </Link>
        )
      })}
    </nav>
  )
}
