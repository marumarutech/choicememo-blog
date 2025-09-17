"use client"
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'
import { CATEGORY_ORDER, CATEGORIES, type CategoryKey } from '@config/categories'
import { getTemplateForCategory } from './templates'

type CategoryOption = CategoryKey

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
  const [category, setCategory] = useState<CategoryOption>('invest')
  const [tags, setTags] = useState('')
  const [publishedAt, setPublishedAt] = useState(today())
  const [updatedAt, setUpdatedAt] = useState(today())
  const [hero, setHero] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [toast, setToast] = useState<UploadNotice | null>(null)
  const [lastImagePath, setLastImagePath] = useState<string | null>(null)
  const [draft, setDraft] = useState(false)
  const [affiliate, setAffiliate] = useState(false)
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
  const [list, setList] = useState<{ file: string; slug: string | null; title: string | null; category: string | null; draft: boolean; publishedAt: string | null }[]>([])
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
      `category: "${category}"\n` +
      `tags: [${tagsArr}]\n` +
      `date: "${publishedAt}"\n` +
      `updated: "${updatedAt}"\n` +
      (hero ? `hero: "${hero}"\n` : '') +
      `affiliate: ${affiliate}\n` +
      `draft: ${draft}\n` +
      `---\n\n` +
      body + '\n'
  }, [title, slug, description, category, tags, publishedAt, updatedAt, hero, draft, body, affiliate])

  const template = useMemo(() => getTemplateForCategory(category), [category])
  const templatePreview = useMemo(() => template.body.split('\n').slice(0, 8).join('\n'), [template])
  const categoryMeta = CATEGORIES[category]

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

  useEffect(() => {
    if (!toast) return
    const id = window.setTimeout(() => setToast(null), 4000)
    return () => window.clearTimeout(id)
  }, [toast])

  function copyToClipboard() {
    copyText(mdx, 'MDXをコピーしました。')
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
    setToast({ type: 'success', text: `${filename} をダウンロードしました。` })
  }

  function triggerImageUpload() {
    setToast(null)
    fileInputRef.current?.click()
  }

  async function handleImageFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    event.target.value = ''
    setToast(null)

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
      setToast({ type: 'error', text: '対応していない画像形式です (png/jpg/webp/gif)。' })
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
      setToast({ type: 'error', text: 'ファイルの読み込みに失敗しました。' })
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
      setToast({ type: 'success', text: `画像をアップロードしました: ${savedPath}` })
    } catch (error) {
      console.error(error)
      setToast({ type: 'error', text: error instanceof Error ? error.message : '画像のアップロードに失敗しました' })
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
          setToast({ type: 'success', text: successMessage })
        } else {
          throw new Error('copy command failed')
        }
      } catch {
        setToast({ type: 'error', text: 'クリップボードにコピーできませんでした。' })
      }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(value).then(() => {
        setToast({ type: 'success', text: successMessage })
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
    setToast({ type: 'success', text: '本文に画像を挿入しました。' })
  }

  function setHeroFromImage(path: string) {
    setHero(path)
    setToast({ type: 'success', text: `ヒーロー画像に設定しました: ${path}` })
  }

  function insert(text: string) {
    setBody((cur) => (cur ? cur + '\n\n' + text : text))
  }

  function applyTemplate(mode: 'replace' | 'append') {
    if (!template?.body) return
    const hasContent = Boolean(body.trim())
    if (mode === 'replace' && hasContent) {
      const confirmed = window.confirm('現在の本文をテンプレートで置き換えますか？')
      if (!confirmed) return
    }
    setBody((current) => {
      if (mode === 'replace' || !current.trim()) {
        return template.body
      }
      return `${current.trim()}\n\n${template.body}`
    })
    setToast({ type: 'success', text: mode === 'replace' ? 'テンプレートを適用しました。' : 'テンプレートを末尾に追加しました。' })
  }

  function copyTemplateBody() {
    if (!template?.body) return
    copyText(template.body, 'テンプレート本文をコピーしました。')
  }

  async function loadExisting(file: string) {
    try {
      const res = await fetch(`/api/content/get?file=${encodeURIComponent(file)}`)
      if (!res.ok) throw new Error('記事を取得できませんでした。')
      const text = await res.text()
      setBody(text.split('\n---\n').slice(2).join('\n---\n'))
      const raw = text
      const m = raw.match(/^---[\s\S]*?---/)
      if (m) {
        const fm = m[0]
        const get = (k: string) => {
          const r = new RegExp(`\\n${k}:(.*)\\n`)
          const mm = fm.match(r)
          return mm ? mm[1].trim().replace(/^"|"$/g, '') : ''
        }
        setTitle(get('title'))
        setSlug(get('slug'))
        setDescription(get('description'))
        setHero(get('hero'))
        setPublishedAt(get('date') || today())
        setUpdatedAt(get('updated') || today())
        const cat = get('category') as CategoryOption
        if (cat) setCategory(cat)
        setDraft(/\ndraft:\s*true/i.test(fm))
        const tagsMatch = fm.match(/\ntags:\s*\[(.*?)\]/)
        setTags(tagsMatch ? tagsMatch[1] : '')
      }
      setToast({ type: 'success', text: '本文を読み込みました。' })
    } catch (error) {
      const message = error instanceof Error ? error.message : '既存記事の読み込みに失敗しました。'
      setToast({ type: 'error', text: message })
    }
  }

  const saveToGitHub = useCallback(async () => {
    if (!slug) {
      setToast({ type: 'error', text: 'スラッグを入力してください。' })
      return
    }
    if (status !== 'authenticated') {
      signIn('github')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/content/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, content: mdx, message: commitMessage, branch: branch || undefined, createPr }),
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      const message = `コミットしました。ブランチ: ${data.branch}${data.prUrl ? ` / PR: ${data.prUrl}` : ''}`
      setToast({ type: 'success', text: message })
    } catch (error) {
      const message = error instanceof Error ? error.message : '保存に失敗しました。'
      setToast({ type: 'error', text: message })
      alert('保存に失敗しました: ' + message)
    } finally {
      setSaving(false)
    }
  }, [branch, commitMessage, createPr, mdx, slug, status])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        saveToGitHub()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [saveToGitHub])

  const cardClass = 'rounded-2xl border border-brand-border bg-brand-surface shadow-subtle md:shadow-soft'
  const inputClass = 'mt-1 w-full rounded-lg border border-brand-border bg-brand-surface px-3 py-2 text-sm text-brand-text shadow-subtle focus:border-brand-primaryHover focus:outline-none focus:ring-2 focus:ring-brand-ring/40'
  const textareaClass = 'h-80 w-full rounded-2xl border border-brand-border bg-brand-surface px-4 py-3 font-mono text-sm text-brand-text shadow-subtle focus:border-brand-primaryHover focus:outline-none focus:ring-2 focus:ring-brand-ring/40'
  const pillButtonClass = 'inline-flex items-center gap-2 rounded-full border border-brand-border bg-brand-surface px-3 py-1.5 text-sm font-semibold text-brand-text transition hover:border-brand-primaryHover/50 hover:text-brand-primaryHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:ring-offset-2'
  const smallButtonClass = 'inline-flex items-center gap-1 rounded-full border border-brand-border bg-brand-surface px-3 py-1 text-xs font-semibold text-brand-text transition hover:border-brand-primaryHover/50 hover:text-brand-primaryHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:ring-offset-2'
  const primaryButtonClass = 'inline-flex items-center gap-2 rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow-subtle transition hover:bg-brand-primaryHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:ring-offset-2'
  const chipClass = 'inline-flex items-center rounded-full bg-brand-subtle px-3 py-1 text-xs font-medium text-brand-muted'

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      {toast ? (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm" aria-live="polite" role="status">
          <div className={`rounded-xl border px-4 py-3 text-sm shadow-soft ${toast.type === 'success' ? 'border-brand-primary/40 bg-brand-subtle text-brand-primary' : 'border-brand-danger/40 bg-red-50 text-brand-danger'}`}>
            {toast.text}
          </div>
        </div>
      ) : null}

      <section className={`${cardClass} p-6 md:p-8`}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-heading font-semibold text-brand-text md:text-3xl">記事エディタ</h1>
            <p className="mt-2 text-sm text-brand-muted">
              MDXの作成・ライブプレビュー・GitHub保存をワンストップで行えます。
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {status === 'authenticated' ? (
              <>
                <span className="hidden text-brand-muted sm:inline">{session?.user?.name || 'Signed in'}</span>
                <button type="button" className={pillButtonClass} onClick={() => signOut()}>
                  サインアウト
                </button>
              </>
            ) : (
              <button type="button" className={primaryButtonClass} onClick={() => signIn('github')}>
                GitHub でサインイン
              </button>
            )}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-brand-muted">
          <span className={chipClass}>⌘ / Ctrl + S で保存</span>
          <span className={chipClass}>ローカル自動保存</span>
          <span className={chipClass}>ライブプレビュー</span>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="編集モード">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'new'}
          className={`${pillButtonClass} ${tab === 'new' ? 'bg-brand-primary text-white shadow-subtle hover:text-white' : ''}`}
          onClick={() => setTab('new')}
        >
          新規作成
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'existing'}
          className={`${pillButtonClass} ${tab === 'existing' ? 'bg-brand-primary text-white shadow-subtle hover:text-white' : ''}`}
          onClick={() => setTab('existing')}
        >
          既存を編集
        </button>
      </div>

      <p className="text-sm text-brand-muted">
        生成した MDX はダウンロード、または GitHub に直接保存して公開管理します。
      </p>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <section className="space-y-5">
          {tab === 'existing' && (
            <div className={`${cardClass} p-4 md:p-5`}>
              <div className="mb-2 flex items-center justify-between text-sm font-semibold text-brand-text">
                <span>既存記事</span>
                <span className="text-xs font-normal text-brand-muted">クリックで内容を読み込みます</span>
              </div>
              <div className="max-h-64 overflow-auto rounded-xl border border-brand-border/60">
                <table className="w-full text-xs">
                  <thead className="bg-brand-surfaceMuted text-left text-brand-muted">
                    <tr>
                      <th className="px-3 py-2 font-semibold">タイトル</th>
                      <th className="px-3 py-2 font-semibold">スラッグ</th>
                      <th className="px-3 py-2 font-semibold">タイプ</th>
                      <th className="px-3 py-2 font-semibold">公開日</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((it) => (
                      <tr
                        key={it.file}
                        role="button"
                        tabIndex={0}
                        className="border-t border-brand-border/60 text-brand-text transition hover:bg-brand-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring"
                        onClick={() => loadExisting(it.file)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            loadExisting(it.file)
                          }
                        }}
                      >
                        <td className="px-3 py-2">{it.title || '（無題）'}</td>
                        <td className="px-3 py-2 text-brand-muted">{it.slug}</td>
                        <td className="px-3 py-2 text-brand-muted">{it.category ? (CATEGORIES[it.category as CategoryKey]?.label ?? it.category) : '-'}</td>
                        <td className="px-3 py-2 text-brand-muted">{it.publishedAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-brand-text">
              <span>タイトル</span>
              <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>
            <label className="block text-sm font-semibold text-brand-text">
              <span>スラッグ</span>
              <div className="mt-1 flex gap-2">
                <input className={`${inputClass} flex-1`} value={slug} onChange={(e) => setSlug(e.target.value)} />
                <button type="button" className={smallButtonClass} onClick={() => setSlug(slugify(title))}>
                  生成
                </button>
              </div>
              {slugWarn ? (
                <span className="mt-1 inline-flex items-center rounded-full bg-brand-accentSoft px-3 py-1 text-xs text-brand-accent">
                  {slugWarn}
                </span>
              ) : null}
            </label>
          </div>

          <label className="block text-sm font-semibold text-brand-text">
            <span>説明</span>
            <input className={inputClass} value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <label className="block text-sm font-semibold text-brand-text">
              <span>カテゴリ</span>
              <select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value as CategoryOption)}>
                {CATEGORY_ORDER.map((key) => (
                  <option key={key} value={key}>
                    {CATEGORIES[key].label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold text-brand-text">
              <span>公開日</span>
              <input type="date" className={inputClass} value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} />
            </label>
            <label className="block text-sm font-semibold text-brand-text">
              <span>最終更新</span>
              <input type="date" className={inputClass} value={updatedAt} onChange={(e) => setUpdatedAt(e.target.value)} />
            </label>
          </div>

          <div className="rounded-2xl border border-brand-border bg-brand-surfaceMuted px-4 py-3 text-xs text-brand-muted">
            <div className="font-semibold text-brand-text">{categoryMeta.label}</div>
            <p className="mt-1">{categoryMeta.blurb}</p>
            <p className="mt-2 text-[11px]">収益化導線: {categoryMeta.monetization}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-brand-text">
              <span>タグ（カンマ区切り）</span>
              <input className={inputClass} value={tags} onChange={(e) => setTags(e.target.value)} placeholder="健康, プロテイン, 比較" />
              {allTags?.length ? (
                <span className="mt-1 inline-block text-xs text-brand-muted">
                  既存タグ候補: {allTags.slice(0, 20).join(', ')}{allTags.length > 20 ? ' …' : ''}
                </span>
              ) : null}
            </label>
            <label className="block text-sm font-semibold text-brand-text">
              <span>ヒーロー画像URL</span>
              <input className={inputClass} value={hero} onChange={(e) => setHero(e.target.value)} placeholder="/images/hero.jpg" />
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-brand-text">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" className="h-4 w-4 rounded border-brand-border text-brand-primary focus:ring-brand-ring" checked={draft} onChange={(e) => setDraft(e.target.checked)} />
              <span>ドラフト（非公開）</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" className="h-4 w-4 rounded border-brand-border text-brand-primary focus:ring-brand-ring" checked={affiliate} onChange={(e) => setAffiliate(e.target.checked)} />
              <span>アフィリエイトリンクあり</span>
            </label>
          </div>

          <div>
            <div className="mb-2 flex flex-wrap gap-2 text-xs">
              <button type="button" className={smallButtonClass} onClick={() => insert('<Lead>この記事の要点（3〜5行）</Lead>')}>
                Lead
              </button>
              <button type="button" className={smallButtonClass} onClick={() => insert('<ProsCons pros={["良い点"]} cons={["悪い点"]} />')}>
                Pros/Cons
              </button>
              <button
                type="button"
                className={smallButtonClass}
                onClick={() => insert('<CTAButtons links={[{ label: "Amazon", href: "https://" }, { label: "楽天", href: "https://" }]} />')}
              >
                CTA Buttons
              </button>
              <button
                type="button"
                className={smallButtonClass}
                onClick={() => insert('<ComparisonTable columns={["項目","値"]} rows={[{"項目":"例","値":"123"}]} />')}
              >
                比較表
              </button>
            </div>
            <textarea className={textareaClass} value={body} onChange={(e) => setBody(e.target.value)} />
          </div>
        </section>

        <aside className="space-y-5">
          <div className={`${cardClass} space-y-4 p-4 md:p-5`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-brand-text">カテゴリ別テンプレート</div>
                <p className="mt-1 text-xs text-brand-muted">{template.description}</p>
              </div>
              <span className="rounded-full bg-brand-subtle px-3 py-1 text-xs font-semibold text-brand-muted">{categoryMeta.label}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {template.outline.map((item) => (
                <span key={item} className={chipClass}>{item}</span>
              ))}
            </div>
            <pre className="max-h-40 overflow-auto rounded-xl border border-brand-border/60 bg-brand-surfaceMuted px-3 py-2 text-[11px] text-brand-muted">
              <code>{templatePreview}</code>
            </pre>
            <div className="flex flex-wrap gap-2 text-xs">
              <button type="button" className={`${primaryButtonClass} px-4 py-1.5 text-xs`} onClick={() => applyTemplate('replace')}>
                本文をテンプレで置き換え
              </button>
              <button type="button" className={`${pillButtonClass} px-4 py-1.5 text-xs`} onClick={() => applyTemplate('append')}>
                末尾に追加
              </button>
              <button type="button" className={`${pillButtonClass} px-4 py-1.5 text-xs`} onClick={copyTemplateBody}>
                テンプレをコピー
              </button>
            </div>
          </div>

          <div className={`${cardClass} space-y-3 p-4 md:p-5`}>
            <div className="text-sm font-semibold text-brand-text">画像アップロード</div>
            <p className="text-xs text-brand-muted">public/images/ に保存します。完了後にリンクをコピーして記事へ貼り付けてください。</p>
            <div className="flex flex-wrap gap-2 text-xs">
              <input ref={fileInputRef} className="hidden" type="file" accept="image/png,image/jpeg,image/jpg,image/webp,image/gif" onChange={handleImageFileChange} />
              <button type="button" className={pillButtonClass} onClick={triggerImageUpload} disabled={uploadingImage}>
                {uploadingImage ? 'アップロード中…' : '画像を選択'}
              </button>
            </div>
            {lastImagePath ? (
              <div className="space-y-2 rounded-xl border border-brand-border/60 bg-brand-surfaceMuted p-3 text-xs">
                <div className="font-mono break-all text-brand-text">{lastImagePath}</div>
                {lastImageMarkdown ? (
                  <code className="block break-all rounded-lg bg-brand-surface px-3 py-2 text-[11px] text-brand-muted">{lastImageMarkdown}</code>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  <button type="button" className={smallButtonClass} onClick={() => copyImageUrl(lastImagePath)}>URLをコピー</button>
                  <button type="button" className={smallButtonClass} onClick={() => copyImageMarkdown(lastImagePath)}>Markdownをコピー</button>
                  <button type="button" className={smallButtonClass} onClick={() => insertImageSnippet(lastImagePath)}>本文に挿入</button>
                  <button type="button" className={smallButtonClass} onClick={() => setHeroFromImage(lastImagePath)}>Heroに設定</button>
                </div>
              </div>
            ) : null}
          </div>

          <div className={`${cardClass} space-y-3 p-4 md:p-5`}>
            <div className="text-sm font-semibold text-brand-text">出力</div>
            <div className="flex flex-wrap gap-2">
              <button className={pillButtonClass} onClick={copyToClipboard}>コピー</button>
              <button className={pillButtonClass} onClick={downloadFile}>.mdx をダウンロード</button>
              <button className={`${primaryButtonClass} ${saving ? 'cursor-not-allowed opacity-70' : ''}`} onClick={saveToGitHub} disabled={saving}>
                {saving ? '保存中…' : 'GitHubに保存'}
              </button>
            </div>
            <label className="block text-xs font-semibold text-brand-text">
              <span>コミットメッセージ（任意）</span>
              <input
                className={inputClass}
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                placeholder={`chore(content): add/update ${slug || '{slug}'}.mdx`}
              />
            </label>
            <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
              <label className="block font-semibold text-brand-text">
                <span>ブランチ（任意）</span>
                <input
                  className={inputClass}
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="feature/post-xxx（指定なしで main）"
                />
              </label>
              <label className="mt-6 inline-flex items-center gap-2 text-sm text-brand-text">
                <input type="checkbox" className="h-4 w-4 rounded border-brand-border text-brand-primary focus:ring-brand-ring" checked={createPr} onChange={(e) => setCreatePr(e.target.checked)} />
                <span>PR を自動作成</span>
              </label>
            </div>
            <p className="text-xs text-brand-muted">
              置き場所: <code className="font-mono">content/posts/{'{slug}'}.mdx</code>
            </p>
          </div>

          <div className={`${cardClass} p-4 text-xs text-brand-muted md:p-5`}>
            <div className="mb-1 text-sm font-semibold text-brand-text">運用メモ</div>
            <ul className="list-disc space-y-1 pl-5">
              <li>スラッグは英小文字＋ハイフン、日本語URLは使わない</li>
              <li>News の URL は公開年月から自動で <code>/news/yyyy-mm/slug</code></li>
              <li>ドラフトは一覧 / フィード / サイトマップから除外</li>
              <li>プレビューはローカル実行で確認（<code>npm run dev</code>）</li>
            </ul>
          </div>
        </aside>
      </div>

      <section className={`${cardClass} p-4 md:p-6`}>
        <div className="mb-3 text-sm font-semibold text-brand-text">生成されたMDX</div>
        <pre className="max-h-96 overflow-auto rounded-xl border border-brand-border/60 bg-brand-surfaceMuted p-4 text-xs text-brand-text">
          <code>{mdx}</code>
        </pre>
      </section>

      <section className={`${cardClass} p-4 md:p-6`}>
        <div className="mb-3 text-sm font-semibold text-brand-text">プレビュー</div>
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: previewHtml }} />
      </section>
    </div>
  )
}
