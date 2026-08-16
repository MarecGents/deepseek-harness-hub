/**
 * Desktop shell facade — owns the application/window lifecycle and composes
 * the single-responsibility services (state store, theme sync, tray, icons).
 *
 * Startup choreography: the window opens the moment dsh's webserver is
 * ACTIVE (earliest possible — `webServer.port` only exists after listen),
 * paints a branded splash page themed to match dsh, then navigates to the
 * SPA after a short beat. WebView2 keeps the splash painted while the SPA
 * parses, so the whole boot shows one smooth animated surface instead of
 * white/dark flash frames or a dead blank.
 *
 * Tray behavior (per user requirement):
 *  - The system tray is always present while launched by this project.
 *  - minimizeToTray: minimizing the window hides it (taskbar entry
 *    disappears); only the tray can restore it.
 *  - closeToTray: closing the window keeps the process + tray alive; the
 *    tray's "Show main window" recreates the window. When disabled, closing
 *    quits the whole application.
 *  - Tray menu: Show main window / Open workspace / New task / Quit.
 *
 * Tray → page bridge: tray commands that need the web UI ("New task") are
 * dispatched into the page as custom window events. The browser half listens
 * and runs the official client flow, so the UI updates itself. The dispatch
 * retries until the page's listener signals ready (`__mgShellReady`),
 * covering the SPA still booting when the user clicks the tray.
 */
import { Application } from '@webviewjs/webview';
import type { BrowserWindow } from '@webviewjs/webview';
import { type TaskSoundKind } from './services/sound.js';
/** Shell options resolved from the dsh plugin Config schema. */
export interface DesktopOptions {
    /** Window title bar text. */
    title: string;
    /**
     * Default window width in logical pixels; `undefined` sizes the default
     * window to 3/4 of the launch screen (multi-monitor aware).
     */
    width: number | undefined;
    /** Default window height in logical pixels; see `width`. */
    height: number | undefined;
    /** Title-bar theme: 'system' (default) | 'light' | 'dark'. */
    theme: 'system' | 'light' | 'dark';
    /** Open the current workspace directory (tray "Open workspace"). */
    openWorkspace: () => void;
    /** Start a new task in the web UI (tray "New task"). */
    newTask: () => void;
    /**
     * Live tray behavior read at every decision point (minimize poll / close),
     * so toggling "minimize to tray" / "close to tray" in the settings card
     * takes effect without a restart.
     */
    getTrayBehavior: () => {
        minimizeToTray: boolean;
        closeToTray: boolean;
    };
}
/** Handle returned by {@link openDesktopShell}; call {@link DesktopShellHandle.dispose} to tear down. */
export interface DesktopShellHandle {
    /** The webview application instance. */
    readonly app: Application;
    /** The main browser window showing the dsh web UI (may be recreated). */
    window(): BrowserWindow | undefined;
    /**
     * Apply a title-bar theme now (from the settings card's theme select).
     * 'system' tracks the page's theme via polling; light/dark pin the chrome.
     */
    applyTheme(theme: 'system' | 'light' | 'dark'): void;
    /**
     * Apply a window size immediately (from the settings card's width/height).
     * If the window is maximized, it is un-maximized first and the persisted
     * maximized flag is cleared; the window then resizes to the requested size.
     */
    applySize(width: number, height: number): void;
    /**
     * Request the current session's workspace path from the page. The callback
     * receives the path, or null when the page cannot resolve one.
     */
    getCurrentWorkspacePath(cb: (path: string | null) => void): void;
    /**
     * Dispatch a custom event to the web page (tray → client-plugin bridge).
     * Retries until the page's listener signals ready, so a click during the
     * SPA boot is not lost.
     */
    dispatchEvent(name: string, detail?: Record<string, unknown>): void;
    /**
     * Play one shell event sound (question submitted / task complete / AI
     * approval / task error). Best-effort: a failed chime never breaks the
     * session loop.
     */
    playSound(kind: TaskSoundKind): void;
    /**
     * Show a native Windows notification (task-complete toast). Clicking it
     * restores the main window, so the user can jump straight back to the
     * finished conversation even when the window is hidden to the tray.
     *
     * Toast policy: suppressed only when the window is visible AND the
     * completed session is the one the user is currently looking at
     * (`opts.sessionId` matches the host's tracked focused session) — that
     * case already announces itself in the UI, and the sound alone suffices.
     * Hidden/minimized windows and background (non-focused) sessions still
     * toast, subject to the spam cooldown.
     */
    notifyTaskComplete(body: string, opts?: {
        sessionId?: string;
    }): void;
    /** Dispose the shell (tray, theme polling, event pump). */
    dispose(): void;
}
/**
 * Open the desktop shell for a running dsh web server.
 * @param port - the port dsh's webserver is listening on (from `ctx.webServer.port`).
 * @param options - shell options from plugin config.
 * @param onExit - invoked once when the application should quit (tray Quit, or
 *   window close with closeToTray disabled).
 */
export declare function openDesktopShell(port: number, options: DesktopOptions, onExit: () => void): DesktopShellHandle;
