#!/usr/bin/env node
/**
 * Refresh npm download counts for every listed plugin that IS published to
 * npm, into data/downloads.json, consumed by build-site.mjs so plugins.json
 * carries a `downloads` field.
 *
 * Only ever covers the subset of entries probe-npm.mjs already confirmed as
 * published (data/npm-map.json). A github:-only entry has no npm package and
 * therefore no download count to fetch — that is a coverage gap, not a probe
 * failure, and this script never invents a number for one.
 *
 * "last-month" (a rolling 30-day window from api.npmjs.org), not lifetime:
 * the whole point of this field is to answer "is this getting used lately",
 * the same question stars answers badly. A lifetime total would just become
 * a second star count that never comes back down once inflated by an old
 * spike.
 *
 * npmjs.org's bulk endpoint (up to 128 names per call) does not accept
 * scoped packages at all — a single `@scope/name` in the list 400s the WHOLE
 * batch, not just that entry (measured). Scoped and unscoped names are
 * therefore probed on two different paths: unscoped in chunks of 128,
 * scoped one at a time under the same concurrency cap as everything else
 * here. A name missing from a successful batch response (unpublished since
 * probe-npm.mjs last confirmed it) comes back as `null` for that key rather
 * than failing the batch — treated as 0, not as a probe failure.
 *
 * Results live in data/downloads.json: { "<github url>": { downloads, checkedAt } }.
 * That file is COMMITTED, like data/stars.json and for the same reason (#1673):
 * the "a failed probe keeps whatever was on disk" rule below is worth nothing
 * if nothing is ever on disk. It was not committed until 2026-08-19, so every
 * run started empty and every failure became a published `null`.
 * Re-probed daily, like stars — download counts move day to day and staleness
 * defeats the point of the field. A failed probe (network/5xx) keeps
 * whatever value was already on disk, same discipline as probe-stars.mjs.
 *
 * Usage: node scripts/probe-downloads.mjs
 */
import fs from 'node:fs'

const NPM_MAP_FILE = 'data/npm-map.json'
const DOWNLOADS_FILE = 'data/downloads.json'
const CONCURRENCY = 8
const BATCH_SIZE = 128
const RECHECK_DAYS = Number(process.env.PROBE_RECHECK_DAYS ?? 1)
const PROBE_ALL = process.env.PROBE_ALL === '1'
// Coverage is judged against the npm-published SUBSET, not the whole catalog
// — a github:-only entry was never going to have a download count, and
// counting it against this floor would make the floor unreachable. Kept
// identical in spirit to STARS_MIN_COVERAGE in build-site.mjs: losing more
// than a third of the entries THIS SCRIPT IS RESPONSIBLE FOR is a broken
// probe (exhausted quota, an npmjs.org outage), not attrition.
const MIN_COVERAGE = 0.66

if (!fs.existsSync(NPM_MAP_FILE)) {
  console.log(`${NPM_MAP_FILE} does not exist yet — run probe-npm.mjs first`)
  process.exit(0)
}
const npmMap = JSON.parse(fs.readFileSync(NPM_MAP_FILE, 'utf8'))
const published = Object.entries(npmMap).filter(([, entry]) => entry?.npm)
console.log(`${published.length} listed entries are published to npm`)

const map = fs.existsSync(DOWNLOADS_FILE) ? JSON.parse(fs.readFileSync(DOWNLOADS_FILE, 'utf8')) : {}
const today = new Date().toISOString().slice(0, 10)

const fresh = (entry) =>
  !PROBE_ALL
  && entry !== undefined
  && entry.checkedAt
  && (Date.now() - new Date(entry.checkedAt).getTime()) / 86400000 <= RECHECK_DAYS

const pending = published.filter(([url]) => !fresh(map[url]))
console.log(`${pending.length} to probe${PROBE_ALL ? ' (PROBE_ALL)' : ''}`)

