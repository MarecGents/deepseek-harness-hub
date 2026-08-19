/**
 * Tray pipe controller — the shell→host stdin pipe (`MG_TRAY <json>`):
 * registry routing (src/core/registry.ts) + host→shell uplink
 * (`DSH_CMD <json>` via the injected sendDshCmd). Extracted from
 * src/index.ts apply() (round-8 SPT layering; behavior identical).
 *
 * @module dsh-hub/controllers/tray-pipe
 * @category Controller（业务编排层）
 */

import { createInterface } from 'node:readline'
import type { Context } from '@deepseek-ai/cordis'
import { TrayCommandRegistry } from '../core/registry.ts'
import { MG_TRAY_PREFIX, type DshCmdPayload } from '../models/pipe.js'
import { parseMgTrayLine } from '../utils/pipe.js'

/** 托盘管道依赖（由 index.ts 注入）。 */
export interface TrayPipeDeps {
  /** 上行 DSH_CMD（index.ts 的 sendDshCmd：写 stdout + 日志）。 */
  sendDshCmd: (payload: DshCmdPayload) => void
  /** 聚焦会话状态（controllers/session-runtime 的 getFocusedSessionState）。 */
  getFocusedState: () => { cwd?: string; sessionId?: string }
}

/**
 * 装配托盘命令双向管道：注册 open-workspace/new-task 处理器 + 读 stdin 分发。
 * 新增托盘命令 = 在此 register（或调用方再 register），不改分发链。
 * @param ctx - Cordis context（传给注册处理器）。
 * @param deps - 上行通道与聚焦状态依赖。
 * @returns 拆卸函数（关闭 readline，fiber 拆除时调用）。
 */
export function setupTrayPipe(ctx: Context, deps: TrayPipeDeps): () => void {
  const trayCommands = new TrayCommandRegistry()

  trayCommands.register('open-workspace', () => {
    // 打开工作区：派发页面事件 → client 侧 currentWorkspace() 解析「当前聚焦会话
    // 所在工作区」并 invoke open_workspace_path（聚焦会话优先；页面不可达时
    // Rust 兜底 $DSH_HOME）。host 侧不再自行解析聚焦状态（实测不可靠：
    // sessions 快照 current/cwd 常缺 → 回退 activeCwd 或 none 打开错误目录）。
    console.log('[dsh-hub] tray open-workspace: dispatching to page via shell eval')
    deps.sendDshCmd({ cmd: 'dispatch_page_event', name: 'mg:shell-command', detail: { command: 'open-workspace' } })
  })

  trayCommands.register('new-task', () => {
    // 新建会话：经壳派发浏览器 CustomEvent → client 原生
    // ctx.workspaces.startSession()（自动落到聚焦会话工作区，rc.14 一致）。
    console.log('[dsh-hub] tray new-task: dispatching to page via shell eval')
    deps.sendDshCmd({ cmd: 'dispatch_page_event', name: 'mg:shell-command', detail: { command: 'new-task' } })
  })

  const trayPipe = createInterface({ input: process.stdin })
  trayPipe.on('line', (line) => {
    const frame = parseMgTrayLine(line)
    if (frame === null) {
      if (line.startsWith(MG_TRAY_PREFIX)) console.warn('[dsh-hub] tray pipe: malformed frame ignored')
      return
    }
    const command = frame.command
    if (typeof command !== 'string') {
      console.warn('[dsh-hub] tray pipe: frame missing command')
      return
    }
    console.log(`[dsh-hub] tray pipe: received command=${command}`)
    try {
      if (!trayCommands.dispatch(command, ctx, frame)) {
        console.warn(`[dsh-hub] tray pipe: unknown command=${command}`)
      }
    } catch (error) {
      console.warn(`[dsh-hub] tray pipe: handling ${command} failed:`, error)
    }
  })

  return () => {
    trayPipe.close()
  }
}
