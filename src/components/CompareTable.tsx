import type { ReactNode } from 'react'

type CompareTableProps = {
  cols: string[]
  rows: (Array<string | ReactNode>)[]
}

export default function CompareTable({ cols, rows }: CompareTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-brand-border bg-brand-surface shadow-subtle">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="sticky top-0 bg-brand-surfaceMuted">
          <tr>
            {cols.map((col, index) => (
              <th key={index} className="px-4 py-3 text-left font-semibold text-brand-text">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-brand-surface' : 'bg-brand-surfaceMuted'}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-3 align-top text-brand-muted">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

