"use client"
import { ReactNode } from 'react'
import { SessionProvider } from 'next-auth/react'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <div className="mx-auto max-w-5xl px-4 py-6">
        {children}
      </div>
    </SessionProvider>
  )
}
