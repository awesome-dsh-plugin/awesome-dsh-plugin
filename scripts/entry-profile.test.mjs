import assert from 'node:assert/strict'
import test from 'node:test'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import {
  BOOST,
  CHECKER_ARGS,
  FLOW,
  MAX_ENTRIES,
  checkerVersionAt,
  classifyCheckerExit,
  extractCounts,
  normalizeRepoSlug,
  parseGithubRepoUrl,
  parseTarballHint,
  readEntryFields,
  registryRepositoryMatches,
  renderSummary,
  resolveEntryTarget,
  runCheckerOnDir,
  selectChangedEntries,
} from './entry-profile.mjs'

const REPO_ROOT = fileURLToPath(new URL('..', import.meta.url))
const CLI = join(REPO_ROOT, 'scripts', 'entry-profile.mjs')

function tempDir(t, prefix) {
  const dir = mkdtempSync(join(tmpdir(), prefix))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  return dir
}

function response(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async text() {
      return typeof body === 'string' ? body : JSON.stringify(body)
    },
    async json() {
      return typeof body === 'string' ? JSON.parse(body) : body
    },
  }
}

/** Small fetch double: routes in order, records every URL it was asked for. */
function fakeFetch(routes) {
  const calls = []
  const impl = async (url) => {
    const text = String(url)
    calls.push(text)
    for (const route of routes) {
      const matches = route.match instanceof RegExp ? route.match.test(text) : text.includes(route.match)
      if (!matches) continue
      const body = typeof route.body === 'function' ? await route.body(text) : route.body
      return response(body, route.status ?? 200)
    }
    return response('not found', 404)
  }
  impl.calls = calls
  return impl
}

function registryDoc({ name = 'pkg', version = '1.2.3', repo = 'https://github.com/o/r' } = {}) {
  return {
    name,
    'dist-tags': { latest: version },
    versions: {
      [version]: { name, version, repository: { type: 'git', url: `git+${repo}.git` } },
    },
    repository: { type: 'git', url: `git+${repo}.git` },
  }
}

test('parseGithubRepoUrl: repository, ref, and subdirectory shapes', () => {
  assert.deepEqual(parseGithubRepoUrl('https://github.com/Owner/Repo'), {
    owner: 'Owner',
    repo: 'Repo',
    ref: null,
    subdir: null,
    repoSlug: 'owner/repo',
  })
  assert.equal(parseGithubRepoUrl('https://github.com/owner/repo.git').repoSlug, 'owner/repo')
  assert.equal(parseGithubRepoUrl('https://github.com/owner/repo/').repoSlug, 'owner/repo')
  assert.equal(parseGithubRepoUrl('https://github.com/owner/repo?tab=readme#top').repoSlug, 'owner/repo')

  const tree = parseGithubRepoUrl('https://github.com/owner/repo/tree/main/packages/foo')
  assert.equal(tree.ref, 'main')
  assert.equal(tree.subdir, 'packages/foo')
  assert.equal(parseGithubRepoUrl('https://github.com/owner/repo/tree/main/').subdir, null)
  assert.equal(parseGithubRepoUrl('https://github.com/owner/repo/tree/main').ref, 'main')

  const blob = parseGithubRepoUrl('https://github.com/owner/repo/blob/main/packages/foo/package.json')
  assert.equal(blob.subdir, 'packages/foo')
  assert.equal(parseGithubRepoUrl('https://github.com/owner/repo/blob/main/package.json').subdir, null)

  assert.equal(parseGithubRepoUrl('git+https://github.com/owner/repo.git').repoSlug, 'owner/repo')
  assert.equal(parseGithubRepoUrl('git@github.com:owner/repo.git').repoSlug, 'owner/repo')
  assert.equal(parseGithubRepoUrl('ssh://git@github.com/owner/repo.git').repoSlug, 'owner/repo')

  assert.equal(parseGithubRepoUrl('https://gitlab.com/owner/repo'), null)
  assert.equal(parseGithubRepoUrl('https://github.com/owner'), null)
  assert.equal(parseGithubRepoUrl('https://github.com/owner/..%2Frepo'), null)
  assert.equal(parseGithubRepoUrl('owner/repo'), null)
  assert.equal(parseGithubRepoUrl(''), null)
  assert.equal(parseGithubRepoUrl(null), null)
})

