#!/usr/bin/env node
/**
 * Refresh star counts for every listed plugin into data/stars.json, consumed
 * by build-site.mjs so plugins.json carries a `stars` field. Consumers then
 * need zero GitHub API calls of their own (anonymous search quotas are shared
 * per egress IP and unusable behind common proxies).
 *
 * Requires GITHUB_TOKEN (CI provides one; locally: GITHUB_TOKEN=$(gh auth token)).
 * Without a token the script exits 0 without touching the file, so offline
 * builds keep the committed data. A failed repo keeps its old entry.
 *
 * data/stars.json is COMMITTED, deliberately. It used to live only in the
 * Actions cache, and "a failed repo keeps its old entry" was then a promise the
 * script could not keep: with nothing to fall back to, a run where every probe
 * failed wrote `{}`. That happened on 2026-08-18 (#1673) — adding a path to the
 * workflow's cache list changed the cache version, so `restore-keys` matched
 * nothing, and the resulting cold start needed ~1,360 API calls at a moment
 * when the hourly quota was already spent. Every probe 403'd, the empty result
 * was written, and the empty file was then saved to the cache and restored by
 * each following run — a self-perpetuating outage that published
 * `stars: null` for all 1,362 entries to every downstream consumer.
 *
 * The committed copy is a floor, not the live value: the cache still supplies
 * fresh counts, and a cache miss now costs staleness instead of everything.
 *
 * Usage: GITHUB_TOKEN=... node scripts/probe-stars.mjs
 */
import fs from 'node:fs'
import LOCALES from '../site/locales.mjs'

const STARS_FILE = 'data/stars.json'
const CONCURRENCY = 10
// A GitHub Actions token is capped at ~1000 requests per hour per repository,
// shared by every workflow. Probing all ~1300 entries on each push blew that
// budget on its own — with a dozen merges in an hour the Submission gate was
// left with nothing and died mid-run, which is how submissions came to sit
// with no verdict at all. Push-triggered runs now refresh only what is new or
// a day stale; the nightly PROBE_ALL run still sweeps everything.
const RECHECK_DAYS = Number(process.env.PROBE_RECHECK_DAYS ?? 1)
const PROBE_ALL = process.env.PROBE_ALL === '1'
// Entries added since the last probe legitimately have no count yet, and a
// repository that 404s never will, so this is a floor rather than a match.
// Kept identical to the one build-site.mjs enforces before publishing.
const MIN_COVERAGE = 0.66

const token = process.env.GITHUB_TOKEN
if (!token) {
  console.log('no GITHUB_TOKEN — keeping committed stars data as-is')
  process.exit(0)
}

const map = fs.existsSync(STARS_FILE) ? JSON.parse(fs.readFileSync(STARS_FILE, 'utf8')) : {}
const readme = fs.readFileSync(LOCALES[0].readme, 'utf8')
const urls = [...readme.matchAll(/^- \[.+?\]\((https:\/\/github\.com\/[^)]+)\) [—-] /gm)].map((m) => m[1])
const today = new Date().toISOString().slice(0, 10)

const fresh = (entry) =>
  !PROBE_ALL
  && entry !== undefined
  && entry.checkedAt
  && (Date.now() - new Date(entry.checkedAt).getTime()) / 86400000 <= RECHECK_DAYS

const pending = urls.filter((url) => !fresh(map[url]))
console.log(`${urls.length} listed, ${pending.length} to probe${PROBE_ALL ? ' (PROBE_ALL)' : ''}`)

async function probe(url) {
  // monorepo subdir entries (…/tree/main/path) inherit the parent repo's stars
  const repoPath = url.replace('https://github.com/', '').replace(/\/$/, '').split('/').slice(0, 2).join('/')
  try {
    const res = await fetch(`https://api.github.com/repos/${repoPath}`, {
      headers: {
        accept: 'application/vnd.github+json',
        authorization: `Bearer ${token}`,
        'user-agent': 'awesome-dsh-plugin-stars-probe',
      },
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const repo = await res.json()
    if (typeof repo.stargazers_count !== 'number') throw new Error('no stargazers_count')
    return { stars: repo.stargazers_count, checkedAt: today }
  } catch {
    return null // keep the previous entry
  }
}

let done = 0
let ok = 0
let failed = 0
for (let i = 0; i < pending.length; i += CONCURRENCY) {
  const batch = pending.slice(i, i + CONCURRENCY)
  const results = await Promise.all(batch.map(async (url) => [url, await probe(url)]))
  for (const [url, result] of results) {
    if (result !== null) { map[url] = result; ok++ } else failed++
  }
  done += batch.length
  if (done % 50 === 0 || done >= pending.length) console.log(`stars ${done}/${pending.length}`)
}
if (failed) console.log(`${failed} of ${pending.length} probe(s) failed — those entries keep their previous value`)

const listed = new Set(urls)
for (const k of Object.keys(map)) if (!listed.has(k)) delete map[k]

// Never overwrite the file with a result this run cannot stand behind.
//
// Writing is not the safe default here: whatever lands in this file is cached
// and published, so an empty write both breaks today's deploy and poisons every
// later run that restores the cache. Refusing to write costs a stale number;
// writing an empty file cost every consumer their star data for hours (#1673).
//
// Exit non-zero so the workflow stops before build-site.mjs runs. That keeps
// the previous deploy live rather than replacing it with a worse one, and it
// makes a spent API quota loud instead of silent.
// Coverage of the RESULT, not of this run's successes: a refresh where every
// probe failed is harmless as long as the data already on disk is still good —
// yesterday's star counts serve fine, and blocking the deploy over a stale
// number would stop unrelated site updates for no gain.
//
// What must never happen is replacing good data with an empty file. That is
// judged on the result, so the two cases separate cleanly: nothing learned and
// still complete is a warning, nothing learned and now empty is a failure.
const have = Object.keys(map).length
const coverage = urls.length ? have / urls.length : 1
if (pending.length && ok === 0) {
  console.warn(`every one of the ${pending.length} probe(s) failed — nothing refreshed this run`)
  console.warn('Usually an exhausted GitHub API quota or an API outage, not a data problem.')
}
if (coverage < MIN_COVERAGE) {
  console.error(`only ${have}/${urls.length} listed entries have a star count (${(coverage * 100).toFixed(1)}%), below the ${MIN_COVERAGE * 100}% floor — not writing ${STARS_FILE}`)
  console.error('Refusing to replace the committed data with a result this incomplete: whatever')
  console.error('lands here is cached and published, so an empty write breaks today\'s deploy and')
  console.error('poisons every later run that restores the cache. Re-run once the quota resets.')
  process.exit(1)
}
if (ok === 0 && pending.length) {
  console.log(`${STARS_FILE} left as-is (${have} repos, nothing new to record)`)
  process.exit(0)
}

const sorted = Object.fromEntries(Object.entries(map).sort(([a], [b]) => a.localeCompare(b)))
fs.writeFileSync(STARS_FILE, JSON.stringify(sorted, null, 1) + '\n')
console.log(`stars.json written: ${Object.keys(sorted).length} repos (${ok} refreshed this run)`)