// api.npmjs.org rate-limits a runner after roughly 40 individual requests and
// then rejects the rest instantly. Measured on 2026-08-19: the scoped loop's
// first 40 packages took ~0.25s per batch of 8, every batch after that
// finished in ~0.013s — not network round trips, refusals. 94 of 134 scoped
// packages had come back empty on every build for days because of it, and
// `@liustack/modlens` (63,829 downloads/month) published as `null`.
//
// Retrying is the whole fix: the limiter is per-window, so backing off and
// asking again works, while firing 134 requests flat out never will.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function fetchJson(url, { attempts = 6 } = {}) {
  let wait = 1000
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url, {
      headers: { accept: 'application/json', 'user-agent': 'awesome-dsh-plugin-downloads-probe' },
      signal: AbortSignal.timeout(10000),
    })
    if (res.ok || res.status === 404) return res.json()
    // 429 and 5xx are "ask again later"; anything else is a real error.
    if ((res.status === 429 || res.status >= 500) && attempt < attempts) {
      const after = Number(res.headers.get('retry-after'))
      await sleep(Number.isFinite(after) && after > 0 ? after * 1000 : wait)
      wait *= 2
      continue
    }
    throw new Error(`HTTP ${res.status}`)
  }
}

let ok = 0
let failed = 0
// A failed probe is only harmless if there is something on disk to fall back
// to. Where there is not, the entry publishes as `downloads: null` — which in
// plugins.json is indistinguishable from "this plugin has no npm package at
// all". Consumers cannot tell a coverage gap from a fetch we got wrong, so
// count these separately and refuse to publish a run full of them.
let failedNoPrior = 0

// Unscoped names: batched. A name npm has no record of (unpublished since
// probe-npm.mjs last confirmed it) comes back `null` in the response body —
// that is 0 downloads, a fact this script learned, not a request failure.
const unscoped = pending.filter(([, entry]) => !entry.npm.startsWith('@'))
for (let i = 0; i < unscoped.length; i += BATCH_SIZE) {
  const batch = unscoped.slice(i, i + BATCH_SIZE)
  const names = batch.map(([, entry]) => entry.npm)
  try {
    const body = await fetchJson(`https://api.npmjs.org/downloads/point/last-month/${names.map(encodeURIComponent).join(',')}`)
    for (const [url, entry] of batch) {
      const downloads = typeof body[entry.npm]?.downloads === 'number' ? body[entry.npm].downloads : 0
      map[url] = { downloads, checkedAt: today }
      ok++
    }
  } catch {
    failed += batch.length // keep whatever was already on disk for this batch
    for (const [url] of batch) if (map[url] === undefined) failedNoPrior++
  }
  console.log(`unscoped ${Math.min(i + BATCH_SIZE, unscoped.length)}/${unscoped.length}`)
}

// Scoped names: one request each — npm's bulk endpoint rejects the whole
// batch outright if it contains even one `@scope/name` (measured).
const scoped = pending.filter(([, entry]) => entry.npm.startsWith('@'))
async function probeScoped([url, entry]) {
  try {
    const body = await fetchJson(`https://api.npmjs.org/downloads/point/last-month/${encodeURIComponent(entry.npm)}`)
    const downloads = typeof body.downloads === 'number' ? body.downloads : 0
    map[url] = { downloads, checkedAt: today }
    ok++
  } catch {
    failed++ // keep whatever was already on disk
    if (map[url] === undefined) failedNoPrior++
  }
}
// Deliberately narrower than CONCURRENCY and paced. These are one request per
// package against a limiter that counts requests per window, so going wide
// here does not finish sooner — it just spends the whole allowance in the
// first few seconds and then retries into a wall.
// One at a time, with a real pause between each. This is a nightly job that
// nothing waits on, so there is no reason to hurry: 134 packages at 2s each is
// about four and a half minutes.
//
// Speed was the whole bug. Firing 8 at once spent the per-window allowance in
// the first few seconds and got 94 of 134 refused instantly; dropping to 3
// concurrent with a 250ms gap did *worse* (86/134), because what the limiter
// counts is requests per window, not how many are in flight. Pacing is the
// only lever that actually moves this, so it is set well below any rate the
// limiter objects to rather than tuned to just barely pass.
const SCOPED_PAUSE_MS = Number(process.env.SCOPED_PAUSE_MS ?? 2000)
for (let i = 0; i < scoped.length; i++) {
  await probeScoped(scoped[i])
  if ((i + 1) % 20 === 0 || i + 1 === scoped.length) console.log(`scoped ${i + 1}/${scoped.length}`)
  if (i + 1 < scoped.length) await sleep(SCOPED_PAUSE_MS)
}

