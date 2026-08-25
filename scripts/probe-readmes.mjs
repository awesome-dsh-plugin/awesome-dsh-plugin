#!/usr/bin/env node
/**
 * Fetch every listed plugin's README into data/readmes.json, consumed by
 * build-site.mjs to render real content on the detail pages.
 *
 * Monorepo subdir entries fetch the subdirectory's own README when present.
 * Each entry stores the markdown (truncated), plus raw/blob base URLs so the
 * builder can rewrite relative links and images to absolute GitHub URLs.
 *
 * Requires GITHUB_TOKEN (CI provides one; locally: GITHUB_TOKEN=$(gh auth token)).
 * Without a token the script exits 0 without touching the file. A failed repo
 * keeps its old entry.
 *
 * Usage: GITHUB_TOKEN=... node scripts/probe-readmes.mjs
 */
import fs from 'node:fs'
import LOCALES from '../site/locales.mjs'

const OUT_FILE = 'data/readmes.json'
// Four GitHub calls per repository across 1,247 of them is enough to trip the
// secondary rate limit at any concurrency worth having, so the full sweep is
// the nightly PROBE_ALL run and a push-triggered run refreshes only what is
// new or stale. Same shape as probe-npm.mjs.
const RECHECK_DAYS = Number(process.env.PROBE_RECHECK_DAYS ?? 7)
const PROBE_ALL = process.env.PROBE_ALL === '1'
const CONCURRENCY = Number(process.env.PROBE_CONCURRENCY ?? (PROBE_ALL ? 4 : 8))
const MAX_BYTES = 48 * 1024

const token = process.env.GITHUB_TOKEN
if (!token) {
  console.log('no GITHUB_TOKEN — keeping committed readme data as-is')
  process.exit(0)
}

const map = fs.existsSync(OUT_FILE) ? JSON.parse(fs.readFileSync(OUT_FILE, 'utf8')) : {}
const readme = fs.readFileSync(LOCALES[0].readme, 'utf8')
const urls = [...readme.matchAll(/^- \[.+?\]\((https:\/\/github\.com\/[^)]+)\) [—-] /gm)].map((m) => m[1])
const today = new Date().toISOString().slice(0, 10)

/** Thrown for a status the caller may want to tell apart (404 vs rate limit). */
class HttpError extends Error {
  constructor(status) {
    super(`HTTP ${status}`)
    this.status = status
  }
}

async function gh(path) {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${token}`,
      'user-agent': 'awesome-dsh-plugin-readme-probe',
    },
    signal: AbortSignal.timeout(15000),
  })
  if (res.status === 403 || res.status === 429) {
    // Secondary limits answer with retry-after; primary exhaustion sets
    // x-ratelimit-remaining: 0 and a reset timestamp. Sleeping is the whole
    // remedy — retrying immediately is what earns a longer block.
    const after = Number(res.headers.get('retry-after'))
    const reset = Number(res.headers.get('x-ratelimit-reset'))
    const waitMs = Number.isFinite(after) && after > 0
      ? after * 1000
      : (res.headers.get('x-ratelimit-remaining') === '0' && Number.isFinite(reset)
        ? Math.max(0, reset * 1000 - Date.now()) + 1000
        : 0)
    if (waitMs > 0 && waitMs <= 120000) {
      await new Promise((r) => setTimeout(r, waitMs))
      return gh(path)
    }
  }
  if (!res.ok) throw new HttpError(res.status)
  return res.json()
}

// crude language sniff: CJK-heavy → zh
const langOf = (md) => {
  const cjk = (md.match(/[一-鿿]/g) || []).length
  return cjk / Math.max(md.length, 1) > 0.03 ? 'zh' : 'en'
}

// counterpart filename candidates, tried in the same directory as the default README
const ZH_NAMES = ['README.zh.md', 'README.zh-CN.md', 'README_zh.md', 'README_zh-CN.md', 'README-zh.md', 'README.cn.md', 'README_CN.md', 'docs/README.zh.md', 'docs/i18n/README.zh-CN.md']
const EN_NAMES = ['README.en.md', 'README_EN.md', 'README-en.md', 'README.en-US.md', 'docs/README.en.md']

function pack(data, repo) {
  let md = Buffer.from(data.content, 'base64').toString('utf8')
  if (md.length > MAX_BYTES) md = md.slice(0, MAX_BYTES) + '\n\n…'
  // html_url: https://github.com/o/r/blob/<branch>/<path-to-readme>
  const m = data.html_url.match(/^https:\/\/github\.com\/([^/]+\/[^/]+)\/blob\/([^/]+)\/(.*)$/)
  const branch = m ? m[2] : 'main'
  const dir = m ? m[3].split('/').slice(0, -1).join('/') : ''
  const base = `https://raw.githubusercontent.com/${repo}/${branch}/${dir ? dir + '/' : ''}`
  const blobBase = `https://github.com/${repo}/blob/${branch}/${dir ? dir + '/' : ''}`
  return { md, htmlUrl: data.html_url, base, blobBase, fetchedAt: today }
}

