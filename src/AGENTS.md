# AGENTS.md — src/（host half）开发约束

> 本目录是 dsh-hub 的 **host half**（dsh 进程内，Node）。改动本目录任何文件前，**必须**先读根 [../AGENTS.md](../AGENTS.md) 与本文件。

## 分层结构（SPT 架构借鉴，2026-08-18 重构）

```
src/
  index.ts          Controller（入口）：apply() 装配，唯一 entry
  core/             Core：全局服务注册表 + 生命周期顺序（SPT [Injectable] 思想）
  controllers/      Controller：业务编排（session-runtime / tray-pipe，见 controllers/AGENTS.md）
  managers/         壳 Manager：tauri-shell.ts（Tauri 壳桥，唯一壳 Manager；desktop/tray 已删除）
  server/           Server：HTTP/WS 路由工厂（config/backgrounds/sounds/workspace/pins/icons/session-paths）
  services/         Services：纯领域逻辑（config-store / pins-store）
  helpers/          Helper：无状态/平台工具（state-store，$DSH_HOME 语义）
  models/           Model：共享类型/常量（pipe 协议帧、ShellConfig，见 models/AGENTS.md）
  utils/            Utils：纯函数（管道帧解析，见 utils/AGENTS.md）
  client/           插件 UI（见 client/AGENTS.md）
  plugins/          独立插件（@dsh-external/*，双轨分发见根 AGENTS §1.1 铁律 8；必须接装配链 cordis.patch.yml+profile，禁死目录；当前插件 private:true 仅随 hub，发布后改 false）
```

## 职责（现行文件）

| 文件 | 模块类别 | 职责 |
|---|---|---|
| `index.ts` | **Controller** | 插件入口：`export const name`（= 包名）、`Config` schema、`apply()` 装配（路由注册、设置卡片、托盘/通知接线、启动门控判定、Tauri 双向管道） |
| `core/registry.ts` | **Core** | `TrayCommandRegistry`：托盘命令声明式注册 + 分发（新增命令 = register，不改分发链） |
| `controllers/session-runtime.ts` | **Controller** | 会话运行时编排：聚焦 cwd 跟踪、事件提示音、任务完成通知、`getFocusedSessionState`（Q6） |
| `controllers/tray-pipe.ts` | **Controller** | 托盘双向管道编排：`MG_TRAY` 读 stdin → registry 分发 → `DSH_CMD` 上行 |
| `controllers/shell-runtime.ts` | **Controller** | 壳级编排：effectiveConfig / exitProcess / sendDshCmd / open-workspace / new-task 语义（index.ts 只留装配） |
| `services/config-store.ts` | **Services** | 壳配置持久化：migrateLegacyPaths / readShellConfig / writeShellConfig / stored* 读 |
| `services/pins-store.ts` | **Services** | 置顶会话持久化：readPinnedSessions / writePinnedSessions |
| `models/pipe.ts` | **Model** | 管道协议类型/常量：`TrayCommand`/`MgTrayFrame`/`DshCmdPayload`/`DshCmdName`/前缀 |
| `models/shell-config.ts` | **Model** | `ShellConfig` 接口 + `DEFAULT_SHELL_CONFIG`（配置三处一致的单一来源） |
| `models/plugin-config.ts` | **Model** | `PluginConfig` 接口（Cordis 插件 Config 的纯类型单一来源） |
| `utils/pipe.ts` | **Utils** | `parseMgTrayLine` 纯函数（帧解析，无副作用） |
| `managers/tauri-shell.ts` | **Manager（壳）** | Tauri 壳 facade：invoke 桥（DSH_CMD 上行）、声音/通知/主题/窗口命令、getTrayBehavior 实时读 |
| `managers/desktop.ts` | **Manager（壳）** | WebView2 桌面壳生命周期（**已删除**：WebView2 壳，dev-v2 Tauri-only） |
| `managers/tray.ts` | **Manager（壳）** | WebView2 托盘（**已删除**：WebView2 壳，dev-v2 Tauri-only） |
| `server/*-api.ts` | **Server** | 路由工厂：config/backgrounds/sounds/workspace/pins/icons/session-paths（`/api/dsh-hub/*`） |
| `server/host-guard.ts` | **Helper** | 共享守卫：`isHostAllowed` / `rejectIfBadHost`（DNS-rebinding 防护），server 内路由工厂共用 |
| `services/theme-sync.ts` | **Services** | 页面主题 → IPC 桥转发（**已删除**：WebView2 壳，dev-v2 Tauri-only） |
| `helpers/*` | **Helper** | 无状态工具：state-store（$DSH_HOME/窗口状态）；dwm-theme / os-theme / explorer / screen / icons / png-decode / sound / app-id 已删除（WebView2 壳，dev-v2 Tauri-only） |
| `client/*` | 插件 UI | 见 [client/AGENTS.md](client/AGENTS.md) |

