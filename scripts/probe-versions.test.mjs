import assert from 'node:assert/strict'
import test from 'node:test'
import { needsRefresh, nextEntry, isChanged, refreshEntries } from './lib/refresh-versions.mjs'

const URL_A = 'https://github.com/o/a'
const HOUR = 3600 * 1000
const now = Date.parse('2026-11-04T12:00:00Z')
const stamp = '2026-11-04T12:00:00.000Z'

const packument = (latest, { time, engines } = {}) => ({
  'dist-tags': latest === null ? {} : { latest },
  time: time ?? (latest === null ? {} : { [latest]: '2026-11-04T08:30:00.000Z' }),
  versions: latest === null ? {} : { [latest]: engines ? { engines } : {} },
})

test('only entries with a package and a stale (or missing) check are refreshed', () => {
  assert.equal(needsRefresh({ npm: 'x', checkedAt: '2026-11-04T11:00:00Z' }, { nowMs: now, maxAgeMs: 6 * HOUR }), false)
  assert.equal(needsRefresh({ npm: 'x', checkedAt: '2026-11-04T05:00:00Z' }, { nowMs: now, maxAgeMs: 6 * HOUR }), true)
  assert.equal(needsRefresh({ npm: 'x' }, { nowMs: now, maxAgeMs: 6 * HOUR }), true)
  // never touch a verdict that is not a package
  assert.equal(needsRefresh({ npm: null, version: null, checkedAt: '2026-01-01' }, { nowMs: now, maxAgeMs: 6 * HOUR }), false)
  assert.equal(needsRefresh(undefined, { nowMs: now, maxAgeMs: 6 * HOUR }), false)
})

test('a successful fetch takes the new latest and its publish facts', () => {
  const before = { npm: 'x', version: '1.0.0', publishedAt: 1, enginesDsh: '>=0.2.0', checkedAt: '2026-11-01' }
  const after = nextEntry(before, packument('1.2.3', { engines: { dsh: '>=0.3.0' } }), stamp)
  assert.equal(after.version, '1.2.3')
  assert.equal(after.enginesDsh, '>=0.3.0')
  assert.equal(after.checkedAt, stamp)
  assert.equal(typeof after.publishedAt, 'number')
  assert.equal(after.npm, 'x')
})

test('the npm verdict survives a refresh untouched', () => {
  const before = { npm: 'some-package', version: '1.0.0', checkedAt: '2026-11-01' }
  const after = nextEntry(before, packument('1.1.0'), stamp)
  assert.equal(after.npm, 'some-package')
})

test('a packument with no dist-tags.latest keeps version, publishedAt and enginesDsh', () => {
  const before = { npm: 'x', version: '2.3.4', publishedAt: 1730000000, enginesDsh: '>=0.2.1', checkedAt: '2026-11-01' }
  const after = nextEntry(before, packument(null), stamp)
  assert.equal(after.version, '2.3.4')
  assert.equal(after.publishedAt, 1730000000)
  assert.equal(after.enginesDsh, '>=0.2.1')
  assert.equal(after.checkedAt, stamp)
})

test('isChanged only fires on a display-visible fact', () => {
  const base = { npm: 'x', version: '1.0.0', publishedAt: 1, enginesDsh: null, checkedAt: '2026-11-03' }
  assert.equal(isChanged(base, { ...base, checkedAt: '2026-11-04' }), false)
  assert.equal(isChanged(base, { ...base, version: '1.0.1' }), true)
  assert.equal(isChanged(base, { ...base, publishedAt: 2 }), true)
})

test('a throwing fetch leaves the entry byte-identical and counts as skipped', async () => {
  const entry = { npm: 'x', version: '1.0.0', publishedAt: 42, enginesDsh: '>=0.2.0', checkedAt: '2026-11-01' }
  const map = { [URL_A]: entry }
  const { map: after, skipped, refreshed } = await refreshEntries(map, {
    nowMs: now,
    maxAgeMs: 6 * HOUR,
    stamp,
    fetchPackument: async () => {
      throw new Error('HTTP 429')
    },
  })
  assert.equal(skipped, 1)
  assert.equal(refreshed, 0)
  // deep-equal to a clone: no version change, and crucially no checkedAt bump
  assert.deepEqual(after[URL_A], structuredClone(entry))
  assert.equal(after[URL_A].checkedAt, '2026-11-01')
})

