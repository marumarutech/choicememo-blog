import { notFound } from 'next/navigation'
import AdminEditor from './ui/AdminEditor'

export const dynamic = 'force-static'

export default function AdminPage() {
  // 本番では既定で無効（NEXT_PUBLIC_ENABLE_ADMIN=true で有効化）
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_ENABLE_ADMIN !== 'true') {
    notFound()
  }
  return <AdminEditor />
}

