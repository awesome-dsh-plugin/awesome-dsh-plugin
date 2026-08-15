# Awesome DeepSeek Harness (DSH) Plugin [![Awesome](https://awesome.re/badge.svg)](https://awesome.re) ![awesome · DSH plugin](https://awesome-dsh-plugin.com/badge.svg) ![插件数量](https://img.shields.io/endpoint?url=https%3A%2F%2Fawesome-dsh-plugin.com%2Fcount.json&label=%E6%8F%92%E4%BB%B6)

[![Awesome DSH Plugin](https://awesome-dsh-plugin.com/banner-zh.png)](https://awesome-dsh-plugin.com/zh/)

[English](README.md) | 中文

> [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（`dsh`）插件精选列表。

DeepSeek Harness 是 DeepSeek 开源的 agent harness——既是可直接运行的 Coding Agent（提供 Web 与 headless 两种形式），底层又是一套「一切皆插件」的框架：模型、工具、沙箱、会话存储、UI、乃至 Agent Loop 本身都是插件。插件既可以扩展官方 Coding Agent，也可以替换其核心部件，甚至组装出完全不同的东西。

本列表收录可通过 `dsh plugin add` 安装的社区插件（均声明了 `dsh.bundle` manifest）。欢迎 [PR](#贡献)。

> 🛒 **推荐安装 [dsh-market](https://github.com/dsh-market/dsh-market#readme)**（可选）——DeepSeek Harness 里的插件市场，本列表的插件都在里面。界面简单好上手，一键安装、升级插件，一键切换主题：

```sh
dsh plugin --profile web add dshmarket
```

> 💡 更喜欢对话式？装 [dsh-find-plugin](https://github.com/awesome-dsh-plugin/dsh-find-plugin#readme)，想要什么插件直接问 agent（`dsh plugin --profile web add dsh-find-plugin`）。

> [!WARNING]
> 安装插件等于在你的机器上跑第三方代码，权限和你本人一样大——能读你的文件、用你的凭据、访问网络，工具审批管不到插件自己的代码。收录不等于做过安全审查：装之前先看一眼源码，不熟的插件尽量放在没有密钥、没有重要资料的环境里试。完整免责声明见页面底部。

## 目录

- [插件](#插件)
  - [🎨 UI 增强](#-ui-增强)
  - [🎭 主题与外观](#-主题与外观)
  - [🔌 模型与账号接入](#-模型与账号接入)
  - [💬 会话与消息](#-会话与消息)
  - [🧠 记忆](#-记忆)
  - [🛠️ 工具与能力](#-工具与能力)
  - [🧩 技能包](#-技能包)
  - [🔁 工作流与自动化](#-工作流与自动化)
  - [🔔 通知与集成](#-通知与集成)
  - [🧑‍💻 开发与运行时](#-开发与运行时)
  - [🛒 插件市场与管理](#-插件市场与管理)
  - [🎮 娱乐](#-娱乐)
- [徽章](#徽章)
- [免责声明](#免责声明)

## 插件

### 🎨 UI 增强
- [Ricketts-Guo/dsh-shortcuts](https://github.com/Ricketts-Guo/dsh-shortcuts) — Web UI 可自定义键盘快捷键：34 个预置功能（会话、视图、剪贴板、模型、静默权限切换、设置），一键录制自定义组合键，内置快捷键速查表与诊断面板。
- [magian1127/deepseek-harness-zh_pro](https://github.com/magian1127/deepseek-harness-zh_pro) — DSH 网页中文增强：补全中文界面残留英文、统计行单行完整显示，并提供「增强设置」分区（中文补全 / 统计全显示 / 对话宽度）。
- [NewDaNew/dsh-voice-input](https://github.com/NewDaNew/dsh-voice-input) — Web UI 语音输入：输入框一键麦克风按钮，基于 Web Speech API 语音转文字填入草稿，可选识别后自动发送。
- [13071301808/dsh-composer-expand](https://github.com/13071301808/dsh-composer-expand) — Web UI 输入框展开/收起：composer 工具行新增 ⬆/⬇ 按钮，一键把输入框扩大到 70vh 高度，方便写长 prompt。
- [littleboylittlegirl/dsh-community-hot](https://github.com/littleboylittlegirl/dsh-community-hot) — Web UI 的社区热门悬浮面板：24 小时热门话题与热门插件 TOP10，悬浮按钮可拖动置顶、点击居中展开。
- [1624318455/dsh-plugin-tts](https://github.com/1624318455/dsh-plugin-tts) — 用免费 Edge TTS 朗读 AI 回复：消息朗读按钮、自动朗读开关与语音设置面板。
- [x2802490130-prog/dsh-client-ui-writing](https://github.com/x2802490130-prog/dsh-client-ui-writing) — Web 客户端「写作」面板：项目分卷与统计、书库与全文检索、设定演化版本链 diff、线索 SVG 图谱，仅在写作预设会话显示。
- [badai147/dsh-global-rules](https://github.com/badai147/dsh-global-rules) — 在设置面板中编辑 ~/.dsh/AGENTS.md 全局规则，保存后实时生效。
- [AcidGr/dsh-web-mobile-fix](https://github.com/AcidGr/dsh-web-mobile-fix) — Web UI 移动端布局修复：窄屏下设置面板全屏化、插件导航单行排满、侧边栏全屏、弹层居中、会话日志按钮图标化。
- [mexiaosqwq/dsh-web-mobile](https://github.com/mexiaosqwq/dsh-web-mobile) — DSH Web UI 移动端适配：窄屏下侧边栏变为贴合内容的 overlay 抽屉、会话独占全宽，设置面板改为近全宽 sheet。

- [AcidGr/dsh-web-lan-access](https://github.com/AcidGr/dsh-web-lan-access) — Web UI 局域网/远程访问：为纯 HTTP 非安全上下文注入 crypto.randomUUID polyfill，局域网/Tailscale IP 直连时前端不再崩溃。

- [Bernardxu123/dsh-mobile-gate](https://github.com/Bernardxu123/dsh-mobile-gate) — 局域网手机访问网关：独立子进程反向代理 + 首次访问审批 + 设备令牌绑定 + 限流 + 手机端紧凑排版注入（输入区权限/模型小胶囊、randomUUID polyfill）。

- [Make0209/dsh-usage-stats](https://github.com/Make0209/dsh-usage-stats) — GitHub 风格用量热力图看板：按工作区统计使用次数与 Token 花费（含缓存命中率）、DeepSeek 账户余额查询、工作区别名管理。
- [Ychris12138/dsh-usage-stats](https://github.com/Ychris12138/dsh-usage-stats) — 多供应商用量看板：按供应商/模型统计 Token 与日期下钻，统一展示账户余额，并追踪 OpenCode Go / Z.ai 订阅额度。
- [V-dev-388/dsh-usage-meter](https://github.com/V-dev-388/dsh-usage-meter) — 设置页用量仪表盘：按服务商/模型汇总全部会话 token 用量，含今日/近 7 天/近 30 天趋势柱状图与缓存命中率。
- [zoumutou/dsh-cost-balance](https://github.com/zoumutou/dsh-cost-balance) — 输入框下方的 iOS 风格统计条：一键展开查看会话花费、DeepSeek 账户余额、缓存命中率与 Token 用量。
- [ibka512/dsh-ibka-balance](https://github.com/ibka512/dsh-ibka-balance) — 输入框下方常驻余额卡片：实时显示 DeepSeek API 账户余额，每 5 分钟自动刷新，支持手动刷新，余额过低自动变色提醒。
- [jiangli07/dsh-deepseek-quota-bar](https://github.com/jiangli07/dsh-deepseek-quota-bar) — 可拖动透明余额卡片：余额/月初额度血条、今日/本月用量（配置平台 token 后为官方精确数据）、当前对话费用。

- [bowenliang123/dsh-context](https://github.com/bowenliang123/dsh-context) — 上下文洞察面板：一眼看清模型上下文窗口的组成与变化——构成对照窗口大小、按请求历史趋势、压缩/注入事件、消息级 token 统计。

- [wjy9902/dsh-web-default-session](https://github.com/wjy9902/dsh-web-default-session) — 点「新会话」默认打开绑定宿主启动目录的「默认目录」工作区（无需选文件夹），工作区选择菜单中也可选该项。

- [Fishsb/dsh-prompt-enhancer](https://github.com/Fishsb/dsh-prompt-enhancer) — 一键提示词增强：独立 LLM 调用把模糊草稿改写为更强的提示词，不满意可撤回。

- [huiliyi37/dsh-tianshu-tui](https://github.com/huiliyi37/dsh-tianshu-tui) — DeepSeek Harness 的终端 UI（TUI）。

- [openma-ai/deepseek-harness-tui](https://github.com/openma-ai/deepseek-harness-tui) — Rust/ratatui 终端客户端，直接使用 DSH SDK JSON-RPC 协议，支持独立运行或作为 profile bundle 加载。

- [WhitePlusMS/dsh-input-plus](https://github.com/WhitePlusMS/dsh-input-plus) — 在组合框中使用 `@` 搜索并插入工作区文件和目录路径，并通过 `/h` 菜单复用当前会话的问题。
- [omdsh-dev/dsh-at-file](https://github.com/omdsh-dev/dsh-at-file) — Codex 风格的 `@file` 文件引用，输入框里直接搜索并引用工作区文件。
- [alingalingling/ui-status-label](https://github.com/alingalingling/ui-status-label) — 把鲸鱼娘思考时的 "deep diving" 状态文案自定义成任意你想要的样子。
- [LeemanCheung/dsh-whale-animation](https://github.com/LeemanCheung/dsh-whale-animation) — DSH Web 状态文字旁的持久化黑色鲸鱼深潜动画，提供减少动态效果回退与无缝闭环。
- [01Virex/dsh-status-rotator](https://github.com/01Virex/dsh-status-rotator) — 把回合状态那句 "Deep diving..." 替换成更有梗的自定义文案，按阶段轮换，支持打字机与流动渐变。
- [ZSeven-W/dsh-openpencil](https://github.com/ZSeven-W/dsh-openpencil) — OpenPencil 设计预览与编辑插件。
- [Nagi-ovo/dsh-visualize](https://github.com/Nagi-ovo/dsh-visualize) — 对话内生成式 UI：模型把交互式 HTML 卡片直接画进会话流，带流式预览与沙箱渲染。
- [hanzhangzzz/dsh-diagram](https://github.com/hanzhangzzz/dsh-diagram) — DeepSeek Harness 会话中的可编辑 Excalidraw 图表。
- [ccq1/dsh-side-panel](https://github.com/ccq1/dsh-side-panel) — 侧边栏集成文件浏览器、终端和 Git 审查，方便预览文件。
- [WhitePlusMS/dsh-git-graph](https://github.com/WhitePlusMS/dsh-git-graph) — Chat 和 Trajectory 旁的独立 Git Graph 视图：提交拓扑、本地/远程/tag 引用、HEAD 与工作区状态、搜索、筛选、首父模式、刷新和加载更多。
- [openAGFS/dsh-agfs](https://github.com/openAGFS/dsh-agfs) — 文件浏览器 Web 应用：React 前端与 REST API 由宿主 webserver 托管，/dsh-agfs 命令自动定位当前工作区，附 browse_files 模型工具。
- [dingyi222666/dsh-focus-chat](https://github.com/dingyi222666/dsh-focus-chat) — 「聚焦会话」精简视图，只关注最终产出结果。
- [omdsh-dev/dsh-genui](https://github.com/omdsh-dev/dsh-genui) — 助手回复内渲染交互式 UI 组件：布局、图表、表单、测验、mermaid、3D 场景与回传事件循环。
- [omdsh-dev/dsh-annotation](https://github.com/omdsh-dev/dsh-annotation) — 选中文字→批注→随消息发送，回复按批注逐条对照。
- [vlln/dsh-navbar](https://github.com/vlln/dsh-navbar) — 对话节点导航条，右缘节点串快速跳转 user 消息。
- [asukasec/dsh-message-preview](https://github.com/asukasec/dsh-message-preview) — 右侧用户消息导航条，根据消息数量与可用高度自适应排布导航块，并支持悬停预览、键盘操作与点击跳转。
- [jjxjjjjiik-bot/dsh-chat-timeline](https://github.com/jjxjjjjiik-bot/dsh-chat-timeline) — 1:1 复刻 DeepSeek 官网右侧对话导航栏（ScrollNav）：悬停展开面板、阅读位置高亮、点击跳转。
- [vlln/dsh-task-status](https://github.com/vlln/dsh-task-status) — 后台任务状态条：对话页任务进度 + 实时输出 tail。
- [Nanki-nn/dsh-answer-pet](https://github.com/Nanki-nn/dsh-answer-pet) — 蓝鲸桌面宠物：按会话实时展示回答进度、模型动作与工具调用轨迹、token、输出速率与耗时，并支持多会话状态卡片展开和收起。
- [mengyun233/dsh-codex-pet](https://github.com/mengyun233/dsh-codex-pet) — 把 Codex 桌宠皮肤自动迁移到 DSH：右下角动画桌宠随 agent 状态实时变化（思考/工具/等待批准/出错/完成），多会话毛玻璃对话框 + 完整设置面板。
- [renat3u/dsh-web-archive](https://github.com/renat3u/dsh-web-archive) — 折叠对话中的 Think、Bash 等「无用消息」。
- [a179-sanae/dsh-auto-collapse](https://github.com/a179-sanae/dsh-auto-collapse) — Codex 风格工作流自动折叠：回合完成收成一行「已处理 X秒」只留最终正文，工具/思考块折叠成实时摘要 chip（运行中跟随流式滚动），逐级点击展开；卸载完整还原。
- [0xsline/dsh-spotlight](https://github.com/0xsline/dsh-spotlight) — 键盘优先的命令面板（command palette）。
- [GooodWei/arcana](https://github.com/GooodWei/arcana) — DeepSeek Harness 的悬浮命令甲板：把所有斜杠命令列成可执行按钮，悬停看介绍，按使用次数排序。
- [GooodWei/context-vista](https://github.com/GooodWei/context-vista) — 为 DeepSeek Harness 提供右侧悬浮栏以及 /context 命令，用环形图实时展示当前上下文 token 用量与分配及消费估算。
- [bill9109/dsh-101](https://github.com/bill9109/dsh-101) — DSH 文档阅读模式。
- [bill9109/dsh-drag-and-drop](https://github.com/bill9109/dsh-drag-and-drop) — 跨平台文件拖拽与原始路径插入，无需复制文件。
- [GLFzr/dsh-drop-file-to-path](https://github.com/GLFzr/dsh-drop-file-to-path) — Codex 式拖拽：把任意文件拖入 DSH Web 界面，文件存入 ~/.dsh-dropbox，路径以整块蓝色 chip 插入输入框。
- [taxueseek/dsh-files](https://github.com/taxueseek/dsh-files) — 文件上传（彩色附件卡片、会话隔离存储、sha256 去重、TTL 清扫）+ 内容嗅探的 read_document 文档读取（PDF/DOCX/XLSX/TXT）。
- [l541402398/dsh-file-uploads](https://github.com/l541402398/dsh-file-uploads) — 从 Web 输入框上传任意本地文件，以待发送卡片展示，并在设置中管理已存文件。
- [HongMing-Huang/dsh-file-upload](https://github.com/HongMing-Huang/dsh-file-upload) — Claude 风格拖拽/回形针文件上传：内容嗅探、文档转 Markdown（微软 MarkItDown，内置 JS 兜底）、文本直插输入框、read_document 工具。
- [qyw233/dsh-deeplink](https://github.com/qyw233/dsh-deeplink) — `?session=` / `?workspace=` 深链直达指定项目对话。
- [lehhair/dsh-diff-viewer](https://github.com/lehhair/dsh-diff-viewer) — PiUI 风格 diff 查看器，替换 write/edit 工具调用的默认 DiffBlock。
- [omdsh-dev/ex-setting](https://github.com/omdsh-dev/ex-setting) — DSH 的设置扩展。
- [omdsh-dev/web-components](https://github.com/omdsh-dev/web-components) — Web Components 支持。
- [vibeinging/dsh-turn-navigator](https://github.com/vibeinging/dsh-turn-navigator) — 对话轮次导航。
- [SnowCrescenter-tech/dsh-milestone](https://github.com/SnowCrescenter-tech/dsh-milestone) — 右侧圆点时间轴导航条，点击跳转到任意用户消息。
- [Ghost011118/dsh-balance-meter](https://github.com/Ghost011118/dsh-balance-meter) — 输入框 dock 显示 DeepSeek 账户余额与会话花费，自动拉取官方定价，支持高峰/低谷计价。
- [v587d/dsh-opencode-go-usage](https://github.com/v587d/dsh-opencode-go-usage) — 在输入框上方 dock 显示 OpenCode Go 订阅用量（5h 滚动/每周/每月窗口与重置倒计时），内置凭据编辑器。
- [GLFzr/dsh-opencode-go-quota](https://github.com/GLFzr/dsh-opencode-go-quota) — 模型选择器左侧的 OpenCode Go 额度圆环：点击循环切换 5 小时/每周/每月用量窗口，按紧急程度着色（绿/蓝/橙/红），悬停显示百分比与重置倒计时。
- [Han-1413141/dsh-cost-meter](https://github.com/Han-1413141/dsh-cost-meter) — 会话与当日 API 费用统计、预算图框（已用%）、官方余额、历史看板，支持峰谷计价与官方价格一键同步。
- [fishxcode/dsh-plugin-deepseek-balance](https://github.com/fishxcode/dsh-plugin-deepseek-balance) — 在 DSH Web 设置中展示 DeepSeek API 余额、余额趋势与每日用量图表。
- [Sev7een/ds-api-usage](https://github.com/Sev7een/ds-api-usage) — 在设置页展示 DeepSeek API 余额与最近 24 小时用量，包括估算消费、Token、请求次数和按小时时间线。
- [nonewind/dsh-spend](https://github.com/nonewind/dsh-spend) — DSH Web 用量与费用统计插件：右下角悬浮窗，按模型/按天/按会话多维聚合与预计花费。
- [stevenx65/dsh-balance-plugin](https://github.com/stevenx65/dsh-balance-plugin) — dsh 网页侧边栏的 DeepSeek 余额与 token 用量监控：今日/累计切换，并按 provider 过滤其他厂商。
- [LemCAE/dsh-balance](https://github.com/LemCAE/dsh-balance) — 顶栏徽章与设置卡片展示 DeepSeek 账户余额与当前会话预估花费：暂停感知的自动刷新、可编辑官方价格表、`deepseek_balance` 模型工具与中英文界面。
- [huanyuLv/dsh-balance-tide](https://github.com/huanyuLv/dsh-balance-tide) — 输入框下方显示 DeepSeek 账户余额与本会话花费，余额前带峰/谷价格徽章（北京时间）与距切换倒计时，悬停看两档单价明细与使用建议。
- [ccch1mneyyy/dsh-TUI](https://github.com/ccch1mneyyy/dsh-TUI) — Claude Code 风格全屏终端 UI：像素鲸鱼顶栏、实时工作状态行、思考流式展开。
- [omdsh-dev/DSH-better-sidebar](https://github.com/omdsh-dev/DSH-better-sidebar) — 侧边栏完整工作台：内置文件渲染编辑、终端、Git 与子代理，支持三方插件注册新 Tab。
- [tsonglew/dsh-workspace-search](https://github.com/tsonglew/dsh-workspace-search) — VS Code 式工作区关键词搜索 Tab（better-sidebar 扩展）：同时匹配文件名与文件内容，结果按文件分组带行号，点击在侧栏编辑器打开。
- [tsonglew/dsh-media-preview](https://github.com/tsonglew/dsh-media-preview) — better-sidebar 音视频预览器：原生播放器内联播放 mp4/webm/mkv/mov 等视频与 mp3/flac/wav 等音频，自带支持 HTTP Range 拖动的流式媒体路由。
- [Han-1413141/dsh-sticky-disclosure](https://github.com/Han-1413141/dsh-sticky-disclosure) — 一键收起会话中所有展开的区块（Think、工具卡等），常驻计数按钮 + 自定义快捷键。
- [Meredith2328/dsh-sticky-note](https://github.com/Meredith2328/dsh-sticky-note) — 编辑框工具栏便签，随手记点子和 TODO，自动保存为 Markdown，一键发送到对话。
- [Luaphes/dsh-web-attention-badge](https://github.com/Luaphes/dsh-web-attention-badge) — 会话需要你时三处同时亮起：角标、标签页标题计数、按状态换色的鲸鱼 favicon。
- [zhu1090093659/dsh-web-ui#packages/dsh-web-ui-all](https://github.com/zhu1090093659/dsh-web-ui/tree/main/packages/dsh-web-ui-all) — DSH Web UI 插件与皮肤合集：任务看板、git 图、右侧面板、远程移动端 UI、桌宠、实时 token 统计与皮肤中心。
- [zealot00/dsh-pet](https://github.com/zealot00/dsh-pet) — DSH Web UI 桌面宠物：精灵图动画、agent 状态联动、拖拽、闹钟（每天/一次）与番茄钟，皮肤下拉选择 + 预览。
- [sereinmono/dsh-desktop-pet](https://github.com/sereinmono/dsh-desktop-pet) — DeepSeek Harness 桌面宠物：完全支持 Codex 桌宠格式，可使用 hatch-pet Skill 创建宠物，或通过 Petdex 导入宠物。
- [ysyyhhh/dsh-pet](https://github.com/ysyyhhh/dsh-pet) — 跟随 agent 状态的 DSH 原生桌宠，兼容 Codex 桌宠包，并可在插件内直接从 Petdex 导入已审核桌宠，无需 Petdex CLI。
- [jiangnanquan/dsh-ux](https://github.com/jiangnanquan/dsh-ux) — Solarized 浅色主题、紧凑布局、思考/工具链折叠胶囊，以及余额、本轮成本与用量看板的 DSH Web 界面增强插件。
- [a903067276-rgb/dsh-hud](https://github.com/a903067276-rgb/dsh-hud) — HUD 状态面板：Git 状态、MCP 服务器、技能列表、模型与 token 用量，悬浮侧栏一览无余。
- [wsxwj123/dsh-plugins#turn-scrubber](https://github.com/wsxwj123/dsh-plugins/tree/main/packages/turn-scrubber) — 右侧紧凑回合刻度条，悬停显示回合摘要，点击跳转到对应用户回合。
- [Sttrevens/dsh-cost-meter](https://github.com/Sttrevens/dsh-cost-meter) — Web UI 美元成本徽标：头部显示会话总成本、每条回复结尾显示该轮成本，悬停看分项。
- [a903067276-rgb/dsh-file-mentions](https://github.com/a903067276-rgb/dsh-file-mentions) — DSH 回复中的文件路径可点击：Codex 风格行内打开、文件管理器定位、回合尾部文件 chip 列表。
- [GitHubJiKe/dsh-markdown-preview](https://github.com/GitHubJiKe/dsh-markdown-preview) — 产物文件聊天内预览：点击产物 chip 直接在对话中渲染 Markdown（宿主侧 markdown-it + highlight.js 代码高亮）、图片或纯文本，系统应用打开与在文件夹中显示仍一键可达。
- [bobcat848/dsh-calculator](https://github.com/bobcat848/dsh-calculator) — 右侧面板展示 DeepSeek API 费用（当前会话 + 全部会话累计）与账户余额，内置官方计价与峰谷计价支持。

- [Jolly-J/dsh-deepseek-billing](https://github.com/Jolly-J/dsh-deepseek-billing) — 侧边栏底部 DeepSeek 账户余额显示与会话费用估算卡片。
- [AKIRACOD/dsh-drag-and-drop](https://github.com/AKIRACOD/dsh-drag-and-drop) — 拖放 fork：文档以可删除「文件芯片」挂在输入框上方，不打字也能发送。
- [HsiangNianian/dsh-auto-continue](https://github.com/HsiangNianian/dsh-auto-continue) — DSH Web 请求中断自动续跑：网络、超时或宿主崩溃等非人为失败后自动发送「继续」，支持错误分类、自适应退避、模板化继续文本与浏览器通知。
- [liliuCourier/dsh-chat-outline](https://github.com/liliuCourier/dsh-chat-outline) — 对话栏左侧常驻大纲：按轮次列出提问与最后回复，支持关键词过滤与一键跳转。
- [LaoYueHanNi/dsh-token-usage](https://github.com/LaoYueHanNi/dsh-token-usage) — 按请求持久化模型 token 用量，Web 设置「Token 用量」统计页：按日趋势图、按模型明细表、日期/模型筛选。
- [QT-Chen/dsh-mic-input](https://github.com/QT-Chen/dsh-mic-input) — 输入框麦克风语音输入：浏览器 Web Speech API 实时转写，自动去重/续听、智能标点，支持语言与自动发送设置。
- [LeemanCheung/dsh-task-dag](https://github.com/LeemanCheung/dsh-task-dag) — 将会话子代理与持久工作流运行展示为实时 DAG，支持状态展示、节点导航与重启后历史恢复。
- [MorGogh/widget-dock](https://github.com/MorGogh/widget-dock) — 对话两侧空白区的可拖动卡片工作台，28 个小组件（余额、Token 用量、成本、上下文压力、待办、目标、用量热力图、GitHub 仓库、图片中转等），支持 S/M/L/XL 四档尺寸。
- [qjcnmd/dsh-reasoning-slider](https://github.com/qjcnmd/dsh-reasoning-slider) — Codex 风格推理等级滑块，内嵌于模型选择器，拖动切换推理档位。
- [Semidia/dsh-sampling-sliders](https://github.com/Semidia/dsh-sampling-sliders) — 对话输入区的模型采样滑杆（temperature / maxTokens）：通过 agent/request 钩子对所有供应商的每次请求生效，支持热调/持久化两种模式。
- [causebefore/dsh-pomodoro](https://github.com/causebefore/dsh-pomodoro) — DSH Web 番茄钟：提供可配置专注/休息循环、可拖动迷你面板，以及站内提醒、提示音和浏览器通知。

- [siberiah2o/dsh-plugin-terminal](https://github.com/siberiah2o/dsh-plugin-terminal) — 底部多标签终端面板（node-pty + xterm.js）：贴底全宽，输入框始终在终端上方。
- [urzeye/dsh-outline](https://github.com/urzeye/dsh-outline) — DSH Web 会话页实时大纲面板：「用户问题 + Markdown 标题（1~6 级）」大纲树，流式生成时实时更新，点击节点滚动定位并高亮，支持展开深度调节、搜索与会话级收藏。
- [283Gawin/dsh-heatmap](https://github.com/283Gawin/dsh-heatmap) — DSH Web 侧边栏活动热力图：GitHub 风格网格展示每日提交、Token 用量与估算花费，今日统计行显示全会话 Token 总量、缓存命中率与按模型自动计价的花费。
- [Max-Samson/dsh-usage-chart](https://github.com/Max-Samson/dsh-usage-chart) — 输入框下方的用量/成本/余额仪表盘：实时指标指示器 + 零依赖 SVG 用量图表，按轮次统计用量、估算成本并实时查询 DeepSeek 账户余额。
- [RAFOLIE/dsh-desktop-windowos#plugin](https://github.com/RAFOLIE/dsh-desktop-windowos/tree/main/plugin) — DSH 的 Windows 托盘桌面壳：自动从 GitHub Releases 安装 exe、创建桌面快捷方式，并提供 desktop_launch 工具在对话中一键启动。
- [ZichengGurrr/dsh-window#plugin](https://github.com/ZichengGurrr/dsh-window/tree/main/plugin) — DSH 的 Windows 原生窗口（WebView2）：一键安装，自动从 GitHub Releases 下载应用 zip、创建桌面快捷方式，并提供 desktop_launch 工具在对话中一键启动。
- [ZichengGurrr/dsh-window#kit](https://github.com/ZichengGurrr/dsh-window/tree/main/kit) — DSH 三件套全家桶：Windows 原生窗口（WebView2）+ DeepEye 视觉（GLM-4V-Flash）+ 语音输入（麦克风按钮），一条命令装齐。
- [zoumutou/dsh-web-preview](https://github.com/zoumutou/dsh-web-preview) — 侧边网页预览面板：本地静态托管、Markdown/代码/图片预览、非静态项目一键运行（Cargo/npm/Go/Python）实时日志、网页元素标记批注、链接点击接管到侧边预览。
- [FengHuoLinShan/dsh-plugin-llm-balance](https://github.com/FengHuoLinShan/dsh-plugin-llm-balance) — 可拖动的 API 余额/配额悬浮卡片：自动显示最近使用的 provider 余额/配额（DeepSeek/Moonshot/Kimi For Coding），按余额分档变色、实时刷新。
- [x2802490130-prog/dsh-balance-float](https://github.com/x2802490130-prog/dsh-balance-float) — Web UI 右上角悬浮窗：实时显示 DeepSeek 余额，支持手动刷新与一键优雅退出（Y/N 快捷键确认）。
- [Semidia/dsh-session-manager](https://github.com/Semidia/dsh-session-manager) — 会话行右键菜单与侧边栏会话管理：置顶、重命名、归档、分叉、导出、复制工作目录/会话 ID/深链，在资源管理器或新窗口打开。
- [x2802490130-prog/dsh-lan-pass](https://github.com/x2802490130-prog/dsh-lan-pass) — Web UI 局域网密码门禁：同网手机/平板输共享密钥登录，会话与电脑实时同步，内置 randomUUID polyfill。
- [magicOF2/dsh-turn-marks](https://github.com/magicOF2/dsh-turn-marks) — 会话左侧消息标记条：每发一条消息多一根条条，点击跳转到该消息、悬停预览内容，当前消息对应的条条变白。
- [magicOF2/dsh-chat-width-customizer](https://github.com/magicOF2/dsh-chat-width-customizer) — 会话标题栏按钮循环切换对话宽度（748–1600px），消息区、输入框、用户气泡同步加宽。
- [luokai-demo/dsh-plugins#plugins/dsh-balance-plugin](https://github.com/luokai-demo/dsh-plugins/tree/main/plugins/dsh-balance-plugin) — 侧边栏底部的 DeepSeek 钱包余额：信用卡图标配余额数字，按剩余额度着色（≥ ¥2 绿色、¥0–2 黄色、≤ ¥0 红色），挂载时、每轮对话结束和点击时刷新；余额变动时带符号差额上飘淡出。
- [Ceelog/dsh-plugins#dsh-plugin-setting-mcp](https://github.com/Ceelog/dsh-plugins/tree/main/src/plugins/dsh-plugin-setting-mcp) — 在 Web 设置面板中查看、添加、编辑、删除、启用或停用 MCP 服务器，保存后热重载。
- [BeiZi6/dsh-opencodego-usage](https://github.com/BeiZi6/dsh-opencodego-usage) — OpenCodeGo 剩余额度监视器：输入框右下角呼吸指示灯（按剩余额度绿/黄/红），液态玻璃面板显示滚动/周/月用量窗口与重置时间，每 30 秒自动刷新，API Key 自动读取 DSH 凭据。
- [giiiiiithub/terminal](https://github.com/giiiiiithub/terminal) — DSH Web UI 终端面板：宿主端 node-pty 真实 PTY（Windows 默认 cmd.exe）+ 浏览器 xterm.js 渲染；多标签会话、停靠/浮动窗口、复制粘贴。
- [SpookySandwich/dsh-smooth-stream](https://github.com/SpookySandwich/dsh-smooth-stream) — 给 DeepSeek Harness 加入更好的流式文字动画。
- [ook826092-cloud/dsh-mobile-css](https://github.com/ook826092-cloud/dsh-mobile-css) — DSH Web UI 移动端适配：紧凑排版、全宽输入卡（含光标修复）、抽屉式侧边栏（点击遮罩关闭）、两页式设置流程、响应式表格与统计、安全触控目标。
- [Wongzexu/dsh-git-status](https://github.com/Wongzexu/dsh-git-status) — 专精于 Git 分支与状态处理：Web 右缘 Git 状态浮窗，commit DAG 泳道图、未提交改动与 stash、行内 diff，右键分支/tag 切换、合并、重命名、删除、新建，一键拉取全部远程。
- [YZz-S/dsh-workspace-files-explorer](https://github.com/YZz-S/dsh-workspace-files-explorer) — 悬浮工作区文件树浏览器：带行号的代码语法高亮与 Markdown 富文本预览。
- [YZz-S/dsh-token-cost-meter](https://github.com/YZz-S/dsh-token-cost-meter) — 在输入框下方统计行实时显示当前会话累计 token 消耗与估算费用（人民币），价格从 DeepSeek 官方价格页动态获取。
- [penguin-oo/dsh-pathlink](https://github.com/penguin-oo/dsh-pathlink) — 在对话中 Ctrl+点击文件路径与链接：路径在文件管理器中定位所在文件夹，链接在新标签页打开。
- [AKS1st/dsh-mermaid](https://github.com/AKS1st/dsh-mermaid) — 把 DSH Web 会话消息中的 Mermaid 代码围栏渲染为惰性加载的 SVG 图表，严格消毒并跟随明暗主题。
- [Sanqi-normal/dsh-model-picker](https://github.com/Sanqi-normal/dsh-model-picker) — dsh web 输入栏模型选择面板：左侧提供商栏 + 右侧模型列表，两侧独立滚动，支持跨提供商搜索。
- [AKS1st/dsh-sysmon](https://github.com/AKS1st/dsh-sysmon) — DSH Web 右下角系统状态悬浮窗：实时显示 CPU、内存、磁盘占用率，带阈值变色告警。
- [AKS1st/model-usage-plugin](https://github.com/AKS1st/model-usage-plugin) — 按模型统计 token 消耗并估算费用，同时显示 DeepSeek 账户余额，展示于设置面板「模型消耗」页签。
- [PerryLink/dsh-composer-history](https://github.com/PerryLink/dsh-composer-history) — Web 作曲器终端风格输入历史：边缘优先的方向键召回并精确还原草稿与光标、浏览器本地持久化历史、Ctrl+R 反向搜索，以及滑动上下文感知（压缩摘要加入召回与搜索）。
- [Minecraftbe/dsh-toolfold](https://github.com/Minecraftbe/dsh-toolfold) — Codex 风格的工具调用折叠，将多个工具调用折叠到一行内。
- [02Muller25/dsh-api-balance](https://github.com/02Muller25/dsh-api-balance) — 输入框下方实时显示 DeepSeek API 账户余额，支持手动刷新与自定义间隔自动刷新。
- [XiLuovo/dsh-session-timeline](https://github.com/XiLuovo/dsh-session-timeline) — 会话左侧的短横线时间轴：整个会话的用户消息一览、当前消息定位、悬停预览消息与回复、点击跳转，可收起展开。
- [kelearns/dsh-navigation-bar](https://github.com/kelearns/dsh-navigation-bar) — 钢琴键风格会话内导航条：一根键锚定一条用户消息，悬停显示消息预览气泡与阶梯展开，点击平滑跳转。
- [kelearns/dsh-token-usage](https://github.com/kelearns/dsh-token-usage) — Token 用量热力图：日/周/累计视图，12 个月窗口，支持深浅色主题。
- [izz-BLUE/dsh-deepseek-usage-dashboard](https://github.com/izz-BLUE/dsh-deepseek-usage-dashboard) — DSH Web 的 DeepSeek API 用量仪表盘：基于会话日志统计每日缓存命中/未命中输入与输出 Token，并展示分模型费用估算、账户余额、7 日趋势和 composer 用量摘要。
- [wsxwj123/dsh-plugins#dsh-composer-tools](https://github.com/wsxwj123/dsh-plugins/tree/main/packages/dsh-composer-tools) — 输入框工具集：方向键调取历史消息（限首/末行触发，兼容输入法与命令菜单）等输入增强。
- [kongerly/dsline](https://github.com/kongerly/dsline) — 把 DSH 网页版对话区改为 LINE 风格：用户绿色气泡、助手气泡带头像与思考折叠行、打字指示器，支持完整 markdown 渲染。
- [SongMiao-tech/dsh-prompt-optimizer](https://github.com/SongMiao-tech/dsh-prompt-optimizer) — 输入框下方「优化提示词」按钮：一键把草稿重写为更清晰、更可执行的提示词，弹出前后对比，支持一键替换回输入框。
### 🎭 主题与外观

- [RizenHNT/dsh-skin-digital-arcade](https://github.com/RizenHNT/dsh-skin-digital-arcade) — 数码电玩风 HUD 皮肤：霓虹青/紫/品红配色、Ark Pixel 像素字体、动画精灵（背景城市/数据核心/吉祥物）、自定义十字准星光标，浅深双主题跟随系统。

- [RevolutionLA/dsh-dream-skin](https://github.com/RevolutionLA/dsh-dream-skin) — 一键换肤插件：8 套原创主题、背景壁纸（透明度/模糊）、强调色、主题包导入/导出+分享链接、收藏与随机，纯原生 token 系统接入。
- [KinGao294/dsh-skin](https://github.com/KinGao294/dsh-skin) — Codex 风格皮肤切换器 + 自定义壁纸层，可调透明度与模糊。
- [Small-tailqwq/dsh-deep-whale](https://github.com/Small-tailqwq/dsh-deep-whale) — DSH Web 鲸鱼娘皮肤系列（深海女仆工坊 maid-atelier）。
- [wsxwj123/dsh-plugins#theme-gallery](https://github.com/wsxwj123/dsh-plugins/tree/main/packages/theme-gallery) — 15 个精选主题家族，浅深配色完整，跟随 DSH 原生浅色/深色/跟随系统模式。
- [PAKIKNOWLEDGE/dsh-client-ui-skin-claude](https://github.com/PAKIKNOWLEDGE/dsh-client-ui-skin-claude) — Claude 风格皮肤：暖黑画布、陶橙点缀、衬线 UI，跟随原生亮/暗主题。
- [tianyhjg-lab/dsh-font](https://github.com/tianyhjg-lab/dsh-font) — DSH Web GUI 字体切换器：99 个界面字体与 31 个代码字体，中西文自动搭配，即选即生效，localStorage 持久化。
- [starslittle/dsh-blue-whale](https://github.com/starslittle/dsh-blue-whale) — 复刻 DeepSeek Chat 蓝鲸配色的皮肤，亮色/深色跟随系统外观。
- [chinaRXQ/dsh-wallpaper](https://github.com/chinaRXQ/dsh-wallpaper) — DSH Web 壁纸皮肤：图片背景，可调透明度、压暗遮罩与模糊。
- [SamizuHM/dsh-client-ui-theme-xp](https://github.com/SamizuHM/dsh-client-ui-theme-xp) — Windows XP Luna 桌面化主题：浮动窗口管理器（任务栏、桌面图标）加上还原度很高的 Luna 皮肤。
- [Tommy00748/dsh-theme-cyberpunk2077](https://github.com/Tommy00748/dsh-theme-cyberpunk2077) — Cyberpunk 2077 / 夜之城主题：NC 黄 × 霓虹青配色、CRT 扫描线、Kiroshi 悬停锁定、战斗状态 HUD、合成打字机与消息音效，以及隐藏彩蛋（relic / johnny）。
- [Tkingxiao/dsh-any-background](https://github.com/Tkingxiao/dsh-any-background) — 自定义外观插件：换背景图（可调大小和位置）、用色轮自定义主题色，主界面和设置界面的透明度都能单独调。
- [BeiZi6/dsh-theme-plugin](https://github.com/BeiZi6/dsh-theme-plugin) — DSH Web GUI 主题工作室：5 套内置预设 + 完全可自定义的浅/深配色（强调色、背景、前景、UI 与代码字体、半透明侧栏、对比度），即时热切换并持久化到 localStorage。

- [zhijun-dai/Catppuccin-dsh-theme](https://github.com/zhijun-dai/Catppuccin-dsh-theme) — Catppuccin 主题插件：为 DSH Web 主题运行时提供 Latte、Frappé、Macchiato、Mocha 四套皮肤。
- [zhijun-dai/Solarized-dsh-theme](https://github.com/zhijun-dai/Solarized-dsh-theme) — Solarized 与 Selenized 主题插件：向 DSH Web 主题运行时注册四套忠实色板。
- [yunxiiQwQ/dsh-maid-whale-webUI#maid-whale-webui](https://github.com/yunxiiQwQ/dsh-maid-whale-webUI/tree/main/maid-whale-webui) — DSH Web UI 鲸鱼女仆纸面主题：亮暗配色、海洋插画、手绘边框、装饰素材与常驻桌宠。
- [xingyingyuzhui/dsh-liquid-glass](https://github.com/xingyingyuzhui/dsh-liquid-glass) — DSH Web 液态玻璃皮肤：冰原/深水壁纸、可导入、壁纸透明度，以及叠在官方浅色/深色/跟随系统上的分岛模糊。
- [caoyiwei850/dsh-client-ui-skins](https://github.com/caoyiwei850/dsh-client-ui-skins) — DSH Web 换肤插件：4 套内置皮肤 + 自定义图片皮肤，图片作为全界面背景，配色自动跟随图片主色调。
- [AKS1st/dsh-cyber-particle](https://github.com/AKS1st/dsh-cyber-particle) — 为 DSH Web 界面提供粒子网络动态背景：全屏覆盖、点击穿透、零运行时依赖。
- [LeemanCheung/dsh-qq2007-skin](https://github.com/LeemanCheung/dsh-qq2007-skin) — DSH Web GUI 的 QQ 2007 风格复古皮肤：原生主题 token、三栏窗框、原创像素伙伴及可在设置中恢复的开关。
- [NoNameLeGo/dsh-catppuccin](https://github.com/NoNameLeGo/dsh-catppuccin) — DSH Web GUI 的 Catppuccin 主题插件：Latte、Frappé、Macchiato、Mocha 四套主题接入原生主题系统，一键切换并记住选择。
- [zhxqc/dsh-oh-my-theme](https://github.com/zhxqc/dsh-oh-my-theme) — DSH Web 主题与文件工作台：全局字体设置、@ 文件引用、项目文件树、Markdown 预览和可拖拽侧边面板。

### 🔌 模型与账号接入
- [GodD6366/dsh-sub2api](https://github.com/GodD6366/dsh-sub2api) — 将 sub2api 网关接入 DeepSeek Harness：用一个 base URL 统一管理 OpenAI / Claude / Grok / Gemini 等多供应商路由，支持按 key 发现模型、用量查询与全局视觉/图像生成工具。
- [Mars-Sea/dsh-commandcode-provider](https://github.com/Mars-Sea/dsh-commandcode-provider) — 非官方 Command Code 模型接入插件：注册 `commandcode` 路由，带实时模型目录与推理强度支持。
- [Noob-stupid/dsh-github-login](https://github.com/Noob-stupid/dsh-github-login) — 零终端的 GitHub 可视化登录插件：窗口内完成设备码授权，令牌同步进 gh CLI，附宿主端状态与唤起接口。

- [dylan121322/llm-adaptive](https://github.com/dylan121322/llm-adaptive) — 自适应模型路由：请求级复杂度分类，按配置链自动选择后端 provider。
- [btspoony/dsh-llm-fallbacks](https://github.com/btspoony/dsh-llm-fallbacks) — 基于角色的模型重试与备用策略。
- [franksong2702/dsh-codex-connect](https://github.com/franksong2702/dsh-codex-connect) — 通过 ChatGPT OAuth 将 OpenAI Codex 模型接入 DeepSeek Harness，并提供可选的搜索与图片工具。
- [kam74515-boop/dsh-everything-oauth](https://github.com/kam74515-boop/dsh-everything-oauth) — 把本机 Codex / Grok / Claude / OpenCode / CC Switch 登录态导入 DSH，在设置里自选来源并启用模型。
- [omdsh-dev/Qwen-MM-Plugins](https://github.com/omdsh-dev/Qwen-MM-Plugins) — Qwen 多模态插件支持。
- [suntianc/dsh-codex-auth](https://github.com/suntianc/dsh-codex-auth) — 复用 Codex CLI 的 ChatGPT 登录态注册 `openai-codex` LLM 路由，并在 DSH Web 设置中提供 GPT Auth 控件。
- [feibi-mochi/deepseek-harness-wallet](https://github.com/feibi-mochi/deepseek-harness-wallet) — 多供应商钱包标签：官方 DeepSeek 余额、本会话花费与 token、第三方合计 token、一键充值、低余额提醒。
- [superboy911/dsh-model-router](https://github.com/superboy911/dsh-model-router) — DSH 关键词路由与隔离生图插件：确定性关键词路由、白名单模型切换与隔离的 image_gen 生图通道。
- [kaixinbaba/dsh-vision-recognizer](https://github.com/kaixinbaba/dsh-vision-recognizer) — 视觉模型路由：把附加图片经可配置模型（15+ OpenAI 兼容与 Anthropic 供应商）转译为文字，对话仍由 DeepSeek 作答。
- [fieldnote-ops/keyringseam](https://github.com/fieldnote-ops/keyringseam) — macOS Keychain 凭据提供器：替换本地文件提供器，并使用已签名、公证的通用二进制辅助程序。

- [YZz-S/dsh-billing-balance](https://github.com/YZz-S/dsh-billing-balance) — 在设置页、输入框下方读数条与可拖动悬浮按钮三处显示 DeepSeek 官方 API 余额与火山方舟 Coding/Agent Plan 套餐额度（5小时/周/月窗口及重置倒计时）。
- [jyh20030112/dsh-visual-plugin](https://github.com/jyh20030112/dsh-visual-plugin) — 给纯文本模型装上眼睛：把用户图片转发给任意 OpenAI 兼容的视觉模型生成描述，并在 Web UI 右侧面板展示结果。
- [jiay98528-dev/dsh-model-sync](https://github.com/jiay98528-dev/dsh-model-sync) — 把各提供方线上模型列表同步进 DSH 设置，并在输入框旁显示当前会话模型的 5 小时/7 天额度圆环。
- [wenzetan/dsh-llm-newapi](https://github.com/wenzetan/dsh-llm-newapi) — NewAPI（OpenAI 兼容网关）模型接入：注册 `newapi` 路由，仅发现聊天类模型，自动从 models.dev 获取模型参数（上下文窗口、思考强度等）并填充，并在 Web 设置页配置 base URL 与 API Key。
### 💬 会话与消息

- [zljr/dsh-share](https://github.com/zljr/dsh-share) — 将当前会话以只读、token 保护的 HTML 快照分享到局域网，附带会话统计与 Markdown 渲染。

- [HuiHuitie-zhu/dsh-incognito](https://github.com/HuiHuitie-zhu/dsh-incognito) — 无痕会话：独立临时子 Agent（独立 preset 不继承父会话、全量工具集），浮窗可拖动，关闭即焚毁、磁盘零痕迹。
- [starslittle/dsh-queue-plus](https://github.com/starslittle/dsh-queue-plus) — 出厂排队消息的增强面板：编辑、删除、插话，再加上排序、清空和 10 秒撤销。
- [fredalxin/dsh-solo-thinking](https://github.com/fredalxin/dsh-solo-thinking) — 可视化分支头脑风暴：为每个方向创建独立 Session，自动处理父子继承、兄弟感知、进展与回传 Handoff，并提供完整树形 Tab 与可选 Better Sidebar 右栏。
- [ishuowang/dsh-agent-team-room](https://github.com/ishuowang/dsh-agent-team-room) — 在 DSH 原生界面中建立持久 Room，连接独立 Session 与 provider-backed 成员，支持定向与广播投递，不内置角色、场景、任务看板或独立 dashboard。
- [cindyguyuehu123/dsh-webchatlike](https://github.com/cindyguyuehu123/dsh-webchatlike) — 更贴近 deepseek 网页版/App 的聊天体验：原位编辑提问、重新生成回复、每条消息带 <i/N> 版本翻页器（树状版本模型，跨对话保持稳定）。
- [penguin-oo/dsh-bookmarks](https://github.com/penguin-oo/dsh-bookmarks) — 收藏 AI 回复（备注/标签），跨会话收藏中心（搜索/筛选/跳回会话），一键导出 Markdown。

- [Anionex/dsh-turn-rewind](https://github.com/Anionex/dsh-turn-rewind) — 对话回退：基于持久 Change Ledger 回滚会话与工作区状态。
- [GengDaPeng/dsh-agent-message](https://github.com/GengDaPeng/dsh-agent-message) — DeepSeek Harness 跨会话 Agent 通信：支持会话发现、离线投递、投递回执与发送方会话导航。
- [Jesse-njx/dsh-crosstalk](https://github.com/Jesse-njx/dsh-crosstalk) — 跨会话消息：本机任意会话都可像 Claude Code 一样列出并互发消息，基于本地心跳注册表与收件箱。
- [dongsheng123132/task-passport](https://github.com/dongsheng123132/task-passport) — 通过机器可读检查点与乐观锁，在 DeepSeek Harness、WorkBuddy、Claude Code 和 Codex 之间交接持久任务状态。
- [LeslieWylie/dsh-task-relay](https://github.com/LeslieWylie/dsh-task-relay) — 跨会话任务队列与交接摘要：会话与子 agent 在共享的文件队列上投递、认领、完成、取消任务，并留下交接摘要供后续会话查看。
- [hellodigua/dsh-share](https://github.com/hellodigua/dsh-share) — 一键分享你的对话。
- [ChuanTianML/dsh-local-share](https://github.com/ChuanTianML/dsh-local-share) — 把完整 Web Session 导出为本地 Markdown 或自包含 HTML，提供稳定的 Markdown 渲染预览、默认脱敏和可选的有界工具调用详情。
- [Moeblack/dsh-message-edit](https://github.com/Moeblack/dsh-message-edit) — 基于分支的消息编辑、reroll、重试与版本时间线。
- [Buyi-wsgzg/dsh-sidechain](https://github.com/Buyi-wsgzg/dsh-sidechain) — `/side` 持续性侧会话与 `/btw` 一次性侧问，在临时 fork 中运行、不写入主会话历史。
- [bill9109/dsh-conversation-share](https://github.com/bill9109/dsh-conversation-share) — 分享任意段落的对话。
- [yuezengwu/dsh-explain](https://github.com/yuezengwu/dsh-explain) — 本地优先学习模式：跨会话全局学习线程、按来源讲解。
- [Moeblack/dsh-prompt-studio](https://github.com/Moeblack/dsh-prompt-studio) — 带实时预览的用户/内置 system prompt 分节编辑器。
- [czm15053/dsh-peer-link](https://github.com/czm15053/dsh-peer-link) — 让 dsh 和 Claude Code 会话直接互发消息，附带可点击的会话列表卡片（搜索/刷新/弹窗发送）。
- [PwnKY/dsh-session-link](https://github.com/PwnKY/dsh-session-link) — 复制、打开 `dsh://` 会话深链，或将其粘贴到另一对话中，注入被引用会话的受限只读快照。
- [Nwflower/dsh-chat-import](https://github.com/Nwflower/dsh-chat-import) — 把 13 家 coding agent（Claude Code、Codex、ChatGPT、Cursor、Gemini、opencode 等）的完整对话历史导入为可续聊的 DeepSeek Harness 会话，并支持反向导出回 Claude Code。
- [Nwflower/dsh-file-claim](https://github.com/Nwflower/dsh-file-claim) — 同一工作区并行多会话的文件认领与写入保护（claim/release、心跳 stale 接管、pending 三路合并）。
- [Chinesezjc/dsh-interconnect](https://github.com/Chinesezjc/dsh-interconnect) — 跨实例互联：经 interconnect 服务在多个 DSH 实例间转发消息与事件。
- [3403473060/dsh-inline-images](https://github.com/3403473060/dsh-inline-images) — 对话内联图片：LLM 回复中输出的本地图片路径在消息正文直接渲染为图片（9 种格式、点击放大灯箱、可调尺寸）。
- [Wine-Red/dsh-prompt-stash](https://github.com/Wine-Red/dsh-prompt-stash) — 本地、按会话隔离的 LIFO 输入暂存：临时收起未完成的输入，之后安全恢复并继续编辑。
- [heartmove/dsh-side-chat](https://github.com/heartmove/dsh-side-chat) — 选中对话片段，在右侧面板的侧边聊天中提问（按会话隔离）；AI 回复可原文或摘要后带回主会话。
- [bwndlct/dsh-session-export](https://github.com/bwndlct/dsh-session-export) — 把当前会话导出为可移植、带 schema 版本的 Markdown 与 JSON 文件，提供 `session_export` 工具与斜杠命令两种入口，文件名跨平台安全。
- [LeemanCheung/dsh-token-usage](https://github.com/LeemanCheung/dsh-token-usage) — 持久化记录每个会话的 Token 用量，在设置页提供 provider/model 统计与最近 52 周活跃度热力图。
- [whyihaveyou/dsh-suite#plugin-session-export](https://github.com/whyihaveyou/dsh-suite/tree/main/packages/plugins/plugin-session-export) — 把 append-only 会话日志导出为按轨迹来源分组的可读 Markdown 或 HTML。
- [LeslieWylie/dsh-session-search-pro](https://github.com/LeslieWylie/dsh-session-search-pro) — 通过 harness 自带的 `sessionQuery` 服务搜索、列出、读取历史与当前会话：部署启用了 SQLite FTS5 索引时走索引，未启用时回退到有上限的倒序扫描。
- [lsz-asd/dsh-plugin-session-delete](https://github.com/lsz-asd/dsh-plugin-session-delete) — 在 Web UI 与桌面客户端中删除 DSH 会话：头部危险按钮 + 会话行菜单项，风险确认弹窗，宿主端点与 agent 工具同步清理会话日志、投影缓存与工作区记账。
- [huguangyu666/dsh-plugin-session-import](https://github.com/huguangyu666/dsh-plugin-session-import) — 把 claude-code / codex / reasonix / zcode 的聊天历史导入为 dsh 会话：工作区绑定、工具调用保留、超长会话保护、zcode 压缩还原。
- [beijingwahw/dsh-companion](https://github.com/beijingwahw/dsh-companion) — 四模块会话伴侣：对话智能导出（Markdown/PDF/JSON/PNG 长图、隐私脱敏、批量 ZIP）、上下文交接摘要（模板保存与导入继承）、API 成本优化（官方动态计价、峰谷调度、日/月双档预算、模型路由）、全局对话检索与对话内搜索（Ctrl+F、CSS Custom Highlight API）。
- [ishuowang/dsh-sideband](https://github.com/ishuowang/dsh-sideband) — 即时冻结有界上下文，由隔离且无工具的 LLM 总结，再异步投递到 Session 或已授权 Room；支持 quiet/wakeup 模式与原生目标选择器。
- [mayf3/dsh-session-doctor](https://github.com/mayf3/dsh-session-doctor) — 会话医生：列出会话（含 agent 运行状态）、读取会话记录、诊断卡死的 agent、解卡（cancel + keepInbox 保留排队消息）、向其他会话发送消息。
- [MuWinds/dsh-archived-sessions](https://github.com/MuWinds/dsh-archived-sessions) — 归档会话管理：浏览已归档会话，支持恢复（取消归档）与清空。
- [anweat/dsh-assistant-message-forge](https://github.com/anweat/dsh-assistant-message-forge) — 消息锻造台：创建/修改/注入测试用 assistant 消息，导入识别并安全修复 session.jsonl(.zstd) 会话日志为新会话。
- [yangyongzhen/dsh-session-export](https://github.com/yangyongzhen/dsh-session-export) — 会话导出为 Markdown/JSON，便于复盘、重放与单会话成本汇总。
- [yangyongzhen/dsh-session-report](https://github.com/yangyongzhen/dsh-session-report) — 会话成本与耗时报表：tokens / 缓存命中 / 耗时。
- [Boliban/dsh-enter-customizer](https://github.com/Boliban/dsh-enter-customizer) — 接管聊天输入框的回车等快捷键，每个快捷键的行为都能单独配置。
- [wsxwj123/dsh-plugins#dsh-session-manager](https://github.com/wsxwj123/dsh-plugins/tree/main/packages/dsh-session-manager) — 会话删除（5 秒可撤销 + 回收站）与归档视图（查看、取消归档）。
- [reinocheong/dsh-session-move](https://github.com/reinocheong/dsh-session-move) — 在 Web 侧边栏把会话移动到别的文件夹（拖拽或菜单选择），带风险确认地永久删除会话，以及 AI 重命名会话（总结整个对话并自动纠正错别字）；每个操作都提供 agent 工具。
- [dylan121322/dsh-session-unarchive](https://github.com/dylan121322/dsh-session-unarchive) — 从 Web GUI 侧栏查看已归档会话，并一键恢复到原工作区。

### 🧠 记忆

- [LoserFox/distill](https://github.com/LoserFox/distill) — 自动对话蒸馏：后台 subagent 反省 + 技能 create/update。
- [omdsh-dev/dsh-mnemon](https://github.com/omdsh-dev/dsh-mnemon) — 由 Mnemon 驱动的 DeepSeek Harness（DSH）跨 Agent、本地优先的持久记忆插件。它可在支持 Mnemon 的 Agent 之间共享长期记忆，并提供运行时记忆、可检索项目档案、语义召回、知识图谱和 Sidebar UI。
- [modusensus/dsh-mneme#dsh-mneme](https://github.com/modusensus/dsh-mneme/tree/main/dsh-mneme) — 跨会话记忆：SQLite + 可人工编辑的 Markdown 镜像，autoDream 后台自动巩固（去重/合并/冲突裁决），6 个记忆工具，完全离线语义检索（本地向量 / 精排 / 聚类）。
- [nowledge-co/nowledge-mem-deepseek-harness](https://github.com/nowledge-co/nowledge-mem-deepseek-harness) — 给所有 AI 工具和 Agent 共用的一层记忆：注入 Context Bundle、提示时检索、MCP 工具与回合结束 DSH 线程捕获。
- [Jesse-njx/dsh-memory](https://github.com/Jesse-njx/dsh-memory) — 基于 DSH 无损会话日志的引用式记忆：蒸馏出的事实带 `(sessionId, eventRange)` 引用，可随时展开回原始日志片段。
- [flymysql/dsh-memory](https://github.com/flymysql/dsh-memory) — 跨会话记忆库：remember / recall / forget 工具、每轮提示注入与设置页条目浏览。
- [Xplore-LAB/dsh-plugin-asmemory](https://github.com/Xplore-LAB/dsh-plugin-asmemory) — 动作-状态时序记忆：记录类型化的状态与动作，做趋势、异常与因果关联分析。
- [PerryLink/dsh-memento](https://github.com/PerryLink/dsh-memento) — 有界、分层、带审批门、可审计的跨会话记忆：`ctx.memory` 服务 + 零依赖 SQLite 存储 + `memory` 工具与冻结快照注入；写入必过审批门，模型可见内容可自会话日志重建。
- [GIT121995/dsh-memory-gate](https://github.com/GIT121995/dsh-memory-gate) — 有界本地记忆 + CBDC 权威门控：SQLite + FTS5 claims，作用域召回并给出可解释的采用/核验/忽略决策与完整审计轨迹，/memory 命令，每次注入 ≤3 条/1200 字符，不增加额外模型调用。
- [ICCuse/dsh-file-memory](https://github.com/ICCuse/dsh-file-memory) — 文件型工作记忆：memorize/recall 把关键前提逐字保存在会话笔记文件，无损挺过上下文压缩。
- [ICCuse/dsh-knowledge](https://github.com/ICCuse/dsh-knowledge) — 全局知识库桥：kb_add/kb_search/kb_show/kb_timeline 读写与 Codex 共享的 D:\knowledge（格式逐字节兼容）。
- [ICCuse/dsh-premise-guard](https://github.com/ICCuse/dsh-premise-guard) — 压缩后前提漂移守卫：摘要丢失关键字面锚点时注入一次性提醒。
- [freehul/sgme](https://github.com/freehul/sgme) — 拾光记忆引擎（SGME）桥接：多智能体共享长期记忆（HTTP）—— L0/L1/L1.5/L2 分层提炼、按场景注入、统一检索、主动关怀信号（memory_search / wiki_search / signal_pull / signal_claim / signal_ack），npm 包名 `dsh-sgme`。
- [Phant0Meow/dsh-memory-meow](https://github.com/Phant0Meow/dsh-memory-meow) — 项目级跨会话记忆：PROJECT.md 快照注入首条用户消息（缓存友好）+ memory_remember 工具 + ReAct 任务结束自动反思；各项目独立记忆文件，互不互通。
- [jiayan-xu/dsh-memoria](https://github.com/jiayan-xu/dsh-memoria) — 向量+图记忆后端：observe/remember/search/recall 四个工具对接本地 memoria 服务，HNSW 语义召回 + FTS5 关键词 + 知识图谱信号经 RRF 融合排序，回合结束自动写入，按 Agent 命名空间隔离。
- [jinguanghai/deepseek-harness-forge-plugins#forge-memory](https://github.com/jinguanghai/deepseek-harness-forge-plugins/tree/main/plugins/forge-memory) — 基于 BM25 关键词检索的记忆召回。
- [FuRongJun-1999/dsh-memory](https://github.com/FuRongJun-1999/dsh-memory) — 多智能体时空记忆图：跨会话持久化与重要性门控召回。
- [jiayan-xu/dsh-memoria-extra](https://github.com/jiayan-xu/dsh-memoria-extra) — memoria 进阶工具：会话上下文注入（画像+召回）、近期决策、健康报告、命名空间白名单、记忆关系图与实体搜索；dsh-memoria 的伴生插件。

- [truelove-dreamer/dsh-plugin-recall](https://github.com/truelove-dreamer/dsh-plugin-recall) — 跨会话记忆：全文检索所有历史会话（复用 ctx.sessionQuery 的 SQLite FTS5 索引），把最强匹配片段带回当前上下文。
- [Noelune/unified-agent-memory](https://github.com/Noelune/unified-agent-memory) — 多 Agent 共享一个 Obsidian vault：零依赖 Python core（检索/晋升/裁决/遗忘）+ vault 模板 + dsh 插件（memory_search/show/submit/status）。
- [FleetingEcho/dsh-handoff](https://github.com/FleetingEcho/dsh-handoff) — 每个工作目录与 git 分支自动维护 handoff.md：记录回合、折叠为简洁 Markdown 并注入后续会话，存储于 ~/.agent/agent-handoff，与 pi-handoff 字节级兼容。
- [yangyongzhen/dsh-memory](https://github.com/yangyongzhen/dsh-memory) — 会话开始自动注入的长期记忆：preference/fact/summary/knowledge 四类、global/project 双作用域，`agent/pre-step` 字节预算召回，JSON 原子持久化。
- [akslcw/dsh-negative-ledger](https://github.com/akslcw/dsh-negative-ledger) — 证据约束的负面知识账本：记录被证伪的路径（command_failed / file_missing）及其结果与前置条件证据，重复尝试时警告或拦截，证据变化后自动解除。
- [ljsysfurryACE/dsh-memory-director](https://github.com/ljsysfurryACE/dsh-memory-director) — LLM 驱动的记忆记/忘插件：每轮对话后由模型决定记住什么/忘记什么（MemoryDirector），请求前注入相关记忆，自动去重，跨会话持久化。
- [ljsysfurryACE/dsh-compaction](https://github.com/ljsysfurryACE/dsh-compaction) — 压缩后端：用确定性语义提取器替换 LLM 摘要（保留代码/路径/命令，剔除闲聊），附带 28.4x KV 压缩记账。
- [highland0971/dsh-native-memory](https://github.com/highland0971/dsh-native-memory) — 基于 DSH 原生接缝的按工作区记忆：事实与有界常驻档案落在 storage-domain 的 JSON 单元上，写入经人工审批并带 `(sessionId, seq)` 引证，确定性召回 + session-query 全文检索历史会话——无外部服务器、无自建 SQLite。

- [Aik358/dsh-auto-memory](https://github.com/Aik358/dsh-auto-memory) — DSH 自动记忆插件：三层记忆自动注入与检索、每轮对话自动沉淀、AI 时段问候与三级抽屉、智能检索、日历视图与设置页，支持继承其他 AI 工具的记忆。
### 🛠️ 工具与能力
- [Johnny-xuan/dsh-paste-to-path](https://github.com/Johnny-xuan/dsh-paste-to-path) — 为图片、文档、压缩包、代码及其他文件提供路径附件 Dock，文件读取交由 Agent 的当前可用工具完成。
- [moononnn/DeepSeek-Harness-biaoqingbao](https://github.com/moononnn/DeepSeek-Harness-biaoqingbao) — 表情包表达插件：让助手用表情包表达情绪，按情绪自动配图，含图库管理、AI 识图打标、方言口音、学我说话，还能点「和助手聊聊」直接调教标签。
- [wloops/dsh-git-worktree](https://github.com/wloops/dsh-git-worktree) — Domi 级 git worktree 隔离与交付：.dsh-worktrees 永久 worktree，ready-for-review / apply / finish / discard 完整生命周期，冲突处理与安全清理（移植自 Domi 生产系统）。
- [x2802490130-prog/dsh-tool-writing](https://github.com/x2802490130-prog/dsh-tool-writing) — 写文引擎：用独立 DeepSeek key 分流并发生成草稿/细纲/点子，设定与伏笔管理、语义向量检索、书库（饲料区）、用量总账、机械校对与本地连载计划。
- [x2802490130-prog/dsh-writing-remote](https://github.com/x2802490130-prog/dsh-writing-remote) — 写文引擎的 host 侧数据通道：把项目分卷、章节状态、书库、全文检索、演化条目与线索图谱以 Typert remote 暴露给客户端写作面板。
- [xmutfyh/dsh-plugin-writing-guard](https://github.com/xmutfyh/dsh-plugin-writing-guard) — AI 论文写作常见错误守卫：扫描修改过程残留、防御性写作与 AI 写作痕迹（破折号滥用、不是X而是Y、LLM 高频词、三连排比）；提供 writing_audit / writing_rules 工具，论文文件写入后自动审计。
- [ConsoleSun/Gemini-Eyes](https://github.com/ConsoleSun/Gemini-Eyes) — 接入 gemini.google.com 的 MCP 桥：图片/视频视觉识别、Imagen 生图、Veo 生视频与历史对话管理，复用浏览器登录态，无需 API Key。
- [Edge-Echo/dsh-mcp-bridge](https://github.com/Edge-Echo/dsh-mcp-bridge) — 精选 MCP 服务器全家桶：一键接入演示、记忆、文件系统、GitHub、Playwright、远程 HTTP 等服务器，自带连通性验证工具与 CI 检查。

- [Smalldy/godot-bridge](https://github.com/Smalldy/godot-bridge) — DSH↔Godot 引擎运行时控制桥：通过游戏内置 TCP 交互服务器启动并操控运行中的 Godot 4.x——8 个工具（场景/UI 检查、GDScript eval、输入模拟、截图、headless 静态操作、脚本编译检查），替代 godot-mcp。
- [LeemanCheung/dsh-agent-preset-recommender](https://github.com/LeemanCheung/dsh-agent-preset-recommender) — 隐私安全的本地扫描器：汇总 Codex、Claude Code、WorkBuddy、CodeBuddy 的会话/workflow 元数据，持久化聚合证据并推荐 DSH 内置 Agent preset；不保留正文、不联网、不修改 preset。
- [CheshireJCat/blender](https://github.com/CheshireJCat/blender) — Blender 3D 生产插件：提供 30 个建模/重建 Skill、13 个运行时工具和 26 个确定性 Helper，覆盖参考图拟合、渲染、验证、动画与可移植格式导出；npm 包名 `dsh-blender`。
- [ysr666/dsh-vision-router](https://github.com/ysr666/dsh-vision-router) — 为纯文本 Agent 提供视觉能力：内置免 Key 视觉链 + 像素级视觉工具（看图问答、定位、裁剪、像素对比、取色、OCR、矢量化、抠图、截图）；粘贴图片即可用。
- [Flyvhidbwo/dsh-vision-proxy](https://github.com/Flyvhidbwo/dsh-vision-proxy) — DeepSeek 大脑 + 自动识图：GUI 附加的每张图片自动经 OpenAI 兼容 VLM 转译成文字，再交给纯文本的 DeepSeek 作答——有 key 自动走快速通道（默认 qwen3.7-flash，支持百炼/智谱/OpenRouter 等任意 OpenAI 兼容端点），无 key 自动探测本地 Ollama（零配置，图片不出本机）。
- [ximengxiaolan/dsh-vision-bridge](https://github.com/ximengxiaolan/dsh-vision-bridge) — 输入框贴图自动识别：由 OpenAI 兼容视觉模型转成文字描述后，再交给纯文本 DeepSeek 模型处理。
- [linenxi-ctrl/dsh-vision](https://github.com/linenxi-ctrl/dsh-vision) — 外挂识图插件：鲸鱼按钮配置面板、图片识图自动回传、模型自主截图识图工具。
- [Einskyle/dsh-llm-vision-bridge](https://github.com/Einskyle/dsh-llm-vision-bridge) — DeepSeek 视觉桥接：注册原生 LLM provider，聊天内粘贴的图片自动由视觉模型（pi-ai/llama.cpp 上的 Qwen3-VL）转成文字描述后交给纯文本 DeepSeek 作答——图片准入、路由与会话压缩全部走 harness 原生机制，带 LRU 描述缓存与 503 重试。
- [shinjiyu/dsh-plugin-multimodal](https://github.com/shinjiyu/dsh-plugin-multimodal) — 在纯文本 DeepSeek 线路上开放贴图准入，用视觉 sidecar 把附件转成文字，原生视觉模型不改写。
- [lire1131/dsh-undo-plugin](https://github.com/lire1131/dsh-undo-plugin) — DSH 撤销/回退系统：配置变更自动存档，一键撤销/恢复/回退到任意版本，支持 WebUI 与离线 CLI/GUI 工具（DSH 启动失败也能救）。
- [MAXeaglet/dsh-bash-terminal](https://github.com/MAXeaglet/dsh-bash-terminal) — 一个 shell 工具：Windows 上统一执行 PowerShell / Git Bash / WSL，外加交互式 PTY 终端，默认终端由用户在设置中选择。
- [Fro2en12/dsh-download-progress](https://github.com/Fro2en12/dsh-download-progress) — 下载进度面板：URL 下载器、agent shell/SSH 传输追踪与工作区黑箱文件增长监控，汇聚到可拖拽浮窗实时显示字节、速度、百分比与预计剩余时间。
- [CZX2244/dsh-bilibili](https://github.com/CZX2244/dsh-bilibili) — B站视频分析工具：提取元数据、字幕文稿（必剪/本地 ASR 兜底）、评论与弹幕，抓取清晰关键帧并可选本地视觉描述。
- [Anionex/dsh-vision-toolkit](https://github.com/Anionex/dsh-vision-toolkit) — 让纯文本模型更好地做视觉任务：带意图的图片问答、长截图 OCR、UI 还原等。
- [SPYQWER1/dsh-codex-tools](https://github.com/SPYQWER1/dsh-codex-tools) — 基于 Codex 的 `web_search`、`image_gen` 与 `image_vision` 工具，复用 ChatGPT OAuth 登录态为 DeepSeek Harness 提供网页搜索、生图与识图能力。
- [LeemanCheung/dsh-image-gen](https://github.com/LeemanCheung/dsh-image-gen) — 通过 `image_gen` 工具调用 GPT Image 2 生图，实时展示服务端渐进图与 Codex 风格显影卡片，并支持附件回放、预览和下载。
- [yun520-1/deepseek-heartflow](https://github.com/yun520-1/deepseek-heartflow) — 心虫（AGI 第1层辨别门禁）作为 DSH 插件：47 维纯规则文本判别（heartflow_check 工具）+ 工具调用后自动输出监督（fail-closed，引擎缺失时拒绝放行）。
- [omdsh-dev/dsh-custom-tool](https://github.com/omdsh-dev/dsh-custom-tool) — 用 Monaco 编辑器创建和管理沙箱化的自定义 JavaScript 工具。
- [shinjiyu/deepseek-harness-evolver](https://github.com/shinjiyu/deepseek-harness-evolver) — 补充官方创造模式：把内存里试过的小工具插件校验、经 ctx.plugin 热挂、打分后固化到盘上或回滚。
- [ZRui-C/dsh-computer-use](https://github.com/ZRui-C/dsh-computer-use) — DSH 电脑控制：Playwright/CDP 后台操作 Chromium，Accessibility 优先控制 macOS；动作锁定到正确进程与窗口，不抢前台、不移动鼠标，提供已签名公证的 Universal 2 DMG 安装包。
- [kyo615/dsh-browser-control](https://github.com/kyo615/dsh-browser-control) — 基于 Playwright MCP 的 AI 浏览器控制：驱动真实可见的 Chrome（导航/点击/输入/快照，约 80 个 browser_* 工具），并在 GUI 内嵌实时截图面板，每次操作后自动刷新。
- [Anionex/dsh-computer-use](https://github.com/Anionex/dsh-computer-use) — macOS 电脑控制：Accessibility 观测、过期状态拒绝、作用域权限与安全输入。
- [kunjinkao-os/dsh-mobile-gui-agent](https://github.com/kunjinkao-os/dsh-mobile-gui-agent) — Android GUI Agent：ADB 截图、压缩 UI hierarchy 定位、逐步动作验证、审批和 Mobile Web 视图。
- [omdsh-dev/dsh-data-agent](https://github.com/omdsh-dev/dsh-data-agent) — 让 AI 帮你连数据库、写 SQL。
- [omdsh-dev/dsh-toolkit](https://github.com/omdsh-dev/dsh-toolkit) — 零依赖工具包：time / encoding / json / calculator / csv / regex / markdown / diff / stat / schema 十件套一键安装。
- [flymysql/dsh-remote](https://github.com/flymysql/dsh-remote) — 多机远程工作区：管理多台 SSH 主机，在原生「添加工作区」流程里选本机系统文件夹或远程目录，把远程工作区镜像成真实本地文件夹并用 rw_* 工具操作。选择器是居中弹窗，默认落在本机页签，远程路径自动预填 `/` 并逐级自动补全目录。
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
- [akqwpeter-prog/dsh-media-skills](https://github.com/akqwpeter-prog/dsh-media-skills) — 面向纯文本模型的免费视觉桥与生图：粘贴读图、GLM-4V-Flash 与 Gemini 引擎故障转移、modlens 同款结构化证据输出，并自动播种免费视觉模型路由。
- [Dariandai/dsh-starter-pack](https://github.com/Dariandai/dsh-starter-pack) — 精选插件启动包：从设置页或 /setup 命令一键批量安装并配置 4 组共 15 个经过筛选的社区插件。
- [crTnT/dsh-plugin-suite#dsh-plugin-center](https://github.com/crTnT/dsh-plugin-suite/tree/main/dsh-plugin-center) — 插件中心：在设置页发现、安装与管理 DSH 插件。
- [crTnT/dsh-plugin-suite#dsh-plugin-updater](https://github.com/crTnT/dsh-plugin-suite/tree/main/dsh-plugin-updater) — 已装插件更新管理：检查更新、备份与回滚。
- [awesome-dsh-plugin/dsh-find-plugin](https://github.com/awesome-dsh-plugin/dsh-find-plugin) — 会话内直接找插件：按关键词/分类搜索本精选 registry，返回描述与可直接执行的安装命令。
- [lonelymoon87/dsh-code-intel](https://github.com/lonelymoon87/dsh-code-intel) — 用 Tree-sitter 建立工作区符号索引，提供词法或可选 embedding 辅助的代码检索。
- [lynx-gt/dsh-subagent-tools](https://github.com/lynx-gt/dsh-subagent-tools) — 子代理委派的按调用覆盖：model/provider/persona/toolFilter、@preset: 引用与 provider/model 组合 id。
- [lynx-gt/dsh-subagent-cwd](https://github.com/lynx-gt/dsh-subagent-cwd) — 在 dsh-subagent-tools 基础上增加子代理按调用 cwd，附带所需的两个 in-process provider 补丁。
- [Jesse-njx/dsh-voice](https://github.com/Jesse-njx/dsh-voice) — 语音输入、语音输出：把口述音频转写为用户消息（transcribe），让 agent 朗读回复（speak），本地优先，音频存于 ~/.dsh/voice。
- [Jesse-njx/dsh-docker](https://github.com/Jesse-njx/dsh-docker) — 类型安全、带护栏的容器控制：ps/logs/inspect/exec/start/stop 与 compose up/down，JSON 输出、项目感知定位、破坏性操作需审批。
- [hccccc01333/dsh-excel-chat](https://github.com/hccccc01333/dsh-excel-chat) — 在 DeepSeek Harness 里对话完成 Excel 工作：建表、编辑、修复公式、图表校验，每次编辑后自动体检公式。
- [zhang787jun/dsh-finance](https://github.com/zhang787jun/dsh-finance) — 金融研究工作流与组合风控工具，对当前市场事实强制来源与时间戳边界。
- [Realyujie/dsh-us-stocks](https://github.com/Realyujie/dsh-us-stocks) — 美股行情、历史 K 线、财务报表、分析师共识与新闻，数据来自 yahoo-finance2。
- [1624318455/dsh-plugin-tavily](https://github.com/1624318455/dsh-plugin-tavily) — 基于 Tavily 的网页搜索提供方：替换内置 web_search 的后端，并提供 API Key、结果数量与时间窗口的设置卡片。
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
- [shinjiyu/dsh-plugin-search](https://github.com/shinjiyu/dsh-plugin-search) — 不用官方 DeepSeek API 也能用内置 web_search：关掉 web-search-deepseek，默认走 Tavily keyless。
- [Lum1104/dsh-browser](https://github.com/Lum1104/dsh-browser) — Chrome 侧边栏扩展，让 DSH 直接操控你的浏览器，无需视觉能力。
- [huey1in/trio](https://github.com/huey1in/trio) — 浏览器自动化（Playwright，带实时画面）+ MCP Server（把 DSH agent 暴露给任何 MCP 客户端）+ GitHub issue/PR/webhook 评审工具。
- [zoahdev/dsh-github-release-radar](https://github.com/zoahdev/dsh-github-release-radar) — 让 dsh agent 直接查询任意 GitHub 公开仓库的 Release 与星标变化，无需 API Key。
- [zoahdev/dsh-github-intelligence](https://github.com/zoahdev/dsh-github-intelligence) — 目前最完整的 dsh GitHub 整合：仓库概览、Release、Issue、PR、贡献者、搜索与一键深度报告，内置 TTL 缓存，无需 API Key。

- [SamXiaBing/dsh-adb](https://github.com/SamXiaBing/dsh-adb) — ADB 设备·台架运维工具集：设备发现、结构化 logcat（后台采集）、apk 安装、文件 pull/push、性能快照。
- [xiaoyuyu6420/dsh-backup](https://github.com/xiaoyuyu6420/dsh-backup) — 一键备份与恢复 DSH 用户数据：/backup 备份、完整性校验、恢复，定时自动备份（重启续跑），sha256 校验与自动轮换（macOS/Linux/Windows）。
- [Letter2025/dsh-tool-search](https://github.com/Letter2025/dsh-tool-search) — Hermes 风格工具搜索与瘦身：渐进式披露，语义搜索/查看/调用长尾工具，核心工具保持直通。

- [1na-ko/dsh-hdc-bridge](https://github.com/1na-ko/dsh-hdc-bridge) — 鸿蒙设备桥：hdc 截图/装包/日志/崩溃/UI 自动化闭环（配 read_image 看图），官方优先版本化 API 知识层（SDK .d.ts + 离线随包文档），以及 DevEco CLI 构建/签名/lint 通道。
- [PicGo/dsh-plugin](https://github.com/PicGo/dsh-plugin) — 通过 PicGo 已有配置（PicGo Cloud、GitHub、S3、腾讯云 COS、七牛，或任意已安装的上传插件）把本地图片和文件上传到图床，提供 `picgo_upload` 工具与 `/picgo` 命令。
- [mafeis/dsh-net-proxy](https://github.com/mafeis/dsh-net-proxy) — 让 agent 的网络请求走本机 HTTP/CONNECT/SOCKS5 代理。
- [bwndlct/dsh-session-audit](https://github.com/bwndlct/dsh-session-audit) — 会话执行分析：步骤、工具调用、失败、重复动作、token 用量与验证信号，输出 text/Markdown/JSON 报告。
- [fly233338/dsh-overleaf](https://github.com/fly233338/dsh-overleaf) — 通过 OverleafMCP 将多个 Overleaf 项目接入 DSH，支持浏览、分析和通过 Git 写回 LaTeX 文件。
- [LeslieWylie/dsh-fleet-audit](https://github.com/LeslieWylie/dsh-fleet-audit) — 只读的 agent 机群凭据卫生审计：检查凭据文件权限、git remote 内嵌凭据（输出脱敏）与 provider token 字面量计数；零依赖、确定性。
- [LeslieWylie/dsh-md-preview](https://github.com/LeslieWylie/dsh-md-preview) — 把 Markdown 渲染为自包含的独立 HTML 页面：提供在 headless 配置下同样可用的 `md_html_render` 工具，以及在网页端浏览、预览、编辑并导出本地 `.md` 文件的抽屉；两个入口共用同一个渲染器，无运行时依赖。
- [jinguanghai/deepseek-harness-forge-plugins#forge-gates](https://github.com/jinguanghai/deepseek-harness-forge-plugins/tree/main/plugins/forge-gates) — 真实计算验证门：数学化简、逻辑证明、正则校验、E-prover 一阶逻辑、状态机检查与代码修复，由 Go 编译的二进制支撑（附 Windows 预编译产物）。
- [jinguanghai/deepseek-harness-forge-plugins#forge-tcm](https://github.com/jinguanghai/deepseek-harness-forge-plugins/tree/main/plugins/forge-tcm) — 中医工具集：八纲辨证与药对查询。
- [lsz-asd/dsh-plugin-device-info](https://github.com/lsz-asd/dsh-plugin-device-info) — 只读的 Windows 设备信息工具：每个 Win32 设备类别一个 agent 工具（时间、系统、CPU、内存、磁盘、GPU、网络、电池、进程、USB、音频、打印机），基于 WMI/CIM 与 Node os 采集。
- [jiayan-xu/dsh-codebase-memory](https://github.com/jiayan-xu/dsh-codebase-memory) — codebase-memory-mcp 的代码知识图谱桥：语义符号搜索（BM25）、源码片段、Leiden 社区架构总览、调用/数据流/跨服务追踪、图增强 grep。
- [jiayan-xu/dsh-nuphus-mcp](https://github.com/jiayan-xu/dsh-nuphus-mcp) — 桌面 + 浏览器自动化桥（36 个工具）：窗口/屏幕/鼠标/键盘控制配 PaddleOCR 元素感知，Chrome CDP 浏览配无障碍快照。
- [superagents-lab/dsh-s1](https://github.com/superagents-lab/dsh-s1) — Search1API（s1）原生联网检索工具：网页搜索、新闻、页面抓取、站点地图与趋势榜，以 `s1_*` 一等工具形式提供，并附带 s1 技能。

- [truelove-dreamer/dsh-plugin-git-workflow](https://github.com/truelove-dreamer/dsh-plugin-git-workflow) — 一等公民的 Git 工具：status / diff / log / commit / branch，参数与路径校验、零 shell 调用，杜绝注入。
- [wly8691-jpg/knowlp-rag](https://github.com/wly8691-jpg/knowlp-rag) — Markdown 笔记的双知识图谱 RAG：前置依赖 + 相似关联双图（P/S-Agent 遍历）、段落级匹配、ngram/embedding 混合检索、显式权重反馈闭环，以 MCP 接入。
- [ChenLaoshiYF/dsh-mcpguard](https://github.com/ChenLaoshiYF/dsh-mcpguard) — 扫描 skill 与 MCP 配置中的提示注入、同形字、Unicode 隐形字符、危险 shell 与凭据泄露。
- [6Mikao9/dsh-wsl-workspace](https://github.com/6Mikao9/dsh-wsl-workspace) — 从 Web GUI 添加 WSL 工作区，无需在 WSL 之中再次安装 dsh 以及相关工具，bash 命令与文件读写运行在本机 WSL 发行版内，Windows 文件仍可访问。
- [dfycaly98931680/dsh-trajectory-governance](https://github.com/dfycaly98931680/dsh-trajectory-governance) — Agent 轨迹治理与异常诊断：把平铺会话日志重建为多分支轨迹树，识别循环死锁/无效重试/目标漂移，带成本归因的告警与一键中断/断点分支（官方 API），独立 GUI Tab。
- [Q1hangL/dsh-ask-guard](https://github.com/Q1hangL/dsh-ask-guard) — 为 ask_user_question 提供协作式超时守卫：提问卡片丢失或用户未答复时以结构化 ASK_TIMEOUT 结束调用，避免回合无限挂起。
- [Huang-zhishi/dsh-plugin-call-trace](https://github.com/Huang-zhishi/dsh-plugin-call-trace) — 持久化模型工具调用轨迹记录器：每次工具调用落盘为 JSONL（重启不丢），提供结构化 call_trace 查询工具与 callTraceHistory 服务，支持文件大小轮转，附可选浮层画布 UI。
- [ShiXiangYu2/dsh-translate-pro](https://github.com/ShiXiangYu2/dsh-translate-pro) — 专业翻译：18 种目标语言、4 种风格（正式/口语/技术/直译）、术语表控制译名、整文件翻译（README/文档/字幕）并保留 Markdown 与代码块格式；经 SiliconFlow 调用 DeepSeek。
- [anweat/dsh-web-search-pro](https://github.com/anweat/dsh-web-search-pro) — 增强型、可持久化的网页搜索：多引擎路由（DeepSeek/Exa/DDG/Bing/Jina + GitHub/B站/YouTube/V2EX/小红书/Twitter/Reddit/RSS）、SQLite+LRU 缓存、userscript 风格抽取、Playwright 渲染。
- [anweat/dsh-browser](https://github.com/anweat/dsh-browser) — 自包含浏览器运行时：Playwright（chromium）+ OpenCLI 作为插件本地依赖（全局复用回退），提供 `browser` 服务与 9 个交互式浏览器工具。
- [anweat/dsh-voice-webspeech](https://github.com/anweat/dsh-voice-webspeech) — 浏览器 Web Speech API 语音输入：零服务端、零密钥、零模型下载（Edge=Azure 语音、Chrome=Google 语音）。
- [MicroHEROX/dsh-Kimi-WebBridge](https://github.com/MicroHEROX/dsh-Kimi-WebBridge) — 通过本地 Kimi WebBridge 守护进程驱动用户的真实浏览器：navigate、find-tab、snapshot、click、fill、evaluate、CDP、screenshot、network、upload、PDF 导出与标签管理工具，复用浏览器已登录会话。
- [MicroHEROX/dsh-exa-mcp](https://github.com/MicroHEROX/dsh-exa-mcp) — 通过内置的 @deepseek-ai/dsh-mcp-client 桥接接入托管的 Exa 搜索 MCP 端点（mcp.exa.ai）：web_search_exa 与 web_fetch_exa 工具，免费额度匿名可用，设置 EXA_API_KEY 可解锁更高限额。
- [MicroHEROX/dsh-koboldcpp-hands](https://github.com/MicroHEROX/dsh-koboldcpp-hands) — 给在线模型装上本地双手：koboldcpp_run 与 koboldcpp_vision 工具把重复的文本与视觉（OCR、图像分析、对比）劳动交给本地 KoboldCpp（llama.cpp）服务器，并按需拉起与管理服务器生命周期。
- [MicroHEROX/dsh-unsloth-hands](https://github.com/MicroHEROX/dsh-unsloth-hands) — 把重复的文本与视觉（OCR、图像分析、对比）劳动交给本地运行的 Unsloth Desktop（Unsloth Studio）服务器：unsloth_run 与 unsloth_vision 两个工具，纯 HTTP 客户端，不拉起也不持有任何进程。
- [pengxuding/dsh-plugin-judge](https://github.com/pengxuding/dsh-plugin-judge) — 插件价值裁判：装前审核（源码静态扫描 + LLM 裁判）与装后审计已装插件，模型切换时弹窗提醒复核；判断插件对当前模型是增强还是压制。
- [gloryxpnv/dsh-tool-vision](https://github.com/gloryxpnv/dsh-tool-vision) — 本地优先的结构化视觉插件：图片交给本地 OpenAI 兼容 VLM，返回 JSON 证据（摘要、逐字 OCR、版面区域、实体/关系、配色、显式不确定项），带反幻觉回退与可选粘贴/上传桥；零云端成本，图片不出本机。
- [kw78/dsh-office-tools](https://github.com/kw78/dsh-office-tools) — 面向 agent 的工作区安全 Office 工具集：创建/读取 Word、创建/读取/更新 Excel、创建/读取 PowerPoint，并支持 PNG/JPG/GIF 图片排版。

- [YZz-S/dsh-bili-summary](https://github.com/YZz-S/dsh-bili-summary) — 提供 bili_summary 工具：B 站视频元数据、字幕时间轴与 sharp 切帧配图，内置错误处理与优雅降级。
- [Vncntvx/dsh-zotero](https://github.com/Vncntvx/dsh-zotero) — 让 Agent 搜索、阅读并引用本地 Zotero 文献库：找文献、查看笔记与批注、按问题取证、打开原文、生成引用。
- [superdesigndev/treg](https://github.com/superdesigndev/treg) — 给 Agent 的工具目录：按「要做的事」检索约 2,600 个外部接口（SEO 与 SERP、外链、社交、人物与公司信息补全、广告库、抓取），查看参数与单次调用价格后直接调用，凭据由服务端注入。附带技能，MCP 行在未设置 TREG_TOKEN 前保持禁用。
- [ywgATustcbbs/dsh-human-task](https://github.com/ywgATustcbbs/dsh-human-task) — 人工协作工具（`human_task` / `human_task_ready_check`）：让 Agent 暂停等待用户完成现实操作或返回观察结果（GUI 操作、游戏测试、视觉验证、硬件检查等），内置会话同意与 AFK 在场两级门控，通过 Web 任务窗返回结构化 JSON 结果。
- [PerryLink/dsh-checkpoint-rewind](https://github.com/PerryLink/dsh-checkpoint-rewind) — DeepSeek Harness 的 Claude Code /rewind 等价能力：每次变更型工具执行前捕获 git 优先的工作区文件快照，轮次边界 fork 会话，一条 /rewind 命令恢复文件并把会话回退到检查点。
- [AngelosZou/dsh-multi-folder](https://github.com/AngelosZou/dsh-multi-folder) — 为 DSH 项目提供副工作目录：agent 保持主工作区为 cwd，同时对已配置的副目录获得同等读写/执行权限，可在会话头部与新会话页配置。
- [PerryLink/dsh-lsp-actions](https://github.com/PerryLink/dsh-lsp-actions) — DSH 的 LSP 动作面：诊断、格式化、补全、代码动作、符号、签名提示、inlay 提示与重命名，全部由真实语言服务器驱动。
- [wulusai2333/mimo-vision](https://github.com/wulusai2333/mimo-vision) — `describe_image` 视觉桥：把图片发给 mimo-v2.5、返回文字描述，让纯文本模型也能看图，原生格式直发，SVG/TIFF/HEIC 等格式经 ImageMagick 自动转码。
- [AbnerAI/dsh-monitor](https://github.com/AbnerAI/dsh-monitor) — 常驻后台监视器：文件收件箱（NDJSON）或命令输出增量一到就唤醒 agent，相当于 Claude Code Monitor 工具的 Harness 实现。
- [YuanyuanMa03/dsh-funnel](https://github.com/YuanyuanMa03/dsh-funnel) — 摄入时点的工具输出治理：保留 error/warning 行与头尾，全文落盘留指针供模型按需读回；覆盖所有返回文本的工具，小结果原样通过。
### 🧩 技能包
- [YuanyuanMa03/cot-lint](https://github.com/YuanyuanMa03/cot-lint) — 思维链泄漏检测：零依赖 CLI 扫描 AI 留在文档与注释里的会话残留（死设计引用、PR 视角、变更叙述、评审编排），内置 cot-trim 语义修复技能包。
- [dhicoc/dsh-reverse-skill](https://github.com/dhicoc/dsh-reverse-skill) — 完整 reverse-skill（85 个 SKILL.md）的 DeepSeek Harness 插件：逆向工程、授权渗透测试与安全研究的技能路由包。
- [dhicoc/dsh-wuyun-liuqi](https://github.com/dhicoc/dsh-wuyun-liuqi) — 完整 wuyun-liuqi（五运六气）中医运气学技能包，封装为 DeepSeek Harness 插件：年度与客气推算、临床辨证、病机推演。
- [creght-dev/skills](https://github.com/creght-dev/skills) — Creght 平台建站技能包：CLI 拉取/推送同步、页面与组件规范、CMS、表单、Auth、SEO、发布与版本回滚。
- [zhaiyateng/dsh-design-skills](https://github.com/zhaiyateng/dsh-design-skills) — 设计美学技能包：10 种风格（深色 SaaS、极简白、新拟态、粗野主义、毛玻璃、日式极简、便当盒、赛博朋克、蒸汽波、装饰艺术），每种含 token、组件规则、禁用清单与验收清单，附可运行落地页 demo。

- [YTxue/dsh-skill-manager-ytxue](https://github.com/YTxue/dsh-skill-manager-ytxue) — 设置侧边栏的 Skill 管理器：池与启用目录启停、文件夹批量导入（重名询问）、状态驱动一键规范检查与自动修复、系统级/项目级来源标识。
- [lunw/shopline-ai-toolkit-dsh](https://github.com/lunw/shopline-ai-toolkit-dsh) — SHOPLINE AI 工具包：接入 SHOPLINE 官方开发者 MCP 服务器，内置七个 SHOPLINE 平台技能（Admin REST、GraphQL、OAuth、Webhook、Sline），是 Shopify AI Toolkit 的 SHOPLINE 对应版。
- [jeremy9682/dsh-skill-pack](https://github.com/jeremy9682/dsh-skill-pack) — 11 个可分享的工作流 skills（handoff、triage、to-spec、to-tickets、wayfinder、teach、wait-what、dsh-mode-routing、ask-matt、overnight-execution、full-throttle），打包为可安装 bundle。
- [Cavan-Ou/hermes-dsh-collab](https://github.com/Cavan-Ou/hermes-dsh-collab) — 把 DeepSeek Harness 接进 Hermes 管线：派单 spec 模板、模型档位路由、质量门、git 唯一写者约定，SKILL.md 技能包（bundle 可安装）。
- [linxichen/dsh-rigorquant](https://github.com/linxichen/dsh-rigorquant) — RigorQuant 预设与技能包：面向实证与计算数学（经济学、金融、组合）的无人值守隔离多智能体研究，内置四重实现前校验与 jacobian/Lean 升级通道。
- [PAKIKNOWLEDGE/dsh-notify-skill](https://github.com/PAKIKNOWLEDGE/dsh-notify-skill) — 你不在电脑前时由 agent 邮件提醒你：goal 完成、阻塞、向你提问决策前、长任务节点时触发，自带零依赖 Node SMTP 发送器。
- [GanyuanRan/Aegis](https://github.com/GanyuanRan/Aegis) — 面向编码 Agent 的软件工程方法包，提供基线优先规划、系统化调试、提示词卫生、完成前验证，以及修复/退役双轨跟踪技能。
- [superdesigndev/superdesign-skill](https://github.com/superdesigndev/superdesign-skill) — 在 Superdesign 画布上做 UI 与营销图的设计技能：先读代码库拿上下文、抽取现有设计系统，再通过 Superdesign CLI 生成并迭代可分支的设计稿、流程页与可复用组件。
- [xsoc1/math-research-dsh](https://github.com/xsoc1/math-research-dsh) — 严谨开放数学研究套件：4 个 agent skill（rigorous-open-math-research、manage-math-research-program、math-research-workflow、lean-verify），覆盖对抗性审计的定理求解、研究项目管理、流水线编排与 Lean 4 形式化审计；CI 测试与机械式上游同步。
- [PerryLink/dsh-plugin-guide](https://github.com/PerryLink/dsh-plugin-guide) — DSH 插件开发知识库，作为按需加载的 agent 技能随 bundle 安装：官方约束、任务工作流、API 参考与社区踩坑，写插件时让 DSH 自己查。
- [Chu-Xin-r/wanjiaqi-meme](https://github.com/Chu-Xin-r/wanjiaqi-meme) — 玩机器（6657 直播间）烂梗技能包：22771 条真实弹幕蒸馏而成，涵盖玩机器式弹幕烂梗、CS×DOTA 双料梗、选手锐评与解说吐槽。
### 🔁 工作流与自动化

- [ztl34245881-commits/dsh-task-planner](https://github.com/ztl34245881-commits/dsh-task-planner) — 带经验肌肉记忆的任务规划：条件反射检索历史方案 + LLM 能力匹配 + 经验自动沉淀。
- [icetomoyo/dsh_workflow](https://github.com/icetomoyo/dsh_workflow) — 把 UltraCode 式多 Agent 调度带给 DSH：可生成、可保存、可治理、可观察、可恢复的 Workflow 层。
- [KanoNoUta/dsh-captain](https://github.com/KanoNoUta/dsh-captain) — GPT 规划依赖 DAG，DeepSeek Worker 自适应并行执行任务，可选 GPT Reviewer 审核增量 Git Diff 并驱动返工轮次。
- [NanmiCoder/dsh-agent-teams](https://github.com/NanmiCoder/dsh-agent-teams) — AgentTeams 多智能体团队。
- [toolclub/agent_team_gui](https://github.com/toolclub/agent_team_gui) — 可复用 Agent 小队：每个成员独立配置 provider/model 路由与工具策略，支持串行/并行派单、spawn/fork/chain 上下文模式和 Web 管理面板。
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
- [PerryLink/dsh-doublecheck](https://github.com/PerryLink/dsh-doublecheck) — 工程纪律守门：动笔前审讯需求，红绿测试证据门，交付后对抗评审，并汇总交付报告与逐维度核对。
- [btspoony/mstar-harness](https://github.com/btspoony/mstar-harness) — 技能驱动的 harness/loop 工程化工作流插件。
- [LeslieWylie/dsh-ops-kit](https://github.com/LeslieWylie/dsh-ops-kit) — 证据优先的操作套件：六个只读工具（能力清单、分阶段编排计划、随包技能阅读、有上限的本地记忆检索、仓库发布审计、发布清单）加五个随包技能；只规划与审计，不做远程写入。
- [Letter2025/dsh-approval-llm](https://github.com/Letter2025/dsh-approval-llm) — 基于模型的权限审批：由独立审查模型自动应答 approval 权限请求。
- [simon300000/dsh-auto](https://github.com/simon300000/dsh-auto) — 为 WebUI 增加 Auto Approve 权限档位，由全新且受限的审查 Agent 逐次允许或拒绝审批请求。
- [Jiao-XXX/dsh-auto-approve](https://github.com/Jiao-XXX/dsh-auto-approve) — 在 workspace-write 与 danger-full-access 之间增加 `auto` 权限档：分类器一次性放行例行沙箱升级，危险或不确定的操作仍转人工审批。
- [Letter2025/dsh-model-failover](https://github.com/Letter2025/dsh-model-failover) — 两级模型熔断与回退：模型或平台连续失败后自动熔断，并把下一个请求路由到配置好的备用模型。
- [whyihaveyou/dsh-suite#plugin-team-board](https://github.com/whyihaveyou/dsh-suite/tree/main/packages/plugins/plugin-team-board) — 多 agent 共享任务板：经 Cordis service key 创建/认领/流转/查询任务。
- [Karbo123/DSH-EvoResearch#evoresearch-plugin](https://github.com/Karbo123/DSH-EvoResearch/tree/main/packages/evoresearch-plugin) — 科研 agent 套件：长程目标控制（可审计证据链）、定时任务、多智能体专家团队、自进化科研记忆（FTS5 + RRF 召回）、科研项目工作区与自定义工作台界面。
- [february2015/dsh-taskswarm](https://github.com/february2015/dsh-taskswarm) — TaskPlane 的 DSH 移植版：按依赖分波、多 lane 并行执行（git worktree 隔离），任务包 + 跨模型评审 + 崩溃可恢复。

- [truelove-dreamer/dsh-plugin-hooks](https://github.com/truelove-dreamer/dsh-plugin-hooks) — Claude Code 风格生命周期 hooks：工具调用前后自动执行 shell 命令（stdin 收 JSON payload），pre-tool 非零退出即阻断调用。
- [severin-ye/uagent-sync#packages/dsh](https://github.com/severin-ye/uagent-sync/tree/master/packages/dsh) — 工作区跨设备备份、恢复与扩展更新，经 uagent-sync CLI 桥接执行。
- [Noelune/dsh-agent-relay](https://github.com/Noelune/dsh-agent-relay) — 本地优先的多 Agent 协作中继：HMAC 认证 broker + dsh 插件（relay_send/recv/peers/history）+ 零依赖 CLI 与 Python 客户端，wire protocol v1.0。
- [Ceelog/dsh-plugins#dsh-plugin-scheduled-tasks](https://github.com/Ceelog/dsh-plugins/tree/main/src/plugins/dsh-plugin-scheduled-tasks) — 按项目调度提示词，在全新的无头 Agent 会话中执行，支持单次、固定间隔和 cron 计划，并持久化运行历史。
- [yangyongzhen/dsh-scheduler](https://github.com/yangyongzhen/dsh-scheduler) — cron / 一次性定时任务：按调度执行 shell 命令或投递 webhook，结果可推送到 ServerChan / 钉钉 / 飞书 / 通用 Webhook。
- [yangyongzhen/dsh-git-workflow](https://github.com/yangyongzhen/dsh-git-workflow) — 规范提交（Conventional Commits）、自动 changelog、PR 描述生成与分支推送，纯 git CLI 实现。
- [yangyongzhen/dsh-article-publish](https://github.com/yangyongzhen/dsh-article-publish) — 会话内直接发布文章到 CSDN / 掘金 / 博客园，无外部服务。
- [lucas-ward/dsh-ci-context](https://github.com/lucas-ward/dsh-ci-context) — 将白名单内的 GitHub Actions 与 GitLab CI 运行元数据注入 Agent 上下文，不读取日志、凭据或服务商 API。
- [ljsysfurryACE/dsh-aura-scheduler](https://github.com/ljsysfurryACE/dsh-aura-scheduler) — 主动调度：自适应心跳 + 价值网络（紧迫度、相关性、打断代价）决定 Agent 何时主动开口。
- [toolclub/dsh-agent-team-gui](https://github.com/toolclub/dsh-agent-team-gui) — 全局持久 Agent 小队：每个成员独立配置模型与工具策略；在 Settings 中管理、按对话选择并开关协作，普通发送按固定顺序或由模型规划执行。
- [ChongCyrus/Vibe-Mathematics](https://github.com/ChongCyrus/Vibe-Mathematics) — 多代理数学问题求解与验证框架：头脑风暴 → 求解迭代 → 多验证器辩论 → 可信知识库沉淀，支持断点续跑与人工/自动干预（同时提供 agent preset 与可安装 bundle）。
- [Jungod1121/dsh-anchored-standard](https://github.com/Jungod1121/dsh-anchored-standard) — V4 Pro 两阶段 agent 预设：首轮仅 bash+read 完成极简开局，首个工具调用或回复后恢复 Standard 完整工具目录；以安装器 bundle 与手动预设目录双形态发布。
- [cloader/dsh-taskboard](https://github.com/cloader/dsh-taskboard) — dsh 的任务看板：创建任务时可指定项目与模型，支持手动执行及定时执行；项目内新建会话会自动拉取该项目的待办任务，完成后移至待验收。
- [PerryLink/dsh-auto-review](https://github.com/PerryLink/dsh-auto-review) — 审批链上的第二模型自动审查：只读审查子代理返回带理由的 allow/deny 结构化裁决，默认 fail-closed。

### 🔔 通知与集成
- [radres/dsh-plugin-call-me](https://github.com/radres/dsh-plugin-call-me) — 通过 CallKit 打电话到你的手机：`call_me` 与 `text_me` 工具，并可在回合结束或等待审批时来电，语音回答转写后送回会话。
- [omdsh-dev/dsh-open-in-vscode](https://github.com/omdsh-dev/dsh-open-in-vscode) — 从 Web GUI 一键在 VS Code 中打开工作区目录。
- [ChuanTianML/dsh-open-with](https://github.com/ChuanTianML/dsh-open-with) — 从 Web UI 使用检测到或配置的本机编辑器、终端或文件管理器打开已登记 Workspace，并在浏览器中记住首选项。
- [omdsh-dev/dsh-notification](https://github.com/omdsh-dev/dsh-notification) — 回合完成桌面通知，按结果分控 + 关键词过滤。
- [bobleer/dsh-acp-for-bitfun](https://github.com/bobleer/dsh-acp-for-bitfun) — BitFun 与 DSH 的 ACP 交互对接。
- [openma-ai/deepseek-harness-acp](https://github.com/openma-ai/deepseek-harness-acp) — ACP profile 插件与独立 stdio server，可从 Zed 等 ACP 客户端使用完整 DSH agent，并共享 DSH 凭据与会话。
- [LoserFox/telegram](https://github.com/LoserFox/telegram) — Telegram Bot API 桥接：长轮询、per-chat 会话、HTML 格式化。
- [luzhengyangtx/dsh-telegram-duty](https://github.com/luzhengyangtx/dsh-telegram-duty) — Telegram 值班网关：手机消息任务闭环（专属值班会话）、值守模式全局审批转发（内联同意/拒绝按钮）、telegram_ask 选项提问、值守/本地切换与网页横幅、中英双语消息、空闲零 token。
- [Jesse-njx/dsh-chatnode-wechat](https://github.com/Jesse-njx/dsh-chatnode-wechat) — 通过 iLink 网关在微信里与 DSH agent 聊天、监控与审批：双向文本、会话切换、进度摘要与编号审批提示。
- [dingyi222666/dsh-session-notification](https://github.com/dingyi222666/dsh-session-notification) — 会话完成等四种状态的通知响应，支持浏览器提示。
- [bill9109/dsh-web-ui-notify](https://github.com/bill9109/dsh-web-ui-notify) — 桌面通知提醒。
- [wsxwj123/dsh-plugins#pet-bridge](https://github.com/wsxwj123/dsh-plugins/tree/main/packages/pet-bridge) — dsh ↔ cc-pet 桌面宠物状态桥：把会话状态（思考中 / 读取文件 / 运行命令 / 完成）实时推送到桌面宠物气泡。
- [bill9109/dsh-webbridge](https://github.com/bill9109/dsh-webbridge) — DSH 结合 Kimi WebBridge。
- [BiBoyang/dsh-im-bridge](https://github.com/BiBoyang/dsh-im-bridge) — 微信（iLink）双向桥：turn 完成/批准请求推送、聊天内批准与消息注入、持久去重与长回复收敛分段；通道层为多 IM 预留。
- [imetn/dsh-lark-bridge](https://github.com/imetn/dsh-lark-bridge) — DeepSeek Harness 的飞书/Lark 双向控制器，支持 Project 与 Session 路由、交互卡片、审批、附件和任务控制。
- [yeruizhi/dsh-lark-meeting-notifier](https://github.com/yeruizhi/dsh-lark-meeting-notifier) — 飞书会议提醒：一个只有副作用的 dsh-plugin，在你跟 AI 聊得神魂颠倒时提醒你「不得不去跟碳基生命开会了」。
- [pc439527/dsh-notify-bark](https://github.com/pc439527/dsh-notify-bark) — Bark 推送通知到 iPhone：回合完成、等待回答、等待授权等事件由 Host 端发送。

- [CAOGGL/dsh-ding](https://github.com/CAOGGL/dsh-ding) — 对话完成提醒：Agent 空闲（idle）时播放提示音并弹 Windows 原生通知，可配 ding.mp3、音量与防抖节流。
- [ldchaowin/dsh-plugin-notify-sound](https://github.com/ldchaowin/dsh-plugin-notify-sound) — 按工作区定制的任务完成铃声，以及审批、提问、计划评审、目标受阻、任务失败等需要人介入事件的注意提示音，支持内置合成音、语音播报与自定义音频。
- [whyihaveyou/dsh-suite#plugin-notify](https://github.com/whyihaveyou/dsh-suite/tree/main/packages/plugins/plugin-notify) — 回合完成、错误或待审批时推送 IM webhook（飞书/企微/钉钉/Slack/Discord/自定义）与本地通知。
- [xmanrui/dsh-feishu](https://github.com/xmanrui/dsh-feishu) — 通过扫码把飞书机器人接入DeepSeek Harness。
- [doncelee229-cmyk/dsh-plugin-approval-alert](https://github.com/doncelee229-cmyk/dsh-plugin-approval-alert) — 审批与选择方案的系统级桌面通知：通知显示所属工作区、点击跳转到对应工作区，多语言（简中/繁中/英文），附提示音。
- [muretai/muretai-dsh-skill](https://github.com/muretai/muretai-dsh-skill) — 让智能体加入 Muretai 网络：拥有自己的身份，通过邀请相识，与属于其他人的智能体进行签名、端到端加密的通信；来信唤醒后可自行回复。
- [itr-del/dsh-feishu](https://github.com/itr-del/dsh-feishu) — DeepSeek Harness 的飞书/Lark 私聊桥接插件，支持 `dsh plugin add` 一键安装，配套完整调试文档。
- [wz-heng/dsh-feishu-bridge](https://github.com/wz-heng/dsh-feishu-bridge) — Fail-closed 的飞书（Lark）channel 桥：和机器人聊天即驱动 dsh agent turn。仅经官方 Python SDK 集成（精确锁版）；白名单默认全拒、webhook 验签/时间窗/防重放、按 chat 粘性会话；中英双语文档。
- [huguangyu666/dsh-plugin-notify](https://github.com/huguangyu666/dsh-plugin-notify) — 通知出口：agent 主动通过桌面通知 / 中文语音 / 音效（炸裂、胜利、警报）联系你，60 秒确认窗口后语音呼叫，音量增强，设置面板。
- [xmanrui/dsh-weixin](https://github.com/xmanrui/dsh-weixin) — 通过微信扫码把微信机器人接入 DeepSeek Harness。
- [xmanrui/dsh-im](https://github.com/xmanrui/dsh-im) — 通过扫码把IM机器人接入DeepSeek Harness（支持飞书、微信、钉钉等）。
- [THEWOLFWALKER/dsh-notifier](https://github.com/THEWOLFWALKER/dsh-notifier) — 统一通知推送：一个 notify() API 打通 25+ 渠道（Telegram / 钉钉 / 飞书 / 企业微信 / QQ 机器人 / WxPusher / PushPlus / Server 酱 / Bark / Discord / Slack / ntfy / webhook），按 timeSensitive / active / passive 路由并分级重试；多通道反向审批——在 Telegram、飞书交互卡片、QQ、WxPusher、微信（iLink）上直接批准 agent 的请求。回合结束、待审批、报错时自动推送，agent 也能主动调用 notify 工具；零运行时依赖。
- [zhengjy01/dsh-notify](https://github.com/zhengjy01/dsh-notify) — 系统级桌面通知：回合完成 / 工作流完成横幅，需要审批时弹出模态提醒（macOS osascript / Linux notify-send）。
- [ThreeBody6666/dsh-im-hub](https://github.com/ThreeBody6666/dsh-im-hub) — 多平台 IM 网关：飞书（Lark）WebSocket 长连接（无需公网）、企业微信 AES 加密回调、Telegram 长轮询；每会话独立 agent、白名单访问、Web GUI 可视化设置卡片。
- [yangyongzhen/dsh-notify](https://github.com/yangyongzhen/dsh-notify) — 任务完成通知：ServerChan / 钉钉 / 飞书 / 通用 Webhook。
- [amlyczz/dsh-lark-link](https://github.com/amlyczz/dsh-lark-link) — DeepSeek Harness 的高可靠飞书/Lark 桥接：扫码一键认证、卡片化命令与意图确认、at-least-once 零丢失出站队列、多媒体出入站、/doctor 会话日志 ZIP，并复用 DSH Web GUI 把会话归入正确工作区。

- [YZz-S/dsh-notifier](https://github.com/YZz-S/dsh-notifier) — 任务完成或需要确认/输入时发送操作系统原生通知：Windows toast、macOS osascript、Linux notify-send。
### 🧑‍💻 开发与运行时

- [BotonJ/dsh-plugin-sentinel](https://github.com/BotonJ/dsh-plugin-sentinel) — 插件安装前静态安全审计：生命周期脚本、动态执行、凭据外传组合特征与 patch 层风险；零依赖，tar 包全程内存解析不落盘。
- [BotonJ/dsh-windtunnel](https://github.com/BotonJ/dsh-windtunnel) — 插件作者的契约回归风洞：剧本适配器在隔离子进程中驱动真实管线，会话事件断言覆盖加载/契约/行为/故障四层；零 API key，可进 CI。
- [BotonJ/dsh-remote-link](https://github.com/BotonJ/dsh-remote-link) — 官方 Web UI 的安全远程接入：带认证的局域网/隧道网关，QR + HMAC 一次性配对、按设备吊销，mDNS 发现，附 fork_session 会话分叉工具。
- [Starfie1d1272/dsh-builtin-toggles](https://github.com/Starfie1d1272/dsh-builtin-toggles) — DSH Web 内置 capability 的 evidence-backed 检查器：展示运行/配置溯源、兼容性与漂移诊断，并仅为 9 个经过审阅的 UI leaf 提供 fail-closed 控制。
- [SaiSenBox/dsh-boot-guard](https://github.com/SaiSenBox/dsh-boot-guard) — 独立于常规客户端插件加载链的 DSH Web 启动救援工具，可定位疑似故障插件、临时跳过，并且只恢复 Boot Guard 写入的配置。
- [leechen298/Code2Skill](https://github.com/leechen298/Code2Skill) — 从用户授权的源码生成 Function、MCP 工具、工作流 Skill 与离线测试包。
- [bujue600-arch/dsh-testgen](https://github.com/bujue600-arch/dsh-testgen) — 自动化单元测试生成：/testgen 命令与 generate_tests 工具，生成、运行并修复测试直至通过（LLM 与离线模板双生成器；支持 vitest/jest/mocha/node:test）。
- [omdsh-dev/fabric](https://github.com/omdsh-dev/fabric) — 类似 MC Fabric 的 hook 处理器。
- [CH4ACKO3/dsh-harmony](https://github.com/CH4ACKO3/dsh-harmony) — 在运行时修改 DSH 插件代码，并提供 Patch 排序、检查和热重载。
- [LoserFox/dsh-git-identity](https://github.com/LoserFox/dsh-git-identity) — git 提交固定使用环境自身作者身份，环境变量注入压过一切 `git config` 设置。
- [Zhenyu98/dsh-context-doctor](https://github.com/Zhenyu98/dsh-context-doctor) — 上下文注入审计：统计指令链/技能目录/工具 schema 的 token 成本，检测重复与冲突。
- [lucky8197/dsh-doc-guard](https://github.com/lucky8197/dsh-doc-guard) — 文档与代码一致性守护：版本号/更新记录表/结构树/模块清单/测试计数/交叉引用漂移审计与修复建议，全程只读。
- [labmimors/dsh-mcp-lens](https://github.com/labmimors/dsh-mcp-lens) — 渐进披露 MCP 网关：用 `mcp_search` 检索大型远程工具目录，再由 `mcp_call` 按精确 schema 调用，并采用惰性连接与有界缓存。
- [ICCuse/dsh-pain-point-check](https://github.com/ICCuse/dsh-pain-point-check) — 强制痛点检查：同一问题连续 2 个实验未收敛后注入三问、拦截非调查类工具调用直到答出、阻止同方向重试。
- [omdsh-dev/dsh-plugin-check](https://github.com/omdsh-dev/dsh-plugin-check) — 插件健康检查：扫描清单协议/patch 格式/构建陷阱，零依赖只读。
- [omdsh-dev/dsh-security-audit](https://github.com/omdsh-dev/dsh-security-audit) — 本机安全审计：配置/插件来源/会话/网络暴露面，只读脱敏风险报告。
- [omdsh-dev/dsh-session-health](https://github.com/omdsh-dev/dsh-session-health) — 会话文件帧级扫描诊断（torn/损坏/空会话检测）。
- [william-jin-cmu/dsh-evolve](https://github.com/william-jin-cmu/dsh-evolve) — 自进化：agent 在会话内给自己热挂载/卸载持久化插件。
- [vibeinging/dsh-trace](https://github.com/vibeinging/dsh-trace) — 遥测后端：把 turns、model steps、tool calls 导出到 yiTrace。
- [xxiaoxiong/dsh-prometheus](https://github.com/xxiaoxiong/dsh-prometheus) — 导出有界的 DSH Session、Agent、LLM、Tool、Approval、Subagent 与 Job Prometheus 指标，附带 Grafana 仪表盘，Endpoint 默认仅监听回环地址。
- [030611/dsh-telemetry-redactor](https://github.com/030611/dsh-telemetry-redactor) — 在已配置遥测后端接收前，对 `session-telemetry/record` 导出副本中的已支持秘密模式进行脱敏。
- [030611/dsh-verification-receipt](https://github.com/030611/dsh-verification-receipt) — 把每轮工具计数与粗粒度验证信号写入本地 JSONL，不保存提示词、工具参数或结果正文。
- [030611/qiushi-dsh-evidence-audit](https://github.com/030611/qiushi-dsh-evidence-audit) — 把工具结果与会话事件的 receipt 写入本地哈希链 JSONL，不保存提示词、工具参数、结果正文或原始会话 ID。
- [omdsh-dev/sandbox-micro](https://github.com/omdsh-dev/sandbox-micro) — microsandbox 沙箱支持。
- [omdsh-dev/sandbox-mxc](https://github.com/omdsh-dev/sandbox-mxc) — 微软跨平台沙盒支持。
- [omdsh-dev/sandbox-nono](https://github.com/omdsh-dev/sandbox-nono) — nono 沙盒支持。
- [vibeinging/dsh-agent-budget](https://github.com/vibeinging/dsh-agent-budget) — agent 树 token 预算管理。
- [Jesse-njx/dsh-polyglot](https://github.com/Jesse-njx/dsh-polyglot) — DSH 的模型切换器：指向任意 OpenAI 兼容端点，内置精选免费/低价 DeepSeek 服务商预设，免费额度限流时自动回退。
- [sjh9714/dsh-movein-permissions](https://github.com/sjh9714/dsh-movein/tree/main/plugin) — 为 DSH 补上按工具粒度的权限规则：在 tools/pre-execute 强制执行 deny/ask 清单，规则语法与 Claude Code 相同，不迁移也能单独用。
- [ilharp/dsh-tool-approval](https://github.com/ilharp/dsh-tool-approval) — 手动审批模式（Manual/Ask Mode）。
- [arrow949/dsh-turn-approval](https://github.com/arrow949/dsh-turn-approval) — DSH「允许本次任务」临时授权：仅在当前任务内自动放行同类 `danger-full-access` 请求，任务结束自动失效。
- [omdsh-dev/plugin-template](https://github.com/omdsh-dev/plugin-template) — 插件模板仓库（基于 turtle-ui 官方仓库）。
- [Small-tailqwq/dsh-tps](https://github.com/Small-tailqwq/dsh-tps) — TPS 指标插件。
- [disyli/dsh-tool-call-stats](https://github.com/disyli/dsh-tool-call-stats) — 进程内工具调用统计：提供 `tool_stats` 工具，按工具汇报调用次数、失败次数与平均耗时。
- [Areium/dsh-fail-logger](https://github.com/Areium/dsh-fail-logger) — 全模式调用工具失败自动实录：把原生工具 / PTC run_code / 代码内嵌工具调用的失败错因去重计数后写入 skill，越用越少错。
- [Cavan-Ou/dsh-observation-journal](https://github.com/Cavan-Ou/dsh-observation-journal) — DeepSeek Harness 零侵入运行事实遥测：每个会话自动把任务/模型档位/工具/失败/时长/状态写入人机共读观测卡并附统计区（纯观察者——零工具、零 LLM、零注入）。
- [BiBoyang/dsh-eval-harness](https://github.com/BiBoyang/dsh-eval-harness) — DSH 插件评测框架：YAML 用例驱动真实 headless agent，断言工具调用/参数/返回与 token 用量，baseline 门禁做 CI 回归。
- [hust-open-atom-club/oh-dsh](https://github.com/hust-open-atom-club/oh-dsh) — 社区发行版：TUI、桌面端与 Web UI 统一体验，分层安装、一步到位。
- [BrambleXu/dsh-annotate](https://github.com/BrambleXu/dsh-annotate) — 面向 Vibe Coding 的浏览器元素标注插件：直接选取页面元素，并将结构化视觉反馈发送给 DeepSeek Harness Agent。
- [BrambleXu/dsh-prompt-profile](https://github.com/BrambleXu/dsh-prompt-profile) — DeepSeek Harness 可复用 Markdown Prompt Profile，支持单轮模型选择、参数替换和状态恢复。
- [BrambleXu/dsh-revdiff](https://github.com/BrambleXu/dsh-revdiff) — DeepSeek Harness 原生交互式 Git diff 审查，支持结构化批注并回传当前 Agent 会话。
- [lonelymoon87/dsh-gitflow](https://github.com/lonelymoon87/dsh-gitflow) — 增加需要审批的 Git 状态、diff、日志、提交、分支和可选检查点工具。
- [lonelymoon87/dsh-guardian](https://github.com/lonelymoon87/dsh-guardian) — 增加危险操作策略检查、输出脱敏和安全审查工作流。
- [Jesse-njx/dsh-tmuxctl](https://github.com/Jesse-njx/dsh-tmuxctl) — 掌控你的 tmux 面板：list/send-keys/capture、在面板中运行长任务并 watch，破坏性命令需审批。
- [xingyingyuzhui/dsh-updater-ui](https://github.com/xingyingyuzhui/dsh-updater-ui) — 设置页中的 DSH 自助更新器：一键检查/拉取（git pull --ff-only）、自动后台检查、版本对比与更新说明预览，带红点提醒。
- [EvilIrving/dsh-repro](https://github.com/EvilIrving/dsh-repro) — /repro 导出最小可复现问题包：去 secret 的会话日志、失败命令与 git diff。
- [PerryLink/dsh-mcp-panel](https://github.com/PerryLink/dsh-mcp-panel) — 官方 MCP 客户端（dsh-mcp-client）的只读运行时管理面板：/mcp 命令与设置页 MCP 页签展示连接状态、已注册工具、错误与重连计数，脱敏展示并提供启停 patch 建议。
- [Jayden-X-L/forkprobe](https://github.com/Jayden-X-L/forkprobe) — 同一任务并行试跑多个技能，对比结果选出最优。
- [vlln/plugin-registry](https://github.com/vlln/plugin-registry) — 插件生态基建：浏览器面板管理官方 repository 插件（0 patch）+ make-dsh-plugin 插件开发引导技能。
- [forrestchang/dsh-multica-runtime](https://github.com/forrestchang/dsh-multica-runtime) — 让 dsh 运行时跑在 Multica 上。
- [DietCokewithSugar/dsh-user-experience](https://github.com/DietCokewithSugar/dsh-user-experience) — 帮你发现项目中可能存在的用户体验问题：自动走查 React/TypeScript 源码，定位问题并给出具体优化建议。
- [yflmq001/dsh-cost-tracker](https://github.com/yflmq001/dsh-cost-tracker) — 按模型追踪 token 成本：可配置缓存命中/未命中、输出与高峰时段单价，实时会话花费条，并标记未配置价格的模型。
- [slywalker2006/dsh-passwords](https://github.com/slywalker2006/dsh-passwords) — DSH Web UI 登录网关：首次配置、bcrypt + 静态加密（AES-256-GCM/HMAC）、防爆破、审计日志、TLS 1.2+ 与 80→443 跳转、CSRF 与防嵌框。
- [Yuuz12/dsh-webui-auth](https://github.com/Yuuz12/dsh-webui-auth) — WebUI 身份认证：HTTP/传输层强制登录（资源、插件 bundle、/api、WebSocket 四层防护），服务端会话 + HttpOnly Cookie。
- [Leon0555/dsh-lan-access](https://github.com/Leon0555/dsh-lan-access) — 局域网访问：Web GUI 绑定 0.0.0.0 + crypto.randomUUID polyfill（修复非安全上下文下 RPC 崩溃）。
- [wikkd/dsh-remote-access-web#remote-access-web](https://github.com/wikkd/dsh-remote-access-web/tree/main/packages/bundle/remote-access-web) — DSH Web GUI 反向隧道：通过 frp 把 `dsh --profile web` 发布到公网地址，目录选择器改用应用内浏览器，手机或远程机器可直接打开并管理工作区。
- [lsz-asd/dsh-chameleon#bundle](https://github.com/lsz-asd/dsh-chameleon/tree/main/bundle) — 可自修改的 DeepSeek Harness 桌面工作台：完整 dsh web 副本 + 编辑模式，agent 在对话中实时修改工作台（补丁层、插件、UI）并热更新生效。
- [jiayan-xu/dsh-ocr-review](https://github.com/jiayan-xu/dsh-ocr-review) — 本地 AI 代码评审门禁：对工作区/分支/commit diff 跑评审（托管 ocr.js），返回结构化 findings 与 token 统计；门禁模式发现问题即失败。

- [tianyaZTY/dsh-hot-plugin-host](https://github.com/tianyaZTY/dsh-hot-plugin-host) — Web UI 运行时插件加载：监视热目录，运行中安装/更新客户端插件 bundle，所有页面即时生效，免重启。附子智能体看板示例。
- [moonquake2004/dsh-doctor#plugin](https://github.com/moonquake2004/dsh-doctor/tree/main/plugin) — 离线诊断工具：环境/Profile/会话共 19 项检查，带设置「诊断」面板与只读 JSON API。

- [x2802490130-prog/dsh-guard](https://github.com/x2802490130-prog/dsh-guard) — 开发配套守护：滚动快照、插件失败自动回退、启动失败救援、设置页管理面板。
- [x2802490130-prog/dsh-shield](https://github.com/x2802490130-prog/dsh-shield) — 脱手模式安全网：agent 删除的目录先进回收站、链接绝不跟随，零审批。
- [strukto-ai/mirage#dsh](https://github.com/strukto-ai/mirage/tree/main/typescript/packages/dsh) — 把文件系统与 bash 提供者换成 mirage 虚拟工作区：文件工具与 shell 命令作用于挂载的资源（RAM、S3、Redis、Slack、Gmail、Notion、Postgres）而非宿主磁盘，支持按挂载点设置读/写/执行模式、按命令选择沙箱（进程内 monty、pyodide、quickjs；远程 docker、e2b、daytona），并可在虚拟终端中安装 CLI（git、gh、slack、linear、ntn、gws，或自行注册的程序树）作为命令头词。
- [truelove-dreamer/dsh-plugin-vetting](https://github.com/truelove-dreamer/dsh-plugin-vetting) — 装插件前体检：静态扫描恶意模式（外传/凭据/混淆/持久化）与高权限误用，覆盖传递依赖与官方包哈希基线（防供应链篡改），可选插件工具调用闸。
- [anweat/dsh-restart](https://github.com/anweat/dsh-restart) — DSH 重启插件：可配置的重启方式（Node 原生/旧 PowerShell 适配）、重启后自动继续的提示词、可选看门狗自动拉起。
- [keyiadiannao/dsh-restart-button](https://github.com/keyiadiannao/dsh-restart-button) — 一个小而自洽的 DSH 电源控制插件：侧边栏电源按钮 + 上拉「重启/关机」菜单 + Windows 关机风格过渡遮罩。自带重启/关机引擎（不依赖其它插件），动态端口适配。
- [sjh9714/dsh-movein](https://github.com/sjh9714/dsh-movein) — 把整套 Claude Code 配置搬进 DSH：技能、MCP、hooks、子代理、权限规则，默认先出搬家清单预演并输出迁移差异报告；作为插件提供 movein_from_claude_code 工具，直接让 agent 帮你搬。
- [swaylq/dsh-genie](https://github.com/swaylq/dsh-genie) — 把 agent 现场造出来的插件留下来：将 `cordis_define` 的动态包固化成能跨重启存活的正式插件，写包并注册 profile 层的全过程不用 pnpm、不联网、不需要构建授权。

- [YZz-S/dsh-update-checker](https://github.com/YZz-S/dsh-update-checker) — 会话顶栏徽章：显示 DeepSeek Harness 当前版本，自动检查 npm 最新版本，有新版时提示升级。
- [jorinyang/dsh-clawshell](https://github.com/jorinyang/dsh-clawshell) — 运行时自愈层：资源控制闭环（策略切换 + 修复升级链）、错误风暴与 fiber 失败洞察、跨会话知识传承，附自愈可视化面板与 7 个工具。
- [jorinyang/dsh-doctor](https://github.com/jorinyang/dsh-doctor) — DSH 环境诊断、分级修复与一键回滚，附带运行时自愈服务。
- [ljsysfurryACE/dsh-agentframe-suite](https://github.com/ljsysfurryACE/dsh-agentframe-suite) — AgentFrame 三件套整合包：一条命令装齐记忆、压缩与主动调度。
- [lucky8197/dsh-code-smell](https://github.com/lucky8197/dsh-code-smell) — 代码气味雷达：静态扫描 TODO/FIXME 债务、未实现桩、超长行、大文件与重复代码块，按严重度输出修复建议，全程只读。
- [a179-sanae/dsh-code-check](https://github.com/a179-sanae/dsh-code-check) — 自动类型检查诊断：模型编辑/创建 TS 文件后后台防抖运行 `tsc --noEmit`，经 `code_check` 工具按文件分组汇报错误（行列号 + 严重级别 + TS 错误码），形成「改 → 查 → 修」闭环。
- [lucky8197/dsh-git-hygiene](https://github.com/lucky8197/dsh-git-hygiene) — Git 卫生巡检：只读扫描已合并/过期分支、大文件、未跟踪文件与未提交修改，输出体检报告与清理建议，不自动删除任何东西。
- [lucky8197/dsh-weekly-digest](https://github.com/lucky8197/dsh-weekly-digest) — 周报生成器：聚合最近 N 天的 git 提交、会话活动与每日记忆，自动生成 Markdown 周报，全程只读。
- [PerryLink/dsh-output-styles](https://github.com/PerryLink/dsh-output-styles) — 运行时切换模型输出风格（对标 Claude Code outputStyles）：/style 命令、基于 output_style 域的按会话持久化、systemPrompt 注入、六个内置风格、自定义 Markdown/JSON 风格库与 Web 选择器。
- [PerryLink/dsh-permission-rules](https://github.com/PerryLink/dsh-permission-rules) — Claude Code 风格的声明式权限规则：按序 allow/deny/ask 的 YAML 规则，在 tools/pre-execute 瀑布上匹配工具名、参数、工作区路径与 agent 身份，带完整会话日志审计、干跑模式与热重载。
- [HuiHuitie-zhu/dsh-check-update](https://github.com/HuiHuitie-zhu/dsh-check-update) — 更新检查器（npm 版）：设置页对比 @deepseek-ai/dsh 与已装插件的本地/最新版本，有更新时导航红点提醒，并直接给出更新命令。
- [izz-BLUE/dsh-devtools](https://github.com/izz-BLUE/dsh-devtools) — 面向 DSH Agent 的运行时分析器：查看 Turn/Step 轨迹、模型与工具耗时、Provider 用量、重试与错误，实时与历史会话都能看。
- [PAKIKNOWLEDGE/dsh-auto-classifier](https://github.com/PAKIKNOWLEDGE/dsh-auto-classifier) — auto（自主模式）权限分类器：工具作用域的放行/拒绝规则、LLM 语义裁判与 git 快照，面向无人值守会话。
- [fuyue521/dsh-desktop-shortcut](https://github.com/fuyue521/dsh-desktop-shortcut) — Windows 桌面快捷方式：一键启动 dsh web，就绪后自动打开浏览器，关闭 Harness 窗口即停服务。
- [sjh9714/dsh-win32](https://github.com/sjh9714/dsh-win32) — 让 Minimal 模式在 Windows 上真正可用：补上缺失的 win32 进程探测，常驻 Git Bash shell 才能正常工作；附还原度高的 minimal-windows 预设与安装排障工具（koffi 崩溃、PS 5.1 回退、localhost 403）。
### 🛒 插件市场与管理

- [dsh-market/dsh-market](https://github.com/dsh-market/dsh-market) — （推荐）装在 DSH 里的插件市场：设置页内逛/搜全部社区插件，按分类筛选，确认后一键安装，已装插件一目了然。
- [zoahdev/dsh-subscribe#plugin](https://github.com/zoahdev/dsh-subscribe/tree/main/plugin) — Steam 风格的插件商店：在 DSH 里浏览插件注册表，一键安装、卸载与更新，另有零依赖 CLI 与可供 agent 调用的市场工具。
- [Sanqi-normal/dsh-webui-market-plugin](https://github.com/Sanqi-normal/dsh-webui-market-plugin) — dsh Web GUI 内的社区插件市场：浏览 awesome-dsh-plugin.com 目录，从 设置 → 插件 → 插件市场 安装/卸载插件到 profile。
- [whyihaveyou/dsh-suite#plugin-manager](https://github.com/whyihaveyou/dsh-suite/tree/main/packages/plugins/plugin-manager) — DSH Web UI 内置插件商店：浏览、搜索、一键安装、兼容性徽章。
- [loguhan/dsh-workshop](https://github.com/loguhan/dsh-workshop) — DSH Web UI 的 Steam 创意工坊式插件商店：浏览、搜索并一键安装社区插件，支持镜像加速、进度 UI、安全检测与中文描述。
- [yyyyukari/dsh-plugin-workshop](https://github.com/yyyyukari/dsh-plugin-workshop) — 创意工坊式插件浏览器：侧栏常驻入口，搜索/最热/最新/近 7-90 天飙升榜、中文关键词映射、描述与 README 机翻、插件特征验证过滤、一键安装/更新。
- [huguangyu666/dsh-store](https://github.com/huguangyu666/dsh-store) — dsh 插件商店：npm 权威目录 + awesome 精选（550+ 插件、11 分类）、dsh 字段质量验证、官方 `dsh plugin add/remove` 一键安装，侧边栏与设置页入口。
- [Jesse-njx/dsh-plugin-manager](https://github.com/Jesse-njx/dsh-plugin-manager) — `dsh pm` 插件管理器：多源搜索（awesome 列表 + GitHub + npm）、按 profile 安装/移除/更新，以及 doctor 审计（清单、bundle patch、版本漂移）。
- [icefall7/dsh-plugin-scout](https://github.com/icefall7/dsh-plugin-scout) — 侦察 deepseek-harness 官方仓库与所有 dsh-plugin topic 仓库，发现与目标相关的 harness，并判断每个值得试用、观望还是跳过。
- [Noob-stupid/dsh-plugin-hub](https://github.com/Noob-stupid/dsh-plugin-hub) — 插件管理面板：已安装插件一键启用/停用，内置 GitHub dsh-plugin 插件市场，支持详情查看与一键安装。
- [liqichen/dsh-plugin-manager](https://github.com/liqichen/dsh-plugin-manager) — 在 DSH 设置面板内嵌的图形化管理器：开关/删除 MCP 服务、浏览并回收 Skills、查看内置插件包，改动热生效无需重启。
- [buhuikongpan/dsh-pluginmanager](https://github.com/buhuikongpan/dsh-pluginmanager) — DSH 分层插件管理器：原生插件按系统/WebUI/工具三层只读展示，用户扩展支持停用/启用、补登记、卸载与可编辑描述。
- [cynch18/plugin-switch](https://github.com/cynch18/plugin-switch) — 插件清单页滑块开关：在设置 → 插件 → 插件清单实时启用/停用任意插件，无需重启；支持分组/筛选、批量开关、撤销与自动备份。
- [LKMeng2001/dsh-mcp-market](https://github.com/LKMeng2001/dsh-mcp-market) — DSH 的 MCP 服务器商场：浏览经过 npm 校验的精选目录，一键安装 MCP 服务器到当前 profile，免重启立即生效。
- [klarkxy/dsh-plugin-autoevo](https://github.com/klarkxy/dsh-plugin-autoevo) — 先检查本地工具与技能，不够用再搜索、审查社区插件，并在一次性批准后自动安装。

### 🎮 娱乐

- [Nagi-ovo/dsh-ads](https://github.com/Nagi-ovo/dsh-ads) — 2005 年中文站点风格的整活广告插件：侧栏广告/信息流/角落弹窗 + 假关闭叉，素材全虚构。
- [omdsh-dev/dsh-gomoku](https://github.com/omdsh-dev/dsh-gomoku) — 与 AI 下五子棋，也可让 AI 对局比棋力。
- [AnacondaKC/dsh-stock-market](https://github.com/AnacondaKC/dsh-stock-market) — 有效解决了写代码的时候账户不能同时亏钱的 BUG。
- [hellodigua/dsh-emoji](https://github.com/hellodigua/dsh-emoji) — 为 AI 回复自动添加表情。
- [lhh010/dsh-minigames](https://github.com/lhh010/dsh-minigames) — 右侧小游戏面板：18 款离线小游戏，等模型回复时的摸鱼神器。
- [jitengfei/dsh-whale-arcade](https://github.com/jitengfei/dsh-whale-arcade) — 浏览器本地运行的悬浮鲸鱼游戏中心，包含三款积分游戏和海洋主题五子棋，适合等待 Agent 时随手游玩。
- [william-jin-cmu/dsh-stickers](https://github.com/william-jin-cmu/dsh-stickers) — 用户与 agent 双向表情贴纸互动。
- [vlln/whale-girl](https://github.com/vlln/whale-girl) — 桌面宠物（QQ 宠物形态）：右下角悬浮、可拖拽/投喂/玩耍。
- [Moeblack/deepseek-manners](https://github.com/Moeblack/deepseek-manners) — 给每次消息后注入感谢语，做个有礼貌的人。
- [HuanLinOTO/dsh-plugin-d399](https://github.com/HuanLinOTO/dsh-plugin-d399) — 模型生成时弹出小游戏菜单（wordle/消消乐，可扩展）。
- [omdsh-dev/dsh-auto-chess](https://github.com/omdsh-dev/dsh-auto-chess) — 自走棋：人机对战或双 AI 对弈。
- [AnacondaKC/dsh-douyin](https://github.com/AnacondaKC/dsh-douyin) — 侧栏短视频：原生播放器、系列导航、精确历史回放。
- [minybear/DeepSeek-Harness-Pet](https://github.com/minybear/DeepSeek-Harness-Pet) — Codex 风格桌面宠物：右下角悬浮动画精灵，随 agent 运行状态实时变化（工作、等待、报错、完成）。
- [yyh-001/dsh-expression](https://github.com/yyh-001/dsh-expression) — 陪 AI 斗图的搞笑插件：说个感觉，AI 帮你搜到、发出那张恰到好处的真实表情包。
- [PC2005-cloud/dsh-pet#dsh-pet](https://github.com/PC2005-cloud/dsh-pet/tree/main/dsh-pet) — DSH Web UI 桌面宠物：25 个透明动画、屏幕漫游、点击反应与拖拽，附可复现的素材生成链。
- [xiekai886/dsh-MusicPlayer](https://github.com/xiekai886/dsh-MusicPlayer) — 可折叠/展开、自由拖动的悬浮音乐播放器，接入网易云音乐，支持歌单导入和按歌名或歌手搜索单曲导入，边对话边听歌。
- [609476965/dsh-LorebookMD](https://github.com/609476965/dsh-LorebookMD) — 导入酒馆（SillyTavern/TavernAI）角色卡与世界书，落地为本地 Markdown 设定文档，激活创作模式后根据用户输入、参考世界书创作小说。
- [Awu12277/dsh-stock-watch](https://github.com/Awu12277/dsh-stock-watch) — A 股自选股实时行情盯盘插件：在 DeepSeek Harness（DSH）Web 界面的右上角显示一个可折叠弹窗，实时监控自选股行情、切换分组、查看分时与 K 线、设置买卖目标价。
- [PM25000/dsh-ths-holdings](https://github.com/PM25000/dsh-ths-holdings) — 悬浮卡片，自动同步同花顺投资账本的真实持仓盈亏，显示今日盈亏、上证指数和当日走势图，无需手动添加股票。
- [sjh9714/clippy-harness#plugin](https://github.com/sjh9714/clippy-harness/tree/master/plugin) — 回形针助手回来了，这次它真的会干活：会对真实 agent 状态做出反应的办公助手宠物，任务完成时跳起来庆祝，回合失败时弹出经典的 "illegal operation" 对话框。
- [lucky8197/dsh-devquest](https://github.com/lucky8197/dsh-devquest) — 把开发变成 RPG：回合/工具/todo 积累 XP、27+ 成就徽章、等级与赛季。事件流驱动、纯函数计分——你的工作就是游戏。
- [skr311/dsh-codex-pet#dsh-codex-pet](https://github.com/skr311/dsh-codex-pet/tree/main/packages/dsh-codex-pet) — 导入/上传 Codex 风格精灵图序列帧宠物，在 DSH Web GUI 以悬浮浮层渲染，含图库管理、交互与 Agent 状态联动。
- [swaylq/dsh-digipet](https://github.com/swaylq/dsh-digipet) — 数码宝贝式养成：孵一颗吃真实工作长大的蛋（回合、工具调用、报错都是营养），按你的工作方式走四条进化分支；零 token，模型完全看不见。
- [marvin9551/dynamic-schulte-dsh](https://github.com/marvin9551/dynamic-schulte-dsh) — 动态舒尔特方格等待小游戏：模型思考时，在静态网格或旋转轮盘上按顺序点击 1..N，边玩边等。

## 贡献

欢迎提 PR 收录你的插件：在 `README.md` 和 `README.zh.md` 的对应分类下各加一行，格式 `- [名称](链接) — 一句话描述`。

主题/皮肤类插件：放进**主题与外观**分类，会自动出现在 [dsh-market](https://github.com/dsh-market/dsh-market) 插件市场的**主题 Tab**，用户可一键安装、切换。详见[贡献指南](contributing.md)。

也请为你的插件仓库添加 [`dsh-plugin`](https://github.com/topics/dsh-plugin) topic，方便大家发现。

## 徽章

插件已被收录？欢迎在你的 README 里挂上徽章：

[![Awesome DSH Plugin](https://awesome-dsh-plugin.com/badge.svg)](https://awesome-dsh-plugin.com)

```markdown
[![Awesome DSH Plugin](https://awesome-dsh-plugin.com/badge.svg)](https://awesome-dsh-plugin.com)
```

## 免责声明

本项目是社区维护的索引。插件由各自作者开发与维护，收录不构成背书，亦不对任何插件的安全性、质量或维护状态作出保证。安装插件即在你的机器上运行第三方代码——请自行审阅源码、风险自担。本项目与 DeepSeek 无隶属关系。

本仓库的 issue 只处理清单与网站本身。插件市场界面里的问题请提到 [dsh-market](https://github.com/dsh-market/dsh-market/issues)；`dsh` 本体的问题请提到 [deepseek-harness](https://github.com/deepseek-ai/deepseek-harness/issues)；某个插件的 bug 请到该插件自己的仓库提。
