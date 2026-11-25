import assert from 'node:assert/strict'
import fs from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { extendHistory, historyQuery, MAX_RELEASES, publishReleaseHistory, readHistoryPages, refreshHistory } from './lib/release-history.mjs'
import { collectReleaseHistory } from './probe-release-history.mjs'

const release = (tag, body = 'note') => ({ tag, body, publishedAt: null, name: null, url: null, commit: null })

test('requests independent continuation cursors and parses public stable release notes', () => {
  const batch = [{ repo: 'o/r', after: null }, { repo: 'o/fails', after: 'carry' }]
  const query = historyQuery(batch)
  assert.match(query, /after: null/)
  assert.match(query, /after: "carry"/)
  assert.match(query, /tagCommit \{ oid \}/)
  const pageInfo = { hasNextPage: true, endCursor: 'more' }
  const commit = 'a'.repeat(40)
  const releases = {
    pageInfo,
    nodes: [
      { tagName: 'v2.0.0', description: '界'.repeat(4000), isDraft: false, isPrerelease: false, tagCommit: { oid: commit } },
      { tagName: 'v3.0.0', isDraft: true, isPrerelease: false },
      { tagName: 'v3.0.0-rc.1', isDraft: false, isPrerelease: true },
    ],
  }
  const pages = readHistoryPages({ data: { r0: { releases }, r1: { releases } }, errors: [{ path: ['r1', 'releases'] }] }, batch)
  const page = pages.get('o/r')
  assert.equal(pages.has('o/fails'), false)
  assert.equal(page.next, 'more')
  assert.deepEqual(page.releases.map(row => [row.tag, row.commit]), [['v2.0.0', commit]])
  assert.match(page.releases[0].body, /^界+\n\n…$/u)
  assert.ok(Buffer.byteLength(page.releases[0].body) <= 4101)
})

test('preserves a backfilled tail across new releases and revisits it when it ages out', () => {
  const older = refreshHistory(undefined, { releases: [release('v1.2.0'), release('v1.1.0')], next: 'first' }, 'original', 10)
  const full = extendHistory(older, { releases: [release('v1.1.0'), release('v1.0.0')], next: null })
  const head = { releases: [release('v1.3.0'), release('v1.2.0', 'edited')], next: 'new-first' }
  const fresh = refreshHistory(full, head, 'new', 20)
  assert.deepEqual(fresh.releases.map(row => row.tag), ['v1.3.0', 'v1.2.0', 'v1.1.0', 'v1.0.0'])
  assert.equal(fresh.releases[1].body, 'edited')
  assert.equal(fresh.next, null)
  const expired = refreshHistory(full, head, 'new', 8 * 86400000)
  assert.equal(expired.next, 'new-first')
  assert.deepEqual(expired.releases, head.releases)
  assert.deepEqual(expired.fallback, full.releases)
  const rescanned = extendHistory(expired, { releases: [release('v1.1.0')], next: null })
  assert.equal(rescanned.fallback, undefined)
  assert.deepEqual(rescanned.releases.map(row => row.tag), ['v1.3.0', 'v1.2.0', 'v1.1.0'])
})

test('continues past a head page containing only prereleases', () => {
  const first = { releases: [], next: 'first' }
  const previous = refreshHistory(undefined, first, 'current', 10)
  const backfilled = { ...extendHistory(previous, { releases: [release('v1.2.0')], next: 'second' }), advancedAt: 19 }
  const refreshed = refreshHistory(backfilled, first, 'current', 20)
  assert.deepEqual(refreshed.releases, backfilled.releases)
  assert.equal(refreshed.next, 'second')
  assert.equal(refreshed.advancedAt, 19)
})

test('retains the capped published history while its replacement is being rechecked', () => {
  const releases = Array.from({ length: MAX_RELEASES }, (_, i) => release('v1.0.' + i))
  const previous = { releases, next: 'beyond-cap', started: 0, headCursor: 'old-head', headCount: 12 }
  const current = refreshHistory(previous, { releases: [release('v1.1.0')], next: 'head' }, 'new', 8 * 86400000)
  assert.equal(current.next, 'head')
  assert.deepEqual(current.fallback, releases)
})

test('keeps older pages queued and leaves quota for other catalog work', async (t) => {
  const api = t.mock.method(globalThis, 'fetch', async () => Response.json({
    data: {
      r0: { releases: {
        nodes: [{ tagName: 'v2.0.0', description: 'new', isDraft: false, isPrerelease: false }],
        pageInfo: { hasNextPage: true, endCursor: 'head' },
      } },
    },
  }, { headers: { 'x-ratelimit-remaining': '49' } }))
  const result = await collectReleaseHistory({
    'https://github.com/o/r': { release: { tag: 'v2.0.0' } },
  }, {}, 'fake-test-token', 10)
  assert.equal(api.mock.callCount(), 1)
  assert.equal(result['o/r'].next, 'head')
  assert.deepEqual(result['o/r'].releases.map(row => row.tag), ['v2.0.0'])
})

test('publishes one bounded fragment for a listed repository, including mixed-case subpaths', (t) => {
  const dir = fs.mkdtempSync(join(tmpdir(), 'history-site-'))
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }))
  const releases = Array.from({ length: MAX_RELEASES }, (_, i) => release('v1.0.' + i, '界'.repeat(2000)))
  const listed = [{ url: 'https://github.com/Owner/Repo' }, { url: 'https://github.com/owner/repo/tree/main/packages/x' }]
  const files = publishReleaseHistory(listed, {
    'owner/repo': { releases, next: null },
    'owner/removed': { releases: [release('v1.0.0')], next: null },
  }, dir, 10_000_000)
  assert.deepEqual([...files.repositories], ['owner/repo'])
  const base = join(dir, 'release-history', 'v1', 'owner')
  assert.deepEqual(fs.readdirSync(base), ['repo.json'])
  const bytes = fs.readFileSync(join(base, 'repo.json'))
  assert.ok(bytes.length < 1_048_576)
  const document = JSON.parse(bytes)
  assert.equal(document.repo, 'owner/repo')
  assert.equal(document.complete, false)
  assert.deepEqual(document.releases[0], releases[0])
})

test('respects the total artifact budget without claiming an unpublished fragment', (t) => {
  const dir = fs.mkdtempSync(join(tmpdir(), 'history-site-budget-'))
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }))
  const small = { releases: [release('v1.0.0')], next: null }
  const rows = ['o/first', 'o/second'].map(repo => ({ url: 'https://github.com/' + repo }))
  const result = publishReleaseHistory(rows, { 'o/first': small, 'o/second': small }, dir, 185)
  assert.deepEqual([...result.repositories], ['o/first'])
  assert.equal(result.skipped, 1)
  assert.ok(result.publishedBytes <= 185)
  assert.equal(fs.existsSync(join(dir, 'release-history/v1/o/second.json')), false)
})
