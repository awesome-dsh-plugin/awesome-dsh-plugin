import assert from 'node:assert/strict'
import test from 'node:test'
import { publishedNpmName } from './lib/npm-name.mjs'

test('DOTS resolves its published scoped npm identity without renaming the source bundle', () => {
  assert.equal(publishedNpmName('Tests4gptplay/dsh-dots', 'dsh-dots'), '@tests4gptplay/dsh-dots')
})

test('all other plugin names continue to use their package.json identities', () => {
  assert.equal(publishedNpmName('Tests4gptplay/dsh-video-vision', '@tests4gptplay/dsh-video-vision'), '@tests4gptplay/dsh-video-vision')
  assert.equal(publishedNpmName('Tests4gptplay/deepseek-servant', 'deepseek-servant'), 'deepseek-servant')
})

test('a similarly named package in another repository does not inherit the DOTS mapping', () => {
  assert.equal(publishedNpmName('other/dsh-dots', 'dsh-dots'), 'dsh-dots')
})

test('the mapping does not override a future source-declared npm identity', () => {
  assert.equal(publishedNpmName('Tests4gptplay/dsh-dots', '@tests4gptplay/dsh-dots'), '@tests4gptplay/dsh-dots')
  assert.equal(publishedNpmName('Tests4gptplay/dsh-dots', 'other-name'), 'other-name')
})
