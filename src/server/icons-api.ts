/**
 * Icons API — static desktop-icon assets for the shell settings card (S6).
 *
 * The client desktop-icon registry (src/client/desktop-icons.ts) references
 * previews as `/api/dsh-hub/icons/<file>`; only files bundled under
 * `assets/icons/` are served (regex-whitelisted, no path traversal). The
 * `default.png` alias serves the white-whale thumbnail (copied from
 * `src-tauri/icons/icon-dark.png`) so the "default" option gets a preview.
 *
 * @module dsh-hub/server/icons-api
 * @category Server + Services (plugin-owned routes, mirrors backgrounds-api)
 */

import { readFileSync } from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { WebRoute } from '@deepseek-ai/dsh-host-webserver'
import { rejectIfBadHost } from './host-guard.ts'

/** Browser-facing base path of the desktop-icon API. */
export const ICONS_API_PREFIX = '/api/dsh-hub/icons'

/** Whitelisted asset names (single path segment, alphanumerics + hyphens). */
const NAME_RE = /^[a-z0-9-]+\.png$/i

/** Write a plain-text response. */
function text(res: ServerResponse, status: number, body: string): void {
  res.writeHead(status, { 'content-type': 'text/plain; charset=utf-8' })
  res.end(body)
}

/**
 * Build the desktop-icon routes (one prefix route serving the bundled
 * assets). Only `[a-z0-9-]+.png` filenames are accepted; a malformed
 * percent-escape answers 404 like any missing file.
 * @returns the route for `ctx.webServer.register`.
 */
export function makeIconsRoutes(): WebRoute[] {
  return [
    {
      kind: 'prefix',
      path: ICONS_API_PREFIX,
      handler: (req: IncomingMessage, res: ServerResponse): Promise<void> => {
        if (rejectIfBadHost(req, res)) return Promise.resolve()
        if (req.method !== 'GET') {
          text(res, 405, 'method-not-allowed')
          return Promise.resolve()
        }
        let name = ''
        try {
          name = decodeURIComponent((req.url ?? '').split('?')[0].split('/').filter(Boolean).pop() ?? '')
        } catch {
          // Malformed percent-encoding — treat as not-found.
        }
        if (!NAME_RE.test(name)) {
          text(res, 404, 'not-found')
          return Promise.resolve()
        }
        try {
          const bytes = readFileSync(new URL(`../../assets/icons/${name}`, import.meta.url))
          res.writeHead(200, { 'content-type': 'image/png', 'cache-control': 'public, max-age=86400' })
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
