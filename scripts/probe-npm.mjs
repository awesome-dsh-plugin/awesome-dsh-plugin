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
 * Published verdicts are permanent; unpublished ones are re-probed monthly.
 * Network failures leave the existing entry untouched.
 *
 * Usage: node scripts/probe-npm.mjs
 */
import fs from 'node:fs'
import LOCALES from '../site/locales.mjs'

const MAP_FILE = 'data/npm-map.json'
const RECHECK_DAYS = 30
const CONCURRENCY = 8

const map = fs.existsSync(MAP_FILE) ? JSON.parse(fs.readFileSync(MAP_FILE, 'utf8')) : {}

const readme = fs.readFileSync(LOCALES[0].readme, 'utf8')
const urls = [...readme.matchAll(/^- \[.+?\]\((https:\/\/github\.com\/[^)]+)\) [—-] /gm)].map((m) => m[1])

const today = new Date().toISOString().slice(0, 10)
const stale = (entry) =>
  entry === undefined
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
  try {
    const pkg = await fetchJson(`https://raw.githubusercontent.com/${repoPath}/HEAD/package.json`)
    const name = typeof pkg.name === 'string' ? pkg.name : null
    if (name === null) return { npm: null, checkedAt: today }
    const meta = await fetchJson(`https://registry.npmjs.org/${encodeURIComponent(name)}`)
    const repoField = typeof meta.repository === 'string' ? meta.repository : meta.repository?.url ?? ''
    const linked = repoField.toLowerCase().includes(repoPath.toLowerCase())
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

const sorted = Object.fromEntries(Object.entries(map).sort(([a], [b]) => a.localeCompare(b)))
fs.writeFileSync(MAP_FILE, JSON.stringify(sorted, null, 1) + '\n')
const published = Object.values(sorted).filter((e) => e.npm !== null).length
console.log(`npm-map written: ${published}/${Object.keys(sorted).length} published on npm`)
