/**
 * PTY client store — one real interactive PowerShell session per tab,
 * streamed from the host over SSE. Shared by the bottom-docked terminal
 * panel and the sidebar/button openers.
 */
import { useSyncExternalStore } from 'react'

export interface PtyTab { id: string; shell: string; cwd: string; title: string; alive: boolean }

interface State {
  visible: boolean;
  tabs: PtyTab[];
  activeId: string | null;
  outputs: Record<string, string>;
}

let state: State = { visible: false, tabs: [], activeId: null, outputs: {} };
const listeners = new Set<() => void>();
const streams = new Map<string, EventSource>();
const dataSubs = new Map<string, Set<(chunk: string) => void>>();

function emit(): void { for (const l of listeners) l() }
function set(patch: Partial<State>): void { state = { ...state, ...patch }; emit() }

export function subscribePty(cb: () => void): () => void { listeners.add(cb); return () => { listeners.delete(cb) } }
export function getPtyState(): State { return state }
export function usePty<T>(sel: (s: State) => T): T { return useSyncExternalStore(subscribePty, () => sel(state)) }

/** Strip ANSI escape sequences for plain-text display. */
export function stripAnsi(text: string): string { return text.replace(/\u001b\[[0-9;?]*[a-zA-Z]/g, '').replace(/\u001b\][^\u0007]*\u0007/g, '') }

function subscribeStream(tabId: string): void {
  if (streams.has(tabId)) return;
  const es = new EventSource('/api/dsh-hub/pty/stream?id=' + encodeURIComponent(tabId));
  streams.set(tabId, es);
  es.onmessage = (e) => {
    const chunk = String(e.data ?? '');
    set({ outputs: { ...state.outputs, [tabId]: (state.outputs[tabId] ?? '') + chunk } });
    for (const cb of dataSubs.get(tabId) ?? []) { try { cb(chunk) } catch { /* ignore */ } }
  };
  es.onerror = () => { es.close(); streams.delete(tabId); };
}

async function httpPost(path: string, body: unknown): Promise<{ ok?: boolean; tab?: PtyTab; tabs?: PtyTab[] }> {
  try {
    const res = await fetch(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    return (await res.json()) as { ok?: boolean; tab?: PtyTab; tabs?: PtyTab[] };
  } catch { return { ok: false } }
}

export async function ptyOpen(cwd?: string): Promise<void> {
  if (state.visible && state.tabs.length > 0) { emit(); return }
  set({ visible: true });
  if (state.tabs.length === 0) {
    await createTab(cwd);
  }
}

export async function createTab(cwd?: string): Promise<void> {
  const target = cwd || '';
  const res = await httpPost('/api/dsh-hub/pty/create', { cwd: target });
  if (res.ok && res.tab) {
    set({ tabs: [...state.tabs, res.tab], activeId: res.tab.id, outputs: { ...state.outputs, [res.tab.id]: '' } });
    subscribeStream(res.tab.id);
  }
}

export async function closeTab(id: string): Promise<void> {
  await httpPost('/api/dsh-hub/pty/close', { id });
  streams.get(id)?.close(); streams.delete(id);
  dataSubs.delete(id);
  const outputs = { ...state.outputs }; delete outputs[id];
  const tabs = state.tabs.filter((t) => t.id !== id);
  const activeId = state.activeId === id ? (tabs[0]?.id ?? null) : state.activeId;
  set({ tabs, activeId, outputs });
  if (tabs.length === 0) set({ visible: false });
}

export function setActiveTab(id: string): void { set({ activeId: id }) }
export function ptyClosePanel(): void { set({ visible: false }) }

/** Toggle the terminal panel (Ctrl+J). */
export async function ptyToggle(cwd?: string): Promise<void> {
  if (state.visible) { ptyClosePanel(); return }
  await ptyOpen(cwd);
}

export async function ptySendLine(id: string, line: string): Promise<void> {
  if (line === '') return;
  await httpPost('/api/dsh-hub/pty/write', { id, data: line + '\r' });
}

/** Send raw terminal input (keystrokes) to the PTY. */
export async function ptySendRaw(id: string, data: string): Promise<void> {
  if (data === '') return;
  await httpPost('/api/dsh-hub/pty/write', { id, data });
}

/** Resize a PTY session (cols/rows). */
export async function ptyResizeClient(id: string, cols: number, rows: number): Promise<void> {
  await httpPost('/api/dsh-hub/pty/resize', { id, cols, rows });
}

/**
 * Subscribe to raw output chunks for one tab. Immediately replays the current
 * buffered output, then pushes live chunks. Returns an unsubscribe function.
 */
export function ptySubscribeData(id: string, cb: (chunk: string) => void): () => void {
  let set = dataSubs.get(id);
  if (!set) { set = new Set(); dataSubs.set(id, set); }
  set.add(cb);
  const initial = state.outputs[id] ?? '';
  if (initial !== '') cb(initial);
  return () => { set.delete(cb); };
}

/**
 * Retarget the active tab's working directory when the workspace switches:
 * update the tab label and run Set-Location in the live PowerShell session.
 */
export async function ptyRetarget(cwd: string): Promise<void> {
  const id = state.activeId;
  if (!id || cwd === '') return;
  set({ tabs: state.tabs.map((t) => (t.id === id ? { ...t, cwd } : t)) });
  const escaped = cwd.replace(/'/g, "''");
  await httpPost('/api/dsh-hub/pty/write', { id, data: "Set-Location -LiteralPath '" + escaped + "'\r" });
}