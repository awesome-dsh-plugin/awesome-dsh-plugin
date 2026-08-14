# Awesome DeepSeek Harness (DSH) Plugin [![Awesome](https://awesome.re/badge.svg)](https://awesome.re) ![awesome · DSH plugin](https://awesome-dsh-plugin.com/badge.svg)

[![Awesome DSH Plugin](https://awesome-dsh-plugin.com/banner-en.png)](https://awesome-dsh-plugin.com)

English | [中文](README.zh.md)

> A curated list of plugins for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (`dsh`).

DeepSeek Harness is DeepSeek's open-source agent harness — a runnable coding agent (Web and headless), built on a framework where everything is a plugin: models, tools, sandboxes, session storage, UI, even the agent loop itself. Plugins can extend the official coding agent, swap out its core parts, or assemble something entirely different.

This list collects community plugins that are installable via `dsh plugin add` (each declares a `dsh.bundle` manifest).

> 💡 New here? Install `dsh-find-plugin` first — then just ask your agent to find plugins for you: `dsh plugin --profile web add dsh-find-plugin`

**202** plugins · [PRs welcome](#contributing)

## Contents

- [Plugins](#plugins)
  - [UI Enhancements](#ui-enhancements)
  - [Themes & Appearance](#themes--appearance)
  - [Sessions & Messages](#sessions--messages)
  - [Memory](#memory)
  - [Tools & Capabilities](#tools--capabilities)
  - [Workflow & Automation](#workflow--automation)
  - [Notifications & Integrations](#notifications--integrations)
  - [Models & Providers](#models--providers)
  - [Development & Runtime](#development--runtime)
  - [Just for Fun](#just-for-fun)
- [Badge](#badge)
- [Disclaimer](#disclaimer)

## Plugins

### UI Enhancements

- [dsh-tianshu-tui](https://github.com/huiliyi37/dsh-tianshu-tui) - A terminal UI (TUI) for DeepSeek Harness.
- [deepseek-harness-tui](https://github.com/openma-ai/deepseek-harness-tui) - A Rust/ratatui terminal client that speaks the DSH SDK JSON-RPC protocol directly and runs standalone or as a profile bundle.
- [dsh-at-file](https://github.com/omdsh-dev/dsh-at-file) - Codex-style `@file` mentions: search workspace files in the composer and attach their contents to prompts.
- [ui-status-label](https://github.com/alingalingling/ui-status-label) - Customize the "deep diving" thinking status label to anything you like.
- [dsh-openpencil](https://github.com/ZSeven-W/dsh-openpencil) - OpenPencil design preview and editing plugin.
- [dsh-visualize](https://github.com/Nagi-ovo/dsh-visualize) - In-conversation generative UI: the model renders interactive HTML cards into the chat stream, with streaming preview and sandboxed rendering.
- [dsh-side-panel](https://github.com/ccq1/dsh-side-panel) - Side panel with file browser, terminal, and Git review for quick file previews.
- [dsh-focus-chat](https://github.com/dingyi222666/dsh-focus-chat) - A "focus chat" minimal view that shows only final outputs.
- [dsh-genui](https://github.com/omdsh-dev/dsh-genui) - Interactive UI components rendered inline in replies: layout, charts, forms, quizzes, mermaid, 3D scenes, and an action event loop back to the model.
- [dsh-annotation](https://github.com/omdsh-dev/dsh-annotation) - Select text → annotate → send with your message; replies map back to each annotation.
- [dsh-navbar](https://github.com/vlln/dsh-navbar) - Conversation node navigation bar for quick jumps between user messages.
- [dsh-task-status](https://github.com/vlln/dsh-task-status) - Background task status bar: progress plus live output tail on the chat page.
- [dsh-web-archive](https://github.com/renat3u/dsh-web-archive) - Collapse noisy messages (Think, Bash, etc.) in conversations.
- [dsh-spotlight](https://github.com/0xsline/dsh-spotlight) - Keyboard-first command palette for the DSH Web UI.
- [dsh-101](https://github.com/bill9109/dsh-101) - Document reading mode for DSH.
- [dsh-drag-and-drop](https://github.com/bill9109/dsh-drag-and-drop) - Cross-platform file drag-and-drop with raw path insertion, no file copying.
- [dsh-file-uploads](https://github.com/l541402398/dsh-file-uploads) - Upload arbitrary local files from the Web composer, show pending cards, and manage stored files in Settings.
- [dsh-deeplink](https://github.com/qyw233/dsh-deeplink) - Deep links: open a specific session or workspace via `?session=` / `?workspace=`.
- [dsh-diff-viewer](https://github.com/lehhair/dsh-diff-viewer) - PiUI-style diff viewer replacing the stock DiffBlock for write/edit tool calls.
- [ex-setting](https://github.com/omdsh-dev/ex-setting) - Settings extensions for DSH.
- [web-components](https://github.com/omdsh-dev/web-components) - Web Components support.
- [dsh-turn-navigator](https://github.com/vibeinging/dsh-turn-navigator) - Turn navigation for the DSH Web UI.
- [dsh-milestone](https://github.com/SnowCrescenter-tech/dsh-milestone) - Right-side dot-timeline rail: jump between user messages.
- [dsh-balance-meter](https://github.com/Ghost011118/dsh-balance-meter) - DeepSeek account balance and session cost in the composer dock, with auto-fetched official pricing and peak/off-peak support.
- [dsh-opencode-go-usage](https://github.com/v587d/dsh-opencode-go-usage) - OpenCode Go subscription usage (rolling/weekly/monthly windows with reset countdowns) in the composer dock, with a built-in credential editor.
- [dsh-cost-meter](https://github.com/Han-1413141/dsh-cost-meter) - Per-session and daily API cost, budget with usage %, official balance, history dashboard, and one-click official price sync with peak/off-peak pricing.
- [dsh-plugin-deepseek-balance](https://github.com/fishxcode/dsh-plugin-deepseek-balance) - DeepSeek API balance, balance trend, and daily usage charts in DSH Web settings.
- [ds-api-usage](https://github.com/Sev7een/ds-api-usage) - DeepSeek API balance and 24-hour usage dashboard in Settings, with estimated spend, token counts, request counts, and an hourly timeline.
- [dsh-spend](https://github.com/nonewind/dsh-spend) - Token usage and estimated spend for the dsh web UI: floating panel with per-model, per-day, and per-session stats.
- [dsh-TUI](https://github.com/ccch1mneyyy/dsh-TUI) - Claude Code-style full-screen terminal UI: pixel-whale header, live status line, and streaming thought expansion.
- [DSH-better-sidebar](https://github.com/omdsh-dev/DSH-better-sidebar) - Full sidebar workbench with file rendering and editing, terminal, Git, and subagents; third-party plugins can register new tabs.
- [dsh-sticky-disclosure](https://github.com/Han-1413141/dsh-sticky-disclosure) - One-click collapse of every expanded section (Think rows, tool cards) with a live-count pill and a customizable hotkey.
- [dsh-sticky-note](https://github.com/Meredith2328/dsh-sticky-note) - Quick sticky notes on the composer toolbar: jot ideas or TODOs, auto-saved as Markdown, one click to send into the chat.
- [dsh-web-attention-badge](https://github.com/Luaphes/dsh-web-attention-badge) - Attention reminders: frame badge, tab-title count, and a status-colored whale favicon for sessions waiting for input or finished unopened.
- [dsh-web-ui](https://github.com/zhu1090093659/dsh-web-ui) - Plugin and skin collection for the DSH Web UI: task board, Git graph, right-side panel, remote mobile UI, pet, live token stats, and a skin center.
- [dsh-pet](https://github.com/zealot00/dsh-pet) - Desktop pet for the DSH Web UI: sprite-sheet animation, agent state linkage, drag, alarm (daily/one-shot) and pomodoro widgets, skin picker with preview.
- [dsh-builtin-toggles](https://github.com/Starfie1d1272/dsh-builtin-toggles) - Adds a built-in plugin catalog to DSH Web with search, status explanations, and safe toggles for audited UI plugins.
- [dsh-enhance](https://github.com/jiangnanquan/dsh-ux) - Solarized light theme, compact layout, think/tool-chain collapse capsules, and balance, session cost, and usage dashboards for the DSH web UI.
- [dsh-hud](https://github.com/a903067276-rgb/dsh-hud) - HUD status panel: git status, MCP servers, skills, model and token usage in a floating side panel.

### Themes & Appearance

- [dsh-skin](https://github.com/KinGao294/dsh-skin) - Codex-style skin switcher plus a custom wallpaper layer with opacity and blur controls.
- [dsh-deep-whale](https://github.com/Small-tailqwq/dsh-deep-whale) - Whale-girl skin series for the DSH Web UI (maid-atelier).

### Sessions & Messages

- [dsh-turn-rewind](https://github.com/Anionex/dsh-turn-rewind) - Rewind conversation and workspace state, powered by a persistent Change Ledger.
- [dsh-crosstalk](https://github.com/Jesse-njx/dsh-crosstalk) - Cross-session messaging for DSH: any session on the machine can list and message any other, Claude Code-style, via a local heartbeat registry and inbox.
- [dsh-share](https://github.com/hellodigua/dsh-share) - Share your conversations with one click.
- [dsh-message-edit](https://github.com/Moeblack/dsh-message-edit) - Branch-based message editing, reroll, retry, and a version timeline.
- [dsh-sidechain](https://github.com/Buyi-wsgzg/dsh-sidechain) - `/side` persistent side sessions and `/btw` one-shot side questions, run in a temporary fork without touching main history.
- [dsh-conversation-share](https://github.com/bill9109/dsh-conversation-share) - Share any excerpt of a conversation.
- [dsh-explain](https://github.com/yuezengwu/dsh-explain) - Local-first learning mode: cross-session learning threads with per-source explanations.
- [dsh-prompt-studio](https://github.com/Moeblack/dsh-prompt-studio) - Edit user and built-in system-prompt sections with live preview.
- [dsh-peer-link](https://github.com/czm15053/dsh-peer-link) - Let dsh and Claude Code sessions message each other directly; comes with a clickable peer list card (sort/search/send/refresh).
- [dsh-chat-import](https://github.com/Nwflower/dsh-chat-import) - Import Claude Code / Codex / ChatGPT / Cursor / Gemini / Reasonix / opencode chat histories as resumable DeepSeek Harness sessions.
- [dsh-file-claim](https://github.com/Nwflower/dsh-file-claim) - File claim/release protection for parallel DSH sessions on the same workspace (heartbeat stale takeover, pending 3-way merge area).
- [dsh-interconnect](https://github.com/Chinesezjc/dsh-interconnect) - Cross-instance message and event handoff between DSH instances via an interconnect server.
- [dsh-prompt-stash](https://github.com/Wine-Red/dsh-prompt-stash) - Local, per-session LIFO prompt stash for temporarily setting aside unfinished composer text and safely restoring it later.

### Memory

- [distill](https://github.com/LoserFox/distill) - Automatic conversation distillation: background subagent reflection + skill create/update.
- [dsh-mnemon](https://github.com/omdsh-dev/dsh-mnemon) - Deep Mnemon integration: local three-tier memory (Runtime Memory, retrievable Documents, supervised Memory Spaces).
- [dsh-mneme](https://github.com/modusensus/dsh-mneme) - Cross-session memory: SQLite with a human-editable Markdown mirror, background consolidation (dedup, merge, conflict resolution), and six memory tools.
- [nowledge-mem-deepseek-harness](https://github.com/nowledge-co/nowledge-mem-deepseek-harness) - One memory layer for every AI tool and agent: Context Bundle injection, prompt-time recall, MCP tools, and turn-end DSH thread capture.
- [dsh-memory](https://github.com/Jesse-njx/dsh-memory) - Cited memory over DSH's lossless session log: distilled facts carry `(sessionId, eventRange)` citations that expand back to the exact original log excerpt.
- [dsh-memory-vault](https://github.com/flymysql/dsh-memory) - Cross-session memory vault: remember / recall / forget tools, per-turn prompt injection, and a settings-page entry browser.
- [dsh-plugin-asmemory](https://github.com/Xplore-LAB/dsh-plugin-asmemory) - Action-state time memory: record typed states and actions, then analyze trends, anomalies, and causality.
- [dsh-memento](https://github.com/PerryLink/dsh-memento) - Bounded, layered, approval-gated, auditable cross-session memory: a typed `ctx.memory` seam with a zero-dependency SQLite provider, a `memory` tool, and frozen snapshot injection; every write passes the approval gate and stays reconstructable from the session log.
- [dsh-file-memory](https://github.com/ICCuse/dsh-file-memory) - File-backed working memory: memorize/recall key premises verbatim in a session notes file so they survive context compaction losslessly.
- [dsh-knowledge](https://github.com/ICCuse/dsh-knowledge) - Bridge into a global Markdown knowledge base shared with the Codex kb.cmd CLI: kb_add/kb_search/kb_show/kb_timeline tools with byte-compatible frontmatter.
- [dsh-premise-guard](https://github.com/ICCuse/dsh-premise-guard) - Post-compaction premise-drift guard: injects a one-shot notice when a compaction summary drops a critical literal anchor.

### Tools & Capabilities

- [dsh-undo-plugin](https://github.com/lire1131/dsh-undo-plugin) - Undo/redo & rollback system for DSH: every config change is auto-snapshotted; undo/redo/restore to any version from the WebUI or the offline CLI/GUI tools (works even when DSH fails to boot).
- [dsh-bash-terminal](https://github.com/MAXeaglet/dsh-bash-terminal) - One shell tool for PowerShell / Git Bash / WSL on Windows plus an interactive PTY terminal; the default terminal is chosen by the user in DSH settings.
- [dsh-vision-toolkit](https://github.com/Anionex/dsh-vision-toolkit) - Vision tasks for text-only models: intent-aware image Q&A, long-screenshot OCR, UI reproduction, grounding, and pixel diff.
- [dsh-custom-tool](https://github.com/omdsh-dev/dsh-custom-tool) - Create and manage sandboxed JavaScript tools with a Monaco editor and model-driven tool lifecycle.
- [dsh-computer-use](https://github.com/Anionex/dsh-computer-use) - Accessibility-first macOS computer use: fresh observations, stale-state rejection, scoped permissions, and safe input.
- [dsh-data-agent](https://github.com/omdsh-dev/dsh-data-agent) - Let the AI connect to databases and write SQL for you.
- [dsh-toolkit](https://github.com/omdsh-dev/dsh-toolkit) - Zero-dependency toolkit: time / encoding / json / calculator / csv / regex / markdown / diff / stat / schema — ten deterministic tools in one install.
- [dsh-tool-csv](https://github.com/omdsh-dev/dsh-tool-csv) - Parse/query/aggregate/convert CSV (RFC 4180) with a zero-dependency state-machine parser.
- [dsh-tool-calculator](https://github.com/omdsh-dev/dsh-tool-calculator) - Safe math expression evaluator, zero-dependency recursive-descent parser.
- [dsh-tool-diff](https://github.com/omdsh-dev/dsh-tool-diff) - Structured comparison and unified diffs for text/JSON/CSV/Markdown.
- [dsh-tool-encoding](https://github.com/omdsh-dev/dsh-tool-encoding) - base64/url/hex encoding, common hashes, and UUID generation.
- [dsh-tool-json](https://github.com/omdsh-dev/dsh-tool-json) - JSON queries with a JMESPath subset.
- [dsh-tool-markdown](https://github.com/omdsh-dev/dsh-tool-markdown) - HTML↔Markdown conversion, GFM table normalization, and TOC generation.
- [dsh-tool-regex](https://github.com/omdsh-dev/dsh-tool-regex) - Test/extract/safe-replace/statically explain regexes without executing code.
- [dsh-tool-schema](https://github.com/omdsh-dev/dsh-tool-schema) - JSON Schema validation: validate/paths/explain/normalize.
- [dsh-tool-stat](https://github.com/omdsh-dev/dsh-tool-stat) - Descriptive statistics, percentiles, frequency distributions, and correlation.
- [dsh-tool-time](https://github.com/omdsh-dev/dsh-tool-time) - Strict ISO 8601 parsing, IANA timezone conversion, and UTC calendar arithmetic.
- [dsh-kb-sieve](https://github.com/omdsh-dev/dsh-kb-sieve) - Build auditable KB packs (SQLite FTS5) from md/txt/docx/pdf with deterministic retrieval and original-text reading.
- [dsh-plugin-mineru](https://github.com/HuanLinOTO/dsh-plugin-mineru) - Expose MineRU document parsing tools to the model.
- [dsh-cowork](https://github.com/Jesse-njx/dsh-cowork) - Bounded, cell-addressed `doc_read`/`doc_write` for xlsx / pdf / docx / pptx / ipynb, plus an MCP server and CLI.
- [dsh-skillport](https://github.com/Jesse-njx/dsh-skillport) - Bring your existing Agent Skills (SKILL.md) library to DSH: discover skills across Claude/Codex/Cursor/Gemini paths, inject a progressive-disclosure index, and load bodies on demand.
- [pack-agent-dsh](https://github.com/sakikoTGW/pack-agent) - Project .pack.json/.pack.zip into .agent-pack/modpacks/ and expose skills via a workspace allow-list.
- [dsh-tool-search](https://github.com/vibeinging/dsh-tool-search) - Per-agent on-demand tool discovery and progressive schema disclosure.
- [dsh-openmaic](https://github.com/THU-MAIC/dsh-openmaic) - OpenMAIC: classrooms, slides, interactive widgets, and Socratic teaching.
- [dsh-scholar](https://github.com/lzszq/dsh-scholar) - Academic assistant plugin.
- [noatmark-dsh-plugin](https://github.com/ylwl1997/noatmark-dsh-plugin) - Text hygiene as a dsh plugin: sanitize untrusted text, scan invisible characters, clean LLM formatting, and escape CSV formula injection.
- [dsh-apple-mode](https://github.com/jihongboo/dsh-apple-mode) - Xcode AI integration for DSH: 26 Xcode MCP tools (mcpbridge) + Apple platform skills + Xcode Intelligence-style persona (agent preset or global bundle).
- [dsh-continual-evolve](https://github.com/ZK-Andy/dsh-continual-evolve) - Continual self-evolution: versioned, auditable, rollback-safe harness state (prompts, memory, skills, subagent specs) refined from session trajectories, with review gates and hot-reloaded skills.
- [dsh-recommend](https://github.com/zp-home/dsh-recommend) - Transparent rankings and recommendations for the DSH plugin ecosystem: daily auto-fetched topic data, an open scoring model, and rank/search/recommend tools with a settings-page leaderboard.
- [modlens](https://github.com/liustack/modlens) - Vision bridge for text-only models: paste an image, get structured JSON evidence (OCR, layout, semantics).
- [dsh-market](https://github.com/dsh-market/dsh-market) - The plugin market inside DSH: a Settings page to browse and search the full community catalog by category, with confirmed one-click installs and an installed-plugins view.
- [dsh-find-plugin](https://github.com/awesome-dsh-plugin/dsh-find-plugin) - Find plugins without leaving the agent: search this curated registry by keyword or category, with ready-to-run install commands.
- [dsh-code-intel](https://github.com/lonelymoon87/dsh-code-intel) - Indexes workspace symbols with Tree-sitter and provides lexical or optional embedding-assisted code search.
- [dsh-subagent-tools](https://github.com/lynx-gt/dsh-subagent-tools) - Per-call model, provider, persona, and toolFilter overrides for subagent delegation, with @preset: references and provider/model composite ids.
- [dsh-subagent-cwd](https://github.com/lynx-gt/dsh-subagent-cwd) - Extends dsh-subagent-tools with a per-call cwd for subagents, shipped with the two in-process provider patches it requires.
- [dsh-voice](https://github.com/Jesse-njx/dsh-voice) - Voice notes in, spoken answers out: dictate audio that becomes user messages (transcribe), have the agent read replies aloud (speak), local-first under ~/.dsh/voice.
- [dsh-docker](https://github.com/Jesse-njx/dsh-docker) - Typed, guarded container control: ps/logs/inspect/exec/start/stop and compose up/down with JSON output, project-aware targeting, and approval-gated destructive ops.
- [dsh-excel-chat](https://github.com/hccccc01333/dsh-excel-chat) - Talk to Excel in DeepSeek Harness: create, edit, repair, and verify spreadsheets by conversation, with automatic formula health checks after every edit.
- [dsh-context-proxy](https://github.com/EvilIrving/dsh-context-proxy) - Thin on-demand context retrieval: context_query / context_slice / context_grep tools that read already-persisted history back with replay-safe citations.
- [@zhaoolee/dsh-notes](https://github.com/zhaoolee/notes) - Export DSH conversations as Smartisan Notes-style PNGs, or create and update Markdown notes in a configured account-scoped workspace.
- [dsh-figma-to-lottie](https://github.com/zimai233/dsh-figma-to-lottie) - Compile SVG paths and keyframe specs into self-contained Lottie JSON animation files.
- [dsh-exam-countdown](https://github.com/zimai233/dsh-exam-countdown) - Query 64 Chinese exams (高考/考研/四六级/CPA/法考…) with rule-aware date math (2nd-Saturday, 1st-Sunday) and countdowns.
- [dsh-wash-calendar](https://github.com/zimai233/dsh-wash-calendar) - Recurring-habit scheduling from pure date math: next occurrence, range schedules, and overdue advice.
- [dsh-adhd-copilot](https://github.com/zimai233/dsh-adhd-copilot) - ADHD behavioral coaching skill: task breakdown, overwhelm management, launch rituals, and failure recovery.
- [dsh-image-search](https://github.com/zimai233/dsh-image-search) - Multi-engine reverse image search aggregator: Google Lens, Baidu, Yandex, TinEye, SauceNAO, IQDB, Ascii2d.
- [dsh-video-downloader](https://github.com/zimai233/dsh-video-downloader) - Detect and download media from Bilibili/YouTube/Douyin/Xiaohongshu with quality and format analysis.
- [dsh-plugin-knowledge-graph](https://github.com/Luke-Yong/dsh-plugin-knowledge-graph) - A read_graph tool backed by a codebase knowledge graph (CONTAINS / EXPORTS / IMPORTS / IMPORTS_SYMBOL relations).
- [modsearch](https://github.com/liustack/modsearch) - Web search bridge for text-only agents: ask the web or X, get structured JSON evidence (search, fetch, citations).
- [argo](https://github.com/taxueseek/argo) - Search built for agents: multilingual coverage across web, academic, code, shopping, finance, news, and encyclopedias.
- [dsh-web-search-exa](https://github.com/TonyDua/dsh-web-search-exa) - Zero-config Exa web search provider for the ctx.web seam: anonymous MCP fallback without an API key, plus keyed REST search.
- [dsh-browser](https://github.com/Lum1104/dsh-browser) - Chrome sidebar extension that lets DSH operate your browser directly, no vision capabilities required.
- [dsh-webui-market-plugin](https://github.com/Sanqi-normal/dsh-webui-market-plugin) - In-harness plugin market for the dsh web GUI: browse the awesome-dsh-plugin.com catalog and install/uninstall plugins into a profile from Settings → Plugins → Plugin Market.
- [dsh-trio](https://github.com/huey1in/trio) - Browser automation (Playwright) with a live view, an MCP server exposing DSH agents to any MCP client, and GitHub issue/PR/webhook review tools.

### Workflow & Automation

- [dsh_workflow](https://github.com/icetomoyo/dsh_workflow) - UltraCode-style multi-agent orchestration: a generatable, savable, governable, observable, resumable workflow layer.
- [dsh-agent-teams](https://github.com/NanmiCoder/dsh-agent-teams) - AgentTeams multi-agent teams.
- [dsh-automation](https://github.com/titanwings/dsh-automation) - Scheduled coding runs in fresh agent sessions with auditable history.
- [dsh-plugin-automations](https://github.com/Sev7een/dsh-plugin-automations) - Settings-based scheduled tasks that run on time or during DeepSeek off-peak hours, with one-time and daily schedules backed by durable task state.
- [dsh-routines](https://github.com/Jesse-njx/dsh-routines) - Scheduled agents on a cron: run a prompt on a schedule and get the digest where you already are, with overlap/missed-run/timeout safety defaults.
- [dsh-plannotator](https://github.com/titanwings/dsh-plannotator) - Plan review with anchored annotations and structured feedback back to the agent.
- [dsh-loop](https://github.com/vlln/dsh-loop) - Recurring loops: `/loop` command + loop tool + activity status bar.
- [dsh-sentinel](https://github.com/fuhefei/dsh-sentinel) - Condition-driven wakeup: durable file/command/http/process/webhook watches that wake the agent.
- [dsh-deep-research](https://github.com/omdsh-dev/dsh-deep-research) - Adaptive deep-research orchestrator built on the official workflow engine.
- [dsh-inspect](https://github.com/omdsh-dev/dsh-inspect) - Adversarial checkup → fix → review loop toolset.
- [dsh-track](https://github.com/fakechris/dsh-track) - Embedded task management engine: decision-point protocol, idea capture wall, Linear-style issue store.
- [dsh-advisor](https://github.com/btspoony/dsh-advisor) - Pair a second model that passively reviews each turn and injects notes.
- [dsh-specflow](https://github.com/lonelymoon87/dsh-specflow) - Adds specification artifacts, skills, commands, goal-backed implementation, and task-progress context.
- [dsh-science](https://github.com/biociao/dsh-science) - Claude Science-style research workbench: ReAct research-loop engine (research_* tools), versioned artifacts with provenance (artifact_* tools), and 10 science skills for genomics/pathogens/bioinformatics.
- [dsh-proof](https://github.com/EvilIrving/dsh-proof) - Independent read-only acceptance layer: spawns a read-only verifier before each top-level turn closes and steers non-pass gaps back into the agent.
- [dsh-doublecheck](https://github.com/PerryLink/dsh-doublecheck) - Engineering-discipline guard: grill the requirements before the first edit, enforce red/green test evidence gates, and audit the delivery with a forked adversary (grill-requirements skill + tool-policy gates).
- [mstar-harness](https://github.com/btspoony/mstar-harness) - Skill-driven harness/loop engineering workflow agent plugin.

### Notifications & Integrations

- [dsh-open-in-vscode](https://github.com/omdsh-dev/dsh-open-in-vscode) - Open DSH workspace directories in VS Code directly from the web GUI.
- [dsh-notification](https://github.com/omdsh-dev/dsh-notification) - Desktop notifications for turn completions, with per-outcome controls and keyword rules.
- [dsh-acp-for-bitfun](https://github.com/bobleer/dsh-acp-for-bitfun) - ACP bridge between BitFun and DSH.
- [deepseek-harness-acp](https://github.com/openma-ai/deepseek-harness-acp) - ACP profile plugin and standalone stdio server for using the full DSH agent from Zed and other ACP clients while sharing DSH credentials and sessions.
- [telegram](https://github.com/LoserFox/telegram) - Bridge to the Telegram Bot API: long polling, per-chat sessions, HTML formatting.
- [dsh-chatnode-wechat](https://github.com/Jesse-njx/dsh-chatnode-wechat) - Chat with, monitor, and approve your DSH agents from WeChat via the iLink gateway: text both ways, session targeting, digest heartbeats, and numbered approval prompts.
- [dsh-session-notification](https://github.com/dingyi222666/dsh-session-notification) - Notifications for four session states, with browser alerts and prompts.
- [dsh-web-ui-notify](https://github.com/bill9109/dsh-web-ui-notify) - Desktop notification reminders.
- [dsh-webbridge](https://github.com/bill9109/dsh-webbridge) - DSH meets Kimi WebBridge.
- [dsh-im-bridge](https://github.com/BiBoyang/dsh-im-bridge) - Two-way WeChat (iLink) bridge: turn-end and approval-request push, in-chat approve/reject and message injection, persistent dedup and convergent long-reply chunking; channel layer extensible to other IMs.
- [dsh-lark-bridge](https://github.com/imetn/dsh-lark-bridge) - Bidirectional Lark/Feishu controller for DeepSeek Harness with project and session routing, interactive cards, approvals, attachments, and task controls.


### Models & Providers

- [llm-adaptive](https://github.com/dylan121322/llm-adaptive) - Adaptive model routing: per-request complexity classification with automatic provider routing.
- [dsh-llm-fallbacks](https://github.com/btspoony/dsh-llm-fallbacks) - Role-based LLM retry & fallback strategies.
- [dsh-codex-connect](https://github.com/franksong2702/dsh-codex-connect) - Connect ChatGPT OAuth and OpenAI Codex models to DeepSeek Harness, with opt-in search and image tools.
- [dsh-everything-oauth](https://github.com/kam74515-boop/dsh-everything-oauth) - Import local Codex, Grok, Claude, OpenCode, and CC Switch logins into DSH; pick sources and enable models in Settings.
- [Qwen-MM-Plugins](https://github.com/omdsh-dev/Qwen-MM-Plugins) - Qwen multi-modal plugin support.
- [dsh-codex-auth](https://github.com/suntianc/dsh-codex-auth) - Reuses the Codex CLI ChatGPT login as an `openai-codex` LLM route and adds GPT Auth controls to DSH Web settings.

### Development & Runtime

- [fabric](https://github.com/omdsh-dev/fabric) - An MC-Fabric-style hook processor.
- [dsh-git-identity](https://github.com/LoserFox/dsh-git-identity) - Pin Git commits to the environment's own author identity; env-var injection overrides all `git config` settings.
- [dsh-context-doctor](https://github.com/Zhenyu98/dsh-context-doctor) - Context injection audit: token costs of instruction chains / skill catalogs / tool schemas, duplicate and conflict detection.
- [dsh-pain-point-check](https://github.com/ICCuse/dsh-pain-point-check) - Enforced pain-point gate: after two non-converged experiments it injects the three questions, denies non-investigative tool calls until answered, and blocks same-direction retries.
- [dsh-plugin-check](https://github.com/omdsh-dev/dsh-plugin-check) - Plugin health checks: manifest protocol / patch format / build traps, zero-dependency and read-only.
- [dsh-security-audit](https://github.com/omdsh-dev/dsh-security-audit) - Local security audit: config, plugin origins, sessions, network exposure — read-only redacted risk report.
- [dsh-session-health](https://github.com/omdsh-dev/dsh-session-health) - Frame-level scan diagnostics for session files (torn/corrupt/empty detection).
- [dsh-evolve](https://github.com/william-jin-cmu/dsh-evolve) - Self-evolution: the agent hot-mounts/removes persistent plugins on itself mid-session.
- [dsh-trace](https://github.com/vibeinging/dsh-trace) - Telemetry backend exporting turns, model steps, and tool calls to yiTrace.
- [dsh-telemetry-redactor](https://github.com/030611/dsh-telemetry-redactor) - Redacts supported secret patterns from the `session-telemetry/record` export copy before configured telemetry backends receive it.
- [dsh-verification-receipt](https://github.com/030611/dsh-verification-receipt) - Writes local JSONL summaries of per-turn tool counts and coarse verification signals without storing prompts, tool arguments, or result text.
- [sandbox-micro](https://github.com/omdsh-dev/sandbox-micro) - Support for the microsandbox backend.
- [sandbox-mxc](https://github.com/omdsh-dev/sandbox-mxc) - Microsoft cross-platform sandbox support.
- [sandbox-nono](https://github.com/omdsh-dev/sandbox-nono) - Support for the nono sandbox backend.
- [dsh-agent-budget](https://github.com/vibeinging/dsh-agent-budget) - Agent-tree token budget management.
- [dsh-polyglot](https://github.com/Jesse-njx/dsh-polyglot) - The model switch for DSH: point it at any OpenAI-compatible endpoint, with curated free/cheap DeepSeek provider presets and automatic fallback when a free tier rate-limits you.
- [dsh-tool-approval](https://github.com/ilharp/dsh-tool-approval) - Manual approval mode ("Manual Mode" / "Ask Mode").
- [dsh-turn-approval](https://github.com/arrow949/dsh-turn-approval) - Turn-scoped “Allow for this task” approvals: automatically allow matching `danger-full-access` escalations only for the current task, then expire.
- [plugin-template](https://github.com/omdsh-dev/plugin-template) - Plugin template repo (based on the official turtle-ui repo).
- [dsh-tps](https://github.com/Small-tailqwq/dsh-tps) - A TPS metrics plugin.
- [dsh-fail-logger](https://github.com/Areium/dsh-fail-logger) - Auto-log failed tool calls across native tools, PTC run_code, and inline invocations: dedup and count root causes into a skill so repeated mistakes fade.
- [dsh-eval-harness](https://github.com/BiBoyang/dsh-eval-harness) - Evaluation harness for DSH plugins: YAML cases drive real headless agent runs, assert on tool calls, args, results and token usage, with a baseline gate for CI regression.
- [oh-dsh](https://github.com/hust-open-atom-club/oh-dsh) - Community distribution: TUI, desktop, and Web UI as one bundle with layered installation.
- [dsh-annotate](https://github.com/BrambleXu/dsh-annotate) - Select browser elements directly during Vibe Coding and send structured visual feedback to the DeepSeek Harness Agent.
- [dsh-prompt-profile](https://github.com/BrambleXu/dsh-prompt-profile) - Reusable Markdown prompt profiles for DeepSeek Harness with per-turn model selection, argument substitution, and state restoration.
- [dsh-revdiff](https://github.com/BrambleXu/dsh-revdiff) - Native interactive Git diff review for DeepSeek Harness with structured annotations sent back to the current Agent session.
- [dsh-gitflow](https://github.com/lonelymoon87/dsh-gitflow) - Adds approval-gated Git status, diff, log, commit, branch, and optional checkpoint tools.
- [dsh-guardian](https://github.com/lonelymoon87/dsh-guardian) - Adds dangerous-operation policy checks, output redaction, and a security-review workflow.
- [dsh-plugin-manager](https://github.com/Jesse-njx/dsh-plugin-manager) - The `dsh pm` plugin manager: multi-source search (awesome list + GitHub + npm), install/remove/update per profile, and a doctor audit of manifests, bundle patches, and version drift.
- [dsh-tmuxctl](https://github.com/Jesse-njx/dsh-tmuxctl) - Take control of your tmux panes: list/send-keys/capture, run long jobs in a pane with watch mode, and approval-gated destructive commands.
- [dsh-updater-ui](https://github.com/xingyingyuzhui/dsh-updater-ui) - DSH self-updater in the settings page: one-click check/pull (`git pull --ff-only`), auto background checks, version diff and changelog preview with a red-dot reminder.
- [dsh-repro](https://github.com/EvilIrving/dsh-repro) - /repro exports a minimal, secret-scrubbed, replayable problem bundle: the session log, failed commands, and Git diff.
- [dsh-mcp-panel](https://github.com/PerryLink/dsh-mcp-panel) - Read-only runtime management panel for the official DSH MCP client: connection status, registered tools, errors, and reconnect counts through the /mcp command and a Settings tab, with sanitized display and enable/disable patch suggestions.
- [forkprobe](https://github.com/Jayden-X-L/forkprobe) - Compare multiple skills on the same task and pick the winner.
- [plugin-registry](https://github.com/vlln/plugin-registry) - Ecosystem infrastructure: a thin browser console for managing official repository plugins (zero patches) plus a make-dsh-plugin skill for guided plugin development.
- [dsh-multica-runtime](https://github.com/forrestchang/dsh-multica-runtime) - Run the dsh runtime on Multica.
- [dsh-user-experience](https://github.com/DietCokewithSugar/dsh-user-experience) - Finds potential UX issues in your project: automatically reviews React/TypeScript code, pinpoints each problem, and gives concrete suggestions.
- [dsh-cost-tracker](https://github.com/yflmq001/dsh-cost-tracker) - Per-model token cost tracking with configurable cache-hit/miss, output and peak-window pricing, a live session cost bar, and unconfigured-model flags.

### Just for Fun

- [dsh-ads](https://github.com/Nagi-ovo/dsh-ads) - Parody ads in 2005-Chinese-web style: sidebar banners, in-chat feeds, corner popups, and a close button whose hit area is smaller than it looks. All fictional.
- [dsh-gomoku](https://github.com/omdsh-dev/dsh-gomoku) - Play Gomoku against the AI, or let two AIs battle it out.
- [dsh-stock-market](https://github.com/AnacondaKC/dsh-stock-market) - Fixes the bug where your account can't lose money while you code.
- [dsh-emoji](https://github.com/hellodigua/dsh-emoji) - Automatically add emojis to AI replies.
- [dsh-minigames](https://github.com/lhh010/dsh-minigames) - Side-panel arcade: 18 offline mini-games to play while the model thinks.
- [dsh-stickers](https://github.com/william-jin-cmu/dsh-stickers) - Bidirectional sticker reactions between user and agent.
- [whale-girl](https://github.com/vlln/whale-girl) - Desktop pet (QQ-pet style): floats in the corner, draggable, feedable, playable.
- [deepseek-manners](https://github.com/Moeblack/deepseek-manners) - Append a thank-you note after every message. Mind your manners.
- [dsh-plugin-d399](https://github.com/HuanLinOTO/dsh-plugin-d399) - Pops up a mini-game menu (wordle, match-3, extensible) while the model generates.
- [dsh-auto-chess](https://github.com/omdsh-dev/dsh-auto-chess) - Auto chess: human vs AI, or AI vs AI.
- [dsh-douyin](https://github.com/AnacondaKC/dsh-douyin) - Short-video sidebar: native player, series navigation, precise history replay.
- [dsh-pet](https://github.com/minybear/DeepSeek-Harness-Pet) - Codex-style desktop pet: a floating animated sprite in the corner that mirrors the agent's running state (working, waiting, failed, done).

## Contributing

PRs welcome — add one line under the matching category in both `README.md` and `README.zh.md`: `- [name](link) — one-line description`.

Please also add the [`dsh-plugin`](https://github.com/topics/dsh-plugin) topic to your repo so others can discover it.

## Badge

Listed here? Show it off:

![Awesome DSH Plugin](https://awesome-dsh-plugin.com/badge.svg)

```markdown
[![Awesome DSH Plugin](https://awesome-dsh-plugin.com/badge.svg)](https://awesome-dsh-plugin.com)
```

## Disclaimer

This is a community-maintained index. Plugins are developed and maintained by their respective authors; listing here is not an endorsement, and no guarantees are made about any plugin's safety, quality, or maintenance. Installing a plugin runs third-party code on your machine — review the source and install at your own risk. This project is not affiliated with DeepSeek.
