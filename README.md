# 🎒 dsh-pocket

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![DeepSeek Harness](https://img.shields.io/badge/DSH-0.1.0--rc-purple.svg)](https://github.com/deepseek-ai/deepseek-harness)
[![pnpm workspace](https://img.shields.io/badge/pnpm-workspace-orange.svg)](https://pnpm.io/workspaces)

> **dsh-pocket** 是一个专为 [DeepSeek Harness (DSH)](https://github.com/deepseek-ai/deepseek-harness) 打造的精选插件工具箱（Pocket Toolkit）。
> 旨在提供**小而美、轻量、高实用度**的微扩展，解决日常交互、调试重启与真实网络搜索中的高频痛点。

---

## 📦 包含插件 (Plugins Included)

| 插件 (Package) | 类型 | 描述 (Description) |
| :--- | :--- | :--- |
| **[`@moon16u/dsh-plugin-restart`](./packages/dsh-plugin-restart)** | Host / CLI | 提供 `/dsh-restart` 命令与 `dsh_restart` Agent 工具，实现进程分离的安全 3 秒无损自愈重启。 |
| **[`@moon16u/dsh-plugin-session-id`](./packages/dsh-plugin-session-id)** | Web UI | 在 Web 会话顶栏右侧显示当前 Session ID，支持一键快速复制到剪贴板。 |
| **[`@moon16u/dsh-plugin-web-search-tavily`](./packages/dsh-plugin-web-search-tavily)** | Capability Seam | 基于 Tavily REST API 的真实网络搜索提供方，无缝接入 DSH 官方 `ctx.web` 网络能力标准。 |

---

## 🚀 快速安装与使用 (Installation & Setup)

### 方式一：通过 Git 源码在本地安装（推荐）

1. **克隆仓库到本地**：
   ```bash
   git clone https://github.com/moon16u/dsh-pocket.git ~/dsh-pocket
   ```

2. **在 DSH Profile 中安装插件**：
   ```bash
   cd ~/.dsh/profiles/web
   pnpm add file:~/dsh-pocket/packages/dsh-plugin-restart \
            file:~/dsh-pocket/packages/dsh-plugin-session-id \
            file:~/dsh-pocket/packages/dsh-plugin-web-search-tavily
   ```

3. **在 DSH 配置层 (`cordis.patch.yml`) 中启用插件**：
   在 `~/.dsh/profiles/web/cordis.patch.yml` 中添加：
   ```yaml
   # 1. 一键会话 ID 复制徽章 (Web UI)
   - insert:
       - id: dsh-session-id
         name: '@moon16u/dsh-plugin-session-id'
         config: {}

   # 2. 进程自愈与平滑重启工具
   - insert:
       - id: dsh-restart
         name: '@moon16u/dsh-plugin-restart'
         config: {}

   # 3. Tavily 真实联网搜索提供方
   - id: web
     config:
       searchProvider: tavily
   - insert:
       - id: web-search-tavily
         name: '@moon16u/dsh-plugin-web-search-tavily'
         config:
           apiKeyEnv: TAVILY_API_KEY
           baseURL: https://api.tavily.com/search
           searchDepth: basic
           maxResults: 5
   ```

---

## 🛠️ 单个插件详解

### 1. `@moon16u/dsh-plugin-restart`
* **痛点**：在修改插件或配置后，需要手动到外部终端重启 DSH 进程；如果在 Agent 内部直接 kill 自身会导致会话卡死。
* **解决**：在 DSH 内部注册 `/dsh-restart` 斜杠命令与 `dsh_restart` Agent 工具，采用 detached setsid 异步工作进程，先正常返回响应再在 3 秒后平滑重启。

### 2. `@moon16u/dsh-plugin-session-id`
* **痛点**：排查问题、查看日志或跨环境关联时，需要获取当前会话的 UUID，但界面上没有直观的复制入口。
* **解决**：在 Web 顶栏工具区优雅注入一个胶囊状的 `Session ID` 按钮，点击即可一键复制。

### 3. `@moon16u/dsh-plugin-web-search-tavily`
* **痛点**：默认搜索引擎可能受限或无法获取高质量结构化检索结果。
* **解决**：标准实现 DSH 的 `ctx.web.registerSearchProvider` 接口，支持通过环境变量 `TAVILY_API_KEY` 或 DSH Credentials 凭据管理服务安全解析密钥。

---

## 🧪 运行测试 (Testing)

本仓库采用 pnpm workspace 管理，所有插件均包含基于 Node.js 原生测试运行器的单元测试与契约测试：

```bash
cd dsh-pocket
pnpm install
pnpm test
```

---

## 📄 许可证 (License)

[MIT License](./LICENSE) © 2026 moon16u
