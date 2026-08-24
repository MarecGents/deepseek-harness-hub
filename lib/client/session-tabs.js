/**
 * Session tabs store — ordered list of open session 'tabs' (browser-like),
 * persisted to localStorage. Rendering/placement lives in SessionTabs.
 */
import { useSyncExternalStore } from 'react';
const KEY = 'dsh-hub.session-tabs';
const listeners = new Set();
function load() {
    try {
        const raw = localStorage.getItem(KEY);
        if (raw) {
            const arr = JSON.parse(raw);
            if (Array.isArray(arr))
                return arr.filter((x) => typeof x === 'string');
        }
    }
    catch {
        // Corrupt/blocked localStorage — start with an empty tab list.
    }
    return [];
}
let tabs = load();
function emit() { for (const l of listeners)
    l(); }
function save() { try {
    localStorage.setItem(KEY, JSON.stringify(tabs));
}
catch { /* storage full/unavailable — in-memory only */ } }
export function subscribeTabs(cb) { listeners.add(cb); return () => { listeners.delete(cb); }; }
export function getTabs() { return tabs; }
export function useTabs() { return useSyncExternalStore(subscribeTabs, () => tabs); }
export function tabAdd(id) { if (id !== '' && !tabs.includes(id)) {
    tabs = [...tabs, id];
    save();
    emit();
} }
export function tabRemove(id) { tabs = tabs.filter((x) => x !== id); save(); emit(); }
export function tabReplaceOrder(ids) { tabs = ids.filter((x) => typeof x === 'string'); save(); emit(); }
