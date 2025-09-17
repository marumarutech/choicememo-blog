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
  const token = session?.accessToken
  if (!session || !token) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }
  if (!OWNER || !REPO) {
    return new Response(JSON.stringify({ error: 'Repo not configured' }), { status: 500 })
  }
  const { slug, content, message, branch: reqBranch, createPr } = await req.json()
  if (!isValidSlug(slug) || typeof content !== 'string') {
    return new Response(JSON.stringify({ error: 'Invalid input' }), { status: 400 })
  }

  // Basic sanity check for frontmatter
  try { matter(content) } catch { return new Response(JSON.stringify({ error: 'Invalid frontmatter' }), { status: 400 }) }

  const octokit = new Octokit({ auth: token })
  const path = `content/posts/${slug}.mdx`
  const base64 = Buffer.from(content, 'utf-8').toString('base64')
  const branch = (reqBranch && typeof reqBranch === 'string' && reqBranch.trim()) || BRANCH

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

  // Ensure target branch exists
  if (branch !== BRANCH) {
    try {
      await octokit.git.getRef({ owner: OWNER, repo: REPO, ref: `heads/${branch}` })
    } catch {
      const base = await octokit.git.getRef({ owner: OWNER, repo: REPO, ref: `heads/${BRANCH}` })
      await octokit.git.createRef({ owner: OWNER, repo: REPO, ref: `refs/heads/${branch}`, sha: base.data.object.sha })
    }
  }

  await octokit.repos.createOrUpdateFileContents({
    owner: OWNER,
    repo: REPO,
    path,
    message: commitMessage,
    content: base64,
    branch,
    sha,
  })

  let prUrl: string | undefined
  if (createPr && branch !== BRANCH) {
    const pr = await octokit.pulls.create({ owner: OWNER, repo: REPO, base: BRANCH, head: branch, title: commitMessage })
    prUrl = pr.data.html_url
  }

  return new Response(JSON.stringify({ ok: true, path, branch, prUrl }), { headers: { 'Content-Type': 'application/json' } })
}
