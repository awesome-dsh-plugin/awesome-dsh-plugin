# Awesome DeepSeek Harness (DSH) Plugin [![Awesome](https://awesome.re/badge.svg)](https://awesome.re) ![awesome · DSH plugin](https://awesome-dsh-plugin.com/badge.svg)

[![Awesome DSH Plugin](https://awesome-dsh-plugin.com/banner-zh.png)](https://awesome-dsh-plugin.com/zh/)

[English](README.md) | 中文

> [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（`dsh`）插件精选列表。

DeepSeek Harness 是 DeepSeek 开源的 agent harness——既是可直接运行的 Coding Agent（提供 Web 与 headless 两种形式），底层又是一套「一切皆插件」的框架：模型、工具、沙箱、会话存储、UI、乃至 Agent Loop 本身都是插件。插件既可以扩展官方 Coding Agent，也可以替换其核心部件，甚至组装出完全不同的东西。

本列表收录可通过 `dsh plugin add` 安装的社区插件（均声明了 `dsh.bundle` manifest）。

**108** 个插件 · 欢迎 [PR](#贡献)

## 目录

- [插件](#插件)
  - [🎨 UI 增强](#-ui-增强)
  - [💬 会话与消息](#-会话与消息)
  - [🛠️ 工具与能力](#️-工具与能力)
  - [🔁 工作流与自动化](#-工作流与自动化)
  - [🔔 通知与集成](#-通知与集成)
  - [🧑‍💻 开发与运行时](#-开发与运行时)
  - [🎮 娱乐](#-娱乐)
- [徽章](#徽章)
- [免责声明](#免责声明)

## 插件

### 🎨 UI 增强

- [dsh-tianshu-tui](https://github.com/huiliyi37/dsh-tianshu-tui) — DeepSeek Harness 的终端 UI（TUI）。
- [deepseek-harness-tui](https://github.com/openma-ai/deepseek-harness-tui) — Rust/ratatui 终端客户端，直接使用 DSH SDK JSON-RPC 协议，支持独立运行或作为 profile bundle 加载。
- [dsh-at-file](https://github.com/omdsh-dev/dsh-at-file) — Codex 风格的 `@file` 文件引用，输入框里直接搜索并引用工作区文件。
- [ui-status-label](https://github.com/alingalingling/ui-status-label) — 把鲸鱼娘思考时的 "deep diving" 状态文案自定义成任意你想要的样子。
- [dsh-openpencil](https://github.com/ZSeven-W/dsh-openpencil) — OpenPencil 设计预览与编辑插件。
- [dsh-visualize](https://github.com/Nagi-ovo/dsh-visualize) — 对话内生成式 UI：模型把交互式 HTML 卡片直接画进会话流，带流式预览与沙箱渲染。
- [dsh-side-panel](https://github.com/ccq1/dsh-side-panel) — 侧边栏集成文件浏览器、终端和 Git 审查，方便预览文件。
- [dsh-focus-chat](https://github.com/dingyi222666/dsh-focus-chat) — 「聚焦会话」精简视图，只关注最终产出结果。
- [dsh-genui](https://github.com/omdsh-dev/dsh-genui) — 助手回复内渲染交互式 UI 组件：布局、图表、表单、测验、mermaid、3D 场景与回传事件循环。
- [dsh-annotation](https://github.com/omdsh-dev/dsh-annotation) — 选中文字→批注→随消息发送，回复按批注逐条对照。
- [dsh-navbar](https://github.com/vlln/dsh-navbar) — 对话节点导航条，右缘节点串快速跳转 user 消息。
- [dsh-task-status](https://github.com/vlln/dsh-task-status) — 后台任务状态条：对话页任务进度 + 实时输出 tail。
- [dsh-web-archive](https://github.com/renat3u/dsh-web-archive) — 折叠对话中的 Think、Bash 等「无用消息」。
- [dsh-spotlight](https://github.com/0xsline/dsh-spotlight) — 键盘优先的命令面板（command palette）。
- [dsh-101](https://github.com/bill9109/dsh-101) — DSH 文档阅读模式。
- [dsh-drag-and-drop](https://github.com/bill9109/dsh-drag-and-drop) — 跨平台文件拖拽与原始路径插入，无需复制文件。
- [dsh-deeplink](https://github.com/qyw233/dsh-deeplink) — `?session=` / `?workspace=` 深链直达指定项目对话。
- [dsh-diff-viewer](https://github.com/lehhair/dsh-diff-viewer) — PiUI 风格 diff 查看器，替换 write/edit 工具调用的默认 DiffBlock。
- [ex-setting](https://github.com/omdsh-dev/ex-setting) — DSH 的设置扩展。
- [web-components](https://github.com/omdsh-dev/web-components) — Web Components 支持。
- [dsh-turn-navigator](https://github.com/vibeinging/dsh-turn-navigator) — 对话轮次导航。
- [dsh-milestone](https://github.com/SnowCrescenter-tech/dsh-milestone) — 右侧圆点时间轴导航条，点击跳转到任意用户消息。

### 💬 会话与消息

- [dsh-turn-rewind](https://github.com/Anionex/dsh-turn-rewind) — 对话回退：基于持久 Change Ledger 回滚会话与工作区状态。
- [dsh-crosstalk](https://github.com/Jesse-njx/dsh-crosstalk) — 跨会话消息：本机任意会话都可像 Claude Code 一样列出并互发消息，基于本地心跳注册表与收件箱。
- [distill](https://github.com/LoserFox/distill) — 自动对话蒸馏：后台 subagent 反省 + 技能 create/update。
- [dsh-share](https://github.com/hellodigua/dsh-share) — 一键分享你的对话。
- [dsh-message-edit](https://github.com/Moeblack/dsh-message-edit) — 基于分支的消息编辑、reroll、重试与版本时间线。
- [dsh-mnemon](https://github.com/omdsh-dev/dsh-mnemon) — Mnemon 深度集成：本地三层记忆（Runtime Memory、可检索 Documents、受监督 Memory Spaces）。
- [nowledge-mem-deepseek-harness](https://github.com/nowledge-co/nowledge-mem-deepseek-harness) — 给所有 AI 工具和 Agent 共用的一层记忆：注入 Context Bundle、提示时检索、MCP 工具与回合结束 DSH 线程捕获。
- [dsh-memory](https://github.com/Jesse-njx/dsh-memory) — 基于 DSH 无损会话日志的引用式记忆：蒸馏出的事实带 `(sessionId, eventRange)` 引用，可随时展开回原始日志片段。
- [dsh-sidechain](https://github.com/Buyi-wsgzg/dsh-sidechain) — `/side` 持续性侧会话与 `/btw` 一次性侧问，在临时 fork 中运行、不写入主会话历史。
- [dsh-conversation-share](https://github.com/bill9109/dsh-conversation-share) — 分享任意段落的对话。
- [dsh-explain](https://github.com/yuezengwu/dsh-explain) — 本地优先学习模式：跨会话全局学习线程、按来源讲解。
- [dsh-prompt-studio](https://github.com/Moeblack/dsh-prompt-studio) — 带实时预览的用户/内置 system prompt 分节编辑器。
- [dsh-chat-import](https://github.com/Nwflower/dsh-chat-import) — 把 Claude Code / Codex / ChatGPT / Cursor 的聊天记录全保真导入为可续聊的 DSH 会话。

### 🛠️ 工具与能力

- [dsh-vision-toolkit](https://github.com/Anionex/dsh-vision-toolkit) — 让纯文本模型更好地做视觉任务：带意图的图片问答、长截图 OCR、UI 还原等。
- [dsh-custom-tool](https://github.com/omdsh-dev/dsh-custom-tool) — 用 Monaco 编辑器创建和管理沙箱化的自定义 JavaScript 工具。
- [dsh-computer-use](https://github.com/Anionex/dsh-computer-use) — macOS 电脑控制：Accessibility 观测、过期状态拒绝、作用域权限与安全输入。
- [dsh-data-agent](https://github.com/omdsh-dev/dsh-data-agent) — 让 AI 帮你连数据库、写 SQL。
- [dsh-toolkit](https://github.com/omdsh-dev/dsh-toolkit) — 零依赖工具包：time / encoding / json / calculator / csv / regex / markdown / diff / stat / schema 十件套一键安装。
- [dsh-tool-csv](https://github.com/omdsh-dev/dsh-tool-csv) — CSV 解析/查询/统计/转换（RFC 4180），零依赖状态机解析器。
- [dsh-tool-calculator](https://github.com/omdsh-dev/dsh-tool-calculator) — 安全的数学表达式求值器，零依赖递归下降解析器。
- [dsh-tool-diff](https://github.com/omdsh-dev/dsh-tool-diff) — 文本/JSON/CSV/Markdown 结构化比较与 unified diff。
- [dsh-tool-encoding](https://github.com/omdsh-dev/dsh-tool-encoding) — base64/url/hex 编解码、常用哈希、UUID 生成。
- [dsh-tool-json](https://github.com/omdsh-dev/dsh-tool-json) — JMESPath 子集 JSON 查询。
- [dsh-tool-markdown](https://github.com/omdsh-dev/dsh-tool-markdown) — HTML↔Markdown 转换、GFM 表格规范化、目录生成。
- [dsh-tool-regex](https://github.com/omdsh-dev/dsh-tool-regex) — 正则测试/提取/安全替换/静态解释（不执行代码）。
- [dsh-tool-schema](https://github.com/omdsh-dev/dsh-tool-schema) — JSON Schema 验证：validate/paths/explain/normalize。
- [dsh-tool-stat](https://github.com/omdsh-dev/dsh-tool-stat) — 描述统计/百分位数/频数分布/相关性。
- [dsh-tool-time](https://github.com/omdsh-dev/dsh-tool-time) — 严格 ISO 8601 解析、IANA 时区转换、UTC 日历运算。
- [dsh-kb-sieve](https://github.com/omdsh-dev/dsh-kb-sieve) — 从 md/txt/docx/pdf 构建可审计知识库包（SQLite FTS5），确定性检索与原文阅读。
- [dsh-plugin-mineru](https://github.com/HuanLinOTO/dsh-plugin-mineru) — 向模型暴露 MineRU 文档解析工具。
- [dsh-cowork](https://github.com/Jesse-njx/dsh-cowork) — doc_read/doc_write：以有界、单元格寻址的方式读写 xlsx / pdf / docx / pptx / ipynb，另附 MCP 服务器与 CLI。
- [dsh-skillport](https://github.com/Jesse-njx/dsh-skillport) — 把已有的 Agent Skills（SKILL.md）技能库带进 DSH：扫描 Claude/Codex/Cursor/Gemini 技能目录、注入渐进式索引，按需加载技能正文。
- [dsh-tool-search](https://github.com/vibeinging/dsh-tool-search) — 按 agent 的按需工具发现与渐进式 schema 披露。
- [dsh-openmaic](https://github.com/THU-MAIC/dsh-openmaic) — OpenMAIC 教学：课堂、幻灯片、交互组件与苏格拉底式教学。
- [dsh-scholar](https://github.com/lzszq/dsh-scholar) — 学术助手插件。
- [dsh-apple-mode](https://github.com/jihongboo/dsh-apple-mode) — DSH 的 Xcode AI 集成：26 个 Xcode MCP 工具（mcpbridge）+ Apple 平台技能 + Xcode Intelligence 风格 persona（agent preset 或全局 bundle）。
- [dsh-continual-evolve](https://github.com/ZK-Andy/dsh-continual-evolve) — 持续自进化：从会话轨迹沉淀版本化、可审计、可回滚的 harness 状态（提示词/记忆/技能/子代理规格），带审查门禁与技能热加载。
- [dsh-recommend](https://github.com/zp-home/dsh-recommend) — DSH 插件透明排行与推荐：每日自动抓取 `dsh-plugin` 话题生态，公开评分模型，提供 rank/search/recommend 工具与设置页榜单。


### 🔁 工作流与自动化

- [dsh_workflow](https://github.com/icetomoyo/dsh_workflow) — 把 UltraCode 式多 Agent 调度带给 DSH：可生成、可保存、可治理、可观察、可恢复的 Workflow 层。
- [dsh-agent-teams](https://github.com/NanmiCoder/dsh-agent-teams) — AgentTeams 多智能体团队。
- [dsh-automation](https://github.com/titanwings/dsh-automation) — 定时任务：让 Coding 任务按计划在全新 Agent Session 中运行，保留可审计历史。
- [dsh-routines](https://github.com/Jesse-njx/dsh-routines) — 定时 Agent：按 cron 计划运行 prompt，把摘要送到你已有的地方，内置重叠/漏跑/超时安全策略。
- [dsh-plannotator](https://github.com/titanwings/dsh-plannotator) — 计划批注：选中计划原文逐条批注，结构化反馈送回 Agent。
- [dsh-loop](https://github.com/vlln/dsh-loop) — 定时循环：`/loop` 命令 + loop 工具 + 活动状态条。
- [dsh-sentinel](https://github.com/fuhefei/dsh-sentinel) — 条件驱动唤醒：file/command/http/process/webhook 持久监视，触发即唤醒 agent。
- [dsh-deep-research](https://github.com/omdsh-dev/dsh-deep-research) — 自适应深度研究编排器（基于官方 workflow 引擎）。
- [dsh-inspect](https://github.com/omdsh-dev/dsh-inspect) — 发现问题→修复交付→质量复查的对抗式闭环工具集。
- [dsh-track](https://github.com/fakechris/dsh-track) — 嵌入式任务管理引擎：决策点协议、念头捕获墙、Linear 形 issue 存储。
- [dsh-advisor](https://github.com/btspoony/dsh-advisor) — 搭配一个副模型，每轮被动审查并注入见解。

### 🔔 通知与集成

- [dsh-open-in-vscode](https://github.com/omdsh-dev/dsh-open-in-vscode) — 从 Web GUI 一键在 VS Code 中打开工作区目录。
- [dsh-notification](https://github.com/omdsh-dev/dsh-notification) — 回合完成桌面通知，按结果分控 + 关键词过滤。
- [dsh-acp-for-bitfun](https://github.com/bobleer/dsh-acp-for-bitfun) — BitFun 与 DSH 的 ACP 交互对接。
- [telegram](https://github.com/LoserFox/telegram) — Telegram Bot API 桥接：长轮询、per-chat 会话、HTML 格式化。
- [dsh-chatnode-wechat](https://github.com/Jesse-njx/dsh-chatnode-wechat) — 通过 iLink 网关在微信里与 DSH agent 聊天、监控与审批：双向文本、会话切换、进度摘要与编号审批提示。
- [dsh-session-notification](https://github.com/dingyi222666/dsh-session-notification) — 会话完成等四种状态的通知响应，支持浏览器提示。
- [dsh-web-ui-notify](https://github.com/bill9109/dsh-web-ui-notify) — 桌面通知提醒。
- [dsh-webbridge](https://github.com/bill9109/dsh-webbridge) — DSH 结合 Kimi WebBridge。

### 🧑‍💻 开发与运行时

- [fabric](https://github.com/omdsh-dev/fabric) — 类似 MC Fabric 的 hook 处理器。
- [dsh-git-identity](https://github.com/LoserFox/dsh-git-identity) — git 提交固定使用环境自身作者身份，环境变量注入压过一切 `git config` 设置。
- [dsh-context-doctor](https://github.com/Zhenyu98/dsh-context-doctor) — 上下文注入审计：统计指令链/技能目录/工具 schema 的 token 成本，检测重复与冲突。
- [dsh-plugin-check](https://github.com/omdsh-dev/dsh-plugin-check) — 插件健康检查：扫描清单协议/patch 格式/构建陷阱，零依赖只读。
- [dsh-security-audit](https://github.com/omdsh-dev/dsh-security-audit) — 本机安全审计：配置/插件来源/会话/网络暴露面，只读脱敏风险报告。
- [dsh-session-health](https://github.com/omdsh-dev/dsh-session-health) — 会话文件帧级扫描诊断（torn/损坏/空会话检测）。
- [dsh-evolve](https://github.com/william-jin-cmu/dsh-evolve) — 自进化：agent 在会话内给自己热挂载/卸载持久化插件。
- [dsh-trace](https://github.com/vibeinging/dsh-trace) — 遥测后端：把 turns、model steps、tool calls 导出到 yiTrace。
- [sandbox-micro](https://github.com/omdsh-dev/sandbox-micro) — microsandbox 沙箱支持。
- [sandbox-mxc](https://github.com/omdsh-dev/sandbox-mxc) — 微软跨平台沙盒支持。
- [sandbox-nono](https://github.com/omdsh-dev/sandbox-nono) — nono 沙盒支持。
- [dsh-agent-budget](https://github.com/vibeinging/dsh-agent-budget) — agent 树 token 预算管理。
- [dsh-llm-fallbacks](https://github.com/btspoony/dsh-llm-fallbacks) — 基于角色的模型重试与备用策略。
- [dsh-polyglot](https://github.com/Jesse-njx/dsh-polyglot) — DSH 的模型切换器：指向任意 OpenAI 兼容端点，内置精选免费/低价 DeepSeek 服务商预设，免费额度限流时自动回退。
- [dsh-tool-approval](https://github.com/ilharp/dsh-tool-approval) — 手动审批模式（Manual/Ask Mode）。
- [plugin-template](https://github.com/omdsh-dev/plugin-template) — 插件模板仓库（基于 turtle-ui 官方仓库）。
- [Qwen-MM-Plugins](https://github.com/omdsh-dev/Qwen-MM-Plugins) — Qwen 多模态插件支持。
- [dsh-tps](https://github.com/Small-tailqwq/dsh-tps) — TPS 指标插件。
- [dsh-fail-logger](https://github.com/Areium/dsh-fail-logger) — 全模式调用工具失败自动实录：把原生工具 / PTC run_code / 代码内嵌工具调用的失败错因去重计数后写入 skill，越用越少错。


### 🎮 娱乐

- [dsh-ads](https://github.com/Nagi-ovo/dsh-ads) — 2005 年中文站点风格的整活广告插件：侧栏广告/信息流/角落弹窗 + 假关闭叉，素材全虚构。
- [dsh-gomoku](https://github.com/omdsh-dev/dsh-gomoku) — 与 AI 下五子棋，也可让 AI 对局比棋力。
- [dsh-stock-market](https://github.com/AnacondaKC/dsh-stock-market) — 有效解决了写代码的时候账户不能同时亏钱的 BUG。
- [dsh-emoji](https://github.com/hellodigua/dsh-emoji) — 为 AI 回复自动添加表情。
- [dsh-minigames](https://github.com/lhh010/dsh-minigames) — 右侧小游戏面板：18 款离线小游戏，等模型回复时的摸鱼神器。
- [dsh-stickers](https://github.com/william-jin-cmu/dsh-stickers) — 用户与 agent 双向表情贴纸互动。
- [whale-girl](https://github.com/vlln/whale-girl) — 桌面宠物（QQ 宠物形态）：右下角悬浮、可拖拽/投喂/玩耍。
- [deepseek-manners](https://github.com/Moeblack/deepseek-manners) — 给每次消息后注入感谢语，做个有礼貌的人。
- [dsh-plugin-d399](https://github.com/HuanLinOTO/dsh-plugin-d399) — 模型生成时弹出小游戏菜单（wordle/消消乐，可扩展）。
- [dsh-auto-chess](https://github.com/omdsh-dev/dsh-auto-chess) — 自走棋：人机对战或双 AI 对弈。
- [dsh-douyin](https://github.com/AnacondaKC/dsh-douyin) — 侧栏短视频：原生播放器、系列导航、精确历史回放。

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
