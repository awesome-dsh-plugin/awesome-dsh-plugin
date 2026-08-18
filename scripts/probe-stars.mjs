#!/usr/bin/env node
/**
 * Refresh star counts for every listed plugin into data/stars.json, consumed
 * by build-site.mjs so plugins.json carries a `stars` field. Consumers then
 * need zero GitHub API calls of their own (anonymous search quotas are shared
 * per egress IP and unusable behind common proxies).
 *
 * Requires GITHUB_TOKEN (CI provides one; locally: GITHUB_TOKEN=$(gh auth token)).
 * Without a token the script exits 0 without touching the file, so offline
 * builds keep the last committed data. A failed repo keeps its old entry.
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
for (let i = 0; i < pending.length; i += CONCURRENCY) {
  const batch = pending.slice(i, i + CONCURRENCY)
  const results = await Promise.all(batch.map(async (url) => [url, await probe(url)]))
  for (const [url, result] of results) {
    if (result !== null) map[url] = result
  }
  done += batch.length
  if (done % 50 === 0 || done >= pending.length) console.log(`stars ${done}/${pending.length}`)
}

const listed = new Set(urls)
for (const k of Object.keys(map)) if (!listed.has(k)) delete map[k]

const sorted = Object.fromEntries(Object.entries(map).sort(([a], [b]) => a.localeCompare(b)))
fs.writeFileSync(STARS_FILE, JSON.stringify(sorted, null, 1) + '\n')
console.log(`stars.json written: ${Object.keys(sorted).length} repos`)
