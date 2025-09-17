import type { ReactNode } from 'react'

type CompareTableProps = {
  cols: string[]
  rows: (Array<string | ReactNode>)[]
}

export default function CompareTable({ cols, rows }: CompareTableProps) {
  return (
    <div className="not-prose overflow-x-auto rounded-2xl border border-brand-border bg-brand-surface shadow-subtle">
      <table className="w-full min-w-[680px] text-[13px] leading-6">
        <thead className="sticky top-0 bg-brand-surfaceMuted/95 backdrop-blur">
          <tr className="text-[12px] font-semibold uppercase tracking-wide text-brand-muted">
            {cols.map((col, index) => (
              <th key={index} className="px-4 py-3 text-left">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-brand-surface' : 'bg-brand-surfaceMuted'}>
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className={`border-t border-brand-border/60 px-4 py-3 align-top ${cellIndex === 0 ? 'font-semibold text-brand-text' : 'text-brand-muted'}`}
                >
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
