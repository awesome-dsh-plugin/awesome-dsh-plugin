#!/usr/bin/env node
/**
 * Refresh per-repo update notes into data/updates.json, published by
 * build-site.mjs as docs/updates.json for market-side consumers (#dsh-market
 * issue 294): what changed between a user's installed version and HEAD.
 *
 * Two facts shape this file:
 *
 * - The consumers are end users' markets, thousands of them, each holding an
 *   installed commit sha that exists nowhere but on that machine. The catalog
 *   cannot know where any user's installed version sits, so it publishes the
 *   raw ingredients — the latest release's notes and a short tail of recent
 *   commits — once a day for everyone, instead of every consumer asking
 *   GitHub itself and burning through the anonymous 60-per-hour quota.
 *
 * - Anonymous REST access behind common proxies is already unreliable (the
 *   same budget is shared per egress IP), which is why this probe runs here,
 *   against one CI token, rather than in the market.
 *
 * Per repository: `/releases/latest` (a 404 is a fact — most plugins ship no
 * releases — not a failure) and `/commits?per_page=5` (the tail the market
 * slices at each user's installed sha; 8 covers the common case of an update
 * being a handful of commits, and anything wider reads as "recent commits"
 * rather than pretending to be an exact interval).
 *
 * Requires GITHUB_TOKEN (CI provides one; locally: GITHUB_TOKEN=$(gh auth token)).
 * Without a token the script exits 0 without touching the file. A failed repo
 * keeps its old entry.
 *
 * Usage: GITHUB_TOKEN=... node scripts/probe-updates.mjs
 */
import fs from 'node:fs'
import LOCALES from '../site/locales.mjs'

const OUT_FILE = 'data/updates.json'
// Release bodies are markdown written by authors for humans reading GitHub;
// a dialog-sized preview does not need more than this.
const MAX_BODY_BYTES = 4 * 1024
const COMMIT_TAIL = 5
const MAX_MESSAGE_CHARS = 200
// Update notes go stale fast by nature — a release published this morning is
// exactly what a user wants to read before clicking update — so unlike the
// readmes (7 days) this refreshes daily, matching probe-stars' cadence.
const RECHECK_DAYS = Number(process.env.PROBE_RECHECK_DAYS ?? 1)
const PROBE_ALL = process.env.PROBE_ALL === '1'
const CONCURRENCY = Number(process.env.PROBE_CONCURRENCY ?? (PROBE_ALL ? 4 : 8))

const token = process.env.GITHUB_TOKEN
if (!token) {
  console.log('no GITHUB_TOKEN — keeping committed update-notes data as-is')
  process.exit(0)
}

const map = fs.existsSync(OUT_FILE) ? JSON.parse(fs.readFileSync(OUT_FILE, 'utf8')) : {}
const readme = fs.readFileSync(LOCALES[0].readme, 'utf8')
const urls = [...readme.matchAll(/^- \[.+?\]\((https:\/\/github\.com\/[^)]+)\) [—-] /gm)].map((m) => m[1])
const today = new Date().toISOString().slice(0, 10)

/** Thrown for a status the caller may want to tell apart (404 vs rate limit). */
class HttpError extends Error {
  constructor(status) {
    super(`HTTP ${status}`)
    this.status = status
  }
}

