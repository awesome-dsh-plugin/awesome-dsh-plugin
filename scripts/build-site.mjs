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
      <button class="copy" type="button" data-cmd="${esc(cmd)}" aria-label="复制安装命令 / Copy install command"><span class="zh">复制安装命令</span><span class="en">copy install</span></button>
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

fs.writeFileSync('docs/index.html', html)
console.log(`site built: ${N} rows`)
