/**
 * Pipe frame models — the two-way pipe protocol between the shell (Rust
 * sidecar / WebView2 tray helper) and the host (dsh web process).
 *
 * Channel: shell → host = stdin `MG_TRAY <json>` (node.rs parses);
 * host → shell = stdout `DSH_CMD <json>` (node.rs `dispatch_dsh_cmd` runs).
 * Any command-name / frame-format change must stay in sync with
 * `src-tauri/src/managers/node.rs` ↔ `src/managers/tauri-shell.ts`
 * (sendDshCmd) ↔ `src/index.ts` (MG_TRAY reader + registry).
 *
 * @module dsh-hub/models/pipe
 * @category Model（纯类型/常量，无副作用）
 */

/** 壳→host 下行帧前缀（stdin，node.rs 侧 MG_TRAY 解析）。 */
export const MG_TRAY_PREFIX = 'MG_TRAY '

/** host→壳 上行帧前缀（stdout，node.rs dispatch_dsh_cmd 解析）。 */
export const DSH_CMD_PREFIX = 'DSH_CMD '

/** 托盘命令联合（WebView2 托盘 + Tauri 原生菜单 + 管道命令共用）。 */
export type TrayCommand = 'show' | 'open-workspace' | 'new-task' | 'quit'

/** 壳→host 下行帧（`MG_TRAY <json>`）。 */
export interface MgTrayFrame {
  command?: string
  [key: string]: unknown
}

/** host→壳 上行帧载荷（`DSH_CMD <json>`，node.rs 分发表）。 */
export interface DshCmdPayload {
  cmd: string
  [key: string]: unknown
}

/** 已知 DSH_CMD 命令名（node.rs 分发表 ↔ tauri-shell.ts ↔ index.ts 三端同步）。 */
export type DshCmdName =
  | 'set_window_theme'
  | 'set_window_size'
  | 'notify_task_complete'
  | 'play_sound'
  | 'open_workspace_path'
  | 'dispatch_page_event'
