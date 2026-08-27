#!/usr/bin/env node
/**
 * Build the site from the per-locale READMEs (the source of truth).
 *
 * Locales are declared once in site/locales.mjs. For every locale this
 * script parses its README, emits a fully single-language page from
 * site/template.html (__TOKENS__), and generates the shared artifacts:
 * hreflang sets, sitemap with alternates, per-locale JSON-LD and og:image.
 * It also re-syncs the plugin-count figure inside every README.
 *
 * Usage: node scripts/build-site.mjs
 */
import fs from 'node:fs'
import { execSync } from 'node:child_process'
import { Marked } from 'marked'
import LOCALES from '../site/locales.mjs'
import { CAT_IDS as ENTRY_CAT_IDS, readEntries } from './lib/entries.mjs'

const ORIGIN = 'https://awesome-dsh-plugin.com'
const DATES_FILE = 'data/added-dates.json'
const SCREENSHOTS_FILE = 'data/screenshots.json'

// docs/ is fully generated: static assets live in site/assets/ and are copied
// in here, so a from-scratch build (empty docs/) produces the complete site
fs.mkdirSync('docs', { recursive: true })
for (const f of fs.readdirSync('site/assets')) fs.copyFileSync(`site/assets/${f}`, `docs/${f}`)
const NPM_MAP_FILE = 'data/npm-map.json'
// url -> prebuilt release tarball, declared per entry in data/plugins/*.yml.
// A declared tarball is dropped once probe-tarballs.mjs has confirmed it 404s:
// the entry then falls back to its `github:owner/repo` command, which is what
// every entry had before the field existed, rather than shipping a download
// link that is known to be dead (#1619).
//
// Confirmed-dead only. No verdict means the probe has not run — a local build,
// or an entry added since the last refresh — and treating that as dead would
// strip the field from every entry whenever the probe is skipped.
const TARBALLS_FILE = 'data/tarballs.json'
const tarballVerdicts = fs.existsSync(TARBALLS_FILE) ? JSON.parse(fs.readFileSync(TARBALLS_FILE, 'utf8')) : {}
const tarballMap = Object.fromEntries(
  readEntries()
    .filter((e) => {
      if (!e.tarball) return false
      const v = tarballVerdicts[e.url]
      // A verdict is only about the URL it was recorded against: if the entry
      // now declares a different tarball, the old verdict says nothing.
      return !(v && v.tarball === e.tarball && v.ok === false)
    })
    .map((e) => [e.url, e.tarball]),
)
// Single source of truth, shared with the README generator (scripts/lib/entries.mjs).
const CAT_IDS = ENTRY_CAT_IDS

const ldSafe = (s) => s.replaceAll('<', '\\u003c')
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const dupes = []
function parseReadme(loc) {
  const text = fs.readFileSync(loc.readme, 'utf8')
  const out = new Map() // url -> {name, url, desc, cat}
  let cat = null
  for (const line of text.split('\n')) {
    const h = line.match(/^#{2,3} (.+)$/)
    if (h) {
      cat = CAT_IDS.find((id) => h[1].includes(loc.categories[id])) ?? null
      continue
    }
    const m = line.match(/^- \[(.+?)\]\((https:\/\/github\.com\/[^)]+)\) ([—-]) (.+)$/)
    if (m && cat) {
      // A Map would silently swallow a repeat, and a stale fork's diff can
      // re-add entries that are already listed — report instead of dedupe.
      if (out.has(m[2])) dupes.push(`${loc.readme} lists ${m[2]} twice`)
      out.set(m[2], { name: m[1], url: m[2], desc: m[4], cat, sep: m[3] })
    }
  }
  return out
}

// Join all locales on plugin URL; the default locale defines the roster.
const parsed = LOCALES.map((loc) => ({ loc, entries: parseReadme(loc) }))
const [base, ...others] = parsed
const entries = []
let parityBroken = false
for (const d of dupes) { console.error(d); parityBroken = true }
// Each language declares its own list-item separator: awesome-lint wants a
// hyphen in English, while a hyphen between Chinese words reads as punctuation.
// Contributors mix them up constantly, so make it a build failure.
for (const { loc, entries: map } of parsed)
  for (const [url, e] of map)
    if (e.sep !== loc.sep) {
      console.error(`${loc.readme} separates ${url} with "${e.sep}" — this file uses "${loc.sep}"`)
      parityBroken = true
    }
for (const [url, e] of base.entries) {
  const descs = { [base.loc.code]: e.desc }
  let ok = true
  for (const { loc, entries: map } of others) {
    const t = map.get(url)
    if (!t) { console.error(`${loc.readme} missing: ${url}`); ok = false; parityBroken = true; break }
    // Categories must agree too. The site takes them from the base locale, so a
    // translated file can drift under the wrong heading and stay invisible to
    // both the build and a URL-only parity check — that is how #343 happened.
    if (t.cat !== e.cat) {
      console.error(`${loc.readme} files ${url} under "${loc.categories[t.cat]}" but ${base.loc.readme} has it under "${base.loc.categories[e.cat]}"`)
      parityBroken = true
    }
    descs[loc.code] = t.desc
  }
  if (ok) entries.push({ name: e.name, url: e.url, cat: e.cat, owner: url.split('/')[3], descs })
}
for (const { loc, entries: map } of others)
  for (const url of map.keys())
    if (!base.entries.has(url)) { console.error(`${loc.readme} has an entry missing from ${base.loc.readme}: ${url}`); parityBroken = true }
if (parityBroken) {
  console.error('README locale parity broken — fix the language files; refusing to build (a silent drop would delist and delete pages).')
  process.exit(1)
}
console.log(`${entries.length} entries parsed across ${LOCALES.length} locales`)

const ordered = CAT_IDS.flatMap((id) => entries.filter((e) => e.cat === id))
const N = ordered.length

// Added dates. data/added-dates.json is a frozen, human-owned baseline: it
// pins the dates published before 2026-08-15 and carries manual migrations
// (an entry repointed to a new URL keeps its original date). Anything not in
// it derives from git history — an entry's date is the commit date of the
// commit that first added its line to the default-locale README. Nothing is
// ever written back; git history is the ledger.
const dates = fs.existsSync(DATES_FILE) ? JSON.parse(fs.readFileSync(DATES_FILE, 'utf8')) : {}
const npmMap = fs.existsSync(NPM_MAP_FILE) ? JSON.parse(fs.readFileSync(NPM_MAP_FILE, 'utf8')) : {}
const starsMap = fs.existsSync('data/stars.json') ? JSON.parse(fs.readFileSync('data/stars.json', 'utf8')) : {}
// Missing (not yet bootstrapped, or an entry with no npm package) is a
// normal, permanent state for most entries — unlike stars.json, absence
// here needs no publish-blocking floor of its own: probe-downloads.mjs
// already refuses to WRITE the file on a bad run, so whatever is on disk is
// the last known-good result, or nothing yet.
const downloadsMap = fs.existsSync('data/downloads.json') ? JSON.parse(fs.readFileSync('data/downloads.json', 'utf8')) : {}

