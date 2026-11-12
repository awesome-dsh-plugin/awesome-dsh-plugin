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
 * Per repository: the latest release (a 404 is a fact — most plugins ship no
 * releases — not a failure) and a short commit tail (the tail the market slices
 * at each user's installed sha; 8 covers the common case of an update being a
 * handful of commits, and anything wider reads as "recent commits" rather than
 * pretending to be an exact interval).
 *
 * Both are asked for in ONE query per fifty repositories rather than one pair of
 * REST calls each. Two calls per repository is more than the token's hourly
 * budget can pay for across the list, which is why the 2026-09-16 nightly failed
 * 2,594 of 3,727 on the first pass and left a third of the published file on
 * `checkedAt: 2026-09-05` (#5275); GraphQL charges one point for a query naming
 * fifty repositories, so a whole-list sweep is ~75 points against the 1,000/hour
 * the token gets. See lib/probe-updates-graphql.mjs for the shape, the cost and
 * the cases it refuses to answer.
 *
 * Whatever the batch declines — a name that no longer resolves, a GraphQL error
 * on that alias, or a `latestRelease` the REST endpoint would not have called
 * latest — falls back to the REST calls below, which stay the definition of what
 * these fields mean. A request that fails outright is not a fact about any
 * repository, so those entries keep their previous value and the retry pass
 * tries them again.
 *
 * Requires GITHUB_TOKEN (CI provides one; locally: GITHUB_TOKEN=$(gh auth token)).
 * Without a token the script exits 0 without touching the file. A failed repo
 * keeps its old entry.
 *
 * Usage: GITHUB_TOKEN=... node scripts/probe-updates.mjs
 */
import fs from 'node:fs'
import LOCALES from '../site/locales.mjs'
import { REPOS_PER_QUERY, buildQuery, rateLimitDelayMs, readEntries, repoOf } from './lib/probe-updates-graphql.mjs'
import { leastRecentlyChecked } from './lib/probe-order.mjs'

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
// Repositories per GraphQL query, and the REST ceiling for the few the batch
// declines. A query costs one point whatever its size, so the batch is as large
// as the readme listing's (see lib/probe-updates-graphql.mjs); the ceiling is
// the old REST concurrency, kept for the fallback path only.
const BATCH = Number(process.env.PROBE_BATCH ?? REPOS_PER_QUERY)
const REST_CONCURRENCY = 8

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
    const waitMs = rateLimitDelayMs(res.headers)
    if (waitMs > 0 && waitMs <= 120000) {
      await new Promise((r) => setTimeout(r, waitMs))
      return gh(path)
    }
  }
  if (!res.ok) throw new HttpError(res.status)
  return res.json()
}

/**
 * POST one batched query, with the same answer to a rate-limited reply as gh():
 * a short wait is the whole remedy, and retrying immediately is what earns a
 * longer block. GraphQL reports exhaustion as a body (HTTP 200, `data: null`)
 * rather than a status, so both are checked against the same headers.
 *
 * A failure here is deliberately a throw and not a null: it says nothing about
 * any repository in the batch, and the caller must not record it as "this repo
 * ships no updates".
 */
async function graphql(query) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      'user-agent': 'awesome-dsh-plugin-updates-probe',
    },
    body: JSON.stringify({ query }),
    signal: AbortSignal.timeout(30000),
  })
  if (res.status === 403 || res.status === 429) {
    const waitMs = rateLimitDelayMs(res.headers)
    if (waitMs > 0 && waitMs <= 120000) {
      await new Promise((r) => setTimeout(r, waitMs))
      return graphql(query)
    }
  }
  if (!res.ok) throw new HttpError(res.status)
  const payload = await res.json()
  if (!payload?.data) {
    const waitMs = rateLimitDelayMs(res.headers)
    if (waitMs > 0 && waitMs <= 120000) {
      await new Promise((r) => setTimeout(r, waitMs))
      return graphql(query)
    }
    throw new HttpError(502)
  }
  return payload
}

/**
 * The REST path: one repository, two calls, and the definition both fields are
 * measured against. It answers for whatever the batch declines (see
 * probeBatch) and for a whole request that failed, so a GraphQL outage degrades
 * to the previous behaviour rather than to a night of untouched data.
 */
