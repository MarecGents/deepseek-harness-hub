/**
 * dsh-hub browser half — registers a settings card into the dsh
 * settings → plugins page and bridges tray commands from the desktop shell.
 *
 * The card reads/writes the shell config through this plugin's own HTTP
 * routes, so it works without dsh's settings namespace allowlist (which does
 * not expose third-party namespaces yet). The card renders only while the
 * host serves the config API, which happens only when the process was
 * launched by this project (desktop shortcut / `dsh-hub`); a plain
 * command-line `dsh web` never mounts the bundle at all.
 *
 * The tray bridge: the desktop shell dispatches tray commands into the page
 * as custom window events; `__mgShellReady` lets the host retry until
 * this listener is mounted, so a tray click during the SPA boot is not lost.
 *
 * Registration follows the official client-plugin contract (see dsh-web-ui's
 * dsh-pet): declare the slot shape, then `slots.inject('settings.plugin.item',
 * ...)`.
 *
 * @module dsh-hub/client
 */
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { DesktopSettingsCard } from "./settings-card.js";
import { injectCardStyle } from "./style.js";
import { RightSidebar } from "./right-sidebar.js";
import { injectRightSidebarStyle } from "./right-sidebar-style.js";
import { applySkin, fetchStoredSkin, hasUserPickedSkin } from "./skins.js";
import { applyBackground, fetchStoredBackground, hasUserPickedBackground } from "./backgrounds.js";
import { installPinnedConversations } from "./pin-conversations.js";
window.__mgShellReady = true;
/** Required services: slots (card), workspaces + sessions (tray + sidebar data). */
export const inject = ['slots', 'workspaces', 'sessions'];
/** Resolve the current session's workspace from the client runtime. */
function currentWorkspace(ctx) {
    const client = ctx;
    const sessions = client.sessions;
    const workspaces = client.workspaces;
    if (sessions === undefined || workspaces === undefined)
        return null;
    const sessionSnapshot = sessions.list?.getSnapshot?.();
    const current = sessionSnapshot?.current;
    // The session summary's cwd is the most direct current-working-directory
    // source (same one dsh-better-sidebar uses for its explorer root).
    const sessionCwd = current === undefined ? undefined : sessionSnapshot?.byId?.[current]?.cwd;
    if (sessionCwd !== undefined && sessionCwd !== '')
        return { path: sessionCwd, id: current };
    const snapshot = workspaces.list?.getSnapshot?.();
    const items = snapshot?.items ?? [];
    if (current !== undefined) {
        const ws = items.find((item) => item.sessionIds?.includes(current));
        if (ws !== undefined)
            return { path: ws.path, id: ws.workspaceId };
    }
    const recentId = snapshot?.recentWorkspaceId;
    const recent = items.find((item) => item.workspaceId === recentId);
    if (recent !== undefined)
        return { path: recent.path, id: recent.workspaceId };
    return null;
}
/** Send the current workspace path to the desktop host over IPC. */
function sendCurrentWorkspace(ctx) {
    const ws = currentWorkspace(ctx);
    const path = ws?.path;
    try {
        const ipc = window.ipc;
        ipc?.postMessage(`mg:workspace-path:${path === undefined ? '' : encodeURIComponent(path)}`);
    }
    catch {
        // Best-effort; the host falls back to its own cwd tracking.
    }
}
/** Handle one tray command dispatched by the desktop shell. */
function handleShellCommand(ctx, event) {
    const detail = event.detail;
    // 诊断上报（E2E 断言 + 失效排查链路证据）：命令到达浏览器 client。
    const report = (msg) => {
        try {
            const internals = window.__TAURI_INTERNALS__;
            internals?.invoke?.('diag_report', { msg }).catch?.(() => { });
        }
        catch {
            // 诊断失败不影响功能。
        }
    };
    report('client-shell-command:' + (detail?.command ?? '?'));
    if (detail?.command === 'new-task') {
        // Official New Session flow (sidebar "+" button path). Deliberately pass no
        // explicit workspaceId: startSession resolves the current session's
        // workspace first, then the recent workspace, then clears.
        const workspaces = ctx.workspaces;
        if (workspaces === undefined || workspaces.startSession === undefined) {
            console.warn('[dsh-hub] new-task ignored: workspaces service unavailable');
            report('client-new-task:workspaces-unavailable');
            return;
        }
        console.log('[dsh-hub] new-task (current session workspace)');
        report('client-new-task:startSession');
        workspaces.startSession();
        return;
    }
    if (detail?.command === 'open-workspace') {
        // Tray "Open workspace": report the current workspace path to the shell.
        // Tauri 壳：invoke('open_workspace_path') → Rust 平台命令打开 Explorer
        //   （D-2 实测：__TAURI_INTERNALS__ 无 event 对象，页面→Rust 走命令）。
        // WebView2 壳：window.ipc.postMessage（rc.14 路径，保留）。
        // 优先判 Tauri（window.ipc 在 Tauri 下可能被其他东西占用，先走 invoke）。
        const path = currentWorkspace(ctx)?.path;
        try {
            const internals = window.__TAURI_INTERNALS__;
            if (internals?.invoke) {
                void internals.invoke('open_workspace_path', { path: path ?? '' }).catch(() => { });
                report('client-open-workspace:invoke:' + (path ?? ''));
            }
            else {
                const ipc = window.ipc;
                ipc?.postMessage(`mg:workspace-path:${path === undefined ? '' : encodeURIComponent(path)}`);
            }
        }
        catch {
            // Best-effort; the shell falls back to its own cwd tracking.
        }
    }
}
/** Client plugin body. */
export function apply(ctx) {
    // Tray → page bridge listener, registered before anything fallible: the
    // shell retries its dispatch until __mgShellReady, so a listener that
    // never registers (card injection failure) would look like a dead button.
    // The effect disposer removes it on reload (HMR / include.refresh), so a
    // re-install never stacks duplicate handlers.
    try {
        ctx.effect(() => {
            const listener = (event) => handleShellCommand(ctx, event);
            window.addEventListener('mg:shell-command', listener);
            return () => window.removeEventListener('mg:shell-command', listener);
        }, 'dsh-hub: tray shell-command bridge');
    }
    catch (error) {
        // ctx.effect unusable (unexpected) — fall back to an unmanaged listener
        // so the tray button still works; this path is not expected in practice.
        console.warn('[dsh-hub] shell-command effect failed, using unmanaged listener:', error);
        window.addEventListener('mg:shell-command', (event) => handleShellCommand(ctx, event));
    }
    // Expose page functions for the current workspace: one sends the path over
    // IPC to the desktop host (tray "Open workspace"), one returns it directly
    // for in-page consumers (right sidebar file/git tabs).
    ;
    window.__mgSendCurrentWorkspace
        = () => sendCurrentWorkspace(ctx);
    window.__mgGetCurrentWorkspace
        = () => currentWorkspace(ctx)?.path ?? null;
    // Report the focused session to the desktop host over IPC so its toast
    // policy can tell "watching the finished session" (sound only) apart from
    // "watching another session" (toast too). `ctx.sessions.list.current` is
    // the persisted current selection — the session the UI is showing. The
    // list store republishes on any summary change, so a last-sent cache keeps
    // the channel quiet unless the focus actually moved.
    let lastSentFocus;
    const reportFocus = () => {
        try {
            const client = ctx;
            const current = client.sessions?.list?.getSnapshot?.()?.current;
            if (current === lastSentFocus)
                return;
            lastSentFocus = current;
            const ipc = window.ipc;
            ipc?.postMessage(`mg:session-focus:${current === undefined ? '' : encodeURIComponent(current)}`);
        }
        catch {
            // Best-effort; the host falls back to always-toast when focus is unknown.
        }
    };
    reportFocus();
    try {
        const list = ctx.sessions?.list;
        const unsubscribe = list?.subscribe?.(reportFocus);
        ctx.effect(() => () => unsubscribe?.(), 'dsh-hub: session focus reporter');
    }
    catch (error) {
        console.warn('[dsh-hub] session focus reporter failed:', error);
    }
    const slots = ctx.get('slots');
    if (slots === undefined)
        return;
    // Inject the card + right-sidebar stylesheets (idempotent).
    injectCardStyle();
    injectRightSidebarStyle();
    // Restore the persisted skin once the config API is reachable. If the user
    // already picked a skin in this page lifetime (settings card), the restore
    // must not clobber it — the flag makes the race harmless.
    void fetchStoredSkin().then((skinId) => {
        if (hasUserPickedSkin())
            return;
        applySkin(skinId);
    });
    // Same for the background image: restore the saved choice unless the user
    // already picked one in this page lifetime.
    void fetchStoredBackground().then((backgroundId) => {
        if (hasUserPickedBackground())
            return;
        applyBackground(backgroundId);
    });
    try {
        slots.inject('settings.plugin.item', function* () {
            yield slots.register({
                name: 'settings.plugin.item',
                // rc.7 keyed slot：卡片按 settings namespace key 派发（tab-store 匹配 served）。
                // key 必须 = SETTINGS_NS（'dsh-hub'），否则卡片永不渲染。
                key: 'dsh-hub',
                // rc.7 用 priority（替代旧版 order）。
                priority: 30,
            }, (props) => DesktopSettingsCard(props));
        });
    }
    catch (error) {
        // Card mounting must never take down the tray bridge.
        console.warn('[dsh-hub] settings card injection failed:', error);
    }
    // Right sidebar: mount a body portal like dsh-better-sidebar. This keeps
    // the sidebar independent of the official details column (so blank/new
    // conversations can still expand it) and lets the official details panel
    // coexist immediately to its left when dsh opens tool details.
    try {
        ctx.effect(() => {
            const host = document.createElement('div');
            host.id = 'dsh-hub-right-sidebar-root';
            host.setAttribute('data-dsh-hub-right-sidebar', '');
            document.body.appendChild(host);
            const root = createRoot(host);
            root.render(createElement(RightSidebar, { ctx }));
            return () => {
                root.unmount();
                host.remove();
            };
        }, 'dsh-hub: right sidebar mount');
    }
    catch (error) {
        console.warn('[dsh-hub] right sidebar mount failed:', error);
    }
    // Pinned conversations (置顶会话): augment the official session list with
    // stable anchors (no CSS-module hashes). The effect disposer tears down all
    // injected DOM on reload, so HMR / include.refresh rebuild cleanly.
    try {
        ctx.effect(() => installPinnedConversations(ctx), 'dsh-hub: pinned conversations');
    }
    catch (error) {
        console.warn('[dsh-hub] pinned conversations install failed:', error);
    }
}
