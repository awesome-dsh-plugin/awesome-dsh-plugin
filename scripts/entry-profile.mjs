#!/usr/bin/env node
/**
 * Informational ENTRY profile for the entry files a pull request changes.
 *
 * This exists to put one narrow, non-blocking signal next to a submission:
 * what `dsh-standards@1.6.8 --scope entry --entry-claim static --no-exec`
 * says about the *published npm tarball* the entry points at. It is not a
 * gate, it is not a review, and nothing here is allowed to fail a PR.
 *
 * Deliberate boundaries, each of which was a failure mode elsewhere:
 *
 *  - Published tarball only. Source repositories often ship no `lib/` (the
 *    build output is only in the npm tarball), which the ENTRY checker reads
 *    as a missing entry and reports against C-1.2. Cloning a source repo and
 *    scanning it would manufacture a finding that users never see. So the
 *    package is resolved from the entry's repository `package.json`, verified
 *    against registry.npmjs.org's repository backlink (a name alone can be
 *    squatted), fetched with `npm pack`, and unpacked.
 *  - `tarball:` is a fallback hint only. If the repository cannot be resolved
 *    to an npm package, the entry is `not_run` — never a source checkout.
 *  - No execution. `--no-exec` is given to the checker; `npm pack` runs with
 *    `--ignore-scripts`; nothing from the tarball is installed or imported.
 *  - FLOW stays `not-run` and BOOST stays `not-measured`. This profile
 *    collects neither an `dsh-flow-evidence/2` file nor a BOOST/LEV evidence
 *    card, and dsh-standards' own dsh-levels audit reports exactly those two
 *    states when given the same inputs. They are constants here so no later
 *    edit can quietly turn "never measured" into a verdict.
 *  - Every path exits 0, and an unresolved entry is reported as `not_run`
 *    rather than omitted. A missing signal is not a clean signal.
 *
 * The summary deliberately carries checker exit codes and counts, not the
 * checker's own conclusion words: exit 0 under `--scope entry` does not mean
 * the plugin runs, and this report must not be readable as an endorsement.
 *
 * Usage:
 *   node scripts/entry-profile.mjs --changed <file> [--root <dir>]
 *     [--checker <dsh-standards.mjs>] [--out-dir <dir>] [--summary <file>]
 *     [--max 3]
 *
 * The changed-file list is one repository-relative path per line, as produced
 * by `git diff --name-only --diff-filter=AM <base> <head> -- data/plugins`.
 */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { load as loadYaml } from 'js-yaml'

export const REGISTRY = 'https://registry.npmjs.org/'
export const CHECKER_PACKAGE = 'dsh-standards'
export const CHECKER_VERSION = '1.6.8'
export const MAX_ENTRIES = 3
export const CHECKER_ARGS = ['--scope', 'entry', '--entry-claim', 'static', '--no-exec']
export const SCHEMA = 'dsh-entry-profile/1'

export const FLOW = Object.freeze({
  state: 'not-run',
  reason: 'no FLOW evidence is collected by this ENTRY-only profile; dsh-levels needs a dsh-flow-evidence/2 file',
})
export const BOOST = Object.freeze({
  state: 'not-measured',
  reason: 'no BOOST/LEV evidence is supplied to this ENTRY-only profile; dsh-levels does not run benchmarks',
})

const RAW_BASE = 'https://raw.githubusercontent.com/'
const USER_AGENT = 'awesome-dsh-plugin-entry-profile'
const FETCH_TIMEOUT_MS = 20_000
const PACK_TIMEOUT_MS = 180_000
const EXTRACT_TIMEOUT_MS = 120_000
const CHECKER_TIMEOUT_MS = 120_000

const firstLine = (value) => {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim()
  return text.length > 400 ? `${text.slice(0, 397)}...` : text
}

const isInside = (root, target) => {
  const rel = path.relative(path.resolve(root), path.resolve(target))
  return rel !== '' && !rel.startsWith('..') && !path.isAbsolute(rel)
}

/**
 * Parse the GitHub repository (and optional subdirectory/ref) out of the
 * shapes entries actually contain:
 *   https://github.com/owner/repo
 *   https://github.com/owner/repo/tree/main/packages/foo
 *   https://github.com/owner/repo/tree/main/packages/foo/package.json (blob)
 *   git+https://github.com/owner/repo.git
 *   git@github.com:owner/repo.git
 * Returns null for anything that is not a GitHub repository URL. Non-GitHub
 * hosts are deliberately unsupported: the registry backlink check is defined
 * against a GitHub repo slug, and guessing at another host's identity would
 * make the anti-squatting check weaker, not broader.
 */
