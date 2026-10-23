import assert from 'node:assert/strict'
import test from 'node:test'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scripts = fileURLToPath(new URL('.', import.meta.url))
const ROOT = 'https://github.com/Owner/repo'
const SUB = `${ROOT}/tree/main/packages/plugin`
const OTHER = 'https://github.com/Other/repo'
const lines = [ROOT, SUB, OTHER].map((url) => `- [plugin](${url}) - Description.`).join('\n') + '\n'

function fixture(t) {
  const dir = mkdtempSync(join(tmpdir(), 'targeted-probes-'))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  mkdirSync(join(dir, 'data'))
  writeFileSync(join(dir, 'README.md'), lines)
  writeFileSync(join(dir, 'fetch-stub.mjs'), `
    import fs from 'node:fs'
    const replies = JSON.parse(fs.readFileSync('replies.json', 'utf8'))
    globalThis.fetch = async (url, options) => {
      fs.appendFileSync('requests.jsonl', JSON.stringify({ url: String(url), body: options?.body }) + '\\n')
      const reply = replies[String(url)]
      const response = reply ?? { status: 404 }
      return { ok: response.status === 200, status: response.status,
        json: async () => response.body, text: async () => response.body }
    }
  `)
  const run = (script, env = {}) => execFileSync(process.execPath, ['--import', pathToFileURL(join(dir, 'fetch-stub.mjs')).href, join(scripts, script)], {
    cwd: dir, encoding: 'utf8', env: { ...process.env, GITHUB_TOKEN: 'test-token', PROBE_TARGET_REPO: 'Owner/repo', ...env },
  })
  const fail = (script, env = {}, args = []) => spawnSync(process.execPath, [join(scripts, script), ...args], {
    cwd: dir, encoding: 'utf8', env: { ...process.env, GITHUB_TOKEN: 'test-token', PROBE_TARGET_REPO: 'Owner/repo', ...env },
  })
  const requests = () => readFileSync(join(dir, 'requests.jsonl'), 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse)
  return { dir, run, fail, requests, put: (name, data) => writeFileSync(join(dir, name), JSON.stringify(data)),
    get: (name) => JSON.parse(readFileSync(join(dir, name), 'utf8')) }
}

test('targeted npm refreshes root and subpackage versions, preserving unrelated cached rows', (t) => {
  const f = fixture(t)
  f.put('data/npm-map.json', {
    [ROOT]: { npm: 'root-pkg', version: '1.0.0', checkedAt: '2026-10-23' },
    [SUB]: { npm: 'sub-pkg', version: '1.0.0', checkedAt: '2026-10-23' },
    [OTHER]: { npm: 'other-pkg', version: '9.0.0', checkedAt: '2026-10-23' },
    'https://github.com/Removed/repo': { npm: 'old-pkg', version: '3.0.0' },
  })
  f.put('replies.json', {
    'https://raw.githubusercontent.com/Owner/repo/HEAD/package.json': { status: 200, body: { name: 'root-pkg' } },
    'https://raw.githubusercontent.com/Owner/repo/HEAD/packages/plugin/package.json': { status: 200, body: { name: 'sub-pkg' } },
    'https://registry.npmjs.org/root-pkg': { status: 200, body: { 'dist-tags': { latest: '2.0.0' }, repository: 'github:Owner/repo' } },
    'https://registry.npmjs.org/sub-pkg': { status: 200, body: { 'dist-tags': { latest: '2.1.0' }, repository: 'github:Owner/repo' } },
  })
  f.run('probe-npm.mjs')
  const map = f.get('data/npm-map.json')
  assert.equal(map[ROOT].version, '2.0.0')
  assert.equal(map[SUB].version, '2.1.0')
  assert.deepEqual(map[OTHER], { npm: 'other-pkg', version: '9.0.0', checkedAt: '2026-10-23' })
  assert.equal(map['https://github.com/Removed/repo'].version, '3.0.0')
  assert.equal(f.requests().length, 4)
})

