/**
 * The update-notes probe's two facts per repository — its latest release and
 * the first few commits of its default branch — asked for in batches instead
 * of one REST pair at a time.
 *
 * Two REST calls per repository is more than the Actions token's hourly budget
 * can pay for across the list: the 2026-09-16 nightly logged
 * `3727 listed … 2594 repo(s) failed the first pass`, refreshed 1,705, and left
 * a third of the published file on `checkedAt: 2026-09-05` (#5275). GraphQL
 * charges by query, not by field: one call names fifty repositories and costs
 * one point, so a whole-list sweep is ~75 points against the 1,000/hour the
 * token gets. Same reasoning, and the same batch size, as the directory listing
 * probe-readmes.mjs added for the same reason.
 *
 * Pure on purpose — the request itself lives in probe-updates.mjs, so the
 * shape of what is asked for and of what comes back can be tested without a
 * token or a network. See scripts/probe-updates-graphql.test.mjs.
 */

/** Repositories per query. One query is one point whatever this is; fifty is
 *  what probe-readmes.mjs settled on, and far below any node-count ceiling. */
export const REPOS_PER_QUERY = 50

/**
 * The repository a listed URL points at: `owner/name`.
 *
 * Monorepo subdir entries (`/tree/<ref>/<dir>`) inherit the parent repository's
 * history, exactly as the REST probe and the stars probe already assume.
 *
 * @param {string} url - a URL as listed in the README.
 * @returns {string} `owner/name`.
 */
export function repoOf(url) {
  return url.replace('https://github.com/', '').replace(/\/$/, '').split('/').slice(0, 2).join('/')
}

/**
 * One query asking every repository in `repos` for the same two fields.
 *
 * `isDraft` and `isPrerelease` are requested but never published: they are how
 * `readEntries` decides whether this endpoint agrees with `/releases/latest`
 * about what "latest" means, and a disagreement sends that repository back to
 * REST rather than publishing a different answer (see readEntries).
 *
 * @param {readonly {owner: string, name: string}[]} repos
 * @param {{commitTail: number}} opts
 * @returns {string} the query, with one alias `r<i>` per repository.
 */
export function buildQuery(repos, { commitTail }) {
  const fields = repos.map(({ owner, name }, i) => [
    `  r${i}: repository(owner: ${JSON.stringify(owner)}, name: ${JSON.stringify(name)}) {`,
    '    latestRelease { tagName name publishedAt url description isDraft isPrerelease }',
    `    defaultBranchRef { target { ... on Commit { history(first: ${commitTail}) { nodes { oid messageHeadline authoredDate } } } } }`,
    '  }',
  ].join('\n'))
  return `query {\n${fields.join('\n')}\n}`
}

/**
 * What one batched answer says per repository, in the same shape the REST probe
 * produces — `{ release, commits }` — and NOTHING for a repository this
 * endpoint cannot be trusted to answer for. A missing index is the caller's
 * signal to use the REST path, which stays the definition of what these fields
 * mean.
 *
 * Deliberately not answered here:
 *
 * - the alias is absent from `data` (`null` for a name that no longer resolves,
 *   or the repository is private/blocked);
 * - the alias appears in `errors` — a per-alias failure, where the rest of the
 *   batch is still usable;
 * - `latestRelease` is a draft or a prerelease. `/releases/latest` explicitly
 *   skips both, and GraphQL's `latestRelease` carries no such promise. Rather
 *   than publish a prerelease to every market and call it a fix, this
 *   repository is the one the batch declines.
 *
 * @param {unknown} payload - the parsed GraphQL response.
 * @param {readonly {owner: string, name: string}[]} repos
 * @param {{maxBodyBytes: number, maxMessageChars: number}} limits - the same
 *   caps the REST path applies, passed in so the two cannot drift.
 * @returns {Map<number, {release: object|null, commits: object[]}>} keyed by
 *   the repository's index in `repos`.
 */
export function readEntries(payload, repos, { maxBodyBytes, maxMessageChars }) {
  const out = new Map()
  const data = payload?.data
  if (data === null || typeof data !== 'object') return out

  const errored = new Set()
  for (const error of payload.errors ?? []) {
    const [alias] = Array.isArray(error?.path) ? error.path : []
    if (typeof alias === 'string') errored.add(alias)
  }

  repos.forEach((_, i) => {
    const alias = `r${i}`
    if (errored.has(alias)) return
    const repo = data[alias]
    if (repo === null || typeof repo !== 'object') return

    let release = null
    const latest = repo.latestRelease
    if (latest !== null && typeof latest === 'object') {
      if (latest.isDraft === true || latest.isPrerelease === true) return
      let body = typeof latest.description === 'string' ? latest.description : ''
      if (body.length > maxBodyBytes) body = body.slice(0, maxBodyBytes) + '\n\n…'
      const tag = latest.tagName ?? null
      // Mirrors the REST path: `/releases/latest` answering 404 is the ordinary
      // case for a plugin without releases, and an entry with neither a tag nor
      // a body is not a release.
      if (tag || body) {
        release = {
          tag,
          name: latest.name ?? null,
          publishedAt: latest.publishedAt ?? null,
          url: latest.url ?? null,
          body,
        }
      }
    }

    // An empty repository, or one whose default branch is not on a commit, has
    // no history to report — the same answer `/commits` gives, not a failure.
    const nodes = repo.defaultBranchRef?.target?.history?.nodes ?? []
    const commits = nodes
      .map((c) => ({
        sha: c?.oid ?? null,
        message: (c?.messageHeadline ?? '').slice(0, maxMessageChars),
        date: c?.authoredDate ?? null,
      }))
      .filter((c) => c.sha !== null)

    out.set(i, { release, commits })
  })

  return out
}

/**
 * How long a rate-limited answer says to wait, in milliseconds; 0 when it does
 * not say.
 *
 * Secondary limits answer with `retry-after`; primary exhaustion sets
 * `x-ratelimit-remaining: 0` and a reset timestamp. Sleeping is the whole
 * remedy — retrying immediately is what earns a longer block — so both the
 * REST and the GraphQL paths ask this and wait.
 *
 * @param {{get(name: string): string|null}} headers
 * @param {number} now
 * @returns {number} milliseconds, or 0 for "no opinion".
 */
export function rateLimitDelayMs(headers, now = Date.now()) {
  const after = Number(headers.get('retry-after'))
  if (Number.isFinite(after) && after > 0) return after * 1000
  const reset = Number(headers.get('x-ratelimit-reset'))
  if (headers.get('x-ratelimit-remaining') === '0' && Number.isFinite(reset)) {
    return Math.max(0, reset * 1000 - now) + 1000
  }
  return 0
}
