import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");

test("host entry exports apply", async () => {
  const mod = await import("../lib/index.js");
  assert.equal(typeof mod.apply, "function");
});

test("client bundle is a ModuleLoader payload for dsh-session-id", async () => {
  const source = await readFile(join(root, "lib/client.js"), "utf8");
  assert.match(source, /window\.__ModuleLoader__\.load\(\{/);
  assert.match(source, /id:\s*"@moon16u\/dsh-plugin-session-id"/);
  assert.match(source, /"conversation\.session\.header\.utilities"/);
  assert.match(source, /"dsh-session-id"/);
  assert.match(source, /navigator\.clipboard/);
});

test("client bundle does not expose the session id as visible text", async () => {
  const source = await readFile(join(root, "lib/client.js"), "utf8");
  assert.doesNotMatch(source, /data-session-id-value/);
  assert.doesNotMatch(source, /React\.createElement\("code"/);
});

test("client bundle matches Session log button styling", async () => {
  const source = await readFile(join(root, "lib/client.js"), "utf8");
  assert.match(source, /min-width:111px/);
  assert.match(source, /height:32px/);
  assert.match(source, /border-radius:18px/);
  assert.match(source, /dsh-session-id-copy/);
});

test("package.json points to runtime bundles", async () => {
  const pkg = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
  assert.equal(pkg.name, "@moon16u/dsh-plugin-session-id");
  assert.equal(pkg.exports["."].default, "./lib/index.js");
  assert.equal(pkg.exports["./client"].default, "./lib/client.js");
});
