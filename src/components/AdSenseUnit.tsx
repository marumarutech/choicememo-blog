"use client"
import { useEffect } from 'react'

type Props = {
  slot?: string
  format?: string
  responsive?: boolean
  className?: string
}

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>
  }
}

export default function AdSenseUnit({ slot, format = 'auto', responsive = true, className }: Props) {
  useEffect(() => {
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {}
  }, [])

  return (
    <div className={className}>
      <ins
        className="adsbygoogle block"
        style={{ display: 'block', minHeight: 200 }}
        data-ad-client="ca-pub-XXXX"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  )
}
