/**
 * Order repositories for a probe pass so that a run the API budget cuts short
 * rotates its coverage instead of starving the same stretch of the list.
 *
 * The nightly run probes every listed repository in README order, and the
 * token's hourly budget reaches roughly a third of them: the 2026-09-14 run
 * logged `3632 listed … 2364 repo(s) kept their previous update data`, and
 * in the published updates.json the same middle of the list (README positions
 * 40–80%) had last been checked on 09-05 while both ends were current. Least
 * recently checked first — never checked before that — puts whatever the
 * budget did not reach today at the front tomorrow.
 *
 * @param {string[]} urls - repository URLs in README order.
 * @param {Record<string, { checkedAt?: string }>} map - the previous probe data.
 * @returns {string[]} a new array; ties keep README order.
 */
export function leastRecentlyChecked(urls, map) {
  const stamp = (url) => map[url]?.checkedAt ?? ''
  return [...urls].sort((a, b) => (stamp(a) < stamp(b) ? -1 : stamp(a) > stamp(b) ? 1 : 0))
}
