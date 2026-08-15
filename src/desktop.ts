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

import { Application, Theme } from '@webviewjs/webview'
import type { BrowserWindow, JsWebview } from '@webviewjs/webview'
import { JsonWindowStateStore, MIN_HEIGHT, MIN_WIDTH } from './services/state-store.js'
import { setTitleBarDark, setTitleBarDarkPowerShell } from './services/dwm-theme.js'
import { resolveLaunchScreen } from './services/screen.js'
import { WebViewThemeDetector } from './services/theme-sync.js'
import { WebViewTray, type TrayCommand } from './services/tray.js'
import { dshFaviconBlack, dshFaviconDark, dshFaviconDataUrl, dshFaviconTray } from './services/icons.js'

/** Shell options resolved from the dsh plugin Config schema. */
export interface DesktopOptions {
  /** Window title bar text. */
  title: string
  /**
   * Default window width in logical pixels; `undefined` sizes the default
   * window to 3/4 of the launch screen (multi-monitor aware).
   */
  width: number | undefined
  /** Default window height in logical pixels; see `width`. */
  height: number | undefined
  /** Title-bar theme: 'system' (default) | 'light' | 'dark'. */
  theme: 'system' | 'light' | 'dark'
  /** Open the current workspace directory (tray "Open workspace"). */
  openWorkspace: () => void
  /** Start a new task in the web UI (tray "New task"). */
  newTask: () => void
  /**
   * Live tray behavior read at every decision point (minimize poll / close),
   * so toggling "minimize to tray" / "close to tray" in the settings card
   * takes effect without a restart.
   */
  getTrayBehavior: () => { minimizeToTray: boolean; closeToTray: boolean }
}

/** Handle returned by {@link openDesktopShell}; call {@link DesktopShellHandle.dispose} to tear down. */
export interface DesktopShellHandle {
  /** The webview application instance. */
  readonly app: Application
  /** The main browser window showing the dsh web UI (may be recreated). */
  window(): BrowserWindow | undefined
  /**
   * Apply a title-bar theme now (from the settings card's theme select).
   * 'system' tracks the page's theme via polling; light/dark pin the chrome.
   */
  applyTheme(theme: 'system' | 'light' | 'dark'): void
  /**
   * Dispatch a custom event to the web page (tray → client-plugin bridge).
   * Retries until the page's listener signals ready, so a click during the
   * SPA boot is not lost.
   */
  dispatchEvent(name: string, detail?: Record<string, unknown>): void
  /** Dispose the shell (tray, theme polling, event pump). */
  dispose(): void
}

const BASE_URL = 'http://127.0.0.1'
/** How long the splash stays before the SPA navigation starts (paint + a beat). */
const SPLASH_MS = 300
/** Poll interval for the minimize-to-tray check. */
const MINIMIZE_POLL_MS = 250
/** Theme-neutral dsh dark / light backgrounds (also used by the splash). */
const DARK_BG: [number, number, number] = [24, 24, 27] // #18181b
const LIGHT_BG: [number, number, number] = [246, 248, 250] // #f6f8fa
/** dsh's brand accent (matches the SPA boot spinner token). */
const BRAND = '#3964fe'

/** Decoded once; the theme flips reuse the same buffers. */
let iconForDark: ReturnType<typeof dshFaviconDark> | undefined
let iconForLight: ReturnType<typeof dshFaviconDark> | undefined

/**
 * Window title-bar icon follows the theme: white whale on dark chrome,
 * black whale on light chrome (the taskbar/tray icons stay white — the
 * taskbar surface does not follow the page theme).
 */
function applyWindowIcon(w: BrowserWindow, dark: boolean): void {
  const icon = dark ? (iconForDark ??= dshFaviconDark()) : (iconForLight ??= dshFaviconBlack())
  if (icon === undefined) return
  try {
    w.setWindowIcon(Array.from(icon.data), icon.width, icon.height)
  } catch {
    // Best-effort; icon swaps must never break theme following.
  }
}

/** Apply the title-bar theme; koffi fast path, PowerShell fallback. */
function applyNativeTitleBarTheme(hwnd: bigint, dark: boolean): void {
  if (setTitleBarDark(hwnd, dark)) {
    console.log(`[mg-dsh-desktop] dwm(${hwnd}, ${dark ? 'dark' : 'light'}) -> 0`)
  } else {
    setTitleBarDarkPowerShell(hwnd, dark)
  }
}

