/**
 * PTY client store — one real interactive shell session per tab, streamed
 * from the host over SSE. Shared by the bottom-docked terminal panel
 * (terminal-dock.tsx) and the sidebar/button openers.
 *
 * Client plugin module (Manager-style store). Public API:
 *   bindPtyRuntime(ctx)   — plug the dsh client runtime for entry-cwd resolution
 *   subscribePty / usePty — external-store subscription over the panel state
 *   ptyOpen / ptyToggle   — open the panel (+ a tab) / toggle it
 *   createTab / closeTab  — tab lifecycle (close is server-confirmed)
 *   setActiveTab / ptyClosePanel
 *   ptySendRaw / ptyResizeClient — input + size reporting
 *   ptySubscribeData      — raw output chunks (replays the ring buffer)
 *   ptyRetarget           — follow a workspace switch with Set-Location
 *   resolveEntryCwd       — unified entry working directory for new tabs
 *
 * Transport contract (M4.2 host): POST /api/dsh-hub/pty/{create,close,write,resize}
 * and GET /api/dsh-hub/pty/stream?token=...&id=... (SSE). Every SSE frame is a
 * JSON envelope: `data: JSON.stringify(chunk)` where chunk is either a plain
 * output string or `{ data?: string, error?: string }`. Auth: the host injects
 * the token via the dsh `webserver/index-inject` event as a global
 * `__DSH_HUB_TOKEN__`; it is sent as `Authorization: Bearer` on fetch and as
 * `?token=` on the EventSource.
 *
 * Review fixes vs PR #40: JSON-decoded SSE envelope (heartbeats/comments
 * ignored), token auth, reconnect-kept on error (output reset before replay),
 * 512 KB per-tab output ring, per-tab serialized write queue with flush
 * batching, server-confirmed close, always-create on ptyOpen, unified entry
 * cwd, and dead helpers from the PR removed.
 */
import { useSyncExternalStore } from 'react';
import { getPrefs, setShell } from "./terminal-prefs.js";
/** Per-tab output cap — keep only the most recent 512 KB per tab. */
const RING_LIMIT = 512 * 1024;
/** Write-flush batching window (ms): keystrokes collected, then one POST. */
const WRITE_FLUSH_MS = 40;
let state = { visible: false, tabs: [], activeId: null, outputs: {}, shells: [], notice: null };
const listeners = new Set();
const streams = new Map();
const dataSubs = new Map();
/** Session-list snapshot accessor, plugged by {@link bindPtyRuntime}. */
let sessionsSnapshot = null;
/** dsh-hub auth token, read once from the injected global and cached. */
let cachedToken = null;
function emit() { for (const l of listeners)
    l(); }
function set(patch) { state = { ...state, ...patch }; emit(); }
/**
 * Resolve the auth token from the `__DSH_HUB_TOKEN__` global injected by the
 * host (`webserver/index-inject`); cached at module level after first read.
 */
function getToken() {
    if (cachedToken === null) {
        cachedToken = globalThis.__DSH_HUB_TOKEN__ ?? '';
    }
    return cachedToken;
}
/** Append a chunk to a tab's output ring buffer (last {@link RING_LIMIT}). */
function appendOutput(tabId, chunk) {
    const prev = state.outputs[tabId] ?? '';
    set({ outputs: { ...state.outputs, [tabId]: (prev + chunk).slice(-RING_LIMIT) } });
    // Fan out to raw-data subscribers (the xterm writer). The store update alone
    // never reaches them — without this the terminal stays blank and typed input
    // has no echo (Bug-1: "no PS prompt, cannot type").
    const subs = dataSubs.get(tabId);
    if (subs !== undefined) {
        for (const cb of Array.from(subs)) {
            try {
                cb(chunk);
            }
            catch {
                // A subscriber disposed mid-write (tab unmounted) — drop it.
            }
        }
    }
}
/**
 * Subscribe to store changes.
 * @returns an unsubscribe function.
 */
export function subscribePty(cb) {
    listeners.add(cb);
    return () => { listeners.delete(cb); };
}
/**
 * React hook: select a slice of the PTY panel state.
 * @param sel - selector over the store state.
 */
export function usePty(sel) {
    return useSyncExternalStore(subscribePty, () => sel(state));
}
/** POST JSON to a plugin route, carrying the Bearer token when present. */
async function httpPost(path, body) {
    try {
        const token = getToken();
        const headers = { 'content-type': 'application/json' };
        if (token !== '')
            headers['Authorization'] = 'Bearer ' + token;
        const res = await fetch(path, { method: 'POST', headers, body: JSON.stringify(body) });
        return (await res.json());
    }
    catch {
        // Network or JSON failure: report !ok so callers keep their local state.
        return { ok: false };
    }
}
/** GET JSON from a plugin route, carrying the Bearer token when present. */
async function httpGet(path) {
    try {
        const token = getToken();
        const headers = {};
        if (token !== '')
            headers['Authorization'] = 'Bearer ' + token;
        const res = await fetch(path, { method: 'GET', headers });
        return (await res.json());
    }
    catch {
        return { ok: false };
    }
}
/**
 * Fetch the shells available on this machine and reconcile the persisted
 * default against them (an unavailable default falls back to the first
 * available shell). Idempotent; called once at assembly.
 */
