# REFERENCE — 参考仓库索引

> dsh-hub 开发参考仓库清单（本地 clone 路径 + 调研描述）。
> 每条目的「描述」由并行调研子代理基于实际仓库内容校验后写成，供 agent 开发时快速定位参考源。
> 标签约定：`[desk-ui]` = 桌面壳/窗口层参考；`[dsh-plugin]` = dsh 插件层参考；`[plugin]` = 插件/agent 功能参考；`[ui]` = 前端 UI 参考；`[core]` = 框架核心源码。

## 1. docs
- **文件目录**：`E:\Workdata\Git_repositories\deepseek\docs`
- **描述**：dsh-hub 从零到发布的完整开发档案（2026-08-13~16）：技术栈调研 → WebView2 壳实现与发布（mg-dsh-desktop 0.1.6→0.1.8-rc.2）→ 更名 @marecgents/dsh-hub → Tauri 2.x 迁移决策。组织规律「每个功能一条带时间戳的任务日志，完成即归档 archieved/」。关键参考：① `dsh桌面端技术路线-2026-08-16.md`（Tauri 迁移路线与逐项映射表，最值得先看）；② `deepseek-ai-dsh包调研报告-2026-08-15.md`（221 个官方 npm 包清单 + 30 个高价值 seam 包，插件开发依赖/官方接口索引）；③ `archieved/` 踩坑史（托盘/右侧栏/多实例/窗口管理/junction 注册/npm 发布 registry 踩坑）；④ `archieved/mg-dsh-desktop-项目交接文档-2026-08-14.md`（双 half 插件架构全貌，新 agent 第一入口）。⚠️ 旧文档为 mg-dsh-desktop 时代，包名/环境变量以技术路线最新命名为准（`@marecgents/dsh-hub` / `DSH_HUB_*`）。
- **关键目录要点**：
  - `archieved/`（50 篇）→ 历史任务日志（托盘/右侧栏/多实例/窗口分辨率/发布记录），开发同类功能先查
  - `dsh桌面端技术路线-2026-08-16.md` → Tauri 2.x 迁移决策与 desktop.ts/托盘/通知/窗口状态/单实例逐项映射表
  - `deepseek-ai-dsh包调研报告-2026-08-15.md` → 官方 dsh 包生态索引
  - `会话损坏修复记录-2026-08-16-1023.md` → 多实例会话 seq 冲突修复（session.jsonl.zstd 格式细节）
- **调研状态**：已完成

