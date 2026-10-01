#!/usr/bin/env node
/**
 * Scan every listed plugin for the capabilities it touches, into
 * data/capabilities.json, consumed by build-site.mjs so plugins.json carries
 * `capabilities` / `redLines` per entry.
 *
 * The facts are DISCLOSURE, never a verdict (#209): nothing here writes
 * "safe", an entry that could not be scanned is simply absent from the file,
 * and the surfaces print that absence as 未检出. The scanner itself
 * (`dsh-trust-check`, MIT) executes no code, opens no sockets and needs no
 * model — it reads the extracted tree and reports `文件:行号` for each hit.
 *
 * Where the tree comes from follows what a user would install (see
 * lib/capabilities.mjs): the npm tarball when the entry is published there,
 * the author's prebuilt release when that is the only distribution, and the
 * repository's own codeload artifact otherwise. Subdirectory entries
 * (`/tree/<ref>/<sub>`) are scanned at the subdirectory, because that is the
 * package the user gets — the monorepo root would report its siblings.
 *
 * Incremental by release, then by age: a new npm version invalidates the
 * record, a branch tarball (which can change under the same URL) expires
 * after RECHECK_DAYS. A failed download or a scanner crash KEEPS the previous
 * record on disk and is reported in the summary; it never writes an empty
 * capability list, because "we could not look" and "we looked and saw
 * nothing" are different sentences and only one of them is true.
 *
 * Usage:
 *   node scripts/probe-capabilities.mjs                 # incremental pass
 *   PROBE_ALL=1 node scripts/probe-capabilities.mjs     # every entry
 *   node scripts/probe-capabilities.mjs --limit=20      # first N unscanned
 *
 * The scanner is pinned HERE rather than resolved at run time; bumping it is a
 * reviewed change (its schemaVersion, not its npm version, is what this code
 * reads — see lib/capabilities.mjs).
 */
import fs from 'node:fs'
import os from 'node:os'
import { join } from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { readEntries } from './lib/entries.mjs'
import { SCANNER_SCHEMA, factsFromScan, scanSourceFor, shouldRescan, subdirOf } from './lib/capabilities.mjs'

const OUT_FILE = 'data/capabilities.json'
const NPM_MAP_FILE = 'data/npm-map.json'
const TARBALLS_FILE = 'data/tarballs.json'
const TOOL = process.env.CAPABILITY_SCANNER ?? 'dsh-trust-check@0.1.13'

/**
 * How to invoke the scanner.
 *
 * `npm ci` installs it (a devDependency, so the pin lives in package.json and
 * the lockfile rather than in this string, and a bump is a reviewed diff), and
 * the local binary is what a normal run uses. `npx` remains the fallback so a
 * checkout without node_modules still works — it costs about a second per
 * entry, which over four thousand entries is the difference between a nightly
 * pass and an hour.
 */
function scannerCommand() {
  if (process.env.CAPABILITY_SCANNER !== undefined && process.env.CAPABILITY_SCANNER !== '') return process.env.CAPABILITY_SCANNER
  return fs.existsSync('node_modules/.bin/dsh-trust-check') ? 'node_modules/.bin/dsh-trust-check' : 'npx'
}

function scannerArgs(packageDir, spec) {
  return scannerCommand() === 'npx'
    ? ['--yes', TOOL, '--dir', packageDir, '--spec', spec, '--json']
    : ['--dir', packageDir, '--spec', spec, '--json']
}
const CONCURRENCY = Number(process.env.PROBE_CONCURRENCY ?? 6)
const RECHECK_DAYS = Number(process.env.PROBE_RECHECK_DAYS ?? 7)
const SCAN_TIMEOUT_MS = Number(process.env.PROBE_SCAN_TIMEOUT_MS ?? 120_000)
const LIMIT = Number(/^--limit=(\d+)$/.exec(process.argv[2] ?? '')?.[1] ?? '') || Infinity
const PROBE_ALL = process.env.PROBE_ALL === '1'
// How often the file is rewritten during a pass (see flush()).
const FLUSH_EVERY = Number(process.env.PROBE_FLUSH_EVERY ?? 100)

// Async, not `execFileSync`: a synchronous child blocks the whole event loop,
// which silently made CONCURRENCY a lie — the pool ran one entry at a time and
// a full pass took hours instead of minutes. Measured on the first run.
const run = promisify(execFile)

const readJson = (file) => fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {}
const stored = readJson(OUT_FILE)
const npmMap = readJson(NPM_MAP_FILE)
const tarballs = readJson(TARBALLS_FILE)
const entries = await readEntries('data/plugins')
const now = Date.now()

const next = { ...stored }

/**
 * Persist what has been scanned so far.
 *
 * A full pass is hours of downloads, and it used to write the file ONLY at the
 * end — so a runner that hit its job timeout, or a laptop that slept, threw
 * away every scan it had paid for. Flushing periodically makes the work
 * resumable: the next run skips whatever is already current.
 */
