# Contributing / 贡献指南

Thanks for helping grow the list! / 感谢参与！

## Adding a plugin / 收录插件

Open a PR that adds **one line to each of** `README.md` (English) and `README.zh.md` (中文), under the matching category:

```markdown
- [owner/repo](https://github.com/owner/repo) - One-line description ending with a period.
```

在 `README.md` 与 `README.zh.md` 的对应分类下各加一行：

```markdown
- [owner/repo](https://github.com/owner/repo) — 一句话描述，以句号结尾。
```

Requirements / 要求：

- The repo declares a `dsh.bundle` manifest in `package.json` (this is what makes it installable via `dsh plugin add`). Monorepos qualify if the root or a subpackage declares it. / 仓库的 `package.json` 需声明 `dsh.bundle` manifest（monorepo 根包或子包声明亦可）。

  ⚠️ Most rejected submissions declare only `dsh.client` — that alone is **not** installable. A complete example / 最常见的被拒原因是只声明了 `dsh.client`——那样无法安装。完整示例：

  ```jsonc
  {
    "dsh": {
      "bundle": { "patch": "./cordis.patch.yml" },   // ← required / 必须
      "client": { "platform": "web" }                // only if you ship browser UI / 仅带前端 UI 时需要
    }
  }
  ```

  with a `cordis.patch.yml` next to it / 并在仓库根放一个 `cordis.patch.yml`：

  ```yaml
  - insert:
      - id: your-plugin-id
        name: your-package-name
  ```
- The repo contains real, working code — placeholder, name-squat, or README-only repos don't qualify. / 仓库需有真实可用的代码——占位仓库、纯 README 仓库不收。
- The project is actively maintained. Entries that go dead may be removed in periodic cleanups. / 项目处于活跃维护状态；失效项目会在定期清理中移除。
- Add the [`dsh-plugin`](https://github.com/topics/dsh-plugin) topic to your repo. / 为仓库添加 `dsh-plugin` topic。
- Descriptions state what the plugin does — no superlatives or marketing. / 描述只说功能，不带营销词。

Maintainers also add notable plugins directly — the list grows through both community PRs and editorial curation. / 维护者也会主动收录值得关注的插件——列表由社区 PR 与编辑精选共同生长。

Recommended for a better install experience / 推荐（更好的安装体验）：

- Publish your plugin to npm — prebuilt installs skip the `allowBuilds` build-approval step. / 发布 npm 包：预构建安装免 `allowBuilds` 构建授权。
- Declare official `@deepseek-ai/*` packages as `peerDependencies`, not `dependencies`. / 官方 `@deepseek-ai/*` 包请用 `peerDependencies` 声明。

The website rebuilds automatically after merge — no need to touch anything else. / 合并后网站自动重建，无需改动其他文件。

## Removing or updating / 移除与更新

PRs fixing descriptions, moving entries between categories, or removing dead projects are equally welcome. / 修正描述、调整分类、移除失效项目的 PR 同样欢迎。
