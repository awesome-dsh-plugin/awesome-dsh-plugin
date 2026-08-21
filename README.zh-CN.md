<p align="center">
  <img src="./assets/logo.png" width="96" height="96" alt="dsh-pouch logo" />
</p>

# dsh-pouch

[English](./README.md) | **中文**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/npm/v/@moon16u/dsh-pouch.svg?color=cb3837)](https://www.npmjs.com/package/@moon16u/dsh-pouch)
[![DeepSeek Harness](https://img.shields.io/badge/DSH-0.1.0--rc-purple.svg)](https://github.com/deepseek-ai/deepseek-harness)
[![pnpm workspace](https://img.shields.io/badge/pnpm-workspace-orange.svg)](https://pnpm.io/workspaces)

> **dsh-pouch** 是一个专为 [DeepSeek Harness (DSH)](https://github.com/deepseek-ai/deepseek-harness) 打造的实用小插件工具箱（Pouch Toolkit）。  
> 旨在提供**小而美、轻量、开箱即用**的实用微扩展，提升日常使用与开发体验。

---

## 📦 包含插件

| 插件 | 类型 | 描述 |
| :--- | :--- | :--- |
| **[`@moon16u/dsh-plugin-restart`](./packages/dsh-plugin-restart)** | Host / CLI | 提供 `/dsh-restart` 命令与 `dsh_restart` Agent 工具，实现进程分离的安全 3 秒无损自愈重启。 |
| **[`@moon16u/dsh-plugin-current-time`](./packages/dsh-plugin-current-time)** | Host / Agent | 每轮对话开始时向 Agent 上下文注入宿主机的真实日期、时间与时区，长会话跨天也不会再按旧日期推理。 |
| **[`@moon16u/dsh-plugin-session-id`](./packages/dsh-plugin-session-id)** | Web UI | 在 Web 会话顶栏右侧显示当前 Session ID，支持一键快速复制到剪贴板。 |
| **[`@moon16u/dsh-plugin-web-search-tavily`](./packages/dsh-plugin-web-search-tavily)** | Capability Seam | 基于 Tavily REST API 的真实网络搜索提供方，无缝接入 DSH 官方 `ctx.web` 网络能力标准。 |

---

## 🚀 快速安装与使用

### 方式一：通过 DSH CLI 一行命令一键安装（推荐 ⭐️⭐️⭐️⭐️⭐️）

只需在终端执行一行命令，DSH 将自动下载并加载全部 4 个实用插件（0 手动配置，开箱即用）：

```bash
# 1. 一键安装整套工具箱（来自 npm）
dsh plugin --profile web add @moon16u/dsh-pouch

# 或直接通过 GitHub 仓库安装
dsh plugin --profile web add https://github.com/moon16u/dsh-pouch.git
```

---

### 方式二：通过 Git 源码本地链接安装

1. **克隆仓库到本地**：
   ```bash
   git clone https://github.com/moon16u/dsh-pouch.git ~/dsh-pouch
   ```

2. **在 DSH Profile 中一键引入 Bundle**：
   ```bash
   dsh plugin --profile web add file:~/dsh-pouch
   ```
   *DSH 将自动识别 `dsh.bundle` 并自动挂载内置的 `cordis.patch.yml`，无需手动编辑配置文件。*

---

## 🛠️ 单个插件详解

### 1. `@moon16u/dsh-plugin-restart`
* **痛点**：在修改插件或配置后，需要手动到外部终端重启 DSH 进程；如果在 Agent 内部直接 kill 自身会导致会话卡死。
* **解决**：在 DSH 内部注册 `/dsh-restart` 斜杠命令与 `dsh_restart` Agent 工具，采用 detached setsid 异步工作进程，先正常返回响应再在 3 秒后平滑重启。

### 2. `@moon16u/dsh-plugin-current-time`
* **痛点**：模型自己没有时钟，只能沿用启动时注入的那一次"今天"。会话跨过午夜后它仍按昨天的日期推理，而对话里没有任何东西会纠正它。
* **方案**：挂载 `agent/pre-step`，在每轮第一步的提问之后追加一条真实时刻读数。按轮而非按步注入，工具调用循环不会把对话刷满几乎相同的时间戳。

### 3. `@moon16u/dsh-plugin-session-id`
* **痛点**：排查问题、查看日志或跨环境关联时，需要获取当前会话的 UUID，但界面上没有直观的复制入口。
* **解决**：在 Web 顶栏工具区优雅注入一个胶囊状的 `Session ID` 按钮，点击即可一键复制。

### 4. `@moon16u/dsh-plugin-web-search-tavily`
* **痛点**：默认搜索引擎可能受限或无法获取高质量结构化检索结果。
* **解决**：标准实现 DSH 的 `ctx.web.registerSearchProvider` 接口，支持通过环境变量 `TAVILY_API_KEY` 或 DSH Credentials 凭据管理服务安全解析密钥。

---

## 🧪 运行测试

本仓库采用 pnpm workspace 管理，所有插件均包含基于 Node.js 原生测试运行器的单元测试与契约测试：

```bash
cd dsh-pouch
pnpm install
pnpm test
```

---

## 📄 开源协议与致谢

* [MIT License](./LICENSE) © 2026 moon16u
* Logo 图标来源于 [Icons8](https://icons8.com) 的 [Toolbox 图标](https://icons8.com/icon/41P574Kp7REI/toolbox)。
