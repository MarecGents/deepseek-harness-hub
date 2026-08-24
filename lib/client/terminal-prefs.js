/**
 * Terminal preferences (font size + theme), persisted to localStorage.
 */
import { useSyncExternalStore } from 'react';
const KEY = 'dsh-hub.terminal.prefs';
const listeners = new Set();
function load() {
    try {
        const raw = localStorage.getItem(KEY);
        if (raw) {
            const p = JSON.parse(raw);
            return { fontSize: p.fontSize ?? 13, dark: p.dark ?? true };
        }
    }
    catch { /* ignore */ }
    return { fontSize: 13, dark: true };
}
let prefs = load();
function emit() { for (const l of listeners)
    l(); }
function save() { try {
    localStorage.setItem(KEY, JSON.stringify(prefs));
}
catch { /* ignore */ } }
export function subscribePrefs(cb) { listeners.add(cb); return () => { listeners.delete(cb); }; }
export function getPrefs() { return prefs; }
export function usePrefs() { return useSyncExternalStore(subscribePrefs, () => prefs); }
export function setFontSize(n) { prefs = { ...prefs, fontSize: Math.max(9, Math.min(24, n)) }; save(); emit(); }
export function toggleTheme() { prefs = { ...prefs, dark: !prefs.dark }; save(); emit(); }
