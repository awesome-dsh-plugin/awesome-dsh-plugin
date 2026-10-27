## dsh-doudizhu v0.2.2 → v0.2.3

Follow-up to the merged #8397. This bumps the entry to the newest release, `v0.2.3`, and names the package on npm (`dsh-doudizhu-lan`) in the description, since the bare npm name `dsh-doudizhu` is somebody else's placeholder.

**What changed in 0.2.2** (already in the merged entry, listed here for context): a real bug fix — computers did not play on a one-person table. The bot timer hung on the authority's request handler, so only a *guest* polling the LAN port would re-arm it; the local player's moves arrive through the plugin's loopback route and never re-armed it. The driver now hangs on the room's own change signal. 179 unit tests, including a regression that drives the real plugin route with nobody else on the LAN port.

**What changed in 0.2.3**: docs and metadata only — no runtime change. `package.json` description starts with 斗地主 / Doudizhu and carries 21 keywords; the npm channel moved from `@dingchenhui/dsh-doudizhu` to the unscoped `dsh-doudizhu-lan` (the scoped name does not appear in npm search at all: a search for `@scope/name` is one token, so `dsh-doudizhu` never matches it). README now opens with which package is this project and which same-named repos/placeholder are not.

Tarball: `v0.2.3/dsh-doudizhu-0.2.3.tgz` (sha256 `cc79a9527911b9ad0da0dc0024eb7a38aaec8b5ec0a84705f80ac48ac59a8608`).
