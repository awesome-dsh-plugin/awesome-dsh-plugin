import assert from 'node:assert/strict'
import test from 'node:test'
import { dumpEntry, profileFor, profileProblem, validateEntries } from './lib/entries.mjs'

const entry = (extra = {}) => ({
  url: 'https://github.com/owner/repo', name: 'owner/repo', category: 'fun',
  description: { en: 'Does one thing.' }, file: 'data/plugins/owner__repo.yml', ...extra,
})

test('an entry may name the standalone Profile it installs into', () => {
  assert.deepEqual(validateEntries([entry({ profile: 'tavern' })]), [])
  assert.equal(profileFor(entry({ profile: 'tavern' })), 'tavern')
  assert.equal(profileFor(entry()), 'web')
  assert.match(dumpEntry(entry({ profile: 'tavern' })), /^profile: tavern$/m)
  assert.doesNotMatch(dumpEntry(entry()), /profile/)
})

test('a Profile name is a plain identifier, and web is spelled by omission', () => {
  assert.equal(profileProblem('pi-tui'), null)
  assert.match(profileProblem('web'), /default/)
  for (const bad of ['', 'Tavern', 'a b', 'x;rm -rf /', '-x', 42]) assert.ok(profileProblem(bad), String(bad))
  assert.match(validateEntries([entry({ profile: 'web' })])[0], /"profile" is the default/)
})
