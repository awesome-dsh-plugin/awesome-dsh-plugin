#!/usr/bin/env node
/**
 * Probe which listed plugins are published on npm, so consumers (site,
 * find-plugin, dsh-market) can prefer registry installs over full-repo
 * GitHub tarballs.
 *
 * For every plugin URL in the default-locale README that is missing from
 * data/npm-map.json (or was last checked unpublished over 30 days ago):
 *   1. read the repo's package.json name from raw.githubusercontent.com
 *   2. accept it only when registry.npmjs.org has that package AND its
 *      repository URL points back at the same GitHub repo (guards against
 *      name squatting and unrelated packages)
 *
 * Results are cached in data/npm-map.json: { "<github url>": { npm, checkedAt } }.
 * Published verdicts are permanent; unpublished ones are re-probed daily.
 * Network failures leave the existing entry untouched.
 *
 * Usage: node scripts/probe-npm.mjs
 */
import fs from 'node:fs'
import LOCALES from '../site/locales.mjs'

const MAP_FILE = 'data/npm-map.json'
// Unpublished verdicts expire after a day, not a month: authors publish to npm
// hours after being listed, and a stale null keeps the site on the slower
// github: install for that whole window (reported in #487). Cheap to redo —
// these probes hit raw.githubusercontent and the npm registry, neither of
// which spends GitHub API quota. Set PROBE_ALL=1 to force a full re-probe.
const RECHECK_DAYS = Number(process.env.PROBE_RECHECK_DAYS ?? 1)
const PROBE_ALL = process.env.PROBE_ALL === '1'
const CONCURRENCY = 8

const map = fs.existsSync(MAP_FILE) ? JSON.parse(fs.readFileSync(MAP_FILE, 'utf8')) : {}

const readme = fs.readFileSync(LOCALES[0].readme, 'utf8')
const urls = [...readme.matchAll(/^- \[.+?\]\((https:\/\/github\.com\/[^)]+)\) [—-] /gm)].map((m) => m[1])

const today = new Date().toISOString().slice(0, 10)
const stale = (entry) =>
  PROBE_ALL
  || entry === undefined
  || (entry.npm === null
    && (Date.now() - new Date(entry.checkedAt).getTime()) / 86400000 > RECHECK_DAYS)

const pending = urls.filter((url) => stale(map[url]))
console.log(`${urls.length} listed, ${pending.length} to probe`)

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { accept: 'application/json', 'user-agent': 'awesome-dsh-plugin-npm-probe' },
    signal: AbortSignal.timeout(10000),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

async function probe(url) {
  const repoPath = url.replace('https://github.com/', '').replace(/\/$/, '')
  const repo = repoPath.split('/').slice(0, 2).join('/')
  const sub = repoPath.includes('/tree/') ? repoPath.split('/tree/')[1].replace(/^[^/]+\//, '') : null
  try {
    const pkg = await fetchJson(`https://raw.githubusercontent.com/${repo}/HEAD/${sub ? sub + '/' : ''}package.json`)
    const name = typeof pkg.name === 'string' ? pkg.name : null
    if (name === null) return { npm: null, checkedAt: today }
    const meta = await fetchJson(`https://registry.npmjs.org/${encodeURIComponent(name)}`)
    // Registry documents can retain repository metadata from the first
    // publication at the top level. Resolve the current `latest` manifest
    // first so repository renames in later releases are recognized.
    const latest = typeof meta['dist-tags']?.latest === 'string' ? meta['dist-tags'].latest : null
    const repository = (latest === null ? null : meta.versions?.[latest]?.repository) ?? meta.repository
    const repoField = typeof repository === 'string' ? repository : repository?.url ?? ''
    const linked = repoField.toLowerCase().includes(repo.toLowerCase())
    return { npm: linked ? name : null, checkedAt: today }
  } catch {
    return null // network failure or 404 chain — keep whatever we had
  }
}

let done = 0
for (let i = 0; i < pending.length; i += CONCURRENCY) {
  const batch = pending.slice(i, i + CONCURRENCY)
  const results = await Promise.all(batch.map(async (url) => [url, await probe(url)]))
  for (const [url, result] of results) {
    if (result !== null) map[url] = result
    else if (map[url] === undefined) map[url] = { npm: null, checkedAt: today }
  }
  done += batch.length
  console.log(`probed ${done}/${pending.length}`)
}

const listed = new Set(urls)
for (const k of Object.keys(map)) if (!listed.has(k)) delete map[k]

const sorted = Object.fromEntries(Object.entries(map).sort(([a], [b]) => a.localeCompare(b)))
fs.writeFileSync(MAP_FILE, JSON.stringify(sorted, null, 1) + '\n')
const published = Object.values(sorted).filter((e) => e.npm !== null).length
console.log(`npm-map written: ${published}/${Object.keys(sorted).length} published on npm`)
