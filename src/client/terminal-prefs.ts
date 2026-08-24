/**
 * Terminal preferences — font size + color theme for the PTY dock, persisted
 * to localStorage under `dsh-hub.terminal.prefs`. Survives reloads; lives in
 * its own module so the dock and any future settings surface share one store.
 *
 * Client plugin module (settings store). Public API:
 *   subscribePrefs / getPrefs / usePrefs — external-store access
 *   setFontSize(n)  — clamp 9..24, persist, notify
 *   toggleTheme()   — flip dark/light, persist, notify
 */
import { useSyncExternalStore } from 'react'

export interface TerminalPrefs { fontSize: number; dark: boolean }

const KEY = 'dsh-hub.terminal.prefs'
const listeners = new Set<() => void>()

/** Load persisted prefs; corrupt or unreadable storage falls back to defaults. */
function load(): TerminalPrefs {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw !== null) {
      const p = JSON.parse(raw) as Partial<TerminalPrefs>
      return { fontSize: p.fontSize ?? 13, dark: p.dark ?? true }
    }
  } catch {
    // Corrupt JSON or storage blocked — defaults are fine.
  }
  return { fontSize: 13, dark: true }
}

let prefs: TerminalPrefs = load()

function emit(): void { for (const l of listeners) l() }
function save(): void { try { localStorage.setItem(KEY, JSON.stringify(prefs)) } catch { /* Storage full/blocked — in-memory value still applies. */ } }

/**
 * Subscribe to preference changes.
 * @returns an unsubscribe function.
 */
export function subscribePrefs(cb: () => void): () => void {
  listeners.add(cb)
  return () => { listeners.delete(cb) }
}

/** Current preference snapshot. */
export function getPrefs(): TerminalPrefs { return prefs }

/** React hook: subscribe to the current preferences. */
export function usePrefs(): TerminalPrefs { return useSyncExternalStore(subscribePrefs, () => prefs) }

/**
 * Set the terminal font size, clamped to the 9..24 range, and persist it.
 * @param n - requested font size (px).
 */
export function setFontSize(n: number): void {
  prefs = { ...prefs, fontSize: Math.max(9, Math.min(24, n)) }
  save()
  emit()
}

/** Toggle the terminal color theme (dark/light) and persist it. */
export function toggleTheme(): void {
  prefs = { ...prefs, dark: !prefs.dark }
  save()
  emit()
}
