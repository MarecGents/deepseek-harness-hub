/**
 * Bridge client (host-side) — Tauri 2.x 主桥客户端（运行在 dsh web 页面内）。
 *
 * 模块类别：Bridge（壳层）
 * 职责：与 sidecar 侧 bridge-server（T4.9）建立双向通信——
 *   - 上行（fetch POST）：workspace-path / session-focus / theme-change
 *   - 下行（SSE / EventSource）：shell-command / theme-request / dsh:output
 *   - Token 管理：`window.__DSH_BRIDGE_TOKEN__` 由 Rust initialization_script 注入，
 *     会话级，不出现在 URL query 中。
 *
 * D-1 决策：主桥 = HTTP/SSE/WS，页面↔sidecar 为主通道。
 * 本文件是 host 侧桥客户端（TypeScript），编译后由 Rust initialization_script
 * 注入所有 webview（随 tauri.conf app.withGlobalTauri / initialization_script）。
 *
 * 外部接口：
 *   - `BridgeClient` class：SSE 订阅 + fetch POST + token 管理
 *   - `connectBridge(baseUrl)`：建立 SSE 连接 + 事件分发
 *   - `postBridge(endpoint, body)`：带 token 的 POST 请求
 *   - `isTauriEnvironment()`：检测 `__TAURI_INTERNALS__`（仅判本地/远程窗口，非接线判据）
 *
 * 安全约束（X4-④ / R2）：
 *   - Token 存变量，不出现在 URL query
 *   - 所有请求携带 Authorization Bearer token
 *   - Host / Origin 白名单校验由 bridge-server 侧执行（T4.9）
 *   - 日志脱敏：不打印 token 值
 *
 * @module bridge/tauri
 */
/**
 * `window.__TAURI_INTERNALS__` —— Tauri 注入的内部 API。
 * 存在不代表页面一定走 invoke 通道（remote page 也可能被注入）；
 * 不存在则确定是远程页。仅用于通道选择提示，非接线判据。
 */
declare global {
    interface Window {
        /** Rust initialization_script 注入的会话级桥 token。 */
        __DSH_BRIDGE_TOKEN__?: string;
        /** Rust initialization_script 注入的 shell 类型提示。 */
        __DSH_SHELL__?: string;
        /** Tauri 内部 API（本地窗口/壳内页注入）。 */
        __TAURI_INTERNALS__?: unknown;
    }
}
/**
 * SSE 下行事件类型枚举。
 * bridge-server（T4.9）推送的事件名称必须与此一致。
 */
export declare const enum BridgeDownstreamEvent {
    /** 壳层发送 shell 命令（如托盘"新建任务"）。 */
    ShellCommand = "shell-command",
    /** 壳层请求页面主题（页面应上报当前 dark/light 状态）。 */
    ThemeRequest = "theme-request",
    /** dsh host 的 stdout/stderr 日志流（经 sidecar 转发）。 */
    DshOutput = "dsh:output",
    /** sidecar 进程异常退出通知。 */
    DshCrash = "dsh:crash"
}
/**
 * 上行 endpoint 路径枚举。
 * bridge-server（T4.9）的 POST 路由必须与此一致。
 */
export declare const enum BridgeUpstreamEndpoint {
    /** 上报当前工作区路径。 */
    WorkspacePath = "/api/dsh-hub/bridge/workspace",
    /** 上报当前聚焦的 session id。 */
    SessionFocus = "/api/dsh-hub/bridge/session-focus",
    /** 上报页面主题变化（dark = true/false）。 */
    ThemeChange = "/api/dsh-hub/bridge/theme-change",
    /** 页面就绪握手上报（adapter 类型/通道）。 */
    Ready = "/api/dsh-hub/bridge/ready"
}
/** 上行请求体基类。 */
export interface BridgePostBody {
    [key: string]: unknown;
}
/** 上行 workspace-path 请求体。 */
export interface WorkspacePathBody extends BridgePostBody {
    /** 当前工作区路径，null 表示页面无法解析。 */
    path: string | null;
}
/** 上行 session-focus 请求体。 */
export interface SessionFocusBody extends BridgePostBody {
    /** 当前聚焦的 session id。 */
    sessionId: string | null;
}
/** 上行 theme-change 请求体。 */
export interface ThemeChangeBody extends BridgePostBody {
    /** true = 暗色模式，false = 亮色模式。 */
    dark: boolean;
}
/** 上行 ready 握手请求体。 */
export interface ReadyBody extends BridgePostBody {
    /** adapter 类型标识（如 'tauri-bridge'）。 */
    adapter: string;
    /** 通道标识（如 'http-sse'）。 */
    channel: string;
}
/**
 * 检测当前页面是否运行在 Tauri webview 内。
 *
 * **重要**：`__TAURI_INTERNALS__` 的存在不代表页面一定是本地窗口——
 * Rust initialization_script 可能注入到所有 webview（包括远程 dsh 页）。
 * 本函数仅用于通道选择提示（本地窗口走 invoke / 远程页走主桥），
 * 不作为接线判据（接线判据走 env `DSH_HUB_SHELL`）。
 *
 * @returns true 如果 `__TAURI_INTERNALS__` 存在于 window 上。
 */
