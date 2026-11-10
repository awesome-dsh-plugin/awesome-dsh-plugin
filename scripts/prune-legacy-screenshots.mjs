#!/usr/bin/env node
/**
 * Remove keys from data/screenshots.json for entries whose repository now
 * declares its own `screenshots.json`.
 *
 * The legacy file is a fallback with an end date, not a second home. Once an
 * author adopts the convention, keeping their key here means two copies of the
 * same list that can disagree, and it keeps the shared file — the one every
 * screenshot pull request collides on — alive for no reason. Pruning as authors
 * migrate is what lets the file drain to nothing and finally be deleted.
 *
 * Conservative on purpose. A key is removed only when the author's declaration
 * is present, parses, and yields at least one image. A repository that is
 * unreachable, a file that is malformed, an empty list — all leave the legacy
 * entry exactly where it is, because the alternative is deleting a working
 * screenshot on the strength of a failed request.
 *
 * Maintainer-run, not CI: this writes a committed file, and the build workflow
 * holds `contents: read` so that nothing in it can race a human push.
 *
 * Usage: node scripts/prune-legacy-screenshots.mjs [--dry-run]
 */
import fs from 'node:fs'

const LEGACY_FILE = 'data/screenshots.json'
const CONCURRENCY = 8
const DRY = process.argv.includes('--dry-run')

const HOSTS = new Set(['raw.githubusercontent.com', 'user-images.githubusercontent.com', 'camo.githubusercontent.com', 'github.com'])
const MAX_SHOTS = 8

if (!fs.existsSync(LEGACY_FILE)) {
  console.log(`${LEGACY_FILE} does not exist — nothing to prune`)
  process.exit(0)
}
const legacy = JSON.parse(fs.readFileSync(LEGACY_FILE, 'utf8'))
const keys = Object.keys(legacy)
if (!keys.length) {
  console.log(`${LEGACY_FILE} is empty — it can be deleted`)
  process.exit(0)
}

function decompose(url) {
  const repoPath = url.replace('https://github.com/', '').replace(/\/$/, '')
  return {
    repo: repoPath.split('/').slice(0, 2).join('/'),
    sub: repoPath.includes('/tree/') ? repoPath.split('/tree/')[1].replace(/^[^/]+\//, '') : null,
  }
}

/** Same acceptance rules as probe-screenshots.mjs — a key is only pruned if the
 *  declaration would actually be used. */
function usable(text, url) {
  let doc
  try { doc = JSON.parse(text) } catch { return false }
  const list = Array.isArray(doc)
    ? doc
    : Array.isArray(doc?.screenshots)
      ? doc.screenshots
      : Array.isArray(doc?.[url])
        ? doc[url]
        : Object.keys(doc ?? {}).length === 1 && Array.isArray(Object.values(doc)[0])
          ? Object.values(doc)[0]
          : null
  if (!Array.isArray(list) || !list.length || list.length > MAX_SHOTS) return false
  if (list.some((s) => typeof s !== 'string' || !s.trim())) return false
  for (const raw of list) {
    const s = raw.trim()
    if (/^https?:\/\//i.test(s)) {
      let p = null
      try { p = new URL(s) } catch { return false }
      if (p.protocol !== 'https:' || !HOSTS.has(p.hostname)) return false
    } else if (s.startsWith('/') || s.split('/').includes('..')) return false
  }
  return true
}

async function adopted(url) {
  const { repo, sub } = decompose(url)
  const at = `https://raw.githubusercontent.com/${repo}/HEAD/${sub ? sub + '/' : ''}screenshots.json`
  try {
    const r = await fetch(at, { headers: { 'user-agent': 'awesome-dsh-plugin-screenshot-prune' }, signal: AbortSignal.timeout(15000) })
    if (!r.ok) return false
    return usable(await r.text(), url)
  } catch {
    return false
  }
}

const prune = []
for (let i = 0; i < keys.length; i += CONCURRENCY) {
  const batch = keys.slice(i, i + CONCURRENCY)
  const results = await Promise.all(batch.map(async (k) => [k, await adopted(k)]))
  for (const [k, yes] of results) if (yes) prune.push(k)
}

console.log(`${keys.length} legacy key(s), ${prune.length} now declared by their own repository`)
for (const k of prune) console.log(`  ${k}`)

if (!prune.length) process.exit(0)
if (DRY) {
  console.log('--dry-run: nothing written')
  process.exit(0)
}

// Key order is preserved rather than re-sorted. The file matches no sort — it
// grew by appending — and re-sorting it would rewrite hundreds of lines nobody
// touched, poisoning the diff signal maint-rebase.sh relies on to spot
// cross-entry damage.
const out = {}
for (const [k, v] of Object.entries(legacy)) if (!prune.includes(k)) out[k] = v
fs.writeFileSync(LEGACY_FILE, JSON.stringify(out, null, 1) + '\n')
console.log(`${LEGACY_FILE}: ${keys.length} → ${Object.keys(out).length} key(s)`)
if (!Object.keys(out).length) console.log('the legacy file is now empty and can be removed along with its fallback in build-site.mjs')
