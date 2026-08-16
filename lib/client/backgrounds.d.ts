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
 */
export declare function applyBackground(backgroundId: string): void;
/** Mark that the user explicitly picked a background (settings card). */
export declare function markBackgroundUserPicked(): void;
/** Whether the user already picked a background in this page lifetime. */
export declare function hasUserPickedBackground(): boolean;
/** Read the persisted background id through the plugin's config API. */
export declare function fetchStoredBackground(): Promise<string>;
