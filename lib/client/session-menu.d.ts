/**
 * Session context menu (任务右键菜单) — the browser half of the full-action
 * menu for session rows, pinned or not.
 *
 * 目标形态（对齐参考设计）：置顶/取消置顶、重命名、分叉、归档、在资源管理器中
 * 打开、复制工作区路径 / 日志路径 / 会话 ID、前往配置目录。仅当官方接口或宿主
 * 路由确实支撑时才渲染对应项（宁缺毋错）：
 *
 *  - 打开 / 重命名 / 分叉 / 归档：官方 client 接口
 *    （sessions.open / binding(id).session.rename / sessions.fork /
 *    workspaces.archiveSession —— 与官方 ui-workspace 行内菜单同源）；
 *  - 在资源管理器中打开：client 侧 invoke `open_workspace_path`（Tauri 壳
 *    平台命令，src/client/index.ts 的 open-workspace 分支同路径），不经宿主；
 *  - 复制日志路径 / 前往配置：宿主路由
 *    `/api/dsh-hub/session-paths/paths?id=...`（server/session-paths-api.ts）；
 *  - 工作区路径优先取 sessions.byId[id].cwd，缺省回退 workspaces items 的 path。
 *
 * 挂载为 body portal 浮层；点击外部 / Esc / 滚动 / 失焦即关闭；disposer 移除。
 * 本模块是纯动作库（open/close），事件接线在 pin-conversations.ts（官方行
 * 右键 + 官方 ⋯ 菜单截获 + 置顶项右键）。
 *
 * @module dsh-hub/client/session-menu
 */
/** Everything the menu needs to act on one session. */
export interface SessionMenuParams {
    /** Screen coordinates to anchor at (usually the pointer position). */
    x: number;
    y: number;
    /** Target session id. */
    id: string;
    /** Display title used in aria labels and the menu header. */
    title: string;
    /** Whether the session is currently pinned (flips the pin item's label). Only meaningful when onTogglePin is provided. */
    pinned?: boolean;
    /** Plugin client runtime (sessions/workspaces services). */
    ctx: unknown;
    /** Toggle the pin state (pin-conversations owns the pins store). Optional: the pin item is hidden when omitted. */
    onTogglePin?: () => void;
    /** Enter the inline rename editor. Optional: the rename item is hidden when omitted. */
    onRename?: () => void;
}
/**
 * Open the session context menu at the given position.
 *
 * @param params - target session + callbacks + plugin runtime (see {@link SessionMenuParams}).
 * @returns nothing; the menu removes itself on close.
 */
export declare function openSessionMenu(params: SessionMenuParams): void;
/**
 * Close the currently open session menu, if any.
 *
 * @returns nothing; safe to call when no menu is open.
 */
export declare function closeSessionMenu(): void;
