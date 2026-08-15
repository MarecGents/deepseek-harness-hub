/**
 * Theme detection — the one place that knows how dsh signals light/dark.
 *
 * Two feeds feed one listener:
 *  1. Event-driven (primary): an injected MutationObserver watches
 *     `body[data-ds-dark-theme]` (written by dsh's ui-theme presenter) and
 *     reports every change through `window.ipc.postMessage` — zero polling
 *     latency, the same immediacy WPF UI's SystemThemeWatcher gives native
 *     apps.
 *  2. Polling (fallback): a steady probe keeps theme-following alive even if
 *     the observer injection failed or the page is not the dsh origin.
 *
 * The probe is numeric (1/0/-1), never string literals:
 * evaluateScriptWithCallback serializes a string result WITH its quotes
 * ('dark' -> "\"dark\""), which a trim() can never match — the detector read
 * every theme as light until this was changed.
 */
import type { JsWebview } from '@webviewjs/webview';
/** A consumer of theme changes (the window chrome, …). */
export type ThemeChangeListener = (dark: boolean) => void;
/** Contract for reading the page's dark-mode state. */
export interface ThemeDetector {
    /** Begin polling; invokes {@link listener} with the current state on change. */
    start(listener: ThemeChangeListener): void;
    /** Stop polling and release the timer. */
    stop(): void;
}
/** WebView2-backed {@link ThemeDetector} that reads dsh's theme marker. */
export declare class WebViewThemeDetector implements ThemeDetector {
    private readonly webview;
    private timer;
    private lastDark;
    private listener;
    private readonly onLoad;
    constructor(webview: JsWebview);
    start(listener: ThemeChangeListener): void;
    /** Handle one IPC message from the page (theme observer payloads only). */
    handleIpcMessage(message: {
        body: {
            toString(): string;
        };
    }): void;
    stop(): void;
    /** Emit only on a value change (observer messages and polls share one feed). */
    private emit;
    /** Install the MutationObserver in the current document (idempotent). */
    private injectObserver;
    private poll;
}
