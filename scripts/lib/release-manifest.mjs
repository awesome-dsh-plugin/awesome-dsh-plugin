/** Resolve the manifest at the declared install tag, never an unrelated latest release. */
export function releaseManifestUrl(entry) {
  const source = /^https:\/\/github\.com\/([^/]+\/[^/]+)(?:\/tree\/[^/]+\/(.+?))?\/?$/.exec(entry.url)
  const asset = /^https:\/\/github\.com\/([^/]+\/[^/]+)\/releases\/download\/([^/]+)\/[^/?#]+\.(?:tgz|tar\.gz)$/.exec(entry.tarball ?? '')
  if (!source || !asset || source[1].toLowerCase() !== asset[1].toLowerCase()) return null
  let ref, subpath
  try { ref = decodeURIComponent(asset[2]); subpath = (source[2] ?? '').split('/').filter(Boolean).map(decodeURIComponent) }
  catch { return null }
  if (!ref || ref.length > 256 || [...ref.split('/'), ...subpath].some(part => !part || part === '.' || part === '..' || part.includes('\\'))) return null
  return `https://raw.githubusercontent.com/${source[1]}/${encodeURIComponent(ref)}/${[...subpath, 'package.json'].map(encodeURIComponent).join('/')}`
}

const record = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {}
const text = value => typeof value === 'string' && value.trim() && value.trim().length <= 256 ? value.trim() : null
export function releaseManifestFacts(value) {
  const manifest = record(value), peers = record(manifest.peerDependencies)
  if (typeof manifest.name !== 'string' || !text(manifest.version) || !record(manifest.dsh).bundle) throw Error('Not an installable DSH package manifest')
  return { version: text(manifest.version),
    enginesDsh: text(record(manifest.engines).dsh) ?? text(record(record(manifest.dsh).engines).dsh),
    peerDependencies: Object.fromEntries(Object.entries(peers).filter(([key, value]) => key.startsWith('@deepseek-ai/') && text(value)).map(([key, value]) => [key, text(value)])),
  }
}

/** A cached manifest is only evidence about the exact selected install URL. */
export function releaseMetadataFor(entry, stored) {
  const result = {}
  const stats = stored?.statistics
  if (Number.isSafeInteger(stats?.downloads) && stats.downloads >= 0 && typeof stats.checkedAt === 'string') {
    result.githubReleaseDownloads = stats.downloads
    result.githubReleaseDownloadsCheckedAt = stats.checkedAt
  }
  const manifest = stored?.manifest
  if (entry.tarball && manifest?.tarball === entry.tarball && releaseManifestUrl(entry)) {
    result.releaseManifest = manifest
  }
  return result
}