## 2. deepseek-harness
- **文件目录**：`E:\Workdata\Git_repositories\deepseek\deepseek-harness`
- **描述**：DeepSeek AI 官方开源的 agent harness 单仓库（npm 根包 `@deepseek-ai/dsh-root`（2026-08-30 已 pull 到最新 master，HEAD cd5ef81481，**release dsh-0.1.2-alpha.1**；较 0.1.1-rc.2 新增图片管理重构之后的若干迭代），MIT，developer preview，官方声明会有破坏性变更）。pnpm monorepo（60+ 包，ESM 全栈，Node ^22.19||>=24），核心是「万物皆插件」——基于 source-vendored 的 Cordis 框架（vendor/ 内 rescope 为 `@deepseek-ai/cordis`、`cordis-plugin-loader`、`-include`、`-group`、`-hmr`、`-timer` 等 9 包，README 含 manifest + 18 条本地修改日志），无特权核心、一切可替换。一个运行中的 dsh = 按层装配的插件树：profile（`$DSH_HOME/profiles/<name>`）列出有序 bundles（`dsh.bundle.patch` 指向 patch 文件），`cordis.patch.yml` 按 entry id 打补丁（含 `!!js` 插值、`--dump-config`），Cordis Loader 挂载条目，`inject` 表达服务依赖，`ctx.effect()`/`ctx.on()` 注册可逆 effect（注册即 effect、卸载即回滚），类型化事件（declare merging + emit/waterfall/parallel/serial 四种 dispatch）是主要扩展点；会话侧是 append-only `SessionEvent` 日志（JSONL/SQLite）。⚠️ 官方源码中无「插件身份四重相等」术语，最接近的是 `vendor/loader/src/config/entry.ts` 的 entry diff 判定（name/inject/group 变化 → 整行 replace，仅 config 变化 → 热补丁，patch 按 entry id 定位）——dsh-hub 沿用该概念时需对照此文件。参考价值：①profile bundles 装配看 `packages/boot/app-boot/`（含 `$DSH_HOME/profiles/node_modules` 扁平 symlink 的 `healProfilesModuleFallback`，桌面壳 bundling 可直接复用）；②HTTP 路由官方接口看 `packages/host/webserver/`（`ctx.webServer` register/registerUpgrade/registerFallback/tapIndex，**只绑 127.0.0.1/0.0.0.0**，注释言明 Electron 走 file://+IPC bridge——Tauri 迁移对照）；③slot 系统看 `packages/client/ui-slots/`（SlotMap 声明合并 + 单一 register API + 四份 props share）+ `.agents/notes/implemented/architecture/2026-07-22-slot-type-chain-implementation.md`（定义性文档）；④查任意 `ctx.*` 服务/事件/配置以 `docs/` 下源码生成的 catalogs 与 `subsystems/` 为准（CI 保鲜），每包 README 带 Model Experience + Known Limitations。
- **关键目录要点**：
  - `docs/` → 官方接口权威入口：architecture.md、cordis-primer.md、config/tool/event catalogs、subsystems/
  - `vendor/` → vendored Cordis 全家桶（cordis/loader/include/group/hmr/timer/schemastery，rescope @deepseek-ai/*；entry.ts = 插件条目身份判定源码）
  - `packages/boot/app-boot/` → profile bundles 装配唯一官方实现（loadProfile/composeEntries/watchUserPatches/healProfilesModuleFallback）
  - `packages/host/webserver` + `packages/client/ui-slots` → webServer 路由与 slot 系统（桌面壳最相关）
  - `apps/cli` + `apps/web` → 入口与 web 前端壳
- **调研状态**：已完成

### 2.1 2026-08-27 实测补充（会话/左栏/locale/menu）
- **会话改名链路**：client `sessions.binding(id).session.rename(title)` → `api.sessions.rename({sessionId,title})` RPC → host 持久化 → settle「title」事件 → byId 快照更新 → 左栏/标签/详情等所有消费 displayTitle 的 UI 自动联动（单一事实源）。
- **左栏树结构（ui-workspace）**：会话树容器 `role="tree"`、行 = `div[role="treeitem"]`（项目行带 aria-expanded、会话行 aria-selected、搜索行 `button[role=treeitem]`、空态 `.empty` div 在树容器内）；slot 容器 `div[data-slot="sidebar.workspaces"]`；行尾 `span.rowActions` = 官方 ⋯ 菜单锚点（span→Menu(portal, closeOnPointerLeave)→anchor button，`POINTER_GRACE_MS=200`）。
- **官方重命名对话框**：行 ⋯ 菜单 → `onRename(id,title)` → `WorkspaceBrowser.onSessionRename` → React 内部 state（`setSessionRenameTarget/Draft`）——**无外部触发面**；⚠️ 实测该 ⋯ 弹层在本环境（WebView2/Tauri dev）合成事件与真实点击均无法打开（BUG_FIX_SOP/踩坑 #85）——此类官方弹层不可依赖。
- **ui-primitives Menu**：item = `<button role="menuitem">`（icon+itemLabel span），容器 `role="menu"`，portal 到 body；`closeOnPointerLeave` 关闭窗口 200ms。
- **官方 locale**：`packages/client/locale`——语言设置在 dsh 设置 General（Language 行，插件自带）；active locale 写入 `document.documentElement.lang`；词典 = flat key→template（zh 键源），命名空间经 `declare module '@deepseek-ai/dsh-client-ui-slots' { interface LocaleNamespaceMap {…} }` 合并；插件可用 `<html lang>` + MutationObserver 自订阅（dsh-hub locale.ts 做法）。
## 3. awesome-tauri-[desk-ui,desk-ui-plugin]
- **文件目录**：`E:\Workdata\Git_repositories\deepseek\reference\awesome-tauri-[desk-ui,desk-ui-plugin]`
- **描述**：Tauri 官方维护的 **awesome 精选资源清单**（awesome.re 仓库，非插件 monorepo——本身不含插件源码，README 全为外链）。覆盖面：入门/模板、约 50 个社区插件（`tauri-plugin-pinia`/`tauri-plugin-svelte` 持久化 store、`tauri-plugin-theme` 主题切换、`window-vibrancy`/`window-shadows` 窗口效果、`tauri-update-server` 等）、集成工具（Tauri Specta 类型安全命令、MCP server、更新服务器）、大量 Tauri 桌面应用案例（含托盘/菜单栏应用 KFtray、GitBar、SwitchShuttle、TrayFier）。对 dsh-hub Tauri 2.x 迁移的价值是**索引而非实现**：官方插件（store/shell/fs/notification/updater/single-instance/window-state/tray 等）源码需顺 README 的 `tauri-apps/plugins-workspace` 入口去拿；自动更新可参考清单给出的多个 update-server 实现；主题可参考 `tauri-plugin-theme`。注意：README 未单独列出 single-instance/window-state/tray/deep-link 官方插件条目，需在 plugins-workspace 内确认。
- **关键目录要点**：
  - `README.md`（543 行）→ 唯一实质内容；**Development → Plugins 段（L89-141）是找官方插件实现的关键入口**（含 `plugins-workspace` 链接）
  - `package.json` + `.github/` → 纯清单仓库（awesome-lint 校验、收录标准：Tauri 2.x+/开源/30 天+/英文文档）
- **调研状态**：已完成

## 4. cordis-[dsh-plugin]
- **文件目录**：`E:\Workdata\Git_repositories\deepseek\reference\cordis-[dsh-plugin]`
- **描述**：Cordis 官方 monorepo（cordiverse/cordis，main @ 8cc9e33，9 包）——dsh-hub 插件层依赖的 Cordis v4 核心实现（`cordis@4.0.0-rc.8`，API 未稳定，peer 依赖 loader/include）。定位「时空可组合性元框架」：**Fiber 管时间维（插件生命周期）、Context 的 isolate/intercept 管空间维（上下文作用域）**。核心：`new Context()` 建根，`ctx.plugin(fn|class|{apply}, config)` 装配插件，每个插件实例是一个 Fiber，生命周期由 `ctx.effect(execute, label)` 管理（dispose 可同步/异步/生成器），Fiber 经 epoch 与依赖（inject）驱动六态状态机（PENDING/LOADING/ACTIVE/FAILED/DISPOSED/UNLOADING）自动卸载/重载；事件系统提供 `on/once/emit/parallel/serial/bail/waterfall` 六种派发 + `internal/plugin|service|update|listener|dispatch` 扩展点；服务经 `Service` 基类 + `ctx.provide/reflect`（get/set/provide/mixin/accessor）注册，Proxy 化 Context 惰性解析（`ctx.get`）+ `@Inject` 声明依赖，服务上下线自动触发依赖 fiber 刷新；装配由 `plugin-loader`（Entry/EntryTree/EntryGroup：按 id 管理、baseUrl 相对 import、`cordis:` 内置前缀、isolate LocalRealm/GlobalRealm）+ `plugin-include`（YAML 配置 + 按 id patches：override/insert/disabled、`.tmp+rename` 原子写回、只读检测）构成——**dsh-hub 的 profile/cordis.patch.yml/dev_fix_patch 机制是它的直系对应**（`loader.create`/`ctx.loader` 即源于 loader 包），`include/tests/patch.spec.ts` 可当行为规范读；`plugin-hmr` 基于 Node ModuleLoader 内部钩子做插件级热重载；`timer` 提供 `ctx.timeout/interval/throttle/debounce`（effect 式自动清理）。参考方式：查 API 直接读 `packages/core/src/*.ts`（9 文件即全部核心 API：fiber/events/context/registry/service/reflect/logger），以 `packages/core/tests/*.spec.ts`（plugin/service/events/dispose/associate）为可运行范例；装配/配置写法看 `loader/src/config/entry.ts` 与 `include/`。⚠️ 仓库无 docs/（README 链接的 cordis-primer 由 deepseek-harness.github.io 托管，可作配套文档源）。
- **关键目录要点**：
  - `packages/core/src/` → 内核全部源码（fiber.ts 生命周期状态机 + FiberState、events.ts 六种派发、registry.ts Plugin 三种形态 + @Inject、context.ts Proxy + isolate/intercept、service.ts/reflect.ts）
  - `packages/core/tests/` → 每个概念的可用示例（plugin/service/events/dispose/associate.spec.ts，比 README 实用）
  - `packages/loader/src/config/` → Entry/EntryTree/EntryGroup（按 id 管理、baseUrl、`cordis:` 前缀、isolate realm）+ internal.ts（Node ModuleLoader 钩子）
  - `packages/include/` → 配置驱动 + patches（override/insert/disabled、.tmp+rename 原子写回、只读检测；patch.spec.ts 当行为规范）
  - `packages/timer` / `hmr` / `create` / `utils` → ctx 定时器（effect 式清理）/ 插件热重载 / 脚手架 / effect 化 List
- **调研状态**：已完成

## 5. DeepSeek-Reasonix-[ui,plugin]
- **文件目录**：`E:\Workdata\Git_repositories\deepseek\reference\DeepSeek-Reasonix-[ui,plugin]`
- **描述**：以 Go 单二进制为内核、深度适配 DeepSeek API（OpenAI 兼容 + Anthropic Messages 双协议 + prefix-cache 优化）的 cache-first 自主编码 agent（约 v1.26.0，MIT，remote esengine/DeepSeek-Reasonix）。同一内核提供 CLI/TUI、桌面应用、浏览器（HTTP/SSE）、ACP 编辑器四种前端。⚠️ **桌面栈是 Wails v2.13（Go 绑定 + WebView2），非 Tauri**——其 WebView2 平台经验与整套前端 UI 设计仍可借鉴（dsh-hub 现为 dev-v2 **Tauri-only**，WebView2 时代壳已删，本仓库仅作历史参考）。桌面壳 `desktop/`：React 19 + TS + Vite + pnpm（zustand / react-virtuoso 虚拟化 transcript / @xterm/xterm 内置终端 / mermaid·katex），`bridge.ts` 以 `window.go.main.App` 绑定 + `runtime.EventsOn("agent:event")` 类型化事件流**直连 Go 内核（无 HTTP 中转）**，含 WebView2 平台诊断/恢复、窗口状态、自动更新、托盘、8 套官方主题包。DeepSeek 适配关键：thinking 模式流式 `reasoning_content`（`RequiresToolCallReasoning` 策略）、missing-reasoning 静默重试、长思考（官方最高 384K tokens）取消处理、系统提示前缀字节稳定保持 prefix-cache 命中、官方访问可一键迁移 Anthropic Messages 端点（`/anthropic` 带服务端 web search）、内置价格/成本账本（cache_hit/input/output、CNY/USD、闲时半价）。插件体系两层：声明式（skills/agents/commands/prompts/hooks/MCP servers/themes 随包分发）+ Manifest v2 代码扩展（sidecar 跑 Extension Protocol v2，可拦截/替换事件、贡献流式模型 `plugin/<plugin>/<provider>/<model>`、结构化 UI 与斜杠命令、只读主题），运行时 fail-atomic 快照 reload。参考价值：① settings 面板体系（SettingsPanel/ProviderAccessSettings/ThemeGallery）、三种 desktop layout、命令面板、en/zh/zh-TW i18n、transcript 虚拟化单写者滚动仲裁；② agent 功能（传输无关 Controller 分层、权限审批、plan mode/checkpoint、子代理 profile、上下文预算环 ContextWindowRing）；③ DeepSeek API 双协议适配与成本账单。分发参考：`npm/reasonix` 仅做原生二进制分发（optionalDependencies 分平台 `@reasonix/cli-*`）。
- **关键目录要点**：
  - `desktop/` → Wails 桌面壳（WebView2 平台诊断/更新/托盘/主题包，React 19 前端）
  - `internal/` → Go 内核 80+ 包（control 控制器 / provider 三协议 / plugin 插件体系 / billing·i18n）
  - `docs/` → EXTENSIONS.md / PLUGIN_PACKAGES.md / EXTENSION_PROTOCOL.md / ACP.md / SPEC.md（17 个 hook、单属主替换槽、流式 provider 贡献、结构化 UI 规范）
  - `cmd/` + `sdk/go` + `npm/reasonix` → 多入口（reasonix / -launcher / -plugin-example / extension-protocol-gen）、零依赖 Go SDK、二进制 npm 分发模式
- **调研状态**：已完成

### 5.1 2026-08-27 实测补充（主题移植）
- 官方 8 主题（desktop/themes/official/official-*/theme.json）：每套**浅/深双板**，token 固定 15 键 `bg/bgSoft/bgElev/panel/sidebar/chat/workspace/workspaceFiles/border/borderSoft/fg/fgDim/fgFaint/accent/accentFg`——与 dsh 皮肤 token 矩阵直接映射（dsh-hub 移植生成器推导规则见 docs/skins/rx-noir-gold.md）。
## 6. DSH-better-sidebar-[dsh-ui,dsh-plugin]
- **文件目录**：`E:\Workdata\Git_repositories\deepseek\reference\DSH-better-sidebar-[dsh-ui,dsh-plugin]`
- **描述**：已发布 npm 的官方外生态 dsh 插件（v0.12.3，源码态）。VSCode 风格「右侧栏 + 底部面板」双工作台（文件管理器/CodeMirror 编辑器/内嵌沙箱浏览器/xterm+node-pty 真实终端/Git 面板/subagent 后台任务），按会话隔离持久化，核心启动约 325KB、重依赖懒加载。单包 host/client 双半结构：`cordis.patch.yml` 单条 insert 装配（`better-sidebar`），双安装通道（官方 profile bundle 与 plugin-registry），双 client bundle 同源编译。host 半（`src/index.ts`）注册 `/sidebar/api/*` JSON API、`/sidebar/file` 媒体、`/sidebar/html` 预览、`/sidebar/bundle` 懒加载 chunk、`/sidebar/ws/terminal` WebSocket（node-pty），按 sessionId 隔离 + Host 头信任围栏，并 `ctx.tools` 注册 `terminal_*` 工具；client 半 React 18 挂 `document.body` 的 `[data-dsh-better-sidebar]` portal（非 slot），slots 仅 `settings.section` 与 `conversation.chat.turnTail` 两处注入，i18n 走 `ctx.locale` 词典。对外暴露 `ctx.betterSidebar` 服务（`registerTab`/`registerFileViewer`），内置 7 tab + 6 viewer 走同一服务（吃狗粮）。UI 令牌驱动（`--dsw-alias-*`，与皮肤中心 10 款皮肤自动兼容）；构建：host ESM + 2 个 CJS 浏览器 bundle（`__ModuleLoader__.load` banner、10 项 externals）+ 2 个懒加载 chunk（`globalThis.__dshChunks__`）+ 纯度门（禁 client value-import 其他 `@deepseek-ai/*`，跨插件协作只走 cordis 服务）；`src/context-types.ts` 用 `declare module 'cordis'/'@deepseek-ai/cordis'` 类型合并（client 零 Node 依赖）。工程规范：仓库内 AGENTS.md 接入文档、18 份 docs/plans/ 设计文档、~60 vitest + `mount.e2e.ts` 真实挂载 CI 门禁、OIDC 自动发版。参考价值：dsh 插件开发完整样板（双通道声明/patch 装配/双半划分/HMR-safe disposer/CI 门禁/发版流水线）、官方 UI token 正确姿势（`tests/theme.spec.ts` 守护）、slot 与 portal 边界、懒加载 chunk 路由、服务化扩展点（registerTab + 类型合并 + 能力探测）；`platform: web` 的挂载方式对 dsh-hub Tauri 2.x webview 迁移可直接沿用。
- **关键目录要点**：
  - `cordis.patch.yml` + `package.json`（dsh.bundle.patch/dsh.client.inject）→ 双通道装配声明样板
  - `src/index.ts`（host）+ `src/client/`（React portal 侧边栏）→ 双半结构 + /sidebar 路由全家 + 信任围栏
  - `src/context-types.ts` → 双 cordis 实例类型合并技巧（declare module）
  - `tsdown.config.ts` → client bundle 形态（ModuleLoader banner/externals/懒加载 chunk/纯度门）
  - `tests/theme.spec.ts` + `tests/e2e/mount.e2e.ts` → 令牌守护 + 真实挂载 CI 门禁
