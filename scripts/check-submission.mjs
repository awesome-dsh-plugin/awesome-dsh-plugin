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

// Packages published only by the DSH project. A repository containing one of
// these under `dsh.bundle` is shipping a copy of the harness: measured on the
// live topic, five repositories carry `packages/bundle/base/package.json` naming
// `@deepseek-ai/dsh-base` verbatim, reached about 21 manifests into a ~250
// manifest tree, so this check finds it inside MAX_TREE_PKGS and accepts them.
// `fork` is false for all five, so they are source copies that neither an owner
// check nor a fork check detects.
const FIRST_PARTY_PACKAGES = new Set([
  '@deepseek-ai/dsh-base',
  '@deepseek-ai/dsh-web-app',
  '@deepseek-ai/dsh-headless',
])

// Entries submitted before the gate existed are judged by the old rules; only
// the manifest check applies to them. Set to when the rule change landed.
const GATE_EFFECTIVE_FROM = process.env.GATE_EFFECTIVE_FROM ?? '2026-08-16T00:00:00Z'

// How many entries one pull request may add.
//
// Reviewing a submission means reading the plugin's source and checking every
// claim in its description against it. That is per-entry work, and it does not
// get cheaper in bulk — a pull request carrying 127 of them is not one
// submission, it is 127 submissions wearing a coat, and the realistic outcome
// is that none of them get read properly.
//
// Three is measured, not picked: of the last 100 merged pull requests, 92
// added a single entry and 8 added two. None added three. So this rejects
// nothing anyone has actually been doing, while still leaving room for the one
// legitimate multi-entry shape — a monorepo whose subpackages are separate
// installable plugins.
//
// awesome-go allows exactly one item per pull request; awesome-python
// auto-closes any PR adding several, and separately auto-closes "multiple
// related projects from the same author, across one or several PRs". Three is
// the loose end of that range, not the strict one.
const MAX_ENTRIES_PER_PR = Number(process.env.MAX_ENTRIES_PER_PR ?? 3)
const BULK_RULE_FROM = process.env.BULK_RULE_FROM ?? '2026-08-20T00:00:00Z'

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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// GitHub answers 403 to two unrelated questions: "may this token see that
// repository" and "have you asked too fast". The second kind comes in two
// flavours — a primary quota (x-ratelimit-remaining: 0, resets on the hour)
// and a secondary/abuse limit from a burst, which sets retry-after and clears
// in about a minute. The gate treated all three identically and gave up on the
// first response, which is how eight submissions came to sit unverified on
// 2026-08-25 naming nine repositories that were public and reachable the whole
// time. Nothing was wrong with any of them; the gate simply asked during a
// squeeze and reported "nothing checked".
//
// Retry only what a retry can fix, and wait exactly as long as GitHub asks.
// A permission 403 carries neither header and is returned immediately, because
// asking again would just spend another request to be told the same thing.
const retryDelay = (r) => {
  const after = Number(r.headers.get('retry-after'))
  if (Number.isFinite(after) && after > 0) return after * 1000 + 1000
  if (r.headers.get('x-ratelimit-remaining') === '0') {
    const reset = Number(r.headers.get('x-ratelimit-reset'))
    if (Number.isFinite(reset)) return Math.max(0, reset * 1000 - Date.now()) + 1000
  }
  return null
}

// Two budgets, because an unbounded backoff is its own outage. A primary quota
// can be forty minutes from resetting, and a job holding a runner idle that
// long is worse than reporting the entry unverified and letting regate.yml
// re-run it later — which it already does, on a `neutral` conclusion.
const MAX_WAIT_PER_CALL_MS = 75_000
const MAX_WAIT_TOTAL_MS = 150_000
let waited = 0

