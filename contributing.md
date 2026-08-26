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
  zh: 一句话描述，以句号结尾。   # optional — a maintainer will add it / 可选，维护者会补
```

**Only `description.en` is required.** If you can't write the Chinese, leave `zh` out and a maintainer will add it — a missing translation is our work, not a reason to bounce your plugin. / **只有 `description.en` 是必填的。** 写不了中文就不写 `zh`，维护者会补上——缺翻译是我们的活，不该成为你的插件被打回的理由。

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
`ui` `usage` `theme` `model` `identity` `session` `memory` `tools` `browser` `vision` `voice` `docs` `skill` `workflow` `git` `notify` `dev` `security` `remote` `market` `fun`

This set is not fixed — see the note on categories under [how submissions are reviewed](#how-submissions-are-reviewed--收录如何评审). / 这组取值不是固定的，说明见[收录如何评审](#how-submissions-are-reviewed--收录如何评审)中关于分类的那条。

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
- **The description must be accurate.** It is read as a claim about your plugin, and it is checked against your code. If you write "46 tools across six domains", there should be 46 tools and six domains; if you name a command or an API, it should exist. Overstating is the one thing that gets an otherwise-good plugin sent back. / **描述必须属实。** 它会被当作对你插件的声明，并与代码核对。写「46 个工具、六大领域」，就应该真有 46 个工具和六个领域；提到某个命令或 API，它就应该存在。夸大是让一个本来不错的插件被打回的主要原因。
- **Pick the category that matches what the plugin does**, not where you'd like it to appear. A near miss is fixed by a maintainer, not bounced back. / **选贴合插件实际做的事的分类**，而不是你希望它出现在哪里。选得不够准的，维护者会直接改，不会打回。

Maintainers also add notable plugins directly — the list grows through both community PRs and editorial curation. / 维护者也会主动收录值得关注的插件——列表由社区 PR 与编辑精选共同生长。

### How submissions are reviewed / 收录如何评审

A green CI run is the **precondition**, not the decision. CI verifies the shape of a submission — manifest, repo age, formatting, that the READMEs regenerate. It cannot tell whether a plugin does what its entry says, whether the category fits, or whether an entry duplicates one already on the list. A maintainer reads the target repository before merging.

CI 通过是**前置条件**，不是结论。CI 校验的是提交的形式——manifest、仓库年龄、格式、README 能否重新生成；它无法判断插件是否名副其实、分类是否贴切、是否与已有条目重复。合并前维护者会实际阅读目标仓库。

What that review looks at / 评审会看：

1. **Does the code do what the entry claims** — including any numbers or API names in the description. / 代码是否与条目声明一致，包括描述里的数字与 API 名称。
2. **Is the category reasonable.** Nobody gets sent back over a category — if a better one fits, a maintainer just changes it. The taxonomy itself keeps moving: categories get split as they grow — `usage` and `vision` came from that, and so did `security`, `browser`, `git`, `docs`, `remote` and `voice`, all split out of `tools`, `ui` and `dev` once those had grown past the point where anyone could scan them — and categories get renamed or merged when they stop being useful. Today's best fit may be re-filed later; that is maintenance, not a correction of your judgement. Pick the closest one and don't agonise. / 分类是否合理。**不会有人因为分类被打回**——如果有更贴切的，维护者直接改。分类体系本身也在变：某一类长大了就会拆分——`usage` 与 `vision` 就是这么来的，`security`、`browser`、`git`、`docs`、`remote`、`voice` 也是，它们都是在 `tools`、`ui`、`dev` 大到没人能扫完之后从中拆出来的——不再有用的分类则会改名或合并。今天最贴切的归类以后也可能被重新归档，那是维护，不是在纠正你的判断。挑最接近的一个即可，不必纠结。
3. **Is it real, working code** rather than a placeholder or a wrapper around nothing. / 是否是真实可用的代码，而非占位或空壳。
4. **Is it already covered** by an entry on the list. Where two plugins do the same thing, whoever got here first keeps the slot — but that is a tiebreaker, not tenure. Being listed is not permanent: entries that stop being maintained, behave badly, or carry obvious defects get removed. So a fork *is* added when it is the better-kept one, or when it genuinely adds something. The rule is not first-come; the rule is whichever is better. / 是否已被现有条目覆盖。两个插件做同一件事时，先来者保留位置——但这只是平局时的排序依据，不是既得利益。收录不是永久的：停止维护、有恶意行为、存在明显缺陷的条目会被移除。所以一个分叉**是可以**被收录的——只要它维护得更好，或者确实做了新东西。规则不是先来后到，规则是谁更好。
5. **Anything alarming in the source** — obfuscated code, credential exfiltration, surprising install-time behaviour. Being listed is still **not** a security review (see the warning at the top of the README); this is a sanity check, not an audit. / 源码中是否有可疑之处——混淆代码、凭据外传、异常的安装期行为。收录仍**不等于**做过安全审查（见 README 顶部警告），这只是常识性检查，不是审计。
6. **Does the PR touch entries it has no business touching.** A PR updating one plugin should not rewrite another's description. This slipped through twice ([#1348](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/issues/1348)) because every mechanical check passed — the YAML was valid, the READMEs regenerated, lint was clean. The gate now lists every existing entry a PR modifies so it can be questioned. / PR 是否动了与它无关的条目。更新某个插件的 PR 不该改写另一个插件的描述。这类问题曾两次蒙混过关（[#1348](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/issues/1348)）——因为所有机械检查都通过了：YAML 合法、README 能生成、lint 干净。现在 gate 会列出 PR 修改的每一个既有条目，以便被追问。

If you're updating your own entry, **change only your own entry**. Editing the READMEs by hand is the usual way this goes wrong: line positions shift as the list grows, and an edit lands on a neighbour. That's why the READMEs are generated — edit your `data/plugins/<owner>__<repo>.yml` and regenerate. / 如果你在更新自己的条目，**请只改自己那一条**。手工编辑 README 是这类事故的常见起因：列表增长会让行号移位，改动就落到了邻居身上。这正是 README 改为生成的原因——请编辑你自己的 `data/plugins/<owner>__<repo>.yml` 再重新生成。

Feedback comes as a PR comment naming exactly what to change. Being sent back for an inaccurate description isn't a rejection of the plugin — fix the line and it goes in. / 反馈会以 PR 评论给出，明确指出要改什么。因描述不准确被打回不是对插件本身的否定——改好那一行即可收录。

**One thing worth saying plainly:** we are not judges of plugin quality, and being on this list — or not being on it — is not a verdict on your work. Plenty of good software will never be here, and a slot here proves nothing beyond meeting the rules above. We have no interest in being that arbiter. The rules exist for one reason: someone landing on this page should be able to install what they pick and have it do what the line said it would. Thanks for bearing with them.

**有一点想说清楚：** 我们不是插件好坏的裁判，收录与否也不代表对你作品的评价。有很多优秀的软件永远不会出现在这里，而出现在这里也仅仅说明它符合上面这些规则，不说明别的。我们无意扮演这个裁判。这些规则只为一件事存在：让打开这个页面的人，装上他挑中的插件后，它确实做描述里写的那件事。感谢理解与配合。

Recommended for a better install experience / 推荐（更好的安装体验）：

- Publish your plugin to npm — prebuilt installs skip the `allowBuilds` build-approval step. / 发布 npm 包：预构建安装免 `allowBuilds` 构建授权。
- Not publishing to npm? Attach a prebuilt tarball to a GitHub Release and point at it with an optional `tarball:` field — storefronts will offer it instead of the build-from-source command. Required if your repo can't be installed from source at all. / 不发 npm 也可以：把预构建 tarball 附加到 GitHub Release，并用可选的 `tarball:` 字段指向它，市场会优先展示它而不是源码构建命令。**如果你的仓库根本无法从源码安装，这一项是必需的。**

  ```yaml
  tarball: https://github.com/owner/repo/releases/latest/download/your-plugin.tgz
  ```

  Must be an `https` `.tgz` on GitHub's own release hosting — the list won't hand users a download link it can't vouch for. / 必须是 GitHub Release 托管的 `https` `.tgz`——列表不会给用户一个无法担保来源的下载链接。
- Declare official `@deepseek-ai/*` packages as `peerDependencies`, not `dependencies`. / 官方 `@deepseek-ai/*` 包请用 `peerDependencies` 声明。

  ⚠️ **A peer range without an explicit prerelease branch silently excludes every prerelease build of the harness.** node-semver only lets a version's prerelease tag satisfy a range if *some* comparator in that range shares its exact `major.minor.patch` tuple and itself carries a prerelease tag. A broad-looking range like `>=0.0.1-rc.1 <0.2.0` — or even the "match everything" `>=0.0.0-0 <0.2.0-0` — does **not** match `0.1.0-rc.6`: neither has a comparator on the `0.1.0` tuple with a prerelease tag, so it's silently excluded and your users hit an `ERESOLVE` they have to work around by hand. Use an explicit `||` branch that puts a prerelease tag on the matching tuple instead / **不带显式预发布分支的 peer 范围会静默排除 harness 的所有预发布构建。** node-semver 只有当范围里*某个*比较符与该版本的 `major.minor.patch` 元组完全一致、且自身也带预发布标签时，才会放行预发布版本。看起来很宽的范围，比如 `>=0.0.1-rc.1 <0.2.0`，甚至「匹配一切」的 `>=0.0.0-0 <0.2.0-0`，都**匹配不到** `0.1.0-rc.6`——两者在 `0.1.0` 这个元组上都没有带预发布标签的比较符，于是被静默排除，用户 `npm install` 时会遇到 `ERESOLVE`，还得自己手工解决。请改用显式的 `||` 分支，在匹配的元组上带上预发布标签：

  ```jsonc
  // ❌ looks broad, silently excludes every 0.1.0-* prerelease
  "peerDependencies": { "@deepseek-ai/dsh-tools": ">=0.0.1-rc.1 <0.2.0" }

  // ✅ explicit prerelease branch on the 0.1.0 tuple
  "peerDependencies": { "@deepseek-ai/dsh-tools": ">=0.0.1-rc.1 <0.1.0 || >=0.1.0-rc.1 <0.2.0-0" }
  ```

The website rebuilds automatically after merge — no need to touch anything else. / 合并后网站自动重建，无需改动其他文件。

### One PR, at most 3 entries / 一个 PR 最多 3 条

A pull request may add **at most 3 entries**. Over that, CI rejects it and asks you to split. / 一个 PR **最多添加 3 条**。超过会被 CI 拒绝并要求拆分。

Reviewing a submission means reading the plugin's source and checking every claim in its description against it. That work is per-entry and does not get cheaper in bulk: a pull request carrying 127 entries is not one submission, it is 127 submissions wearing a coat, and the honest outcome is that none of them get read properly. / 评审一个投稿意味着读插件源码，并把描述里的每一句话对着代码核一遍。这是逐条的工作量，不会因为打包提交而变少：一个装了 127 条的 PR 不是一次投稿，而是 127 次投稿套了件外衣，诚实的结果是没有一条会被认真读完。

Three is not a guess — of the last 100 merged pull requests, 92 added one entry and 8 added two; none added three. The allowance exists for the one shape that legitimately needs it: a monorepo whose subpackages are separately installable plugins. / 3 不是拍脑袋定的——最近 100 个已合并的 PR 里，92 个加了 1 条、8 个加了 2 条，没有一个加 3 条。留这个余量是为了一种确实需要它的情形：一个 monorepo 的多个子包各自是可独立安装的插件。

**If several plugins are yours, split *and* pick.** Send the ones you would keep if you could only keep a few, not everything that works. A reader opening a category needs "these are all worth a look", not "some of these are". / **如果多个插件都是你的，除了拆分还要挑。** 提交那些「如果只能留几个，你会留下的」，而不是所有能跑的。读者打开一个分类，需要的是「这些都值得一看」，而不是「这里面有几个值得一看」。

### What CI checks / CI 会检查什么

Every PR runs, in order / 每个 PR 依次运行：

1. **Entry count** — at most 3 per PR (above). Checked first, before anything is fetched. / 每个 PR 最多 3 条（见上）。最先检查，早于任何网络请求。
2. **`dsh.bundle`** — fetched from your repo's `package.json` (root, or a `packages/` · `plugins/` · `apps/` subpackage). Declaring only `dsh.client` fails here. / 从你仓库的 `package.json` 读取（根包，或 `packages/` · `plugins/` · `apps/` 子包）；只声明 `dsh.client` 会在这里失败。
3. **Repo age and commit count** — the 1 day / 10 commits bar above. / 上面的 1 天 / 10 提交门槛。
4. **`awesome-lint`** and the site build — locale parity, separators, dates, screenshots. / `awesome-lint` 与站点构建：双语一致性、分隔符、日期、截图。

If a check fails it says exactly what to change. Push a fix to the same branch — no need to open a new PR. / 检查失败时会明确指出要改什么。在同一分支上推送修复即可，无需重开 PR。

### Screenshots / 截图（optional, recommended / 可选，推荐）

Storefronts (e.g. [dsh-market](https://github.com/dsh-market/dsh-market)'s detail view) show AppStore-style screenshots for your plugin. **Declare them in your own repository**: add a `screenshots.json` next to your `package.json` (inside the subdirectory, for a monorepo entry), listing 1-8 image paths.

在插件市场（如 [dsh-market](https://github.com/dsh-market/dsh-market) 的详情页）中，你的插件可以像 App Store 一样展示截图。**在你自己的仓库里声明**：在 `package.json` 旁边放一个 `screenshots.json`（monorepo 条目放在对应子目录里），列出 1-8 张图片路径。

```jsonc
// <your repo>/screenshots.json
[
 "assets/screenshot-1.png",
 "assets/screenshot-2.png"
]
```

Paths are relative to that file, so they point at images already in your repository. `{"screenshots": [...]}` works too if you prefer a named field.

路径相对于该文件本身，指向你仓库里已有的图片。若偏好带字段名，`{"screenshots": [...]}` 同样可用。

**Why in your repo / 为什么放在你自己的仓库**

- You can update screenshots by pushing to your own repository — no pull request here, no waiting on a maintainer. The next nightly build picks them up. / 之后想换截图，推自己的仓库即可，不用再来提 PR、不用等维护者，下一次构建自动生效。
- A relative path breaks visibly in your own repository if you rename the file. An absolute URL written into a file over here can only rot silently — that is how 41 of the 773 published screenshots became 404s. / 相对路径在你自己仓库里改名就能立刻发现；写死在我们这边的绝对 URL 只会悄无声息地烂掉——已发布的 773 张截图里有 41 张就是这样变成 404 的。
- Nobody else edits your file, so screenshot submissions stop colliding with each other. / 没有别人会动你这个文件，截图投稿之间不会再互相冲突。

**Rules / 规则**

- 1-8 images. / 1 到 8 张。
- Absolute URLs are accepted as well, but must be **https on GitHub hosting** (`raw.githubusercontent.com`, `user-images.githubusercontent.com`, `camo.githubusercontent.com`, `github.com` attachments) — third-party image hosts are rejected for user-privacy reasons. / 也接受绝对 URL，但必须是 **GitHub 托管的 https 链接**——出于用户隐私考虑，第三方图床会被拒绝。
- Relative paths may not leave your plugin's directory (no leading `/`, no `..`). / 相对路径不能跳出插件目录（不能以 `/` 开头，不能含 `..`）。
- No screenshots? Storefronts fall back to extracting images from your README — declaring them just gives you control over order and selection. / 不声明也没关系：市场会从你的 README 自动抽取——声明只是让你能控制展示的顺序与内容。

<details>
<summary>Older entries: <code>data/screenshots.json</code> / 旧条目：<code>data/screenshots.json</code></summary>

Entries added before this convention still have their screenshots in [`data/screenshots.json`](data/screenshots.json) here, and those keep working — that file is read whenever a repository declares nothing. It is a fallback with an end date, not a second place to put things: once your repository declares its own `screenshots.json`, your key there is removed as redundant, and the file is deleted when it empties. **Please do not add new keys to it.**

早于这个约定的条目，截图仍然记在本仓库的 [`data/screenshots.json`](data/screenshots.json) 里，照常生效——仓库没有声明时就读它。它是一个有终点的回退，不是第二个存放地：一旦你的仓库自己声明了 `screenshots.json`，那边多余的键会被清理掉，等它空了这个文件就会删除。**请不要再往里面加新的键。**

</details>

### npm package / npm 包（optional / 可选）

Publishing your plugin to npm lets storefronts show and sort by download count. Nothing here depends on it — **listing is unaffected either way**, and plugins install from GitHub exactly as before.

把插件发布到 npm，可以让市场展示并按下载量排序。这与收录无关——**发不发布都不影响收录**，插件照样能从 GitHub 安装。

- The published package's `repository` field must point back at the repository listed here, or the two are not linked. This is deliberate: it stops a package from attaching itself to a repository that has not claimed it. / 已发布包的 `repository` 字段必须指回本列表收录的那个仓库，否则两者不会关联。这是刻意的——防止某个包把自己挂到一个并未认领它的仓库上。
- You do not need to tell us. The mapping is picked up automatically from the registry; there is no field to add to your entry, and a hand-written `npm:` key in your yml is rejected. / **不需要通知我们。** 映射会从 registry 自动采集，条目里没有任何字段需要填；在 yml 里手写 `npm:` 会被校验拒绝。
- No npm package? Your entry works the same, just without a download figure. / 没有 npm 包也一样：条目照常工作，只是没有下载量数字。

### Themes & skins / 主题与皮肤

Entries under the **Themes & Appearance / 主题与外观** category automatically appear in the [dsh-market](https://github.com/dsh-market/dsh-market) plugin's dedicated **Themes tab**, where users install, switch, and uninstall them with one click — so put your theme/skin there, not under UI Enhancements. Monorepo subpackages are supported: link the subdirectory directly, e.g. `https://github.com/owner/repo/tree/main/packages/my-theme`.

**主题与外观**分类下的条目会自动进入 [dsh-market](https://github.com/dsh-market/dsh-market) 插件市场的**主题 Tab**，用户可一键安装、切换、卸载——主题/皮肤类插件请务必放这个分类，不要放 UI 增强。支持 monorepo 子包：直接链接子目录，如 `https://github.com/owner/repo/tree/main/packages/my-theme`。

## Removing or updating / 移除与更新

PRs fixing descriptions, moving entries between categories, or removing dead projects are equally welcome. / 修正描述、调整分类、移除失效项目的 PR 同样欢迎。
