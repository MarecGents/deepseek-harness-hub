/**
 * Background registry — optional full-page background images for the dsh web
 * UI. Unlike skins (color tokens) this injects a plain `body` background-image
 * stylesheet. The images themselves are served by the host route
 * `/api/dsh-hub/backgrounds/<file>` from `assets/backgrounds/`.
 *
 * The `none` id is the sentinel: it removes the injected stylesheet so the
 * native/skin background is used.
 *
 * @module dsh-hub/client
 * @category Client (plugin UI)
 */
/** One selectable background image. */
export interface DshBackground {
    id: string;
    name: string;
    description: string;
    /** Same-origin URL served by the dsh-hub config API. */
    url: string;
}
/** Sentinel id meaning "no background image / native look". */
export declare const DEFAULT_BACKGROUND_ID = "none";
/** The built-in background images. Add new entries here + assets/backgrounds. */
export declare const BACKGROUNDS: DshBackground[];
/** Find a background by id (undefined for unknown or `none`). */
export declare function findBackground(id: string): DshBackground | undefined;
/**
 * Apply (or clear) a background by injecting/updating one
 * `<style id="mg-dsh-background">` element in the document head.
 *
 * The image must land on the app FRAME layer, not `body`: dsh's AppFrame
 * paints an opaque base over the whole viewport, so a body-level image is
 * invisible. The frame is the only SECOND-level `#root` grandchild carrying an inline
 * `grid-template-columns` (stable structure, no CSS-module hash — see
 * docs/关键踩坑记录.md #32). The selector is deliberately the child-combinator
 * chain `#root > div > div[...]`: a bare `#root div[...]` also matches every
 * in-page grid that carries inline columns (e.g. the usage-stats tables),
 * which got the user's background image painted over them (踩坑 #96).
 *
 * The frame's columns then cover the image with opaque surfaces, so the
 * injected rules ALSO give each column's surface a translucent base color:
 * left bar = `--dsw-specific-sidebar-fill`, center/details content roots
 * (`[data-slot="conversation"|"details"] > div`, official slot contracts) =
 * `--dsw-alias-bg-base` — each at 75% opacity (color-mix), letting the frame
 * background image show through ~25% (user-specified 20-30%) across ALL three
 * columns while keeping the surfaces readable. The overlay is a second
 * background layer (`linear-gradient` + image) so it sits under the content
 * with zero stacking-context risk; the frame's token background-color stays
 * as the loading/fallback color.
 */
export declare function applyBackground(backgroundId: string): void;
/** Mark that the user explicitly picked a background (settings card). */
export declare function markBackgroundUserPicked(): void;
/** Whether the user already picked a background in this page lifetime. */
export declare function hasUserPickedBackground(): boolean;
/** Read the persisted background id through the plugin's config API. */
export declare function fetchStoredBackground(): Promise<string>;
