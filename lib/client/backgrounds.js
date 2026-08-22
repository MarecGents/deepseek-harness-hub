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
    {
        id: 'yandere-home',
        name: '病娇·归家',
        description: '蓝发女仆鲸鱼娘「你终于回家了」——病娇向',
        url: '/api/dsh-hub/backgrounds/yandere-home.jpg',
    },
    {
        id: 'ds-vs-gpt',
        name: 'DS vs GPT',
        description: 'DeepSeek API 与 GPT API 萌系小摊对决',
        url: '/api/dsh-hub/backgrounds/ds-vs-gpt.jpg',
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
        // Left bar: the column itself paints an opaque fill — drop it so the
        // image shows through, then give the slot content root the single
        // translucent layer (90% fill + ~10% image, user-tuned from 25%). One
        // layer only: a second layer on the column would stack and hide the image.
        `#root div[style*="grid-template-columns"] > div:first-child{` +
        `background-color:transparent !important;` +
        `}` +
        `#root div[style*="grid-template-columns"] [data-slot="sidebar"] > div{` +
        `background-color:color-mix(in srgb, var(--dsw-specific-sidebar-fill) 90%, transparent) !important;` +
        `}` +
        // Center column content root (conversation area) — keeps 25% show-through.
        `#root div[style*="grid-template-columns"] [data-slot="conversation"] > div{` +
        `background-color:color-mix(in srgb, var(--dsw-alias-bg-base) 75%, transparent) !important;` +
        `}` +
        // Details column: the column itself is transparent by default (no rule
        // needed); only its content root gets the translucent layer (10%).
        `#root div[style*="grid-template-columns"] [data-slot="details"] > div{` +
        `background-color:color-mix(in srgb, var(--dsw-alias-bg-base) 90%, transparent) !important;` +
        `}` +
        // dsh-hub's own right sidebar is a body portal OUTSIDE #root. Translucent
        // backgrounds on its fixed panel do NOT sample what is behind it in
        // WebView2/Chromium compositing (pixel-verified: color-mix and opacity
        // both read as solid), so the image is painted ON the panel itself as a
        // multi-layer background: a 90% sidebar-fill gradient layer on TOP of the
        // (masked) image yields the same ~10% show-through as the left bar.
        // background-attachment: fixed keeps the image aligned with the frame.
        `#dsh-hub-right-sidebar-root .mg-rs-root{` +
        `background-image:` +
        `linear-gradient(color-mix(in srgb, var(--dsw-specific-sidebar-fill) 90%, transparent), color-mix(in srgb, var(--dsw-specific-sidebar-fill) 90%, transparent)),` +
        `linear-gradient(rgba(0,0,0,.25),rgba(0,0,0,.25)),` +
        `url("${background.url}") !important;` +
        `background-size:cover,cover,cover !important;` +
        `background-position:center !important;` +
        `background-repeat:no-repeat !important;` +
        `background-attachment:fixed !important;` +
        `}` +
        // The panel's inner surfaces (cards, containers) must not stack another
        // layer over the painted image — make them transparent so the image shows.
        `#dsh-hub-right-sidebar-root .mg-rs-root [class*="mg-rs-"]{` +
        `background-color:transparent !important;` +
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
