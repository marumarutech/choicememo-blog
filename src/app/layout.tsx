import type { Metadata } from 'next'
import Script from 'next/script'
import type { Route } from 'next'
import { Inter, Noto_Sans_JP } from 'next/font/google'
import Link from 'next/link'
import './globals.css'
import { SITE_URL } from '@lib/seo'
import { CATEGORIES, CATEGORY_ORDER } from '@config/categories'

const headingFont = Inter({
  subsets: ['latin'],
  weight: ['600', '700'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
  variable: '--font-heading',
})

const bodyFont = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'sans-serif'],
  variable: '--font-body',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'ChoiceMemo（チョイスメモ） | 選択肢を整えて成果につなげる',
    template: '%s | ChoiceMemo',
  },
  description: 'ChoiceMemo（チョイスメモ）は、投資・筋トレ・ガジェット・セール・トピックの5カテゴリを横断して選択肢を整理できる情報サイトです。',
  alternates: {
    types: {
      'application/rss+xml': '/rss.xml',
    },
  },
  openGraph: {
    siteName: 'ChoiceMemo',
    type: 'website',
    locale: 'ja_JP',
    url: SITE_URL,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${headingFont.variable} ${bodyFont.variable}`}>
      <head>
        <Script
          id="adsbygoogle-init"
          strategy="afterInteractive"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXX"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${bodyFont.variable} font-body`}>
        <div className="flex min-h-screen flex-col">
          <header className="border-b border-brand-border bg-brand-surface/95 shadow-sm backdrop-blur">
            <div className="container flex flex-col gap-6 py-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <Link href="/" className="inline-flex items-center gap-2 text-2xl font-heading font-semibold text-brand-text">
                  ChoiceMemo
                </Link>
                <p className="mt-2 text-sm text-brand-muted">
                  ChoiceMemo（チョイスメモ）は、5つのカテゴリを横断して選択肢を整理できる情報サイトです。
                </p>
              </div>
              <div className="flex w-full flex-col gap-4 lg:w-auto lg:flex-row lg:items-center">
                <nav className="flex flex-wrap gap-3 text-sm font-medium text-brand-muted">
                  {CATEGORY_ORDER.map((key) => {
                    const meta = CATEGORIES[key]
                    return (
                      <Link
                        key={key}
                        href={meta.path as Route}
                        className="rounded-full border border-brand-border bg-brand-surface px-4 py-2 shadow-subtle transition hover:border-brand-primaryHover/40 hover:text-brand-primaryHover"
                      >
                        {meta.label}
                      </Link>
                    )
                  })}
                </nav>
                <form action="/search" className="relative w-full lg:w-64">
                  <input
                    type="search"
                    name="q"
                    placeholder="キーワードで検索"
                    className="w-full rounded-full border border-brand-border bg-brand-surface px-4 py-2 text-sm text-brand-text placeholder:text-brand-muted focus:border-brand-primaryHover focus:outline-none focus:ring-2 focus:ring-brand-ring/60"
                  />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-brand-muted">⌘K</span>
                </form>
              </div>
            </div>
          </header>

          <main className="flex-1">
            {children}
          </main>

          <footer className="border-t border-brand-border bg-brand-surface/80">
            <div className="container grid gap-6 py-10 md:grid-cols-3">
              <div>
                <div className="text-lg font-heading font-semibold text-brand-text">ChoiceMemo</div>
                <p className="mt-3 text-sm text-brand-muted">
                  当サイトのリンクはアフィリエイト広告を含む場合があります。選択の判断材料として活用してください。
                </p>
              </div>
              <div className="text-sm text-brand-muted">
                <div className="font-semibold text-brand-text">運営情報</div>
                <ul className="mt-3 space-y-2">
                  <li><Link href="/about" className="hover:text-brand-primaryHover">運営者情報</Link></li>
                  <li><Link href="/privacy" className="hover:text-brand-primaryHover">プライバシーポリシー</Link></li>
                  <li><Link href="/contact" className="hover:text-brand-primaryHover">お問い合わせ</Link></li>
                </ul>
              </div>
              <div className="text-sm text-brand-muted">
                <div className="font-semibold text-brand-text">免責事項</div>
                <p className="mt-3">
                  掲載内容は調査時点の情報です。価格や在庫は変動するため、最新情報は必ず公式サイトでご確認ください。
                </p>
              </div>
            </div>
            <div className="border-t border-brand-border py-4 text-center text-xs text-brand-muted">
              © {new Date().getFullYear()} ChoiceMemo. All rights reserved.
            </div>\r\n          </footer>
        </div>
      </body>
    </html>
  )
}