- **调研状态**：已完成

## 7. dsh-web-ui-[dsh-ui,dsh-plugin]
- **文件目录**：`E:\Workdata\Git_repositories\deepseek\reference\dsh-web-ui-[dsh-ui,dsh-plugin]`
- **描述**：dsh 的插件/皮肤全家桶 monorepo（npm 名 `dsh-web-ui`，Apache-2.0，git remote `zhu1090093659/dsh-web-ui`）——13 个 cordis bundle 插件包（dsh-web-ui-settings / dsh-task-board / dsh-git-graph / dsh-ssh / dsh-remote-web-ui / dsh-pet / dsh-live-stats / dsh-aionui-panel / dsh-tool-describe-image / dsh-liangshen / dsh-community-plugins 等：任务看板、Git 图谱、右侧面板、移动端远程(SSE+扫码)、SSH 运维、实时吞吐、图像理解、宠物、agent 预设）+ 12 款主题皮肤（miku/qq98/matrix/dragon-heir/trading/whale-mom 等）+ 皮肤画廊静态站，全部经 `cordis.patch.yml` + profile 机制挂载，不修改 dsh 源码、只基于 `@deepseek-ai/*` 官方 SDK。插件为 host/client 双半区：host（cordis 插件，`inject: ['webServer','settings']`，mount-once 防重，schemastery Config，`ctx.effect` 挂路由）；client（类型层 `declare module '@deepseek-ai/dsh-client-ui-slots'` 扩展槽位，运行时 `ctx.slots.inject('settings.section')` + `ctx.locale.register` 中英词典）。UI 定制两条路：功能插件走官方 slots 系统（跨插件协作只走 cordis 服务，禁 value import）；皮肤绕开 token/slot 直接 DOM 层叠加（body attribute `data-dsh-<id>` 作用域 + CSS Modules + effect 撤销 + skin.json 元数据，`dsh-skin use` 写 profile patch managed 区段实现互斥）——说明官方主题 API 未暴露 token 级定制接口。client 构建统一走 `shared/tsdown.client.ts`（tsdown + lightningcss，`__ModuleLoader__.load` 注册，外部依赖冻结种子表 web-platform.ts，另有 `mobileBundle()` 移动端自包含页）。参考价值：bundle 插件全生命周期样板（脚手架→patch→注入→聚合→发版门禁）、client slots/多语言/设置卡注入规范、tsdown client 构建预设与冻结模块表、多包聚合防 duplicate-id 命名空间方案（`web-ui-` 前缀）。附：仓库自带 `.dsh/skills/`（skin-developer / pet-developer / community-plugin-developer / dsh-web-ui-release 四个 agent skill）与 `docs/plugins.md` 入桶流程，CI 全部门禁（typecheck/test/docs/aggregate/gallery/skin-center）。
- **关键目录要点**：
  - `packages/dsh-*` → dsh 插件开发路径活体样板（patch + host/client + tsdown 共享预设）；按功能名挑包看
  - `shared/tsdown.client.ts` + `web-platform.ts` → client 构建唯一事实源、externals 冻结模块表
  - `packages/skins/<id>` + `dsh-skins` → 皮肤定制样板（skin.json + client apply() DOM 叠加 + 互斥启用）
  - `packages/dsh-web-ui-all` + `scripts/` → 聚合机制（aggregate.yml → 聚合 patch，`web-ui-` 前缀防 duplicate id）+ 插件/皮肤脚手架
  - `.dsh/skills/` + `docs/plugins.md` → 4 个 agent skill 与新插件入桶流程
