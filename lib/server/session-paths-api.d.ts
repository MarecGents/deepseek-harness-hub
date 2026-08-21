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
import type { WebRoute } from '@deepseek-ai/dsh-host-webserver';
/**
 * Build the session-paths route.
 *
 * @returns routes to merge into the plugin's webServer registration list.
 */
export declare function makeSessionPathsRoutes(): WebRoute[];
