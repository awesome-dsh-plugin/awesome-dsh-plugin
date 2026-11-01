import assert from 'node:assert/strict'
import test from 'node:test'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, sep } from 'node:path'
import { readEntries, validateEntries } from './lib/entries.mjs'

const ENTRY = [
  'url: https://github.com/owner/repo',
  'name: owner/repo',
  'category: tools',
  'description:',
  '  en: One line.',
  '',
].join('\n')

const posix = (p) => p.split(sep).join('/')

// An entry's `file` is compared against `git diff --name-only` output and
// echoed into `::error file=…` annotations, both of which are POSIX on every
// platform. While it carried the host separator, check-submission.mjs on
// Windows found no entry in the diff and reported "no entry files added or
// changed — nothing to verify" for a pull request that plainly added one.
test('reports the entry path the way git prints it', t => {
  const dir = mkdtempSync(join(tmpdir(), 'awesome-entry-path-'))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  writeFileSync(join(dir, 'owner__repo.yml'), ENTRY)

  const [entry] = readEntries(dir)
  assert.ok(entry, 'the fixture entry must load')
  assert.equal(entry.file, posix(join(dir, 'owner__repo.yml')))
  assert.equal(entry.file.includes('\\'), false, `entry.file must not carry a host separator: ${entry.file}`)

  // Exactly the comparison check-submission.mjs runs.
  const changed = new Set([posix(join(dir, 'owner__repo.yml'))])
  assert.equal(changed.has(entry.file), true, 'the diff/entry comparison must match')
})

// The shape that actually runs: PLUGINS_DIR is relative, and the diff prints
// `data/plugins/owner__repo.yml`.
test('a relative plugins directory compares equal to the diff', t => {
  const cwd = process.cwd()
  const dir = mkdtempSync(join(tmpdir(), 'awesome-entry-rel-'))
  mkdirSync(join(dir, 'data', 'plugins'), { recursive: true })
  writeFileSync(join(dir, 'data', 'plugins', 'owner__repo.yml'), ENTRY)
  process.chdir(dir)
  t.after(() => {
    process.chdir(cwd)
    rmSync(dir, { recursive: true, force: true })
  })

  const [entry] = readEntries()
  assert.equal(entry.file, 'data/plugins/owner__repo.yml')
  assert.equal(new Set(['data/plugins/owner__repo.yml']).has(entry.file), true)
})

test('icon: a GitHub-hosted raster tile is accepted, foreign hosts and SVG are refused', () => {
  const base = { url: 'https://github.com/owner/repo', name: 'owner/repo', category: 'ui', description: { en: 'One line.' } }
  const ok = validateEntries([{ ...base, icon: 'https://raw.githubusercontent.com/owner/repo/main/assets/icon-180.png' }])
  assert.deepEqual(ok, [])
  const foreign = validateEntries([{ ...base, icon: 'https://evil.example/icon.png' }])
  assert.equal(foreign.some((p) => p.includes('"icon" must be hosted on GitHub')), true, foreign.join('\n'))
  const svg = validateEntries([{ ...base, icon: 'https://raw.githubusercontent.com/owner/repo/main/assets/icon.svg' }])
  assert.equal(svg.some((p) => p.includes('raster image')), true, svg.join('\n'))
})
