"use client"
import { useEffect, useMemo, useState } from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'

type PostType = 'best' | 'review' | 'guide' | 'news' | 'deals'

function today() {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export default function AdminEditor() {
  const { data: session, status } = useSession()
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<PostType>('best')
  const [tags, setTags] = useState('')
  const [publishedAt, setPublishedAt] = useState(today())
  const [updatedAt, setUpdatedAt] = useState(today())
  const [hero, setHero] = useState('')
  const [draft, setDraft] = useState(false)
  const [body, setBody] = useState('<Lead>この記事の要点（3〜5行）</Lead>\n\n## 見出し\n\n本文を書いてください。')
  const [previewHtml, setPreviewHtml] = useState('')
  const [saving, setSaving] = useState(false)
  const [commitMessage, setCommitMessage] = useState('')

  const mdx = useMemo(() => {
    const tagsArr = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .map((t) => `"${t}"`)
      .join(',')
    return `---\n` +
      `title: "${title}"\n` +
      `slug: "${slug}"\n` +
      `description: "${description}"\n` +
      `type: "${type}"\n` +
      `tags: [${tagsArr}]\n` +
      `publishedAt: "${publishedAt}"\n` +
      `updatedAt: "${updatedAt}"\n` +
      (hero ? `hero: "${hero}"\n` : '') +
      `draft: ${draft}\n` +
      `---\n\n` +
      body + '\n'
  }, [title, slug, description, type, tags, publishedAt, updatedAt, hero, draft, body])

  // ライブプレビュー（デバウンス）
  useEffect(() => {
    const id = setTimeout(async () => {
      try {
        const res = await fetch('/api/mdx/preview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: mdx }) })
        const html = await res.text()
        setPreviewHtml(html)
      } catch {}
    }, 300)
    return () => clearTimeout(id)
  }, [mdx])

  function copyToClipboard() {
    navigator.clipboard.writeText(mdx)
  }

  function downloadFile() {
    const filename = `${slug || 'untitled'}.mdx`
    const blob = new Blob([mdx], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  function insert(text: string) {
    setBody((cur) => (cur ? cur + '\n\n' + text : text))
  }

  async function saveToGitHub() {
    if (!slug) return alert('スラッグを入力してください')
    if (status !== 'authenticated') return signIn('github')
    setSaving(true)
    try {
      const res = await fetch('/api/content/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug, content: mdx, message: commitMessage }) })
      if (!res.ok) throw new Error(await res.text())
      alert('コミットしました。Vercel のデプロイを確認してください。')
    } catch (e: any) {
      alert('保存に失敗しました: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">記事エディタ（MDXライブプレビュー＋GitHub保存）</h1>
        <div className="text-sm">
          {status === 'authenticated' ? (
            <div className="flex items-center gap-3">
              <span className="text-gray-600">{session?.user?.name || 'Signed in'}</span>
              <button className="rounded border px-3 py-1" onClick={() => signOut()}>Sign out</button>
            </div>
          ) : (
            <button className="rounded border px-3 py-1" onClick={() => signIn('github')}>Sign in with GitHub</button>
          )}
        </div>
      </div>
      <p className="text-sm text-gray-600">生成した .mdx をダウンロード or クリップボードへコピーし、`content/posts/` に追加してコミットしてください。</p>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="text-gray-700">タイトル</span>
              <input className="mt-1 w-full rounded border p-2" value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>
            <label className="block text-sm">
              <span className="text-gray-700">スラッグ</span>
              <div className="mt-1 flex gap-2">
                <input className="w-full rounded border p-2" value={slug} onChange={(e) => setSlug(e.target.value)} />
                <button className="rounded border px-2" onClick={() => setSlug(slugify(title))}>生成</button>
              </div>
            </label>
          </div>
          <label className="block text-sm">
            <span className="text-gray-700">説明</span>
            <input className="mt-1 w-full rounded border p-2" value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <label className="block text-sm">
              <span className="text-gray-700">タイプ</span>
              <select className="mt-1 w-full rounded border p-2" value={type} onChange={(e) => setType(e.target.value as PostType)}>
                <option value="best">best</option>
                <option value="review">review</option>
                <option value="guide">guide</option>
                <option value="news">news</option>
                <option value="deals">deals</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="text-gray-700">公開日</span>
              <input type="date" className="mt-1 w-full rounded border p-2" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} />
            </label>
            <label className="block text-sm">
              <span className="text-gray-700">最終更新</span>
              <input type="date" className="mt-1 w-full rounded border p-2" value={updatedAt} onChange={(e) => setUpdatedAt(e.target.value)} />
            </label>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="text-gray-700">タグ（カンマ区切り）</span>
              <input className="mt-1 w-full rounded border p-2" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="健康, プロテイン, 比較" />
            </label>
            <label className="block text-sm">
              <span className="text-gray-700">ヒーロー画像URL</span>
              <input className="mt-1 w-full rounded border p-2" value={hero} onChange={(e) => setHero(e.target.value)} placeholder="/images/hero.jpg" />
            </label>
          </div>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={draft} onChange={(e) => setDraft(e.target.checked)} />
            <span>ドラフト（公開一覧等に表示しない）</span>
          </label>

          <div>
            <div className="mb-2 flex flex-wrap gap-2 text-xs">
              <button className="rounded border px-2 py-1" onClick={() => insert('<Lead>この記事の要点（3〜5行）</Lead>')}>Lead</button>
              <button className="rounded border px-2 py-1" onClick={() => insert('<ProsCons pros={["良い点"]} cons={["悪い点"]} />')}>Pros/Cons</button>
              <button className="rounded border px-2 py-1" onClick={() => insert('<CTAButtons links={[{ label: "Amazon", href: "https://" }, { label: "楽天", href: "https://" }]} />')}>CTA Buttons</button>
              <button className="rounded border px-2 py-1" onClick={() => insert('<ComparisonTable columns={["項目","値"]} rows={[{"項目":"例","値":"123"}]} />')}>比較表</button>
            </div>
            <textarea className="h-80 w-full rounded border p-2 font-mono text-sm" value={body} onChange={(e) => setBody(e.target.value)} />
          </div>
        </div>

        <aside className="space-y-3">
          <div className="rounded border p-3">
            <div className="mb-2 text-sm font-semibold">出力</div>
            <div className="flex gap-2">
              <button className="rounded border px-3 py-1" onClick={copyToClipboard}>コピー</button>
              <button className="rounded border px-3 py-1" onClick={downloadFile}>.mdx をダウンロード</button>
              <button className="rounded border px-3 py-1 disabled:opacity-50" onClick={saveToGitHub} disabled={saving}>{saving ? '保存中…' : 'GitHubに保存'}</button>
            </div>
            <label className="mt-3 block text-xs">
              <span className="text-gray-700">コミットメッセージ（任意）</span>
              <input className="mt-1 w-full rounded border p-2" value={commitMessage} onChange={(e) => setCommitMessage(e.target.value)} placeholder="chore(content): add/update {slug}.mdx" />
            </label>
            <div className="mt-3 text-xs text-gray-600">
              置き場所: <code>content/posts/{'{slug}'}.mdx</code>
            </div>
          </div>
          <div className="rounded border p-3 text-xs text-gray-600">
            <div className="mb-1 font-semibold">補足</div>
            <ul className="list-disc space-y-1 pl-5">
              <li>スラッグは英小文字＋ハイフン、日本語URLは使わない</li>
              <li>News の URL は公開年月から自動で <code>/news/yyyy-mm/slug</code></li>
              <li>ドラフトは一覧/フィード/サイトマップから除外</li>
              <li>プレビューはローカル実行で確認（<code>npm run dev</code>）</li>
            </ul>
          </div>
        </aside>
      </div>

      <div>
        <div className="mb-2 text-sm font-semibold">生成されたMDX</div>
        <pre className="max-h-96 overflow-auto rounded border bg-gray-50 p-3 text-xs"><code>{mdx}</code></pre>
      </div>

      <div>
        <div className="mb-2 text-sm font-semibold">プレビュー</div>
        <div className="rounded border p-4" dangerouslySetInnerHTML={{ __html: previewHtml }} />
      </div>
    </div>
  )
}
