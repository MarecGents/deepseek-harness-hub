#!/usr/bin/env node
/**
 * generate-icon.mjs — renders the dsh favicon into PNG (light + dark) and
 * packages an .ico for the desktop shortcut. Runs at install time; the SVG is
 * the repo's official favicon (apps/web/public/favicon.svg, copied verbatim).
 */

import { Resvg } from '@resvg/resvg-js'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ASSETS = join(dirname(dirname(fileURLToPath(import.meta.url))), 'assets')

/**
 * The favicon carries `@media (prefers-color-scheme: dark)` inside <style>,
 * which the resvg/usvg pipeline does not evaluate. Strip the style block and
 * bake the fill colour into the path so the render is deterministic.
 */
function svgWithFill(svg, fill) {
  return svg
    .replace(/<style>[\s\S]*?<\/style>/, '')
    .replace(/fill="#[0-9a-fA-F]+"/, `fill="${fill}"`)
}

function renderPng(svgPath, fill, size) {
  const svg = svgWithFill(readFileSync(svgPath, 'utf8'), fill)
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: size },
    background: 'rgba(0,0,0,0)',
  })
  return resvg.render().asPng()
}

/** Wrap a PNG in an ICO container (ICO supports embedded PNG images). */
function pngToIco(png, size) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0) // reserved
  header.writeUInt16LE(1, 2) // type: icon
  header.writeUInt16LE(1, 4) // one image
  const entry = Buffer.alloc(16)
  entry[0] = size === 256 ? 0 : size // width (0 = 256)
  entry[1] = size === 256 ? 0 : size // height
  entry[2] = 0 // palette
  entry[3] = 0 // reserved
  entry.writeUInt16LE(1, 4) // planes
  entry.writeUInt16LE(32, 6) // bit count
  entry.writeUInt32LE(png.length, 8) // bytes in resource
  entry.writeUInt32LE(22, 12) // image offset
  return Buffer.concat([header, entry, png])
}

const svgPath = join(ASSETS, 'dsh-favicon.svg')
// Dark variant: white glyph, for tray/taskbar/window icons on dark surfaces.
const darkPng = renderPng(svgPath, '#ffffff', 256)
writeFileSync(join(ASSETS, 'dsh-favicon-dark.png'), darkPng)
// Light variant: black glyph, for the desktop shortcut on light wallpapers.
const lightPng = renderPng(svgPath, '#000000', 256)
writeFileSync(join(ASSETS, 'dsh-favicon.png'), lightPng)
// Shortcut icon: 32px ICO (light variant).
const ico = pngToIco(renderPng(svgPath, '#000000', 32), 32)
writeFileSync(join(ASSETS, 'dsh-favicon.ico'), ico)

console.log('[mg-dsh-desktop] icons generated: dsh-favicon.png (light), dsh-favicon-dark.png (dark), dsh-favicon.ico (shortcut)')
