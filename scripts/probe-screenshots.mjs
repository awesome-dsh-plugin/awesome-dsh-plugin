#!/usr/bin/env node
/**
 * Resolve every entry's screenshots and check that the images still exist.
 *
 * Two sources, in this order:
 *
 *   1. `screenshots.json` in the plugin's own repository, beside its
 *      package.json (inside the subdirectory for a monorepo entry). Optional.
 *      This is the convention going forward: the pictures already live in the
 *      author's repository, so the list of them belongs there too. An author
 *      who adds a screenshot pushes to their own repo and the next build picks
 *      it up — no pull request here, no waiting on a maintainer.
 *
 *   2. data/screenshots.json in this repository — every entry that predates the
 *      convention. It is a fallback, not a second home: once an author declares
 *      the file in their own repo, their key here is redundant and
 *      prune-legacy-screenshots.mjs removes it. The file drains as authors
 *      migrate and can eventually be deleted.
 *
 * Relative paths are the point of the first source. `assets/shot.png` is
 * resolved against the author's repo at HEAD, so an author who renames the file
 * sees the break in their own repository, where they can fix it. The old shape
 * — an absolute raw.githubusercontent URL written into a file over here — could
 * only rot silently, which is how 41 of 773 published images came to be 404s.
 *
 * Absolute URLs are still accepted (some authors point at release assets), and
 * carry the same host allow-list build-site.mjs enforces: GitHub's own hosting
 * only, so a screenshot cannot become a tracking pixel in every storefront
 * user's browser.
 *
 * Liveness is checked for both sources and recorded in data/screenshots-live.json.
 * Same discipline as probe-tarballs.mjs: only 404/410 count as dead, an absent
 * verdict means live, and nothing here blocks a build — a dead image is dropped
 * from the published data, never turned into someone's failure.
 *
 * Usage: node scripts/probe-screenshots.mjs [--strict]
 *   --strict  exit 1 if any screenshot is dead (for a manual audit; CI does not
 *             use it, since a dead image must degrade the site, not block it)
 */
import fs from 'node:fs'
import { readEntries } from './lib/entries.mjs'

const LEGACY_FILE = 'data/screenshots.json'
const DECLARED_FILE = 'data/screenshots-declared.json'
const LIVE_FILE = 'data/screenshots-live.json'
const CONCURRENCY = 8
const STRICT = process.argv.includes('--strict')

// Mirrors build-site.mjs::SCREENSHOT_HOSTS. Kept in step deliberately: an
// author-declared absolute URL has to clear the same bar a maintainer-declared
// one does, or the convention becomes a way around the rule.
const HOSTS = new Set(['raw.githubusercontent.com', 'user-images.githubusercontent.com', 'camo.githubusercontent.com', 'github.com'])
const MAX_SHOTS = 8

const today = new Date().toISOString().slice(0, 10)
const entries = readEntries()

