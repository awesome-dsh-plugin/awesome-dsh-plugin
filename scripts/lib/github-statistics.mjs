/** Public repository facts, batched in CI rather than fetched by each market user. */
export const REPOSITORIES_PER_QUERY = 50
const count = value => Number.isSafeInteger(value) && value >= 0
const page = after => `first: 10${after ? `, after: ${JSON.stringify(after)}` : ''}`
const assets = after => `releaseAssets(first: 100${after ? `, after: ${JSON.stringify(after)}` : ''}) { nodes { id downloadCount } pageInfo { hasNextPage endCursor } }`

export function statisticsQuery(tasks, releases) {
  return `query { ${tasks.map((task, index) => {
    if (task.release) return `r${index}: node(id: ${JSON.stringify(task.release)}) { ... on Release { ${assets(task.after)} } }`
    const [owner, name] = task.repo.split('/')
    return `r${index}: repository(owner: ${JSON.stringify(owner)}, name: ${JSON.stringify(name)}) { isPrivate stargazerCount${releases ? ` releases(${page(task.after)}, orderBy: { field: CREATED_AT, direction: DESC }) { nodes { id isDraft ${assets()} } pageInfo { hasNextPage endCursor } }` : ''} }`
  }).join('\n')} }`
}

/** A missing/failed page invalidates that repository's total, never a partial sum. */
export async function repositoryStatistics(repositories, request, { releases = false } = {}) {
  const states = new Map([...new Set(repositories)].map(repo => [repo, {
    stars: null, downloads: 0, assets: new Set(), releases: new Set(), cursors: new Set(), failed: false,
  }]))
  let pending = [...states.keys()].map(repo => ({ repo }))
  while (pending.length) {
    const tasks = pending.splice(0, REPOSITORIES_PER_QUERY).filter(task => !states.get(task.repo).failed)
    if (!tasks.length) continue
    let payload
    try { payload = await request(statisticsQuery(tasks, releases)) }
    catch { for (const task of tasks) states.get(task.repo).failed = true; continue }
    const errors = Array.isArray(payload?.errors) ? payload.errors : []
    const globalError = errors.some(error => !Array.isArray(error?.path) || typeof error.path[0] !== 'string')
    for (const [index, task] of tasks.entries()) {
      const state = states.get(task.repo), alias = `r${index}`, value = payload?.data?.[alias]
      try {
        if (globalError || errors.some(error => error.path?.[0] === alias) || !value) throw Error('repository unavailable')
        if (!task.release && value.isPrivate !== false) throw Error('repository is not public')
        const continuation = (connection, release) => {
          const info = connection?.pageInfo
          if (!info || typeof info.hasNextPage !== 'boolean') throw Error('missing pagination receipt')
          if (!info.hasNextPage) return
          if (typeof info.endCursor !== 'string' || !info.endCursor) throw Error('missing cursor')
          const key = `${release ?? 'releases'}:${info.endCursor}`
          if (state.cursors.has(key)) throw Error('repeated cursor')
          state.cursors.add(key); pending.push({ repo: task.repo, release, after: info.endCursor })
        }
        const addAssets = (connection, release) => {
          if (!Array.isArray(connection?.nodes)) throw Error('missing assets')
          for (const asset of connection.nodes) {
            if (typeof asset?.id !== 'string' || !count(asset.downloadCount) || state.assets.has(asset.id)) throw Error('invalid or repeated asset')
            state.assets.add(asset.id); state.downloads += asset.downloadCount
            if (!count(state.downloads)) throw Error('unsafe total')
          }
          continuation(connection, release)
        }
        if (task.release) { addAssets(value.releaseAssets, task.release); continue }
        if (!count(value.stargazerCount)) throw Error('missing star count')
        state.stars ??= value.stargazerCount
        if (!releases) continue
        if (!Array.isArray(value.releases?.nodes)) throw Error('missing releases')
        for (const release of value.releases.nodes) {
          if (typeof release?.id !== 'string' || typeof release.isDraft !== 'boolean' || state.releases.has(release.id)) throw Error('invalid or repeated release')
          state.releases.add(release.id)
          if (!release.isDraft) addAssets(release.releaseAssets, release.id)
        }
        continuation(value.releases)
      } catch { state.failed = true }
    }
  }
  return new Map([...states].filter(([, value]) => !value.failed).map(([repo, value]) => [repo, {
    stars: value.stars, ...(releases ? { downloads: value.downloads } : {}),
  }]))
}
