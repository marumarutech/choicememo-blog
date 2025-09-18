import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "お問い合わせ",
  description: "ChoiceMemo へのお問い合わせ方法を案内します。",
}

export default function ContactPage() {
  return (
    <div className="container max-w-2xl space-y-10 py-12 md:py-16">
      <header className="space-y-4">
        <h1 className="font-heading text-3xl font-semibold text-brand-text">お問い合わせ</h1>
        <p className="text-sm text-brand-muted">
          記事内容の修正依頼、広告掲載、取材のご相談など、お気軽に以下の方法でご連絡ください。
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="font-heading text-xl font-semibold text-brand-text">メール</h2>
        <p className="text-sm text-brand-muted">
          <span className="font-semibold text-brand-text">contact.choicememo@gmail.com</span> までご連絡ください。48時間以内の返信を心がけています。
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-xl font-semibold text-brand-text">ご連絡時のお願い</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-brand-muted">
          <li>記事 URL や確認した日時など、可能な範囲で詳細をご記載ください。</li>
          <li>広告・タイアップのご相談は、企画概要と希望の公開時期を添えてお送りください。</li>
          <li>個人情報（住所・電話番号など）は必要な範囲でのみお知らせください。</li>
        </ul>
      </section>

      <section className="space-y-2 rounded-2xl border border-dashed border-brand-border bg-brand-surface p-6 text-sm text-brand-muted">
        <p className="font-semibold text-brand-text">免責事項</p>
        <p>
          お問い合わせ内容によっては回答にお時間をいただく場合や、回答できない場合があります。取得した個人情報はプライバシーポリシーに基づいて適切に管理します。
        </p>
      </section>
    </div>
  )
}