export declare function isTauriEnvironment(): boolean;
/**
 * 主桥客户端 —— 管理与 sidecar bridge-server 的 SSE 连接和 fetch 上行。
 *
 * 生命周期：
 *   1. `connectBridge(baseUrl)` 创建实例并建立 SSE 连接。
 *   2. SSE 自动重连（指数退避）。
 *   3. `dispose()` 关闭连接、停止重连。
 *
 * 线程模型：运行在浏览器主线程，依赖标准 EventSource / fetch API。
 */
export declare class BridgeClient {
    /** 当前 SSE 连接（null = 未连接或已断开）。 */
    private eventSource;
    /** 基础 URL（如 `http://127.0.0.1:<port>`）。 */
    private readonly baseUrl;
    /** 会话级桥 token。 */
    private readonly token;
    /** 是否已调用 dispose()。 */
    private disposed;
    /** 当前重连延迟（指数退避）。 */
    private reconnectDelay;
    /** 重连定时器 id。 */
    private reconnectTimer;
    /** 事件监听器注册表（downstream event name → callbacks）。 */
    private readonly listeners;
    /**
     * @param baseUrl - bridge-server 基础 URL（如 `http://127.0.0.1:12345`）。
     * @param token - 会话级桥 token（由 `window.__DSH_BRIDGE_TOKEN__` 获取）。
     */
    constructor(baseUrl: string, token: string);
    /**
     * 建立 SSE 连接，开始接收下行事件。
     * 幂等：已连接时调用无副作用。
     */
    connect(): void;
    /**
     * 处理一条 SSE 消息。
     * SSE 规范：`event:` 字段决定事件类型，`data:` 字段是载荷。
     * bridge-server 应使用 named events（`event: shell-command\ndata: {...}\n\n`）。
     */
    private handleSSEMessage;
    /**
     * 注册一个下行事件监听器。
     *
     * @param event - 事件名称（如 BridgeDownstreamEvent.ShellCommand）。
     * @param callback - 回调函数，接收解析后的数据。
     * @returns 取消注册的函数。
     */
    on(event: BridgeDownstreamEvent | string, callback: (data: unknown) => void): () => void;
    /**
     * 调度一次 SSE 重连（指数退避）。
     */
    private scheduleReconnect;
    /**
     * 向 bridge-server 发送一个 POST 请求（带 token 鉴权）。
     *
     * @param endpoint - 上行 endpoint 路径（如 BridgeUpstreamEndpoint.WorkspacePath）。
     * @param body - 请求体（将被 JSON 序列化）。
     * @returns 解析后的 JSON 响应体，或 null（请求失败）。
     */
    post(endpoint: BridgeUpstreamEndpoint | string, body: BridgePostBody): Promise<unknown | null>;
    /**
     * 上报当前工作区路径。
     * @param path - 工作区路径，null 表示页面无法解析。
     */
    reportWorkspacePath(path: string | null): Promise<void>;
    /**
     * 上报当前聚焦的 session id。
     * @param sessionId - session id，null 表示无聚焦会话。
     */
    reportSessionFocus(sessionId: string | null): Promise<void>;
    /**
     * 上报页面主题变化。
     * @param dark - true = 暗色模式，false = 亮色模式。
     */
    reportThemeChange(dark: boolean): Promise<void>;
    /**
     * 页面就绪握手上报。
     * 页面加载后经主桥上报 adapter 类型/通道，sidecar 记录并结合 env 决定接线。
     */
    reportReady(): Promise<void>;
    /**
     * 销毁客户端：关闭 SSE 连接、清除重连定时器、移除所有监听器。
     */
    dispose(): void;
    /** 当前 SSE 连接状态。 */
    get connected(): boolean;
}
/**
 * 建立与 sidecar bridge-server 的桥连接。
 *
 * 使用场景：页面加载后调用，建立 SSE 订阅 + 上行通道。
 * 通常由 client half 的 adapter 或 initialization_script 编译产物调用。
 *
 * @param baseUrl - bridge-server 基础 URL（如 `http://127.0.0.1:<port>`）。
 *   如果未提供，尝试从 `window.location.origin` 推断（同源场景）。
 * @returns BridgeClient 实例（已连接），或 null（token 未注入 = 桥不可用）。
 */
export declare function connectBridge(baseUrl?: string): BridgeClient | null;
/**
 * 发送一个桥上行请求（便捷函数，无需持有 client 实例）。
 *
 * @param endpoint - 上行 endpoint 路径。
 * @param body - 请求体。
 * @param baseUrl - bridge-server 基础 URL（默认 `window.location.origin`）。
 * @returns 解析后的 JSON 响应体，或 null（请求失败）。
 */
export declare function postBridge(endpoint: BridgeUpstreamEndpoint | string, body: BridgePostBody, baseUrl?: string): Promise<unknown | null>;
