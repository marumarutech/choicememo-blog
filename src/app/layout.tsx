import type { Metadata } from 'next'
import { SITE_URL } from '@lib/seo'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'ChoiceMemo — 比較・レビュー・ハウツーで選択を助ける',
    template: '%s | ChoiceMemo'
  },
  description: 'Best/Reviews/Guides/News/Deals を中心に、最短で良い選択に辿り着くための情報を提供します。',
  alternates: {
    types: {
      'application/rss+xml': '/rss.xml',
    },
  },
  openGraph: {
    siteName: 'ChoiceMemo',
    type: 'website',
    locale: 'ja_JP',
    url: 'https://choicememo.com'
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        {/* AdSense (afterInteractive) */}
        <Script
          id="adsbygoogle-init"
          strategy="afterInteractive"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXX"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen bg-white text-gray-900">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <header className="mb-8">
            <a href="/" className="text-2xl font-semibold">ChoiceMemo</a>
            <nav className="mt-4 flex gap-4 text-sm">
              <a href="/best" className="hover:underline">Best</a>
              <a href="/reviews" className="hover:underline">Reviews</a>
              <a href="/guides" className="hover:underline">Guides</a>
              <a href="/news" className="hover:underline">News</a>
              <a href="/deals" className="hover:underline">Deals</a>
            </nav>
          </header>
          <main>{children}</main>
          <footer className="mt-16 border-t pt-6 text-sm text-gray-500">© {new Date().getFullYear()} ChoiceMemo</footer>
        </div>
      </body>
    </html>
  )
}
