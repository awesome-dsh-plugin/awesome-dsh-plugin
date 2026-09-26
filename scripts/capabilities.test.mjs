import assert from 'node:assert/strict'
import test from 'node:test'
import {
  SCANNER_SCHEMA, factsFromScan, repoOf, scanSourceFor, shouldRescan, subdirOf,
} from './lib/capabilities.mjs'

// The values in these tests are not invented: the scanner responses are the
// shape `dsh-trust-check@0.1.13 --json` actually printed for
// @anionex/dsh-vision-toolkit and for a quiet theme package, measured
// 2026-09-24. A test that restated the docs instead would have passed while
// the five fields below were wrong.

test('names the repository and the subdirectory a URL points at', () => {
  assert.equal(repoOf('https://github.com/omdsh-dev/dsh-mnemon'), 'omdsh-dev/dsh-mnemon')
  assert.equal(repoOf('https://github.com/zhu1090093659/dsh-web/tree/main/packages/dsh-task-board'), 'zhu1090093659/dsh-web')
  assert.equal(repoOf('https://github.com/'), null)
  assert.equal(subdirOf('https://github.com/zhu1090093659/dsh-web/tree/main/packages/dsh-task-board'), 'packages/dsh-task-board')
  assert.equal(subdirOf('https://github.com/omdsh-dev/dsh-mnemon'), null)
})

test('prefers the npm package, then the author tarball, then the repository', () => {
  const url = 'https://github.com/anionex/dsh-vision-toolkit'
  assert.deepEqual(
    scanSourceFor({ url }, { [url]: { npm: '@anionex/dsh-vision-toolkit', version: '0.1.45' } }),
    {
      kind: 'npm',
      url: 'https://registry.npmjs.org/@anionex/dsh-vision-toolkit/-/dsh-vision-toolkit-0.1.45.tgz',
      spec: 'npm:@anionex/dsh-vision-toolkit@0.1.45',
      version: '0.1.45',
    },
  )
  // A prebuilt release with no npm package: the author's tarball IS the
  // distribution, so scanning the repository instead would describe source
  // nobody installs.
  assert.deepEqual(
    scanSourceFor({ url }, {}, { [url]: 'https://github.com/o/r/releases/latest/download/x.tgz' }),
    { kind: 'tarball', url: 'https://github.com/o/r/releases/latest/download/x.tgz', spec: `tarball:${url}`, version: null },
  )
  // Neither: the same artifact pnpm fetches for a `github:` spec, with HEAD so
  // no branch name (or API call) is needed.
  assert.deepEqual(
    scanSourceFor({ url }),
    { kind: 'github', url: 'https://codeload.github.com/anionex/dsh-vision-toolkit/tar.gz/HEAD', spec: 'github:anionex/dsh-vision-toolkit', version: null },
  )
})

test('rescan decisions follow the release, then age', () => {
  const stored = { version: '0.1.45', scannedAt: '2026-09-24T00:00:00Z' }
  const now = Date.parse('2026-09-24T12:00:00Z')
  // Same release, npm source: the facts still describe what would be installed.
  assert.equal(shouldRescan(stored, { version: '0.1.45' }, now, 7), false)
  // A new release invalidates them — they describe a build nobody installs.
  assert.equal(shouldRescan(stored, { version: '0.1.46' }, now, 7), true)
  // No record at all is always a scan.
  assert.equal(shouldRescan(undefined, { version: null }, now, 7), true)
  // A branch source has no version to compare, so it expires by AGE: three
  // days inside a seven-day window is fresh, thirty days is not.
  assert.equal(shouldRescan(stored, { version: null }, now, 7), false)
  assert.equal(shouldRescan(stored, { version: null }, Date.parse('2026-10-24T00:00:00Z'), 7), true)
  // An unreadable timestamp is not evidence of freshness.
  assert.equal(shouldRescan({ version: null, scannedAt: 'not a date' }, { version: null }, now, 7), true)
})

test('stores the capability shape the scanner printed, and nothing else', () => {
  const facts = factsFromScan({
    schemaVersion: SCANNER_SCHEMA,
    plugins: [{
      name: '@anionex/dsh-vision-toolkit',
      version: '0.1.45',
      spec: 'npm:@anionex/dsh-vision-toolkit@0.1.45',
      capabilities: ['shell', 'fs-write', 'fs-read', 'network', 'credentials', 'env', 'host-runtime', 'shell', ''],
      redLines: ['reads credentials/secrets AND has network access'],
      score: 28,
      band: 'red',
    }],
  }, { spec: 'fallback', version: null, tool: 'dsh-trust-check@0.1.13', now: '2026-09-24T12:00:00Z' })

  assert.deepEqual(facts, {
    version: '0.1.45',
    spec: 'npm:@anionex/dsh-vision-toolkit@0.1.45',
    capabilities: ['shell', 'fs-write', 'fs-read', 'network', 'credentials', 'env', 'host-runtime'],
    redLines: ['reads credentials/secrets AND has network access'],
    scannedAt: '2026-09-24T12:00:00Z',
    tool: 'dsh-trust-check@0.1.13',
  })
  // `score` and `band` are dropped on purpose: upstream says the band is not a
  // pre-install verdict, and a number ranking plugins safe/unsafe is the badge
  // this feature exists to avoid. A surface cannot render what never arrives.
  assert.equal('score' in facts, false)
  assert.equal('band' in facts, false)
})

test('a quiet package stores empty lists, not a clean verdict', () => {
  const facts = factsFromScan({ schemaVersion: 1, plugins: [{ name: 'skin', version: '1.1.0', capabilities: [], redLines: [] }] },
    { spec: 'npm:skin@1.1.0', version: '1.1.0', tool: 't', now: 'n' })
  assert.deepEqual(facts?.capabilities, [])
  assert.deepEqual(facts?.redLines, [])
  // The record says what was DETECTED; "nothing detected" is the scanner's
  // own wording upstream, and the surfaces print it as 未检出 for the same
  // reason: it is not a claim that there is nothing to find.
})

test('cannot read a shape it does not understand, and says so by returning nothing', () => {
  const fallback = { spec: 's', version: null, tool: 't', now: 'n' }
  assert.equal(factsFromScan({ schemaVersion: 2, plugins: [{}] }, fallback), null)
  assert.equal(factsFromScan({ plugins: [{}] }, fallback), null)
  assert.equal(factsFromScan({ schemaVersion: 1, plugins: [] }, fallback), null)
  assert.equal(factsFromScan({ schemaVersion: 1, errors: ['boom'] }, fallback), null)
  assert.equal(factsFromScan(null, fallback), null)
  assert.equal(factsFromScan('scan failed', fallback), null)
})
