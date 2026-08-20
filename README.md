# 👝 dsh-pocket

**English** | [中文](./README.zh-CN.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![DeepSeek Harness](https://img.shields.io/badge/DSH-0.1.0--rc-purple.svg)](https://github.com/deepseek-ai/deepseek-harness)
[![pnpm workspace](https://img.shields.io/badge/pnpm-workspace-orange.svg)](https://pnpm.io/workspaces)

> **dsh-pocket** is a pocket toolkit of practical, lightweight, and beautiful plugins designed for [DeepSeek Harness (DSH)](https://github.com/deepseek-ai/deepseek-harness).  
> It delivers out-of-the-box micro-extensions to enhance your daily workflow, interactive experience, and development productivity.

---

## 📦 Plugins Included

| Plugin | Type | Description |
| :--- | :--- | :--- |
| **[`@moon16u/dsh-plugin-restart`](./packages/dsh-plugin-restart)** | Host / CLI | Safe, detached DSH process restart command (`/dsh-restart`) and agent tool (`dsh_restart`) with a 3-second grace period. |
| **[`@moon16u/dsh-plugin-session-id`](./packages/dsh-plugin-session-id)** | Web UI | Displays a native-styled Session ID badge in the web session header with one-click clipboard copy. |
| **[`@moon16u/dsh-plugin-web-search-tavily`](./packages/dsh-plugin-web-search-tavily)** | Capability Seam | Real-time web search provider backed by the Tavily REST API, seamlessly integrating with DSH's `ctx.web` capability seam. |

---

## 🚀 Quick Start & Installation

### Method 1: One-Command Installation via DSH CLI (Recommended ⭐️⭐️⭐️⭐️⭐️)

Run a single command in your terminal. DSH will automatically download, bundle-register, and mount all 3 pocket plugins (zero manual configuration):

```bash
# 1. Install the entire toolkit via npm (recommended)
dsh plugin --profile web add @moon16u/dsh-pocket

# Or install directly from GitHub
dsh plugin --profile web add https://github.com/moon16u/dsh-pocket.git
```

---

### Method 2: Local Git Clone Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/moon16u/dsh-pocket.git ~/dsh-pocket
   ```

2. **Add the bundle to your DSH profile**:
   ```bash
   dsh plugin --profile web add file:~/dsh-pocket
   ```
   *DSH automatically detects `dsh.bundle` and applies the built-in `cordis.patch.yml` layer without manual configuration file edits.*

---

## 🛠️ Plugin Highlights

### 1. `@moon16u/dsh-plugin-restart`
* **Problem**: After editing plugins or configs, restarting DSH manually in an external terminal is tedious; killing the process directly inside an agent tool causes the session to freeze.
* **Solution**: Exposes `/dsh-restart` slash command and `dsh_restart` agent tool. Spawns an asynchronous detached worker process that returns the response immediately and restarts cleanly after 3 seconds.

### 2. `@moon16u/dsh-plugin-session-id`
* **Problem**: Retrieving the current session UUID for debugging or log tracking requires digging into URLs or console logs.
* **Solution**: Injects a clean capsule button displaying the Session ID in the web header utility bar with instant one-click clipboard copying.

### 3. `@moon16u/dsh-plugin-web-search-tavily`
* **Problem**: Built-in search engines may be restricted or lack high-quality synthesized web answers.
* **Solution**: Formally implements the `ctx.web.registerSearchProvider` contract. Automatically resolves API keys from the `TAVILY_API_KEY` environment variable or DSH Credentials service.

---

## 🧪 Testing

This monorepo uses pnpm workspaces and Node.js native test runner for contract and smoke tests:

```bash
cd dsh-pocket
pnpm install
pnpm test
```

---

## 📄 License

[MIT License](./LICENSE) © 2026 moon16u
