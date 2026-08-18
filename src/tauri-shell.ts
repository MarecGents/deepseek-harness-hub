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
 * import { openDesktopShellTauri } from './tauri-shell.ts'
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

// ─── Tauri invoke bridge ────────────────────────────────────────────────────

/**
 * Detect whether we are running inside a Tauri webview by checking for the
 * global IPC internals object injected by `@tauri-apps/api`.
 */
function isTauriWebview(): boolean {
  return typeof globalThis !== 'undefined'
    && '__TAURI_INTERNALS__' in globalThis
    && typeof (globalThis as Record<string, unknown>).__TAURI_INTERNALS__ === 'object'
    && (globalThis as Record<string, unknown>).__TAURI_INTERNALS__ !== null
}

/**
 * 发送一条命令到 Tauri 壳（SOP D-1：stdio JSON-RPC 上行）。
 *
 * 本模块运行在 dsh web 的 Node 进程（sidecar）内，无法直接访问浏览器 webview 的
 * `window.__TAURI_INTERNALS__`。正确通道是 **stdout 上行请求行**：写入
 * `DSH_CMD <json>`，Rust 壳的 node.rs 后台线程解析并执行窗口操作
 * （applyTheme/applySize/notify）。
 *
 * @param cmd   - 命令名（applyTheme | applySize | notify）
 * @param args  - 命令参数（JSON 序列化）
 * @returns     - 恒为 null（stdio 上行是单向的，无返回值）
 */
async function invoke<T = unknown>(cmd: string, args?: Record<string, unknown>): Promise<T | null> {
  try {
    const payload = { cmd, ...(args ?? {}) }
    process.stdout.write(`DSH_CMD ${JSON.stringify(payload)}\n`)
    return null
  } catch (error) {
    console.warn(`[dsh-hub] DSH_CMD write failed:`, error)
    return null
  }
}

// ─── Constants ──────────────────────────────────────────────────────────────

/** Spam guard: at most one task toast per cooldown window (mirrors desktop.ts). */
const NOTIFY_COOLDOWN_MS = 30_000

// ─── Public interface ───────────────────────────────────────────────────────

/**
 * Options for the Tauri shell. Matches the subset of {@link DesktopOptions}
 * that does not depend on the WebView2 Application / BrowserWindow objects.
 */
export interface TauriShellOptions {
  /** Window title bar text (used for notification titles). */
  title: string
  /** Initial window width in logical pixels (`undefined` = OS default). */
  width: number | undefined
  /** Initial window height in logical pixels (`undefined` = OS default). */
  height: number | undefined
  /** Title-bar theme: 'system' | 'light' | 'dark'. */
  theme: 'system' | 'light' | 'dark'
  /** Open the current workspace directory (tray "Open workspace"). */
  openWorkspace: () => void
  /** Start a new task in the web UI (tray "New task"). */
  newTask: () => void
  /** Live tray behavior read at every decision point. */
  getTrayBehavior: () => { minimizeToTray: boolean; closeToTray: boolean }
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
  applyTheme(theme: 'system' | 'light' | 'dark'): void

  /**
   * Apply a window size immediately (from the settings card's width/height).
   * Delegates to the Tauri `set_window_size` command (T4.8).
   */
  applySize(width: number, height: number): void

  /**
   * Request the current session's workspace path from the shell.
   * In Tauri mode the page itself reports the path (D4), so this is a stub
   * that invokes `get_workspace_path` (T4.8) and returns null unless the
   * Rust side provides a cached value.
   */
  getCurrentWorkspacePath(cb: (path: string | null) => void): void

  /**
   * Dispatch a custom event to the web page (tray → client-plugin bridge).
   * Uses `window.dispatchEvent(new CustomEvent(...))` — identical to
   * desktop.ts L511, no IPC round-trip needed since the page is in the
   * same webview context.
   */
  dispatchEvent(name: string, detail?: Record<string, unknown>): void

  /**
   * Play a shell event sound via HTMLAudioElement (cross-platform, D3).
   * Replaces the Windows winmm.dll approach used by desktop.ts.
   */
  playSound(kind: TaskSoundKind): void

  /**
   * Show a native notification for a completed task.
   * Delegates to the Tauri `notify_task_complete` command (T3.5) and also
   * plays a completion chime via HTMLAudio.
   */
  notifyTaskComplete(body: string, opts?: { sessionId?: string }): void

  /** Dispose the shell (release listeners, stop polling). */
  dispose(): void
}

/** Shell event sound kind (mirrors desktop.ts TaskSoundKind). */
export type TaskSoundKind = 'start' | 'success' | 'attention' | 'error'

/**
 * Sound asset paths relative to the web asset root.
 * These correspond to the WAV files in assets/sounds/ (synthesized by
 * scripts/synthesize-sounds.mjs). In Tauri mode they are served as
 * static assets by the webview; HTMLAudioElement handles playback.
 */
const SOUND_URLS: Record<TaskSoundKind, string> = {
  start: '/api/dsh-hub/sounds/dsh-hub-start.wav',
  success: '/api/dsh-hub/sounds/dsh-hub-success.wav',
  attention: '/api/dsh-hub/sounds/dsh-hub-attention.wav',
  error: '/api/dsh-hub/sounds/dsh-hub-error.wav',
}

/**
 * Play a sound file via HTMLAudioElement. Fire-and-forget: errors are logged
 * but never propagate (best-effort, same policy as desktop.ts).
 *
 * @param kind - The event kind whose sound to play.
 */
