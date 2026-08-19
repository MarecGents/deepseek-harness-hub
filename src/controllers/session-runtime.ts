/**
 * Session runtime controller — focus-cwd tracking, event sounds and
 * task-complete notifications. Extracted from src/index.ts apply()
 * (round-8 SPT layering; behavior identical to the inline handlers).
 *
 * @module dsh-hub/controllers/session-runtime
 * @category Controller（业务编排层）
 */

import type { Context } from '@deepseek-ai/cordis'
import type { TaskSoundKind } from '../models/sound.js'

/** 壳侧副作用的最小接口（两个壳 handle 均结构化满足）。 */
export interface SessionShellLike {
  playSound(kind: TaskSoundKind): void
  notifyTaskComplete(body: string, opts?: { sessionId?: string }): void
}

/** 会话运行时依赖（由 index.ts 注入，本模块不持有壳实现）。 */
export interface SessionRuntimeDeps {
  /** 当前壳句柄（可能尚未就绪 → undefined；事件触发时通常已就绪）。 */
  getShell: () => SessionShellLike | undefined
  /** 已解析的声音开关（持久化优先于 composition Config；undefined = 关闭语义由调用方决定）。 */
  getSoundEnabled: () => boolean | undefined
  /** 已解析的通知开关。 */
  getNotifyEnabled: () => boolean | undefined
  /** 记录聚焦会话 cwd（host 兜底状态，供托盘 open-workspace 使用）。 */
  onActiveCwd: (cwd: string) => void
}

/**
 * 获取聚焦会话状态（Q6 主进程方法）：聚焦会话所在工作区的文件目录。
 * 优先读 sessions 服务的当前会话 cwd，兜底 host 实时跟踪的 activeCwd。
 * @param ctx - Cordis context（读 sessions 服务）。
 * @param activeCwd - host 兜底跟踪的最近活动 cwd。
 * @returns { cwd?, sessionId? } 聚焦会话工作区目录；无聚焦会话时 cwd 为空。
 */
export function getFocusedSessionState(ctx: Context, activeCwd: string | undefined): { cwd?: string; sessionId?: string } {
  try {
    const sessions = ctx.get('sessions') as {
      list?: { getSnapshot?: () => { current?: string; byId?: Record<string, { cwd?: string }> } }
    } | undefined
    const snap = sessions?.list?.getSnapshot?.()
    const current = snap?.current
    if (current !== undefined) {
      const cwd = snap?.byId?.[current]?.cwd
      if (cwd !== undefined && cwd !== '') {
        console.log(`[dsh-hub] focused session state: session=${current} cwd=${cwd}`)
        return { cwd, sessionId: current }
      }
    }
  } catch {
    // sessions 服务不可用（未注入）→ 走 activeCwd 兜底。
  }
  if (activeCwd !== undefined) {
    console.log(`[dsh-hub] focused session state: activeCwd=${activeCwd}`)
    return { cwd: activeCwd }
  }
  console.log('[dsh-hub] focused session state: none')
  return {}
}

/**
 * 装配会话运行时（session/event + agent/created 处理器）。
 * 处理器经 ctx.on 注册，随插件 fiber 生命周期自动清理。
 * @param ctx - Cordis context。
 * @param deps - 壳副作用与配置依赖。
 */
export function setupSessionRuntime(ctx: Context, deps: SessionRuntimeDeps): void {
  // session/event fires for every session activity and carries the Session as
  // its first argument, so it reliably reflects the session the user is
  // looking at — unlike agent/created, which only fires when a session runs.
  ctx.on('session/event', (session: { id?: string; header?: { cwd?: string; delegationDepth?: number } }, event: unknown) => {
    const cwd = session.header?.cwd
    if (cwd !== undefined) deps.onActiveCwd(cwd)
    const depth = session.header?.delegationDepth ?? 0
    // Event sounds: question submitted (turn/start), AI approval requested
    // (approval/asked), task complete (turn/end → completed), task error
    // (turn/end → error). Q4：声音永远触发（不按 depth 过滤，子任务也响）；
    // soundEnabled 设置项仍可整体关闭（持久化值优先，实时生效）。
    const soundEnabled = deps.getSoundEnabled()
    if (soundEnabled) {
      const e = event as { type?: string; data?: { reason?: { kind?: string } } } | undefined
      const shell = deps.getShell()
      if (e?.type === 'turn/start') {
        shell?.playSound('start')
      } else if (e?.type === 'approval/asked') {
        shell?.playSound('attention')
      } else if (e?.type === 'turn/end') {
        const kind = e.data?.reason?.kind
        if (kind === 'completed') shell?.playSound('success')
        else if (kind === 'error') shell?.playSound('error')
      }
    }
    // Task-complete notification: fire for top-level user sessions only
    // (depth 0 — subagent turns are invisible busy work), and only when a
    // turn actually finished (`completed` or `error`). Q4：若完成的就是当前
    // 聚焦会话，只响提示音、不弹通知（看得见就不打扰）；非聚焦会话才弹。
    const notifyEnabled = deps.getNotifyEnabled()
    if (!notifyEnabled) return
    if (depth !== 0) return
    const e = event as { type?: string; data?: { reason?: { kind?: string } } } | undefined
    if (e?.type !== 'turn/end') return
    const kind = e.data?.reason?.kind
    const shell = deps.getShell()
    if (kind === 'completed') {
      const current = (ctx as unknown as {
        sessions?: { list?: { getSnapshot?: () => { current?: string } } }
      }).sessions?.list?.getSnapshot?.()?.current
      if (current !== undefined && current === session.id) return // 聚焦中，不打扰
      shell?.notifyTaskComplete('任务完成', { sessionId: session.id })
    } else if (kind === 'error') {
      shell?.notifyTaskComplete('任务出错', { sessionId: session.id })
    }
  })

  // Track the most recently active session cwd from agent creation too
  // (covers sessions that start running without a prior session/event).
  ctx.on('agent/created', (payload: { agent: unknown }) => {
    const agent = payload.agent as { sessionId?: string } | undefined
    const sessionId = agent?.sessionId
    if (sessionId === undefined) return
    const sessions = ctx.get('sessions') as { get?: (id: string) => { header?: { cwd?: string } } | undefined } | undefined
    const cwd = sessions?.get?.(sessionId)?.header?.cwd
    if (cwd !== undefined) deps.onActiveCwd(cwd)
  })
}