async function probe(url) {
  const repoPath = url.replace('https://github.com/', '').replace(/\/$/, '')
  const repo = repoPath.split('/').slice(0, 2).join('/')
  const sub = repoPath.includes('/tree/') ? repoPath.split('/tree/')[1].replace(/^[^/]+\//, '') : null
  try {
    let data
    if (sub) {
      // a subdir README when the package ships one, else the repo root README
      try { data = await gh(`/repos/${repo}/readme/${sub}`) } catch { data = await gh(`/repos/${repo}/readme`) }
    } else {
      data = await gh(`/repos/${repo}/readme`)
    }
    const main = pack(data, repo)
    const mainLang = langOf(main.md)
    const out = { [mainLang]: main, fetchedAt: today }

    // look for the other language next to the default README.
    // One directory listing per repo instead of probing every candidate name
    // (rate-limit friendly: ≤3 API calls per repo instead of up to 10).
    const dir = main.htmlUrl.replace(/^https:\/\/github\.com\/[^/]+\/[^/]+\/blob\/[^/]+\//, '').split('/').slice(0, -1).join('/')
    const names = mainLang === 'en' ? ZH_NAMES : EN_NAMES
    const otherLang = mainLang === 'en' ? 'zh' : 'en'
    const listings = {}
    const listDir = async (d) => {
      if (!(d in listings)) {
        try { listings[d] = new Map((await gh(`/repos/${repo}/contents/${d}`)).map((e) => [e.path.toLowerCase(), e.path])) } catch { listings[d] = new Map() }
      }
      return listings[d]
    }
    for (const name of names) {
      const want = dir ? `${dir}/${name}` : name
      const parent = want.split('/').slice(0, -1).join('/')
      // case-insensitive: some repos ship README-ZH.md etc.
      const path = (await listDir(parent)).get(want.toLowerCase())
      if (!path) continue
      try {
        const alt = await gh(`/repos/${repo}/contents/${path}`)
        if (alt.content) {
          const packed = pack(alt, repo)
          // trust the sniff over the filename — some "zh" files are English stubs
          if (langOf(packed.md) === otherLang) { out[otherLang] = packed; break }
        }
      } catch { /* candidate absent */ }
    }
    return out
  } catch (e) {
    // A 404 means the repository genuinely ships no README. Anything else — a
    // secondary rate limit above all — means we never got to look, which is a
    // different fact and must not be recorded as "no README".
    if (e instanceof HttpError && e.status === 404) return { missing: true }
    return null
  }
}

const fresh = (entry) =>
  !PROBE_ALL
  && entry !== undefined
  && entry.fetchedAt
  && (Date.now() - new Date(entry.fetchedAt).getTime()) / 86400000 <= RECHECK_DAYS

const pending = urls.filter((url) => !fresh(map[url]))
console.log(`${urls.length} listed, ${pending.length} to fetch${PROBE_ALL ? ' (PROBE_ALL)' : ''}`)

const failed = []
let done = 0
let noReadme = 0
for (let i = 0; i < pending.length; i += CONCURRENCY) {
  const batch = pending.slice(i, i + CONCURRENCY)
  const results = await Promise.all(batch.map(async (url) => [url, await probe(url)]))
  for (const [url, result] of results) {
    if (result === null) failed.push(url)
    else if (result.missing) noReadme++
    else map[url] = result
  }
  done += batch.length
  if (done % 50 === 0 || done >= pending.length) console.log(`readmes ${done}/${pending.length}`)
}

// A failure leaves an existing entry on its last good README, which is fine.
// An entry added since the previous run has nothing to fall back on, and its
// page renders with no README at all — which is what happened to every plugin
// merged today. It stayed invisible because a failure and a hit looked the
// same from the outside: this pass issues roughly sixty requests a second,
// trips GitHub's secondary limit, and still printed a healthy count.
if (failed.length) {
  console.log(`${failed.length} repo(s) failed the first pass — retrying serially`)
  await new Promise((r) => setTimeout(r, 20000))
  const stillFailed = []
  for (const url of failed) {
    const result = await probe(url)
    if (result === null) stillFailed.push(url)
    else if (result.missing) noReadme++
    else map[url] = result
    await new Promise((r) => setTimeout(r, 250))
  }
  failed.length = 0
  failed.push(...stillFailed)
}

// drop entries for URLs no longer listed
const listed = new Set(urls)
for (const k of Object.keys(map)) if (!listed.has(k)) delete map[k]

const sorted = Object.fromEntries(Object.entries(map).sort(([a], [b]) => a.localeCompare(b)))
fs.writeFileSync(OUT_FILE, JSON.stringify(sorted) + '\n')
console.log(`readmes.json written: ${Object.keys(sorted).length} repos (${noReadme} ship no README)`)

// Say what was not fetched. A count of successes cannot distinguish a repo
// with no README from one we never reached, and the entries that suffer are
// the newest — exactly the ones their author is looking at.
if (failed.length) {
  const fresh = failed.filter((u) => !(u in map))
  console.log(`${failed.length} repo(s) could not be fetched; ${fresh.length} have no previous data and will render without a README:`)
  for (const u of failed.slice(0, 20)) console.log(`  ${u}${u in map ? ' (kept previous)' : ' (NEW — page will show no README)'}`)
  if (failed.length > 20) console.log(`  … and ${failed.length - 20} more`)
}
