#!/usr/bin/env node
/**
 * Probe which listed plugins are published on npm, so consumers (site,
 * find-plugin, dsh-market) can prefer registry installs over full-repo
 * GitHub tarballs.
 *
 * For every plugin URL in the default-locale README that is missing from
 * data/npm-map.json (or was last checked unpublished over a day ago):
 *   1. read the repo's package.json name from raw.githubusercontent.com
 *   2. accept it only when registry.npmjs.org has that package AND its
 *      repository URL points back at the same GitHub repo (guards against
 *      name squatting and unrelated packages)
 *
 * Results are cached in data/npm-map.json:
 *   { "<github url>": { npm, version, checkedAt } }
 * `version` is the registry `dist-tags.latest` when known, else null.
 * The key is always written once a published (or not) verdict is recorded so
 * consumers can tell "not backfilled yet" (key absent) from "probed, no
 * latest tag" (`version: null`). dsh-market reads it from plugins.json
 * (dsh-market#348). Recording `latest` on the full probe adds no extra
 * request; the packument is already fetched.
 *
 * Published package *names* stay cached. Version freshness in CI comes from
 * the nightly `PROBE_ALL` full pass. Rows that predate the `version` field
 * get a one-shot registry-only backfill (key absent → fetch once, write the
 * key). Network failures leave the existing entry untouched. A packument
 * missing `dist-tags.latest` does not wipe a previously recorded string.
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

// A full pass asks raw.githubusercontent for a package.json per entry and the
// registry for a packument per hit, in bursts of CONCURRENCY. GitHub answers
// burst traffic with 429 (and occasionally 5xx or a reset socket); a probe that
// gives up on that answers null, and a null for a URL we have never seen is
// recorded as "no npm package" — which is what makes a card display the
// host-requirement-unavailable fallback until the next night. Retry transient
// failures with exponential backoff instead of turning them into a verdict.
const ATTEMPTS = Math.max(1, Number(process.env.PROBE_ATTEMPTS ?? 4))
const RETRY_BASE_MS = Math.max(0, Number(process.env.PROBE_RETRY_BASE_MS ?? 400))
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const isRetryableStatus = (status) => status === 408 || status === 429 || status >= 500

const map = fs.existsSync(MAP_FILE) ? JSON.parse(fs.readFileSync(MAP_FILE, 'utf8')) : {}

const readme = fs.readFileSync(LOCALES[0].readme, 'utf8')
const urls = [...readme.matchAll(/^- \[.+?\]\((https:\/\/github\.com\/[^)]+)\) [—-] /gm)].map((m) => m[1])

const today = new Date().toISOString().slice(0, 10)
const ageDays = (entry) =>
  entry?.checkedAt ? (Date.now() - new Date(entry.checkedAt).getTime()) / 86400000 : Infinity

const priorVersion = (url) => {
  const v = map[url]?.version
  return typeof v === 'string' ? v : null
}

const hasVersionKey = (entry) => Object.prototype.hasOwnProperty.call(entry ?? {}, 'version')

// Full probe: unknown, forced, or an expired "not on npm" verdict.
const needsFullProbe = (entry) =>
  PROBE_ALL
  || entry === undefined
  || (entry.npm === null && ageDays(entry) > RECHECK_DAYS)

// One-shot backfill for map rows that predate the version field. Not an
// ongoing refresh — nightly PROBE_ALL already renews versions via full probe.
const needsVersionBackfill = (entry) => Boolean(entry?.npm) && !hasVersionKey(entry)

// One-shot backfill for rows recorded before the publish-time field existed.
// `publishedAt` is what the plugin market index needs per version
// (https://awesome-dsh-plugin.com/index.json), and the packument this probe
// already reads carries `time` — so this costs no extra request beyond the
// one the row needs anyway.
const hasPublishKey = (entry) => Object.prototype.hasOwnProperty.call(entry ?? {}, 'publishedAt')
const needsPublishBackfill = (entry) => Boolean(entry?.npm) && hasVersionKey(entry) && !hasPublishKey(entry)

const pendingFull = urls.filter((url) => needsFullProbe(map[url]))
const pendingVersion = urls.filter((url) => !needsFullProbe(map[url]) && needsVersionBackfill(map[url]))
const pendingPublish = urls.filter((url) => !needsFullProbe(map[url]) && !needsVersionBackfill(map[url]) && needsPublishBackfill(map[url]))
console.log(`${urls.length} listed, ${pendingFull.length} full probe(s), ${pendingVersion.length} version backfill(s), ${pendingPublish.length} publish-time backfill(s)`)

async function fetchJson(url, attempt = 1) {
  try {
    const res = await fetch(url, {
      headers: { accept: 'application/json', 'user-agent': 'awesome-dsh-plugin-npm-probe' },
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) {
      const err = new Error(`HTTP ${res.status}`)
      err.status = res.status
      throw err
    }
    return await res.json()
  } catch (err) {
    // Status-carrying errors retry only when the status is transient; a 404 is
    // also a real answer ("this repo has no package.json"), just not a verdict
    // this helper can draw, so it is handed back to the caller unchanged.
    const transient =
      err.status === undefined
        ? err.name === 'TimeoutError' || err.name === 'AbortError' || err.name === 'TypeError'
        : isRetryableStatus(err.status)
    if (!transient || attempt >= ATTEMPTS) throw err
    const backoff = RETRY_BASE_MS * 2 ** (attempt - 1)
    await sleep(backoff + Math.floor(Math.random() * backoff))
    return fetchJson(url, attempt + 1)
  }
}

/**
 * Publish facts of the `latest` version, straight from the packument this
 * probe already fetched: the market index needs a Unix-seconds publish time
 * per version, and the Discover tab filters by the DSH range a package
 * declares (`engines.dsh`). Absent values are recorded as null so a later
 * pass can tell "known absent" from "not backfilled yet".
 */
