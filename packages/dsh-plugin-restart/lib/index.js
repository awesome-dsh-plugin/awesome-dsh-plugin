import { spawn } from "node:child_process";
import { join } from "node:path";
import { homedir } from "node:os";
import { writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { defineTool } from "@deepseek-ai/dsh-tools";

export const name = "dsh-restart";
export const inject = ["commands", "tools"];

const DEFAULT_DELAY_MS = 3000;
// Fixed restart delay: the user wants every restart to happen 3 seconds after
// the request. Even if a model passes delay_ms (e.g. 15000), it is ignored and
// replaced with this constant.
const FIXED_DELAY_MS = 3000;
const SCRIPT = join(homedir(), "Agent YueJian", "dsh-plugin-local", "scripts", "dsh-restart.sh");

function scheduleDetachedRestart(delayMs = DEFAULT_DELAY_MS) {
  const dshHome = process.env.DSH_HOME || join(homedir(), ".dsh");
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
  writeFileSync(helperPath, helper, { mode: 0o700 });
  // Launch the helper through setsid+nohup so it is reparented to init
  // immediately and survives the DSH process being killed. A plain
  // spawn(detached) does not reparent while the parent DSH process is still
  // alive, so the helper would remain a child of DSH and die with it.
  const launch = `nohup setsid env DSH_RESTART_ALLOWED=1 DSH_HOME=${JSON.stringify(dshHome)} bash ${JSON.stringify(helperPath)} >>${JSON.stringify(join(dshHome, "dsh-restart-helper.log"))} 2>&1 < /dev/null &`;
  execFileSync("/bin/bash", ["-c", launch], { stdio: "ignore" });
  return helperPath;
}

export function apply(ctx) {
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
