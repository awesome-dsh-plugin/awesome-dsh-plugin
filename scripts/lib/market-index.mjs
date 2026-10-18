/**
 * Build the DSH plugin market index (format 1) from this list's own data.
 *
 * dsh 0.2.1 added "plugin market indexes": a JSON document a host can read as
 * a market source, browsed in the official Plugins → Discover tab and by the
 * `plugin_market` agent tool. The format is defined and validated by
 * @deepseek-ai/dsh-plugin-market-index, which this module uses as the single
 * rule set — an index is built, then validated with the same parser every
 * host uses, so a document that leaves here cannot be one DSH rejects.
 *
 * What can be listed: an entry needs an npm package, an exact version, and
 * that version's publish time. The GitHub-only half of the list cannot be
 * expressed yet — format 1 wants a commit SHA per Git version, and this
 * repository records none.
 */
import semver from 'semver'
import { parseMarketIndex } from '@deepseek-ai/dsh-plugin-market-index'
import { slugOf } from './terms.mjs'

export const INDEX_ORIGIN = 'https://awesome-dsh-plugin.com'

/** Declaration groups shared by every plugin: the list's own categories. */
function categoryDeclarations(locales) {
  const categories = {}
  for (const locale of locales) {
    for (const [id, title] of Object.entries(locale.categories ?? {})) {
      if (typeof title !== 'string' || title === '') continue
      categories[id] ??= { title: {} }
      categories[id].title[locale.code] = title
    }
  }
  return categories
}

/** `owner/repo` and the optional `tree/<branch>/<dir>` subdirectory of one entry. */
function repositoryOf(url) {
  const path = url.replace('https://github.com/', '')
  const [owner, repo, ...rest] = path.split('/')
  const raw = rest[0] === 'tree' ? rest.slice(2).join('/') : ''
  // The format's directory grammar has no percent-escapes and no spaces; a
  // source URL may carry either (`DSH-based%20Agent Service`). The repository
  // link stays useful without the subdirectory, so an inexpressible one is
  // dropped rather than costing the whole plugin.
  let directory = ''
  try {
    directory = raw.split('/').map(decodeURIComponent).join('/')
  } catch {
    directory = ''
  }
  const expressible = directory !== '' && directory.split('/').every((segment) => /^[A-Za-z0-9._@+-]+$/.test(segment))
  return {
    url: `https://github.com/${owner}/${repo}`,
    ...expressible ? { directory } : {},
  }
}

/** A LocalizedText value, or undefined when the entry has no usable text. */
function localized(description) {
  if (typeof description === 'string' && description.trim() !== '') return description
  if (typeof description !== 'object' || description === null) return undefined
  const text = {}
  for (const [language, value] of Object.entries(description)) {
    if (typeof value === 'string' && value.trim() !== '') text[language] = value
  }
  // The format requires `en` in an object form; a lone translation stays usable
  // as a plain string instead of dropping the description entirely.
  if (typeof text.en === 'string') return text
  return Object.values(text)[0]
}

/**
 * @param entries - one record per list entry (`url`, `name`, `category`, `description`).
 * @param npmMap - data/npm-map.json: url → { npm, version, publishedAt, enginesDsh }.
 * @param locales - site/locales.mjs: category titles per language.
 * @param origin - the site the index is served from.
 * @returns the validated index plus coverage counts and per-entry refusals.
 */
export function buildMarketIndex({ entries, npmMap, locales, origin = INDEX_ORIGIN }) {
  const categories = categoryDeclarations(locales)
  const spec = {
    format: 1,
    title: { en: 'Awesome DSH Plugin', zh: 'Awesome DSH Plugin 插件精选' },
    description: {
      en: 'Community-curated DeepSeek Harness (dsh) plugins, from the awesome-dsh-plugin.com list.',
      zh: '来自 awesome-dsh-plugin.com 的社区 DeepSeek Harness（dsh）插件精选。',
    },
    metadata: { categories },
    plugins: [],
  }
  const indexUrl = `${origin}/index.json`
  const skipped = { noNpm: 0, noVersion: 0, noPublishTime: 0, refused: 0 }
  const refused = []

  for (const entry of entries) {
    const record = npmMap[entry.url]
    if (typeof record?.npm !== 'string' || record.npm === '') { skipped.noNpm += 1; continue }
    if (typeof record.version !== 'string' || record.version === '') { skipped.noVersion += 1; continue }
    if (!Number.isInteger(record.publishedAt)) { skipped.noPublishTime += 1; continue }

    const dsh = typeof record.enginesDsh === 'string' && semver.validRange(record.enginesDsh) !== null
      ? record.enginesDsh
      : undefined
    const plugin = {
      name: record.npm,
      title: entry.name,
      ...(localized(entry.description) === undefined ? {} : { description: localized(entry.description) }),
      homepage: `${origin}/p/${slugOf(entry.url)}/`,
      repository: repositoryOf(entry.url),
      metadata: { category: entry.category, keywords: [] },
      versions: [{
        version: record.version,
        publishTimestamp: record.publishedAt,
        source: { type: 'npm' },
        engines: dsh === undefined ? {} : { dsh },
      }],
    }
    // Validate one plugin at a time so a single bad row costs that row, not
    // the whole index; the caller sees exactly which entry and why.
    try {
      parseMarketIndex({ ...spec, plugins: [plugin] }, indexUrl)
      spec.plugins.push(plugin)
    } catch (error) {
      skipped.refused += 1
      refused.push(`${entry.url}: ${error.message}`)
    }
  }

  // The document as a whole, which is what a host actually parses.
  const index = parseMarketIndex(spec, indexUrl)
  return { index, skipped, refused }
}
