// The plugin term: one string that three surfaces have to agree on.
//
// A plugin's comments live in a single GitHub Discussion whose title is
// `plugin:<slug>`. Three widgets mount that thread — this catalog's detail
// pages, dshmarket.com's detail pages, and the comment drawer inside
// dsh-market itself — and nothing at runtime notices when they disagree:
// giscus opens a second, empty thread and reports no error at all. So the
// derivation lives here, once, and both the site builder and
// adopt-discussions.mjs import it.
//
// The slug is the published URL with its ref folded away, AS-IS — not
// lowercased. The same slug is the detail page's URL path (`/p/<slug>/`),
// which is a canonical URL that shared links and search results depend on; a
// term that disagrees with it breaks the only join key the threads have. From
// the day comments shipped until 2026-09-24 this builder lowercased the term,
// which split the thread for every entry whose owner or repo name carries a
// capital letter — `plugin:FeatherHunter/dsh-prompt` asked for by the market,
// `plugin:featherhunter/dsh-prompt` by the catalog. Two threads, neither wrong,
// and one of them invisible on each surface.

/** The catalog slug for a published repository URL: `owner/repo[--packages-x]`. */
export function slugOf(url) {
  const repoPath = url.replace('https://github.com/', '')
  const repo = repoPath.split('/').slice(0, 2).join('/')
  const sub = repoPath.includes('/tree/') ? repoPath.split('/tree/')[1].replace(/^[^/]+\//, '') : null
  return sub ? `${repo}--${sub.replaceAll('/', '-')}` : repo
}

/** The giscus term for a repository URL, or for a slug that is already derived. */
export function termOf(urlOrSlug) {
  return `plugin:${urlOrSlug.startsWith('https://github.com/') ? slugOf(urlOrSlug) : urlOrSlug}`
}
