import AffiliateLink from './AffiliateLink'

type Link = { label: string; href: string }

export default function CTAButtons({ links }: { links: Link[] }) {
  return (
    <div className="not-prose my-4 flex flex-wrap gap-3">
      {links.map((l) => (
        <AffiliateLink key={l.href} href={l.href}>{l.label}</AffiliateLink>
      ))}
    </div>
  )
}

