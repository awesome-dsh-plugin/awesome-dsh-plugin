import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");

test("host entry exports name/inject/apply", async () => {
  const mod = await import("../lib/index.js");
  assert.equal(mod.name, "dsh-restart");
  assert.deepEqual(mod.inject, ["commands", "tools"]);
  assert.equal(typeof mod.apply, "function");
});

test("plugin registers /dsh-restart command that returns immediately", async () => {
  const mod = await import("../lib/index.js");
  let registered;
  const fakeCtx = {
    commands: {
      register(def) { registered = def; },
    },
    tools: { register() {} },
  };
  mod.apply(fakeCtx);
  assert.equal(registered.name, "dsh-restart");
  const result = await registered.handler({ rawInput: "" });
  assert.equal(result.kind, "success");
  assert.match(result.text, /scheduled/);
});

test("plugin registers dsh_restart agent tool", async () => {
  const mod = await import("../lib/index.js");
  const tools = [];
  const fakeCtx = {
    commands: { register() {} },
    tools: { register(t) { tools.push(t); } },
  };
  mod.apply(fakeCtx);
  const tool = tools.find((t) => t.name === "dsh_restart");
  assert.ok(tool, "dsh_restart tool registered");
  assert.match(tool.description, /restart DSH/i);
  const result = await tool.execute({}, {});
  assert.equal(result.ok, true);
  assert.match(result.text, /scheduled/);
});

test("dsh_restart ignores delay_ms and always schedules 3s", async () => {
  const mod = await import("../lib/index.js");
  const tools = [];
  const fakeCtx = {
    commands: { register() {} },
    tools: { register(t) { tools.push(t); } },
  };
  mod.apply(fakeCtx);
  const tool = tools.find((t) => t.name === "dsh_restart");
  const result = await tool.execute({ delay_ms: 15000 }, {});
  assert.equal(result.ok, true);
  assert.match(result.text, /scheduled in 3s/);
  assert.doesNotMatch(result.text, /15s/);
});

test("dsh_restart without args schedules 3s", async () => {
  const mod = await import("../lib/index.js");
  const tools = [];
  const fakeCtx = {
    commands: { register() {} },
    tools: { register(t) { tools.push(t); } },
  };
  mod.apply(fakeCtx);
  const tool = tools.find((t) => t.name === "dsh_restart");
  const result = await tool.execute({}, {});
  assert.equal(result.ok, true);
  assert.match(result.text, /scheduled in 3s/);
});
