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
import LOCALES from '../site/locales.mjs'

const ORIGIN = 'https://awesome-dsh-plugin.com'
const DATES_FILE = 'data/added-dates.json'
const NPM_MAP_FILE = 'data/npm-map.json'
const CAT_IDS = ['ui', 'theme', 'session', 'memory', 'tools', 'skill', 'workflow', 'notify', 'model', 'dev', 'fun']

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

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
    const m = line.match(/^- \[(.+?)\]\((https:\/\/github\.com\/[^)]+)\) [—-] (.+)$/)
    if (m && cat) out.set(m[2], { name: m[1], url: m[2], desc: m[3], cat })
  }
  return out
}

// Join all locales on plugin URL; the default locale defines the roster.
const parsed = LOCALES.map((loc) => ({ loc, entries: parseReadme(loc) }))
const [base, ...others] = parsed
const entries = []
for (const [url, e] of base.entries) {
  const descs = { [base.loc.code]: e.desc }
  let ok = true
  for (const { loc, entries: map } of others) {
    const t = map.get(url)
    if (!t) { console.error(`${loc.readme} missing: ${url}`); ok = false; break }
    descs[loc.code] = t.desc
  }
  if (ok) entries.push({ name: e.name, url: e.url, cat: e.cat, owner: url.split('/')[3], descs })
}
console.log(`${entries.length} entries parsed across ${LOCALES.length} locales`)

const ordered = CAT_IDS.flatMap((id) => entries.filter((e) => e.cat === id))
const N = ordered.length

// added-date ledger: existing URLs keep their date, new URLs are stamped today
const dates = fs.existsSync(DATES_FILE) ? JSON.parse(fs.readFileSync(DATES_FILE, 'utf8')) : {}
const npmMap = fs.existsSync(NPM_MAP_FILE) ? JSON.parse(fs.readFileSync(NPM_MAP_FILE, 'utf8')) : {}
const starsMap = fs.existsSync('data/stars.json') ? JSON.parse(fs.readFileSync('data/stars.json', 'utf8')) : {}
const today0 = new Date().toISOString().slice(0, 10)
for (const e of ordered) if (!dates[e.url]) dates[e.url] = today0
fs.writeFileSync(DATES_FILE, JSON.stringify(Object.fromEntries(Object.entries(dates).sort()), null, 1))
for (const e of ordered) e.added = dates[e.url]

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

function buildRows(loc, only) {
  let idx = 0
  return CAT_IDS.filter((id) => !only || id === only).map((id) => {
    const group = ordered.filter((e) => e.cat === id)
    if (!group.length) return ''
    const sec = `    <li class="sec" data-sec="${id}"><h2 id="${id}"><a href="${loc.urlPath}${id}/">${loc.categories[id]}</a> <small>${group.length}</small></h2></li>`
    const items = group.map((e) => {
      idx++
      const delay = Math.min(idx * 0.02, 0.4).toFixed(2)
      const repoPath = e.url.replace('https://github.com/', '')
      const repo = repoPath.split('/').slice(0, 2).join('/')
      const sub = repoPath.includes('/tree/') ? repoPath.split('/tree/')[1].replace(/^[^/]+\//, '') : null
      const cmd = sub
        ? `dsh plugin --profile web add github:${repo}#path:/${sub}`
        : `dsh plugin --profile web add github:${repo}`
      return `    <li class="item" data-cat="${e.cat}" style="animation-delay:${delay}s">
      <span class="no" aria-hidden="true">№ ${String(idx).padStart(2, '0')}</span>
      <div>
        <h3><a href="${e.url}" rel="noopener" translate="no">${esc(e.name)}</a>${starsMap[e.url]?.stars != null ? `<span class="stars" translate="no">★ ${starsMap[e.url].stars}</span>` : ''}</h3>
        <p>${esc(e.descs[loc.code])}</p>
      </div>
      <button class="copy" type="button" data-cmd="${esc(cmd)}" aria-label="${loc.COPY_LABEL}">${loc.COPY_TEXT}</button>
    </li>`
    }).join('\n\n')
    return sec + '\n\n' + items
  }).filter(Boolean).join('\n\n')
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
  page = page.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">${jsonld(ORIGIN + loc.urlPath)}</script>`)
  page = page.replace(/(<ol class="dex" id="dex">)[\s\S]*?(<\/ol>)/, `$1\n\n${buildRows(loc)}\n\n  $2`)
  page = page.replace(/(<div class="filters" id="filters">)[\s\S]*?(<\/div><!--\/filters-->)/, `$1\n${buildChips(loc)}\n    $2`)
  page = page
    .replaceAll('__LANG__', loc.htmlLang)
    .replaceAll('__TITLE__', loc.TITLE)
    .replaceAll('__DESC__', loc.DESC.replace('{N}', N))
    .replaceAll('__URL__', ORIGIN + loc.urlPath)
    .replaceAll('__HREFLANGS__', hreflangs)
    .replaceAll('__OG_IMAGE__', ORIGIN + loc.og)
    .replaceAll('__LOCALE_LINKS__', localeLinks(loc))
    .replaceAll('__SEARCH_PH__', loc.SEARCH_PH)
    .replaceAll('__LANG_REDIRECT__', langRedirect(loc))
    .replaceAll('__FEED__', loc.feed)
  for (const [k, v] of Object.entries(loc.strings)) page = page.replaceAll(`__T_${k}__`, v)
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
    page = page.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">${catJsonld(url, id)}</script>`)
    page = page.replace(/(<ol class="dex" id="dex">)[\s\S]*?(<\/ol>)/, `$1\n\n${buildRows(loc, id)}\n\n  $2`)
    page = page.replace(/(<div class="filters" id="filters">)[\s\S]*?(<\/div><!--\/filters-->)/, `$1\n${buildChipLinks(loc, id)}\n    $2`)
    page = page
      .replaceAll('__LANG__', loc.htmlLang)
      .replaceAll('__TITLE__', loc.CAT_TITLE.replace('{CAT}', loc.categories[id]))
      .replaceAll('__DESC__', loc.CAT_DESC.replace('{CAT}', loc.categories[id]).replace('{N}', n))
      .replaceAll('__URL__', url)
      .replaceAll('__HREFLANGS__', catHreflangs)
      .replaceAll('__OG_IMAGE__', ORIGIN + loc.og)
      .replaceAll('__LOCALE_LINKS__', LOCALES.filter((l) => l.code !== loc.code).map((l) => `<a class="lang-btn" href="${l.urlPath}${id}/" hreflang="${l.code}" rel="alternate">${l.label}</a>`).join('\n        '))
      .replaceAll('__SEARCH_PH__', loc.SEARCH_PH)
      .replaceAll('__LANG_REDIRECT__', '')
      .replaceAll('__FEED__', loc.feed)
    for (const [k, v] of Object.entries(loc.strings)) page = page.replaceAll(`__T_${k}__`, v)
    const outDir = loc.out.replace(/index\.html$/, '') + id
    fs.mkdirSync(outDir, { recursive: true })
    fs.writeFileSync(`${outDir}/index.html`, page)
  }
}

