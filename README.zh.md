# dsh-reveal-files

[English](README.md) | [简体中文](README.zh.md)

DeepSeek Harness 双面插件:把「产物」行(产出文件行)里的每个文件 chip
改成**点击弹出下拉菜单**,菜单提供按文件操作:打开文件、拷贝路径、在
文件浏览器中定位、以及在终端中进入该文件所在目录。

## 功能特性

- 每个产物文件 chip 点击后弹出**下拉菜单**,按文件独立操作,不再是
  点击直接打开:
  - 📂 **打开** —— 用默认应用打开(原有行为)。
  - 📋 **拷贝文件路径** —— 将绝对路径复制到系统剪贴板。
  - 📁 **在文件浏览器中显示** —— macOS Finder(`open -R`,会选中文件)、
    Linux 文件管理器(`xdg-open` 打开所在目录)、Windows Explorer
    (`explorer /select,`)。
  - ⌨️ **在终端中打开所在目录** —— 打开一个系统终端窗口并**置顶激活**,
    已 `cd` 进入文件所在目录,可直接继续操作:macOS Terminal.app、Linux
    (`x-terminal-emulator` / `gnome-terminal` / `konsole`) 与 Windows
    (`cmd`)。每次触发都打开一个新窗口(每个动作独立终端,无需额外
    权限)。
- 菜单标签跟随界面语言(简体中文 / 英文);菜单项带 `role="menuitem"`,
  chip 暴露 `aria-haspopup` / `aria-expanded`。
- 相对路径按会话工作目录解析。
- 出错时(如沙箱拒绝、平台不支持)错误显示在打开的菜单内;动作执行
  期间菜单保持打开、菜单项禁用。
- 除 Harness 自身外零运行时依赖:Host 仅用 `node:child_process`,
  Client 仅用平台的 `react` 种子。

## 环境要求

- DeepSeek Harness Web(`web` profile),即 `dsh web`。
- Node.js `>= 22.6.0`。
- 桌面环境可被系统打开器触达(macOS 与 Windows 始终可以;Linux 需要
  显示服务器或 WSL)。

## 安装

```bash
# 从 GitHub 安装(pnpm 的 git spec;#main 固定主分支):
dsh plugin --profile web add github:yumm007/dsh-reveal-files#main
```

> **从源码构建。** GitHub 安装会在安装时构建包;pnpm 会请求一次
> `allowBuilds` 授权,批准后继续。若构建被阻止,把包加入 profile
> `pnpm-workspace.yaml` 的 `allowBuilds` 后重新执行命令;发布 npm
> 预构建包则可完全跳过这一步。

`dsh plugin` 会在 profile 目录内把参数转发给 pnpm,随后自动对账
`dsh.profile.bundles`。因为包声明了 `dsh.bundle.patch`,它会自动加入
profile 层栈——无需手动编辑 `cordis.yml`。

安装后重启 web profile:

```bash
dsh web
```

插件作为 bundle 在启动时加载:Host 半部注册 `POST /api/reveal-files` 与
`POST /api/show-in-terminal` 路由,Client 半部在产物文件行挂载下拉菜单。

## 使用方法

1. 让助手在一个回合内产出若干文件(任意 `write` / `edit` / 变更类工具结果)。
2. 在该消息下方找到带文件 chips 的「产物」行。
3. 点击某个文件 chip——弹出小菜单:**打开** / **拷贝文件路径** /
   **在文件浏览器中显示** / **在终端中打开所在目录**,选择其一;点击
   菜单外任意处或完成选择后菜单关闭。
4. 若操作失败,错误以红色显示在菜单内;动作执行期间菜单项保持禁用。

## 配置

`cordis.patch.yml` 中的插件行可配置:

```yaml
- insert:
    - id: dsh-reveal-files
      name: 'dsh-reveal-files'
      config:
        enabled: true          # 是否注册 reveal 路由(默认 true)
        revealTimeoutMs: 10000 # 单条系统命令超时(毫秒,默认 10000)
```

如需覆盖,可在 profile 自己的 `cordis.patch.yml` 中修改。

## 工作原理

| 层 | 文件 | 说明 |
| --- | --- | --- |
| Host | `lib/index.js` | Cordis 插件行 `dsh-reveal-files`(注入 `webServer` 与 `sessions`),注册 `POST /api/reveal-files`(文件浏览器定位)与 `POST /api/show-in-terminal`(置顶终端并 cd)。按平台执行 `open -R` / `xdg-open` / `explorer /select,` 与 `osascript` / 终端模拟器,相对路径按会话 cwd 解析,返回 JSON 结果。 |
| Client | `client/client.js` | web 模块(`window.__ModuleLoader__.load`),由 Harness 客户端模块系统注册。以 `priority: -1` 认领 `conversation.chat.turnTail` 链条,`select` 读取回合的 `deliverables` 数据(与内置行同一数据源),渲染 chips 行与两个图标按钮。 |

### 为什么用 `priority: -1`?

turn-tail 插槽是一条**链条**:条目按 priority 升序尝试,第一个 `select`
返回非 null 的胜出。内置的「产物」行注册在 `priority: 0`。注册为 `-1`
使本插件的条目排在最前,从而渲染出定位图标,同时文件检测行为与内置
完全一致。若不显式指定 priority,两条目同为 `0` 并列,内置行会静默胜出。

## 卸载

```bash
dsh plugin --profile web remove dsh-reveal-files
```

对账步骤也会将该包从 `dsh.profile.bundles` 移除;随后重启 web profile。

## 开发

本地开发时直接从磁盘安装,每次编辑后**重新执行 `add`** 即可——profile
依赖是硬链接,已安装代码会跟随你的工作区:

```bash
dsh plugin --profile web add file:/绝对路径/dsh-reveal-files
# 编辑后:         dsh plugin --profile web add file:/绝对路径/dsh-reveal-files
# 或强制重装:     pnpm --dir ~/.dsh/profiles/web install --force
```

webServer 以 rev 哈希 URL 从磁盘提供 client bundle,刷新即可看到 Client
改动;Host 路由改动需要重启。

## 变更日志

见 [CHANGELOG.md](./CHANGELOG.md)。

## 许可

[MIT](./LICENSE)
