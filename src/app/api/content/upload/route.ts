import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@lib/auth'
import { Octokit } from '@octokit/rest'

const OWNER = process.env.GITHUB_OWNER || ''
const REPO = process.env.GITHUB_REPO || ''
const BRANCH = process.env.GITHUB_BRANCH || 'main'

function validName(name: string) {
  return /^[a-z0-9-_]+\.(png|jpg|jpeg|webp|gif)$/i.test(name)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const token = session?.accessToken
  if (!session || !token) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  const { filename, dataUrl, branch: reqBranch } = await req.json()
  if (typeof filename !== 'string' || typeof dataUrl !== 'string' || !validName(filename)) {
    return new Response(JSON.stringify({ error: 'Invalid input' }), { status: 400 })
  }
  const m = dataUrl.match(/^data:(image\/(png|jpeg|jpg|webp|gif));base64,(.+)$/i)
  if (!m) return new Response(JSON.stringify({ error: 'Invalid data URL' }), { status: 400 })
  const base64 = m[3]
  const branch = (reqBranch && typeof reqBranch === 'string' && reqBranch.trim()) || BRANCH

  const octokit = new Octokit({ auth: token })
  const path = `public/images/${filename}`

  let sha: string | undefined
  try {
    const res = await octokit.repos.getContent({ owner: OWNER, repo: REPO, path, ref: branch })
    if (!Array.isArray(res.data) && 'sha' in res.data) sha = res.data.sha
  } catch {}

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
    message: sha ? `chore(image): update ${filename}` : `chore(image): add ${filename}`,
    content: base64,
    branch,
    sha,
  })

  return Response.json({ ok: true, path: `/${path.replace(/^public\//, '')}`, branch })
}
