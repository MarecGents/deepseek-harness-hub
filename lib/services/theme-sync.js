/** How often the page is asked for its theme after the first load finished. */
const POLL_INTERVAL_MS = 100;
/** WebView2-backed {@link ThemeDetector} that reads dsh's theme marker. */
export class WebViewThemeDetector {
    webview;
    timer;
    lastDark;
    listener;
    onLoad;
    constructor(webview) {
        this.webview = webview;
        this.onLoad = () => {
            this.poll();
            if (this.timer === undefined)
                this.timer = setInterval(() => this.poll(), POLL_INTERVAL_MS);
        };
    }
    start(listener) {
        this.listener = listener;
        // Poll immediately and on every page load, then keep a steady interval.
        // (The first poll also covers a webview that finished loading before
        // start() — e.g. a recreated window whose SPA is already up.)
        this.poll();
        this.webview.on('page-load-finished', this.onLoad);
        this.timer = setInterval(() => this.poll(), POLL_INTERVAL_MS);
    }
    stop() {
        if (this.timer !== undefined)
            clearInterval(this.timer);
        this.timer = undefined;
        this.webview.off('page-load-finished', this.onLoad);
        this.listener = undefined;
    }
    poll() {
        // Numeric result, not string literals: evaluateScriptWithCallback
        // serializes a string result WITH its quotes ('dark' -> "\"dark\""),
        // which a trim() can never match — the detector would read every theme
        // as light. 1=dark, 0=light, -1=not the dsh page yet.
        this.webview.evaluateScriptWithCallback(`location.protocol === 'http:' || location.protocol === 'https:'`
            + ` ? (document.body !== null && document.body.hasAttribute('data-ds-dark-theme') ? 1 : 0)`
            + ` : -1`, (error, result) => {
            if (error) {
                console.warn('[marec-dsh-desktop] theme probe failed:', error);
                return;
            }
            const raw = (result ?? '').trim();
            if (raw === '-1')
                return;
            const dark = raw === '1';
            if (dark !== this.lastDark) {
                this.lastDark = dark;
                this.listener?.(dark);
            }
        });
    }
}
