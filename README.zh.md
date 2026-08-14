# Awesome DeepSeek Harness (DSH) Plugin [![Awesome](https://awesome.re/badge.svg)](https://awesome.re) ![awesome · DSH plugin](https://awesome-dsh-plugin.com/badge.svg)

[![Awesome DSH Plugin](https://awesome-dsh-plugin.com/banner-zh.png)](https://awesome-dsh-plugin.com/zh/)

[English](README.md) | 中文

> [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（`dsh`）插件精选列表。

DeepSeek Harness 是 DeepSeek 开源的 agent harness——既是可直接运行的 Coding Agent（提供 Web 与 headless 两种形式），底层又是一套「一切皆插件」的框架：模型、工具、沙箱、会话存储、UI、乃至 Agent Loop 本身都是插件。插件既可以扩展官方 Coding Agent，也可以替换其核心部件，甚至组装出完全不同的东西。

本列表收录可通过 `dsh plugin add` 安装的社区插件（均声明了 `dsh.bundle` manifest）。

> 🛒 **先装 [dsh-market](https://github.com/dsh-market/dsh-market#readme)**——整个列表装进 DeepSeek Harness，直接在里面逛、搜、看 star、一键安装/更新/卸载，多数插件免重启即刻生效：

```sh
dsh plugin --profile web add dshmarket
```

> 💡 更喜欢对话式？装 [dsh-find-plugin](https://github.com/awesome-dsh-plugin/dsh-find-plugin#readme)，想要什么插件直接问 agent（`dsh plugin --profile web add dsh-find-plugin`）。

**271** 个插件 · 欢迎 [PR](#贡献)

## 目录

- [插件](#插件)
  - [🎨 UI 增强](#-ui-增强)
  - [🎭 主题与外观](#-主题与外观)
  - [💬 会话与消息](#-会话与消息)
  - [🧠 记忆](#-记忆)
  - [🛠️ 工具与能力](#-工具与能力)
  - [🔁 工作流与自动化](#-工作流与自动化)
  - [🔔 通知与集成](#-通知与集成)
  - [🔌 模型与账号接入](#-模型与账号接入)
  - [🧑‍💻 开发与运行时](#-开发与运行时)
  - [🎮 娱乐](#-娱乐)
- [徽章](#徽章)
- [免责声明](#免责声明)

## 插件

### 🎨 UI 增强

- [Noob-stupid/dsh-plugin-hub](https://github.com/Noob-stupid/dsh-plugin-hub) — 插件管理面板：已安装插件一键启用/停用，内置 GitHub dsh-plugin 插件市场，支持详情查看与一键安装。

- [zealot00/dsh-pet](https://github.com/zealot00/dsh-pet) - DSH Web UI 桌面宠物：精灵图动画、agent 状态联动、拖拽、闹钟（每天/一次）与番茄钟，皮肤下拉选择 + 预览。

- [huiliyi37/dsh-tianshu-tui](https://github.com/huiliyi37/dsh-tianshu-tui) — DeepSeek Harness 的终端 UI（TUI）。
- [openma-ai/deepseek-harness-tui](https://github.com/openma-ai/deepseek-harness-tui) — Rust/ratatui 终端客户端，直接使用 DSH SDK JSON-RPC 协议，支持独立运行或作为 profile bundle 加载。
- [omdsh-dev/dsh-at-file](https://github.com/omdsh-dev/dsh-at-file) — Codex 风格的 `@file` 文件引用，输入框里直接搜索并引用工作区文件。
- [alingalingling/ui-status-label](https://github.com/alingalingling/ui-status-label) — 把鲸鱼娘思考时的 "deep diving" 状态文案自定义成任意你想要的样子。
- [LeemanCheung/dsh-whale-animation](https://github.com/LeemanCheung/dsh-whale-animation) — DSH Web 状态文字旁的持久化黑色鲸鱼深潜动画，提供减少动态效果回退与无缝闭环。
- [ZSeven-W/dsh-openpencil](https://github.com/ZSeven-W/dsh-openpencil) — OpenPencil 设计预览与编辑插件。
- [Nagi-ovo/dsh-visualize](https://github.com/Nagi-ovo/dsh-visualize) — 对话内生成式 UI：模型把交互式 HTML 卡片直接画进会话流，带流式预览与沙箱渲染。
- [ccq1/dsh-side-panel](https://github.com/ccq1/dsh-side-panel) — 侧边栏集成文件浏览器、终端和 Git 审查，方便预览文件。
- [dingyi222666/dsh-focus-chat](https://github.com/dingyi222666/dsh-focus-chat) — 「聚焦会话」精简视图，只关注最终产出结果。
- [omdsh-dev/dsh-genui](https://github.com/omdsh-dev/dsh-genui) — 助手回复内渲染交互式 UI 组件：布局、图表、表单、测验、mermaid、3D 场景与回传事件循环。
- [omdsh-dev/dsh-annotation](https://github.com/omdsh-dev/dsh-annotation) — 选中文字→批注→随消息发送，回复按批注逐条对照。
- [vlln/dsh-navbar](https://github.com/vlln/dsh-navbar) — 对话节点导航条，右缘节点串快速跳转 user 消息。
- [asukasec/dsh-message-preview](https://github.com/asukasec/dsh-message-preview) — 右侧用户消息导航条，根据消息数量与可用高度自适应排布导航块，并支持悬停预览、键盘操作与点击跳转。
- [vlln/dsh-task-status](https://github.com/vlln/dsh-task-status) — 后台任务状态条：对话页任务进度 + 实时输出 tail。
- [Nanki-nn/dsh-answer-pet](https://github.com/Nanki-nn/dsh-answer-pet) — 蓝鲸桌面宠物：按会话实时展示回答进度、模型动作与工具调用轨迹、token、输出速率与耗时，并支持多会话状态卡片展开和收起。
- [renat3u/dsh-web-archive](https://github.com/renat3u/dsh-web-archive) — 折叠对话中的 Think、Bash 等「无用消息」。
- [0xsline/dsh-spotlight](https://github.com/0xsline/dsh-spotlight) — 键盘优先的命令面板（command palette）。
- [bill9109/dsh-101](https://github.com/bill9109/dsh-101) — DSH 文档阅读模式。
- [bill9109/dsh-drag-and-drop](https://github.com/bill9109/dsh-drag-and-drop) — 跨平台文件拖拽与原始路径插入，无需复制文件。
- [taxueseek/dsh-files](https://github.com/taxueseek/dsh-files) — 文件上传（彩色附件卡片、会话隔离存储、sha256 去重、TTL 清扫）+ 内容嗅探的 read_document 文档读取（PDF/DOCX/XLSX/TXT）。
- [l541402398/dsh-file-uploads](https://github.com/l541402398/dsh-file-uploads) — 从 Web 输入框上传任意本地文件，以待发送卡片展示，并在设置中管理已存文件。
- [qyw233/dsh-deeplink](https://github.com/qyw233/dsh-deeplink) — `?session=` / `?workspace=` 深链直达指定项目对话。
- [lehhair/dsh-diff-viewer](https://github.com/lehhair/dsh-diff-viewer) — PiUI 风格 diff 查看器，替换 write/edit 工具调用的默认 DiffBlock。
- [omdsh-dev/ex-setting](https://github.com/omdsh-dev/ex-setting) — DSH 的设置扩展。
- [omdsh-dev/web-components](https://github.com/omdsh-dev/web-components) — Web Components 支持。
- [vibeinging/dsh-turn-navigator](https://github.com/vibeinging/dsh-turn-navigator) — 对话轮次导航。
- [SnowCrescenter-tech/dsh-milestone](https://github.com/SnowCrescenter-tech/dsh-milestone) — 右侧圆点时间轴导航条，点击跳转到任意用户消息。
- [Ghost011118/dsh-balance-meter](https://github.com/Ghost011118/dsh-balance-meter) — 输入框 dock 显示 DeepSeek 账户余额与会话花费，自动拉取官方定价，支持高峰/低谷计价。
- [v587d/dsh-opencode-go-usage](https://github.com/v587d/dsh-opencode-go-usage) — 在输入框上方 dock 显示 OpenCode Go 订阅用量（5h 滚动/每周/每月窗口与重置倒计时），内置凭据编辑器。
- [Han-1413141/dsh-cost-meter](https://github.com/Han-1413141/dsh-cost-meter) — 会话与当日 API 费用统计、预算图框（已用%）、官方余额、历史看板，支持峰谷计价与官方价格一键同步。
- [fishxcode/dsh-plugin-deepseek-balance](https://github.com/fishxcode/dsh-plugin-deepseek-balance) — 在 DSH Web 设置中展示 DeepSeek API 余额、余额趋势与每日用量图表。
- [Sev7een/ds-api-usage](https://github.com/Sev7een/ds-api-usage) — 在设置页展示 DeepSeek API 余额与最近 24 小时用量，包括估算消费、Token、请求次数和按小时时间线。
- [nonewind/dsh-spend](https://github.com/nonewind/dsh-spend) — DSH Web 用量与费用统计插件：右下角悬浮窗，按模型/按天/按会话多维聚合与预计花费。
- [stevenx65/dsh-balance-plugin](https://github.com/stevenx65/dsh-balance-plugin) — dsh 网页侧边栏的 DeepSeek 余额与 token 用量监控：今日/累计切换，并按 provider 过滤其他厂商。
- [ccch1mneyyy/dsh-TUI](https://github.com/ccch1mneyyy/dsh-TUI) — Claude Code 风格全屏终端 UI：像素鲸鱼顶栏、实时工作状态行、思考流式展开。
- [omdsh-dev/DSH-better-sidebar](https://github.com/omdsh-dev/DSH-better-sidebar) — 侧边栏完整工作台：内置文件渲染编辑、终端、Git 与子代理，支持三方插件注册新 Tab。
- [tsonglew/dsh-workspace-search](https://github.com/tsonglew/dsh-workspace-search) — VS Code 式工作区关键词搜索 Tab（better-sidebar 扩展）：同时匹配文件名与文件内容，结果按文件分组带行号，点击在侧栏编辑器打开。
- [Han-1413141/dsh-sticky-disclosure](https://github.com/Han-1413141/dsh-sticky-disclosure) — 一键收起会话中所有展开的区块（Think、工具卡等），常驻计数按钮 + 自定义快捷键。
- [Meredith2328/dsh-sticky-note](https://github.com/Meredith2328/dsh-sticky-note) — 编辑框工具栏便签，随手记点子和 TODO，自动保存为 Markdown，一键发送到对话。
- [Luaphes/dsh-web-attention-badge](https://github.com/Luaphes/dsh-web-attention-badge) — 会话需要你时三处同时亮起：角标、标签页标题计数、按状态换色的鲸鱼 favicon。
- [zhu1090093659/dsh-web-ui](https://github.com/zhu1090093659/dsh-web-ui) — DSH Web UI 插件与皮肤合集：任务看板、git 图、右侧面板、远程移动端 UI、桌宠、实时 token 统计与皮肤中心。
- [Starfie1d1272/dsh-builtin-toggles](https://github.com/Starfie1d1272/dsh-builtin-toggles) — 为 DSH Web 添加官方内置插件目录、搜索与状态说明，并提供经过审核的安全 UI 插件开关。
- [jiangnanquan/dsh-ux](https://github.com/jiangnanquan/dsh-ux) — Solarized 浅色主题、紧凑布局、思考/工具链折叠胶囊，以及余额、本轮成本与用量看板的 DSH Web 界面增强插件。
- [a903067276-rgb/dsh-hud](https://github.com/a903067276-rgb/dsh-hud) — HUD 状态面板：Git 状态、MCP 服务器、技能列表、模型与 token 用量，悬浮侧栏一览无余。
- [wsxwj123/dsh-plugins#turn-scrubber](https://github.com/wsxwj123/dsh-plugins/tree/main/packages/turn-scrubber) — 右侧紧凑回合刻度条，悬停显示回合摘要，点击跳转到对应用户回合。
- [Sttrevens/dsh-cost-meter](https://github.com/Sttrevens/dsh-cost-meter) — Web UI 美元成本徽标：头部显示会话总成本、每条回复结尾显示该轮成本，悬停看分项。
- [a903067276-rgb/dsh-file-mentions](https://github.com/a903067276-rgb/dsh-file-mentions) — DSH 回复中的文件路径可点击：Codex 风格行内打开、文件管理器定位、回合尾部文件 chip 列表。
- [bobcat848/dsh-calculator](https://github.com/bobcat848/dsh-calculator) — 右侧面板展示 DeepSeek API 费用（当前会话 + 全部会话累计）与账户余额，内置官方计价与峰谷计价支持。


- [Jolly-J/dsh-deepseek-billing](https://github.com/Jolly-J/dsh-deepseek-billing) — 侧边栏底部 DeepSeek 账户余额显示与会话费用估算卡片。
- [AKIRACOD/dsh-drag-and-drop](https://github.com/AKIRACOD/dsh-drag-and-drop) — 拖放 fork：文档以可删除「文件芯片」挂在输入框上方，不打字也能发送。
- [HsiangNianian/dsh-auto-continue](https://github.com/HsiangNianian/dsh-auto-continue) — DSH Web 请求中断自动续跑：网络、超时或宿主崩溃等非人为失败后自动发送「继续」，支持错误分类、自适应退避、模板化继续文本与浏览器通知。
- [liliuCourier/dsh-chat-outline](https://github.com/liliuCourier/dsh-chat-outline) — 对话栏左侧常驻大纲：按轮次列出提问与最后回复，支持关键词过滤与一键跳转。
- [LaoYueHanNi/dsh-token-usage](https://github.com/LaoYueHanNi/dsh-token-usage) — 按请求持久化模型 token 用量，Web 设置「Token 用量」统计页：按日趋势图、按模型明细表、日期/模型筛选。
- [QT-Chen/dsh-mic-input](https://github.com/QT-Chen/dsh-mic-input) — 输入框麦克风语音输入：浏览器 Web Speech API 实时转写，自动去重/续听、智能标点，支持语言与自动发送设置。
- [LeemanCheung/dsh-task-dag](https://github.com/LeemanCheung/dsh-task-dag) — 将会话子代理与持久工作流运行展示为实时 DAG，支持状态展示、节点导航与重启后历史恢复。
- [MorGogh/widget-dock](https://github.com/MorGogh/widget-dock) — 对话两侧空白区的可拖动卡片工作台：余额、Token 用量、会话统计、目标、成本估算等小组件，支持 S/M/L/XL 尺寸档位与官方定价成本估算。


### 🎭 主题与外观

- [KinGao294/dsh-skin](https://github.com/KinGao294/dsh-skin) — Codex 风格皮肤切换器 + 自定义壁纸层，可调透明度与模糊。
- [Small-tailqwq/dsh-deep-whale](https://github.com/Small-tailqwq/dsh-deep-whale) — DSH Web 鲸鱼娘皮肤系列（深海女仆工坊 maid-atelier）。
- [wsxwj123/dsh-plugins#theme-gallery](https://github.com/wsxwj123/dsh-plugins/tree/main/packages/theme-gallery) — 15 个精选主题家族，浅深配色完整，跟随 DSH 原生浅色/深色/跟随系统模式。


### 💬 会话与消息

- [Anionex/dsh-turn-rewind](https://github.com/Anionex/dsh-turn-rewind) — 对话回退：基于持久 Change Ledger 回滚会话与工作区状态。
- [Jesse-njx/dsh-crosstalk](https://github.com/Jesse-njx/dsh-crosstalk) — 跨会话消息：本机任意会话都可像 Claude Code 一样列出并互发消息，基于本地心跳注册表与收件箱。
- [dongsheng123132/task-passport](https://github.com/dongsheng123132/task-passport) — 通过机器可读检查点与乐观锁，在 DeepSeek Harness、WorkBuddy、Claude Code 和 Codex 之间交接持久任务状态。
- [hellodigua/dsh-share](https://github.com/hellodigua/dsh-share) — 一键分享你的对话。
- [Moeblack/dsh-message-edit](https://github.com/Moeblack/dsh-message-edit) — 基于分支的消息编辑、reroll、重试与版本时间线。
- [Buyi-wsgzg/dsh-sidechain](https://github.com/Buyi-wsgzg/dsh-sidechain) — `/side` 持续性侧会话与 `/btw` 一次性侧问，在临时 fork 中运行、不写入主会话历史。
- [bill9109/dsh-conversation-share](https://github.com/bill9109/dsh-conversation-share) — 分享任意段落的对话。
- [yuezengwu/dsh-explain](https://github.com/yuezengwu/dsh-explain) — 本地优先学习模式：跨会话全局学习线程、按来源讲解。
- [Moeblack/dsh-prompt-studio](https://github.com/Moeblack/dsh-prompt-studio) — 带实时预览的用户/内置 system prompt 分节编辑器。
- [czm15053/dsh-peer-link](https://github.com/czm15053/dsh-peer-link) — 让 dsh 和 Claude Code 会话直接互发消息，附带可点击的会话列表卡片（搜索/刷新/弹窗发送）。
- [Nwflower/dsh-chat-import](https://github.com/Nwflower/dsh-chat-import) — 把 Claude Code / Codex / ChatGPT / Cursor / Gemini / Reasonix / opencode 的聊天记录全保真导入为可续聊的 DSH 会话。
- [Nwflower/dsh-file-claim](https://github.com/Nwflower/dsh-file-claim) — 同一工作区并行多会话的文件认领与写入保护（claim/release、心跳 stale 接管、pending 三路合并）。
- [Chinesezjc/dsh-interconnect](https://github.com/Chinesezjc/dsh-interconnect) — 跨实例互联：经 interconnect 服务在多个 DSH 实例间转发消息与事件。
- [3403473060/dsh-inline-images](https://github.com/3403473060/dsh-inline-images) — 对话内联图片：LLM 回复中输出的本地图片路径在消息正文直接渲染为图片（9 种格式、点击放大灯箱、可调尺寸）。
- [Wine-Red/dsh-prompt-stash](https://github.com/Wine-Red/dsh-prompt-stash) — 本地、按会话隔离的 LIFO 输入暂存：临时收起未完成的输入，之后安全恢复并继续编辑。
- [heartmove/dsh-side-chat](https://github.com/heartmove/dsh-side-chat) — 选中对话片段，在右侧面板的侧边聊天中提问（按会话隔离）；AI 回复可原文或摘要后带回主会话。
- [bwndlct/dsh-session-export](https://github.com/bwndlct/dsh-session-export) — 把当前会话导出为可移植、带 schema 版本的 Markdown 与 JSON 文件，提供 `session_export` 工具与斜杠命令两种入口，文件名跨平台安全。
- [LeemanCheung/dsh-token-usage](https://github.com/LeemanCheung/dsh-token-usage) — 持久化记录每个会话的 Token 用量，在设置页提供 provider/model 统计与最近 52 周活跃度热力图。
- [whyihaveyou/dsh-suite#plugin-session-export](https://github.com/whyihaveyou/dsh-suite/tree/main/packages/plugins/plugin-session-export) — 把 append-only 会话日志导出为按轨迹来源分组的可读 Markdown 或 HTML。

### 🧠 记忆

- [LoserFox/distill](https://github.com/LoserFox/distill) — 自动对话蒸馏：后台 subagent 反省 + 技能 create/update。
- [omdsh-dev/dsh-mnemon](https://github.com/omdsh-dev/dsh-mnemon) — Mnemon 深度集成：本地三层记忆（Runtime Memory、可检索 Documents、受监督 Memory Spaces）。
- [modusensus/dsh-mneme](https://github.com/modusensus/dsh-mneme) — 跨会话记忆：SQLite + 可人工编辑的 Markdown 镜像，后台自动巩固（去重/合并/冲突裁决），提供 6 个记忆工具。
- [nowledge-co/nowledge-mem-deepseek-harness](https://github.com/nowledge-co/nowledge-mem-deepseek-harness) — 给所有 AI 工具和 Agent 共用的一层记忆：注入 Context Bundle、提示时检索、MCP 工具与回合结束 DSH 线程捕获。
- [Jesse-njx/dsh-memory](https://github.com/Jesse-njx/dsh-memory) — 基于 DSH 无损会话日志的引用式记忆：蒸馏出的事实带 `(sessionId, eventRange)` 引用，可随时展开回原始日志片段。
- [flymysql/dsh-memory](https://github.com/flymysql/dsh-memory) — 跨会话记忆库：remember / recall / forget 工具、每轮提示注入与设置页条目浏览。
- [Xplore-LAB/dsh-plugin-asmemory](https://github.com/Xplore-LAB/dsh-plugin-asmemory) — 动作-状态时序记忆：记录类型化的状态与动作，做趋势、异常与因果关联分析。
- [PerryLink/dsh-memento](https://github.com/PerryLink/dsh-memento) — 有界、分层、带审批门、可审计的跨会话记忆：`ctx.memory` 服务 + 零依赖 SQLite 存储 + `memory` 工具与冻结快照注入；写入必过审批门，模型可见内容可自会话日志重建。
- [ICCuse/dsh-file-memory](https://github.com/ICCuse/dsh-file-memory) — 文件型工作记忆：memorize/recall 把关键前提逐字保存在会话笔记文件，无损挺过上下文压缩。
- [ICCuse/dsh-knowledge](https://github.com/ICCuse/dsh-knowledge) — 全局知识库桥：kb_add/kb_search/kb_show/kb_timeline 读写与 Codex 共享的 D:\knowledge（格式逐字节兼容）。
- [ICCuse/dsh-premise-guard](https://github.com/ICCuse/dsh-premise-guard) — 压缩后前提漂移守卫：摘要丢失关键字面锚点时注入一次性提醒。
- [freehul/sgme](https://github.com/freehul/sgme) — 拾光记忆引擎（SGME）桥接：多智能体共享长期记忆（HTTP）—— L0/L1/L1.5/L2 分层提炼、按场景注入、统一检索、主动关怀信号（memory_search / wiki_search / signal_pull / signal_claim / signal_ack），npm 包名 `dsh-sgme`。
- [Phant0Meow/dsh-memory-meow](https://github.com/Phant0Meow/dsh-memory-meow) — 项目级跨会话记忆：PROJECT.md 快照注入首条用户消息（缓存友好）+ memory_remember 工具 + ReAct 任务结束自动反思；各项目独立记忆文件，互不互通。


### 🛠️ 工具与能力

- [CheshireJCat/blender](https://github.com/CheshireJCat/blender) — Blender 3D 生产插件：提供 30 个建模/重建 Skill、13 个运行时工具和 26 个确定性 Helper，覆盖参考图拟合、渲染、验证、动画与可移植格式导出；npm 包名 `dsh-blender`。
- [ysr666/dsh-vision-router](https://github.com/ysr666/dsh-vision-router) — 为纯文本 Agent 提供视觉能力：内置免 Key 视觉链 + 像素级视觉工具（看图问答、定位、裁剪、像素对比、取色、OCR、矢量化、抠图、截图）；粘贴图片即可用。
- [Flyvhidbwo/dsh-vision-proxy](https://github.com/Flyvhidbwo/dsh-vision-proxy) — DeepSeek 大脑 + 自动识图：GUI 附加的每张图片自动经 OpenAI 兼容 VLM 转译成文字，再交给纯文本的 DeepSeek 作答——默认走免费匿名端点（零配置），填自己的 key 可启用付费快速通道（qwen3.7-flash，支持 DashScope/智谱/Ollama/OpenRouter）。
- [ximengxiaolan/dsh-vision-bridge](https://github.com/ximengxiaolan/dsh-vision-bridge) — 输入框贴图自动识别：由 OpenAI 兼容视觉模型转成文字描述后，再交给纯文本 DeepSeek 模型处理。
- [lire1131/dsh-undo-plugin](https://github.com/lire1131/dsh-undo-plugin) — DSH 撤销/回退系统：配置变更自动存档，一键撤销/恢复/回退到任意版本，支持 WebUI 与离线 CLI/GUI 工具（DSH 启动失败也能救）。
- [MAXeaglet/dsh-bash-terminal](https://github.com/MAXeaglet/dsh-bash-terminal) — 一个 shell 工具：Windows 上统一执行 PowerShell / Git Bash / WSL，外加交互式 PTY 终端，默认终端由用户在设置中选择。
- [Anionex/dsh-vision-toolkit](https://github.com/Anionex/dsh-vision-toolkit) — 让纯文本模型更好地做视觉任务：带意图的图片问答、长截图 OCR、UI 还原等。
- [omdsh-dev/dsh-custom-tool](https://github.com/omdsh-dev/dsh-custom-tool) — 用 Monaco 编辑器创建和管理沙箱化的自定义 JavaScript 工具。
- [Anionex/dsh-computer-use](https://github.com/Anionex/dsh-computer-use) — macOS 电脑控制：Accessibility 观测、过期状态拒绝、作用域权限与安全输入。
- [kunjinkao-os/dsh-mobile-gui-agent](https://github.com/kunjinkao-os/dsh-mobile-gui-agent) — Android GUI Agent：ADB 截图、压缩 UI hierarchy 定位、逐步动作验证、审批和 Mobile Web 视图。
- [omdsh-dev/dsh-data-agent](https://github.com/omdsh-dev/dsh-data-agent) — 让 AI 帮你连数据库、写 SQL。
- [omdsh-dev/dsh-toolkit](https://github.com/omdsh-dev/dsh-toolkit) — 零依赖工具包：time / encoding / json / calculator / csv / regex / markdown / diff / stat / schema 十件套一键安装。
- [flymysql/dsh-remote](https://github.com/flymysql/dsh-remote) — 多机远程工作区：管理多台 SSH 主机，在原生「添加工作区」流程里选本机系统文件夹或远程目录，把远程工作区镜像成真实本地文件夹并用 rw_* 工具操作。
- [omdsh-dev/dsh-tool-csv](https://github.com/omdsh-dev/dsh-tool-csv) — CSV 解析/查询/统计/转换（RFC 4180），零依赖状态机解析器。
- [omdsh-dev/dsh-tool-calculator](https://github.com/omdsh-dev/dsh-tool-calculator) — 安全的数学表达式求值器，零依赖递归下降解析器。
- [omdsh-dev/dsh-tool-diff](https://github.com/omdsh-dev/dsh-tool-diff) — 文本/JSON/CSV/Markdown 结构化比较与 unified diff。
- [omdsh-dev/dsh-tool-encoding](https://github.com/omdsh-dev/dsh-tool-encoding) — base64/url/hex 编解码、常用哈希、UUID 生成。
- [omdsh-dev/dsh-tool-json](https://github.com/omdsh-dev/dsh-tool-json) — JMESPath 子集 JSON 查询。
- [omdsh-dev/dsh-tool-markdown](https://github.com/omdsh-dev/dsh-tool-markdown) — HTML↔Markdown 转换、GFM 表格规范化、目录生成。
- [omdsh-dev/dsh-tool-regex](https://github.com/omdsh-dev/dsh-tool-regex) — 正则测试/提取/安全替换/静态解释（不执行代码）。
- [omdsh-dev/dsh-tool-schema](https://github.com/omdsh-dev/dsh-tool-schema) — JSON Schema 验证：validate/paths/explain/normalize。
- [omdsh-dev/dsh-tool-stat](https://github.com/omdsh-dev/dsh-tool-stat) — 描述统计/百分位数/频数分布/相关性。
- [omdsh-dev/dsh-tool-time](https://github.com/omdsh-dev/dsh-tool-time) — 严格 ISO 8601 解析、IANA 时区转换、UTC 日历运算。
- [omdsh-dev/dsh-kb-sieve](https://github.com/omdsh-dev/dsh-kb-sieve) — 从 md/txt/docx/pdf 构建可审计知识库包（SQLite FTS5），确定性检索与原文阅读。
- [HuanLinOTO/dsh-plugin-mineru](https://github.com/HuanLinOTO/dsh-plugin-mineru) — 向模型暴露 MineRU 文档解析工具。
- [Jesse-njx/dsh-cowork](https://github.com/Jesse-njx/dsh-cowork) — doc_read/doc_write：以有界、单元格寻址的方式读写 xlsx / pdf / docx / pptx / ipynb，另附 MCP 服务器与 CLI。
- [Jesse-njx/dsh-skillport](https://github.com/Jesse-njx/dsh-skillport) — 把已有的 Agent Skills（SKILL.md）技能库带进 DSH：扫描 Claude/Codex/Cursor/Gemini 技能目录、注入渐进式索引，按需加载技能正文。
- [sakikoTGW/pack-agent](https://github.com/sakikoTGW/pack-agent) — 把 .pack.json/.pack.zip 投影到 .agent-pack/modpacks/，按工作区白名单暴露 skill。
- [vibeinging/dsh-tool-search](https://github.com/vibeinging/dsh-tool-search) — 按 agent 的按需工具发现与渐进式 schema 披露。
- [THU-MAIC/dsh-openmaic](https://github.com/THU-MAIC/dsh-openmaic) — OpenMAIC 教学：课堂、幻灯片、交互组件与苏格拉底式教学。
- [lzszq/dsh-scholar](https://github.com/lzszq/dsh-scholar) — 学术助手插件。
- [ylwl1997/noatmark-dsh-plugin](https://github.com/ylwl1997/noatmark-dsh-plugin) — 文本卫生 dsh 插件：净化不可信文本、扫描隐形字符、清洗 LLM 格式、转义 CSV 公式注入。
- [jihongboo/dsh-apple-mode](https://github.com/jihongboo/dsh-apple-mode) — DSH 的 Xcode AI 集成：26 个 Xcode MCP 工具（mcpbridge）+ Apple 平台技能 + Xcode Intelligence 风格 persona（agent preset 或全局 bundle）。
- [ZK-Andy/dsh-continual-evolve](https://github.com/ZK-Andy/dsh-continual-evolve) — 持续自进化：从会话轨迹沉淀版本化、可审计、可回滚的 harness 状态（提示词/记忆/技能/子代理规格），带审查门禁与技能热加载。
- [zp-home/dsh-recommend](https://github.com/zp-home/dsh-recommend) — DSH 插件透明排行与推荐：每日自动抓取 `dsh-plugin` 话题生态，公开评分模型，提供 rank/search/recommend 工具与设置页榜单。
- [liustack/modlens](https://github.com/liustack/modlens) — 为纯文本模型架起视觉桥梁：粘贴图片，输出结构化 JSON 证据（OCR、版面、语义）。
- [dsh-market/dsh-market](https://github.com/dsh-market/dsh-market) — 装在 DSH 里的插件市场：设置页内逛/搜全部社区插件，按分类筛选，确认后一键安装，已装插件一目了然。
- [crTnT/dsh-plugin-suite#dsh-plugin-center](https://github.com/crTnT/dsh-plugin-suite/tree/main/dsh-plugin-center) — 插件中心：在设置页发现、安装与管理 DSH 插件。
- [crTnT/dsh-plugin-suite#dsh-plugin-updater](https://github.com/crTnT/dsh-plugin-suite/tree/main/dsh-plugin-updater) — 已装插件更新管理：检查更新、备份与回滚。
- [awesome-dsh-plugin/dsh-find-plugin](https://github.com/awesome-dsh-plugin/dsh-find-plugin) — 会话内直接找插件：按关键词/分类搜索本精选 registry，返回描述与可直接执行的安装命令。
- [lonelymoon87/dsh-code-intel](https://github.com/lonelymoon87/dsh-code-intel) — 用 Tree-sitter 建立工作区符号索引，提供词法或可选 embedding 辅助的代码检索。
- [lynx-gt/dsh-subagent-tools](https://github.com/lynx-gt/dsh-subagent-tools) — 子代理委派的按调用覆盖：model/provider/persona/toolFilter、@preset: 引用与 provider/model 组合 id。
- [lynx-gt/dsh-subagent-cwd](https://github.com/lynx-gt/dsh-subagent-cwd) — 在 dsh-subagent-tools 基础上增加子代理按调用 cwd，附带所需的两个 in-process provider 补丁。
- [Jesse-njx/dsh-voice](https://github.com/Jesse-njx/dsh-voice) — 语音输入、语音输出：把口述音频转写为用户消息（transcribe），让 agent 朗读回复（speak），本地优先，音频存于 ~/.dsh/voice。
- [Jesse-njx/dsh-docker](https://github.com/Jesse-njx/dsh-docker) — 类型安全、带护栏的容器控制：ps/logs/inspect/exec/start/stop 与 compose up/down，JSON 输出、项目感知定位、破坏性操作需审批。
- [hccccc01333/dsh-excel-chat](https://github.com/hccccc01333/dsh-excel-chat) — 在 DeepSeek Harness 里对话完成 Excel 工作：建表、编辑、修复公式、图表校验，每次编辑后自动体检公式。
- [EvilIrving/dsh-context-proxy](https://github.com/EvilIrving/dsh-context-proxy) — 按需取回薄层：context_query / context_slice / context_grep 三个工具读取已持久化的历史，引用可回放。
- [zhaoolee/notes](https://github.com/zhaoolee/notes) — 将 DSH 对话导出为锤子便签风格 PNG，或在配置的账号工作区中新建和更新 Markdown 便签。
- [zimai233/dsh-figma-to-lottie](https://github.com/zimai233/dsh-figma-to-lottie) — 将 SVG 路径与关键帧参数编译成自包含的 Lottie JSON 动画文件。
- [zimai233/dsh-exam-countdown](https://github.com/zimai233/dsh-exam-countdown) — 查询 64 场中国考试（高考/考研/四六级/CPA/法考…）的规则日期（第二个周六、第一个周日）与倒计时。
- [zimai233/dsh-wash-calendar](https://github.com/zimai233/dsh-wash-calendar) — 基于纯日期数学的周期习惯排程：下次发生日、区间排程与逾期提醒。
- [zimai233/dsh-adhd-copilot](https://github.com/zimai233/dsh-adhd-copilot) — ADHD 行为辅导技能：任务拆解、事项过载管理、启动仪式与失败重启。
- [zimai233/dsh-image-search](https://github.com/zimai233/dsh-image-search) — 多引擎反向识图聚合：Google Lens、百度、Yandex、TinEye、SauceNAO、IQDB、Ascii2d。
- [zimai233/dsh-video-downloader](https://github.com/zimai233/dsh-video-downloader) — 检测并下载 B站/YouTube/抖音/小红书视频媒体，带清晰度与格式分析。
- [Luke-Yong/dsh-plugin-knowledge-graph](https://github.com/Luke-Yong/dsh-plugin-knowledge-graph) — 基于代码库知识图谱的 read_graph 工具（CONTAINS / EXPORTS / IMPORTS / IMPORTS_SYMBOL 关系）。
- [liustack/modsearch](https://github.com/liustack/modsearch) — 纯文本 agent 的联网搜索桥：搜索网页与 X，返回结构化 JSON 证据（search/fetch/引用）。
- [taxueseek/argo](https://github.com/taxueseek/argo) — 专为 agent 打造的搜索工具：多语言，覆盖中文/英文/学术/代码/购物/金融/新闻/百科。
- [TonyDua/dsh-web-search-exa](https://github.com/TonyDua/dsh-web-search-exa) — ctx.web 接缝的零配置 Exa 网页搜索提供方：无 API key 时走匿名 MCP 兜底，配 key 时走 REST 搜索。
- [Lum1104/dsh-browser](https://github.com/Lum1104/dsh-browser) — Chrome 侧边栏扩展，让 DSH 直接操控你的浏览器，无需视觉能力。
- [Sanqi-normal/dsh-webui-market-plugin](https://github.com/Sanqi-normal/dsh-webui-market-plugin) — dsh Web GUI 内的社区插件市场：浏览 awesome-dsh-plugin.com 目录，从 设置 → 插件 → 插件市场 安装/卸载插件到 profile。
- [huey1in/trio](https://github.com/huey1in/trio) — 浏览器自动化（Playwright，带实时画面）+ MCP Server（把 DSH agent 暴露给任何 MCP 客户端）+ GitHub issue/PR/webhook 评审工具。

- [SamXiaBing/dsh-adb](https://github.com/SamXiaBing/dsh-adb) — ADB 设备·台架运维工具集：设备发现、结构化 logcat（后台采集）、apk 安装、文件 pull/push、性能快照。
- [xiaoyuyu6420/dsh-backup](https://github.com/xiaoyuyu6420/dsh-backup) — 一键备份 DSH 用户数据：/backup 命令、定时自动备份、sha256 校验与自动轮换。
- [Letter2025/dsh-tool-search](https://github.com/Letter2025/dsh-tool-search) — Hermes 风格工具搜索与瘦身：渐进式披露，语义搜索/查看/调用长尾工具，核心工具保持直通。


- [1na-ko/dsh-hdc-bridge](https://github.com/1na-ko/dsh-hdc-bridge) — 鸿蒙设备桥：hdc 截图/装包/日志/崩溃/UI 自动化闭环（配 read_image 看图），官方优先版本化 API 知识层（SDK .d.ts + 离线随包文档），以及 DevEco CLI 构建/签名/lint 通道。
- [PicGo/dsh-plugin](https://github.com/PicGo/dsh-plugin) — 通过 PicGo 已有配置（PicGo Cloud、GitHub、S3、腾讯云 COS、七牛，或任意已安装的上传插件）把本地图片和文件上传到图床，提供 `picgo_upload` 工具与 `/picgo` 命令。
- [mafeis/dsh-net-proxy](https://github.com/mafeis/dsh-net-proxy) — 让 agent 的网络请求走本机 HTTP/CONNECT/SOCKS5 代理。
- [bwndlct/dsh-session-audit](https://github.com/bwndlct/dsh-session-audit) — 会话执行分析：步骤、工具调用、失败、重复动作、token 用量与验证信号，输出 text/Markdown/JSON 报告。
- [fly233338/dsh-overleaf](https://github.com/fly233338/dsh-overleaf) — 通过 OverleafMCP 将多个 Overleaf 项目接入 DSH，支持浏览、分析和通过 Git 写回 LaTeX 文件。
- [LeslieWylie/dsh-fleet-audit](https://github.com/LeslieWylie/dsh-fleet-audit) — 只读的 agent 机群凭据卫生审计：检查凭据文件权限、git remote 内嵌凭据（输出脱敏）与 provider token 字面量计数；零依赖、确定性。
- [whyihaveyou/dsh-suite#plugin-manager](https://github.com/whyihaveyou/dsh-suite/tree/main/packages/plugins/plugin-manager) — DSH Web UI 内置插件商店：浏览、搜索、一键安装、兼容性徽章。
- [loguhan/dsh-workshop](https://github.com/loguhan/dsh-workshop) — DSH Web UI 的 Steam 创意工坊式插件商店：浏览、搜索并一键安装社区插件，支持镜像加速、进度 UI、安全检测与中文描述。
- [LeslieWylie/dsh-md-preview](https://github.com/LeslieWylie/dsh-md-preview) — 把 Markdown 渲染为自包含的独立 HTML 页面：提供在 headless 配置下同样可用的 `md_html_render` 工具，以及在网页端浏览、预览、编辑并导出本地 `.md` 文件的抽屉；两个入口共用同一个渲染器，无运行时依赖。

### 🧩 技能包
- [creght-dev/skills](https://github.com/creght-dev/skills) — Creght 平台建站技能包：CLI 拉取/推送同步、页面与组件规范、CMS、表单、Auth、SEO、发布与版本回滚。


- [YTxue/dsh-skill-manager](https://github.com/YTxue/dsh-skill-manager) — 设置侧边栏的 Skill 管理器：池与启用目录启停、文件夹批量导入（重名询问）、状态驱动一键规范检查与自动修复、系统级/项目级来源标识。
### 🔁 工作流与自动化

- [icetomoyo/dsh_workflow](https://github.com/icetomoyo/dsh_workflow) — 把 UltraCode 式多 Agent 调度带给 DSH：可生成、可保存、可治理、可观察、可恢复的 Workflow 层。
- [NanmiCoder/dsh-agent-teams](https://github.com/NanmiCoder/dsh-agent-teams) — AgentTeams 多智能体团队。
- [titanwings/dsh-automation](https://github.com/titanwings/dsh-automation) — 定时任务：让 Coding 任务按计划在全新 Agent Session 中运行，保留可审计历史。
- [Sev7een/dsh-plugin-automations](https://github.com/Sev7een/dsh-plugin-automations) — 设置页定时任务：支持准点或 DeepSeek 谷时段执行、单次/每日重复，并持久化任务状态。
- [Jesse-njx/dsh-routines](https://github.com/Jesse-njx/dsh-routines) — 定时 Agent：按 cron 计划运行 prompt，把摘要送到你已有的地方，内置重叠/漏跑/超时安全策略。
- [titanwings/dsh-plannotator](https://github.com/titanwings/dsh-plannotator) — 计划批注：选中计划原文逐条批注，结构化反馈送回 Agent。
- [vlln/dsh-loop](https://github.com/vlln/dsh-loop) — 定时循环：`/loop` 命令 + loop 工具 + 活动状态条。
- [fuhefei/dsh-sentinel](https://github.com/fuhefei/dsh-sentinel) — 条件驱动唤醒：file/command/http/process/webhook 持久监视，触发即唤醒 agent。
- [omdsh-dev/dsh-deep-research](https://github.com/omdsh-dev/dsh-deep-research) — 自适应深度研究编排器（基于官方 workflow 引擎）。
- [omdsh-dev/dsh-inspect](https://github.com/omdsh-dev/dsh-inspect) — 发现问题→修复交付→质量复查的对抗式闭环工具集。
- [fakechris/dsh-track](https://github.com/fakechris/dsh-track) — 嵌入式任务管理引擎：决策点协议、念头捕获墙、Linear 形 issue 存储。
- [btspoony/dsh-advisor](https://github.com/btspoony/dsh-advisor) — 搭配一个副模型，每轮被动审查并注入见解。
- [lonelymoon87/dsh-specflow](https://github.com/lonelymoon87/dsh-specflow) — 增加规格工件、技能、命令、由 goal 驱动的实施流程和任务进度上下文。
- [biociao/dsh-science](https://github.com/biociao/dsh-science) — 面向 DSH 的 Claude Science 式科研工作台：ReAct 研究循环引擎（research_* 工具）、带溯源的版本化工件（artifact_* 工具）与面向基因组/病原体/生物信息的 10 个科研技能。
- [EvilIrving/dsh-proof](https://github.com/EvilIrving/dsh-proof) — 独立只读验收层：顶层 turn 收尾前 spawn 只读 verifier，未通过时把缺口注回主 agent。
- [PerryLink/dsh-doublecheck](https://github.com/PerryLink/dsh-doublecheck) — 工程纪律守门：动笔前审讯需求，红绿测试证据门，交付后对抗评审（grill-requirements 技能 + 工具策略门）。
- [btspoony/mstar-harness](https://github.com/btspoony/mstar-harness) — 技能驱动的 harness/loop 工程化工作流插件。
- [Letter2025/dsh-approval-llm](https://github.com/Letter2025/dsh-approval-llm) — 基于模型的权限审批：由独立审查模型自动应答 approval 权限请求。
- [Letter2025/dsh-model-failover](https://github.com/Letter2025/dsh-model-failover) — 两级模型熔断与回退：模型或平台连续失败后自动熔断，并把下一个请求路由到配置好的备用模型。
- [whyihaveyou/dsh-suite#plugin-team-board](https://github.com/whyihaveyou/dsh-suite/tree/main/packages/plugins/plugin-team-board) — 多 agent 共享任务板：经 Cordis service key 创建/认领/流转/查询任务。


### 🔔 通知与集成

- [omdsh-dev/dsh-open-in-vscode](https://github.com/omdsh-dev/dsh-open-in-vscode) — 从 Web GUI 一键在 VS Code 中打开工作区目录。
- [omdsh-dev/dsh-notification](https://github.com/omdsh-dev/dsh-notification) — 回合完成桌面通知，按结果分控 + 关键词过滤。
- [bobleer/dsh-acp-for-bitfun](https://github.com/bobleer/dsh-acp-for-bitfun) — BitFun 与 DSH 的 ACP 交互对接。
- [openma-ai/deepseek-harness-acp](https://github.com/openma-ai/deepseek-harness-acp) — ACP profile 插件与独立 stdio server，可从 Zed 等 ACP 客户端使用完整 DSH agent，并共享 DSH 凭据与会话。
- [LoserFox/telegram](https://github.com/LoserFox/telegram) — Telegram Bot API 桥接：长轮询、per-chat 会话、HTML 格式化。
- [Jesse-njx/dsh-chatnode-wechat](https://github.com/Jesse-njx/dsh-chatnode-wechat) — 通过 iLink 网关在微信里与 DSH agent 聊天、监控与审批：双向文本、会话切换、进度摘要与编号审批提示。
- [dingyi222666/dsh-session-notification](https://github.com/dingyi222666/dsh-session-notification) — 会话完成等四种状态的通知响应，支持浏览器提示。
- [bill9109/dsh-web-ui-notify](https://github.com/bill9109/dsh-web-ui-notify) — 桌面通知提醒。
- [wsxwj123/dsh-plugins#pet-bridge](https://github.com/wsxwj123/dsh-plugins/tree/main/packages/pet-bridge) — dsh ↔ cc-pet 桌面宠物状态桥：把会话状态（思考中 / 读取文件 / 运行命令 / 完成）实时推送到桌面宠物气泡。
- [bill9109/dsh-webbridge](https://github.com/bill9109/dsh-webbridge) — DSH 结合 Kimi WebBridge。
- [BiBoyang/dsh-im-bridge](https://github.com/BiBoyang/dsh-im-bridge) — 微信（iLink）双向桥：turn 完成/批准请求推送、聊天内批准与消息注入、持久去重与长回复收敛分段；通道层为多 IM 预留。
- [imetn/dsh-lark-bridge](https://github.com/imetn/dsh-lark-bridge) — DeepSeek Harness 的飞书/Lark 双向控制器，支持 Project 与 Session 路由、交互卡片、审批、附件和任务控制。
- [pc439527/dsh-notify-bark](https://github.com/pc439527/dsh-notify-bark) — Bark 推送通知到 iPhone：回合完成、等待回答、等待授权等事件由 Host 端发送。

- [CAOGGL/dsh-ding](https://github.com/CAOGGL/dsh-ding) — 对话完成提醒：Agent 空闲（idle）时播放提示音并弹 Windows 原生通知，可配 ding.mp3、音量与防抖节流。
- [ldchaowin/dsh-plugin-notify-sound](https://github.com/ldchaowin/dsh-plugin-notify-sound) — 按工作区定制的任务完成铃声，以及审批、提问、计划评审、目标受阻、任务失败等需要人介入事件的注意提示音，支持内置合成音、语音播报与自定义音频。
- [whyihaveyou/dsh-suite#plugin-notify](https://github.com/whyihaveyou/dsh-suite/tree/main/packages/plugins/plugin-notify) — 回合完成、错误或待审批时推送 IM webhook（飞书/企微/钉钉/Slack/Discord/自定义）与本地通知。

### 🔌 模型与账号接入

- [dylan121322/llm-adaptive](https://github.com/dylan121322/llm-adaptive) — 自适应模型路由：请求级复杂度分类，按配置链自动选择后端 provider。
- [btspoony/dsh-llm-fallbacks](https://github.com/btspoony/dsh-llm-fallbacks) — 基于角色的模型重试与备用策略。
- [franksong2702/dsh-codex-connect](https://github.com/franksong2702/dsh-codex-connect) — 通过 ChatGPT OAuth 将 OpenAI Codex 模型接入 DeepSeek Harness，并提供可选的搜索与图片工具。
- [kam74515-boop/dsh-everything-oauth](https://github.com/kam74515-boop/dsh-everything-oauth) — 把本机 Codex / Grok / Claude / OpenCode / CC Switch 登录态导入 DSH，在设置里自选来源并启用模型。
- [omdsh-dev/Qwen-MM-Plugins](https://github.com/omdsh-dev/Qwen-MM-Plugins) — Qwen 多模态插件支持。
- [suntianc/dsh-codex-auth](https://github.com/suntianc/dsh-codex-auth) — 复用 Codex CLI 的 ChatGPT 登录态注册 `openai-codex` LLM 路由，并在 DSH Web 设置中提供 GPT Auth 控件。
- [feibi-mochi/deepseek-harness-wallet](https://github.com/feibi-mochi/deepseek-harness-wallet) — 多供应商钱包标签：官方 DeepSeek 余额、本会话花费与 token、第三方合计 token、一键充值、低余额提醒。

### 🧑‍💻 开发与运行时

- [bujue600-arch/dsh-testgen](https://github.com/bujue600-arch/dsh-testgen) - 自动化单元测试生成：/testgen 命令与 generate_tests 工具，生成、运行并修复测试直至通过（LLM 与离线模板双生成器；支持 vitest/jest/mocha/node:test）。
- [omdsh-dev/fabric](https://github.com/omdsh-dev/fabric) — 类似 MC Fabric 的 hook 处理器。
- [LoserFox/dsh-git-identity](https://github.com/LoserFox/dsh-git-identity) — git 提交固定使用环境自身作者身份，环境变量注入压过一切 `git config` 设置。
- [Zhenyu98/dsh-context-doctor](https://github.com/Zhenyu98/dsh-context-doctor) — 上下文注入审计：统计指令链/技能目录/工具 schema 的 token 成本，检测重复与冲突。
- [omdsh-dev/dsh-plugin-check](https://github.com/omdsh-dev/dsh-plugin-check) — 插件健康检查：扫描清单协议/patch 格式/构建陷阱，零依赖只读。
- [omdsh-dev/dsh-security-audit](https://github.com/omdsh-dev/dsh-security-audit) — 本机安全审计：配置/插件来源/会话/网络暴露面，只读脱敏风险报告。
- [omdsh-dev/dsh-session-health](https://github.com/omdsh-dev/dsh-session-health) — 会话文件帧级扫描诊断（torn/损坏/空会话检测）。
- [william-jin-cmu/dsh-evolve](https://github.com/william-jin-cmu/dsh-evolve) — 自进化：agent 在会话内给自己热挂载/卸载持久化插件。
- [vibeinging/dsh-trace](https://github.com/vibeinging/dsh-trace) — 遥测后端：把 turns、model steps、tool calls 导出到 yiTrace。
- [030611/dsh-telemetry-redactor](https://github.com/030611/dsh-telemetry-redactor) — 在已配置遥测后端接收前，对 `session-telemetry/record` 导出副本中的已支持秘密模式进行脱敏。
- [030611/dsh-verification-receipt](https://github.com/030611/dsh-verification-receipt) — 把每轮工具计数与粗粒度验证信号写入本地 JSONL，不保存提示词、工具参数或结果正文。
- [omdsh-dev/sandbox-micro](https://github.com/omdsh-dev/sandbox-micro) — microsandbox 沙箱支持。
- [omdsh-dev/sandbox-mxc](https://github.com/omdsh-dev/sandbox-mxc) — 微软跨平台沙盒支持。
- [omdsh-dev/sandbox-nono](https://github.com/omdsh-dev/sandbox-nono) — nono 沙盒支持。
- [vibeinging/dsh-agent-budget](https://github.com/vibeinging/dsh-agent-budget) — agent 树 token 预算管理。
- [Jesse-njx/dsh-polyglot](https://github.com/Jesse-njx/dsh-polyglot) — DSH 的模型切换器：指向任意 OpenAI 兼容端点，内置精选免费/低价 DeepSeek 服务商预设，免费额度限流时自动回退。
- [ilharp/dsh-tool-approval](https://github.com/ilharp/dsh-tool-approval) — 手动审批模式（Manual/Ask Mode）。
- [arrow949/dsh-turn-approval](https://github.com/arrow949/dsh-turn-approval) — DSH「允许本次任务」临时授权：仅在当前任务内自动放行同类 `danger-full-access` 请求，任务结束自动失效。
- [omdsh-dev/plugin-template](https://github.com/omdsh-dev/plugin-template) — 插件模板仓库（基于 turtle-ui 官方仓库）。
- [Small-tailqwq/dsh-tps](https://github.com/Small-tailqwq/dsh-tps) — TPS 指标插件。
- [disyli/dsh-tool-call-stats](https://github.com/disyli/dsh-tool-call-stats) — 进程内工具调用统计：提供 `tool_stats` 工具，按工具汇报调用次数、失败次数与平均耗时。
- [Areium/dsh-fail-logger](https://github.com/Areium/dsh-fail-logger) — 全模式调用工具失败自动实录：把原生工具 / PTC run_code / 代码内嵌工具调用的失败错因去重计数后写入 skill，越用越少错。
- [BiBoyang/dsh-eval-harness](https://github.com/BiBoyang/dsh-eval-harness) — DSH 插件评测框架：YAML 用例驱动真实 headless agent，断言工具调用/参数/返回与 token 用量，baseline 门禁做 CI 回归。
- [hust-open-atom-club/oh-dsh](https://github.com/hust-open-atom-club/oh-dsh) — 社区发行版：TUI、桌面端与 Web UI 统一体验，分层安装、一步到位。
- [BrambleXu/dsh-annotate](https://github.com/BrambleXu/dsh-annotate) — 面向 Vibe Coding 的浏览器元素标注插件：直接选取页面元素，并将结构化视觉反馈发送给 DeepSeek Harness Agent。
- [BrambleXu/dsh-prompt-profile](https://github.com/BrambleXu/dsh-prompt-profile) — DeepSeek Harness 可复用 Markdown Prompt Profile，支持单轮模型选择、参数替换和状态恢复。
- [BrambleXu/dsh-revdiff](https://github.com/BrambleXu/dsh-revdiff) — DeepSeek Harness 原生交互式 Git diff 审查，支持结构化批注并回传当前 Agent 会话。
- [lonelymoon87/dsh-gitflow](https://github.com/lonelymoon87/dsh-gitflow) — 增加需要审批的 Git 状态、diff、日志、提交、分支和可选检查点工具。
- [lonelymoon87/dsh-guardian](https://github.com/lonelymoon87/dsh-guardian) — 增加危险操作策略检查、输出脱敏和安全审查工作流。
- [Jesse-njx/dsh-plugin-manager](https://github.com/Jesse-njx/dsh-plugin-manager) — `dsh pm` 插件管理器：多源搜索（awesome 列表 + GitHub + npm）、按 profile 安装/移除/更新，以及 doctor 审计（清单、bundle patch、版本漂移）。
- [Jesse-njx/dsh-tmuxctl](https://github.com/Jesse-njx/dsh-tmuxctl) — 掌控你的 tmux 面板：list/send-keys/capture、在面板中运行长任务并 watch，破坏性命令需审批。
- [xingyingyuzhui/dsh-updater-ui](https://github.com/xingyingyuzhui/dsh-updater-ui) — 设置页中的 DSH 自助更新器：一键检查/拉取（git pull --ff-only）、自动后台检查、版本对比与更新说明预览，带红点提醒。
- [EvilIrving/dsh-repro](https://github.com/EvilIrving/dsh-repro) — /repro 导出最小可复现问题包：去 secret 的会话日志、失败命令与 git diff。
- [PerryLink/dsh-mcp-panel](https://github.com/PerryLink/dsh-mcp-panel) — 官方 MCP 客户端（dsh-mcp-client）的只读运行时管理面板：/mcp 命令与设置页 MCP 页签展示连接状态、已注册工具、错误与重连计数，脱敏展示并提供启停 patch 建议。
- [ICCuse/dsh-pain-point-check](https://github.com/ICCuse/dsh-pain-point-check) — 强制痛点检查：同一问题连续 2 个实验未收敛后注入三问、拦截非调查类工具调用直到答出、阻止同方向重试。
- [Jayden-X-L/forkprobe](https://github.com/Jayden-X-L/forkprobe) — 同一任务并行试跑多个技能，对比结果选出最优。
- [vlln/plugin-registry](https://github.com/vlln/plugin-registry) — 插件生态基建：浏览器面板管理官方 repository 插件（0 patch）+ make-dsh-plugin 插件开发引导技能。
- [forrestchang/dsh-multica-runtime](https://github.com/forrestchang/dsh-multica-runtime) — 让 dsh 运行时跑在 Multica 上。
- [DietCokewithSugar/dsh-user-experience](https://github.com/DietCokewithSugar/dsh-user-experience) — 帮你发现项目中可能存在的用户体验问题：自动走查 React/TypeScript 源码，定位问题并给出具体优化建议。
- [yflmq001/dsh-cost-tracker](https://github.com/yflmq001/dsh-cost-tracker) — 按模型追踪 token 成本：可配置缓存命中/未命中、输出与高峰时段单价，实时会话花费条，并标记未配置价格的模型。
- [slywalker2006/dsh-passwords](https://github.com/slywalker2006/dsh-passwords) — DSH Web UI 登录网关：首次配置、bcrypt + 静态加密（AES-256-GCM/HMAC）、防爆破、审计日志、TLS 1.2+ 与 80→443 跳转、CSRF 与防嵌框。
- [Yuuz12/dsh-webui-auth](https://github.com/Yuuz12/dsh-webui-auth) — WebUI 身份认证：HTTP/传输层强制登录（资源、插件 bundle、/api、WebSocket 四层防护），服务端会话 + HttpOnly Cookie。
- [Leon0555/dsh-lan-access](https://github.com/Leon0555/dsh-lan-access) — 局域网访问：Web GUI 绑定 0.0.0.0 + crypto.randomUUID polyfill（修复非安全上下文下 RPC 崩溃）。


### 🎮 娱乐

- [Nagi-ovo/dsh-ads](https://github.com/Nagi-ovo/dsh-ads) — 2005 年中文站点风格的整活广告插件：侧栏广告/信息流/角落弹窗 + 假关闭叉，素材全虚构。
- [omdsh-dev/dsh-gomoku](https://github.com/omdsh-dev/dsh-gomoku) — 与 AI 下五子棋，也可让 AI 对局比棋力。
- [AnacondaKC/dsh-stock-market](https://github.com/AnacondaKC/dsh-stock-market) — 有效解决了写代码的时候账户不能同时亏钱的 BUG。
- [hellodigua/dsh-emoji](https://github.com/hellodigua/dsh-emoji) — 为 AI 回复自动添加表情。
- [lhh010/dsh-minigames](https://github.com/lhh010/dsh-minigames) — 右侧小游戏面板：18 款离线小游戏，等模型回复时的摸鱼神器。
- [william-jin-cmu/dsh-stickers](https://github.com/william-jin-cmu/dsh-stickers) — 用户与 agent 双向表情贴纸互动。
- [vlln/whale-girl](https://github.com/vlln/whale-girl) — 桌面宠物（QQ 宠物形态）：右下角悬浮、可拖拽/投喂/玩耍。
- [Moeblack/deepseek-manners](https://github.com/Moeblack/deepseek-manners) — 给每次消息后注入感谢语，做个有礼貌的人。
- [HuanLinOTO/dsh-plugin-d399](https://github.com/HuanLinOTO/dsh-plugin-d399) — 模型生成时弹出小游戏菜单（wordle/消消乐，可扩展）。
- [omdsh-dev/dsh-auto-chess](https://github.com/omdsh-dev/dsh-auto-chess) — 自走棋：人机对战或双 AI 对弈。
- [AnacondaKC/dsh-douyin](https://github.com/AnacondaKC/dsh-douyin) — 侧栏短视频：原生播放器、系列导航、精确历史回放。
- [minybear/DeepSeek-Harness-Pet](https://github.com/minybear/DeepSeek-Harness-Pet) — Codex 风格桌面宠物：右下角悬浮动画精灵，随 agent 运行状态实时变化（工作、等待、报错、完成）。
- [anweat/dsh-web-search-pro](https://github.com/anweat/dsh-web-search-pro) — 增强型、可持久化的网页搜索：多引擎路由（DeepSeek/Exa/DDG/Bing/Jina + GitHub/B站/YouTube/V2EX/小红书/Twitter/Reddit/RSS）、SQLite+LRU 缓存、userscript 风格抽取、Playwright 渲染。
- [anweat/dsh-browser](https://github.com/anweat/dsh-browser) — 自包含浏览器运行时：Playwright（chromium）+ OpenCLI 作为插件本地依赖（全局复用回退），提供 `browser` 服务与 9 个交互式浏览器工具。
- [anweat/dsh-voice-webspeech](https://github.com/anweat/dsh-voice-webspeech) — 浏览器 Web Speech API 语音输入：零服务端、零密钥、零模型下载（Edge=Azure 语音、Chrome=Google 语音）。
- [anweat/dsh-restart](https://github.com/anweat/dsh-restart) — DSH 重启插件：可配置的重启方式（Node 原生/旧 PowerShell 适配）、重启后自动继续的提示词、可选看门狗自动拉起。
- [yyh-001/dsh-expression](https://github.com/yyh-001/dsh-expression) — 陪 AI 斗图的搞笑插件：说个感觉，AI 帮你搜到、发出那张恰到好处的真实表情包。


## 贡献

欢迎提 PR 收录你的插件：在 `README.md` 和 `README.zh.md` 的对应分类下各加一行，格式 `- [名称](链接) — 一句话描述`。

也请为你的插件仓库添加 [`dsh-plugin`](https://github.com/topics/dsh-plugin) topic，方便大家发现。

## 徽章

插件已被收录？欢迎在你的 README 里挂上徽章：

[![Awesome DSH Plugin](https://awesome-dsh-plugin.com/badge.svg)](https://awesome-dsh-plugin.com)

```markdown
[![Awesome DSH Plugin](https://awesome-dsh-plugin.com/badge.svg)](https://awesome-dsh-plugin.com)
```

## 免责声明

本项目是社区维护的索引。插件由各自作者开发与维护，收录不构成背书，亦不对任何插件的安全性、质量或维护状态作出保证。安装插件即在你的机器上运行第三方代码——请自行审阅源码、风险自担。本项目与 DeepSeek 无隶属关系。