test('normalizeRepoSlug: registry repository forms normalize to owner/repo', () => {
  assert.equal(normalizeRepoSlug({ type: 'git', url: 'git+https://github.com/Foo/Bar.git' }), 'foo/bar')
  assert.equal(normalizeRepoSlug('git+https://github.com/Foo/Bar.git'), 'foo/bar')
  assert.equal(normalizeRepoSlug('git@github.com:Foo/Bar.git'), 'foo/bar')
  assert.equal(normalizeRepoSlug('github:Foo/Bar'), 'foo/bar')
  assert.equal(normalizeRepoSlug('Foo/Bar'), 'foo/bar')
  assert.equal(normalizeRepoSlug('https://github.com/foo/bar/tree/main/sub'), 'foo/bar')

  assert.equal(normalizeRepoSlug('https://gitlab.com/foo/bar'), null)
  assert.equal(normalizeRepoSlug('gitlab.com/foo'), null)
  assert.equal(normalizeRepoSlug(''), null)
  assert.equal(normalizeRepoSlug(null), null)
  assert.equal(normalizeRepoSlug({ url: null }), null)
})

test('registryRepositoryMatches: exact backlink accepted, lookalikes and missing fields refused', () => {
  const target = { repoSlug: 'owner/repo' }
  const accept = (meta, version) => registryRepositoryMatches(meta, target, version)

  assert.equal(accept(registryDoc({ repo: 'https://github.com/owner/repo' }), '1.2.3').ok, true)
  assert.equal(accept({
    repository: 'https://github.com/Owner/Repo',
    versions: { '1.2.3': {} },
  }, '1.2.3').ok, true)

  // A lookalike is not the same repository: `owner/repo-evil` must not pass a
  // substring check.
  assert.equal(accept(registryDoc({ repo: 'https://github.com/owner/repo-evil' }), '1.2.3').ok, false)
  assert.equal(accept(registryDoc({ repo: 'https://github.com/other/repo' }), '1.2.3').ok, false)
  assert.equal(accept({ name: 'pkg' }, '1.2.3').ok, false)
  assert.equal(accept({ repository: 'https://gitlab.com/owner/repo' }, '1.2.3').ok, false)

  // The version manifest wins over a stale packument-level field, in both
  // directions: a good version repository is accepted even when the old
  // top-level value is wrong, and a wrong version repository is never rescued
  // by a correct top-level value.
  const renamed = {
    repository: 'https://github.com/stale/old',
    versions: { '1.2.3': { repository: 'https://github.com/owner/repo' } },
  }
  assert.equal(accept(renamed, '1.2.3').ok, true)
  const contradictory = {
    repository: 'https://github.com/owner/repo',
    versions: { '1.2.3': { repository: 'https://github.com/other/repo' } },
  }
  assert.equal(accept(contradictory, '1.2.3').ok, false)
})

test('parseTarballHint: release filenames are a hint, not a download source', () => {
  assert.deepEqual(
    parseTarballHint('https://github.com/owner/repo/releases/download/v0.4.0/dsh-project-memory-0.4.0.tgz'),
    { name: 'dsh-project-memory', version: '0.4.0' },
  )
  assert.deepEqual(
    parseTarballHint('https://registry.npmjs.org/dsh-pet/-/dsh-pet-0.4.5.tgz'),
    { name: 'dsh-pet', version: '0.4.5' },
  )
  assert.deepEqual(parseTarballHint('https://example.com/pkg-1.0.0-beta.1.tar.gz'),
    { name: 'pkg', version: '1.0.0-beta.1' })
  assert.deepEqual(parseTarballHint('https://example.com/pkg.tgz'), { name: 'pkg', version: null })
  assert.equal(parseTarballHint('https://example.com/pkg.zip'), null)
  assert.equal(parseTarballHint('ftp://example.com/pkg.tgz'), null)
  assert.equal(parseTarballHint(null), null)
})

test('resolveEntryTarget: url source is preferred and tarball is not fetched as a package', async t => {
  const fetchImpl = fakeFetch([
    { match: /raw\.githubusercontent\.com\/o\/r\/main\/packages\/foo\/package\.json/, body: { name: 'pkg' } },
    { match: 'https://registry.npmjs.org/pkg', body: registryDoc() },
  ])
  const result = await resolveEntryTarget({
    url: 'https://github.com/o/r/tree/main/packages/foo',
    tarball: 'https://github.com/o/r/releases/download/v9.9.9/pkg-9.9.9.tgz',
  }, { fetchImpl })

  assert.equal(result.ok, true)
  assert.equal(result.source, 'url')
  assert.equal(result.name, 'pkg')
  assert.equal(result.version, '1.2.3')
  assert.equal(result.repo, 'o/r')
  assert.equal(result.subdir, 'packages/foo')
  assert.equal(fetchImpl.calls.length, 2, fetchImpl.calls.join('\n'))
  assert.match(fetchImpl.calls[0], /raw\.githubusercontent\.com/)
  assert.match(fetchImpl.calls[1], /registry\.npmjs\.org/)
})

