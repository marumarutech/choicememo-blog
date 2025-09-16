type Heading = { id: string; text: string; level: number }

export default function Toc({ items }: { items: Heading[] }) {
  if (!items?.length) return null
  return (
    <nav className="not-prose rounded bg-gray-50 p-3 text-sm">
      <div className="mb-2 font-semibold">目次</div>
      <ul className="space-y-1">
        {items.map((h) => (
          <li key={h.id} style={{ paddingLeft: `${(h.level - 2) * 12}px` }}>
            <a className="hover:underline" href={`#${h.id}`}>{h.text}</a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