- **调研状态**：已完成

## 8. opencode-[plugin]
- **文件目录**：`E:\Workdata\Git_repositories\deepseek\reference\opencode-[plugin]`
- **描述**：成熟商业化开源 agent（anomalyco/opencode，v1.18.18，MIT，累计下载约 1020 万，社区一线）。技术栈：Bun workspaces + Turbo + TypeScript + Effect 4（Service/Layer/Schema/HttpApi）+ Drizzle/SQLite + Vercel AI SDK（约 20 家 provider）；TUI 用 @opentui(Solid)，Web/桌面 UI 用 SolidJS + Vite + Tailwind，**桌面壳是 Electron 42（非 Tauri）**。架构：CLI 跑本地 HTTP Server（Effect HttpApi + WebSocket + mdns 发现 + auth + projectors 事件投影），TUI/桌面/SDK 均经 `@opencode-ai/sdk` 客户端连接；分层 schema → core → protocol → server，client 由 HttpApi 代码生成。对 dsh-hub 最相关：① **插件体系**——config 驱动（opencode.json 的 plugin 数组），`packages/opencode/src/plugin/loader.ts` 按需 npm 安装 → server/tui 入口解析 → 版本兼容检查 → 动态 import，插件返回 `Hooks` 对象（tool/auth/provider/event/config + chat.*/permission.ask/command.execute.before/tool.execute.before·after/shell.env/compacting/text.complete/tool.definition 等约 20 个生命周期钩子），另有 v2 effect/promise 双形态 API——"钩子面"扩展模式，可对照 Cordis 依赖注入容器借鉴钩子粒度划分；② **会话管理**——SQLite 持久化 + 父子 fork + 摘要 + share/revert(snapshot) + compaction，V2 核心（`packages/core/src/session`）把 prompt 准入（落库 session_input 收件箱）与模型执行分离，SessionExecution 按 sessionID 全局调度，System Context 用 Context Source/Context Epoch 代数化管理；③ 商业化形态——MIT 核心 + Electron 桌面（BETA）+ enterprise 包 + control-plane/identity/stats 云组件。另可借鉴：事件投影 projectors、工具注册表与输出截断、Electron preload IPC + i18n 分层（对照 Tauri 迁移）。
- **关键目录要点**：
  - `packages/core/src/session` → 会话管理（prompt 准入/执行分离、compaction、Context Epoch）——新功能借鉴重点
  - `packages/opencode/src/plugin/loader.ts` → 插件装载管线与 Hooks 生命周期（注：在 opencode 包内，非 core）
  - `packages/app` → 产品 Web 端（SolidJS，被 Electron 壳复用；`packages/web` 只是营销站）
  - `packages/enterprise` → 商业化扩展形态
