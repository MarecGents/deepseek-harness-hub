/**
 * ServiceRegistry — 轻量服务/处理器注册表（SPT [Injectable] 全局服务注册思想）。
 *
 * 声明式注册 + 全局可查 + 生命周期内随时调用：把「改一处坏一处」的散乱
 * if/else 分发收拢为注册表路由（新增命令 = register，不改分发链）。
 * 对应 SPT `Libraries/SPTarkov.DI`（[Injectable] 自动装配 → 容器枚举）。
 *
 * @module dsh-hub/core/registry
 * @category Core（服务注册与生命周期，SPT 架构映射）
 */
/** 托盘命令注册表（壳下行 `MG_TRAY {"command":…}` → 注册的处理器）。 */
export class TrayCommandRegistry {
    handlers = new Map();
    /** 注册一个命令处理器（幂等：同命令覆盖）。 */
    register(command, handler) {
        this.handlers.set(command, handler);
    }
    /** 是否已注册某命令。 */
    has(command) {
        return this.handlers.has(command);
    }
    /** 分发命令到已注册处理器；未注册 → false。 */
    dispatch(command, ctx, payload) {
        const handler = this.handlers.get(command);
        if (handler === undefined)
            return false;
        // Resolve through a Promise so an async handler's rejection is explicitly
        // caught here instead of becoming an unhandledRejection (Node's default
        // would crash the sidecar). Keeps the synchronous boolean return so the
        // caller's unknown-command branch stays intact.
        Promise.resolve(handler(ctx, payload)).catch((error) => {
            console.error('[dsh-hub] registry handler failed:', error);
        });
        return true;
    }
    /** 全部已注册命令名（诊断/枚举）。 */
    list() {
        return [...this.handlers.keys()];
    }
}
