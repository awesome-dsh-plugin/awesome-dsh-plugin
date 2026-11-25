import fs from 'node:fs'
import { join } from 'node:path'
import { repoOf } from './probe-updates-graphql.mjs'

// Internal entry in the existing runner cache. The site strips it from the
// market's aggregate notes and publishes only the individual fragments.
export const HISTORY_CACHE_KEY = '$releaseHistoryV1'
export const RELEASES_PER_PAGE = 12
export const MAX_RELEASES = 256
const MAX_FILE_BYTES = 1_048_576
const MAX_BODY_BYTES = 4096
const REVALIDATE_MS = 7 * 24 * 60 * 60 * 1000

export function catalogRepo(url) {
  if (!url.startsWith('https://github.com/')) return null
  const repo = repoOf(url).toLowerCase()
  return /^[a-z0-9-]+\/[a-z0-9_.-]+$/.test(repo) && !repo.endsWith('/.') && !repo.endsWith('/..') ? repo : null
}

/** One query per batch, with a separate cursor for each repository. */
export function historyQuery(batch) {
  const fields = batch.map(({ repo, after }, i) => {
    const [owner, name] = repo.split('/')
    return [
      `r${i}: repository(owner: ${JSON.stringify(owner)}, name: ${JSON.stringify(name)}) {`,
      `releases(first: ${RELEASES_PER_PAGE}, after: ${JSON.stringify(after)}, orderBy: {field: CREATED_AT, direction: DESC}) {`,
      'pageInfo { hasNextPage endCursor }',
      'nodes { tagName name publishedAt url description isDraft isPrerelease tagCommit { oid } }',
      '}}',
    ].join('\n')
  })
  return `query {\n${fields.join('\n')}\n}`
}

function boundedBody(description) {
  const bytes = Buffer.from(typeof description === 'string' ? description : '')
  if (bytes.length <= MAX_BODY_BYTES) return bytes.toString('utf8')
  // Trim at a UTF-8 boundary before appending the same truncation marker used
  // in the latest-release snapshot.
  let end = MAX_BODY_BYTES
  while ((bytes[end] & 0xc0) === 0x80) end--
  return bytes.subarray(0, end).toString('utf8') + '\n\n…'
}

export function readHistoryPages(payload, batch) {
  const failed = new Set((payload.errors ?? []).map(error => error.path?.[0]))
  const pages = new Map()
  for (const [i, { repo }] of batch.entries()) {
    const alias = `r${i}`
    const page = payload.data?.[alias]?.releases
    if (failed.has(alias) || !Array.isArray(page?.nodes) || !page.pageInfo) continue
    const { hasNextPage, endCursor } = page.pageInfo
    if (typeof hasNextPage !== 'boolean' || (hasNextPage && typeof endCursor !== 'string')) continue
    const releases = page.nodes.filter(item => item?.isDraft === false && item.isPrerelease === false
      && typeof item.tagName === 'string' && item.tagName.length <= 256)
      .map(item => ({
        tag: item.tagName, name: item.name ?? null, publishedAt: item.publishedAt ?? null,
        url: item.url ?? null, body: boundedBody(item.description), commit: item.tagCommit?.oid ?? null,
      }))
    pages.set(repo, { releases, next: hasNextPage ? endCursor : null })
  }
  return pages
}

/** Refresh the newest page, then continue the older scan from the cached
 * cursor when the two pages still overlap. Revalidate the older tail over
 * time so deleted or edited historical release notes do not linger. */
export function refreshHistory(previous, page, stamp, now) {
  const last = page.releases.at(-1)
  const index = previous?.releases.findIndex(old => old.tag === last?.tag && old.commit === last?.commit) ?? -1
  const boundary = previous?.headCursor === page.next ? previous.headCount : index < 0 ? null : index + 1
  const appendOld = page.next !== null && boundary != null && now - previous.started < REVALIDATE_MS
  const releases = appendOld
    ? [...page.releases, ...previous.releases.slice(boundary)]
    : page.releases
  const next = appendOld && releases.length <= MAX_RELEASES ? previous.next : page.next
  // Retain the published notes while the scheduled revalidation starts over.
  // A successful complete scan replaces them, even if releases were deleted.
  let fallback = previous?.fallback
  if (page.next !== null && !appendOld && previous
    && (previous.next === null || previous.releases.length >= MAX_RELEASES)) {
    fallback = previous.releases
  }
  return {
    releases: releases.slice(0, MAX_RELEASES),
    next,
    headCursor: page.next,
    headCount: page.releases.length,
    fallback: next === null || releases.length >= MAX_RELEASES ? undefined : fallback,
    started: appendOld ? previous.started : now,
    checkedAt: now,
    advancedAt: previous?.advancedAt,
    stamp,
  }
}

export function extendHistory(previous, page) {
  const tags = new Set(previous.releases.map(release => release.tag))
  const releases = [...previous.releases, ...page.releases.filter(release => !tags.has(release.tag))]
  const next = releases.length > MAX_RELEASES ? previous.next : page.next
  return {
    ...previous,
    releases: releases.slice(0, MAX_RELEASES),
    next,
    fallback: next === null || releases.length >= MAX_RELEASES ? undefined : previous.fallback,
  }
}

/** Write per-repo public fragments. Only indicate a fragment in updates.json
 * after it has actually been written, and never embed history in that feed. */
export function publishReleaseHistory(entries, histories, directory, budget) {
  const repositories = new Set()
  let publishedBytes = 0
  let skipped = 0
  for (const repo of new Set(entries.map(entry => catalogRepo(entry.url)))) {
    if (repo === null) continue
    const history = histories[repo]
    const source = history?.fallback ?? history?.releases
    if (!Array.isArray(source) || source.length === 0) continue
    const releases = []
    // Allow for the object envelope and separators even at the byte ceiling.
    let bytes = 128 + Buffer.byteLength(repo)
    for (const release of source) {
      bytes += Buffer.byteLength(JSON.stringify(release)) + 1
      if (bytes > MAX_FILE_BYTES || releases.length === MAX_RELEASES) break
      releases.push(release)
    }
    if (releases.length === 0) continue
    const complete = history.fallback === undefined && history.next === null && releases.length === source.length
    const contents = JSON.stringify({ repo, complete, releases }) + '\n'
    const length = Buffer.byteLength(contents)
    if (publishedBytes + length > budget) {
      skipped++
      continue
    }
    const [owner, name] = repo.split('/')
    const dir = join(directory, 'release-history', 'v1', owner)
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(join(dir, `${name}.json`), contents)
    repositories.add(repo)
    publishedBytes += length
  }
  return { repositories, publishedBytes, skipped }
}
