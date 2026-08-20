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
//   GITHUB_TOKEN=... node scripts/scan-decay.mjs             # scan + issue
//   GITHUB_TOKEN=... node scripts/scan-decay.mjs --dry-run   # scan, print only
//   GITHUB_TOKEN=... node scripts/scan-decay.mjs --limit=50  # first N entries
//
// Budget: repository metadata goes through GraphQL in batches of fifty (one
// point each), and manifests are read from raw.githubusercontent.com, which
// does not count against the quota. A full pass costs on the order of a
// hundred REST calls rather than the ~4,900 it used to — which matters because
// the Actions GITHUB_TOKEN this runs under in CI gets 1,000 per hour.
import { readEntries } from './lib/entries.mjs'

const DORMANT_MONTHS = 6
// A pass over the whole list is 4-5 calls per entry. At eight in flight that is
// a burst GitHub's secondary limiter answers with 403s — which, before the
// retry below existed, silently became "checked, healthy" for every entry
// caught in it. Four keeps a 1,700-entry pass under the limiter while still
// finishing in a few minutes.
const CONCURRENCY = 4
// GraphQL charges one point for a query however many repositories it names, so
// the batch size is bounded by response size and readability, not by cost.
const META_BATCH = 50
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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// A full pass is several thousand calls, which trips GitHub's *secondary* rate
// limit — a 403 that arrives while `rate_limit` still reports the core quota
// untouched, so there is nothing to check before firing. Left unhandled it
// degrades the whole scan: every 403 became an unchecked entry that the report
// then presented as healthy. Back off and retry before giving up on an entry.
async function api(pathname, opts = {}) {
  for (let attempt = 0; ; attempt++) {
    const r = await fetch(`https://api.github.com/${pathname}`, { headers: HEADERS, signal: AbortSignal.timeout(20000), ...opts })
    if (r.status === 404) return { status: 404 }
    if (r.ok) return { status: 200, body: await r.json().catch(() => null) }
    const retryable = r.status === 403 || r.status === 429 || r.status >= 500
    if (!retryable || attempt >= 5) return { status: r.status }
    const after = Number(r.headers.get('retry-after'))
    await sleep(Number.isFinite(after) && after > 0 ? after * 1000 : 5000 * 2 ** attempt)
  }
}

async function graphql(query) {
  for (let attempt = 0; ; attempt++) {
    const r = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: { ...HEADERS, 'content-type': 'application/json' },
      body: JSON.stringify({ query }),
      signal: AbortSignal.timeout(30000),
    })
    if (r.ok) return await r.json().catch(() => null)
    const retryable = r.status === 403 || r.status === 429 || r.status >= 500
    if (!retryable || attempt >= 5) return null
    const after = Number(r.headers.get('retry-after'))
    await sleep(Number.isFinite(after) && after > 0 ? after * 1000 : 5000 * 2 ** attempt)
  }
}

/**
 * Repository metadata for every listed repo, in batches.
 *
 * One REST call per repository was the other half of this scan's cost. GraphQL
 * takes fifty per request and charges one point for the lot, so the whole list
 * costs ~34 requests instead of ~1,650.
 *
 * Map values: `{gone}`, `{archived, pushedAt, branch}`, or null for
 * inconclusive.
 */
async function fetchMeta(repos) {
  const out = new Map()
  for (let i = 0; i < repos.length; i += META_BATCH) {
    const chunk = repos.slice(i, i + META_BATCH)
    const query = `query {\n${chunk
      .map((full, j) => {
        const [owner, name] = full.split('/')
        return `  r${j}: repository(owner: ${JSON.stringify(owner)}, name: ${JSON.stringify(name)}) { isArchived pushedAt defaultBranchRef { name } }`
      })
      .join('\n')}\n}`
    const res = await graphql(query)
    const notFound = new Set()
    for (const e of res?.errors ?? []) {
      if (e?.type === 'NOT_FOUND' && Array.isArray(e.path)) notFound.add(e.path[0])
    }
    for (let j = 0; j < chunk.length; j++) {
      const node = res?.data?.[`r${j}`]
      if (node) {
        out.set(chunk[j], {
          archived: node.isArchived,
          pushedAt: node.pushedAt,
          branch: node.defaultBranchRef?.name ?? 'HEAD',
        })
      } else if (notFound.has(`r${j}`)) {
        // Not resolvable by GraphQL is not the same as gone. REST follows a
        // rename with a 301 and GraphQL is not documented to; flagging a
        // renamed repository as a dead one would propose deleting a healthy
        // entry. Confirm the handful of these against REST before believing it.
        const meta = await api(`repos/${chunk[j]}`)
        if (meta.status === 404) out.set(chunk[j], { gone: true })
        else if (meta.status === 200) {
          out.set(chunk[j], {
            archived: meta.body.archived,
            pushedAt: meta.body.pushed_at,
            branch: meta.body.default_branch ?? 'HEAD',
          })
        } else out.set(chunk[j], null)
      } else {
        out.set(chunk[j], null)
      }
    }
    console.log(`  metadata ${Math.min(i + META_BATCH, repos.length)}/${repos.length}`)
  }
  return out
}

