# Awesome DeepSeek Harness Plugins

[![Awesome](https://awesome.re/badge.svg)](https://awesome.re)
[![欢迎贡献](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat-square)](../CONTRIBUTING.md)

> 面向 DeepSeek Harness（DSH）的社区精选、厂商中立 Plugin 索引——覆盖开发工具、数据工作流、媒体、运维与日常生活等场景。

**语言：** [English](../README.md) | 简体中文

DeepSeek Harness Plugin 能让智能体连接工具、服务、设备和可复用的工作流。本索引的范围刻意保持开放：只要它能赋予智能体有价值的现实能力，就值得被收录。

## 目录

- [快速开始](#快速开始)
- [Plugin 索引](#plugin-索引)
  - [开发工具](#开发工具)
  - [智能体编排与自动化](#智能体编排与自动化)
  - [效率与协作](#效率与协作)
  - [数据、研究与知识](#数据研究与知识)
  - [云、DevOps 与可观测性](#云devops-与可观测性)
  - [AI、设计与媒体](#ai设计与媒体)
  - [商业、金融与电商](#商业金融与电商)
  - [生活、设备与物理世界](#生活设备与物理世界)
- [提交 Plugin](#提交-plugin)
- [索引规则](#索引规则)
- [许可证](#许可证)

## 快速开始

1. 在下方选择分类，打开目标 Plugin 的仓库或市场页面。
2. 按该 Plugin 的说明完成 DeepSeek Harness 安装与配置。
3. 如有要求，重启或重新加载 DeepSeek Harness。

> 本索引链接到第三方项目。安装前，请自行检查源码、权限范围及数据处理政策。

## Plugin 索引

<!-- CATALOG:START -->
### 开发工具

- [billion-context-dsh](https://github.com/Tyan66666/billion-context-dsh) — 面向 DeepSeek Harness 的模型驱动上下文压缩（ACP），移植自 billion-context-pi——由模型决定何时压缩、压缩什么。

- [Code2Skill](https://github.com/leechen298/Code2Skill) — 从用户授权的源码生成 Function、MCP 工具、工作流 Skill 与离线测试包。

- [create-dsh-plugin](https://github.com/whyihaveyou/dsh-suite/tree/main/packages/create-dsh-plugin) — DSH 插件脚手架，提供工具、事件和 Web UI 模板及内置冒烟测试。

- [deepseek-harness-acp](https://github.com/openma-ai/deepseek-harness-acp) — ACP profile 插件与独立 server，把完整 DSH agent 接入 Zed 等 ACP 客户端，并共享 DSH 凭据与会话。

- [dhicoc/dsh-reverse-skill](https://github.com/dhicoc/dsh-reverse-skill) — 一个为逆向工程和经授权安全研究路由 85 项技能包的 DeepSeek Harness Cordis 插件。

- [dsh-artifact](https://github.com/william-jin-cmu/dsh-artifact) — 提供 send_artifact 工具，校验模型产出的文件并通过 dsh 标准事件流交付结构化描述子，任何客户端都可按需呈现。

- [dsh-balance-meter](https://github.com/Ghost011118/dsh-balance-meter) — 在 DSH Web 输入框下方实时显示 DeepSeek 账户余额与本场会话花费，自动抓取官方价格并支持峰谷计价。

- [dsh-bash-encoding](https://github.com/lhh010/dsh-bash-encoding) — 自动识别并解码 UTF-16LE、UTF-8、GBK 等 Bash 输出编码，修复 Windows 与 WSL 下的乱码。

- [dsh-billing](https://github.com/TheTianzz/dsh-billing) — 以会话头部双胶囊、斜杠命令和智能体工具展示 DeepSeek 账户余额与本会话费用，单价可配置并每 12 小时自动同步官方价格。

- [dsh-chat-import](https://github.com/Nwflower/dsh-chat-import) — 将编码智能体的对话历史导入为可恢复的 DeepSeek Harness 会话，并支持导出和同步到 Claude Code。

- [dsh-custom-tool](https://github.com/FSMargoo/dsh-custom-tool) — 通过 Monaco 编辑器及模型驱动的生命周期创建和管理沙箱化 JavaScript 工具。

- [dsh-git-identity](https://github.com/LoserFox/dsh-git-identity) — 将 Git 提交作者身份固定为当前环境身份，并优先使用已登录的 GitHub CLI 账号。

- [dsh-github-login](https://github.com/Noob-stupid/dsh-github-login) — 一个将令牌同步到 gh CLI 配置的可视化 GitHub 设备码登录工具。

- [dsh-movein](https://github.com/sjh9714/dsh-movein) — 一条命令把整套 Claude Code 或 Codex CLI 配置迁入 DSH：技能、斜杠命令、MCP 服务器、hooks、子代理与权限规则，默认先出预演清单，搬完可用 doctor 体检。

- [dsh-open-in-vscode](https://github.com/FSMargoo/dsh-open-in-vscode) — 可从 DeepSeek Harness Web 界面直接在 VS Code 中打开工作区目录。

- [dsh-opencodego-usage](https://github.com/BeiZi6/dsh-opencodego-usage) — DSH Web GUI 的 OpenCodeGo 额度监视器，提供滚动、周和月度用量视图。

- [dsh-recommend](https://github.com/zp-home/dsh-recommend) — DSH 插件透明排行与推荐：每日自动抓取 dsh-plugin 话题生态、公开评分模型，提供榜单/搜索/推荐工具与设置页排行榜。

- [dsh-settings-plus](https://github.com/oneinitAI/dsh-settings-plus) — DeepSeek Harness 高级设置管理器，支持表单级和文件级配置编辑及插件设置 SDK。

- [dsh-spend](https://github.com/nonewind/dsh-spend) — DSH Web 的用量与预计花费统计，支持按模型、日期和会话查看。

- [dsh-suite](https://github.com/whyihaveyou/dsh-suite) — DSH 插件活目录，提供兼容性 CI、可搜索目录和内置插件商店。

- [plugin-manager](https://github.com/whyihaveyou/dsh-suite/tree/main/packages/plugins/plugin-manager) — DSH Web UI 内置插件商店，支持浏览、搜索、安装、兼容徽章和已装列表。

- [plugin-registry](https://github.com/vlln/plugin-registry) — 基于浏览器的 Plugin 管理控制台，并提供官方 DSH Plugin 开发引导。

### 界面与用户体验

- [deepseek-harness-tui](https://github.com/openma-ai/deepseek-harness-tui) — Rust 终端客户端，直接使用 DSH SDK JSON-RPC 协议，支持独立运行或作为 profile bundle 加载。

- [DSH Better Sidebar](https://github.com/omdsh-dev/DSH-better-sidebar) — 完整的侧边栏工作台，支持扩展 Tab，并内置文件查看与编辑、终端、Git 和子智能体工具。

- [dsh-annotation](https://github.com/omdsh-dev/dsh-annotation) — 提供 Codex 风格文本批注：选中文字、将批注附加到下一条消息，并获得逐条对应的回复。

- [dsh-at-file](https://github.com/FSMargoo/dsh-at-file) — 提供 Codex 风格的 @file 引用，可搜索工作区文件并将内容附加到提示词。

- [dsh-browser-panel](https://github.com/dsh-external/dsh-browser-panel) — 在 DSH Web UI 中嵌入有头浏览器，让智能体操作真实浏览器并向用户展示每一步。

- [dsh-cc-tui](https://github.com/ccch1mneyyy/dsh-cc-tui) — Claude Code 风格的全屏终端界面，提供流式思考展示、回滚控制及上下文/TPS 指示器。

- [dsh-deepseek-quota](https://github.com/yingjunnan/dsh-deepseek-quota) — 在 DSH Web 页面右下角悬浮卡片展示 DeepSeek API 剩余额度，支持自动刷新与手动刷新。

- [dsh-desktop](https://github.com/howlma/dsh-desktop) — Windows 桌面客户端：打开即拉起或复用 Harness 网关，窗口内嵌官方 Web 界面；托盘常驻，可选开机自启。

- [dsh-genui](https://github.com/omdsh-dev/dsh-genui) — 在助手回复中内联渲染可交互 UI 组件，支持图表、表单、测验、Mermaid 图、3D 场景和模型动作事件。

- [dsh-grok-tui](https://github.com/chen-001/dsh-grok-tui) — 借用grok-build tui使用dsh

- [dsh-input-history](https://github.com/lhh010/dsh-input-history) — 提供终端风格的 Ctrl+Up / Ctrl+Down 已发送消息导航，并保留最新未发送草稿。

- [dsh-message-edit](https://github.com/Moeblack/dsh-message-edit) — 为 DeepSeek Harness 对话提供基于分支的消息编辑、重新生成、重试和版本时间线。

- [dsh-minigames](https://github.com/lhh010/dsh-minigames) — 为 DSH Web UI 添加可扩展的 18 款离线小游戏面板，适合等待智能体工作时休息。

- [dsh-navbar](https://github.com/vlln/dsh-navbar) — 添加右侧对话节点导航条，可快速跳转到各个用户消息节点。

- [dsh-paste-input](https://github.com/lhh010/dsh-paste-input) — 增强文件输入，支持粘贴、拖拽和选择文件；发送时自动将文件复制到会话工作区。

- [dsh-plugin-hub](https://github.com/Noob-stupid/dsh-plugin-hub) — DSH Web UI 插件管理器，支持一键控制和 GitHub dsh-plugin 市场。

- [dsh-plugin-wallpaper](https://github.com/Tree-Summer/dsh-plugin-wallpaper) — 为 DSH Web UI 设置自定义壁纸，并控制主界面、侧边栏、输入区和气泡的显示。

- [dsh-qq2006](https://github.com/LaplaceYoung/dsh-qq2006) — DeepSeek Harness Web UI 的可切换 QQ2006 皮肤，提供珊瑚蓝主题和复古素材。

- [dsh-skin](https://github.com/KinGao294/dsh-skin) — Codex 风格换肤 + 自定义背景插件：内置多套 --dsw-alias-* 配色，主画布/侧边栏半透明壁纸（overrideTokens），支持透明度与模糊调节。

- [dsh-stickers](https://github.com/william-jin-cmu/dsh-stickers) — 同一份表情包 catalog 同时服务 Web UI 选择器、/sticker 命令和智能体 send_sticker 工具，提供双角色变体与工作流反应表情。

- [dsh-sticky-disclosure](https://github.com/Han-1413141/dsh-sticky-disclosure) — 一键收起 DSH Web 会话中所有展开的区块（Think 思考行、工具卡片），常驻计数按钮 + 可自定义快捷键。

- [dsh-task-status](https://github.com/vlln/dsh-task-status) — 在 DSH 对话页展示后台任务进度和实时输出 tail。

- [dsh-theme-plugin](https://github.com/BeiZi6/dsh-theme-plugin) — DSH Web GUI 主题工作室，提供内置预设、可自定义配色和即时主题切换。

- [dsh-track](https://github.com/fakechris/dsh-track) — 嵌入式任务管理引擎，提供决策点、念头捕获墙和 Linear 风格的 issue 存储。

- [dsh-turn-index](https://github.com/Simon314620/dsh-turn-index) — 轮次索引侧边栏：列出每一轮用户提问，点击跳转到对应位置，滚动时自动高亮当前轮次。

- [dsh-ui-progress](https://github.com/lhh010/dsh-ui-progress) — 在 Web UI 中常驻显示会话进度、实时 token 生成速率、中断状态和待办提醒。

- [dsh-ui-whale](https://github.com/lhh010/dsh-ui-whale) — 为 DSH Web UI 提供会随智能体活动作出反应的手绘像素鲸鱼伙伴。

- [dsh-web-review](https://github.com/CanglongCl/dsh-web-review) — 在 DSH Web 中嵌入隔离网页预览，通过元素批注和可视化调整指导源码修改。

- [Prompt Studio](https://github.com/Moeblack/dsh-prompt-studio) — 编辑用户与内置系统提示词段落，支持实时预览。

- [whale-girl](https://github.com/vlln/whale-girl) — DSH Web GUI 的可拖拽互动桌面宠物伙伴，支持投喂和玩耍等交互。

### 智能体编排与自动化

- [dsh-approval-gate](https://github.com/moon09300731/dsh-approval-gate) — DSH 风险门控自动审批：安全操作自动批准，风险操作转人工审批。

- [dsh-evolve](https://github.com/william-jin-cmu/dsh-evolve) — 让智能体在会话中现场编写、热挂载并可逆卸载自己的 cordis 插件，新工具、提示词规则和事件钩子重启后自动恢复。

- [dsh-harness-mcp-server](https://github.com/chushixixin/dsh-harness-mcp-server) — 把 DeepSeek Harness 的 agent 能力暴露为 MCP server，让任意 MCP 客户端（如 Hermes）驱动 Harness 执行编码任务。

- [dsh-loop](https://github.com/vlln/dsh-loop) — 通过 /loop 命令、loop 工具和活动状态条提供定时循环能力。

- [dsh-preset-flash-director](https://github.com/zhaoyilun/dsh-preset-flash-director) — 一个节省 token 的 DeepSeek Harness 智能体预设，将深度思考任务委派给专家子智能体。

- [mstar-harness](https://github.com/btspoony/mstar-harness) — 面向结构化 Harness 循环工程的技能驱动工作流智能体 Plugin。

- [plugin-team-board](https://github.com/whyihaveyou/dsh-suite/tree/main/packages/plugins/plugin-team-board) — 由 Cordis 服务键支持的共享多智能体任务板。

### 效率与协作

- [deepseek-manners](https://github.com/Moeblack/deepseek-manners) — 给每次助手回复追加一句感谢语。

- [dsh-companion](https://github.com/william-jin-cmu/dsh-companion) — Cetus macOS 桌面智能体的 DeepSeek Harness 发行版：常驻桌面聊天伙伴，支持全局快捷键、屏幕上下文、定时任务和文件递送。

- [dsh-im-hub](https://github.com/ThreeBody6666/dsh-im-hub) — DeepSeek Harness 多平台 IM 网关，集成飞书、企业微信和 Telegram，并提供每聊天独立智能体会话。

- [dsh-lark-meeting-notifier](https://github.com/yeruizhi/dsh-lark-meeting-notifier) — 飞书会议提醒面板，提供今天/明天视图和多闹钟闪烁提醒。

- [dsh-notification](https://github.com/FSMargoo/dsh-notification) — 在 DeepSeek Harness 回合完成时发送桌面通知，并支持按结果和关键词制定规则。

- [dsh-share](https://github.com/hellodigua/dsh-share) — 一键分享 DeepSeek Harness 对话。

- [plugin-notify](https://github.com/whyihaveyou/dsh-suite/tree/main/packages/plugins/plugin-notify) — 在回合完成、出错或需要审批时发送 IM webhook 和本地通知。

- [plugin-session-export](https://github.com/whyihaveyou/dsh-suite/tree/main/packages/plugins/plugin-session-export) — 将只追加会话日志导出为可读的 Markdown 或 HTML。

### 数据、研究与知识

- [context-doctor](https://github.com/Zhenyu98/dsh-context-doctor) — 看清模型每个请求到底背着多少上下文：指令链/技能目录/工具 schema 的 token 成本逐项量化，自动检测重复与冲突，给出可执行裁剪建议（Web 圆环面板 + context_audit 工具，全程只读）。

- [cross-harness-cite](https://github.com/dsh-external/cross-harness-cite) — 让 DeepSeek Harness 引用 Codex 与 Claude Code 中相关的历史对话。

- [dsh-artifact-library](https://github.com/wyq183/dsh-artifact-library) — DeepSeek Harness 本地优先的产物与资料库：自动采集 AI 产出、AI 整理分类（摘要/标签）、跨会话全文检索、项目级总览。

- [dsh-data-agent](https://github.com/dsh-external/dsh-data-agent) — 帮助智能体连接数据库并编写 SQL 以完成数据任务。

- [dsh-memory-evolve](https://github.com/dsh-external/dsh-memory-evolve) — 提供带 Git 分支感知和后台技能进化能力的跨会话长期记忆。

- [dsh-mneme](https://github.com/modusensus/dsh-mneme) — 面向 DeepSeek Harness 的跨会话记忆插件：SQLite + 可人工编辑的 Markdown 双写，autoDream 后台巩固，6 个记忆工具，完全离线语义检索（本地向量 / 精排 / 聚类），198 个测试。

- [dsh-mnemon](https://github.com/omdsh-dev/dsh-mnemon) — Mnemon 驱动的本地记忆系统：三层存储（运行时热记忆、项目档案 Documents、长期记忆体 Memory Spaces），受监督写回、检索工具与 Web UI。

- [dsh-openbiliclaw](https://github.com/whiteguo233/dsh-openbiliclaw) — 将本地 OpenBiliClaw 内容推荐智能体接入 DSH，提供常驻界面和 22 个 Agent Bridge 工具。

- [dsh-session-search](https://github.com/dsh-external/dsh-session-search) — 支持跨 DSH、Codex、Claude Code、pi 与 OpenCode 会话的全文搜索。

### 云、DevOps 与可观测性

- [dsh-cost-meter](https://github.com/Han-1413141/dsh-cost-meter) — DeepSeek Harness 会话与当日 API 费用、预算与官方余额统计插件：历史看板、峰谷计价与官方价格一键同步。

- [dsh-harness-ops](https://github.com/fakechris/dsh-harness-ops) — 运维工具箱，提供 A/B 快照升级、自动恢复、回滚和诊断式自愈命令。

### AI、设计与媒体

- [DSH OpenPencil](https://github.com/ZSeven-W/dsh-openpencil) — 连接 DeepSeek Harness 与 OpenPencil，让智能体创建、编辑、预览和验证可交互的多页面设计画布。

- [dsh-attachment-vision](https://github.com/endlass/dsh-attachment-vision) — GUI 附件图片自动转写为本地路径，并提供连接任意 OpenAI 兼容视觉模型的 view_image 桥接——为纯文本 DeepSeek 模型提供端到端视觉能力。

- [dsh-emoji](https://github.com/hellodigua/dsh-emoji) — 为 DeepSeek Harness 中的 AI 回复自动添加表情符号。

- [dsh-vision](https://github.com/william-jin-cmu/dsh-vision) — 为纯文本 DeepSeek 模型提供连接 OpenAI 兼容视觉语言模型的 view_image 桥接能力。

- [dsh-vision-toolkit](https://github.com/Anionex/dsh-vision-toolkit) — 提供图像问答、长截图 OCR、UI 还原、视觉定位、像素差异和 Artifacts 能力。

- [dsh-vision-tools](https://github.com/moon09300731/dsh-vision-tools) — DeepSeek Harness 视觉工具包：通过 vision_understand 将纯文本 DeepSeek 模型桥接到 OpenAI 兼容视觉 API。

### 商业、金融与电商

- [shopline-ai-toolkit-dsh](https://github.com/lunw/shopline-ai-toolkit-dsh) — 面向 DeepSeek Harness 的 SHOPLINE AI 工具包，接入官方 SHOPLINE Developer MCP 服务并提供七个智能体技能。

### 生活、设备与物理世界

- [dsh-adb](https://github.com/SamXiaBing/dsh-adb) — DSH 的 ADB 设备与台架操作：设备发现、logcat 流、APK 安装、文件传输和性能快照。
<!-- CATALOG:END -->

## 提交 Plugin

欢迎贡献。请先阅读[贡献指南](../CONTRIBUTING.md)，然后在 [`catalog/plugins.json`](../catalog/plugins.json) 中添加中英双语条目，并执行：

```bash
python scripts/generate_readmes.py
python scripts/generate_readmes.py --check
```

第一条命令会重新生成两种语言的页面；第二条命令会验证提交的页面与索引源数据一致。

## 索引规则

- Plugin 应与 DeepSeek Harness 直接相关，或提供清晰的安装/集成说明。
- 每个条目必须提供稳定的公开链接、简洁准确的描述，以及英文和简体中文文案。
- 请保持厂商中立、实用且避免重复收录。
- 不收录密钥、联盟营销链接、未说明背景的废弃分叉，以及主要用于恶意软件、凭据窃取或违规自动化的项目。

## 许可证

本仓库以 [MIT License](../LICENSE) 发布。
