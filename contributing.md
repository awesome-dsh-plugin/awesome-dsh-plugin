# Contributing / 贡献指南

Thanks for helping grow the list! / 感谢参与！

## Adding a plugin / 收录插件

> **The READMEs are generated — don't edit them by hand.** The list lives in `data/plugins/`, one YAML file per plugin. / **两个 README 由脚本生成，请勿手工编辑。** 列表数据在 `data/plugins/`，一个插件一个 YAML 文件。

Open a PR that adds **one file**, named after your repo — `data/plugins/<owner>__<repo>.yml`:

```yaml
url: https://github.com/owner/repo        # must match the repo exactly / 必须与仓库完全一致
name: owner/repo                          # link text shown in the list / 列表中显示的链接文字
category: ui                              # see the category list below / 见下方分类列表
description:
  en: One-line description ending with a period.
  zh: 一句话描述，以句号结尾。
```

Then regenerate both READMEs and commit them along with your YAML file / 然后重新生成两个 README，与 YAML 文件一起提交：

```sh
npm ci
node scripts/generate-readme.mjs
```

⚠️ **A description containing `: ` must be quoted** — otherwise YAML reads it as a nested key. / **描述中含 `: `（冒号加空格）时必须加引号**，否则 YAML 会把它当成嵌套键：

```yaml
description:
  en: 'Vision toolkit: OCR, grounding and pixel diff.'   # ✅ quoted / 加引号
  zh: '识图工具包：OCR、定位与像素比对。'                    # 中文全角冒号无此问题，加引号也无妨
```

```yaml
  en: Vision toolkit: OCR, grounding and pixel diff.     # ❌ breaks the parser / 解析失败
```

**Why one file per plugin / 为什么一个插件一个文件：** everyone used to append to the same spot in the same README section, so merging one PR broke the next. Separate files never collide. / 以前所有人都往同一分类的同一位置追加，合并一个 PR 就会撞掉下一个。独立文件永不冲突。

Valid `category` values / 可用的 `category` 取值：
`ui` `theme` `model` `session` `memory` `tools` `skill` `workflow` `notify` `dev` `market` `fun`

Monorepo subpackages / monorepo 子包: point `url` at the subdirectory and use `owner/repo#subname` as the `name`, e.g. `url: https://github.com/owner/repo/tree/main/packages/my-plugin`. The filename becomes `owner__repo--packages-my-plugin.yml`.

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
- The repo is at least **1 day old** and has **10 or more commits**. / 仓库**创建满 1 天**，且**提交数 ≥ 10**。

  This is checked automatically. It isn't a judgement about your plugin — it filters out repos created minutes before the PR, which were the bulk of what had to be rejected by hand. If you're just under the bar, finish the work and resubmit; nothing is held against a resubmission. / 这一项由 CI 自动检查。它不是对插件质量的评价，只是为了过滤掉「PR 前几分钟才建好」的仓库——过去人工被迫拒掉的大多是这类。如果暂时没达标，把功能做完再提交即可，重新提交不会有任何影响。