export function parseGithubRepoUrl(value) {
  if (typeof value !== 'string') return null
  let text = value.trim()
  if (!text) return null

  // SCP-like git URL, which `new URL` does not parse as a host.
  const scp = /^(?:ssh:\/\/)?git@github\.com[:/]([^/\s]+)\/([^/\s#?]+?)(?:\.git)?(?:[#?].*)?$/i.exec(text)
  if (scp) return githubTarget(scp[1], scp[2])

  text = text.replace(/^git\+/i, '')
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(text)) text = `https://${text}`
  let url
  try {
    url = new URL(text)
  } catch {
    return null
  }
  if (!/^(?:www\.)?github\.com$/i.test(url.hostname)) return null

  const parts = url.pathname.split('/').filter(Boolean).map(safeDecode)
  if (parts.length < 2) return null
  const repo = parts[1].replace(/\.git$/i, '')
  if (!parts[0] || !repo) return null

  let ref = null
  let subdir = null
  const kind = (parts[2] ?? '').toLowerCase()
  if (kind === 'tree' && parts.length >= 4) {
    ref = parts[3] || null
    subdir = parts.slice(4).join('/') || null
  } else if (kind === 'blob' && parts.length >= 4) {
    ref = parts[3] || null
    const file = parts.slice(4).join('/')
    const slash = file.lastIndexOf('/')
    subdir = slash > 0 ? file.slice(0, slash) : null
  }
  return githubTarget(parts[0], repo, ref, subdir)
}

function githubTarget(owner, repo, ref = null, subdir = null) {
  if (!owner || !repo) return null
  // GitHub names are URL-safe; rejecting dots-only segments here keeps a
  // hand-written entry from turning into a path traversal in the raw URL.
  if (!/^[A-Za-z0-9_.-]+$/.test(owner) || !/^[A-Za-z0-9_.-]+$/.test(repo)) return null
  if (owner === '.' || owner === '..' || repo === '.' || repo === '..') return null
  return {
    owner,
    repo,
    ref,
    subdir,
    repoSlug: `${owner}/${repo}`.toLowerCase(),
  }
}

function safeDecode(value) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

/**
 * Normalize a repository value to `owner/repo` (lowercase). Accepts the
 * registry's string/object forms, `github:owner/repo`, and bare
 * `owner/repo`. Returns null when there is no GitHub repo to compare.
 */
export function normalizeRepoSlug(value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return normalizeRepoSlug(value.url ?? value.repository ?? null)
  }
  if (typeof value !== 'string') return null
  const text = value.trim()
  if (!text) return null

  const shorthand = /^github:([^/\s]+)\/([^/\s#?]+?)(?:\.git)?$/i.exec(text)
  if (shorthand) return `${shorthand[1]}/${shorthand[2]}`.toLowerCase()

  const parsed = parseGithubRepoUrl(text)
  if (parsed) return parsed.repoSlug

  const bare = /^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?$/.exec(text)
  // A dot in the first segment would also accept host-like strings such as
  // `gitlab.com/foo`; GitHub owners cannot contain dots, so reject those.
  if (bare && !bare[1].includes('.')) return `${bare[1]}/${bare[2]}`.toLowerCase()
  return null
}

/**
 * Repository declared by the registry for a package. The manifest for the
 * version being checked wins over the packument's top-level field, which npm
 * keeps from the first publication and which can survive a repository rename.
 * If a version manifest declares a repository, a mismatching top-level value
 * is not used as a fallback — that would let a stale field defeat the check.
 */
export function registryRepositoryFor(meta, version = null) {
  const manifest = version && meta?.versions ? meta.versions[version] : null
  if (manifest && manifest.repository !== undefined && manifest.repository !== null && manifest.repository !== '') {
    return { slug: normalizeRepoSlug(manifest.repository), from: 'version' }
  }
  if (meta && meta.repository !== undefined && meta.repository !== null && meta.repository !== '') {
    return { slug: normalizeRepoSlug(meta.repository), from: 'package' }
  }
  return { slug: null, from: null }
}

/** Accept only when the registry's repository is exactly the entry's repo. */
export function registryRepositoryMatches(meta, target, version = null) {
  const expected = typeof target === 'string' ? normalizeRepoSlug(target) : target?.repoSlug ?? null
  if (!expected) return { ok: false, slug: null, reason: 'no GitHub repository to compare against' }
  const { slug, from } = registryRepositoryFor(meta, version)
  if (!slug) {
    return { ok: false, slug: null, from, reason: 'registry metadata has no GitHub repository field' }
  }
  if (slug !== expected) {
    return { ok: false, slug, from, reason: `registry repository ${slug} does not match ${expected}` }
  }
  return { ok: true, slug, from, reason: null }
}

export function latestVersion(meta) {
  const latest = meta?.['dist-tags']?.latest
  if (typeof latest === 'string' && latest && meta?.versions?.[latest]) return latest
  return null
}

/**
 * Pull a package name and optional exact version out of a release-tarball URL
 * filename. This is a hint for the second source only; the package is still
 * fetched from registry.npmjs.org, never from this URL.
 */
export function parseTarballHint(value) {
  if (typeof value !== 'string') return null
  let url
  try {
    url = new URL(value.trim())
  } catch {
    return null
  }
  if (!/^https?:$/.test(url.protocol)) return null
  const last = url.pathname.split('/').filter(Boolean).pop() ?? ''
  let file
  try {
    file = decodeURIComponent(last)
  } catch {
    return null
  }
  if (!/\.(?:tgz|tar\.gz)$/i.test(file)) return null
  const stem = file.replace(/\.(?:tgz|tar\.gz)$/i, '')
  const versioned = /^(.*?)-v?(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?)$/.exec(stem)
  if (!versioned) return { name: stem, version: null }
  return { name: versioned[1], version: versioned[2] }
}

/**
 * Map the checker's documented exit codes onto this profile's own vocabulary.
 * Exit 0 does not mean "runtime works"; it means the static ENTRY scope
 * completed without a blocking finding. That wording is kept explicit.
 */
export function classifyCheckerExit(code) {
  if (code === 0) return { status: 'checked', label: 'completed (exit 0; no blocking finding reported)' }
  if (code === 1) return { status: 'checked', label: 'completed (exit 1; blocking findings reported)' }
  if (code === 2) return { status: 'incomplete', label: 'incomplete (exit 2; a mandatory check did not run or the checker failed)' }
  return { status: 'not_run', label: `not_run (checker exit ${code === null ? 'none' : code})` }
}

export function readEntryFields(text) {
  const doc = loadYaml(text)
  if (!doc || typeof doc !== 'object' || Array.isArray(doc)) throw new Error('entry is not a YAML mapping')
  return {
    url: typeof doc.url === 'string' ? doc.url.trim() : null,
    tarball: typeof doc.tarball === 'string' ? doc.tarball.trim() : null,
  }
}

export function selectChangedEntries(lines, max = MAX_ENTRIES) {
  const all = []
  for (const line of lines ?? []) {
    const value = String(line).trim().replaceAll('\\', '/')
    if (!value || !value.endsWith('.yml')) continue
    if (!value.startsWith('data/plugins/')) continue
    if (!all.includes(value)) all.push(value)
  }
  const limit = Math.max(1, Math.min(Number.isInteger(max) ? max : MAX_ENTRIES, MAX_ENTRIES))
  return { selected: all.slice(0, limit), skipped: Math.max(0, all.length - limit), total: all.length }
}

function registryUrl(name) {
  return `${REGISTRY}${encodeURIComponent(name)}`
}

function rawUrlFor(target, ref, packagePath) {
  const refPart = String(ref || 'HEAD').split('/').map(encodeURIComponent).join('/')
  const pathPart = packagePath.split('/').map(encodeURIComponent).join('/')
  return `${RAW_BASE}${encodeURIComponent(target.owner)}/${encodeURIComponent(target.repo)}/${refPart}/${pathPart}`
}

async function request(url, fetchImpl, accept) {
  // raw.githubusercontent.com is occasionally slow enough to trip a 20s
  // timeout from a runner, and a 5xx is equally transient. One retry on a
  // transport/5xx failure keeps a healthy entry from becoming `not_run` on a
  // blip; a 404 is deterministic and is returned immediately.
  let lastError = null
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetchImpl(url, {
        headers: { accept, 'user-agent': USER_AGENT },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      })
      if (response && response.status >= 500 && attempt === 0) {
        lastError = new Error(`HTTP ${response.status}`)
        await new Promise((resolve) => setTimeout(resolve, 250))
        continue
      }
      return response
    } catch (error) {
      lastError = error
      if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 250))
    }
  }
  throw lastError ?? new Error('request failed')
}