- **调研状态**：已完成

### 8.1 2026-08-27 实测补充（opencode 配色配方）
- `packages/ui/src/theme/resolve.ts` 调色板：近黑/近白中性底 + 橙强调（#FF8C00 系）+ 功能色（红/青/黄绿/紫）；dsh-hub oc-classic/oc-graphite 据此移植（docs/skins/）。
## 9. spacedrive-[desk-ui]
- **文件目录**：`E:\Workdata\Git_repositories\deepseek\reference\spacedrive-[desk-ui]`
- **描述**：Spacedrive v2（2.0.0-alpha.2）——本地优先的跨设备文件/数据平台（VDFS 虚拟分布式文件系统 + BLAKE3 内容寻址 + Iroh/QUIC P2P 同步 + AI 数据安全层），「Rust core 守护进程 + Tauri 2 桌面壳 + React 前端」daemon-client 架构，完整可用的 Tauri 2 参考工程（tauri 2.1，features: macos-private-api/devtools/protocol-asset + 7 官方插件：dialog/fs/shell/clipboard-manager/global-shortcut/os/updater）。对 dsh-hub Tauri 迁移的具体参考价值：① **壳层保持薄**——窗口/菜单/快捷键/守护进程生命周期全放 `apps/tauri/src-tauri`，业务逻辑留独立 Rust core（与 dsh-hub「壳层重写、插件层保留」方向一致；注意它用 daemon socket 探活做单实例，非 single-instance 插件，可对比取舍）；② **多窗口范式**——`windows.rs` 的 `SpacedriveWindow` 枚举（Main/Explorer/Settings/Inspector/QuickPreview/VoiceOverlay/ContextMenu 等 17 类）统一生成 label，`WebviewWindowBuilder` + `WebviewUrl::App(route)` 动态建多 webview 窗口（transparent/always_on_top/skip_taskbar 组合），capabilities 按窗口 label 白名单授权；③ **主题**——Windows DWM 暗色标题栏（`DwmSetWindowAttribute`：immersive dark mode + caption/border color）与 macOS `ns_window` 私有 API 样式，可直接借鉴；④ **IPC 桥接模式**——`main.rs` 前端 invoke → `#[tauri::command]`：`daemon_request`（把前端 JSON 代理到 daemon TCP JSON-RPC）、`get_daemon_socket`、`set_current_library_id`（持久化 + `window.eval` 注入全局变量 + emit 事件）、文件打开/分享、全局快捷键、拖拽会话、原生菜单动态启停；daemon 事件经后台 TCP 订阅线程 `app.emit("core-event")` 广播；⑤ **发布链路**——`externalBin` 把 sd-daemon 伴生二进制打进安装包 + updater 接 GitHub Release + Windows `embedBootstrapper` + macOS entitlements；beforeBuildCommand 先 `build:daemon:release` 再 `vite build`；daemon 生命周期（macOS LaunchAgent / Linux systemd user unit / Windows 计划任务）全在壳层。⚠️ 仓库体量巨大，参考时只看 `apps/tauri` 与 `core` 的桥接边界。
- **关键目录要点**：
  - `apps/tauri/` → Tauri 2 桌面壳本体（src-tauri 配置/ACL/Rust 壳 + React 前端 + sd-tauri-core 桥接）——dsh-hub 迁移核心参照
  - `core/` → Rust 业务核心（CQRS/DDD、SQLite/SeaORM、specta 生成 TS 类型、daemon TCP JSON-RPC 127.0.0.1:6969）
  - `packages/interface` + `packages/ts-client` → 平台无关 React UI（Platform 抽象接口）与自动生成 TS 客户端
  - `apps/tauri/src-tauri/src/windows.rs` + `main.rs` → 多窗口枚举 + DWM 暗色标题栏 + IPC 代理桥接（daemon_request）