test('a packument without dist-tags.latest keeps publishedAt through the whole pass', async () => {
  const entry = { npm: 'x', version: '2.3.4', publishedAt: 1730000000, enginesDsh: '>=0.2.1', checkedAt: '2026-11-01' }
  const { map: after, refreshed } = await refreshEntries({ [URL_A]: entry }, {
    nowMs: now,
    maxAgeMs: 6 * HOUR,
    stamp,
    fetchPackument: async () => ({ 'dist-tags': {}, time: {}, versions: {} }),
  })
  assert.equal(refreshed, 1)
  assert.equal(after[URL_A].version, '2.3.4')
  assert.equal(after[URL_A].publishedAt, 1730000000)
  assert.equal(after[URL_A].checkedAt, stamp)
})

test('entries that are not packages are never fetched', async () => {
  let called = 0
  const map = { [URL_A]: { npm: null, version: null, checkedAt: '2026-01-01' } }
  const { due } = await refreshEntries(map, {
    nowMs: now,
    maxAgeMs: 6 * HOUR,
    stamp,
    fetchPackument: async () => {
      called += 1
      return {}
    },
  })
  assert.equal(called, 0)
  assert.equal(due, 0)
})

test('a release that declares no engines.dsh is recorded as null, not as the previous range', () => {
  const before = { npm: 'x', version: '1.0.0', publishedAt: 1000, enginesDsh: '>=0.2.0', checkedAt: '2026-11-01' }
  const after = nextEntry(before, packument('1.3.0', { engines: {} }), stamp)
  assert.equal(after.version, '1.3.0')
  assert.equal(after.enginesDsh, null, 'a declaration from the previous release must not be attributed to this one')
})

test('a new version with no publish time is not dated to the previous release', () => {
  const before = { npm: 'x', version: '1.0.0', publishedAt: 1000, enginesDsh: null, checkedAt: '2026-11-01' }
  const after = nextEntry(before, packument('1.3.0', { time: {} }), stamp)
  assert.equal(after.version, '1.3.0')
  assert.equal(after.publishedAt, null, 'publishedAt must describe this version, so an unknown time is null')
})

test('the no-latest branch still carries prior facts (that is the one place it is right)', () => {
  const before = { npm: 'x', version: '2.0.0', publishedAt: 1730000000, enginesDsh: '>=0.2.1', checkedAt: '2026-11-01' }
  const after = nextEntry(before, packument(null), stamp)
  assert.deepEqual(after, {
    npm: 'x',
    version: '2.0.0',
    publishedAt: 1730000000,
    enginesDsh: '>=0.2.1',
    checkedAt: stamp,
  })
})

test('this pass writes a timestamp, so the gate keeps meaning after the same day', () => {
  // probe-npm stamps YYYY-MM-DD; Date.parse of that is UTC midnight, so at 09:00
  // UTC a date-only row already reads 9h old. That is why we write a timestamp.
  const dateOnly = needsRefresh({ npm: 'x', checkedAt: '2026-11-04' }, { nowMs: Date.parse('2026-11-04T09:00:00Z'), maxAgeMs: 6 * HOUR })
  assert.equal(dateOnly, true, 'a legacy date-only row looks up to a day old and is refreshed once')

  // After one refresh the row carries a timestamp and the gate behaves as intended.
  const fresh = needsRefresh({ npm: 'x', checkedAt: '2026-11-04T07:30:00.000Z' }, { nowMs: Date.parse('2026-11-04T09:00:00Z'), maxAgeMs: 6 * HOUR })
  assert.equal(fresh, false, '1.5h after a refresh the row must stay idle')
  const due = needsRefresh({ npm: 'x', checkedAt: '2026-11-04T02:50:00.000Z' }, { nowMs: Date.parse('2026-11-04T09:00:00Z'), maxAgeMs: 6 * HOUR })
  assert.equal(due, true, '6.2h after a refresh the row is due again')
})

test('a refresh writes checkedAt as a full ISO timestamp, never a bare date', () => {
  const after = nextEntry({ npm: 'x', checkedAt: '2026-11-01' }, packument('1.4.0'), stamp)
  assert.match(after.checkedAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
})
