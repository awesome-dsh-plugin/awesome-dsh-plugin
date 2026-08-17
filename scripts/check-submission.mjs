// Validate the repos behind the entries a PR adds or changes:
//
//   1. package.json declares `dsh.bundle` (anywhere in the repo — monorepos
//      put it in packages/, plugins/, extensions/, bundle/, npm/, ... so the
//      whole tree is enumerated rather than a guessed list of directories)
//   2. the repo is at least MIN_AGE_DAYS old and has >= MIN_COMMITS commits
//   3. the repo exists and isn't archived
//   4. the repo is not DSH itself (it declares `dsh.bundle` and would pass 1-3)
//
// Needs GITHUB_TOKEN: the git-tree enumeration and the commit count are API
// calls, and unauthenticated (60/hr per IP) is nowhere near enough. That is
// why this runs from pr-gate.yml via workflow_run rather than the fork-safe
// pull_request job.
//
//   node scripts/check-submission.mjs --base <sha> [--pr-created <iso>] [--json out.json]
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { PLUGINS_DIR, readEntries } from './lib/entries.mjs'

const MIN_AGE_DAYS = 1
const MIN_COMMITS = 10
const CONCURRENCY = 6
const MAX_TREE_PKGS = 40

// DSH itself declares `dsh.bundle`: packages/bundle/base/package.json is
// @deepseek-ai/dsh-base, and it is the 19th of 248 manifests in that tree, so
// the enumeration reaches it well inside MAX_TREE_PKGS and the age and commit
// thresholds are met by years. The harness would therefore pass the gate as a
// plugin for itself. Listing the product in a list of plugins for the product
// is the one wrong entry every visitor would recognise, so it is refused by
// identity rather than by contract.
const FIRST_PARTY_REPOS = new Set(['deepseek-ai/deepseek-harness'])

// Entries submitted before the gate existed are judged by the old rules; only
// the manifest check applies to them. Set to when the rule change landed.
const GATE_EFFECTIVE_FROM = process.env.GATE_EFFECTIVE_FROM ?? '2026-08-16T00:00:00Z'

const arg = (name) => {
  const i = process.argv.indexOf(name)
  return i === -1 ? null : process.argv[i + 1]
}
const BASE = arg('--base')
const PR_CREATED = arg('--pr-created')
const JSON_OUT = arg('--json')
const DIR = arg('--dir') // read entries from elsewhere (CI extracts the PR's files here)
const ONLY_LIST = arg('--only-list') // file of basenames to restrict the run to
const ALL = process.argv.includes('--all')

const TOKEN = process.env.GITHUB_TOKEN
if (!TOKEN) {
  console.error('GITHUB_TOKEN is required (tree enumeration + commit counts exceed the anonymous quota)')
  process.exit(1)
}
const HEADERS = { accept: 'application/vnd.github+json', authorization: `Bearer ${TOKEN}`, 'user-agent': 'awesome-dsh-plugin-ci' }

const gateApplies = !PR_CREATED || new Date(PR_CREATED) >= new Date(GATE_EFFECTIVE_FROM)

async function api(pathname, { raw = false } = {}) {
  const r = await fetch(`https://api.github.com/${pathname}`, { headers: HEADERS, signal: AbortSignal.timeout(20000) })
  if (r.status === 404) return { status: 404 }
  if (!r.ok) return { status: r.status }
  return { status: 200, body: raw ? r : await r.json().catch(() => null), headers: r.headers }
}

