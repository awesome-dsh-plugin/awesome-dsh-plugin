import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { runInNewContext } from 'node:vm'

// build-site.mjs is an executable generator. Exercise its pure command selector
// without generating pages or requiring live catalog/probe data.
const source = readFileSync(new URL('./build-site.mjs', import.meta.url), 'utf8')
const declaration = source.match(/function cardCmd\(e\) \{[\s\S]*?\n\}/)?.[0]
assert.ok(declaration, 'card command selector must exist')
const cardCmd = runInNewContext(`(${declaration})`)

test('cards retain prebuilt Release commands when no npm mapping exists', () => {
  for (const [repo, path, asset] of [
    ['scottzx/1acp', '#path:/packages/service', 'acp-service-v0.6.0/1agents-acp-service-0.6.0.tgz'],
    ['scottzx/session-reader', '', 'v0.8.6/session-reader-0.8.6.tgz'],
    ['scottzx/feature-blueprint', '', 'npm-v0.4.1/feature-blueprint-0.4.1.tgz'],
  ]) {
    const cmdTarball = `dsh plugin --profile web add "https://github.com/${repo}/releases/download/${asset}"`
    assert.equal(cardCmd({ npm: null, cmdTarball, cmdGit: `dsh plugin --profile web add github:${repo}${path}` }), cmdTarball)
  }
})

test('cards preserve verified npm priority and the Git-only fallback', () => {
  assert.equal(cardCmd({ npm: 'example-plugin', cmdTarball: 'release', cmdGit: 'git' }), 'dsh plugin --profile web add example-plugin')
  const cmdGit = 'dsh plugin --profile web add github:example/repo#path:/packages/plugin'
  assert.equal(cardCmd({ npm: null, cmdTarball: null, cmdGit }), cmdGit)
})
