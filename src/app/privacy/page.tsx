import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description: "ChoiceMemo のプライバシーポリシーを掲載しています。",
}

export default function PrivacyPage() {
  return (
    <div className="container max-w-3xl space-y-10 py-12 md:py-16">
      <header className="space-y-4">
        <h1 className="font-heading text-3xl font-semibold text-brand-text">プライバシーポリシー</h1>
        <p className="text-sm text-brand-muted">
          ChoiceMemo (以下「当サイト」とします) では、読者のプライバシーを尊重し、安全にサービスをご利用いただくために以下の方針を定めています。
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="font-heading text-xl font-semibold text-brand-text">個人情報の利用目的</h2>
        <p className="text-sm text-brand-muted">
          お問い合わせフォーム等で取得した氏名・メールアドレスなどの情報は、質問への回答や必要な連絡にのみ利用し、それ以外の目的で利用することはありません。
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-xl font-semibold text-brand-text">アクセス解析ツールについて</h2>
        <p className="text-sm text-brand-muted">
          当サイトではアクセス解析のため Google Analytics などのツールを利用する場合があります。これらのツールは Cookie を使用して匿名のトラフィックデータを収集します。ブラウザ設定で Cookie を無効にすることで収集を拒否できます。
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-xl font-semibold text-brand-text">広告について</h2>
        <p className="text-sm text-brand-muted">
          当サイトにはアフィリエイト広告や第三者配信の広告が含まれる場合があります。リンク先の商品・サービスに関するお問い合わせは、各販売元へ直接ご連絡ください。
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-xl font-semibold text-brand-text">個人情報の管理</h2>
        <p className="text-sm text-brand-muted">
          個人情報への不正アクセス、紛失、漏えいなどを防ぐために適切な措置を講じます。本人の同意がある場合や法令に基づく場合を除き、第三者への提供は行いません。
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-xl font-semibold text-brand-text">プライバシーポリシーの変更</h2>
        <p className="text-sm text-brand-muted">
          本ポリシーの内容は予告なく変更する場合があります。重要な変更があった際はサイト上で告知します。
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-xl font-semibold text-brand-text">お問い合わせ先</h2>
        <p className="text-sm text-brand-muted">
          プライバシーポリシーに関するお問い合わせは <a className="text-brand-accent" href="mailto:contact.choicememo@gmail.com">contact.choicememo@gmail.com</a> までご連絡ください。
        </p>
      </section>
    </div>
  )
}