/** The splash page: themed surface + logo + spinner, shown until the SPA paints. */
function splashHtml(dark: boolean, logo: string | undefined): string {
  const fg = dark ? '#f4f4f5' : '#0f1115'
  const dim = dark ? 'rgba(255,255,255,.28)' : 'rgba(0,0,0,.25)'
  const track = dark ? 'rgba(255,255,255,.13)' : 'rgba(0,0,0,.10)'
  const bg = dark ? DARK_BG : LIGHT_BG
  return [
    '<!doctype html><html><head><meta charset="utf-8"><style>',
    'html,body{margin:0;height:100%;overflow:hidden;',
    `background:rgb(${bg[0]},${bg[1]},${bg[2]});color:${fg};`,
    'font-family:"Segoe UI",system-ui,-apple-system,sans-serif;}',
    '.wrap{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;}',
    'img{width:56px;height:56px;animation:pulse 1.8s ease-in-out infinite;}',
    '.wordmark{font-size:15px;font-weight:600;letter-spacing:.16em;}',
    '.spinner{width:18px;height:18px;border-radius:50%;',
    `border:2px solid ${track};border-top-color:${BRAND};animation:spin .7s linear infinite;}`,
    '@keyframes spin{to{transform:rotate(360deg);}}',
    '@keyframes pulse{0%,100%{opacity:.5}50%{opacity:1}}',
    '</style></head><body><div class="wrap">',
    logo === undefined ? '' : `<img src="${logo}" alt="">`,
    '<div class="wordmark">DEEPSEEK&nbsp;HARNESS</div>',
    '<div class="spinner"></div>',
    '</div></body></html>',
  ].join('')
}

/**
 * Open the desktop shell for a running dsh web server.
 * @param port - the port dsh's webserver is listening on (from `ctx.webServer.port`).
 * @param options - shell options from plugin config.
 * @param onExit - invoked once when the application should quit (tray Quit, or
 *   window close with closeToTray disabled).
 */
