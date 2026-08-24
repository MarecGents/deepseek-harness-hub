/**
 * Terminal store — tiny module-scope shared state bridging the conversation
 * terminal dock (conversation.input.dock) and the right sidebar's
 * "在此打开终端" context-menu action. Both surfaces subscribe via the
 * useSyncExternalStore-compatible API and mutate through the exported actions.
 */
import { useSyncExternalStore } from 'react';
let state = { pageOpen: false, open: false, cwd: '', lines: [], running: false };
const listeners = new Set();
function emit() {
    for (const listener of listeners)
        listener();
}
function set(next) {
    state = { ...state, ...next };
    emit();
}
export function subscribeTerminal(listener) {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
}
export function getTerminalState() {
    return state;
}
export function useTerminalStore(select) {
    return useSyncExternalStore(subscribeTerminal, () => select(state));
}
/** Open the dock, optionally retargeting its cwd. */
export function terminalOpen(cwd) {
    set({ open: true, ...(cwd !== undefined ? { cwd } : {}) });
}
export function terminalClose() {
    set({ open: false });
}
/** Open the full-screen terminal page (sidebar 终端 entry). */
export function terminalPageOpen(cwd) {
    set({ pageOpen: true, open: true, ...(cwd !== undefined ? { cwd } : {}) });
}
export function terminalPageClose() {
    set({ pageOpen: false, open: false });
}
export function terminalSetCwd(cwd) {
    set({ cwd });
}
export function terminalClear() {
    set({ lines: [] });
}
function appendLines(extra) {
    return state.lines.concat(extra).filter(Boolean).slice(-500);
}
/** Run one command in the current cwd via the host exec route. */
export async function terminalRun(command) {
    const cwd = state.cwd || '';
    if (command.trim() === '' || cwd === '') {
        if (cwd === '')
            set({ lines: appendLines(['[终端] 未设置工作目录（先在某文件夹上“在此打开终端”）']) });
        return;
    }
    set({ running: true });
    try {
        const res = await fetch('/api/dsh-hub/terminal/exec', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ cwd, command }),
        });
        const body = (await res.json());
        const output = String(body?.output ?? '');
        const timedOut = body?.timedOut === true;
        const code = body?.code;
        const tail = ['$ ' + command];
        if (output !== '')
            tail.push(output);
        if (timedOut)
            tail.push('[超时]');
        else if (code !== null && code !== 0)
            tail.push('[exit ' + String(code) + ']');
        else if (body?.ok === false && body?.error)
            tail.push('[错误] ' + body.error);
        set({ running: false, lines: appendLines(tail) });
    }
    catch (error) {
        set({ running: false, lines: appendLines(['$ ' + command, String(error)]) });
    }
}
