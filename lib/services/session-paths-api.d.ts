/**
 * Session paths API — host routes backing the session context menu (任务右键菜单).
 *
 * Server + Services（与 pins-api 同型，Tauri 迁移=保留）。对外接口：
 * `makeSessionPathsRoutes(): WebRoute[]`：
 *  - `GET  /api/dsh-hub/session/paths?id=<sessionId>` → `{ ok, found, sessionDir?, logPath?, homeDir }`
 *    （在 `$DSH_HOME/sessions/<projectKey>/<sessionId>/` 下定位该会话的目录与
 *    `session.jsonl[.zstd]` 日志文件；目录布局与官方 session-persistence-jsonl 一致）
 *  - `POST /api/dsh-hub/session/explorer` `{ path }` → 在资源管理器中打开该绝对路径
 *    （复用 services/explorer 的 `openFolderInExplorer`；仅接受绝对路径）
 *
 * The client half (src/client/session-menu.ts) calls these from the session
 * context menu; path resolution stays host-side so the client never needs to
 * know the on-disk session layout.
 */
import type { WebRoute } from '@deepseek-ai/dsh-host-webserver';
/**
 * Build the session-paths + explorer routes.
 *
 * @returns routes to merge into the plugin's webServer registration list.
 */
export declare function makeSessionPathsRoutes(): WebRoute[];
