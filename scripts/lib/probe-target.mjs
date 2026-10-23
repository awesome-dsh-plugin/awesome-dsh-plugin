const LISTING = /^- \[.+?\]\((https:\/\/github\.com\/[^)]+)\) [—-] /gm
const REPO = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?\/[A-Za-z0-9._-]+$/

export function listedProbeUrls(readme) {
  return [...readme.matchAll(LISTING)].map((match) => match[1])
}

// The dispatch accepts only owner/repo. A listed subpackage URL belongs to
// that repository too; keep its full URL as the cache key.
export function selectProbeUrls(urls, target = '') {
  if (target === '') return { targeted: false, urls }
  if (typeof target !== 'string' || !REPO.test(target) || target.split('/')[1].startsWith('.')) {
    throw new Error('PROBE_TARGET_REPO must be an exact GitHub owner/repo name (no URL or path)')
  }
  const selected = urls.filter((url) => {
    const match = /^https:\/\/github\.com\/([^/]+\/[^/]+)(?:\/|$)/.exec(url)
    return match?.[1].toLowerCase() === target.toLowerCase()
  })
  if (selected.length === 0) throw new Error(`PROBE_TARGET_REPO is not listed: ${target}`)
  return { targeted: true, urls: selected }
}
