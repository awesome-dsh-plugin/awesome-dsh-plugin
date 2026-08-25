<!-- Thanks for contributing! Quick checklist / 提交前快速自查 -->

- [ ] I added **one file** at `data/plugins/<owner>__<repo>.yml` — the READMEs are generated, don't edit them by hand / 我新增了一个 `data/plugins/<owner>__<repo>.yml` 文件（各语言 README 由脚本生成，不要手工编辑）
- [ ] I ran `node scripts/generate-readme.mjs` and committed the regenerated READMEs / 我已执行 `node scripts/generate-readme.mjs` 并提交了重新生成的 README
- [ ] My repo's `package.json` declares **`dsh.bundle`** (not just `dsh.client`) — [example](../blob/main/contributing.md) / 仓库 `package.json` 已声明 `dsh.bundle`（只有 `dsh.client` 无法安装）
- [ ] My repo is at least **1 day old** with **10+ commits** / 仓库创建满 1 天且提交数 ≥ 10
- [ ] `category` is one of `ui theme model session memory tools skill workflow notify dev market fun`, and themes/skins go under `theme` / `category` 取值正确，主题/皮肤类请用 `theme`
- [ ] Description states what the plugin does, no superlatives / 描述只说功能，不带营销词
- [ ] My repo has the `dsh-plugin` topic / 仓库已打 `dsh-plugin` topic

**Recommended (not required) / 推荐但不强制：**

- 📦 Publish to npm — npm installs are prebuilt and skip the `allowBuilds` approval, so users get a one-command install / 发布 npm 包：预构建产物免 `allowBuilds` 授权，用户一条命令装好
- 🔗 Declare official `@deepseek-ai/*` packages as `peerDependencies` (not `dependencies`) — avoids duplicate runtimes inside the profile / 官方 `@deepseek-ai/*` 包用 `peerDependencies` 声明（而非 `dependencies`），避免 profile 里出现重复运行时
- 🖼️ Add screenshots to [`data/screenshots.json`](../blob/main/data/screenshots.json) — they show AppStore-style in plugin markets ([how](../blob/main/contributing.md#screenshots--截图optional-recommended--可选推荐)) / 在 [`data/screenshots.json`](../blob/main/data/screenshots.json) 里附上截图——插件市场会像 App Store 一样展示（[说明](../blob/main/contributing.md#screenshots--截图optional-recommended--可选推荐)）
