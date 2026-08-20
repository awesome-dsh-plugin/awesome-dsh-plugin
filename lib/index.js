// dsh-quota-capsule — Host half.
//
// Polls the current model provider's plan-quota/balance API and serves the
// normalized result on a same-origin route the client half polls.
//
// Key resolution order per provider: process env first, then the DSH local
// credential store (~/.dsh/.credentials.yaml, `KEY: value` per line).
// Keys are never logged and never leave the host except to their own API.

import { request as httpsRequest } from 'node:https'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'

export const name = 'dsh-quota-capsule'

const ROUTE = '/dsh-quota-capsule/state'
const POLL_MS = 60_000
const HTTP_TIMEOUT_MS = 12_000

// ────────────────────────────── credential store ─────────────────────────────

function dshHome() {
  return process.env.DSH_HOME || join(homedir(), '.dsh')
}

let credFileCache = null
function readCredentialFile() {
  if (credFileCache !== null) return credFileCache
  credFileCache = new Map()
  try {
    const file = join(dshHome(), '.credentials.yaml')
    if (existsSync(file)) {
      const raw = readFileSync(file, 'utf8')
      for (const line of raw.split(/\r?\n/)) {
        const m = /^\s*([A-Za-z0-9_]+)\s*:\s*"?([^"\r\n]*)?"?\s*$/.exec(line)
        if (m && m[2] && m[2].trim() !== '') credFileCache.set(m[1], m[2].trim())
      }
    }
  } catch {
    /* unreadable store = unconfigured */
  }
  return credFileCache
}

function resolveKey(envKeys) {
  for (const k of envKeys) {
    const v = process.env[k]
    if (typeof v === 'string' && v.trim() !== '') return v.trim()
  }
  const file = readCredentialFile()
  for (const k of envKeys) {
    const v = file.get(k)
    if (v) return v
  }
  return undefined
}

// ────────────────────────────── http helper ──────────────────────────────

function httpGetJson(url, headers) {
  return new Promise((resolve, reject) => {
    const u = new URL(url)
    const req = httpsRequest(
      {
        hostname: u.hostname,
        port: u.port === '' ? 443 : Number(u.port),
        path: u.pathname + u.search,
        method: 'GET',
        headers,
        timeout: HTTP_TIMEOUT_MS,
      },
      (res) => {
        let data = ''
        res.on('data', (c) => {
          data += c
          if (data.length > 512 * 1024) req.destroy(new Error('response too large'))
        })
        res.on('end', () => {
          if (res.statusCode !== 200) {
            reject(new Error(`HTTP ${res.statusCode}`))
            return
          }
          try {
            resolve(JSON.parse(data))
          } catch {
            reject(new Error('invalid JSON'))
          }
        })
      },
    )
    req.on('timeout', () => req.destroy(new Error('timeout')))
    req.on('error', reject)
    req.end()
  })
}

// ────────────────────────────── provider adapters ─────────────────────────────
// Every adapter returns: { windows: WindowEntry[], balance?, plan? } | throws
// WindowEntry: { key, label, usedPct (0-100, used), detail, resetAt (ms epoch) }

