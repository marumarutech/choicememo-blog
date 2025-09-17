import type { ReactNode } from 'react'
import CompareTable from './CompareTable'

type LegacyRow = Record<string, string | number | boolean | ReactNode>

type LegacyProps = {
  columns: string[]
  rows: LegacyRow[]
}

export default function ComparisonTable({ columns, rows }: LegacyProps) {
  const normalized = rows.map((row) => columns.map((col) => row[col] ?? ''))
  return <CompareTable cols={columns} rows={normalized} />
}
