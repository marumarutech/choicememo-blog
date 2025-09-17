import Button from './cta/Button'
import { Rating } from './Rating'

type ReviewCardProps = {
  title: string
  badge?: string
  rating: number
  bullets?: string[]
  ctaLabel: string
  ctaHref: string
}

export default function ReviewCard({ title, badge, rating, bullets = [], ctaLabel, ctaHref }: ReviewCardProps) {
  return (
    <div className="rounded-2xl border border-brand-border bg-brand-surface p-5 shadow-subtle md:shadow-soft">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-heading font-bold text-brand-text">{title}</h3>
        {badge ? (
          <span className="rounded bg-brand-accent/20 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-brand-accent">
            {badge}
          </span>
        ) : null}
      </div>
      <div className="mt-2">
        <Rating value={rating} />
      </div>
      {bullets.length ? (
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-brand-muted">
          {bullets.map((bullet, index) => (
            <li key={index}>{bullet}</li>
          ))}
        </ul>
      ) : null}
      <div className="mt-4">
        <Button href={ctaHref}>{ctaLabel}</Button>
      </div>
    </div>
  )
}

