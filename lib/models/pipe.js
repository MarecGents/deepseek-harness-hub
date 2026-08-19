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
export const MG_TRAY_PREFIX = 'MG_TRAY ';
/** host→壳 上行帧前缀（stdout，node.rs dispatch_dsh_cmd 解析）。 */
export const DSH_CMD_PREFIX = 'DSH_CMD ';
