# Awesome DeepSeek Harness (DSH) Plugin [![Awesome](https://awesome.re/badge.svg)](https://awesome.re) ![awesome · DSH plugin](https://awesome-dsh-plugin.com/badge.svg)

[![Awesome DSH Plugin](https://awesome-dsh-plugin.com/banner-en.png)](https://awesome-dsh-plugin.com)

English | [中文](README.zh.md)

> A curated list of plugins for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (`dsh`).

DeepSeek Harness is DeepSeek's open-source agent harness — a runnable coding agent (Web and headless), built on a framework where everything is a plugin: models, tools, sandboxes, session storage, UI, even the agent loop itself. Plugins can extend the official coding agent, swap out its core parts, or assemble something entirely different.

This list collects community plugins that are installable via `dsh plugin add` (each declares a `dsh.bundle` manifest).

> 🛒 **Start with [dsh-market](https://github.com/dsh-market/dsh-market#readme)** — this whole list, inside DeepSeek Harness. Browse, search, see stars, install/update/uninstall in one click, most plugins live without a restart:

```sh
dsh plugin --profile web add dshmarket
```

> 💡 Prefer chat? [dsh-find-plugin](https://github.com/awesome-dsh-plugin/dsh-find-plugin#readme) lets your agent find plugins for you (`dsh plugin --profile web add dsh-find-plugin`).

**322** plugins · [PRs welcome](#contributing)

## Contents

- [Plugins](#plugins)
  - [UI Enhancements](#ui-enhancements)
  - [Themes & Appearance](#themes--appearance)
  - [Sessions & Messages](#sessions--messages)
  - [Memory](#memory)
  - [Tools & Capabilities](#tools--capabilities)
  - [Skills](#skills)
  - [Workflow & Automation](#workflow--automation)
  - [Notifications & Integrations](#notifications--integrations)
  - [Models & Providers](#models--providers)
  - [Development & Runtime](#development--runtime)
  - [Just for Fun](#just-for-fun)
- [Badge](#badge)
- [Disclaimer](#disclaimer)

## Plugins

### UI Enhancements

- [AcidGr/dsh-web-mobile-fix](https://github.com/AcidGr/dsh-web-mobile-fix) - Mobile layout fixes for the Web UI on narrow screens: full-screen settings panel, one-row plugin nav, full-screen sidebar, centered popups, icon-only session-log button.

- [AcidGr/dsh-web-lan-access](https://github.com/AcidGr/dsh-web-lan-access) - LAN/remote access for the Web UI: injects a crypto.randomUUID polyfill on plain-HTTP origins so the frontend survives LAN or Tailscale IP direct links.

- [Noob-stupid/dsh-plugin-hub](https://github.com/Noob-stupid/dsh-plugin-hub) - A plugin management panel: one-click enable/disable for installed plugins plus a GitHub dsh-plugin marketplace with details and one-click installs.

- [Make0209/dsh-usage-stats](https://github.com/Make0209/dsh-usage-stats) - GitHub-style usage heatmap dashboard: per-workspace turn counts and token spend (with cache-hit rate), DeepSeek account balance, and workspace aliases.

- [bowenliang123/dsh-context](https://github.com/bowenliang123/dsh-context) - Context insight panel: see what the model's context window is made of and how it evolves — composition vs. window size, per-request history, compression/injection events, and per-message token stats.

- [wjy9902/dsh-web-default-session](https://github.com/wjy9902/dsh-web-default-session) - The generic New Session action opens a default-directory workspace instead of requiring a folder pick, and the workspace picker lists that workspace as a no-folder choice.

- [Fishsb/dsh-prompt-enhancer](https://github.com/Fishsb/dsh-prompt-enhancer) - One-click prompt enhancement: an independent LLM call rewrites your rough draft in the composer, fully undoable.

- [huiliyi37/dsh-tianshu-tui](https://github.com/huiliyi37/dsh-tianshu-tui) - A terminal UI (TUI) for DeepSeek Harness.
- [openma-ai/deepseek-harness-tui](https://github.com/openma-ai/deepseek-harness-tui) - A Rust/ratatui terminal client that speaks the DSH SDK JSON-RPC protocol directly and runs standalone or as a profile bundle.
- [omdsh-dev/dsh-at-file](https://github.com/omdsh-dev/dsh-at-file) - Codex-style `@file` mentions: search workspace files in the composer and attach their contents to prompts.
- [alingalingling/ui-status-label](https://github.com/alingalingling/ui-status-label) - Customize the "deep diving" thinking status label to anything you like.
- [LeemanCheung/dsh-whale-animation](https://github.com/LeemanCheung/dsh-whale-animation) - Persistent black whale-dive animation beside the DSH Web turn status, with a reduced-motion fallback and a seamless closed loop.
- [01Virex/dsh-status-rotator](https://github.com/01Virex/dsh-status-rotator) - Replaces the "Deep diving..." turn-status label with rotating meme-worthy phrases, with typewriter and gradient effects.
- [ZSeven-W/dsh-openpencil](https://github.com/ZSeven-W/dsh-openpencil) - OpenPencil design preview and editing plugin.
- [Nagi-ovo/dsh-visualize](https://github.com/Nagi-ovo/dsh-visualize) - In-conversation generative UI: the model renders interactive HTML cards into the chat stream, with streaming preview and sandboxed rendering.
- [ccq1/dsh-side-panel](https://github.com/ccq1/dsh-side-panel) - Side panel with file browser, terminal, and Git review for quick file previews.
- [dingyi222666/dsh-focus-chat](https://github.com/dingyi222666/dsh-focus-chat) - A "focus chat" minimal view that shows only final outputs.
- [omdsh-dev/dsh-genui](https://github.com/omdsh-dev/dsh-genui) - Interactive UI components rendered inline in replies: layout, charts, forms, quizzes, mermaid, 3D scenes, and an action event loop back to the model.
- [omdsh-dev/dsh-annotation](https://github.com/omdsh-dev/dsh-annotation) - Select text → annotate → send with your message; replies map back to each annotation.
- [vlln/dsh-navbar](https://github.com/vlln/dsh-navbar) - Conversation node navigation bar for quick jumps between user messages.
- [asukasec/dsh-message-preview](https://github.com/asukasec/dsh-message-preview) - Right-edge user-message navigator with an adaptive block layout that fits the available height, plus hover previews, keyboard controls, and click-to-jump navigation.
- [vlln/dsh-task-status](https://github.com/vlln/dsh-task-status) - Background task status bar: progress plus live output tail on the chat page.
- [Nanki-nn/dsh-answer-pet](https://github.com/Nanki-nn/dsh-answer-pet) - Animated blue-whale desktop pet with per-session response progress, model activity and tool-call traces, token counts, output speed, elapsed time, and collapsible multi-session status cards.
- [renat3u/dsh-web-archive](https://github.com/renat3u/dsh-web-archive) - Collapse noisy messages (Think, Bash, etc.) in conversations.
- [0xsline/dsh-spotlight](https://github.com/0xsline/dsh-spotlight) - Keyboard-first command palette for the DSH Web UI.
- [GooodWei/arcana](https://github.com/GooodWei/arcana) - A floating command deck that lists every slash command in DeepSeek Harness as runnable buttons, sorted by usage.
- [GooodWei/context-vista](https://github.com/GooodWei/context-vista) - A right-side floating panel and /context command for DeepSeek Harness — a live donut chart of context token usage, allocation, and estimated cost.
- [bill9109/dsh-101](https://github.com/bill9109/dsh-101) - Document reading mode for DSH.
- [bill9109/dsh-drag-and-drop](https://github.com/bill9109/dsh-drag-and-drop) - Cross-platform file drag-and-drop with raw path insertion, no file copying.
- [taxueseek/dsh-files](https://github.com/taxueseek/dsh-files) - File upload with color-coded attachment cards (session-isolated storage, sha256 dedup, TTL sweep) plus a content-sniffing read_document tool for PDF/DOCX/XLSX/TXT.
- [l541402398/dsh-file-uploads](https://github.com/l541402398/dsh-file-uploads) - Upload arbitrary local files from the Web composer, show pending cards, and manage stored files in Settings.
- [qyw233/dsh-deeplink](https://github.com/qyw233/dsh-deeplink) - Deep links: open a specific session or workspace via `?session=` / `?workspace=`.
- [lehhair/dsh-diff-viewer](https://github.com/lehhair/dsh-diff-viewer) - PiUI-style diff viewer replacing the stock DiffBlock for write/edit tool calls.
- [omdsh-dev/ex-setting](https://github.com/omdsh-dev/ex-setting) - Settings extensions for DSH.
- [omdsh-dev/web-components](https://github.com/omdsh-dev/web-components) - Web Components support.
- [vibeinging/dsh-turn-navigator](https://github.com/vibeinging/dsh-turn-navigator) - Turn navigation for the DSH Web UI.
- [SnowCrescenter-tech/dsh-milestone](https://github.com/SnowCrescenter-tech/dsh-milestone) - Right-side dot-timeline rail: jump between user messages.
- [Ghost011118/dsh-balance-meter](https://github.com/Ghost011118/dsh-balance-meter) - DeepSeek account balance and session cost in the composer dock, with auto-fetched official pricing and peak/off-peak support.
- [v587d/dsh-opencode-go-usage](https://github.com/v587d/dsh-opencode-go-usage) - OpenCode Go subscription usage (rolling/weekly/monthly windows with reset countdowns) in the composer dock, with a built-in credential editor.
- [Han-1413141/dsh-cost-meter](https://github.com/Han-1413141/dsh-cost-meter) - Per-session and daily API cost, budget with usage %, official balance, history dashboard, and one-click official price sync with peak/off-peak pricing.
- [fishxcode/dsh-plugin-deepseek-balance](https://github.com/fishxcode/dsh-plugin-deepseek-balance) - DeepSeek API balance, balance trend, and daily usage charts in DSH Web settings.
- [Sev7een/ds-api-usage](https://github.com/Sev7een/ds-api-usage) - DeepSeek API balance and 24-hour usage dashboard in Settings, with estimated spend, token counts, request counts, and an hourly timeline.
- [nonewind/dsh-spend](https://github.com/nonewind/dsh-spend) - Token usage and estimated spend for the dsh web UI: floating panel with per-model, per-day, and per-session stats.
- [stevenx65/dsh-balance-plugin](https://github.com/stevenx65/dsh-balance-plugin) - DeepSeek balance and token usage in the web sidebar, with a today/all-time toggle and provider filtering.
- [ccch1mneyyy/dsh-TUI](https://github.com/ccch1mneyyy/dsh-TUI) - Claude Code-style full-screen terminal UI: pixel-whale header, live status line, and streaming thought expansion.
- [omdsh-dev/DSH-better-sidebar](https://github.com/omdsh-dev/DSH-better-sidebar) - Full sidebar workbench with file rendering and editing, terminal, Git, and subagents; third-party plugins can register new tabs.
- [tsonglew/dsh-workspace-search](https://github.com/tsonglew/dsh-workspace-search) - VS Code-style workspace keyword search tab for dsh-better-sidebar: matches file names and content, grouped by file with line numbers, opens in the sidebar editor.
- [tsonglew/dsh-media-preview](https://github.com/tsonglew/dsh-media-preview) - Audio/video FileViewer for dsh-better-sidebar: native inline playback for mp4/webm/mkv/mov and mp3/flac/wav, served by a Range-capable streaming media route.
- [Han-1413141/dsh-sticky-disclosure](https://github.com/Han-1413141/dsh-sticky-disclosure) - One-click collapse of every expanded section (Think rows, tool cards) with a live-count pill and a customizable hotkey.
- [Meredith2328/dsh-sticky-note](https://github.com/Meredith2328/dsh-sticky-note) - Quick sticky notes on the composer toolbar: jot ideas or TODOs, auto-saved as Markdown, one click to send into the chat.
- [Luaphes/dsh-web-attention-badge](https://github.com/Luaphes/dsh-web-attention-badge) - Attention reminders: frame badge, tab-title count, and a status-colored whale favicon for sessions waiting for input or finished unopened.
- [zhu1090093659/dsh-web-ui](https://github.com/zhu1090093659/dsh-web-ui) - Plugin and skin collection for the DSH Web UI: task board, Git graph, right-side panel, remote mobile UI, pet, live token stats, and a skin center.
- [zealot00/dsh-pet](https://github.com/zealot00/dsh-pet) - Desktop pet for the DSH Web UI: sprite-sheet animation, agent state linkage, drag, alarm (daily/one-shot) and pomodoro widgets, skin picker with preview.
- [sereinmono/dsh-desktop-pet](https://github.com/sereinmono/dsh-desktop-pet) - A plugin that adds a desktop pet to your DeepSeek Harness, supporting the Codex pet format, you can use hatch-pet or Petdex to add your pets.
- [Starfie1d1272/dsh-builtin-toggles](https://github.com/Starfie1d1272/dsh-builtin-toggles) - Adds a built-in plugin catalog to DSH Web with search, status explanations, and safe toggles for audited UI plugins.
- [jiangnanquan/dsh-ux](https://github.com/jiangnanquan/dsh-ux) - Solarized light theme, compact layout, think/tool-chain collapse capsules, and balance, session cost, and usage dashboards for the DSH web UI.
- [a903067276-rgb/dsh-hud](https://github.com/a903067276-rgb/dsh-hud) - HUD status panel: Git status, MCP servers, skills, model and token usage in a floating side panel.
- [wsxwj123/dsh-plugins#turn-scrubber](https://github.com/wsxwj123/dsh-plugins/tree/main/packages/turn-scrubber) - Compact right-edge turn rail with hover summaries and click-to-jump navigation.
- [Sttrevens/dsh-cost-meter](https://github.com/Sttrevens/dsh-cost-meter) - Per-turn USD cost badge in the Web UI: session total in the header and per-turn cost in each message footer, with a hover breakdown.
- [a903067276-rgb/dsh-file-mentions](https://github.com/a903067276-rgb/dsh-file-mentions) - Clickable file paths in DSH replies: Codex-style inline open, reveal in file manager, and a mentioned-files chip list at the turn tail.
- [bobcat848/dsh-calculator](https://github.com/bobcat848/dsh-calculator) - DeepSeek API spend (current session and all sessions) and account balance in the aside panel, with official pricing and peak/off-peak support.


- [Jolly-J/dsh-deepseek-billing](https://github.com/Jolly-J/dsh-deepseek-billing) - DeepSeek account balance and per-session cost card in the sidebar foot.
- [AKIRACOD/dsh-drag-and-drop](https://github.com/AKIRACOD/dsh-drag-and-drop) - File-drag fork: drop documents as removable chips above the composer, send without typing.
- [HsiangNianian/dsh-auto-continue](https://github.com/HsiangNianian/dsh-auto-continue) - Auto-resumes interrupted DSH Web requests: sends a queued 「继续」 after network, timeout or host-crash failures, with error classification, adaptive backoff, templated continue text and browser notifications.
- [liliuCourier/dsh-chat-outline](https://github.com/liliuCourier/dsh-chat-outline) - Persistent left-hand conversation outline: questions and final replies per turn, keyword filter, one-click jump.
- [LaoYueHanNi/dsh-token-usage](https://github.com/LaoYueHanNi/dsh-token-usage) - Per-request model token usage tracked to per-day JSONL files, with a stats page in Web settings: daily trend chart, per-model breakdown, and date/model filters.
- [QT-Chen/dsh-mic-input](https://github.com/QT-Chen/dsh-mic-input) - Microphone voice input for the composer: browser Web Speech API live transcription, dedupe/auto-continue, smart punctuation, language and auto-send settings.
- [LeemanCheung/dsh-task-dag](https://github.com/LeemanCheung/dsh-task-dag) - Displays a Session's subagents and durable workflow runs as a live DAG with status, navigation, and restart-safe history.
- [MorGogh/widget-dock](https://github.com/MorGogh/widget-dock) - Draggable workbench of mini-cards (API balance, token usage, session stats, goal, cost) on the blank areas beside the conversation, with size tiers and official DeepSeek pricing.
- [qjcnmd/dsh-reasoning-slider](https://github.com/qjcnmd/dsh-reasoning-slider) - Codex-style reasoning-effort slider embedded in the model selector.
- [causebefore/dsh-pomodoro](https://github.com/causebefore/dsh-pomodoro) - Pomodoro focus-and-break timer for DSH Web with configurable cycles, a draggable mini panel, and in-app, sound, and browser notifications.


- [siberiah2o/dsh-plugin-terminal](https://github.com/siberiah2o/dsh-plugin-terminal) - Bottom multi-tab terminal panel (node-pty + xterm.js) pinned to the viewport bottom, always below the input box.
- [283Gawin/dsh-heatmap](https://github.com/283Gawin/dsh-heatmap) - Activity heatmap in the DSH Web sidebar: GitHub-style grid of daily commits, token usage, and estimated spend, with a today stats line for all-session token totals, cache hit rate, and per-model auto-priced cost.
- [Max-Samson/dsh-usage-chart](https://github.com/Max-Samson/dsh-usage-chart) - Token, cost, and balance dashboard under the composer: live indicator plus zero-dependency SVG charts for per-turn usage, estimated cost, and DeepSeek account balance.
### Themes & Appearance

- [KinGao294/dsh-skin](https://github.com/KinGao294/dsh-skin) - Codex-style skin switcher plus a custom wallpaper layer with opacity and blur controls.
- [Small-tailqwq/dsh-deep-whale](https://github.com/Small-tailqwq/dsh-deep-whale) - Whale-girl skin series for the DSH Web UI (maid-atelier).
- [wsxwj123/dsh-plugins#theme-gallery](https://github.com/wsxwj123/dsh-plugins/tree/main/packages/theme-gallery) - Fifteen curated theme families with complete light and dark palettes that follow the native Light, Dark, and Follow system modes.
- [PAKIKNOWLEDGE/dsh-client-ui-skin-claude](https://github.com/PAKIKNOWLEDGE/dsh-client-ui-skin-claude) - Claude-style skin with a warm-black canvas, clay accent, and serif UI that follows the native light and dark themes.


### Sessions & Messages

- [penguin-oo/dsh-bookmarks](https://github.com/penguin-oo/dsh-bookmarks) - Bookmark assistant replies with notes and tags; browse every bookmark in one cross-session center and export to Markdown.




- [Anionex/dsh-turn-rewind](https://github.com/Anionex/dsh-turn-rewind) - Rewind conversation and workspace state, powered by a persistent Change Ledger.
- [Jesse-njx/dsh-crosstalk](https://github.com/Jesse-njx/dsh-crosstalk) - Cross-session messaging for DSH: any session on the machine can list and message any other, Claude Code-style, via a local heartbeat registry and inbox.
- [dongsheng123132/task-passport](https://github.com/dongsheng123132/task-passport) - Carry durable task state across DeepSeek Harness, WorkBuddy, Claude Code and Codex with machine-readable checkpoints and optimistic locking.
- [LeslieWylie/dsh-task-relay](https://github.com/LeslieWylie/dsh-task-relay) - Cross-session task queue with handoff notes: sessions and subagents push, claim, complete and cancel tasks on a shared file-backed queue, and leave a handoff summary for whoever picks up next.
- [hellodigua/dsh-share](https://github.com/hellodigua/dsh-share) - Share your conversations with one click.
- [Moeblack/dsh-message-edit](https://github.com/Moeblack/dsh-message-edit) - Branch-based message editing, reroll, retry, and a version timeline.
- [Buyi-wsgzg/dsh-sidechain](https://github.com/Buyi-wsgzg/dsh-sidechain) - `/side` persistent side sessions and `/btw` one-shot side questions, run in a temporary fork without touching main history.
- [bill9109/dsh-conversation-share](https://github.com/bill9109/dsh-conversation-share) - Share any excerpt of a conversation.
- [yuezengwu/dsh-explain](https://github.com/yuezengwu/dsh-explain) - Local-first learning mode: cross-session learning threads with per-source explanations.
- [Moeblack/dsh-prompt-studio](https://github.com/Moeblack/dsh-prompt-studio) - Edit user and built-in system-prompt sections with live preview.
- [czm15053/dsh-peer-link](https://github.com/czm15053/dsh-peer-link) - Let dsh and Claude Code sessions message each other directly; comes with a clickable peer list card (sort/search/send/refresh).
- [Nwflower/dsh-chat-import](https://github.com/Nwflower/dsh-chat-import) - Import full-fidelity chat histories from 13 coding agents (Claude Code, Codex, ChatGPT, Cursor, Gemini, opencode, and more) as resumable DeepSeek Harness sessions, with reverse export back to Claude Code.
- [Nwflower/dsh-file-claim](https://github.com/Nwflower/dsh-file-claim) - File claim/release protection for parallel DSH sessions on the same workspace (heartbeat stale takeover, pending 3-way merge area).
- [Chinesezjc/dsh-interconnect](https://github.com/Chinesezjc/dsh-interconnect) - Cross-instance message and event handoff between DSH instances via an interconnect server.
- [3403473060/dsh-inline-images](https://github.com/3403473060/dsh-inline-images) - Render local image paths from assistant replies inline in the message body (9 formats, click-to-zoom lightbox, adjustable size).
- [Wine-Red/dsh-prompt-stash](https://github.com/Wine-Red/dsh-prompt-stash) - Local, per-session LIFO prompt stash for temporarily setting aside unfinished composer text and safely restoring it later.
- [heartmove/dsh-side-chat](https://github.com/heartmove/dsh-side-chat) - Select part of a conversation and ask about it in a right-side side chat; bring AI replies back to the main chat directly or as a summary.
- [bwndlct/dsh-session-export](https://github.com/bwndlct/dsh-session-export) - Export the current session to portable, schema-versioned Markdown and JSON files via the `session_export` tool and slash commands, with cross-platform-safe filenames.
- [LeemanCheung/dsh-token-usage](https://github.com/LeemanCheung/dsh-token-usage) - Persistent per-session Token usage records and a settings dashboard with provider/model breakdowns and a 52-week activity heatmap.
- [whyihaveyou/dsh-suite#plugin-session-export](https://github.com/whyihaveyou/dsh-suite/tree/main/packages/plugins/plugin-session-export) - Export the append-only session log as human-readable Markdown or HTML, grouped by trajectory source.
- [LeslieWylie/dsh-session-search-pro](https://github.com/LeslieWylie/dsh-session-search-pro) - Search, list and read past and current sessions through the harness's own `sessionQuery` service: uses the SQLite FTS5 index where a deployment enables it, and falls back to a bounded newest-first scan where it does not.
- [lsz-asd/dsh-plugin-session-delete](https://github.com/lsz-asd/dsh-plugin-session-delete) - Delete DSH sessions from the web UI and desktop client: header danger button and session-row menu item with a risk-consent dialog; host endpoint and agent tool remove the session log, projection cache, and workspace accounting.

### Memory

- [LoserFox/distill](https://github.com/LoserFox/distill) - Automatic conversation distillation: background subagent reflection + skill create/update.
- [omdsh-dev/dsh-mnemon](https://github.com/omdsh-dev/dsh-mnemon) - Deep Mnemon integration: local three-tier memory (Runtime Memory, retrievable Documents, supervised Memory Spaces).
- [modusensus/dsh-mneme](https://github.com/modusensus/dsh-mneme) - Cross-session memory: SQLite with a human-editable Markdown mirror, background consolidation (dedup, merge, conflict resolution), and six memory tools.
- [nowledge-co/nowledge-mem-deepseek-harness](https://github.com/nowledge-co/nowledge-mem-deepseek-harness) - One memory layer for every AI tool and agent: Context Bundle injection, prompt-time recall, MCP tools, and turn-end DSH thread capture.
- [Jesse-njx/dsh-memory](https://github.com/Jesse-njx/dsh-memory) - Cited memory over DSH's lossless session log: distilled facts carry `(sessionId, eventRange)` citations that expand back to the exact original log excerpt.
- [flymysql/dsh-memory](https://github.com/flymysql/dsh-memory) - Cross-session memory vault: remember / recall / forget tools, per-turn prompt injection, and a settings-page entry browser.
- [Xplore-LAB/dsh-plugin-asmemory](https://github.com/Xplore-LAB/dsh-plugin-asmemory) - Action-state time memory: record typed states and actions, then analyze trends, anomalies, and causality.
- [PerryLink/dsh-memento](https://github.com/PerryLink/dsh-memento) - Bounded, layered, approval-gated, auditable cross-session memory: a typed `ctx.memory` seam with a zero-dependency SQLite provider, a `memory` tool, and frozen snapshot injection; every write passes the approval gate and stays reconstructable from the session log.
- [GIT121995/dsh-memory-gate](https://github.com/GIT121995/dsh-memory-gate) - Bounded local memory with CBDC authority gating: SQLite + FTS5 claims, scoped recall with explainable use/verify/ignore decisions and a full audit trail, /memory commands, ≤3-claim/1200-char injection per call, no extra model call.
- [ICCuse/dsh-file-memory](https://github.com/ICCuse/dsh-file-memory) - File-backed working memory: memorize/recall key premises verbatim in a session notes file so they survive context compaction losslessly.
- [ICCuse/dsh-knowledge](https://github.com/ICCuse/dsh-knowledge) - Bridge into a global Markdown knowledge base shared with the Codex kb.cmd CLI: kb_add/kb_search/kb_show/kb_timeline tools with byte-compatible frontmatter.
- [ICCuse/dsh-premise-guard](https://github.com/ICCuse/dsh-premise-guard) - Post-compaction premise-drift guard: injects a one-shot notice when a compaction summary drops a critical literal anchor.
- [freehul/sgme](https://github.com/freehul/sgme) - ShiGuang Memory Engine (SGME) bridge: multi-agent shared long-term memory via HTTP — L0/L1/L1.5/L2 distillation, scenario-based injection, unified search, and proactive care signals (memory_search / wiki_search / signal_pull / signal_claim / signal_ack), installable as `dsh-sgme`.
- [Phant0Meow/dsh-memory-meow](https://github.com/Phant0Meow/dsh-memory-meow) - Project-scoped cross-session memory: PROJECT.md snapshot injected into the first user message, a memory_remember tool, and auto-reflection after ReAct tasks; each project keeps its own memory file.
- [jiayan-xu/dsh-memoria](https://github.com/jiayan-xu/dsh-memoria) - Vector + graph memory backend: observe/remember/search/recall tools against a local memoria server, fusing HNSW semantic recall, FTS5 keyword search, and knowledge-graph signals via RRF ranking, with automatic turn-end persistence and per-agent namespace isolation.
- [jinguanghai/deepseek-harness-forge-plugins#forge-memory](https://github.com/jinguanghai/deepseek-harness-forge-plugins/tree/main/plugins/forge-memory) - BM25 keyword-based memory recall.
- [FuRongJun-1999/dsh-memory](https://github.com/FuRongJun-1999/dsh-memory) - Multi-agent spatiotemporal memory graph with cross-session persistence and importance-gated recall.
- [jiayan-xu/dsh-memoria-extra](https://github.com/jiayan-xu/dsh-memoria-extra) - Advanced memoria tools: session context injection (profile + recall), recent decisions, health report, namespace allowlist, memory relation graph, and entity search; companion to dsh-memoria.


### Tools & Capabilities

- [Smalldy/godot-bridge](https://github.com/Smalldy/godot-bridge) - DSH↔Godot engine runtime bridge: launch and drive a running Godot 4.x game through its in-game TCP interaction server — 8 tools (scene/UI inspection, GDScript eval, input simulation, screenshots, headless static ops, script validation), replaces godot-mcp.
- [CheshireJCat/blender](https://github.com/CheshireJCat/blender) - Blender 3D production plugin with 30 modeling/reconstruction skills, 13 runtime tools, and 26 deterministic helpers for reference fitting, rendering, validation, animation, and portable export; installable as `dsh-blender`.
- [ysr666/dsh-vision-router](https://github.com/ysr666/dsh-vision-router) - Free vision for text-only agents: built-in keyless vision chain plus pixel tools (Q&A, grounding, crop, pixel diff, colors, OCR, SVG trace, cutout, screenshots); paste an image to use it.
- [Flyvhidbwo/dsh-vision-proxy](https://github.com/Flyvhidbwo/dsh-vision-proxy) - DeepSeek brain + automatic image transcription: attach images in the GUI and each one is transcribed to text via any OpenAI-compatible VLM before reaching the text-only DeepSeek — a keyed fast path (default qwen3.7-flash; DashScope/Zhipu/OpenRouter or any OpenAI-compatible endpoint) with your own key, or local Ollama auto-detected with zero config.
- [ximengxiaolan/dsh-vision-bridge](https://github.com/ximengxiaolan/dsh-vision-bridge) - Composer-attached images are transcribed to text by an OpenAI-compatible vision model before reaching text-only DeepSeek models.
- [linenxi-ctrl/dsh-vision](https://github.com/linenxi-ctrl/dsh-vision) - External vision plugin for DeepSeek Harness: whale-button config panel, image recognition with auto-reply, and agent screenshot/recognize tools.
- [Einskyle/dsh-llm-vision-bridge](https://github.com/Einskyle/dsh-llm-vision-bridge) - Native LLM-provider vision bridge: images pasted in the chat are described by a vision model (Qwen3-VL via pi-ai/llama.cpp) and the text description is fed to text-only DeepSeek for the reply — image admission, routing and compaction all run through harness-native mechanisms, with an LRU description cache and 503 retry.
- [lire1131/dsh-undo-plugin](https://github.com/lire1131/dsh-undo-plugin) - Undo/redo & rollback system for DSH: every config change is auto-snapshotted; undo/redo/restore to any version from the WebUI or the offline CLI/GUI tools (works even when DSH fails to boot).
- [MAXeaglet/dsh-bash-terminal](https://github.com/MAXeaglet/dsh-bash-terminal) - One shell tool for PowerShell / Git Bash / WSL on Windows plus an interactive PTY terminal; the default terminal is chosen by the user in DSH settings.
- [Anionex/dsh-vision-toolkit](https://github.com/Anionex/dsh-vision-toolkit) - Vision tasks for text-only models: intent-aware image Q&A, long-screenshot OCR, UI reproduction, grounding, and pixel diff.
- [yun520-1/deepseek-heartflow](https://github.com/yun520-1/deepseek-heartflow) - HeartFlow (心虫) AGI layer-1 discriminator gate as a DSH plugin: 47-dimension rule-based text checking (heartflow_check tool) plus automatic output supervision at tools/post-execute, fail-closed when engine missing.
- [omdsh-dev/dsh-custom-tool](https://github.com/omdsh-dev/dsh-custom-tool) - Create and manage sandboxed JavaScript tools with a Monaco editor and model-driven tool lifecycle.
- [ZRui-C/dsh-computer-use](https://github.com/ZRui-C/dsh-computer-use) - Text-first computer use for DSH: background Chromium control via Playwright/CDP plus accessibility-first macOS control; actions stay pinned to the right process and window without taking the user's pointer, ships a Developer ID signed, notarized Universal 2 DMG.
- [Anionex/dsh-computer-use](https://github.com/Anionex/dsh-computer-use) - Accessibility-first macOS computer use: fresh observations, stale-state rejection, scoped permissions, and safe input.
- [kunjinkao-os/dsh-mobile-gui-agent](https://github.com/kunjinkao-os/dsh-mobile-gui-agent) - Android GUI Agent with ADB screenshots, compact UI hierarchy grounding, verified iterative actions, approvals, and a Mobile Web view.
- [omdsh-dev/dsh-data-agent](https://github.com/omdsh-dev/dsh-data-agent) - Let the AI connect to databases and write SQL for you.
- [omdsh-dev/dsh-toolkit](https://github.com/omdsh-dev/dsh-toolkit) - Zero-dependency toolkit: time / encoding / json / calculator / csv / regex / markdown / diff / stat / schema — ten deterministic tools in one install.
- [flymysql/dsh-remote](https://github.com/flymysql/dsh-remote) - Multi-machine remote workspace: manage many SSH hosts, pick a local or remote workspace in the native Add-workspace flow (system folder chooser / local path / remote dir browse), mirror a remote workspace to a real local folder, and operate it with rw_* tools.
- [omdsh-dev/dsh-tool-csv](https://github.com/omdsh-dev/dsh-tool-csv) - Parse/query/aggregate/convert CSV (RFC 4180) with a zero-dependency state-machine parser.
- [omdsh-dev/dsh-tool-calculator](https://github.com/omdsh-dev/dsh-tool-calculator) - Safe math expression evaluator, zero-dependency recursive-descent parser.
- [omdsh-dev/dsh-tool-diff](https://github.com/omdsh-dev/dsh-tool-diff) - Structured comparison and unified diffs for text/JSON/CSV/Markdown.
- [omdsh-dev/dsh-tool-encoding](https://github.com/omdsh-dev/dsh-tool-encoding) - base64/url/hex encoding, common hashes, and UUID generation.
- [omdsh-dev/dsh-tool-json](https://github.com/omdsh-dev/dsh-tool-json) - JSON queries with a JMESPath subset.
- [omdsh-dev/dsh-tool-markdown](https://github.com/omdsh-dev/dsh-tool-markdown) - HTML↔Markdown conversion, GFM table normalization, and TOC generation.
- [omdsh-dev/dsh-tool-regex](https://github.com/omdsh-dev/dsh-tool-regex) - Test/extract/safe-replace/statically explain regexes without executing code.
- [omdsh-dev/dsh-tool-schema](https://github.com/omdsh-dev/dsh-tool-schema) - JSON Schema validation: validate/paths/explain/normalize.
- [omdsh-dev/dsh-tool-stat](https://github.com/omdsh-dev/dsh-tool-stat) - Descriptive statistics, percentiles, frequency distributions, and correlation.
- [omdsh-dev/dsh-tool-time](https://github.com/omdsh-dev/dsh-tool-time) - Strict ISO 8601 parsing, IANA timezone conversion, and UTC calendar arithmetic.
- [omdsh-dev/dsh-kb-sieve](https://github.com/omdsh-dev/dsh-kb-sieve) - Build auditable KB packs (SQLite FTS5) from md/txt/docx/pdf with deterministic retrieval and original-text reading.
- [HuanLinOTO/dsh-plugin-mineru](https://github.com/HuanLinOTO/dsh-plugin-mineru) - Expose MineRU document parsing tools to the model.
- [Jesse-njx/dsh-cowork](https://github.com/Jesse-njx/dsh-cowork) - Bounded, cell-addressed `doc_read`/`doc_write` for xlsx / pdf / docx / pptx / ipynb, plus an MCP server and CLI.
- [Jesse-njx/dsh-skillport](https://github.com/Jesse-njx/dsh-skillport) - Bring your existing Agent Skills (SKILL.md) library to DSH: discover skills across Claude/Codex/Cursor/Gemini paths, inject a progressive-disclosure index, and load bodies on demand.
- [sakikoTGW/pack-agent](https://github.com/sakikoTGW/pack-agent) - Project .pack.json/.pack.zip into .agent-pack/modpacks/ and expose skills via a workspace allow-list.
- [vibeinging/dsh-tool-search](https://github.com/vibeinging/dsh-tool-search) - Per-agent on-demand tool discovery and progressive schema disclosure.
- [THU-MAIC/dsh-openmaic](https://github.com/THU-MAIC/dsh-openmaic) - OpenMAIC: classrooms, slides, interactive widgets, and Socratic teaching.
- [lzszq/dsh-scholar](https://github.com/lzszq/dsh-scholar) - Academic assistant plugin.
- [ylwl1997/noatmark-dsh-plugin](https://github.com/ylwl1997/noatmark-dsh-plugin) - Text hygiene as a dsh plugin: sanitize untrusted text, scan invisible characters, clean LLM formatting, and escape CSV formula injection.
- [jihongboo/dsh-apple-mode](https://github.com/jihongboo/dsh-apple-mode) - Xcode AI integration for DSH: 26 Xcode MCP tools (mcpbridge) + Apple platform skills + Xcode Intelligence-style persona (agent preset or global bundle).
- [ZK-Andy/dsh-continual-evolve](https://github.com/ZK-Andy/dsh-continual-evolve) - Continual self-evolution: versioned, auditable, rollback-safe harness state (prompts, memory, skills, subagent specs) refined from session trajectories, with review gates and hot-reloaded skills.
- [zp-home/dsh-recommend](https://github.com/zp-home/dsh-recommend) - Transparent rankings and recommendations for the DSH plugin ecosystem: daily auto-fetched topic data, an open scoring model, and rank/search/recommend tools with a settings-page leaderboard.
- [liustack/modlens](https://github.com/liustack/modlens) - Vision bridge for text-only models: paste an image, get structured JSON evidence (OCR, layout, semantics).
- [dsh-market/dsh-market](https://github.com/dsh-market/dsh-market) - The plugin market inside DSH: a Settings page to browse and search the full community catalog by category, with confirmed one-click installs and an installed-plugins view.
- [crTnT/dsh-plugin-suite#dsh-plugin-center](https://github.com/crTnT/dsh-plugin-suite/tree/main/dsh-plugin-center) - Plugin center: discover, install, and manage DSH plugins from Settings.
- [crTnT/dsh-plugin-suite#dsh-plugin-updater](https://github.com/crTnT/dsh-plugin-suite/tree/main/dsh-plugin-updater) - Update manager for installed plugins: check for updates, back up, and roll back.
- [awesome-dsh-plugin/dsh-find-plugin](https://github.com/awesome-dsh-plugin/dsh-find-plugin) - Find plugins without leaving the agent: search this curated registry by keyword or category, with ready-to-run install commands.
- [lonelymoon87/dsh-code-intel](https://github.com/lonelymoon87/dsh-code-intel) - Indexes workspace symbols with Tree-sitter and provides lexical or optional embedding-assisted code search.
- [lynx-gt/dsh-subagent-tools](https://github.com/lynx-gt/dsh-subagent-tools) - Per-call model, provider, persona, and toolFilter overrides for subagent delegation, with @preset: references and provider/model composite ids.
- [lynx-gt/dsh-subagent-cwd](https://github.com/lynx-gt/dsh-subagent-cwd) - Extends dsh-subagent-tools with a per-call cwd for subagents, shipped with the two in-process provider patches it requires.
- [Jesse-njx/dsh-voice](https://github.com/Jesse-njx/dsh-voice) - Voice notes in, spoken answers out: dictate audio that becomes user messages (transcribe), have the agent read replies aloud (speak), local-first under ~/.dsh/voice.
- [Jesse-njx/dsh-docker](https://github.com/Jesse-njx/dsh-docker) - Typed, guarded container control: ps/logs/inspect/exec/start/stop and compose up/down with JSON output, project-aware targeting, and approval-gated destructive ops.
- [hccccc01333/dsh-excel-chat](https://github.com/hccccc01333/dsh-excel-chat) - Talk to Excel in DeepSeek Harness: create, edit, repair, and verify spreadsheets by conversation, with automatic formula health checks after every edit.
- [EvilIrving/dsh-context-proxy](https://github.com/EvilIrving/dsh-context-proxy) - Thin on-demand context retrieval: context_query / context_slice / context_grep tools that read already-persisted history back with replay-safe citations.
- [zhaoolee/notes](https://github.com/zhaoolee/notes) - Export DSH conversations as Smartisan Notes-style PNGs, or create and update Markdown notes in a configured account-scoped workspace.
- [zimai233/dsh-figma-to-lottie](https://github.com/zimai233/dsh-figma-to-lottie) - Compile SVG paths and keyframe specs into self-contained Lottie JSON animation files.
- [zimai233/dsh-exam-countdown](https://github.com/zimai233/dsh-exam-countdown) - Query 64 Chinese exams (高考/考研/四六级/CPA/法考…) with rule-aware date math (2nd-Saturday, 1st-Sunday) and countdowns.
- [zimai233/dsh-wash-calendar](https://github.com/zimai233/dsh-wash-calendar) - Recurring-habit scheduling from pure date math: next occurrence, range schedules, and overdue advice.
- [zimai233/dsh-adhd-copilot](https://github.com/zimai233/dsh-adhd-copilot) - ADHD behavioral coaching skill: task breakdown, overwhelm management, launch rituals, and failure recovery.
- [zimai233/dsh-image-search](https://github.com/zimai233/dsh-image-search) - Multi-engine reverse image search aggregator: Google Lens, Baidu, Yandex, TinEye, SauceNAO, IQDB, Ascii2d.
- [zimai233/dsh-video-downloader](https://github.com/zimai233/dsh-video-downloader) - Detect and download media from Bilibili/YouTube/Douyin/Xiaohongshu with quality and format analysis.
- [Luke-Yong/dsh-plugin-knowledge-graph](https://github.com/Luke-Yong/dsh-plugin-knowledge-graph) - A read_graph tool backed by a codebase knowledge graph (CONTAINS / EXPORTS / IMPORTS / IMPORTS_SYMBOL relations).
- [liustack/modsearch](https://github.com/liustack/modsearch) - Web search bridge for text-only agents: ask the web or X, get structured JSON evidence (search, fetch, citations).
- [taxueseek/argo](https://github.com/taxueseek/argo) - Search built for agents: multilingual coverage across web, academic, code, shopping, finance, news, and encyclopedias.
- [TonyDua/dsh-web-search-exa](https://github.com/TonyDua/dsh-web-search-exa) - Zero-config Exa web search provider for the ctx.web seam: anonymous MCP fallback without an API key, plus keyed REST search.
- [Lum1104/dsh-browser](https://github.com/Lum1104/dsh-browser) - Chrome sidebar extension that lets DSH operate your browser directly, no vision capabilities required.
- [Sanqi-normal/dsh-webui-market-plugin](https://github.com/Sanqi-normal/dsh-webui-market-plugin) - In-harness plugin market for the dsh web GUI: browse the awesome-dsh-plugin.com catalog and install/uninstall plugins into a profile from Settings → Plugins → Plugin Market.
- [huey1in/trio](https://github.com/huey1in/trio) - Browser automation (Playwright) with a live view, an MCP server exposing DSH agents to any MCP client, and GitHub issue/PR/webhook review tools.

- [SamXiaBing/dsh-adb](https://github.com/SamXiaBing/dsh-adb) - ADB device & bench operations for DSH: device discovery, structured logcat (background streaming), apk install, file pull/push, and dumpsys performance snapshots.
- [xiaoyuyu6420/dsh-backup](https://github.com/xiaoyuyu6420/dsh-backup) - One-command backup of DSH user data: /backup, scheduled auto-backup, sha256 checksums and rotation.
- [Letter2025/dsh-tool-search](https://github.com/Letter2025/dsh-tool-search) - Hermes-style tool search & slimming: progressive disclosure, semantic search, describe, and call long-tail tools on demand while core tools stay eager.


- [1na-ko/dsh-hdc-bridge](https://github.com/1na-ko/dsh-hdc-bridge) - HarmonyOS device bridge: hdc screenshot/install/log/crash/UI automation loop with read_image, official-first versioned API knowledge (SDK .d.ts + offline bundled docs), and a DevEco CLI build/sign/lint lane.
- [PicGo/dsh-plugin](https://github.com/PicGo/dsh-plugin) - Upload local images and files to your image host through PicGo's existing configuration (PicGo Cloud, GitHub, S3, COS, Qiniu, or any installed uploader plugin), via a `picgo_upload` tool and a `/picgo` command.
- [mafeis/dsh-net-proxy](https://github.com/mafeis/dsh-net-proxy) - Route agent network requests through a local HTTP/CONNECT/SOCKS5 proxy.
- [bwndlct/dsh-session-audit](https://github.com/bwndlct/dsh-session-audit) - Session execution analytics: steps, tool calls, failures, repeated actions, token usage and verification signals, rendered as text/Markdown/JSON reports.
- [fly233338/dsh-overleaf](https://github.com/fly233338/dsh-overleaf) - Connect multiple Overleaf projects to DSH through OverleafMCP for browsing, analysis, and Git-based file updates.
- [LeslieWylie/dsh-fleet-audit](https://github.com/LeslieWylie/dsh-fleet-audit) - Read-only agent-fleet credential hygiene audit: credential-file permissions, embedded credentials in git remotes (masked in output), and provider token literal counts; zero-dependency and deterministic.
- [whyihaveyou/dsh-suite#plugin-manager](https://github.com/whyihaveyou/dsh-suite/tree/main/packages/plugins/plugin-manager) - In-app plugin store for the DSH Web UI: browse, search, one-click install, compat badges.
- [loguhan/dsh-workshop](https://github.com/loguhan/dsh-workshop) - Steam Workshop-style plugin store for the DSH Web UI: browse, search, and one-click install community plugins with mirror acceleration, progress UI, security checks, and Chinese descriptions.
- [LeslieWylie/dsh-md-preview](https://github.com/LeslieWylie/dsh-md-preview) - Render Markdown to a standalone, self-contained HTML page: an `md_html_render` tool that works in a headless profile, plus a web drawer to browse, preview, edit and export local `.md` files; both share one renderer, with no runtime dependencies.
- [jinguanghai/deepseek-harness-forge-plugins#forge-gates](https://github.com/jinguanghai/deepseek-harness-forge-plugins/tree/main/plugins/forge-gates) - Real-compute verification gates: math simplification, logic proofs, regex validation, E-prover FOL, state-machine checks, and code repair, backed by Go-compiled binaries with prebuilt Windows executables.
- [jinguanghai/deepseek-harness-forge-plugins#forge-tcm](https://github.com/jinguanghai/deepseek-harness-forge-plugins/tree/main/plugins/forge-tcm) - Traditional Chinese Medicine toolkit: eight-axes diagnosis and herb-pair lookup.
- [lsz-asd/dsh-plugin-device-info](https://github.com/lsz-asd/dsh-plugin-device-info) - Read-only Windows device information tools: one agent tool per Win32 device category (time, system, cpu, memory, disk, gpu, network, battery, processes, usb, audio, printers) via WMI/CIM and Node os collectors.
- [jiayan-xu/dsh-codebase-memory](https://github.com/jiayan-xu/dsh-codebase-memory) - Code knowledge graph bridge for codebase-memory-mcp: semantic symbol search (BM25), source snippets, architecture overview with Leiden communities, call/data-flow/cross-service traces, graph-augmented grep.
- [jiayan-xu/dsh-nuphus-mcp](https://github.com/jiayan-xu/dsh-nuphus-mcp) - Desktop and browser automation bridge (36 tools): window/screen/mouse/keyboard control with PaddleOCR element perception, Chrome CDP browsing with accessibility snapshots.

### Skills
- [dhicoc/dsh-reverse-skill](https://github.com/dhicoc/dsh-reverse-skill) - Complete reverse-skill pack (85 SKILL.md) as a DeepSeek Harness Cordis plugin: reverse engineering, authorized pentesting and security-research skill router.
- [creght-dev/skills](https://github.com/creght-dev/skills) - Skills for building websites on the Creght platform: CLI pull/push sync, page and component conventions, CMS, forms, auth, SEO, publishing and version rollback.


- [YTxue/dsh-skill-manager-ytxue](https://github.com/YTxue/dsh-skill-manager-ytxue) - Skill pool manager in the Settings sidebar: enable/disable, folder batch import with rename-conflict prompts, state-driven one-click DSH-spec check & auto-fix, system/project scope labels.
- [lunw/shopline-ai-toolkit-dsh](https://github.com/lunw/shopline-ai-toolkit-dsh) - SHOPLINE AI Toolkit: bridges the official SHOPLINE Developer MCP server and ships seven SHOPLINE agent skills (Admin REST, GraphQL, OAuth, webhooks, Sline) — the SHOPLINE counterpart of the Shopify AI Toolkit.
### Workflow & Automation

- [ztl34245881-commits/dsh-task-planner](https://github.com/ztl34245881-commits/dsh-task-planner) - Task planning with experience muscle-memory: condition-reflex recall of past solutions, LLM capability matching, and auto-persisted lessons.
- [icetomoyo/dsh_workflow](https://github.com/icetomoyo/dsh_workflow) - UltraCode-style multi-agent orchestration: a generatable, savable, governable, observable, resumable workflow layer.
- [NanmiCoder/dsh-agent-teams](https://github.com/NanmiCoder/dsh-agent-teams) - AgentTeams multi-agent teams.
- [titanwings/dsh-automation](https://github.com/titanwings/dsh-automation) - Scheduled coding runs in fresh agent sessions with auditable history.
- [Sev7een/dsh-plugin-automations](https://github.com/Sev7een/dsh-plugin-automations) - Settings-based scheduled tasks that run on time or during DeepSeek off-peak hours, with one-time and daily schedules backed by durable task state.
- [Jesse-njx/dsh-routines](https://github.com/Jesse-njx/dsh-routines) - Scheduled agents on a cron: run a prompt on a schedule and get the digest where you already are, with overlap/missed-run/timeout safety defaults.
- [titanwings/dsh-plannotator](https://github.com/titanwings/dsh-plannotator) - Plan review with anchored annotations and structured feedback back to the agent.
- [vlln/dsh-loop](https://github.com/vlln/dsh-loop) - Recurring loops: `/loop` command + loop tool + activity status bar.
- [fuhefei/dsh-sentinel](https://github.com/fuhefei/dsh-sentinel) - Condition-driven wakeup: durable file/command/http/process/webhook watches that wake the agent.
- [omdsh-dev/dsh-deep-research](https://github.com/omdsh-dev/dsh-deep-research) - Adaptive deep-research orchestrator built on the official workflow engine.
- [omdsh-dev/dsh-inspect](https://github.com/omdsh-dev/dsh-inspect) - Adversarial checkup → fix → review loop toolset.
- [fakechris/dsh-track](https://github.com/fakechris/dsh-track) - Embedded task management engine: decision-point protocol, idea capture wall, Linear-style issue store.
- [btspoony/dsh-advisor](https://github.com/btspoony/dsh-advisor) - Pair a second model that passively reviews each turn and injects notes.
- [lonelymoon87/dsh-specflow](https://github.com/lonelymoon87/dsh-specflow) - Adds specification artifacts, skills, commands, goal-backed implementation, and task-progress context.
- [biociao/dsh-science](https://github.com/biociao/dsh-science) - Claude Science-style research workbench: ReAct research-loop engine (research_* tools), versioned artifacts with provenance (artifact_* tools), and 10 science skills for genomics/pathogens/bioinformatics.
- [EvilIrving/dsh-proof](https://github.com/EvilIrving/dsh-proof) - Independent read-only acceptance layer: spawns a read-only verifier before each top-level turn closes and steers non-pass gaps back into the agent.
- [PerryLink/dsh-doublecheck](https://github.com/PerryLink/dsh-doublecheck) - Engineering-discipline guard: grill the requirements before the first edit, enforce red/green test evidence gates, and audit the delivery with a forked adversary (grill-requirements skill + tool-policy gates).
- [btspoony/mstar-harness](https://github.com/btspoony/mstar-harness) - Skill-driven harness/loop engineering workflow agent plugin.
- [LeslieWylie/dsh-ops-kit](https://github.com/LeslieWylie/dsh-ops-kit) - Evidence-first operating kit: six read-only tools (capability catalog, staged workflow plans, packaged skill reader, bounded local memory search, repository release audit, release checklist) and five packaged skills - plans and audits, never remote writes.
- [Letter2025/dsh-approval-llm](https://github.com/Letter2025/dsh-approval-llm) - Model-based permission approval: an approval-request answerer backed by a separate reviewer model.
- [simon300000/dsh-auto](https://github.com/simon300000/dsh-auto) - Adds an Auto Approve permission preset to the Web UI, using a fresh restricted Reviewer Agent to allow or deny each approval request.
- [Letter2025/dsh-model-failover](https://github.com/Letter2025/dsh-model-failover) - Two-level model circuit breaker with failover: trip a model or a whole provider after repeated request failures and route the next request to a configured fallback.
- [whyihaveyou/dsh-suite#plugin-team-board](https://github.com/whyihaveyou/dsh-suite/tree/main/packages/plugins/plugin-team-board) - Shared multi-agent task board (create/claim/transition/query) over a Cordis service key.


### Notifications & Integrations

- [radres/dsh-plugin-call-me](https://github.com/radres/dsh-plugin-call-me) - Rings your phone over CallKit: `call_me` and `text_me` tools, plus optional turn-end and approval calls whose spoken answer is transcribed back into the session.
- [omdsh-dev/dsh-open-in-vscode](https://github.com/omdsh-dev/dsh-open-in-vscode) - Open DSH workspace directories in VS Code directly from the web GUI.
- [omdsh-dev/dsh-notification](https://github.com/omdsh-dev/dsh-notification) - Desktop notifications for turn completions, with per-outcome controls and keyword rules.
- [bobleer/dsh-acp-for-bitfun](https://github.com/bobleer/dsh-acp-for-bitfun) - ACP bridge between BitFun and DSH.
- [openma-ai/deepseek-harness-acp](https://github.com/openma-ai/deepseek-harness-acp) - ACP profile plugin and standalone stdio server for using the full DSH agent from Zed and other ACP clients while sharing DSH credentials and sessions.
- [LoserFox/telegram](https://github.com/LoserFox/telegram) - Bridge to the Telegram Bot API: long polling, per-chat sessions, HTML formatting.
- [Jesse-njx/dsh-chatnode-wechat](https://github.com/Jesse-njx/dsh-chatnode-wechat) - Chat with, monitor, and approve your DSH agents from WeChat via the iLink gateway: text both ways, session targeting, digest heartbeats, and numbered approval prompts.
- [dingyi222666/dsh-session-notification](https://github.com/dingyi222666/dsh-session-notification) - Notifications for four session states, with browser alerts and prompts.
- [bill9109/dsh-web-ui-notify](https://github.com/bill9109/dsh-web-ui-notify) - Desktop notification reminders.
- [wsxwj123/dsh-plugins#pet-bridge](https://github.com/wsxwj123/dsh-plugins/tree/main/packages/pet-bridge) - Bridge dsh session status to the cc-pet desktop pet bubble: thinking, tool calls, and completion in real time.
- [bill9109/dsh-webbridge](https://github.com/bill9109/dsh-webbridge) - DSH meets Kimi WebBridge.
- [BiBoyang/dsh-im-bridge](https://github.com/BiBoyang/dsh-im-bridge) - Two-way WeChat (iLink) bridge: turn-end and approval-request push, in-chat approve/reject and message injection, persistent dedup and convergent long-reply chunking; channel layer extensible to other IMs.
- [imetn/dsh-lark-bridge](https://github.com/imetn/dsh-lark-bridge) - Bidirectional Lark/Feishu controller for DeepSeek Harness with project and session routing, interactive cards, approvals, attachments, and task controls.
- [yeruizhi/dsh-lark-meeting-notifier](https://github.com/yeruizhi/dsh-lark-meeting-notifier) - Feishu meeting reminder: a dsh-plugin which has only side effect: reminding you, mid-flow with AI, that you "have to go meet carbon-based lifeforms".
- [pc439527/dsh-notify-bark](https://github.com/pc439527/dsh-notify-bark) - Bark push notifications to iPhone: turn completion, waiting-for-input, and approval events sent from the DSH Host.

- [CAOGGL/dsh-ding](https://github.com/CAOGGL/dsh-ding) - Notifies you when a conversation finishes: plays a sound and shows a Windows notification when the agent goes idle (configurable sound file, volume, debounce/throttle).
- [ldchaowin/dsh-plugin-notify-sound](https://github.com/ldchaowin/dsh-plugin-notify-sound) - Per-workspace completion ringtones plus attention sounds for approval, question, plan-review, goal-blocked, and task-failure events, with built-in synth, voice (TTS), and custom audio.
- [whyihaveyou/dsh-suite#plugin-notify](https://github.com/whyihaveyou/dsh-suite/tree/main/packages/plugins/plugin-notify) - IM webhook and local notifications on turn completion, errors, or approval (Feishu/WeCom/DingTalk/Slack/Discord/custom).
- [xmanrui/dsh-feishu](https://github.com/xmanrui/dsh-feishu) - Connect a Feishu bot to DeepSeek Harness by scanning a QR code.
- [doncelee229-cmyk/dsh-plugin-approval-alert](https://github.com/doncelee229-cmyk/dsh-plugin-approval-alert) - Native OS notifications for approval and question/plan prompts: the toast names the workspace, click jumps to it, bilingual (zh-CN/zh-TW/en), with chime.
- [muretai/muretai-dsh-skill](https://github.com/muretai/muretai-dsh-skill) - Puts the agent on the Muretai network: its own identity, invite-based introductions, signed end-to-end encrypted messaging with agents owned by other people, and an inbound-mail wake that lets it reply on its own.

### Models & Providers

- [dylan121322/llm-adaptive](https://github.com/dylan121322/llm-adaptive) - Adaptive model routing: per-request complexity classification with automatic provider routing.
- [btspoony/dsh-llm-fallbacks](https://github.com/btspoony/dsh-llm-fallbacks) - Role-based LLM retry & fallback strategies.
- [franksong2702/dsh-codex-connect](https://github.com/franksong2702/dsh-codex-connect) - Connect ChatGPT OAuth and OpenAI Codex models to DeepSeek Harness, with opt-in search and image tools.
- [kam74515-boop/dsh-everything-oauth](https://github.com/kam74515-boop/dsh-everything-oauth) - Import local Codex, Grok, Claude, OpenCode, and CC Switch logins into DSH; pick sources and enable models in Settings.
- [omdsh-dev/Qwen-MM-Plugins](https://github.com/omdsh-dev/Qwen-MM-Plugins) - Qwen multi-modal plugin support.
- [suntianc/dsh-codex-auth](https://github.com/suntianc/dsh-codex-auth) - Reuses the Codex CLI ChatGPT login as an `openai-codex` LLM route and adds GPT Auth controls to DSH Web settings.
- [feibi-mochi/deepseek-harness-wallet](https://github.com/feibi-mochi/deepseek-harness-wallet) - Multi-provider wallet chip: official DeepSeek balance, per-session cost & tokens, third-party token totals, recharge shortcut, low-balance alerts.
- [superboy911/dsh-model-router](https://github.com/superboy911/dsh-model-router) - Deterministic keyword routing, allowlisted model switching, and an isolated image_gen channel for DeepSeek Harness.

### Development & Runtime

- [leechen298/Code2Skill](https://github.com/leechen298/Code2Skill) - Generate Functions, MCP tools, workflow Skills, and offline test packages from user-authorized source code.
- [bujue600-arch/dsh-testgen](https://github.com/bujue600-arch/dsh-testgen) - Automated unit-test generation: a /testgen command and generate_tests tool that scaffold, run, and fix tests until they pass (LLM + offline template generators; vitest/jest/mocha/node:test).
- [omdsh-dev/fabric](https://github.com/omdsh-dev/fabric) - An MC-Fabric-style hook processor.
- [LoserFox/dsh-git-identity](https://github.com/LoserFox/dsh-git-identity) - Pin Git commits to the environment's own author identity; env-var injection overrides all `git config` settings.
- [Zhenyu98/dsh-context-doctor](https://github.com/Zhenyu98/dsh-context-doctor) - Context injection audit: token costs of instruction chains / skill catalogs / tool schemas, duplicate and conflict detection.
- [ICCuse/dsh-pain-point-check](https://github.com/ICCuse/dsh-pain-point-check) - Enforced pain-point gate: after two non-converged experiments it injects the three questions, denies non-investigative tool calls until answered, and blocks same-direction retries.
- [omdsh-dev/dsh-plugin-check](https://github.com/omdsh-dev/dsh-plugin-check) - Plugin health checks: manifest protocol / patch format / build traps, zero-dependency and read-only.
- [omdsh-dev/dsh-security-audit](https://github.com/omdsh-dev/dsh-security-audit) - Local security audit: config, plugin origins, sessions, network exposure — read-only redacted risk report.
- [omdsh-dev/dsh-session-health](https://github.com/omdsh-dev/dsh-session-health) - Frame-level scan diagnostics for session files (torn/corrupt/empty detection).
- [william-jin-cmu/dsh-evolve](https://github.com/william-jin-cmu/dsh-evolve) - Self-evolution: the agent hot-mounts/removes persistent plugins on itself mid-session.
- [vibeinging/dsh-trace](https://github.com/vibeinging/dsh-trace) - Telemetry backend exporting turns, model steps, and tool calls to yiTrace.
- [030611/dsh-telemetry-redactor](https://github.com/030611/dsh-telemetry-redactor) - Redacts supported secret patterns from the `session-telemetry/record` export copy before configured telemetry backends receive it.
- [030611/dsh-verification-receipt](https://github.com/030611/dsh-verification-receipt) - Writes local JSONL summaries of per-turn tool counts and coarse verification signals without storing prompts, tool arguments, or result text.
- [030611/qiushi-dsh-evidence-audit](https://github.com/030611/qiushi-dsh-evidence-audit) - Appends local hash-chained JSONL receipts for tool results and session events without storing prompts, tool arguments, result text, or raw session IDs.
- [omdsh-dev/sandbox-micro](https://github.com/omdsh-dev/sandbox-micro) - Support for the microsandbox backend.
- [omdsh-dev/sandbox-mxc](https://github.com/omdsh-dev/sandbox-mxc) - Microsoft cross-platform sandbox support.
- [omdsh-dev/sandbox-nono](https://github.com/omdsh-dev/sandbox-nono) - Support for the nono sandbox backend.
- [vibeinging/dsh-agent-budget](https://github.com/vibeinging/dsh-agent-budget) - Agent-tree token budget management.
- [Jesse-njx/dsh-polyglot](https://github.com/Jesse-njx/dsh-polyglot) - The model switch for DSH: point it at any OpenAI-compatible endpoint, with curated free/cheap DeepSeek provider presets and automatic fallback when a free tier rate-limits you.
- [ilharp/dsh-tool-approval](https://github.com/ilharp/dsh-tool-approval) - Manual approval mode ("Manual Mode" / "Ask Mode").
- [arrow949/dsh-turn-approval](https://github.com/arrow949/dsh-turn-approval) - Turn-scoped “Allow for this task” approvals: automatically allow matching `danger-full-access` escalations only for the current task, then expire.
- [omdsh-dev/plugin-template](https://github.com/omdsh-dev/plugin-template) - Plugin template repo (based on the official turtle-ui repo).
- [Small-tailqwq/dsh-tps](https://github.com/Small-tailqwq/dsh-tps) - A TPS metrics plugin.
- [disyli/dsh-tool-call-stats](https://github.com/disyli/dsh-tool-call-stats) - Per-process tool-call statistics: a `tool_stats` tool reporting per-tool call counts, error counts, and average durations.
- [Areium/dsh-fail-logger](https://github.com/Areium/dsh-fail-logger) - Auto-log failed tool calls across native tools, PTC run_code, and inline invocations: dedup and count root causes into a skill so repeated mistakes fade.
- [BiBoyang/dsh-eval-harness](https://github.com/BiBoyang/dsh-eval-harness) - Evaluation harness for DSH plugins: YAML cases drive real headless agent runs, assert on tool calls, args, results and token usage, with a baseline gate for CI regression.
- [hust-open-atom-club/oh-dsh](https://github.com/hust-open-atom-club/oh-dsh) - Community distribution: TUI, desktop, and Web UI as one bundle with layered installation.
- [BrambleXu/dsh-annotate](https://github.com/BrambleXu/dsh-annotate) - Select browser elements directly during Vibe Coding and send structured visual feedback to the DeepSeek Harness Agent.
- [BrambleXu/dsh-prompt-profile](https://github.com/BrambleXu/dsh-prompt-profile) - Reusable Markdown prompt profiles for DeepSeek Harness with per-turn model selection, argument substitution, and state restoration.
- [BrambleXu/dsh-revdiff](https://github.com/BrambleXu/dsh-revdiff) - Native interactive Git diff review for DeepSeek Harness with structured annotations sent back to the current Agent session.
- [lonelymoon87/dsh-gitflow](https://github.com/lonelymoon87/dsh-gitflow) - Adds approval-gated Git status, diff, log, commit, branch, and optional checkpoint tools.
- [lonelymoon87/dsh-guardian](https://github.com/lonelymoon87/dsh-guardian) - Adds dangerous-operation policy checks, output redaction, and a security-review workflow.
- [Jesse-njx/dsh-plugin-manager](https://github.com/Jesse-njx/dsh-plugin-manager) - The `dsh pm` plugin manager: multi-source search (awesome list + GitHub + npm), install/remove/update per profile, and a doctor audit of manifests, bundle patches, and version drift.
- [Jesse-njx/dsh-tmuxctl](https://github.com/Jesse-njx/dsh-tmuxctl) - Take control of your tmux panes: list/send-keys/capture, run long jobs in a pane with watch mode, and approval-gated destructive commands.
- [xingyingyuzhui/dsh-updater-ui](https://github.com/xingyingyuzhui/dsh-updater-ui) - DSH self-updater in the settings page: one-click check/pull (`git pull --ff-only`), auto background checks, version diff and changelog preview with a red-dot reminder.
- [EvilIrving/dsh-repro](https://github.com/EvilIrving/dsh-repro) - /repro exports a minimal, secret-scrubbed, replayable problem bundle: the session log, failed commands, and Git diff.
- [PerryLink/dsh-mcp-panel](https://github.com/PerryLink/dsh-mcp-panel) - Read-only runtime management panel for the official DSH MCP client: connection status, registered tools, errors, and reconnect counts through the /mcp command and a Settings tab, with sanitized display and enable/disable patch suggestions.
- [Jayden-X-L/forkprobe](https://github.com/Jayden-X-L/forkprobe) - Compare multiple skills on the same task and pick the winner.
- [vlln/plugin-registry](https://github.com/vlln/plugin-registry) - Ecosystem infrastructure: a thin browser console for managing official repository plugins (zero patches) plus a make-dsh-plugin skill for guided plugin development.
- [forrestchang/dsh-multica-runtime](https://github.com/forrestchang/dsh-multica-runtime) - Run the dsh runtime on Multica.
- [DietCokewithSugar/dsh-user-experience](https://github.com/DietCokewithSugar/dsh-user-experience) - Finds potential UX issues in your project: automatically reviews React/TypeScript code, pinpoints each problem, and gives concrete suggestions.
- [yflmq001/dsh-cost-tracker](https://github.com/yflmq001/dsh-cost-tracker) - Per-model token cost tracking with configurable cache-hit/miss, output and peak-window pricing, a live session cost bar, and unconfigured-model flags.
- [slywalker2006/dsh-passwords](https://github.com/slywalker2006/dsh-passwords) - Login gateway for the DSH web UI: password door with first-run setup, bcrypt + at-rest encryption (AES-256-GCM/HMAC), brute-force lockout, audit log, TLS 1.2+ with 80→443 redirect, CSRF, anti-framing.
- [Yuuz12/dsh-webui-auth](https://github.com/Yuuz12/dsh-webui-auth) - WebUI authentication enforced at the HTTP/transport layer: four-layer login gate (resources, plugin bundles, /api, WebSocket), server-side sessions with HttpOnly cookies.
- [Leon0555/dsh-lan-access](https://github.com/Leon0555/dsh-lan-access) - LAN access for the Web GUI: 0.0.0.0 bind plus a crypto.randomUUID polyfill for non-secure (LAN HTTP) contexts.
- [lsz-asd/dsh-chameleon#bundle](https://github.com/lsz-asd/dsh-chameleon/tree/main/bundle) - Self-editing desktop workbench for DeepSeek Harness: a full dsh web replica with an edit mode in which the agent modifies the workbench (patch layers, plugins, UI) with hot reload.
- [jiayan-xu/dsh-ocr-review](https://github.com/jiayan-xu/dsh-ocr-review) - Local AI code-review gate: review a workspace/branch/commit diff via the managed ocr.js, returning structured findings with token stats; gate mode fails on findings.


### Just for Fun

- [Nagi-ovo/dsh-ads](https://github.com/Nagi-ovo/dsh-ads) - Parody ads in 2005-Chinese-web style: sidebar banners, in-chat feeds, corner popups, and a close button whose hit area is smaller than it looks. All fictional.
- [omdsh-dev/dsh-gomoku](https://github.com/omdsh-dev/dsh-gomoku) - Play Gomoku against the AI, or let two AIs battle it out.
- [AnacondaKC/dsh-stock-market](https://github.com/AnacondaKC/dsh-stock-market) - Fixes the bug where your account can't lose money while you code.
- [hellodigua/dsh-emoji](https://github.com/hellodigua/dsh-emoji) - Automatically add emojis to AI replies.
- [lhh010/dsh-minigames](https://github.com/lhh010/dsh-minigames) - Side-panel arcade: 18 offline mini-games to play while the model thinks.
- [william-jin-cmu/dsh-stickers](https://github.com/william-jin-cmu/dsh-stickers) - Bidirectional sticker reactions between user and agent.
- [vlln/whale-girl](https://github.com/vlln/whale-girl) - Desktop pet (QQ-pet style): floats in the corner, draggable, feedable, playable.
- [Moeblack/deepseek-manners](https://github.com/Moeblack/deepseek-manners) - Append a thank-you note after every message. Mind your manners.
- [HuanLinOTO/dsh-plugin-d399](https://github.com/HuanLinOTO/dsh-plugin-d399) - Pops up a mini-game menu (wordle, match-3, extensible) while the model generates.
- [omdsh-dev/dsh-auto-chess](https://github.com/omdsh-dev/dsh-auto-chess) - Auto chess: human vs AI, or AI vs AI.
- [AnacondaKC/dsh-douyin](https://github.com/AnacondaKC/dsh-douyin) - Short-video sidebar: native player, series navigation, precise history replay.
- [minybear/DeepSeek-Harness-Pet](https://github.com/minybear/DeepSeek-Harness-Pet) - Codex-style desktop pet: a floating animated sprite in the corner that mirrors the agent's running state (working, waiting, failed, done).
- [anweat/dsh-web-search-pro](https://github.com/anweat/dsh-web-search-pro) - Persistent enhanced web search: multi-engine routing (DeepSeek/Exa/DDG/Bing/Jina + GitHub/Bilibili/YouTube/V2EX/Xiaohongshu/Twitter/Reddit/RSS), SQLite+LRU cache, userscript-style extraction, Playwright rendering.
- [anweat/dsh-browser](https://github.com/anweat/dsh-browser) - Self-contained browser runtime: Playwright (chromium) + OpenCLI as plugin-local dependencies (global reuse fallback), exposes a `browser` service and 9 interactive browser tools.
- [anweat/dsh-voice-webspeech](https://github.com/anweat/dsh-voice-webspeech) - Browser Web Speech API voice input: zero server, zero keys, zero model downloads (Edge=Azure, Chrome=Google speech).
- [anweat/dsh-restart](https://github.com/anweat/dsh-restart) - Restart DSH: configurable restart method (Node native / legacy PowerShell), post-restart continue prompt, optional watchdog auto-relaunch.
- [yyh-001/dsh-expression](https://github.com/yyh-001/dsh-expression) - Meme search, the fun way: describe the vibe, and the agent finds and sends a real meme that actually fits.
- [PC2005-cloud/dsh-pet#dsh-pet](https://github.com/PC2005-cloud/dsh-pet/tree/main/dsh-pet) - Desktop pet for the DSH Web UI with 25 transparent animations, screen wandering, click reactions and drag, plus a reproducible asset-generation pipeline.


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

