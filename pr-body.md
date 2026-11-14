- [x] I added **one file** at `data/plugins/koishi-fumo-code__dsh-fx-arena.yml` — that single file is the whole submission.
- [x] My repo's `package.json` declares **`dsh.bundle`** (`dsh.bundle.patch: ./cordis.patch.yml`, plus `dsh.client` for the browser half).
- [ ] My repo is at least **1 day old** — created 2026-11-03T11:51:02Z, so this is the only failing gate. Per the CI note it re-runs by itself and should clear in ~16h; no resubmission needed.
- [x] `category: fun` — it is a trading game.
- [x] Description states what the plugin does, no superlatives.
- [x] My repo has the `dsh-plugin` topic.

The plugin is a simulated FX trading arena played against an algorithmic whale-chan opponent: live canvas candlesticks, five instruments (EUR/USD, GBP/USD, USD/JPY, gold, and Whale/TOKEN — her own coin, which she never shorts), selectable leverage 10x–500x, round length 90s–500s, timed mode plus a goal mode (first to $20M wins, any forced liquidation loses). Margin, spread and a 15% maintenance line are modeled; prices are a local random walk with occasional news shocks. Zero network, zero real money, zero runtime dependencies. 167 self-test assertions ship in the repo (`scripts/selftest.mjs`).