async function api(pathname, { raw = false, attempt = 0 } = {}) {
  const r = await fetch(`https://api.github.com/${pathname}`, { headers: HEADERS, signal: AbortSignal.timeout(20000) })
  if (r.status === 404) return { status: 404 }
  if ((r.status === 403 || r.status === 429) && attempt < 3) {
    const wait = retryDelay(r)
    if (wait != null && wait <= MAX_WAIT_PER_CALL_MS && waited + wait <= MAX_WAIT_TOTAL_MS) {
      waited += wait
      console.log(`  ..  rate limited on ${pathname} — waiting ${Math.round(wait / 1000)}s (attempt ${attempt + 1}/3)`)
      await sleep(wait)
      return api(pathname, { raw, attempt: attempt + 1 })
    }
  }
  // Keep what GitHub said. Discarding the body is what left "HTTP 403" as the
  // only evidence in every summary, indistinguishable between a rate limit and
  // a repository this token genuinely cannot read.
  if (!r.ok) {
    const reason = await r
      .json()
      .then((b) => (typeof b?.message === 'string' ? b.message : null))
      .catch(() => null)
    return { status: r.status, reason }
  }
  return { status: 200, body: raw ? r : await r.json().catch(() => null), headers: r.headers }
}

// A monorepo submission lists one entry per subpackage, and every one of them
// resolves to the SAME repository — so the repository metadata and the commit
// count were fetched once per entry. #1608 lists 33 subpackages of
// kouyichi/dsh-plugins: 33 identical `repos/…` calls plus 33 identical
// `commits?per_page=1` calls, 64 of which were pure repetition.
//
// That budget is 1000/hour per repository and is shared with every other
// workflow. Exhausting it is what made the gate report entries it had never
// looked at on 2026-08-18, and it is why 23 open PRs are currently sitting on
// a "could not be fully checked" verdict. Deduplicating by repository costs
// nothing in accuracy — both values are per-repository, not per-entry.
//
// Promises are memoised rather than results, so entries checked concurrently
// within a batch share one in-flight request instead of racing to issue their
// own. The cache lives for the process, which is one gate run, so there is no
// staleness question.
const memo = new Map()
const once = (key, make) => {
  if (!memo.has(key)) memo.set(key, make())
  return memo.get(key)
}