function publishFields(meta, latest) {
  if (latest === null) return { publishedAt: null, enginesDsh: null }
  const iso = meta.time?.[latest]
  const seconds = typeof iso === 'string' ? Math.floor(Date.parse(iso) / 1000) : NaN
  const manifest = meta.versions?.[latest]
  const engines = manifest?.engines
  const dsh = typeof engines === 'object' && engines !== null && typeof engines.dsh === 'string' ? engines.dsh : null
  return {
    publishedAt: Number.isInteger(seconds) && seconds > 0 ? seconds : null,
    enginesDsh: dsh,
  }
}

async function probe(url) {
  const repoPath = url.replace('https://github.com/', '').replace(/\/$/, '')
  const repo = repoPath.split('/').slice(0, 2).join('/')
  const sub = repoPath.includes('/tree/') ? repoPath.split('/tree/')[1].replace(/^[^/]+\//, '') : null
  try {
    const pkg = await fetchJson(`https://raw.githubusercontent.com/${repo}/HEAD/${sub ? sub + '/' : ''}package.json`)
    const name = typeof pkg.name === 'string' ? pkg.name : null
    if (name === null) return { npm: null, version: null, checkedAt: today }
    const meta = await fetchJson(`https://registry.npmjs.org/${encodeURIComponent(name)}`)
    // Registry documents can retain repository metadata from the first
    // publication at the top level. Resolve the current `latest` manifest
    // first so repository renames in later releases are recognized.
    const latest = typeof meta['dist-tags']?.latest === 'string' ? meta['dist-tags'].latest : null
    const repository = (latest === null ? null : meta.versions?.[latest]?.repository) ?? meta.repository
    const repoField = typeof repository === 'string' ? repository : repository?.url ?? ''
    const linked = repoField.toLowerCase().includes(repo.toLowerCase())
    if (!linked) return { npm: null, version: null, checkedAt: today }
    // Always write the version key. Keep a prior string when latest is absent.
    return {
      npm: name,
      version: latest ?? priorVersion(url),
      ...publishFields(meta, latest),
      checkedAt: today,
    }
  } catch (err) {
    // A 404 on package.json is an answer: this repo publishes no package. Any
    // other failure (network, retries exhausted) is not, so it stays null and
    // the row is left for the next run to retry.
    if (err?.status === 404) return { npm: null, version: null, checkedAt: today }
    return null // network failure — keep whatever we had, retry next run
  }
}

/** One-shot dist-tags.latest backfill for a package already confirmed published. */
async function backfillVersion(url) {
  const name = map[url]?.npm
  if (typeof name !== 'string') return null
  try {
    const meta = await fetchJson(`https://registry.npmjs.org/${encodeURIComponent(name)}`)
    const latest = typeof meta['dist-tags']?.latest === 'string' ? meta['dist-tags'].latest : null
    // Write the key even when latest is missing (null), so push-time backfill
    // does not re-trigger forever on typeof-null checks.
    return { npm: name, version: latest ?? priorVersion(url), ...publishFields(meta, latest), checkedAt: today }
  } catch {
    return null
  }
}

const failedProbes = []

async function runBatch(label, pending, worker) {
  let done = 0
  for (let i = 0; i < pending.length; i += CONCURRENCY) {
    const batch = pending.slice(i, i + CONCURRENCY)
    const results = await Promise.all(batch.map(async (url) => [url, await worker(url)]))
    for (const [url, result] of results) {
      if (result !== null) map[url] = result
      else if (map[url] === undefined) {
        // No prior row and no answer: record the failure without a checkedAt,
        // so needsFullProbe() retries it on the next run instead of caching
        // "not on npm" for a whole day.
        map[url] = { npm: null, version: null, checkedAt: null }
        failedProbes.push(url)
      }
    }
    done += batch.length
    console.log(`${label} ${done}/${pending.length}`)
  }
}

await runBatch('full', pendingFull, probe)
await runBatch('version-backfill', pendingVersion, backfillVersion)
await runBatch('publish-backfill', pendingPublish, backfillVersion)

const listed = new Set(urls)
for (const k of Object.keys(map)) if (!listed.has(k)) delete map[k]

const sorted = Object.fromEntries(Object.entries(map).sort(([a], [b]) => a.localeCompare(b)))
fs.writeFileSync(MAP_FILE, JSON.stringify(sorted, null, 1) + '\n')
const published = Object.values(sorted).filter((e) => e.npm !== null).length
const withVersion = Object.values(sorted).filter((e) => typeof e.version === 'string').length
console.log(`npm-map written: ${published}/${Object.keys(sorted).length} published on npm, ${withVersion} with version`)
if (failedProbes.length > 0) {
  console.log(`${failedProbes.length} probe(s) failed after retries and kept no verdict; the next run retries them`)
}
