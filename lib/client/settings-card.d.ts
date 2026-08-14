/**
 * mg-dsh-desktop settings card — one card in the dsh settings → plugins
 * page, styled after the official PluginCard (collapsible header, themed
 * controls, save/discard footer). It edits the shell config (window size,
 * theme, tray behavior) through this plugin's own HTTP routes, and shows the
 * usage-stats ledger.
 *
 * The card renders only while the host serves the config API, which happens
 * only when the process was launched by this project (desktop shortcut /
 * `mg-dsh`); a plain command-line `dsh web` never mounts the bundle at all.
 */
import { type ReactNode } from 'react';
/** Owner share of a plugin card (the section supplies nothing). */
export interface DesktopSettingsCardProps {
    /** Marker field: card owner props are intentionally empty. */
    children?: never;
}
/** Render the desktop-shell settings card. */
export declare function DesktopSettingsCard(_props: DesktopSettingsCardProps): ReactNode;
