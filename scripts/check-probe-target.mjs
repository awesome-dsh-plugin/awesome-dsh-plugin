#!/usr/bin/env node
import fs from 'node:fs'
import LOCALES from '../site/locales.mjs'
import { listedProbeUrls, selectProbeUrls } from './lib/probe-target.mjs'

const target = process.env.PROBE_TARGET_REPO ?? ''
if (target === '') process.exit(0)

if (process.env.TARGET_PROBE_ALL === 'true' || process.env.TARGET_SKIP_PROBES === 'true') {
  throw new Error('target_repo cannot be combined with probe_all or skip_probes')
}

const readme = fs.readFileSync(LOCALES[0].readme, 'utf8')
const listed = listedProbeUrls(readme)
const selected = selectProbeUrls(listed, target)
if (process.argv.includes('--require-cache')) {
  const selectedUrls = new Set(selected.urls)
  // npm rows exist even for unpublished packages; README rows can be absent.
  // Check the *other* listed URLs so a target-only cache cannot pass. Leave
  // room for recent additions and repositories without a fetchable README.
  const others = [...new Set(listed.filter((url) => !selectedUrls.has(url)))]
  const baseline = others.length ? others : [...new Set(selected.urls)]
  for (const file of ['data/npm-map.json', 'data/readmes.json']) {
    const minimum = Math.max(1, Math.ceil(baseline.length * (file === 'data/npm-map.json' ? 0.9 : 0.5)))
    if (!fs.existsSync(file)) {
      throw new Error(`targeted refresh requires restored ${file}; run a full probe first`)
    }
    let map
    try { map = JSON.parse(fs.readFileSync(file, 'utf8')) } catch {
      throw new Error(`targeted refresh requires valid JSON in restored ${file}`)
    }
    if (map === null || typeof map !== 'object' || Array.isArray(map)) {
      throw new Error(`targeted refresh requires a JSON object in restored ${file}`)
    }
    const covered = baseline.filter((url) => {
      const row = map[url]
      if (row === null || typeof row !== 'object' || Array.isArray(row)) return false
      return file === 'data/npm-map.json'
        ? row.npm === null || typeof row.npm === 'string'
        : (typeof row.en?.md === 'string' && row.en.md.length > 0)
          || (typeof row.zh?.md === 'string' && row.zh.md.length > 0)
    }).length
    if (covered < minimum) {
      throw new Error(`restored ${file} covers ${covered}/${baseline.length} listed URL(s); need ${minimum} before a targeted refresh`)
    }
  }
}
console.log(`targeted refresh: ${target} (${selected.urls.length} listed URL(s))`)
