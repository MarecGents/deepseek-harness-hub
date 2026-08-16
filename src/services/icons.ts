/**
 * Icon loading — the shell ships dsh's favicon in multiple variants; this
 * module owns decoding and selection so the window/tray code never touches
 * pixel formats. Falls back to a plain accent tile when assets are missing.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { decodePngRgba } from './png-decode.js'

export interface Icon {
  data: Uint8Array
  width: number
  height: number
}

/**
 * Load a bundled PNG as raw RGBA. `posixPath` is relative to this module,
 * using forward slashes (the URL constructor treats `\` as an escape, so
 * path.join output must never be fed to it). From both `src/services/` and
 * the compiled `lib/services/` the package-root `assets/` sits two levels up.
 */
export function loadPngRgba(posixPath: string): Icon | undefined {
  try {
    const { data, width, height } = decodePngRgba(
      fileURLToPath(new URL(posixPath, import.meta.url)),
    )
    return { data, width, height }
  } catch {
    return undefined
  }
}

/** 16×16 DeepSeek-blue accent tile used when the real icon asset is absent. */
export function accentTile(): Icon {
  const size = 16
  const data = new Uint8Array(size * size * 4)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const off = (y * size + x) * 4
      const inner = x >= 3 && x < 13 && y >= 3 && y < 13
      data[off] = inner ? 77 : 22
      data[off + 1] = inner ? 130 : 56
      data[off + 2] = inner ? 254 : 140
      data[off + 3] = 255
    }
  }
  return { data, width: size, height: size }
}

/** Convenience: the dark (white-glyph) favicon for title bars and tray. */
export function dshFaviconDark(): Icon | undefined {
  // src/services/ and lib/services/ are both two levels below the package
  // root where assets/ lives — forward slashes keep URL resolution correct.
  return loadPngRgba('../../assets/dsh-favicon-dark.png')
}

/** Convenience: the black-glyph favicon for light surfaces (window title bar). */
export function dshFaviconBlack(): Icon | undefined {
  return loadPngRgba('../../assets/dsh-favicon.png')
}

/** The favicon as a `data:` URL — inlined into the splash page's <img>. */
export function dshFaviconDataUrl(): string | undefined {
  try {
    const bytes = readFileSync(new URL('../../assets/dsh-favicon-dark.png', import.meta.url))
    return `data:image/png;base64,${bytes.toString('base64')}`
  } catch {
    return undefined
  }
}

/**
 * Area-average downscale — the shipped favicon is a 256px asset, but the
 * system tray wants a 16px glyph. Averaging over the covered source block
 * (with alpha weighting) keeps the white glyph crisp at any target size.
 * Returns the same icon when `size` is already >= its width/height.
 */
export function downscaleIcon(icon: Icon, size: number): Icon {
  const { width, height, data } = icon
  if (size >= width || size >= height) return icon
  const out = new Uint8Array(size * size * 4)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Source block covered by this target pixel (clamped to the asset).
      const x0 = Math.floor((x * width) / size)
      const x1 = Math.max(x0 + 1, Math.floor(((x + 1) * width) / size))
      const y0 = Math.floor((y * height) / size)
      const y1 = Math.max(y0 + 1, Math.floor(((y + 1) * height) / size))
      let r = 0, g = 0, b = 0, a = 0
      let count = 0
      for (let sy = y0; sy < y1; sy++) {
        for (let sx = x0; sx < x1; sx++) {
          const off = (sy * width + sx) * 4
          const alpha = data[off + 3]
          r += data[off] * alpha
          g += data[off + 1] * alpha
          b += data[off + 2] * alpha
          a += alpha
          count++
        }
      }
      const dst = (y * size + x) * 4
      if (a === 0) {
        out[dst] = out[dst + 1] = out[dst + 2] = out[dst + 3] = 0
      } else {
        out[dst] = Math.round(r / a)
        out[dst + 1] = Math.round(g / a)
        out[dst + 2] = Math.round(b / a)
        out[dst + 3] = Math.round(a / count)
      }
    }
  }
  return { data: out, width: size, height: size }
}

/** Standard Windows tray glyph size in logical pixels (16px at 96 DPI). */
export const TRAY_ICON_SIZE = 16

/**
 * Tray-sized favicon for the given surface theme: a dark tray (OS dark
 * mode) wants the white glyph, a light tray wants the black one — a white
 * whale on a light tray is invisible, exactly like the taskbar glyph.
 * Falls back to the accent tile when the asset is missing.
 */
export function dshFaviconTray(dark: boolean): Icon {
  const icon = dark ? dshFaviconDark() : dshFaviconBlack()
  return icon === undefined ? accentTile() : downscaleIcon(icon, TRAY_ICON_SIZE)
}
