import assert from 'node:assert/strict'
import test from 'node:test'
import { load } from 'js-yaml'
import { dumpEntry, validateEntries, previousNpmMap } from './lib/entries.mjs'

const entry = (repo = 'new-plugin', previous) => ({
  url: `https://github.com/owner/${repo}`, name: `owner/${repo}`, category: 'tools',
  description: { en: 'A plugin.' }, ...(previous === undefined ? {} : { npm_previous: previous }),
})

test('old entries remain valid; scoped predecessors survive YAML serialization', () => {
  assert.deepEqual(validateEntries([entry()]), [])
  const e = entry('new-plugin', ['old-plugin', '@owner/old-plugin'])
  assert.deepEqual(validateEntries([e]), [])
  assert.deepEqual(load(dumpEntry(e)), e)
})

test('rejects malformed declarations, duplicate names, versions and install specs', () => {
  for (const value of [null, 'old-plugin', [], [1], [''], [' old-plugin'], ['Old'],
    ['old@1'], ['npm:old'], ['https://example.com/a'], ['../old'], ['@scope'],
    ['@scope/'], ['.old'], ['a'.repeat(215)], ['old', 'old']]) {
    assert.ok(validateEntries([entry('new-plugin', value)]).some(p => p.includes('npm_previous')), JSON.stringify(value))
  }
  assert.ok(validateEntries([entry('a', ['old']), entry('b', ['old'])]).some(p => p.includes('already declared')))
  assert.ok(validateEntries([{ ...entry(), previousNpm: ['old'] }]).some(p => p.includes('unknown field')))
})

test('emits predecessors only with a verified current npm mapping and preserves it', () => {
  const e = entry('new-plugin', ['old-plugin'])
  const npmMap = { [e.url]: { npm: 'new-plugin', version: '1.2.0' } }
  const before = structuredClone(npmMap)
  assert.deepEqual(previousNpmMap([e], npmMap), { [e.url]: ['old-plugin'] })
  assert.deepEqual(npmMap, before)
  assert.deepEqual(previousNpmMap([e], {}), {})
  assert.deepEqual(previousNpmMap([entry()], npmMap), {})
})

test('rejects self aliases, collisions with current packages and conflicting claims', () => {
  const e = entry('new-plugin', ['old-plugin'])
  assert.throws(() => previousNpmMap([e], { [e.url]: { npm: 'old-plugin' } }), /current install target/)
  const other = entry('other')
  assert.throws(() => previousNpmMap([e, other], { [other.url]: { npm: 'old-plugin' } }), /current install target/)
  assert.throws(() => previousNpmMap([e, entry('other', ['old-plugin'])], {}), /already declared/)
})
