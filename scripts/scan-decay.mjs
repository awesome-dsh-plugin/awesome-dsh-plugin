// Weekly decay scan over every listed entry. Flags — never removes:
//
//   gone       repo 404
//   archived   repo archived
//   dormant    no push in DORMANT_MONTHS months
//   unbundled  dsh.bundle no longer found anywhere in the tree
//
// Findings go into one tracking issue (created or updated in place, matched
// by title) for a maintainer to review; removal stays a human decision
// because it is irreversible and a scan can be wrong — an outage, a rename,
// a rate-limit blip. Anything inconclusive (API errors) is skipped, not
// flagged: a decay report must only ever contain evidence, not doubt.
//
//   GITHUB_TOKEN=... node scripts/scan-decay.mjs            # scan + issue
//   GITHUB_TOKEN=... node scripts/scan-decay.mjs --dry-run  # scan, print only
import { readEntries } from './lib/entries.mjs'

const DORMANT_MONTHS = 6
const CONCURRENCY = 8
const ISSUE_TITLE = 'Decay scan: entries that need review'
const ISSUE_REPO = process.env.GITHUB_REPOSITORY ?? 'awesome-dsh-plugin/awesome-dsh-plugin'
const DRY = process.argv.includes('--dry-run')
const MAX_TREE_PKGS = 40

const TOKEN = process.env.GITHUB_TOKEN
if (!TOKEN) {
  console.log('no GITHUB_TOKEN — skipping decay scan')
  process.exit(0)
}
const HEADERS = { accept: 'application/vnd.github+json', authorization: `Bearer ${TOKEN}`, 'user-agent': 'awesome-dsh-plugin-decay-scan' }

async function api(pathname, opts = {}) {
  const r = await fetch(`https://api.github.com/${pathname}`, { headers: HEADERS, signal: AbortSignal.timeout(20000), ...opts })
  if (r.status === 404) return { status: 404 }
  if (!r.ok) return { status: r.status }
  return { status: 200, body: await r.json().catch(() => null) }
}

