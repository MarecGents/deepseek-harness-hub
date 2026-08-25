/** One terminal tab as exposed to the client. */
export interface PtyTab {
    id: string;
    shell: 'PowerShell';
    cwd: string;
    title: string;
    createdAt: number;
    alive: boolean;
}
/**
 * Hard cap on concurrent PTY sessions. A token holder could otherwise spawn an
 * unbounded number of PowerShell processes (resource DoS); createPty throws
 * {@link PtyLimitReachedError} once the cap is hit and the HTTP route maps it
 * to the fixed `pty-limit-reached` code.
 */
export declare const SESSION_LIMIT = 16;
/** Thrown by {@link createPty} when the session quota is full. */
export declare class PtyLimitReachedError extends Error {
    constructor();
}
/**
 * Create a persistent PowerShell PTY tab rooted at `cwd`.
 *
 * The `Set-Location` command single-quotes the cwd with embedded quotes
 * doubled (`'` → `''`), so the path is passed literally and cannot be
 * re-parsed by PowerShell.
 *
 * @param cwd - absolute directory the shell starts in (caller validates).
 * @param cols - initial terminal columns (default 100).
 * @param rows - initial terminal rows (default 28).
 * @returns the new tab descriptor.
 * @throws {@link PtyLimitReachedError} when the session quota is full.
 * @throws when the PTY cannot be spawned (caller maps this to a 500).
 */
export declare function createPty(cwd: string, cols?: number, rows?: number): PtyTab;
/**
 * All live tabs (for the list route). The returned tab objects are live
 * references — the client should re-fetch after a close.
 * @returns the current tabs in creation order.
 */
export declare function listTabs(): PtyTab[];
/**
 * Look up one tab by id.
 * @returns the tab, or undefined when unknown or already closed.
 */
export declare function getTab(id: string): PtyTab | undefined;
/**
 * Write input to a session's PTY, refusing blocked commands (see
 * BLOCKED_CMDS). The input is scanned line by line (CRLF/CR/LF), matching
 * whole lines only, so a blocked command inside a longer line is not
 * rejected.
 *
 * @param id - the target session id.
 * @param data - raw terminal input to write.
 * @returns true when the input was accepted — or refused by the guardrail
 *   with a notice pushed to the stream; false when the session is
 *   unknown/dead or the write threw.
 */
export declare function ptyWrite(id: string, data: string): boolean;
/**
 * Resize a session's PTY.
 * @param id - the target session id.
 * @param cols - new column count (caller clamps).
 * @param rows - new row count (caller clamps).
 * @returns false when the session is unknown/dead or resize threw.
 */
export declare function ptyResize(id: string, cols: number, rows: number): boolean;
/**
 * Close a session: kill the process tree, notify subscribers, detach and
 * drop the session. Safe to call twice (the second call returns false).
 * @param id - the session to close.
 * @returns true when the session existed and was closed.
 */
export declare function ptyClose(id: string): boolean;
/**
 * Subscribe to a session's output; the current ring buffer is replayed to the
 * new subscriber first (line-boundary trimmed, see MAX_BUFFER).
 * @returns an unsubscribe function (a no-op for unknown sessions).
 */
export declare function ptySubscribe(id: string, cb: (chunk: string) => void): () => void;
/**
 * Close every live session — used by hot reload / plugin teardown so no
 * PowerShell process tree outlives the plugin. Also stops the idle reaper.
 */
export declare function disposeAll(): void;
