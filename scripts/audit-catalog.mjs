#!/usr/bin/env node
/**
 * Offline, full-catalog health audit.
 *
 * check-submission.mjs validates the entries a PR touches; this script walks
 * every data/plugins/*.yml instead, so rot that accumulated before a validator
 * existed (or slipped in through a merged PR) becomes visible without a single
 * network call. It reuses the exact readEntries/validateEntries helpers the
 * PR gate uses, so a pass here means the same thing as a pass there.
 *
 * Usage:
 *   node scripts/audit-catalog.mjs                 # human-readable report
 *   node scripts/audit-catalog.mjs --json          # machine-readable summary
 *   node scripts/audit-catalog.mjs --strict        # exit 1 when problems exist
 *
 * Exit codes: 0 = clean (or report-only), 1 = problems found under --strict,
 * 2 = the catalog could not be read at all.
 */
import { readEntries, validateEntries, orderEntries, LOCALE_CODES, CAT_IDS } from './lib/entries.mjs'

const strict = process.argv.includes('--strict')
const asJson = process.argv.includes('--json')

let entries
try {
  entries = readEntries()
} catch (e) {
  process.stderr.write(`catalog read failed: ${e.message}\n`)
  process.exit(2)
}

const problems = validateEntries(entries)
const byCategory = Object.fromEntries(CAT_IDS.map((id) => [id, 0]))
for (const e of entries) if (Object.hasOwn(byCategory, e.category)) byCategory[e.category] += 1

const missingTranslations = Object.fromEntries(LOCALE_CODES.map((loc) => [loc, 0]))
for (const e of entries) {
  for (const loc of LOCALE_CODES) {
    if (typeof e.description?.[loc] !== 'string' || !e.description[loc].trim()) missingTranslations[loc] += 1
  }
}

const ordered = orderEntries(entries)
const summary = {
  entries: entries.length,
  problems: problems.length,
  byCategory,
  missingTranslations,
  ordered: ordered.length,
}

if (asJson) {
  process.stdout.write(JSON.stringify({ ...summary, issues: problems }, null, 2) + '\n')
} else {
  const lines = [
    `Catalog audit: ${summary.entries} entries, ${summary.problems} problem(s)`,
    '',
    'By category:',
    ...CAT_IDS.map((id) => `  ${id.padEnd(10)} ${byCategory[id]}`),
    '',
    'Missing descriptions (by locale):',
    ...LOCALE_CODES.map((loc) => `  ${loc.padEnd(10)} ${missingTranslations[loc]}`),
    '',
  ]
  if (problems.length) {
    lines.push('Problems:', ...problems.map((p) => `  - ${p}`), '')
  } else {
    lines.push('No schema problems found.', '')
  }
  process.stdout.write(lines.join('\n'))
}

if (strict && problems.length > 0) process.exit(1)