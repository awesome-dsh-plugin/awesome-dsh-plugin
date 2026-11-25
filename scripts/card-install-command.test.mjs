import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { runInNewContext } from 'node:vm'

// build-site.mjs is an executable generator. Exercise its pure command helpers
// without generating pages or requiring live catalog/probe data.
const source = readFileSync(new URL('./build-site.mjs', import.meta.url), 'utf8')
function commandHelper(name) {
  const declaration = source.match(new RegExp(`function ${name}\\([^)]*\\) \\{[\\s\\S]*?\\n\\}`))?.[0]
  assert.ok(declaration, `${name} must exist`)
  return runInNewContext(`(${declaration})`)
}
const cardCmd = commandHelper('cardCmd')
const releaseTarballCmd = commandHelper('releaseTarballCmd')

test('cards retain prebuilt Release commands when no npm mapping exists', () => {
  for (const [repo, path, asset] of [
    ['scottzx/1acp', '#path:/packages/service', 'acp-service-v0.6.0/1agents-acp-service-0.6.0.tgz'],
    ['scottzx/session-reader', '', 'v0.8.6/session-reader-0.8.6.tgz'],
    ['scottzx/feature-blueprint', '', 'npm-v0.4.1/feature-blueprint-0.4.1.tgz'],
  ]) {
    const url = `https://github.com/${repo}/releases/download/${asset}`
    const cmdTarball = releaseTarballCmd(url)
    assert.equal(
      cardCmd({ npm: null, cmdTarball, cmdGit: `dsh plugin --profile web add github:${repo}${path}` }),
      `dsh plugin --profile web add -w "${url}"`,
    )
  }
})

test('cards preserve verified npm priority and the Git-only fallback', () => {
  assert.equal(cardCmd({ npm: 'example-plugin', cmdTarball: 'release', cmdGit: 'git' }), 'dsh plugin --profile web add example-plugin')
  const cmdGit = 'dsh plugin --profile web add github:example/repo#path:/packages/plugin'
  assert.equal(cardCmd({ npm: null, cmdTarball: releaseTarballCmd(null), cmdGit }), cmdGit)
})