export async function fetchShells() {
    const res = await httpGet('/api/dsh-hub/pty/shells');
    const shells = Array.isArray(res.shells) ? res.shells.filter((s) => typeof s?.id === 'string') : [];
    if (shells.length === 0)
        return;
    set({ shells });
    const pref = getPrefs().shell;
    if (!shells.some((s) => s.id === pref && s.available)) {
        const first = shells.find((s) => s.available);
        if (first !== undefined && first.id !== pref)
            setShell(first.id);
    }
}
/**
 * Open one SSE stream per tab and feed {@link appendOutput} / dataSubs.
 * Non-fatal connection errors keep the EventSource auto-reconnect; only a
 * stream that never opened (404/401 — non-transient) is closed for good.
 */
function subscribeStream(tabId) {
    if (streams.has(tabId))
        return;
    const token = getToken();
    const url = '/api/dsh-hub/pty/stream?id=' + encodeURIComponent(tabId)
        + (token === '' ? '' : '&token=' + encodeURIComponent(token));
    const es = new EventSource(url);
    streams.set(tabId, es);
    let opened = false;
    es.onopen = () => { opened = true; };
    es.onmessage = (e) => {
        // Envelope: `data: JSON.stringify(chunk)`. Heartbeats/comments and
        // malformed frames throw here and are ignored — never terminal output.
        let payload;
        try {
            payload = JSON.parse(String(e.data ?? ''));
        }
        catch {
            return;
        }
        if (typeof payload === 'string') {
            appendOutput(tabId, payload);
            return;
        }
        if (payload !== null && typeof payload === 'object') {
            const frame = payload;
            if (typeof frame.error === 'string') {
                // Fatal server-side failure (session gone / auth) — stop the stream.
                es.close();
                streams.delete(tabId);
                set({ notice: frame.error });
                return;
            }
            if (typeof frame.data === 'string')
                appendOutput(tabId, frame.data);
        }
    };
    es.onerror = () => {
        if (!opened) {
            // Never connected: non-transient (404/401) — do not retry forever.
            es.close();
            streams.delete(tabId);
            set({ notice: '终端连接失败，请重试' });
            return;
        }
        // Transient failure: keep the EventSource auto-reconnect, but reset this
        // tab's replay buffer so a reconnect cannot replay stale output twice.
        set({ outputs: { ...state.outputs, [tabId]: '' } });
    };
}
const writeQueues = new Map();
/** Queue one input chunk; flushes run on a 40 ms batching window. */
function pushWrite(tabId, data) {
    if (data === '')
        return;
    const q = writeQueues.get(tabId) ?? { chain: Promise.resolve(), pending: '', timer: null };
    q.pending += data;
    writeQueues.set(tabId, q);
    if (q.timer === null)
        q.timer = setTimeout(() => { flushWrites(tabId); }, WRITE_FLUSH_MS);
}
/** Flush a tab's pending input as one POST, serialized per tab. */
function flushWrites(tabId) {
    const q = writeQueues.get(tabId);
    if (q === undefined)
        return;
    if (q.timer !== null) {
        clearTimeout(q.timer);
        q.timer = null;
    }
    const data = q.pending;
    q.pending = '';
    if (data === '')
        return;
    // Chain so a later flush never overtakes an in-flight write for this tab.
    q.chain = q.chain.then(() => httpPost('/api/dsh-hub/pty/write', { id: tabId, data }));
}
/**
 * Bind the dsh client runtime so entry-cwd resolution can read the current
 * session's summary cwd (richest source). Call once from the assembly with
 * the client context; without it, resolution degrades to the page-global
 * `__mgGetCurrentWorkspace()` getter.
 */
export function bindPtyRuntime(ctx) {
    const client = ctx;
    const getSnapshot = client?.sessions?.list?.getSnapshot;
    sessionsSnapshot = typeof getSnapshot === 'function' ? () => getSnapshot() : null;
}
/**
 * Resolve the entry working directory for a new PTY tab: the current
 * session's summary cwd, then `__mgGetCurrentWorkspace()`, then '' (the host
 * picks its default). Used by the footer / Ctrl+J / "+" entry points.
 */
