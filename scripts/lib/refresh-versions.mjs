#!/usr/bin/env node
/**
 * Pure helpers for the version-only refresh pass (scripts/probe-versions.mjs).
 *
 * Why this pass exists: `data/npm-map.json` holds the version the site and the
 * in-app market display, but only the nightly PROBE_ALL run rewrites it, so a
 * plugin published after the nightly keeps showing yesterday's version for up
 * to a day (issue #11337). This module decides *whether* an entry needs a
 * refresh and *what* a successful packument does to it — and nothing else, so
 * the failure semantics stay testable without a network.
 *
 * Invariants (agreed on #11337):
 *   - An entry becomes `npm: null` only through the full probe. This pass never
 *     re-decides the verdict; it only refreshes an entry that already names a
 *     package.
 *   - A failed request skips the entry entirely: no write, and no `checkedAt`
 *     bump (ageDays() uses it to expire unpublished verdicts, so stamping a
 *     failed request would make a rate-limited build look healthy).
 *   - A packument without `dist-tags.latest` keeps the previous version,
 *     publishedAt and enginesDsh instead of blanking them.
 */

/** Refresh an entry only when its last successful check is older than this. */
export const DEFAULT_MAX_AGE_HOURS = 6

/** True when the entry names a package and its verdict is older than maxAgeMs. */
export function needsRefresh(entry, { nowMs, maxAgeMs }) {
  if (!entry || typeof entry.npm !== 'string' || entry.npm === '') return false
  const checked = entry.checkedAt ? Date.parse(entry.checkedAt) : NaN
  if (!Number.isFinite(checked)) return true
  return nowMs - checked >= maxAgeMs
}
/**
 * The entry after a successful packument fetch. Never returns anything but a
 * full entry: the caller must not call this for a failed fetch.
 *
 * `stamp` is a full ISO timestamp, not a bare date. `probe-npm.mjs` writes
 * `checkedAt` as `YYYY-MM-DD`, which parses to UTC midnight, so a date-only
 * value cannot express "checked two hours ago" — an age gate keyed on it would
 * reopen the whole catalog on any build after 06:00 UTC. Writing a timestamp
 * here keeps the gate meaningful; `ageDays()` in probe-npm.mjs does
 * `new Date(checkedAt)`, so it reads both shapes (date-only rows from the
 * nightly simply look up to a day old and get refreshed once).
 *
 * Only the no-latest branch carries prior facts forward. On the success branch
 * absent publish facts are written as null, matching `publishFields()` in
 * probe-npm.mjs: a release that declares no `engines.dsh` must land in the
 * site's "declares nothing" bucket instead of inheriting the previous version's
 * range, and a missing `time[latest]` must not date the new version to the
 * previous release.
 */
export function nextEntry(entry, meta, stamp) {
  const latest = typeof meta?.['dist-tags']?.latest === 'string' ? meta['dist-tags'].latest : null
  if (latest === null) {
    return {
      npm: entry.npm,
      version: typeof entry.version === 'string' ? entry.version : null,
      publishedAt: Number.isInteger(entry.publishedAt) ? entry.publishedAt : null,
      enginesDsh: typeof entry.enginesDsh === 'string' ? entry.enginesDsh : null,
      checkedAt: stamp,
    }
  }
  const iso = meta.time?.[latest]
  const seconds = typeof iso === 'string' ? Math.floor(Date.parse(iso) / 1000) : NaN
  const engines = meta.versions?.[latest]?.engines
  const dsh = typeof engines === 'object' && engines !== null && typeof engines.dsh === 'string' ? engines.dsh : null
  return {
    npm: entry.npm,
    version: latest,
    publishedAt: Number.isInteger(seconds) && seconds > 0 ? seconds : null,
    enginesDsh: dsh,
    checkedAt: stamp,
  }
}

/** Did a refresh change any fact we display? Used only for the build summary. */
export function isChanged(before, after) {
  return (
    before.version !== after.version
    || before.publishedAt !== after.publishedAt
    || before.enginesDsh !== after.enginesDsh
  )
}

/**
 * Apply the refresh to a map of entries. Never mutates the input: returns a new
 * map plus the counts the build prints. `fetchPackument` is injected so the
 * failure path (a throwing stub) is testable without a network.
 */
export async function refreshEntries(map, { nowMs, maxAgeMs, stamp, fetchPackument, concurrency = 8 }) {
  const next = { ...map }
  const due = Object.keys(map).filter((url) => needsRefresh(map[url], { nowMs, maxAgeMs }))
  let refreshed = 0
  let changed = 0
  let skipped = 0
  for (let i = 0; i < due.length; i += concurrency) {
    const batch = due.slice(i, i + concurrency)
    const results = await Promise.all(
      batch.map(async (url) => {
        try {
          return [url, await fetchPackument(map[url].npm)]
        } catch {
          return [url, null]
        }
      }),
    )
    for (const [url, meta] of results) {
      if (meta === null) {
        skipped += 1 // no write, and no checkedAt bump
        continue
      }
      const before = next[url]
      const after = nextEntry(before, meta, stamp)
      if (isChanged(before, after)) changed += 1
      next[url] = after
      refreshed += 1
    }
  }
  return { map: next, refreshed, changed, skipped, due: due.length }
}
