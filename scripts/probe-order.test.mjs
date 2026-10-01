import assert from 'node:assert/strict'
import test from 'node:test'
import { leastRecentlyChecked } from './lib/probe-order.mjs'

const A = 'https://github.com/o/a'
const B = 'https://github.com/o/b'
const C = 'https://github.com/o/c'
const D = 'https://github.com/o/d'

test('never-checked entries come first, then the oldest checkedAt', () => {
  const map = { [A]: { checkedAt: '2026-09-14' }, [B]: { checkedAt: '2026-09-05' }, [D]: { checkedAt: '2026-09-12' } }
  assert.deepEqual(leastRecentlyChecked([A, B, C, D], map), [C, B, D, A])
})

test('ties keep README order, so a fresh list is probed in list order', () => {
  const map = { [A]: { checkedAt: '2026-09-14' }, [B]: { checkedAt: '2026-09-14' }, [C]: { checkedAt: '2026-09-14' } }
  assert.deepEqual(leastRecentlyChecked([C, A, B], map), [C, A, B])
  assert.deepEqual(leastRecentlyChecked([A, B, C], {}), [A, B, C])
})

test('an entry without checkedAt counts as never checked', () => {
  const map = { [A]: { checkedAt: '2026-09-01' }, [B]: { release: null, commits: [] } }
  assert.deepEqual(leastRecentlyChecked([A, B], map), [B, A])
})

test('does not mutate the list it is given', () => {
  const urls = [A, B]
  leastRecentlyChecked(urls, { [A]: { checkedAt: '2026-09-14' } })
  assert.deepEqual(urls, [A, B])
})
