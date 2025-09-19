'use client'

import { useState } from 'react'
import clsx from 'clsx'

type Props = {
  className?: string
}

export default function FauxLikeButton({ className }: Props) {
  const [liked, setLiked] = useState(false)

  const handleClick = () => {
    setLiked((prev) => !prev)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={clsx(
        'inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
        liked
          ? 'border-brand-primary bg-brand-primary text-white shadow-soft'
          : 'border-brand-border bg-brand-surfaceMuted text-brand-primary shadow-subtle hover:border-brand-primaryHover/50 hover:text-brand-primaryHover',
        className,
      )}
      aria-pressed={liked}
      aria-label={liked ? 'いいねを取り消す' : 'いいねする'}
    >
      <span aria-hidden="true" className="text-base leading-none">
        {liked ? '♥' : '♡'}
      </span>
    </button>
  )
}
