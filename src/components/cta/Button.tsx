import type { AnchorHTMLAttributes, ReactNode } from 'react'
import clsx from 'clsx'

export default function Button({ href, children, className, ...rest }: {
  href: string
  children: ReactNode
  className?: string
} & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      href={href}
      className={clsx(
        'not-prose inline-flex items-center justify-center rounded-xl px-5 py-3 text-base font-semibold',
        'bg-brand-primary text-white shadow-subtle transition hover:bg-brand-primaryHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:ring-offset-2',
        className,
      )}
      {...rest}
    >
      {children}
    </a>
  )
}