- **调研状态**：已完成

## 10. surrealist-[desk-ui]
- **文件目录**：`E:\Workdata\Git_repositories\deepseek\reference\surrealist-[desk-ui]`
- **描述**：SurrealDB 官方桌面 GUI（Tauri 2 + React 19/Vite 5/Mantine 9，**bun 工程**，构建走 `bun run tauri:dev/build`），「WebView 壳 + 本地服务」形态与 dsh-hub 高度同构。⚠️ 已被 SurrealDB Studio 取代、仓库仅作历史参考（README 明确），但 Tauri 2 工程结构完整可用。对 dsh-hub Tauri 迁移最有价值：① **单实例+深链+二次启动传参三合一**：`single-instance` 回调把第二实例 args 转 URL 存入 `OpenResourceState` → emit `open-resource` → 聚焦最后窗口；macOS `RunEvent::Opened` 走同路；deep-link 注册 `surrealist://` scheme（OAuth 回跳 + 意图分发）；② **自动更新闭环**：tauri.conf 配 pubkey/endpoints + 前端 `check()`/`downloadAndInstall`（带进度）/`relaunch()`（plugin-process），大版本升级前 `backup_config` 备份；③ **localhost 插件**（端口 24454）生产环境 HTTP 伺服前端——dsh-hub 本地服务场景直接适用；④ **外部子进程托管**：`std::process::Command` spawn `surreal start`，stderr 管道逐行 emit `database:output` 回前端，`RunEvent::Exit` kill——"桌面壳托管本地服务"范式；⑤ **窗口/标题栏**：`window.rs` 动态多窗口（label 带时间戳）、macOS overlay 标题栏/非 macOS 无边框 + 前端 `--titlebar-offset` CSS 变量自绘、last-focused 跟踪；⑥ **adapter 双跑模式**（新增亮点）：前端 `"__TAURI_INTERNALS__" in window` 探测桌面环境，Browser/Docker/Mini/Desktop 四套适配器切换，`desktop.tsx` 是 Tauri API 调用唯一集中点——dsh-hub 同一前端 Web/桌面双跑可照搬；⑦ **安全模型**：文件打开白名单（深链/参数带入文件须先入 whitelist 才可 read/write，单文件限 5MB）；`config.rs` 写 `dirs::config_dir()/SurrealDB/config.json` 并版本备份/恢复。两个诚实提示：capabilities 有 `core:tray:default` 但全仓库**无托盘实现代码**（有权限未使用，勿照抄）；单实例/深链/更新等用法以 Cargo.toml 插件清单为准。
- **关键目录要点**：
  - `src-tauri/Cargo.toml` → Tauri 2 插件清单（tauri 2.4.0 + fs/os/log/shell/dialog/process/updater/deep-link/localhost/single-instance，macOS cocoa/objc）
  - `src-tauri/src/` → 单实例/深链/子进程托管/窗口管理/config 备份实现
  - `src/adapter/` → 环境适配器模式（`__TAURI_INTERNALS__` 探测、Desktop 适配器集中 Tauri API）
  - `src-tauri/capabilities/surrealist.json` → Tauri 2 权限清单按需授权写法（window/menu/tray/deep-link/updater/shell/dialog/os/fs）
  - `tauri.conf.json` → 更新 pubkey/endpoints、deep-link scheme、localhost 端口
