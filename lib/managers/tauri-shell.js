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
 *  - `notify_task_complete` – show native notification (body, sessionId?)
 *
 * Note: `get_workspace_path` exists as a Rust `#[tauri::command]` for the
 * page→Rust direct invoke channel (D4), but it is NOT a DSH_CMD dispatch arm
 * and is NOT sent through this up-link (the old host-side send was dead code
 * — the only caller was the removed `openWorkspace` tray callback; tray
 * "open workspace" now goes through tray-pipe `dispatch_page_event` → client
 * `invoke('open_workspace_path')`).
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
import { writeDshCmd } from '../helpers/pipe-io.js';
// ─── Tauri invoke bridge ────────────────────────────────────────────────────
/**
 * 发送一条命令到 Tauri 壳（SOP D-1：stdio JSON-RPC 上行）。
 *
 * 本模块运行在 dsh web 的 Node 进程（sidecar）内，无法直接访问浏览器 webview 的
 * `window.__TAURI_INTERNALS__`。正确通道是 **stdout 上行请求行**：写入
 * `DSH_CMD <json>`，Rust 壳的 node.rs 后台线程解析并执行窗口操作
 * （applyTheme/applySize/notify/dispatch_page_event）。
 *
 * 与 `controllers/shell-runtime.ts` 的 `sendDshCmd` 是**同一条通道、同一个
 * 线格式**：两者都委托 `helpers/pipe-io.ts` 的 `writeDshCmd` 写 stdout（SPT
 * 分层禁止 manager 依赖 controller，故保留两个薄包装、共享一个底层 writer）。
 * 职责边界：本 invoke 供壳 facade（TauriShellHandle）内部操作使用；
 * sendDshCmd 供控制器层（tray-pipe 经 index.ts 注入）使用。
 *
 * @param cmd   - 命令名（set_window_theme | set_window_size | set_desktop_icon |
 *                notify_task_complete | play_sound | dispatch_page_event）
 * @param args  - 命令参数（JSON 序列化）
 * @returns     - 恒为 null（stdio 上行是单向的，无返回值）
 */
async function invoke(cmd, args) {
    const payload = { cmd, ...(args ?? {}) };
    writeDshCmd(payload);
    return null;
}
// ─── Constants ──────────────────────────────────────────────────────────────
/** Spam guard: at most one task toast per cooldown window (mirrors desktop.ts). */
const NOTIFY_COOLDOWN_MS = 30_000;
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
function dispatchPageEvent(name, detail = {}) {
    void invoke('dispatch_page_event', { name, detail });
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
ctx, options) {
    // Runs inside the dsh web Node sidecar: every shell operation is an
    // `DSH_CMD <json>` stdout up-link that the Rust shell executes (node.rs).
    console.log('[dsh-hub] Tauri shell mode active (DSH_CMD up-link)');
    // ── Notification state (mirrors desktop.ts) ─────────────────────────────
    /** Timestamp of the last shown task toast (cooldown bookkeeping). */
    let lastNotifiedAt = 0;
    // ── Dispose guard ──────────────────────────────────────────────────────
    let disposed = false;
    const guard = () => {
        if (disposed) {
            console.warn('[dsh-hub] tauri shell operation after dispose');
            return true;
        }
        return false;
    };
    // ── Shell handle ────────────────────────────────────────────────────────
    const shell = {
        applyTheme: (theme) => {
            if (guard())
                return;
            void invoke('set_window_theme', { theme });
        },
        applySize: (width, height) => {
            if (guard())
                return;
            void invoke('set_window_size', { width, height });
        },
        setDesktopIcon: (id) => {
            if (guard())
                return;
            void invoke('set_desktop_icon', { iconId: id });
        },
        dispatchEvent: (name, detail) => {
            if (guard())
                return;
            dispatchPageEvent(name, detail ?? {});
        },
        playSound: (kind) => {
            if (guard())
                return;
            // Q4: Node 无 Audio → DSH_CMD 上行 → Rust eval → 浏览器 HTMLAudio。
            void invoke('play_sound', { kind });
        },
        notifyTaskComplete: (body, opts) => {
            if (guard())
                return;
            // 声音已由 session-runtime 统一触发（Q4：提问/完成/批准/出错四段），
            // 此处不再重复 play_sound（此前非聚焦会话会「音效块 + 这里」双响）。
            // Spam guard: at most one toast per cooldown window (same as desktop.ts).
            const now = Date.now();
            if (now - lastNotifiedAt < NOTIFY_COOLDOWN_MS) {
                console.log('[dsh-hub] tauri task toast throttled by cooldown');
                return;
            }
            lastNotifiedAt = now;
            // T3.5: Delegate notification display to the Rust side via IPC.
            void invoke('notify_task_complete', {
                title: options.title,
                body,
                sessionId: opts?.sessionId,
            });
        },
        dispose: () => {
            if (disposed)
                return;
            disposed = true;
            // 插件拆除仅释放句柄，不退出进程：进程退出由 Rust 壳（tray_quit /
            // CloseRequested）负责。若在此调 exitProcess，任何 include.refresh /
            // 热重载 / 优雅关闭都会把整个 dsh sidecar 硬杀并误写 quit.marker。
            console.log('[dsh-hub] tauri shell disposed');
        },
    };
    return shell;
}
