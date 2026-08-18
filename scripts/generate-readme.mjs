// Generate the plugin list + table of contents in every README from
// data/plugins/*.yml. Everything outside the marker blocks (badges, banner,
// intro, Contributing / Badge / Disclaimer) stays hand-maintained.
//
//   node scripts/generate-readme.mjs          # write
//   node scripts/generate-readme.mjs --check  # verify in sync (CI)
import fs from 'node:fs'
import LOCALES from '../site/locales.mjs'
import { BASE_LOCALE, CAT_EMOJI, CAT_IDS, orderEntries, readEntries, validateEntries } from './lib/entries.mjs'

const CHECK = process.argv.includes('--check')

const MARKERS = {
  toc: ['<!-- BEGIN TOC -->', '<!-- END TOC -->'],
  plugins: ['<!-- BEGIN PLUGINS -->', '<!-- END PLUGINS -->'],
}

/**
 * GitHub heading anchor: lowercase, drop everything that isn't a letter,
 * digit, space or hyphen, then turn each remaining space into a hyphen.
 *
 * Dropping a character without collapsing its neighbouring spaces is what
 * produces the two anchors that look like typos but aren't:
 *   "Themes & Appearance" -> "themes--appearance"  (& removed, both spaces kept)
 *   "🎨 UI 增强"          -> "-ui-增强"            (emoji removed, its space kept)
 */
function anchor(heading) {
  return heading
    .toLowerCase()
    .replace(/[^\p{L}\p{N} -]/gu, '') // drops "&", emoji, variation selectors, ZWJ
    .replaceAll(' ', '-')
}

/** Translated READMEs carry an emoji prefix on headings; README.md does not. */
function headingFor(loc, id) {
  const name = loc.categories[id]
  return loc.code === 'en' ? name : `${CAT_EMOJI[id]} ${name}`
}

// The non-category rows of the Contents list. awesome-lint wants one single
// list, so the markers wrap the whole thing and these are emitted too — an
// HTML comment in the middle of the list splits it into two and trips
// remark-lint:awesome-toc. `## Contributing` is deliberately not listed.
const TOC_SHELL = {
  en: { top: 'Plugins', tail: ['Badge', 'Disclaimer'] },
  zh: { top: '插件', tail: ['徽章', '免责声明'] },
}

function replaceBlock(text, [open, close], body, file) {
  const i = text.indexOf(open)
  const j = text.indexOf(close)
  if (i === -1 || j === -1 || j < i) {
    console.error(`${file}: missing marker pair ${open} … ${close}`)
    process.exit(1)
  }
  return text.slice(0, i + open.length) + '\n' + body + '\n' + text.slice(j)
}

/**
 * Every entry line build-site.mjs would parse out of a README, wherever it
 * sits. Replacing the marker blocks only guarantees what's inside them, so
 * this catches an entry smuggled in outside — e.g. a second
 * `### UI Enhancements` after `<!-- END PLUGINS -->`, which the site would
 * happily publish even though no YAML file backs it.
 */
function parsedUrls(loc) {
  const urls = new Set()
  let cat = null
  for (const line of fs.readFileSync(loc.readme, 'utf8').split('\n')) {
    const h = line.match(/^#{2,3} (.+)$/)
    if (h) {
      cat = CAT_IDS.find((id) => h[1].includes(loc.categories[id])) ?? null
      continue
    }
    const m = line.match(/^- \[(.+?)\]\((https:\/\/github\.com\/[^)]+)\) ([—-]) (.+)$/)
    if (m && cat) urls.add(m[2])
  }
  return urls
}

let entries
try {
  entries = readEntries()
} catch (e) {
  // A parse failure is a contributor's typo, not a crash — print it as a
  // reviewable message instead of a stack trace.
  console.error(e.message)
  process.exit(1)
}
const problems = validateEntries(entries)
if (problems.length) {
  for (const p of problems) console.error(`  ${p}`)
  console.error(`\n${problems.length} problem(s) in data/plugins — refusing to generate.`)
  process.exit(1)
}

const ordered = orderEntries(entries)
const used = CAT_IDS.filter((id) => ordered.some((e) => e.category === id))

let stale = false
const untranslated = []
for (const loc of LOCALES) {
  const shell = TOC_SHELL[loc.code]
  if (!shell) {
    console.error(`${loc.readme}: no TOC_SHELL entry for locale "${loc.code}" — add one in generate-readme.mjs`)
    process.exit(1)
  }
  const toc = [
    `- [${shell.top}](#${anchor(shell.top)})`,
    ...used.map((id) => `  - [${headingFor(loc, id)}](#${anchor(headingFor(loc, id))})`),
    ...shell.tail.map((t) => `- [${t}](#${anchor(t)})`),
  ].join('\n')

  const plugins = used
    .map((id) => {
      const lines = ordered
        .filter((e) => e.category === id)
        .map((e) => {
          // Untranslated entries render their English text rather than blocking
          // the build — an honest gap a maintainer closes later.
          const d = e.description[loc.code] ?? e.description[BASE_LOCALE]
          if (e.description[loc.code] === undefined) untranslated.push(`${loc.readme}: ${e.url}`)
          return `- [${e.name}](${e.url}) ${loc.sep} ${d}`
        })
      return `### ${headingFor(loc, id)}\n\n${lines.join('\n')}`
    })
    .join('\n\n')

  const before = fs.readFileSync(loc.readme, 'utf8')
  let after = replaceBlock(before, MARKERS.toc, toc, loc.readme)
  after = replaceBlock(after, MARKERS.plugins, plugins, loc.readme)

  if (before !== after) {
    if (CHECK) {
      console.error(`${loc.readme} is out of sync with data/plugins/`)
      stale = true
      continue
    }
    fs.writeFileSync(loc.readme, after)
    console.log(`${loc.readme}: regenerated (${ordered.length} entries)`)
  } else {
    console.log(`${loc.readme}: up to date (${ordered.length} entries)`)
  }

  // Set check: the README as a whole (markers or not) must parse to exactly
  // the URLs data/plugins declares — no smuggled or missing entries anywhere.
  const inReadme = parsedUrls(loc)
  const inData = new Set(ordered.map((e) => e.url))
  const smuggled = [...inReadme].filter((u) => !inData.has(u))
  const missing = [...inData].filter((u) => !inReadme.has(u))
  for (const u of smuggled) console.error(`${loc.readme}: ${u} appears in the README but has no data/plugins file`)
  for (const u of missing) console.error(`${loc.readme}: ${u} is declared in data/plugins but the README doesn't list it`)
  if (smuggled.length || missing.length) stale = true
}

if (untranslated.length) {
  console.log(`\n${untranslated.length} entr${untranslated.length === 1 ? 'y' : 'ies'} awaiting translation (showing ${BASE_LOCALE} for now):`)
  for (const u of untranslated.slice(0, 20)) console.log(`  ${u}`)
  if (untranslated.length > 20) console.log(`  … and ${untranslated.length - 20} more`)
}

if (stale) {
  console.error('\nRun `node scripts/generate-readme.mjs` and commit the result.')
  process.exit(1)
}

// contributing.md lists the valid category values for contributors to copy.
// It drifted once already — `usage` and `vision` were added to the taxonomy
// and the docs kept advertising the old twelve — so the list is checked here
// rather than trusted to stay in step by hand.
{
  const doc = fs.readFileSync('contributing.md', 'utf8')
  const want = CAT_IDS.map((c) => `\`${c}\``).join(' ')
  if (!doc.includes(want)) {
    console.error(`contributing.md: the category list is out of date — it should read\n  ${want}`)
    process.exit(1)
  }
}
