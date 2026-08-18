/**
 * Sounds API — static sound assets for the desktop shell (Q4).
 *
 * The browser-side player (shell-init.js `__mgPlaySound`) references the WAV
 * files as `/api/dsh-hub/sounds/<file>`; only files bundled under
 * `assets/sounds/` are served (regex-whitelisted, no path traversal).
 * Added because the Tauri shell plays sounds in the BROWSER (HTMLAudio),
 * unlike the WebView2-era Node-side winmm playback (helpers/sound.ts).
 *
 * @module dsh-hub/server/sounds-api
 * @category Server + Services (plugin-owned routes, mirrors backgrounds-api)
 */

import { readFileSync } from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { WebRoute } from '@deepseek-ai/dsh-host-webserver'

/** Browser-facing base path of the sounds API. */
export const SOUNDS_API_PREFIX = '/api/dsh-hub/sounds'

/** Write a plain-text response. */
function text(res: ServerResponse, status: number, body: string): void {
  res.writeHead(status, { 'content-type': 'text/plain; charset=utf-8' })
  res.end(body)
}

/**
 * Build the sound routes (one prefix route serving the bundled WAV assets).
 * Only `[a-z0-9-]+.wav` filenames are accepted; a malformed percent-escape
 * answers 404 like any missing file.
 * @returns the route for `ctx.webServer.register`.
 */
export function makeSoundsRoutes(): WebRoute[] {
  return [
    {
      kind: 'prefix',
      path: SOUNDS_API_PREFIX,
      handler: (req: IncomingMessage, res: ServerResponse): Promise<void> => {
        if (req.method !== 'GET') {
          text(res, 405, 'method-not-allowed')
          return Promise.resolve()
        }
        let name = ''
        try {
          name = decodeURIComponent((req.url ?? '').split('?')[0].split('/').filter(Boolean).pop() ?? '')
        } catch {
          // Malformed percent-encoding — treat as not-found (same as backgrounds-api).
        }
        if (!/^[a-z0-9-]+\.wav$/i.test(name)) {
          text(res, 404, 'not-found')
          return Promise.resolve()
        }
        try {
          const bytes = readFileSync(new URL(`../../assets/sounds/${name}`, import.meta.url))
          res.writeHead(200, { 'content-type': 'audio/wav', 'cache-control': 'public, max-age=86400' })
          res.end(bytes)
        } catch {
          // File missing from the bundle — same as any unknown asset.
          text(res, 404, 'not-found')
        }
        return Promise.resolve()
      },
    },
  ]
}
