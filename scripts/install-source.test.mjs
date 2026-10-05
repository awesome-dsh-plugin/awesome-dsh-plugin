import assert from 'node:assert/strict'
import test from 'node:test'
import { execFileSync } from 'node:child_process'
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateEntries } from './lib/entries.mjs'
import { scanSourceFor } from './lib/capabilities.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
const entry = { url: 'https://github.com/owner/plugin', name: 'owner/plugin', category: 'fun', description: { en: 'Roleplay workspace.' } }

test('installation source is optional and accepts only the GitHub override', () => {
  assert.deepEqual(validateEntries([entry]), [])
  assert.deepEqual(validateEntries([{ ...entry, installSource: 'github' }]), [])
  for (const installSource of ['npm', 'gitub', false, null]) {
    assert.ok(validateEntries([{ ...entry, installSource }]).some(p => p.includes('"installSource"')))
  }
  const source = scanSourceFor({ ...entry, installSource: 'github' }, { [entry.url]: { npm: 'retired-roleplay-package', version: '1.0.0' } })
  assert.equal(source.kind, 'github')
  assert.equal(source.spec, 'github:owner/plugin')
})

test('published catalog and website ignore a retired npm mapping for a GitHub-only entry', t => {
  const cwd = mkdtempSync(join(tmpdir(), 'awesome-install-source-'))
  t.after(() => rmSync(cwd, { recursive: true, force: true }))
  for (const name of ['scripts', 'site', 'README.md', 'README.zh.md', 'contributing.md']) {
    cpSync(join(root, name), join(cwd, name), { recursive: true })
  }
  symlinkSync(join(root, 'node_modules'), join(cwd, 'node_modules'), 'junction')
  mkdirSync(join(cwd, 'data/plugins'), { recursive: true })
  for (const [repo, override] of [['plugin', true], ['default', false]]) {
    writeFileSync(join(cwd, `data/plugins/owner__${repo}.yml`), `url: https://github.com/owner/${repo}\nname: owner/${repo}\ncategory: fun\n${override ? 'installSource: github\n' : ''}description:\n  en: Roleplay workspace.\n  zh: 角色扮演工作区。\n`)
  }
  writeFileSync(join(cwd, 'data/npm-map.json'), JSON.stringify({
    [entry.url]: { npm: 'retired-roleplay-package', version: '1.0.0' },
    'https://github.com/owner/default': { npm: 'maintained-roleplay-package', version: '2.0.0' },
  }))
  writeFileSync(join(cwd, 'data/capabilities.json'), JSON.stringify({
    [entry.url]: { spec: 'npm:retired-roleplay-package@1.0.0', capabilities: ['shell'], redLines: [], scannedAt: '2026-10-01T00:00:00Z' },
  }))
  const run = (cmd, args) => execFileSync(cmd, args, { cwd, encoding: 'utf8', env: { ...process.env, SKIP_PUBLISH_CHECKS: '1' }, maxBuffer: 4 * 1024 * 1024 })
  run('git', ['init', '-q', '-b', 'main'])
  run('git', ['add', 'data/plugins', 'README.md', 'README.zh.md', 'site'])
  run('git', ['-c', 'user.name=Install fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-qm', 'fixture'])
  run(process.execPath, ['scripts/generate-readme.mjs'])
  run(process.execPath, ['scripts/build-site.mjs'])
  const catalog = JSON.parse(readFileSync(join(cwd, 'docs/plugins.json'), 'utf8'))
  const github = catalog.plugins.find(p => p.url === entry.url)
  assert.equal(github.npm, null)
  assert.equal(github.version, null)
  assert.equal(github.capabilities, undefined)
  assert.equal(github.install, 'dsh plugin --profile web add github:owner/plugin')
  const normal = catalog.plugins.find(p => p.url === 'https://github.com/owner/default')
  assert.equal(normal.npm, 'maintained-roleplay-package')
  assert.equal(normal.version, '2.0.0')
  assert.equal(normal.install, 'dsh plugin --profile web add maintained-roleplay-package')
  const detail = readFileSync(join(cwd, 'docs/p/owner/plugin/index.html'), 'utf8')
  assert.ok(detail.includes('dsh plugin --profile web add github:owner/plugin'))
  assert.ok(!detail.includes('retired-roleplay-package'))
})