test('resolveEntryTarget: tarball hint is the second source when package.json is absent', async () => {
  const fetchImpl = fakeFetch([
    { match: 'https://registry.npmjs.org/pkg', body: registryDoc({ version: '2.0.0' }) },
  ])
  const result = await resolveEntryTarget({
    url: 'https://github.com/o/r',
    tarball: 'https://github.com/o/r/releases/download/v2.0.0/pkg-2.0.0.tgz',
  }, { fetchImpl })

  assert.equal(result.ok, true)
  assert.equal(result.source, 'tarball')
  assert.equal(result.name, 'pkg')
  assert.equal(result.version, '2.0.0')
  assert.equal(result.repo, 'o/r')
  assert.equal(fetchImpl.calls.length, 2, fetchImpl.calls.join('\n'))
  assert.match(fetchImpl.calls[0], /raw\.githubusercontent\.com/)
  assert.match(fetchImpl.calls[1], /registry\.npmjs\.org\/pkg/)
})

test('resolveEntryTarget: a rejected url backlink falls through to a matching tarball', async () => {
  const fetchImpl = fakeFetch([
    { match: /raw\.githubusercontent\.com\/o\/r\/HEAD\/package\.json/, body: { name: 'squatted' } },
    { match: 'https://registry.npmjs.org/squatted', body: registryDoc({ name: 'squatted', repo: 'https://github.com/other/repo' }) },
    { match: 'https://registry.npmjs.org/pkg', body: registryDoc({ version: '3.0.0' }) },
  ])
  const result = await resolveEntryTarget({
    url: 'https://github.com/o/r',
    tarball: 'https://github.com/o/r/releases/download/v3.0.0/pkg-3.0.0.tgz',
  }, { fetchImpl })

  assert.equal(result.ok, true)
  assert.equal(result.source, 'tarball')
  assert.equal(result.name, 'pkg')
  assert.equal(result.version, '3.0.0')
  assert.equal(fetchImpl.calls.filter((url) => url.includes('registry.npmjs.org')).length, 2)
})

test('resolveEntryTarget: unresolved entries are not_run, with both attempted sources named', async () => {
  const noNetwork = fakeFetch([])
  const foreign = await resolveEntryTarget({ url: 'https://gitlab.com/a/b', tarball: null }, { fetchImpl: noNetwork })
  assert.equal(foreign.ok, false)
  assert.match(foreign.reason, /url:/)
  assert.match(foreign.reason, /tarball:/)
  assert.equal(noNetwork.calls.length, 0)

  const missing = await resolveEntryTarget({
    url: 'https://github.com/o/r',
    tarball: 'https://example.com/download.tgz',
  }, { fetchImpl: fakeFetch([]) })
  assert.equal(missing.ok, false)
  assert.match(missing.reason, /url:/)
  assert.match(missing.reason, /tarball:/)
})

test('resolveEntryTarget: tarball alone supplies the GitHub target and exact version', async () => {
  const fetchImpl = fakeFetch([
    { match: 'https://registry.npmjs.org/pkg', body: registryDoc({ version: '4.5.6' }) },
  ])
  const result = await resolveEntryTarget({
    url: null,
    tarball: 'https://github.com/o/r/releases/download/v4.5.6/pkg-4.5.6.tgz',
  }, { fetchImpl })
  assert.equal(result.ok, true)
  assert.equal(result.source, 'tarball')
  assert.equal(result.version, '4.5.6')
  assert.equal(result.repo, 'o/r')
})

test('classifyCheckerExit: 0/1/2 map explicitly and everything else is not_run', () => {
  assert.deepEqual(classifyCheckerExit(0), { status: 'checked', label: 'completed (exit 0; no blocking finding reported)' })
  assert.deepEqual(classifyCheckerExit(1), { status: 'checked', label: 'completed (exit 1; blocking findings reported)' })
  assert.equal(classifyCheckerExit(2).status, 'incomplete')
  assert.equal(classifyCheckerExit(3).status, 'not_run')
  assert.equal(classifyCheckerExit(null).status, 'not_run')
  for (const code of [0, 1, 2, 3, null]) {
    assert.doesNotMatch(classifyCheckerExit(code).label, /pass|score|rank|certified/i)
  }
})

