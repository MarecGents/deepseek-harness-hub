/**
 * mg-dsh-desktop browser half — registers a settings card into the dsh
 * settings → plugins page and bridges tray commands from the desktop shell.
 *
 * The card reads/writes the shell config through this plugin's own HTTP
 * routes, so it works without dsh's settings namespace allowlist (which does
 * not expose third-party namespaces yet). The card renders only while the
 * host serves the config API, which happens only when the process was
 * launched by this project (desktop shortcut / `mg-dsh`); a plain
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
 * @module mg-dsh-desktop/client
 */
import { DesktopSettingsCard } from "./settings-card.js";
import { injectCardStyle } from "./style.js";
import { RightSidebar } from "./right-sidebar.js";
import { injectRightSidebarStyle } from "./right-sidebar-style.js";
window.__mgShellReady = true;
/** Required services: slots (card), workspaces + sessions (tray), layout (right sidebar). */
export const inject = ['slots', 'workspaces', 'sessions', 'layout'];
/** Resolve the current session's workspace from the client runtime. */
function currentWorkspace(ctx) {
    const client = ctx;
    const sessions = client.sessions;
    const workspaces = client.workspaces;
    if (sessions === undefined || workspaces === undefined)
        return null;
    const snapshot = workspaces.list?.getSnapshot?.();
    const items = snapshot?.items ?? [];
    const current = sessions.list?.getSnapshot?.()?.current;
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
    if (detail?.command !== 'new-task')
        return;
    // Official New Session flow (sidebar "+" button path). Deliberately pass no
    // explicit workspaceId: startSession resolves the current session's
    // workspace first, then the recent workspace, then clears.
    const workspaces = ctx.workspaces;
    if (workspaces === undefined || workspaces.startSession === undefined) {
        console.warn('[mg-dsh-desktop] new-task ignored: workspaces service unavailable');
        return;
    }
    console.log('[mg-dsh-desktop] new-task (current session workspace)');
    workspaces.startSession();
}
/** Client plugin body. */
export function apply(ctx) {
    // Tray → page bridge listener, registered before anything fallible: the
    // shell retries its dispatch until __mgShellReady, so a listener that
    // never registers (card injection failure) would look like a dead button.
    window.addEventListener('mg:shell-command', (event) => handleShellCommand(ctx, event));
    window.__mgSendCurrentWorkspace
        = () => sendCurrentWorkspace(ctx);
    const slots = ctx.get('slots');
    if (slots === undefined)
        return;
    // Inject the card + right-sidebar stylesheets (idempotent).
    injectCardStyle();
    injectRightSidebarStyle();
    try {
        slots.inject('settings.plugin.item', function* () {
            yield slots.register({
                name: 'settings.plugin.item',
                id: 'mg-dsh-desktop',
                order: 30,
            }, (props) => DesktopSettingsCard(props));
        });
    }
    catch (error) {
        // Card mounting must never take down the tray bridge.
        console.warn('[mg-dsh-desktop] settings card injection failed:', error);
    }
    // Right sidebar: occupy the official details slot and open it by default.
    // priority -1 beats the official ui-conversation DetailsPanel (priority 0),
    // so our right sidebar is the live occupant.
    try {
        slots.register({
            name: 'details',
            priority: -1,
            inject: () => {
                const layout = ctx.layout;
                return {
                    openDetails: () => { layout?.openDetails(); },
                    closeDetails: () => { layout?.closeDetails(); },
                };
            },
        }, RightSidebar);
    }
    catch (error) {
        console.warn('[mg-dsh-desktop] right sidebar registration failed:', error);
    }
    // The layout panel actions may not be wired until the root entry's first
    // render; retry opening the details column a few times.
    let tries = 0;
    const tryOpenDetails = () => {
        const layout = ctx.layout;
        if (layout === undefined) {
            if (++tries < 20)
                setTimeout(tryOpenDetails, 100);
            return;
        }
        try {
            layout.openDetails();
        }
        catch {
            if (++tries < 20)
                setTimeout(tryOpenDetails, 100);
        }
    };
    setTimeout(tryOpenDetails, 100);
}
