import assert from 'node:assert/strict'
import test from 'node:test'
import {
  catalogIndex, isPluginTerm, markerIn, planAdoption, resolveRenamed, resolveTerm, sha1Hex,
} from './lib/adopt.mjs'

// The values in these tests are not invented. They are read off the live
// repository: thread #5695 carries `<!-- sha1: 300dc421… -->`, and the
// catalog's lowercasing era is what filed #5647 under
// `plugin:featherhunter/dsh-prompt` while the market asks for
// `plugin:FeatherHunter/dsh-prompt`. A test that restated the rule instead of
// the observed value would have passed through both of those.

const PLUGINS = 'DIC_kwDOT3ajCc4DES8_'
const GENERAL = 'DIC_kwDOT3ajCc4DES8c'

test('hashes a term the way giscus does', () => {
  assert.equal(sha1Hex('plugin:rand0wn/dsh-malware-audit'), '300dc42172724983825a7d6c543bdcab1fa27933')
})

test('recognises a plugin term and nothing else', () => {
  assert.equal(isPluginTerm('plugin:rand0wn/dsh-malware-audit'), true)
  assert.equal(isPluginTerm('plugin:zhu1090093659/dsh-web--packages-dsh-web-all'), true)
  // real titles from this repository's discussions
  assert.equal(isPluginTerm('为什么左侧的工作区无法显示壁纸，还是原本的边框？'), false)
  assert.equal(isPluginTerm('one bug'), false)
  assert.equal(isPluginTerm('plugin:awesome-dsh-plugin'), false)
  assert.equal(isPluginTerm('plugin:owner/repo '), false)
})

function index(urls) {
  return catalogIndex(urls.map((url) => ({ url })))
}

test('resolves a title the catalog still publishes', () => {
  const catalog = index(['https://github.com/rand0wn/dsh-malware-audit', 'https://github.com/a/b/tree/main/packages/x'])
  assert.deepEqual(resolveTerm('plugin:rand0wn/dsh-malware-audit', catalog), { slug: 'rand0wn/dsh-malware-audit', how: 'exact' })
  assert.deepEqual(resolveTerm('plugin:a/b--packages-x', catalog), { slug: 'a/b--packages-x', how: 'exact' })
  assert.equal(resolveTerm('plugin:nobody/gone', catalog), null)
})

test('resolves a title the catalog publishes in another case', () => {
  const catalog = index(['https://github.com/FeatherHunter/dsh-prompt'])
  assert.deepEqual(resolveTerm('plugin:featherhunter/dsh-prompt', catalog), { slug: 'FeatherHunter/dsh-prompt', how: 'case' })
  // and the same shape the other way round, so the rule is not "lowercase wins"
  const upper = index(['https://github.com/featherhunter/dsh-prompt'])
  assert.deepEqual(resolveTerm('plugin:FeatherHunter/dsh-prompt', upper), { slug: 'featherhunter/dsh-prompt', how: 'case' })
})

test('re-links a renamed repository only when the entry kept its shape', () => {
  const catalog = index(['https://github.com/slow-stack/mneme/tree/main/dsh-mneme', 'https://github.com/FSMargoo/dsh-at-file'])
  // whole repository, whole repository: the rename is the same plugin
  assert.deepEqual(resolveRenamed('plugin:omdsh-dev/dsh-at-file', 'FSMargoo/dsh-at-file', catalog), { slug: 'FSMargoo/dsh-at-file', how: 'renamed' })
  // the plugin moved into a subdirectory: same repository, different shape
  assert.equal(resolveRenamed('plugin:modusensus/dsh-mneme', 'slow-stack/mneme', catalog), null)
  // a repository publishing several subdirectories, none of them this one
  const many = index(['https://github.com/o/r/tree/main/packages/a', 'https://github.com/o/r/tree/main/packages/b'])
  assert.equal(resolveRenamed('plugin:old/r--packages-c', 'o/r', many), null)
})

test('adopts a hand-made thread by appending the marker', () => {
  const body = '# plugin:ranxianglei/billion-context\n\n插件新上,有问题大家提交issue\n'
  const plan = planAdoption({ desiredTerm: 'plugin:ranxianglei/billion-context', body, categoryId: GENERAL, pluginsCategoryId: PLUGINS })
  assert.equal(plan.categoryId, PLUGINS)
  // the author's text survives the edit, verbatim
  assert.equal(plan.body.startsWith(body.trimEnd()), true)
  assert.equal(markerIn(plan.body), sha1Hex('plugin:ranxianglei/billion-context'))
  assert.equal(plan.body.endsWith('\n'), true)
})

test('corrects a marker that names another term, and leaves the rest alone', () => {
  const body = `# plugin:featherhunter/dsh-prompt\n\nhttp://127.0.0.1:3080/\n\n<!-- sha1: ${sha1Hex('plugin:featherhunter/dsh-prompt')} -->\n`
  const plan = planAdoption({ desiredTerm: 'plugin:FeatherHunter/dsh-prompt', body, categoryId: PLUGINS, pluginsCategoryId: PLUGINS })
  assert.equal(plan.categoryId, undefined)
  assert.equal(plan.body.includes('http://127.0.0.1:3080/'), true)
  assert.equal(markerIn(plan.body), sha1Hex('plugin:FeatherHunter/dsh-prompt'))
  assert.equal(plan.body.match(/<!--/gu).length, 1)
})

test('plans nothing for a thread that is already readable', () => {
  const term = 'plugin:rand0wn/dsh-malware-audit'
  const body = `# ${term}\n\n\n\nhttp://127.0.0.1:43120/\n\n<!-- sha1: ${sha1Hex(term)} -->`
  assert.equal(planAdoption({ desiredTerm: term, body, categoryId: PLUGINS, pluginsCategoryId: PLUGINS }), null)
})

test('adopts an empty body', () => {
  const plan = planAdoption({ desiredTerm: 'plugin:a/b', body: null, categoryId: GENERAL, pluginsCategoryId: PLUGINS })
  assert.equal(plan.body, `<!-- sha1: ${sha1Hex('plugin:a/b')} -->\n`)
})
