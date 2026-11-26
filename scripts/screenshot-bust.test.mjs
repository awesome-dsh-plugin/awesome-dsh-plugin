import assert from 'node:assert/strict'
import test from 'node:test'
import { etagToken, versionShots, withContentVersion } from './lib/screenshot-bust.mjs'

const SRC = 'https://raw.githubusercontent.com/o/r/HEAD/docs/preview.png'
const ETAG = '"6d28561f5e7c0ca31291bdc19f19a0abeb196ce025dcdfc3e3219e325f9c6a25"'

test('an ETag becomes a bare query-safe token', () => {
  assert.equal(etagToken(ETAG), '6d28561f5e7c')
})

test('a weak validator and a bare value reduce the same way', () => {
  assert.equal(etagToken(`W/${ETAG}`), '6d28561f5e7c')
  assert.equal(etagToken('6d28561f5e7c0ca3'), '6d28561f5e7c')
})

test('a value too short to distinguish revisions is not a version', () => {
  assert.equal(etagToken('"abc"'), null)
  assert.equal(etagToken('""'), null)
  assert.equal(etagToken('   '), null)
})

test('a missing or non-string ETag is not a version', () => {
  assert.equal(etagToken(null), null)
  assert.equal(etagToken(undefined), null)
  assert.equal(etagToken(42), null)
})

test('a versioned URL differs from the unversioned one', () => {
  const versioned = withContentVersion(SRC, ETAG)
  assert.notEqual(versioned, SRC)
  assert.equal(new URL(versioned).searchParams.get('v'), '6d28561f5e7c')
})

test('the rest of the URL survives versioning unchanged', () => {
  const parsed = new URL(withContentVersion(SRC, ETAG))
  assert.equal(parsed.hostname, 'raw.githubusercontent.com')
  assert.equal(parsed.pathname, '/o/r/HEAD/docs/preview.png')
})

test('an image without a version keeps the exact URL it had', () => {
  assert.equal(withContentVersion(SRC, null), SRC)
  assert.equal(withContentVersion(SRC, undefined), SRC)
})

test('a query string the author wrote is kept alongside the version', () => {
  const src = `${SRC}?raw=1`
  const parsed = new URL(withContentVersion(src, ETAG))
  assert.equal(parsed.searchParams.get('raw'), '1')
  assert.equal(parsed.searchParams.get('v'), '6d28561f5e7c')
})

test('an existing version parameter is replaced rather than repeated', () => {
  const once = withContentVersion(SRC, ETAG)
  const twice = withContentVersion(once, ETAG)
  assert.equal(twice, once)
  assert.equal(new URL(twice).searchParams.getAll('v').length, 1)
})

test('a URL that cannot be parsed is published as written', () => {
  assert.equal(withContentVersion('not a url', ETAG), 'not a url')
})

test('a changed ETag produces a changed URL, an unchanged one does not', () => {
  const first = withContentVersion(SRC, '"aaaaaaaaaaaaaaaaaaaaaaaa"')
  const again = withContentVersion(SRC, '"aaaaaaaaaaaaaaaaaaaaaaaa"')
  const replaced = withContentVersion(SRC, '"bbbbbbbbbbbbbbbbbbbbbbbb"')
  assert.equal(first, again)
  assert.notEqual(first, replaced)
})

test('versionShots stamps from the verdict map and leaves the input alone', () => {
  const list = [SRC, 'https://raw.githubusercontent.com/o/r/HEAD/docs/second.png']
  const verdicts = { [SRC]: { ok: true, etag: ETAG } }
  const stamped = versionShots(list, verdicts)
  assert.equal(new URL(stamped[0]).searchParams.get('v'), '6d28561f5e7c')
  assert.equal(stamped[1], list[1])
  assert.deepEqual(list, [SRC, 'https://raw.githubusercontent.com/o/r/HEAD/docs/second.png'])
})

test('versionShots tolerates an absent verdict map', () => {
  assert.deepEqual(versionShots([SRC], undefined), [SRC])
})

test('an entry with no images keeps having no images', () => {
  // The publish path spreads the field straight into the payload, so an entry
  // that declared nothing must not gain an empty array here.
  assert.equal(versionShots(undefined, {}), undefined)
  assert.equal(versionShots(null, {}), null)
})
