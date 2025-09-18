import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "運営者情報",
  description: "ChoiceMemo を運営するチームの概要と運営方針を紹介します。",
}

export default function AboutPage() {
  return (
    <div className="container max-w-3xl space-y-10 py-12 md:py-16">
      <header className="space-y-4">
        <h1 className="font-heading text-3xl font-semibold text-brand-text">運営者情報</h1>
        <p className="text-sm text-brand-muted">
          ChoiceMemo は「選択肢を整えて成果につなげる」をテーマに、生活や投資に役立つ情報をわかりやすく整理して届ける個人運営のメディアです。
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="font-heading text-xl font-semibold text-brand-text">運営体制</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-brand-muted">
          <li>運営者: ChoiceMemo 編集部</li>
          <li>所在地: 東京都内（リモートワーク中心）</li>
          <li>連絡先: contact.choicememo@gmail.com</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-xl font-semibold text-brand-text">サイト方針</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-brand-muted">
          <li>独自調査・実体験・公的データをもとに、読者が行動しやすい形で情報を整理します。</li>
          <li>広告・アフィリエイトを含む場合は、記事内で分かるように表示します。</li>
          <li>誤りを発見した場合は速やかに修正し、更新履歴に反映します。</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-xl font-semibold text-brand-text">運営履歴</h2>
        <p className="text-sm text-brand-muted">
          2025年9月にサイトを公開。投資、フィットネス、ガジェット、IT・テクノロジー、セール情報、時事トピックの6カテゴリを軸にコンテンツを拡充しています。
        </p>
      </section>
    </div>
  )
}

