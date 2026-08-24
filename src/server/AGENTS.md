# AGENTS.md — src/server/（Server 路由层）开发约束

> 本目录是 dsh-hub host half 的 **Server（HTTP/WS 路由工厂）层**。2026-08-18 重构由 `src/services/*-api.ts` 迁入。
> 改动本目录任何文件前，**必须**先读根 [../../AGENTS.md](../../AGENTS.md) 与 [../AGENTS.md](../AGENTS.md) 与本文件。

## 文件归类

| 文件 | 模块类别 | 职责 | Tauri 迁移 |
|---|---|---|---|
| `config-api.ts` | **Server + Services** | 配置读写 `/api/dsh-hub/config`（GET/POST）、`ShellConfig` 持久化、旧名迁移 `migrateLegacyPaths` | 保留 |
| `workspace-api.ts` | **Server + Services** | 工作区 `/api/dsh-hub/workspace/{list,git,open}`（文件树 + Git 检测 + OS 打开；open 带 host+origin+token 三重守卫） | 保留 |
| `pins-api.ts` | **Server + Services** | 置顶会话 `/api/dsh-hub/pins`（GET/PUT）、pins.json 原子写（renameSync） | 保留 |
| `backgrounds-api.ts` | **Server + Services** | 背景图静态路由 `/api/dsh-hub/backgrounds/*`（正则白名单防穿越，服务 assets/backgrounds） | 保留 |
| `sounds-api.ts` | **Server + Services** | 提示音静态路由 `/api/dsh-hub/sounds/*` | 保留 |
| `icons-api.ts` | **Server + Services** | 图标静态路由 `/api/dsh-hub/icons/*`（正则白名单防穿越，default.png 别名） | 保留 |
| `session-paths-api.ts` | **Server + Services** | 会话路径 `/api/dsh-hub/session-paths/paths`（segment 白名单防穿越） | 保留 |
| `terminal-pty-api.ts` | **Server** | 终端 PTY `/api/dsh-hub/pty/{create,write,resize,close,list,stream}`（node-pty 会话的 HTTP 面；SSE JSON 信封 + 15s 心跳；host+origin+token 三重守卫；错误 sanitize 为固定码） | 保留 |
| `token.ts` | **Helper** | 进程级会话 token：`getToken` / `injectTokenToHtml`（index.html `<meta name="dsh-hub-token">` 注入，经 `webServer.tapIndex`）/ `verifyToken`（Bearer / `?token=`，timingSafeEqual 常量时间比较） | 保留 |
| `host-guard.ts` | **Helper** | `isHostAllowed` / `rejectIfBadHost`（DNS-rebinding）+ `isOriginAllowed` / `rejectIfBadOrigin`（S0：POST/PUT 状态变更 Origin 白名单 loopback/`tauri:`，缺失 Origin 拒绝；GET/HEAD 跳过），路由工厂共享 | 保留 |
| `bridge-server.ts` | **Server** | 桥路由（WebView2 IPC ↔ HTTP） | **已删除**（Tauri invoke 替代） |

## Server 层规范

1. **路由工厂**：一律 `makeXxxRoutes(): WebRoute[]`，由 `src/index.ts` 统一 `ctx.webServer.register`；**同一 path 只注册一次**（GET/POST 合并进一个 handler 按 method 分发）——重复注册会崩。
2. **前缀统一**：`/api/dsh-hub/*`；路径/请求结构变更必须同步 client 调用方。
3. **请求体校验**：`readJsonBody` 限 64KB；字段白名单收窄（未知字段丢弃）；数值 clamp 到合法范围。
4. **配置三处一致**：新增 `ShellConfig` 字段必须同步 ① 接口 ② `DEFAULT_SHELL_CONFIG` ③ POST 白名单——漏一处 = 前端保存被静默丢弃（真实事故：allowMultipleInstances 曾漏白名单）。
5. **单向依赖**：Server 只调 `../helpers/*` 与纯库；**禁止** import `../index.ts`、`../managers/*`。
6. **错误处理**：空 catch 必须注释吞掉什么、为何无碍；错误返回 `{ ok: false, error }` 而非抛到进程。
7. **Build 前推演**：改完先推演（路由唯一、配置三处一致、catch 覆盖、白名单防穿越），再 `npm run build`。
8. **host 防护共享（S0）**：路由工厂共享 `host-guard.ts`——`rejectIfBadHost`（DNS-rebinding）+ `rejectIfBadOrigin`（POST/PUT 状态变更 Origin 白名单，缺失 Origin 拒绝）——**新增路由必须接**（漏接 = 任意 Host/Origin 可访问路由）。
9. **token 鉴权（M4）**：状态变更路由（pty/*、workspace/open）还必须接 `token.ts` 的 `verifyToken`（`Authorization: Bearer` 或 `?token=`，常量时间比较）；SSE 流用 `?token=`（EventSource 无法带自定义头）；token 经 `injectTokenToHtml` 注入 index.html，客户端从 meta / `__DSH_HUB_TOKEN__` 全局读取。
