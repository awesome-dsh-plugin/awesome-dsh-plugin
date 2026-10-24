const LISTING = /^- \[.+?\]\((https:\/\/github\.com\/[^)]+)\) [—-] /gm
const REPO = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?\/[A-Za-z0-9._-]+$/

export function listedProbeUrls(readme) {
  return [...readme.matchAll(LISTING)].map((match) => match[1])
}

// A repository shorthand targets its canonical root entry; a full listed URL
// targets only that exact root or subpackage cache key.
export function selectProbeUrls(urls, target = '') {
  if (target === '') return { targeted: false, urls }
  if (typeof target !== 'string') {
    throw new Error('PROBE_TARGET_REPO must be an exact GitHub owner/repo name or listed GitHub entry URL')
  }

  let selected
  if (REPO.test(target) && !target.split('/')[1].startsWith('.')) {
    // A repository shorthand intentionally means its root catalog entry only.
    // Monorepo subpackages have their own canonical URLs and cache rows.
    const root = `https://github.com/${target}`.toLowerCase()
    selected = urls.filter((url) => url.toLowerCase() === root)
  } else {
    // Full targets must be canonical GitHub entry URLs and match a listed key
    // byte-for-byte. This rejects URL aliases, query strings, and unlisted paths.
    const canonical = /^https:\/\/github\.com\/([A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?)\/([A-Za-z0-9._-]+)(?:\/tree\/[^/?#]+\/.+)?$/
    if (target.includes('?') || target.includes('#') || !canonical.test(target)) {
      throw new Error('PROBE_TARGET_REPO must be an exact GitHub owner/repo name or listed GitHub entry URL')
    }
    selected = urls.filter((url) => url === target)
  }
  if (selected.length === 0) throw new Error(`PROBE_TARGET_REPO is not listed: ${target}`)
  return { targeted: true, urls: [...new Set(selected)] }
}
