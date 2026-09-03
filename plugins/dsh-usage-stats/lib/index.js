/**
 * @dsh-external/dsh-usage-stats — usage statistics (host half)
 *
 * Scans every session log (ctx.sessionPersistence), folds the per-assistant
 * message / usage-slice token counts, attributes them by the model effective
 * at request time (request/header, request/context) and aggregates "total
 * tokens + per-model breakdown". Exposes webServer API:
 * /dsh-usage-stats/api/overview (?refresh=1 forces a background rescan).
 *
 * Load optimizations:
 *  - Background preheat: one scan at startup, debounced background rescans on
 *    session changes (session/event, session/flush) and a periodic refresh —
 *    data is usually ready by the time the user opens the settings page.
 *  - Stale-while-revalidate: any cached overview (even stale) is returned
 *    immediately while a background refresh runs, so opening never blocks on
 *    a full scan.
 *
 * Headless safety: webServer is optional. Routes are registered only when a
 * server actually exists (ctx.get guard), so headless/CLI runs never pend on
 * the service and never touch the HTTP layer.
 */
import { homedir } from 'node:os'
import { join, dirname } from 'node:path'
import { readFile, writeFile, mkdir, rename } from 'node:fs/promises'

export const name = '@dsh-external/dsh-usage-stats'
// sessionPersistence is the required data source; webServer is optional and
// resolved via ctx.get() below so headless runs never pend on it.
export const inject = ['sessionPersistence']

// Resolve the dsh home root: $DSH_HOME takes precedence (it is the harness
// home root itself, e.g. C:\Users\<user>\.dsh), otherwise fall back to
// ~/.dsh — mirrors the hub's helpers/state-store.ts dshHome().
const home = (process.env.DSH_HOME && process.env.DSH_HOME.trim() !== '')
  ? process.env.DSH_HOME
  : join(homedir(), '.dsh')

const PRICE_FILE = join(home, 'storages', 'dsh-usage-stats-prices.json')
const CACHE_FILE = join(home, 'storages', 'dsh-usage-stats.json')
const PER_SESSION_FILE = join(home, 'storages', 'dsh-usage-stats-sessions.json')
const CACHE_TTL_MS = 5 * 60_000
const SCAN_CONCURRENCY = 12
// Debounce delay for the background rescan triggered by session changes.
const REFRESH_DEBOUNCE_MS = 3000

const zero = () => ({ input: 0, output: 0, cacheRead: 0, cacheWrite: 0 })

function addUsage(usage, provider, model, totals, byModel, byDay, date) {
  const u = usage ?? {}
  const input = Number(u.inputTokens ?? 0)
  const output = Number(u.outputTokens ?? 0)
  const cacheRead = Number(u.cacheReadTokens ?? 0)
  const cacheWrite = Number(u.cacheWriteTokens ?? 0)
  totals.input += input
  totals.output += output
  totals.cacheRead += cacheRead
  totals.cacheWrite += cacheWrite
  const p = provider || '?'
  const mName = model || 'unknown'
  const key = p + '/' + mName
  let m = byModel.get(key)
  if (!m) {
    m = { provider: p, model: mName, requests: 0, input: 0, output: 0, cacheRead: 0, cacheWrite: 0, dayMap: new Map() }
    byModel.set(key, m)
  }
  m.requests += 1
  m.input += input
  m.output += output
  m.cacheRead += cacheRead
  m.cacheWrite += cacheWrite
  if (date) {
    let md = m.dayMap.get(date)
    if (!md) {
      md = { date, requests: 0, input: 0, output: 0, cacheRead: 0, cacheWrite: 0 }
      m.dayMap.set(date, md)
    }
    md.requests += 1
    md.input += input
    md.output += output
    md.cacheRead += cacheRead
    md.cacheWrite += cacheWrite
  }
  if (date && byDay) {
    let d = byDay.get(date)
    if (!d) {
      d = { date, requests: 0, input: 0, output: 0, cacheRead: 0, cacheWrite: 0 }
      byDay.set(date, d)
    }
    d.requests += 1
    d.input += input
    d.output += output
    d.cacheRead += cacheRead
    d.cacheWrite += cacheWrite
  }
}

