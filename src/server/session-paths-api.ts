/**
 * Session paths API — host routes backing the session context menu (任务右键菜单).
 *
 * Server + Services（与 pins-api 同型，Tauri 迁移=保留）。对外接口：
 * `makeSessionPathsRoutes(): WebRoute[]`：
 *  - `GET /api/dsh-hub/session-paths/paths?id=<sessionId>` → `{ ok, found, sessionDir?, logPath?, homeDir }`
 *    （在 `$DSH_HOME/sessions/<projectKey>/<sessionId>/` 下定位该会话的目录与
 *    `session.jsonl[.zstd]` 日志文件；目录布局与官方 session-persistence-jsonl 一致）
 *
 * dev-v2 差异（相对 PR 的 `src/services/session-paths-api.ts`）：
 *  - 落点重写为 `src/server/` 路由工厂，补 `rejectIfBadHost`（DNS-rebinding
 *    防护，host-guard.ts，与 pins-api 同范式）；
 *  - 路由前缀规范化为 `/api/dsh-hub/session-paths/*`（避免与未来会话路由的
 *    `/session/` 段语义混淆，client 侧 session-menu.ts 同步对齐）；
 *  - **explorer 路由整体去掉**：打开文件夹走 client 侧
 *    `invoke('open_workspace_path')`（Tauri 壳平台命令），host 不再依赖已删除的
 *    `services/explorer.ts`，无双通道；
 *  - 路径防穿越用 segment 白名单 `^[a-zA-Z0-9_-]{1,200}$`（dsh 会话 id 为
 *    UUID/带前缀 UUID，全在字符集内；`/`、`\`、`.`、`..` 一律拒绝）。
 *
 * The client half (src/client/session-menu.ts) calls this from the session
 * context menu; path resolution stays host-side so the client never needs to
 * know the on-disk session layout.
 */

import type { IncomingMessage, ServerResponse } from 'node:http'
import type { WebRoute } from '@deepseek-ai/dsh-host-webserver'
import { existsSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { dshHome } from '../helpers/state-store.js'
import { rejectIfBadHost } from './host-guard.ts'
import { applySecureHeaders } from './security-headers.ts'

/** Route prefix shared with the other dsh-hub APIs. */
const API_PREFIX = '/api/dsh-hub'

/**
 * Session-id segment whitelist. dsh session ids are UUIDs (optionally
 * prefixed, e.g. `session-<uuid>` / `goal-<uuid>`); anything outside the
 * charset is rejected so the id can never smuggle path separators or dot
 * segments (path-traversal guard).
 */
const SAFE_SEGMENT = /^[a-zA-Z0-9_-]{1,200}$/

/** The harness session root: $DSH_HOME/sessions. */
function sessionsRoot(): string {
  return join(dshHome(), 'sessions')
}

/** True when the value may be used as ONE path segment. */
function isSafeSegment(value: string): boolean {
  return SAFE_SEGMENT.test(value)
}

/**
 * Locate one session's directory by id under the sessions root.
 *
 * Layout (mirrors @deepseek-ai/dsh-session-persistence-jsonl):
 * `sessions/<projectKey>/<encodedId>/session.jsonl[.zstd]`. The project key is
 * a filesystem-safe encoding of the session's cwd, so the id directory is
 * matched by exact name instead of reconstructing the key.
 *
 * @param id - session id (used verbatim as a path segment name).
 * @returns the session dir + log file path, or `found: false` when absent.
 */
function locateSession(id: string): { found: boolean; sessionDir?: string; logPath?: string } {
  const root = sessionsRoot()
  if (!isSafeSegment(id) || !existsSync(root)) return { found: false }
  for (const project of readdirSync(root)) {
    const sessionDir = join(root, project, id)
    try {
      if (!statSync(sessionDir).isDirectory()) continue
    } catch {
      // No directory with this id under the current project key — keep scanning.
      continue
    }
    for (const name of ['session.jsonl', 'session.jsonl.zstd']) {
      const candidate = join(sessionDir, name)
      if (existsSync(candidate)) return { found: true, sessionDir, logPath: candidate }
    }
    return { found: true, sessionDir }
  }
  return { found: false }
}

/** Write one JSON response. */
function json(res: ServerResponse, status: number, body: unknown): void {
  applySecureHeaders(res)
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(body))
}

/**
 * Build the session-paths route.
 *
 * @returns routes to merge into the plugin's webServer registration list.
 */
export function makeSessionPathsRoutes(): WebRoute[] {
  return [
    {
      kind: 'exact',
      path: `${API_PREFIX}/session-paths/paths`,
      handler: (req: IncomingMessage, res: ServerResponse): Promise<void> => {
        if (rejectIfBadHost(req, res)) return Promise.resolve()
        if (req.method !== 'GET') {
          json(res, 405, { ok: false, error: 'method-not-allowed' })
          return Promise.resolve()
        }
        let id = ''
        try {
          const url = new URL(req.url ?? '', 'http://localhost')
          id = url.searchParams.get('id') ?? ''
        } catch {
          // Malformed URL falls through to the invalid-id response below.
        }
        if (!isSafeSegment(id)) {
          json(res, 400, { ok: false, error: 'invalid-id' })
          return Promise.resolve()
        }
        json(res, 200, { ok: true, homeDir: dshHome(), ...locateSession(id) })
        return Promise.resolve()
      },
    },
  ]
}
