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
/** Sentinel id meaning "no background image / native look". */
export const DEFAULT_BACKGROUND_ID = 'none';
/** The built-in background images. Add new entries here + assets/backgrounds. */
export const BACKGROUNDS = [
    {
        id: 'boat',
        name: '远航',
        description: '蓝天碧海，卡通远航',
        url: '/api/dsh-hub/backgrounds/boat.jpg',
    },
];
/** Find a background by id (undefined for unknown or `none`). */
export function findBackground(id) {
    if (id === DEFAULT_BACKGROUND_ID)
        return undefined;
    return BACKGROUNDS.find((background) => background.id === id);
}
/**
 * Apply (or clear) a background by injecting/updating one
 * `<style id="mg-dsh-background">` element in the document head.
 *
 * The image must land on the app FRAME layer, not `body`: dsh's AppFrame
 * paints an opaque base over the whole viewport, so a body-level image is
 * invisible. The frame is the only `#root` descendant carrying an inline
 * `grid-template-columns` (stable structure, no CSS-module hash — see
 * docs/关键踩坑记录.md #32).
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
export function applyBackground(backgroundId) {
    let style = document.getElementById('mg-dsh-background');
    if (style === null) {
        style = document.createElement('style');
        style.id = 'mg-dsh-background';
        document.head.appendChild(style);
    }
    const background = findBackground(backgroundId);
    if (background === undefined) {
        style.textContent = '';
        return;
    }
    style.textContent = `#root div[style*="grid-template-columns"]{` +
        `background-image:linear-gradient(rgba(0,0,0,.25),rgba(0,0,0,.25)),url("${background.url}") !important;` +
        `background-size:cover,cover !important;` +
        `background-position:center !important;` +
        `background-repeat:no-repeat !important;` +
        `background-attachment:fixed !important;` +
        `}` +
        // Left bar: translucent skin fill (75% base, image shows through ~25%).
        // The sidebar's content root also paints the fill, so both the column
        // and its slot content root ([data-slot="sidebar"] > div) go translucent.
        `#root div[style*="grid-template-columns"] > div:first-child,` +
        `#root div[style*="grid-template-columns"] [data-slot="sidebar"] > div{` +
        `background-color:color-mix(in srgb, var(--dsw-specific-sidebar-fill) 75%, transparent) !important;` +
        `}` +
        // Center column content root (conversation area).
        `#root div[style*="grid-template-columns"] [data-slot="conversation"] > div{` +
        `background-color:color-mix(in srgb, var(--dsw-alias-bg-base) 75%, transparent) !important;` +
        `}` +
        // Details column container + its content root (when expanded).
        `#root div[style*="grid-template-columns"] > div:nth-of-type(3),` +
        `#root div[style*="grid-template-columns"] [data-slot="details"] > div{` +
        `background-color:color-mix(in srgb, var(--dsw-alias-bg-base) 75%, transparent) !important;` +
        `}`;
}
/** True once the user explicitly picked a background in this page lifetime.
 * The boot background restore must not clobber a user pick that raced it. */
let userPickedBackground = false;
/** Mark that the user explicitly picked a background (settings card). */
export function markBackgroundUserPicked() {
    userPickedBackground = true;
}
/** Whether the user already picked a background in this page lifetime. */
export function hasUserPickedBackground() {
    return userPickedBackground;
}
/** Read the persisted background id through the plugin's config API. */
export async function fetchStoredBackground() {
    try {
        const res = await fetch('/api/dsh-hub/config');
        if (!res.ok)
            return DEFAULT_BACKGROUND_ID;
        const body = (await res.json());
        const background = body.ok === true ? body.value?.background : undefined;
        return typeof background === 'string' && background !== '' ? background : DEFAULT_BACKGROUND_ID;
    }
    catch {
        return DEFAULT_BACKGROUND_ID;
    }
}
