# Contributing to dsh-pouch

We welcome contributions of small, practical, and well-tested plugins for DeepSeek Harness!

## Development Guidelines
1. Each plugin should live under `packages/dsh-plugin-<name>`.
2. Provide smoke and contract tests under `test/smoke.test.mjs`.
3. Follow the standard DSH and Cordis plugin architecture (`dsh.bundle` / `dsh.client`).
4. Ensure `pnpm test` passes before opening a pull request.