const pad2 = (n) => (n < 10 ? '0' : '') + n
function dayOf(ms) {
  const d = new Date(Number(ms) || 0)
  return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate())
}

function foldEvents(events, totals, byModel, byDay) {
  let provider = ''
  let model = ''
  for (const ev of events) {
    if (!ev || !ev.type) continue
    if (ev.type === 'request/header') {
      const cfg = ev.data?.header?.config
      if (cfg) {
        if (cfg.provider) provider = String(cfg.provider)
        if (cfg.model) model = String(cfg.model)
      }
    } else if (ev.type === 'assistant/message') {
      const usage = ev.data?.usage
      if (usage) addUsage(usage, provider, model, totals, byModel, byDay, dayOf(ev.time))
    } else if (ev.type === 'assistant/chunk') {
      const chunk = ev.data?.chunk
      if (chunk?.type === 'usage' && chunk?.usage) addUsage(chunk.usage, provider, model, totals, byModel, byDay, dayOf(ev.time))
    }
  }
}

// ── Simple disk cache (keyed by session fingerprint) so opening the
//    settings page never requires a full rescan. The fingerprint is derived
//    from listSnapshots id + revision: when session content changes, the
//    revision changes and the fingerprint changes with it. ──
function fingerprint(snapshots) {
  return 'v4|' + snapshots
    .map((s) => String(s?.header?.id ?? '') + ':' + String(s?.revision ?? ''))
    .sort()
    .join('|')
}

function totalsOf(m) {
  return m.input + m.output + m.cacheRead + m.cacheWrite
}

async function readCache(key) {
  try {
    const text = await readFile(CACHE_FILE, 'utf8')
    const j = JSON.parse(text)
    if (j && j.key === key && j.data) return j.data
  } catch { /* corrupt or missing cache file: treat as no cache */ }
  return null
}

// 2026-09-01 audit P1-6：所有落盘改 tmp + rename 原子写（崩溃不撕 JSON）。
async function writeCache(key, data) {
  try {
    await mkdir(dirname(CACHE_FILE), { recursive: true })
    const tmp = CACHE_FILE + '.tmp'
    await writeFile(tmp, JSON.stringify({ key, data }), 'utf8')
    await rename(tmp, CACHE_FILE)
  } catch { /* non-fatal: next read falls back to a rescan */ }
}

// ── Incremental cache: folded results keyed by session id + revision, so
//    only changed sessions are rescanned. ──
async function readPerSession() {
  try {
    const t = await readFile(PER_SESSION_FILE, 'utf8')
    const j = JSON.parse(t)
    if (j && typeof j === 'object') return j
  } catch { /* corrupt or missing cache file: start over */ }
  return {}
}

async function writePerSession(obj) {
  try {
    await mkdir(dirname(PER_SESSION_FILE), { recursive: true })
    const tmp = PER_SESSION_FILE + '.tmp'
    await writeFile(tmp, JSON.stringify(obj ?? {}), 'utf8')
    await rename(tmp, PER_SESSION_FILE)
  } catch { /* non-fatal: next scan recomputes */ }
}

// ── Unit-price overrides ──
// Persisted at $DSH_HOME/storages/dsh-usage-stats-prices.json. Missing or
// corrupt file → defaults (no per-model overrides + 7.2 CNY per USD,
// mirroring the settings UI's initial state). computeOverview embeds this in
// the overview payload and POST /api/prices persists the editor draft — both
// call sites predate these definitions (PR #34 shipped without them, which
// made every /api/overview request fail with `loadPrices is not defined`).
const DEFAULT_PRICES = Object.freeze({ modelPrices: {}, exchangeRate: 7.2 })

