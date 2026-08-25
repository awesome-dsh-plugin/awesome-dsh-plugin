#!/usr/bin/env node
// ============================================================================
// dsh-restart-error-server.js — dsh-restart 失败兜底报错页服务（零依赖单文件）
// ============================================================================
// 由 dsh-restart.sh 的失败分支以 detached 方式启动：
//   nohup setsid node dsh-restart-error-server.js --config <restart-failed.json>
//
// 目的：DSH 重启失败时进程已死、插件代码无从执行，唯一幸存者是 restart.sh
// 的 bash 链。本服务接管端口，让用户刷新浏览器时看到明确的报错页（原因 +
// 相关日志尾部），并提供“重新启动 DSH”按钮形成自愈闭环。
//
// 端口契约（务必维持）：
//   * 只监听 127.0.0.1:$PORT，绝不常驻 —— retry 时先自杀释放端口再重跑
//     dsh-restart.sh，避免占端口导致后续真 DSH 起不来（EADDRINUSE 死锁）。
//   * 绑定失败（例如真 DSH 抢先起来了）→ 打日志后退出，绝不重试。
//
// 接口：
//   GET  /                        → 503 自包含报错页（每次请求都重新读配置
//                                    与日志，restart.sh 原地更新配置即可刷新内容）
//   GET  /healthz                 → 200 存活探针
//   POST /__dsh_restart__/retry   → 先应答浏览器，再自杀释放端口并 detached
//                                    重跑 dsh-restart.sh（launcher 模式）
// ============================================================================

import http from "node:http";
import { readFileSync, statSync, writeFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { join } from "node:path";

// ---------------------------------------------------------------- CLI & 配置

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--config") out.configPath = argv[++i];
  }
  return out;
}

const { configPath } = parseArgs(process.argv.slice(2));
if (!configPath) {
  console.error("usage: node dsh-restart-error-server.js --config <restart-failed.json>");
  process.exit(1);
}

function loadConfig() {
  return JSON.parse(readFileSync(configPath, "utf8"));
}

let config;
try {
  config = loadConfig();
} catch (err) {
  console.error(`error: cannot read config ${configPath}: ${err.message}`);
  process.exit(1);
}
for (const key of ["port", "profileHome", "scriptPath"]) {
  if (!config[key]) {
    console.error(`error: config missing required field "${key}"`);
    process.exit(1);
  }
}
const RESTART_ARGS = Array.isArray(config.args) ? config.args : [];

// ------------------------------------------------------------------ 工具函数