export function resolveEntryCwd() {
    try {
        const snap = sessionsSnapshot?.();
        const id = snap?.current;
        const cwd = id === undefined || id === null ? undefined : snap?.byId?.[id]?.cwd;
        if (typeof cwd === 'string' && cwd !== '')
            return cwd;
    }
    catch {
        // Malformed runtime snapshot — fall through to the page-global getter.
    }
    const get = window.__mgGetCurrentWorkspace;
    try {
        const path = get?.();
        if (typeof path === 'string' && path !== '')
            return path;
    }
    catch {
        // Getter unavailable (assembly missing) — degrade to '' (host default).
    }
    return '';
}
/**
 * Open the terminal panel and always create a fresh tab in the entry cwd —
 * "open terminal here" (right-click) must work even while the panel is open,
 * so there is deliberately no no-op guard here.
 * @param cwd - explicit working directory; defaults to {@link resolveEntryCwd}.
 */
export async function ptyOpen(cwd) {
    set({ visible: true, notice: null });
    await createTab(cwd);
}
/**
 * Create one PTY tab on the host and subscribe to its SSE stream.
 * @param cwd - explicit working directory; defaults to {@link resolveEntryCwd}.
 */
export async function createTab(cwd) {
    const target = cwd ?? resolveEntryCwd();
    const res = await httpPost('/api/dsh-hub/pty/create', { cwd: target, shell: getPrefs().shell });
    if (res.ok === true && res.tab !== undefined) {
        set({
            tabs: [...state.tabs, res.tab],
            activeId: res.tab.id,
            outputs: { ...state.outputs, [res.tab.id]: '' },
            notice: null,
        });
        subscribeStream(res.tab.id);
        return;
    }
    set({ notice: res.error === 'shell-unavailable' ? '所选终端不可用' : '创建终端失败' });
}
/**
 * Close a PTY tab. The local tab is removed only after the host confirms
 * (`res.ok`); on failure the tab is kept and a hint is shown.
 */
export async function closeTab(id) {
    const res = await httpPost('/api/dsh-hub/pty/close', { id });
    if (res.ok !== true) {
        set({ notice: '关闭终端失败，请重试' });
        return;
    }
    streams.get(id)?.close();
    streams.delete(id);
    dataSubs.delete(id);
    const q = writeQueues.get(id);
    if (q !== undefined) {
        if (q.timer !== null)
            clearTimeout(q.timer);
        writeQueues.delete(id);
    }
    const outputs = { ...state.outputs };
    delete outputs[id];
    const tabs = state.tabs.filter((t) => t.id !== id);
    const activeId = state.activeId === id ? (tabs[0]?.id ?? null) : state.activeId;
    set({ tabs, activeId, outputs, notice: null });
    if (tabs.length === 0)
        set({ visible: false });
}
/** Activate a tab. */
export function setActiveTab(id) { set({ activeId: id }); }
/** Close the terminal panel (tabs stay alive in the background). */
export function ptyClosePanel() { set({ visible: false, notice: null }); }
/**
 * Toggle the terminal panel (Ctrl+J). Opening creates a new tab.
 * @param cwd - explicit working directory; defaults to {@link resolveEntryCwd}.
 */
export async function ptyToggle(cwd) {
    if (state.visible) {
        ptyClosePanel();
        return;
    }
    await ptyOpen(cwd);
}
/**
 * Send raw terminal input (keystrokes) to the PTY via the per-tab write
 * queue; the queue coalesces 40 ms of input into one POST.
 */
export function ptySendRaw(id, data) {
    pushWrite(id, data);
}
/** Resize a PTY session (cols/rows). */
export async function ptyResizeClient(id, cols, rows) {
    await httpPost('/api/dsh-hub/pty/resize', { id, cols, rows });
}
/**
 * Subscribe to raw output chunks for one tab. Immediately replays the current
 * buffered output (ring buffer), then pushes live chunks.
 * @returns an unsubscribe function.
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
 * update the tab label and run the shell-appropriate cd command in the live
 * session (each shell has its own syntax: PowerShell Set-Location, cmd /d,
 * bash plain cd — all handle the Windows path).
 */
export async function ptyRetarget(cwd) {
    const id = state.activeId;
    if (id === null || cwd === '')
        return;
    const tab = state.tabs.find((t) => t.id === id);
    set({ tabs: state.tabs.map((t) => (t.id === id ? { ...t, cwd } : t)) });
    const escaped = cwd.replace(/'/g, "''");
    const cmd = tab?.shellId === 'cmd'
        ? 'cd /d "' + cwd.replace(/"/g, '""') + '"\r'
        : tab?.shellId === 'bash'
            ? "cd '" + escaped + "'\r"
            : "Set-Location -LiteralPath '" + escaped + "'\r";
    pushWrite(id, cmd);
}
