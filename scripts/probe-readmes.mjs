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
const CONCURRENCY = 10
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

async function gh(path) {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${token}`,
      'user-agent': 'awesome-dsh-plugin-readme-probe',
    },
    signal: AbortSignal.timeout(15000),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
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
    let md = Buffer.from(data.content, 'base64').toString('utf8')
    if (md.length > MAX_BYTES) md = md.slice(0, MAX_BYTES) + '\n\n…'
    // html_url: https://github.com/o/r/blob/<branch>/<path-to-readme>
    const m = data.html_url.match(/^https:\/\/github\.com\/([^/]+\/[^/]+)\/blob\/([^/]+)\/(.*)$/)
    const branch = m ? m[2] : 'main'
    const dir = m ? m[3].split('/').slice(0, -1).join('/') : ''
    const base = `https://raw.githubusercontent.com/${repo}/${branch}/${dir ? dir + '/' : ''}`
    const blobBase = `https://github.com/${repo}/blob/${branch}/${dir ? dir + '/' : ''}`
    return { md, htmlUrl: data.html_url, base, blobBase, fetchedAt: today }
  } catch {
    return null // keep the previous entry
  }
}

let done = 0
for (let i = 0; i < urls.length; i += CONCURRENCY) {
  const batch = urls.slice(i, i + CONCURRENCY)
  const results = await Promise.all(batch.map(async (url) => [url, await probe(url)]))
  for (const [url, result] of results) {
    if (result !== null) map[url] = result
  }
  done += batch.length
  if (done % 50 === 0 || done >= urls.length) console.log(`readmes ${done}/${urls.length}`)
}

// drop entries for URLs no longer listed
const listed = new Set(urls)
for (const k of Object.keys(map)) if (!listed.has(k)) delete map[k]

const sorted = Object.fromEntries(Object.entries(map).sort(([a], [b]) => a.localeCompare(b)))
fs.writeFileSync(OUT_FILE, JSON.stringify(sorted) + '\n')
console.log(`readmes.json written: ${Object.keys(sorted).length} repos`)
