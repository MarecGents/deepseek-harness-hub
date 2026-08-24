/**
 * Terminal preferences (font size + theme), persisted to localStorage.
 */
import { useSyncExternalStore } from 'react'

export interface TerminalPrefs { fontSize: number; dark: boolean }

const KEY = 'dsh-hub.terminal.prefs';
const listeners = new Set<() => void>();

function load(): TerminalPrefs {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { const p = JSON.parse(raw) as Partial<TerminalPrefs>; return { fontSize: p.fontSize ?? 13, dark: p.dark ?? true } }
  } catch { /* ignore */ }
  return { fontSize: 13, dark: true };
}

let prefs = load();
function emit(): void { for (const l of listeners) l() }
function save(): void { try { localStorage.setItem(KEY, JSON.stringify(prefs)) } catch { /* ignore */ } }

export function subscribePrefs(cb: () => void): () => void { listeners.add(cb); return () => { listeners.delete(cb) } }
export function getPrefs(): TerminalPrefs { return prefs }
export function usePrefs(): TerminalPrefs { return useSyncExternalStore(subscribePrefs, () => prefs) }

export function setFontSize(n: number): void { prefs = { ...prefs, fontSize: Math.max(9, Math.min(24, n)) }; save(); emit() }
export function toggleTheme(): void { prefs = { ...prefs, dark: !prefs.dark }; save(); emit() }