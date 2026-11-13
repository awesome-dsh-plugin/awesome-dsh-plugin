import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { runInNewContext } from 'node:vm'

// Exercise the gate's real scanner and manifest decoder without its CLI,
// GitHub token or HTTP requests.
const source = readFileSync(new URL('./check-submission.mjs', import.meta.url), 'utf8')
const scanner = source.match(/const scanTree = [\s\S]*?\n\}\)/)?.[0]
const decoder = source.match(/const b64 = .*\n/)?.[0]
const parser = source.match(/function parsePkg\(content\) \{[\s\S]*?\n\}/)?.[0]
const firstParty = source.match(/const FIRST_PARTY_PACKAGES = new Set\(\[[\s\S]*?\n\]\)/)?.[0]
assert.ok(scanner && decoder && parser && firstParty)

const manifest = (pkg) => ({ status: 200, body: {
  content: Buffer.from(JSON.stringify(pkg)).toString('base64'),
} })

async function scan(responses, { cap = 40 } = {}) {
  const paths = responses.map((_, index) => `packages/p${index}/package.json`)
  const scanTree = runInNewContext(`${firstParty}\n${decoder}\n${parser}\n${scanner}\nscanTree`, {
    Buffer,
    MAX_TREE_PKGS: cap,
    once: (_key, make) => make(),
    api: async (pathname) => {
      if (pathname === 'repos/owner/repo/git/trees/HEAD?recursive=1') {
        return { status: 200, body: { tree: paths.map((path) => ({ path })) } }
      }
      const prefix = 'repos/owner/repo/contents/'
      assert.ok(pathname.startsWith(prefix), pathname)
      const index = paths.indexOf(pathname.slice(prefix.length))
      assert.ok(index >= 0, pathname)
      return responses[index]
    },
  })
  return scanTree('owner/repo')
}

test('unreadable manifests are inconclusive rather than missing a bundle', async () => {
  for (const response of [
    { status: 403 }, { status: 500 }, { status: 200, body: {} },
    { status: 200, body: { content: Buffer.from('{').toString('base64') } },
  ]) {
    const result = await scan([manifest({ name: 'plain-package' }), response])
    assert.equal(result.ok, null, JSON.stringify(response))
    assert.match(result.why, /read|parse|manifest/i)
  }
})

test('an incomplete scan cannot conclude that only dsh.client is declared', async () => {
  const result = await scan([
    manifest({ dsh: { client: './client.js' } }),
    manifest({ dsh: { bundle: './bundle.js' } }),
  ], { cap: 1 })
  assert.equal(result.ok, null)
})

test('an incomplete scan cannot conclude that only a vendored harness is present', async () => {
  const result = await scan([
    manifest({ name: '@deepseek-ai/dsh-base', dsh: { bundle: './base.js' } }),
    manifest({ name: 'real-plugin', dsh: { bundle: './bundle.js' } }),
  ], { cap: 1 })
  assert.equal(result.ok, null)
})

test('unreadable manifests also prevent a client-only rejection', async () => {
  const result = await scan([manifest({ dsh: { client: './client.js' } }), { status: 500 }])
  assert.equal(result.ok, null)
})

test('a genuine bundle is accepted despite other unreadable manifests', async () => {
  const result = await scan([{ status: 500 }, manifest({ dsh: { bundle: './bundle.js' } })])
  assert.equal(result.ok, true)
  assert.equal(result.at, 'packages/p1/package.json')
})

test('complete scans retain definite rejection reasons', async () => {
  const missing = await scan([manifest({ name: 'plain-package' })])
  assert.equal(missing.ok, false)
  assert.match(missing.why, /no `dsh.bundle`/)
  const client = await scan([manifest({ dsh: { client: './client.js' } })])
  assert.equal(client.ok, false)
  assert.match(client.why, /only `dsh.client`/)
  const vendored = await scan([manifest({ name: '@deepseek-ai/dsh-base', dsh: { bundle: './base.js' } })])
  assert.equal(vendored.ok, false)
  assert.match(vendored.why, /DSH's own/)
})
