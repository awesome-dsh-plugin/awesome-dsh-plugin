/**
 * Locale registry — the single source of truth for internationalization.
 *
 * Adding a language:
 *   1. Add an entry here (copy an existing one, translate every string).
 *   2. Create README.<code>.md with the same category headings you declare
 *      in `categories` and one `- [name](url) - description` line per plugin.
 *   3. Add banner-<code>.png and og-<code>.png to docs/ (render from the
 *      shared card template; see scripts notes).
 *   4. Create site/privacy.<code>.html — the privacy page body, which is
 *      prose rather than UI strings and so lives in its own file.
 * Everything else — page, hreflang set, sitemap, JSON-LD — is generated.
 *
 * The first entry is the default locale (x-default, served at /).
 */
export default [
  {
    code: 'en',
    htmlLang: 'en',
    label: 'EN',
    urlPath: '/',
    out: 'docs/index.html',
    readme: 'README.md',
    sep: '-', // list-item separator awesome-lint expects in the English file
    og: '/og-en.png',
    feed: '/feed.xml',
    feedOut: 'docs/feed.xml',
    privacyPath: '/privacy/',
    privacyBody: 'site/privacy.en.html',
    PRIVACY_TITLE: 'Privacy — Awesome DSH Plugin',
    PRIVACY_DESC: 'What this site collects and what it does not: no cookies, no browser storage, cookie-less analytics, and no third-party requests beyond the visit counter.',
    TITLE: 'Awesome DSH Plugin — Curated DeepSeek Harness (dsh) Plugin List',
    DESC: 'A curated list of {N} DeepSeek Harness (dsh) plugins: UI, themes, sessions, memory, tools, workflow, notifications, models, development, and fun. Updated continuously.',
    SEARCH_PH: 'Search plugins…',
    // Category and detail titles deliberately drop the "Awesome DSH Plugin"
    // suffix the home page carries. Brand queries are the home page's to win;
    // when every page claimed the brand too, these pages entered the same
    // results and lost — measured at a third of the click-through their
    // position should earn. They lead with what someone actually typed
    // instead, and spend the freed characters on the intent words.
    // "dsh" rather than "DeepSeek Harness": search data says the phrase people
    // type is "dsh plugin", and the full product name appears in almost no
    // queries at all. Spelling it out costs 20 characters of a title budget
    // that truncates around sixty, and buys nothing. The description below
    // still carries the full name for anyone — human or crawler — who needs it.
    CAT_TITLE: '{CAT} — {N} dsh plugins',
    // {TOP} names the highest-starred entries in the category, so no two of
    // these read alike; a description repeated across twenty pages is one
    // Google discards and rewrites.
    CAT_DESC: '{N} {CAT} plugins for DeepSeek Harness (dsh), including {TOP}. Install commands, descriptions and repository links, updated continuously.',
    // {NAME} keeps the "owner/plugin" form the READMEs and the page heading
    // use. It costs about ten characters, which pushes roughly 500 more titles
    // past where Google truncates — but what gets cut there is the trailing
    // category, and showing who wrote a plugin is worth more in a result list
    // than showing which of twenty categories it sits in.
    P_TITLE: '{NAME} — dsh plugin · {CAT}',
    COPY_LABEL: 'Copy install command',
    COPY_TEXT: 'copy install',
    categories: {
      ui: 'UI Enhancements',
      usage: 'Usage & Billing',
      theme: 'Themes & Appearance',
      model: 'Models & Providers',
      identity: 'Identity & Communication',
      session: 'Sessions & Messages',
      memory: 'Memory',
      tools: 'Tools & Capabilities',
      browser: 'Browser & Web',
      vision: 'Vision & Multimodal',
      voice: 'Voice & Audio',
      docs: 'Docs & Rendering',
      skill: 'Skills',
      workflow: 'Workflow & Automation',
      git: 'Git & Code Review',
      notify: 'Notifications & Integrations',
      dev: 'Development & Runtime',
      security: 'Security & Permissions',
      remote: 'Remote & Mobile',
      market: 'Plugin Markets & Managers',
      fun: 'Just for Fun',
    },
    strings: {
      SKIP: 'Skip to plugin list',
      TAGLINE: 'A curated list of <b>DeepSeek Harness</b> (<code translate="no">dsh</code>) plugins.',
      LISTING_PRE: 'Listing',
      LISTING_POST: 'plugins',
      FULLLIST: 'Full list on GitHub ↗',
      WHATIS: 'What is DeepSeek Harness? ↗',
      NORESULT: 'No plugins match.',
      CLEAR: 'Clear filters',
      SORT: 'Sort',
      SORT_DL: 'Downloads',
      SORT_STARS: 'Stars',
      SORT_NEW: 'Newest',
      SORT_NAME: 'Name A–Z',
      F_NPM: 'npm-installable',
      F_RECENT: 'Added in 7 days',
      INSTALL: 'Installing',
      NPM_C: 'from npm (prebuilt)',
      TGZ_C: 'from a prebuilt release tarball',
      GH_C: 'from GitHub (first run asks for allowBuilds approval — follow the hint, retry)',
      INSTALL_NOTE: 'Any plugin you install runs third-party code with your own permissions — it can read your files, use your credentials, and reach the network, and tool approvals don’t sandbox it. GitHub-sourced plugins also run build scripts at install time — pnpm blocks those until you allow them, so an install can stop with <code translate="no">ERR_PNPM_GIT_DEP_PREPARE_NOT_ALLOWED</code> or <code translate="no">ERR_PNPM_IGNORED_BUILDS</code>; dsh prints the exact key to add under <code translate="no">allowBuilds</code> in your profile’s <code translate="no">pnpm-workspace.yaml</code>, and the install works on the next run. Allowing a build is a trust decision: only install sources you trust, and pin a commit (<code translate="no">github:owner/repo#sha</code>).',
      CONTRIB: 'Get your plugin listed',
      CONTRIB_BODY: 'Open a PR against <a href="https://github.com/awesome-dsh-plugin/awesome-dsh-plugin" rel="noopener">awesome-dsh-plugin</a> — one line each in every <code translate="no">README</code> language file; the site syncs automatically. Add the <a href="https://github.com/topics/dsh-plugin" rel="noopener"><code translate="no">dsh-plugin</code></a> topic to your repo too.',
      MOTTO: 'Into the Unknown',
      NOTAFF: 'Not affiliated with DeepSeek',
      DISCLAIMER: 'Plugins are developed by their respective authors; listing is not an endorsement. Installing runs third-party code — review the source and proceed at your own risk.',
      ALL: 'All',
      MARKET_LEAD: '<b>dsh-market</b> — browse and install everything on this list inside DeepSeek Harness',
      MARKET_LINK: 'About dsh-market ↗',
      NAV_SUBMIT: 'Submit',
      MARKET_GO: 'Get it',
      INSTALL_BTN: 'Install',
      MENU_MARKET: 'via dsh-market · recommended',
      MENU_MARKET_HINT: 'copy the market install command',
      MENU_CLI: 'via CLI',
      MENU_CLI_HINT: 'copy this plugin’s install command',
      COPIED: 'Copied',
      TOTOP: 'Back to top',
      CRUMB_ALL: 'All plugins',
      KICKER: 'DeepSeek Harness Plugin',
      P_INSTALL: 'Install',
      P_LINKS: 'Links',
      P_RELATED: 'More in this category',
      P_MORECAT: 'View the whole category',
      P_STARS: 'Stars',
      P_DOWNLOADS: 'Downloads (30d)',
      P_CAT: 'Category',
      P_ADDED: 'Added',
      P_GH: 'GitHub repository ↗',
      P_NPM: 'npm package ↗',
      P_MARKET: 'Install via dsh-market',
      P_README_SRC: 'Content from the project README on GitHub ↗',
      // Shown when the plugin publishes no README in this page's language. The
      // block below is then marked with its real `lang`, so say so plainly
      // rather than letting the reader wonder why the page switched languages.
      P_README_ONLY: 'This plugin publishes its README in {LANG} only.',
      PRIVACY: 'Privacy',
      BACKHOME: '← Back to the list',
    },
    // Language names as written in this locale, for P_README_ONLY.
    langNames: { en: 'English', zh: 'Chinese' },
  },
  {
    code: 'zh',
    htmlLang: 'zh-CN',
    label: '中文',
    urlPath: '/zh/',
    out: 'docs/zh/index.html',
    readme: 'README.zh.md',
    sep: '—', // em dash: the hyphen reads as punctuation between Chinese words
    og: '/og-zh.png',
    feed: '/zh/feed.xml',
    feedOut: 'docs/zh/feed.xml',
    privacyPath: '/zh/privacy/',
    privacyBody: 'site/privacy.zh.html',
    PRIVACY_TITLE: '隐私政策 — Awesome DSH Plugin',
    PRIVACY_DESC: '本站收集什么、不收集什么：不设 cookie、不写浏览器存储、统计不依赖 cookie，除访问计数外不请求任何第三方。',
    TITLE: 'Awesome DSH Plugin — DeepSeek Harness（dsh）插件精选列表',
    DESC: 'DeepSeek Harness（dsh）插件精选列表，收录 {N} 个：UI 增强、主题外观、会话记忆、工具、工作流、通知集成、模型接入、开发与娱乐，持续更新。',
    SEARCH_PH: '搜索插件…',
    // 见英文 locale 中关于去掉品牌后缀的说明。
    CAT_TITLE: '{CAT} — {N} 个 dsh 插件',
    CAT_DESC: 'DeepSeek Harness（dsh）{CAT}插件共 {N} 个，包括 {TOP}。含安装命令、功能描述与仓库链接，持续更新。',
    P_TITLE: '{NAME} — dsh 插件 · {CAT}',
    COPY_LABEL: '复制安装命令',
    COPY_TEXT: '复制安装命令',
    categories: {
      ui: 'UI 增强',
      usage: '用量与计费',
      theme: '主题与外观',
      model: '模型与账号接入',
      identity: '身份与通信',
      session: '会话与消息',
      memory: '记忆',
      tools: '工具与能力',
      browser: '浏览器与网页',
      vision: '视觉与多模态',
      voice: '语音与音频',
      docs: '文档与渲染',
      skill: '技能包',
      workflow: '工作流与自动化',
      git: 'Git 与代码评审',
      notify: '通知与集成',
      dev: '开发与运行时',
      security: '安全与权限',
      remote: '远程与移动端',
      market: '插件市场与管理',
      fun: '娱乐',
    },
    strings: {
      SKIP: '跳到插件列表',
      TAGLINE: '<b>DeepSeek Harness</b>（<code translate="no">dsh</code>）插件精选列表。',
      LISTING_PRE: '收录',
      LISTING_POST: '个插件',
      FULLLIST: '完整列表（GitHub）↗',
      WHATIS: '什么是 DeepSeek Harness？↗',
      NORESULT: '没有匹配的插件。',
      CLEAR: '清除筛选',
      SORT: '排序',
      SORT_DL: '下载量',
      SORT_STARS: 'Star 数',
      SORT_NEW: '最新收录',
      SORT_NAME: '名称 A–Z',
      F_NPM: '可从 npm 安装',
      F_RECENT: '近 7 天新增',
      INSTALL: '安装',
      NPM_C: 'npm 包（预构建）',
      TGZ_C: 'Release 预构建包',
      GH_C: 'GitHub 源码（首次需按提示配置 allowBuilds 构建授权后重试）',
      INSTALL_NOTE: '装任何插件都等于在你的机器上跑第三方代码，权限和你本人一样大——能读你的文件、用你的凭据、访问网络，工具审批管不到它。GitHub 来源的插件还会在安装时执行构建脚本——pnpm 默认拦截，所以安装可能停在 <code translate="no">ERR_PNPM_GIT_DEP_PREPARE_NOT_ALLOWED</code> 或 <code translate="no">ERR_PNPM_IGNORED_BUILDS</code>；dsh 会打印出需要添加的确切键名，把它加进该 profile 的 <code translate="no">pnpm-workspace.yaml</code> 的 <code translate="no">allowBuilds</code> 下，重跑一次即可装上。放行构建本身就是一次信任判断：请只安装可信来源，并尽量锁定 commit（<code translate="no">github:owner/repo#sha</code>）。',
      CONTRIB: '收录你的插件',
      CONTRIB_BODY: '给 <a href="https://github.com/awesome-dsh-plugin/awesome-dsh-plugin" rel="noopener">awesome-dsh-plugin</a> 提一个 PR：在每个 <code translate="no">README</code> 语言文件中各加一行，网站会自动同步。也请为你的仓库打上 <a href="https://github.com/topics/dsh-plugin" rel="noopener"><code translate="no">dsh-plugin</code></a> topic。',
      MOTTO: '探索未至之境',
      NOTAFF: '与 DeepSeek 无隶属关系',
      DISCLAIMER: '插件由各自作者开发维护，收录不构成背书；安装即运行第三方代码，请自行审阅源码、风险自担。',
      ALL: '全部',
      MARKET_LEAD: '<b>dsh-market</b> —— 在 DeepSeek Harness 里直接逛并安装本列表全部插件',
      MARKET_LINK: '了解 dsh-market ↗',
      NAV_SUBMIT: '提交收录',
      MARKET_GO: '获取',
      INSTALL_BTN: '安装',
      MENU_MARKET: '通过 dsh-market · 推荐',
      MENU_MARKET_HINT: '复制市场安装命令',
      MENU_CLI: '通过命令行',
      MENU_CLI_HINT: '复制本插件的安装命令',
      COPIED: '已复制',
      TOTOP: '返回顶部',
      CRUMB_ALL: '全部插件',
      KICKER: 'DeepSeek Harness 插件',
      P_INSTALL: '安装',
      P_LINKS: '链接',
      P_RELATED: '同类插件',
      P_MORECAT: '查看整个分类',
      P_STARS: 'Star 数',
      P_DOWNLOADS: '下载量（近 30 天）',
      P_CAT: '分类',
      P_ADDED: '收录于',
      P_GH: 'GitHub 仓库 ↗',
      P_NPM: 'npm 包 ↗',
      P_MARKET: '通过 dsh-market 安装',
      P_README_SRC: '内容来自项目 README（GitHub）↗',
      P_README_ONLY: '该插件的 README 只有{LANG}版本。',
      PRIVACY: '隐私政策',
      BACKHOME: '← 返回列表',
    },
    langNames: { en: '英文', zh: '中文' },
  },
]
