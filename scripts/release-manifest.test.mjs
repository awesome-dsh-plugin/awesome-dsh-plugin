import test from 'node:test'
import assert from 'node:assert/strict'
import { releaseManifestUrl, releaseManifestFacts, releaseMetadataFor } from './lib/release-manifest.mjs'

const entry = { url: 'https://github.com/owner/plugin', tarball: 'https://github.com/owner/plugin/releases/download/v1.3.0/plugin-1.3.0.tgz' }
const facts = { version: '1.3.0', enginesDsh: '0.2.1-rc.5', peerDependencies: { '@deepseek-ai/dsh-tools': '0.2.1-rc.5' } }

test('release manifests follow the pinned tag and selected subpackage', () => {
  assert.equal(releaseManifestUrl(entry), 'https://raw.githubusercontent.com/owner/plugin/v1.3.0/package.json')
  assert.equal(releaseManifestUrl({ ...entry, url: entry.url + '/tree/main/packages/plugin' }), 'https://raw.githubusercontent.com/owner/plugin/v1.3.0/packages/plugin/package.json')
  for (const tarball of [entry.tarball.replace('/owner/', '/other/'), entry.tarball.replace('/download/v1.3.0/', '/latest/download/'), entry.tarball.replace('/v1.3.0/', '/%2E%2E/'), 'file:///package.tgz'])
    assert.equal(releaseManifestUrl({ ...entry, tarball }), null)
})

test('only package version and declared host facts are retained, including nested engines', () => {
  const manifest = { name: 'plugin', version: '1.3.0', dsh: { bundle: { patch: './cordis.patch.yml' }, engines: { dsh: '0.2.1-rc.5' } }, peerDependencies: { ...facts.peerDependencies, other: '*', '@deepseek-ai/invalid': 17 }, scripts: { postinstall: 'never executed' } }
  assert.deepEqual(releaseManifestFacts(manifest), facts)
  assert.throws(() => releaseManifestFacts({ ...manifest, dsh: {} }), /installable/)
})

test('new install URLs cannot inherit the old version or host range; counts retain their own timestamp', () => {
  const stored = { statistics: { downloads: 7000, checkedAt: '2026-10-31T08:35:00.000Z' }, manifest: { ...facts, tarball: entry.tarball, checkedAt: '2026-10-31T08:35:00.000Z' } }
  const value = releaseMetadataFor(entry, stored)
  assert.equal(value.releaseManifest.version, '1.3.0')
  assert.equal(value.githubReleaseDownloads, 7000)
  assert.equal(value.githubReleaseDownloadsCheckedAt, stored.statistics.checkedAt)
  const updated = releaseMetadataFor({ ...entry, tarball: entry.tarball.replaceAll('1.3.0', '1.4.0') }, stored)
  assert.equal(updated.releaseManifest, undefined)
  assert.equal(updated.githubReleaseDownloads, 7000)
  assert.deepEqual(releaseMetadataFor(entry, undefined), {})
})
