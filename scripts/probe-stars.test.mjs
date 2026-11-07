import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath, pathToFileURL } from 'node:url'
import test from 'node:test'
import LOCALES from '../site/locales.mjs'

const script = fileURLToPath(new URL('./probe-stars.mjs', import.meta.url))

function fixture(t) {
  const cwd = mkdtempSync(join(tmpdir(), 'dsh-stars-'))
  t.after(() => rmSync(cwd, { recursive: true, force: true }))
  mkdirSync(join(cwd, 'data'))
  const urls = Array.from({ length: 12 }, (_, i) => `https://github.com/owner/plugin-${i}`)
  writeFileSync(join(cwd, LOCALES[0].readme), urls.map(url => `- [Plugin](${url}) — A plugin.`).join('\n'))
  const map = Object.fromEntries(urls.map((url, i) => [url, { stars: i, checkedAt: '2020-01-01' }]))
  writeFileSync(join(cwd, 'data/stars.json'), JSON.stringify(map))
  const mock = join(cwd, 'mock-fetch.mjs')
  writeFileSync(mock, `
    import { appendFileSync } from 'node:fs'
    let requests = 0
    globalThis.fetch = async (url) => {
      appendFileSync('requests.jsonl', JSON.stringify(url) + '\\n')
      requests++
      return requests <= 10
        ? { ok: true, json: async () => ({ stargazers_count: 100 }) }
        : { ok: false, status: 403 }
    }
  `)
  function run(env = {}) {
    const result = spawnSync(process.execPath, ['--import', pathToFileURL(mock).href, script], {
      cwd, encoding: 'utf8',
      env: { ...process.env, GITHUB_TOKEN: 'offline-test-token', PROBE_ALL: '1', ...env },
    })
    assert.equal(result.status, 0, result.stderr + result.stdout)
    return JSON.parse(readFileSync(join(cwd, 'data/stars.json'), 'utf8'))
  }
  return { cwd, urls, map, run }
}

test('quota-limited passes rotate coverage and preserve failed observations', t => {
  const { cwd, urls, map, run } = fixture(t)
  const first = run()
  assert.equal(first[urls[0]].stars, 100)
  assert.deepEqual(first[urls[10]], map[urls[10]])
  assert.deepEqual(first[urls[11]], map[urls[11]])

  const second = run()
  const requests = readFileSync(join(cwd, 'requests.jsonl'), 'utf8').trim().split('\n').map(JSON.parse)
  assert.equal(requests.length, 24)
  assert.deepEqual(requests.slice(12, 14), urls.slice(10).map(url => url.replace('https://github.com/', 'https://api.github.com/repos/')))
  assert.equal(second[urls[10]].stars, 100)
  assert.equal(second[urls[11]].stars, 100)
  // The requests that fail in the second pass must retain their first-pass values.
  assert.deepEqual(second[urls[8]], first[urls[8]])
  assert.deepEqual(second[urls[9]], first[urls[9]])
})

test('incremental passes skip fresh entries while refreshing stale entries first', t => {
  const { cwd, urls, map, run } = fixture(t)
  map[urls[0]].checkedAt = new Date().toISOString().slice(0, 10)
  map[urls[11]].checkedAt = '2019-01-01'
  writeFileSync(join(cwd, 'data/stars.json'), JSON.stringify(map))
  const result = run({ PROBE_ALL: '0', PROBE_RECHECK_DAYS: '1' })
  const requests = readFileSync(join(cwd, 'requests.jsonl'), 'utf8').trim().split('\n').map(JSON.parse)
  assert.equal(requests.length, 11)
  assert.equal(requests[0], 'https://api.github.com/repos/owner/plugin-11')
  assert.ok(!requests.includes('https://api.github.com/repos/owner/plugin-0'))
  assert.deepEqual(result[urls[0]], map[urls[0]])
})