const ESC_MAP = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const esc = (value) => String(value).replace(/[&<>"']/g, (c) => ESC_MAP[c]);

// 读日志尾部；日志可能不存在（多数分支只有部分日志有内容），缺失不算错误。
function tailFile(path, maxLines = 40) {
  let stat;
  try {
    stat = statSync(path);
  } catch {
    return { exists: false };
  }
  let text = "";
  try {
    text = readFileSync(path, "utf8");
  } catch (err) {
    return { exists: true, error: `读取失败: ${err.message}` };
  }
  const lines = text.split("\n");
  while (lines.length && lines[lines.length - 1] === "") lines.pop();
  const tailLines = lines.slice(-maxLines).map((l) => (l.length > 2000 ? l.slice(0, 2000) + " …[截断]" : l));
  return {
    exists: true,
    mtime: stat.mtime.toISOString().replace("T", " ").slice(0, 19),
    totalLines: lines.length,
    shown: tailLines.length,
    text: tailLines.join("\n"),
  };
}

function logSections(cfg) {
  const scriptScheduleLog = `${cfg.scriptPath}.schedule.log`;
  return [
    [join(cfg.profileHome, "dsh-restart.log"), "dsh-restart.log", "重启 worker 输出"],
    [join(cfg.profileHome, "dsh-web.out.log"), "dsh-web.out.log", "新 DSH 进程输出（崩溃原因通常在这里）"],
    [scriptScheduleLog, "dsh-restart.sh.schedule.log", "helper/定时触发的外层日志"],
    [join(cfg.profileHome, "dsh-restart-helper.log"), "dsh-restart-helper.log", "重启 helper 自身的错误"],
  ].map(([path, name, desc]) => ({ path, name, desc, tail: tailFile(path) }));
}

function fmtTime(iso) {
  return String(iso || "").replace("T", " ").slice(0, 19);
}

// ---------------------------------------------------------------------- 页面

const STYLE = `
:root { color-scheme: dark; }
* { box-sizing: border-box; }
body { margin: 0; padding: 24px 16px; font-family: system-ui, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
       background: #14161a; color: #d6dae2; line-height: 1.55; }
main { max-width: 860px; margin: 0 auto; }
.badge { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 13px; font-weight: 600;
         background: #3a1518; color: #ff8589; border: 1px solid #5c2125; margin-bottom: 10px; }
h1 { font-size: 22px; margin: 0 0 6px; color: #f2f4f8; }
.sub { color: #9aa3b2; margin: 0 0 18px; font-size: 14px; }
.card { background: #1e222a; border: 1px solid #2c313c; border-radius: 10px; padding: 16px 18px; margin-bottom: 16px; }
table.meta { border-collapse: collapse; width: 100%; font-size: 14px; }
table.meta td { padding: 4px 8px 4px 0; vertical-align: top; }
table.meta td:first-child { color: #9aa3b2; white-space: nowrap; width: 7em; }
.reason { color: #ffb4b6; font-weight: 600; }
button { appearance: none; border: 1px solid #35502f; background: #23401f; color: #b8e6ae; font-size: 15px;
         font-weight: 600; padding: 10px 22px; border-radius: 8px; cursor: pointer; }
button:hover { background: #2b5226; }
button:disabled { opacity: 0.55; cursor: wait; }
.hint { display: block; margin-top: 8px; color: #9aa3b2; font-size: 13px; }
details { border: 1px solid #2c313c; border-radius: 8px; margin-bottom: 10px; background: #181b21; }
summary { cursor: pointer; padding: 10px 14px; font-size: 14px; color: #cdd3de; user-select: none; }
summary .desc { color: #8b93a2; font-size: 12.5px; margin-left: 8px; }
details pre { margin: 0; padding: 12px 14px; border-top: 1px solid #262b34; background: #0d0f13; color: #b9c2d0;
              font-family: ui-monospace, "Cascadia Mono", Consolas, monospace; font-size: 12.5px;
              overflow-x: auto; white-space: pre-wrap; word-break: break-all; max-height: 340px; overflow-y: auto; }
.missing { padding: 10px 14px; color: #6f7887; font-size: 13px; }
code { font-family: ui-monospace, Consolas, monospace; background: #12151a; border: 1px solid #2c313c;
       border-radius: 5px; padding: 1px 6px; font-size: 13px; color: #cdd3de; }
.manual { font-size: 13.5px; color: #aab2c0; }
.manual p { margin: 6px 0; }
#status { margin-top: 10px; font-size: 13.5px; color: #ffd28a; min-height: 1.4em; }
`;

function renderPage(cfg, sections) {
  const argsStr = JSON.stringify(cfg.args || []);
  const retryCount = cfg.retryCount || 0;
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>DSH 重启失败</title>
<style>${STYLE}</style>
</head>
<body>
<main>
  <div class="badge">HTTP 503 · 兜底报错页</div>
  <h1>⚠️ DSH 重启失败</h1>
  <p class="sub">自动重启未能完成，当前是重启脚本的兜底报错页（不是 DSH 本体）。页面内容每次刷新都会重新读取。</p>

  <div class="card">
    <table class="meta">
      <tr><td>失败原因</td><td class="reason">${esc(cfg.reason || "未知")}</td></tr>
      <tr><td>失败时间</td><td>${esc(fmtTime(cfg.time))}</td></tr>
      <tr><td>模式 / 端口</td><td>${esc(cfg.mode || "?")} / ${esc(String(cfg.port))}</td></tr>
      <tr><td>配置目录</td><td><code>${esc(cfg.profileHome)}</code></td></tr>
      <tr><td>已自动重试</td><td>${retryCount} 次${cfg.lastRetryAt ? `（最近 ${esc(fmtTime(cfg.lastRetryAt))}）` : ""}</td></tr>
    </table>
  </div>

  <div class="card">
    <form method="POST" action="/__dsh_restart__/retry"
          onsubmit="this.querySelector('button').disabled=true;document.getElementById('status').textContent='已触发：正在释放端口并重新启动…';">
      <button type="submit">🔄 重新启动 DSH</button>
    </form>
    <span class="hint">点击后：本报错页服务先退出并释放端口 ${esc(String(cfg.port))}，再重新运行重启脚本。期间浏览器可能出现“无法连接”，属于正常切换，请稍候。</span>
    <div id="status"></div>
  </div>

  <h1 style="font-size:16px;margin:20px 0 10px;">📋 相关日志尾部</h1>
  ${sections.map((s) =>
    s.tail.exists
      ? `<details${s.name === "dsh-restart.log" || s.name === "dsh-web.out.log" ? " open" : ""}>
           <summary>${esc(s.name)}<span class="desc">${esc(s.desc)} · 共 ${s.tail.totalLines} 行，显示末尾 ${s.tail.shown} 行 · 更新于 ${esc(s.tail.mtime)}</span></summary>
           <pre>${esc(s.tail.error || s.tail.text)}</pre>
         </details>`
      : `<details><summary>${esc(s.name)}<span class="desc">${esc(s.desc)}</span></summary><div class="missing">（文件不存在）</div></details>`
  ).join("\n")}

  <div class="card manual">
    <strong style="color:#cdd3de;">🛠️ 手动恢复（终端）</strong>
    <p>本报错页服务正占用端口 ${esc(String(cfg.port))}，直接启动 DSH 会因端口被占而失败。请先停掉它：</p>
    <p><code>kill ${process.pid}</code> &nbsp;或&nbsp; <code>pkill -f dsh-restart-error-server.js</code></p>
    <p>然后再手动重启：</p>
    <p><code>bash ${esc(cfg.scriptPath)} ${esc(argsStr.slice(1, -1))}</code></p>
  </div>
</main>
</body>
</html>`;
}

function renderRetried() {
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>DSH 正在重新启动…</title>
<style>${STYLE}</style>
</head>
<body>
<main>
  <div class="badge" style="background:#20301f;color:#b8e6ae;border-color:#35502f;">重试已触发</div>
  <h1>🔄 正在重新启动 DSH…</h1>
  <p class="sub">报错页服务已退出并释放端口，重启脚本正在运行（最长约 30 秒）。</p>
  <div class="card"><p id="msg" style="margin:0;">等待服务上线<span id="dots"></span></p><div id="status"></div></div>
  <p class="sub">成功后本页会自动跳转到 DSH 界面；若长时间停留在此处，可手动刷新或查看终端日志。</p>
</main>
<script>
(function () {
  var n = 0, okStreak = 0, dots = 0;
  var dotEl = document.getElementById('dots');
  setInterval(function () { dots = (dots + 1) % 4; dotEl.textContent = '.'.repeat(dots); }, 350);
  // 本服务自身在应答后约 0.4s 才退出：立刻探测会把“垂死服务的最后一次
  // 响应”（503 同样算 fetch 成功）误判成恢复，跳转后撞上端口空窗，反而
  // 落到浏览器的原生错误页。先静默等待超过自杀窗口的时间再轮询，并要求
  // 连续两次探测成功才跳转。
  setTimeout(function () {
    var t = setInterval(function () {
      n++;
      if (n > 150) { clearInterval(t); document.getElementById('status').textContent = '超过 3 分钟仍未恢复，请手动刷新或到终端检查日志。'; return; }
      fetch('/', { cache: 'no-store' }).then(function () {
        okStreak++;
        if (okStreak >= 2) { clearInterval(t); location.href = '/'; }
      }).catch(function () { okStreak = 0; });
    }, 1200);
  }, 2500);
})();
</script>
</body>
</html>`;
}

// ------------------------------------------------------------------ HTTP 服务

let shuttingDown = false;

function respond(res, status, body, type = "text/html; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store" });
  res.end(body);
}

