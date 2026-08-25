export type ShellId = 'powershell' | 'pwsh' | 'cmd' | 'bash';
/** One detected shell candidate (mirror of the host's detectShells output). */
export interface ShellInfo {
    id: ShellId;
    name: string;
    available: boolean;
    path?: string;
}
export interface PtyTab {
    id: string;
    shell: string;
    shellId: ShellId;
    cwd: string;
    title: string;
    alive: boolean;
}
interface State {
    visible: boolean;
    tabs: PtyTab[];
    activeId: string | null;
    outputs: Record<string, string>;
    /** Detected shells (only available ones are offered in the settings). */
    shells: ShellInfo[];
    /** Transient user-facing hint (e.g. a failed close), rendered by the dock. */
    notice: string | null;
}
/**
 * Subscribe to store changes.
 * @returns an unsubscribe function.
 */
export declare function subscribePty(cb: () => void): () => void;
/**
 * React hook: select a slice of the PTY panel state.
 * @param sel - selector over the store state.
 */
export declare function usePty<T>(sel: (s: State) => T): T;
/**
 * Fetch the shells available on this machine and reconcile the persisted
 * default against them (an unavailable default falls back to the first
 * available shell). Idempotent; called once at assembly.
 */
export declare function fetchShells(): Promise<void>;
/**
 * Bind the dsh client runtime so entry-cwd resolution can read the current
 * session's summary cwd (richest source). Call once from the assembly with
 * the client context; without it, resolution degrades to the page-global
 * `__mgGetCurrentWorkspace()` getter.
 */
export declare function bindPtyRuntime(ctx: unknown): void;
/**
 * Resolve the entry working directory for a new PTY tab: the current
 * session's summary cwd, then `__mgGetCurrentWorkspace()`, then '' (the host
 * picks its default). Used by the footer / Ctrl+J / "+" entry points.
 */
export declare function resolveEntryCwd(): string;
/**
 * Open the terminal panel and always create a fresh tab in the entry cwd —
 * "open terminal here" (right-click) must work even while the panel is open,
 * so there is deliberately no no-op guard here.
 * @param cwd - explicit working directory; defaults to {@link resolveEntryCwd}.
 */
export declare function ptyOpen(cwd?: string): Promise<void>;
/**
 * Create one PTY tab on the host and subscribe to its SSE stream.
 * @param cwd - explicit working directory; defaults to {@link resolveEntryCwd}.
 */
export declare function createTab(cwd?: string): Promise<void>;
/**
 * Close a PTY tab. The local tab is removed only after the host confirms
 * (`res.ok`); on failure the tab is kept and a hint is shown.
 */
export declare function closeTab(id: string): Promise<void>;
/** Activate a tab. */
export declare function setActiveTab(id: string): void;
/** Close the terminal panel (tabs stay alive in the background). */
export declare function ptyClosePanel(): void;
/**
 * Toggle the terminal panel (Ctrl+J). Opening creates a new tab.
 * @param cwd - explicit working directory; defaults to {@link resolveEntryCwd}.
 */
export declare function ptyToggle(cwd?: string): Promise<void>;
/**
 * Send raw terminal input (keystrokes) to the PTY via the per-tab write
 * queue; the queue coalesces 40 ms of input into one POST.
 */
export declare function ptySendRaw(id: string, data: string): void;
/** Resize a PTY session (cols/rows). */
export declare function ptyResizeClient(id: string, cols: number, rows: number): Promise<void>;
/**
 * Subscribe to raw output chunks for one tab. Immediately replays the current
 * buffered output (ring buffer), then pushes live chunks.
 * @returns an unsubscribe function.
 */
export declare function ptySubscribeData(id: string, cb: (chunk: string) => void): () => void;
/**
 * Retarget the active tab's working directory when the workspace switches:
 * update the tab label and run the shell-appropriate cd command in the live
 * session (each shell has its own syntax: PowerShell Set-Location, cmd /d,
 * bash plain cd — all handle the Windows path).
 */
export declare function ptyRetarget(cwd: string): Promise<void>;
export {};