test('targeted README refreshes root and subpackage content, preserving unrelated rows', (t) => {
  const f = fixture(t)
  f.put('data/readmes.json', {
    [ROOT]: { en: { md: 'old root' }, fetchedAt: '2026-10-23' },
    [SUB]: { en: { md: 'old sub' }, fetchedAt: '2026-10-23' },
    [OTHER]: { en: { md: 'other' }, fetchedAt: '2026-10-23' },
    'https://github.com/Removed/repo': { en: { md: 'removed' } },
  })
  f.put('replies.json', {
    'https://api.github.com/graphql': { status: 200, body: { data: {
      r0: { object: { entries: [{ name: 'README.md' }] } },
      r1: { object: { entries: [{ name: 'README.md' }] } },
    } } },
    'https://raw.githubusercontent.com/Owner/repo/HEAD/README.md': { status: 200, body: 'new root' },
    'https://raw.githubusercontent.com/Owner/repo/HEAD/packages/plugin/README.md': { status: 200, body: 'new sub' },
    'https://raw.githubusercontent.com/Owner/repo/HEAD/README.zh.md': { status: 404 },
  })
  f.run('probe-readmes.mjs')
  const map = f.get('data/readmes.json')
  assert.equal(map[ROOT].en.md, 'new root')
  assert.equal(map[SUB].en.md, 'new sub')
  assert.equal(map[OTHER].en.md, 'other')
  assert.equal(map['https://github.com/Removed/repo'].en.md, 'removed')
  assert.equal(f.requests().filter((r) => r.url.includes('Other/')).length, 0)
})

test('unknown and malformed targets fail before network or cache writes', (t) => {
  const f = fixture(t)
  f.put('data/npm-map.json', { [OTHER]: { npm: 'other-pkg' } })
  f.put('replies.json', {})
  const original = readFileSync(join(f.dir, 'data/npm-map.json'), 'utf8')
  for (const target of ['Missing/repo', 'Owner/repo;echo bad', 'https://github.com/Owner/repo']) {
    assert.notEqual(f.fail('probe-npm.mjs', { PROBE_TARGET_REPO: target }).status, 0)
    assert.notEqual(f.fail('probe-readmes.mjs', { PROBE_TARGET_REPO: target }).status, 0)
    assert.equal(readFileSync(join(f.dir, 'data/npm-map.json'), 'utf8'), original)
  }
  assert.throws(() => readFileSync(join(f.dir, 'requests.jsonl')), /ENOENT/)
})

test('preflight rejects conflicting switches and missing cache before probing', (t) => {
  const f = fixture(t)
  assert.notEqual(f.fail('check-probe-target.mjs', { TARGET_PROBE_ALL: 'true' }).status, 0)
  assert.notEqual(f.fail('check-probe-target.mjs', { TARGET_SKIP_PROBES: 'true' }).status, 0)
  assert.notEqual(f.fail('check-probe-target.mjs', {}, ['--require-cache']).status, 0)
  f.put('data/npm-map.json', {})
  f.put('data/readmes.json', {})
  assert.equal(f.fail('check-probe-target.mjs', {}, ['--require-cache']).status, 0)
})

test('ordinary npm pass still removes unlisted rows and skips fresh published versions', (t) => {
  const f = fixture(t)
  f.put('data/npm-map.json', {
    [ROOT]: { npm: 'root-pkg', version: '1.0.0', publishedAt: null, checkedAt: '2099-01-01' },
    [SUB]: { npm: 'sub-pkg', version: '1.0.0', publishedAt: null, checkedAt: '2099-01-01' },
    [OTHER]: { npm: 'other-pkg', version: '9.0.0', publishedAt: null, checkedAt: '2099-01-01' },
    'https://github.com/Removed/repo': { npm: 'old-pkg' },
  })
  f.put('replies.json', {})
  f.run('probe-npm.mjs', { PROBE_TARGET_REPO: '' })
  const map = f.get('data/npm-map.json')
  assert.equal(map[ROOT].version, '1.0.0')
  assert.equal(map[OTHER].version, '9.0.0')
  assert.equal('https://github.com/Removed/repo' in map, false)
  assert.throws(() => readFileSync(join(f.dir, 'requests.jsonl')), /ENOENT/)
})

test('ordinary README pass still removes unlisted rows and skips fresh content', (t) => {
  const f = fixture(t)
  f.put('data/readmes.json', {
    [ROOT]: { en: { md: 'root' }, fetchedAt: '2099-01-01' },
    [SUB]: { en: { md: 'sub' }, fetchedAt: '2099-01-01' },
    [OTHER]: { en: { md: 'other' }, fetchedAt: '2099-01-01' },
    'https://github.com/Removed/repo': { en: { md: 'removed' } },
  })
  f.put('replies.json', {})
  f.run('probe-readmes.mjs', { PROBE_TARGET_REPO: '' })
  const map = f.get('data/readmes.json')
  assert.equal(map[ROOT].en.md, 'root')
  assert.equal(map[OTHER].en.md, 'other')
  assert.equal('https://github.com/Removed/repo' in map, false)
  assert.throws(() => readFileSync(join(f.dir, 'requests.jsonl')), /ENOENT/)
})
