// Make a plugin's comment thread readable again.
//
// A widget finds a plugin's thread by asking giscus for a term, and giscus
// answers with a search that has two hard requirements, both measured against
// the live repository rather than read off the docs:
//
//   * the discussion has to sit in the configured CATEGORY. The search string
//     carries `category:"Plugins"`; the same thread answers 200 with
//     `category=Plugins` and 404 with `category=General`.
//   * its BODY has to contain `<!-- sha1: <sha1(term)> -->`, because `strict`
//     matching hashes the term and searches the body for it. That is also why
//     the marker exists at all: a title search is unusable here — asking for
//     `plugin:zhu1090093659/dsh-web` returns the `--packages-dsh-web-all`
//     thread, which is a different plugin sharing a prefix.
//
// A thread a human created in the GitHub UI satisfies neither, so the widget
// finds nothing, giscus opens a second thread, and the comments are split
// across two discussions that each look fine on their own. This script adopts
// those threads instead: it appends the marker to the body and moves the
// discussion into the plugin category. It never deletes, merges or retitles
// anything — a title is what the author called their thread, and the marker is
// the only thing the widgets actually read.
//
// Run by .github/workflows/adopt-discussions.yml on every new discussion, and
// on demand over the whole backlog (which is also how a thread whose
// repository was renamed gets re-linked to the slug the catalog publishes now).
//
//   GITHUB_TOKEN=... node scripts/adopt-discussions.mjs --dry-run
//   GITHUB_TOKEN=... node scripts/adopt-discussions.mjs --number=5795
//
import { readEntries } from './lib/entries.mjs'
import { catalogIndex, isPluginTerm, planAdoption, resolveRenamed, resolveTerm } from './lib/adopt.mjs'

const REPO = process.env.GITHUB_REPOSITORY ?? 'awesome-dsh-plugin/awesome-dsh-plugin'
const [OWNER, NAME] = REPO.split('/')
const CATEGORY = 'Plugins'
const DRY = process.argv.includes('--dry-run')
const NUMBER = Number(process.argv.find((a) => a.startsWith('--number='))?.slice('--number='.length) ?? '') || null
const API = 'https://api.github.com'

const TOKEN = process.env.GITHUB_TOKEN
if (!TOKEN) {
  console.log('no GITHUB_TOKEN — skipping discussion adoption')
  process.exit(0)
}
const HEADERS = { accept: 'application/vnd.github+json', authorization: `Bearer ${TOKEN}`, 'user-agent': 'awesome-dsh-plugin-adopt-discussions' }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Same shape as scan-decay.mjs's helper, for the same reason: GitHub's
// *secondary* rate limiter answers 403 while `rate_limit` still reports the
// quota untouched, so a 403 here is a retry, not a verdict. A sweep is a
// handful of calls, but the schedule and a maintainer's manual run can overlap.
async function api(pathname, opts = {}) {
  for (let attempt = 0; ; attempt++) {
    const r = await fetch(`${API}/${pathname}`, { headers: HEADERS, signal: AbortSignal.timeout(20000), ...opts })
    if (r.status === 404) return { status: 404 }
    if (r.ok) return { status: 200, body: await r.json().catch(() => null) }
    if ((r.status === 403 || r.status === 429 || r.status >= 500) && attempt < 3) {
      await sleep(2000 * 2 ** attempt)
      continue
    }
    throw new Error(`${pathname}: ${r.status} ${await r.text().catch(() => '')}`.slice(0, 300))
  }
}

async function graphql(query, variables) {
  const r = await api('graphql', { method: 'POST', body: JSON.stringify({ query, variables }) })
  if (r.body?.errors?.length) throw new Error(`graphql: ${r.body.errors.map((e) => e.message).join('; ')}`)
  return r.body.data
}

const DISCUSSIONS_QUERY = `query($owner:String!,$name:String!,$cursor:String){
  repository(owner:$owner,name:$name){
    discussionCategories(first:25){nodes{id name}}
    discussions(first:100,after:$cursor,orderBy:{field:UPDATED_AT,direction:DESC}){
      pageInfo{hasNextPage endCursor}
      nodes{ id number title body category{id name} }
    }
  }
}`

