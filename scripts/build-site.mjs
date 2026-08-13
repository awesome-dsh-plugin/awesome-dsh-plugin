#!/usr/bin/env node
/**
 * Build the site from README.md + README.zh.md (the source of truth).
 *
 * site/template.html is a bilingual master carrying __TOKENS__ and paired
 * <span class="zh">/<span class="en"> text. This script injects the plugin
 * rows, then emits one fully-localized page per language — plus a sitemap
 * with hreflang alternates:
 *
 *   docs/index.html     (en, canonical /, x-default)
 *   docs/zh/index.html  (zh-CN, canonical /zh/)
 *   docs/sitemap.xml
 *
 * Usage: node scripts/build-site.mjs
 */
import fs from 'node:fs'

const ORIGIN = 'https://awesome-dsh-plugin.com'

const CATS = [
  ['ui', '🎨', 'UI 增强', 'UI Enhancements'],
  ['session', '💬', '会话与消息', 'Sessions & Messages'],
  ['tools', '🛠️', '工具与能力', 'Tools & Capabilities'],
  ['workflow', '🔁', '工作流与自动化', 'Workflow & Automation'],
  ['notify', '🔔', '通知与集成', 'Notifications & Integrations'],
  ['dev', '🧑‍💻', '开发与运行时', 'Development & Runtime'],
  ['fun', '🎮', '娱乐', 'Just for Fun'],
]

function parseReadme(path) {
  const text = fs.readFileSync(path, 'utf8')
  const out = new Map() // url -> {name, url, desc, cat}
  let cat = null
  for (const line of text.split('\n')) {
    const h = line.match(/^## (.+)$/)
    if (h) {
      cat = null
      for (const [id, , zh, en] of CATS) {
        if (h[1].includes(zh) || h[1].includes(en)) cat = id
      }
      continue
    }
    const m = line.match(/^- \[(.+?)\]\((https:\/\/github\.com\/[^)]+)\) — (.+)$/)
    if (m && cat) out.set(m[2], { name: m[1], url: m[2], desc: m[3], cat })
  }
  return out
}

const en = parseReadme('README.md')
const zh = parseReadme('README.zh.md')

const entries = []
for (const [url, e] of en) {
  const z = zh.get(url)
  if (!z) { console.error(`zh missing: ${url}`); continue }
  entries.push({ ...e, zh: z.desc, en: e.desc, owner: url.split('/')[3] })
}
console.log(`${entries.length} entries parsed`)

const ordered = CATS.flatMap(([id]) => entries.filter((e) => e.cat === id))
const N = ordered.length

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

let idx = 0
const rows = CATS.map(([id, emoji, zhName, enName]) => {
  const group = ordered.filter((e) => e.cat === id)
  if (!group.length) return ''
  const sec = `    <li class="sec" data-sec="${id}"><h2 id="${id}">${emoji} <span class="zh">${zhName}</span><span class="en">${enName}</span> <small>${group.length}</small></h2></li>`
  const items = group.map((e) => {
    idx++
    const delay = Math.min(idx * 0.02, 0.4).toFixed(2)
    const repo = e.url.replace('https://github.com/', '')
    const cmd = `dsh plugin --profile web add github:${repo}`
    return `    <li class="item" data-cat="${e.cat}" style="animation-delay:${delay}s">
      <span class="no" aria-hidden="true">№ ${String(idx).padStart(2, '0')}</span>
      <div>
        <h3><a href="${e.url}" rel="noopener" translate="no">${esc(e.name)}</a><span class="by" translate="no">${esc(e.owner)}</span></h3>
        <p><span class="zh">${esc(e.zh)}</span><span class="en">${esc(e.en)}</span></p>
      </div>
      <button class="copy" type="button" data-cmd="${esc(cmd)}" aria-label="__COPY_LABEL__"><span class="zh">复制安装命令</span><span class="en">copy install</span></button>
    </li>`
  }).join('\n\n')
  return sec + '\n\n' + items
}).filter(Boolean).join('\n\n')

const chips = [
  `      <button class="chip active" type="button" data-cat="all"><span class="zh">全部</span><span class="en">All</span> <small>${N}</small></button>`,
  ...CATS.map(([id, emoji, zhName, enName]) => {
    const n = ordered.filter((e) => e.cat === id).length
    return `      <button class="chip" type="button" data-cat="${id}">${emoji} <span class="zh">${zhName}</span><span class="en">${enName}</span> <small>${n}</small></button>`
  }),
].join('\n')

const jsonld = (url, name) => JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name,
  url,
  numberOfItems: N,
  itemListElement: ordered.map((e, i) => ({ '@type': 'ListItem', position: i + 1, name: e.name, url: e.url })),
})

