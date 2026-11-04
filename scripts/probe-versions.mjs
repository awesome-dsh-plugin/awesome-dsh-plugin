import fs from 'node:fs'
import { refreshEntries, DEFAULT_MAX_AGE_HOURS } from './lib/refresh-versions.mjs'

const MAP_FILE = 'data/npm-map.json'
const MAX_AGE_HOURS = Number(process.env.VERSION_MAX_AGE_HOURS ?? DEFAULT_MAX_AGE_HOURS)

if (!fs.existsSync(MAP_FILE)) {
  console.log('no npm-map.json yet — nothing to refresh (the full probe will create it)')
  process.exit(0)
}

const map = JSON.parse(fs.readFileSync(MAP_FILE, 'utf8'))
const today = new Date().toISOString().slice(0, 10)
const maxAgeMs = MAX_AGE_HOURS * 3600 * 1000

async function fetchPackument(name) {
  const res = await fetch(`https://registry.npmjs.org/${encodeURIComponent(name)}`, {
    headers: { accept: 'application/json', 'user-agent': 'awesome-dsh-plugin-npm-probe' },
    signal: AbortSignal.timeout(10000),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

console.log(`${Object.keys(map).length} entries, checking which are older than ${MAX_AGE_HOURS}h`)
const { map: updated, refreshed, changed, skipped, due } = await refreshEntries(map, {
  nowMs: Date.now(),
  maxAgeMs,
  today,
  fetchPackument,
})

if (refreshed > 0) {
  const sorted = Object.fromEntries(Object.entries(updated).sort(([a], [b]) => a.localeCompare(b)))
  fs.writeFileSync(MAP_FILE, JSON.stringify(sorted, null, 1) + '\n')
}

// The skip count is printed on purpose: a rate-limited build must read as
// "N skipped", not as "nothing changed" (issue #11337).
console.log(`version-refresh done: ${due} due, ${refreshed} refreshed (${changed} with a new version/publish fact), ${skipped} skipped after a failed request`)