function respondAndThen(res, status, body, then) {
  res.writeHead(status, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
  // 带回调的 end：等响应真正刷出后再执行 then（自杀前必须让浏览器收到应答）。
  res.end(body, () => then());
}

function handleRetry(res) {
  if (shuttingDown) {
    respond(res, 503, renderRetried());
    return;
  }
  shuttingDown = true;

  // 记录重试次数（配置同时充当 marker 文件，供插件下次启动时提示）。
  try {
    config = loadConfig();
    config.retryCount = (config.retryCount || 0) + 1;
    config.lastRetryAt = new Date().toISOString();
    writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);
  } catch (err) {
    console.error(`warn: cannot update config: ${err.message}`);
  }

  // 先应答浏览器，等响应刷出去之后再自杀，保证按钮不落空。
  respondAndThen(res, 200, renderRetried(), () => {
    // 关键：清掉 worker 环境 inherited 的标记，让重跑走“launcher 模式”
    // （它会自己截断日志、setsid 出真正的 worker）。否则会递归进入 worker。
    const env = { ...process.env };
    delete env.DSH_RESTART_DETACHED;
    delete env.DSH_SHELL;
    env.DSH_RESTART_ALLOWED = "1";

    console.log(`[${new Date().toISOString()}] retry requested: releasing port and rerunning ` +
      `bash ${config.scriptPath} ${JSON.stringify(RESTART_ARGS)}`);
    const child = spawn("/bin/bash", [config.scriptPath, ...RESTART_ARGS], {
      detached: true,
      stdio: "ignore",
      env,
    });
    child.unref();

    // 给 launcher 一点完成 setsid 的时间，然后释放端口退出。
    setTimeout(() => process.exit(0), 400);
  });
}

