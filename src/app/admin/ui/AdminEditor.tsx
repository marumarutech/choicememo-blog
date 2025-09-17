"use client"
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'

type PostType = 'best' | 'review' | 'guide' | 'news' | 'deals'

type UploadNotice = { type: 'success' | 'error'; text: string }

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
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageNotice, setImageNotice] = useState<UploadNotice | null>(null)
  const [lastImagePath, setLastImagePath] = useState<string | null>(null)
  const [draft, setDraft] = useState(false)
  const [body, setBody] = useState('<Lead>この記事の要点（3〜5行）</Lead>\n\n## 見出し\n\n本文を書いてください。')
  const [previewHtml, setPreviewHtml] = useState('')
  const [saving, setSaving] = useState(false)
  const [commitMessage, setCommitMessage] = useState('')
  const [branch, setBranch] = useState('')
  const [createPr, setCreatePr] = useState(false)
  const [allSlugs, setAllSlugs] = useState<string[]>([])
  const [allTags, setAllTags] = useState<string[]>([])
  const [slugWarn, setSlugWarn] = useState<string | null>(null)
  const [tab, setTab] = useState<'new' | 'existing'>('new')
  const [list, setList] = useState<{ file: string; slug: string | null; title: string | null; type: string | null; draft: boolean; publishedAt: string | null }[]>([])
  const fileInputRef = useRef<HTMLInputElement | null>(null)

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

  const lastImageMarkdown = lastImagePath ? `![${title || slug || 'image'}](${lastImagePath})` : ''

  // 初期メタ（スラッグ/タグ/一覧）
  useEffect(() => {
    fetch('/api/content/meta').then(r => r.json()).then(d => {
      setAllSlugs(d.slugs || [])
      setAllTags(d.tags || [])
    }).catch(() => {})
    fetch('/api/content/list').then(r => r.json()).then(d => setList(d.items || [])).catch(() => {})
  }, [])

  // スラッグ重複警告
  useEffect(() => {
    if (!slug) { setSlugWarn(null); return }
    const exists = allSlugs.includes(slug)
    setSlugWarn(exists ? 'このスラッグは既に存在します（上書き保存になります）' : null)
  }, [slug, allSlugs])

  // ローカル自動保存
  useEffect(() => {
    const key = `cm-admin-draft-${slug || 'untitled'}`
    const id = setTimeout(() => { localStorage.setItem(key, mdx) }, 500)
    return () => clearTimeout(id)
  }, [mdx, slug])

  // Ctrl+S で保存
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault(); saveToGitHub()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [saveToGitHub])

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

  function triggerImageUpload() {
    setImageNotice(null)
    fileInputRef.current?.click()
  }

  async function handleImageFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    event.target.value = ''
    setImageNotice(null)

    const mimeToExt: Record<string, string> = {
      'image/png': 'png',
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/webp': 'webp',
      'image/gif': 'gif',
    }

    const allowedExt = new Set(['png', 'jpg', 'jpeg', 'webp', 'gif'])
    let ext = mimeToExt[file.type as keyof typeof mimeToExt] || file.name.split('.').pop()?.toLowerCase() || ''
    if (ext === 'jpeg') {
      ext = 'jpg'
    }

    if (!allowedExt.has(ext)) {
      setImageNotice({ type: 'error', text: '対応していない画像形式です (png/jpg/webp/gif)。' })
      return
    }

    const baseName = file.name.replace(/\.[^.]+$/, '')
    const safeBase = slugify(baseName || 'image').replace(/[^a-z0-9-]/g, '')
    const slugPart = slug ? slug.replace(/[^a-z0-9-]/g, '') : ''
    const filenameBase = [slugPart, safeBase].filter(Boolean).join('-') || 'image'
    const filename = `${filenameBase}-${Date.now()}.${ext}`

    let dataUrl: string
    try {
      dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve((reader.result as string) || '')
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsDataURL(file)
      })
    } catch {
      setImageNotice({ type: 'error', text: 'ファイルの読み込みに失敗しました。' })
      return
    }

    const payload: Record<string, string> = { filename, dataUrl }
    const targetBranch = branch.trim()
    if (targetBranch) {
      payload.branch = targetBranch
    }

    setUploadingImage(true)
    try {
      const res = await fetch('/api/content/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json?.error || '画像のアップロードに失敗しました')
      }
      const savedPath = typeof json.path === 'string' ? json.path : `/${filename}`
      setLastImagePath(savedPath)
      if (!hero) {
        setHero(savedPath)
      }
      setImageNotice({ type: 'success', text: `画像をアップロードしました: ${savedPath}` })
    } catch (error) {
      console.error(error)
      setImageNotice({ type: 'error', text: error instanceof Error ? error.message : '画像のアップロードに失敗しました' })
    } finally {
      setUploadingImage(false)
    }
  }

  function copyText(value: string, successMessage: string) {
    const fallback = () => {
      try {
        const textarea = document.createElement('textarea')
        textarea.value = value
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.focus()
        textarea.select()
        const ok = document.execCommand('copy')
        document.body.removeChild(textarea)
        if (ok) {
          setImageNotice({ type: 'success', text: successMessage })
        } else {
          throw new Error('copy command failed')
        }
      } catch {
        setImageNotice({ type: 'error', text: 'クリップボードにコピーできませんでした。' })
      }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(value).then(() => {
        setImageNotice({ type: 'success', text: successMessage })
      }).catch(() => {
        fallback()
      })
    } else {
      fallback()
    }
  }

  function copyImageUrl(path: string) {
    copyText(path, '画像URLをコピーしました。')
  }

  function copyImageMarkdown(path: string) {
    const alt = title || slug || 'image'
    copyText(`![${alt}](${path})`, 'Markdownをコピーしました。')
  }

  function insertImageSnippet(path: string) {
    const alt = title || slug || 'image'
    insert(`![${alt}](${path})`)
    setImageNotice({ type: 'success', text: '本文に画像を挿入しました。' })
  }

  function useImageAsHero(path: string) {
    setHero(path)
    setImageNotice({ type: 'success', text: `ヒーロー画像に設定しました: ${path}` })
  }

  function insert(text: string) {
    setBody((cur) => (cur ? cur + '\n\n' + text : text))
  }

  async function saveToGitHub() {
    if (!slug) return alert('スラッグを入力してください')
    if (status !== 'authenticated') return signIn('github')
    setSaving(true)
    try {
      const res = await fetch('/api/content/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug, content: mdx, message: commitMessage, branch: branch || undefined, createPr }) })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      alert(`コミットしました。ブランチ: ${data.branch}${data.prUrl ? `\nPR: ${data.prUrl}` : ''}`)
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
      <div className="flex gap-2 text-sm">
        <button className={`rounded px-3 py-1 ${tab==='new'?'bg-gray-900 text-white':'border'}`} onClick={() => setTab('new')}>新規作成</button>
        <button className={`rounded px-3 py-1 ${tab==='existing'?'bg-gray-900 text-white':'border'}`} onClick={() => setTab('existing')}>既存を編集</button>
      </div>
      <p className="text-sm text-gray-600">生成した .mdx をダウンロード / GitHub に保存して運用します。</p>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {tab==='existing' && (
            <div className="rounded border p-3">
              <div className="mb-2 text-sm font-semibold">既存記事</div>
              <div className="mb-2 text-xs text-gray-600">クリックでエディタに読み込み</div>
              <div className="max-h-60 overflow-auto pr-2">
                <table className="w-full text-xs">
                  <thead><tr className="text-left text-gray-500"><th>タイトル</th><th>スラッグ</th><th>タイプ</th><th>公開日</th></tr></thead>
                  <tbody>
                    {list.map((it) => (
                      <tr key={it.file} className="cursor-pointer hover:bg-gray-50" onClick={async () => {
                        const res = await fetch(`/api/content/get?file=${encodeURIComponent(it.file)}`)
                        const text = await res.text();
                        setBody(text.split('\n---\n').slice(2).join('\n---\n')) // best-effort; UIはmdx全文で上書き
                        // そのまま全文ロード
                        const raw = text
                        // frontmatter 抜粋
                        const m = raw.match(/^---[\s\S]*?---/)
                        if (m) {
                          const fm = m[0]
                          const get = (k: string) => {
                            const r = new RegExp(`\\n${k}:(.*)\\n`)
                            const mm = fm.match(r)
                            return mm ? mm[1].trim().replace(/^"|"$/g,'') : ''
                          }
                          setTitle(get('title'))
                          setSlug(get('slug'))
                          setDescription(get('description'))
                          setHero(get('hero'))
                          setPublishedAt(get('publishedAt')||today())
                          setUpdatedAt(get('updatedAt')||today())
                          const t = get('type') as PostType
                          if (t) setType(t)
                          setDraft(/\ndraft:\s*true/i.test(fm))
                          const tagsM = fm.match(/\ntags:\s*\[(.*?)\]/)
                          setTags(tagsM ? tagsM[1] : '')
                        }
                      }}>
                        <td className="py-1 pr-2">{it.title || '(無題)'}</td>
                        <td className="py-1 pr-2 text-gray-600">{it.slug}</td>
                        <td className="py-1 pr-2 text-gray-600">{it.type}</td>
                        <td className="py-1 pr-2 text-gray-600">{it.publishedAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
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
              {slugWarn ? <div className="mt-1 text-xs text-amber-700">{slugWarn}</div> : null}
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
              {allTags?.length ? (
                <div className="mt-1 text-xs text-gray-500">既存タグ候補: {allTags.slice(0, 20).join(', ')}{allTags.length>20?' …':''}</div>
              ) : null}
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
          <div className="rounded border p-3 space-y-2">
            <div className="text-sm font-semibold">画像アップロード</div>
            <p className="text-xs text-gray-600">public/images/ に保存します。完了後にリンクをコピーして記事へ貼り付けてください。</p>
            <div className="flex flex-wrap gap-2 text-xs">
              <input ref={fileInputRef} className="hidden" type="file" accept="image/png,image/jpeg,image/jpg,image/webp,image/gif" onChange={handleImageFileChange} />
              <button type="button" className="rounded border px-3 py-1 disabled:opacity-50" onClick={triggerImageUpload} disabled={uploadingImage}>
                {uploadingImage ? 'アップロード中…' : '画像を選択'}
              </button>
            </div>
            {lastImagePath ? (
              <div className="space-y-2 rounded border bg-gray-50 p-2">
                <div className="font-mono text-xs break-all">{lastImagePath}</div>
                {lastImageMarkdown ? (
                  <div>
                    <div className="text-[11px] text-gray-500">Markdown</div>
                    <code className="block break-all bg-white px-2 py-1 text-[11px] text-gray-700">{lastImageMarkdown}</code>
                  </div>
                ) : null}
                <div className="flex flex-wrap gap-2 text-xs">
                  <button type="button" className="rounded border px-2 py-1" onClick={() => copyImageUrl(lastImagePath)}>URLをコピー</button>
                  <button type="button" className="rounded border px-2 py-1" onClick={() => copyImageMarkdown(lastImagePath)}>Markdownをコピー</button>
                  <button type="button" className="rounded border px-2 py-1" onClick={() => insertImageSnippet(lastImagePath)}>本文に挿入</button>
                  <button type="button" className="rounded border px-2 py-1" onClick={() => useImageAsHero(lastImagePath)}>Heroに設定</button>
                </div>
              </div>
            ) : null}
            {imageNotice ? (
              <p className={`text-xs ${imageNotice.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {imageNotice.text}
              </p>
            ) : null}
          </div>

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
            <div className="mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
              <label className="block">
                <span className="text-gray-700">ブランチ（任意）</span>
                <input className="mt-1 w-full rounded border p-2" value={branch} onChange={(e) => setBranch(e.target.value)} placeholder="feature/post-xxx（未指定なら main）" />
              </label>
              <label className="mt-6 inline-flex items-center gap-2">
                <input type="checkbox" checked={createPr} onChange={(e) => setCreatePr(e.target.checked)} />
                <span>PR を自動作成</span>
              </label>
            </div>
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
