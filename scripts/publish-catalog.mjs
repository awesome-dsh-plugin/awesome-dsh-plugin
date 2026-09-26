/**
 * Publish `plugins.json` to npm as the `dsh-plugin-catalog` package.
 *
 * Why npm at all, when the catalog is already served from Pages: the market
 * reads it from mainland China, and Pages IS GitHub — measured, the response
 * carries `server: GitHub.com` and an edge region in Japan, which is why
 * "the plugin list is slow to open" and "GitHub is slow" have always been
 * the same sentence. The public GitHub proxies that make GitHub usable from
 * there refuse any hostname that is not github.com's own (measured: this
 * project's domain comes back 403), so the file cannot be carried through
 * one while it lives at that address. Published to npm it rides the same
 * mirrors every plugin already arrives on, and needs no service that did not
 * already have to work.
 *
 * It also gives the catalog a version number, which it has never had: a
 * build that ships bad data can be rolled back rather than only fixed
 * forwards.
 *
 * Why its OWN package rather than adding a file to `awesome-dsh-plugin`:
 * npm force-includes README files regardless of the `files` field, and this
 * repo's two READMEs are generated and large (514KB + 491KB). Attaching the
 * catalog to that package would have made every consumer download ~1MB of
 * prose to read a list — spending on the wire exactly what this exists to
 * save. Measured with `npm pack --dry-run`: 772KB attached, versus ~250KB
 * standing alone.
 *
 * Everything is assembled in a temp directory, so this writes nothing into
 * the repository and the invariant at the top of build-site.yml holds
 * literally rather than approximately.
 */

import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const PKG = 'dsh-plugin-catalog'
const BUILT = 'docs/plugins.json'
const REGISTRY = 'https://registry.npmjs.org'

/** Content hash, so an unchanged catalog does not earn a version of its own. */
function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex')
}

/**
 * The hash carried by the newest published version, or null.
 *
 * Read from the packument rather than by downloading the tarball: the field
 * is a few bytes of metadata, and this runs on every build.
 */
async function publishedHash() {
  try {
    const res = await fetch(`${REGISTRY}/${PKG}/latest`)
    if (!res.ok) return null
    const meta = await res.json()
    return typeof meta.catalogSha === 'string' ? meta.catalogSha : null
  } catch {
    // A registry that cannot be reached has not said the catalog is
    // unchanged. Publishing a duplicate version is a smaller mistake than
    // silently skipping a real update, and npm refuses duplicates anyway.
    return null
  }
}

/**
 * A date-based version, monotonic and legible.
 *
 * `YYYY.MDD.RUN` — the run number distinguishes several publishes in one
 * day, and the date part sorts correctly within and across years (105 for
 * Jan 5 is below 1231 for Dec 31). The month is not zero-padded because
 * semver forbids leading zeroes in numeric identifiers.
 */
export function catalogVersion(now, run) {
  const mmdd = (now.getUTCMonth() + 1) * 100 + now.getUTCDate()
  return `${now.getUTCFullYear()}.${mmdd}.${run}`
}

/** The README the package page shows. Short, because it is shipped to readers. */
function readme(version, entries) {
  return `# dsh-plugin-catalog

The DeepSeek Harness plugin catalog as a single JSON file — the same
\`plugins.json\` served at <https://awesome-dsh-plugin.com/plugins.json>,
published to npm so it can be fetched from a registry mirror.

It exists because the canonical copy is served from GitHub Pages, which is
slow to reach from some networks, and the public GitHub proxies that would
otherwise help refuse non-github.com hostnames.

\`\`\`js
import catalog from 'dsh-plugin-catalog/plugins.json' with { type: 'json' }
\`\`\`

- **Entries:** ${entries}
- **Version:** \`${version}\` (\`YYYY.MDD.BUILD\`, published only when the catalog changes)
- **Source:** <https://github.com/awesome-dsh-plugin/awesome-dsh-plugin>
- **License:** CC0-1.0

The schema is documented by its producer, \`scripts/build-site.mjs\`, in the
source repository. Published automatically; do not open pull requests here.
`
}

const built = fs.readFileSync(BUILT)
const hash = sha256(built)
if (hash === await publishedHash()) {
  console.log(`catalog unchanged (${hash.slice(0, 12)}) — nothing to publish`)
  process.exit(0)
}

const entries = JSON.parse(built.toString()).plugins.length
const version = catalogVersion(new Date(), process.env.GITHUB_RUN_NUMBER ?? '0')
const stage = fs.mkdtempSync(path.join(os.tmpdir(), 'dsh-catalog-'))
fs.writeFileSync(path.join(stage, 'plugins.json'), built)
fs.writeFileSync(path.join(stage, 'README.md'), readme(version, entries))
fs.copyFileSync('LICENSE', path.join(stage, 'LICENSE'))
fs.writeFileSync(path.join(stage, 'package.json'), JSON.stringify({
  name: PKG,
  version,
  description: `The DeepSeek Harness plugin catalog (${entries} entries) · DeepSeek Harness 插件目录`,
  homepage: 'https://awesome-dsh-plugin.com',
  repository: {
    type: 'git',
    url: 'git+https://github.com/awesome-dsh-plugin/awesome-dsh-plugin.git',
  },
  license: 'CC0-1.0',
  keywords: ['dsh', 'dsh-plugin', 'deepseek-harness', 'deepseek', 'catalog', 'registry'],
  // The validator a consumer reads back on its next check, and what stops
  // this script republishing an identical catalog tomorrow.
  catalogSha: hash,
  exports: { './plugins.json': './plugins.json' },
  files: ['plugins.json'],
}, null, 2) + '\n')

console.log(`publishing ${PKG}@${version} — ${entries} entries, sha ${hash.slice(0, 12)}`)
// `DRY_RUN=1` runs everything up to and including npm's own packing checks
// without publishing, so the whole path can be exercised by hand.
const args = ['publish', '--access', 'public']
if (process.env.DRY_RUN === '1') args.push('--dry-run')
execFileSync('npm', args, { stdio: 'inherit', cwd: stage })