async function probe(url) {
  // monorepo subdir entries inherit the parent repo's history, like stars do
  const repoPath = repoOf(url)
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

/**
 * Probe a slice of the list with one GraphQL query, and fall back to REST only
 * where the batch says it cannot be trusted.
 *
 * The batch is trusted for everything it answers: same two fields, same caps,
 * same "a repo with neither is not update data" rule as probe(). It declines a
 * repository when the name does not resolve, when GraphQL reports an error on
 * that alias, or when `latestRelease` turns out to be a draft or a prerelease —
 * `/releases/latest` skips both, and publishing a different answer to every
 * market is not something a cheaper call is allowed to decide.
 *
 * @param {readonly string[]} urls - at most BATCH entries.
 * @returns {Promise<Map<string, object|null>>} url → entry, or null for a
 *   failure. Never partial: every url given is a key.
 */
async function probeBatch(urls) {
  const repos = urls.map((url) => {
    const [owner, name] = repoOf(url).split('/')
    return { owner, name }
  })

  let entries
  try {
    entries = readEntries(await graphql(buildQuery(repos, { commitTail: COMMIT_TAIL })), repos, {
      maxBodyBytes: MAX_BODY_BYTES,
      maxMessageChars: MAX_MESSAGE_CHARS,
    })
  } catch {
    // Nothing was learned about any of these repositories, so none of them is
    // written off as "no update data" — they fail, keep their previous value,
    // and come back in the retry pass.
    return new Map(urls.map((url) => [url, null]))
  }

  const out = new Map()
  const declined = []
  urls.forEach((url, i) => {
    if (!entries.has(i)) {
      declined.push(url)
      return
    }
    const { release, commits } = entries.get(i)
    out.set(url, release || commits.length ? { release, commits, checkedAt: today } : null)
  })

  for (let i = 0; i < declined.length; i += REST_CONCURRENCY) {
    const slice = declined.slice(i, i + REST_CONCURRENCY)
    const results = await Promise.all(slice.map(async (url) => [url, await probe(url)]))
    for (const [url, result] of results) out.set(url, result)
  }

  return out
}

const fresh = (entry) =>
  !PROBE_ALL
  && entry !== undefined
  && entry.checkedAt
  && (Date.now() - new Date(entry.checkedAt).getTime()) / 86400000 <= RECHECK_DAYS

// Least recently checked first: the nightly budget does not reach every repo
// (see lib/probe-order.mjs), and README order would starve the same ones daily.
const pending = leastRecentlyChecked(urls.filter((url) => !fresh(map[url])), map)
console.log(`${urls.length} listed, ${pending.length} to probe${PROBE_ALL ? ' (PROBE_ALL)' : ''}`)

const failed = []
let done = 0
let ok = 0
for (let i = 0; i < pending.length; i += BATCH) {
  const batch = pending.slice(i, i + BATCH)
  const results = await probeBatch(batch)
  for (const url of batch) {
    const result = results.get(url) ?? null
    if (result === null) failed.push(url)
    else { map[url] = result; ok++ }
  }
  done += batch.length
  if (done % 50 === 0 || done >= pending.length) console.log(`updates ${done}/${pending.length}`)
}

// Same second-pass reasoning as probe-readmes.mjs: a burst failure must not be
// indistinguishable from "this repo has nothing", because entries added since
// the last run have no previous data to fall back on. Batched like the first
// pass, so the 250 ms spacing separates queries now rather than repositories.
if (failed.length) {
  console.log(`${failed.length} repo(s) failed the first pass — retrying in batches of ${BATCH}`)
  await new Promise((r) => setTimeout(r, 20000))
  const stillFailed = []
  for (let i = 0; i < failed.length; i += BATCH) {
    const chunk = failed.slice(i, i + BATCH)
    const results = await probeBatch(chunk)
    for (const url of chunk) {
      const result = results.get(url) ?? null
      if (result === null) stillFailed.push(url)
      else { map[url] = result; ok++ }
    }
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
// A cold cache (no committed data) plus an all-fail probe run must NOT block
// the build. Per the file header, "absence of update notes is a normal state
// downstream", and this step's `actions/cache` save only runs if the step
// SUCCEEDS — so exiting 1 here strands the updates cache in a permanent miss
// and makes every subsequent nightly fail too (the exact "always fails" loop).
// Leave the file untouched and exit 0; the next successful run populates and
// banks it. The graceful exit below already covers the same case for a warm
// cache, so this is purely the cold-start safety valve.
if (!have && urls.length) {
  console.warn(`no update data for any of the ${urls.length} listed repos (cold cache + failed probe) — leaving ${OUT_FILE} untouched, not failing the build`)
  process.exit(0)
}
if (ok === 0 && pending.length) {
  console.log(`${OUT_FILE} left as-is (${have} repos, nothing new to record)`)
  process.exit(0)
}

const sorted = Object.fromEntries(Object.entries(map).sort(([a], [b]) => a.localeCompare(b)))
fs.writeFileSync(OUT_FILE, JSON.stringify(sorted, null, 1) + '\n')
console.log(`updates.json written: ${Object.keys(sorted).length} repos (${ok} refreshed this run)`)
