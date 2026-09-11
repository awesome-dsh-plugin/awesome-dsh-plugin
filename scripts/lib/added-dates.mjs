import { execFileSync } from 'node:child_process'

/** Oldest addition of the current entry path, including merge resolutions.
 * Do not restrict traversal to the first-parent chain: ordinary additions on
 * a topic branch must keep their original date rather than the merge date.
 */
export function firstAddedDate(file, cwd = process.cwd()) {
  const out = execFileSync('git', [
    'log', '--diff-merges=first-parent', '--no-patch', '--diff-filter=A',
    '--format=%cI', '--', file.replaceAll('\\', '/'),
  ], { cwd, encoding: 'utf8', windowsHide: true }).trim().split(/\r?\n/).filter(Boolean)
  const oldest = out.at(-1)
  return oldest ? new Date(oldest).toISOString() : null
}
