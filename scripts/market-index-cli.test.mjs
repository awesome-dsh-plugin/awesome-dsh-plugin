import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

const script = fileURLToPath(new URL('./build-index.mjs', import.meta.url))

test('standalone CLI consumes optional Git records and validates the emitted host index', (t) => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'dsh-market-cli-'))
  t.after(() => fs.rmSync(cwd, { recursive: true, force: true }))
  fs.mkdirSync(path.join(cwd, 'data/plugins'), { recursive: true })
  fs.mkdirSync(path.join(cwd, 'docs'))
  const url = 'https://github.com/example/catalog-fixture'
  fs.writeFileSync(path.join(cwd, 'data/plugins/example.yml'), JSON.stringify({
    url, name: 'Fixture', category: 'tools', description: { en: 'Synthetic test fixture' },
  }))
  const run = (...args) => execFileSync(process.execPath, [script, ...args], { cwd, encoding: 'utf8' })
  const read = () => JSON.parse(fs.readFileSync(path.join(cwd, 'docs/index.json'), 'utf8'))
  run()
  assert.equal(read().plugins.length, 0)
  fs.writeFileSync(path.join(cwd, 'data/git-releases.json'), '{}\n')
  run()
  assert.equal(read().plugins.length, 0)
  const record = { name: 'catalog-fixture', version: '1.0.0', publishedAt: 1792634420, commit: 'a'.repeat(40) }
  const write = (value) => fs.writeFileSync(path.join(cwd, 'data/git-releases.json'), JSON.stringify({ [url]: value }))
  write(record)
  run()
  assert.equal(read().plugins[0].versions[0].source.commit, record.commit)
  assert.match(run('--check'), /valid format-1 index \(1 plugins\)/)
  write({ ...record, commit: 'main' })
  assert.match(run(), /refused by the format: 1/)
  assert.equal(read().plugins.length, 0)
})
