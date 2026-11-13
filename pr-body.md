<!-- Thanks for contributing! Quick checklist / 提交前快速自查 -->

- [x] I added **one file** at `data/plugins/LivXue__dsh-plugin-shop--packages-dsh-plugin-shop.yml` — that single file is the whole submission. / 新增了一个条目文件。
- [x] The package declares **`dsh.bundle`** — `dsh.bundle.patch: ./cordis.patch.yml`, with `dsh.client` for the browser half. This is a monorepo, so the entry points at the subpackage `packages/dsh-plugin-shop/package.json`, not the workspace root: the root has no `dsh.bundle` and installing it would install nothing. / 这是 monorepo，条目按投稿规则指向子包而非根目录。
- [x] My repo is at least **1 day old** — created 2026-08-25T05:16:32Z. / 仓库创建于 2026-08-25。
- [x] `category: market` — it is a catalog and shelf for installing plugins. / 插件目录与安装货架，用 `market`。
- [x] Description states what the plugin does, no superlatives. / 描述只陈述功能，无营销词。
- [x] My repo has the `dsh-plugin` topic.

**Recommended (not required) / 推荐但不强制：**

- 📦 Published to npm — `dsh-plugin-shop@0.9.3`, so installs are prebuilt.
- 🔗 The `@deepseek-ai/*` packages it needs are declared as `peerDependencies` (`dsh-app-boot`, `dsh-home-paths`, `dsh-typert-protocol`, `>=0.1.1-rc.2 <0.3.0-0`), not `dependencies`.
- 🖼️ No `screenshots.json` yet.

---

Every claim in the description can be checked against the repository:

| Claim | Where |
|---|---|
| daily catalog harvested from npm and GitHub | `registry/scripts/src/` — `npm-client.ts`, `github-client.ts`, the daily workflow |
| one-click install, enable/disable, update, uninstall | `packages/dsh-plugin-shop/src/host/` and `src/client/` |
| the reason dsh would refuse an install, before you press it | `src/host/compatibility.ts`, `src/host/peers.ts`; the card shows dsh's own `allow-version` command |
| `engines.dsh`, dependency count, bin names, install scripts | the catalog fields `engines`, `dependencies`, `bin`, `installScripts` |
| rollback and favorites | `src/host/state.ts` (rollback records, `FAVORITES_MAX`), and the card's favorites control |
