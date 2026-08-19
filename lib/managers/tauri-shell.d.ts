/**
 * Tauri desktop shell facade — Tauri 2.x replacement for desktop.ts.
 *
 * Provides the same {@link DesktopShellHandle} contract (minus WebView2-only
 * members like `app` / `window()`) by routing every operation through Tauri's
 * IPC `invoke` instead of the webviewjs native bindings.
 *
 * **Transport detection**:
 *  - When `window.__TAURI_INTERNALS__` exists (running inside a Tauri webview),
 *    commands go through the native IPC bridge directly.
 *  – When absent (e.g. dev-server detached from the Rust process), calls fall
 *    back to the HTTP bridge client in `src/bridge/tauri.ts` (T4.5).
 *
 * **Tauri command contracts** (Rust side, T4.8):
 *  - `set_window_theme`   – apply title-bar theme ('system' | 'light' | 'dark')
 *  - `set_window_size`    – resize window (width, height in logical pixels)
 *  - `get_workspace_path` – stub returning null (D4: page-initiated report)
 *  - `notify_task_complete` – show native notification (body, sessionId?)
 *
 * **Activation** (in src/index.ts, not changed here):
 * ```
 * import { openDesktopShellTauri } from './managers/tauri-shell.ts'
 * // ...
 * if (launchedByShortcut() && process.env.DSH_HUB_SHELL === 'tauri') {
 *   shell = openDesktopShellTauri(ctx, { ... }, onExit)
 * } else {
 *   shell = openDesktopShell(port, { ... }, onExit)
 * }
 * ```
 *
 * @module dsh-hub/tauri-shell
 * @category Manager (Shell)
 */
import type { TaskSoundKind } from '../models/sound.js';
/**
 * Options for the Tauri shell. Matches the subset of {@link DesktopOptions}
 * that does not depend on the WebView2 Application / BrowserWindow objects.
 */
export interface TauriShellOptions {
    /** Window title bar text (used for notification titles). */
    title: string;
    /** Initial window width in logical pixels (`undefined` = OS default). */
    width: number | undefined;
    /** Initial window height in logical pixels (`undefined` = OS default). */
    height: number | undefined;
    /** Title-bar theme: 'system' | 'light' | 'dark'. */
    theme: 'system' | 'light' | 'dark';
    /** Open the current workspace directory (tray "Open workspace"). */
    openWorkspace: () => void;
    /** Start a new task in the web UI (tray "New task"). */
    newTask: () => void;
    /** Live tray behavior read at every decision point. */
    getTrayBehavior: () => {
        minimizeToTray: boolean;
        closeToTray: boolean;
    };
}
/**
 * Handle returned by {@link openDesktopShellTauri}.
 *
 * Provides the same surface as {@link DesktopShellHandle} except for
 * WebView2-specific members (`app`, `window()`) which have no Tauri
 * equivalent exposed through this interface — the Tauri window API is
 * invoked directly through Rust commands.
 */
export interface TauriShellHandle {
    /**
     * Apply a title-bar theme now (from the settings card's theme select).
     * Delegates to the Tauri `set_window_theme` command (T4.8).
     */
    applyTheme(theme: 'system' | 'light' | 'dark'): void;
    /**
     * Apply a window size immediately (from the settings card's width/height).
     * Delegates to the Tauri `set_window_size` command (T4.8).
     */
    applySize(width: number, height: number): void;
    /**
     * Request the current session's workspace path from the shell.
     * In Tauri mode the page itself reports the path (D4), so this is a stub
     * that invokes `get_workspace_path` (T4.8) and returns null unless the
     * Rust side provides a cached value.
     */
    getCurrentWorkspacePath(cb: (path: string | null) => void): void;
    /**
     * Dispatch a custom event to the web page (tray → client-plugin bridge).
     * Uses `window.dispatchEvent(new CustomEvent(...))` — identical to
     * desktop.ts L511, no IPC round-trip needed since the page is in the
     * same webview context.
     */
    dispatchEvent(name: string, detail?: Record<string, unknown>): void;
    /**
     * Play a shell event sound via HTMLAudioElement (cross-platform, D3).
     * Replaces the Windows winmm.dll approach used by desktop.ts.
     */
    playSound(kind: TaskSoundKind): void;
    /**
     * Show a native notification for a completed task.
     * Delegates to the Tauri `notify_task_complete` command (T3.5) and also
     * plays a completion chime via HTMLAudio.
     */
    notifyTaskComplete(body: string, opts?: {
        sessionId?: string;
    }): void;
    /** Dispose the shell (release listeners, stop polling). */
    dispose(): void;
}
/** Shell event sound kind (mirrors models/sound.ts). */
export type { TaskSoundKind };
/**
 * Open the Tauri desktop shell.
 *
 * This is the Tauri 2.x replacement for {@link openDesktopShell}. It returns
 * a {@link TauriShellHandle} that routes all shell operations through Tauri
 * IPC commands instead of webviewjs native bindings.
 *
 * @param ctx    - The Cordis plugin context (unused in this implementation
 *                 but kept for signature compatibility with `openDesktopShell`).
 * @param options - Shell configuration resolved from the dsh plugin Config.
 * @param onExit  - Callback invoked when the shell requests an exit.
 * @returns       A handle to control the shell.
 */
export declare function openDesktopShellTauri(ctx: unknown, options: TauriShellOptions, onExit: () => void): TauriShellHandle;
