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

import type { TaskSoundKind } from '../models/sound.js'

// ─── Tauri invoke bridge ────────────────────────────────────────────────────

/**
 * 发送一条命令到 Tauri 壳（SOP D-1：stdio JSON-RPC 上行）。
 *
 * 本模块运行在 dsh web 的 Node 进程（sidecar）内，无法直接访问浏览器 webview 的
 * `window.__TAURI_INTERNALS__`。正确通道是 **stdout 上行请求行**：写入
 * `DSH_CMD <json>`，Rust 壳的 node.rs 后台线程解析并执行窗口操作
 * （applyTheme/applySize/notify/dispatch_page_event）。
 *
 * @param cmd   - 命令名（set_window_theme | set_window_size | notify_task_complete |
 *                play_sound | dispatch_page_event）
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

/** Shell event sound kind (mirrors models/sound.ts). */
export type { TaskSoundKind }

// ─── Event dispatch (host → Rust eval → page) ───────────────────────────────

/**
 * Dispatch a custom event into the web page via the DSH_CMD `dispatch_page_event`
 * up-link: node.rs evals `window.dispatchEvent(new CustomEvent(...))` into the
 * main webview. This is the only reliable channel from the Node sidecar (a
 * plain `window.dispatchEvent` does not exist in the Node process).
 *
 * @param name   - CustomEvent name (e.g. 'mg:shell-command').
 * @param detail - Event detail payload.
 */
function dispatchPageEvent(name: string, detail: Record<string, unknown> = {}): void {
  void invoke('dispatch_page_event', { name, detail })
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
 * @returns       A handle to control the shell.
 */
export function openDesktopShellTauri(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ctx: unknown,
  options: TauriShellOptions,
): TauriShellHandle {
  // Runs inside the dsh web Node sidecar: every shell operation is an
  // `DSH_CMD <json>` stdout up-link that the Rust shell executes (node.rs).
  console.log('[dsh-hub] Tauri shell mode active (DSH_CMD up-link)')

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
      // Q4: Node 无 Audio → DSH_CMD 上行 → Rust eval → 浏览器 HTMLAudio。
      void invoke('play_sound', { kind })
    },

    notifyTaskComplete: (body: string, opts?: { sessionId?: string }) => {
      if (guard()) return
      // 声音已由 session-runtime 统一触发（Q4：提问/完成/批准/出错四段），
      // 此处不再重复 play_sound（此前非聚焦会话会「音效块 + 这里」双响）。

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
      // 插件拆除仅释放句柄，不退出进程：进程退出由 Rust 壳（tray_quit /
      // CloseRequested）负责。若在此调 exitProcess，任何 include.refresh /
      // 热重载 / 优雅关闭都会把整个 dsh sidecar 硬杀并误写 quit.marker。
      console.log('[dsh-hub] tauri shell disposed')
    },
  }

  return shell
}
