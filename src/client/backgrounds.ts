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
  id: string
  name: string
  description: string
  /** Same-origin URL served by the dsh-hub config API. */
  url: string
}

/** Sentinel id meaning "no background image / native look". */
export const DEFAULT_BACKGROUND_ID = 'none'

/** The built-in background images. Add new entries here + assets/backgrounds. */
export const BACKGROUNDS: DshBackground[] = [
  {
    id: 'boat',
    name: '远航',
    description: '蓝天碧海，卡通远航',
    url: '/api/dsh-hub/backgrounds/boat.jpg',
  },
]

/** Find a background by id (undefined for unknown or `none`). */
export function findBackground(id: string): DshBackground | undefined {
  if (id === DEFAULT_BACKGROUND_ID) return undefined
  return BACKGROUNDS.find((background) => background.id === id)
}

/**
 * Apply (or clear) a background by injecting/updating one
 * `<style id="mg-dsh-background">` element in the document head.
 *
 * The image must land on the app FRAME layer, not `body`: dsh's AppFrame
 * paints an opaque `var(--dsw-alias-bg-base)` over the whole viewport, so a
 * body-level image is invisible. The frame is the only `#root` descendant
 * carrying an inline `grid-template-columns` (stable structure, no CSS-module
 * hash — see docs/关键踩坑记录.md #32).
 *
 * The frame's own columns then cover the image: the center column's content
 * root (`[data-slot="conversation"] > div` — official slot contract, not a
 * hash) paints an opaque base color. The second rule transparentizes ONLY
 * that content root, so the image shows through the conversation area while
 * the sidebars keep their skin fill. The overlay is a second background layer
 * (`linear-gradient` + image) so it sits under the content with zero
 * stacking-context risk; the frame's token background-color stays as the
 * loading/fallback color.
 */
export function applyBackground(backgroundId: string): void {
  let style = document.getElementById('mg-dsh-background') as HTMLStyleElement | null
  if (style === null) {
    style = document.createElement('style')
    style.id = 'mg-dsh-background'
    document.head.appendChild(style)
  }
  const background = findBackground(backgroundId)
  if (background === undefined) {
    style.textContent = ''
    return
  }
  style.textContent = `#root div[style*="grid-template-columns"]{` +
    `background-image:linear-gradient(rgba(0,0,0,.25),rgba(0,0,0,.25)),url("${background.url}") !important;` +
    `background-size:cover,cover !important;` +
    `background-position:center !important;` +
    `background-repeat:no-repeat !important;` +
    `background-attachment:fixed !important;` +
    `}` +
    `#root div[style*="grid-template-columns"] [data-slot="conversation"] > div{` +
    `background-color:transparent !important;` +
    `}`
}

/** True once the user explicitly picked a background in this page lifetime.
 * The boot background restore must not clobber a user pick that raced it. */
let userPickedBackground = false

/** Mark that the user explicitly picked a background (settings card). */
export function markBackgroundUserPicked(): void {
  userPickedBackground = true
}

/** Whether the user already picked a background in this page lifetime. */
export function hasUserPickedBackground(): boolean {
  return userPickedBackground
}

/** Read the persisted background id through the plugin's config API. */
export async function fetchStoredBackground(): Promise<string> {
  try {
    const res = await fetch('/api/dsh-hub/config')
    if (!res.ok) return DEFAULT_BACKGROUND_ID
    const body = (await res.json()) as { ok?: boolean; value?: { background?: string } }
    const background = body.ok === true ? body.value?.background : undefined
    return typeof background === 'string' && background !== '' ? background : DEFAULT_BACKGROUND_ID
  } catch {
    return DEFAULT_BACKGROUND_ID
  }
}
