#!/usr/bin/env node
/**
 * Write docs/index.json — this list as a DSH plugin market index (format 1).
 *
 * Hosts read it as a market source: dsh 0.2.1's Plugins → Discover tab, and the
 * `plugin_market` agent tool, both take a URL. Publishing it here means users
 * add one address instead of copying the list by hand.
 *
 * Reads the same inputs as build-site.mjs (data/plugins, data/npm-map.json and
 * the locale files) and never touches the network: publish times come from
 * probe-npm.mjs or reviewed Git release records in data/git-releases.json.
 * Entries it cannot express — no npm/Git record, no version, or no publish time
 * yet — are counted and left out rather than guessed at.
 *
 * Usage: node scripts/build-index.mjs [--check]
 *   --check   validate the current docs/index.json without writing (CI gate).
 */
import fs from 'node:fs'
import { parseMarketIndex } from '@deepseek-ai/dsh-plugin-market-index'
import LOCALES from '../site/locales.mjs'
import { readEntries } from './lib/entries.mjs'
import { buildMarketIndex } from './lib/market-index.mjs'

const NPM_MAP_FILE = 'data/npm-map.json'
const OUT_FILE = 'docs/index.json'
const checkOnly = process.argv.includes('--check')

const gitMap = fs.existsSync('data/git-releases.json') ? JSON.parse(fs.readFileSync('data/git-releases.json', 'utf8')) : {}
const npmMap = fs.existsSync(NPM_MAP_FILE) ? JSON.parse(fs.readFileSync(NPM_MAP_FILE, 'utf8')) : {}
const entries = readEntries()
const { index, skipped, refused } = buildMarketIndex({ entries, npmMap, gitMap, locales: LOCALES })

const listable = entries.length - skipped.noNpm - skipped.noVersion - skipped.noPublishTime - skipped.refused
console.log(`index: ${index.plugins.length} of ${entries.length} entries listed`)
console.log(`  no npm package or reviewed Git release: ${skipped.noNpm}`)
console.log(`  source but no version recorded: ${skipped.noVersion}`)
console.log(`  version without a publish time: ${skipped.noPublishTime}`)
if (skipped.refused > 0) {
  console.log(`  refused by the format: ${skipped.refused}`)
  for (const line of refused.slice(0, 10)) console.log(`    ${line}`)
  if (refused.length > 10) console.log(`    … ${refused.length - 10} more`)
}
if (index.plugins.length !== listable) {
  throw new Error(`internal: listed ${index.plugins.length} but expected ${listable}`)
}

if (checkOnly) {
  if (!fs.existsSync(OUT_FILE)) throw new Error(`${OUT_FILE} does not exist`)
  const published = parseMarketIndex(JSON.parse(fs.readFileSync(OUT_FILE, 'utf8')), 'https://awesome-dsh-plugin.com/index.json')
  console.log(`check: ${OUT_FILE} is a valid format-1 index (${published.plugins.length} plugins)`)
} else {
  // Minified: the host that reads this has a fixed 15 s fetch timeout, and
  // indentation is pure overhead on the wire.
  fs.writeFileSync(OUT_FILE, JSON.stringify(index) + '\n')
  console.log(`wrote ${OUT_FILE}`)
}
