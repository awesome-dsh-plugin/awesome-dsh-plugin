import test from 'node:test'
import assert from 'node:assert/strict'
import { repositoryStatistics } from './lib/github-statistics.mjs'

const connection = (nodes, cursor = null) => ({ nodes, pageInfo: { hasNextPage: cursor !== null, endCursor: cursor } })
const release = (id, downloads, cursor = null) => ({ id, isDraft: false, releaseAssets: connection(downloads.map((value, i) => ({ id: `${id}-${i}`, downloadCount: value })), cursor) })

test('star sweeps deduplicate monorepo repositories and use 50 aliases per query', async () => {
  const repos = Array.from({ length: 101 }, (_, i) => `owner/repo${i}`), calls = []
  const result = await repositoryStatistics([...repos, repos[0]], async query => {
    calls.push(query)
    return { data: Object.fromEntries([...query.matchAll(/(r\d+): repository/g)].map(([, key]) => [key, { isPrivate: false, stargazerCount: 45 }])) }
  })
  assert.equal(calls.length, 3); assert.equal(result.size, 101)
  assert.deepEqual(result.get(repos[0]), { stars: 45 })
  assert.ok(calls.every(query => !query.includes('releaseAssets')))
})

test('release totals exhaust both page levels, include prereleases, and exclude drafts', async () => {
  let call = 0
  const result = await repositoryStatistics(['owner/repo'], async query => {
    call++
    if (call === 1) return { data: { r0: { isPrivate: false, stargazerCount: 45, releases: connection([
      release('one', [2, 3], 'asset-next'), { ...release('draft', [900]), isDraft: true },
    ], 'release-next') } } }
    assert.match(query, /after: "asset-next"/); assert.match(query, /after: "release-next"/)
    return { data: { r0: { releaseAssets: connection([{ id: 'one-extra', downloadCount: 7 }]) },
      r1: { isPrivate: false, stargazerCount: 46, releases: connection([release('two', [11])]) } } }
  }, { releases: true })
  assert.equal(call, 2); assert.deepEqual(result.get('owner/repo'), { stars: 45, downloads: 23 })
})

test('partial errors, missing pages and repeated cursors never publish partial totals or zero', async () => {
  const partial = await repositoryStatistics(['o/a', 'o/b'], async () => ({ data: {
    r0: { isPrivate: false, stargazerCount: 1 }, r1: { isPrivate: false, stargazerCount: 2 },
  }, errors: [{ path: ['r0'], message: 'unavailable' }] }))
  assert.deepEqual([...partial], [['o/b', { stars: 2 }]])
  let calls = 0
  const failed = await repositoryStatistics(['o/a'], async () => {
    if (++calls === 2) throw Error('quota')
    return { data: { r0: { isPrivate: false, stargazerCount: 1, releases: connection([release('a', [5])], 'next') } } }
  }, { releases: true })
  assert.equal(failed.size, 0)
  const incomplete = await repositoryStatistics(['o/a'], async () => ({ data: { r0: { isPrivate: false, stargazerCount: 1, releases: { nodes: [] } } } }), { releases: true })
  assert.equal(incomplete.size, 0)
  const zero = await repositoryStatistics(['o/a'], async () => ({ data: { r0: { isPrivate: false, stargazerCount: 0, releases: connection([]) } } }), { releases: true })
  assert.deepEqual(zero.get('o/a'), { stars: 0, downloads: 0 })
  const hidden = await repositoryStatistics(['o/private'], async () => ({ data: { r0: { isPrivate: true, stargazerCount: 1 } } }))
  assert.equal(hidden.size, 0)
  let repeated = 0
  const cycle = await repositoryStatistics(['o/a'], async () => ({ data: { r0: {
    isPrivate: false, stargazerCount: 1, releases: connection([release(`page-${++repeated}`, [5])], 'same-cursor'),
  } } }), { releases: true })
  assert.equal(repeated, 2); assert.equal(cycle.size, 0)
})