function flush() {
  const sorted = Object.fromEntries(Object.entries(next).sort(([a], [b]) => a.localeCompare(b)))
  fs.writeFileSync(OUT_FILE, `${JSON.stringify(sorted, null, 1)}\n`)
  return Object.keys(sorted).length
}

let sinceFlush = 0
let scanned = 0
let kept = 0
let skipped = 0
let failed = 0
const failures = new Map()

async function download(url, file) {
  await run('curl', ['-sSL', '--fail', '--max-time', '120', '-o', file, url], { maxBuffer: 1024 * 1024 })
}

/**
 * One entry, start to finish. Returns nothing: a failure is COUNTED, and the
 * previous record (if any) stays exactly where it was.
 */
async function scanEntry(entry) {
  const source = scanSourceFor(entry, npmMap, tarballs)
  if (source === null) { skipped += 1; return }
  if (!PROBE_ALL && !shouldRescan(stored[entry.url], source, now, RECHECK_DAYS)) { kept += 1; return }
  const dir = fs.mkdtempSync(join(os.tmpdir(), 'dshm-cap-'))
  try {
    const file = join(dir, 'package.tgz')
    await download(source.url, file)
    const extracted = join(dir, 'x')
    fs.mkdirSync(extracted)
    await run('tar', ['xzf', file, '-C', extracted], { maxBuffer: 1024 * 1024 })
    // Both npm tarballs and codeload archives wrap everything in one top-level
    // directory; a subdirectory entry starts one level further in.
    const top = fs.readdirSync(extracted).filter(name => !name.startsWith('.'))[0]
    if (top === undefined) throw new Error('empty archive')
    const sub = subdirOf(entry.url)
    const packageDir = sub === null ? join(extracted, top) : join(extracted, top, sub)
    if (!fs.existsSync(packageDir)) throw new Error(`no such subdirectory: ${sub}`)
    const { stdout: raw } = await run(scannerCommand(), scannerArgs(packageDir, source.spec),
      { encoding: 'utf8', timeout: SCAN_TIMEOUT_MS, maxBuffer: 8 * 1024 * 1024 })
    const payload = JSON.parse(raw)
    const facts = factsFromScan(payload, {
      spec: source.spec, version: source.version, tool: TOOL, now: new Date(now).toISOString(),
    })
    if (facts === null) {
      // Say WHICH nothing this was. Most of these are a package whose entry
      // file is a build product the repository does not ship — the scanner
      // answers `primary entry unreadable or missing: lib/index.js`, which is
      // exactly the case an npm-sourced scan avoids (measured: 957 of them on
      // the first full pass, when a missing data/npm-map.json sent every entry
      // down the GitHub branch). That sentence is the difference between a
      // count and something a maintainer can act on.
      const why = Array.isArray(payload.errors) && typeof payload.errors[0]?.message === 'string'
        ? payload.errors[0].message
        : `no plugin record (schemaVersion ${String(payload.schemaVersion)})`
      throw new Error(why)
    }
    next[entry.url] = facts
    scanned += 1
    sinceFlush += 1
    if (sinceFlush >= FLUSH_EVERY) {
      sinceFlush = 0
      // Progress, because a full pass is hours and a silent log cannot be told
      // apart from a hung one.
      console.log(`  … ${scanned} scanned, ${failed} failed, ${kept} current (${flush()} records)`)
    }
  } catch (error) {
    failed += 1
    const message = error instanceof Error ? error.message.slice(0, 120) : String(error)
    failures.set(message, (failures.get(message) ?? 0) + 1)
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
}

// A bounded pool, like the other probes: the work is network-bound and the
// remote end is one registry and one CDN.
let cursor = 0
const pending = Math.min(CONCURRENCY, entries.length)
await Promise.all(Array.from({ length: pending }, async () => {
  while (cursor < entries.length) {
    const index = cursor++
    if (scanned + kept + failed >= LIMIT) return
    await scanEntry(entries[index])
  }
}))

const total = flush()
console.log(`capabilities: ${scanned} scanned, ${kept} current, ${skipped} unscannable, ${failed} failed — ${total} records in ${OUT_FILE}`)
for (const [message, count] of [...failures].sort((a, b) => b[1] - a[1]).slice(0, 5)) {
  console.log(`  ${count}× ${message}`)
}
if (scanned === 0 && failed > 0) {
  // Loud in the log, exit 0: this probe is DISCLOSURE, and a scanner outage on
  // a cold cache must not fail the publish. The records already on disk are
  // what the surfaces read, and an entry without one prints 未检出 — true
  // whether the scanner is broken or the package is. Same discipline as
  // probe-updates.mjs, for the same reason: the build is not the place to
  // discover that a network dependency is down.
  console.log('every scan failed — keeping the previous file rather than publishing an empty one')
}