test('readEntryFields: YAML quotes, descriptions, and missing fields', () => {
  const fields = readEntryFields([
    'url: https://github.com/o/r/tree/main/sub',
    'name: o/r#sub',
    'tarball: https://github.com/o/r/releases/download/v1.0.0/pkg-1.0.0.tgz',
    'description:',
    "  en: 'One: line.'",
    '  zh: "中文"',
    '',
  ].join('\n'))
  assert.deepEqual(fields, {
    url: 'https://github.com/o/r/tree/main/sub',
    tarball: 'https://github.com/o/r/releases/download/v1.0.0/pkg-1.0.0.tgz',
  })

  assert.deepEqual(readEntryFields('name: o/r\n'), { url: null, tarball: null })
  assert.throws(() => readEntryFields("url: 'unterminated\n"), /unterminated|unexpected end/i)
  assert.throws(() => readEntryFields('- just a list\n'), /YAML mapping/i)
})

test('selectChangedEntries: only data/plugins/*.yml, deduplicated, capped at three', () => {
  const selection = selectChangedEntries([
    'data/plugins/a.yml',
    'data/plugins/b.yml',
    'README.md',
    'data/plugins/c.yml',
    'data/plugins/a.yml',
    'data/other.yml',
    'data/plugins/d.yml',
    '',
  ])
  assert.deepEqual(selection.selected, ['data/plugins/a.yml', 'data/plugins/b.yml', 'data/plugins/c.yml'])
  assert.equal(selection.total, 4)
  assert.equal(selection.skipped, 1)
  assert.equal(MAX_ENTRIES, 3)

  assert.equal(selectChangedEntries(['data/plugins/a.yml', 'data/plugins/b.yml'], 1).selected.length, 1)
  assert.equal(selectChangedEntries(['data/plugins/a.yml'], 99).selected.length, 1)
  assert.deepEqual(selectChangedEntries([]), { selected: [], skipped: 0, total: 0 })
})

test('extractCounts: keeps counts and drops the checker conclusion vocabulary', () => {
  const counts = extractCounts({
    coverage: {
      checked: 9, total: 10, na: 1, notRun: 0, partial: 2, warn: 1, pass: 8, fail: 0,
      entryBlocking: { required: 6, checked: ['C-1.1'], notChecked: ['C-3.1'], failed: [] },
    },
    buckets: { blocking: [{ id: 'DSC-01' }], hygiene: [{ id: 'DSC-11' }, { id: 'DSC-13' }] },
  })
  assert.deepEqual(counts, {
    blocking: 1,
    hygiene: 2,
    checked: 9,
    total: 10,
    notChecked: 1,
    partial: 2,
    warnings: 1,
    entry: { required: 6, checked: 1, failed: 0, notChecked: 1 },
  })
  assert.equal('pass' in counts, false)
  assert.equal('fail' in counts, false)
})

test('checkerVersionAt: only the pinned package name/version is reported', t => {
  const root = tempDir(t, 'entry-profile-version-')
  const bin = join(root, 'node_modules', 'dsh-standards', 'bin')
  mkdirSync(bin, { recursive: true })
  writeFileSync(join(root, 'node_modules', 'dsh-standards', 'package.json'), JSON.stringify({ name: 'dsh-standards', version: '1.6.8' }))
  assert.equal(checkerVersionAt(join(bin, 'dsh-standards.mjs')), '1.6.8')

  writeFileSync(join(root, 'node_modules', 'dsh-standards', 'package.json'), JSON.stringify({ name: 'not-the-checker', version: '1.6.8' }))
  assert.equal(checkerVersionAt(join(bin, 'dsh-standards.mjs')), null)
  assert.equal(checkerVersionAt(join(root, 'absent.mjs')), null)
  assert.equal(checkerVersionAt(null), null)
})

