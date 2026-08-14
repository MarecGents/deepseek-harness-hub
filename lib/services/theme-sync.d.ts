/**
 * Theme detection — the one place that knows how dsh signals light/dark. It
 * polls the page's `data-ds-dark-theme` attribute (set by dsh's ui-theme
 * boot script and by any theme plugin that follows it) and calls back with
 * the current dark flag. (Verified implementation carried over from
 * mg-dsh-desktop; dsh-web-ui compatibility confirmed by source inspection.)
 *
 * The page probe is tri-state: the shell now shows its own splash page while
 * the SPA loads, and that page carries no theme marker — reporting it as
 * "light" would flash the title bar. The probe answers `na` for any page
 * that is not the dsh origin, and the detector stays silent until a real
 * theme answer arrives. Polling starts only after the first page load so the
 * boot phase (where the SPA parses its bundle) is not churned by probes.
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
    stop(): void;
    private poll;
}
