#!/usr/bin/env node
/** Repository-wide public Release asset downloads, separate from npm's 30-day counts. */
import fs from 'node:fs'
import { readEntries } from './lib/entries.mjs'
import { repoOf } from './lib/probe-updates-graphql.mjs'
import { repositoryStatistics } from './lib/github-statistics.mjs'
import { releaseManifestUrl, releaseManifestFacts } from './lib/release-manifest.mjs'

const file = process.env.RELEASE_METADATA_OUTPUT ?? 'data/releases.json'
const previous = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {}
const npm = fs.existsSync('data/npm-map.json') ? JSON.parse(fs.readFileSync('data/npm-map.json', 'utf8')) : {}
const selected = process.argv.find(arg => arg.startsWith('--repo='))?.slice(7)
const entries = readEntries().filter(entry => entry.tarball && !npm[entry.url]?.npm && (!selected || repoOf(entry.url) === selected))
const now = new Date().toISOString(), token = process.env.GITHUB_TOKEN
const stale = entry => process.env.PROBE_ALL === '1' || Date.now() - Date.parse(entry?.checkedAt ?? '') >= 86400000 || !Number.isFinite(Date.parse(entry?.checkedAt ?? ''))
const pending = entries.filter(entry => stale(previous[entry.url]?.statistics))
let stats = new Map()
if (token) stats = await repositoryStatistics(pending.map(entry => repoOf(entry.url)), async query => {
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', 'user-agent': 'awesome-dsh-plugin-releases-probe' },
    body: JSON.stringify({ query }), signal: AbortSignal.timeout(30000),
  })
  if (!response.ok) throw Error(`HTTP ${response.status}`)
  return await response.json()
}, { releases: true })
else console.log('no GITHUB_TOKEN — keeping prior Release download counts')

let manifests = 0, failed = 0
for (let offset = 0; offset < entries.length; offset += 6) {
  await Promise.all(entries.slice(offset, offset + 6).map(async entry => {
    const stored = previous[entry.url] ??= {}, fresh = stats.get(repoOf(entry.url))
    if (fresh) stored.statistics = { downloads: fresh.downloads, checkedAt: now }
    const url = releaseManifestUrl(entry)
    if (!url || stored.manifest?.tarball === entry.tarball) return
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(15000) })
      if (!response.ok) throw Error(`HTTP ${response.status}`)
      const chunks = []; let size = 0
      for await (const chunk of response.body) {
        size += chunk.length
        if (size > 1024 * 1024) throw Error('manifest exceeds 1 MiB')
        chunks.push(chunk)
      }
      stored.manifest = { ...releaseManifestFacts(JSON.parse(Buffer.concat(chunks).toString('utf8'))), tarball: entry.tarball, checkedAt: new Date().toISOString() }
      manifests++
    } catch { failed++ }
  }))
}
// A failed probe preserves the last complete observation and its original time.
if (!selected) {
  const listed = new Set(entries.map(entry => entry.url))
  for (const url of Object.keys(previous)) if (!listed.has(url)) delete previous[url]
}
fs.writeFileSync(file, JSON.stringify(Object.fromEntries(Object.entries(previous).sort(([a], [b]) => a.localeCompare(b))), null, 1) + '\n')
console.log(`Release data: ${stats.size} repositories refreshed, ${manifests} manifests read, ${failed} manifests unavailable; incomplete totals retained only from prior observations`)
