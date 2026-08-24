# dsh-reveal-files

[English](README.md) | [简体中文](README.zh.md)

A dual-face DeepSeek Harness plugin that makes each produced-file chip in the
「产物」/ "Produces" row (the row of file chips under assistant messages)
open a **small dropdown menu** with per-file actions: open the file, copy its
path, reveal it in your native file browser, or open a terminal cd'ed into
the file's directory.

## Features

- Each produced file chip opens a compact **dropdown menu** on click — no
  accidental direct opens, one menu per file:
  - 📂 **Open** — open with the default application (the original behavior).
  - 📋 **Copy file path** — copy the absolute path to the system clipboard.
  - 📁 **Show in file browser** — macOS Finder (`open -R`, selects the file),
    Linux file manager (`xdg-open` on the parent folder), Windows Explorer
    (`explorer /select,`).
  - ⌨️ **Open the file's directory in terminal** — opens a native terminal
    **frontmost**, cd'ed into the file's parent directory for further work:
    Terminal.app on macOS, `x-terminal-emulator` / `gnome-terminal` /
    `konsole` on Linux, or `cmd` on Windows. Every trigger opens a fresh
    window (each action gets its own terminal, no extra permissions needed).
- Menu labels follow the UI locale (Simplified Chinese / English); the menu
  items carry `role="menuitem"` and the chips expose `aria-haspopup` /
  `aria-expanded`.
- Relative paths are resolved against the session working directory.
- Errors (e.g. sandbox denial, unsupported platform) surface inside the open
  menu, which stays open while an action is in flight (items disabled).
- Zero runtime dependencies beyond the harness itself — Host uses only
  `node:child_process`; the client uses only the platform's `react` seed.

## Requirements

- DeepSeek Harness Web (profile `web`), i.e. `dsh web`.
- Node.js `>= 22.6.0`.
- A desktop environment the native opener can reach (macOS and Windows always;
  Linux needs a display server or WSL).

## Installation

```bash
# Install from GitHub (pnpm git spec; #main pins the default branch):
dsh plugin --profile web add github:yumm007/dsh-reveal-files#main
```

> **Building from source.** GitHub installs build the package during
> install; pnpm asks once for an `allowBuilds` grant, then proceeds. If it
> does (or if the build is blocked), add the package to
> `allowBuilds` in your profile's `pnpm-workspace.yaml` and re-run the
> command. A prebuilt npm release skips this step entirely.

`dsh plugin` forwards the arguments to pnpm inside the profile directory and
then reconciles `dsh.profile.bundles`. Because the package declares
`dsh.bundle.patch`, it joins the profile layer stack automatically — no manual
editing of `cordis.yml` is required.

After installation, restart the web profile:

```bash
dsh web
```

The plugin loads as a bundle on boot: the Host half registers the
`POST /api/reveal-files` and `POST /api/show-in-terminal` routes and the
client half mounts the drop-down menu in the produced-files row.

## Usage

1. Let the assistant produce one or more files (any `write` / `edit` /
   mutation tool result in a turn).
2. Under that message, find the produced-files row (「产物」 in Chinese, "Produces" in English) with the file chips.
3. Click a file chip — a small menu opens with **Open** / **Copy file
   path** / **Show in file browser** / **Open the file's directory in
   terminal**; pick one. The menu closes on selection or on an outside click.
4. If an action fails, the error appears inside the menu in red; the items
   stay disabled while the action is running.

## Configuration

The plugin row in `cordis.patch.yml` accepts:

```yaml
- insert:
    - id: dsh-reveal-files
      name: 'dsh-reveal-files'
      config:
        enabled: true          # register the reveal route (default true)
        revealTimeoutMs: 10000 # per-command timeout, ms (default 10000)
```

Override these in the profile's own `cordis.patch.yml` if you need to.

## How it works

| Layer | File | Responsibility |
| --- | --- | --- |
| Host | `lib/index.js` | Cordis plugin row `dsh-reveal-files` (injects `webServer` and `sessions`) and registers `POST /api/reveal-files` (reveal) and `POST /api/show-in-terminal` (frontmost terminal cd). Runs `open -R` / `xdg-open` / `explorer /select,` and `osascript` / terminal emulators per platform, resolves relative paths against the session cwd, and returns JSON results. |
| Client | `client/client.js` | Web module (`window.__ModuleLoader__.load`), registered by the harness client module system. Claims the `conversation.chat.turnTail` chain with `priority: -1` and a `select` that reads the turn's `deliverables` data (the same vocabulary the built-in row uses), then renders the chips row plus the two icon buttons. |

### Why `priority: -1`?

The turn-tail slot is a *chain*: entries are tried in ascending priority order
and the first non-null `select` result wins. The built-in produced-files row
registers at priority `0`. Registering at `-1` places this plugin's entry
first, so the reveal icon is rendered while keeping identical file-detection
behavior. Without the explicit priority, the two entries would tie at `0` and
the built-in row would silently win.

## Uninstall

```bash
dsh plugin --profile web remove dsh-reveal-files
```

The reconcile step also drops the package from `dsh.profile.bundles`; restart
the web profile afterwards.

## Development

For local development against a checkout, install it from disk and re-run
the `add` after each edit — the profile's dependency is a hard link, so the
installed code follows your working tree:

```bash
dsh plugin --profile web add file:/absolute/path/to/dsh-reveal-files
# after editing:        dsh plugin --profile web add file:/absolute/path/to/dsh-reveal-files
# or force a reinstall: pnpm --dir ~/.dsh/profiles/web install --force
```

The web server serves the client bundle from disk with a rev-hashed URL, so a
refresh picks up client changes; Host route changes require a restart.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).

## License

[MIT](./LICENSE)