// Publishing is the last chance to notice that a data file arrived empty, and
// the only one that matters to consumers: docs/ is deployed straight to Pages,
// so a bad build replaces the good one and downstream clients read whatever it
// contains. On 2026-08-18 plugins.json went out with `stars: null` for all
// 1,362 entries (#1673) because probe-stars.mjs was handed an exhausted API
// quota and a cold cache at the same time, wrote {}, and nothing between it and
// the deploy asked whether that was plausible.
//
// A floor, not an exact match: entries added since the last probe legitimately
// have no star count yet, and a repository that 404s never will. Losing more
// than a third of them at once is not attrition, it is a broken probe — and
// keeping yesterday's stars live beats publishing nulls, because a stale number
// degrades gracefully and a null does not.
// Only on the publishing path. pr-check.yml also runs this build — for locale
// parity, date derivation and template validation — with no intention of
// deploying, and there a missing data/stars.json would fail every contributor's
// PR with a message about publishing that has nothing to do with their
// submission. A guard that blocks people for our own infrastructure's state is
// the failure mode this repository has spent the day removing, so it is opt-out
// by the caller rather than inferred from whether the file happens to be there.
const STARS_MIN_COVERAGE = 0.66
const starsHave = ordered.filter((e) => typeof starsMap[e.url]?.stars === 'number').length
if (process.env.SKIP_PUBLISH_CHECKS !== '1' && ordered.length && starsHave / ordered.length < STARS_MIN_COVERAGE) {
  const pct = ((starsHave / ordered.length) * 100).toFixed(1)
  throw new Error(
    `refusing to publish: only ${starsHave}/${ordered.length} entries (${pct}%) have a star count, below the ${STARS_MIN_COVERAGE * 100}% floor.\n`
    + 'data/stars.json is empty or truncated — almost always probe-stars.mjs hitting an exhausted\n'
    + 'GitHub API quota on a cold cache. The previous deploy stays live, which is the point.\n'
    + 'Re-run once the hourly quota resets; PROBE_ALL=1 forces a full refresh.',
  )
}
if (ordered.some((e) => !dates[e.url])) {
  const log = execSync(`git log --reverse --date-order --format=%x01%cI -p -- ${LOCALES[0].readme}`,
    { encoding: 'utf8', maxBuffer: 1 << 28 })
  let cur = null
  for (const line of log.split('\n')) {
    if (line.startsWith('\x01')) cur = new Date(line.slice(1).trim()).toISOString()
    else if (line.startsWith('+') && !line.startsWith('+++')) {
      const m = line.match(/^\+- \[[^\]]+\]\((https:\/\/github\.com\/[^)]+)\)\s*[-—]\s/)
      if (m && !dates[m[1]]) dates[m[1]] = cur
    }
  }
  const undated = ordered.filter((e) => !dates[e.url])
  if (undated.length) {
    // reachable only from a shallow clone or an unstamped uncommitted entry —
    // stamping "now" here would make the output flap between runs
    console.error(`no added-date derivable for: ${undated.map((e) => e.url).join(', ')}`)
    console.error('need full git history (fetch-depth: 0) and committed entries — refusing to build')
    process.exit(1)
  }
}
const isoTs = (s) => (s.includes('T') ? s : s + 'T00:00:00Z')
for (const e of ordered) { e.addedAt = dates[e.url]; e.added = e.addedAt.slice(0, 10) }

// Optional per-entry screenshots (data/screenshots.json): keyed by the entry
// URL like added-dates.json; values are image URLs surfaced by storefronts
// (dsh-market #61: AppStore-style screenshots on the detail view). Validated
// here so a bad submission fails the PR check: keys must match a listed
// entry, and images must live on GitHub's own hosting — a third-party image
// host would let a list PR plant a tracking pixel in every storefront
// user's browser.
const SCREENSHOT_HOSTS = new Set([
  'raw.githubusercontent.com',
  'user-images.githubusercontent.com',
  'camo.githubusercontent.com',
  'github.com',
])
const shotsMap = fs.existsSync(SCREENSHOTS_FILE) ? JSON.parse(fs.readFileSync(SCREENSHOTS_FILE, 'utf8')) : {}
{
  const listed = new Set(ordered.map((e) => e.url))
  let shotsBroken = false
  const complain = (msg) => { console.error(`${SCREENSHOTS_FILE}: ${msg}`); shotsBroken = true }
  for (const [key, value] of Object.entries(shotsMap)) {
    if (!listed.has(key)) complain(`"${key}" is not a listed entry URL (keys must match the README entry link exactly)`)
    if (!Array.isArray(value) || value.length === 0 || value.length > 8 || value.some((s) => typeof s !== 'string')) {
      complain(`"${key}" must map to an array of 1-8 image URL strings`)
      continue
    }
    for (const shot of value) {
      let parsed = null
      try { parsed = new URL(shot) } catch { /* complain below */ }
      if (parsed === null || parsed.protocol !== 'https:' || !SCREENSHOT_HOSTS.has(parsed.hostname)) {
        complain(`"${key}": images must be https URLs on GitHub hosting (${[...SCREENSHOT_HOSTS].join(' / ')}), got: ${shot}`)
      }
    }
  }
  if (shotsBroken) process.exit(1)
}

