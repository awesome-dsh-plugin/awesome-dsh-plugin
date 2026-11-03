import assert from 'node:assert/strict'
import test from 'node:test'
import { buildMarketIndex } from './lib/market-index.mjs'

const LOCALES = [{ code: 'en', categories: { tools: 'Tools' } }]
const ICON = 'https://raw.githubusercontent.com/owner/repo/main/assets/icon-180.png'
const NPM_MAP = {
  'https://github.com/owner/repo': { npm: 'dsh-plugin-repo', version: '1.2.3', publishedAt: 1_760_000_000 },
}

const build = (extra = {}) => buildMarketIndex({
  entries: [{ url: 'https://github.com/owner/repo', name: 'owner/repo', category: 'tools', description: 'One line.', ...extra }],
  npmMap: NPM_MAP,
  locales: LOCALES,
})

// The market's Discover cards render `plugin.icon`; without it every card falls
// back to the same generic artwork. The list already asks submitters for a
// GitHub-hosted tile, so the index can carry that same image instead of
// dropping it at the boundary.
test('carries an entry icon into the market index', () => {
  const { index, skipped, refused } = build({ icon: ICON })
  assert.deepEqual(refused, [])
  assert.equal(skipped.refused, 0)
  assert.equal(index.plugins[0].icon, ICON)
})

test('omits the icon member when the entry has none', () => {
  const { index } = build()
  assert.equal(Object.hasOwn(index.plugins[0], 'icon'), false)
})

// entries.mjs validates `icon` before the index is built, but the builder is a
// library other generators can call with raw records: a value the format
// refuses (format 1 wants https or the index origin) must cost the tile, not
// the plugin — the same "drop the member, keep the row" rule this module
// already applies to a repository directory it cannot express.
test('an icon the format refuses costs the icon, not the plugin', () => {
  const { index, skipped, refused } = build({ icon: 'http://raw.githubusercontent.com/owner/repo/main/icon.png' })
  assert.deepEqual(refused, [])
  assert.equal(skipped.refused, 0)
  assert.equal(index.plugins.length, 1)
  assert.equal(Object.hasOwn(index.plugins[0], 'icon'), false)
})
