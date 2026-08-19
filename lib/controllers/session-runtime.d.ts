/**
 * Session runtime controller — focus-cwd tracking, event sounds and
 * task-complete notifications. Extracted from src/index.ts apply()
 * (round-8 SPT layering; behavior identical to the inline handlers).
 *
 * @module dsh-hub/controllers/session-runtime
 * @category Controller（业务编排层）
 */
import type { Context } from '@deepseek-ai/cordis';
import type { TaskSoundKind } from '../models/sound.js';
/** 壳侧副作用的最小接口（两个壳 handle 均结构化满足）。 */
export interface SessionShellLike {
    playSound(kind: TaskSoundKind): void;
    notifyTaskComplete(body: string, opts?: {
        sessionId?: string;
    }): void;
}
/** 会话运行时依赖（由 index.ts 注入，本模块不持有壳实现）。 */
export interface SessionRuntimeDeps {
    /** 当前壳句柄（可能尚未就绪 → undefined；事件触发时通常已就绪）。 */
    getShell: () => SessionShellLike | undefined;
    /** 已解析的声音开关（持久化优先于 composition Config；undefined = 关闭语义由调用方决定）。 */
    getSoundEnabled: () => boolean | undefined;
    /** 已解析的通知开关。 */
    getNotifyEnabled: () => boolean | undefined;
    /** 记录聚焦会话 cwd（host 兜底状态，供托盘 open-workspace 使用）。 */
    onActiveCwd: (cwd: string) => void;
}
/**
 * 获取聚焦会话状态（Q6 主进程方法）：聚焦会话所在工作区的文件目录。
 * 优先读 sessions 服务的当前会话 cwd，兜底 host 实时跟踪的 activeCwd。
 * @param ctx - Cordis context（读 sessions 服务）。
 * @param activeCwd - host 兜底跟踪的最近活动 cwd。
 * @returns { cwd?, sessionId? } 聚焦会话工作区目录；无聚焦会话时 cwd 为空。
 */
export declare function getFocusedSessionState(ctx: Context, activeCwd: string | undefined): {
    cwd?: string;
    sessionId?: string;
};
/**
 * 装配会话运行时（session/event + agent/created 处理器）。
 * 处理器经 ctx.on 注册，随插件 fiber 生命周期自动清理。
 * @param ctx - Cordis context。
 * @param deps - 壳副作用与配置依赖。
 */
export declare function setupSessionRuntime(ctx: Context, deps: SessionRuntimeDeps): void;
