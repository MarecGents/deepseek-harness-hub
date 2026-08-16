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
    style.textContent = `body{` +
        `background-image:url("${background.url}") !important;` +
        `background-size:cover !important;` +
        `background-position:center !important;` +
        `background-repeat:no-repeat !important;` +
        `background-attachment:fixed !important;` +
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
