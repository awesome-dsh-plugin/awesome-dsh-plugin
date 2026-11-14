**Plugin**

`dsh-eventmem` is the DSH adapter for [eventmem](https://github.com/wackyju2-beep/eventmem). It adds recall injection before a turn, seven memory tools (`evt_add`, `mem_recall`, `expand`, `mem_neighbors`, `proj_add`, `proj_list`, `evt_forget`), turn-end extraction through the host model, and a native memory console (overview / backends / models / schedule / logs / graph) over the eventmem daemon's `/api/mem/*` data plane.

This is a **client only**. The package does not install or start the Python daemon, database, embedding model, or relation worker. The default is a single-machine setup (`mode: local`, `baseUrl: http://127.0.0.1:9123`, no SSH); the daemon is installed separately from the repository's `install.cmd` / `install.sh`. Remote sharing through an SSH tunnel is opt-in and requires the user's own `tunnelHost`.

**Checklist**

- [x] One new YAML file is the whole submission.
- [x] `package.json` declares `dsh.bundle` (`./cordis.patch.yml`) and `dsh.client`.
- [x] `private: true` removed; `engines.dsh` is `>=0.2.2-rc.3 <0.3.0`; `publishConfig.access` is public.
- [x] Defaults contain no private host or tunnel: `cordis.patch.yml` is local-only.
- [x] The plugin ships locale resources, an SVG icon, and a detail document.
- [x] The repo has the `dsh-plugin` topic.

**What changed for publishing**

- The previous bundle tried `tunnel: true` with `tunnelHost: mint` by default. Both the bundle patch and the runtime defaults are now local (`tunnel: false`, empty host); a stale `tunnel: true` row still means remote.
- The memory console has a new **连接** page: it shows adapter / daemon / database identity / optional vector arm / optional relation backend, tests a candidate endpoint, and saves `mode`, `baseUrl`, `tunnelHost`, `expectDbId`, and `tokenFile` through the profile config editor — no YAML editing.
- Identity is validated, not assumed: `/api/health` must report `service: eventmem-daemon`, `api: 1`, a numeric `schema`, and (when configured) the expected `db_id`. A different local service on the port is rejected before a write.
- The daemon now supports an optional bearer token (`--token` / `--token-file`); a non-loopback bind without a token is refused. When enabled, all routes except minimal health require the token. POSTs from another origin are rejected.
- The DSH and Hermes proxies forward the token; the browser console asks for it once per tab.
- Privacy is documented: turn-end extraction sends a redacted excerpt to the host's configured model, which may be remote; `redact.js` is best-effort, not a secret detector.

**Verification**

- `node tests/test_dsh_adapter.mjs`: 18 contract tests (defaults, package metadata, identity, token, setup save/test) pass.
- `node tests/test_dsh_host.mjs`: mounts `index.js` with a fake Cordis context against a real HTTP stub; recall injection, `dsh:<session>`, `evt_add` write, and `expand` pass.
- `python tests/test_install_contract.py`: 19 packaging/install checks pass, including loopback bind, `-RequireToken`, separate plugin install, and no private default host.
- `python tests/test_daemon.py` on Windows: the new health-identity, token, cross-origin and non-loopback-refusal cases pass; two pre-existing Windows failures remain (`fcntl`-less lock test and a fake-server runtime test), unchanged by this PR.
- `python benchmarks/run.py`: deterministic recall fixture (hit@5 = 1.0, full@5 = 0.8, MRR = 1.0) and relation baseline (accuracy 0.846, macro-F1 0.743).

**Not verified**

- Rendering the new 连接 page inside a live DSH GUI session, and a config-editor save against a real profile (covered only by a stub).
- A real daemon started with `-RequireToken` and a real remote SSH target.
- Real ONNX embedding recall and a real decision backend; both remain optional.
