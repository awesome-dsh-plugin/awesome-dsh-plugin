#!/usr/bin/env node
/**
 * Check that every author-declared `tarball` in data/plugins/*.yml still
 * resolves, and record the verdict in data/tarballs.json for build-site.mjs.
 *
 * Why this exists (#1619). A release-asset URL is validated once, at
 * submission, and can stop resolving later without anyone touching the entry:
 *
 *   .../releases/latest/download/<file>   `latest` is resolved per request but
 *                                         <file> is literal, so the URL dies
 *                                         the moment a release renames the
 *                                         asset — which a version in the
 *                                         filename guarantees.
 *   .../releases/download/<tag>/<file>    pinned; stable unless the author
 *                                         deletes the release or the asset.
 *
 * Both shapes are legal (entries.mjs::tarballProblem), so the rot is caught
 * here rather than refused there. A dead tarball is dropped from the site
 * instead of failing the build: without the field a user falls back to the
 * `github:owner/repo` install command, which is the behaviour every entry had
 * before `tarball` existed. A 404 handed to a consumer has no such fallback.
 *
 * Deliberately no incremental mode. The whole point is freshness, the set is
 * small (it is opt-in per entry), and one ranged GET each is far cheaper than
 * the star or README sweeps. These are release-asset downloads on
 * github.com/objects.githubusercontent.com, not api.github.com, so they do not
 * draw on the API quota the gate depends on.
 *
 * Usage: node scripts/probe-tarballs.mjs [--strict]
 *   --strict  exit 1 if any tarball is dead (for a manual audit; CI does not
 *             use it, since a dead URL must degrade the site, not block it)
 */
import fs from 'node:fs'
import { readEntries } from './lib/entries.mjs'

const OUT_FILE = 'data/tarballs.json'
const CONCURRENCY = 6
const STRICT = process.argv.includes('--strict')

const today = new Date().toISOString().slice(0, 10)
const entries = readEntries().filter((e) => e.tarball)

if (!entries.length) {
  console.log('no entries declare a tarball — nothing to probe')
  process.exit(0)
}

/**
 * Resolve a release asset URL without downloading it.
 *
 * A ranged GET rather than HEAD: GitHub answers HEAD on a release asset
 * inconsistently once the redirect to object storage is followed, while
 * `Range: bytes=0-0` returns a clean 206 for a live asset and 404 for a
 * missing one, at the cost of a single byte.
 */
async function probe(url) {
  try {
    const r = await fetch(url, {
      headers: { range: 'bytes=0-0', 'user-agent': 'awesome-dsh-plugin-tarball-probe' },
      redirect: 'follow',
      signal: AbortSignal.timeout(30000),
    })
    if (r.body) await r.body.cancel().catch(() => {})
    // 404 and 410 are the asset genuinely not being there. Anything else that
    // is not a success — a 5xx, a throttle — means we did not get to look, and
    // "we could not check" must not be recorded as "it is dead": that would
    // strip a working install command from the site on a transient blip.
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

for (let i = 0; i < entries.length; i += CONCURRENCY) {
  const batch = entries.slice(i, i + CONCURRENCY)
  const results = await Promise.all(batch.map(async (e) => [e, await probe(e.tarball)]))
  for (const [e, r] of results) {
    if (r.ok === null) {
      // Keep the last verdict for this exact tarball URL rather than inventing
      // one. If the URL changed since, there is nothing to carry over.
      const prev = previous[e.url]
      if (prev && prev.tarball === e.tarball) out[e.url] = prev
      unknown.push(`${e.url} — HTTP ${r.status}${r.error ? ` (${r.error})` : ''}`)
      continue
    }
    out[e.url] = { tarball: e.tarball, ok: r.ok, status: r.status, checkedAt: today }
    if (!r.ok) dead.push(`${e.url}\n      ${e.tarball} — HTTP ${r.status}`)
  }
}

const sorted = Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)))
fs.writeFileSync(OUT_FILE, JSON.stringify(sorted, null, 1) + '\n')

const live = Object.values(sorted).filter((v) => v.ok).length
console.log(`tarballs: ${entries.length} declared, ${live} live, ${dead.length} dead, ${unknown.length} unchecked`)

if (dead.length) {
  console.log('dead tarballs (the field is dropped from the site; the git install command still works):')
  for (const d of dead) console.log(`  ${d}`)
}
// Same discipline as the submission gate: say which ones were not established
// rather than letting a silent count imply everything was looked at.
if (unknown.length) {
  console.log('could not be checked this run (previous verdict kept):')
  for (const u of unknown) console.log(`  ${u}`)
}

// A tarball whose URL contains its version and resolves `latest` at request
// time works today and 404s on the author's next release. Reported as a
// warning, not a failure — it is the author's URL to fix, and #1619 is the
// standing record of the pattern.
const rotProne = entries.filter((e) => e.tarball.includes('/releases/latest/download/') && /\d+\.\d+/.test(e.tarball.split('/').pop()))
if (rotProne.length) {
  console.log(`${rotProne.length} tarball(s) will break on the author's next release (version in the filename under /releases/latest/download/):`)
  for (const e of rotProne) console.log(`  ${e.tarball}`)
}

if (STRICT && dead.length) process.exit(1)