const ONE_QUERY = `query($owner:String!,$name:String!,$number:Int!){
  repository(owner:$owner,name:$name){
    discussionCategories(first:25){nodes{id name}}
    discussion(number:$number){ id number title body category{id name} }
  }
}`

const UPDATE_MUTATION = `mutation($input:UpdateDiscussionInput!){
  updateDiscussion(input:$input){ discussion{ number url } }
}`

async function discussions() {
  if (NUMBER !== null) {
    const data = await graphql(ONE_QUERY, { owner: OWNER, name: NAME, number: NUMBER })
    if (data.repository.discussion === null) throw new Error(`no discussion #${NUMBER} in ${REPO}`)
    return { category: data.repository.discussionCategories.nodes.find((c) => c.name === CATEGORY), list: [data.repository.discussion] }
  }
  const list = []
  let cursor = null
  let category
  do {
    const data = await graphql(DISCUSSIONS_QUERY, { owner: OWNER, name: NAME, cursor })
    category ??= data.repository.discussionCategories.nodes.find((c) => c.name === CATEGORY)
    list.push(...data.repository.discussions.nodes)
    cursor = data.repository.discussions.pageInfo.hasNextPage ? data.repository.discussions.pageInfo.endCursor : null
  } while (cursor !== null)
  return { category, list }
}

/**
 * The repository name GitHub resolves a slug to today, or null when the
 * repository is gone. `repos/old/name` answers with a redirect to the current
 * name, which is the only way to tell a rename (same plugin, new address) from
 * a delisting (no plugin at all).
 */
async function currentRepoName(repo) {
  const r = await api(`repos/${repo}`)
  return r.status === 200 ? r.body.full_name : null
}

async function desiredTerm(thread, catalog) {
  const byTitle = resolveTerm(thread.title, catalog)
  if (byTitle !== null) return byTitle
  const repo = thread.title.slice('plugin:'.length).split('--')[0]
  const current = await currentRepoName(repo)
  if (current === null) return { slug: null, how: 'gone', repo, current }
  const renamed = resolveRenamed(thread.title, current, catalog)
  return renamed ?? { slug: null, how: 'unlisted', repo, current }
}

const { category, list } = await discussions()
if (category === undefined) throw new Error(`no "${CATEGORY}" discussion category in ${REPO} — refusing to touch anything`)

const catalog = catalogIndex(await readEntries('data/plugins'))
const pluginThreads = list.filter((d) => isPluginTerm(d.title))
console.log(`${pluginThreads.length} plugin thread(s) of ${list.length} discussion(s); category "${CATEGORY}" is ${category.id}${DRY ? ' (dry run)' : ''}`)

let adopted = 0
const skipped = []
for (const thread of pluginThreads) {
  const target = await desiredTerm(thread, catalog)
  if (target.slug === null) {
    skipped.push(`#${thread.number} ${thread.title} — ${target.how === 'gone' ? `repository ${target.repo} is gone` : `${target.repo} now resolves to ${target.current}, and no entry there has this shape`}`)
    continue
  }
  const plan = planAdoption({
    desiredTerm: `plugin:${target.slug}`,
    body: thread.body,
    categoryId: thread.category?.id ?? null,
    pluginsCategoryId: category.id,
  })
  if (plan === null) continue
  const what = [
    plan.body === undefined ? null : 'marker',
    plan.categoryId === undefined ? null : `category ${thread.category?.name ?? 'none'} → ${CATEGORY}`,
  ].filter(Boolean).join(', ')
  console.log(`${DRY ? 'would adopt' : 'adopt'} #${thread.number} ${thread.title} [${target.how}] — ${what}`)
  if (DRY) { adopted += 1; continue }
  const input = { discussionId: thread.id }
  if (plan.body !== undefined) input.body = plan.body
  if (plan.categoryId !== undefined) input.categoryId = plan.categoryId
  await graphql(UPDATE_MUTATION, { input })
  adopted += 1
}

console.log(`${DRY ? 'would adopt' : 'adopted'} ${adopted} thread(s); ${skipped.length} need a human`)
for (const line of skipped) console.log(`  ${line}`)