export function openDesktopShell(
  port: number,
  options: DesktopOptions,
  onExit: () => void,
): DesktopShellHandle {
  const store = new JsonWindowStateStore()
  const state = store.load()
  const app = new Application()
  const darkByDefault = options.theme !== 'light'
  const splash = splashHtml(darkByDefault, dshFaviconDataUrl())
  const targetUrl = `${BASE_URL}:${port}`

  // ── Window factory (recreatable for close-to-tray) ────────────────────────
  let win: BrowserWindow | undefined
  let webview: JsWebview | undefined
  let detector: WebViewThemeDetector | undefined
  let minimizeTimer: NodeJS.Timeout | undefined
  let splashTimer: NodeJS.Timeout | undefined
  let closedToTray = false
  let themeSetting: DesktopOptions['theme'] = options.theme
  let tray: WebViewTray | undefined

  /**
   * Apply the title-bar theme to one window/webview pair. 'system' follows
   * the page's `data-ds-dark-theme` via the polling detector (which also
   * drives the webview background, so late theme switches never expose a
   * mismatched frame); light/dark pin both chrome and background directly.
   */
  const applyWindowTheme = (w: BrowserWindow, wv: JsWebview, theme: DesktopOptions['theme']): void => {
    detector?.stop()
    detector = undefined
    let hwnd: bigint | undefined
    try {
      hwnd = w.getNativeHandle()
      console.log(`[mg-dsh-desktop] window hwnd: ${hwnd}`)
    } catch (error) {
      console.warn(`[mg-dsh-desktop] getNativeHandle failed: ${String(error)}`)
    }
    if (theme === 'system') {
      // dsh defaults dark; corrected by the first probe as soon as the SPA paints.
      w.setTheme(Theme.Dark)
      wv.setBackgroundColor(...DARK_BG, 255)
      applyWindowIcon(w, true)
      if (hwnd !== undefined) applyNativeTitleBarTheme(hwnd, true)
      detector = new WebViewThemeDetector(wv)
      detector.start((dark) => {
        console.log(`[mg-dsh-desktop] page theme ${dark ? 'dark' : 'light'}`)
        w.setTheme(dark ? Theme.Dark : Theme.Light)
        wv.setBackgroundColor(...(dark ? DARK_BG : LIGHT_BG), 255)
        applyWindowIcon(w, dark)
        if (hwnd !== undefined) applyNativeTitleBarTheme(hwnd, dark)
      })
    } else {
      const dark = theme === 'dark'
      w.setTheme(dark ? Theme.Dark : Theme.Light)
      wv.setBackgroundColor(...(dark ? DARK_BG : LIGHT_BG), 255)
      applyWindowIcon(w, dark)
      if (hwnd !== undefined) applyNativeTitleBarTheme(hwnd, dark)
    }
  }

  const createWindow = (opts?: { hidden?: boolean }): void => {
    // Close-to-tray recreates the window: retire the previous window's
    // timers and theme probe so nothing keeps polling a disposed webview.
    if (splashTimer !== undefined) clearTimeout(splashTimer)
    splashTimer = undefined
    if (minimizeTimer !== undefined) clearInterval(minimizeTimer)
    minimizeTimer = undefined
    detector?.stop()
    detector = undefined

    // Default window size: a saved size wins; otherwise size to 3/4 of the
    // launch screen (multi-monitor aware via the cursor's monitor), with
    // 1280×720 as the last-resort floor when the screen cannot be resolved.
    const screen = resolveLaunchScreen()
    const width = options.width ?? (screen === undefined ? 1280 : Math.round((screen.width * 3) / 4))
    const height = options.height ?? (screen === undefined ? 720 : Math.round((screen.height * 3) / 4))
    if (options.width === undefined) {
      console.log(`[mg-dsh-desktop] default window ${width}x${height} (screen ${screen?.width ?? '?'}x${screen?.height ?? '?'})`)
    }

    const w = app.createBrowserWindow({
      title: options.title,
      width,
      height,
      // A hidden window (close-to-tray keepalive) starts invisible so the
      // app survives the previous window's close without flashing.
      ...(opts?.hidden === true ? { visible: false } : {}),
    })
    win = w
    w.setMinSize(MIN_WIDTH, MIN_HEIGHT)
    w.center()
    if (state.maximized === true) w.setMaximized(true)

    // Splash first: WebView2 keeps it painted while the SPA parses, so the
    // boot shows a smooth themed surface (no white/dark flash frames).
    const wv = w.createWebview({ html: splash })
    webview = wv
    wv.setBackgroundColor(...DARK_BG, 255)

    splashTimer = setTimeout(() => {
      if (webview !== wv || wv.isDisposed()) return
      wv.loadUrl(targetUrl)
    }, SPLASH_MS)

    // Taskbar glyph stays white (the taskbar surface does not follow the
    // page theme); the title-bar icon is set by applyWindowTheme below and
    // flips with the theme.
    const icon = dshFaviconDark()
    if (icon !== undefined) {
      w.setTaskbarIcon(Array.from(icon.data), icon.width, icon.height)
    }

    // Theme: apply the current setting to this window pair. 'system' follows
    // the page's data-ds-dark-theme (150ms polling) and also drives the
    // webview background so late theme switches never expose a mismatch.
    applyWindowTheme(w, wv, themeSetting)

    // Persist only the maximized flag (geometry is intentionally not kept).
    const persist = (): void => {
      try { store.save({ maximized: w.isMaximized() }) } catch { /* best-effort */ }
    }
    w.on('resize', persist)

    // Minimize-to-tray: poll minimized state and hide the window so the
    // taskbar entry disappears; the tray restores it. Behavior is read live
    // so a settings change applies immediately.
    minimizeTimer = setInterval(() => {
      if (!options.getTrayBehavior().minimizeToTray) return
      if (win !== undefined && win.isMinimized() && win.isVisible()) {
        // Clear the minimized state BEFORE hiding: a hidden window can keep
        // its minimized flag, which would make show() restore minimized and
        // the poll would hide it again (taskbar flicker, unrecoverable).
        win.setMinimized(false)
        win.hide()
        updateTrayLabel()
      }
    }, MINIMIZE_POLL_MS)

    // Close behavior: with closeToTray the window closes but the process and
    // tray stay alive (the tray recreates the window); otherwise quit.
    w.on('close', () => {
      if (options.getTrayBehavior().closeToTray) {
        // webviewjs cannot prevent the native close (no preventDefault), and
        // a closed window makes the app exit — so create a hidden keepalive
        // window synchronously: the old one closes, the app survives with a
        // window (hidden), and the tray stays alive. showWindow shows it.
        closedToTray = true
        try {
          createWindow({ hidden: true })
        } catch {
          // Worst case the app may exit; nothing else we can do here.
        }
        updateTrayLabel()
      } else {
        exit()
      }
    })
    app.on('window-close-requested', () => {
      // The close event above handles cleanup; nothing extra needed.
    })
  }

  let exited = false
  const exit = (): void => {
    if (exited) return
    exited = true
    // Do NOT call app.exit() here: webviewjs's native teardown can crash with
    // 0xC0000005 on Windows, which the launcher would auto-restart. The host's
    // exitProcess() writes a quit marker and calls process.exit(0) directly.
    onExit()
  }

  // ── Tray (always present) ─────────────────────────────────────────────────
  const updateTrayLabel = (): void => {
    try {
      tray?.setShowCommandLabel(win?.isVisible() === true)
    } catch {
      // Best-effort; a stale label must never break tray actions.
    }
  }

  const showWindow = (): void => {
    if (win === undefined || win.isDisposed()) {
      closedToTray = false
      createWindow()
    }
    if (win === undefined) return
    // Clear any leftover minimized state before showing so the window comes
    // back fully and the minimize poll does not re-hide it.
    if (win.isMinimized()) win.setMinimized(false)
    win.show()
    win.focus()
    updateTrayLabel()
  }

  /**
   * Run a page script that answers 'ok' | 'pending': 'ok' means the command
   * was dispatched; 'pending' means the page's client plugin is not listening
   * yet (SPA still booting), so retry until it is. The probe and the dispatch
   * are one expression, so there is no window between "ready" and "dispatch".
   */
  const dispatchScript = (name: string, detail: Record<string, unknown>): string =>
    // Numeric result on purpose: evaluateScriptWithCallback serializes string
    // results WITH their quotes ('ok' -> "\"ok\""), which trim() cannot fix;
    // the theme probe hit this exact bug. Numbers serialize cleanly.
    `window.__mgShellReady === true`
    + ` ? (window.dispatchEvent(new CustomEvent(${JSON.stringify(name)}, { detail: ${JSON.stringify(detail)} })), 1)`
    + ` : 0`

  const dispatchEvent = (name: string, detail: Record<string, unknown> = {}): void => {
    if (webview === undefined || webview.isDisposed()) return
    const startedAt = Date.now()
    console.log(`[mg-dsh-desktop] dispatch start ${name} at ${startedAt}`)
    const js = dispatchScript(name, detail)
    let tries = 0
    const attempt = (): void => {
      const wv = webview
      if (wv === undefined || wv.isDisposed()) return
      wv.evaluateScriptWithCallback(js, (error, result) => {
        if (error) {
          console.warn(`[mg-dsh-desktop] dispatch ${name} failed:`, error)
          return
        }
        const status = result?.trim()
        if (status === '1') {
          console.log(`[mg-dsh-desktop] dispatched ${name} in ${Date.now() - startedAt}ms`)
          return
        }
        // 20 × 300ms covers a cold SPA boot; by then the page's client
        // plugin has mounted and set __mgShellReady.
        if (tries < 20) {
          tries += 1
          setTimeout(attempt, 300)
        } else {
          console.warn(`[mg-dsh-desktop] dispatch ${name} never reached a ready page (${Date.now() - startedAt}ms)`)
        }
      })
    }
    attempt()
  }

  tray = new WebViewTray(app, {
    title: options.title,
    icon: dshFaviconTray(),
  }, {
    onDoubleClick: showWindow,
    onCommand: (command: TrayCommand) => {
      if (command === 'show') {
        // The first menu item is dynamic: “隐藏主界面” when visible,
        // “显示主界面” when hidden.
        if (win !== undefined && !win.isDisposed() && win.isVisible()) {
          // Same minimized-flag cleanup as the minimize poll: hiding a
          // minimized window without clearing the flag can make a later
          // show() restore minimized and immediately re-hide.
          if (win.isMinimized()) win.setMinimized(false)
          win.hide()
          updateTrayLabel()
        } else {
          showWindow()
        }
      } else if (command === 'open-workspace') {
        options.openWorkspace()
      } else if (command === 'new-task') {
        // If the window is already visible, avoid a full showWindow() but still
        // focus it: WebView2 can defer repainting while the window is inactive,
        // so the new session would otherwise only appear after the user clicks
        // inside the window. Focusing forces an immediate refresh.
        if (win !== undefined && !win.isDisposed() && win.isVisible()) {
          win.focus()
          options.newTask()
        } else {
          showWindow()
          options.newTask()
        }
      } else if (command === 'quit') {
        exit()
      }
    },
  })

  // Initial window.
  createWindow()
  updateTrayLabel()

  // Non-blocking event pump: dsh's HTTP server and timers keep running on the
  // Node event loop. `ref: true` keeps the process alive while the window is up.
  void app.whenReady({ interval: 33, ref: true })

  const shell: DesktopShellHandle = {
    app,
    window: () => win,
    applyTheme: (theme: 'system' | 'light' | 'dark') => {
      themeSetting = theme
      if (win !== undefined && webview !== undefined && !webview.isDisposed()) {
        applyWindowTheme(win, webview, theme)
      }
    },
    dispatchEvent,
    dispose: () => {
      if (!exited) exit()
    },
  }
  return shell
}
