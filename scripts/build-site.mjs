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
// url -> prebuilt release tarball, declared per entry in data/plugins/*.yml
const tarballMap = Object.fromEntries(readEntries().filter((e) => e.tarball).map((e) => [e.url, e.tarball]))
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

// star-ranked card grid; `only` limits to one category (category pages)
function buildRows(loc, only) {
  const group = ordered
    .filter((e) => !only || e.cat === only)
    .slice()
    .sort((a, b) => (b.stars ?? -1) - (a.stars ?? -1))
  return group.map((e) => {
    const cmd = e.npm ? `dsh plugin --profile web add ${e.npm}` : e.cmdGit
    const short = e.name.includes('/') ? e.name.slice(e.name.indexOf('/') + 1) : e.name
    return `    <li class="card" data-cat="${e.cat}">
      <div class="top">
        <h3><a href="${loc.urlPath}p/${e.slug}/" translate="no"><span class="owner">${esc(e.owner)}/</span>${esc(short)}</a></h3>
        ${e.stars != null ? `<span class="stars" translate="no">${e.stars}</span>` : ''}
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
      .replaceAll('__TITLE__', () => loc.CAT_TITLE.replace('{CAT}', loc.categories[id]))
      .replaceAll('__DESC__', () => loc.CAT_DESC.replace('{CAT}', loc.categories[id]).replace('{N}', n))
      .replaceAll('__URL__', () => url)
      .replaceAll('__HREFLANGS__', () => catHreflangs)
      .replaceAll('__OG_IMAGE__', () => ORIGIN + loc.og)
      .replaceAll('__LOCALE_LINKS__', () => LOCALES.filter((l) => l.code !== loc.code).map((l) => `<a class="lang-btn" href="${l.urlPath}${id}/" hreflang="${l.code}" rel="alternate">${l.label}</a>`).join('\n        '))
      .replaceAll('__SEARCH_PH__', () => loc.SEARCH_PH)
    .replaceAll('__HOME__', () => loc.urlPath)
      .replaceAll('__LANG_REDIRECT__', () => '')
      .replaceAll('__FEED__', () => loc.feed)
    for (const [k, v] of Object.entries(loc.strings)) page = page.replaceAll(`__T_${k}__`, () => v)
    const outDir = loc.out.replace(/index\.html$/, '') + id
    fs.mkdirSync(outDir, { recursive: true })
    fs.writeFileSync(`${outDir}/index.html`, page)
  }
}

// Plugin detail pages: /p/{owner}/{repo}[--subdir]/ per locale
const detailMaster = fs.readFileSync('site/detail-template.html', 'utf8')
const readmes = fs.existsSync('data/readmes.json') ? JSON.parse(fs.readFileSync('data/readmes.json', 'utf8')) : {}

// render a plugin README to safe HTML: raw HTML dropped, headings demoted,
// relative links/images resolved against the repo (probe supplies the bases)
function renderReadme(rm) {
  const abs = (href, base, allowData = false) => {
    if (!href || /^(https?:|mailto:|#)/i.test(href)) return href
    if (/^data:/i.test(href)) return allowData ? href : '#'
    return base + href.replace(/^\.\//, '').replace(/^\//, '')
  }
  const md = new Marked({
    walkTokens(t) {
      if (t.type === 'heading') t.depth = Math.min(t.depth + 1, 6)
      else if (t.type === 'image') t.href = abs(t.href, rm.base, true)
      else if (t.type === 'link') t.href = abs(t.href, rm.blobBase)
    },
    renderer: { html: () => '' },
  })
  try {
    // drop a leading H1 — the page already has one
    const src = rm.md.replace(/^\s*# .*\n/, '')
    return md.parse(src)
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
    const metaDesc = desc.length > 155 ? desc.slice(0, 152) + '…' : desc

    const short = e.name.includes('/') ? e.name.slice(e.name.indexOf('/') + 1) : e.name
    const h1 = `<span class="owner">${esc(e.owner)}/</span><wbr><span class="name">${esc(short)}</span>`

    const specs = [
      e.stars != null ? `<span>${loc.strings.P_STARS} <b>★ ${e.stars}</b></span>` : '',
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

    // pick the README matching the page locale; fall back to whatever exists
    const entry = readmes[e.url]
    const rm = entry ? (entry[loc.code] ?? entry.en ?? entry.zh ?? (entry.md ? entry : null)) : null
    const readmeHtml = rm ? renderReadme(rm) : null
    const readmeSection = readmeHtml ? `<section class="panel readme">
    <h2>README</h2>
    <div class="md" translate="no">
${readmeHtml}
    </div>
    <p class="note"><a href="${rm.htmlUrl}" rel="noopener">${loc.strings.P_README_SRC}</a></p>
  </section>` : ''

    let page = detailMaster
    page = page
      .replaceAll('__P_README_SECTION__', () => readmeSection)
      .replaceAll('__LANG__', () => loc.htmlLang)
      .replaceAll('__TITLE__', () => esc(loc.P_TITLE.replace('{NAME}', e.name).replace('{CAT}', loc.categories[e.cat])))
      .replaceAll('__DESC__', () => esc(metaDesc))
      .replaceAll('__URL__', () => url)
      .replaceAll('__HREFLANGS__', () => dHreflangs)
      .replaceAll('__OG_IMAGE__', () => ORIGIN + loc.og)
      .replaceAll('__JSONLD__', () => ldSafe(jsonldDetail))
      .replaceAll('__HOME__', () => loc.urlPath)
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
      name: e.name.includes('/') ? e.name.slice(e.name.indexOf('/') + 1) : e.name,
      owner: e.owner,
      url: e.url,
      page: `${ORIGIN}/p/${e.slug}/`,
      category: e.cat,
      description: Object.fromEntries(LOCALES.map((l) => [l.code, e.descs[l.code]])),
      npm: e.npm,
      stars: e.stars,
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

const lastAdded = [...ordered].map((e) => e.added).sort().pop()
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
