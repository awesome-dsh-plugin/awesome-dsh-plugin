#!/usr/bin/env node
// Catch a site that quietly stopped being deployed.
//
// The freeze this guards against left no trace anywhere: from 2026-09-09 to
// 2026-09-25 every scheduled `build-site` run failed, and dshmarket.com kept
// serving the 2026-09-08 catalog the whole time — 3,363 plugin pages live
// against 4,347 in the catalog, so 1,082 plugins simply had no page. Nothing
// failed loudly, because nothing watched the thing that actually went stale:
// the deployed bytes.
//
// So this reads the live site rather than CI's own report. That also covers a
// failure no log can show — a schedule that stops running altogether, which is
// what GitHub does to a scheduled workflow after 60 days of repository
// inactivity. One signal, measured end to end.
//
// The site must carry a plugin link for every entry its catalog holds. It is
// allowed to be `tolerance` entries behind, because entries land between a
// build and this check: measured 2026-09-03..09-25 the catalog grew 62.5
// entries/day on average, 205 on its busiest day. 300 therefore rides out a
// burst, and still catches a freeze inside its first week rather than its
// third.
//
// Usage:
//   node scripts/check-site-health.mjs --live <url> --catalog-url <url> [--tolerance N]
//   node scripts/check-site-health.mjs --live <url> --catalog-dir <dir> [--tolerance N]
//
// Use --catalog-dir when the catalog is built and published by the same run
// that builds the pages: comparing that site against its own published catalog
// would compare it against itself, so the repository is the truth instead.
//
// Exits 1 with the numbers and the reason on every failure, a fetch error
// included: "could not check" must never be mistaken for "all good".

import { readdirSync } from 'node:fs'

const args = new Map()
for (let i = 2; i < process.argv.length; i += 2) {
  args.set(process.argv[i].replace(/^--/, ''), process.argv[i + 1])
}

const live = args.get('live')
const catalogUrl = args.get('catalog-url')
const catalogDir = args.get('catalog-dir')
const tolerance = Number(args.get('tolerance') ?? 300)

// A plugin page link, as both sites render it: href="/p/<slug>/". Anchored to
// the exact path so a locale-prefixed link or an asset URL cannot inflate it.
const PAGE_LINK = /href="\/p\/[^"#?]*"/g

function fail(lines) {
  console.error(`\nFAIL — site health check could not confirm the site is current.\n${lines}\n`)
  process.exit(1)
}

async function fetchText(url, attempts = 3) {
  let last
  for (let i = 1; i <= attempts; i++) {
    try {
      const res = await fetch(url, {
        redirect: 'follow',
        headers: { 'user-agent': 'dsh-site-health-check' },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
      return await res.text()
    } catch (err) {
      last = err
      if (i < attempts) await new Promise((r) => setTimeout(r, 2000 * i))
    }
  }
  throw new Error(`${url} — ${last.message}`)
}

function countLivePages(html) {
  return new Set(html.match(PAGE_LINK) ?? []).size
}

function countCatalog(dir) {
  const files = readdirSync(dir).filter((f) => /\.(ya?ml|json)$/.test(f))
  if (files.length === 0) throw new Error(`${dir} — no catalog entries found`)
  return files.length
}

if (!live) fail('  what:  --live <url> is required')
if (!catalogUrl && !catalogDir) fail('  what:  one of --catalog-url <url> or --catalog-dir <dir> is required')
if (!Number.isFinite(tolerance) || tolerance < 0) fail(`  what:  --tolerance must be a non-negative number, got ${args.get('tolerance')}`)

let expected
let catalogFrom
try {
  if (catalogDir) {
    expected = countCatalog(catalogDir)
    catalogFrom = catalogDir
  } else {
    const text = await fetchText(catalogUrl)
    let data
    try {
      data = JSON.parse(text)
    } catch (err) {
      throw new Error(`${catalogUrl} — response was not JSON (${err.message})`)
    }
    const entries = [data.plugins, data.items, data.entries].find(Array.isArray)
    if (!entries) throw new Error(`${catalogUrl} — no plugins/items/entries array to count`)
    expected = entries.length
    catalogFrom = catalogUrl
  }
} catch (err) {
  fail(
    `  what:  the catalog could not be read — ${err.message}\n` +
    `  why:   this check cannot tell a stale site from an unreadable catalog,\n` +
    `         so it reports the failure rather than passing silently.\n` +
    `  next:  confirm the catalog source is reachable, then re-run this workflow.`
  )
}

let actual
try {
  actual = countLivePages(await fetchText(live))
} catch (err) {
  fail(
    `  what:  the live site could not be read — ${err.message}\n` +
    `  why:   this check cannot tell a stale site from an unreachable one, so it\n` +
    `         reports the failure rather than passing silently.\n` +
    `  next:  confirm ${live} responds, then re-run this workflow.`
  )
}

if (expected === 0) {
  fail(`  what:  ${catalogFrom} lists 0 entries`)
}

const gap = expected - actual
console.log(`live site   ${live}`)
console.log(`            ${actual} plugin pages`)
console.log(`catalog     ${catalogFrom}`)
console.log(`            ${expected} entries`)
console.log(`gap         ${gap} (tolerance ${tolerance})`)

if (gap > tolerance) {
  fail(
    `  what:  the deployed site is ${gap} entries behind the catalog — ${live}\n` +
    `         lists ${actual} plugin pages, the catalog holds ${expected}.\n` +
    `         That is more than the ${tolerance} allowed, so those entries have no page.\n` +
    `  why:   the site is no longer being rebuilt and deployed from the current\n` +
    `         catalog. The "Build site" workflow has most likely been failing, or\n` +
    `         has stopped being scheduled at all.\n` +
    `  next:  open the Actions tab on this repository, read the most recent\n` +
    `         "Build site" run, and re-run it. A successful deploy turns this green\n` +
    `         on the next run of this workflow.`
  )
}

console.log('OK — the site lists a page for every catalog entry, within tolerance.')
