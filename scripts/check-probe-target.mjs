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
const selected = selectProbeUrls(listedProbeUrls(readme), target)
if (process.argv.includes('--require-cache')) {
  for (const file of ['data/npm-map.json', 'data/readmes.json']) {
    if (!fs.existsSync(file) || fs.statSync(file).size === 0) {
      throw new Error(`targeted refresh requires restored ${file}; run a full probe first`)
    }
  }
}
console.log(`targeted refresh: ${target} (${selected.urls.length} listed URL(s))`)
