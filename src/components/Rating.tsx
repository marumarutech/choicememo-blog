export function Rating({ value = 4.5, size = 18, max = 5 }: { value: number; size?: number; max?: number }) {
  const full = Math.floor(value)
  const hasHalf = value - full >= 0.5

  return (
    <div className="flex items-center gap-1 text-brand-accent" aria-label={`星${value.toFixed(1)} / ${max}`}>
      {Array.from({ length: max }).map((_, index) => {
        const isFull = index < full
        const isHalf = index === full && hasHalf
        const symbol = isFull ? '★' : isHalf ? '☆' : '☆'
        return (
          <span key={index} style={{ fontSize: size }} aria-hidden="true">
            {symbol}
          </span>
        )
      })}
      <span className="ml-1 text-sm text-brand-muted">{value.toFixed(1)}</span>
    </div>
  )
}

