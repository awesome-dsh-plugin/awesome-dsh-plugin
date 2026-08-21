# @moon16u/dsh-plugin-current-time

Inject the host's current date and time into agent context at the start of every turn.

## Why

A model has no clock. It infers "today" from whatever the harness put in its
context, which is fine for a short session and wrong for a long one — a
conversation left open across midnight keeps reasoning from yesterday's date,
and nothing in the transcript contradicts it.

This plugin puts one real wall-clock reading at the top of every turn, so
relative reasoning ("due tomorrow", "that was three hours ago") has something
true to anchor to.

## Behavior

On the first step of each turn, the plugin appends one durable `user`-role
message after the claimed prompt:

```md
<system-reminder>当前时间：2026-08-22 周六 01:55:30（UTC+0800，Asia/Shanghai）。这是本轮开始时的真实时刻，每轮自动刷新；请以最近的一条为准，不要根据对话历史推断当前日期或时间。</system-reminder>
```

Three deliberate choices:

- **Once per turn, not once per step.** `agent/pre-step` also fires for every
  later step of a tool-call loop. Stamping those would bury the transcript in
  near-identical readings that tell the model nothing new.
- **Appended, not prepended.** The reading belongs after the prompt it
  describes, so the freshest timestamp is the last thing the model reads.
- **Durable, so earlier stamps remain.** DSH has no ephemeral message form, so
  each turn's reading stays in history. That keeps the injection append-only
  (friendly to prompt caching) and leaves an honest timeline, at the cost of one
  short message per turn. The reminder's closing sentence is what stops the
  model from reading a stale stamp as "now".

A rejected or empty first step is left untouched — there is no request for the
reading to accompany.

## Weekday and timezone

Weekday names are written into the plugin rather than read from a locale: DSH
runs on hosts without `zh_CN` installed, where `toLocaleDateString` would
silently fall back to English. The timezone label comes from
`Intl.DateTimeFormat().resolvedOptions().timeZone`; on a host without full ICU
data the reminder still carries the numeric UTC offset.

## Install

Ships as part of the [`@moon16u/dsh-pouch`](../..) bundle — no separate
installation step. The bundle's host entry mounts it automatically.

## Test

```bash
node --test test/*.test.mjs
```