function playHtmlSound(kind: TaskSoundKind): void {
  try {
    const url = SOUND_URLS[kind]
    const audio = new Audio(url)
    // Don't await — fire-and-forget like winmm SND_ASYNC.
    void audio.play().catch((error: unknown) => {
      // Autoplay policy or missing asset; non-fatal.
      console.warn(`[dsh-hub] tauri sound "${kind}" play failed:`, error)
    })
  } catch (error) {
    // Audio constructor failure (e.g. missing DOM); non-fatal.
    console.warn(`[dsh-hub] tauri sound "${kind}" init failed:`, error)
  }
}

// ─── Event dispatch (page-side, same-origin) ────────────────────────────────

/**
 * Dispatch a custom event to the web page with retry-until-ready semantics.
 *
 * The page's client plugin sets `window.__mgShellReady = true` once mounted.
 * If the flag is not yet set (SPA still booting), we retry every 300ms for
 * up to 20 attempts (6s total) — identical logic to desktop.ts L506-543,
 * but using direct `window.dispatchEvent` instead of webviewjs
 * `evaluateScriptWithCallback` (we are already in the page context).
 *
 * @param name   - CustomEvent name (e.g. 'mg:shell-command').
 * @param detail - Event detail payload.
 */
function dispatchPageEvent(name: string, detail: Record<string, unknown> = {}): void {
  const win = globalThis as Record<string, unknown>
  if (win.__mgShellReady === true) {
    window.dispatchEvent(new CustomEvent(name, { detail }))
    return
  }
  // SPA not ready yet; retry.
  const startedAt = Date.now()
  let tries = 0
  const attempt = (): void => {
    if (win.__mgShellReady === true) {
      window.dispatchEvent(new CustomEvent(name, { detail }))
      console.log(`[dsh-hub] tauri dispatch ${name} in ${Date.now() - startedAt}ms`)
      return
    }
    if (tries < 20) {
      tries += 1
      setTimeout(attempt, 300)
    } else {
      console.warn(`[dsh-hub] tauri dispatch ${name} never reached a ready page (${Date.now() - startedAt}ms)`)
    }
  }
  attempt()
}

// ─── Entry point ────────────────────────────────────────────────────────────

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
export function openDesktopShellTauri(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ctx: unknown,
  options: TauriShellOptions,
  onExit: () => void,
): TauriShellHandle {
  const tauriAvailable = isTauriWebview()

  if (!tauriAvailable) {
    console.warn('[dsh-hub] Tauri internals not detected; shell commands will be no-ops (HTTP bridge fallback not yet wired)')
  } else {
    console.log('[dsh-hub] Tauri shell mode active')
  }

  // ── Notification state (mirrors desktop.ts) ─────────────────────────────

  /** Timestamp of the last shown task toast (cooldown bookkeeping). */
  let lastNotifiedAt = 0

  // ── Dispose guard ──────────────────────────────────────────────────────

  let disposed = false

  const guard = (): boolean => {
    if (disposed) {
      console.warn('[dsh-hub] tauri shell operation after dispose')
      return true
    }
    return false
  }

  // ── Shell handle ────────────────────────────────────────────────────────

  const shell: TauriShellHandle = {
    applyTheme: (theme: 'system' | 'light' | 'dark') => {
      if (guard()) return
      void invoke('set_window_theme', { theme })
    },

    applySize: (width: number, height: number) => {
      if (guard()) return
      void invoke('set_window_size', { width, height })
    },

    getCurrentWorkspacePath: (cb: (path: string | null) => void) => {
      if (guard()) {
        cb(null)
        return
      }
      // D4: In Tauri mode the page itself reports the workspace path via
      // the client-plugin bridge. The Rust-side `get_workspace_path` command
      // is a stub that returns null unless a page-initiated report has
      // cached the value. Fire-and-forget with a timeout fallback.
      let settled = false
      const timeout = setTimeout(() => {
        if (!settled) {
          settled = true
          cb(null)
        }
      }, 2000)

      void invoke<string>('get_workspace_path').then((result) => {
        if (settled) return
        settled = true
        clearTimeout(timeout)
        cb(result ?? null)
      })
    },

    dispatchEvent: (name: string, detail?: Record<string, unknown>) => {
      if (guard()) return
      dispatchPageEvent(name, detail ?? {})
    },

    playSound: (kind: TaskSoundKind) => {
      if (guard()) return
      // D3: Cross-platform HTMLAudio playback replaces Windows winmm.dll.
      playHtmlSound(kind)
    },

    notifyTaskComplete: (body: string, opts?: { sessionId?: string }) => {
      if (guard()) return
      // Play the completion sound (best-effort, D3).
      playHtmlSound('success')

      // Spam guard: at most one toast per cooldown window (same as desktop.ts).
      const now = Date.now()
      if (now - lastNotifiedAt < NOTIFY_COOLDOWN_MS) {
        console.log('[dsh-hub] tauri task toast throttled by cooldown')
        return
      }
      lastNotifiedAt = now

      // T3.5: Delegate notification display to the Rust side via IPC.
      void invoke('notify_task_complete', {
        title: options.title,
        body,
        sessionId: opts?.sessionId,
      })
    },

    dispose: () => {
      if (disposed) return
      disposed = true
      console.log('[dsh-hub] tauri shell disposed')
      onExit()
    },
  }

  return shell
}