function decompose(url) {
  const p = url.replace(/^https:\/\/github\.com\//, '').replace(/\/+$/, '')
  return {
    repo: p.split('/').slice(0, 2).join('/'),
    sub: p.includes('/tree/') ? p.split('/tree/')[1].replace(/^[^/]+\//, '') : null,
  }
}

// Strip a leading BOM before any caller parses this. A package.json written by
// a Windows editor begins U+FEFF; `JSON.parse` throws on it, `parsePkg` returns
// null, and the gate then tells a contributor their manifest has no
// `dsh.bundle` when it plainly does. npm installs such a package fine, so the
// rejection would have been ours alone.
const b64 = (s) => Buffer.from(s, 'base64').toString('utf8').replace(/^﻿/, '')

/** Parse a base64 package.json; null when it isn't valid JSON. */
function parsePkg(content) {
  try {
    const j = JSON.parse(b64(content))
    return j && typeof j === 'object' ? j : null
  } catch {
    return null
  }
}

/**
 * Walk a repository's manifests looking for a `dsh.bundle`.
 *
 * Memoised whole, not just its tree fetch: the walk does not depend on which
 * subpackage an entry points at, so for a monorepo listing N subpackages it
 * would otherwise run N times over the same up-to-40 manifests. That is the
 * gate's worst case by a wide margin — 33 entries x 40 manifests is 1,320
 * requests against a 1,000/hour repository budget, from a single pull request.
 */
const scanTree = (repo) => once(`scan:${repo}`, async () => {
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
  let vendored = null
  for (const p of pkgs) {
    const f = await api(`repos/${repo}/contents/${p}`)
    if (f.status !== 200 || !f.body?.content) continue
    const pkg = parsePkg(f.body.content)
    if (!pkg) continue
    const dsh = pkg.dsh ?? {}
    if (dsh.bundle) {
      // A repository that vendors DSH's own bundle packages satisfies this
      // check by containing the harness, not by offering a plugin. Recorded
      // rather than accepted, and only reported if no genuine bundle turns up
      // later in the tree — a plugin repository may legitimately keep a copy
      // of the harness for testing.
      if (FIRST_PARTY_PACKAGES.has(pkg.name)) {
        vendored ??= { at: p, name: pkg.name }
        continue
      }
      return { ok: true, at: p }
    }
    if (dsh.client) sawClient = true
  }
  if (vendored) {
    return {
      ok: false,
      why: `\`${vendored.at}\` is DSH's own \`${vendored.name}\`, so this repository contains the harness rather than a plugin for it`,
    }
  }
  if (sawClient) return { ok: false, why: 'declares only `dsh.client` — that alone is not installable' }
  // Same reasoning as a truncated tree: with more manifests than the cap, the
  // ones past it were never read, so absence here is not established.
  if (found.length > pkgs.length) {
    return { ok: null, why: `the repository has ${found.length} package.json files, more than the ${MAX_TREE_PKGS} this check reads` }
  }
  return { ok: false, why: `no \`dsh.bundle\` in any of ${pkgs.length} package.json file(s)` }
})

/**
 * Directories that contain a `package.json`, for suggesting a correction when
 * an entry's subpath does not exist. Cheap: one tree read, memoised per
 * repository, and only ever reached on the 404 path.
 */
const manifestDirs = (repo) => once(`dirs:${repo}`, async () => {
  const tree = await api(`repos/${repo}/git/trees/HEAD?recursive=1`)
  if (tree.status !== 200 || tree.body?.truncated) return []
  return (tree.body?.tree ?? [])
    .filter((t) => t.path?.endsWith('/package.json'))
    .map((t) => t.path.replace(/\/package\.json$/, ''))
})

async function hasBundle(repo, sub) {
  // The entry may point straight at a subpackage — that manifest is
  // authoritative, and it is per-entry rather than per-repository, so it stays
  // outside the memoised tree scan below.
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

  // A subpath that does not resolve is a different failure from a root-pointing
  // entry, and reporting it as one sends the author somewhere wrong. #1794
  // pointed at `packages/pet-bridge` — the real directory is
  // `packages/dsh-pet-bridge` — and the fall-through below told it the entry
  // "points at the repository root" and to switch to
  // `packages/dsh-appearance-gallery`, which is a different plugin. An author
  // who followed that advice would have listed the wrong one, and the gate
  // would have gone green on it.
  if (sub && direct.status === 404) {
    const dirs = await manifestDirs(repo)
    const leaf = sub.split('/').pop().toLowerCase()
    const near = dirs.filter((d) => {
      const l = d.split('/').pop().toLowerCase()
      return l.includes(leaf) || leaf.includes(l)
    })
    const hint = near.length
      ? ` Did you mean ${near.slice(0, 3).map((d) => `\`${d}\``).join(' or ')}?`
      : dirs.length
        ? ` Directories with a \`package.json\`: ${dirs.slice(0, 6).map((d) => `\`${d}\``).join(', ')}.`
        : ''
    return { ok: false, why: `the entry URL points at \`${sub}\`, which this repository does not have.${hint}` }
  }

  // The entry points at the repository root and the root does not declare a
  // bundle. The tree scan below may still find one in a subdirectory — and for
  // a long time that counted as a pass, which is the bug: the site builds the
  // install command from the entry's URL, so `dsh plugin add github:owner/repo`
  // targets the root, not wherever the manifest happens to live. The gate was
  // verifying something other than what it publishes.
  //
  // Found by auditing the 1,302 root-pointing entries on 2026-08-18: 48 of them
  // are listed and cannot be installed from the URL beside their name. #1701
  // was merged that morning and was one of them.
  //
  // The submission is not rejected outright — the plugin is usually real and
  // only the URL is wrong — so the failure names the exact replacement.
  const scanned = await scanTree(repo)
  if (scanned.ok === true && scanned.at) {
    const dir = scanned.at.replace(/\/package\.json$/, '')
    if (dir && dir !== 'package.json') {
      const branch = await once(`branch:${repo}`, async () => (await api(`repos/${repo}`)).body?.default_branch ?? 'main')
      return {
        ok: false,
        why: [
          `the entry points at the repository root, but the root \`package.json\` declares no \`dsh.bundle\` — `,
          `\`dsh plugin --profile web add github:${repo}\` would install nothing. The manifest is at \`${scanned.at}\`, `,
          'so point the entry at that subpackage instead:\n',
          `  url: https://github.com/${repo}/tree/${branch}/${dir}\n`,
          `  name: ${repo}#${dir.split('/').pop()}\n`,
          '\nand rename the file to match (`node scripts/generate-readme.mjs` will tell you the expected name).',
        ].join(''),
      }
    }
  }
  return scanned
}

