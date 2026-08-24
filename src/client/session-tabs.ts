/**
 * Session tabs store — ordered list of open session 'tabs' (browser-like),
 * persisted to localStorage. Rendering/placement lives in SessionTabs.
 */
import { useSyncExternalStore } from 'react'

const KEY = 'dsh-hub.session-tabs';
const listeners = new Set<() => void>();

function load(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { const arr = JSON.parse(raw); if (Array.isArray(arr)) return arr.filter((x) => typeof x === 'string'); }
  } catch { /* ignore */ }
  return [];
}

let tabs = load();
function emit(): void { for (const l of listeners) l() }
function save(): void { try { localStorage.setItem(KEY, JSON.stringify(tabs)) } catch { /* ignore */ } }

export function subscribeTabs(cb: () => void): () => void { listeners.add(cb); return () => { listeners.delete(cb) } }
export function getTabs(): string[] { return tabs }
export function useTabs(): string[] { return useSyncExternalStore(subscribeTabs, () => tabs) }

export function tabAdd(id: string): void { if (id !== '' && !tabs.includes(id)) { tabs = [...tabs, id]; save(); emit() } }
export function tabRemove(id: string): void { tabs = tabs.filter((x) => x !== id); save(); emit() }
export function tabReplaceOrder(ids: string[]): void { tabs = ids.filter((x) => typeof x === 'string'); save(); emit() }