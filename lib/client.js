// dsh-quota-capsule — Client half.
// Floating capsule mounted from the session-scoped composer dock (so it reads
// the CURRENT session's model, not the global default), rendered fixed at the
// bottom-right. Polls the host route every 30 s. Collapsed: colored dot +
// headline percentage of the provider's busiest window. Expanded: per-window
// progress bars with reset countdowns, plan tier, balance, and error states.

window.__ModuleLoader__.load({
  id: '@heiweilu/dsh-quota-capsule',
  factory: (require) => {
    const React = require('react')
    const module = { exports: {} }

    const ROUTE = '/dsh-quota-capsule/state'
    const POLL_MS = 30_000

    // Theme-adaptive semantic colors (DSH tokens carry both light and dark values)
    function pctColor(usedPct) {
      if (usedPct === undefined || usedPct === null) return 'var(--dsw-alias-label-secondary)'
      if (usedPct < 60) return 'var(--dsw-alias-state-success-primary)'
      if (usedPct < 85) return 'var(--dsw-alias-state-warn-primary)'
      return 'var(--dsw-alias-state-error-primary)'
    }

    function fmtCountdown(resetAt, now) {
      if (!resetAt) return ''
      const ms = resetAt - now
      if (ms <= 0) return '即将重置'
      const h = Math.floor(ms / 3600000)
      const m = Math.floor((ms % 3600000) / 60000)
      if (h >= 24) return `${Math.floor(h / 24)} 天 ${h % 24} 小时后重置`
      if (h > 0) return `${h} 小时 ${m} 分后重置`
      return `${m} 分后重置`
    }

    function Capsule(props) {
      const sessionId = props && props.sessionId
      const [state, setState] = React.useState(null)
      const [open, setOpen] = React.useState(false)
      const [now, setNow] = React.useState(Date.now())

      React.useEffect(() => {
        let alive = true
        const tick = () => {
          const url = sessionId ? `${ROUTE}?session=${encodeURIComponent(sessionId)}` : ROUTE
          fetch(url, { cache: 'no-store' })
            .then((r) => r.json())
            .then((j) => { if (alive) setState(j) })
            .catch(() => { if (alive) setState({ ok: false, reason: 'unreachable' }) })
        }
        tick()
        const t = setInterval(tick, POLL_MS)
        const c = setInterval(() => setNow(Date.now()), 30_000)
        return () => { alive = false; clearInterval(t); clearInterval(c) }
      }, [sessionId])

      const windows = state && Array.isArray(state.windows) ? state.windows : []
      // 头条固定取 5 小时窗口（最即时的限流维度）；没有 5h 才退回第一个窗口
      const headline = windows.length > 0
        ? (windows.find((w) => w.key === '5h') || windows[0])
        : null
      const dotPct = headline ? headline.usedPct : undefined
      const hasBalance = state && state.balance && state.balance.amount !== undefined

      const wrapStyle = {
        position: 'fixed',
        right: 16,
        bottom: 76,
        zIndex: 60,
        fontFamily: 'inherit',
        userSelect: 'none',
      }
      const pillStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: 999,
        fontSize: 12,
        lineHeight: '18px',
        cursor: 'pointer',
        border: '1px solid var(--dsw-alias-border-l1)',
        background: 'var(--dsw-alias-bg-layer-1)',
        backdropFilter: 'blur(8px)',
        color: 'var(--dsw-alias-label-primary)',
      }
      const dotStyle = {
        width: 8,
        height: 8,
        borderRadius: 4,
        background: pctColor(dotPct),
        flex: 'none',
      }
      const cardStyle = {
        position: 'absolute',
        right: 0,
        bottom: 30,
        width: 260,
        padding: '10px 12px',
        borderRadius: 10,
        border: '1px solid var(--dsw-alias-border-l1)',
        background: 'var(--dsw-alias-bg-overlay)',
        color: 'var(--dsw-alias-label-primary)',
        boxShadow: '0 6px 24px rgba(0,0,0,0.18)',
        fontSize: 12,
      }
      const barBg = { height: 6, borderRadius: 3, background: 'var(--dsw-alias-bg-layer-2)', overflow: 'hidden', marginTop: 4 }
      const mutedStyle = { color: 'var(--dsw-alias-label-secondary)' }

      let pillText = '…'
      if (state) {
        if (!state.ok) {
          pillText = state.reason === 'unsupported-provider'
            ? String(state.label || state.provider || 'n/a')
            : state.reason === 'no-key'
              ? `${state.label} 无 key`
              : state.reason === 'adapter-pending'
                ? `${state.label} 待支持`
                : `${state.label || ''} 异常`
        } else if (headline && headline.usedPct !== undefined) {
          pillText = `${state.label} ${100 - headline.usedPct}%`
        } else if (hasBalance) {
          pillText = `${state.label} ¥${state.balance.amount}`
        } else {
          pillText = state.label || 'n/a'
        }
      }

      return React.createElement(
        'div',
        { style: wrapStyle, 'data-dsh-quota-capsule': true },
        open && state && React.createElement(
          'div',
          { style: cardStyle },
          React.createElement('div', { style: { fontWeight: 600, marginBottom: 6 } },
            `${state.label || state.provider || '—'}${state.plan ? ` · ${state.plan}` : ''}${state.model ? ` · ${state.model}` : ''}`),
          !state.ok && React.createElement('div', { style: { opacity: 0.85 } },
            state.reason === 'unsupported-provider' && '当前供应商暂不支持配额查询',
            state.reason === 'adapter-pending' && '该供应商的配额接口尚未接入，敬请期待',
            state.reason === 'no-key' && '未找到 API key（环境变量或 DSH 凭据库）',
            state.reason === 'fetch-failed' && `查询失败：${state.error || ''}`,
            state.reason === 'unreachable' && '宿主路由不可达',
          ),
          state.ok && windows.map((w) =>
            React.createElement('div', { key: w.key, style: { marginBottom: 8 } },
              React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between' } },
                React.createElement('span', null, w.label),
                React.createElement('span', { style: { opacity: 0.8 } },
                  `${w.usedPct !== undefined ? w.usedPct : '?'}%${w.detail ? ` · ${w.detail}` : ''}`)),
              React.createElement('div', { style: barBg },
                React.createElement('div', {
                  style: {
                    height: '100%',
                    width: `${Math.min(100, Math.max(0, w.usedPct ?? 0))}%`,
                    background: pctColor(w.usedPct),
                    transition: 'width .3s',
                  },
                })),
              React.createElement('div', { style: { opacity: 0.6, marginTop: 2 } }, fmtCountdown(w.resetAt, now)),
            )),
          state.ok && hasBalance && React.createElement(
            'div',
            { style: { marginTop: 2 } },
            `余额：¥${state.balance.amount} ${state.balance.currency || ''}`),
          state.ok && windows.length === 0 && !hasBalance && React.createElement('div', null, '该供应商只提供余额或无配额窗口数据'),
          React.createElement('div', { style: { opacity: 0.5, marginTop: 6, textAlign: 'right' } },
            state.updatedAt ? `更新于 ${new Date(state.updatedAt).toLocaleTimeString()}` : ''),
        ),
        React.createElement(
          'div',
          {
            style: pillStyle,
            role: 'button',
            title: '配额用量',
            onClick: () => setOpen(!open),
          },
          React.createElement('span', { style: dotStyle }),
          React.createElement('span', null, pillText),
        ),
      )
    }

    function apply(ctx) {
      const slots = ctx.get('slots')
      if (slots === undefined) return
      ctx.effect(() =>
        // conversation.composer.dock is session-scoped: its standard props carry
        // sessionId, which the route needs to resolve the session's model.
        // The pill itself renders position:fixed, so the dock band stays empty.
        slots.inject('conversation.composer.dock', () =>
          slots.register(
            { name: 'conversation.composer.dock', id: 'dsh-quota-capsule', order: 90, label: 'Quota Capsule' },
            (props) => React.createElement(Capsule, props),
          )),
        'quota-capsule: dock',
      )
    }

    module.exports.apply = apply
    module.exports.inject = ['slots']
    return module.exports
  },
})