// Goes through api() rather than fetching directly, so the commit-count bar
// gets the same rate-limit backoff as everything else. It used to have its own
// bare fetch, which meant a squeeze made a repository look like it had no
// commit history rather than like it had not been asked.
async function commitCount(repo) {
  const r = await api(`repos/${repo}/commits?per_page=1`)
  if (r.status !== 200) return null
  const link = r.headers.get('link') ?? ''
  const m = link.match(/[?&]page=(\d+)>;\s*rel="last"/)
  if (m) return Number(m[1])
  return Array.isArray(r.body) ? r.body.length : null
}

async function check(entry) {
  const { repo, sub } = decompose(entry.url)
  if (FIRST_PARTY_REPOS.has(repo.toLowerCase())) {
    return { problems: ['this is DeepSeek Harness itself, not a plugin for it'], unverified: [] }
  }
  const meta = await once(`meta:${repo}`, () => api(`repos/${repo}`))
  if (meta.status === 404) return { problems: [`repository not found: https://github.com/${repo}`], unverified: [] }
  if (meta.status !== 200) {
    // Nothing about this entry was established. Returning no problems read as
    // "passed" all the way out to the check-run summary, which is how
    // repositories under both bars came to sit green: a 403 during a quota
    // squeeze looked identical to a clean bill of health.
    const why = meta.reason ? ` — ${meta.reason}` : ''
    return { problems: [], unverified: [`nothing checked — repo lookup failed (HTTP ${meta.status})${why}`] }
  }
  const problems = []
  const unverified = []
  if (meta.body.archived) problems.push('repository is archived')

  const bundle = await hasBundle(repo, sub)
  if (bundle.ok === false) problems.push(bundle.why)
  else if (bundle.ok === null) unverified.push(`manifest not checked — ${bundle.why}`)

  if (gateApplies) {
    const ageDays = (Date.now() - new Date(meta.body.created_at).getTime()) / 86400000
    const commits = await once(`commits:${repo}`, () => commitCount(repo))
    if (ageDays < MIN_AGE_DAYS) {
      const hours = Math.ceil((MIN_AGE_DAYS - ageDays) * 24)
      problems.push(`repository is ${ageDays.toFixed(1)} days old (needs ${MIN_AGE_DAYS}) — resubmit in about ${hours}h, nothing is held against a resubmission`)
    }
    // A count we could not read is not a count that met the bar. Letting it
    // through is right — a busy API quota must not reject a good submission —
    // but the verdict has to say so, or "enough commits" is printed about a
    // repository nobody counted.
    if (commits === null) unverified.push('commit count could not be read')
    else if (commits < MIN_COMMITS) problems.push(`repository has ${commits} commit(s) (needs ${MIN_COMMITS})`)
  }
  return { problems, unverified }
}

function changedEntryFiles(base) {
  const out = execSync(`git diff --name-only --diff-filter=d ${base}...HEAD -- ${PLUGINS_DIR}`, { encoding: 'utf8' })
  return new Set(out.split('\n').map((s) => s.trim()).filter(Boolean))
}

