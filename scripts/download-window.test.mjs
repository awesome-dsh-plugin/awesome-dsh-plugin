import test from 'node:test'
import assert from 'node:assert/strict'
import { downloadWindow, downloadResult } from './download-window.mjs'

test('30 inclusive UTC days ending yesterday, including leap/year boundaries', () => {
  assert.deepEqual(downloadWindow(new Date('2026-09-17T01:00:00Z')), { start: '2026-08-18', end: '2026-09-16' })
  assert.deepEqual(downloadWindow(new Date('2024-03-01T00:00:00Z')), { start: '2024-01-31', end: '2024-02-29' })
  assert.deepEqual(downloadWindow(new Date('2026-01-01T00:00:00Z')), { start: '2025-12-02', end: '2025-12-31' })
})
const window = { start: '2026-08-18', end: '2026-09-16' }
const row = { ...window, package: 'example', downloads: 0 }
test('single and bulk shapes preserve genuine zero and period', () => {
  const expected = { ...window, downloads: 0, checkedAt: '2026-09-17' }
  assert.deepEqual(downloadResult(row, 'example', window, '2026-09-17'), expected)
  assert.deepEqual(downloadResult({ example: row }, 'example', window, '2026-09-17'), expected)
})
test('missing, stale, mismatched and malformed statistics fail instead of inventing zero', () => {
  for (const body of [null, {}, { example: null }, { error: 'not found' },
    { ...row, end: '2026-09-11' }, { ...row, package: 'other' },
    ...[-1, 1.5, NaN, Infinity, '3'].map(downloads => ({ ...row, downloads }))]) {
    assert.throws(() => downloadResult(body, 'example', window, '2026-09-17'))
  }
})
