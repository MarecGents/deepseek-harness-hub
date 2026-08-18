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
// ─── Tauri invoke bridge ────────────────────────────────────────────────────
/**
 * Detect whether we are running inside a Tauri webview by checking for the
 * global IPC internals object injected by `@tauri-apps/api`.
 */
function isTauriWebview() {
    return typeof globalThis !== 'undefined'
        && '__TAURI_INTERNALS__' in globalThis
        && typeof globalThis.__TAURI_INTERNALS__ === 'object'
        && globalThis.__TAURI_INTERNALS__ !== null;
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
async function invoke(cmd, args) {
    try {
        const payload = { cmd, ...(args ?? {}) };
        process.stdout.write(`DSH_CMD ${JSON.stringify(payload)}\n`);
        return null;
    }
    catch (error) {
        console.warn(`[dsh-hub] DSH_CMD write failed:`, error);
        return null;
    }
}
// ─── Constants ──────────────────────────────────────────────────────────────
/** Spam guard: at most one task toast per cooldown window (mirrors desktop.ts). */
const NOTIFY_COOLDOWN_MS = 30_000;
/**
 * Q4: Node 进程没有 `Audio`（历史实测 ReferenceError），提示音改走
 * DSH_CMD 上行 → Rust eval → 浏览器侧 HTMLAudio（shell-init.js
 * `__mgPlaySound`）。此函数仅发命令，不直接播放。
 *
 * @param kind - 声音种类（start/success/attention/error）。
 */
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
function dispatchPageEvent(name, detail = {}) {
    const win = globalThis;
    if (win.__mgShellReady === true) {
        window.dispatchEvent(new CustomEvent(name, { detail }));
        return;
    }
    // SPA not ready yet; retry.
    const startedAt = Date.now();
    let tries = 0;
    const attempt = () => {
        if (win.__mgShellReady === true) {
            window.dispatchEvent(new CustomEvent(name, { detail }));
            console.log(`[dsh-hub] tauri dispatch ${name} in ${Date.now() - startedAt}ms`);
            return;
        }
        if (tries < 20) {
            tries += 1;
            setTimeout(attempt, 300);
        }
        else {
            console.warn(`[dsh-hub] tauri dispatch ${name} never reached a ready page (${Date.now() - startedAt}ms)`);
        }
    };
    attempt();
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
ctx, options, onExit) {
    const tauriAvailable = isTauriWebview();
    if (!tauriAvailable) {
        console.warn('[dsh-hub] Tauri internals not detected; shell commands will be no-ops (HTTP bridge fallback not yet wired)');
    }
    else {
        console.log('[dsh-hub] Tauri shell mode active');
    }
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
        getCurrentWorkspacePath: (cb) => {
            if (guard()) {
                cb(null);
                return;
            }
            // D4: In Tauri mode the page itself reports the workspace path via
            // the client-plugin bridge. The Rust-side `get_workspace_path` command
            // is a stub that returns null unless a page-initiated report has
            // cached the value. Fire-and-forget with a timeout fallback.
            let settled = false;
            const timeout = setTimeout(() => {
                if (!settled) {
                    settled = true;
                    cb(null);
                }
            }, 2000);
            void invoke('get_workspace_path').then((result) => {
                if (settled)
                    return;
                settled = true;
                clearTimeout(timeout);
                cb(result ?? null);
            });
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
            // 完成提示音（Q4：经 play_sound 通道，浏览器侧播放）。
            void invoke('play_sound', { kind: 'success' });
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
            console.log('[dsh-hub] tauri shell disposed');
            onExit();
        },
    };
    return shell;
}