function decompose(url) {
  const p = url.replace(/^https:\/\/github\.com\//, '').replace(/\/+$/, '')
  return {
    repo: p.split('/').slice(0, 2).join('/'),
    sub: p.includes('/tree/') ? p.split('/tree/')[1].replace(/^[^/]+\//, '') : null,
  }
}

const b64 = (s) => Buffer.from(s, 'base64').toString('utf8')

/** true / false / null (inconclusive — never flag on null) */
async function hasBundle(repo, sub) {
  if (sub) {
    const f = await api(`repos/${repo}/contents/${sub}/package.json`)
    if (f.status === 404) return false
    if (f.status !== 200 || !f.body?.content) return null
    try {
      return Boolean(JSON.parse(b64(f.body.content)).dsh?.bundle)
    } catch {
      return false
    }
  }
  const tree = await api(`repos/${repo}/git/trees/HEAD?recursive=1`)
  if (tree.status !== 200) return null
  // A recursive tree is capped by the API (~100k entries / 7MB) and says so with
  // `truncated` while still returning 200. A partial listing, or one with more
  // package.json files than the cap reads, is doubt, not evidence — reading it as
  // "no bundle" would flag a healthy entry as unbundled. Inconclusive, not absent.
  if (tree.body?.truncated) return null
  const found = (tree.body?.tree ?? []).filter((t) => t.path?.endsWith('package.json')).map((t) => t.path)
  if (!found.length) return false
  const pkgs = found.slice(0, MAX_TREE_PKGS)
  for (const p of pkgs) {
    const f = await api(`repos/${repo}/contents/${p}`)
    if (f.status !== 200 || !f.body?.content) continue
    try {
      if (JSON.parse(b64(f.body.content)).dsh?.bundle) return true
    } catch {}
  }
  if (found.length > pkgs.length) return null
  return false
}

async function scan(entry) {
  const { repo, sub } = decompose(entry.url)
  const meta = await api(`repos/${repo}`)
  if (meta.status === 404) return { kind: 'gone', detail: 'repository returns 404' }
  if (meta.status !== 200) return null // inconclusive
  if (meta.body.archived) return { kind: 'archived', detail: `archived, last push ${meta.body.pushed_at?.slice(0, 10)}` }

  const pushed = new Date(meta.body.pushed_at)
  const monthsIdle = (Date.now() - pushed.getTime()) / (30.44 * 86400000)
  if (monthsIdle >= DORMANT_MONTHS) {
    return { kind: 'dormant', detail: `no push since ${meta.body.pushed_at.slice(0, 10)} (${monthsIdle.toFixed(1)} months)` }
  }

  const bundled = await hasBundle(repo, sub)
  if (bundled === false) return { kind: 'unbundled', detail: 'dsh.bundle no longer found in any package.json' }
  return null
}

const entries = readEntries()
console.log(`scanning ${entries.length} entries`)
const findings = []
let inconclusive = 0
for (let i = 0; i < entries.length; i += CONCURRENCY) {
  const batch = entries.slice(i, i + CONCURRENCY)
  const results = await Promise.all(
    batch.map(async (e) => {
      try {
        return [e, await scan(e)]
      } catch (err) {
        inconclusive++
        return [e, null]
      }
    }),
  )
  for (const [e, f] of results) if (f) findings.push({ ...f, url: e.url, file: e.file })
  if ((i + CONCURRENCY) % 200 < CONCURRENCY) console.log(`  ${Math.min(i + CONCURRENCY, entries.length)}/${entries.length}`)
}

const KINDS = [
  ['gone', 'Repository gone (404)'],
  ['archived', 'Archived'],
  ['unbundled', '`dsh.bundle` removed'],
  ['dormant', `Dormant (no push in ${DORMANT_MONTHS}+ months)`],
]
console.log(`\n${findings.length} finding(s), ${inconclusive} inconclusive (skipped)`)
for (const [kind, label] of KINDS) {
  const rows = findings.filter((f) => f.kind === kind)
  if (!rows.length) continue
  console.log(`\n## ${label} (${rows.length})`)
  for (const f of rows) console.log(`- ${f.url} — ${f.detail}`)
}

if (DRY) process.exit(0)

const stamp = new Date().toISOString().slice(0, 10)
const body = [
  `Weekly scan of every listed entry, ${stamp}. **Nothing has been removed** — each item below needs a human decision: remove the entry (delete its \`data/plugins/\` file and regenerate), or keep it and note why.`,
  '',
  ...KINDS.flatMap(([kind, label]) => {
    const rows = findings.filter((f) => f.kind === kind)
    if (!rows.length) return []
    return [`### ${label} (${rows.length})`, '', ...rows.map((f) => `- [ ] ${f.url} — ${f.detail} (\`${f.file}\`)`), '']
  }),
  findings.length === 0 ? '_Nothing to review this week._' : '',
  `<sub>${entries.length} entries scanned, ${inconclusive} inconclusive and skipped. Generated by \`scripts/scan-decay.mjs\`.</sub>`,
].join('\n')

const [owner, repo] = ISSUE_REPO.split('/')
const q = await api(`search/issues?q=${encodeURIComponent(`repo:${ISSUE_REPO} is:issue in:title "${ISSUE_TITLE}"`)}`)
const existing = q.status === 200 ? (q.body?.items ?? []).find((i) => i.title === ISSUE_TITLE && i.state === 'open') : null

if (existing) {
  const r = await api(`repos/${owner}/${repo}/issues/${existing.number}`, { method: 'PATCH', body: JSON.stringify({ body }) })
  console.log(r.status === 200 ? `\nupdated issue #${existing.number}` : `\nfailed to update issue #${existing.number} (HTTP ${r.status})`)
} else if (findings.length) {
  const r = await api(`repos/${owner}/${repo}/issues`, { method: 'POST', body: JSON.stringify({ title: ISSUE_TITLE, body, labels: ['list'] }) })
  console.log(r.status === 200 ? `\nopened issue #${r.body?.number}` : `\nfailed to open issue (HTTP ${r.status})`)
} else {
  console.log('\nno findings and no open tracking issue — nothing to do')
}
