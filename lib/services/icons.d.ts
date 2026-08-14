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
/** Tray-sized version of the dark favicon (falls back to the accent tile). */
export declare function dshFaviconTray(): Icon;
