/**
 * Tray pipe controller — the shell→host stdin pipe (`MG_TRAY <json>`):
 * registry routing (src/core/registry.ts) + host→shell uplink
 * (`DSH_CMD <json>` via the injected sendDshCmd). Extracted from
 * src/index.ts apply() (round-8 SPT layering; behavior identical).
 *
 * @module dsh-hub/controllers/tray-pipe
 * @category Controller（业务编排层）
 */
import type { Context } from '@deepseek-ai/cordis';
import { type DshCmdPayload } from '../models/pipe.js';
/** 托盘管道依赖（由 index.ts 注入）。 */
export interface TrayPipeDeps {
    /** 上行 DSH_CMD（index.ts 的 sendDshCmd：写 stdout + 日志）。 */
    sendDshCmd: (payload: DshCmdPayload) => void;
    /** 聚焦会话状态（controllers/session-runtime 的 getFocusedSessionState）。 */
    getFocusedState: () => {
        cwd?: string;
        sessionId?: string;
    };
}
/**
 * 装配托盘命令双向管道：注册 open-workspace/new-task 处理器 + 读 stdin 分发。
 * 新增托盘命令 = 在此 register（或调用方再 register），不改分发链。
 * @param ctx - Cordis context（传给注册处理器）。
 * @param deps - 上行通道与聚焦状态依赖。
 * @returns 拆卸函数（关闭 readline，fiber 拆除时调用）。
 */
export declare function setupTrayPipe(ctx: Context, deps: TrayPipeDeps): () => void;
