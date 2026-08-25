/**
 * Terminal preferences — font size + color theme for the PTY dock, persisted
 * to localStorage under `dsh-hub:terminal-prefs`. Survives reloads; lives in
 * its own module so the dock and any future settings surface share one store.
 *
 * Client plugin module (settings store). Public API:
 *   subscribePrefs / getPrefs / usePrefs — external-store access
 *   setFontSize(n)  — clamp 9..24, persist, notify
 *   toggleTheme()   — flip dark/light, persist, notify
 */
import { useSyncExternalStore } from 'react';
const KEY = 'dsh-hub:terminal-prefs';
/** Legacy dot-separated key — migrated to KEY once (idempotent). */
const LEGACY_KEY = 'dsh-hub.terminal.prefs';
const listeners = new Set();
/** Read the persisted prefs, migrating the legacy key on first load. */
function readStored() {
    try {
        const current = localStorage.getItem(KEY);
        if (current !== null)
            return current;
        const legacy = localStorage.getItem(LEGACY_KEY);
        if (legacy === null)
            return null;
        // One-time migration: copy the legacy value to the canonical key, then
        // drop the old key. Any failure leaves it in place for the next load.
        try {
            localStorage.setItem(KEY, legacy);
            localStorage.removeItem(LEGACY_KEY);
        }
        catch {
            // Storage blocked — best-effort; the legacy value still reads back.
        }
        return legacy;
    }
    catch {
        return null;
    }
}
/** Load persisted prefs; corrupt or unreadable storage falls back to defaults. */
function load() {
    const raw = readStored();
    if (raw === null)
        return { fontSize: 13, dark: true };
    try {
        const p = JSON.parse(raw);
        return { fontSize: p.fontSize ?? 13, dark: p.dark ?? true };
    }
    catch {
        // Corrupt JSON or storage blocked — defaults are fine.
    }
    return { fontSize: 13, dark: true };
}
let prefs = load();
function emit() { for (const l of listeners)
    l(); }
function save() { try {
    localStorage.setItem(KEY, JSON.stringify(prefs));
}
catch { /* Storage full/blocked — in-memory value still applies. */ } }
/**
 * Subscribe to preference changes.
 * @returns an unsubscribe function.
 */
export function subscribePrefs(cb) {
    listeners.add(cb);
    return () => { listeners.delete(cb); };
}
/** Current preference snapshot. */
export function getPrefs() { return prefs; }
/** React hook: subscribe to the current preferences. */
export function usePrefs() { return useSyncExternalStore(subscribePrefs, () => prefs); }
/**
 * Set the terminal font size, clamped to the 9..24 range, and persist it.
 * @param n - requested font size (px).
 */
export function setFontSize(n) {
    prefs = { ...prefs, fontSize: Math.max(9, Math.min(24, n)) };
    save();
    emit();
}
/** Toggle the terminal color theme (dark/light) and persist it. */
export function toggleTheme() {
    prefs = { ...prefs, dark: !prefs.dark };
    save();
    emit();
}