async function fetchText(url, fetchImpl) {
  let response
  try {
    response = await request(url, fetchImpl, 'text/plain, application/json')
  } catch (error) {
    throw new Error(`${url}: ${firstLine(error?.message ?? error)}`)
  }
  if (!response || !response.ok) throw new Error(`${url}: HTTP ${response?.status ?? 'no response'}`)
  try {
    return await response.text()
  } catch (error) {
    throw new Error(`${url}: could not read the body (${firstLine(error?.message ?? error)})`)
  }
}

async function fetchJson(url, fetchImpl) {
  let response
  try {
    response = await request(url, fetchImpl, 'application/json')
  } catch (error) {
    throw new Error(`${url}: ${firstLine(error?.message ?? error)}`)
  }
  if (!response || !response.ok) throw new Error(`${url}: HTTP ${response?.status ?? 'no response'}`)
  try {
    return await response.json()
  } catch (error) {
    throw new Error(`${url}: invalid JSON (${firstLine(error?.message ?? error)})`)
  }
}

async function resolveFromUrl(entry, fetchImpl) {
  const target = parseGithubRepoUrl(entry.url)
  if (!target) return { ok: false, target: null, reason: 'url: not a parseable GitHub repository URL' }

  const ref = target.ref || 'HEAD'
  const packagePath = target.subdir ? `${target.subdir}/package.json` : 'package.json'
  let pkg
  try {
    const text = await fetchText(rawUrlFor(target, ref, packagePath), fetchImpl)
    pkg = JSON.parse(text)
  } catch (error) {
    return { ok: false, target, reason: `url: ${firstLine(error?.message ?? error)}` }
  }
  const name = typeof pkg?.name === 'string' ? pkg.name.trim() : ''
  if (!name) return { ok: false, target, reason: `url: ${packagePath} declares no package name` }

  let meta
  try {
    meta = await fetchJson(registryUrl(name), fetchImpl)
  } catch (error) {
    return { ok: false, target, name, reason: `url: ${firstLine(error?.message ?? error)}` }
  }
  if (meta?.name && meta.name !== name) {
    return { ok: false, target, name, reason: `url: registry name ${meta.name} does not match ${name}` }
  }
  const version = latestVersion(meta)
  if (!version) return { ok: false, target, name, reason: 'url: registry has no dist-tags.latest version' }
  const backlink = registryRepositoryMatches(meta, target, version)
  if (!backlink.ok) return { ok: false, target, name, version, reason: `url: ${backlink.reason}` }

  return {
    ok: true,
    source: 'url',
    name,
    version,
    repo: target.repoSlug,
    subdir: target.subdir,
    ref,
    registryRepository: backlink.slug,
  }
}

