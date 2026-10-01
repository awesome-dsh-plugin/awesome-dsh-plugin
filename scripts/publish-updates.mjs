/**
 * Publish `updates.json` to npm as the `dsh-plugin-updates` package.
 *
 * The companion to publish-catalog.mjs for the update-notes data
 * (probe-updates.mjs → data/updates.json → docs/updates.json): per-repo
 * release notes and commit tails that a market needs to show "what changed"
 * between an installed version and HEAD.
 *
 * Why its OWN package rather than a second file inside `dsh-plugin-catalog`:
 * the catalog tarball is fetched by every market on every version bump, and
 * update notes are read only by a user who opened one dialog. Folding them in
 * would multiply what every consumer downloads for data most of them never
 * request — spending on the wire exactly what splitting exists to save. The
 * consumer pays nothing until it asks, and then rides the same mirrors.
 *
 * Everything is assembled in a temp directory, so this writes nothing into
 * the repository and the invariant at the top of build-site.yml holds
 * literally rather than approximately. Same trusted-publishing (OIDC) setup,
 * same content-hash skip, same date-based versioning as publish-catalog.mjs.
 */

import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const PKG = 'dsh-plugin-updates'
const BUILT = 'docs/updates.json'
const REGISTRY = 'https://registry.npmjs.org'

/** Content hash, so unchanged notes do not earn a version of their own. */
function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex')
}

/**
 * The hash carried by the newest published version, or null.
 *
 * Read from the packument rather than by downloading the tarball: the field
 * is a few bytes of metadata, and this runs on every nightly build.
 */
async function publishedHash() {
  try {
    const res = await fetch(`${REGISTRY}/${PKG}/latest`)
    if (!res.ok) return null
    const meta = await res.json()
    return typeof meta.updatesSha === 'string' ? meta.updatesSha : null
  } catch {
    // A registry that cannot be reached has not said the data is unchanged.
    // Publishing a duplicate version is a smaller mistake than silently
    // skipping a real update, and npm refuses duplicates anyway.
    return null
  }
}

/**
 * A date-based version, monotonic and legible — same scheme as the catalog.
 *
 * `YYYY.MDD.RUN` — the run number distinguishes several publishes in one day,
 * and the date part sorts correctly within and across years.
 */
export function updatesVersion(now, run) {
  const mmdd = (now.getUTCMonth() + 1) * 100 + now.getUTCDate()
  return `${now.getUTCFullYear()}.${mmdd}.${run}`
}

/** The README the package page shows. Short, because it is shipped to readers. */
function readme(version, entries) {
  return `# dsh-plugin-updates

Per-plugin update notes for the DeepSeek Harness plugin catalog — the latest
release's notes and a short tail of recent commits for every listed plugin,
probed daily and published to npm so it can be fetched from a registry mirror.

It exists so a plugin market can show "what changed" between an installed
version and HEAD without any end user touching the GitHub API, whose anonymous
budget is shared per egress IP and unusable behind common proxies.

\`\`\`js
import updates from 'dsh-plugin-updates/updates.json' with { type: 'json' }
\`\`\`

- **Entries:** ${entries}
- **Version:** \`${version}\` (\`YYYY.MDD.BUILD\`, published only when the data changes)
- **Source:** <https://github.com/awesome-dsh-plugin/awesome-dsh-plugin>
- **License:** CC0-1.0

The schema is documented by its producer, \`scripts/probe-updates.mjs\`, in the
source repository. Published automatically; do not open pull requests here.
`
}

if (!fs.existsSync(BUILT)) {
  console.error(`${BUILT} is missing — run scripts/build-site.mjs first`)
  process.exit(1)
}
const built = fs.readFileSync(BUILT)
const hash = sha256(built)
if (hash === await publishedHash()) {
  console.log(`update notes unchanged (${hash.slice(0, 12)}) — nothing to publish`)
  process.exit(0)
}

const entries = JSON.parse(built.toString()).count ?? 0
const version = updatesVersion(new Date(), process.env.GITHUB_RUN_NUMBER ?? '0')
const stage = fs.mkdtempSync(path.join(os.tmpdir(), 'dsh-updates-'))
fs.writeFileSync(path.join(stage, 'updates.json'), built)
fs.writeFileSync(path.join(stage, 'README.md'), readme(version, entries))
fs.copyFileSync('LICENSE', path.join(stage, 'LICENSE'))
fs.writeFileSync(path.join(stage, 'package.json'), JSON.stringify({
  name: PKG,
  version,
  description: `Per-plugin update notes for the DeepSeek Harness plugin catalog (${entries} entries) · 插件更新说明数据`,
  homepage: 'https://awesome-dsh-plugin.com',
  repository: {
    type: 'git',
    url: 'git+https://github.com/awesome-dsh-plugin/awesome-dsh-plugin.git',
  },
  license: 'CC0-1.0',
  keywords: ['dsh', 'dsh-plugin', 'deepseek-harness', 'deepseek', 'changelog', 'releases'],
  // The validator a consumer reads back on its next check, and what stops
  // this script republishing identical notes tomorrow.
  updatesSha: hash,
  exports: { './updates.json': './updates.json' },
  files: ['updates.json'],
}, null, 2) + '\n')

console.log(`publishing ${PKG}@${version} — ${entries} entries, sha ${hash.slice(0, 12)}`)
// `DRY_RUN=1` runs everything up to and including npm's own packing checks
// without publishing, so the whole path can be exercised by hand.
const args = ['publish', '--access', 'public']
if (process.env.DRY_RUN === '1') args.push('--dry-run')
execFileSync('npm', args, { stdio: 'inherit', cwd: stage })
