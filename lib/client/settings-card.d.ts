/**
 * Appearance center — the single settings entry for the Tauri shell. It is
 * registered as a first-level settings.section ("外观中心") and combines the
 * desktop shell configuration (window size, theme, tray behavior, desktop
 * icon) through this plugin's own HTTP routes with the embedded dsh-web-ui
 * appearance panel (skins / backgrounds / wallpapers) via
 * `window.__dshAppearanceCenter__`, which persists to its own `appearance`
 * settings namespace and migrates this card's legacy skin/background config
 * once. The standalone "皮肤中心" section and the old "DSH HUB 设置" plugin
 * card are no longer registered — one entry, one surface.
 *
 * The card renders only while the host serves the config API, which happens
 * only when the process was launched by this project (desktop shortcut /
 * `dsh-hub`); a plain command-line `dsh web` never mounts the bundle at all.
 */
import { type ReactNode } from 'react';
/** Owner share of a plugin card (the section supplies nothing). */
export interface DesktopSettingsCardProps {
    /** Marker field: card owner props are intentionally empty. */
    children?: never;
}
/** Render the desktop-shell settings card. */
export declare function DesktopSettingsCard(_props: DesktopSettingsCardProps): ReactNode;
/**
 * The settings.section wrapper for the appearance center: one list that
 * stacks the card rows, matching the section chrome of first-level settings
 * pages (the standalone "皮肤中心" section used the same shape).
 */
export declare function AppearanceCenterSection(props: DesktopSettingsCardProps): ReactNode;