async function resolveFromTarball(entry, fetchImpl, targetHint) {
  const hint = parseTarballHint(entry.tarball)
  if (!hint) return { ok: false, target: targetHint, reason: 'tarball: not supplied or not a .tgz/.tar.gz URL' }

  const target = targetHint ?? parseGithubRepoUrl(entry.tarball)
  if (!target) {
    return { ok: false, target: null, name: hint.name, reason: 'tarball: no GitHub repository to verify the npm backlink against' }
  }

  let meta
  try {
    meta = await fetchJson(registryUrl(hint.name), fetchImpl)
  } catch (error) {
    return { ok: false, target, name: hint.name, reason: `tarball: ${firstLine(error?.message ?? error)}` }
  }
  if (meta?.name && meta.name !== hint.name) {
    return { ok: false, target, name: hint.name, reason: `tarball: registry name ${meta.name} does not match ${hint.name}` }
  }

  let version = hint.version
  if (version) {
    if (!meta?.versions?.[version]) {
      return { ok: false, target, name: hint.name, version, reason: `tarball: ${hint.name}@${version} is not published on the registry` }
    }
  } else {
    version = latestVersion(meta)
    if (!version) return { ok: false, target, name: hint.name, reason: 'tarball: registry has no dist-tags.latest version' }
  }

  const backlink = registryRepositoryMatches(meta, target, version)
  if (!backlink.ok) return { ok: false, target, name: hint.name, version, reason: `tarball: ${backlink.reason}` }

  return {
    ok: true,
    source: 'tarball',
    name: hint.name,
    version,
    repo: target.repoSlug,
    subdir: null,
    ref: null,
    registryRepository: backlink.slug,
  }
}

/**
 * Resolve one entry to a published npm package. URL first, `tarball:` second,
 * `not_run` when neither works. There is intentionally no third source: a
 * source checkout is exactly what this profile is not allowed to do.
 */
export async function resolveEntryTarget(entry, { fetchImpl = globalThis.fetch } = {}) {
  const urlAttempt = await resolveFromUrl(entry, fetchImpl)
  if (urlAttempt.ok) return urlAttempt
  const tarballAttempt = await resolveFromTarball(entry, fetchImpl, urlAttempt.target ?? null)
  if (tarballAttempt.ok) return tarballAttempt
  return {
    ok: false,
    reason: [urlAttempt.reason, tarballAttempt.reason].filter(Boolean).join('; '),
    attempts: { url: urlAttempt.reason ?? null, tarball: tarballAttempt.reason ?? null },
  }
}

/**
 * Read the installed checker's own package.json, when there is one. The
 * workflow pins 1.6.8 and asserts `--version`; this is the in-process guard
 * for a local run or a drifted prefix, so the report cannot say 1.6.8 while a
 * different checker produced it.
 */
export function checkerVersionAt(checkerPath) {
  if (typeof checkerPath !== 'string' || !checkerPath) return null
  try {
    const pkg = JSON.parse(fs.readFileSync(path.resolve(path.dirname(checkerPath), '..', 'package.json'), 'utf8'))
    return pkg?.name === CHECKER_PACKAGE && typeof pkg.version === 'string' ? pkg.version : null
  } catch {
    return null
  }
}

export function extractCounts(report) {
  const coverage = report?.coverage ?? {}
  const entry = coverage.entryBlocking ?? null
  return {
    blocking: Array.isArray(report?.buckets?.blocking) ? report.buckets.blocking.length : null,
    hygiene: Array.isArray(report?.buckets?.hygiene) ? report.buckets.hygiene.length : null,
    checked: Number.isInteger(coverage.checked) ? coverage.checked : null,
    total: Number.isInteger(coverage.total) ? coverage.total : null,
    notChecked: Number.isInteger(coverage.na) || Number.isInteger(coverage.notRun)
      ? (coverage.na ?? 0) + (coverage.notRun ?? 0)
      : null,
    partial: Number.isInteger(coverage.partial) ? coverage.partial : null,
    warnings: Number.isInteger(coverage.warn) ? coverage.warn : null,
    entry: entry && Array.isArray(entry.checked)
      ? {
          required: Number.isInteger(entry.required) ? entry.required : null,
          checked: entry.checked.length,
          failed: Array.isArray(entry.failed) ? entry.failed.length : null,
          notChecked: Array.isArray(entry.notChecked) ? entry.notChecked.length : null,
        }
      : null,
  }
}

