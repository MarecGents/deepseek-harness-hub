/**
 * Terminal preferences — font size, color theme and default shell for the PTY
 * dock, persisted to localStorage under `dsh-hub:terminal-prefs`. Survives
 * reloads; lives in its own module so the dock and any future settings surface
 * share one store.
 *
 * Client plugin module (settings store). Public API:
 *   subscribePrefs / getPrefs / usePrefs — external-store access
 *   setFontSize(n)  — clamp 9..24, persist, notify
 *   toggleTheme()   — flip dark/light, persist, notify
 *   setShell(id)    — default shell for new PTY tabs, persist, notify
 */
import { useSyncExternalStore } from 'react'

/** Client-side mirror of the host ShellId union (the client bundle cannot
 * import the host service module). */
export type ShellId = 'powershell' | 'pwsh' | 'cmd' | 'bash'

export interface TerminalPrefs { fontSize: number; dark: boolean; shell: ShellId }

const KEY = 'dsh-hub:terminal-prefs'
/** Legacy dot-separated key — migrated to KEY once (idempotent). */
const LEGACY_KEY = 'dsh-hub.terminal.prefs'
const listeners = new Set<() => void>()

/** Read the persisted prefs, migrating the legacy key on first load. */
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

/** Load persisted prefs; corrupt or unreadable storage falls back to defaults. */
function load(): TerminalPrefs {
  const raw = readStored()
  if (raw === null) return { fontSize: 13, dark: true, shell: 'powershell' }
  try {
    const p = JSON.parse(raw) as Partial<TerminalPrefs>
    return { fontSize: p.fontSize ?? 13, dark: p.dark ?? true, shell: p.shell ?? 'powershell' }
  } catch {
    // Corrupt JSON or storage blocked — defaults are fine.
  }
  return { fontSize: 13, dark: true, shell: 'powershell' }
}

let prefs: TerminalPrefs = load()

function emit(): void { for (const l of listeners) l() }
function save(): void {
  try { localStorage.setItem(KEY, JSON.stringify(prefs)) } catch { /* Storage full/blocked — the host copy below still persists. */ }
  // Host-side persistence is the SOURCE OF TRUTH: dsh web binds a random port
  // per launch, so localStorage (keyed by origin incl. port) silently resets on
  // every relaunch. POST the choice to $DSH_HOME so it survives (Bug-3).
  const token = (globalThis as { __DSH_HUB_TOKEN__?: string }).__DSH_HUB_TOKEN__ ?? ''
  if (token === '') return
  void fetch('/api/dsh-hub/pty/prefs', {
    method: 'POST',
    headers: { 'content-type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify(prefs),
  }).catch(() => { /* best-effort; next sync heals */ })
}

/**
 * Load persisted prefs from the HOST (survives the random per-launch origin).
 * Called once at assembly; the host value wins over the (possibly stale)
 * localStorage copy, then the dock re-renders.
 */
export async function syncHostPrefs(): Promise<void> {
  const token = (globalThis as { __DSH_HUB_TOKEN__?: string }).__DSH_HUB_TOKEN__ ?? ''
  if (token === '') return
  try {
    const res = await fetch('/api/dsh-hub/pty/prefs', { headers: { Authorization: 'Bearer ' + token } })
    if (!res.ok) return
    const body = (await res.json()) as { ok?: boolean; prefs?: Partial<TerminalPrefs> }
    if (body.ok !== true || body.prefs === undefined) return
    const p = body.prefs
    const next: TerminalPrefs = {
      fontSize: typeof p.fontSize === 'number' ? p.fontSize : prefs.fontSize,
      dark: typeof p.dark === 'boolean' ? p.dark : prefs.dark,
      shell: p.shell ?? prefs.shell,
    }
    if (next.fontSize !== prefs.fontSize || next.dark !== prefs.dark || next.shell !== prefs.shell) {
      prefs = next
      emit()
    }
  } catch {
    // Host unreachable (early boot) — the localStorage copy is fine for now.
  }
}

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

/**
 * Set the default shell for NEW PTY tabs and persist it. The host validates
 * availability on create; the caller (dock settings) only offers shells the
 * availability probe reported.
 * @param id - one of the detected shell ids.
 */
export function setShell(id: ShellId): void {
  if (prefs.shell === id) return
  prefs = { ...prefs, shell: id }
  save()
  emit()
}
