export interface Icon {
    data: Uint8Array;
    width: number;
    height: number;
}
/**
 * Load a bundled PNG as raw RGBA. `posixPath` is relative to this module,
 * using forward slashes (the URL constructor treats `\` as an escape, so
 * path.join output must never be fed to it). From both `src/services/` and
 * the compiled `lib/services/` the package-root `assets/` sits two levels up.
 */
export declare function loadPngRgba(posixPath: string): Icon | undefined;
/** 16×16 DeepSeek-blue accent tile used when the real icon asset is absent. */
export declare function accentTile(): Icon;
/** Convenience: the dark (white-glyph) favicon for title bars and tray. */
export declare function dshFaviconDark(): Icon | undefined;
/** Convenience: the black-glyph favicon for light surfaces (window title bar). */
export declare function dshFaviconBlack(): Icon | undefined;
/** Sentinel id = the theme-aware DeepSeek whale (official favicon). */
export declare const DEFAULT_DESKTOP_ICON_ID = "default";
/** Built-in selectable desktop icons: id → bundled PNG (two levels up to assets/). */
export declare const DESKTOP_ICON_ASSETS: Readonly<Record<string, string>>;
/**
 * Whether a desktop-icon id resolves ('default' is the theme-aware whale,
 * everything else must be a bundled asset).
 * @param id - the persisted `desktopIcon` config value.
 */
export declare function isKnownDesktopIcon(id: string): boolean;
/**
 * Load one selectable desktop icon as raw RGBA. `'default'` has no custom
 * asset — callers fall through to the theme-aware favicon instead, so this
 * returns `undefined` for it.
 * @param id - a known non-default desktop-icon id.
 * @returns the decoded icon, or undefined for `'default'` / unknown ids.
 */
export declare function loadDesktopIcon(id: string): Icon | undefined;
/** The favicon as a `data:` URL — inlined into the splash page's <img>. */
export declare function dshFaviconDataUrl(): string | undefined;
/**
 * Area-average downscale — the shipped favicon is a 256px asset, but the
 * system tray wants a 16px glyph. Averaging over the covered source block
 * (with alpha weighting) keeps the white glyph crisp at any target size.
 * Returns the same icon when `size` is already >= its width/height.
 */
export declare function downscaleIcon(icon: Icon, size: number): Icon;
/** Standard Windows tray glyph size in logical pixels (16px at 96 DPI). */
export declare const TRAY_ICON_SIZE = 16;
/**
 * Tray-sized favicon for the given surface theme: a dark tray (OS dark
 * mode) wants the white glyph, a light tray wants the black one — a white
 * whale on a light tray is invisible, exactly like the taskbar glyph.
 * Falls back to the accent tile when the asset is missing.
 */
export declare function dshFaviconTray(dark: boolean): Icon;
