import { test } from "node:test";
import assert from "node:assert/strict";

/** Capture the `agent/pre-step` middleware that `apply` registers. */
async function captureHandler() {
  const mod = await import("../lib/index.js");
  let handler;
  mod.apply({
    on(event, fn) {
      if (event === "agent/pre-step") handler = fn;
    },
  });
  assert.equal(typeof handler, "function", "apply must register agent/pre-step");
  return { mod, handler };
}

test("host entry exports name/apply/formatCurrentTime", async () => {
  const mod = await import("../lib/index.js");
  assert.equal(mod.name, "dsh-current-time");
  assert.equal(typeof mod.apply, "function");
  assert.equal(typeof mod.formatCurrentTime, "function");
});

test("reminder renders date, mapped weekday, and time from the given clock", async () => {
  const { mod } = await captureHandler();
  // 2026-08-22 is a Saturday; month is zero-based in the Date constructor.
  const text = mod.formatCurrentTime(new Date(2026, 7, 22, 1, 55, 30));
  assert.match(text, /^<system-reminder>/);
  assert.match(text, /<\/system-reminder>$/);
  assert.match(text, /2026-08-22 周六 01:55:30/);
  assert.match(text, /UTC[+-]\d{4}/);
  assert.match(text, /不要根据对话历史推断当前日期或时间/);
});

test("single-digit clock fields are zero padded", async () => {
  const { mod } = await captureHandler();
  const text = mod.formatCurrentTime(new Date(2026, 0, 5, 9, 8, 7));
  assert.match(text, /2026-01-05 周一 09:08:07/);
});

test("first step appends exactly one reminder after the claimed prompt", async () => {
  const { handler } = await captureHandler();
  const prompt = { id: "m1", role: "user", content: [{ type: "text", text: "hi" }] };
  const decision = await handler(
    { step: 1, messages: [] },
    async () => ({ kind: "enter", messages: [prompt] }),
  );

  assert.equal(decision.kind, "enter");
  assert.equal(decision.messages.length, 2);
  assert.equal(decision.messages[0], prompt, "the prompt must stay first");

  const stamp = decision.messages[1];
  assert.equal(stamp.role, "user");
  assert.equal(stamp.source.kind, "plugin");
  assert.equal(stamp.source.plugin, "dsh-current-time");
  assert.match(stamp.content[0].text, /^<system-reminder>当前时间：/);
});

test("later steps of the same turn are left untouched", async () => {
  const { handler } = await captureHandler();
  const original = { kind: "enter", messages: [{ id: "m1" }] };
  const decision = await handler({ step: 2, messages: [] }, async () => original);
  assert.equal(decision, original, "a tool-call loop must not restamp every step");
});

test("a rejected or empty first step is left untouched", async () => {
  const { handler } = await captureHandler();

  const rejected = { kind: "reject", messages: [] };
  assert.equal(
    await handler({ step: 1, messages: [] }, async () => rejected),
    rejected,
  );

  const empty = { kind: "enter", messages: [] };
  assert.equal(
    await handler({ step: 1, messages: [] }, async () => empty),
    empty,
  );
});
