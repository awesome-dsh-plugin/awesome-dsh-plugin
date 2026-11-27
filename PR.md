Adds one entry: **Moonset**, a light/dark theme pair for DeepSeek Harness.

```yaml
url: https://github.com/aurasuisui/dsh-moonset-theme
name: aurasuisui/dsh-moonset-theme
category: theme
```

What it does (each claim is checkable in the repo):

- **228 `--dsw-*` tokens per scheme** — `moonset-light` and `moonset-dark` registered through the official theme API; the table is generated from the installed `design-platform.css` and checked by `scripts/verify-tokens.mjs` (missing 0 / retired 1 / live 228)
- **Follow-system mode** — both halves in one `overrideTokens` layer, so the OS decides
- **No first-paint flash** — the Host half injects one style sheet before the first frame and the client removes it on takeover
- **Thin skin layer** — ambient ground glow (3 scopes, separate hue + strength per scheme), frosted input card / conversation header / Windows caption strip, per-tool-type colours on work-step rows, and document-site surface colours for code blocks and file cards
- **Zero resident JavaScript** — no `addEventListener`, no `requestAnimationFrame`, no observer, no polling; only a write debounce and a style-sheet rebuild timer
- **No network access, no telemetry**

Published as `@aurasuisui/dsh-moonset-theme` (latest **0.1.8**), MIT, installs with `dsh plugin add`.

Palette credit: the colours come from [unmbt/moonset-document](https://github.com/unmbt/moonset-document) by [Wyatex](https://github.com/Wyatex), who allowed reuse — that is why the icon is the same moon mark.

The entry file was validated locally with `node scripts/generate-readme.mjs` (exit 0), and the regenerated README diff is exactly the one new line in each file.
