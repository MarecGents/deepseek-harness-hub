/**
 * Session tabs store — ordered list of open session 'tabs' (browser-like),
 * persisted to localStorage. Rendering/placement lives in SessionTabs.
 */
import { useSyncExternalStore } from 'react';
const KEY = 'dsh-hub:session-tabs';
/** Legacy dot-separated key — migrated to KEY once (idempotent). */
const LEGACY_KEY = 'dsh-hub.session-tabs';
const listeners = new Set();
/** Read the persisted tabs, migrating the legacy key on first load. */
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
function load() {
    const raw = readStored();
    if (raw === null)
        return [];
    try {
        const arr = JSON.parse(raw);
        return Array.isArray(arr) ? arr.filter((x) => typeof x === 'string') : [];
    }
    catch {
        // Corrupt JSON — start with an empty tab list.
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