function decompose(url) {
  const p = url.replace(/^https:\/\/github\.com\//, '').replace(/\/+$/, '')
  return {
    repo: p.split('/').slice(0, 2).join('/'),
    sub: p.includes('/tree/') ? p.split('/tree/')[1].replace(/^[^/]+\//, '') : null,
  }
}

const b64 = (s) => Buffer.from(s, 'base64').toString('utf8')

/** Parse a base64 package.json; null when it isn't valid JSON. */
function parsePkg(content) {
  try {
    const j = JSON.parse(b64(content))
    return j && typeof j === 'object' ? j : null
  } catch {
    return null
  }
}

async function hasBundle(repo, sub) {
  // The entry may point straight at a subpackage — that manifest is authoritative.
  const direct = await api(`repos/${repo}/contents/${sub ? `${sub}/` : ''}package.json`)
  if (direct.status === 200 && direct.body?.content) {
    const pkg = parsePkg(direct.body.content)
    // An unparseable manifest must not fall through to "looks fine" — it is
    // exactly as uninstallable as a missing one.
    if (!pkg) return { ok: false, why: `\`${sub ? `${sub}/` : ''}package.json\` is not valid JSON` }
    const dsh = pkg.dsh ?? {}
    if (dsh.bundle) return { ok: true }
    if (sub) return { ok: false, why: dsh.client ? 'declares only `dsh.client` — that alone is not installable' : `\`${sub}/package.json\` has no \`dsh.bundle\`` }
  }

  const tree = await api(`repos/${repo}/git/trees/HEAD?recursive=1`)
  if (tree.status !== 200) return { ok: null, why: `could not read the repository tree (HTTP ${tree.status})` }
  // A recursive tree is capped by the API (~100k entries / 7MB) and the
  // response says so with `truncated`, while still being a 200. Reading a
  // partial listing as the whole repository turns "we could not see all of it"
  // into "there is no manifest", which is a definite rejection drawn from an
  // admittedly incomplete answer. Unknown, not absent — same as a failed fetch.
  if (tree.body?.truncated) {
    return { ok: null, why: 'the repository tree is too large for the API to return in full' }
  }
  const found = (tree.body?.tree ?? []).filter((t) => t.path?.endsWith('package.json')).map((t) => t.path)
  if (!found.length) return { ok: false, why: 'no `package.json` anywhere in the repository' }
  const pkgs = found.slice(0, MAX_TREE_PKGS)

  let sawClient = false
  for (const p of pkgs) {
    const f = await api(`repos/${repo}/contents/${p}`)
    if (f.status !== 200 || !f.body?.content) continue
    const pkg = parsePkg(f.body.content)
    if (!pkg) continue
    const dsh = pkg.dsh ?? {}
    if (dsh.bundle) return { ok: true, at: p }
    if (dsh.client) sawClient = true
  }
  if (sawClient) return { ok: false, why: 'declares only `dsh.client` — that alone is not installable' }
  // Same reasoning as a truncated tree: with more manifests than the cap, the
  // ones past it were never read, so absence here is not established.
  if (found.length > pkgs.length) {
    return { ok: null, why: `the repository has ${found.length} package.json files, more than the ${MAX_TREE_PKGS} this check reads` }
  }
  return { ok: false, why: `no \`dsh.bundle\` in any of ${pkgs.length} package.json file(s)` }
}

async function commitCount(repo) {
  const r = await fetch(`https://api.github.com/repos/${repo}/commits?per_page=1`, { headers: HEADERS, signal: AbortSignal.timeout(20000) })
  if (!r.ok) return null
  const link = r.headers.get('link') ?? ''
  const m = link.match(/[?&]page=(\d+)>;\s*rel="last"/)
  if (m) return Number(m[1])
  const body = await r.json().catch(() => [])
  return Array.isArray(body) ? body.length : null
}

async function check(entry) {
  const { repo, sub } = decompose(entry.url)
  if (FIRST_PARTY_REPOS.has(repo.toLowerCase())) {
    return ['this is DeepSeek Harness itself, not a plugin for it']
  }
  const meta = await api(`repos/${repo}`)
  if (meta.status === 404) return [`repository not found: https://github.com/${repo}`]
  if (meta.status !== 200) {
    console.error(`  ${entry.url}: repo lookup failed (HTTP ${meta.status}) — skipping`)
    return []
  }
  const problems = []
  if (meta.body.archived) problems.push('repository is archived')

  const bundle = await hasBundle(repo, sub)
  if (bundle.ok === false) problems.push(bundle.why)
  else if (bundle.ok === null) console.error(`  ${entry.url}: ${bundle.why} — manifest check skipped`)

  if (gateApplies) {
    const ageDays = (Date.now() - new Date(meta.body.created_at).getTime()) / 86400000
    const commits = await commitCount(repo)
    if (ageDays < MIN_AGE_DAYS) {
      const hours = Math.ceil((MIN_AGE_DAYS - ageDays) * 24)
      problems.push(`repository is ${ageDays.toFixed(1)} days old (needs ${MIN_AGE_DAYS}) — resubmit in about ${hours}h, nothing is held against a resubmission`)
    }
    if (commits !== null && commits < MIN_COMMITS) {
      problems.push(`repository has ${commits} commit(s) (needs ${MIN_COMMITS})`)
    }
  }
  return problems
}

function changedEntryFiles(base) {
  const out = execSync(`git diff --name-only --diff-filter=d ${base}...HEAD -- ${PLUGINS_DIR}`, { encoding: 'utf8' })
  return new Set(out.split('\n').map((s) => s.trim()).filter(Boolean))
}

const entries = DIR ? readEntries(DIR) : readEntries()
let targets = entries
if (ONLY_LIST) {
  const want = new Set(
    fs.readFileSync(ONLY_LIST, 'utf8').split('\n').map((s) => s.trim()).filter(Boolean),
  )
  targets = entries.filter((e) => want.has(path.basename(e.file)))
} else if (!ALL && BASE) {
  try {
    const changed = changedEntryFiles(BASE)
    targets = entries.filter((e) => changed.has(e.file))
  } catch (e) {
    console.error(`could not diff against ${BASE} (${e.message}) — checking every entry`)
  }
}

// `checked` is reported separately from `ok` on purpose. Writing ok:true here
// once let the workflow announce "repo old enough, enough commits" for a repo
// three hours old, because nothing had been examined at all — a gate that
// cannot tell "passed" from "never ran" is worse than no gate, since it is
// trusted.
if (!targets.length) {
  console.log('no entry files added or changed — nothing to verify')
  if (JSON_OUT) fs.writeFileSync(JSON_OUT, JSON.stringify({ ok: true, checked: 0, failures: [] }, null, 1))
  process.exit(0)
}
console.log(`checking ${targets.length} entr${targets.length === 1 ? 'y' : 'ies'}` + (gateApplies ? '' : ' (age/commit gate not applied — PR predates the rule)'))

const failures = []
for (let i = 0; i < targets.length; i += CONCURRENCY) {
  const batch = targets.slice(i, i + CONCURRENCY)
  const results = await Promise.all(batch.map(async (e) => [e, await check(e).catch((err) => { console.error(`  ${e.url}: ${err.message} — skipping`); return [] })]))
  for (const [e, problems] of results) {
    if (problems.length) failures.push({ url: e.url, file: e.file, problems })
    else console.log(`  ok  ${e.url}`)
  }
}

if (JSON_OUT) fs.writeFileSync(JSON_OUT, JSON.stringify({ ok: !failures.length, checked: targets.length, failures }, null, 1))

if (!failures.length) {
  console.log('all checked entries pass')
  process.exit(0)
}
for (const f of failures) {
  for (const p of f.problems) console.error(`::error file=${f.file}::${f.url} — ${p}`)
}
console.error(`
${failures.length} entr${failures.length === 1 ? 'y' : 'ies'} did not pass. See contributing.md.

A bundle manifest looks like:

  {
    "dsh": {
      "bundle": { "patch": "./cordis.patch.yml" },   // <- required
      "client": { "platform": "web" }                // only if you ship browser UI
    }
  }
`)
process.exit(1)
