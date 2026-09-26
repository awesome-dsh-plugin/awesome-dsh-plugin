import { execFileSync } from 'node:child_process'

/** Oldest addition of the current entry path, including merge resolutions.
 *
 * `--diff-merges=first-parent` changes how a diff is COMPUTED for a merge, not
 * which commits are walked. Do not add `--first-parent`: that would restrict
 * traversal, and an ordinary addition made on a topic branch would then report
 * the merge date instead of its own.
 *
 * Taking `.at(-1)` — the oldest match, since git logs newest first — is what
 * makes asking for merge diffs up front safe. A merge can also match `A`
 * relative to its first parent, but it is always newer than the commit that
 * really added the file, so the oldest match is still the right answer.
 */
export function firstAddedDate(file, cwd = process.cwd()) {
  const out = execFileSync('git', [
    'log', '--diff-merges=first-parent', '--no-patch', '--diff-filter=A',
    '--format=%cI', '--', file.replaceAll('\\', '/'),
  ], { cwd, encoding: 'utf8', windowsHide: true }).trim().split(/\r?\n/).filter(Boolean)
  const oldest = out.at(-1)
  return oldest ? new Date(oldest).toISOString() : null
}
