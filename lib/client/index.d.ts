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
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface SlotMap {
        /**
         * One plugin's card inside the plugin configuration section. Declared at
         * runtime by ui-settings-plugins; this shape mirrors its contract.
         * rc.7 起 slot 从 `list` 改为 `keyed`（卡片按 settings namespace key 派发）。
         */
        'settings.plugin.item': {
            kind: 'keyed';
            scope: 'root';
            owner: SettingsPluginItemOwnerProps;
        };
        /**
         * The first-level settings section that hosts the unified appearance
         * center (window/theme/tray shell config + embedded appearance panel).
         * Declared here because the hub's slot package version does not ship the
         * settings.section slot (dsh-web-ui's skin-center extends it separately).
         */
        'settings.section': {
            kind: 'keyed';
            scope: 'root';
            owner: DesktopSettingsCardProps;
        };
        /**
         * The conversation-bottom input dock (declared by ui-conversation). The
         * terminal command dock rides this list slot below the composer input.
         */
        'conversation.input.dock': {
            kind: 'list';
            scope: 'session';
            owner: Record<string, never>;
        };
        /**
         * Sidebar footer action (declared by ui-sidebar): the 终端 entry rendered
         * beside/above Settings. Owner props carry the column's wide/rail state.
         */
        'sidebar.footer.action': {
            kind: 'list';
            scope: 'root';
            owner: {
                wide: boolean;
            };
        };
    }
}
/** Owner share of a plugin card (the section supplies nothing). */
export interface SettingsPluginItemOwnerProps {
    /** Marker field: card owner props are intentionally empty. */
    children?: never;
}
/** Required services: slots (card), workspaces + sessions (tray + sidebar data). */
export declare const inject: string[];
/** Client plugin body. */
export declare function apply(ctx: ClientContext): void;
