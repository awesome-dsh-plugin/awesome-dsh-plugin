import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const MARKER = "restart-failed.json";

function makeCtx(systemPrompt) {
  const sections = [];
  const ctx = {
    commands: { register() {} },
    tools: { register() {} },
  };
  if (systemPrompt) {
    ctx.get = (name) => (name === "systemPrompt" ? { section(s) { sections.push(s); } } : undefined);
  }
  // No ctx.get at all simulates a runtime without optional services.
  return { ctx, sections };
}

function plantMarker(home, body, ageMs = 0) {
  const path = join(home, MARKER);
  writeFileSync(path, JSON.stringify(body));
  if (ageMs) {
    const t = new Date(Date.now() - ageMs);
    utimesSync(path, t, t);
  }
  return path;
}

test("apply registers the failure-notice prompt section", async () => {
  const { apply } = await import("../lib/index.js");
  const { ctx, sections } = makeCtx(true);
  apply(ctx);
  assert.equal(sections.length, 1);
  assert.equal(sections[0].name, "dsh-restart:failure-notice");
  assert.equal(typeof sections[0].text, "function");
});

test("apply tolerates a runtime whose ctx has no optional-service getter", async () => {
  const { apply } = await import("../lib/index.js");
  // Real cordis contexts always provide commands/tools (hard deps), but the
  // systemPrompt lookup must not break boot when ctx.get is unavailable.
  apply({ commands: { register() {} }, tools: { register() {} } });
});

test("notice text is empty while no failure marker exists", async () => {
  const { apply } = await import("../lib/index.js");
  const home = mkdtempSync(join(tmpdir(), "dsh-restart-notice-"));
  try {
    process.env.DSH_HOME = home;
    const { ctx, sections } = makeCtx(true);
    apply(ctx);
    assert.equal(sections[0].text(), "");
  } finally {
    delete process.env.DSH_HOME;
    rmSync(home, { recursive: true, force: true });
  }
});

test("notice text surfaces a fresh failure marker", async () => {
  const { apply } = await import("../lib/index.js");
  const home = mkdtempSync(join(tmpdir(), "dsh-restart-notice-"));
  try {
    process.env.DSH_HOME = home;
    plantMarker(home, {
      time: "2026-08-22T04:19:58",
      reason: "新进程启动即退出 (new DSH process exited during startup)",
      retryCount: 2,
    });
    const { ctx, sections } = makeCtx(true);
    apply(ctx);
    const text = sections[0].text();
    assert.match(text, /自动重启曾失败/);
    assert.match(text, /2026-08-22T04:19:58/);
    assert.match(text, /2 次/);
  } finally {
    delete process.env.DSH_HOME;
    rmSync(home, { recursive: true, force: true });
  }
});

test("notice text ignores markers older than seven days", async () => {
  const { apply } = await import("../lib/index.js");
  const home = mkdtempSync(join(tmpdir(), "dsh-restart-notice-"));
  try {
    process.env.DSH_HOME = home;
    const eightDays = 8 * 24 * 60 * 60 * 1000;
    plantMarker(home, { time: "old", reason: "old", retryCount: 0 }, eightDays);
    const { ctx, sections } = makeCtx(true);
    apply(ctx);
    assert.equal(sections[0].text(), "");
  } finally {
    delete process.env.DSH_HOME;
    rmSync(home, { recursive: true, force: true });
  }
});
