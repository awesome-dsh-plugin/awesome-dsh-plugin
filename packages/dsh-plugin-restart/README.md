# @moon16u/dsh-plugin-restart

Safe, detached DSH process restart command (`/dsh-restart`) and agent tool (`dsh_restart`).

## Features
- **Zero Freeze**: Schedules restart in a detached worker process with a 3-second grace period.
- **Slash Command**: Run `/dsh-restart` in chat to trigger restart.
- **Agent Tool**: Enables the AI Agent to self-heal and restart DSH when requested.

## Installation
```bash
cd ~/.dsh/profiles/web
pnpm add file:<path-to-dsh-pouch>/packages/dsh-plugin-restart
```

## Configuration (cordis.patch.yml)
```yaml
- insert:
    - id: dsh-restart
      name: '@moon16u/dsh-plugin-restart'
      config: {}
```
