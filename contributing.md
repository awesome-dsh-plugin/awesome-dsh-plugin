# Contributing / 贡献指南

Thanks for helping grow the list! / 感谢参与！

## Adding a plugin / 收录插件

Open a PR that adds **one line to each of** `README.md` (English) and `README.zh.md` (中文), under the matching category:

```markdown
- [plugin-name](https://github.com/owner/repo) - One-line description ending with a period.
```

在 `README.md` 与 `README.zh.md` 的对应分类下各加一行：

```markdown
- [插件名](https://github.com/owner/repo) — 一句话描述，以句号结尾。
```

Requirements / 要求：

- The repo declares a `dsh.bundle` manifest in `package.json` (this is what makes it installable via `dsh plugin add`). Monorepos qualify if a subpackage declares it. / 仓库的 `package.json` 需声明 `dsh.bundle` manifest（monorepo 子包声明亦可）。
- Add the [`dsh-plugin`](https://github.com/topics/dsh-plugin) topic to your repo. / 为仓库添加 `dsh-plugin` topic。
- Descriptions state what the plugin does — no superlatives or marketing. / 描述只说功能，不带营销词。

The website rebuilds automatically after merge — no need to touch anything else. / 合并后网站自动重建，无需改动其他文件。

## Removing or updating / 移除与更新

PRs fixing descriptions, moving entries between categories, or removing dead projects are equally welcome. / 修正描述、调整分类、移除失效项目的 PR 同样欢迎。
