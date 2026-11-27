/**
 * Give a published screenshot URL a content version.
 *
 * Storefronts cache a screenshot for as long as its URL stays the same, and the
 * URL is the only thing they key on: dsh-market renders `screenshots` straight
 * into an <img> behind images.weserv.nl, whose response carries
 * `Cache-Control: max-age=31536000`. An author who replaces docs/preview.png
 * with a new image keeps the same path, so the URL does not move, the browser
 * and the resize cache both keep serving last year's bytes, and the new picture
 * never appears. The cache is only ever wrong when the bytes behind a URL
 * changed, so the fix is to make the URL change when the bytes do.
 *
 * The probe already asks each image for one byte and the answer carries the
 * host's ETag — an opaque value, not the content hash, but one that moves
 * whenever the object does: four revisions of one PNG returned four different
 * ETags, and the same revision served under two different URLs returned the
 * same one. That is the whole property needed here: unchanged image, unchanged
 * version, so the cached copy stays valid; changed image, new version, so the
 * cache misses exactly once.
 *
 * Versions are truncated because a URL is read by people and copied into bug
 * reports; twelve characters distinguish every revision a repository can
 * produce, and two images that collide across twelve characters are the same
 * picture as far as a cache can tell anyway.
 */

/** Characters an ETag is reduced to before it becomes a query value. */
const NON_TOKEN = /[^A-Za-z0-9]/g

/** How much of the reduced ETag the URL carries, and the least worth carrying. */
const TOKEN_LENGTH = 12
const MIN_TOKEN_LENGTH = 8

/**
 * Reduce a response's ETag header to a query-safe version token.
 *
 * Hosts wrap the value in quotes and may prefix it with `W/` for a weak
 * validator; neither belongs in a URL. Anything shorter than eight remaining
 * characters is not distinguishing anything and yields null, which callers read
 * as "publish the URL as it is" — the same output the site produced before
 * versions existed, so a host that sends no useful ETag degrades instead of
 * breaking.
 *
 * @param {string | null | undefined} value - the raw ETag header.
 * @returns {string | null}
 */
export function etagToken(value) {
  if (typeof value !== 'string') return null
  const bare = value.trim().replace(/^W\//i, '').replace(/^"|"$/g, '')
  const token = bare.replace(NON_TOKEN, '').slice(0, TOKEN_LENGTH)
  return token.length >= MIN_TOKEN_LENGTH ? token : null
}

/**
 * Stamp one image URL with a version token.
 *
 * The parameter is set rather than appended so an author-declared absolute URL
 * that already carries a query string keeps it — `?raw=1` plus a version is
 * still one well-formed URL, and the storefront's resize proxy re-encodes the
 * whole thing either way. A URL the platform cannot parse is returned
 * untouched: this runs inside the build, where dropping a picture someone
 * declared is worse than publishing it without a version.
 *
 * @param {string} src - the image URL as declared or resolved.
 * @param {string | null | undefined} etag - its ETag from the probe, if any.
 * @returns {string}
 */
export function withContentVersion(src, etag) {
  const token = etagToken(etag)
  if (token === null) return src
  let parsed
  try {
    parsed = new URL(src)
  } catch {
    return src
  }
  parsed.searchParams.set('v', token)
  return parsed.href
}

/**
 * Stamp every image of one entry.
 *
 * Most entries carry no images at all, and the publish path hands this the same
 * `undefined` it hands the field itself, so absent input returns absent output
 * rather than an empty array — a field that is there-but-empty is a different
 * thing downstream than a field that was never set.
 *
 * @param {string[] | undefined} list - the entry's image URLs.
 * @param {Record<string, { etag?: string }>} verdicts - probe results by URL.
 * @returns {string[] | undefined} a new array; the input is not modified.
 */
export function versionShots(list, verdicts) {
  if (!Array.isArray(list)) return list
  return list.map((src) => withContentVersion(src, verdicts?.[src]?.etag))
}
