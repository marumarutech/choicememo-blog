import Link from 'next/link'
import type { Route } from 'next'
import { CATEGORIES, type CategoryKey } from '@config/categories'

type BreadcrumbProps = {
  category: CategoryKey
  title: string
}

export function Breadcrumb({ category, title }: BreadcrumbProps) {
  const meta = CATEGORIES[category]
  return (
    <nav aria-label="breadcrumb" className="text-sm text-brand-muted">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link className="transition hover:text-brand-primaryHover" href={"/" as Route}>
            ホーム
          </Link>
        </li>
        <li aria-hidden="true">›</li>
        <li>
          <Link className="transition hover:text-brand-primaryHover" href={meta.path as Route}>
            {meta.label}
          </Link>
        </li>
        <li aria-hidden="true">›</li>
        <li className="text-brand-text">{title}</li>
      </ol>
    </nav>
  )
}
