/**
 * Shell runtime controller — host-side orchestration for shell-level actions.
 *
 * This module owns the remaining executable business logic that used to live
 * in src/index.ts:
 *   - resolve the effective startup config from persisted settings;
 *   - send `DSH_CMD` uplink frames to the shell;
 *   - run tray "New task" semantics.
 *
 * Note: process-exit semantics belong to the Rust shell (helpers/quit.rs);
 * the host never exits the process itself. The tray "Open workspace" path is
 * handled by tray-pipe (`dispatch_page_event` → client `open_workspace_path`
 * invoke); the old host-side `openWorkspaceDir` chain was dead code and has
 * been removed.
 *
 * Keeping these in a controller makes `src/index.ts` a pure composition root
 * (SPT Controller/Service separation) while preserving the exact rc.14
 * behavior and log messages.
 *
 * @module dsh-hub/controllers/shell-runtime
 * @category Controller（业务编排层）
 */
import { join } from 'node:path';
import { dshHome } from '../helpers/state-store.js';
import { writeDshCmd } from '../helpers/pipe-io.js';
import { hasStoredWindowSize, readShellConfig } from '../services/config-store.js';
/** Marker the launcher checks so an intentional tray quit is never auto-restarted. */
export function quitMarkerFile() {
    return join(dshHome(), 'dsh-hub', 'quit.marker');
}
/** Host-side fallback: the most recently active session's working directory. */
let activeCwd;
/** Read the current host-side fallback cwd. */
export function getActiveCwd() {
    return activeCwd;
}
/** Update the host-side fallback cwd (called by session/bridge controllers). */
export function setActiveCwd(cwd) {
    activeCwd = cwd;
}
/**
 * 双向管道上行：向壳写一条 `DSH_CMD <json>`（stdout，node.rs 解析执行）。
 * 与 `managers/tauri-shell.ts` 的 invoke 是**同一条通道**——两者都委托
 * `helpers/pipe-io.ts` 的 `writeDshCmd` 写 stdout（SPT 分层禁止 manager 依赖
 * controller，故保留两个薄包装、共享一个底层 writer）。本函数供控制器层
 * （tray-pipe 经 index.ts 注入）与托盘 open-workspace 语义使用。
 * @param payload - { cmd, ...args } 命令帧。
 */
export function sendDshCmd(payload) {
    if (writeDshCmd(payload)) {
        console.log(`[dsh-hub] pipe-up: DSH_CMD ${payload.cmd}`);
    }
}
/**
 * Tray "New task": dispatch the command into the web page. The browser half
 * runs the OFFICIAL client-side flow (`ctx.workspaces.startSession` — the
 * same path the sidebar "+" button uses): with no explicit workspaceId it
 * resolves the CURRENT session's workspace first, then the recent workspace.
 * @param dispatch - shell/page dispatch callback (name, detail).
 */
export function newTaskInWeb(dispatch) {
    try {
        dispatch('mg:shell-command', { command: 'new-task' });
    }
    catch {
        // Best-effort.
    }
}
/**
 * Merge the persisted shell config over the composition entry (persisted
 * wins). Startup width/height come from the persisted document ONLY when the
 * user explicitly saved them (hasStoredWindowSize) — otherwise `undefined`
 * lets the desktop shell size the default window to 3/4 of the launch
 * screen. (A4: previously the saved size was never applied on boot, and the
 * old writeShellConfig seeded default width/height into the file.)
 */
export function effectiveConfig(config) {
    const stored = readShellConfig();
    const hasSize = hasStoredWindowSize();
    return {
        ...config,
        width: hasSize ? stored.width : undefined,
        height: hasSize ? stored.height : undefined,
        theme: stored.theme ?? config.theme,
        minimizeToTray: stored.minimizeToTray ?? config.minimizeToTray,
        closeToTray: stored.closeToTray ?? config.closeToTray,
    };
}