const ADAPTERS = [
  {
    id: 'glm',
    label: 'GLM Coding',
    match: ['zai-coding-cn', 'zai-coding', 'zai'],
    envKeys: ['ZAI_CODING_CN_API_KEY', 'ZAI_API_KEY'],
    async query(key) {
      const json = await httpGetJson('https://open.bigmodel.cn/api/monitor/usage/quota/limit', {
        Authorization: key, // raw key, no Bearer prefix (vendor convention)
        'Content-Type': 'application/json',
      })
      const limits = json && json.data && Array.isArray(json.data.limits) ? json.data.limits : []
      const windows = []
      for (const l of limits) {
        const entry = {
          usedPct: typeof l.percentage === 'number' ? l.percentage : undefined,
          detail: `${fmtNum(l.currentValue)}/${fmtNum(l.usage)}`,
          resetAt: typeof l.nextResetTime === 'number' ? l.nextResetTime : undefined,
        }
        if (l.unit === 3) windows.push({ key: '5h', label: '5 小时窗口', ...entry })
        else if (l.unit === 6) windows.push({ key: 'weekly', label: '周窗口', ...entry })
        else windows.push({ key: `unit-${l.unit}`, label: `窗口(unit ${l.unit})`, ...entry })
      }
      return { windows, plan: json.data && json.data.level }
    },
  },
  {
    id: 'kimi',
    label: 'Kimi Coding',
    match: ['kimi-coding', 'kimi'],
    envKeys: ['KIMI_CODING_API_KEY', 'KIMI_API_KEY'],
    async query(key) {
      const json = await httpGetJson('https://api.kimi.com/coding/v1/usages', {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      })
      const windows = []
      const fiveMin = Array.isArray(json.limits) ? json.limits[0] : undefined
      if (fiveMin && fiveMin.detail) {
        const d = fiveMin.detail
        const limit = Number(d.limit)
        const used = Number(d.used)
        windows.push({
          key: '5h',
          label: '5 小时窗口',
          usedPct: limit > 0 ? Math.round((used / limit) * 100) : undefined,
          detail: `${d.used}/${d.limit}`,
          resetAt: d.resetTime ? Date.parse(d.resetTime) : undefined,
        })
      }
      if (json.usage) {
        const u = json.usage
        const limit = Number(u.limit)
        const used = Number(u.used)
        windows.push({
          key: 'weekly',
          label: '周窗口',
          usedPct: limit > 0 ? Math.round((used / limit) * 100) : undefined,
          detail: `${u.used}/${u.limit}`,
          resetAt: u.resetTime ? Date.parse(u.resetTime) : undefined,
        })
      }
      const plan = json.user && json.user.membership ? json.user.membership.level : undefined
      return { windows, plan }
    },
  },
  {
    id: 'minimax',
    label: 'MiniMax',
    match: ['minimax-cn', 'minimax'],
    envKeys: ['MINIMAX_CN_API_KEY', 'MINIMAX_API_KEY'],
    async query(key) {
      const json = await httpGetJson('https://api.minimaxi.com/v1/token_plan/remains', {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      })
      const list = json && Array.isArray(json.model_remains) ? json.model_remains : []
      const general = list.find((m) => m.model_name === 'general') || list[0]
      if (!general) return { windows: [] }
      // MiniMax percents are REMAINING — invert to used.
      const windows = []
      if (typeof general.current_interval_remaining_percent === 'number') {
        windows.push({
          key: '5h',
          label: '5 小时窗口',
          usedPct: 100 - general.current_interval_remaining_percent,
          detail: `${general.current_interval_usage_count}/${general.current_interval_total_count} 次`,
          resetAt: general.end_time,
        })
      }
      if (typeof general.current_weekly_remaining_percent === 'number') {
        windows.push({
          key: 'weekly',
          label: '周窗口',
          usedPct: 100 - general.current_weekly_remaining_percent,
          detail: `${general.current_weekly_usage_count}/${general.current_weekly_total_count} 次`,
          resetAt: general.weekly_end_time,
        })
      }
      return { windows }
    },
  },
  {
    id: 'deepseek',
    label: 'DeepSeek',
    match: ['deepseek'],
    envKeys: ['DEEPSEEK_API_KEY'],
    async query(key) {
      const json = await httpGetJson('https://api.deepseek.com/user/balance', {
        Authorization: `Bearer ${key}`,
      })
      const info = json && Array.isArray(json.balance_infos) ? json.balance_infos[0] : undefined
      return {
        windows: [],
        balance: info ? { amount: info.total_balance, currency: info.currency } : undefined,
      }
    },
  },
  // 需要订阅侧接口/无公开 API 的占位适配器：有 key 时提示暂不支持
  { id: 'codex', label: 'Codex', match: ['codex', 'openai-codex'], envKeys: ['OPENAI_API_KEY'], unsupported: true },
  { id: 'claude', label: 'Claude', match: ['claude', 'anthropic'], envKeys: ['ANTHROPIC_API_KEY'], unsupported: true },
  { id: 'mimo', label: 'MiMo', match: ['mimo', 'xiaomi'], envKeys: ['MIMO_API_KEY'], unsupported: true },
]