// Everything above checks the shape of a screenshot URL and the host it points
// at. Nothing there asks whether the image is actually served, so a 404 passed
// the PR check, passed the gate, merged, and shipped as a broken picture in
// every storefront — 41 of 773 were in that state when the probe first ran.
// probe-screenshots.mjs asks; this drops what it found gone.
//
// Absent verdict means live, deliberately: a URL the probe never reached (5xx,
// throttle, or a run that did not happen) must keep publishing. Only a recorded
// `ok: false` — which the probe writes for 404/410 alone — removes an image.
// An entry whose shots all die loses the field entirely rather than shipping an
// empty array, which is the state every entry had before screenshots existed.
{
  // The author's own repository wins. probe-screenshots.mjs reads
  // `screenshots.json` from beside the plugin's package.json and resolves it to
  // absolute URLs here; data/screenshots.json above is what every entry that
  // predates the convention still uses. An author who adopts the file becomes
  // the single source for their own entry — their key in the legacy file is
  // then redundant and prune-legacy-screenshots.mjs removes it, so the old file
  // drains rather than growing a second, competing copy of the same data.
  const DECLARED_FILE = 'data/screenshots-declared.json'
  const declaredMap = fs.existsSync(DECLARED_FILE) ? JSON.parse(fs.readFileSync(DECLARED_FILE, 'utf8')) : {}
  let adopted = 0
  for (const [key, list] of Object.entries(declaredMap)) {
    if (!Array.isArray(list) || !list.length) continue
    if (shotsMap[key] !== undefined) adopted++
    shotsMap[key] = list
  }
  if (Object.keys(declaredMap).length) {
    console.log(`screenshots: ${Object.keys(declaredMap).length} entry/entries declare their own (${adopted} superseding ${SCREENSHOTS_FILE})`)
  }

  const LIVE_FILE = 'data/screenshots-live.json'
  const verdicts = fs.existsSync(LIVE_FILE) ? JSON.parse(fs.readFileSync(LIVE_FILE, 'utf8')) : {}
  let dropped = 0
  for (const [key, list] of Object.entries(shotsMap)) {
    if (!Array.isArray(list)) continue
    const live = list.filter((shot) => verdicts[shot]?.ok !== false)
    dropped += list.length - live.length
    if (live.length) shotsMap[key] = live
    else delete shotsMap[key]
  }
  if (dropped) console.log(`screenshots: dropped ${dropped} image(s) confirmed 404/410 by probe-screenshots.mjs`)
}

// derive repo/subdir install specs and the detail-page slug once
for (const e of ordered) {
  const repoPath = e.url.replace('https://github.com/', '')
  e.repo = repoPath.split('/').slice(0, 2).join('/')
  e.sub = repoPath.includes('/tree/') ? repoPath.split('/tree/')[1].replace(/^[^/]+\//, '') : null
  e.cmdGit = e.sub
    ? `dsh plugin --profile web add github:${e.repo}#path:/${e.sub}`
    : `dsh plugin --profile web add github:${e.repo}`
  e.npm = npmMap[e.url]?.npm ?? null
  // Optional author-declared prebuilt release tarball (data/plugins/*.yml).
  // Some plugins ship only a built tarball and are not installable from
  // source at all, so `github:owner/repo` would hand users a broken command.
  e.tarball = tarballMap[e.url] ?? null
  e.cmdTarball = e.tarball ? `dsh plugin --profile web add "${e.tarball}"` : null
  e.stars = starsMap[e.url]?.stars ?? null
  // Last-30-days npm downloads (probe-downloads.mjs), null for the ~60% of
  // entries with no npm package at all — a coverage gap, not a zero.
  // Consumers must tell "not published" apart from "published, unused".
  e.downloads = downloadsMap[e.url]?.downloads ?? null
  e.slug = e.sub ? `${e.repo}--${e.sub.replaceAll('/', '-')}` : e.repo
}

const hreflangs = [
  ...LOCALES.map((l) => `<link rel="alternate" hreflang="${l.code}" href="${ORIGIN}${l.urlPath}">`),
  `<link rel="alternate" hreflang="x-default" href="${ORIGIN}${LOCALES[0].urlPath}">`,
].join('\n')

const jsonld = (url) => JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Awesome DSH Plugin',
  url,
  numberOfItems: N,
  itemListElement: ordered.map((e, i) => ({ '@type': 'ListItem', position: i + 1, name: e.name, url: e.url })),
})

// Thousands separators, en-US in both locales on purpose: the number is a
// count, not prose, and letting it follow the locale would make the two
// READMEs' generated pages differ by separator alone on every rebuild.
const fmtNum = (n) => n.toLocaleString('en-US')

// Default order for the card grid: downloads first, then everything with no
// npm package at all, ranked among themselves by stars.
//
// `downloads == null` means "not published to npm", NOT "published and never
// installed" — see where e.downloads is assigned. Coercing it to 0 would sort
// 55% of the list as if it had been measured and found unused, and would put a
// widely-starred GitHub-only plugin below an npm package with three installs.
// So nulls are partitioned to the back and ordered by the signal they do have.
//
// The in-page `sort=dl` comparator in site/template.html must stay equivalent
// to this: it is the same ordering, recomputed client-side. If they drift, the
// first paint reshuffles on load for everyone with JS.
const byDownloads = (a, b) => {
  const ad = a.downloads, bd = b.downloads
  if ((ad == null) !== (bd == null)) return ad == null ? 1 : -1
  if (ad != null && bd != null && ad !== bd) return bd - ad
  return (b.stars ?? -1) - (a.stars ?? -1)
}

// download-ranked card grid; `only` limits to one category (category pages)
function buildRows(loc, only) {
  const group = ordered
    .filter((e) => !only || e.cat === only)
    .slice()
    .sort(byDownloads)
  return group.map((e) => {
    const cmd = e.npm ? `dsh plugin --profile web add ${e.npm}` : e.cmdGit
    const short = shortName(e.name)
    // data-* carry what the in-page sort and filters need. Absent attribute,
    // not a zero: `downloads` is null for entries with no npm package at all,
    // and `data-dl="0"` would rank them alongside a published package nobody
    // installs. The client reads presence, so omitting is the encoding.
    const attrs = [
      `data-cat="${e.cat}"`,
      e.downloads != null ? `data-dl="${e.downloads}"` : '',
      e.stars != null ? `data-stars="${e.stars}"` : '',
      `data-added="${e.added}"`,
      e.npm ? 'data-npm="1"' : '',
      `data-name="${esc(short.toLowerCase())}"`,
    ].filter(Boolean).join(' ')
    return `    <li class="card" ${attrs}>
      <div class="top">
        <h3><a href="${loc.urlPath}p/${e.slug}/" translate="no"><span class="owner">${esc(e.owner)}/</span>${esc(short)}</a></h3>
        ${e.stars != null ? `<span class="stars" translate="no">${e.stars}</span>` : ''}
        ${e.downloads != null ? `<span class="dl" translate="no" title="${loc.strings.P_DOWNLOADS}">${fmtNum(e.downloads)}</span>` : ''}
      </div>
      <a class="desc-link" href="${loc.urlPath}p/${e.slug}/" tabindex="-1"><p>${esc(e.descs[loc.code])}</p></a>
      <div class="foot">
        <a class="tag" href="${loc.urlPath}${e.cat}/">${loc.categories[e.cat]}</a>
        <details class="inst">
          <summary aria-haspopup="menu">${loc.strings.INSTALL_BTN} ▾</summary>
          <div class="menu" role="menu">
            <button type="button" role="menuitem" data-cmd="dsh plugin --profile web add dshmarket"><b>${loc.strings.MENU_MARKET}</b><small>${loc.strings.MENU_MARKET_HINT}</small></button>
            <div class="mi-cli">
              <b>${loc.strings.MENU_CLI}</b>
              <span class="cli" translate="no"><input readonly value="${esc(cmd)}" aria-label="${loc.COPY_LABEL}" spellcheck="false"><button class="copy" type="button" data-cmd="${esc(cmd)}" aria-label="${loc.COPY_LABEL}">${loc.COPY_TEXT}</button></span>
            </div>
          </div>
        </details>
      </div>
    </li>`
  }).join('\n\n')
}

