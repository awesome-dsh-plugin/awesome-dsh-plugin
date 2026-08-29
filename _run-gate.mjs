// 复刻 GitHub CI 调法: 只检我的 1 个条目 + --pr-created (我的 PR 创建时间)
import { execSync } from 'node:child_process'
const p = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim()
const entryFile = 'jiang12345-code__dsh-multi-role-debate.yml'
const cmd = `node scripts/check-submission.mjs --only-list /tmp/mylist.txt --pr-created 2026-08-28T13:59:00Z --json /tmp/gate-result.json`
import { writeFileSync } from 'node:fs'
writeFileSync('/tmp/mylist.txt', entryFile)
console.log('running:', cmd)
execSync(cmd, { stdio: 'inherit' })