function readTarballEntries(tgz) {
  const list = spawnSync('tar', ['-tzf', tgz], {
    encoding: 'utf8',
    timeout: EXTRACT_TIMEOUT_MS,
    maxBuffer: 32 * 1024 * 1024,
  })
  if (list.error) throw new Error(`could not list ${path.basename(tgz)}: ${firstLine(list.error.message)}`)
  if (list.status !== 0) throw new Error(`could not list ${path.basename(tgz)}: ${firstLine(list.stderr)}`)
  return String(list.stdout ?? '').split(/\r?\n/).filter(Boolean)
}

function packAndUnpack(candidate, workRoot) {
  const packDir = path.join(workRoot, 'pack')
  const extractDir = path.join(workRoot, 'unpacked')
  fs.mkdirSync(packDir, { recursive: true })
  fs.mkdirSync(extractDir, { recursive: true })

  const spec = `${candidate.name}@${candidate.version}`
  // Run npm from the scratch pack directory, not the checkout: npm reads
  // `.npmrc` from its cwd, and a pull-request-supplied `.npmrc` must not be
  // able to redirect this fetch away from registry.npmjs.org.
  const packed = spawnSync(
    'npm',
    ['pack', '--ignore-scripts', '--registry', REGISTRY, '--pack-destination', packDir, '--', spec],
    {
      cwd: packDir,
      encoding: 'utf8',
      timeout: PACK_TIMEOUT_MS,
      maxBuffer: 16 * 1024 * 1024,
      env: {
        ...process.env,
        npm_config_registry: REGISTRY,
        npm_config_update_notifier: 'false',
        npm_config_audit: 'false',
        npm_config_fund: 'false',
        NO_COLOR: '1',
      },
    },
  )
  if (packed.error) throw new Error(`npm pack ${spec} did not start: ${firstLine(packed.error.message)}`)
  if (packed.status !== 0) throw new Error(`npm pack ${spec} exited ${packed.status}: ${firstLine(packed.stderr)}`)

  const filename = String(packed.stdout ?? '').trim().split(/\r?\n/).filter(Boolean).pop() ?? ''
  if (!filename.endsWith('.tgz')) throw new Error(`npm pack ${spec} printed no tarball name`)
  const tgz = path.resolve(packDir, filename)
  if (!tgz.startsWith(`${path.resolve(packDir)}${path.sep}`)) throw new Error(`npm pack ${spec} printed an unsafe filename`)
  if (!fs.existsSync(tgz)) throw new Error(`npm pack ${spec} said it wrote ${filename}, but the file is absent`)

  // A published tarball is third-party input. Reject absolute paths and `..`
  // before extraction rather than trusting tar to contain them.
  const entries = readTarballEntries(tgz)
  const unsafe = entries.find((name) => name.startsWith('/') || name.split('/').includes('..'))
  if (unsafe) throw new Error(`tarball ${filename} contains an unsafe path: ${firstLine(unsafe)}`)

  const untar = spawnSync('tar', ['-xzf', tgz, '-C', extractDir, '--no-same-owner', '--no-same-permissions'], {
    encoding: 'utf8',
    timeout: EXTRACT_TIMEOUT_MS,
    maxBuffer: 16 * 1024 * 1024,
  })
  if (untar.error) throw new Error(`could not unpack ${filename}: ${firstLine(untar.error.message)}`)
  if (untar.status !== 0) throw new Error(`could not unpack ${filename}: ${firstLine(untar.stderr)}`)

  const packageDir = path.join(extractDir, 'package')
  if (!fs.existsSync(path.join(packageDir, 'package.json'))) {
    throw new Error(`${filename} did not contain package/package.json`)
  }
  return { tgz, filename, packageDir }
}

/**
 * Run the pinned checker against an unpacked package. The report file is the
 * only output kept; the checker's own conclusion fields are not copied into
 * this profile's summary.
 */
export function runCheckerOnDir(packageDir, checkerPath, workDir) {
  const reportPath = path.join(workDir, 'checker-report.json')
  // A reused work directory must not let the previous entry's report answer
  // for a checker that just failed to write one.
  fs.rmSync(reportPath, { force: true })
  const result = spawnSync(
    process.execPath,
    [checkerPath, packageDir, ...CHECKER_ARGS, '--format', 'json', '--out', reportPath],
    {
      encoding: 'utf8',
      timeout: CHECKER_TIMEOUT_MS,
      maxBuffer: 32 * 1024 * 1024,
      env: { ...process.env, NO_COLOR: '1', DSH_CHECKER_BRAND: `${CHECKER_PACKAGE} ${CHECKER_VERSION}` },
    },
  )
  if (result.error) {
    return {
      ...classifyCheckerExit(null),
      status: 'not_run',
      exitCode: null,
      label: `not_run (checker did not complete: ${firstLine(result.error.message)})`,
      counts: null,
    }
  }
  const exitCode = result.status
  const classification = classifyCheckerExit(exitCode)
  let report = null
  try {
    report = JSON.parse(fs.readFileSync(reportPath, 'utf8'))
  } catch {
    // A checker that exits without a readable report has not produced evidence.
  }
  if (!report) {
    return {
      ...classification,
      status: 'not_run',
      exitCode,
      label: `not_run (checker wrote no readable report; exit ${exitCode === null ? 'none' : exitCode})`,
      counts: null,
    }
  }
  return {
    ...classification,
    exitCode,
    counts: extractCounts(report),
    stderr: firstLine(result.stderr),
  }
}