// The bare plugin name, without the "owner/" the READMEs carry for human
// disambiguation. Titles lead with this: nobody searches the owner prefix,
// and it costs a dozen characters of a budget that truncates around sixty.
const shortName = (name) => (name.includes('/') ? name.slice(name.indexOf('/') + 1) : name)

// Highest-starred entries in a category, for its meta description. Stars come
// from a probe that only runs in CI, so a local build ranks by list order
// instead — the names still differ per category, which is the point.
function catTop(id, loc, n = 3) {
  const names = ordered
    .filter((e) => e.cat === id)
    .slice()
    .sort((a, b) => (b.stars ?? -1) - (a.stars ?? -1))
    .slice(0, n)
    .map((e) => shortName(e.name))
  if (names.length <= 1) return names[0] ?? ''
  const sep = loc.code === 'zh' ? '、' : ', '
  return names.join(sep)
}

function buildChips(loc) {
  return [
    `      <button class="chip active" type="button" data-cat="all">${loc.strings.ALL} <small>${N}</small></button>`,
    ...CAT_IDS.map((id) => {
      const n = ordered.filter((e) => e.cat === id).length
      return `      <button class="chip" type="button" data-cat="${id}">${loc.categories[id]} <small>${n}</small></button>`
    }),
  ].join('\n')
}

function buildChipLinks(loc, activeId) {
  return [
    `      <a class="chip${activeId ? '' : ' active'}" href="${loc.urlPath}">${loc.strings.ALL} <small>${N}</small></a>`,
    ...CAT_IDS.map((id) => {
      const n = ordered.filter((e) => e.cat === id).length
      return `      <a class="chip${id === activeId ? ' active' : ''}" href="${loc.urlPath}${id}/">${loc.categories[id]} <small>${n}</small></a>`
    }),
  ].join('\n')
}

function localeLinks(current) {
  return LOCALES.filter((l) => l.code !== current.code)
    .map((l) => `<a class="lang-btn" href="${l.urlPath}" hreflang="${l.code}" rel="alternate">${l.label}</a>`)
    .join('\n        ')
}

function langRedirect(current) {
  const cases = LOCALES.filter((l) => l.code !== current.code)
    .map((l) => `if(v==='${l.code}'){p.delete('lang');location.replace('${l.urlPath}'+(p.size?'?'+p:''))}`)
    .join('else ')
  return `\n<script>{const p=new URLSearchParams(location.search);const v=p.get('lang');${cases}}</script>`
}

const master = fs.readFileSync('site/template.html', 'utf8')

for (const loc of LOCALES) {
  let page = master
  page = page.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, () => `<script type="application/ld+json">${ldSafe(jsonld(ORIGIN + loc.urlPath))}</script>`)
  page = page.replace(/(<ol class="dex" id="dex">)[\s\S]*?(<\/ol>)/, (m, a, b) => `${a}\n\n${buildRows(loc)}\n\n  ${b}`)
  page = page.replace(/(<div class="filters" id="filters">)[\s\S]*?(<\/div><!--\/filters-->)/, (m, a, b) => `${a}\n${buildChips(loc)}\n    ${b}`)
  page = page
    .replaceAll('__LANG__', () => loc.htmlLang)
    .replaceAll('__TITLE__', () => loc.TITLE)
    .replaceAll('__DESC__', () => loc.DESC.replace('{N}', N))
    .replaceAll('__URL__', () => ORIGIN + loc.urlPath)
    .replaceAll('__HREFLANGS__', () => hreflangs)
    .replaceAll('__OG_IMAGE__', () => ORIGIN + loc.og)
    .replaceAll('__LOCALE_LINKS__', () => localeLinks(loc))
    .replaceAll('__SEARCH_PH__', () => loc.SEARCH_PH)
    .replaceAll('__HOME__', () => loc.urlPath)
    .replaceAll('__PRIVACY__', () => loc.privacyPath)
    .replaceAll('__LANG_REDIRECT__', () => langRedirect(loc))
    .replaceAll('__FEED__', () => loc.feed)
  for (const [k, v] of Object.entries(loc.strings)) page = page.replaceAll(`__T_${k}__`, () => v)
  fs.mkdirSync(loc.out.split('/').slice(0, -1).join('/'), { recursive: true })
  fs.writeFileSync(loc.out, page)
}

// Category pages: /{cat}/ per locale
const catJsonld = (url, id) => JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Awesome DSH Plugin',
  url,
  numberOfItems: ordered.filter((e) => e.cat === id).length,
  itemListElement: ordered.filter((e) => e.cat === id).map((e, i) => ({ '@type': 'ListItem', position: i + 1, name: e.name, url: e.url })),
})
for (const loc of LOCALES) {
  for (const id of CAT_IDS) {
    const n = ordered.filter((e) => e.cat === id).length
    if (!n) continue
    const url = `${ORIGIN}${loc.urlPath}${id}/`
    const catHreflangs = [
      ...LOCALES.map((l) => `<link rel="alternate" hreflang="${l.code}" href="${ORIGIN}${l.urlPath}${id}/">`),
      `<link rel="alternate" hreflang="x-default" href="${ORIGIN}${LOCALES[0].urlPath}${id}/">`,
    ].join('\n')
    let page = master
    page = page.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, () => `<script type="application/ld+json">${ldSafe(catJsonld(url, id))}</script>`)
    page = page.replace(/(<ol class="dex" id="dex">)[\s\S]*?(<\/ol>)/, (m, a, b) => `${a}\n\n${buildRows(loc, id)}\n\n  ${b}`)
    page = page.replace(/(<div class="filters" id="filters">)[\s\S]*?(<\/div><!--\/filters-->)/, (m, a, b) => `${a}\n${buildChipLinks(loc, id)}\n    ${b}`)
    page = page
      .replaceAll('__LANG__', () => loc.htmlLang)
      .replaceAll('__TITLE__', () => esc(loc.CAT_TITLE.replace('{CAT}', loc.categories[id]).replace('{N}', n)))
      .replaceAll('__DESC__', () => esc(loc.CAT_DESC
        .replace('{CAT}', loc.categories[id])
        .replaceAll('{N}', n)
        .replace('{TOP}', catTop(id, loc))))
      .replaceAll('__URL__', () => url)
      .replaceAll('__HREFLANGS__', () => catHreflangs)
      .replaceAll('__OG_IMAGE__', () => ORIGIN + loc.og)
      .replaceAll('__LOCALE_LINKS__', () => LOCALES.filter((l) => l.code !== loc.code).map((l) => `<a class="lang-btn" href="${l.urlPath}${id}/" hreflang="${l.code}" rel="alternate">${l.label}</a>`).join('\n        '))
      .replaceAll('__SEARCH_PH__', () => loc.SEARCH_PH)
    .replaceAll('__HOME__', () => loc.urlPath)
    .replaceAll('__PRIVACY__', () => loc.privacyPath)
      .replaceAll('__LANG_REDIRECT__', () => '')
      .replaceAll('__FEED__', () => loc.feed)
    for (const [k, v] of Object.entries(loc.strings)) page = page.replaceAll(`__T_${k}__`, () => v)
    const outDir = loc.out.replace(/index\.html$/, '') + id
    fs.mkdirSync(outDir, { recursive: true })
    fs.writeFileSync(`${outDir}/index.html`, page)
  }
}