## host 架构红线

1. **插件身份**：`src/index.ts` 的 `export const name` 必须 == `cordis.patch.yml` 的 `insert.name` == `tsdown.config.ts` 的 `PLUGIN_ID` == `package.json` 的 `name`（当前 `@marecgents/dsh-hub`）。
2. **启动门控**：`launchedByShortcut()`（`process.env.DSH_HUB_LAUNCHED === '1'`）为 false 时，apply() 必须直接 return —— 不注册任何路由、不装任何卡片、不开任何窗口。
3. **settings 命名空间**：`SETTINGS_NS = settingsNamespace('dsh-hub')` 保持小写 kebab-case；配置读写走自有 HTTP 路由 `/api/dsh-hub/*`（`makeConfigRoutes`），不依赖 dsh 的 settings 白名单。
4. **退出语义**：托盘"退出"走 `exitProcess()`（写 `quit.marker` + `process.exit(0)`），**禁止** `ctx.appExit` / `app.exit()`（webviewjs teardown 0xC0000005 崩溃）。
5. **Config 合并**：`effectiveConfig()` 以持久化 `readShellConfig()` 覆盖 composition Config 的运行值；新增配置字段必须同步 `ShellConfig` 接口 + `DEFAULT_SHELL_CONFIG` + POST 白名单（三处一致，漏一处 = 保存静默丢失）。

## 分层依赖红线（SPT 单向依赖，防"改一处坏一处"）

- **单向依赖**：上层可依赖下层，**下层禁止依赖上层**。层级：`index.ts → controllers → core → managers/server/services → helpers → models/utils`。
  - `server/*-api.ts` 只调 `helpers/*` 与纯库，不 import `index.ts` / `managers` 业务。
  - `helpers/*` 零依赖（或仅依赖其他 helpers / 官方库）；`models/utils` 无业务副作用。
  - 跨层引用违规 = 审查必纠项。
- **壳 / 插件隔离**：壳层（managers + helpers 中 Windows 专属）禁止写插件业务；插件层（client + server 路由）禁止做窗口/托盘/系统调用。
- **命令分发**：托盘/管道命令一律走 `core/registry.ts` 注册表（新增命令 = `trayCommands.register(...)`），禁止在 index.ts 里散落 if/else 分发链。
- **双向管道**：壳→host 走 stdin `MG_TRAY`；host→壳走 stdout `DSH_CMD`。帧格式与命令名变更必须同步 `src-tauri/src/managers/node.rs` 分发表。
- 新增文件先归类（Core/Controller/Manager/Services/Server/Helper/Model/Utils），命名清晰表达职能。

## 代码质量

- 文件头注释写明：职责、模块类别、对外接口。
- 每个导出函数/接口前写 JSDoc：作用、参数、返回、副作用。
- **Build 前代码级推演**：改完本目录代码，执行 `npm run build` 前，先推演——类型自洽、name 一致、门控未被破坏、路由未冲突、分层依赖未反向、catch 未吞错。推演通过再构建。
- 错误处理：空 catch 注释原因；try 单一语句；console 日志前缀 `[dsh-hub]`（`[dsh-hub]` 前缀日志会经 dsh-stdout 进 dsh.log，是失效排查的第一手证据，关键路径务必留日志）。
