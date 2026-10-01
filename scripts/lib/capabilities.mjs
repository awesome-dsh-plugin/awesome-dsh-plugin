// Where a plugin's capability facts come from, and what they are allowed to say.
//
// The catalog renders "what this plugin touches" — files, network, shell,
// credentials — as FACTS, never as a verdict. #209 is why: a badge saying
// "safe" stops people reading, and the misses are guaranteed to exist, so the
// only honest shape is a disclosure with its own blind spots printed next to
// it. The scanner this reads is `dsh-trust-check` (MIT, no code execution, no
// network, milliseconds per package — see its docs/INTEGRATION.md), and
// everything below exists to keep two promises about it:
//
//   1. A fact is only ever written when it was READ. A failed download, a
//      crashed scanner, a schema this code does not understand — all of them
//      leave the entry absent, which the surfaces render as "未检出 / not
//      checked". Absence is never written as "clean".
//   2. The tool can be replaced. Its output shape is versioned
//      (`schemaVersion`) and the stable fields are named here, once, so a
//      future scanner is a change to this file rather than to the catalog
//      data or to any surface reading it.

/** The output shape this code understands. A different one is not read. */
export const SCANNER_SCHEMA = 1

/**
 * @typedef {object} CapabilityFacts
 * @property {string|null} version    Which release was scanned: the facts describe THIS version.
 * @property {string} spec            The install spec the scan labelled the package with.
 * @property {string[]} capabilities  Chip names, e.g. `shell`, `network`, `credentials`, `fs-write`.
 * @property {string[]} redLines      Sentences naming a combination worth a look, e.g. credentials+network.
 * @property {string} scannedAt       ISO 8601, UTC — when this record was produced.
 * @property {string} tool            The scanner that produced it, so a later reader knows which one.
 */

/** `owner/repo` for a catalog URL, dropping any `/tree/<ref>/<sub>` tail. */
export function repoOf(url) {
  const path = url.replace('https://github.com/', '')
  const parts = path.split('/')
  if (parts.length < 2 || parts[0] === '' || parts[1] === '') return null
  return `${parts[0]}/${parts[1]}`
}

/**
 * The subdirectory an entry lives in, or null for a whole-repo entry.
 *
 * The scanner is pointed at the subdirectory because that is what the user
 * installs (#path:/ specs): scanning the monorepo root would report the
 * capabilities of every sibling package as if they were this plugin's.
 */
export function subdirOf(url) {
  const path = url.replace('https://github.com/', '')
  if (!path.includes('/tree/')) return null
  const tail = path.split('/tree/')[1] ?? ''
  const parts = tail.split('/')
  return parts.length > 1 ? parts.slice(1).join('/') : null
}

/**
 * What to download for an entry, and what to tell the scanner it is looking at.
 *
 * Preference order is the order a user would install it in: the npm package
 * when the entry is published there (that is also what the market's install
 * button fetches), the author's prebuilt release tarball when that is the only
 * distribution, and the repository's own tarball otherwise — the same codeload
 * artifact pnpm fetches for a `github:` spec, resolved through `HEAD` so no
 * branch name or API call is needed (measured: 200 with no ref).
 *
 * @returns {{kind: 'npm'|'tarball'|'github', url: string, spec: string, version: string|null}|null}
 */
export function scanSourceFor(entry, npmMap = {}, tarballs = {}) {
  const mapped = npmMap[entry.url]
  const npmName = mapped?.npm ?? (typeof entry.npm === 'string' && entry.npm !== '' ? entry.npm : null)
  const npmVersion = mapped?.version ?? null
  if (npmName !== null && npmName !== undefined) {
    // The packument's own tarball URL shape; the version comes from the same
    // map the rest of the build reads, so this costs no extra request.
    const file = npmName.startsWith('@') ? npmName.split('/')[1] : npmName
    return {
      kind: 'npm',
      url: npmVersion === null
        ? `https://registry.npmjs.org/${npmName}`
        : `https://registry.npmjs.org/${npmName}/-/${file}-${npmVersion}.tgz`,
      spec: `npm:${npmName}${npmVersion === null ? '' : `@${npmVersion}`}`,
      version: npmVersion,
    }
  }
  const declared = tarballs[entry.url]
  const tarball = typeof declared === 'string' ? declared : declared?.tarball ?? null
  if (typeof tarball === 'string' && tarball !== '') {
    return { kind: 'tarball', url: tarball, spec: `tarball:${entry.url}`, version: null }
  }
  const repo = repoOf(entry.url)
  if (repo === null) return null
  return { kind: 'github', url: `https://codeload.github.com/${repo}/tar.gz/HEAD`, spec: `github:${repo}`, version: null }
}

/**
 * Whether a stored record still answers for this source.
 *
 * A record describes one release: when the source names a different version,
 * the facts are about a build nobody installs any more. Sources that name no
 * version (a branch tarball) can change under the same URL, so they expire by
 * age instead — `recheckDays` — while npm's per-release artifacts are cheap
 * and re-checked on the same window.
 *
 * @param {CapabilityFacts|undefined} stored
 * @param {{version: string|null}} source
 */
export function shouldRescan(stored, source, now, recheckDays) {
  if (stored === undefined) return true
  if (source.version !== null) return stored.version !== source.version
  const scannedAt = Date.parse(stored.scannedAt)
  if (!Number.isFinite(scannedAt)) return true
  return now - scannedAt > recheckDays * 86_400_000
}

/**
 * The facts to store from one scanner response, or null when it cannot be read.
 *
 * Only the stable fields are copied. `score`, `band` and `verdict` are
 * deliberately dropped: upstream says the band is not a pre-install verdict,
 * and a number that ranks plugins as safe/unsafe is the badge this whole
 * feature exists to avoid — a surface cannot render what never reaches it.
 *
 * @param {unknown} payload
 * @param {{spec: string, version: string|null, tool: string, now: string}} fallback
 * @returns {CapabilityFacts|null}
 */
export function factsFromScan(payload, fallback) {
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) return null
  if (payload.schemaVersion !== SCANNER_SCHEMA) return null
  const plugins = Array.isArray(payload.plugins) ? payload.plugins : []
  const first = plugins.find(plugin => plugin !== null && typeof plugin === 'object')
  if (first === undefined) return null
  const strings = (value) => Array.isArray(value)
    ? [...new Set(value.filter(item => typeof item === 'string' && item !== ''))]
    : []
  return {
    version: typeof first.version === 'string' && first.version !== '' ? first.version : fallback.version,
    spec: typeof first.spec === 'string' && first.spec !== '' ? first.spec : fallback.spec,
    capabilities: strings(first.capabilities),
    redLines: strings(first.redLines),
    scannedAt: fallback.now,
    tool: fallback.tool,
  }
}