async function profileEntry(file, context) {
  const base = {
    file,
    status: 'not_run',
    source: null,
    repo: null,
    package: null,
    checker: null,
    flow: FLOW.state,
    boost: BOOST.state,
    reason: null,
  }

  const absolute = path.resolve(context.root, file)
  if (!isInside(context.root, absolute)) return { ...base, reason: 'entry path escapes the repository root' }

  let text
  try {
    text = fs.readFileSync(absolute, 'utf8')
  } catch (error) {
    return { ...base, reason: `entry file is not readable: ${firstLine(error?.code ?? error?.message ?? error)}` }
  }

  let entry
  try {
    entry = readEntryFields(text)
  } catch (error) {
    return { ...base, reason: `entry YAML does not parse: ${firstLine(error?.message ?? error)}` }
  }

  let candidate
  try {
    candidate = await resolveEntryTarget(entry, { fetchImpl: context.fetchImpl })
  } catch (error) {
    return { ...base, reason: `resolution failed: ${firstLine(error?.message ?? error)}` }
  }
  if (!candidate.ok) return { ...base, reason: candidate.reason }

  const resolved = {
    ...base,
    source: candidate.source,
    repo: candidate.repo,
    package: { name: candidate.name, version: candidate.version },
  }

  if (!context.checkerPath || !fs.existsSync(context.checkerPath)) {
    return { ...resolved, reason: `checker not found at ${context.checkerPath || '(no path supplied)'}` }
  }
  const installedVersion = checkerVersionAt(context.checkerPath)
  if (installedVersion && installedVersion !== CHECKER_VERSION) {
    return {
      ...resolved,
      reason: `checker at ${context.checkerPath} is ${CHECKER_PACKAGE}@${installedVersion}, not the pinned ${CHECKER_VERSION}`,
    }
  }

  const workRoot = fs.mkdtempSync(path.join(context.workRoot, 'entry-'))
  try {
    let packed
    try {
      packed = packAndUnpack(candidate, workRoot)
    } catch (error) {
      return { ...resolved, reason: firstLine(error?.message ?? error) }
    }

    const checker = runCheckerOnDir(packed.packageDir, context.checkerPath, workRoot)
    const checkerRecord = {
      exit_code: checker.exitCode,
      counts: checker.counts,
    }
    if (checker.status === 'not_run') {
      return { ...resolved, checker: checkerRecord, reason: checker.label }
    }
    return {
      ...resolved,
      status: checker.status,
      checker: { ...checkerRecord, label: checker.label },
      reason: checker.status === 'incomplete' ? checker.label : null,
    }
  } finally {
    fs.rmSync(workRoot, { recursive: true, force: true })
  }
}

function countLine(counts) {
  if (!counts) return null
  const parts = []
  if (counts.blocking !== null) parts.push(`blocking findings: ${counts.blocking}`)
  if (counts.hygiene !== null) parts.push(`hygiene warnings: ${counts.hygiene}`)
  if (counts.checked !== null && counts.total !== null) parts.push(`checked: ${counts.checked}/${counts.total}`)
  if (counts.notChecked !== null) parts.push(`NA/not-run: ${counts.notChecked}`)
  if (counts.partial !== null) parts.push(`partial: ${counts.partial}`)
  return parts.length ? parts.join(' · ') : null
}

function entryPrerequisiteLine(counts) {
  if (!counts?.entry) return null
  const parts = []
  if (counts.entry.required !== null) parts.push(`${counts.entry.checked}/${counts.entry.required} checked`)
  else parts.push(`${counts.entry.checked} checked`)
  if (counts.entry.failed !== null) parts.push(`${counts.entry.failed} failed`)
  if (counts.entry.notChecked !== null) parts.push(`${counts.entry.notChecked} not checked`)
  return `ENTRY prerequisites: ${parts.join(', ')}`
}

