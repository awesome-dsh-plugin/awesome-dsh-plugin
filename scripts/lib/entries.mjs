// Shared entry model: the data/plugins/*.yml source of truth.
//
// One file per entry, keyed by slug, so two submissions never touch the same
// file — that is what removes the merge-conflict cascade the README-as-database
// layout produced (every submission appended at the same anchor).
import fs from 'node:fs'
import path from 'node:path'
import { load as yamlLoad, dump as yamlDump } from 'js-yaml'

export const PLUGINS_DIR = 'data/plugins'

// Category order is canonical: it drives README section order, site ordering,
// chips and the sitemap. Kept in sync with CAT_IDS in build-site.mjs and the
// two `categories` blocks in site/locales.mjs (reorder-categories.py rewrites
// build-site.mjs by regex, so that array must stay on one line).
export const CAT_IDS = ['ui', 'theme', 'model', 'session', 'memory', 'tools', 'skill', 'workflow', 'notify', 'dev', 'market', 'fun']

// The emoji prefixes live only in README.zh.md — site/locales.mjs stores the
// bare names because build-site matches headings by substring. A generator has
// to carry them, or regenerating would silently strip every Chinese heading.
export const ZH_EMOJI = {
  ui: '🎨',
  theme: '🎭',
  model: '🔌',
  session: '💬',
  memory: '🧠',
  tools: '🛠️',
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
    let doc
    try {
      doc = yamlLoad(fs.readFileSync(full, 'utf8'))
    } catch (e) {
      throw new Error(`${full}: invalid YAML — ${e.message}`)
    }
    out.push({ ...doc, file: full })
  }
  return out
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
    for (const loc of ['en', 'zh']) {
      const d = e.description?.[loc]
      if (typeof d !== 'string' || !d.trim()) problems.push(`${at}: "description.${loc}" is required`)
      else if (d.includes('\n')) problems.push(`${at}: "description.${loc}" must be a single line`)
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
  return yamlDump(
    { url: e.url, name: e.name, category: e.category, description: { en: e.description.en, zh: e.description.zh } },
    { lineWidth: -1, noRefs: true, quotingType: '"', forceQuotes: false },
  )
}

export function writeEntry(e, dir = PLUGINS_DIR) {
  fs.mkdirSync(dir, { recursive: true })
  const file = path.join(dir, `${slugFor(e.url)}.yml`)
  fs.writeFileSync(file, dumpEntry(e))
  return file
}
