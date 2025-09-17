type Props = {
  href: string
  children: React.ReactNode
}

export default function AffiliateLink({ href, children }: Props) {
  return (
    <a
      href={href}
      rel="sponsored noopener"
      target="_blank"
      className="inline-flex items-center gap-2 rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow-subtle transition hover:bg-brand-primaryHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:ring-offset-2"
    >
      {children}
    </a>
  )
}