// Privacy page: /privacy/ per locale. The body is prose, not UI strings, so it
// lives in its own per-locale file (site/privacy.<code>.html) rather than in
// the locale registry — but the registry still declares it, so a new language
// fails loudly here instead of silently shipping an English privacy notice.
const privacyMaster = fs.readFileSync('site/privacy-template.html', 'utf8')
for (const loc of LOCALES) {
  if (!fs.existsSync(loc.privacyBody)) {
    console.error(`${loc.readme}'s locale declares privacyBody ${loc.privacyBody}, which does not exist`)
    process.exit(1)
  }
  const url = ORIGIN + loc.privacyPath
  const pHreflangs = [
    ...LOCALES.map((l) => `<link rel="alternate" hreflang="${l.code}" href="${ORIGIN}${l.privacyPath}">`),
    `<link rel="alternate" hreflang="x-default" href="${ORIGIN}${LOCALES[0].privacyPath}">`,
  ].join('\n')
  let page = privacyMaster
    .replaceAll('__LANG__', () => loc.htmlLang)
    .replaceAll('__TITLE__', () => esc(loc.PRIVACY_TITLE))
    .replaceAll('__DESC__', () => esc(loc.PRIVACY_DESC))
    .replaceAll('__URL__', () => url)
    .replaceAll('__HREFLANGS__', () => pHreflangs)
    .replaceAll('__OG_IMAGE__', () => ORIGIN + loc.og)
    .replaceAll('__HOME__', () => loc.urlPath)
    .replaceAll('__LOCALE_LINKS__', () => LOCALES.filter((l) => l.code !== loc.code)
      .map((l) => `<a class="lang-btn" href="${l.privacyPath}" hreflang="${l.code}" rel="alternate">${l.label}</a>`).join('\n  '))
    .replaceAll('__PRIVACY_BODY__', () => fs.readFileSync(loc.privacyBody, 'utf8').trimEnd())
  for (const [k, v] of Object.entries(loc.strings)) page = page.replaceAll(`__T_${k}__`, () => v)
  const outDir = 'docs' + loc.privacyPath.replace(/\/$/, '')
  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(`${outDir}/index.html`, page)
}

// Plugin detail pages: /p/{owner}/{repo}[--subdir]/ per locale
const detailMaster = fs.readFileSync('site/detail-template.html', 'utf8')
const readmes = fs.existsSync('data/readmes.json') ? JSON.parse(fs.readFileSync('data/readmes.json', 'utf8')) : {}
// Update notes (probe-updates.mjs): the latest release's notes and a short
// tail of recent commits, published as docs/updates.json for market-side
// consumers. Kept OUT of plugins.json on purpose: that file is fetched by
// every market on every open, and 1,300 release bodies would multiply its
// size for data only a user opening one update dialog ever reads. Absence is
// normal — repos without releases still carry their commit tail, and an
// entry missing here means "no notes available", never an error downstream.
const updates = fs.existsSync('data/updates.json') ? JSON.parse(fs.readFileSync('data/updates.json', 'utf8')) : {}