export function renderSummary(result) {
  const lines = []
  lines.push('## Informational ENTRY profile (non-blocking)')
  lines.push('')
  lines.push(`- Checker: \`${CHECKER_PACKAGE}@${CHECKER_VERSION}\` with \`${CHECKER_ARGS.join(' ')}\`.`)
  lines.push('- Source: the published npm tarball only. The repository is never cloned and the plugin is never executed.')
  lines.push('- This workflow posts no comment and creates no check run via the API; the job itself is one status check. It does not gate merge. Delete `.github/workflows/entry-profile.yml` to remove it.')
  lines.push('')

  if (result.topLevelNotRun) {
    lines.push(`not_run: ${result.topLevelNotRun}`)
    lines.push('')
  }

  if (!result.entries.length) {
    if (!result.topLevelNotRun) {
      lines.push(result.totalChanged === 0
        ? 'No added or modified `data/plugins/*.yml` files in this pull request.'
        : 'No entry files were profiled.')
      lines.push('')
    }
  } else {
    const limit = Number.isInteger(result.limit) ? result.limit : MAX_ENTRIES
    lines.push(`Changed entry files: ${result.totalChanged}; profiled: ${result.entries.length}; not profiled (${limit}-entry limit): ${result.skipped}.`)
    for (const entry of result.entries) {
      lines.push('')
      lines.push(`### \`${entry.file}\``)
      if (entry.package) {
        lines.push(`- npm package: \`${entry.package.name}@${entry.package.version}\` (source: ${entry.source})`)
        lines.push(`- repository: \`${entry.repo}\` (registry backlink matched)`)
      }
      if (entry.status === 'not_run') {
        lines.push(`- not_run: ${entry.reason ?? 'no reason recorded'}`)
      } else {
        const exitCode = entry.checker?.exit_code
        const label = entry.checker?.label ?? classifyCheckerExit(exitCode).label
        lines.push(`- checker exit: ${exitCode} — ${label}`)
        const countsLine = countLine(entry.checker?.counts)
        if (countsLine) lines.push(`- ${countsLine}`)
        const prerequisites = entryPrerequisiteLine(entry.checker?.counts)
        if (prerequisites) lines.push(`- ${prerequisites}`)
        if (entry.status === 'incomplete') lines.push(`- checker status: ${entry.reason ?? 'incomplete'}`)
      }
      lines.push(`- FLOW: ${entry.flow} — ${FLOW.reason}`)
      lines.push(`- BOOST: ${entry.boost} — ${BOOST.reason}`)
    }
    lines.push('')
  }

  lines.push(`FLOW: ${result.flow.state} — ${result.flow.reason}`)
  lines.push(`BOOST: ${result.boost.state} — ${result.boost.reason}`)
  lines.push('')
  lines.push('Informational only. This profile publishes no verdict for FLOW or BOOST.')
  return `${lines.join('\n')}\n`
}

export function buildArtifact(result) {
  return {
    schema: SCHEMA,
    generated_at: result.generatedAt,
    informational: true,
    blocking: false,
    checker: {
      package: CHECKER_PACKAGE,
      version: CHECKER_VERSION,
      scope: 'entry',
      entry_claim: 'static',
      no_exec: true,
      argv: CHECKER_ARGS,
    },
    registry: REGISTRY,
    source_policy: 'published npm tarball only; no repository clone; no plugin execution',
    flow: { state: result.flow.state, reason: result.flow.reason },
    boost: { state: result.boost.state, reason: result.boost.reason },
    total_changed: result.totalChanged,
    limit: Number.isInteger(result.limit) ? result.limit : MAX_ENTRIES,
    skipped: result.skipped,
    top_level_not_run: result.topLevelNotRun,
    entries: result.entries.map((entry) => ({
      file: entry.file,
      status: entry.status,
      reason: entry.reason,
      source: entry.source,
      repo: entry.repo,
      package: entry.package,
      checker: entry.checker,
      flow: entry.flow,
      boost: entry.boost,
    })),
  }
}

function writeOutputs(result, outDir, summaryFile) {
  const summary = renderSummary(result)
  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(path.join(outDir, 'entry-profile.json'), `${JSON.stringify(buildArtifact(result), null, 2)}\n`)
  fs.writeFileSync(path.join(outDir, 'summary.md'), summary)
  if (summaryFile) {
    const prefix = fs.existsSync(summaryFile) && fs.statSync(summaryFile).size > 0 ? '\n' : ''
    fs.appendFileSync(summaryFile, `${prefix}${summary}`)
  }
  process.stdout.write(summary)
  return { outDir, summaryPath: path.join(outDir, 'summary.md'), jsonPath: path.join(outDir, 'entry-profile.json') }
}

function readChangedList(file) {
  if (!file) return { lines: [], missing: true, reason: 'no changed-file list was supplied' }
  try {
    return { lines: fs.readFileSync(file, 'utf8').split(/\r?\n/), missing: false, reason: null }
  } catch (error) {
    return { lines: [], missing: true, reason: `changed-file list ${file} is not readable (${firstLine(error?.code ?? error?.message ?? error)})` }
  }
}

