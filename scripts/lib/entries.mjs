// Shared entry model: the data/plugins/*.yml source of truth.
//
// One file per entry, keyed by slug, so two submissions never touch the same
// file — that is what removes the merge-conflict cascade the README-as-database
// layout produced (every submission appended at the same anchor).
import fs from 'node:fs'
import path from 'node:path'
import { load as yamlLoad, dump as yamlDump } from 'js-yaml'

export const PLUGINS_DIR = 'data/plugins'

// Locales the list publishes, in sync with site/locales.mjs.
//
// Only BASE_LOCALE is a contributor's responsibility. Asking submitters for
// every translation just filters for bilingual authors, not for good plugins,
// and it bounced a steady stream of otherwise-fine PRs. A missing translation
// is maintenance work for us, not a defect in their submission — so entries
// validate on English alone and generation falls back to it, leaving a
// translation to be filled in afterwards.
export const LOCALE_CODES = ['en', 'zh']
export const BASE_LOCALE = 'en'

// Category order is canonical: it drives README section order, site ordering,
// chips and the sitemap. Kept in sync with CAT_IDS in build-site.mjs and the
// two `categories` blocks in site/locales.mjs (reorder-categories.py rewrites
// build-site.mjs by regex, so that array must stay on one line).
export const CAT_IDS = ['ui', 'usage', 'theme', 'model', 'session', 'memory', 'tools', 'vision', 'skill', 'workflow', 'notify', 'dev', 'market', 'fun']

// Every README except the English one prefixes its headings with an emoji —
// site/locales.mjs stores the bare names because build-site matches headings
// by substring. A generator has to carry them, or regenerating would silently
// strip the prefix from every translated heading.
export const CAT_EMOJI = {
  ui: '🎨',
  usage: '💰',
  theme: '🎭',
  model: '🔌',
  session: '💬',
  memory: '🧠',
  tools: '🛠️',
  vision: '🖼️',
  skill: '🧩',
  workflow: '🔁',
  notify: '🔔',
  dev: '🧑‍💻',
  market: '🛒',
  fun: '🎮',
}

