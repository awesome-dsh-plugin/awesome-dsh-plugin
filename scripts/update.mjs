#!/usr/bin/env node
/**
 * Crawl GitHub for repos tagged `dsh-plugin`, verify each one's package.json
 * for a `dsh.bundle` manifest (what makes it an installable DSH plugin),
 * then regenerate README.md and data/plugins.json.
 *
 * Usage: GITHUB_TOKEN=xxx node scripts/update.mjs
 */

const TOKEN = process.env.GITHUB_TOKEN ?? ''
const HEADERS = {
  'Accept': 'application/vnd.github+json',
  'User-Agent': 'awesome-dsh-plugin',
  ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
}

async function searchRepos() {
  const items = []
  for (let page = 1; page <= 10; page++) {
    const res = await fetch(
      `https://api.github.com/search/repositories?q=topic:dsh-plugin&per_page=100&page=${page}`,
      { headers: HEADERS },
    )
    if (!res.ok) throw new Error(`search page ${page}: ${res.status}`)
    const json = await res.json()
    items.push(...json.items)
    if (json.items.length < 100) break
  }
  const seen = new Set()
  return items.filter((r) => !seen.has(r.full_name) && seen.add(r.full_name))
}

async function fetchPackageJson(fullName) {
  try {
    const res = await fetch(
      `https://raw.githubusercontent.com/${fullName}/HEAD/package.json`,
      { headers: { 'User-Agent': 'awesome-dsh-plugin' } },
    )
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length)
  let i = 0
  await Promise.all(
    Array.from({ length: limit }, async () => {
      while (i < items.length) {
        const idx = i++
        out[idx] = await fn(items[idx])
      }
    }),
  )
  return out
}

// Keyword → category. First match wins; order matters.
const CATEGORIES = [
  ['ui-enhancements', 'UI 增强 / UI Enhancements', /\bui\b|界面|theme|主题|视图|view|chat|render|genui|focus|前端|launcher|启动器/i],
  ['workflow-automation', '工作流与自动化 / Workflow & Automation', /workflow|工作流|automat|自动|plan|计划|loop|schedul|cron|wakeup|sentinel|批注|review|审/i],
  ['tools', '工具集 / Tools', /toolkit|工具|search|搜索|fetch|browser|浏览器|terminal|终端|file|文件|notebook/i],
  ['notifications', '通知与监控 / Notifications & Monitoring', /notif|通知|alert|提醒|monitor|监控|watch/i],
  ['dev-helpers', '开发辅助 / Development Helpers', /\bdev\b|开发|debug|调试|lsp|test|测试|lint|inject|sdk/i],
  ['learning', '学习与教育 / Learning & Education', /学习|teach|教学|classroom|learn|explain|讲解|research|研究/i],
]

function categorize(repo, pkg) {
  const text = `${repo.name} ${repo.description ?? ''} ${pkg?.description ?? ''}`
  for (const [id, title, re] of CATEGORIES) if (re.test(text)) return { id, title }
  return { id: 'misc', title: '其他 / Miscellaneous' }
}

function entryLine(p) {
  const desc = (p.description ?? '').replace(/\r?\n/g, ' ').trim()
  const npm = p.npmName ? ` · \`${p.npmName}\`` : ''
  return `- [${p.fullName}](${p.url}) ★${p.stars}${npm}${desc ? ` — ${desc}` : ''}`
}

const repos = await searchRepos()
console.log(`search: ${repos.length} repos`)

const enriched = await mapLimit(repos, 10, async (repo) => {
  const pkg = await fetchPackageJson(repo.full_name)
  const isPlugin = Boolean(pkg?.dsh?.bundle)
  return {
    fullName: repo.full_name,
    url: repo.html_url,
    description: repo.description ?? pkg?.description ?? '',
    stars: repo.stargazers_count,
    pushedAt: repo.pushed_at,
    license: repo.license?.spdx_id ?? null,
    isPlugin,
    npmName: isPlugin ? pkg.name ?? null : null,
    category: categorize(repo, pkg),
  }
})

const plugins = enriched.filter((p) => p.isPlugin).sort((a, b) => b.stars - a.stars)
const related = enriched.filter((p) => !p.isPlugin).sort((a, b) => b.stars - a.stars)
console.log(`verified plugins: ${plugins.length}, related: ${related.length}`)

const byCategory = new Map()
for (const p of plugins) {
  if (!byCategory.has(p.category.id)) byCategory.set(p.category.id, { title: p.category.title, items: [] })
  byCategory.get(p.category.id).items.push(p)
}

const order = [...CATEGORIES.map(([id]) => id), 'misc']
const sections = order
  .filter((id) => byCategory.has(id))
  .map((id) => {
    const { title, items } = byCategory.get(id)
    return `### ${title}\n\n${items.map(entryLine).join('\n')}\n`
  })
  .join('\n')

const now = new Date().toISOString().slice(0, 16).replace('T', ' ')

const readme = `# Awesome DSH Plugin [![Awesome](https://awesome.re/badge.svg)](https://awesome.re)

> [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（\`dsh\`）插件精选列表 · 自动验证、每日更新
>
> A curated & **auto-verified** list of plugins for DeepSeek Harness. Updated daily.

本列表由爬虫自动生成：抓取 GitHub 上所有 \`dsh-plugin\` topic 仓库，**逐个验证其 \`package.json\` 是否声明了 \`dsh.bundle\` manifest**（这是一个仓库能被 \`dsh plugin add\` 安装的硬性标志）。通过验证的才会进入插件列表，未通过的归入相关项目。

Every entry in the plugin sections is verified to carry a \`dsh.bundle\` manifest — the marker that makes a package actually installable via \`dsh plugin add\`.

📊 **${plugins.length}** verified plugins / **${related.length}** related projects · 🕐 Last updated: ${now} UTC

## 安装插件 / Installing plugins

\`\`\`sh
# 从 npm 安装（推荐，预构建产物，一次成功）
dsh plugin --profile <name> add <npm-package>

# 从 GitHub 安装（拉源码，首次会因构建授权而失败，按提示配置 allowBuilds 后重试）
dsh plugin --profile <name> add github:<owner>/<repo>
\`\`\`

> ⚠️ 安装 GitHub 来源的插件时，构建脚本会在你的机器上执行。请只安装你信任的插件，并尽量锁定 commit（\`github:owner/repo#<sha>\`）。

## 插件 / Plugins

${sections}
## 相关项目与资源 / Related Projects

> 打了 \`dsh-plugin\` topic 但不是可安装组合包的仓库：启动器、文档、技能集、开发资源等。

${related.map(entryLine).join('\n')}

## 贡献 / Contributing

为你的插件仓库添加 [\`dsh-plugin\`](https://github.com/topics/dsh-plugin) topic，并在 \`package.json\` 中声明 \`dsh.bundle\` manifest，下一次自动更新（每日）就会收录。无需提交 PR。

Add the \`dsh-plugin\` topic to your repo and declare a \`dsh.bundle\` manifest in \`package.json\` — the daily crawl will pick it up automatically. No PR needed.

分类有误或希望补充描述？欢迎提 [Issue](../../issues)。

## License

[CC0-1.0](LICENSE) · 数据来自 GitHub 公开 API，每日自动刷新。
`

await import('node:fs/promises').then(async (fs) => {
  await fs.mkdir('data', { recursive: true })
  await fs.writeFile('README.md', readme)
  await fs.writeFile('data/plugins.json', JSON.stringify({ updatedAt: new Date().toISOString(), plugins, related }, null, 2))
})
console.log('README.md + data/plugins.json written')