- **调研状态**：已完成

## 11. tauri-[desk-ui-core]
- **文件目录**：`E:\Workdata\Git_repositories\deepseek\reference\tauri-[desk-ui-core]`
- **描述**：Tauri 2.x 框架官方源码 monorepo（tauri-apps/tauri，workspace 内 tauri=2.11.5，dev 分支 HEAD=8b67a47a，位于 v2.11.5 tag 后 103 commits）。Rust workspace + pnpm 双包管理，分层：配置解析/构建宏（tauri-build/codegen/macros）→ 核心运行时（tauri，依赖 tauri-runtime 抽象）→ 平台实现（tauri-runtime-wry 对接 wry，wry 再调 WebView2/WKWebView/WebKitGTK；窗口与托盘经 tao/muda/tray-icon 落到 OS）；工具链 crates（tauri-bundler 打包 / tauri-cli / tauri-driver WebDriver / tauri-schema-generator）。对 dsh-hub Tauri 迁移是 **Rust 侧权威参考**：窗口 API 在 `crates/tauri/src/window/mod.rs`（show/hide/close/theme/set_theme/set_title_bar_style 等），托盘 `crates/tauri/src/tray/mod.rs`（TrayIconBuilder），菜单 `crates/tauri/src/menu/`（基于 muda），事件 `crates/tauri/src/event/`（Emitter/Listener + event-system-spec.md 设计文档），命令/IPC `crates/tauri/src/ipc/`（invoke_handler + generate_handler!、Channel 流式、ACL authority）。重点看 `examples/api/src-tauri/src/lib.rs`：create_tray、MenuBuilder、WebviewWindowBuilder、`RunEvent::ExitRequested` 用 `prevent_exit()` 保托盘常驻、`CloseRequested` 拦截后 destroy——正是桌面壳的典型模式；其余官方示例：multiwebview/multiwindow/splashscreen/streaming/run-return/file-associations/resources/isolation/commands/drag/state（多窗口、启动屏、文件关联、隔离模式等直接相关）。两点提醒：① **tao/wry 源码不在此仓库**（独立仓库，仅锁定版本，Cargo.lock 实为 tao 0.36.0 / wry 0.56.0），读窗口/WebView2 底层须另查；② **single-instance 不在核心**，是外部插件 `tauri-plugin-single-instance`（本仓库仅在 CLI `tauri add single-instance` 中引用），迁移时需查插件仓库。
- **关键目录要点**：
  - `crates/tauri/src/` → 核心 API（window/tray/menu/event/ipc/webview/vibrancy）
  - `crates/tauri-runtime` + `tauri-runtime-wry` → 运行时抽象与 WRY 实现（Windows=WebView2）
  - `examples/api/src-tauri/` → 旗舰示例（托盘/菜单/窗口/事件/ExitRequested 保活）
  - `packages/api` + `packages/cli` → JS 侧 @tauri-apps/api / @tauri-apps/cli
  - `ARCHITECTURE.md` → 架构总纲（TAO/WRY 为外部 crate 的依赖关系说明）
- **调研状态**：已完成
