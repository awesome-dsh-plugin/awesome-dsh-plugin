/**
 * Collect public release history once for the catalog. Reuse the existing
 * nightly entry point and cache while keeping the legacy summary independent.
 */
import { catalogRepo, extendHistory, historyQuery, MAX_RELEASES, readHistoryPages, refreshHistory } from './lib/release-history.mjs'

const BATCH = 30
const QUERY_BUDGET = 240
const RECENT_QUERY_BUDGET = 210
const QUOTA_RESERVE = 50

export async function collectReleaseHistory(updates, cached, token, now = Date.now()) {
  const histories = { ...cached }
  const repos = new Map()
  for (const [url, entry] of Object.entries(updates)) {
    const repo = catalogRepo(url)
    if (repo !== null && entry.release?.tag) repos.set(repo, entry.release.tag + ':' + (entry.release.publishedAt ?? ''))
  }
  const checked = (repo, stamp) => histories[repo]?.stamp === stamp ? histories[repo].checkedAt : 0
  const pending = [...repos].sort(([a, stampA], [b, stampB]) => checked(a, stampA) - checked(b, stampB))
    .map(([repo, stamp]) => ({ repo, stamp, after: null }))

  let queries = 0
  let remaining = Infinity
  async function getPages(batch) {
    if (queries >= QUERY_BUDGET || remaining < QUOTA_RESERVE) return null
    queries++
    try {
      const result = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
          accept: 'application/vnd.github+json',
          'content-type': 'application/json',
          'user-agent': 'awesome-dsh-plugin-release-history',
        },
        body: JSON.stringify({ query: historyQuery(batch) }),
        signal: AbortSignal.timeout(15_000),
      })
      const quota = result.headers.get('x-ratelimit-remaining')
      if (quota !== null) remaining = Number(quota)
      if (!result.ok) throw new Error(`HTTP ${result.status}`)
      const payload = await result.json()
      if (payload.data == null) throw new Error('GraphQL returned no data')
      return readHistoryPages(payload, batch)
    } catch (error) {
      console.warn(`release history paused after ${queries} queries: ${error.message}`)
      return null
    }
  }
  let paused = false
  for (let i = 0; i < pending.length && queries < RECENT_QUERY_BUDGET; i += BATCH) {
    const batch = pending.slice(i, i + BATCH)
    const pages = await getPages(batch)
    if (pages === null) { paused = true; break }
    for (const { repo, stamp } of batch) {
      const page = pages.get(repo)
      if (page !== undefined) histories[repo] = refreshHistory(histories[repo], page, stamp, now)
    }
  }

  // Advance one older page per repository per pass, leaving share of the
  // budget for repositories whose older pages have waited the longest.
  const canAdvance = history => history?.next != null && history.releases.length < MAX_RELEASES
  let backlog = [...repos.keys()].filter(repo => canAdvance(histories[repo]))
    .sort((a, b) => (histories[a].advancedAt ?? 0) - (histories[b].advancedAt ?? 0))
  while (!paused && backlog.length > 0 && queries < QUERY_BUDGET) {
    const next = []
    for (let i = 0; i < backlog.length; i += BATCH) {
      const batch = backlog.slice(i, i + BATCH).map(repo => ({ repo, after: histories[repo].next }))
      const pages = await getPages(batch)
      if (pages === null) { paused = true; break }
      for (const { repo, after } of batch) {
        const page = pages.get(repo)
        if (page === undefined || page.next === after) continue
        histories[repo] = { ...extendHistory(histories[repo], page), advancedAt: now }
        if (canAdvance(histories[repo])) next.push(repo)
      }
    }
    backlog = next
  }
  // Keep data through a partial legacy probe; remove it only when the
  // repository itself was delisted, as distinct from a probe failure.
  const listed = new Set(Object.keys(updates).map(catalogRepo))
  for (const repo of Object.keys(histories)) {
    if (!listed.has(repo)) delete histories[repo]
  }
  console.log(`release history: ${Object.keys(histories).length}/${repos.size} repositories, ${queries} queries`)
  return histories
}
