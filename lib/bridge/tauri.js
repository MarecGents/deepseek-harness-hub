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
// ─── 常量 ──────────────────────────────────────────────────────────────────────
/** SSE 重连延迟上限（指数退避上限）。 */
const SSE_MAX_RECONNECT_DELAY_MS = 30_000;
/** SSE 初始重连延迟。 */
const SSE_INITIAL_RECONNECT_DELAY_MS = 1_000;
/** fetch 请求超时。 */
const FETCH_TIMEOUT_MS = 10_000;
/** 日志前缀。 */
const LOG_PREFIX = '[dsh-hub:bridge]';
// ─── 事件类型 ──────────────────────────────────────────────────────────────────
/**
 * SSE 下行事件类型枚举。
 * bridge-server（T4.9）推送的事件名称必须与此一致。
 */
export var BridgeDownstreamEvent;
(function (BridgeDownstreamEvent) {
    /** 壳层发送 shell 命令（如托盘"新建任务"）。 */
    BridgeDownstreamEvent["ShellCommand"] = "shell-command";
    /** 壳层请求页面主题（页面应上报当前 dark/light 状态）。 */
    BridgeDownstreamEvent["ThemeRequest"] = "theme-request";
    /** dsh host 的 stdout/stderr 日志流（经 sidecar 转发）。 */
    BridgeDownstreamEvent["DshOutput"] = "dsh:output";
    /** sidecar 进程异常退出通知。 */
    BridgeDownstreamEvent["DshCrash"] = "dsh:crash";
})(BridgeDownstreamEvent || (BridgeDownstreamEvent = {}));
/**
 * 上行 endpoint 路径枚举。
 * bridge-server（T4.9）的 POST 路由必须与此一致。
 */
export var BridgeUpstreamEndpoint;
(function (BridgeUpstreamEndpoint) {
    /** 上报当前工作区路径。 */
    BridgeUpstreamEndpoint["WorkspacePath"] = "/api/dsh-hub/bridge/workspace";
    /** 上报当前聚焦的 session id。 */
    BridgeUpstreamEndpoint["SessionFocus"] = "/api/dsh-hub/bridge/session-focus";
    /** 上报页面主题变化（dark = true/false）。 */
    BridgeUpstreamEndpoint["ThemeChange"] = "/api/dsh-hub/bridge/theme-change";
    /** 页面就绪握手上报（adapter 类型/通道）。 */
    BridgeUpstreamEndpoint["Ready"] = "/api/dsh-hub/bridge/ready";
})(BridgeUpstreamEndpoint || (BridgeUpstreamEndpoint = {}));
// ─── 工具函数 ──────────────────────────────────────────────────────────────────
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
export function isTauriEnvironment() {
    return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}
/**
 * 从 `window.__DSH_BRIDGE_TOKEN__` 读取会话级桥 token。
 * Token 由 Rust initialization_script 注入；不可伪造、不可预测。
 *
 * @returns token 字符串，或 null（未注入 = 桥不可用）。
 */
function getBridgeToken() {
    const token = window.__DSH_BRIDGE_TOKEN__;
    if (typeof token === 'string' && token.length > 0)
        return token;
    return null;
}
/**
 * 触发一个 CustomEvent 到 window（供 client half 监听）。
 * 保持与 rc.14 desktop.ts `dispatchEvent` 的语义兼容。
 */
