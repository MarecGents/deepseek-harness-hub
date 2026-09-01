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
import { type PermissionPolicyChipProps } from './permission-policy-chip.tsx';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface SlotMap {
        /**
         * Left end of the composer tool row, beside the official permission-preset
         * chip — the seat for the dsh-hub permission-policy tier chip. Runtime
         * owner share is ui-conversation's InputZone; this structural subset is
         * all the chip reads (the session id), mirroring the local declare
         * pattern above (the official package is not a compile-time dependency).
         */
        'conversation.input.left': {
            kind: 'list';
            scope: 'session';
            owner: PermissionPolicyChipProps;
        };
        /**
         * One top-level page of the settings dialog (nav rail). Declared at
         * runtime by ui-settings-general; mirrors its contract (order sorts the
         * nav, label renders the nav cell, inject supplies section props).
         * 2026-09-01 audit: the legacy `settings.plugin.item` declaration was
         * removed — the settings card ships as a first-class section now.
         */
        'settings.section': {
            kind: 'list';
            scope: 'root';
            owner: SettingsSectionOwnerProps;
        };
    }
}
/** Owner share of a settings section (the dialog supplies close). */
export interface SettingsSectionOwnerProps {
    /** Close the settings dialog (rendered by the section's own chrome). */
    close?: () => void;
}
/**
 * Required services: slots (card), workspaces + sessions (tray + sidebar data).
 * NOTE: modelDirectories is deliberately NOT injected — the model-seat override
 * (model-select.tsx) resolves it via ctx.get() with a guard, so a missing
 * service degrades to "built-in seat" instead of PENDING the whole plugin.
 */
export declare const inject: string[];
/** Client plugin body. */
export declare function apply(ctx: ClientContext): void;
