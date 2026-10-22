#!/usr/bin/env node
/**
 * Summarize version-to-version capability changes already stored in
 * data/capabilities.json.
 *
 * probe-capabilities.mjs writes `previous` only when a later release is
 * scanned. Until versions change, this report is empty. Leave it running
 * across catalog builds for a few weeks, then read the rate here before
 * deciding how loudly a surface should say "new this version".
 *
 *   node scripts/capability-changes.mjs [data/capabilities.json]
 */

import { readFileSync } from 'node:fs'

const file = process.argv[2] ?? 'data/capabilities.json'
const data = JSON.parse(readFileSync(file, 'utf8'))
const records = Object.values(data).filter(row => row !== null && typeof row === 'object')
const changed = records.filter(row => row.previous && typeof row.previous === 'object')

let capabilityChanged = 0
let redChanged = 0
const added = {}
for (const row of changed) {
  const before = new Set(Array.isArray(row.previous.capabilities) ? row.previous.capabilities : [])
  const after = new Set(Array.isArray(row.capabilities) ? row.capabilities : [])
  const gained = [...after].filter(item => !before.has(item))
  const lost = [...before].filter(item => !after.has(item))
  if (gained.length > 0 || lost.length > 0) capabilityChanged += 1
  for (const item of gained) added[item] = (added[item] ?? 0) + 1
  const beforeRed = new Set(Array.isArray(row.previous.redLines) ? row.previous.redLines : [])
  const afterRed = new Set(Array.isArray(row.redLines) ? row.redLines : [])
  if ([...afterRed].some(item => !beforeRed.has(item)) || [...beforeRed].some(item => !afterRed.has(item))) {
    redChanged += 1
  }
}

console.log(JSON.stringify({
  records: records.length,
  withPrevious: changed.length,
  capabilityChanged,
  redLineChanged: redChanged,
  added,
}, null, 2))
