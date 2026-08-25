import { test } from "node:test";
import assert from "node:assert/strict";
import { statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

test("restart shell script ships next to the module and is executable", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const script = join(here, "..", "scripts", "dsh-restart.sh");
  const st = statSync(script);
  assert.equal(st.isFile(), true);
  assert.ok(st.mode & 0o111, "dsh-restart.sh must be executable");
});

test("error page server ships next to the module", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const server = join(here, "..", "scripts", "dsh-restart-error-server.js");
  assert.equal(statSync(server).isFile(), true);
});
