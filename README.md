# Awesome DeepSeek Harness (DSH) Plugin [![Awesome](https://awesome.re/badge.svg)](https://awesome.re) ![awesome · DSH plugin](https://awesome-dsh-plugin.com/badge.svg) ![plugin count](https://img.shields.io/endpoint?url=https%3A%2F%2Fawesome-dsh-plugin.com%2Fcount.json)

[![Awesome DSH Plugin](https://awesome-dsh-plugin.com/banner-en.png)](https://awesome-dsh-plugin.com)

English | [中文](README.zh.md)

> A curated list of plugins for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (`dsh`).

DeepSeek Harness is DeepSeek's open-source agent harness — a runnable coding agent (Web and headless), built on a framework where everything is a plugin: models, tools, sandboxes, session storage, UI, even the agent loop itself. Plugins can extend the official coding agent, swap out its core parts, or assemble something entirely different.

This list collects community plugins that are installable via `dsh plugin add` (each declares a `dsh.bundle` manifest). [PRs welcome](#contributing).

> 🛒 **Recommended: [dsh-market](https://github.com/dsh-market/dsh-market#readme)** (optional) — the plugin market inside DeepSeek Harness, with every plugin on this list. Simple, friendly UI: one-click plugin install and upgrade, one-click theme switching:

```sh
dsh plugin --profile web add dshmarket
```

> 💡 Prefer chat? [dsh-find-plugin](https://github.com/awesome-dsh-plugin/dsh-find-plugin#readme) lets your agent find plugins for you (`dsh plugin --profile web add dsh-find-plugin`).

> [!WARNING]
> Installing a plugin runs third-party code on your machine with your own permissions — it can read your files, use your credentials, and reach the network. Tool approvals don't sandbox plugin code. Being on this list is not a security review: check the source before you install, and try unfamiliar plugins somewhere that doesn't hold your keys. See the full disclaimer at the bottom of this page.

## Contents

- [Plugins](#plugins)
  - [UI Enhancements](#ui-enhancements)
  - [Themes & Appearance](#themes--appearance)
  - [Models & Providers](#models--providers)
  - [Sessions & Messages](#sessions--messages)
  - [Memory](#memory)
  - [Tools & Capabilities](#tools--capabilities)
  - [Skills](#skills)
  - [Workflow & Automation](#workflow--automation)
  - [Notifications & Integrations](#notifications--integrations)
  - [Development & Runtime](#development--runtime)
  - [Plugin Markets & Managers](#plugin-markets--managers)
  - [Just for Fun](#just-for-fun)
- [Badge](#badge)
- [Disclaimer](#disclaimer)

## Plugins

### UI Enhancements
- [Ricketts-Guo/dsh-shortcuts](https://github.com/Ricketts-Guo/dsh-shortcuts) - Fully customizable keyboard shortcuts for the Web UI: 34 pre-registered features (sessions, views, clipboard, models, silent permission cycling, settings), one-click recording to bind your own, and a shortcut cheatsheet with built-in diagnostics.
- [magian1127/deepseek-harness-zh_pro](https://github.com/magian1127/deepseek-harness-zh_pro) - Chinese UI enhancement for the DSH web client: completes the Chinese locale, keeps the session stats line fully visible on one row, and adds an Enhancements settings section with configurable chat width.
- [NewDaNew/dsh-voice-input](https://github.com/NewDaNew/dsh-voice-input) - Voice input for the web UI: a mic button in the composer that transcribes speech into the draft via the Web Speech API, with an optional auto-send toggle.
- [13071301808/dsh-composer-expand](https://github.com/13071301808/dsh-composer-expand) - Composer expand/collapse toggle for the Web UI: a ⬆/⬇ button in the composer tool row grows the input to a tall 70vh writing view for long drafts.
- [littleboylittlegirl/dsh-community-hot](https://github.com/littleboylittlegirl/dsh-community-hot) - Floating community panel for the Web UI: 24h hot topics and hot plugins TOP10 with a draggable, always-on-top button.
- [1624318455/dsh-plugin-tts](https://github.com/1624318455/dsh-plugin-tts) - Reads assistant replies aloud via free Edge TTS: per-message read-aloud buttons, an auto-read toggle, and a voice settings panel.
- [x2802490130-prog/dsh-client-ui-writing](https://github.com/x2802490130-prog/dsh-client-ui-writing) - Client-side writing panel for the Web UI: project volumes and stats, corpus library, full-text search, evolution version-chain diffs, and an SVG thread graph, shown only in writing-preset sessions.
- [badai147/dsh-global-rules](https://github.com/badai147/dsh-global-rules) - Edit the global ~/.dsh/AGENTS.md rules from the web settings panel, live on save.
- [AcidGr/dsh-web-mobile-fix](https://github.com/AcidGr/dsh-web-mobile-fix) - Mobile layout fixes for the Web UI on narrow screens: full-screen settings panel, one-row plugin nav, full-screen sidebar, centered popups, icon-only session-log button.
- [mexiaosqwq/dsh-web-mobile](https://github.com/mexiaosqwq/dsh-web-mobile) - Mobile-adaptive layout for the DSH Web UI: the sidebar becomes a content-hugging overlay drawer, the conversation gets the full width, and the settings panel becomes a near-full-width sheet.

- [AcidGr/dsh-web-lan-access](https://github.com/AcidGr/dsh-web-lan-access) - LAN/remote access for the Web UI: injects a crypto.randomUUID polyfill on plain-HTTP origins so the frontend survives LAN or Tailscale IP direct links.

- [Bernardxu123/dsh-mobile-gate](https://github.com/Bernardxu123/dsh-mobile-gate) - LAN mobile gateway: isolated child-process reverse proxy with first-visit approval, per-device token binding, rate limiting, and mobile layout injection (compact composer pills, randomUUID polyfill).

- [Make0209/dsh-usage-stats](https://github.com/Make0209/dsh-usage-stats) - GitHub-style usage heatmap dashboard: per-workspace turn counts and token spend (with cache-hit rate), DeepSeek account balance, and workspace aliases.
- [Ychris12138/dsh-usage-stats](https://github.com/Ychris12138/dsh-usage-stats) - Multi-provider usage dashboard with provider/model token breakdowns, calendar drill-downs, account balances, and OpenCode Go / Z.ai subscription quota tracking.
- [V-dev-388/dsh-usage-meter](https://github.com/V-dev-388/dsh-usage-meter) - Settings-page usage dashboard: per-provider/model token summary across all sessions, with today/7-day/30-day CSS-bar trends and a cache-hit rate.
- [zoumutou/dsh-cost-balance](https://github.com/zoumutou/dsh-cost-balance) - Collapsible iOS-style stats pill under the composer: session cost, DeepSeek account balance, cache-hit rate, and token usage in a frosted panel.
- [ibka512/dsh-ibka-balance](https://github.com/ibka512/dsh-ibka-balance) - Permanent composer-dock balance card: real-time DeepSeek API account balance with 5-minute auto-refresh, a manual refresh button, and low-balance color warnings.
- [jiangli07/dsh-deepseek-quota-bar](https://github.com/jiangli07/dsh-deepseek-quota-bar) - Draggable transparent balance card with a blood-bar of remaining balance vs month-opening, today/month spend (official when the platform token is configured), and session cost.

- [bowenliang123/dsh-context](https://github.com/bowenliang123/dsh-context) - Context insight panel: see what the model's context window is made of and how it evolves — composition vs. window size, per-request history, compression/injection events, and per-message token stats.

- [wjy9902/dsh-web-default-session](https://github.com/wjy9902/dsh-web-default-session) - The generic New Session action opens a default-directory workspace instead of requiring a folder pick, and the workspace picker lists that workspace as a no-folder choice.

- [Fishsb/dsh-prompt-enhancer](https://github.com/Fishsb/dsh-prompt-enhancer) - One-click prompt enhancement: an independent LLM call rewrites your rough draft in the composer, fully undoable.

- [huiliyi37/dsh-tianshu-tui](https://github.com/huiliyi37/dsh-tianshu-tui) - A terminal UI (TUI) for DeepSeek Harness.
- [openma-ai/deepseek-harness-tui](https://github.com/openma-ai/deepseek-harness-tui) - A Rust/ratatui terminal client that speaks the DSH SDK JSON-RPC protocol directly and runs standalone or as a profile bundle.
- [WhitePlusMS/dsh-input-plus](https://github.com/WhitePlusMS/dsh-input-plus) - Search and insert workspace file and directory paths with `@`, plus a `/h` menu for reusing prompts from the current session.
- [omdsh-dev/dsh-at-file](https://github.com/omdsh-dev/dsh-at-file) - Codex-style `@file` mentions: search workspace files in the composer and attach their contents to prompts.
- [alingalingling/ui-status-label](https://github.com/alingalingling/ui-status-label) - Customize the "deep diving" thinking status label to anything you like.
- [LeemanCheung/dsh-whale-animation](https://github.com/LeemanCheung/dsh-whale-animation) - Persistent black whale-dive animation beside the DSH Web turn status, with a reduced-motion fallback and a seamless closed loop.
- [01Virex/dsh-status-rotator](https://github.com/01Virex/dsh-status-rotator) - Replaces the "Deep diving..." turn-status label with rotating meme-worthy phrases, with typewriter and gradient effects.
- [ZSeven-W/dsh-openpencil](https://github.com/ZSeven-W/dsh-openpencil) - OpenPencil design preview and editing plugin.
- [Nagi-ovo/dsh-visualize](https://github.com/Nagi-ovo/dsh-visualize) - In-conversation generative UI: the model renders interactive HTML cards into the chat stream, with streaming preview and sandboxed rendering.
- [hanzhangzzz/dsh-diagram](https://github.com/hanzhangzzz/dsh-diagram) - Editable Excalidraw diagrams for DeepSeek Harness conversations.
- [ccq1/dsh-side-panel](https://github.com/ccq1/dsh-side-panel) - Side panel with file browser, terminal, and Git review for quick file previews.
- [WhitePlusMS/dsh-git-graph](https://github.com/WhitePlusMS/dsh-git-graph) - Dedicated read-only Git Graph view beside Chat and Trajectory: commit topology, local/remote/tag refs, HEAD and working-tree status, search, filtering, first-parent mode, refresh, and load more.
- [openAGFS/dsh-agfs](https://github.com/openAGFS/dsh-agfs) - File-browser web app for DSH: React frontend and REST API served by the host webserver, a /dsh-agfs command that opens at the current session workspace, and a browse_files model tool.
- [dingyi222666/dsh-focus-chat](https://github.com/dingyi222666/dsh-focus-chat) - A "focus chat" minimal view that shows only final outputs.
- [omdsh-dev/dsh-genui](https://github.com/omdsh-dev/dsh-genui) - Interactive UI components rendered inline in replies: layout, charts, forms, quizzes, mermaid, 3D scenes, and an action event loop back to the model.
- [omdsh-dev/dsh-annotation](https://github.com/omdsh-dev/dsh-annotation) - Select text → annotate → send with your message; replies map back to each annotation.
- [vlln/dsh-navbar](https://github.com/vlln/dsh-navbar) - Conversation node navigation bar for quick jumps between user messages.
- [asukasec/dsh-message-preview](https://github.com/asukasec/dsh-message-preview) - Right-edge user-message navigator with an adaptive block layout that fits the available height, plus hover previews, keyboard controls, and click-to-jump navigation.
- [jjxjjjjiik-bot/dsh-chat-timeline](https://github.com/jjxjjjjiik-bot/dsh-chat-timeline) - 1:1 port of DeepSeek's official web right-side chat navigation rail (ScrollNav): hover-expandable rail, reading-position highlight, click-to-jump.
- [vlln/dsh-task-status](https://github.com/vlln/dsh-task-status) - Background task status bar: progress plus live output tail on the chat page.
- [Nanki-nn/dsh-answer-pet](https://github.com/Nanki-nn/dsh-answer-pet) - Animated blue-whale desktop pet with per-session response progress, model activity and tool-call traces, token counts, output speed, elapsed time, and collapsible multi-session status cards.
- [mengyun233/dsh-codex-pet](https://github.com/mengyun233/dsh-codex-pet) - Auto-migrate Codex desktop-pet skins into DSH: an animated corner pet that mirrors agent state (thinking, tool use, awaiting approval, failed, done), with per-session frosted-glass dialogs and a full settings panel.
- [renat3u/dsh-web-archive](https://github.com/renat3u/dsh-web-archive) - Collapse noisy messages (Think, Bash, etc.) in conversations.
- [a179-sanae/dsh-auto-collapse](https://github.com/a179-sanae/dsh-auto-collapse) - Codex-style workflow auto-collapse: finished turns fold into a single "processed in Xs" row leaving only the final answer; tool calls and think blocks collapse into live-summary chips that follow streaming; expand level by level, fully reversible on uninstall.
- [0xsline/dsh-spotlight](https://github.com/0xsline/dsh-spotlight) - Keyboard-first command palette for the DSH Web UI.
- [GooodWei/arcana](https://github.com/GooodWei/arcana) - A floating command deck that lists every slash command in DeepSeek Harness as runnable buttons, sorted by usage.
- [GooodWei/context-vista](https://github.com/GooodWei/context-vista) - A right-side floating panel and /context command for DeepSeek Harness — a live donut chart of context token usage, allocation, and estimated cost.
- [bill9109/dsh-101](https://github.com/bill9109/dsh-101) - Document reading mode for DSH.
- [bill9109/dsh-drag-and-drop](https://github.com/bill9109/dsh-drag-and-drop) - Cross-platform file drag-and-drop with raw path insertion, no file copying.
- [GLFzr/dsh-drop-file-to-path](https://github.com/GLFzr/dsh-drop-file-to-path) - Codex-style drag-drop: drag any file into the DSH web GUI, it lands in ~/.dsh-dropbox, and the path is inserted into the composer as a whole blue chip.
- [taxueseek/dsh-files](https://github.com/taxueseek/dsh-files) - File upload with color-coded attachment cards (session-isolated storage, sha256 dedup, TTL sweep) plus a content-sniffing read_document tool for PDF/DOCX/XLSX/TXT.
- [l541402398/dsh-file-uploads](https://github.com/l541402398/dsh-file-uploads) - Upload arbitrary local files from the Web composer, show pending cards, and manage stored files in Settings.
- [HongMing-Huang/dsh-file-upload](https://github.com/HongMing-Huang/dsh-file-upload) - Claude-style drag-and-drop/paperclip file upload with content sniffing, document-to-Markdown via Microsoft MarkItDown (built-in JS fallback), text inlining, and a read_document tool for agents.
- [qyw233/dsh-deeplink](https://github.com/qyw233/dsh-deeplink) - Deep links: open a specific session or workspace via `?session=` / `?workspace=`.
- [lehhair/dsh-diff-viewer](https://github.com/lehhair/dsh-diff-viewer) - PiUI-style diff viewer replacing the stock DiffBlock for write/edit tool calls.
- [omdsh-dev/ex-setting](https://github.com/omdsh-dev/ex-setting) - Settings extensions for DSH.
- [omdsh-dev/web-components](https://github.com/omdsh-dev/web-components) - Web Components support.
- [vibeinging/dsh-turn-navigator](https://github.com/vibeinging/dsh-turn-navigator) - Turn navigation for the DSH Web UI.
- [SnowCrescenter-tech/dsh-milestone](https://github.com/SnowCrescenter-tech/dsh-milestone) - Right-side dot-timeline rail: jump between user messages.
- [Ghost011118/dsh-balance-meter](https://github.com/Ghost011118/dsh-balance-meter) - DeepSeek account balance and session cost in the composer dock, with auto-fetched official pricing and peak/off-peak support.
- [v587d/dsh-opencode-go-usage](https://github.com/v587d/dsh-opencode-go-usage) - OpenCode Go subscription usage (rolling/weekly/monthly windows with reset countdowns) in the composer dock, with a built-in credential editor.
- [GLFzr/dsh-opencode-go-quota](https://github.com/GLFzr/dsh-opencode-go-quota) - OpenCode Go quota ring: click-to-cycle progress ring (5h/weekly/monthly) left of the model selector, colored by urgency, with reset countdowns on hover.
- [Han-1413141/dsh-cost-meter](https://github.com/Han-1413141/dsh-cost-meter) - Per-session and daily API cost, budget with usage %, official balance, history dashboard, and one-click official price sync with peak/off-peak pricing.
- [fishxcode/dsh-plugin-deepseek-balance](https://github.com/fishxcode/dsh-plugin-deepseek-balance) - DeepSeek API balance, balance trend, and daily usage charts in DSH Web settings.
- [Sev7een/ds-api-usage](https://github.com/Sev7een/ds-api-usage) - DeepSeek API balance and 24-hour usage dashboard in Settings, with estimated spend, token counts, request counts, and an hourly timeline.
- [nonewind/dsh-spend](https://github.com/nonewind/dsh-spend) - Token usage and estimated spend for the dsh web UI: floating panel with per-model, per-day, and per-session stats.
- [stevenx65/dsh-balance-plugin](https://github.com/stevenx65/dsh-balance-plugin) - DeepSeek balance and token usage in the web sidebar, with a today/all-time toggle and provider filtering.
- [LemCAE/dsh-balance](https://github.com/LemCAE/dsh-balance) - DeepSeek account balance and current-session spend estimate in a top-bar chip and settings card, with pause-aware auto-refresh, an editable official price table, a `deepseek_balance` model tool, and a bilingual UI.
- [huanyuLv/dsh-balance-tide](https://github.com/huanyuLv/dsh-balance-tide) - DeepSeek account balance and session cost under the composer, with a live peak/off-peak pricing badge (Beijing time), a countdown to the next pricing switch, hover price tables, and usage advice.
- [ccch1mneyyy/dsh-TUI](https://github.com/ccch1mneyyy/dsh-TUI) - Claude Code-style full-screen terminal UI: pixel-whale header, live status line, and streaming thought expansion.
- [omdsh-dev/DSH-better-sidebar](https://github.com/omdsh-dev/DSH-better-sidebar) - Full sidebar workbench with file rendering and editing, terminal, Git, and subagents; third-party plugins can register new tabs.
- [tsonglew/dsh-workspace-search](https://github.com/tsonglew/dsh-workspace-search) - VS Code-style workspace keyword search tab for dsh-better-sidebar: matches file names and content, grouped by file with line numbers, opens in the sidebar editor.
- [tsonglew/dsh-media-preview](https://github.com/tsonglew/dsh-media-preview) - Audio/video FileViewer for dsh-better-sidebar: native inline playback for mp4/webm/mkv/mov and mp3/flac/wav, served by a Range-capable streaming media route.
- [Han-1413141/dsh-sticky-disclosure](https://github.com/Han-1413141/dsh-sticky-disclosure) - One-click collapse of every expanded section (Think rows, tool cards) with a live-count pill and a customizable hotkey.
- [Meredith2328/dsh-sticky-note](https://github.com/Meredith2328/dsh-sticky-note) - Quick sticky notes on the composer toolbar: jot ideas or TODOs, auto-saved as Markdown, one click to send into the chat.
- [Luaphes/dsh-web-attention-badge](https://github.com/Luaphes/dsh-web-attention-badge) - Attention reminders: frame badge, tab-title count, and a status-colored whale favicon for sessions waiting for input or finished unopened.
- [zhu1090093659/dsh-web-ui#packages/dsh-web-ui-all](https://github.com/zhu1090093659/dsh-web-ui/tree/main/packages/dsh-web-ui-all) - Plugin and skin collection for the DSH Web UI: task board, Git graph, right-side panel, remote mobile UI, pet, live token stats, and a skin center.
- [zealot00/dsh-pet](https://github.com/zealot00/dsh-pet) - Desktop pet for the DSH Web UI: sprite-sheet animation, agent state linkage, drag, alarm (daily/one-shot) and pomodoro widgets, skin picker with preview.
- [sereinmono/dsh-desktop-pet](https://github.com/sereinmono/dsh-desktop-pet) - A plugin that adds a desktop pet to your DeepSeek Harness, supporting the Codex pet format, you can use hatch-pet or Petdex to add your pets.
- [ysyyhhh/dsh-pet](https://github.com/ysyyhhh/dsh-pet) - Native desktop pet for DSH that follows agent activity, supports Codex pet packages, and imports approved pets directly from Petdex without its CLI.
- [jiangnanquan/dsh-ux](https://github.com/jiangnanquan/dsh-ux) - Solarized light theme, compact layout, think/tool-chain collapse capsules, and balance, session cost, and usage dashboards for the DSH web UI.
- [a903067276-rgb/dsh-hud](https://github.com/a903067276-rgb/dsh-hud) - HUD status panel: Git status, MCP servers, skills, model and token usage in a floating side panel.
- [wsxwj123/dsh-plugins#turn-scrubber](https://github.com/wsxwj123/dsh-plugins/tree/main/packages/turn-scrubber) - Compact right-edge turn rail with hover summaries and click-to-jump navigation.
- [Sttrevens/dsh-cost-meter](https://github.com/Sttrevens/dsh-cost-meter) - Per-turn USD cost badge in the Web UI: session total in the header and per-turn cost in each message footer, with a hover breakdown.
- [a903067276-rgb/dsh-file-mentions](https://github.com/a903067276-rgb/dsh-file-mentions) - Clickable file paths in DSH replies: Codex-style inline open, reveal in file manager, and a mentioned-files chip list at the turn tail.
- [GitHubJiKe/dsh-markdown-preview](https://github.com/GitHubJiKe/dsh-markdown-preview) - In-chat preview for produced files: click a produced-file chip to render Markdown (server-side markdown-it + highlight.js), images, or plain text right in the conversation; system-app open and reveal-in-folder stay one click away.
- [bobcat848/dsh-calculator](https://github.com/bobcat848/dsh-calculator) - DeepSeek API spend (current session and all sessions) and account balance in the aside panel, with official pricing and peak/off-peak support.

- [Jolly-J/dsh-deepseek-billing](https://github.com/Jolly-J/dsh-deepseek-billing) - DeepSeek account balance and per-session cost card in the sidebar foot.
- [AKIRACOD/dsh-drag-and-drop](https://github.com/AKIRACOD/dsh-drag-and-drop) - File-drag fork: drop documents as removable chips above the composer, send without typing.
- [HsiangNianian/dsh-auto-continue](https://github.com/HsiangNianian/dsh-auto-continue) - Auto-resumes interrupted DSH Web requests: sends a queued 「继续」 after network, timeout or host-crash failures, with error classification, adaptive backoff, templated continue text and browser notifications.
- [liliuCourier/dsh-chat-outline](https://github.com/liliuCourier/dsh-chat-outline) - Persistent left-hand conversation outline: questions and final replies per turn, keyword filter, one-click jump.
- [LaoYueHanNi/dsh-token-usage](https://github.com/LaoYueHanNi/dsh-token-usage) - Per-request model token usage tracked to per-day JSONL files, with a stats page in Web settings: daily trend chart, per-model breakdown, and date/model filters.
- [QT-Chen/dsh-mic-input](https://github.com/QT-Chen/dsh-mic-input) - Microphone voice input for the composer: browser Web Speech API live transcription, dedupe/auto-continue, smart punctuation, language and auto-send settings.
- [LeemanCheung/dsh-task-dag](https://github.com/LeemanCheung/dsh-task-dag) - Displays a Session's subagents and durable workflow runs as a live DAG with status, navigation, and restart-safe history.
- [MorGogh/widget-dock](https://github.com/MorGogh/widget-dock) - Draggable grid-aligned workbench of 28 mini-cards in the margins of the conversation (API balance, token usage, cost, context pressure, todos, goal, usage heatmap, GitHub repo, image relay), with S/M/L/XL size tiers.
- [qjcnmd/dsh-reasoning-slider](https://github.com/qjcnmd/dsh-reasoning-slider) - Codex-style reasoning-effort slider embedded in the model selector.
- [Semidia/dsh-sampling-sliders](https://github.com/Semidia/dsh-sampling-sliders) - Model sampling sliders (temperature / maxTokens) in the composer: override every model request for all providers via the agent/request hook, with hot/persist modes.
- [causebefore/dsh-pomodoro](https://github.com/causebefore/dsh-pomodoro) - Pomodoro focus-and-break timer for DSH Web with configurable cycles, a draggable mini panel, and in-app, sound, and browser notifications.

- [siberiah2o/dsh-plugin-terminal](https://github.com/siberiah2o/dsh-plugin-terminal) - Bottom multi-tab terminal panel (node-pty + xterm.js) pinned to the viewport bottom, always below the input box.
- [urzeye/dsh-outline](https://github.com/urzeye/dsh-outline) - Real-time outline panel for the DSH Web session page: user questions plus a Markdown heading tree (H1–H6) that updates live during streaming, with click-to-locate highlighting, expand-depth control, search, and per-session favorites.
- [283Gawin/dsh-heatmap](https://github.com/283Gawin/dsh-heatmap) - Activity heatmap in the DSH Web sidebar: GitHub-style grid of daily commits, token usage, and estimated spend, with a today stats line for all-session token totals, cache hit rate, and per-model auto-priced cost.
- [Max-Samson/dsh-usage-chart](https://github.com/Max-Samson/dsh-usage-chart) - Token, cost, and balance dashboard under the composer: live indicator plus zero-dependency SVG charts for per-turn usage, estimated cost, and DeepSeek account balance.
- [RAFOLIE/dsh-desktop-windowos#plugin](https://github.com/RAFOLIE/dsh-desktop-windowos/tree/main/plugin) - Windows tray desktop shell for DSH: auto-installs the exe from GitHub Releases, creates a desktop shortcut, and adds a desktop_launch tool to start it from chat.

- [ZichengGurrr/dsh-window#plugin](https://github.com/ZichengGurrr/dsh-window/tree/main/plugin) - Native Windows desktop window (WebView2) for DSH: one-command install, auto-fetches the app zip from GitHub Releases, creates a desktop shortcut, and adds a desktop_launch tool to start it from chat.
- [ZichengGurrr/dsh-window#kit](https://github.com/ZichengGurrr/dsh-window/tree/main/kit) - All-in-one bundle for DSH: the native Windows desktop window (WebView2), DeepEye vision (GLM-4V-Flash), and voice input (mic button) in a single install.
- [zoumutou/dsh-web-preview](https://github.com/zoumutou/dsh-web-preview) - Side web-preview panel: local static hosting, Markdown/code/image preview, one-click run of non-static projects (Cargo/npm/Go/Python) with live logs, web element mark & annotate, and link-click takeover into the side panel.
- [FengHuoLinShan/dsh-plugin-llm-balance](https://github.com/FengHuoLinShan/dsh-plugin-llm-balance) - Draggable floating card showing the balance/quota of your most recently used providers (DeepSeek/Moonshot/Kimi For Coding): auto-discovery, color-coded tiers, live refresh.
- [x2802490130-prog/dsh-balance-float](https://github.com/x2802490130-prog/dsh-balance-float) - A floating balance widget for the Web UI: live DeepSeek account balance with manual refresh and a Y/N-confirmed graceful exit.
- [Semidia/dsh-session-manager](https://github.com/Semidia/dsh-session-manager) - Right-click session menu and sidebar session manager: pin, rename, archive, fork, export, copy cwd/id/deep link, and open in explorer or a new window.
- [x2802490130-prog/dsh-lan-pass](https://github.com/x2802490130-prog/dsh-lan-pass) - A LAN password gate for the Web UI: phones and tablets on the same network log in with a shared key and see the same sessions in real time, with a built-in randomUUID polyfill for plain-HTTP origins.
- [magicOF2/dsh-turn-marks](https://github.com/magicOF2/dsh-turn-marks) - Left-edge turn-marks strip in chat: one bar per user message, click to jump to that message, hover for a preview, active bar turns white.
- [magicOF2/dsh-chat-width-customizer](https://github.com/magicOF2/dsh-chat-width-customizer) - Session-header button that cycles the conversation width (748-1600px), widening the chat column, composer, and user bubbles together.
- [luokai-demo/dsh-plugins#plugins/dsh-balance-plugin](https://github.com/luokai-demo/dsh-plugins/tree/main/plugins/dsh-balance-plugin) - DeepSeek wallet balance at the sidebar foot: a credit-card icon with the amount tinted by remaining balance (green over ¥2, amber ¥0–2, red below), refreshed on mount, per turn-end, and on click; a signed delta floats up and fades on each balance change.
- [Ceelog/dsh-plugins#dsh-plugin-setting-mcp](https://github.com/Ceelog/dsh-plugins/tree/main/src/plugins/dsh-plugin-setting-mcp) - Manage MCP servers from the Web settings panel: view, add, edit, remove, enable or disable them, with hot reload on save.
- [BeiZi6/dsh-opencodego-usage](https://github.com/BeiZi6/dsh-opencodego-usage) - OpenCodeGo quota monitor for the DSH Web GUI: a breathing indicator at the input's bottom-right (green/yellow/red by remaining share), a liquid-glass panel with rolling/weekly/monthly usage windows and reset times, auto-refreshing every 30 s; API key read from DSH credentials.
- [giiiiiithub/terminal](https://github.com/giiiiiithub/terminal) - Real PTY terminal panel for the DSH Web UI: host half spawns shells with node-pty (cmd.exe default on Windows), rendered in the browser with xterm.js; multi-tab sessions, dock/floating window, clipboard support.
- [SpookySandwich/dsh-smooth-stream](https://github.com/SpookySandwich/dsh-smooth-stream) - Better streaming text animation for DeepSeek Harness.
- [ook826092-cloud/dsh-mobile-css](https://github.com/ook826092-cloud/dsh-mobile-css) - Mobile adaptation for the DSH Web UI: compact typography, full-width composer with caret fix, drawer sidebar with overlay-close, two-page settings flow, responsive tables and stats, safe touch targets.
- [Wongzexu/dsh-git-status](https://github.com/Wongzexu/dsh-git-status) - Specialized in Git branch and status handling: a Git status drawer on the right edge of the DSH web UI with a commit DAG lane graph, uncommitted changes and stash rows, inline diffs, right-click branch/tag actions, and one-click fetch from all remotes.
- [YZz-S/dsh-workspace-files-explorer](https://github.com/YZz-S/dsh-workspace-files-explorer) - Floating workspace file-tree browser for the Web GUI with line-numbered syntax highlighting and Markdown preview.
- [YZz-S/dsh-token-cost-meter](https://github.com/YZz-S/dsh-token-cost-meter) - Real-time session token usage and estimated cost in the composer stats row, with pricing fetched from DeepSeek official pricing page.
- [penguin-oo/dsh-pathlink](https://github.com/penguin-oo/dsh-pathlink) - Ctrl+click file paths and links in chat: paths open their folder in the OS file manager (with the file selected), links open in a new browser tab.
- [AKS1st/dsh-mermaid](https://github.com/AKS1st/dsh-mermaid) - Render Mermaid code fences in DSH Web chat messages as lazy-loaded SVG diagrams with strict sanitization and light/dark theme follow.
- [Sanqi-normal/dsh-model-picker](https://github.com/Sanqi-normal/dsh-model-picker) - Provider-tabbed model picker for the dsh web composer: left provider column and right model list, both independently scrollable, with cross-provider search.
- [AKS1st/dsh-sysmon](https://github.com/AKS1st/dsh-sysmon) - System status floating widget: live CPU/memory/disk usage in the bottom-right corner of the DSH Web UI with threshold colour warnings.
- [AKS1st/model-usage-plugin](https://github.com/AKS1st/model-usage-plugin) - Per-model token usage and cost estimation with DeepSeek account balance, shown in a Settings panel tab.
- [PerryLink/dsh-composer-history](https://github.com/PerryLink/dsh-composer-history) - Terminal-style input history for the web composer: edge-first arrow-key recall with exact draft and caret restore, browser-local persisted history, Ctrl+R reverse search, and sliding-context awareness (compaction summaries join recall and search).
- [Minecraftbe/dsh-toolfold](https://github.com/Minecraftbe/dsh-toolfold) - Codex-style tool call folding, collapsing multiple tool calls into a single line.
- [02Muller25/dsh-api-balance](https://github.com/02Muller25/dsh-api-balance) - Real-time DeepSeek API account balance in the composer dock with manual or custom-interval auto-refresh.
- [XiLuovo/dsh-session-timeline](https://github.com/XiLuovo/dsh-session-timeline) - Session timeline down the left of the conversation: every user message at a glance, current-message tracking, hover preview of the message and its reply, click to jump, collapsible.
- [kelearns/dsh-navigation-bar](https://github.com/kelearns/dsh-navigation-bar) - Piano-key in-conversation navigation for the Web UI: one key per user message with hover ladder, message-preview tooltip, and active-message highlight; click to smooth-scroll.
- [kelearns/dsh-token-usage](https://github.com/kelearns/dsh-token-usage) - Token usage heatmap for the Web UI: daily/weekly/cumulative views over a 12-month window with light/dark themes.
- [izz-BLUE/dsh-deepseek-usage-dashboard](https://github.com/izz-BLUE/dsh-deepseek-usage-dashboard) - DeepSeek API usage dashboard for DSH Web: daily cache-hit/miss and output token statistics from session logs, per-model cost estimates, account balance, 7-day trends, and a composer usage summary.
- [wsxwj123/dsh-plugins#dsh-composer-tools](https://github.com/wsxwj123/dsh-plugins/tree/main/packages/dsh-composer-tools) - Composer input toolkit: arrow-key session history (first/last-line gated, IME and command-menu safe) and related input conveniences.
- [kongerly/dsline](https://github.com/kongerly/dsline) - LINE-style chat bubbles for the DSH web GUI: green outgoing bubbles, assistant bubbles with avatar and a collapsible thinking row, a typing indicator, and full markdown rendering.
- [SongMiao-tech/dsh-prompt-optimizer](https://github.com/SongMiao-tech/dsh-prompt-optimizer) - Optimize Prompt button under the composer: one click rewrites your draft into a clearer, more executable prompt, with a before-and-after dialog and one-click replacement.
### Themes & Appearance

- [RizenHNT/dsh-skin-digital-arcade](https://github.com/RizenHNT/dsh-skin-digital-arcade) - Digital arcade HUD skin: neon cyan/violet/magenta palette, Ark Pixel fonts, animated sprites (city backdrop, data core, mascot), custom crosshair cursor; light and dark themes follow the system.

- [RevolutionLA/dsh-dream-skin](https://github.com/RevolutionLA/dsh-dream-skin) - One-command skin plugin: 8 original themes, translucent wallpaper with opacity/blur, per-user accent, and shareable theme-pack import/export, favorites and surprise-me — purely native on DSH's token system.
- [KinGao294/dsh-skin](https://github.com/KinGao294/dsh-skin) - Codex-style skin switcher plus a custom wallpaper layer with opacity and blur controls.
- [Small-tailqwq/dsh-deep-whale](https://github.com/Small-tailqwq/dsh-deep-whale) - Whale-girl skin series for the DSH Web UI (maid-atelier).
- [wsxwj123/dsh-plugins#theme-gallery](https://github.com/wsxwj123/dsh-plugins/tree/main/packages/theme-gallery) - Fifteen curated theme families with complete light and dark palettes that follow the native Light, Dark, and Follow system modes.
- [PAKIKNOWLEDGE/dsh-client-ui-skin-claude](https://github.com/PAKIKNOWLEDGE/dsh-client-ui-skin-claude) - Claude-style skin with a warm-black canvas, clay accent, and serif UI that follows the native light and dark themes.
- [tianyhjg-lab/dsh-font](https://github.com/tianyhjg-lab/dsh-font) - Font switcher for the DSH Web GUI: 99 UI fonts and 31 code fonts with CJK-Latin pairing stacks, instant apply and localStorage persistence.
- [starslittle/dsh-blue-whale](https://github.com/starslittle/dsh-blue-whale) - A DeepSeek Chat-style blue-whale color skin. Light and dark follow the built-in appearance.
- [chinaRXQ/dsh-wallpaper](https://github.com/chinaRXQ/dsh-wallpaper) - Wallpaper skin for the DSH Web UI: image background with opacity, mask and blur controls.
- [SamizuHM/dsh-client-ui-theme-xp](https://github.com/SamizuHM/dsh-client-ui-theme-xp) - Windows XP Luna desktop for the DSH Web UI: a floating window manager with taskbar and desktop icons, plus the era-accurate Luna skin.
- [Tommy00748/dsh-theme-cyberpunk2077](https://github.com/Tommy00748/dsh-theme-cyberpunk2077) - Cyberpunk 2077 / Night City theme: NC yellow and neon cyan identity, CRT scanlines, Kiroshi hover lock-on, combat-state HUD, synthesized typewriter and message SFX, and hidden easter eggs (relic / johnny).
- [Tkingxiao/dsh-any-background](https://github.com/Tkingxiao/dsh-any-background) - A DeepSeek Harness appearance plugin that lets you fully customize the Web UI with a custom theme color, background wallpaper, and fine-grained opacity controls.
- [BeiZi6/dsh-theme-plugin](https://github.com/BeiZi6/dsh-theme-plugin) - Theme studio for the DSH Web GUI: five built-in presets plus fully customizable light/dark palettes (accent, background, foreground, UI and code fonts, translucent sidebar, contrast), hot-swapped instantly and persisted in localStorage.

- [zhijun-dai/Catppuccin-dsh-theme](https://github.com/zhijun-dai/Catppuccin-dsh-theme) - Catppuccin theme plugin: Latte, Frappé, Macchiato, and Mocha skins for the DSH Web theme runtime.
- [zhijun-dai/Solarized-dsh-theme](https://github.com/zhijun-dai/Solarized-dsh-theme) - Solarized and Selenized theme plugin: four faithful palettes registered with the DSH Web theme runtime.
- [yunxiiQwQ/dsh-maid-whale-webUI#maid-whale-webui](https://github.com/yunxiiQwQ/dsh-maid-whale-webUI/tree/main/maid-whale-webui) - Whale-maid paper theme for the DSH Web UI with light and dark palettes, ocean illustrations, hand-drawn frames, decorative assets, and a persistent pet.
- [xingyingyuzhui/dsh-liquid-glass](https://github.com/xingyingyuzhui/dsh-liquid-glass) - Wallpaper plus optional Liquid Glass islands for the DSH Web UI: Ice/Deepwater presets, import, wallpaper opacity, and per-island blur on official light/dark/system.
- [caoyiwei850/dsh-client-ui-skins](https://github.com/caoyiwei850/dsh-client-ui-skins) - Skin plugin for the DSH Web UI: 4 built-in skins plus custom image skins with the photo as a full-interface background and the palette following its dominant hue.
- [AKS1st/dsh-cyber-particle](https://github.com/AKS1st/dsh-cyber-particle) - Particle-network background overlay for the DSH Web shell: full-screen, click-through, zero runtime dependencies.
- [LeemanCheung/dsh-qq2007-skin](https://github.com/LeemanCheung/dsh-qq2007-skin) - QQ 2007-inspired retro skin for the DSH Web GUI, with native theme tokens, scoped three-pane chrome, an original pixel buddy, and a reversible Settings switch.
- [NoNameLeGo/dsh-catppuccin](https://github.com/NoNameLeGo/dsh-catppuccin) - Catppuccin themes for the DSH Web GUI: Latte, Frappé, Macchiato and Mocha registered into the native theme runtime, one-click switching with a persisted choice.
- [zhxqc/dsh-oh-my-theme](https://github.com/zhxqc/dsh-oh-my-theme) - Web theme and file workspace plugin with global typography controls, @file mentions, a project file tree, Markdown preview, and a resizable side panel.

### Models & Providers
- [GodD6366/dsh-sub2api](https://github.com/GodD6366/dsh-sub2api) - Connect a sub2api gateway to DeepSeek Harness: OpenAI-compatible multi-provider routes (OpenAI / Claude / Grok / Gemini) behind one base URL, with per-key model discovery, usage lookup, and global vision/image tools.
- [Mars-Sea/dsh-commandcode-provider](https://github.com/Mars-Sea/dsh-commandcode-provider) - Unofficial Command Code LLM provider: registers a `commandcode` route with a live model catalog and reasoning-effort support.
- [Noob-stupid/dsh-github-login](https://github.com/Noob-stupid/dsh-github-login) - Visual GitHub login without a terminal: in-window device flow, token synced into the gh CLI, and host status/launch endpoints.

- [dylan121322/llm-adaptive](https://github.com/dylan121322/llm-adaptive) - Adaptive model routing: per-request complexity classification with automatic provider routing.
- [btspoony/dsh-llm-fallbacks](https://github.com/btspoony/dsh-llm-fallbacks) - Role-based LLM retry & fallback strategies.
- [franksong2702/dsh-codex-connect](https://github.com/franksong2702/dsh-codex-connect) - Connect ChatGPT OAuth and OpenAI Codex models to DeepSeek Harness, with opt-in search and image tools.
- [kam74515-boop/dsh-everything-oauth](https://github.com/kam74515-boop/dsh-everything-oauth) - Import local Codex, Grok, Claude, OpenCode, and CC Switch logins into DSH; pick sources and enable models in Settings.
- [omdsh-dev/Qwen-MM-Plugins](https://github.com/omdsh-dev/Qwen-MM-Plugins) - Qwen multi-modal plugin support.
- [suntianc/dsh-codex-auth](https://github.com/suntianc/dsh-codex-auth) - Reuses the Codex CLI ChatGPT login as an `openai-codex` LLM route and adds GPT Auth controls to DSH Web settings.
- [feibi-mochi/deepseek-harness-wallet](https://github.com/feibi-mochi/deepseek-harness-wallet) - Multi-provider wallet chip: official DeepSeek balance, per-session cost & tokens, third-party token totals, recharge shortcut, low-balance alerts.
- [superboy911/dsh-model-router](https://github.com/superboy911/dsh-model-router) - Deterministic keyword routing, allowlisted model switching, and an isolated image_gen channel for DeepSeek Harness.
- [kaixinbaba/dsh-vision-recognizer](https://github.com/kaixinbaba/dsh-vision-recognizer) - Vision provider route that transcribes attached images to text through a configurable model (15+ OpenAI-compatible and Anthropic vendors) while DeepSeek keeps answering.
- [fieldnote-ops/keyringseam](https://github.com/fieldnote-ops/keyringseam) - macOS Keychain credential provider that replaces the local-file provider and uses a signed, notarized universal helper.

- [YZz-S/dsh-billing-balance](https://github.com/YZz-S/dsh-billing-balance) - Shows DeepSeek API account balance and Volcengine Ark Coding/Agent Plan quota windows (5h/weekly/monthly with reset countdowns) in the settings panel, composer dock, and a draggable floating refresh button.
- [jyh20030112/dsh-visual-plugin](https://github.com/jyh20030112/dsh-visual-plugin) - Gives text-only models vision: forwards user images to an OpenAI-compatible vision model and shows the descriptions in a Web UI right panel.
- [jiay98528-dev/dsh-model-sync](https://github.com/jiay98528-dev/dsh-model-sync) - Syncs live provider model lists into DSH settings and shows 5h/7d quota rings for the current session model.
- [wenzetan/dsh-llm-newapi](https://github.com/wenzetan/dsh-llm-newapi) - NewAPI (OpenAI-compatible gateway) LLM provider: registers a `newapi` route with chat-only model discovery, auto-fills model parameters (context window, reasoning effort) from models.dev, and adds a Web settings section for the base URL and API key.
### Sessions & Messages

- [zljr/dsh-share](https://github.com/zljr/dsh-share) - Share the current session over the LAN as a read-only, token-guarded HTML snapshot with session stats and Markdown rendering.

- [HuiHuitie-zhu/dsh-incognito](https://github.com/HuiHuitie-zhu/dsh-incognito) - Incognito sessions: a standalone ephemeral sub-agent with its own preset (no parent context) and full toolset, draggable floating window, burned to zero traces on close.
- [starslittle/dsh-queue-plus](https://github.com/starslittle/dsh-queue-plus) - Stock queue plus edit, remove, steer, reorder, clear-all, and 10-second undo.
- [fredalxin/dsh-solo-thinking](https://github.com/fredalxin/dsh-solo-thinking) - Visual branch brainstorming that creates an isolated Session for each direction, automates parent, sibling, checkpoint, and return Handoffs, and provides a full tree tab with an optional Better Sidebar view.
- [ishuowang/dsh-agent-team-room](https://github.com/ishuowang/dsh-agent-team-room) - Persistent native rooms connecting independent DSH Sessions and provider-backed members, with direct and broadcast delivery and no built-in roles, scenarios, task board, or standalone dashboard.
- [cindyguyuehu123/dsh-webchatlike](https://github.com/cindyguyuehu123/dsh-webchatlike) - Bring the deepseek.com web/app chat experience to DSH: edit your prompt and regenerate answers in place, with a per-message <i/N> version pager (tree model, stable across conversations).
- [penguin-oo/dsh-bookmarks](https://github.com/penguin-oo/dsh-bookmarks) - Bookmark assistant replies with notes and tags; browse every bookmark in one cross-session center and export to Markdown.

- [Anionex/dsh-turn-rewind](https://github.com/Anionex/dsh-turn-rewind) - Rewind conversation and workspace state, powered by a persistent Change Ledger.
- [GengDaPeng/dsh-agent-message](https://github.com/GengDaPeng/dsh-agent-message) - Cross-session agent messaging for DeepSeek Harness with session discovery, offline delivery, delivery receipts, and sender-session navigation.
- [Jesse-njx/dsh-crosstalk](https://github.com/Jesse-njx/dsh-crosstalk) - Cross-session messaging for DSH: any session on the machine can list and message any other, Claude Code-style, via a local heartbeat registry and inbox.
- [dongsheng123132/task-passport](https://github.com/dongsheng123132/task-passport) - Carry durable task state across DeepSeek Harness, WorkBuddy, Claude Code and Codex with machine-readable checkpoints and optimistic locking.
- [LeslieWylie/dsh-task-relay](https://github.com/LeslieWylie/dsh-task-relay) - Cross-session task queue with handoff notes: sessions and subagents push, claim, complete and cancel tasks on a shared file-backed queue, and leave a handoff summary for whoever picks up next.
- [hellodigua/dsh-share](https://github.com/hellodigua/dsh-share) - Share your conversations with one click.
- [ChuanTianML/dsh-local-share](https://github.com/ChuanTianML/dsh-local-share) - Export complete Web Sessions to local Markdown or self-contained HTML, with stable rendered previews, default redaction, and opt-in bounded tool-call details.
- [Moeblack/dsh-message-edit](https://github.com/Moeblack/dsh-message-edit) - Branch-based message editing, reroll, retry, and a version timeline.
- [Buyi-wsgzg/dsh-sidechain](https://github.com/Buyi-wsgzg/dsh-sidechain) - `/side` persistent side sessions and `/btw` one-shot side questions, run in a temporary fork without touching main history.
- [bill9109/dsh-conversation-share](https://github.com/bill9109/dsh-conversation-share) - Share any excerpt of a conversation.
- [yuezengwu/dsh-explain](https://github.com/yuezengwu/dsh-explain) - Local-first learning mode: cross-session learning threads with per-source explanations.
- [Moeblack/dsh-prompt-studio](https://github.com/Moeblack/dsh-prompt-studio) - Edit user and built-in system-prompt sections with live preview.
- [czm15053/dsh-peer-link](https://github.com/czm15053/dsh-peer-link) - Let dsh and Claude Code sessions message each other directly; comes with a clickable peer list card (sort/search/send/refresh).
- [PwnKY/dsh-session-link](https://github.com/PwnKY/dsh-session-link) - Copy and open `dsh://` session deep links, or paste them into another conversation to inject a bounded, read-only snapshot of the referenced session.
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
- [huguangyu666/dsh-plugin-session-import](https://github.com/huguangyu666/dsh-plugin-session-import) - Import claude-code / codex / reasonix / zcode chat history into dsh sessions: workspace binding, tool calls preserved, oversized-session protection, zcode compaction restore.
- [beijingwahw/dsh-companion](https://github.com/beijingwahw/dsh-companion) - Four-module session companion: smart conversation export (Markdown/PDF/JSON/PNG long-image with privacy redaction and batch ZIP), context handoff summaries with template save/import, API cost optimization (live official pricing, peak/off-peak scheduling, daily/monthly budgets, model routing), and global conversation search with in-chat find (Ctrl+F, CSS Custom Highlight API).
- [ishuowang/dsh-sideband](https://github.com/ishuowang/dsh-sideband) - Instantly freezes a bounded context snapshot, summarizes it with an isolated no-tool LLM, and asynchronously delivers it to a Session or authorized Room with quiet/wakeup modes and a native target picker.
- [mayf3/dsh-session-doctor](https://github.com/mayf3/dsh-session-doctor) - Diagnose, unstick, and read DSH sessions: list sessions with agent status, read conversations, diagnose stuck agents, recover them with cancel+keepInbox, and send messages to other sessions.
- [MuWinds/dsh-archived-sessions](https://github.com/MuWinds/dsh-archived-sessions) - Archived-session management: browse archived sessions, unarchive them, or clear them out.
- [anweat/dsh-assistant-message-forge](https://github.com/anweat/dsh-assistant-message-forge) - Create/modify/inject test assistant messages and import/repair session.jsonl(.zstd) session logs into new sessions.
- [yangyongzhen/dsh-session-export](https://github.com/yangyongzhen/dsh-session-export) - Export sessions to Markdown/JSON for review, replay, and per-session cost summaries.
- [yangyongzhen/dsh-session-report](https://github.com/yangyongzhen/dsh-session-report) - Per-session cost & usage report cards: tokens, cache hits, duration.
- [Boliban/dsh-enter-customizer](https://github.com/Boliban/dsh-enter-customizer) - Take over the system input shortcuts for the chat input box and configure behavior independently for each shortcut.
- [wsxwj123/dsh-plugins#dsh-session-manager](https://github.com/wsxwj123/dsh-plugins/tree/main/packages/dsh-session-manager) - Delete sessions with a 5-second undo and a recycle bin, plus an archive view to browse and unarchive, for the DSH Web GUI.
- [reinocheong/dsh-session-move](https://github.com/reinocheong/dsh-session-move) - Move a session to another folder from the Web UI via drag & drop or a menu picker, permanently delete a session with a risk-consent dialog, and AI-rename a session by summarizing the whole conversation (typo-aware). Each action also ships as an agent tool.
- [dylan121322/dsh-session-unarchive](https://github.com/dylan121322/dsh-session-unarchive) - Restore archived sessions to their original workspace from the Web GUI sidebar.

### Memory

- [LoserFox/distill](https://github.com/LoserFox/distill) - Automatic conversation distillation: background subagent reflection + skill create/update.
- [omdsh-dev/dsh-mnemon](https://github.com/omdsh-dev/dsh-mnemon) - Cross-agent, local-first persistent memory plugin for DeepSeek Harness (DSH), powered by Mnemon. It shares long-term memory across Mnemon-enabled agents and adds runtime memory, searchable project documents, semantic recall, knowledge graph, and a Sidebar UI.
- [modusensus/dsh-mneme#dsh-mneme](https://github.com/modusensus/dsh-mneme/tree/main/dsh-mneme) - Cross-session memory for DSH: SQLite + human-editable Markdown mirror, autoDream consolidation, six memory tools, and fully-offline semantic search (local embeddings, reranking, clustering).
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

- [truelove-dreamer/dsh-plugin-recall](https://github.com/truelove-dreamer/dsh-plugin-recall) - Cross-session memory for the model: full-text search all past sessions (SQLite FTS5 via ctx.sessionQuery) and bring the strongest matching excerpts back into the current context.
- [Noelune/unified-agent-memory](https://github.com/Noelune/unified-agent-memory) - One shared Obsidian vault for every agent: dependency-free Python core (search/promote/adjudicate/forget), vault template, dsh plugin (memory_search/show/submit/status).
- [FleetingEcho/dsh-handoff](https://github.com/FleetingEcho/dsh-handoff) - Self-maintaining handoff memory per working directory and git branch: records turns, folds them into concise Markdown, and injects the result into future sessions from ~/.agent/agent-handoff, byte-compatible with pi-handoff.
- [yangyongzhen/dsh-memory](https://github.com/yangyongzhen/dsh-memory) - Long-term memory injected at session start: preferences/facts/summaries/knowledge in global and per-project scopes, budgeted recall via `agent/pre-step`, durable JSON store.
- [akslcw/dsh-negative-ledger](https://github.com/akslcw/dsh-negative-ledger) - Evidence-bound negative-knowledge ledger: persists disproven paths (command_failed, file_missing) with their outcome and precondition evidence, then warns or blocks repeat attempts until the evidence changes.
- [ljsysfurryACE/dsh-memory-director](https://github.com/ljsysfurryACE/dsh-memory-director) - LLM-driven remember/forget memory: after each turn a model decides what to keep (MemoryDirector), injects relevant memories before each step, dedups, and persists cross-session.
- [ljsysfurryACE/dsh-compaction](https://github.com/ljsysfurryACE/dsh-compaction) - Compaction backend replacing LLM summarization with a deterministic semantic extractor (keeps code/paths/commands, drops chatter) plus 28.4x KV-compression accounting.
- [highland0971/dsh-native-memory](https://github.com/highland0971/dsh-native-memory) - Native per-workspace memory on the harness's own seams: facts and a bounded always-on profile on the storage-domain JSON unit, approval-gated writes with `(sessionId, seq)` citations, deterministic recall plus session-query FTS over past sessions — no external server, no custom SQLite.

- [Aik358/dsh-auto-memory](https://github.com/Aik358/dsh-auto-memory) - Auto-memory for DSH: three-layer memory (user / project notes / daily logs) with automatic injection, per-turn auto-consolidation, AI greetings, smart search, a calendar view and a settings page, plus inheritance of other AI tools' memories.
### Tools & Capabilities
- [Johnny-xuan/dsh-paste-to-path](https://github.com/Johnny-xuan/dsh-paste-to-path) - Adds a path-backed attachment dock for images, documents, archives, code, and other files, leaving file reading to the Agent's available tools.
- [moononnn/DeepSeek-Harness-biaoqingbao](https://github.com/moononnn/DeepSeek-Harness-biaoqingbao) - Sticker/emoji expression for assistants: emotion-driven auto-matching, library management, AI image tagging, dialects, style mimicry, and chat-based tag refinement.
- [wloops/dsh-git-worktree](https://github.com/wloops/dsh-git-worktree) - Domi-grade git worktree isolation and delivery: permanent worktrees under .dsh-worktrees, ready-for-review / apply / finish / discard lifecycle with conflict handling and safe cleanup (ported from Domi's production system).
- [x2802490130-prog/dsh-tool-writing](https://github.com/x2802490130-prog/dsh-tool-writing) - A web-novel writing engine for DeepSeek Harness: parallel drafting, outlining and brainstorming with a separate DeepSeek key, lore and foreshadowing management, semantic vector retrieval, a corpus library, usage ledger, mechanical proofreading, and a local serialization plan.
- [x2802490130-prog/dsh-writing-remote](https://github.com/x2802490130-prog/dsh-writing-remote) - Host-side Typert remote for dsh-tool-writing: serves project volumes, chapter status, corpus library, full-text search, evolution entries, and thread-graph data to the client writing panel.
- [xmutfyh/dsh-plugin-writing-guard](https://github.com/xmutfyh/dsh-plugin-writing-guard) - AI paper-writing style guard: scans manuscripts for revision-process residue, defensive writing, and AI-writing tells (em-dash abuse, not-X-but-Y, LLM overused words, rule of three); writing_audit + writing_rules tools with auto-audit on paper file writes.
- [ConsoleSun/Gemini-Eyes](https://github.com/ConsoleSun/Gemini-Eyes) - MCP bridge to gemini.google.com: vision analysis of images and videos, Imagen image and Veo video generation, and conversation management using the logged-in browser session with no API key.
- [Edge-Echo/dsh-mcp-bridge](https://github.com/Edge-Echo/dsh-mcp-bridge) - Curated MCP server bundle: one install brings demo, memory, filesystem, GitHub, Playwright and remote HTTP MCP servers, plus a connectivity verifier tool and CI checks.

- [Smalldy/godot-bridge](https://github.com/Smalldy/godot-bridge) - DSH↔Godot engine runtime bridge: launch and drive a running Godot 4.x game through its in-game TCP interaction server — 8 tools (scene/UI inspection, GDScript eval, input simulation, screenshots, headless static ops, script validation), replaces godot-mcp.
- [LeemanCheung/dsh-agent-preset-recommender](https://github.com/LeemanCheung/dsh-agent-preset-recommender) - Privacy-safe local scanner for Codex, Claude Code, WorkBuddy, and CodeBuddy session/workflow metadata; persists aggregate evidence and recommends built-in DSH agent presets without retaining content, using a network, or changing presets.
- [CheshireJCat/blender](https://github.com/CheshireJCat/blender) - Blender 3D production plugin with 30 modeling/reconstruction skills, 13 runtime tools, and 26 deterministic helpers for reference fitting, rendering, validation, animation, and portable export; installable as `dsh-blender`.
- [ysr666/dsh-vision-router](https://github.com/ysr666/dsh-vision-router) - Free vision for text-only agents: built-in keyless vision chain plus pixel tools (Q&A, grounding, crop, pixel diff, colors, OCR, SVG trace, cutout, screenshots); paste an image to use it.
- [Flyvhidbwo/dsh-vision-proxy](https://github.com/Flyvhidbwo/dsh-vision-proxy) - DeepSeek brain + automatic image transcription: attach images in the GUI and each one is transcribed to text via any OpenAI-compatible VLM before reaching the text-only DeepSeek — a keyed fast path (default qwen3.7-flash; DashScope/Zhipu/OpenRouter or any OpenAI-compatible endpoint) with your own key, or local Ollama auto-detected with zero config.
- [ximengxiaolan/dsh-vision-bridge](https://github.com/ximengxiaolan/dsh-vision-bridge) - Composer-attached images are transcribed to text by an OpenAI-compatible vision model before reaching text-only DeepSeek models.
- [linenxi-ctrl/dsh-vision](https://github.com/linenxi-ctrl/dsh-vision) - External vision plugin for DeepSeek Harness: whale-button config panel, image recognition with auto-reply, and agent screenshot/recognize tools.
- [Einskyle/dsh-llm-vision-bridge](https://github.com/Einskyle/dsh-llm-vision-bridge) - Native LLM-provider vision bridge: images pasted in the chat are described by a vision model (Qwen3-VL via pi-ai/llama.cpp) and the text description is fed to text-only DeepSeek for the reply — image admission, routing and compaction all run through harness-native mechanisms, with an LRU description cache and 503 retry.
- [shinjiyu/dsh-plugin-multimodal](https://github.com/shinjiyu/dsh-plugin-multimodal) - Advertise image paste on text-only DeepSeek routes, describe attachments with a vision sidecar, and leave native vision models untouched.
- [lire1131/dsh-undo-plugin](https://github.com/lire1131/dsh-undo-plugin) - Undo/redo & rollback system for DSH: every config change is auto-snapshotted; undo/redo/restore to any version from the WebUI or the offline CLI/GUI tools (works even when DSH fails to boot).
- [MAXeaglet/dsh-bash-terminal](https://github.com/MAXeaglet/dsh-bash-terminal) - One shell tool for PowerShell / Git Bash / WSL on Windows plus an interactive PTY terminal; the default terminal is chosen by the user in DSH settings.
- [Fro2en12/dsh-download-progress](https://github.com/Fro2en12/dsh-download-progress) - Download progress panel: URL downloader, agent shell/SSH transfer tracking and workspace black-box file-growth monitoring, shown in a draggable floating panel with live bytes, speed, percentage and ETA.
- [CZX2244/dsh-bilibili](https://github.com/CZX2244/dsh-bilibili) - Bilibili video analysis: metadata, transcript (ASR fallback via Bijian/sherpa-onnx/whisper.cpp), comments, danmaku, and sharp keyframes with optional local vision descriptions.
- [Anionex/dsh-vision-toolkit](https://github.com/Anionex/dsh-vision-toolkit) - Vision tasks for text-only models: intent-aware image Q&A, long-screenshot OCR, UI reproduction, grounding, and pixel diff.
- [SPYQWER1/dsh-codex-tools](https://github.com/SPYQWER1/dsh-codex-tools) - Codex-backed `web_search`, `image_gen`, and `image_vision` tools for DeepSeek Harness, reusing ChatGPT OAuth login state.
- [LeemanCheung/dsh-image-gen](https://github.com/LeemanCheung/dsh-image-gen) - Generates GPT Image 2 images through an `image_gen` tool with streamed partial previews, a Codex-style developing card, durable attachment replay, and download.
- [yun520-1/deepseek-heartflow](https://github.com/yun520-1/deepseek-heartflow) - HeartFlow (心虫) AGI layer-1 discriminator gate as a DSH plugin: 47-dimension rule-based text checking (heartflow_check tool) plus automatic output supervision at tools/post-execute, fail-closed when engine missing.
- [omdsh-dev/dsh-custom-tool](https://github.com/omdsh-dev/dsh-custom-tool) - Create and manage sandboxed JavaScript tools with a Monaco editor and model-driven tool lifecycle.
- [shinjiyu/deepseek-harness-evolver](https://github.com/shinjiyu/deepseek-harness-evolver) - Complement to official Creator mode: stage, validate, live-mount via ctx.plugin, score, and solidify or roll back in-memory tool-plugin trials.
- [ZRui-C/dsh-computer-use](https://github.com/ZRui-C/dsh-computer-use) - Text-first computer use for DSH: background Chromium control via Playwright/CDP plus accessibility-first macOS control; actions stay pinned to the right process and window without taking the user's pointer, ships a Developer ID signed, notarized Universal 2 DMG.
- [kyo615/dsh-browser-control](https://github.com/kyo615/dsh-browser-control) - Playwright MCP browser control for AI agents: drive a real, visible Chrome (navigate/click/type/snapshot + ~80 browser_* tools), with a live screenshot panel embedded in the GUI that refreshes after every action.
- [Anionex/dsh-computer-use](https://github.com/Anionex/dsh-computer-use) - Accessibility-first macOS computer use: fresh observations, stale-state rejection, scoped permissions, and safe input.
- [kunjinkao-os/dsh-mobile-gui-agent](https://github.com/kunjinkao-os/dsh-mobile-gui-agent) - Android GUI Agent with ADB screenshots, compact UI hierarchy grounding, verified iterative actions, approvals, and a Mobile Web view.
- [omdsh-dev/dsh-data-agent](https://github.com/omdsh-dev/dsh-data-agent) - Let the AI connect to databases and write SQL for you.
- [omdsh-dev/dsh-toolkit](https://github.com/omdsh-dev/dsh-toolkit) - Zero-dependency toolkit: time / encoding / json / calculator / csv / regex / markdown / diff / stat / schema — ten deterministic tools in one install.
- [flymysql/dsh-remote](https://github.com/flymysql/dsh-remote) - Multi-machine remote workspace: manage many SSH hosts, pick a local or remote workspace in the native Add-workspace flow (system folder chooser / local path / remote dir browse), mirror a remote workspace to a real local folder, and operate it with rw_* tools. The picker is a centered modal that opens on the local tab and auto-fills `/` for remote paths, live-completing each directory level.
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
- [akqwpeter-prog/dsh-media-skills](https://github.com/akqwpeter-prog/dsh-media-skills) - Free vision bridge and image generation for text-only models: paste-image reading, GLM-4V-Flash and Gemini engine failover, ModLens-style structured evidence, and a seeded free vision model route.
- [Dariandai/dsh-starter-pack](https://github.com/Dariandai/dsh-starter-pack) - A curated plugin starter pack: batch-installs and configures 15 vetted community plugins across four groups from a Settings-page UI or the /setup command.
- [crTnT/dsh-plugin-suite#dsh-plugin-center](https://github.com/crTnT/dsh-plugin-suite/tree/main/dsh-plugin-center) - Plugin center: discover, install, and manage DSH plugins from Settings.
- [crTnT/dsh-plugin-suite#dsh-plugin-updater](https://github.com/crTnT/dsh-plugin-suite/tree/main/dsh-plugin-updater) - Update manager for installed plugins: check for updates, back up, and roll back.
- [awesome-dsh-plugin/dsh-find-plugin](https://github.com/awesome-dsh-plugin/dsh-find-plugin) - Find plugins without leaving the agent: search this curated registry by keyword or category, with ready-to-run install commands.
- [lonelymoon87/dsh-code-intel](https://github.com/lonelymoon87/dsh-code-intel) - Indexes workspace symbols with Tree-sitter and provides lexical or optional embedding-assisted code search.
- [lynx-gt/dsh-subagent-tools](https://github.com/lynx-gt/dsh-subagent-tools) - Per-call model, provider, persona, and toolFilter overrides for subagent delegation, with @preset: references and provider/model composite ids.
- [lynx-gt/dsh-subagent-cwd](https://github.com/lynx-gt/dsh-subagent-cwd) - Extends dsh-subagent-tools with a per-call cwd for subagents, shipped with the two in-process provider patches it requires.
- [Jesse-njx/dsh-voice](https://github.com/Jesse-njx/dsh-voice) - Voice notes in, spoken answers out: dictate audio that becomes user messages (transcribe), have the agent read replies aloud (speak), local-first under ~/.dsh/voice.
- [Jesse-njx/dsh-docker](https://github.com/Jesse-njx/dsh-docker) - Typed, guarded container control: ps/logs/inspect/exec/start/stop and compose up/down with JSON output, project-aware targeting, and approval-gated destructive ops.
- [hccccc01333/dsh-excel-chat](https://github.com/hccccc01333/dsh-excel-chat) - Talk to Excel in DeepSeek Harness: create, edit, repair, and verify spreadsheets by conversation, with automatic formula health checks after every edit.
- [zhang787jun/dsh-finance](https://github.com/zhang787jun/dsh-finance) - Financial research workflow and portfolio risk tools with source discipline for current market facts.
- [Realyujie/dsh-us-stocks](https://github.com/Realyujie/dsh-us-stocks) - US stock quotes, price history, financial statements, analyst consensus and news via yahoo-finance2.
- [1624318455/dsh-plugin-tavily](https://github.com/1624318455/dsh-plugin-tavily) - Tavily-backed web search provider for the built-in web_search tool, with a settings card for the API key, result count, and recency window.
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
- [shinjiyu/dsh-plugin-search](https://github.com/shinjiyu/dsh-plugin-search) - Keep the built-in web_search tool without an official DeepSeek API key: disable web-search-deepseek and use Tavily keyless by default.
- [Lum1104/dsh-browser](https://github.com/Lum1104/dsh-browser) - Chrome sidebar extension that lets DSH operate your browser directly, no vision capabilities required.
- [huey1in/trio](https://github.com/huey1in/trio) - Browser automation (Playwright) with a live view, an MCP server exposing DSH agents to any MCP client, and GitHub issue/PR/webhook review tools.
- [zoahdev/dsh-github-release-radar](https://github.com/zoahdev/dsh-github-release-radar) - Track releases and stars of any public GitHub repository from inside dsh agents — no API key needed.
- [zoahdev/dsh-github-intelligence](https://github.com/zoahdev/dsh-github-intelligence) - The most complete GitHub integration for dsh: repo overview, releases, issues, pull requests, contributors, search, and a deep repo report with TTL caching — no API key needed.

- [SamXiaBing/dsh-adb](https://github.com/SamXiaBing/dsh-adb) - ADB device & bench operations for DSH: device discovery, structured logcat (background streaming), apk install, file pull/push, and dumpsys performance snapshots.
- [xiaoyuyu6420/dsh-backup](https://github.com/xiaoyuyu6420/dsh-backup) - One-command backup & restore of DSH user data: /backup, verify, restore, restart-surviving scheduled auto-backup, sha256 checksums and rotation (macOS/Linux/Windows).
- [Letter2025/dsh-tool-search](https://github.com/Letter2025/dsh-tool-search) - Hermes-style tool search & slimming: progressive disclosure, semantic search, describe, and call long-tail tools on demand while core tools stay eager.

- [1na-ko/dsh-hdc-bridge](https://github.com/1na-ko/dsh-hdc-bridge) - HarmonyOS device bridge: hdc screenshot/install/log/crash/UI automation loop with read_image, official-first versioned API knowledge (SDK .d.ts + offline bundled docs), and a DevEco CLI build/sign/lint lane.
- [PicGo/dsh-plugin](https://github.com/PicGo/dsh-plugin) - Upload local images and files to your image host through PicGo's existing configuration (PicGo Cloud, GitHub, S3, COS, Qiniu, or any installed uploader plugin), via a `picgo_upload` tool and a `/picgo` command.
- [mafeis/dsh-net-proxy](https://github.com/mafeis/dsh-net-proxy) - Route agent network requests through a local HTTP/CONNECT/SOCKS5 proxy.
- [bwndlct/dsh-session-audit](https://github.com/bwndlct/dsh-session-audit) - Session execution analytics: steps, tool calls, failures, repeated actions, token usage and verification signals, rendered as text/Markdown/JSON reports.
- [fly233338/dsh-overleaf](https://github.com/fly233338/dsh-overleaf) - Connect multiple Overleaf projects to DSH through OverleafMCP for browsing, analysis, and Git-based file updates.
- [LeslieWylie/dsh-fleet-audit](https://github.com/LeslieWylie/dsh-fleet-audit) - Read-only agent-fleet credential hygiene audit: credential-file permissions, embedded credentials in git remotes (masked in output), and provider token literal counts; zero-dependency and deterministic.
- [LeslieWylie/dsh-md-preview](https://github.com/LeslieWylie/dsh-md-preview) - Render Markdown to a standalone, self-contained HTML page: an `md_html_render` tool that works in a headless profile, plus a web drawer to browse, preview, edit and export local `.md` files; both share one renderer, with no runtime dependencies.
- [jinguanghai/deepseek-harness-forge-plugins#forge-gates](https://github.com/jinguanghai/deepseek-harness-forge-plugins/tree/main/plugins/forge-gates) - Real-compute verification gates: math simplification, logic proofs, regex validation, E-prover FOL, state-machine checks, and code repair, backed by Go-compiled binaries with prebuilt Windows executables.
- [jinguanghai/deepseek-harness-forge-plugins#forge-tcm](https://github.com/jinguanghai/deepseek-harness-forge-plugins/tree/main/plugins/forge-tcm) - Traditional Chinese Medicine toolkit: eight-axes diagnosis and herb-pair lookup.
- [lsz-asd/dsh-plugin-device-info](https://github.com/lsz-asd/dsh-plugin-device-info) - Read-only Windows device information tools: one agent tool per Win32 device category (time, system, cpu, memory, disk, gpu, network, battery, processes, usb, audio, printers) via WMI/CIM and Node os collectors.
- [jiayan-xu/dsh-codebase-memory](https://github.com/jiayan-xu/dsh-codebase-memory) - Code knowledge graph bridge for codebase-memory-mcp: semantic symbol search (BM25), source snippets, architecture overview with Leiden communities, call/data-flow/cross-service traces, graph-augmented grep.
- [jiayan-xu/dsh-nuphus-mcp](https://github.com/jiayan-xu/dsh-nuphus-mcp) - Desktop and browser automation bridge (36 tools): window/screen/mouse/keyboard control with PaddleOCR element perception, Chrome CDP browsing with accessibility snapshots.
- [superagents-lab/dsh-s1](https://github.com/superagents-lab/dsh-s1) - Native Search1API (s1) web research tools: search, news, page crawling, sitemap discovery, and trending topics as first-class `s1_*` tools, with a bundled s1 skill.

- [truelove-dreamer/dsh-plugin-git-workflow](https://github.com/truelove-dreamer/dsh-plugin-git-workflow) - First-class Git tools for the model: status / diff / log / commit / branch with validated messages and paths - no bare-shell git calls.
- [wly8691-jpg/knowlp-rag](https://github.com/wly8691-jpg/knowlp-rag) - Dual knowledge-graph RAG for Markdown notes: prerequisite + similarity graphs (P/S-Agent traversal), paragraph chunking, n-gram/embedding hybrid search, and an explicit weight feedback loop — via MCP.
- [ChenLaoshiYF/dsh-mcpguard](https://github.com/ChenLaoshiYF/dsh-mcpguard) - Scans skills and MCP configs for prompt injection, homoglyphs, hidden Unicode, dangerous shell, and credential leaks.
- [6Mikao9/dsh-wsl-workspace](https://github.com/6Mikao9/dsh-wsl-workspace) - Add a WSL workspace from the web GUI without needing to install dsh or related tools again inside WSL. Bash commands and file read/write operations run within the local WSL distribution on the host machine, while Windows files remain accessible.
- [dfycaly98931680/dsh-trajectory-governance](https://github.com/dfycaly98931680/dsh-trajectory-governance) - Agent trajectory governance and anomaly diagnosis: rebuilds flat session logs into multi-branch trajectory trees, detects loop deadlock, invalid retry, and goal drift, alerts with cost attribution, one-click interrupt and breakpoint fork via official APIs, independent GUI tab.
- [Q1hangL/dsh-ask-guard](https://github.com/Q1hangL/dsh-ask-guard) - Cooperative timeout guard for ask_user_question: lost or unanswered questions resolve as a structured ASK_TIMEOUT instead of hanging the turn forever.
- [Huang-zhishi/dsh-plugin-call-trace](https://github.com/Huang-zhishi/dsh-plugin-call-trace) - Persistent model tool-call trace recorder: every tool call is durably written to a JSONL file that survives restarts, queryable via a structured call_trace tool and a callTraceHistory service, with size rotation and an optional floating canvas UI add-on.
- [ShiXiangYu2/dsh-translate-pro](https://github.com/ShiXiangYu2/dsh-translate-pro) - Professional translation for DSH: 18 target languages, 4 styles (formal/casual/technical/literal), glossary-controlled terminology, and whole-file translation (README/docs/subtitles) with Markdown/code-block format preservation; powered by DeepSeek via SiliconFlow.
- [anweat/dsh-web-search-pro](https://github.com/anweat/dsh-web-search-pro) - Persistent enhanced web search: multi-engine routing (DeepSeek/Exa/DDG/Bing/Jina + GitHub/Bilibili/YouTube/V2EX/Xiaohongshu/Twitter/Reddit/RSS), SQLite+LRU cache, userscript-style extraction, Playwright rendering.
- [anweat/dsh-browser](https://github.com/anweat/dsh-browser) - Self-contained browser runtime: Playwright (chromium) + OpenCLI as plugin-local dependencies (global reuse fallback), exposes a `browser` service and 9 interactive browser tools.
- [anweat/dsh-voice-webspeech](https://github.com/anweat/dsh-voice-webspeech) - Browser Web Speech API voice input: zero server, zero keys, zero model downloads (Edge=Azure, Chrome=Google speech).
- [MicroHEROX/dsh-Kimi-WebBridge](https://github.com/MicroHEROX/dsh-Kimi-WebBridge) - Drive the user's real browser through the local Kimi WebBridge daemon: navigate, find-tab, snapshot, click, fill, evaluate, CDP, screenshot, network, upload, PDF export and tab-management tools that reuse existing login sessions.
- [MicroHEROX/dsh-exa-mcp](https://github.com/MicroHEROX/dsh-exa-mcp) - Mounts the hosted Exa search MCP endpoint (https://mcp.exa.ai/mcp) through the in-box @deepseek-ai/dsh-mcp-client bridge: web_search_exa and web_fetch_exa tools, anonymous on the free tier or with your own EXA_API_KEY.
- [MicroHEROX/dsh-koboldcpp-hands](https://github.com/MicroHEROX/dsh-koboldcpp-hands) - Hands repetitive text and vision labor (OCR, image analysis, comparison) to a local KoboldCpp (llama.cpp) server through koboldcpp_run and koboldcpp_vision tools, with on-demand server lifecycle management.
- [MicroHEROX/dsh-unsloth-hands](https://github.com/MicroHEROX/dsh-unsloth-hands) - Hands repetitive text and vision labor (OCR, image analysis, comparison) to a locally running Unsloth Desktop (Unsloth Studio) server through unsloth_run and unsloth_vision tools; pure HTTP client, never spawns or owns processes.
- [pengxuding/dsh-plugin-judge](https://github.com/pengxuding/dsh-plugin-judge) - Plugin value auditor: pre-install review (source scan + LLM judge) and post-install audit of installed bundles, with model-switch re-audit reminders.
- [gloryxpnv/dsh-tool-vision](https://github.com/gloryxpnv/dsh-tool-vision) - Local-first structured vision for text-only agents: images go to a local OpenAI-compatible VLM and come back as JSON evidence (summary, verbatim OCR, layout regions, entities/relations, colors, explicit uncertainty), with anti-hallucination fallback and an optional paste/upload bridge; zero cloud cost, images never leave the machine.
- [kw78/dsh-office-tools](https://github.com/kw78/dsh-office-tools) - Workspace-safe Office tools for agents: create/read Word, create/read/update Excel, and create/read PowerPoint decks with PNG/JPG/GIF image placement.

- [YZz-S/dsh-bili-summary](https://github.com/YZz-S/dsh-bili-summary) - Provides the bili_summary tool: Bilibili video metadata, subtitle timeline, and sharp-based frame capture with built-in error handling and graceful degradation.
- [Vncntvx/dsh-zotero](https://github.com/Vncntvx/dsh-zotero) - Let agents search, read, and cite your local Zotero library: find papers, view notes and annotations, pull evidence by question, open the source document, and generate citations.
- [superdesigndev/treg](https://github.com/superdesigndev/treg) - Tool catalog for agents: search ~2,600 external endpoints (SEO and SERP, backlinks, social, people and company enrichment, ad libraries, scraping) by the task you want done, read each one's parameters and per-call price, then call it with the credential injected server-side. Ships the skill plus an MCP row that stays disabled until TREG_TOKEN is set.
- [ywgATustcbbs/dsh-human-task](https://github.com/ywgATustcbbs/dsh-human-task) - Human-in-the-loop tools (`human_task` / `human_task_ready_check`): pause the agent until the user performs a real-world action or returns an observation (GUI operation, game testing, visual verification, hardware checks), gated by session consent and an AFK presence check, returning a structured JSON result via a web task dialog.
- [PerryLink/dsh-checkpoint-rewind](https://github.com/PerryLink/dsh-checkpoint-rewind) - Claude Code /rewind for DeepSeek Harness: git-first workspace snapshots before every mutating tool execution, turn-boundary session forks, and a one-shot /rewind command that restores files and forks the session back to a checkpoint.
- [AngelosZou/dsh-multi-folder](https://github.com/AngelosZou/dsh-multi-folder) - Secondary working directories for a DSH project: the agent keeps the primary workspace as cwd and gains equal read/write/exec permissions on configured secondary directories, configurable from the session header and the new-session page.
- [PerryLink/dsh-lsp-actions](https://github.com/PerryLink/dsh-lsp-actions) - LSP action surface for DSH: diagnostics, formatting, completion, code actions, symbols, signature help, inlay hints and rename, all backed by real language servers.
- [wulusai2333/mimo-vision](https://github.com/wulusai2333/mimo-vision) - `describe_image` tool: a vision bridge that sends images to mimo-v2.5 and returns text descriptions for text-only models, with native passthrough and ImageMagick transcoding of SVG/TIFF/HEIC formats.
- [AbnerAI/dsh-monitor](https://github.com/AbnerAI/dsh-monitor) - Persistent background watchers that wake the agent on new messages (file inbox or command-output delta) — the harness analog of Claude Code's Monitor tool.
- [YuanyuanMa03/dsh-funnel](https://github.com/YuanyuanMa03/dsh-funnel) - Ingestion-time tool-output curation: keeps error and warning lines plus head and tail, spills the full text to disk with a pointer the model can read back; covers every text tool, small results pass through untouched.
### Skills
- [YuanyuanMa03/cot-lint](https://github.com/YuanyuanMa03/cot-lint) - Chain-of-thought leakage linter: zero-dependency CLI that finds AI-session residue in docs and comments (dead design citations, PR vantage, change narration, review choreography), shipping the cot-trim fixing skill as the installable bundle.
- [dhicoc/dsh-reverse-skill](https://github.com/dhicoc/dsh-reverse-skill) - Complete reverse-skill pack (85 SKILL.md) as a DeepSeek Harness Cordis plugin: reverse engineering, authorized pentesting and security-research skill router.
- [dhicoc/dsh-wuyun-liuqi](https://github.com/dhicoc/dsh-wuyun-liuqi) - Complete wuyun-liuqi (five-evolutions-six-qi / 五运六气) Traditional Chinese Medicine skill pack as a DeepSeek Harness Cordis plugin: annual and guest-qi calculation, clinical pattern differentiation, and pathogenesis reasoning.
- [creght-dev/skills](https://github.com/creght-dev/skills) - Skills for building websites on the Creght platform: CLI pull/push sync, page and component conventions, CMS, forms, auth, SEO, publishing and version rollback.
- [zhaiyateng/dsh-design-skills](https://github.com/zhaiyateng/dsh-design-skills) - Design-aesthetics skill pack (10 styles: dark SaaS, minimal white, neumorphism, brutalism, glassmorphism, Japanese minimal, bento grid, cyberpunk, vaporwave, art deco) with runnable landing-page demos: tokens, component rules, forbidden lists, and acceptance checklists per style.

- [YTxue/dsh-skill-manager-ytxue](https://github.com/YTxue/dsh-skill-manager-ytxue) - Skill pool manager in the Settings sidebar: enable/disable, folder batch import with rename-conflict prompts, state-driven one-click DSH-spec check & auto-fix, system/project scope labels.
- [lunw/shopline-ai-toolkit-dsh](https://github.com/lunw/shopline-ai-toolkit-dsh) - SHOPLINE AI Toolkit: bridges the official SHOPLINE Developer MCP server and ships seven SHOPLINE agent skills (Admin REST, GraphQL, OAuth, webhooks, Sline) — the SHOPLINE counterpart of the Shopify AI Toolkit.
- [jeremy9682/dsh-skill-pack](https://github.com/jeremy9682/dsh-skill-pack) - 11 shareable workflow skills (handoff, triage, to-spec, to-tickets, wayfinder, teach, wait-what, dsh-mode-routing, ask-matt, overnight-execution, full-throttle) as an installable skill pack.
- [Cavan-Ou/hermes-dsh-collab](https://github.com/Cavan-Ou/hermes-dsh-collab) - Hook DeepSeek Harness into a Hermes pipeline: dispatch-spec template, model-tier routing, orchestrator-run quality gates, git single-writer rule, as a SKILL.md pack (bundle installable).
- [linxichen/dsh-rigorquant](https://github.com/linxichen/dsh-rigorquant) - RigorQuant preset + skill pack: unattended walled multi-agent research for empirical and computational mathematics (economics, finance, portfolio), with a four-part pre-implementation check battery and a jacobian/Lean escalation lane.
- [PAKIKNOWLEDGE/dsh-notify-skill](https://github.com/PAKIKNOWLEDGE/dsh-notify-skill) - Email reminders from your DSH agent when you're away: fires at goal completion, blockage, before asking the user a decision, and at long-task milestones via a bundled zero-dependency Node SMTP sender.
- [GanyuanRan/Aegis](https://github.com/GanyuanRan/Aegis) - Software-engineering method pack for coding agents, with skills for baseline-first planning, systematic debugging, prompt hygiene, verification before completion, and repair/retirement tracking.
- [superdesigndev/superdesign-skill](https://github.com/superdesigndev/superdesign-skill) - Design skill for UI and marketing graphics on the Superdesign canvas: reads the repo for context, extracts its design system, then generates and iterates branchable design drafts, flow pages, and reusable components through the Superdesign CLI.
- [xsoc1/math-research-dsh](https://github.com/xsoc1/math-research-dsh) - Rigorous open mathematics research suite: four agent skills (rigorous-open-math-research, manage-math-research-program, math-research-workflow, lean-verify) for theorem solving with adversarial audit, research program management, pipeline orchestration, and Lean 4 formalization audit; CI-verified tests and mechanical upstream sync.
- [PerryLink/dsh-plugin-guide](https://github.com/PerryLink/dsh-plugin-guide) - The DSH plugin-development knowledge base as an on-demand agent skill: official constraints, task workflows, API reference and community gotchas, installed with the bundle so the agent can look things up while building a plugin.
- [Chu-Xin-r/wanjiaqi-meme](https://github.com/Chu-Xin-r/wanjiaqi-meme) - Barrage-meme skill distilled from 22,771 real messages in the 6657 live room: wanjiaqi-style banter, CS and DOTA cross-memes, player roasting and casting commentary.
### Workflow & Automation

- [ztl34245881-commits/dsh-task-planner](https://github.com/ztl34245881-commits/dsh-task-planner) - Task planning with experience muscle-memory: condition-reflex recall of past solutions, LLM capability matching, and auto-persisted lessons.
- [icetomoyo/dsh_workflow](https://github.com/icetomoyo/dsh_workflow) - UltraCode-style multi-agent orchestration: a generatable, savable, governable, observable, resumable workflow layer.
- [KanoNoUta/dsh-captain](https://github.com/KanoNoUta/dsh-captain) - GPT plans dependency DAGs, DeepSeek workers execute tasks with adaptive parallelism, and an optional GPT reviewer audits incremental Git diffs and drives repair rounds.
- [NanmiCoder/dsh-agent-teams](https://github.com/NanmiCoder/dsh-agent-teams) - AgentTeams multi-agent teams.
- [toolclub/agent_team_gui](https://github.com/toolclub/agent_team_gui) - Reusable agent squads with per-agent provider/model routes and tool policies, serial/parallel dispatch, spawn/fork/chain context modes, and a Web management panel.
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
- [PerryLink/dsh-doublecheck](https://github.com/PerryLink/dsh-doublecheck) - Engineering-discipline guard: requirements grill before the first edit, red/green test-evidence gates, forked adversary review, and a delivery report with a per-dimension verification workflow.
- [btspoony/mstar-harness](https://github.com/btspoony/mstar-harness) - Skill-driven harness/loop engineering workflow agent plugin.
- [LeslieWylie/dsh-ops-kit](https://github.com/LeslieWylie/dsh-ops-kit) - Evidence-first operating kit: six read-only tools (capability catalog, staged workflow plans, packaged skill reader, bounded local memory search, repository release audit, release checklist) and five packaged skills - plans and audits, never remote writes.
- [Letter2025/dsh-approval-llm](https://github.com/Letter2025/dsh-approval-llm) - Model-based permission approval: an approval-request answerer backed by a separate reviewer model.
- [simon300000/dsh-auto](https://github.com/simon300000/dsh-auto) - Adds an Auto Approve permission preset to the Web UI, using a fresh restricted Reviewer Agent to allow or deny each approval request.
- [Jiao-XXX/dsh-auto-approve](https://github.com/Jiao-XXX/dsh-auto-approve) - Adds an `auto` permission preset between workspace-write and danger-full-access: a classifier grants routine sandbox escalations once, while dangerous or uncertain requests still go to a human.
- [Letter2025/dsh-model-failover](https://github.com/Letter2025/dsh-model-failover) - Two-level model circuit breaker with failover: trip a model or a whole provider after repeated request failures and route the next request to a configured fallback.
- [whyihaveyou/dsh-suite#plugin-team-board](https://github.com/whyihaveyou/dsh-suite/tree/main/packages/plugins/plugin-team-board) - Shared multi-agent task board (create/claim/transition/query) over a Cordis service key.
- [Karbo123/DSH-EvoResearch#evoresearch-plugin](https://github.com/Karbo123/DSH-EvoResearch/tree/main/packages/evoresearch-plugin) - Research agent suite: long-horizon goal control with auditable evidence chains, cron scheduling, multi-agent expert teams, self-evolving research memory (FTS5 + RRF recall), project workspaces, and a custom workspace UI.
- [february2015/dsh-taskswarm](https://github.com/february2015/dsh-taskswarm) - DSH port of TaskPlane: dependency-ordered waves run in parallel git-worktree lanes, with task packets, cross-model review, and crash recovery.

- [truelove-dreamer/dsh-plugin-hooks](https://github.com/truelove-dreamer/dsh-plugin-hooks) - Claude-Code-style lifecycle hooks: configured shell commands run before/after model tool calls with a JSON payload on stdin; a non-zero pre-tool exit blocks the call.
- [severin-ye/uagent-sync#packages/dsh](https://github.com/severin-ye/uagent-sync/tree/master/packages/dsh) - Cross-device workspace backup, restore, and ecosystem update via the uagent-sync CLI.
- [Noelune/dsh-agent-relay](https://github.com/Noelune/dsh-agent-relay) - Loopback-first multi-agent message relay: HMAC-authenticated broker plus dsh plugin (relay_send/recv/peers/history), zero-dependency CLI and Python clients, wire protocol v1.0.
- [Ceelog/dsh-plugins#dsh-plugin-scheduled-tasks](https://github.com/Ceelog/dsh-plugins/tree/main/src/plugins/dsh-plugin-scheduled-tasks) - Per-project scheduled prompts run as fresh headless agent sessions, with one-time, interval, and cron schedules plus durable run history.
- [yangyongzhen/dsh-scheduler](https://github.com/yangyongzhen/dsh-scheduler) - Cron/one-shot scheduled tasks: run shell commands or fire webhooks on a schedule, with optional ServerChan/DingTalk/Feishu/webhook delivery of results.
- [yangyongzhen/dsh-git-workflow](https://github.com/yangyongzhen/dsh-git-workflow) - Conventional-commit enforcement, changelog generation, PR summaries and branch pushes through the plain git CLI.
- [yangyongzhen/dsh-article-publish](https://github.com/yangyongzhen/dsh-article-publish) - Publish articles to CSDN / Juejin / CNBlog directly from the session, no external server.
- [lucas-ward/dsh-ci-context](https://github.com/lucas-ward/dsh-ci-context) - Injects allowlisted GitHub Actions and GitLab CI run metadata into agent context without reading logs, credentials, or provider APIs.
- [ljsysfurryACE/dsh-aura-scheduler](https://github.com/ljsysfurryACE/dsh-aura-scheduler) - Proactive scheduling: an adaptive heartbeat plus a value network (urgency, relevance, interruption cost) decides when the agent should speak unprompted.
- [toolclub/dsh-agent-team-gui](https://github.com/toolclub/dsh-agent-team-gui) - Global persistent agent squads with per-agent model/tool policies: manage them in Settings, select and toggle one per conversation, then collaborate on normal sends in a fixed or model-planned order.
- [ChongCyrus/Vibe-Mathematics](https://github.com/ChongCyrus/Vibe-Mathematics) - Multi-agent math problem-solving & verification framework: brainstorm → solver iteration → multi-verifier debate → Verified knowledge base, with checkpoint resume and manual/auto intervention (also ships as an agent preset).
- [Jungod1121/dsh-anchored-standard](https://github.com/Jungod1121/dsh-anchored-standard) - Two-phase agent preset for DeepSeek V4 Pro: the first request sees only bash+read (Minimal-aligned bootstrap), then the full Standard tool catalog after the first tool call or reply; ships as an installer bundle plus a manual preset directory.
- [cloader/dsh-taskboard](https://github.com/cloader/dsh-taskboard) - Task board for DSH: create tasks with project and model assignment, run them manually or on cron schedules; new sessions in a project automatically pick up its todo tasks and move them to in-review when done.
- [PerryLink/dsh-auto-review](https://github.com/PerryLink/dsh-auto-review) - Second-model auto-review on the approval answerer chain: a read-only reviewer subagent returns structured allow/deny verdicts with reasons, fail-closed by default.

### Notifications & Integrations

- [radres/dsh-plugin-call-me](https://github.com/radres/dsh-plugin-call-me) - Rings your phone over CallKit: `call_me` and `text_me` tools, plus optional turn-end and approval calls whose spoken answer is transcribed back into the session.
- [omdsh-dev/dsh-open-in-vscode](https://github.com/omdsh-dev/dsh-open-in-vscode) - Open DSH workspace directories in VS Code directly from the web GUI.
- [ChuanTianML/dsh-open-with](https://github.com/ChuanTianML/dsh-open-with) - Open registered workspaces from the Web UI in a detected or configured local editor, terminal, or file manager, with a remembered per-browser preference.
- [omdsh-dev/dsh-notification](https://github.com/omdsh-dev/dsh-notification) - Desktop notifications for turn completions, with per-outcome controls and keyword rules.
- [bobleer/dsh-acp-for-bitfun](https://github.com/bobleer/dsh-acp-for-bitfun) - ACP bridge between BitFun and DSH.
- [openma-ai/deepseek-harness-acp](https://github.com/openma-ai/deepseek-harness-acp) - ACP profile plugin and standalone stdio server for using the full DSH agent from Zed and other ACP clients while sharing DSH credentials and sessions.
- [LoserFox/telegram](https://github.com/LoserFox/telegram) - Bridge to the Telegram Bot API: long polling, per-chat sessions, HTML formatting.
- [luzhengyangtx/dsh-telegram-duty](https://github.com/luzhengyangtx/dsh-telegram-duty) - Telegram duty gateway: phone-message task loop on a dedicated duty session, global approval forwarding with inline approve/reject buttons, telegram_ask choice questions, duty/local toggle with a web duty banner, zh/en messages, zero idle tokens.
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
- [itr-del/dsh-feishu](https://github.com/itr-del/dsh-feishu) - Feishu (Lark) IM bridge for DeepSeek Harness via `dsh plugin add`; one DM user to one persistent dsh session, with full debugging docs.
- [wz-heng/dsh-feishu-bridge](https://github.com/wz-heng/dsh-feishu-bridge) - Fail-closed Feishu (Lark) channel bridge: chat with a bot, get dsh agent turns back. Official-Python-SDK-only integration (exact-pinned); deny-by-default allowlist, webhook signature/timestamp/replay verification, per-chat sticky sessions; bilingual docs.
- [huguangyu666/dsh-plugin-notify](https://github.com/huguangyu666/dsh-plugin-notify) - Notification outbox: agent proactively notifies via toast / Chinese TTS voice / sound effects (explosion, victory, alarm), 60s confirmation window voice-calls you back, volume boost, settings panel.
- [xmanrui/dsh-weixin](https://github.com/xmanrui/dsh-weixin) - Connect a Weixin bot to DeepSeek Harness by scanning a QR code.
- [xmanrui/dsh-im](https://github.com/xmanrui/dsh-im) - Connect IM bots to DeepSeek Harness by scanning QR codes (supports Feishu, Weixin, DingTalk, and more).
- [THEWOLFWALKER/dsh-notifier](https://github.com/THEWOLFWALKER/dsh-notifier) - Unified notification for DSH: one minimal notify() API across 25+ channels (Telegram / DingTalk / Feishu / WeCom / QQ bot / WxPusher / PushPlus / ServerChan / Bark / Discord / Slack / ntfy / webhook), a routing matrix (timeSensitive / active / passive) with tiered retry, and multi-channel inbound approval — approve agent requests from Telegram, Feishu interactive cards, QQ, WxPusher or WeChat (iLink). Auto session-event push on turn-end, approval and error, plus an agent-callable notify tool; zero runtime deps.
- [zhengjy01/dsh-notify](https://github.com/zhengjy01/dsh-notify) - System-level desktop notifications: turn-completion and workflow-end banners, plus a modal alert when an approval is needed (macOS osascript / Linux notify-send).
- [ThreeBody6666/dsh-im-hub](https://github.com/ThreeBody6666/dsh-im-hub) - Multi-platform IM gateway for DSH: Feishu (Lark) WebSocket long connection (no public URL), WeCom AES-encrypted callbacks, and Telegram long polling — per-chat agent sessions, whitelist access, and a visual settings card in the web GUI.
- [yangyongzhen/dsh-notify](https://github.com/yangyongzhen/dsh-notify) - Task-completion notifications via ServerChan / DingTalk / Feishu / generic webhooks.
- [amlyczz/dsh-lark-link](https://github.com/amlyczz/dsh-lark-link) - High-reliability Feishu/Lark bridge for DeepSeek Harness: QR one-click auth, card-based commands and intent-confirmation cards, at-least-once zero-loss outbox, media in/out, /doctor session-log ZIP, and a reusable DSH Web GUI that lands sessions in the right workspace.

- [YZz-S/dsh-notifier](https://github.com/YZz-S/dsh-notifier) - System-native notifications when a task finishes or needs your confirmation: Windows toast, macOS osascript, and Linux notify-send.
### Development & Runtime

- [BotonJ/dsh-plugin-sentinel](https://github.com/BotonJ/dsh-plugin-sentinel) - Static pre-install security auditor for plugin bundles: lifecycle scripts, dynamic execution, credential-exfiltration combos, and patch-layer hazards, with zero dependencies and in-memory tar parsing.
- [BotonJ/dsh-windtunnel](https://github.com/BotonJ/dsh-windtunnel) - Contract regression harness for plugin authors: a scripted LLM adapter drives the real pipeline in isolated child processes with session-event assertions (load/contract/behavior/fault layers); zero API key, CI-ready.
- [BotonJ/dsh-remote-link](https://github.com/BotonJ/dsh-remote-link) - Secure remote access for the official Web UI: authenticated LAN/tunnel gateway with QR + HMAC one-time pairing, per-device sessions and revocation, mDNS discovery, and a fork_session tool.
- [Starfie1d1272/dsh-builtin-toggles](https://github.com/Starfie1d1272/dsh-builtin-toggles) - Evidence-backed inspector for DSH Web built-in capabilities: runtime/config provenance, compatibility and drift diagnostics, plus fail-closed controls for nine reviewed UI leaves.
- [SaiSenBox/dsh-boot-guard](https://github.com/SaiSenBox/dsh-boot-guard) - Loader-independent startup recovery for DSH Web that detects likely broken plugins, temporarily skips them, and restores only Boot Guard-managed changes.
- [leechen298/Code2Skill](https://github.com/leechen298/Code2Skill) - Generate Functions, MCP tools, workflow Skills, and offline test packages from user-authorized source code.
- [bujue600-arch/dsh-testgen](https://github.com/bujue600-arch/dsh-testgen) - Automated unit-test generation: a /testgen command and generate_tests tool that scaffold, run, and fix tests until they pass (LLM + offline template generators; vitest/jest/mocha/node:test).
- [omdsh-dev/fabric](https://github.com/omdsh-dev/fabric) - An MC-Fabric-style hook processor.
- [CH4ACKO3/dsh-harmony](https://github.com/CH4ACKO3/dsh-harmony) - Modifies DSH plugin code at runtime, with ordered patches, inspection, and hot reload.
- [LoserFox/dsh-git-identity](https://github.com/LoserFox/dsh-git-identity) - Pin Git commits to the environment's own author identity; env-var injection overrides all `git config` settings.
- [Zhenyu98/dsh-context-doctor](https://github.com/Zhenyu98/dsh-context-doctor) - Context injection audit: token costs of instruction chains / skill catalogs / tool schemas, duplicate and conflict detection.
- [lucky8197/dsh-doc-guard](https://github.com/lucky8197/dsh-doc-guard) - Document-code consistency guard: audits version headers / changelog tables / directory trees / module & test counts / cross-doc references for drift, with severity-sorted, read-only fix suggestions.
- [labmimors/dsh-mcp-lens](https://github.com/labmimors/dsh-mcp-lens) - Progressive-disclosure MCP gateway that searches large remote catalogs through `mcp_search`, then invokes exact schemas through `mcp_call` with lazy connections and bounded caches.
- [ICCuse/dsh-pain-point-check](https://github.com/ICCuse/dsh-pain-point-check) - Enforced pain-point gate: after two non-converged experiments it injects the three questions, denies non-investigative tool calls until answered, and blocks same-direction retries.
- [omdsh-dev/dsh-plugin-check](https://github.com/omdsh-dev/dsh-plugin-check) - Plugin health checks: manifest protocol / patch format / build traps, zero-dependency and read-only.
- [omdsh-dev/dsh-security-audit](https://github.com/omdsh-dev/dsh-security-audit) - Local security audit: config, plugin origins, sessions, network exposure — read-only redacted risk report.
- [omdsh-dev/dsh-session-health](https://github.com/omdsh-dev/dsh-session-health) - Frame-level scan diagnostics for session files (torn/corrupt/empty detection).
- [william-jin-cmu/dsh-evolve](https://github.com/william-jin-cmu/dsh-evolve) - Self-evolution: the agent hot-mounts/removes persistent plugins on itself mid-session.
- [vibeinging/dsh-trace](https://github.com/vibeinging/dsh-trace) - Telemetry backend exporting turns, model steps, and tool calls to yiTrace.
- [xxiaoxiong/dsh-prometheus](https://github.com/xxiaoxiong/dsh-prometheus) - Exposes bounded Prometheus metrics for DSH sessions, agents, LLM calls, tools, approvals, subagents, and jobs, with a Grafana dashboard and a loopback-only endpoint by default.
- [030611/dsh-telemetry-redactor](https://github.com/030611/dsh-telemetry-redactor) - Redacts supported secret patterns from the `session-telemetry/record` export copy before configured telemetry backends receive it.
- [030611/dsh-verification-receipt](https://github.com/030611/dsh-verification-receipt) - Writes local JSONL summaries of per-turn tool counts and coarse verification signals without storing prompts, tool arguments, or result text.
- [030611/qiushi-dsh-evidence-audit](https://github.com/030611/qiushi-dsh-evidence-audit) - Appends local hash-chained JSONL receipts for tool results and session events without storing prompts, tool arguments, result text, or raw session IDs.
- [omdsh-dev/sandbox-micro](https://github.com/omdsh-dev/sandbox-micro) - Support for the microsandbox backend.
- [omdsh-dev/sandbox-mxc](https://github.com/omdsh-dev/sandbox-mxc) - Microsoft cross-platform sandbox support.
- [omdsh-dev/sandbox-nono](https://github.com/omdsh-dev/sandbox-nono) - Support for the nono sandbox backend.
- [vibeinging/dsh-agent-budget](https://github.com/vibeinging/dsh-agent-budget) - Agent-tree token budget management.
- [Jesse-njx/dsh-polyglot](https://github.com/Jesse-njx/dsh-polyglot) - The model switch for DSH: point it at any OpenAI-compatible endpoint, with curated free/cheap DeepSeek provider presets and automatic fallback when a free tier rate-limits you.
- [sjh9714/dsh-movein-permissions](https://github.com/sjh9714/dsh-movein/tree/main/plugin) - Fine grained per tool permission rules for DSH at the tools/pre-execute gate, deny and ask lists in Claude Code rule syntax (Bash(rm -rf:*), Read(*secrets*), mcp__server__tool), works standalone without migrating.
- [ilharp/dsh-tool-approval](https://github.com/ilharp/dsh-tool-approval) - Manual approval mode ("Manual Mode" / "Ask Mode").
- [arrow949/dsh-turn-approval](https://github.com/arrow949/dsh-turn-approval) - Turn-scoped “Allow for this task” approvals: automatically allow matching `danger-full-access` escalations only for the current task, then expire.
- [omdsh-dev/plugin-template](https://github.com/omdsh-dev/plugin-template) - Plugin template repo (based on the official turtle-ui repo).
- [Small-tailqwq/dsh-tps](https://github.com/Small-tailqwq/dsh-tps) - A TPS metrics plugin.
- [disyli/dsh-tool-call-stats](https://github.com/disyli/dsh-tool-call-stats) - Per-process tool-call statistics: a `tool_stats` tool reporting per-tool call counts, error counts, and average durations.
- [Areium/dsh-fail-logger](https://github.com/Areium/dsh-fail-logger) - Auto-log failed tool calls across native tools, PTC run_code, and inline invocations: dedup and count root causes into a skill so repeated mistakes fade.
- [Cavan-Ou/dsh-observation-journal](https://github.com/Cavan-Ou/dsh-observation-journal) - Zero-touch runtime telemetry for DSH: every session auto-writes task, model tier, tools, failures, duration, status into a human-readable journal with a stats section (pure observer — no tools, no LLM calls, no injection).
- [BiBoyang/dsh-eval-harness](https://github.com/BiBoyang/dsh-eval-harness) - Evaluation harness for DSH plugins: YAML cases drive real headless agent runs, assert on tool calls, args, results and token usage, with a baseline gate for CI regression.
- [hust-open-atom-club/oh-dsh](https://github.com/hust-open-atom-club/oh-dsh) - Community distribution: TUI, desktop, and Web UI as one bundle with layered installation.
- [BrambleXu/dsh-annotate](https://github.com/BrambleXu/dsh-annotate) - Select browser elements directly during Vibe Coding and send structured visual feedback to the DeepSeek Harness Agent.
- [BrambleXu/dsh-prompt-profile](https://github.com/BrambleXu/dsh-prompt-profile) - Reusable Markdown prompt profiles for DeepSeek Harness with per-turn model selection, argument substitution, and state restoration.
- [BrambleXu/dsh-revdiff](https://github.com/BrambleXu/dsh-revdiff) - Native interactive Git diff review for DeepSeek Harness with structured annotations sent back to the current Agent session.
- [lonelymoon87/dsh-gitflow](https://github.com/lonelymoon87/dsh-gitflow) - Adds approval-gated Git status, diff, log, commit, branch, and optional checkpoint tools.
- [lonelymoon87/dsh-guardian](https://github.com/lonelymoon87/dsh-guardian) - Adds dangerous-operation policy checks, output redaction, and a security-review workflow.
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
- [wikkd/dsh-remote-access-web#remote-access-web](https://github.com/wikkd/dsh-remote-access-web/tree/main/packages/bundle/remote-access-web) - Reverse tunnel for the DSH Web GUI: exposes a `dsh --profile web` deployment at a public frp URL and switches the directory picker to the in-app browser, so a phone or remote machine can open and manage the workspace.
- [lsz-asd/dsh-chameleon#bundle](https://github.com/lsz-asd/dsh-chameleon/tree/main/bundle) - Self-editing desktop workbench for DeepSeek Harness: a full dsh web replica with an edit mode in which the agent modifies the workbench (patch layers, plugins, UI) with hot reload.
- [jiayan-xu/dsh-ocr-review](https://github.com/jiayan-xu/dsh-ocr-review) - Local AI code-review gate: review a workspace/branch/commit diff via the managed ocr.js, returning structured findings with token stats; gate mode fails on findings.

- [tianyaZTY/dsh-hot-plugin-host](https://github.com/tianyaZTY/dsh-hot-plugin-host) - Runtime plugin loading for the Web UI: a watched hot directory installs/updates client-plugin bundles live on every open page, no restart. Includes a right-column subagent dashboard example.
- [moonquake2004/dsh-doctor#plugin](https://github.com/moonquake2004/dsh-doctor/tree/main/plugin) - Offline diagnostic for DSH: 19 checks across env, profile, and session state, with a settings "Doctor" panel and a read-only JSON API.

- [x2802490130-prog/dsh-guard](https://github.com/x2802490130-prog/dsh-guard) - A development safety kit: rolling config snapshots, automatic rollback on plugin failures, boot-failure rescue, and an in-settings management panel.
- [x2802490130-prog/dsh-shield](https://github.com/x2802490130-prog/dsh-shield) - A hands-off safety net: directories the agent deletes go to a trash folder first and symlinks are never followed, with zero approvals.
- [strukto-ai/mirage#dsh](https://github.com/strukto-ai/mirage/tree/main/typescript/packages/dsh) - Swaps the filesystem and bash providers for a mirage virtual workspace: file tools and shell commands run over mounted resources (RAM, S3, Redis, Slack, Gmail, Notion, Postgres) instead of the host disk, with per-mount read/write/exec modes, per-command sandbox routing (monty, pyodide, quickjs in process; docker, e2b, daytona remote), and installed CLIs (git, gh, slack, linear, ntn, gws, or one you register) as head words in the virtual terminal.
- [truelove-dreamer/dsh-plugin-vetting](https://github.com/truelove-dreamer/dsh-plugin-vetting) - Vets third-party plugins before you trust them: static scan for malicious patterns (exfiltration, credential access, obfuscation, persistence) and over-privileged path use, transitive-dependency coverage, official-package hash baseline for supply-chain tamper detection, and an optional plugin-tool call gate.
- [anweat/dsh-restart](https://github.com/anweat/dsh-restart) - Restart DSH: configurable restart method (Node native / legacy PowerShell), post-restart continue prompt, optional watchdog auto-relaunch.
- [keyiadiannao/dsh-restart-button](https://github.com/keyiadiannao/dsh-restart-button) - A small self-contained power control for DSH: sidebar power button with an upward restart/shutdown menu and a Windows-shutdown-style overlay. Own restart & shutdown engine (no dependency on other plugins), dynamic-port aware.
- [sjh9714/dsh-movein](https://github.com/sjh9714/dsh-movein) - Move a whole Claude Code setup into DSH. Skills, MCP servers, hooks, subagents and permission rules, with a dry-run moving estimate and a migration diff report; installs as a plugin exposing a movein_from_claude_code tool so the agent can do the move for you.
- [swaylq/dsh-genie](https://github.com/swaylq/dsh-genie) - Keeps what the agent builds at runtime: turns a `cordis_define` dynamic package into a real installed plugin that survives restart, writing the bundle and registering the profile layer with no pnpm, no network, and no build authorization.

- [YZz-S/dsh-update-checker](https://github.com/YZz-S/dsh-update-checker) - Conversation header badge showing the DeepSeek Harness version, checking npm for the latest release and prompting upgrades.
- [jorinyang/dsh-clawshell](https://github.com/jorinyang/dsh-clawshell) - Self-healing runtime layer: a resource control loop with strategy switching and repair escalation, error-storm and fiber-failure insight, cross-session knowledge carry-over, a self-healing dashboard and 7 tools.
- [jorinyang/dsh-doctor](https://github.com/jorinyang/dsh-doctor) - DSH environment diagnosis, graded repair with one-click rollback, and a runtime self-healing service.
- [ljsysfurryACE/dsh-agentframe-suite](https://github.com/ljsysfurryACE/dsh-agentframe-suite) - One-command bundle of the three AgentFrame plugins: memory-director, compaction, and aura-scheduler together.
- [lucky8197/dsh-code-smell](https://github.com/lucky8197/dsh-code-smell) - Code smell radar: statically scans TODO/FIXME debt, stub implementations, long lines, oversized files and duplicated blocks, with severity-sorted read-only fix suggestions.
- [a179-sanae/dsh-code-check](https://github.com/a179-sanae/dsh-code-check) - Automatic type-check diagnostics: after the model edits or creates TS files, runs `tsc --noEmit` in the background (debounced per project) and reports errors via the `code_check` tool — grouped by file with line/column, severity and TS error codes, closing the "edit → check → fix" loop.
- [lucky8197/dsh-git-hygiene](https://github.com/lucky8197/dsh-git-hygiene) - Git hygiene checker: read-only scan of merged and stale branches, oversized tracked files, untracked files and uncommitted work, with cleanup suggestions (it never deletes anything).
- [lucky8197/dsh-weekly-digest](https://github.com/lucky8197/dsh-weekly-digest) - Weekly digest generator: aggregates git commits, DSH session activity and daily memory entries into a Markdown weekly report, read-only.
- [PerryLink/dsh-output-styles](https://github.com/PerryLink/dsh-output-styles) - Runtime-switchable model output styles with Claude Code outputStyles parity: a /style command, per-session persistence over the output_style domain, systemPrompt injection, six built-in styles, custom Markdown/JSON libraries, and a web picker.
- [PerryLink/dsh-permission-rules](https://github.com/PerryLink/dsh-permission-rules) - Claude Code-style declarative permission rules: ordered allow/deny/ask YAML rules matching tool names, arguments, workspace paths, and agent identity on the tools/pre-execute waterfall, with full session-log audit, dry-run mode, and hot reload.
- [HuiHuitie-zhu/dsh-check-update](https://github.com/HuiHuitie-zhu/dsh-check-update) - Update checker (npm edition): a settings page comparing local and latest versions of @deepseek-ai/dsh and every installed plugin, with a red-dot nav reminder and ready-made update commands.
- [izz-BLUE/dsh-devtools](https://github.com/izz-BLUE/dsh-devtools) - Metadata-first runtime profiler for DSH agents: turn/step traces, model and tool wall-time timelines, provider usage, retries, errors, and live or historical sessions.
- [PAKIKNOWLEDGE/dsh-auto-classifier](https://github.com/PAKIKNOWLEDGE/dsh-auto-classifier) - Autonomous permission classifier for the auto preset: tool-scoped allow/deny rules, an LLM semantic judge, and git checkpointing for unattended sessions.
- [fuyue521/dsh-desktop-shortcut](https://github.com/fuyue521/dsh-desktop-shortcut) - Windows desktop shortcut for dsh web: launches the server, auto-opens the browser when ready, and stops the service when the Harness window closes.
- [sjh9714/dsh-win32](https://github.com/sjh9714/dsh-win32) - Makes Minimal mode work on Windows: supplies the missing win32 process inspector so the persistent Git Bash shell runs, plus a faithful minimal-windows preset and an install-trap doctor (koffi crashes, PS 5.1 fallback, localhost 403).
### Plugin Markets & Managers

- [dsh-market/dsh-market](https://github.com/dsh-market/dsh-market) - (Recommended) The plugin market inside DSH: a Settings page to browse and search the full community catalog by category, with confirmed one-click installs and an installed-plugins view.
- [zoahdev/dsh-subscribe#plugin](https://github.com/zoahdev/dsh-subscribe/tree/main/plugin) - Steam-style plugin storefront: a plugin registry browsable inside DSH with one-click install, uninstall and update, plus a zero-dependency CLI and agent-callable market tools.
- [Sanqi-normal/dsh-webui-market-plugin](https://github.com/Sanqi-normal/dsh-webui-market-plugin) - In-harness plugin market for the dsh web GUI: browse the awesome-dsh-plugin.com catalog and install/uninstall plugins into a profile from Settings → Plugins → Plugin Market.
- [whyihaveyou/dsh-suite#plugin-manager](https://github.com/whyihaveyou/dsh-suite/tree/main/packages/plugins/plugin-manager) - In-app plugin store for the DSH Web UI: browse, search, one-click install, compat badges.
- [loguhan/dsh-workshop](https://github.com/loguhan/dsh-workshop) - Steam Workshop-style plugin store for the DSH Web UI: browse, search, and one-click install community plugins with mirror acceleration, progress UI, security checks, and Chinese descriptions.
- [yyyyukari/dsh-plugin-workshop](https://github.com/yyyyukari/dsh-plugin-workshop) - Steam Workshop-style in-app plugin browser: search, hot/newest/trending (7/30/90-day) sorting, Chinese keyword mapping, bilingual descriptions and README translation, plugin-signature filtering, and one-click install/update.
- [huguangyu666/dsh-store](https://github.com/huguangyu666/dsh-store) - Plugin store: npm authoritative catalog + awesome curated list (550+ plugins, 11 categories), dsh-field quality verification, official `dsh plugin add/remove` one-click install, sidebar + settings entry.
- [Jesse-njx/dsh-plugin-manager](https://github.com/Jesse-njx/dsh-plugin-manager) - The `dsh pm` plugin manager: multi-source search (awesome list + GitHub + npm), install/remove/update per profile, and a doctor audit of manifests, bundle patches, and version drift.
- [icefall7/dsh-plugin-scout](https://github.com/icefall7/dsh-plugin-scout) - Scouts the deepseek-harness repo and every dsh-plugin-tagged repository to discover harnesses related to your goal, then judges each as worth trying, watching, or skipping.
- [Noob-stupid/dsh-plugin-hub](https://github.com/Noob-stupid/dsh-plugin-hub) - A plugin management panel: one-click enable/disable for installed plugins plus a GitHub dsh-plugin marketplace with details and one-click installs.
- [liqichen/dsh-plugin-manager](https://github.com/liqichen/dsh-plugin-manager) - GUI in the DSH settings panel: toggle/delete MCP servers, browse and trash skills, and list built-in plugin packages — hot-applied without restart.
- [buhuikongpan/dsh-pluginmanager](https://github.com/buhuikongpan/dsh-pluginmanager) - Layered plugin manager for DSH web: native plugins grouped read-only by system/WebUI/tools, user extensions with enable/disable, register, uninstall and editable descriptions.
- [cynch18/plugin-switch](https://github.com/cynch18/plugin-switch) - Toggle switches for the plugin inventory: enable/disable any plugin live from Settings → Plugins → Plugin list without restarting, with groups/filters, bulk toggle, undo, and backup.
- [LKMeng2001/dsh-mcp-market](https://github.com/LKMeng2001/dsh-mcp-market) - MCP server marketplace for DSH: browse a curated, npm-verified catalog and install MCP servers into the current profile with one click, live without restart.
- [klarkxy/dsh-plugin-autoevo](https://github.com/klarkxy/dsh-plugin-autoevo) - Resolves local tools and skills first, then searches, reviews and installs a community plugin after a one-time approval.

### Just for Fun

- [Nagi-ovo/dsh-ads](https://github.com/Nagi-ovo/dsh-ads) - Parody ads in 2005-Chinese-web style: sidebar banners, in-chat feeds, corner popups, and a close button whose hit area is smaller than it looks. All fictional.
- [omdsh-dev/dsh-gomoku](https://github.com/omdsh-dev/dsh-gomoku) - Play Gomoku against the AI, or let two AIs battle it out.
- [AnacondaKC/dsh-stock-market](https://github.com/AnacondaKC/dsh-stock-market) - Fixes the bug where your account can't lose money while you code.
- [hellodigua/dsh-emoji](https://github.com/hellodigua/dsh-emoji) - Automatically add emojis to AI replies.
- [lhh010/dsh-minigames](https://github.com/lhh010/dsh-minigames) - Side-panel arcade: 18 offline mini-games to play while the model thinks.
- [jitengfei/dsh-whale-arcade](https://github.com/jitengfei/dsh-whale-arcade) - Floating, browser-local whale arcade with three score games and ocean-themed Gomoku for breaks while waiting on the agent.
- [william-jin-cmu/dsh-stickers](https://github.com/william-jin-cmu/dsh-stickers) - Bidirectional sticker reactions between user and agent.
- [vlln/whale-girl](https://github.com/vlln/whale-girl) - Desktop pet (QQ-pet style): floats in the corner, draggable, feedable, playable.
- [Moeblack/deepseek-manners](https://github.com/Moeblack/deepseek-manners) - Append a thank-you note after every message. Mind your manners.
- [HuanLinOTO/dsh-plugin-d399](https://github.com/HuanLinOTO/dsh-plugin-d399) - Pops up a mini-game menu (wordle, match-3, extensible) while the model generates.
- [omdsh-dev/dsh-auto-chess](https://github.com/omdsh-dev/dsh-auto-chess) - Auto chess: human vs AI, or AI vs AI.
- [AnacondaKC/dsh-douyin](https://github.com/AnacondaKC/dsh-douyin) - Short-video sidebar: native player, series navigation, precise history replay.
- [minybear/DeepSeek-Harness-Pet](https://github.com/minybear/DeepSeek-Harness-Pet) - Codex-style desktop pet: a floating animated sprite in the corner that mirrors the agent's running state (working, waiting, failed, done).
- [yyh-001/dsh-expression](https://github.com/yyh-001/dsh-expression) - Meme search, the fun way: describe the vibe, and the agent finds and sends a real meme that actually fits.
- [PC2005-cloud/dsh-pet#dsh-pet](https://github.com/PC2005-cloud/dsh-pet/tree/main/dsh-pet) - Desktop pet for the DSH Web UI with 25 transparent animations, screen wandering, click reactions and drag, plus a reproducible asset-generation pipeline.
- [xiekai886/dsh-MusicPlayer](https://github.com/xiekai886/dsh-MusicPlayer) - A collapsible/expandable draggable floating music player with NetEase Cloud Music playlist import and song/artist search — chat and listen at the same time.
- [609476965/dsh-LorebookMD](https://github.com/609476965/dsh-LorebookMD) - Import SillyTavern/TavernAI character cards and world books, save them as local Markdown lore documents, and generate novel prose from your prompts with the world settings as reference.
- [Awu12277/dsh-stock-watch](https://github.com/Awu12277/dsh-stock-watch) - A-share watchlist real-time market monitoring plugin: a collapsible popup in the top-right corner of the DeepSeek Harness (DSH) web interface for real-time quote monitoring, group switching, intraday and candlestick (K-line) charts, and buy/sell target price settings.
- [PM25000/dsh-ths-holdings](https://github.com/PM25000/dsh-ths-holdings) - Floating card showing your real position P&L (今日盈亏), Shanghai Composite Index, and intraday chart, auto-synced from the Tonghuashun investment-ledger — no manual watchlist setup.
- [sjh9714/clippy-harness#plugin](https://github.com/sjh9714/clippy-harness/tree/master/plugin) - Clippy is back and this time he can actually help. An office assistant pet that reacts to real agent state, jumps when the turn completes, and opens a classic "illegal operation" dialog when a turn fails.
- [lucky8197/dsh-devquest](https://github.com/lucky8197/dsh-devquest) - Turns coding into an RPG: finished turns, tool calls and completed todos earn XP, with 27+ achievement badges, levels, titles and seasons. Event-driven scoring with a pure-function engine — the work itself is the game.
- [skr311/dsh-codex-pet#dsh-codex-pet](https://github.com/skr311/dsh-codex-pet/tree/main/packages/dsh-codex-pet) - Import Codex-style sprite-sheet pets and render them as a floating shell.overlay with a pet library, interactions, and agent-state linkage.
- [swaylq/dsh-digipet](https://github.com/swaylq/dsh-digipet) - Digimon-style raising game: hatch an egg that feeds on real work (turns, tool calls, errors) and evolves along four branching lines shaped by how you work; zero tokens, invisible to the model.
- [marvin9551/dynamic-schulte-dsh](https://github.com/marvin9551/dynamic-schulte-dsh) - Dynamic Schulte grid waiting-time mini-game: click 1..N in order on a static grid or a spinning roulette wheel while the model thinks.

## Contributing

PRs welcome — add one line under the matching category in both `README.md` and `README.zh.md`: `- [name](link) — one-line description`.

Themes & skins: entries under **Themes & Appearance** power the Themes tab in `dsh-market` — one-click install/switch for users. See [contributing](contributing.md) for details.

Please also add the [`dsh-plugin`](https://github.com/topics/dsh-plugin) topic to your repo so others can discover it.

## Badge

Listed here? Show it off:

![Awesome DSH Plugin](https://awesome-dsh-plugin.com/badge.svg)

```markdown
[![Awesome DSH Plugin](https://awesome-dsh-plugin.com/badge.svg)](https://awesome-dsh-plugin.com)
```

## Disclaimer

This is a community-maintained index. Plugins are developed and maintained by their respective authors; listing here is not an endorsement, and no guarantees are made about any plugin's safety, quality, or maintenance. Installing a plugin runs third-party code on your machine — review the source and install at your own risk. This project is not affiliated with DeepSeek.

Issues here are for the list and its website only. Problems inside the plugin market UI go to [dsh-market](https://github.com/dsh-market/dsh-market/issues); problems with `dsh` itself go to [deepseek-harness](https://github.com/deepseek-ai/deepseek-harness/issues); a bug in a plugin goes to that plugin's own repository.
