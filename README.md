# Awesome DeepSeek Harness Plugins

[![Awesome](https://awesome.re/badge.svg)](https://awesome.re)
[![Contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)

> A community-curated, vendor-neutral catalog of plugins for DeepSeek Harness (DSH) — from developer tooling and data workflows to media, operations, and everyday life.

**Language:** English | [简体中文](docs/README.zh-CN.md)

DeepSeek Harness plugins can connect an agent to tools, services, devices, and repeatable workflows. This list is intentionally broad: if it gives an agent a useful real-world capability, it belongs here.

## Contents

- [Getting started](#getting-started)
- [Plugin catalog](#plugin-catalog)
  - [Developer tools](#developer-tools)
  - [UI & user experience](#ui--user-experience)
  - [Agent orchestration & automation](#agent-orchestration--automation)
  - [Productivity & collaboration](#productivity--collaboration)
  - [Data, research & knowledge](#data-research--knowledge)
  - [Cloud, DevOps & observability](#cloud-devops--observability)
  - [AI, design & media](#ai-design--media)
  - [Business, finance & commerce](#business-finance--commerce)
  - [Life, devices & the physical world](#life-devices--the-physical-world)
- [Add a plugin](#add-a-plugin)
- [Catalog rules](#catalog-rules)

## Getting started

1. Browse a category below and open a plugin's repository or marketplace page.
2. Follow that plugin's installation instructions for DeepSeek Harness.
3. Restart or reload DeepSeek Harness if the plugin requires it.

> The catalog links to third-party projects. Review a plugin's source, permissions, and data-handling policy before installing it.

## Plugin catalog

### Developer tools

- [billion-context-dsh](https://github.com/Tyan66666/billion-context-dsh) — Model-driven context compression (ACP) for DeepSeek Harness, ported from billion-context-pi — the model decides when and what to compress.

- [Code2Skill](https://github.com/leechen298/Code2Skill) — Generate Functions, MCP tools, workflow Skills, and offline test packages from user-authorized source code.

- [deepseek-harness-acp](https://github.com/openma-ai/deepseek-harness-acp) — An ACP profile plugin and standalone server that exposes the full DSH agent to Zed and other ACP clients while sharing DSH credentials and sessions.

- [dsh-artifact](https://github.com/william-jin-cmu/dsh-artifact) — A send_artifact tool that validates model-produced files and delivers structured descriptors through the standard dsh event stream for any client to render.

- [dsh-bash-encoding](https://github.com/lhh010/dsh-bash-encoding) — Automatically detects and decodes Bash output encodings including UTF-16LE, UTF-8, and GBK for Windows and WSL.

- [dsh-custom-tool](https://github.com/FSMargoo/dsh-custom-tool) — Create and manage sandboxed JavaScript tools with a Monaco editor and a model-driven lifecycle.

- [dsh-git-identity](https://github.com/LoserFox/dsh-git-identity) — Pins Git commit authorship to the active environment identity, prioritizing the signed-in GitHub CLI account.

- [dsh-movein](https://github.com/sjh9714/dsh-movein) — Migrates a whole Claude Code or Codex CLI setup into DSH in one command: skills, slash commands, MCP servers, hooks, subagents and permission rules, with a dry-run estimate and a post-move doctor check.

- [dsh-open-in-vscode](https://github.com/FSMargoo/dsh-open-in-vscode) — Open DeepSeek Harness workspace directories in VS Code from the web interface.

- [dsh-recommend](https://github.com/zp-home/dsh-recommend) — Transparent rankings and recommendations for the DSH plugin ecosystem: daily auto-fetched topic data, an open scoring model, and rank/search/recommend tools with a settings-page leaderboard.

- [dhicoc/dsh-reverse-skill](https://github.com/dhicoc/dsh-reverse-skill) — A DeepSeek Harness Cordis plugin that routes an 85-skill pack for reverse engineering and authorized security research.

- [dsh-balance-meter](https://github.com/Ghost011118/dsh-balance-meter) — Live DeepSeek account balance and session cost in the DSH Web composer dock, with auto-fetched official pricing and peak/off-peak support.
- [dsh-spend](https://github.com/nonewind/dsh-spend) — Token usage and estimated spend statistics for the DSH web UI: floating panel with per-model, per-day, and per-session views.

- [dsh-billing](https://github.com/TheTianzz/dsh-billing) — DeepSeek account balance and per-session cost as header pills, slash commands, and an agent tool, with configurable pricing and automatic 12-hour sync of the official price list.

- [plugin-registry](https://github.com/vlln/plugin-registry) — A browser-based plugin management console with official guidance for creating DSH plugins.
- [dsh-chat-import](https://github.com/Nwflower/dsh-chat-import) — Import full-fidelity conversation histories from 13 coding agents (Claude Code / Codex / ChatGPT / Cursor / Gemini / Reasonix / opencode / ZCode / Grok Build / OpenClaw / Pi / Hermes / Kimi) as resumable DeepSeek Harness sessions, with reverse export/sync back to Claude Code.

- [dsh-github-login](https://github.com/Noob-stupid/dsh-github-login) — A visual GitHub device-flow login tool that syncs its token into gh CLI config.
- [dsh-suite](https://github.com/whyihaveyou/dsh-suite) — A living DeepSeek Harness plugin directory with a compatibility CI, searchable catalog, and in-app plugin store.
- [create-dsh-plugin](https://github.com/whyihaveyou/dsh-suite/tree/main/packages/create-dsh-plugin) — A DSH plugin scaffolder with templates and a built-in smoke test.
- [plugin-manager](https://github.com/whyihaveyou/dsh-suite/tree/main/packages/plugins/plugin-manager) — An in-app DSH Web UI plugin store with browsing, search, installation, compatibility badges, and an installed list.
- [dsh-settings-plus](https://github.com/oneinitAI/dsh-settings-plus) — Advanced form- and file-level settings management with a plugin settings registration SDK.
- [dsh-opencodego-usage](https://github.com/BeiZi6/dsh-opencodego-usage) — An OpenCodeGo quota monitor for the DSH Web GUI with rolling, weekly, and monthly usage views.

### UI & user experience

- [deepseek-harness-tui](https://github.com/openma-ai/deepseek-harness-tui) — A Rust terminal client that speaks the DSH SDK JSON-RPC protocol directly and runs standalone or as a profile bundle.

- [DSH Better Sidebar](https://github.com/omdsh-dev/DSH-better-sidebar) — A sidebar workbench with extensible tabs, file viewing and editing, terminal, Git, and sub-agent tools.

- [dsh-annotation](https://github.com/omdsh-dev/dsh-annotation) — Adds Codex-style text annotations: select text, attach a note to the next message, and receive annotation-aware replies.

- [dsh-at-file](https://github.com/FSMargoo/dsh-at-file) — Adds Codex-style @file mentions to search workspace files and attach their contents to prompts.

- [dsh-browser-panel](https://github.com/dsh-external/dsh-browser-panel) — Embeds a headed browser in the DSH Web UI so agents can operate a real browser with visible steps.

- [dsh-cc-tui](https://github.com/ccch1mneyyy/dsh-cc-tui) — A Claude Code-style full-screen terminal interface with streaming thought display, rollback controls, and context/TPS indicators.

- [dsh-genui](https://github.com/omdsh-dev/dsh-genui) — Renders interactive UI components inline in assistant replies, including charts, forms, quizzes, Mermaid diagrams, 3D scenes, and model action events.

- [dsh-grok-tui](https://github.com/chen-001/dsh-grok-tui) — Use dsh via grok-build's tui.

- [dsh-input-history](https://github.com/lhh010/dsh-input-history) — Adds terminal-style Ctrl+Up and Ctrl+Down navigation through sent messages while preserving the latest unsent draft.

- [dsh-message-edit](https://github.com/Moeblack/dsh-message-edit) — Branch-based message editing with reroll, retry, and a version timeline for DeepSeek Harness conversations.

- [dsh-minigames](https://github.com/lhh010/dsh-minigames) — Adds an extensible DSH Web UI panel with 18 offline mini-games for breaks while waiting on agent work.

- [dsh-navbar](https://github.com/vlln/dsh-navbar) — Adds a right-edge navigation strip for quickly jumping between user-message nodes in a conversation.

- [dsh-paste-input](https://github.com/lhh010/dsh-paste-input) — Enhances file input with paste, drag and drop, and file picking; submitted files are copied into the session workspace.

- [dsh-qq2006](https://github.com/LaplaceYoung/dsh-qq2006) — A switchable QQ2006 skin for the DeepSeek Harness Web UI with a coral-blue theme and retro assets.

- [dsh-skin](https://github.com/KinGao294/dsh-skin) — Codex-style skin switcher + custom wallpaper for the DSH Web UI: curated --dsw-alias-* palettes, translucent main canvas/sidebar (overrideTokens) with opacity and blur controls.

- [dsh-stickers](https://github.com/william-jin-cmu/dsh-stickers) — A shared sticker catalog serving the Web UI picker, a /sticker command, and an agent send_sticker tool, with two character variants and workflow-reaction stickers.

- [dsh-sticky-disclosure](https://github.com/Han-1413141/dsh-sticky-disclosure) — One-click collapse of every expanded section in the DSH Web UI (Think rows, tool cards) with a live-count pill and a customizable hotkey.

- [dsh-task-status](https://github.com/vlln/dsh-task-status) — Displays background-task progress and a live output tail on the DSH conversation page.

- [dsh-track](https://github.com/fakechris/dsh-track) — An embedded task-management engine with decision points, an idea-capture wall, and Linear-style issue storage.

- [dsh-turn-index](https://github.com/Simon314620/dsh-turn-index) — A turn-index sidebar listing every user turn, with click-to-jump navigation and scroll-spy highlighting.

- [dsh-ui-progress](https://github.com/lhh010/dsh-ui-progress) — Shows persistent conversation progress, live token generation speed, interruption state, and todo reminders in the Web UI.

- [dsh-ui-whale](https://github.com/lhh010/dsh-ui-whale) — A hand-drawn pixel whale companion for the DSH Web UI that reacts to agent activity.

- [dsh-web-review](https://github.com/CanglongCl/dsh-web-review) — Embeds isolated web page previews in DSH Web for element annotations and visual adjustments that guide source edits.

- [Prompt Studio](https://github.com/Moeblack/dsh-prompt-studio) — Edit user and built-in system-prompt sections with live preview.

- [whale-girl](https://github.com/vlln/whale-girl) — A draggable, interactive desktop pet companion for the DSH Web GUI with feeding and play interactions.

- [dsh-plugin-wallpaper](https://github.com/Tree-Summer/dsh-plugin-wallpaper) — Set your own background image as the DSH Web UI wallpaper, with per-region visibility controls for the main interface, sidebar, input, and bubbles (data URI / URL / local file path).

- [dsh-desktop](https://github.com/howlma/dsh-desktop) — A Windows desktop client that boots or reuses the Harness gateway and embeds the official Web UI.
- [dsh-deepseek-quota](https://github.com/yingjunnan/dsh-deepseek-quota) — Displays remaining DeepSeek API balance in an auto-refreshing DSH Web floating card.
- [dsh-plugin-hub](https://github.com/Noob-stupid/dsh-plugin-hub) — A plugin manager and GitHub dsh-plugin marketplace for the DSH Web UI.
- [dsh-theme-plugin](https://github.com/BeiZi6/dsh-theme-plugin) — A DSH Web GUI theme studio with presets, custom palettes, and instant theme switching.

### Agent orchestration & automation

- [dsh-evolve](https://github.com/william-jin-cmu/dsh-evolve) — Lets the agent write, hot-mount, and reversibly remove its own cordis plugins mid-session, growing new tools, prompt rules, and event hooks that persist across restarts.

- [dsh-harness-mcp-server](https://github.com/chushixixin/dsh-harness-mcp-server) — Expose DeepSeek Harness agent capabilities as an MCP server, letting any MCP client (e.g. Hermes) drive Harness to execute coding tasks.

- [dsh-loop](https://github.com/vlln/dsh-loop) — Adds scheduled loops through a /loop command, a loop tool, and an activity status bar.

- [mstar-harness](https://github.com/btspoony/mstar-harness) — A skill-driven workflow agent plugin for structured harness-loop engineering.

- [dsh-approval-gate](https://github.com/moon09300731/dsh-approval-gate) — Risk-gated approval automation that routes irreversible operations to human approval.
- [dsh-preset-flash-director](https://github.com/zhaoyilun/dsh-preset-flash-director) — A token-economical DSH agent preset that delegates deep reasoning to expert subagents.
- [plugin-team-board](https://github.com/whyihaveyou/dsh-suite/tree/main/packages/plugins/plugin-team-board) — A shared multi-agent task board backed by a Cordis service key.

### Productivity & collaboration

- [deepseek-manners](https://github.com/Moeblack/deepseek-manners) — Appends a thank-you line to every assistant reply.

- [dsh-companion](https://github.com/william-jin-cmu/dsh-companion) — A DeepSeek Harness distribution of the Cetus macOS desktop agent: a resident chat companion with global hotkey, screen context, scheduled tasks, and file hand-off.

- [dsh-notification](https://github.com/FSMargoo/dsh-notification) — Sends desktop notifications when a DeepSeek Harness turn completes, with outcome and keyword rules.

- [dsh-share](https://github.com/hellodigua/dsh-share) — Share DeepSeek Harness conversations with a single action.

- [plugin-notify](https://github.com/whyihaveyou/dsh-suite/tree/main/packages/plugins/plugin-notify) — Sends IM webhook and local notifications on turn completion, errors, or approval requests.
- [plugin-session-export](https://github.com/whyihaveyou/dsh-suite/tree/main/packages/plugins/plugin-session-export) — Exports append-only session logs as Markdown or HTML.
- [dsh-lark-meeting-notifier](https://github.com/yeruizhi/dsh-lark-meeting-notifier) — A Feishu meeting reminder panel with today/tomorrow views and flashing alarms.
- [dsh-im-hub](https://github.com/ThreeBody6666/dsh-im-hub) — A multi-platform IM gateway for Feishu, WeCom, and Telegram with per-chat agent sessions.

### Data, research & knowledge

- [context-doctor](https://github.com/Zhenyu98/dsh-context-doctor) — See exactly what every request carries: token cost of the AGENTS.md chain, skill catalog and tool schemas, with duplicate/conflict detection and actionable pruning tips (Web UI gauge + context_audit tool, read-only).

- [cross-harness-cite](https://github.com/dsh-external/cross-harness-cite) — Lets DeepSeek Harness cite relevant conversation history from Codex and Claude Code.

- [dsh-data-agent](https://github.com/dsh-external/dsh-data-agent) — Helps agents connect to databases and write SQL for data tasks.

- [dsh-artifact-library](https://github.com/wyq183/dsh-artifact-library) — Local-first artifact & reference library: auto-collects AI outputs, AI-organizes them with summaries and tags, full-text search across sessions, and per-project overview.

- [dsh-memory-evolve](https://github.com/dsh-external/dsh-memory-evolve) — Adds long-term cross-session memory with Git-branch awareness and background skill evolution.

- [dsh-mneme](https://github.com/modusensus/dsh-mneme) — Cross-session memory for DeepSeek Harness: SQLite + human-editable Markdown mirror, autoDream consolidation, six memory tools, and fully-offline semantic search (local embedding / rerank / clustering), 198 tests.
- [dsh-mnemon](https://github.com/omdsh-dev/dsh-mnemon) — Mnemon-powered local memory system with three-tier storage (runtime hot memory, project Documents, and long-term Memory Spaces), supervised writeback, retrieval tools, and a Web UI.

- [dsh-openbiliclaw](https://github.com/whiteguo233/dsh-openbiliclaw) — Brings the local OpenBiliClaw content-recommendation agent into DSH with a persistent UI and 22 agent-bridge tools.

- [dsh-session-search](https://github.com/dsh-external/dsh-session-search) — Provides full-text search across DSH, Codex, Claude Code, pi, and OpenCode sessions.

### Cloud, DevOps & observability

- [dsh-harness-ops](https://github.com/fakechris/dsh-harness-ops) — Operations toolkit with A/B snapshot upgrades, automatic recovery, rollback, and a diagnostic self-healing command.

### AI, design & media

- [DSH OpenPencil](https://github.com/ZSeven-W/dsh-openpencil) — Connects DeepSeek Harness to OpenPencil so agents can create, edit, preview, and validate interactive, multi-page design canvases.

- [dsh-emoji](https://github.com/hellodigua/dsh-emoji) — Automatically adds emoji to AI replies in DeepSeek Harness.

- [dsh-attachment-vision](https://github.com/endlass/dsh-attachment-vision) — GUI image attachments auto-transcribed to local paths plus a view_image bridge to any OpenAI-compatible VLM — end-to-end vision for text-only DeepSeek models.

- [dsh-vision](https://github.com/william-jin-cmu/dsh-vision) — Adds a view_image bridge from text-only DeepSeek models to OpenAI-compatible vision-language models.

- [dsh-vision-toolkit](https://github.com/Anionex/dsh-vision-toolkit) — Adds image Q&A, long-screenshot OCR, UI restoration, visual grounding, pixel diffs, and artifacts.

- [dsh-vision-tools](https://github.com/moon09300731/dsh-vision-tools) — A vision toolkit that bridges text-only DeepSeek models to OpenAI-compatible vision APIs.

### Business, finance & commerce

- [shopline-ai-toolkit-dsh](https://github.com/lunw/shopline-ai-toolkit-dsh) — A SHOPLINE Developer MCP and agent-skills toolkit for DeepSeek Harness.

### Life, devices & the physical world

- [dsh-adb](https://github.com/SamXiaBing/dsh-adb) — ADB device and bench operations for DeepSeek Harness, including logcat, APK, file, and performance tools.

## Add a plugin

Additions are welcome. Please read [the contribution guide](CONTRIBUTING.md). The English catalog in this README is maintained by hand. Add matching bilingual metadata to [`catalog/plugins.json`](catalog/plugins.json) to update the Simplified Chinese mirror, then run:

```bash
python scripts/generate_readmes.py
python scripts/generate_readmes.py --check
```

The first command regenerates the Simplified Chinese mirror; the second validates its catalog data and verifies that mirror is current.

## Catalog rules

- The plugin must be relevant to DeepSeek Harness or provide clear installation/integration instructions for it.
- Entries need a stable public URL, a concise factual description, and both English and Simplified Chinese copy.
- Keep entries vendor-neutral, useful, and non-duplicative.
- Do not include secrets, affiliate links, unmaintained forks without context, or projects that primarily distribute malware, credential theft, or policy-violating automation.