/** owner/repo plus the subdirectory a monorepo entry points into. */
function decompose(url) {
  const repoPath = url.replace('https://github.com/', '').replace(/\/$/, '')
  return {
    repo: repoPath.split('/').slice(0, 2).join('/'),
    sub: repoPath.includes('/tree/') ? repoPath.split('/tree/')[1].replace(/^[^/]+\//, '') : null,
  }
}

async function fetchText(url) {
  const r = await fetch(url, {
    headers: { 'user-agent': 'awesome-dsh-plugin-screenshot-probe' },
    signal: AbortSignal.timeout(15000),
  })
  if (!r.ok) return null
  return r.text()
}

/**
 * Read and validate the author's own screenshots.json.
 *
 * Returns null for "no declaration" — a missing file, unreachable repo, or
 * unparseable JSON all mean the same thing to the caller: fall back. A malformed
 * declaration is reported so the author can be told, but it never promotes to an
 * error: their entry keeps whatever the legacy file holds.
 */
async function declared(entry) {
  const { repo, sub } = decompose(entry.url)
  const base = `https://raw.githubusercontent.com/${repo}/HEAD/${sub ? sub + '/' : ''}`
  let text
  try {
    text = await fetchText(`${base}screenshots.json`)
  } catch {
    return null
  }
  if (text === null) return null

  let doc
  try {
    doc = JSON.parse(text)
  } catch (e) {
    return { problem: `screenshots.json is not valid JSON (${e.message})` }
  }
  // Three shapes, because all three are the obvious thing to write and none is
  // ambiguous. The third is the one an author reaches for by copying the map
  // out of this repository's data/screenshots.json — keyed by their own entry
  // URL — which is exactly what xiajiajun516/dsh-config-manager had already
  // done before this convention existed. Refusing that would be pedantry.
  const list = Array.isArray(doc)
    ? doc
    : Array.isArray(doc?.screenshots)
      ? doc.screenshots
      : Array.isArray(doc?.[entry.url])
        ? doc[entry.url]
        : Object.keys(doc ?? {}).length === 1 && Array.isArray(Object.values(doc)[0])
          ? Object.values(doc)[0]
          : null
  if (list === null) {
    return { problem: 'screenshots.json must be an array of paths, {"screenshots": [...]}, or a single-key map of entry URL to paths' }
  }
  if (!list.length) return { problem: 'screenshots.json declares no images' }
  if (list.length > MAX_SHOTS) return { problem: `screenshots.json declares ${list.length} images; the cap is ${MAX_SHOTS}` }
  if (list.some((s) => typeof s !== 'string' || !s.trim())) return { problem: 'every entry in screenshots.json must be a non-empty string' }

  const shots = []
  for (const raw of list) {
    const s = raw.trim()
    if (/^https?:\/\//i.test(s)) {
      let parsed = null
      try { parsed = new URL(s) } catch { /* reported below */ }
      if (parsed === null || parsed.protocol !== 'https:' || !HOSTS.has(parsed.hostname)) {
        return { problem: `absolute image URLs must be https on GitHub hosting (${[...HOSTS].join(' / ')}), got: ${s}` }
      }
      shots.push(s)
      continue
    }
    // A relative path may not climb out of the plugin's own directory: an entry
    // is responsible for its own subtree and nothing above it.
    if (s.startsWith('/') || s.split('/').includes('..')) {
      return { problem: `relative paths must stay inside the plugin directory, got: ${s}` }
    }
    shots.push(base + s.split('/').map(encodeURIComponent).join('/'))
  }
  return { shots }
}

/**
 * Resolve an image without downloading it — a ranged GET for the reason
 * probe-tarballs.mjs gives: GitHub's hosting answers HEAD inconsistently, while
 * `Range: bytes=0-0` is 206 for a live object and 404 for a missing one.
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

// ── 1. collect author declarations ───────────────────────────────────────────
const declaredMap = {}
const malformed = []
for (let i = 0; i < entries.length; i += CONCURRENCY) {
  const batch = entries.slice(i, i + CONCURRENCY)
  const results = await Promise.all(batch.map(async (e) => [e, await declared(e)]))
  for (const [e, d] of results) {
    if (d === null) continue
    if (d.problem) { malformed.push(`${e.url} — ${d.problem}`); continue }
    declaredMap[e.url] = d.shots
  }
}
const sortedDeclared = Object.fromEntries(Object.entries(declaredMap).sort(([a], [b]) => a.localeCompare(b)))
fs.writeFileSync(DECLARED_FILE, JSON.stringify(sortedDeclared, null, 1) + '\n')

const legacy = fs.existsSync(LEGACY_FILE) ? JSON.parse(fs.readFileSync(LEGACY_FILE, 'utf8')) : {}
const legacyOnly = Object.keys(legacy).filter((k) => declaredMap[k] === undefined)
console.log(
  `screenshots: ${Object.keys(declaredMap).length} entries declare their own, ` +
    `${legacyOnly.length} still come from ${LEGACY_FILE}, ` +
    `${Object.keys(legacy).length - legacyOnly.length} superseded`,
)
if (malformed.length) {
  console.log('repositories whose screenshots.json could not be used (their legacy entry, if any, still applies):')
  for (const m of malformed) console.log(`  ${m}`)
}

// ── 2. liveness over the union ───────────────────────────────────────────────
const urls = [...new Set([
  ...Object.values(declaredMap).flat(),
  ...legacyOnly.flatMap((k) => (Array.isArray(legacy[k]) ? legacy[k] : [])),
].filter((s) => typeof s === 'string'))]

const previous = fs.existsSync(LIVE_FILE) ? JSON.parse(fs.readFileSync(LIVE_FILE, 'utf8')) : {}
const out = {}
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

const sortedLive = Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)))
fs.writeFileSync(LIVE_FILE, JSON.stringify(sortedLive, null, 1) + '\n')

const dead = []
for (const [key, list] of Object.entries({ ...Object.fromEntries(legacyOnly.map((k) => [k, legacy[k]])), ...declaredMap })) {
  const gone = (Array.isArray(list) ? list : []).filter((u) => sortedLive[u]?.ok === false)
  if (gone.length) dead.push(`${key}\n      ${gone.join('\n      ')}`)
}

const live = Object.values(sortedLive).filter((v) => v.ok).length
const deadCount = Object.values(sortedLive).filter((v) => v.ok === false).length
console.log(`screenshots: ${urls.length} images, ${live} live, ${deadCount} dead, ${unknown.length} unchecked`)

if (dead.length) {
  console.log('dead screenshots (dropped from the published data; the entry keeps its other shots):')
  for (const d of dead) console.log(`  ${d}`)
}
if (unknown.length) {
  console.log('could not be checked this run (previous verdict kept):')
  for (const u of unknown) console.log(`  ${u}`)
}

if (STRICT && dead.length) process.exit(1)