// ── localize: drop the other language's spans, unwrap this language's ──
// Language spans never nest other spans, so a span-boundary guard is safe.
const spanRe = (cls) => new RegExp(`<span class="${cls}">((?:(?!</?span)[\\s\\S])*?)</span>`, 'g')
function localize(html, keep) {
  const drop = keep === 'en' ? 'zh' : 'en'
  let out = html
  for (let i = 0; i < 3; i++) { // a few passes for adjacent matches
    out = out.replace(spanRe(drop), '').replace(spanRe(keep), '$1')
  }
  return out
}

const LOCALES = {
  en: {
    LANG: 'en',
    TITLE: 'Awesome DSH Plugin — Curated DeepSeek Harness (dsh) Plugin List',
    DESC: `A curated list of ${N} DeepSeek Harness (dsh) plugins: UI enhancements, sessions, tools, workflow, notifications, development, and fun. Updated continuously.`,
    URL: `${ORIGIN}/`,
    ALT_URL: '/zh/',
    ALT_LANG: 'zh',
    ALT_LABEL: '中文',
    SEARCH_PH: 'Search plugins…',
    COPY_LABEL: 'Copy install command',
    LANG_REDIRECT: `\n<script>if(new URLSearchParams(location.search).get('lang')==='zh'){const p=new URLSearchParams(location.search);p.delete('lang');location.replace('/zh/'+(p.size?'?'+p:''))}</script>`,
    out: 'docs/index.html',
  },
  zh: {
    LANG: 'zh-CN',
    TITLE: 'Awesome DSH Plugin — DeepSeek Harness（dsh）插件精选列表',
    DESC: `DeepSeek Harness（dsh）插件精选列表，收录 ${N} 个：UI 增强、会话与消息、工具、工作流与自动化、通知与集成、开发与娱乐，持续更新。`,
    URL: `${ORIGIN}/zh/`,
    ALT_URL: '/',
    ALT_LANG: 'en',
    ALT_LABEL: 'EN',
    SEARCH_PH: '搜索插件…',
    COPY_LABEL: '复制安装命令',
    LANG_REDIRECT: `\n<script>if(new URLSearchParams(location.search).get('lang')==='en'){const p=new URLSearchParams(location.search);p.delete('lang');location.replace('/'+(p.size?'?'+p:''))}</script>`,
    out: 'docs/zh/index.html',
  },
}

let master = fs.readFileSync('site/template.html', 'utf8')
master = master.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">__JSONLD__</script>`)
master = master.replace(/(<ol class="dex" id="dex">)[\s\S]*?(<\/ol>)/, `$1\n\n${rows}\n\n  $2`)
master = master.replace(/(<div class="filters" id="filters">)[\s\S]*?(<\/div><!--\/filters-->)/, `$1\n${chips}\n    $2`)

for (const [key, loc] of Object.entries(LOCALES)) {
  let page = localize(master, key)
  page = page
    .replaceAll('__LANG__', loc.LANG)
    .replaceAll('__TITLE__', loc.TITLE)
    .replaceAll('__DESC__', loc.DESC)
    .replaceAll('__URL__', loc.URL)
    .replaceAll('__ALT_URL__', loc.ALT_URL)
    .replaceAll('__ALT_LANG__', loc.ALT_LANG)
    .replaceAll('__ALT_LABEL__', loc.ALT_LABEL)
    .replaceAll('__SEARCH_PH__', loc.SEARCH_PH)
    .replaceAll('__COPY_LABEL__', loc.COPY_LABEL)
    .replaceAll('__LANG_REDIRECT__', loc.LANG_REDIRECT)
    .replaceAll('__JSONLD__', jsonld(loc.URL, 'Awesome DSH Plugin'))
  fs.mkdirSync(loc.out.split('/').slice(0, -1).join('/'), { recursive: true })
  fs.writeFileSync(loc.out, page)
}

const today = new Date().toISOString().slice(0, 10)
const alternates = `      <xhtml:link rel="alternate" hreflang="en" href="${ORIGIN}/"/>
      <xhtml:link rel="alternate" hreflang="zh" href="${ORIGIN}/zh/"/>
      <xhtml:link rel="alternate" hreflang="x-default" href="${ORIGIN}/"/>`
fs.writeFileSync('docs/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>${ORIGIN}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
${alternates}
  </url>
  <url>
    <loc>${ORIGIN}/zh/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
${alternates}
  </url>
</urlset>
`)

// keep the hand-written counts in the READMEs in sync
const enReadme = fs.readFileSync('README.md', 'utf8').replace(/\*\*\d+\*\* plugins/, `**${N}** plugins`)
fs.writeFileSync('README.md', enReadme)
const zhReadme = fs.readFileSync('README.zh.md', 'utf8').replace(/\*\*\d+\*\* 个插件/, `**${N}** 个插件`)
fs.writeFileSync('README.zh.md', zhReadme)

console.log(`site built: ${N} rows × 2 locales + sitemap, README counts synced`)
