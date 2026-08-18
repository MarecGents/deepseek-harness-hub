/**
 * Desktop-icon registry — selectable window/taskbar icons for the desktop
 * shell. Unlike skins (tokens) or backgrounds (page injection), the icon is
 * applied HOST-side (window/taskbar glyph) by `src/desktop.ts`; this module
 * only enumerates the choices and their preview thumbnails for the settings
 * card. Previews are served by `/api/dsh-hub/icons/<file>` from
 * `assets/icons/` (the `default` alias serves the official whale favicon).
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
/** Sentinel id = the theme-aware DeepSeek whale (official favicon). */
export declare const DEFAULT_DESKTOP_ICON_ID = "default";
/** The built-in desktop icons. Add entries here + assets/icons/*.png. */
export declare const DESKTOP_ICONS: DshDesktopIcon[];
/** Find a desktop icon by id (includes the `default` entry). */
export declare function findDesktopIcon(id: string): DshDesktopIcon | undefined;
