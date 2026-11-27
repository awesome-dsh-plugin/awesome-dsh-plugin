import assert from 'node:assert/strict'
import test from 'node:test'
import LOCALES from '../site/locales.mjs'
import { buildMarketIndex } from './lib/market-index.mjs'

// The names below are the ones the 2026-11-15 nightly tripped over: the list
// carries `Tests4gptplay/dsh-dots` and `Tests4gptplay/dsh-dots#dsh-dot-mcp`,
// and both repositories' package.json say `name: dsh-dot-mcp`. Format 1 keys
// plugins by name, so the parser refuses the whole document over the second
// row while every other row in it is fine.
const ROOT = 'https://github.com/Tests4gptplay/dsh-dots'
const SUBDIR = 'https://github.com/Tests4gptplay/dsh-dots/tree/main/packages/dsh-dot-mcp'

const entry = (url, name, category = 'tools') => ({ url, name, category, description: { en: `${name} in one line.` } })
const record = (npm, version = '1.0.1') => ({ npm, version, publishedAt: 1763200000 })

const build = (entries, npmMap) => buildMarketIndex({ entries, npmMap, locales: LOCALES })

test('lists a monorepo root and its subdirectory once when they resolve to the same package', () => {
  const { index, skipped, refused } = build(
    [entry(ROOT, 'Tests4gptplay/dsh-dots', 'browser'), entry(SUBDIR, 'Tests4gptplay/dsh-dots#dsh-dot-mcp')],
    { [ROOT]: record('dsh-dot-mcp'), [SUBDIR]: record('dsh-dot-mcp') },
  )
  assert.deepEqual(index.plugins.map((plugin) => plugin.name), ['dsh-dot-mcp'])
  assert.equal(skipped.refused, 1)
  assert.equal(refused.length, 1)
  // The row that loses says which entry kept the name, so the fix (one entry
  // too many, or a package renamed) is visible in the build log.
  assert.match(refused[0], /is already listed by https:\/\/github\.com\/Tests4gptplay\/dsh-dots$/)
})

test('keeps the entry that comes first in list order', () => {
  const first = build(
    [entry(SUBDIR, 'Tests4gptplay/dsh-dots#dsh-dot-mcp'), entry(ROOT, 'Tests4gptplay/dsh-dots')],
    { [ROOT]: record('dsh-dot-mcp'), [SUBDIR]: record('dsh-dot-mcp') },
  )
  assert.deepEqual(first.index.plugins.map((plugin) => plugin.title), ['Tests4gptplay/dsh-dots#dsh-dot-mcp'])
})

test('a row refused on its own merits does not hold the name', () => {
  // The first row is unusable (not an exact version), so the second — which
  // is fine — still gets listed under that name.
  const { index, skipped } = build(
    [entry(ROOT, 'Tests4gptplay/dsh-dots'), entry(SUBDIR, 'Tests4gptplay/dsh-dots#dsh-dot-mcp')],
    { [ROOT]: record('dsh-dot-mcp', 'not-a-version'), [SUBDIR]: record('dsh-dot-mcp') },
  )
  assert.deepEqual(index.plugins.map((plugin) => plugin.title), ['Tests4gptplay/dsh-dots#dsh-dot-mcp'])
  assert.equal(skipped.refused, 1)
})

test('leaves entries with different packages alone', () => {
  const { index, skipped } = build(
    [entry(ROOT, 'Tests4gptplay/dsh-dots'), entry(SUBDIR, 'Tests4gptplay/dsh-dots#dsh-dot-mcp')],
    { [ROOT]: record('dsh-dots'), [SUBDIR]: record('dsh-dot-mcp') },
  )
  assert.deepEqual(index.plugins.map((plugin) => plugin.name), ['dsh-dots', 'dsh-dot-mcp'])
  assert.equal(skipped.refused, 0)
})

test('the listed count still matches what build-index expects', () => {
  // build-index.mjs derives `listable` from the skipped counters and throws
  // when the document disagrees; a de-duplicated row has to count as refused.
  const entries = [entry(ROOT, 'Tests4gptplay/dsh-dots'), entry(SUBDIR, 'Tests4gptplay/dsh-dots#dsh-dot-mcp')]
  const npmMap = { [ROOT]: record('dsh-dot-mcp'), [SUBDIR]: record('dsh-dot-mcp') }
  const { index, skipped } = build(entries, npmMap)
  const listable = entries.length - skipped.noNpm - skipped.noVersion - skipped.noPublishTime - skipped.refused
  assert.equal(index.plugins.length, listable)
})
