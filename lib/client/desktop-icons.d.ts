/**
 * Desktop-icon registry — selectable window/taskbar icons for the desktop
 * shell (S6, PR #25). Unlike skins (tokens) or backgrounds (page injection),
 * the icon is applied HOST-side (native window + taskbar glyph): the settings
 * card persists the id via `/api/dsh-hub/config` and fires the Tauri
 * `set_desktop_icon` invoke down-link (page → Rust, ACL allow-set-desktop-icon);
 * the Rust shell applies the icon with `include_bytes!`-embedded PNGs
 * (src-tauri/src/helpers/theme.rs apply_desktop_icon).
 *
 * This module only enumerates the choices and their preview thumbnails for
 * the settings card. Previews are served by `/api/dsh-hub/icons/<file>` from
 * `assets/icons/` (the `default` alias serves the white-whale thumbnail so
 * the "default" option gets a preview too).
 *
 * @module dsh-hub/client
 * @category Client (plugin UI)
 */
/** One selectable desktop icon. */
export interface DshDesktopIcon {
    id: string;
    name: string;
    description: string;
    /** Same-origin thumbnail URL served by the dsh-hub icons API. */
    url: string;
}
/** Sentinel id = the theme-aware DeepSeek whale (白鲸/黑鲸跟随明暗主题). */
export declare const DEFAULT_DESKTOP_ICON_ID = "default";
/** The built-in desktop icons. Add entries here + assets/icons/*.png
 * (and the matching `include_bytes!` in src-tauri/src/helpers/theme.rs). */
export declare const DESKTOP_ICONS: DshDesktopIcon[];
/** Find a desktop icon by id (includes the `default` entry). */
export declare function findDesktopIcon(id: string): DshDesktopIcon | undefined;
