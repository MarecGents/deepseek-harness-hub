import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, writeFileSync, existsSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

// dsh-usage-stats computes its storage paths (price/cache files) from
// process.env.DSH_HOME at module load, so the env var must be pointed at a
// throwaway home BEFORE the module is imported (dynamic import below).
const testHome = mkdtempSync(join(tmpdir(), 'dsh-usage-stats-test-'))
process.env.DSH_HOME = testHome
process.on('exit', () => rmSync(testHome, { recursive: true, force: true }))

const { __internals } = await import('../lib/index.js')
const {
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
} = __internals

const pricePath = join(testHome, 'storages', 'dsh-usage-stats-prices.json')

describe('__internals', () => {
  it('exposes all helpers as non-undefined values', () => {
    const entries = {
      zero, addUsage, dayOf, foldEvents, fingerprint, totalsOf,
      foldSession, mergeFolded, mapLimit, loadPrices, savePrices,
    }
    for (const [name, value] of Object.entries(entries)) {
      assert.notEqual(value, undefined, `__internals.${name} is undefined`)
    }
  })
})

describe('zero', () => {
  it('returns an all-zero counter object', () => {
    assert.deepEqual(zero(), { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 })
  })

  it('returns a fresh object each call', () => {
    assert.notEqual(zero(), zero())
  })
})

describe('addUsage', () => {
  it('accumulates into totals, byModel and byDay', () => {
    const totals = zero()
    const byModel = new Map()
    const byDay = new Map()
    addUsage({ inputTokens: 10, outputTokens: 5, cacheReadTokens: 2, cacheWriteTokens: 1 },
      'deepseek', 'kimi-k3', totals, byModel, byDay, '2026-09-02')
    addUsage({ inputTokens: 1 }, 'deepseek', 'kimi-k3', totals, byModel, byDay, '2026-09-02')

    assert.deepEqual(totals, { input: 11, output: 5, cacheRead: 2, cacheWrite: 1 })
    const m = byModel.get('deepseek/kimi-k3')
    assert.equal(m.requests, 2)
    assert.equal(m.input, 11)
    assert.equal(m.dayMap.get('2026-09-02').requests, 2)
    const d = byDay.get('2026-09-02')
    assert.equal(d.requests, 2)
    assert.equal(d.input, 11)
  })

  it('defaults missing usage fields to 0 and tolerates null usage', () => {
    const totals = zero()
    const byModel = new Map()
    const byDay = new Map()
    addUsage(null, 'p', 'm', totals, byModel, byDay, '2026-09-02')
    addUsage({}, 'p', 'm', totals, byModel, byDay, '2026-09-02')
    assert.deepEqual(totals, { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 })
    assert.equal(byModel.get('p/m').requests, 2)
  })

  it('uses ? / unknown placeholders for missing provider/model', () => {
    const byModel = new Map()
    addUsage({ inputTokens: 3 }, null, null, zero(), byModel, new Map(), '2026-09-02')
    assert.ok(byModel.has('?/unknown'))
  })

  it('skips byDay buckets when no date is given', () => {
    const byDay = new Map()
    addUsage({ inputTokens: 3 }, 'p', 'm', zero(), new Map(), byDay, null)
    assert.equal(byDay.size, 0)
  })
})

describe('dayOf', () => {
  it('formats a timestamp as local YYYY-MM-DD', () => {
    const ms = new Date(2026, 8, 2, 12, 0, 0).getTime() // local noon: TZ-safe
    assert.equal(dayOf(ms), '2026-09-02')
  })

  it('pads month and day to two digits', () => {
    const ms = new Date(2026, 0, 5, 12).getTime()
    assert.equal(dayOf(ms), '2026-01-05')
  })

  it('falls back to the epoch for non-numeric input (valid date format)', () => {
    assert.match(dayOf('abc'), /^\d{4}-\d{2}-\d{2}$/)
  })
})