async function loadPrices() {
  try {
    const parsed = JSON.parse(await readFile(PRICE_FILE, 'utf8'))
    if (parsed && typeof parsed === 'object' && typeof parsed.exchangeRate === 'number' && parsed.exchangeRate > 0) {
      return {
        modelPrices: parsed.modelPrices && typeof parsed.modelPrices === 'object' ? parsed.modelPrices : {},
        exchangeRate: parsed.exchangeRate,
      }
    }
  } catch { /* missing or corrupt price file → defaults */ }
  return { ...DEFAULT_PRICES }
}

async function savePrices(obj) {
  const clean = {
    modelPrices: obj && obj.modelPrices && typeof obj.modelPrices === 'object' ? obj.modelPrices : {},
    exchangeRate: obj && typeof obj.exchangeRate === 'number' && obj.exchangeRate > 0
      ? obj.exchangeRate
      : DEFAULT_PRICES.exchangeRate,
  }
  await mkdir(dirname(PRICE_FILE), { recursive: true })
  const tmp = PRICE_FILE + '.tmp'
  await writeFile(tmp, JSON.stringify(clean, null, 2), 'utf8')
  await rename(tmp, PRICE_FILE)
  return clean
}

// Fold a single session's events into a serializable per-session record.
function foldSession(events) {
  const totals = zero()
  const byModel = new Map()
  const byDay = new Map()
  foldEvents(events, totals, byModel, byDay)
  return {
    totals,
    byModel: [...byModel.values()].map((m) => ({
      provider: m.provider, model: m.model, requests: m.requests,
      input: m.input, output: m.output, cacheRead: m.cacheRead, cacheWrite: m.cacheWrite,
      byDay: [...m.dayMap.values()],
    })),
    byDay: [...byDay.values()],
  }
}

// Merge a per-session folded record into the global aggregation.
function mergeFolded(folded, totals, byModel, byDay) {
  const t = folded.totals
  totals.input += t.input
  totals.output += t.output
  totals.cacheRead += t.cacheRead
  totals.cacheWrite += t.cacheWrite
  for (const m of folded.byModel) {
    const key = m.provider + '/' + m.model
    let acc = byModel.get(key)
    if (!acc) {
      acc = { provider: m.provider, model: m.model, requests: 0, input: 0, output: 0, cacheRead: 0, cacheWrite: 0, dayMap: new Map() }
      byModel.set(key, acc)
    }
    acc.requests += m.requests
    acc.input += m.input
    acc.output += m.output
    acc.cacheRead += m.cacheRead
    acc.cacheWrite += m.cacheWrite
    for (const d of m.byDay) {
      let md = acc.dayMap.get(d.date)
      if (!md) { md = { date: d.date, requests: 0, input: 0, output: 0, cacheRead: 0, cacheWrite: 0 }; acc.dayMap.set(d.date, md) }
      md.requests += d.requests
      md.input += d.input
      md.output += d.output
      md.cacheRead += d.cacheRead
      md.cacheWrite += d.cacheWrite
    }
  }
  for (const d of folded.byDay) {
    let acc = byDay.get(d.date)
    if (!acc) { acc = { date: d.date, requests: 0, input: 0, output: 0, cacheRead: 0, cacheWrite: 0 }; byDay.set(d.date, acc) }
    acc.requests += d.requests
    acc.input += d.input
    acc.output += d.output
    acc.cacheRead += d.cacheRead
    acc.cacheWrite += d.cacheWrite
  }
}

// Map with a concurrency cap (different sessions inspect on their own
// serial chains, so parallelizing is safe).
async function mapLimit(items, limit, fn) {
  const results = new Array(items.length)
  let i = 0
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++
      results[idx] = await fn(items[idx], idx)
    }
  })
  await Promise.all(workers)
  return results
}

async function listSnapshots(ctx) {
  if (typeof ctx.sessionPersistence.listSnapshots === 'function') {
    return await ctx.sessionPersistence.listSnapshots()
  }
  const headers = await ctx.sessionPersistence.list()
  return headers.map((h) => ({ header: h, revision: String(h?.createdAt ?? '') }))
}

