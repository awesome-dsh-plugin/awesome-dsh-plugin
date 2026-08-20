# dsh-quota-capsule

[中文](README.zh.md)

Provider quota capsule for the DSH (DeepSeek Harness) Web UI. A small floating
capsule at the bottom-right shows the **current model provider's** plan usage:
colored dot + remaining percentage; click to expand per-window progress bars
with reset countdowns.

## Supported providers

| Provider | Data | Windows |
|---|---|---|
| GLM Coding Plan (`zai-coding-cn`) | `/api/monitor/usage/quota/limit` | 5 小时 / 周 |
| Kimi Coding (`kimi-coding`) | `/coding/v1/usages` | 5 小时 / 周 |
| MiniMax Token Plan (`minimax-cn`) | `/v1/token_plan/remains` | 5 小时 / 周 |
| DeepSeek (`deepseek`) | `/user/balance` | 余额 |
| Codex / Claude / MiMo | — | 适配器占位，待接入 |

The capsule follows the session's current model provider (`agentDefaultModel`
selection); switch models and the capsule switches with it.

## Install

```sh
dsh plugin --profile web add dsh-quota-capsule
```

Dev (from a local clone):

```sh
dsh plugin --profile web add link:/path/to/dsh-quota-capsule
```

Restart `dsh web` afterwards.

## Keys

Read per request from, in order: process environment, then the DSH local
credential store (`~/.dsh/.credentials.yaml`). Nothing is written to disk by
this plugin; keys never leave the host except to their own provider API.
The state route is loopback-only.

## How it works

- Host (`lib/index.js`): provider adapters normalize each vendor response into
  `{ windows: [{ key, label, usedPct, detail, resetAt }], balance?, plan? }`,
  cached 30 s, served on `GET /dsh-quota-capsule/state`.
- Client (`lib/client.js`): registers into the `shell.overlay` slot, polls the
  route every 30 s, renders the capsule + detail card.

## License

MIT
