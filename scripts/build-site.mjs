#!/usr/bin/env node
/**
 * Build docs/index.html plugin rows from README.md + README.zh.md.
 * The READMEs are the source of truth; this script splices their entries
 * (bilingual, per category) into the static site: rows, filter chips,
 * counts, and JSON-LD.
 *
 * Usage: node scripts/build-site.mjs
 */
import fs from 'node:fs'

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

// Order: category order, then README order within category (already curated).
const ordered = CATS.flatMap(([id]) => entries.filter((e) => e.cat === id))

// Depth rail: accelerating dive that lands at 6,000 m on the last row.
const N = ordered.length
const depth = (i) => Math.round((6000 * Math.pow((i + 1) / N, 1.35)) / 10) * 10

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const rows = ordered.map((e, i) => {
  const d = depth(i).toLocaleString('en-US')
  const delay = Math.min(i * 0.03, 0.45).toFixed(2)
  const repo = e.url.replace('https://github.com/', '')
  const cmd = `dsh plugin --profile web add github:${repo}`
  return `    <li data-cat="${e.cat}" style="animation-delay:${delay}s">
      <div class="depth"><span class="no">${String(i + 1).padStart(2, '0')}</span><span>−${d} m</span></div>
      <div>
        <h2><a href="${e.url}" rel="noopener">${esc(e.name)}</a><span class="by">${esc(e.owner)}</span></h2>
        <p><span class="zh">${esc(e.zh)}</span><span class="en">${esc(e.en)}</span></p>
        <button class="copy" type="button" data-cmd="${esc(cmd)}"><span class="zh">复制安装命令</span><span class="en">copy install command</span></button>
      </div>
    </li>`
}).join('\n\n')

const chips = [
  `      <button class="chip active" type="button" data-cat="all"><span class="zh">全部</span><span class="en">All</span> <small>${N}</small></button>`,
  ...CATS.map(([id, emoji, zhName, enName]) => {
    const n = ordered.filter((e) => e.cat === id).length
    return `      <button class="chip" type="button" data-cat="${id}">${emoji} <span class="zh">${zhName}</span><span class="en">${enName}</span> <small>${n}</small></button>`
  }),
].join('\n')

const jsonld = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Awesome DSH Plugin',
  url: 'https://awesome-dsh-plugin.com/',
  numberOfItems: N,
  itemListElement: ordered.map((e, i) => ({ '@type': 'ListItem', position: i + 1, name: e.name, url: e.url })),
})

let html = fs.readFileSync('docs/index.html', 'utf8')

html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">\n${jsonld}\n</script>`)
html = html.replace(/(<ol class="dex" id="dex">)[\s\S]*?(<\/ol>)/, `$1\n\n${rows}\n\n  $2`)
html = html.replace(/(<div class="filters" id="filters">)[\s\S]*?(<\/div><!--\/filters-->)/, `$1\n${chips}\n    $2`)
html = html.replace(/94 <span class="zh">[^<]*<\/span><span class="en">[^<]*<\/span>/, `${N} <span class="zh">个插件 · GitHub ↗</span><span class="en">plugins · GitHub ↗</span>`)

fs.writeFileSync('docs/index.html', html)
console.log(`site built: ${N} rows`)
