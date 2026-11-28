import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readEntries, validateEntries, CAT_IDS } from './lib/entries.mjs'

// The audit script reuses these two helpers verbatim, so validating them here
// is validating the audit: a catalog that readEntries can parse and
// validateEntries accepts is one audit-catalog.mjs will report as clean.
test('the whole catalog parses and validates cleanly', () => {
  const entries = readEntries()
  assert.ok(entries.length > 0, 'the catalog is not empty')
  const problems = validateEntries(entries)
  assert.deepEqual(problems, [], `unexpected schema problems: ${problems.slice(0, 5).join('; ')}`)
})

test('every category in the catalog is a known canonical id', () => {
  const entries = readEntries()
  for (const e of entries) assert.ok(CAT_IDS.includes(e.category), `${e.file}: unknown category ${e.category}`)
})