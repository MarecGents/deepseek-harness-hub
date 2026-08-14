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
import type { JsWebview } from '@webviewjs/webview'

/** A consumer of theme changes (the window chrome, …). */
export type ThemeChangeListener = (dark: boolean) => void

/** Contract for reading the page's dark-mode state. */
export interface ThemeDetector {
  /** Begin polling; invokes {@link listener} with the current state on change. */
  start(listener: ThemeChangeListener): void
  /** Stop polling and release the timer. */
  stop(): void
}

/** How often the page is asked for its theme after the first load finished. */
const POLL_INTERVAL_MS = 150

/** WebView2-backed {@link ThemeDetector} that reads dsh's theme marker. */
export class WebViewThemeDetector implements ThemeDetector {
  private timer: NodeJS.Timeout | undefined
  private lastDark: boolean | undefined
  private listener: ThemeChangeListener | undefined
  private readonly onLoad: () => void

  constructor(private readonly webview: JsWebview) {
    this.onLoad = (): void => {
      this.poll()
      if (this.timer === undefined) this.timer = setInterval(() => this.poll(), POLL_INTERVAL_MS)
    }
  }

  start(listener: ThemeChangeListener): void {
    this.listener = listener
    // Poll immediately and on every page load, then keep a steady interval.
    // (The first poll also covers a webview that finished loading before
    // start() — e.g. a recreated window whose SPA is already up.)
    this.poll()
    this.webview.on('page-load-finished', this.onLoad)
    this.timer = setInterval(() => this.poll(), POLL_INTERVAL_MS)
  }

  stop(): void {
    if (this.timer !== undefined) clearInterval(this.timer)
    this.timer = undefined
    this.webview.off('page-load-finished', this.onLoad)
    this.listener = undefined
  }

  private poll(): void {
    // Numeric result, not string literals: evaluateScriptWithCallback
    // serializes a string result WITH its quotes ('dark' -> "\"dark\""),
    // which a trim() can never match — the detector would read every theme
    // as light. 1=dark, 0=light, -1=not the dsh page yet.
    this.webview.evaluateScriptWithCallback(
      `location.protocol === 'http:' || location.protocol === 'https:'`
      + ` ? (document.body !== null && document.body.hasAttribute('data-ds-dark-theme') ? 1 : 0)`
      + ` : -1`,
      (error, result) => {
        if (error) {
          console.warn('[marec-dsh-desktop] theme probe failed:', error)
          return
        }
        const raw = (result ?? '').trim()
        if (raw === '-1') return
        const dark = raw === '1'
        if (dark !== this.lastDark) {
          this.lastDark = dark
          this.listener?.(dark)
        }
      },
    )
  }
}