function fmtNum(n) {
  if (typeof n !== 'number') return '?'
  if (n >= 10000) return `${(n / 10000).toFixed(1)}w`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

function adapterForProvider(providerId) {
  if (!providerId) return undefined
  const lower = String(providerId).toLowerCase()
  return ADAPTERS.find((a) => a.match.some((m) => lower === m || lower.includes(m)))
}

// ────────────────────────────── plugin ─────────────────────────────

export function apply(ctx) {
  const cache = { at: 0, key: null, payload: null }

  async function buildState(sessionId) {
    const selection = readCurrentSelection(ctx, sessionId)
    const providerId = selection && selection.provider
    const model = selection && selection.model
    const adapter = adapterForProvider(providerId)
    const base = { provider: providerId || null, model: model || null, updatedAt: Date.now() }
    if (!adapter) {
      return { ...base, ok: false, reason: 'unsupported-provider', label: providerId || 'unknown' }
    }
    if (adapter.unsupported) {
      return { ...base, ok: false, reason: 'adapter-pending', label: adapter.label }
    }
    const key = resolveKey(adapter.envKeys)
    if (!key) {
      return { ...base, ok: false, reason: 'no-key', label: adapter.label }
    }
    try {
      const result = await adapter.query(key)
      return { ...base, ok: true, label: adapter.label, ...result }
    } catch (error) {
      return { ...base, ok: false, reason: 'fetch-failed', label: adapter.label, error: String(error && error.message ? error.message : error) }
    }
  }

  async function state(sessionId) {
    const cacheKey = sessionId || '_default'
    if (cache.payload !== null && cache.key === cacheKey && Date.now() - cache.at < 30_000) return cache.payload
    const payload = await buildState(sessionId)
    cache.at = Date.now()
    cache.key = cacheKey
    cache.payload = payload
    return payload
  }

  ctx.inject(['webServer'], (hostCtx) => {
    hostCtx.effect(() => {
      const dispose = hostCtx.webServer.register({
        kind: 'exact',
        path: ROUTE,
        handler: async (request, response) => {
          // loopback-only: quota data is account metadata, keep it off the LAN
          const host = String(request.headers.host || '')
          if (!/^(127\.|localhost|\[::1\])/.test(host)) {
            response.writeHead(403, { 'content-type': 'application/json' })
            response.end(JSON.stringify({ ok: false, reason: 'loopback-only' }))
            return
          }
          try {
            const url = new URL(request.url || ROUTE, 'http://127.0.0.1')
            const sessionId = url.searchParams.get('session') || undefined
            const payload = await state(sessionId)
            response.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
            response.end(JSON.stringify(payload))
          } catch (error) {
            response.writeHead(500, { 'content-type': 'application/json' })
            response.end(JSON.stringify({ ok: false, reason: 'internal', error: String(error && error.message ? error.message : error) }))
          }
        },
      })
      return dispose
    }, 'quota-capsule: state route')

    // background warm-up poll so the first client paint hits cache
    hostCtx.effect(() => {
      const t = setInterval(() => {
        state().catch(() => {})
      }, POLL_MS)
      state().catch(() => {})
      return () => clearInterval(t)
    }, 'quota-capsule: poller')
  })
}

function readCurrentSelection(ctx, sessionId) {
  // 会话级选择优先：apiproxy 的同款读法——agent.session.requestHeader().config
  // 携带最近一次请求的 provider/model/reasoningEffort（用户在交互栏切换后生效）。
  if (sessionId) {
    try {
      const agents = ctx.get('agents')
      const agent = agents && typeof agents.get === 'function' ? agents.get(sessionId) : undefined
      const cfg = agent && agent.session && typeof agent.session.requestHeader === 'function'
        ? agent.session.requestHeader()?.config
        : undefined
      if (cfg && cfg.provider) {
        return { provider: cfg.provider, model: cfg.model ?? null }
      }
    } catch {
      /* fall through to the default */
    }
  }
  try {
    const svc = ctx.get('agentDefaultModel')
    if (svc && typeof svc.currentSelection === 'function') {
      const sel = svc.currentSelection()
      if (sel && typeof sel === 'object') {
        return {
          provider: sel.provider ?? sel.providerId ?? null,
          model: sel.model ?? sel.modelId ?? null,
        }
      }
    }
  } catch {
    /* service absent or shape drifted */
  }
  return null
}