// Atom feeds: newest 30 entries per locale
for (const loc of LOCALES) {
  const recent = [...ordered].sort((a, b2) => b2.added < a.added ? -1 : b2.added > a.added ? 1 : 0).slice(0, 30)
  const feed = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${esc(loc.TITLE)}</title>
  <id>${ORIGIN}${loc.urlPath}</id>
  <link href="${ORIGIN}${loc.urlPath}"/>
  <link rel="self" href="${ORIGIN}${loc.feed}"/>
  <updated>${[...ordered].map((e) => e.added).sort().pop()}T00:00:00Z</updated>
${recent.map((e) => `  <entry>
    <title>${esc(e.name)}</title>
    <id>${e.url}</id>
    <link href="${e.url}"/>
    <updated>${e.added}T00:00:00Z</updated>
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
    const npm = npmMap[e.url]?.npm ?? null
    return {
      // READMEs render "owner/name" for human disambiguation; machine
      // consumers (find-plugin, dsh-market) match on the bare plugin name,
      // with `owner` as its own field.
      name: e.name.includes('/') ? e.name.slice(e.name.indexOf('/') + 1) : e.name,
      owner: e.owner,
      url: e.url,
      category: e.cat,
      description: Object.fromEntries(LOCALES.map((l) => [l.code, e.descs[l.code]])),
      npm,
      stars: starsMap[e.url]?.stars ?? null,
      install: `dsh plugin --profile web add ${npm ?? `github:${e.url.replace('https://github.com/', '')}`}`,
      added: e.added,
    }
  }),
}
fs.writeFileSync('docs/plugins.json', JSON.stringify(registry, null, 1) + '\n')

const today = new Date().toISOString().slice(0, 10)
const alternates = [
  ...LOCALES.map((l) => `      <xhtml:link rel="alternate" hreflang="${l.code}" href="${ORIGIN}${l.urlPath}"/>`),
  `      <xhtml:link rel="alternate" hreflang="x-default" href="${ORIGIN}${LOCALES[0].urlPath}"/>`,
].join('\n')
fs.writeFileSync('docs/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${LOCALES.map((l) => `  <url>
    <loc>${ORIGIN}${l.urlPath}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
${alternates}
  </url>`).join('\n')}
${LOCALES.flatMap((l) => CAT_IDS.map((id) => `  <url>
    <loc>${ORIGIN}${l.urlPath}${id}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
${[...LOCALES.map((l2) => `      <xhtml:link rel="alternate" hreflang="${l2.code}" href="${ORIGIN}${l2.urlPath}${id}/"/>`), `      <xhtml:link rel="alternate" hreflang="x-default" href="${ORIGIN}${LOCALES[0].urlPath}${id}/"/>`].join('\n')}
  </url>`)).join('\n')}
</urlset>
`)

// keep the hand-written counts in every README in sync
const enReadme = fs.readFileSync('README.md', 'utf8').replace(/\*\*\d+\*\* plugins/, `**${N}** plugins`)
fs.writeFileSync('README.md', enReadme)
const zhReadme = fs.readFileSync('README.zh.md', 'utf8').replace(/\*\*\d+\*\* 个插件/, `**${N}** 个插件`)
fs.writeFileSync('README.zh.md', zhReadme)

console.log(`site built: ${N} rows × ${LOCALES.length} locales + sitemap, README counts synced`)