// A submission whose YAML does not parse is a submission problem, and
// `readEntries` already explains it better than anything here could — it names
// the file, the reason, and for the common `": "` case prints the corrected
// line. Letting that throw escape kills the process before it writes its JSON
// result, so the workflow falls back to "exited without producing a result …
// this is a bug in the check, not in the submission" — telling the author to
// re-run and wait, while the one message that would have fixed their entry in
// ten seconds never reaches them. Catch it and report it as what it is.
let entries
try {
  entries = DIR ? readEntries(DIR) : readEntries()
} catch (e) {
  // In CI, DIR is a scratch directory the workflow extracted the PR's files
  // into, so the raw message would open with a runner temp path the author has
  // never seen. Show the path they recognise.
  const detail = String(e?.message ?? e).replaceAll(`${DIR ?? ''}/`, `${PLUGINS_DIR}/`)
  console.error(detail)
  if (JSON_OUT) {
    fs.writeFileSync(
      JSON_OUT,
      JSON.stringify(
        { ok: false, checked: 0, failures: [{ url: null, problems: [detail], unverified: [] }] },
        null,
        1,
      ),
    )
  }
  process.exit(1)
}
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

// Checked before anything is fetched: if the pull request is over the cap it
// is going back regardless of what the repositories look like, and probing
// 127 of them first would spend the API quota to reach the same answer.
// Existing submissions are judged by the rules that existed when they were
// opened, same as the age/commit gate.
const bulkRuleApplies = !PR_CREATED || new Date(PR_CREATED) >= new Date(BULK_RULE_FROM)
if (bulkRuleApplies && targets.length > MAX_ENTRIES_PER_PR) {
  const list = targets.map((e) => `- ${e.url}`).join('\n')
  const body =
    `This pull request adds ${targets.length} entries; the limit is ${MAX_ENTRIES_PER_PR}.\n\n` +
    `Reviewing a submission means reading the plugin's source and checking every claim in\n` +
    `its description against it. That work is per-entry and does not get cheaper in bulk, so\n` +
    `a batch this size would either sit unreviewed or get waved through — and waving it\n` +
    `through is how a curated list turns into a directory.\n\n` +
    `Split this into separate pull requests, at most ${MAX_ENTRIES_PER_PR} entries each. If these are\n` +
    `all yours, please also pick: send the ones you would keep if you could only keep a few,\n` +
    `rather than everything that works.\n\n${list}\n`
  console.error(body)
  if (JSON_OUT) {
    fs.writeFileSync(JSON_OUT, JSON.stringify({
      ok: false, checked: 0, tooMany: { count: targets.length, limit: MAX_ENTRIES_PER_PR },
      failures: [], incomplete: [],
    }, null, 1))
  }
  process.exit(1)
}

const failures = []
const incomplete = []
for (let i = 0; i < targets.length; i += CONCURRENCY) {
  const batch = targets.slice(i, i + CONCURRENCY)
  const results = await Promise.all(batch.map(async (e) => [e, await check(e).catch((err) => ({ problems: [], unverified: [`the check itself failed: ${err.message}`] }))]))
  for (const [e, { problems, unverified }] of results) {
    if (problems.length) failures.push({ url: e.url, file: e.file, problems })
    else if (unverified.length) {
      incomplete.push({ url: e.url, file: e.file, unverified })
      console.log(`  ??  ${e.url} — ${unverified.join('; ')}`)
    } else console.log(`  ok  ${e.url}`)
  }
}

// `incomplete` never blocks: a busy API quota must not reject a good
// submission. It is reported separately so the verdict can say which entries
// were let through unchecked rather than vouching for them.
if (JSON_OUT) fs.writeFileSync(JSON_OUT, JSON.stringify({ ok: !failures.length, checked: targets.length, failures, incomplete }, null, 1))

if (!failures.length) {
  if (incomplete.length) {
    const passed = targets.length - incomplete.length
    console.log(`${passed} entr${passed === 1 ? 'y' : 'ies'} pass; ${incomplete.length} could not be fully checked:`)
    for (const c of incomplete) console.log(`  ${c.url} — ${c.unverified.join('; ')}`)
  } else {
    console.log('all checked entries pass')
  }
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
