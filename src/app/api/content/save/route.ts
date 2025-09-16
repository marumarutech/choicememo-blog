import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@lib/auth'
import { Octokit } from '@octokit/rest'
import matter from 'gray-matter'

const OWNER = process.env.GITHUB_OWNER || ''
const REPO = process.env.GITHUB_REPO || ''
const BRANCH = process.env.GITHUB_BRANCH || 'main'

function isValidSlug(slug: string) {
  return /^[a-z0-9-]+$/.test(slug)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  // @ts-ignore
  const token: string | undefined = session?.accessToken
  if (!session || !token) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }
  if (!OWNER || !REPO) {
    return new Response(JSON.stringify({ error: 'Repo not configured' }), { status: 500 })
  }
  const { slug, content, message } = await req.json()
  if (!isValidSlug(slug) || typeof content !== 'string') {
    return new Response(JSON.stringify({ error: 'Invalid input' }), { status: 400 })
  }

  // Basic sanity check for frontmatter
  try { matter(content) } catch { return new Response(JSON.stringify({ error: 'Invalid frontmatter' }), { status: 400 }) }

  const octokit = new Octokit({ auth: token })
  const path = `content/posts/${slug}.mdx`
  const base64 = Buffer.from(content, 'utf-8').toString('base64')

  // Try to get current file sha
  let sha: string | undefined
  try {
    const res = await octokit.repos.getContent({ owner: OWNER, repo: REPO, path, ref: BRANCH })
    if (!Array.isArray(res.data) && 'sha' in res.data) {
      sha = res.data.sha
    }
  } catch (e) {
    // 404 → new file
  }

  const commitMessage = message || (sha ? `chore(content): update ${slug}.mdx` : `chore(content): add ${slug}.mdx`)

  await octokit.repos.createOrUpdateFileContents({
    owner: OWNER,
    repo: REPO,
    path,
    message: commitMessage,
    content: base64,
    branch: BRANCH,
    sha,
  })

  return new Response(JSON.stringify({ ok: true, path, branch: BRANCH }), { headers: { 'Content-Type': 'application/json' } })
}