describe('foldEvents', () => {
  it('attributes usage to the model set by the last request/header event', () => {
    const totals = zero()
    const byModel = new Map()
    const byDay = new Map()
    const events = [
      { type: 'request/header', time: 1, data: { header: { config: { provider: 'deepseek', model: 'kimi-k3' } } } },
      { type: 'assistant/message', time: 2, data: { usage: { inputTokens: 7, outputTokens: 3 } } },
    ]
    foldEvents(events, totals, byModel, byDay)
    assert.deepEqual(totals, { input: 7, output: 3, cacheRead: 0, cacheWrite: 0 })
    assert.ok(byModel.has('deepseek/kimi-k3'))
  })

  it('picks up usage from assistant/chunk events', () => {
    const totals = zero()
    const byModel = new Map()
    const events = [
      { type: 'request/header', time: 1, data: { header: { config: { provider: 'p', model: 'm' } } } },
      { type: 'assistant/chunk', time: 2, data: { chunk: { type: 'usage', usage: { inputTokens: 4 } } } },
    ]
    foldEvents(events, totals, byModel, new Map())
    assert.equal(totals.input, 4)
  })

  it('a later request/header re-attributes subsequent usage', () => {
    const byModel = new Map()
    const events = [
      { type: 'request/header', time: 1, data: { header: { config: { provider: 'a', model: 'one' } } } },
      { type: 'assistant/message', time: 2, data: { usage: { inputTokens: 1 } } },
      { type: 'request/header', time: 3, data: { header: { config: { provider: 'a', model: 'two' } } } },
      { type: 'assistant/message', time: 4, data: { usage: { inputTokens: 2 } } },
    ]
    foldEvents(events, zero(), byModel, new Map())
    assert.equal(byModel.get('a/one').input, 1)
    assert.equal(byModel.get('a/two').input, 2)
  })

  it('ignores irrelevant/malformed events without throwing', () => {
    const totals = zero()
    foldEvents([null, {}, { type: 'session/other' }], totals, new Map(), new Map())
    assert.deepEqual(totals, zero())
  })
})

describe('fingerprint', () => {
  it('is order-independent and includes id:revision pairs', () => {
    const a = { header: { id: 's1' }, revision: 3 }
    const b = { header: { id: 's2' }, revision: 9 }
    assert.equal(fingerprint([a, b]), fingerprint([b, a]))
    assert.match(fingerprint([a, b]), /^v4\|/)
    assert.equal(fingerprint([a, b]).includes('s1:3'), true)
    assert.equal(fingerprint([a, b]).includes('s2:9'), true)
  })

  it('changes when a revision changes', () => {
    const a = { header: { id: 's1' }, revision: 1 }
    assert.notEqual(fingerprint([a]), fingerprint([{ header: { id: 's1' }, revision: 2 }]))
  })

  it('returns the empty prefix for an empty snapshot list', () => {
    assert.equal(fingerprint([]), 'v4|')
  })
})

describe('totalsOf', () => {
  it('sums all four token counters', () => {
    assert.equal(totalsOf({ input: 1, output: 2, cacheRead: 3, cacheWrite: 4 }), 10)
    assert.equal(totalsOf(zero()), 0)
  })
})

describe('foldSession', () => {
  it('returns a serializable record (no Map leak)', () => {
    const events = [
      { type: 'request/header', time: 1, data: { header: { config: { provider: 'p', model: 'm' } } } },
      { type: 'assistant/message', time: 2, data: { usage: { inputTokens: 5, outputTokens: 2 } } },
    ]
    const folded = foldSession(events)
    assert.deepEqual(folded.totals, { input: 5, output: 2, cacheRead: 0, cacheWrite: 0 })
    assert.ok(Array.isArray(folded.byModel))
    assert.ok(Array.isArray(folded.byDay))
    assert.equal(folded.byModel.length, 1)
    assert.equal(folded.byModel[0].provider, 'p')
    assert.equal(folded.byModel[0].model, 'm')
    assert.equal(folded.byModel[0].requests, 1)
    assert.equal('dayMap' in folded.byModel[0], false)
    // JSON round-trip must not lose information
    assert.equal(JSON.parse(JSON.stringify(folded.byDay)).length, 1)
  })

  it('yields empty aggregates for an empty event list', () => {
    const folded = foldSession([])
    assert.deepEqual(folded.totals, zero())
    assert.deepEqual(folded.byModel, [])
    assert.deepEqual(folded.byDay, [])
  })
})