test('runCheckerOnDir: checker exit 0/1/2 and missing reports are distinguished', t => {
  const root = tempDir(t, 'entry-profile-checker-')
  const pkg = join(root, 'package')
  mkdirSync(pkg)
  writeFileSync(join(pkg, 'package.json'), JSON.stringify({ name: 'pkg', version: '1.0.0' }))
  const work = join(root, 'work')
  mkdirSync(work)
  const argsFile = join(root, 'args.json')
  const report = {
    coverage: {
      checked: 9, total: 10, na: 1, notRun: 0, partial: 2, warn: 1, pass: 8, fail: 0,
      entryBlocking: { required: 6, checked: ['C-1.1'], notChecked: ['C-3.1'], failed: [] },
    },
    buckets: { blocking: [{ id: 'DSC-01' }], hygiene: [{ id: 'DSC-11' }, { id: 'DSC-13' }] },
  }

  const fake = (exitCode, writeReport) => {
    const file = join(root, `fake-${exitCode}-${writeReport}.mjs`)
    writeFileSync(file, [
      "import fs from 'node:fs'",
      'const argv = process.argv.slice(2)',
      "const out = argv[argv.indexOf('--out') + 1]",
      `fs.writeFileSync(${JSON.stringify(argsFile)}, JSON.stringify(argv))`,
      writeReport ? `if (out) fs.writeFileSync(out, ${JSON.stringify(JSON.stringify(report))})` : '',
      `process.exit(${exitCode})`,
      '',
    ].join('\n'))
    return file
  }

  const zero = runCheckerOnDir(pkg, fake(0, true), work)
  assert.equal(zero.status, 'checked')
  assert.equal(zero.exitCode, 0)
  assert.deepEqual(zero.counts, extractCounts(report))
  const args = JSON.parse(readFileSync(argsFile, 'utf8'))
  for (const expected of CHECKER_ARGS) assert.ok(args.includes(expected), `checker args must include ${expected}: ${args.join(' ')}`)
  assert.ok(args.includes('--format'))
  assert.ok(args.includes('json'))

  const one = runCheckerOnDir(pkg, fake(1, true), work)
  assert.equal(one.status, 'checked')
  assert.equal(one.exitCode, 1)

  const two = runCheckerOnDir(pkg, fake(2, true), work)
  assert.equal(two.status, 'incomplete')
  assert.equal(two.exitCode, 2)

  const missingReport = runCheckerOnDir(pkg, fake(0, false), work)
  assert.equal(missingReport.status, 'not_run')
  assert.equal(missingReport.exitCode, 0)

  const usage = runCheckerOnDir(pkg, fake(3, true), work)
  assert.equal(usage.status, 'not_run')
  assert.equal(usage.exitCode, 3)
})

test('renderSummary: not_run, FLOW, and BOOST are explicit; no conclusion vocabulary', () => {
  const result = {
    generatedAt: '2026-11-07T00:00:00.000Z',
    entries: [
      {
        file: 'data/plugins/owner__repo.yml',
        status: 'checked',
        source: 'url',
        repo: 'owner/repo',
        package: { name: 'pkg', version: '1.2.3' },
        checker: {
          exit_code: 0,
          label: classifyCheckerExit(0).label,
          counts: {
            blocking: 0, hygiene: 2, checked: 11, total: 14, notChecked: 3, partial: 7,
            entry: { required: 6, checked: 3, failed: 0, notChecked: 3 },
          },
        },
        flow: 'not-run',
        boost: 'not-measured',
        reason: null,
      },
      {
        file: 'data/plugins/other__repo.yml',
        status: 'not_run',
        source: null,
        repo: null,
        package: null,
        checker: null,
        flow: 'not-run',
        boost: 'not-measured',
        reason: 'url: package.json 404; tarball: absent',
      },
    ],
    skipped: 1,
    totalChanged: 3,
    topLevelNotRun: null,
    flow: { state: FLOW.state, reason: FLOW.reason },
    boost: { state: BOOST.state, reason: BOOST.reason },
  }
  const summary = renderSummary(result)
  assert.match(summary, /FLOW: not-run/)
  assert.match(summary, /BOOST: not-measured/)
  assert.match(summary, /checker exit: 0/)
  assert.match(summary, /not_run: url: package\.json 404/)
  assert.match(summary, /not profiled \(3-entry limit\): 1/)
  assert.match(summary, /Informational only/)
  assert.match(renderSummary({ ...result, limit: 1, skipped: 3 }), /not profiled \(1-entry limit\): 3/)
  assert.doesNotMatch(summary, /pass|score|rank|certified/i)

  const noEntries = renderSummary({ ...result, entries: [], skipped: 0, totalChanged: 0 })
  assert.match(noEntries, /No added or modified/)
  assert.match(noEntries, /FLOW: not-run/)
  assert.match(noEntries, /BOOST: not-measured/)

  const unavailable = renderSummary({
    ...result, entries: [], skipped: 0, totalChanged: 0, topLevelNotRun: 'changed-file list is not readable',
  })
  assert.match(unavailable, /not_run: changed-file list is not readable/)
  assert.doesNotMatch(unavailable, /No added or modified/)
})

