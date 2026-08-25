import { spawn } from "node:child_process";
import { join } from "node:path";
import { homedir } from "node:os";
import { readFileSync, statSync, mkdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { defineTool } from "@deepseek-ai/dsh-tools";

export const name = "dsh-restart";
export const inject = ["commands", "tools"];

const DEFAULT_DELAY_MS = 3000;
// Fixed restart delay: the user wants every restart to happen 3 seconds after
// the request. Even if a model passes delay_ms (e.g. 15000), it is ignored and
// replaced with this constant.
const FIXED_DELAY_MS = 3000;
const SCRIPT = join(fileURLToPath(new URL("../scripts/", import.meta.url)), "dsh-restart.sh");
// Written by dsh-restart.sh's failure branches; removed by its success path.
const FAILURE_MARKER = "restart-failed.json";
// Stop surfacing a failure notice after this long — the marker may survive if
// the user never restarts successfully again, and an ancient failure is noise.
const FAILURE_NOTICE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function currentDshHome() {
  return process.env.DSH_HOME || join(homedir(), ".dsh");
}

function scheduleDetachedRestart(delayMs = DEFAULT_DELAY_MS) {
  const dshHome = currentDshHome();
  const isDev = dshHome === join(homedir(), ".dsh-dev");
  const modeArg = isDev ? " dev" : "";
  const helper = `#!/usr/bin/env bash
# Detached restart helper written by @deepseek-ai/dsh-restart.
# The outer DSH process may exit while this helper sleeps; once it is
# reparented to init the sleep below still continues. The restart script is
# invoked with DSH_RESTART_ALLOWED=1.
sleep "$(awk "BEGIN { print ${Math.max(0, Number(delayMs) || 0)} / 1000 }")"
exec "${SCRIPT}"${modeArg} >> "${SCRIPT}.schedule.log" 2>&1
`;
  const helperPath = join(dshHome, "dsh-restart-helper.sh");
  mkdirSync(dshHome, { recursive: true });
  writeFileSync(helperPath, helper, { mode: 0o700 });
  // Test/ops safety valve: with DSH_RESTART_DRY_RUN=1 the helper file is
  // written but never spawned. The smoke tests set this — their handler
  // invocations would otherwise schedule a REAL detached restart of whatever
  // DSH_HOME instance the test process inherited (this actually restarted
  // production once; see smoke.test.mjs).
  if (process.env.DSH_RESTART_DRY_RUN === "1") {
    return helperPath;
  }
  // Launch the helper through setsid+nohup so it is reparented to init
  // immediately and survives the DSH process being killed. A plain
  // spawn(detached) does not reparent while the parent DSH process is still
  // alive, so the helper would remain a child of DSH and die with it.
  const launch = `nohup setsid env DSH_RESTART_ALLOWED=1 DSH_HOME=${JSON.stringify(dshHome)} bash ${JSON.stringify(helperPath)} >>${JSON.stringify(join(dshHome, "dsh-restart-helper.log"))} 2>&1 < /dev/null &`;
  execFileSync("/bin/bash", ["-c", launch], { stdio: "ignore" });
  return helperPath;
}

// Failure-visibility notice: dsh-restart.sh writes restart-failed.json when a
// restart fails (the browser then sees the error page served by
// dsh-restart-error-server.js), and removes it on the next successful start.
// While the marker exists, surface it as a dynamic prompt section so the model
// tells the user about the failure at the start of the next conversation —
// this covers the "user fixed it manually, DSH came up much later" gap where
// nobody ever looked at the browser again. Returns "" (contributes nothing)
// whenever the marker is absent or stale; must never throw into assembly.
function failureNoticeSection() {
  return {
    name: "dsh-restart:failure-notice",
    order: 190,
    text: () => {
      try {
        const path = join(currentDshHome(), FAILURE_MARKER);
        if (Date.now() - statSync(path).mtimeMs > FAILURE_NOTICE_MAX_AGE_MS) return "";
        const m = JSON.parse(readFileSync(path, "utf8"));
        const retries = Number(m.retryCount) || 0;
        return [
          "系统提示：上一次 DSH 自动重启曾失败，且此后还没有一次成功的重启将其清除。",
          `失败时间 ${m.time ?? "未知"}；原因：${m.reason ?? "未知"}；报错页上的“重新启动”按钮已被按下 ${retries} 次。`,
          "请在回复的开头用一句话告知用户此事（例如提醒其浏览器里可能还开着报错页）。",
          `细节可查看 ${join(currentDshHome(), "dsh-restart-error-server.log")} 与同目录的 ${FAILURE_MARKER}；一次成功的重启会自动删除该标记。`,
        ].join("\n");
      } catch {
        return "";
      }
    },
  };
}

export function apply(ctx) {
  // Optional enhancement: never let the notice break boot or command
  // registration, hence its own guarded block. systemPrompt is optional —
  // skip silently in runtimes that do not provide it.
  try {
    const systemPrompt = ctx.get("systemPrompt");
    if (systemPrompt) systemPrompt.section(failureNoticeSection());
  } catch {
    // The notice is best-effort by design.
  }

  ctx.commands.register({
    name: "dsh-restart",
    description: "schedule a detached DSH restart in exactly 3 seconds",
    input: { hint: "[固定3秒，无需参数]" },
    handler: async () => {
      const helperPath = scheduleDetachedRestart(FIXED_DELAY_MS);
      return {
        kind: "success",
        text: `DSH restart scheduled in ${FIXED_DELAY_MS / 1000}s. Helper: ${helperPath}`,
      };
    },
  });

  ctx.tools.register(defineTool({
    name: "dsh_restart",
    description: "Schedule a DSH restart in exactly 3 seconds. Returns immediately; DSH will restart automatically and the conversation will resume after reload. Use this when the user asks to restart DSH/current process. This tool has no parameters; the delay is fixed at 3000ms (3s) and cannot be changed.",
    parameters: {},
    output: {
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          ok: { type: "boolean", required: true },
          text: { type: "string", required: true },
        },
      },
      render: (args, value) => [{ type: "text", text: value.text }],
    },
    execute: () => {
      const helperPath = scheduleDetachedRestart(FIXED_DELAY_MS);
      return Promise.resolve({
        ok: true,
        text: `DSH restart scheduled in ${FIXED_DELAY_MS / 1000}s. Helper: ${helperPath}`,
      });
    },
  }));
}
