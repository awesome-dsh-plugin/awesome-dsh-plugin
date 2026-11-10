// Deciding what an existing discussion needs to become readable again.
//
// A widget finds a plugin's thread by asking giscus for a term, and giscus
// answers with a search that has two hard requirements (both measured, see
// adopt-discussions.mjs): the discussion's CATEGORY has to be the configured
// one, and its BODY has to contain `<!-- sha1: <sha1(term)> -->` because
// `strict` matching hashes the term and looks for it in the body. A thread a
// human created in the GitHub UI satisfies neither, so every surface shows an
// empty box, giscus quietly opens a second thread, and the conversation is
// split in two without anyone being told.
//
// Nothing here talks to GitHub: the rules are pure so they can be tested
// against the shapes that actually occur (a hand-made thread, a thread the
// catalog's lowercasing era filed under a different case, one whose repository
// was renamed out from under it) rather than against a stub's idea of them.

import { createHash } from 'node:crypto'

/**
 * A discussion title that names a plugin and nothing else.
 *
 * Human topics are the majority of this repository's discussions ("为什么左侧
 * 的工作区无法显示壁纸"), and an adoption sweep must never touch them: it
 * rewrites bodies, and a body is somebody's writing.
 */
export const PLUGIN_TERM_RE = /^plugin:[^\s/]+\/[^\s/]+(?:--\S+)?$/u

export const isPluginTerm = (title) => PLUGIN_TERM_RE.test(title)

/** giscus's own marker computation, byte for byte: SHA-1 of the term, hex. */
export const sha1Hex = (text) => createHash('sha1').update(text).digest('hex')

export const markerFor = (term) => `<!-- sha1: ${sha1Hex(term)} -->`

const MARKER_RE = /<!--\s*sha1:\s*([0-9a-f]{40})\s*-->/iu

/** The marker already in a body, lowercased, or null. */
export function markerIn(body) {
  const m = MARKER_RE.exec(body ?? '')
  return m === null ? null : m[1].toLowerCase()
}

/**
 * The catalog indexes the sweep needs, built from entries as they are read.
 *
 * `byRepo` is keyed by the repository the entry is published from, because
 * that is what survives a rename: a transferred or renamed repository answers
 * to its old name with a redirect, and the entry's URL may still carry the old
 * name long after GitHub stopped using it (`zhu1090093659/dsh-web-ui` lives on
 * in one entry whose repo is now spelled `dsh-web`).
 */
export function catalogIndex(entries) {
  const bySlug = new Map()
  const byRepo = new Map()
  for (const entry of entries) {
    const repoPath = entry.url.replace('https://github.com/', '')
    const repo = repoPath.split('/').slice(0, 2).join('/')
    const sub = repoPath.includes('/tree/') ? repoPath.split('/tree/')[1].replace(/^[^/]+\//, '') : null
    const slug = sub ? `${repo}--${sub.replaceAll('/', '-')}` : repo
    const record = { slug, repo, sub }
    bySlug.set(slug, record)
    const list = byRepo.get(repo.toLowerCase()) ?? []
    list.push(record)
    byRepo.set(repo.toLowerCase(), list)
  }
  return { bySlug, byRepo }
}

/**
 * The term a thread should carry, judged by its title alone.
 *
 * `exact` — the catalog publishes that slug today.
 * `case`  — the catalog publishes the same slug in another case. That is the
 *           lowercasing era: the entry is the same plugin, and the thread is
 *           the one its page should be reading.
 */
export function resolveTerm(title, { bySlug }) {
  const slug = title.slice('plugin:'.length)
  if (bySlug.has(slug)) return { slug, how: 'exact' }
  for (const candidate of bySlug.keys()) {
    if (candidate.toLowerCase() === slug.toLowerCase()) return { slug: candidate, how: 'case' }
  }
  return null
}

/**
 * The term for a thread whose slug the catalog no longer publishes, given the
 * repository name GitHub resolves that slug to today.
 *
 * Only a same-shaped entry counts: the repository must match, and so must the
 * subdirectory (both absent, or the same one). A repository that was renamed
 * and reorganised — `kelaohu/dsh-lowtide--packages-dsh`, now published at
 * `packages/dsh-lowtide` — is deliberately NOT re-linked: attaching one
 * plugin's comments to another plugin's page is worse than leaving them where
 * they are, and only a human can tell whether the move was a rename or a
 * different plugin taking the old one's place. Those threads are reported.
 */
export function resolveRenamed(title, currentRepo, { byRepo }) {
  const slug = title.slice('plugin:'.length)
  const prefix = `${currentRepo}--`
  const sub = slug.toLowerCase().startsWith(prefix.toLowerCase()) ? slug.slice(prefix.length) : null
  const matches = (byRepo.get(currentRepo.toLowerCase()) ?? []).filter((entry) => entry.sub === sub)
  return matches.length === 1 ? { slug: matches[0].slug, how: 'renamed' } : null
}

/**
 * What to write, or null when the thread is already readable.
 *
 * Both edits are additive or corrective, never destructive: an existing marker
 * is replaced (only when it names a different term — a thread the lowercasing
 * era filed under another case keeps its body otherwise), the marker is
 * appended when there is none, and the body as the author wrote it is left
 * alone. Idempotent by construction: re-running on an adopted thread plans
 * nothing.
 */
export function planAdoption({ desiredTerm, body, categoryId, pluginsCategoryId }) {
  const changes = {}
  if (markerIn(body) !== sha1Hex(desiredTerm)) {
    const marker = markerFor(desiredTerm)
    const written = (body ?? '').replace(/\s+$/u, '')
    changes.body = markerIn(body) === null
      ? `${written === '' ? '' : `${written}\n\n`}${marker}\n`
      : (body ?? '').replace(MARKER_RE, marker)
  }
  if (categoryId !== pluginsCategoryId) changes.categoryId = pluginsCategoryId
  return Object.keys(changes).length === 0 ? null : changes
}
