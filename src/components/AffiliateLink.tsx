type Props = {
  href: string
  children: React.ReactNode
}

export default function AffiliateLink({ href, children }: Props) {
  return (
    <a href={href} rel="sponsored noopener" target="_blank" className="inline-flex items-center gap-2 rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-700">
      {children}
    </a>
  )
}

