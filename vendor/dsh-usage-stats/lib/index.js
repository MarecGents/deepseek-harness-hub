/**
 * @dsh-external/dsh-usage-stats — 用量统计（host）
 * 遍历所有会话日志（ctx.sessionPersistence），折叠每个 assistant 消息/usage
 * 分片上报的 token 用量，并按当前生效模型（request/header、request/context）
 * 归属，聚合出"总 token 用量 + 各模型用量"。
 * 暴露 webServer API：/dsh-usage-stats/api/overview（?refresh=1 强制后台重扫）
 *
 * 加载优化：
 *  - 后台预热：启动即后台扫描一次；会话变化（session/event、session/flush）时
 *    防抖触发后台重扫；并周期刷新。用户打开设置页时数据通常已就绪。
 *  - 陈旧即返回（stale-while-revalidate）：有缓存（哪怕过期）立即返回，
 *    同时后台刷新，避免打开时阻塞等待全量扫描。
 */
import { homedir } from 'node:os'
import { join, dirname } from 'node:path'
import { readFile, writeFile, mkdir } from 'node:fs/promises'

export const name = '@dsh-external/dsh-usage-stats'
export const inject = ['webServer', 'sessionPersistence', 'sessionProjectionCache']

const PRICE_FILE = join(homedir(), '.dsh', 'storages', 'dsh-usage-stats-prices.json')

async function loadPrices() {
  try {
    const t = await readFile(PRICE_FILE, 'utf8')
    const j = JSON.parse(t)
    if (j && typeof j === 'object') return j
  } catch { /* noop */ }
  return {}
}

async function savePrices(obj) {
  try {
    await mkdir(dirname(PRICE_FILE), { recursive: true })
    await writeFile(PRICE_FILE, JSON.stringify(obj ?? {}, null, 2), 'utf8')
  } catch { /* noop */ }
}

const CACHE_FILE = join(homedir(), '.dsh', 'storages', 'dsh-usage-stats.json')
const PER_SESSION_FILE = join(homedir(), '.dsh', 'storages', 'dsh-usage-stats-sessions.json')
const CACHE_TTL_MS = 5 * 60_000
const SCAN_CONCURRENCY = 12
// 会话变化后防抖触发后台重扫的延迟
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

// ── 简单磁盘缓存（keyed by 会话指纹），避免每次打开都全量重扫 ──
// 指纹基于 listSnapshots 的 id + revision：会话内容变化时 revision 变化，指纹随之变化。
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
  } catch { /* noop */ }
  return null
}

async function writeCache(key, data) {
  try {
    await mkdir(dirname(CACHE_FILE), { recursive: true })
    await writeFile(CACHE_FILE, JSON.stringify({ key, data }), 'utf8')
  } catch { /* noop */ }
}

// ── 增量缓存：按会话 id + revision 缓存折叠结果，只重扫变化的会话 ──
async function readPerSession() {
  try {
    const t = await readFile(PER_SESSION_FILE, 'utf8')
    const j = JSON.parse(t)
    if (j && typeof j === 'object') return j
  } catch { /* noop */ }
  return {}
}

async function writePerSession(obj) {
  try {
    await mkdir(dirname(PER_SESSION_FILE), { recursive: true })
    await writeFile(PER_SESSION_FILE, JSON.stringify(obj ?? {}), 'utf8')
  } catch { /* noop */ }
}

// 折叠单个会话的事件为可序列化的 per-session 记录
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

// 把 per-session 折叠结果合并进全局聚合
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

// 带并发上限的 map（不同会话的 inspect 走各自串行链，可安全并行）
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

// 纯扫描：只重扫「新增」或「revision 变化」的会话，合并出全局聚合。
// 返回 overview 并写入 per-session 增量缓存；聚合缓存由调用方负责。
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

// 只读官方 tokenUsage 投影（零 I/O）聚合全局 totals，不扫会话事件。
// 任一会话拿不到投影 checkpoint 时返回 null，由调用方回退（不阻塞冷启动）。
async function totalsFromProjection(ctx, snapshots) {
  const proj = ctx.sessionProjectionCache
  if (!proj || typeof proj.cachedSnapshot !== 'function') return null
  const totals = zero()
  let sessionCount = 0
  for (const s of snapshots) {
    let u = null
    try {
      u = proj.cachedSnapshot(s.header)?.values?.tokenUsage ?? null
    } catch { u = null }
    if (!u) return null
    totals.input += Number(u.uncachedInputTokens ?? 0)
    totals.output += Number(u.outputTokens ?? 0)
    totals.cacheRead += Number(u.cacheReadTokens ?? 0)
    totals.cacheWrite += Number(u.cacheWriteTokens ?? 0)
    sessionCount += 1
  }
  return { sessionCount, total: { ...totals, tokens: totals.input + totals.output + totals.cacheRead + totals.cacheWrite } }
}