/** `https://github.com/o/r` -> `o__r`; `.../tree/main/packages/x` -> `o__r--packages-x` */
export function slugFor(url) {
  const p = url.replace(/^https:\/\/github\.com\//, '').replace(/\/+$/, '')
  const repo = p.split('/').slice(0, 2).join('/')
  const sub = p.includes('/tree/') ? p.split('/tree/')[1].replace(/^[^/]+\//, '') : null
  const base = repo.replaceAll('/', '__')
  return sub ? `${base}--${sub.replaceAll('/', '-')}` : base
}

export function readEntries(dir = PLUGINS_DIR) {
  if (!fs.existsSync(dir)) return []
  const out = []
  for (const f of fs.readdirSync(dir).sort()) {
    if (!f.endsWith('.yml')) continue
    const full = path.join(dir, f)
    const text = fs.readFileSync(full, 'utf8')
    let doc
    try {
      doc = yamlLoad(text)
    } catch (e) {
      // By far the most common way a hand-written entry breaks: a description
      // like `en: Foo bar: baz` — an unquoted scalar containing ": " is a
      // mapping to YAML. Say so, because the parser's own message ("bad
      // indentation of a mapping entry") points nowhere useful.
      const loc = LOCALE_CODES.join('|')
      const head = new RegExp(`^\\s+(${loc}):\\s`)
      const culprit = text
        .split('\n')
        .find((l) => head.test(l) && /:\s/.test(l.replace(head, '')) && !new RegExp(`^\\s+(${loc}):\\s*['"]`).test(l))
      const hint = culprit
        ? `\n\n  A description containing ": " must be quoted:\n` +
          `    ${culprit.trim()}\n` +
          `  becomes\n` +
          `    ${culprit.trim().replace(new RegExp(`^((${loc}):\\s*)(.*)$`), (_, p, __, v) => `${p}'${v.replaceAll("'", "''")}'`)}`
        : ''
      throw new Error(`${full}: invalid YAML — ${e.reason ?? e.message}${hint}`)
    }
    out.push({ ...doc, file: full })
  }
  return out
}

// A release tarball must live on GitHub's own release hosting. Anywhere else
// and the list would be handing users a download link it can't vouch for —
// the same reasoning that restricts screenshot hosts in build-site.mjs.
const TARBALL_HOSTS = new Set(['github.com', 'objects.githubusercontent.com', 'release-assets.githubusercontent.com'])

/** Returns a problem description, or null when the value is a usable tarball URL. */
export function tarballProblem(value) {
  if (typeof value !== 'string' || !value.trim()) return 'must be a URL string'
  let u
  try {
    u = new URL(value)
  } catch {
    return `is not a valid URL: ${value}`
  }
  if (u.protocol !== 'https:') return 'must be https'
  if (!TARBALL_HOSTS.has(u.hostname)) return `must be hosted on GitHub releases (got ${u.hostname})`
  if (u.hostname === 'github.com' && !u.pathname.includes('/releases/')) return 'must point at a GitHub release asset'
  if (!u.pathname.endsWith('.tgz') && !u.pathname.endsWith('.tar.gz')) return 'must point at a .tgz'
  return null
}

/** Validate shape. Returns an array of human-readable problems (empty = ok). */
export function validateEntries(entries) {
  const problems = []
  const seen = new Map()
  for (const e of entries) {
    const at = e.file ?? e.url ?? '(unknown)'
    if (typeof e.url !== 'string' || !/^https:\/\/github\.com\/[^/]+\/[^/]+/.test(e.url)) {
      problems.push(`${at}: "url" must be a https://github.com/owner/repo link`)
      continue
    }
    if (seen.has(e.url)) problems.push(`${at}: duplicate url, already declared in ${seen.get(e.url)}`)
    seen.set(e.url, at)

    const want = slugFor(e.url)
    if (e.file && path.basename(e.file, '.yml') !== want) {
      problems.push(`${at}: filename must match the url — expected ${want}.yml`)
    }
    if (typeof e.name !== 'string' || !e.name.trim()) problems.push(`${at}: "name" is required`)
    if (!CAT_IDS.includes(e.category)) {
      problems.push(`${at}: "category" must be one of ${CAT_IDS.join(', ')} (got ${JSON.stringify(e.category)})`)
    }
    for (const loc of LOCALE_CODES) {
      const d = e.description?.[loc]
      if (d === undefined && loc !== BASE_LOCALE) continue // a maintainer fills this in
      if (typeof d !== 'string' || !d.trim()) {
        problems.push(
          loc === BASE_LOCALE
            ? `${at}: "description.${BASE_LOCALE}" is required`
            : `${at}: "description.${loc}" is present but empty — omit the key instead`,
        )
      } else if (d.includes('\n')) problems.push(`${at}: "description.${loc}" must be a single line`)
    }

    // Optional prebuilt tarball. Deliberately a URL and not a command string:
    // this ends up as something people paste into a shell, so the build owns
    // the command and only the artifact location comes from the entry.
    if (e.tarball !== undefined) {
      const bad = tarballProblem(e.tarball)
      if (bad) problems.push(`${at}: "tarball" ${bad}`)
    }
  }
  return problems
}

/** Canonical output order: category order, then url within a category. */
export function orderEntries(entries) {
  return CAT_IDS.flatMap((id) =>
    entries.filter((e) => e.category === id).sort((a, b) => a.url.localeCompare(b.url)),
  )
}

export function dumpEntry(e) {
  // Omit absent translations rather than writing empty keys, so "not yet
  // translated" stays distinguishable from "translated to nothing".
  const description = Object.fromEntries(
    LOCALE_CODES.filter((loc) => typeof e.description?.[loc] === 'string' && e.description[loc].trim()).map((loc) => [loc, e.description[loc]]),
  )
  const doc = { url: e.url, name: e.name, category: e.category, description }
  if (e.tarball) doc.tarball = e.tarball
  return yamlDump(doc, { lineWidth: -1, noRefs: true, quotingType: '"', forceQuotes: false })
}

export function writeEntry(e, dir = PLUGINS_DIR) {
  fs.mkdirSync(dir, { recursive: true })
  const file = path.join(dir, `${slugFor(e.url)}.yml`)
  fs.writeFileSync(file, dumpEntry(e))
  return file
}
