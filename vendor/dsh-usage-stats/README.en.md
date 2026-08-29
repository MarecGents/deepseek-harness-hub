# @dsh-external/dsh-usage-stats

中文 | [English](README.en.md)

Usage statistics plugin for DeepSeek Harness (DSH): aggregates token usage
(input / output / cache read / cache write) across every session log, with
per-model and per-day breakdowns, rendered as a settings page with editable
per-model prices for cost estimation.

![topic](https://img.shields.io/badge/DSH-plugin-blue) ![license](https://img.shields.io/badge/license-BSD--3--Clause-green) [![GitHub](https://img.shields.io/badge/GitHub-dsh--plugin--topic-informational)](https://github.com/topics/dsh-plugin)

## Features
- **Overview**: total tokens, request count and session count across all sessions.
- **Per-model breakdown**: requests and token buckets per provider/model.
- **Per-day breakdown**: daily table plus a lightweight trend chart.
- **Prices & cost estimate**: built-in prices for common providers, overridable
  per model from the settings page; USD/RMB display.
- **Load-friendly**: background warm-up, debounced rescan on session events,
  incremental per-session cache keyed by snapshot revision, and
  stale-while-revalidate reads, so opening the settings page never blocks.

## Install

### 1. One-click via the plugin market
If [dsh-market](https://github.com/dsh-market/dsh-market) is installed:

1. Open **Settings → Plugin Market**
2. Search `dsh-usage-stats` (or `@dsh-external/dsh-usage-stats`)
3. Click **Install**, refresh, and the "用量统计" section appears in Settings

> The market only installs sources listed in its registry. If it does not show
up there yet, use one of the paths below first.

### 2. Official `dsh plugin add` command

This package declares a `dsh.bundle` manifest, so the official installer works:

```bash
dsh plugin --profile web add @dsh-external/dsh-usage-stats
```

> The package is not on npm yet, so this falls back to a GitHub source install.

### 3. dsh-super-injector

```bash
dev_inject_plugin <this repository>
```

### 4. Clone and pack

```bash
git clone https://github.com/dustinmoon78/dsh-usage-stats.git
cd dsh-usage-stats
bash scripts/build.sh      # verifies lib and packs a tgz
# install/inject the produced tgz in your target environment
```

## How it works
Walking the session snapshots of `ctx.sessionPersistence` (`listSnapshots` /
`list`), reading events through `inspect` / `readFrom`, folding the token
fields of `assistant/message` and `assistant/chunk(usage)` events, attributed
to the active provider/model from `request/header`.

## API

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/dsh-usage-stats/api` | Overview (`?refresh=1` forces a rescan) |
| `POST` | `/dsh-usage-stats/api/prices` | Persist price/rate settings |

The overview payload carries `total`, `byModel` (each with `byDay`), `byDay`,
`sessionCount`, `generatedAt`, `prices` and `refreshing`.

## Requirements

- Host services: `webServer`, `sessionPersistence`, `sessionProjectionCache`.
- Runtime peer: `cordis` (`>=4.0.0-rc <5`).

## License

BSD-3-Clause
