# @moon16u/dsh-plugin-session-id

Display current DSH Session ID badge in the web header with one-click clipboard copy.

## Features
- Displays a native-styled Session ID button in the session header utilities area.
- One-click copy with instant feedback.
- Pure client-side UI plugin (no host overhead).

## Installation
```bash
cd ~/.dsh/profiles/web
pnpm add file:<path-to-dsh-pouch>/packages/dsh-plugin-session-id
```

## Configuration (cordis.patch.yml)
```yaml
- insert:
    - id: dsh-session-id
      name: '@moon16u/dsh-plugin-session-id'
      config: {}
```