if (failed) {
  const kept = failed - failedNoPrior
  console.log(`${failed} of ${pending.length} probe(s) failed — ${kept} kept a previous value, ${failedNoPrior} had none`)
}

// Drop entries no longer published (probe-npm.mjs's own verdict is authority
// here, not this script's) or no longer listed at all.
const publishedUrls = new Set(published.map(([url]) => url))
for (const url of Object.keys(map)) if (!publishedUrls.has(url)) delete map[url]

// Same discipline as probe-stars.mjs (#1673): never let a run where almost
// everything failed overwrite good data with a near-empty result. Judged
// against the npm-published subset — that is the only population this script
// could ever have covered.
const have = Object.keys(map).length
const coverage = published.length ? have / published.length : 1

// Judged per population, not just overall. Scoped and unscoped go out over two
// different endpoints with two different failure modes, and on 2026-08-19 the
// overall figure hid a total collapse of one of them: 530/624 = 85% sailed
// past the floor while scoped coverage was 40/134 = 30%, because 490/490
// unscoped successes averaged it away. An aggregate that can be held up by the
// healthy half is not a check on the sick one.
const pop = (label, subset) => {
  const covered = subset.filter(([url]) => map[url] !== undefined).length
  return { label, covered, total: subset.length, ratio: subset.length ? covered / subset.length : 1 }
}
const populations = [
  pop('scoped', published.filter(([, e]) => e.npm.startsWith('@'))),
  pop('unscoped', published.filter(([, e]) => !e.npm.startsWith('@'))),
].filter((p) => p.total > 0)
for (const p of populations) console.log(`${p.label}: ${p.covered}/${p.total} (${(p.ratio * 100).toFixed(1)}%)`)
const starved = populations.filter((p) => p.ratio < MIN_COVERAGE)
if (pending.length && ok === 0) {
  console.warn(`every one of the ${pending.length} probe(s) failed — nothing refreshed this run`)
  console.warn('Usually an exhausted quota or an npmjs.org API outage, not a data problem.')
}
if (starved.length) {
  for (const p of starved) {
    console.error(`only ${p.covered}/${p.total} ${p.label} packages have a download count (${(p.ratio * 100).toFixed(1)}%), below the ${MIN_COVERAGE * 100}% floor — not writing ${DOWNLOADS_FILE}`)
  }
  console.error('Refusing to publish a run that lost a whole class of packages. Those entries would')
  console.error(`ship as \`downloads: null\`, which readers cannot tell apart from "no npm package".`)
  process.exit(1)
}
if (coverage < MIN_COVERAGE) {
  console.error(`only ${have}/${published.length} npm-published entries have a download count (${(coverage * 100).toFixed(1)}%), below the ${MIN_COVERAGE * 100}% floor — not writing ${DOWNLOADS_FILE}`)
  console.error('Refusing to replace the committed data with a result this incomplete. Re-run once whatever')
  console.error('broke (quota, npmjs.org outage) has recovered; PROBE_ALL=1 forces a full refresh.')
  process.exit(1)
}
if (ok === 0 && pending.length) {
  console.log(`${DOWNLOADS_FILE} left as-is (${have} packages, nothing new to record)`)
  process.exit(0)
}

const sorted = Object.fromEntries(Object.entries(map).sort(([a], [b]) => a.localeCompare(b)))
fs.writeFileSync(DOWNLOADS_FILE, JSON.stringify(sorted, null, 1) + '\n')
console.log(`downloads.json written: ${Object.keys(sorted).length} packages (${ok} refreshed this run)`)