// ── 后台预热 + 陈旧即返回（stale-while-revalidate）状态 ──
// 模块级单例：插件热重载时保留，避免重复扫描。
const state = { key: null, overview: null }
let refreshPromise = null
let refreshTimer = null

// 后台全量刷新：扫描 + 写聚合缓存 + 更新内存态。并发去重（同一时刻只跑一次）。
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

// 防抖调度后台刷新（会话变化时调用）
function scheduleBackgroundRefresh(ctx, delay = REFRESH_DEBOUNCE_MS) {
  if (refreshTimer) clearTimeout(refreshTimer)
  refreshTimer = setTimeout(() => {
    refreshTimer = null
    runBackgroundRefresh(ctx)
  }, delay)
}

// 对外读取：优先返回新鲜缓存；否则返回陈旧缓存并触发后台刷新；全无缓存才同步扫描。
async function getOverview(ctx, force) {
  const snapshots = await listSnapshots(ctx)
  const key = fingerprint(snapshots)
  const now = Date.now()

  // 快路径：内存态新鲜
  if (!force && state.key === key && state.overview && now - state.overview.generatedAt < CACHE_TTL_MS) {
    return { ...state.overview, refreshing: !!refreshPromise }
  }

  // 磁盘缓存新鲜
  if (!force) {
    const cached = await readCache(key)
    if (cached && now - cached.generatedAt < CACHE_TTL_MS) {
      state.key = key
      state.overview = cached
      return { ...cached, refreshing: !!refreshPromise }
    }
  }

  // 需要重扫：有陈旧数据则立即返回 + 后台刷新（不阻塞）
  const stale = (state.key === key ? state.overview : null) || (await readCache(key)) || state.overview
  if (stale) {
    scheduleBackgroundRefresh(ctx, 0)
    return { ...stale, refreshing: true }
  }

  // 完全无缓存（首次）：不阻塞请求，避免冷启动点开被全量扫描卡住。
  // ① 若所有会话的 tokenUsage 投影已就绪（零 I/O），立即返回 totals，
  //    模型/天明细由后台刷新补齐，前端轮询回填。
  const projTotals = await totalsFromProjection(ctx, snapshots)
  if (projTotals) {
    scheduleBackgroundRefresh(ctx, 0)
    return { ...projTotals, byModel: [], byDay: [], prices: await loadPrices(), refreshing: true }
  }
  // ② 投影未就绪：返回占位并触发后台刷新，由前端轮询在就绪后取全量。
  scheduleBackgroundRefresh(ctx, 0)
  return {
    generatedAt: Date.now(),
    sessionCount: 0,
    total: { ...zero(), tokens: 0 },
    byModel: [],
    byDay: [],
    prices: await loadPrices(),
    refreshing: true,
  }
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
  ctx.effect(() => {
    // 启动即后台预热，让用户打开设置页时数据已就绪
    runBackgroundRefresh(ctx)

    // 会话变化时防抖触发后台重扫
    const onSessionChange = () => scheduleBackgroundRefresh(ctx)
    const offEvent = ctx.on('session/event', onSessionChange)
    const offFlush = ctx.on('session/flush', onSessionChange)

    // 周期刷新，保持数据新鲜
    const periodic = setInterval(() => runBackgroundRefresh(ctx), CACHE_TTL_MS)

    const reg = ctx.webServer.register({
      kind: 'prefix',
      path: '/dsh-usage-stats/api',
      handler: async (req, res) => {
        const url = String(req?.url ?? '')
        const method = String(req?.method ?? 'GET').toUpperCase()
        try {
          if (/\/prices$/.test(url) && method === 'POST') {
            const body = await readBody(req)
            let obj = {}
            try { obj = JSON.parse(body || '{}') } catch { /* noop */ }
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

    return () => {
      if (refreshTimer) clearTimeout(refreshTimer)
      clearInterval(periodic)
      offEvent?.()
      offFlush?.()
      reg?.()
    }
  }, 'dsh-usage-stats: api')
}