test('CLI: unresolved entries still exit 0 and leave a not_run artifact', t => {
  const root = tempDir(t, 'entry-profile-cli-')
  mkdirSync(join(root, 'data', 'plugins'), { recursive: true })
  writeFileSync(join(root, 'data', 'plugins', 'a__b.yml'), 'url: https://gitlab.com/a/b\n')
  writeFileSync(join(root, 'data', 'plugins', 'c__d.yml'), 'url: https://example.com/not-github\n')
  const changed = join(root, 'changed.txt')
  writeFileSync(changed, 'data/plugins/a__b.yml\ndata/plugins/c__d.yml\n')
  const out = join(root, 'out')
  const summary = join(root, 'summary.md')

  const run = spawnSync(process.execPath, [
    CLI,
    '--changed', changed,
    '--root', root,
    '--checker', join(root, 'no-checker.mjs'),
    '--out-dir', out,
    '--summary', summary,
  ], { encoding: 'utf8', timeout: 60_000 })

  assert.equal(run.status, 0, run.stderr)
  assert.match(run.stdout, /FLOW: not-run/)
  assert.match(run.stdout, /BOOST: not-measured/)
  assert.match(run.stdout, /not_run:/)
  const artifact = JSON.parse(readFileSync(join(out, 'entry-profile.json'), 'utf8'))
  assert.equal(artifact.informational, true)
  assert.equal(artifact.blocking, false)
  assert.equal(artifact.entries.length, 2)
  assert.ok(artifact.entries.every((entry) => entry.status === 'not_run'))
  assert.match(readFileSync(summary, 'utf8'), /FLOW: not-run/)
  assert.doesNotMatch(readFileSync(summary, 'utf8'), /pass|score|rank|certified/i)
})

test('CLI: the 3-entry cap is visible and a missing changed list is not_run', t => {
  const root = tempDir(t, 'entry-profile-cli-')
  mkdirSync(join(root, 'data', 'plugins'), { recursive: true })
  for (const name of ['a', 'b', 'c', 'd']) {
    writeFileSync(join(root, 'data', 'plugins', `${name}__repo.yml`), 'url: https://gitlab.com/a/b\n')
  }
  const changed = join(root, 'changed.txt')
  writeFileSync(changed, ['a', 'b', 'c', 'd'].map((name) => `data/plugins/${name}__repo.yml`).join('\n'))
  const out = join(root, 'out')
  const summary = join(root, 'summary.md')

  const run = spawnSync(process.execPath, [
    CLI, '--changed', changed, '--root', root, '--checker', join(root, 'no-checker.mjs'),
    '--out-dir', out, '--summary', summary,
  ], { encoding: 'utf8', timeout: 60_000 })
  assert.equal(run.status, 0, run.stderr)
  assert.match(run.stdout, /not profiled \(3-entry limit\): 1/)
  const artifact = JSON.parse(readFileSync(join(out, 'entry-profile.json'), 'utf8'))
  assert.equal(artifact.entries.length, 3)
  assert.equal(artifact.skipped, 1)

  const missing = spawnSync(process.execPath, [
    CLI, '--changed', join(root, 'absent.txt'), '--root', root, '--out-dir', join(root, 'out2'),
    '--summary', join(root, 'summary2.md'),
  ], { encoding: 'utf8', timeout: 60_000 })
  assert.equal(missing.status, 0, missing.stderr)
  assert.match(missing.stdout, /not_run: changed-file list/)
  assert.doesNotMatch(missing.stdout, /No added or modified/)
})

test('CLI: a bad option is reported as not_run and still exits 0', t => {
  const root = tempDir(t, 'entry-profile-cli-')
  const summary = join(root, 'summary.md')
  const run = spawnSync(process.execPath, [CLI, '--bogus'], {
    encoding: 'utf8',
    timeout: 60_000,
    env: { ...process.env, GITHUB_STEP_SUMMARY: summary, RUNNER_TEMP: root },
  })
  assert.equal(run.status, 0, run.stderr)
  assert.match(readFileSync(summary, 'utf8'), /not_run: profile failed: unknown option: --bogus/)
  assert.match(readFileSync(summary, 'utf8'), /FLOW: not-run/)
  assert.match(readFileSync(summary, 'utf8'), /BOOST: not-measured/)
})
