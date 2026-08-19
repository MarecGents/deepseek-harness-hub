/**
 * Shell runtime controller — host-side orchestration for shell-level actions.
 *
 * This module owns the remaining executable business logic that used to live
 * in src/index.ts:
 *   - resolve the effective startup config from persisted settings;
 *   - write the intentional-quit marker and exit the process;
 *   - send `DSH_CMD` uplink frames to the shell;
 *   - run tray "Open workspace" / "New task" semantics.
 *
 * Keeping these in a controller makes `src/index.ts` a pure composition root
 * (SPT Controller/Service separation) while preserving the exact rc.14
 * behavior and log messages.
 *
 * @module dsh-hub/controllers/shell-runtime
 * @category Controller（业务编排层）
 */

import { join } from 'node:path'
import type { Context } from '@deepseek-ai/cordis'
import { dshHome } from '../helpers/state-store.js'
import { hasStoredWindowSize, readShellConfig } from '../services/config-store.js'
import type { DshCmdPayload } from '../models/pipe.js'
import type { PluginConfig } from '../models/plugin-config.js'

/** Marker the launcher checks so an intentional tray quit is never auto-restarted. */
export function quitMarkerFile(): string {
  return join(dshHome(), 'dsh-hub', 'quit.marker')
}

/** Host-side fallback: the most recently active session's working directory. */
let activeCwd: string | undefined

/** Read the current host-side fallback cwd. */
export function getActiveCwd(): string | undefined {
  return activeCwd
}

/** Update the host-side fallback cwd (called by session/bridge controllers). */
export function setActiveCwd(cwd: string | undefined): void {
  activeCwd = cwd
}

/**
 * 双向管道上行：向壳写一条 `DSH_CMD <json>`（stdout，node.rs 解析执行）。
 * rc.14 tray-helper 反向通道：host → 壳（打开目录 / 派发页面事件等）。
 * @param payload - { cmd, ...args } 命令帧。
 */
export function sendDshCmd(payload: DshCmdPayload): void {
  try {
    process.stdout.write(`DSH_CMD ${JSON.stringify(payload)}\n`)
    console.log(`[dsh-hub] pipe-up: DSH_CMD ${payload.cmd as string}`)
  } catch (error) {
    console.warn('[dsh-hub] pipe-up: DSH_CMD write failed:', error)
  }
}

/**
 * Tray "Open workspace": ask the page for the current session's workspace
 * path, then reveal it through the Tauri shell (DSH_CMD `open_workspace_path`
 * up-link → Rust opens Explorer). Falls back to activeCwd/process.cwd.
 * @param ctx - Cordis context (unused in the current implementation).
 * @param getCurrentPath - page callback that resolves the current path.
 * Host fallback cwd is read from this controller's activeCwd state.
 */
export async function openWorkspaceDir(
  ctx: Context,
  getCurrentPath: (cb: (path: string | null) => void) => void,

): Promise<void> {
  const startedAt = Date.now()
  console.log(`[dsh-hub] open workspace start at ${startedAt}`)
  try {
    getCurrentPath((path) => {
      const cwd = path ?? getActiveCwd() ?? process.cwd()
      try {
        sendDshCmd({ cmd: 'open_workspace_path', path: cwd })
        console.log(`[dsh-hub] explorer requested in ${Date.now() - startedAt}ms (${cwd})`)
      } catch (error) {
        console.warn(`[dsh-hub] open workspace failed in ${Date.now() - startedAt}ms:`, error)
      }
    })
  } catch (error) {
    console.warn(`[dsh-hub] open workspace failed in ${Date.now() - startedAt}ms:`, error)
  }
}

/**
 * Tray "New task": dispatch the command into the web page. The browser half
 * runs the OFFICIAL client-side flow (`ctx.workspaces.startSession` — the
 * same path the sidebar "+" button uses): with no explicit workspaceId it
 * resolves the CURRENT session's workspace first, then the recent workspace.
 * @param dispatch - shell/page dispatch callback (name, detail).
 */
export function newTaskInWeb(dispatch: (name: string, detail?: Record<string, unknown>) => void): void {
  try {
    dispatch('mg:shell-command', { command: 'new-task' })
  } catch {
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
export function effectiveConfig(config: PluginConfig): PluginConfig {
  const stored = readShellConfig()
  const hasSize = hasStoredWindowSize()
  return {
    ...config,
    width: hasSize ? stored.width : (undefined as unknown as number),
    height: hasSize ? stored.height : (undefined as unknown as number),
    theme: stored.theme ?? config.theme,
    minimizeToTray: stored.minimizeToTray ?? config.minimizeToTray,
    closeToTray: stored.closeToTray ?? config.closeToTray,
  }
}