function parseArgs(argv) {
  const options = {
    changed: null,
    root: process.cwd(),
    checker: null,
    outDir: path.join(process.env.RUNNER_TEMP || os.tmpdir(), 'entry-profile'),
    summary: process.env.GITHUB_STEP_SUMMARY || null,
    max: MAX_ENTRIES,
    help: false,
  }
  const valueFor = (arg, index) => {
    const equals = arg.indexOf('=')
    if (equals !== -1) return { value: arg.slice(equals + 1), next: index }
    const next = argv[index + 1]
    if (next === undefined) throw new Error(`${arg} needs a value`)
    return { value: next, next: index + 1 }
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--help' || arg === '-h') {
      options.help = true
      continue
    }
    if (arg === '--changed' || arg.startsWith('--changed=')) {
      const parsed = valueFor(arg, index)
      options.changed = parsed.value
      index = parsed.next
    } else if (arg === '--root' || arg.startsWith('--root=')) {
      const parsed = valueFor(arg, index)
      options.root = parsed.value
      index = parsed.next
    } else if (arg === '--checker' || arg.startsWith('--checker=')) {
      const parsed = valueFor(arg, index)
      options.checker = parsed.value
      index = parsed.next
    } else if (arg === '--out-dir' || arg.startsWith('--out-dir=')) {
      const parsed = valueFor(arg, index)
      options.outDir = parsed.value
      index = parsed.next
    } else if (arg === '--summary' || arg.startsWith('--summary=')) {
      const parsed = valueFor(arg, index)
      options.summary = parsed.value
      index = parsed.next
    } else if (arg === '--max' || arg.startsWith('--max=')) {
      const parsed = valueFor(arg, index)
      options.max = Number.parseInt(parsed.value, 10)
      index = parsed.next
    } else {
      throw new Error(`unknown option: ${arg}`)
    }
  }

  if (!Number.isInteger(options.max) || options.max < 1) options.max = MAX_ENTRIES
  options.max = Math.min(options.max, MAX_ENTRIES)
  options.root = path.resolve(options.root)
  options.outDir = path.resolve(options.outDir)
  options.checker = options.checker
    ? path.resolve(options.checker)
    : path.join(options.root, 'node_modules', CHECKER_PACKAGE, 'bin', 'dsh-standards.mjs')
  return options
}

export function usage() {
  return `Usage: node scripts/entry-profile.mjs --changed <file> [options]

  --changed <file>   repository-relative paths, one per line (required)
  --root <dir>       checkout root (default: cwd)
  --checker <file>   dsh-standards bin (default: <root>/node_modules/${CHECKER_PACKAGE}/bin/dsh-standards.mjs)
  --out-dir <dir>    where entry-profile.json and summary.md are written
  --summary <file>   append the Markdown summary to this file (default: GITHUB_STEP_SUMMARY)
  --max <n>          entries to profile, capped at ${MAX_ENTRIES}

The profile is informational: it always exits 0 and reports an unresolved
entry as not_run. It never clones a repository and never runs plugin code.`
}

export async function buildResult(options, { fetchImpl = globalThis.fetch, workRoot = null } = {}) {
  const changed = readChangedList(options.changed)
  const selection = changed.missing ? { selected: [], skipped: 0, total: 0 } : selectChangedEntries(changed.lines, options.max)
  const entries = []
  let topLevelNotRun = changed.missing ? changed.reason : null

  if (!topLevelNotRun) {
    const scratch = workRoot ?? fs.mkdtempSync(path.join(os.tmpdir(), 'entry-profile-'))
    try {
      for (const file of selection.selected) {
        entries.push(await profileEntry(file, {
          root: options.root,
          checkerPath: options.checker,
          fetchImpl,
          workRoot: scratch,
        }))
      }
    } finally {
      if (!workRoot) fs.rmSync(scratch, { recursive: true, force: true })
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    entries,
    skipped: selection.skipped,
    totalChanged: changed.missing ? 0 : selection.total,
    limit: Math.max(1, Math.min(Number.isInteger(options.max) ? options.max : MAX_ENTRIES, MAX_ENTRIES)),
    topLevelNotRun,
    flow: { state: FLOW.state, reason: FLOW.reason },
    boost: { state: BOOST.state, reason: BOOST.reason },
  }
}

/**
 * CLI entry point. Every branch returns 0: this is an informational job, and
 * a profile that cannot run must say `not_run` rather than fail a pull
 * request. The workflow still marks the step continue-on-error as a second
 * layer, but this function is written not to need it.
 */
export async function runCli(argv = process.argv.slice(2)) {
  let options = null
  try {
    options = parseArgs(argv)
    if (options.help) {
      process.stdout.write(`${usage()}\n`)
      return 0
    }
    const result = await buildResult(options)
    writeOutputs(result, options.outDir, options.summary)
    return 0
  } catch (error) {
    const message = firstLine(error?.message ?? error)
    const outDir = options?.outDir ?? path.join(process.env.RUNNER_TEMP || os.tmpdir(), 'entry-profile')
    const summary = options?.summary ?? process.env.GITHUB_STEP_SUMMARY ?? null
    try {
      writeOutputs({
        generatedAt: new Date().toISOString(),
        entries: [],
        skipped: 0,
        totalChanged: 0,
        topLevelNotRun: `profile failed: ${message}`,
        flow: { state: FLOW.state, reason: FLOW.reason },
        boost: { state: BOOST.state, reason: BOOST.reason },
      }, outDir, summary)
    } catch {
      // A summary we cannot write must not turn into a failing step either.
    }
    process.stderr.write(`entry-profile: not_run — ${message}\n`)
    return 0
  }
}

const self = fileURLToPath(import.meta.url)
const invoked = process.argv[1] ? path.resolve(process.argv[1]) : null
let isCli = false
try {
  isCli = Boolean(invoked && fs.existsSync(invoked) && fs.realpathSync(self) === fs.realpathSync(invoked))
} catch {
  isCli = false
}
if (isCli) {
  try {
    await runCli()
  } catch {
    // runCli already reports and exits 0; this is the belt-and-braces path for
    // a broken pipe or an unanticipated throw in that reporting.
  }
  process.exitCode = 0
}
