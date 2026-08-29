# Changelog

All notable changes to this project are documented in this file.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.0.1] - 2026-08-24

### Added
- Host plugin: aggregates token usage across every session log
  (input / output / cache read / cache write) with totals, per-model and
  per-day breakdowns served at `/dsh-usage-stats/api` (`?refresh=1` forces
  a rescan).
- Background warm-up, debounced rescan on session events, incremental
  per-session cache keyed by snapshot revision, stale-while-revalidate reads.
- Settings-page UI: overview cards, per-provider/model usage cards with
  pinning, daily trend chart, editable per-model prices with USD/RMB display.
- `POST /dsh-usage-stats/api/prices` to persist price/rate settings.
- `dsh.bundle` manifest so the plugin installs with `dsh plugin add`.