// Pure scan: only rescans sessions that are new or whose revision changed,
// then merges the global aggregation. Returns the overview and writes the
// per-session incremental cache; the aggregate cache is the caller's job.
async function computeOverview(ctx, snapshots) {
  const perSession = await readPerSession()
  const totals = zero()
  const byModel = new Map()
  const byDay = new Map()
  let sessionCount = 0

  const changed = snapshots.filter((s) => {
    const prev = perSession[s.header.id]
    return !prev || prev.rev !== s.revision
  })

  const fresh = await mapLimit(changed, SCAN_CONCURRENCY, async (s) => {
    let events = []
    try {
      const insp = await ctx.sessionPersistence.inspect(s.header.id)
      events = insp?.events ?? []
    } catch {
      try {
        const raw = await ctx.sessionPersistence.readFrom(s.header.id, 0)
        events = raw?.events ?? []
      } catch { return null }
    }
    return { id: s.header.id, rev: s.revision, folded: foldSession(events) }
  })
  const freshById = new Map()
  for (const f of fresh) if (f) freshById.set(f.id, f)

  for (const s of snapshots) {
    const f = freshById.get(s.header.id)
    const source = f || perSession[s.header.id]
    if (!source) continue
    sessionCount += 1
    mergeFolded(source.folded, totals, byModel, byDay)
    perSession[s.header.id] = { rev: s.revision, folded: source.folded }
  }

  const liveIds = new Set(snapshots.map((s) => s.header.id))
  for (const id of Object.keys(perSession)) if (!liveIds.has(id)) delete perSession[id]
  await writePerSession(perSession)

  const byModelList = [...byModel.values()]
    .sort((a, b) => totalsOf(b) - totalsOf(a))
    .map((m) => {
      const byDayM = [...m.dayMap.values()]
        .sort((x, y) => (x.date < y.date ? -1 : x.date > y.date ? 1 : 0))
        .map((d) => ({ ...d, tokens: d.input + d.output + d.cacheRead + d.cacheWrite }))
      const { dayMap, ...rest } = m
      return { ...rest, byDay: byDayM }
    })
  const byDayList = [...byDay.values()]
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
    .map((d) => ({ ...d, tokens: d.input + d.output + d.cacheRead + d.cacheWrite }))
  return {
    generatedAt: Date.now(),
    sessionCount,
    total: { ...totals, tokens: totals.input + totals.output + totals.cacheRead + totals.cacheWrite },
    byModel: byModelList,
    byDay: byDayList,
    prices: await loadPrices(),
  }
}

// ── Background preheat + stale-while-revalidate state. Module-level
//    singleton: survives plugin hot reload so scans are not duplicated. ──
const state = { key: null, overview: null }
let refreshPromise = null
let refreshTimer = null

// Background full refresh: scan + write aggregate cache + update in-memory
// state. Concurrent calls are deduplicated (one run at a time).
async function runBackgroundRefresh(ctx) {
  if (refreshPromise) return refreshPromise
  refreshPromise = (async () => {
    try {
      const snapshots = await listSnapshots(ctx)
      const key = fingerprint(snapshots)
      const overview = await computeOverview(ctx, snapshots)
      await writeCache(key, overview)
      state.key = key
      state.overview = overview
    } catch (e) {
      ctx.logger?.warn?.('dsh-usage-stats background refresh failed: ' + String(e))
    } finally {
      refreshPromise = null
    }
  })()
  return refreshPromise
}

// Schedule a debounced background refresh (called on session changes).
function scheduleBackgroundRefresh(ctx, delay = REFRESH_DEBOUNCE_MS) {
  if (refreshTimer) clearTimeout(refreshTimer)
  refreshTimer = setTimeout(() => {
    refreshTimer = null
    runBackgroundRefresh(ctx)
  }, delay)
}