// render a plugin README to safe HTML: raw HTML dropped, headings demoted,
// relative links/images resolved against the repo (probe supplies the bases)
function renderReadme(rm) {
  const abs = (href, base, allowData = false) => {
    if (!href || /^(https?:|mailto:|#)/i.test(href)) return href
    if (/^data:/i.test(href)) return allowData ? href : '#'
    return base + href.replace(/^\.\//, '').replace(/^\//, '')
  }
  // A README is third-party markdown, and an <img> in it is a request the
  // visitor's browser makes to whatever host the author named — which is
  // exactly the tracking-pixel vector SCREENSHOT_HOSTS already exists to shut
  // (see data/screenshots.json validation above). The same rule has to apply
  // here or the guarantee is only as strong as its weakest path.
  //
  // The allowlist is GitHub's own hosting, which costs the visitor nothing new:
  // this site is served from GitHub Pages, so GitHub already sees the request
  // for the page itself. Everything else — badge services, CDNs, personal
  // domains — is dropped outright, along with the link and paragraph it leaves
  // behind. Keeping the alt text instead was worse: nearly all of these are
  // status badges, and a row of them collapses into "DSH Node.js JavaScript
  // Cordis Zero deps" — prose the author never wrote, in the position a reader
  // starts reading. The whole README is one click away in either case.
  const imgAllowed = (href) => {
    if (/^data:/i.test(href)) return true // inline bytes, no request leaves
    try { return SCREENSHOT_HOSTS.has(new URL(href).hostname) } catch { return false }
  }
  const md = new Marked({
    walkTokens(t) {
      if (t.type === 'heading') t.depth = Math.min(t.depth + 1, 6)
      else if (t.type === 'image') t.href = abs(t.href, rm.base, true)
      else if (t.type === 'link') t.href = abs(t.href, rm.blobBase)
    },
    renderer: {
      html: () => '',
      image({ href, title, text }) {
        if (!href || !imgAllowed(href)) return ''
        const t = title ? ` title="${esc(title)}"` : ''
        return `<img src="${esc(href)}" alt="${esc(text ?? '')}"${t} loading="lazy" decoding="async" referrerpolicy="no-referrer">`
      },
    },
  })
  try {
    // drop a leading H1 — the page already has one
    const src = rm.md.replace(/^\s*# .*\n/, '')
    // A dropped image leaves debris: first the link that wrapped it, then the
    // paragraph that held only that link. Raw HTML is already stripped, so
    // every anchor and paragraph here came from markdown and had content until
    // we removed the image. Loop because emptying a link empties its paragraph.
    let html = md.parse(src)
    for (let prev = null; prev !== html;) {
      prev = html
      html = html
        .replace(/<a\b[^>]*>\s*<\/a>/g, '')
        .replace(/<p>\s*<\/p>\s*/g, '')
    }
    return html
  } catch {
    return null
  }
}
for (const loc of LOCALES) {
  for (const e of ordered) {
    const url = `${ORIGIN}${loc.urlPath}p/${e.slug}/`
    const catUrl = `${loc.urlPath}${e.cat}/`
    const dHreflangs = [
      ...LOCALES.map((l) => `<link rel="alternate" hreflang="${l.code}" href="${ORIGIN}${l.urlPath}p/${e.slug}/">`),
      `<link rel="alternate" hreflang="x-default" href="${ORIGIN}${LOCALES[0].urlPath}p/${e.slug}/">`,
    ].join('\n')
    const desc = e.descs[loc.code]
    // Trim to a boundary rather than mid-word: a description cut at "config" ->
    // "conf…" is the one line a searcher reads before deciding to click. Prefer
    // ending on a sentence, else the last word; CJK has no spaces, so the word
    // fallback simply does not fire there and the hard cut stands.
    const metaDesc = (() => {
      if (desc.length <= 155) return desc
      const head = desc.slice(0, 152)
      const stop = Math.max(head.lastIndexOf('. '), head.lastIndexOf('。'), head.lastIndexOf('；'), head.lastIndexOf('; '))
      if (stop > 90) return desc.slice(0, stop + 1).trim()
      const space = head.lastIndexOf(' ')
      return (space > 90 ? head.slice(0, space) : head).trimEnd() + '…'
    })()

    const short = shortName(e.name)
    const h1 = `<span class="owner">${esc(e.owner)}/</span><wbr><span class="name">${esc(short)}</span>`

    const specs = [
      e.stars != null ? `<span>${loc.strings.P_STARS} <b>★ ${e.stars}</b></span>` : '',
      // Only when the number exists. An entry with no npm package has no
      // download figure to report, and printing "0" would read as a measured
      // result rather than an absent one.
      e.downloads != null ? `<span>${loc.strings.P_DOWNLOADS} <b translate="no">${fmtNum(e.downloads)}</b></span>` : '',
      `<span>${loc.strings.P_CAT} <a href="${catUrl}">${loc.categories[e.cat]}</a></span>`,
      `<span>${loc.strings.P_ADDED} <b>${e.added}</b></span>`,
      e.npm ? `<span>npm <a href="https://www.npmjs.com/package/${e.npm}" rel="noopener" translate="no">${esc(e.npm)}</a></span>` : '',
    ].filter(Boolean).join('\n        ')

    const cmds = []
    if (e.npm) cmds.push({ cmd: `dsh plugin --profile web add ${e.npm}`, note: loc.strings.NPM_C })
    if (e.cmdTarball) cmds.push({ cmd: e.cmdTarball, note: loc.strings.TGZ_C })
    cmds.push({ cmd: e.cmdGit, note: loc.strings.GH_C })
    const install = cmds.map(({ cmd, note }) => `<p class="note" style="margin:.2rem 0 .45rem"># ${note}</p>
    <div class="cmd"><pre translate="no">${esc(cmd)}</pre><button type="button" data-cmd="${esc(cmd)}" aria-label="${loc.COPY_LABEL}">${loc.COPY_TEXT}</button></div>`).join('\n    ')

    const links = [
      `<a href="${e.url}" rel="noopener">${loc.strings.P_GH}</a>`,
      e.npm ? `<a href="https://www.npmjs.com/package/${e.npm}" rel="noopener">${loc.strings.P_NPM}</a>` : '',
      `<a href="https://github.com/dsh-market/dsh-market" rel="noopener">${loc.strings.P_MARKET} ↗</a>`,
    ].filter(Boolean).join('\n      ')

    const related = ordered
      .filter((r) => r.cat === e.cat && r.url !== e.url)
      .sort((a, b) => (b.stars ?? -1) - (a.stars ?? -1))
      .slice(0, 6)
      .map((r) => `      <li><h3><a href="${loc.urlPath}p/${r.slug}/" translate="no">${esc(r.name)}</a>${r.stars != null ? `<span class="stars" translate="no">★ ${r.stars}</span>` : ''}</h3><a class="desc-link" href="${loc.urlPath}p/${r.slug}/" tabindex="-1"><p>${esc(r.descs[loc.code])}</p></a></li>`)
      .join('\n')

    const jsonldDetail = JSON.stringify([{
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: e.name,
      url,
      description: desc,
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'DeepSeek Harness',
      sameAs: [e.url, e.npm ? `https://www.npmjs.com/package/${e.npm}` : null].filter(Boolean),
    }, {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: loc.strings.CRUMB_ALL, item: `${ORIGIN}${loc.urlPath}` },
        { '@type': 'ListItem', position: 2, name: loc.categories[e.cat], item: `${ORIGIN}${catUrl}` },
        { '@type': 'ListItem', position: 3, name: e.name, item: url },
      ],
    }])

    // Pick the README matching the page locale, falling back to whatever the
    // project actually published. Roughly a third of entries ship only one
    // language, so the fallback fires on hundreds of pages: rendering it is
    // still right (documentation in the wrong language beats none), but the
    // block must then carry its own `lang` — a page that declares lang="en"
    // around Chinese prose is lying to every consumer that reads it, from
    // screen readers to search engines, and there is no upside to that.
    const entry = readmes[e.url]
    let rm = null
    let rmLang = null
    if (entry) {
      for (const code of [loc.code, ...LOCALES.map((l) => l.code)]) {
        if (entry[code]) { rm = entry[code]; rmLang = code; break }
      }
      // legacy shape: the README sat directly on the entry, with no locale key
      if (!rm && entry.md) { rm = entry; rmLang = loc.code }
    }
    const readmeHtml = rm ? renderReadme(rm) : null
    const rmLocale = LOCALES.find((l) => l.code === rmLang)
    const rmMismatch = rm != null && rmLang !== loc.code
    const rmNote = rmMismatch
      ? `\n    <p class="note">${esc(loc.strings.P_README_ONLY.replace('{LANG}', loc.langNames[rmLang] ?? rmLang))}</p>`
      : ''
    const readmeSection = readmeHtml ? `<section class="panel readme">
    <h2>README</h2>${rmNote}
    <div class="md" lang="${rmLocale?.htmlLang ?? loc.htmlLang}" translate="no">
${readmeHtml}
    </div>
    <p class="note"><a href="${rm.htmlUrl}" rel="noopener">${loc.strings.P_README_SRC}</a></p>
  </section>` : ''

    let page = detailMaster
    page = page
      .replaceAll('__P_README_SECTION__', () => readmeSection)
      .replaceAll('__LANG__', () => loc.htmlLang)
      .replaceAll('__TITLE__', () => esc(loc.P_TITLE
        .replace('{NAME}', e.name)
        .replace('{CAT}', loc.categories[e.cat])))
      .replaceAll('__DESC__', () => esc(metaDesc))
      .replaceAll('__URL__', () => url)
      .replaceAll('__HREFLANGS__', () => dHreflangs)
      .replaceAll('__OG_IMAGE__', () => ORIGIN + loc.og)
      .replaceAll('__JSONLD__', () => ldSafe(jsonldDetail))
      .replaceAll('__HOME__', () => loc.urlPath)
      .replaceAll('__PRIVACY__', () => loc.privacyPath)
      .replaceAll('__LOCALE_LINKS__', () => LOCALES.filter((l) => l.code !== loc.code).map((l) => `<a class="lang-btn" href="${l.urlPath}p/${e.slug}/" hreflang="${l.code}" rel="alternate">${l.label}</a>`).join('\n        '))
      .replaceAll('__CAT_URL__', () => catUrl)
      .replaceAll('__CAT_NAME__', () => loc.categories[e.cat])
      .replaceAll('__P_SHORT__', () => esc(short))
      .replaceAll('__P_H1__', () => h1)
      .replaceAll('__P_SPECS__', () => specs)
      .replaceAll('__P_DESC__', () => esc(desc))
      .replaceAll('__P_INSTALL__', () => install)
      .replaceAll('__P_INSTALL_NOTE__', () => loc.strings.INSTALL_NOTE)
      .replaceAll('__P_LINKS__', () => links)
      .replaceAll('__P_RELATED__', () => related)
    for (const [k, v] of Object.entries(loc.strings)) page = page.replaceAll(`__T_${k}__`, () => v)
    const outDir = `${loc.out.replace(/index\.html$/, '')}p/${e.slug}`
    fs.mkdirSync(outDir, { recursive: true })
    fs.writeFileSync(`${outDir}/index.html`, page)
  }
}

// Prune detail pages for entries no longer listed — otherwise a removed or
// renamed plugin leaves a live orphan page behind.
{
  const liveSlugs = new Set(ordered.map((e) => e.slug.toLowerCase()))
  for (const loc of LOCALES) {
    const pRoot = `${loc.out.replace(/index\.html$/, '')}p`
    if (!fs.existsSync(pRoot)) continue
    for (const owner of fs.readdirSync(pRoot)) {
      const ownerDir = `${pRoot}/${owner}`
      if (!fs.statSync(ownerDir).isDirectory()) continue
      for (const name of fs.readdirSync(ownerDir)) {
        if (!fs.statSync(`${ownerDir}/${name}`).isDirectory()) continue
        if (!liveSlugs.has(`${owner}/${name}`.toLowerCase())) {
          fs.rmSync(`${ownerDir}/${name}`, { recursive: true, force: true })
          console.log(`pruned stale detail page ${ownerDir}/${name}`)
        }
      }
      if (fs.readdirSync(ownerDir).length === 0) fs.rmdirSync(ownerDir)
    }
  }
}

// Atom feeds: newest 30 entries per locale
for (const loc of LOCALES) {
  const recent = [...ordered].sort((a, b2) => b2.addedAt < a.addedAt ? -1 : b2.addedAt > a.addedAt ? 1 : 0).slice(0, 30)
  const feed = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${esc(loc.TITLE)}</title>
  <id>${ORIGIN}${loc.urlPath}</id>
  <link href="${ORIGIN}${loc.urlPath}"/>
  <link rel="self" href="${ORIGIN}${loc.feed}"/>
  <updated>${isoTs([...ordered].map((e) => e.addedAt).sort().pop())}</updated>
${recent.map((e) => `  <entry>
    <title>${esc(e.name)}</title>
    <id>${esc(e.url)}</id>
    <link href="${esc(e.url)}"/>
    <updated>${isoTs(e.addedAt)}</updated>
    <summary>${esc(e.descs[loc.code])}</summary>
  </entry>`).join('\n')}
</feed>
`
  fs.writeFileSync(loc.feedOut, feed)
}

// Public registry API: /plugins.json — deterministic; consumed by the find
// plugin, the site, and any third-party storefront (Pages serves CORS *).
const registry = {
  name: 'awesome-dsh-plugin',
  url: ORIGIN,
  source: 'https://github.com/awesome-dsh-plugin/awesome-dsh-plugin',
  updated: [...ordered].map((e) => e.added).sort().pop(),
  count: N,
  categories: Object.fromEntries(CAT_IDS.map((id) => [id, Object.fromEntries(LOCALES.map((l) => [l.code, l.categories[id]]))])),
  plugins: ordered.map((e) => {
    // Registry installs beat full-repo GitHub tarballs (smaller, prebuilt, CDN);
    // the probe (scripts/probe-npm.mjs) only maps packages whose repository
    // field points back at the listed repo.
    return {
      // READMEs render "owner/name" for human disambiguation; machine
      // consumers (find-plugin, dsh-market) match on the bare plugin name,
      // with `owner` as its own field.
      name: shortName(e.name),
      owner: e.owner,
      url: e.url,
      page: `${ORIGIN}/p/${e.slug}/`,
      category: e.cat,
      description: Object.fromEntries(LOCALES.map((l) => [l.code, e.descs[l.code]])),
      npm: e.npm,
      // The author-declared release asset, when there is one. `install` folds
      // it into a display string, but a consumer that only reads `npm` sees
      // null and falls back to `github:owner/repo` — a different artifact from
      // the one the listing tells a human to install, and for a plugin that
      // ships no built output, one that does not install at all. Recovering it
      // by parsing the command string is not a contract worth offering, so the
      // field is published directly. Omitted when absent, like `screenshots`.
      tarball: e.tarball ?? undefined,
      stars: e.stars,
      downloads: e.downloads,
      install: e.npm ? `dsh plugin --profile web add ${e.npm}` : (e.cmdTarball ?? e.cmdGit),
      added: e.added,
      // Optional, author-maintained (data/screenshots.json); omitted when
      // absent so the payload stays lean. Storefronts fall back to their own
      // README extraction (dsh-market #61).
      screenshots: shotsMap[e.url],
    }
  }),
}
fs.writeFileSync('docs/plugins.json', JSON.stringify(registry, null, 1) + '\n')

// Public README payload: /readmes.json — the markdown the detail pages render,
// keyed by entry URL like the registry. Published so a storefront can build
// plugin pages with the same body text instead of re-probing GitHub for it:
// the probe costs ~700 API calls, and two independent copies would drift.
//
// Only listed entries are included, so a delisted plugin disappears here the
// same build it disappears everywhere else. Large — a few MB before the
// compression Pages applies — which is why it is one file a build fetches
// once rather than 1,300 a build fetches individually.
{
  const listed = new Set(ordered.map((e) => e.url))
  const payload = {
    name: 'awesome-dsh-plugin',
    url: ORIGIN,
    updated: registry.updated,
    count: 0,
    // locale code -> the README language it is served for, so a consumer can
    // reproduce the fallback the site itself does (and mark the mismatch).
    locales: LOCALES.map((l) => l.code),
    readmes: {},
  }
  for (const [url, entry] of Object.entries(readmes)) {
    if (!listed.has(url)) continue
    const langs = {}
    for (const l of LOCALES) if (entry[l.code]) langs[l.code] = entry[l.code]
    if (!Object.keys(langs).length) continue
    payload.readmes[url] = langs
    payload.count++
  }
  fs.writeFileSync('docs/readmes.json', JSON.stringify(payload) + '\n')
  console.log(`readmes.json: ${payload.count} entries, ${(fs.statSync('docs/readmes.json').size / 1048576).toFixed(1)} MB`)
}

// Public update-notes payload: /updates.json — what a consumer needs to show
// "what changed" between an installed version and HEAD without touching the
// GitHub API (whose anonymous budget is shared per egress IP and unusable
// behind common proxies). One file fetched once per consumer, like readmes;
// only listed entries, so delisting removes the notes the same build it
// removes everything else about a plugin.
{
  const listed = new Set(ordered.map((e) => e.url))
  const payload = {
    name: 'awesome-dsh-plugin',
    url: ORIGIN,
    updated: registry.updated,
    count: 0,
    updates: {},
  }
  for (const [url, entry] of Object.entries(updates)) {
    if (!listed.has(url)) continue
    payload.updates[url] = entry
    payload.count++
  }
  fs.writeFileSync('docs/updates.json', JSON.stringify(payload) + '\n')
  console.log(`updates.json: ${payload.count} entries, ${(fs.statSync('docs/updates.json').size / 1024).toFixed(0)} KB`)
}

const lastAdded = [...ordered].map((e) => e.added).sort().pop()

// The privacy page changes on the order of once a year, so its lastmod comes
// from the commit that last touched its sources rather than from build time.
// A lastmod that moves every night without the page changing is worse than
// none: it teaches a crawler to stop believing every lastmod on the site.
// Empty only before these files are first committed, where today is correct.
const PRIVACY_LASTMOD = (() => {
  const sources = ['site/privacy-template.html', ...LOCALES.map((l) => l.privacyBody)]
  const out = execSync(`git log -1 --format=%cs -- ${sources.join(' ')}`, { encoding: 'utf8' }).trim()
  return out || new Date().toISOString().slice(0, 10)
})()
const alternates = [
  ...LOCALES.map((l) => `      <xhtml:link rel="alternate" hreflang="${l.code}" href="${ORIGIN}${l.urlPath}"/>`),
  `      <xhtml:link rel="alternate" hreflang="x-default" href="${ORIGIN}${LOCALES[0].urlPath}"/>`,
].join('\n')
fs.writeFileSync('docs/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${LOCALES.map((l) => `  <url>
    <loc>${ORIGIN}${l.urlPath}</loc>
    <lastmod>${lastAdded}</lastmod>
    <changefreq>daily</changefreq>
${alternates}
  </url>`).join('\n')}
${LOCALES.flatMap((l) => CAT_IDS.map((id) => `  <url>
    <loc>${ORIGIN}${l.urlPath}${id}/</loc>
    <lastmod>${lastAdded}</lastmod>
    <changefreq>daily</changefreq>
${[...LOCALES.map((l2) => `      <xhtml:link rel="alternate" hreflang="${l2.code}" href="${ORIGIN}${l2.urlPath}${id}/"/>`), `      <xhtml:link rel="alternate" hreflang="x-default" href="${ORIGIN}${LOCALES[0].urlPath}${id}/"/>`].join('\n')}
  </url>`)).join('\n')}
${LOCALES.map((l) => `  <url>
    <loc>${ORIGIN}${l.privacyPath}</loc>
    <lastmod>${PRIVACY_LASTMOD}</lastmod>
    <changefreq>yearly</changefreq>
${[...LOCALES.map((l2) => `      <xhtml:link rel="alternate" hreflang="${l2.code}" href="${ORIGIN}${l2.privacyPath}"/>`), `      <xhtml:link rel="alternate" hreflang="x-default" href="${ORIGIN}${LOCALES[0].privacyPath}"/>`].join('\n')}
  </url>`).join('\n')}
${LOCALES.flatMap((l) => ordered.map((e) => `  <url>
    <loc>${ORIGIN}${l.urlPath}p/${e.slug}/</loc>
    <lastmod>${e.added}</lastmod>
    <changefreq>weekly</changefreq>
${[...LOCALES.map((l2) => `      <xhtml:link rel="alternate" hreflang="${l2.code}" href="${ORIGIN}${l2.urlPath}p/${e.slug}/"/>`), `      <xhtml:link rel="alternate" hreflang="x-default" href="${ORIGIN}${LOCALES[0].urlPath}p/${e.slug}/"/>`].join('\n')}
  </url>`)).join('\n')}
</urlset>
`)

// shields.io endpoint badge — the READMEs embed this instead of a hand-written
// count, so the build never has to touch source files.
//
// cacheSeconds is how long shields' CDN serves a stale count: the badge sits
// directly above a list whose length anyone can count, so an hour of drift
// reads as a bug in the list. 300 is shields' floor for endpoint badges.
fs.writeFileSync('docs/count.json', JSON.stringify({
  schemaVersion: 1, label: 'plugins', message: String(N), color: 'c0392b', cacheSeconds: 300,
}) + '\n')

console.log(`site built: ${N} rows × ${LOCALES.length} locales + sitemap + count badge`)