const server = http.createServer((req, res) => {
  const url = (req.url || "/").split("?")[0];
  if (req.method === "POST" && url === "/__dsh_restart__/retry") {
    handleRetry(res);
    return;
  }
  if (url === "/healthz") {
    respond(res, 200, "dsh-restart-error-server alive\n", "text/plain; charset=utf-8");
    return;
  }
  if (req.method === "GET" || req.method === "HEAD") {
    // 每次请求都重读配置与日志：restart.sh 若原地更新了配置文件，
    // 已在运行的旧实例也能展示最新原因（幂等，不会重复抢端口）。
    try {
      config = loadConfig();
    } catch {
      /* 沿用启动时的配置 */
    }
    respond(res, 503, renderPage(config, logSections(config)));
    return;
  }
  respond(res, 405, "method not allowed\n", "text/plain; charset=utf-8");
});

server.on("error", (err) => {
  // 绑定失败最常见的原因是真 DSH 已经起来占用了端口 —— 这正是期望的好结果，
  // 静默退出即可（启动方会把 stdout/stderr 记入 dsh-restart-error-server.log）。
  console.error(`error: cannot serve on 127.0.0.1:${config.port}: ${err.message}`);
  process.exit(1);
});

process.on("SIGTERM", () => process.exit(0));
process.on("SIGINT", () => process.exit(0));

server.listen(config.port, "127.0.0.1", () => {
  console.log(`[${new Date().toISOString()}] dsh-restart error page serving at http://127.0.0.1:${config.port}/ ` +
    `(pid ${process.pid}, config ${configPath})`);
});
