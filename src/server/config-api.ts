/**
 * dsh-hub config API — same-origin JSON endpoints the client
 * settings card uses to read and write the shell configuration (window size
 * policy, theme, tray). Deliberately NOT a settings namespace: dsh's RPC
 * settings.describe exposes only a hard-coded allowlist (third-party plugin
 * namespaces are explicitly "deferred work" in the api-proxy source), so a
 * plugin-owned config document + own HTTP routes is the supported pattern —
 * the same one dsh-web-ui's packages use (`/api/pet/*` etc).
 *
 * Module category: Server (thin route factory). All config persistence lives
 * in `../services/config-store.ts` (readShellConfig / writeShellConfig /
 * migrateLegacyPaths — single implementation); this file only validates the
 * request, narrows fields, and frames JSON responses.
 */

import type { IncomingMessage, ServerResponse } from 'node:http'
import type { WebRoute } from '@deepseek-ai/dsh-host-webserver'
import { type ShellConfig } from '../models/shell-config.js'
import { readShellConfig, writeShellConfig } from '../services/config-store.js'
import { readJsonBody } from '../helpers/read-json-body.js'
import { rejectIfBadHost, rejectIfBadOrigin } from './host-guard.ts'
import { verifyToken } from './token.js'
import { applySecureHeaders } from './security-headers.ts'
export type { ShellConfig }

/** Browser-facing base path of the shell config API. */
export const CONFIG_API_PREFIX = '/api/dsh-hub'

/** Write one JSON response. */
function json(res: ServerResponse, status: number, body: unknown): void {
  applySecureHeaders(res)
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(body))
}

/**
 * Build the shell config route (one exact route; GET reads, POST updates).
 * @param onChange - invoked with the persisted config after each successful
 *   POST, so the caller can apply changes live (e.g. the window theme).
 *   `changed.size` is true only when the request actually included width/height.
 */
export function makeConfigRoutes(onChange?: (value: ShellConfig, changed?: { size?: boolean }) => void): WebRoute[] {
  return [
    {
      kind: 'exact',
      path: `${CONFIG_API_PREFIX}/config`,
      handler: (req: IncomingMessage, res: ServerResponse): Promise<void> => {
        if (rejectIfBadHost(req, res)) return Promise.resolve()
        if (rejectIfBadOrigin(req, res)) return Promise.resolve()
        if (req.method === 'GET') {
          json(res, 200, { ok: true, value: readShellConfig() })
          return Promise.resolve()
        }
        if (req.method === 'POST') {
          // Audit 2026-09-02 P1-5: state-changing route — require the process
          // token (GET stays open: the splash/skins boot reads it pre-auth).
          if (!verifyToken(req)) {
            json(res, 401, { ok: false, error: 'unauthorized' })
            return Promise.resolve()
          }
          return readJsonBody(req).then(
            (body) => {
              const record = (typeof body === 'object' && body !== null)
                ? body as Record<string, unknown>
                : {}
              // Narrow to known fields only; width/height are clamped to a
              // generous absolute maximum (the client input already caps at
              // the actual screen size, so this only guards hostile values).
              const sizeChanged = 'width' in record || 'height' in record
              const patch: Partial<ShellConfig> = {}
              // 8K UHD upper bound — no current monitor exceeds it.
              const MAX_SCREEN = 7680
              if (record.windowOpen === 'auto' || record.windowOpen === 'manual') patch.windowOpen = record.windowOpen
              if (typeof record.width === 'number' && Number.isFinite(record.width)) {
                patch.width = Math.floor(Math.min(Math.max(record.width, 480), MAX_SCREEN))
              }
              if (typeof record.height === 'number' && Number.isFinite(record.height)) {
                patch.height = Math.floor(Math.min(Math.max(record.height, 360), 4320))
              }
              if (record.theme === 'system' || record.theme === 'light' || record.theme === 'dark') patch.theme = record.theme
              if (typeof record.minimizeToTray === 'boolean') patch.minimizeToTray = record.minimizeToTray
              if (typeof record.closeToTray === 'boolean') patch.closeToTray = record.closeToTray
              if (typeof record.notifyOnTaskComplete === 'boolean') patch.notifyOnTaskComplete = record.notifyOnTaskComplete
              if (typeof record.soundEnabled === 'boolean') patch.soundEnabled = record.soundEnabled
              if (typeof record.allowMultipleInstances === 'boolean') patch.allowMultipleInstances = record.allowMultipleInstances
              // Skin id is an opaque short string; the client validates against
              // its own registry and falls back to 'default' for unknown ids.
              // Whitelist charset (2026-09-01 audit): only [a-z0-9-] ids — the
              // value is consumed as a filename fragment & skin selector, so
              // reject anything that could smuggle path/selector syntax.
              if (typeof record.skin === 'string' && /^[a-z0-9-]{1,64}$/i.test(record.skin)) patch.skin = record.skin
              // Background id — same whitelist rationale (served via
              // /api/dsh-hub/backgrounds/<id>).
              if (typeof record.background === 'string' && /^[a-z0-9-]{1,64}$/i.test(record.background)) patch.background = record.background
              // Desktop-icon id — same whitelist rationale (icons/<id>.ico lookup).
              if (typeof record.desktopIcon === 'string' && /^[a-z0-9-]{1,64}$/i.test(record.desktopIcon)) patch.desktopIcon = record.desktopIcon

              const result = writeShellConfig(patch)
              if (!result.ok) {
                // Persistence failed (IO error): respond with an error and do
                // NOT echo a new value — the client must not be optimistically
                // confirmed for a document that never changed on disk.
                json(res, 500, { ok: false, error: 'config-write-failed' })
                return
              }
              onChange?.(result.value, { size: sizeChanged })
              json(res, 200, { ok: true, value: result.value })
            },
            (error) => json(res, 400, { ok: false, error: error instanceof Error ? error.message : String(error) }),
          )
        }
        json(res, 405, { ok: false, error: 'method-not-allowed' })
        return Promise.resolve()
      },
    },
  ]
}