function decompose(url) {
  const p = url.replace(/^https:\/\/github\.com\//, '').replace(/\/+$/, '')
  return {
    repo: p.split('/').slice(0, 2).join('/'),
    sub: p.includes('/tree/') ? p.split('/tree/')[1].replace(/^[^/]+\//, '') : null,
  }
}

// raw.githubusercontent.com serves the same file the contents API does and
// **does not count against the API quota at all** — the pattern probe-npm.mjs
// has used since it was written. Reading manifests through the contents API
// was what made this scan cost ~4,900 calls a pass: more than the 5,000/hour a
// user token gets, and five times the 1,000/hour the Actions GITHUB_TOKEN gets
// per repository. So the weekly run could never reach the end of the list.
//
// Returns the parsed manifest, `false` for a definite 404, or null when the
// fetch itself failed and nothing can be concluded.
async function manifest(repo, branch, path) {
  for (let attempt = 0; ; attempt++) {
    let r
    try {
      r = await fetch(`https://raw.githubusercontent.com/${repo}/${branch}/${path}`, {
        headers: { 'user-agent': 'awesome-dsh-plugin-decay-scan' },
        signal: AbortSignal.timeout(20000),
      })
    } catch {
      if (attempt >= 3) return null
      await sleep(2000 * 2 ** attempt)
      continue
    }
    if (r.status === 404) return false
    if (!r.ok) {
      if (attempt >= 3) return null
      await sleep(2000 * 2 ** attempt)
      continue
    }
    const text = await r.text().catch(() => null)
    if (text === null) return null
    try {
      // Strip the BOM before parsing. A package.json saved by a Windows editor
      // starts U+FEFF, `JSON.parse` throws on it, and this used to be read as
      // "no dsh.bundle" — three healthy entries (dsh-mcpguard,
      // dsh-koboldcpp-hands, dsh-web-launcher) were flagged for removal over a
      // byte order mark npm does not care about.
      return JSON.parse(text.replace(/^﻿/, ''))
    } catch {
      // A manifest that won't parse is a broken repository, not a manifest
      // whose `dsh.bundle` was removed. This flag ends in a removal proposal,
      // so it has to carry evidence of the thing it claims.
      return null
    }
  }
}

/** true / false / null (inconclusive — never flag on null) */
async function hasBundle(repo, branch, sub) {
  // An entry pointing at a subpackage is a claim about that subpackage. Its
  // siblings' manifests say nothing about it: dsh-desktop-base and
  // dsh-skill-explorer both sit in repositories with dozens of bundled
  // packages, and neither is one of them.
  if (sub) {
    const m = await manifest(repo, branch, `${sub}/package.json`)
    if (m === false) return false
    if (m === null) return null
    return Boolean(m?.dsh?.bundle)
  }

  // The overwhelmingly common shape is one plugin, one manifest, at the root —
  // and that costs zero API calls to settle.
  const root = await manifest(repo, branch, 'package.json')
  if (root === null) return null
  if (root && root.dsh?.bundle) return true

  // Only a repository whose root manifest does not carry the bundle is worth a
  // tree call to find where it went.
  const tree = await api(`repos/${repo}/git/trees/${branch}?recursive=1`)
  if (tree.status !== 200) return null
  // A recursive tree is capped by the API (~100k entries / 7MB) and says so with
  // `truncated` while still returning 200. A partial listing, or one with more
  // package.json files than the cap reads, is doubt, not evidence — reading it as
  // "no bundle" would flag a healthy entry as unbundled. Inconclusive, not absent.
  if (tree.body?.truncated) return null
  const found = (tree.body?.tree ?? [])
    .filter((t) => t.path?.endsWith('package.json') && t.path !== 'package.json')
    .map((t) => t.path)
  if (!found.length) return false
  const pkgs = found.slice(0, MAX_TREE_PKGS)
  // A manifest we could not read is not a manifest without a bundle. A
  // transient failure or unparseable JSON used to fall through to "no bundle",
  // so a scan that failed to look was indistinguishable from one that looked
  // and found nothing — and the difference is a proposal to delist someone.
  let unreadable = 0
  for (const p of pkgs) {
    const m = await manifest(repo, branch, p)
    if (m === null) { unreadable++; continue }
    if (m && m.dsh?.bundle) return true
  }
  if (found.length > pkgs.length || unreadable) return null
  return false
}

// Returned when the scan could not reach a verdict. Distinct from `null`,
// which means "checked, and healthy". Conflating the two is how a scan that
// was rate-limited on 1,000 entries still printed "0 inconclusive".
const INCONCLUSIVE = { kind: 'inconclusive' }

async function scan(entry, meta) {
  const { repo, sub } = decompose(entry.url)
  const m = meta.get(repo)
  if (!m) return INCONCLUSIVE
  if (m.gone) return { kind: 'gone', detail: 'repository returns 404' }
  if (m.archived) return { kind: 'archived', detail: `archived, last push ${m.pushedAt?.slice(0, 10)}` }

  const pushed = new Date(m.pushedAt)
  const monthsIdle = (Date.now() - pushed.getTime()) / (30.44 * 86400000)
  if (monthsIdle >= DORMANT_MONTHS) {
    return { kind: 'dormant', detail: `no push since ${m.pushedAt.slice(0, 10)} (${monthsIdle.toFixed(1)} months)` }
  }

  const bundled = await hasBundle(repo, m.branch, sub)
  if (bundled === null) return INCONCLUSIVE
  if (bundled === false) return { kind: 'unbundled', detail: 'dsh.bundle no longer found in any package.json' }
  return null
}

const LIMIT = Number(process.argv.find((a) => a.startsWith('--limit='))?.split('=')[1]) || 0
const entries = LIMIT ? readEntries().slice(0, LIMIT) : readEntries()
console.log(`scanning ${entries.length} entries`)

const repos = [...new Set(entries.map((e) => decompose(e.url).repo))]
console.log(`fetching metadata for ${repos.length} repositories`)
const meta = await fetchMeta(repos)

const findings = []
let inconclusive = 0
// Naming what was not checked is the difference between "the list is clean"
// and "the part I could see is clean". A bare count leaves the reader unable
// to go look at the rest themselves.
const unchecked = []
for (let i = 0; i < entries.length; i += CONCURRENCY) {
  const batch = entries.slice(i, i + CONCURRENCY)
  const results = await Promise.all(
    batch.map(async (e) => {
      try {
        return [e, await scan(e, meta)]
      } catch (err) {
        return [e, INCONCLUSIVE]
      }
    }),
  )
  for (const [e, f] of results) {
    if (f === INCONCLUSIVE) { inconclusive++; unchecked.push(e.url); continue }
    if (f) findings.push({ ...f, url: e.url, file: e.file })
  }
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
if (unchecked.length) {
  console.log(`\n## Not checked (${unchecked.length}) — no verdict reached, re-run to cover these`)
  for (const u of unchecked) console.log(`- ${u}`)
}

// A scan that could not look at a meaningful share of the list has not
// produced a decay report; it has produced a shorter one. Publishing it as
// though it were complete is the failure this whole file is supposed to avoid,
// since the reader's next action is deleting entries. Say so and stop.
const INCONCLUSIVE_LIMIT = Math.ceil(entries.length * 0.05)
if (inconclusive > INCONCLUSIVE_LIMIT) {
  console.error(
    `\nERROR: ${inconclusive} of ${entries.length} entries could not be checked ` +
      `(limit ${INCONCLUSIVE_LIMIT}). The findings above are incomplete — not publishing. ` +
      `This is usually GitHub's secondary rate limit; re-run in a few minutes.`,
  )
  process.exit(1)
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
  ...(unchecked.length
    ? [
        `<details><summary>Not checked (${unchecked.length}) — no verdict reached</summary>`,
        '',
        ...unchecked.map((u) => `- ${u}`),
        '',
        '</details>',
        '',
      ]
    : []),
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
