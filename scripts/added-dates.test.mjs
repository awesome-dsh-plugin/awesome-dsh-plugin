import assert from 'node:assert/strict'
import test from 'node:test'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { firstAddedDate } from './lib/added-dates.mjs'

function repository(t) {
  const cwd = mkdtempSync(join(tmpdir(), 'awesome-added-date-'))
  t.after(() => rmSync(cwd, { recursive: true, force: true }))
  const git = (...args) => execFileSync('git', args, { cwd, encoding: 'utf8', windowsHide: true })
  git('init', '-q', '-b', 'main')
  git('config', 'user.name', 'Date fixture')
  git('config', 'user.email', 'fixture@example.invalid')
  const commit = (date) => execFileSync('git', ['commit', '-qm', 'fixture'], {
    cwd, windowsHide: true,
    env: { ...process.env, GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date },
  })
  writeFileSync(join(cwd, 'base'), 'base')
  git('add', 'base')
  commit('2026-08-01T00:00:00Z')
  return { cwd, git, commit }
}

test('finds an entry renamed to its canonical path in a merge resolution', t => {
  const { cwd, git, commit } = repository(t)
  git('switch', '-qc', 'topic')
  writeFileSync(join(cwd, 'old.yml'), 'url: https://github.com/owner/repo')
  git('add', 'old.yml')
  commit('2026-08-02T00:00:00Z')
  git('switch', '-q', 'main')
  git('merge', '--no-ff', '--no-commit', 'topic')
  git('mv', 'old.yml', 'canonical.yml')
  commit('2026-08-03T00:00:00Z')
  assert.equal(git('log', '--diff-filter=A', '--format=%cI', '--', 'canonical.yml').trim(), '')
  assert.equal(firstAddedDate('canonical.yml', cwd), '2026-08-03T00:00:00.000Z')
})

test('keeps the original topic-branch date for a normal merged addition', t => {
  const { cwd, git, commit } = repository(t)
  git('switch', '-qc', 'topic')
  writeFileSync(join(cwd, 'plugin.yml'), 'entry')
  git('add', 'plugin.yml')
  commit('2026-08-02T00:00:00Z')
  git('switch', '-q', 'main')
  git('merge', '--no-ff', '--no-commit', 'topic')
  commit('2026-08-03T00:00:00Z')
  assert.equal(firstAddedDate('plugin.yml', cwd), '2026-08-02T00:00:00.000Z')
})

test('does not invent dates for uncommitted files', t => {
  const { cwd } = repository(t)
  writeFileSync(join(cwd, 'pending.yml'), 'entry')
  assert.equal(firstAddedDate('pending.yml', cwd), null)
})
