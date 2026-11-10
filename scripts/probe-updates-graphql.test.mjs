import assert from 'node:assert/strict'
import test from 'node:test'
import { REPOS_PER_QUERY, buildQuery, rateLimitDelayMs, readEntries, repoOf } from './lib/probe-updates-graphql.mjs'

const A = { owner: 'o', name: 'a' }
const B = { owner: 'o', name: 'b' }
const LIMITS = { maxBodyBytes: 4096, maxMessageChars: 200 }

/** A response for one repository, as the API shapes it. */
const repo = ({ release = null, commits = [] }) => ({
  latestRelease: release,
  defaultBranchRef: commits.length
    ? { target: { history: { nodes: commits } } }
    : null,
})

const release = (over = {}) => ({
  tagName: 'v1.0.0', name: 'One', publishedAt: '2026-08-31T00:00:00Z',
  url: 'https://github.com/o/a/releases/tag/v1.0.0', description: 'notes',
  isDraft: false, isPrerelease: false, ...over,
})

test('repoOf takes the repository, not the monorepo subdirectory', () => {
  assert.equal(repoOf('https://github.com/o/a'), 'o/a')
  assert.equal(repoOf('https://github.com/o/a/'), 'o/a')
  assert.equal(repoOf('https://github.com/o/a/tree/main/packages/plugin'), 'o/a')
})

test('one query names every repository and asks for the same fields', () => {
  const query = buildQuery([A, B], { commitTail: 5 })
  assert.match(query, /r0: repository\(owner: "o", name: "a"\)/)
  assert.match(query, /r1: repository\(owner: "o", name: "b"\)/)
  assert.equal((query.match(/history\(first: 5\)/g) ?? []).length, 2)
  assert.equal((query.match(/latestRelease \{/g) ?? []).length, 2)
  // Requested but never published — readEntries uses it to decide on REST.
  assert.equal((query.match(/isDraft isPrerelease/g) ?? []).length, 2)
})

test('a batch is fifty repositories, the size the readme listing uses', () => {
  assert.equal(REPOS_PER_QUERY, 50)
})

test('reads a release and a commit tail into the REST probe\'s shape', () => {
  const payload = { data: { r0: repo({
    release: release(),
    commits: [{ oid: 'abc123', messageHeadline: 'fix: a thing', authoredDate: '2026-09-01T00:00:00Z' }],
  }) } }
  const entries = readEntries(payload, [A], LIMITS)
  assert.deepEqual(entries.get(0), {
    release: {
      tag: 'v1.0.0', name: 'One', publishedAt: '2026-08-31T00:00:00Z',
      url: 'https://github.com/o/a/releases/tag/v1.0.0', body: 'notes',
    },
    commits: [{ sha: 'abc123', message: 'fix: a thing', date: '2026-09-01T00:00:00Z' }],
  })
})

test('a repository without releases keeps its commits, and vice versa', () => {
  const noRelease = readEntries({ data: { r0: repo({ commits: [{ oid: 'a', messageHeadline: 'x', authoredDate: null }] }) } }, [A], LIMITS)
  assert.equal(noRelease.get(0).release, null)
  assert.equal(noRelease.get(0).commits.length, 1)

  const noCommits = readEntries({ data: { r0: repo({ release: release() }) } }, [A], LIMITS)
  assert.equal(noCommits.get(0).release.tag, 'v1.0.0')
  assert.deepEqual(noCommits.get(0).commits, [])
})

test('neither a release nor a commit is reported, so the caller decides', () => {
  // `{release: null, commits: []}` is the batch's answer, not a verdict: the
  // probe treats it as "no update data" exactly as the REST path does.
  assert.deepEqual(readEntries({ data: { r0: repo({}) } }, [A], LIMITS).get(0), { release: null, commits: [] })
})

test('applies the same release-body and message caps as the REST path', () => {
  const long = 'x'.repeat(LIMITS.maxBodyBytes + 10)
  const entries = readEntries(
    { data: { r0: repo({ release: release({ description: long }), commits: [{ oid: 'a', messageHeadline: 'y'.repeat(300), authoredDate: null }] }) } },
    [A], LIMITS,
  )
  assert.equal(entries.get(0).release.body, 'x'.repeat(LIMITS.maxBodyBytes) + '\n\n…')
  assert.equal(entries.get(0).commits[0].message, 'y'.repeat(LIMITS.maxMessageChars))
})

test('a commit without an oid is dropped, as the REST path drops a missing sha', () => {
  const entries = readEntries(
    { data: { r0: repo({ commits: [{ oid: null, messageHeadline: 'x', authoredDate: null }, { oid: 'b', messageHeadline: 'y', authoredDate: null }] }) } },
    [A], LIMITS,
  )
  assert.deepEqual(entries.get(0).commits.map((c) => c.sha), ['b'])
})

test('a prerelease or draft latest release is declined, not published', () => {
  // `/releases/latest` skips both; GraphQL's `latestRelease` promises nothing.
  // Declining sends this repository to REST instead of publishing a different
  // answer to every market.
  for (const flag of [{ isPrerelease: true }, { isDraft: true }]) {
    const payload = { data: { r0: repo({ release: release(flag), commits: [] }) } }
    assert.equal(readEntries(payload, [A], LIMITS).has(0), false, JSON.stringify(flag))
  }
})

test('declining one repository leaves the rest of the batch usable', () => {
  const payload = { data: {
    r0: repo({ release: release({ isPrerelease: true }) }),
    r1: repo({ release: release({ tagName: 'v2.0.0' }) }),
  } }
  const entries = readEntries(payload, [A, B], LIMITS)
  assert.equal(entries.has(0), false)
  assert.equal(entries.get(1).release.tag, 'v2.0.0')
})

test('a repository the API could not resolve is declined', () => {
  assert.equal(readEntries({ data: { r0: null } }, [A], LIMITS).has(0), false)
  assert.equal(readEntries({ data: {} }, [A], LIMITS).has(0), false)
})

test('an error on one alias declines that alias only', () => {
  const payload = {
    data: { r0: null, r1: repo({ release: release() }) },
    errors: [{ type: 'FORBIDDEN', path: ['r0'] }],
  }
  const entries = readEntries(payload, [A, B], LIMITS)
  assert.equal(entries.has(0), false)
  assert.equal(entries.get(1).release.tag, 'v1.0.0')
})

test('an answer with no data declines everything', () => {
  assert.equal(readEntries({ data: null, errors: [{ type: 'RATE_LIMITED' }] }, [A], LIMITS).size, 0)
  assert.equal(readEntries(null, [A], LIMITS).size, 0)
})

test('a rate-limited answer reports how long to wait', () => {
  const headers = (h) => ({ get: (k) => h[k] ?? null })
  assert.equal(rateLimitDelayMs(headers({ 'retry-after': '30' })), 30000)
  assert.equal(rateLimitDelayMs(headers({ 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': '1000' }), 900000), 101000)
  // A reset already in the past still costs a token second, not a negative wait.
  assert.equal(rateLimitDelayMs(headers({ 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': '500' }), 900000), 1000)
  assert.equal(rateLimitDelayMs(headers({ 'x-ratelimit-remaining': '4999' })), 0)
  assert.equal(rateLimitDelayMs(headers({})), 0)
})
