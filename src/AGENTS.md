# AGENTS.md — src/（host half）开发约束

> 本目录是 dsh-hub 的 **host half**（dsh 进程内，Node）。改动本目录任何文件前，**必须**先读根 [../AGENTS.md](../AGENTS.md) 与本文件。

## 职责

| 文件 | 模块类别 | 职责 |
|---|---|---|
| `index.ts` | **Controller** | 插件入口：`export const name`（= 包名）、`Config` schema、`apply()` 装配（路由注册、设置卡片、托盘/通知接线、启动门控判定） |
| `desktop.ts` | **Manager（壳）** | WebView2 桌面壳生命周期：窗口创建/尺寸/主题同步/托盘派发桥/通知。**Tauri 迁移时整体重写** |
| `services/*` | Services / Server / Helper | 见 [services/AGENTS.md](services/AGENTS.md) |
| `client/*` | 插件 UI | 见 [client/AGENTS.md](client/AGENTS.md) |

## host 架构红线

1. **插件身份**：`src/index.ts` 的 `export const name` 必须 == `cordis.patch.yml` 的 `insert.name` == `tsdown.config.ts` 的 `PLUGIN_ID` == `package.json` 的 `name`（当前 `@marecgents/dsh-hub`）。
2. **启动门控**：`launchedByShortcut()`（`process.env.DSH_HUB_LAUNCHED === '1'`）为 false 时，apply() 必须直接 return —— 不注册任何路由、不装任何卡片、不开任何窗口。
3. **settings 命名空间**：`SETTINGS_NS = settingsNamespace('dsh-hub')` 保持小写 kebab-case；配置读写走自有 HTTP 路由 `/api/dsh-hub/*`（`makeConfigRoutes`），不依赖 dsh 的 settings 白名单。
4. **退出语义**：托盘"退出"走 `exitProcess()`（写 `quit.marker` + `process.exit(0)`），**禁止** `ctx.appExit` / `app.exit()`（webviewjs teardown 0xC0000005 崩溃）。
5. **Config 合并**：`effectiveConfig()` 以持久化 `readShellConfig()` 覆盖 composition Config 的运行值；新增配置字段必须同步 `ShellConfig` 接口 + `DEFAULT_SHELL_CONFIG` + POST 白名单（三处一致，漏一处 = 保存静默丢失）。

## 壳 / 插件隔离（强制）

- **壳层**：`desktop.ts` + `services/` 中 Windows 专属（dwm-theme / tray / explorer / screen / state-store）。禁止在其中写插件业务。
- **插件层**：`client/*` + `config-api` + `workspace-api`。禁止在其中做窗口/托盘/系统调用。
- 两者通过 **HTTP 路由 / IPC 事件桥** 通信（`mg:shell-command`、`mg:workspace-path:` 等），不直接 import 对方内部。
- 新增文件先归类（Controller/Manager/Services/Server/Helper），命名清晰表达职能（如 `config-api.ts` 而非 `utils2.ts`）。

## 代码质量

- 文件头注释写明：职责、模块类别、对外接口（见 `index.ts` 范例）。
- 每个导出函数/接口前写 JSDoc：作用、参数、返回、副作用。
- **Build 前代码级推演**：改完本目录代码，执行 `npm run build` 前，先推演——类型自洽、name 一致、门控未被破坏、路由未冲突、catch 未吞错。推演通过再构建。
- 错误处理：空 catch 注释原因；try 单一语句；console 日志前缀 `[dsh-hub]`。
