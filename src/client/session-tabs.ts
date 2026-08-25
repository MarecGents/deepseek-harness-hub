/**
 * Session tabs store — ordered list of open session 'tabs' (browser-like),
 * persisted to localStorage. Rendering/placement lives in SessionTabs.
 */
import { useSyncExternalStore } from 'react'

const KEY = 'dsh-hub:session-tabs'
/** Legacy dot-separated key — migrated to KEY once (idempotent). */
const LEGACY_KEY = 'dsh-hub.session-tabs'
const listeners = new Set<() => void>()

/** Read the persisted tabs, migrating the legacy key on first load. */
function readStored(): string | null {
  try {
    const current = localStorage.getItem(KEY)
    if (current !== null) return current
    const legacy = localStorage.getItem(LEGACY_KEY)
    if (legacy === null) return null
    // One-time migration: copy the legacy value to the canonical key, then
    // drop the old key. Any failure leaves it in place for the next load.
    try {
      localStorage.setItem(KEY, legacy)
      localStorage.removeItem(LEGACY_KEY)
    } catch {
      // Storage blocked — best-effort; the legacy value still reads back.
    }
    return legacy
  } catch {
    return null
  }
}

function load(): string[] {
  const raw = readStored()
  if (raw === null) return []
  try {
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr.filter((x) => typeof x === 'string') : []
  } catch {
    // Corrupt JSON — start with an empty tab list.
  }
  return []
}

let tabs = load()
function emit(): void { for (const l of listeners) l() }
function save(): void { try { localStorage.setItem(KEY, JSON.stringify(tabs)) } catch { /* storage full/unavailable — in-memory only */ } }

export function subscribeTabs(cb: () => void): () => void { listeners.add(cb); return () => { listeners.delete(cb) } }
export function getTabs(): string[] { return tabs }
export function useTabs(): string[] { return useSyncExternalStore(subscribeTabs, () => tabs) }

export function tabAdd(id: string): void { if (id !== '' && !tabs.includes(id)) { tabs = [...tabs, id]; save(); emit() } }
export function tabRemove(id: string): void { tabs = tabs.filter((x) => x !== id); save(); emit() }
export function tabReplaceOrder(ids: string[]): void { tabs = ids.filter((x) => typeof x === 'string'); save(); emit() }
