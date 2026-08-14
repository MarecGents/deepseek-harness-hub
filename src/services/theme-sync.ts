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

/** How often the page is probed as a fallback after the first load finished. */
const POLL_INTERVAL_MS = 100

/** IPC marker the injected observer prefixes every theme message with. */
const IPC_PREFIX = 'mg-theme:'

/** One-shot script that installs the theme MutationObserver (idempotent per document). */
const OBSERVER_SCRIPT = `
if (!window.__mgThemeObserver) {
  window.__mgThemeObserver = new MutationObserver(function () {
    var dark = document.body !== null && document.body.hasAttribute('data-ds-dark-theme') ? 1 : 0
    window.ipc.postMessage('${IPC_PREFIX}' + dark)
  })
  window.__mgThemeObserver.observe(document.body, { attributes: true, attributeFilter: ['data-ds-dark-theme'] })
  window.ipc.postMessage('${IPC_PREFIX}' + (document.body !== null && document.body.hasAttribute('data-ds-dark-theme') ? 1 : 0))
}
`

/** WebView2-backed {@link ThemeDetector} that reads dsh's theme marker. */
export class WebViewThemeDetector implements ThemeDetector {
  private timer: NodeJS.Timeout | undefined
  private lastDark: boolean | undefined
  private listener: ThemeChangeListener | undefined
  private readonly onLoad: () => void

  constructor(private readonly webview: JsWebview) {
    this.onLoad = (): void => {
      this.injectObserver()
      this.poll()
      if (this.timer === undefined) this.timer = setInterval(() => this.poll(), POLL_INTERVAL_MS)
    }
  }

  start(listener: ThemeChangeListener): void {
    this.listener = listener
    // Event feed: the injected observer reports every body-marker change.
    this.webview.onIpcMessage((message) => {
      try {
        const text = message.body.toString()
        if (!text.startsWith(IPC_PREFIX)) return
        this.emit(text === `${IPC_PREFIX}1`)
      } catch {
        // Foreign message shape; ignore.
      }
    })
    // Poll immediately and on every page load, then keep a steady interval.
    // (The first poll also covers a webview that finished loading before
    // start() — e.g. a recreated window whose SPA is already up.)
    this.onLoad()
    this.webview.on('page-load-finished', this.onLoad)
  }

  stop(): void {
    if (this.timer !== undefined) clearInterval(this.timer)
    this.timer = undefined
    this.webview.off('page-load-finished', this.onLoad)
    this.listener = undefined
  }

  /** Emit only on a value change (observer messages and polls share one feed). */
  private emit(dark: boolean): void {
    if (dark !== this.lastDark) {
      this.lastDark = dark
      this.listener?.(dark)
    }
  }

  /** Install the MutationObserver in the current document (idempotent). */
  private injectObserver(): void {
    try {
      this.webview.evaluateScript(OBSERVER_SCRIPT)
    } catch {
      // Non-fatal: the polling fallback still covers theme changes.
    }
  }

  private poll(): void {
    this.webview.evaluateScriptWithCallback(
      `location.protocol === 'http:' || location.protocol === 'https:'`
      + ` ? (document.body !== null && document.body.hasAttribute('data-ds-dark-theme') ? 1 : 0)`
      + ` : -1`,
      (error, result) => {
        if (error) {
          console.warn('[mg-dsh-desktop] theme probe failed:', error)
          return
        }
        const raw = (result ?? '').trim()
        if (raw === '-1') return
        this.emit(raw === '1')
      },
    )
  }
}