// Public read path: return the fresh cache when available; otherwise return
// stale data and trigger a background refresh; only when no cache exists at
// all does it fall back to a synchronous scan.
async function getOverview(ctx, force) {
  const snapshots = await listSnapshots(ctx)
  const key = fingerprint(snapshots)
  const now = Date.now()

  // Fast path: in-memory state is fresh.
  if (!force && state.key === key && state.overview && now - state.overview.generatedAt < CACHE_TTL_MS) {
    return { ...state.overview, refreshing: !!refreshPromise }
  }

  // Disk cache is fresh.
  if (!force) {
    const cached = await readCache(key)
    if (cached && now - cached.generatedAt < CACHE_TTL_MS) {
      state.key = key
      state.overview = cached
      return { ...cached, refreshing: !!refreshPromise }
    }
  }

  // Needs a rescan: if stale data exists, return it immediately and refresh
  // in the background (do not block the request).
  const stale = (state.key === key ? state.overview : null) || (await readCache(key)) || state.overview
  if (stale) {
    scheduleBackgroundRefresh(ctx, 0)
    return { ...stale, refreshing: true }
  }

  // No cache at all (first run): scan once synchronously.
  const overview = await computeOverview(ctx, snapshots)
  await writeCache(key, overview)
  state.key = key
  state.overview = overview
  return { ...overview, refreshing: false }
}

function readBody(req) {
  return new Promise((resolve) => {
    let b = ''
    req.on('data', (c) => { b += c })
    req.on('end', () => resolve(b))
    req.on('error', () => resolve(''))
  })
}

export function apply(ctx) {
  // webServer is optional: in headless runs (no server) we must not register
  // routes and must not pend on the service. ctx.get returns undefined when
  // the service is not provided, so the guard below is safe in both cases.
  const webServer = ctx.get('webServer', null)

  ctx.effect(() => {
    // Preheat at startup so data is ready when the settings page opens.
    runBackgroundRefresh(ctx)

    // Debounced background rescan when sessions change.
    const onSessionChange = () => scheduleBackgroundRefresh(ctx)
    const offEvent = ctx.on('session/event', onSessionChange)
    const offFlush = ctx.on('session/flush', onSessionChange)

    // Periodic refresh keeps the cached overview fresh.
    const periodic = setInterval(() => runBackgroundRefresh(ctx), CACHE_TTL_MS)

    // Register HTTP routes only when a web server is present (headless-safe).
    const reg = webServer
      ? webServer.register({
        kind: 'prefix',
        path: '/dsh-usage-stats/api',
        handler: async (req, res) => {
          const url = String(req?.url ?? '')
          const method = String(req?.method ?? 'GET').toUpperCase()
          try {
            if (/\/prices$/.test(url) && method === 'POST') {
              const body = await readBody(req)
              let obj = {}
              try { obj = JSON.parse(body || '{}') } catch { /* ignore malformed body */ }
              if (obj && typeof obj === 'object') await savePrices(obj)
              res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' })
              res.end(JSON.stringify({ ok: true, prices: obj }))
              return
            }
            const force = /refresh=1/.test(url)
            const data = await getOverview(ctx, force)
            res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' })
            res.end(JSON.stringify(data))
          } catch (e) {
            res.writeHead(500, { 'content-type': 'application/json; charset=utf-8' })
            res.end(JSON.stringify({ error: String(e) }))
          }
        },
      })
      : null

    return () => {
      if (refreshTimer) clearTimeout(refreshTimer)
      clearInterval(periodic)
      offEvent?.()
      offFlush?.()
      reg?.()
    }
  }, 'dsh-usage-stats: api')
}

// Test-only access to internal helpers (no runtime consumer).
export const __internals = {
  zero,
  addUsage,
  dayOf,
  foldEvents,
  fingerprint,
  totalsOf,
  foldSession,
  mergeFolded,
  mapLimit,
  loadPrices,
  savePrices,
}