describe('mergeFolded', () => {
  it('merges per-session records into the global aggregation', () => {
    const events1 = [
      { type: 'request/header', time: 1, data: { header: { config: { provider: 'p', model: 'm' } } } },
      { type: 'assistant/message', time: 2, data: { usage: { inputTokens: 5 } } },
    ]
    const events2 = [
      { type: 'request/header', time: 1, data: { header: { config: { provider: 'p', model: 'm' } } } },
      { type: 'assistant/message', time: 2, data: { usage: { inputTokens: 7, outputTokens: 1 } } },
    ]
    const totals = zero()
    const byModel = new Map()
    const byDay = new Map()
    mergeFolded(foldSession(events1), totals, byModel, byDay)
    mergeFolded(foldSession(events2), totals, byModel, byDay)
    assert.deepEqual(totals, { input: 12, output: 1, cacheRead: 0, cacheWrite: 0 })
    assert.equal(byModel.get('p/m').requests, 2)
    assert.equal(byDay.size, 1)
    assert.equal([...byDay.values()][0].input, 12)
  })
})

describe('mapLimit', () => {
  it('preserves result order regardless of completion order', async () => {
    const results = await mapLimit([30, 10, 20], 3, async (ms) => {
      await new Promise((r) => setTimeout(r, ms))
      return ms * 2
    })
    assert.deepEqual(results, [60, 20, 40])
  })

  it('never exceeds the concurrency cap', async () => {
    let active = 0
    let maxActive = 0
    await mapLimit([1, 2, 3, 4, 5, 6, 7, 8], 2, async () => {
      active += 1
      maxActive = Math.max(maxActive, active)
      await new Promise((r) => setTimeout(r, 5))
      active -= 1
    })
    assert.equal(maxActive <= 2, true)
  })

  it('handles an empty list and a limit larger than the list', async () => {
    assert.deepEqual(await mapLimit([], 4, async (x) => x), [])
    assert.deepEqual(await mapLimit([1, 2], 100, async (x) => x + 1), [2, 3])
  })
})

describe('loadPrices / savePrices', () => {
  it('returns defaults when no price file exists', async () => {
    assert.deepEqual(await loadPrices(), { modelPrices: {}, exchangeRate: 7.2 })
  })

  it('round-trips a saved price config through disk', async () => {
    const draft = { modelPrices: { 'kimi-k3': { currency: 'CNY', input: 1 } }, exchangeRate: 6.5 }
    const saved = await savePrices(draft)
    assert.deepEqual(saved, draft)
    assert.equal(existsSync(pricePath), true)
    assert.deepEqual(await loadPrices(), draft)
    // persisted JSON must match what was saved
    assert.deepEqual(JSON.parse(readFileSync(pricePath, 'utf8')), draft)
  })

  it('sanitizes invalid drafts on save (bad rate / bad modelPrices)', async () => {
    assert.deepEqual(await savePrices({ modelPrices: 'nope', exchangeRate: -1 }),
      { modelPrices: {}, exchangeRate: 7.2 })
    assert.deepEqual(await savePrices(null), { modelPrices: {}, exchangeRate: 7.2 })
  })

  it('falls back to defaults for a corrupt price file', async () => {
    writeFileSync(pricePath, '{ this is not json', 'utf8')
    assert.deepEqual(await loadPrices(), { modelPrices: {}, exchangeRate: 7.2 })
  })

  it('falls back to defaults when the stored exchangeRate is not positive', async () => {
    writeFileSync(pricePath, JSON.stringify({ modelPrices: { x: {} }, exchangeRate: 0 }), 'utf8')
    assert.deepEqual(await loadPrices(), { modelPrices: {}, exchangeRate: 7.2 })
  })
})