async function gh(path) {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${token}`,
      'user-agent': 'awesome-dsh-plugin-updates-probe',
    },
    signal: AbortSignal.timeout(15000),
  })
  if (res.status === 403 || res.status === 429) {
    // Secondary limits answer with retry-after; primary exhaustion sets
    // x-ratelimit-remaining: 0 and a reset timestamp. Sleeping is the whole
    // remedy — retrying immediately is what earns a longer block.
    const after = Number(res.headers.get('retry-after'))
    const reset = Number(res.headers.get('x-ratelimit-reset'))
    const waitMs = Number.isFinite(after) && after > 0
      ? after * 1000
      : (res.headers.get('x-ratelimit-remaining') === '0' && Number.isFinite(reset)
        ? Math.max(0, reset * 1000 - Date.now()) + 1000
        : 0)
    if (waitMs > 0 && waitMs <= 120000) {
      await new Promise((r) => setTimeout(r, waitMs))
      return gh(path)
    }
  }
  if (!res.ok) throw new HttpError(res.status)
  return res.json()
}

async function probe(url) {
  // monorepo subdir entries inherit the parent repo's history, like stars do
  const repoPath = url.replace('https://github.com/', '').replace(/\/$/, '').split('/').slice(0, 2).join('/')
  try {
    let release = null
    try {
      const r = await gh(`/repos/${repoPath}/releases/latest`)
      let body = typeof r.body === 'string' ? r.body : ''
      if (body.length > MAX_BODY_BYTES) body = body.slice(0, MAX_BODY_BYTES) + '\n\n…'
      if (r.tag_name || body) {
        release = {
          tag: r.tag_name ?? null,
          name: r.name ?? null,
          publishedAt: r.published_at ?? null,
          url: r.html_url ?? null,
          body,
        }
      }
    } catch (e) {
      // No releases is the ordinary case for small plugins, not a failure.
      if (!(e instanceof HttpError && e.status === 404)) throw e
    }

    const log = await gh(`/repos/${repoPath}/commits?per_page=${COMMIT_TAIL}`)
    const commits = (Array.isArray(log) ? log : []).map((c) => ({
      sha: c.sha ?? null,
      message: (c.commit?.message ?? '').split('\n')[0].slice(0, MAX_MESSAGE_CHARS),
      date: c.commit?.author?.date ?? null,
    })).filter((c) => c.sha !== null)

    if (!release && !commits.length) throw new Error('no update data')
    return { release, commits, checkedAt: today }
  } catch {
    return null // keep the previous entry
  }
}

const fresh = (entry) =>
  !PROBE_ALL
  && entry !== undefined
  && entry.checkedAt
  && (Date.now() - new Date(entry.checkedAt).getTime()) / 86400000 <= RECHECK_DAYS

const pending = urls.filter((url) => !fresh(map[url]))
console.log(`${urls.length} listed, ${pending.length} to probe${PROBE_ALL ? ' (PROBE_ALL)' : ''}`)

const failed = []
let done = 0
let ok = 0
for (let i = 0; i < pending.length; i += CONCURRENCY) {
  const batch = pending.slice(i, i + CONCURRENCY)
  const results = await Promise.all(batch.map(async (url) => [url, await probe(url)]))
  for (const [url, result] of results) {
    if (result === null) failed.push(url)
    else { map[url] = result; ok++ }
  }
  done += batch.length
  if (done % 50 === 0 || done >= pending.length) console.log(`updates ${done}/${pending.length}`)
}

// Same second-pass reasoning as probe-readmes.mjs: a burst failure must not be
// indistinguishable from "this repo has nothing", because entries added since
// the last run have no previous data to fall back on.
if (failed.length) {
  console.log(`${failed.length} repo(s) failed the first pass — retrying serially`)
  await new Promise((r) => setTimeout(r, 20000))
  const stillFailed = []
  for (const url of failed) {
    const result = await probe(url)
    if (result === null) stillFailed.push(url)
    else { map[url] = result; ok++ }
    await new Promise((r) => setTimeout(r, 250))
  }
  failed.length = 0
  failed.push(...stillFailed)
}
if (failed.length) console.log(`${failed.length} repo(s) kept their previous update data`)

// drop entries for URLs no longer listed
const listed = new Set(urls)
for (const k of Object.keys(map)) if (!listed.has(k)) delete map[k]

// A run where every probe failed is almost always an exhausted quota or an API
// outage. Unlike stars there is no publish-blocking coverage floor downstream
// (absence of update notes is legitimate for many repos), so staleness is the
// whole cost of writing — but an EMPTY map replacing a populated one is still
// worth being loud about.
const have = Object.keys(map).length
if (pending.length && ok === 0) {
  console.warn(`every one of the ${pending.length} probe(s) failed — nothing refreshed this run`)
  console.warn('Usually an exhausted GitHub API quota or an API outage, not a data problem.')
}
if (!have && urls.length) {
  console.error(`refusing to replace ${OUT_FILE} with an empty map over ${urls.length} listed repos`)
  process.exit(1)
}
if (ok === 0 && pending.length) {
  console.log(`${OUT_FILE} left as-is (${have} repos, nothing new to record)`)
  process.exit(0)
}

const sorted = Object.fromEntries(Object.entries(map).sort(([a], [b]) => a.localeCompare(b)))
fs.writeFileSync(OUT_FILE, JSON.stringify(sorted, null, 1) + '\n')
console.log(`updates.json written: ${Object.keys(sorted).length} repos (${ok} refreshed this run)`)