- The project is actively maintained. A periodic scan flags entries whose repo is gone, archived, or long dormant; they're collected in a tracking issue and removed after review. / 项目处于活跃维护状态。定期扫描会标记仓库消失、已归档或长期停更的条目，汇总到一个跟踪 issue，经确认后移除。
- Add the [`dsh-plugin`](https://github.com/topics/dsh-plugin) topic to your repo. / 为仓库添加 `dsh-plugin` topic。
- Descriptions state what the plugin does — no superlatives or marketing. / 描述只说功能，不带营销词。

Maintainers also add notable plugins directly — the list grows through both community PRs and editorial curation. / 维护者也会主动收录值得关注的插件——列表由社区 PR 与编辑精选共同生长。

Recommended for a better install experience / 推荐（更好的安装体验）：

- Publish your plugin to npm — prebuilt installs skip the `allowBuilds` build-approval step. / 发布 npm 包：预构建安装免 `allowBuilds` 构建授权。
- Not publishing to npm? Attach a prebuilt tarball to a GitHub Release and point at it with an optional `tarball:` field — storefronts will offer it instead of the build-from-source command. Required if your repo can't be installed from source at all. / 不发 npm 也可以：把预构建 tarball 附加到 GitHub Release，并用可选的 `tarball:` 字段指向它，市场会优先展示它而不是源码构建命令。**如果你的仓库根本无法从源码安装，这一项是必需的。**

  ```yaml
  tarball: https://github.com/owner/repo/releases/latest/download/your-plugin.tgz
  ```

  Must be an `https` `.tgz` on GitHub's own release hosting — the list won't hand users a download link it can't vouch for. / 必须是 GitHub Release 托管的 `https` `.tgz`——列表不会给用户一个无法担保来源的下载链接。
- Declare official `@deepseek-ai/*` packages as `peerDependencies`, not `dependencies`. / 官方 `@deepseek-ai/*` 包请用 `peerDependencies` 声明。

The website rebuilds automatically after merge — no need to touch anything else. / 合并后网站自动重建，无需改动其他文件。

### What CI checks / CI 会检查什么

Every PR runs, in order / 每个 PR 依次运行：

1. **`dsh.bundle`** — fetched from your repo's `package.json` (root, or a `packages/` · `plugins/` · `apps/` subpackage). Declaring only `dsh.client` fails here. / 从你仓库的 `package.json` 读取（根包，或 `packages/` · `plugins/` · `apps/` 子包）；只声明 `dsh.client` 会在这里失败。
2. **Repo age and commit count** — the 1 day / 10 commits bar above. / 上面的 1 天 / 10 提交门槛。
3. **`awesome-lint`** and the site build — locale parity, separators, dates, screenshots. / `awesome-lint` 与站点构建：双语一致性、分隔符、日期、截图。

If a check fails it says exactly what to change. Push a fix to the same branch — no need to open a new PR. / 检查失败时会明确指出要改什么。在同一分支上推送修复即可，无需重开 PR。

### Screenshots / 截图（optional, recommended / 可选，推荐）

Storefronts (e.g. [dsh-market](https://github.com/dsh-market/dsh-market)'s detail view) show AppStore-style screenshots for your plugin. Add yours to [`data/screenshots.json`](data/screenshots.json), keyed by your entry's GitHub URL — the same URL as your README line — mapping to 1-8 image URLs:

在插件市场（如 [dsh-market](https://github.com/dsh-market/dsh-market) 的详情页）中，你的插件可以像 App Store 一样展示截图。在 [`data/screenshots.json`](data/screenshots.json) 里以你条目的 GitHub URL（与 README 行完全一致）为 key，加入 1-8 张图片 URL：

```jsonc
{
 "https://github.com/owner/repo": [
  "https://raw.githubusercontent.com/owner/repo/main/assets/screenshot-1.png",
  "https://raw.githubusercontent.com/owner/repo/main/assets/screenshot-2.png"
 ]
}
```

- Images must be **https URLs on GitHub hosting** (`raw.githubusercontent.com`, `user-images.githubusercontent.com`, `camo.githubusercontent.com`, `github.com` attachments) — third-party image hosts are rejected by the build for user-privacy reasons. / 图片必须是 **GitHub 托管的 https URL**（`raw.githubusercontent.com` 等）——出于用户隐私考虑，第三方图床会被构建校验拒绝。
- Keep the images in your own repo (an `assets/` folder works well) so they update with your releases. / 建议把图片放在你自己的仓库里（如 `assets/` 目录），随版本一起维护。
- No screenshots? Storefronts fall back to extracting images from your README — a maintained entry here just gives you control over order and selection. / 不提交也没关系：市场会从你的 README 自动抽取——这里的条目只是让你能控制展示的顺序与内容。

### Themes & skins / 主题与皮肤

Entries under the **Themes & Appearance / 主题与外观** category automatically appear in the [dsh-market](https://github.com/dsh-market/dsh-market) plugin's dedicated **Themes tab**, where users install, switch, and uninstall them with one click — so put your theme/skin there, not under UI Enhancements. Monorepo subpackages are supported: link the subdirectory directly, e.g. `https://github.com/owner/repo/tree/main/packages/my-theme`.

**主题与外观**分类下的条目会自动进入 [dsh-market](https://github.com/dsh-market/dsh-market) 插件市场的**主题 Tab**，用户可一键安装、切换、卸载——主题/皮肤类插件请务必放这个分类，不要放 UI 增强。支持 monorepo 子包：直接链接子目录，如 `https://github.com/owner/repo/tree/main/packages/my-theme`。

## Removing or updating / 移除与更新

PRs fixing descriptions, moving entries between categories, or removing dead projects are equally welcome. / 修正描述、调整分类、移除失效项目的 PR 同样欢迎。