function emitWindowEvent(name, detail) {
    try {
        window.dispatchEvent(new CustomEvent(name, { detail }));
    }
    catch {
        // Non-fatal: page may be in a torn-down state.
    }
}
// ─── BridgeClient ──────────────────────────────────────────────────────────────
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
export class BridgeClient {
    /** 当前 SSE 连接（null = 未连接或已断开）。 */
    eventSource = null;
    /** 基础 URL（如 `http://127.0.0.1:<port>`）。 */
    baseUrl;
    /** 会话级桥 token。 */
    token;
    /** 是否已调用 dispose()。 */
    disposed = false;
    /** 当前重连延迟（指数退避）。 */
    reconnectDelay = SSE_INITIAL_RECONNECT_DELAY_MS;
    /** 重连定时器 id。 */
    reconnectTimer = null;
    /** 事件监听器注册表（downstream event name → callbacks）。 */
    listeners = new Map();
    /**
     * @param baseUrl - bridge-server 基础 URL（如 `http://127.0.0.1:12345`）。
     * @param token - 会话级桥 token（由 `window.__DSH_BRIDGE_TOKEN__` 获取）。
     */
    constructor(baseUrl, token) {
        // 规范化 baseUrl：去除尾部斜杠。
        this.baseUrl = baseUrl.replace(/\/+$/, '');
        this.token = token;
    }
    // ── SSE 下行 ─────────────────────────────────────────────────────────────
    /**
     * 建立 SSE 连接，开始接收下行事件。
     * 幂等：已连接时调用无副作用。
     */
    connect() {
        if (this.disposed || this.eventSource !== null)
            return;
        const url = `${this.baseUrl}/api/dsh-hub/bridge/events`;
        console.log(`${LOG_PREFIX} connecting SSE → ${url}`);
        try {
            const es = new EventSource(url, {
                // EventSource 不支持自定义 headers；token 通过 query 传递违反 R2，
                // 因此依赖 bridge-server 侧的 Origin 白名单 + 会话 cookie 或
                // 由 initialization_script 注入的 token 做校验。
                // 注意：标准 EventSource 不支持自定义 headers。
                // bridge-server（T4.9）应在此端点对 SSE upgrade 请求做
                // Origin + Host 白名单校验，作为 token 的补充。
                withCredentials: false,
            });
            es.onopen = () => {
                console.log(`${LOG_PREFIX} SSE connected`);
                this.reconnectDelay = SSE_INITIAL_RECONNECT_DELAY_MS;
            };
            es.onmessage = (event) => {
                this.handleSSEMessage(event);
            };
            es.onerror = () => {
                console.warn(`${LOG_PREFIX} SSE error (readyState=${es.readyState})`);
                if (es.readyState === EventSource.CLOSED) {
                    // 连接被服务端关闭，尝试重连。
                    this.eventSource = null;
                    this.scheduleReconnect();
                }
                // EventSource.CONNECTING (readyState=0) = 浏览器自动重连，无需手动干预。
            };
            this.eventSource = es;
        }
        catch (error) {
            console.warn(`${LOG_PREFIX} SSE connection failed:`, error);
            this.scheduleReconnect();
        }
    }
    /**
     * 处理一条 SSE 消息。
     * SSE 规范：`event:` 字段决定事件类型，`data:` 字段是载荷。
     * bridge-server 应使用 named events（`event: shell-command\ndata: {...}\n\n`）。
     */
    handleSSEMessage(event) {
        // `event.type` 是 named event 的类型；默认 'message'。
        const eventType = event.type || 'message';
        let payload;
        try {
            payload = JSON.parse(event.data);
        }
        catch {
            // 非 JSON 载荷，原样传递。
            payload = event.data;
        }
        // 触发 CustomEvent 到 window，保持与 rc.14 dispatchEvent 语义兼容。
        emitWindowEvent(`dsh-hub:${eventType}`, payload);
        // 触发内部监听器。
        const callbacks = this.listeners.get(eventType);
        if (callbacks) {
            for (const cb of callbacks) {
                try {
                    cb(payload);
                }
                catch (error) {
                    console.warn(`${LOG_PREFIX} listener error for "${eventType}":`, error);
                }
            }
        }
    }
    /**
     * 注册一个下行事件监听器。
     *
     * @param event - 事件名称（如 BridgeDownstreamEvent.ShellCommand）。
     * @param callback - 回调函数，接收解析后的数据。
     * @returns 取消注册的函数。
     */
    on(event, callback) {
        let set = this.listeners.get(event);
        if (!set) {
            set = new Set();
            this.listeners.set(event, set);
        }
        set.add(callback);
        return () => {
            set.delete(callback);
            if (set.size === 0)
                this.listeners.delete(event);
        };
    }
    /**
     * 调度一次 SSE 重连（指数退避）。
     */
    scheduleReconnect() {
        if (this.disposed || this.reconnectTimer !== null)
            return;
        const delay = this.reconnectDelay;
        console.log(`${LOG_PREFIX} SSE reconnect in ${delay}ms`);
        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            if (!this.disposed)
                this.connect();
        }, delay);
        // 指数退避，封顶。
        this.reconnectDelay = Math.min(this.reconnectDelay * 2, SSE_MAX_RECONNECT_DELAY_MS);
    }
    // ── fetch 上行 ───────────────────────────────────────────────────────────
    /**
     * 向 bridge-server 发送一个 POST 请求（带 token 鉴权）。
     *
     * @param endpoint - 上行 endpoint 路径（如 BridgeUpstreamEndpoint.WorkspacePath）。
     * @param body - 请求体（将被 JSON 序列化）。
     * @returns 解析后的 JSON 响应体，或 null（请求失败）。
     */
    async post(endpoint, body) {
        if (this.disposed)
            return null;
        const url = `${this.baseUrl}${endpoint}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Token 通过 Authorization header 传递，不出现在 URL query（R2）。
                    'Authorization': `Bearer ${this.token}`,
                },
                body: JSON.stringify(body),
                signal: controller.signal,
            });
            if (!response.ok) {
                console.warn(`${LOG_PREFIX} POST ${endpoint} → ${response.status} ${response.statusText}`);
                return null;
            }
            return await response.json();
        }
        catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                console.warn(`${LOG_PREFIX} POST ${endpoint} timed out`);
            }
            else {
                console.warn(`${LOG_PREFIX} POST ${endpoint} failed:`, error);
            }
            return null;
        }
        finally {
            clearTimeout(timeout);
        }
    }
    // ── 便捷上行方法 ─────────────────────────────────────────────────────────
    /**
     * 上报当前工作区路径。
     * @param path - 工作区路径，null 表示页面无法解析。
     */
    async reportWorkspacePath(path) {
        await this.post(BridgeUpstreamEndpoint.WorkspacePath, { path });
    }
    /**
     * 上报当前聚焦的 session id。
     * @param sessionId - session id，null 表示无聚焦会话。
     */
    async reportSessionFocus(sessionId) {
        await this.post(BridgeUpstreamEndpoint.SessionFocus, { sessionId });
    }
    /**
     * 上报页面主题变化。
     * @param dark - true = 暗色模式，false = 亮色模式。
     */
    async reportThemeChange(dark) {
        await this.post(BridgeUpstreamEndpoint.ThemeChange, { dark });
    }
    /**
     * 页面就绪握手上报。
     * 页面加载后经主桥上报 adapter 类型/通道，sidecar 记录并结合 env 决定接线。
     */
    async reportReady() {
        await this.post(BridgeUpstreamEndpoint.Ready, {
            adapter: 'tauri-bridge',
            channel: 'http-sse',
        });
    }
    // ── 生命周期 ─────────────────────────────────────────────────────────────
    /**
     * 销毁客户端：关闭 SSE 连接、清除重连定时器、移除所有监听器。
     */
    dispose() {
        if (this.disposed)
            return;
        this.disposed = true;
        if (this.reconnectTimer !== null) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        if (this.eventSource !== null) {
            this.eventSource.close();
            this.eventSource = null;
        }
        this.listeners.clear();
        console.log(`${LOG_PREFIX} disposed`);
    }
    /** 当前 SSE 连接状态。 */
    get connected() {
        return this.eventSource !== null && this.eventSource.readyState === EventSource.OPEN;
    }
}
// ─── 工厂函数 ──────────────────────────────────────────────────────────────────
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
export function connectBridge(baseUrl) {
    const token = getBridgeToken();
    if (token === null) {
        console.warn(`${LOG_PREFIX} no bridge token (window.__DSH_BRIDGE_TOKEN__ not set); bridge disabled`);
        return null;
    }
    const resolvedBase = baseUrl ?? window.location.origin;
    const client = new BridgeClient(resolvedBase, token);
    client.connect();
    // 自动上报就绪。
    void client.reportReady();
    return client;
}
/**
 * 发送一个桥上行请求（便捷函数，无需持有 client 实例）。
 *
 * @param endpoint - 上行 endpoint 路径。
 * @param body - 请求体。
 * @param baseUrl - bridge-server 基础 URL（默认 `window.location.origin`）。
 * @returns 解析后的 JSON 响应体，或 null（请求失败）。
 */
export async function postBridge(endpoint, body, baseUrl) {
    const token = getBridgeToken();
    if (token === null) {
        console.warn(`${LOG_PREFIX} postBridge: no token, request skipped`);
        return null;
    }
    const resolvedBase = (baseUrl ?? window.location.origin).replace(/\/+$/, '');
    const url = `${resolvedBase}${endpoint}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(body),
            signal: controller.signal,
        });
        if (!response.ok) {
            console.warn(`${LOG_PREFIX} POST ${endpoint} → ${response.status}`);
            return null;
        }
        return await response.json();
    }
    catch (error) {
        console.warn(`${LOG_PREFIX} POST ${endpoint} failed:`, error);
        return null;
    }
    finally {
        clearTimeout(timeout);
    }
}
