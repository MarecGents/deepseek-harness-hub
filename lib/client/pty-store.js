/**
 * PTY client store — one real interactive PowerShell session per tab,
 * streamed from the host over SSE. Shared by the bottom-docked terminal
 * panel and the sidebar/button openers.
 */
import { useSyncExternalStore } from 'react';
let state = { visible: false, tabs: [], activeId: null, outputs: {} };
const listeners = new Set();
const streams = new Map();
const dataSubs = new Map();
function emit() { for (const l of listeners)
    l(); }
function set(patch) { state = { ...state, ...patch }; emit(); }
export function subscribePty(cb) { listeners.add(cb); return () => { listeners.delete(cb); }; }
export function getPtyState() { return state; }
export function usePty(sel) { return useSyncExternalStore(subscribePty, () => sel(state)); }
/** Strip ANSI escape sequences for plain-text display. */
export function stripAnsi(text) { return text.replace(/\u001b\[[0-9;?]*[a-zA-Z]/g, '').replace(/\u001b\][^\u0007]*\u0007/g, ''); }
function subscribeStream(tabId) {
    if (streams.has(tabId))
        return;
    const es = new EventSource('/api/dsh-hub/pty/stream?id=' + encodeURIComponent(tabId));
    streams.set(tabId, es);
    es.onmessage = (e) => {
        const chunk = String(e.data ?? '');
        set({ outputs: { ...state.outputs, [tabId]: (state.outputs[tabId] ?? '') + chunk } });
        for (const cb of dataSubs.get(tabId) ?? []) {
            try {
                cb(chunk);
            }
            catch { /* ignore */ }
        }
    };
    es.onerror = () => { es.close(); streams.delete(tabId); };
}
async function httpPost(path, body) {
    try {
        const res = await fetch(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
        return (await res.json());
    }
    catch {
        return { ok: false };
    }
}
export async function ptyOpen(cwd) {
    if (state.visible && state.tabs.length > 0) {
        emit();
        return;
    }
    set({ visible: true });
    if (state.tabs.length === 0) {
        await createTab(cwd);
    }
}
export async function createTab(cwd) {
    const target = cwd || '';
    const res = await httpPost('/api/dsh-hub/pty/create', { cwd: target });
    if (res.ok && res.tab) {
        set({ tabs: [...state.tabs, res.tab], activeId: res.tab.id, outputs: { ...state.outputs, [res.tab.id]: '' } });
        subscribeStream(res.tab.id);
    }
}
export async function closeTab(id) {
    await httpPost('/api/dsh-hub/pty/close', { id });
    streams.get(id)?.close();
    streams.delete(id);
    dataSubs.delete(id);
    const outputs = { ...state.outputs };
    delete outputs[id];
    const tabs = state.tabs.filter((t) => t.id !== id);
    const activeId = state.activeId === id ? (tabs[0]?.id ?? null) : state.activeId;
    set({ tabs, activeId, outputs });
    if (tabs.length === 0)
        set({ visible: false });
}
export function setActiveTab(id) { set({ activeId: id }); }
export function ptyClosePanel() { set({ visible: false }); }
/** Toggle the terminal panel (Ctrl+J). */
export async function ptyToggle(cwd) {
    if (state.visible) {
        ptyClosePanel();
        return;
    }
    await ptyOpen(cwd);
}
export async function ptySendLine(id, line) {
    if (line === '')
        return;
    await httpPost('/api/dsh-hub/pty/write', { id, data: line + '\r' });
}
/** Send raw terminal input (keystrokes) to the PTY. */
export async function ptySendRaw(id, data) {
    if (data === '')
        return;
    await httpPost('/api/dsh-hub/pty/write', { id, data });
}
/** Resize a PTY session (cols/rows). */
export async function ptyResizeClient(id, cols, rows) {
    await httpPost('/api/dsh-hub/pty/resize', { id, cols, rows });
}
/**
 * Subscribe to raw output chunks for one tab. Immediately replays the current
 * buffered output, then pushes live chunks. Returns an unsubscribe function.
 */
export function ptySubscribeData(id, cb) {
    let set = dataSubs.get(id);
    if (!set) {
        set = new Set();
        dataSubs.set(id, set);
    }
    set.add(cb);
    const initial = state.outputs[id] ?? '';
    if (initial !== '')
        cb(initial);
    return () => { set.delete(cb); };
}
/**
 * Retarget the active tab's working directory when the workspace switches:
 * update the tab label and run Set-Location in the live PowerShell session.
 */
export async function ptyRetarget(cwd) {
    const id = state.activeId;
    if (!id || cwd === '')
        return;
    set({ tabs: state.tabs.map((t) => (t.id === id ? { ...t, cwd } : t)) });
    const escaped = cwd.replace(/'/g, "''");
    await httpPost('/api/dsh-hub/pty/write', { id, data: "Set-Location -LiteralPath '" + escaped + "'\r" });
}
