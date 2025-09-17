type ListProps = { items: string[] }

type ProsConsProps = {
  pros?: string[]
  cons?: string[]
}

export function Pros({ items }: ListProps) {
  if (!items.length) return null
  return (
    <ul className="list-none space-y-2 rounded-xl border border-brand-success/20 bg-brand-success/10 p-4 text-sm text-brand-text/90">
      {items.map((item, index) => (
        <li key={index} className="relative pl-6">
          <span className="absolute left-0 text-brand-success">＋</span>
          {item}
        </li>
      ))}
    </ul>
  )
}

export function Cons({ items }: ListProps) {
  if (!items.length) return null
  return (
    <ul className="list-none space-y-2 rounded-xl border border-brand-danger/20 bg-brand-danger/10 p-4 text-sm text-brand-text/90">
      {items.map((item, index) => (
        <li key={index} className="relative pl-6">
          <span className="absolute left-0 text-brand-danger">－</span>
          {item}
        </li>
      ))}
    </ul>
  )
}

export default function ProsCons({ pros = [], cons = [] }: ProsConsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Pros items={pros} />
      <Cons items={cons} />
    </div>
  )
}
