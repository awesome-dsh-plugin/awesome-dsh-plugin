#!/usr/bin/env node
/**
 * Check that every image URL in data/screenshots.json still resolves, and
 * record the verdict in data/screenshots-live.json for build-site.mjs.
 *
 * Why this exists. build-site.mjs already validates screenshots, but only for
 * shape and host: the key has to name a listed entry, the value has to be 1-8
 * strings, and the host has to be GitHub's own so a list PR cannot plant a
 * tracking pixel in every storefront user's browser. Nothing ever asks whether
 * the image is there. So a URL that 404s passes the PR check, passes the gate,
 * merges, and becomes a broken image in the plugin market — silently, because
 * a missing picture fails no test.
 *
 * That is not hypothetical. biggerboy/dsh-conversation-anchors landed with
 * two screenshots pointing at assets/anchors-hover.png and assets/anchors-wave.png;
 * the repository ships assets/anchors-wave1.png and assets/image.png. Both URLs
 * were dead the day they merged and every build since has published them.
 *
 * Same discipline as probe-tarballs.mjs, for the same reason: a dead URL must
 * degrade the site, not block anyone. A screenshot that 404s is dropped from
 * the published data rather than failing a build, and an entry whose shots all
 * die simply has no screenshots — which is the state every entry was in before
 * the field existed. Only 404/410 count as dead; a 5xx or a throttle means we
 * did not get to look, and "could not check" must never be recorded as "gone".
 *
 * Usage: node scripts/probe-screenshots.mjs [--strict]
 *   --strict  exit 1 if any screenshot is dead (for a manual audit; CI does not
 *             use it, since a dead image must degrade the site, not block it)
 */
import fs from 'node:fs'

const SHOTS_FILE = 'data/screenshots.json'
const OUT_FILE = 'data/screenshots-live.json'
const CONCURRENCY = 8
const STRICT = process.argv.includes('--strict')

const today = new Date().toISOString().slice(0, 10)

if (!fs.existsSync(SHOTS_FILE)) {
  console.log(`${SHOTS_FILE} does not exist — nothing to probe`)
  process.exit(0)
}

const shots = JSON.parse(fs.readFileSync(SHOTS_FILE, 'utf8'))
const urls = [...new Set(Object.values(shots).flat().filter((s) => typeof s === 'string'))]

if (!urls.length) {
  console.log('no screenshots declared — nothing to probe')
  process.exit(0)
}

/**
 * Resolve an image without downloading it. A ranged GET rather than HEAD, for
 * the reason probe-tarballs.mjs gives: raw.githubusercontent.com and the camo
 * proxy both answer HEAD inconsistently, while `Range: bytes=0-0` comes back
 * 206 for a live object and 404 for a missing one, at the cost of a byte.
 */
async function probe(url) {
  try {
    const r = await fetch(url, {
      headers: { range: 'bytes=0-0', 'user-agent': 'awesome-dsh-plugin-screenshot-probe' },
      redirect: 'follow',
      signal: AbortSignal.timeout(30000),
    })
    if (r.body) await r.body.cancel().catch(() => {})
    if (r.ok || r.status === 206) return { ok: true, status: r.status }
    if (r.status === 404 || r.status === 410) return { ok: false, status: r.status }
    return { ok: null, status: r.status }
  } catch (e) {
    return { ok: null, status: 0, error: e.message }
  }
}

const previous = fs.existsSync(OUT_FILE) ? JSON.parse(fs.readFileSync(OUT_FILE, 'utf8')) : {}
const out = {}
const dead = []
const unknown = []

for (let i = 0; i < urls.length; i += CONCURRENCY) {
  const batch = urls.slice(i, i + CONCURRENCY)
  const results = await Promise.all(batch.map(async (u) => [u, await probe(u)]))
  for (const [u, r] of results) {
    if (r.ok === null) {
      // Keep the previous verdict rather than inventing one. A URL nobody has
      // ever reached has no entry here, and build-site treats absent as live —
      // unproven is not the same as proven dead.
      if (previous[u] !== undefined) out[u] = previous[u]
      unknown.push(`${u} — HTTP ${r.status}${r.error ? ` (${r.error})` : ''}`)
      continue
    }
    out[u] = { ok: r.ok, status: r.status, checkedAt: today }
  }
}

for (const [key, list] of Object.entries(shots)) {
  const gone = (Array.isArray(list) ? list : []).filter((u) => out[u]?.ok === false)
  if (gone.length) dead.push(`${key}\n      ${gone.join('\n      ')}`)
}

const sorted = Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)))
fs.writeFileSync(OUT_FILE, JSON.stringify(sorted, null, 1) + '\n')

const live = Object.values(sorted).filter((v) => v.ok).length
const deadCount = Object.values(sorted).filter((v) => v.ok === false).length
console.log(`screenshots: ${urls.length} declared, ${live} live, ${deadCount} dead, ${unknown.length} unchecked`)

if (dead.length) {
  console.log('dead screenshots (dropped from the published data; the entry keeps its other shots):')
  for (const d of dead) console.log(`  ${d}`)
}
if (unknown.length) {
  console.log('could not be checked this run (previous verdict kept):')
  for (const u of unknown) console.log(`  ${u}`)
}

if (STRICT && dead.length) process.exit(1)
