# AGENTS.md — src/services/（业务服务层）开发约束

> 本目录是 dsh-hub 的 **Services / Server / Helper** 层（host half 的能力集合）。改动本目录任何文件前，**必须**先读根 [../../AGENTS.md](../../AGENTS.md) 与 [../AGENTS.md](../AGENTS.md) 与本文件。

## 文件归类

| 文件 | 模块类别 | 职责 | Tauri 迁移 |
|---|---|---|---|
| `config-api.ts` | **Server + Services** | 配置读写路由 `/api/dsh-hub/config`（GET/POST）、`ShellConfig` 定义与持久化、旧名迁移 `migrateLegacyPaths` | 保留 |
| `backgrounds-api.ts` | **Server + Services** | 背景图静态资源路由 `/api/dsh-hub/backgrounds/*`（正则白名单防穿越，服务 assets/backgrounds） | 保留 |
| `workspace-api.ts` | **Server + Services** | 工作区路由 `/api/dsh-hub/workspace/{list,git}`（文件树 + Git 检测） | 保留 |
| `pins-api.ts` | **Server + Services** | 置顶会话路由 `/api/dsh-hub/pins`（GET/PUT）、`pins.json` 持久化（renameSync 原子写） | 保留 |
| `theme-sync.ts` | **Services** | 页面主题 → IPC 桥转发（配合壳层 Dwm 应用） | 保留（桥） |
| `dwm-theme.ts` | **Helper** | koffi 调 Dwm 设置标题栏主题（Windows 专属） | **重写**（Tauri 窗口 API） |
| `tray.ts` | **Manager（托盘）** | 系统托盘：helper 进程优先、进程内兜底 | **重写**（tauri-plugin-tray） |
| `explorer.ts` | **Helper** | 打开文件夹 + 前置（koffi ShellExecuteW + EnumWindows） | **重写**（tauri shell） |
| `screen.ts` | **Helper** | 屏幕分辨率探测（resolveLaunchScreen） | **重写**（Tauri 屏幕 API） |
| `state-store.ts` | **Helper** | `dshHome()` / 窗口状态文件路径 | 保留（$DSH_HOME 语义不变） |
| `icons.ts` | **Helper** | 图标生成/解码（png-decode 配套） | 保留 |
| `png-decode.ts` | **Helper** | PNG 解码（纯函数） | 保留 |

## Services 层规范

1. **接口文档**：每个导出函数/类前写 JSDoc（作用、参数、返回、副作用）；HTTP handler 注明路由 path + method + 请求/响应结构。
2. **Server 路由规范**：
   - 用 `makeConfigRoutes` / `makeWorkspaceRoutes` 工厂返回 `WebRoute[]`，由 `src/index.ts` 统一 `ctx.webServer.register`。
   - 同一 path 只注册一次（GET/POST 合并进一个 handler 按 method 分发）——重复注册会崩。
   - 请求体校验：`readJsonBody` 限 64KB；字段白名单收窄（未知字段丢弃）；数值 clamp 到合法范围。
3. **配置三处一致**：新增 `ShellConfig` 字段必须同步 ① 接口 ② `DEFAULT_SHELL_CONFIG` ③ POST 白名单——漏一处 = 前端保存被静默丢弃（真实事故：allowMultipleInstances 曾漏白名单）。
4. **Helper 规范**：纯函数、无副作用、无状态；输入输出类型明确；不做 IO（IO 属于 Services/Manager）。
5. **错误处理**：空 catch 必须注释吞掉什么、为何无碍；Promise 链不遗漏 catch；网络/文件错误尽量返回结构化错误（`{ ok: false, error }`）而非抛到进程。
6. **Build 前推演**：改完本目录，先推演（类型、路由唯一、配置三处一致、catch 覆盖、Windows 专属调用边界），再 `npm run build`。
7. **Windows 专属标记**：`dwm-theme` / `tray` / `explorer` / `screen` 是 Windows 专属，文件头注明"Tauri 迁移时重写"；跨平台代码不得直接依赖它们（经 `theme-sync` 桥 / 工厂注入）。
