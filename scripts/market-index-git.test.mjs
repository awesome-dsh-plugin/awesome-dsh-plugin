import test from 'node:test'
import assert from 'node:assert/strict'
import { buildMarketIndex } from './lib/market-index.mjs'
const url='https://github.com/owner/plugin'
const entries=[{url,name:'Plugin',category:'tools',description:{en:'Example'}}]
const record={name:'example-plugin',version:'1.2.3',publishedAt:1792634420,commit:'a'.repeat(40)}
const build=(git=record,npmMap={})=>buildMarketIndex({entries,npmMap,gitMap:{[url]:git},locales:[{code:"en",categories:{tools:"Tools"}}]})
test('Git-only packages are listed with immutable identity, including negative npm probes',()=>{
  for(const npm of [{},{[url]:{npm:null}}]) {
    const result=build(record,npm)
    assert.equal(result.index.plugins[0].name,'example-plugin')
    assert.deepEqual(result.index.plugins[0].versions[0].source,{type:'git',url,commit:record.commit})
    assert.equal(result.skipped.noNpm,0)
  }
})
test('npm route keeps precedence and old metadata omissions keep their diagnostics',()=>{
  assert.equal(build(record,{[url]:{npm:'npm-plugin',version:'2.0.0',publishedAt:1792634420}}).index.plugins[0].versions[0].source.type,'npm')
  assert.equal(build(undefined).index.plugins.length,1)
  assert.equal(build(null).skipped.noNpm,1)
  assert.equal(build({...record,version:undefined}).skipped.noVersion,1)
  assert.equal(build({...record,publishedAt:undefined}).skipped.noPublishTime,1)
})
test('mutable refs and invalid Git metadata are refused rather than guessed',()=>{
  for(const commit of ['master','v1.2.3','abcdef',null]) {
    const result=build({...record,commit})
    assert.equal(result.index.plugins.length,0)
    assert.equal(result.skipped.refused,1)
  }
  assert.equal(build({...record,name:'invalid name'}).skipped.refused,1)
})
