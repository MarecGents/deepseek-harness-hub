# research-C — 插件层（保留部分）与 Tauri 壳的桥接接口调研

> 调研子代理 C 产出，供 dsh-hub「Node+webviewjs 壳 → Tauri 2.x Rust 壳」迁移方案报告使用。
> 范围：**插件层原样保留**（client UI + config/workspace API + Cordis 装配）如何与 Tauri 壳对接：
> ① Cordis 插件层跑在 Node 运行时，Tauri 壳如何承载（sidecar node？内嵌？）；② web 前端如何与壳通信（webviewjs 桥 → Tauri IPC）；③ profile/bundles/patch 装配机制如何保留。
> 结论全部基于实际读到的文件内容（路径 + 行号可查证）；未读到的标注「未在本地仓库中找到」。

**本地依据（路径均相对 `E:\Workdata\Git_repositories\deepseek\`）：**
- `deepseek-harness-hub\`（当前仓库）：`src\index.ts`、`src\desktop.ts`、`src\client\index.ts`、`src\services\{config-api,workspace-api}.ts`、`tsdown.config.ts`、`cordis.patch.yml`、`package.json`、`bin\launcher.mjs`、`docs\dsh桌面端技术路线-2026-08-16.md`
- `deepseek-harness\`（官方源码）：`packages\boot\app-boot\src\{index,profile}.ts`、`packages\host\webserver\src\index.ts`、`packages\client\ui-slots\src\index.ts`、`packages\client\modules\src\{index,client\{manifest,system}}.ts`、`packages\client\tsdown.client.ts`、`packages\bundle\web-app\{cordis.patch.yml,src\index.ts}`、`packages\settings\settings\src\index.ts`、`vendor\loader\src\config\entry.ts`
- `reference\surrealist-[desk-ui]\`：`src\adapter\{index,desktop}.tsx`、`src-tauri\src\{main.rs,database\mod.rs,config.rs}` —— 外部子进程托管 + adapter 双跑范式
- `reference\dsh-web-ui-[dsh-ui,dsh-plugin]\shared\{tsdown.client.ts,web-platform.ts}` —— client 构建共享预设 + 冻结模块表
- `reference\DSH-better-sidebar-[dsh-ui,dsh-plugin]\`：`src\context-types.ts`、`cordis.patch.yml` —— 双 cordis 类型合并 + 双通道装配样板
- `reference\spacedrive-[desk-ui]\apps\tauri\src-tauri\tauri.conf.json` —— externalBin 伴生二进制打包
- `reference\tauri-[desk-ui-core]\crates\{tauri-utils,tauri-bundler}\src\*.rs` —— sidecar 权限与打包机制

---

## 1. 插件层保留清单（迁移不变式：全部零改动）

迁移分层不变式（`docs\dsh桌面端技术路线-2026-08-16.md` §3）：壳层（desktop.ts + services Windows 专属）重写为 Rust；**插件层原样保留**——client UI、config/workspace API、Cordis 装配机制。以下按「构建产物 → 加载链 → slot → HTTP 路由 → 配置/工作区 API → profile 装配」列出保留面及其在 Tauri 时代的对接点。

### 1.1 client 构建产物（`lib/client.js` 形态 + `__ModuleLoader__` 契约）

包 `@marecgents/dsh-hub` 发布两个 half（`package.json` `main`/`exports["./client"]`）：
- **host half**：`lib/index.js`（tsc ESM，Node），`lib/types/index.d.ts`；插件入口 `export const name='@marecgents/dsh-hub'` + `Config` schema + `apply(ctx, config)`。
- **browser half**：`lib/client.js`（tsdown CJS 闭包），入口 `src/client/index.ts`。

`lib/client.js` 的精确形态（`tsdown.config.ts` L28-49）：
```
banner: window.__ModuleLoader__.load({ id: "@marecgents/dsh-hub", factory: (require) => {
intro:  var module = { exports: {} }; var exports = module.exports;
footer: return module.exports; } });
format: cjs / platform: browser / target es2022 / sourcemap: true / clean: false
```
即：**执行 bundle 只注册 factory，不跑任何模块体副作用**（懒 CJS 模型）；`require` 是注入的同步解析器，走冻结模块表。external 列表 `PLATFORM_MODULES`（L14-21）与官方 seed 表一致：`react / react/jsx-runtime / react-dom / react-dom/client / @deepseek-ai/cordis / dsh-client-ui-slots / dsh-client-web-react / dsh-client-ui-primitives / dsh-client-schema-form`。

官方 client 构建预设（外生态事实源，`reference\dsh-web-ui-[dsh-ui,dsh-plugin]\shared\tsdown.client.ts`）：
- `clientConfig()`（L212-328）与 dsh-hub 同构：CJS + browser + `external: CLIENT_EXTERNALS`（= PLATFORM_MODULES + `@deepseek-ai/dsh-client-runtime/client` 临时豁免）+ `noExternal` 规则「以模块表为界」+ **纯度门**（`dsh-client-bundle-purity`：任何非白名单 `@deepseek-ai/*` value-import 是构建错误，跨插件协作只走 cordis 服务）+ CSS Modules 经 lightningcss 内联（factory 执行时注入 `<style data-plugin>`，卸载时按 id 移除）+ `banner/footer/intro` 三段与 dsh-hub 逐字相同。
- `web-platform.ts`：PLATFORM_MODULES 单一事实源（seed 表 / bundle externals / Vite aliases 共用，防漂移）。

**加载链（浏览器侧，Tauri 时代不变）**——`packages\client\modules`：
1. host 半 `ClientModuleRegistry`（`src\index.ts`）增量扫描 loader 条目，读各包 `package.json` 的 `dsh.client` 声明（`platform:'web'`，`inject` 信息性依赖边，`immediately` 一阶段预取标记），经 `exports["./client"]` 定位 bundle 文件，sha1 12-hex 内容哈希做 rev（L144-158）。
2. `tapIndex` 把 `window.__DSH_BOOT__ = {rev, entries:[{id, url:'/plugins/<id>/client.js?rev=…', rev, inject?, immediately?}]}` 注入 index.html `<head>` 首 script（L168-175，`<` 转义防逃逸）。
3. 路由 `webServer.register({kind:'prefix', path:'/plugins', handler:serveBundle})`（L242-243）：GET/HEAD 伺服 `/plugins/<id>/client.js` 与 `.map`，`cache-control: no-cache`（L421-457）。
4. 浏览器半 `ClientModuleSystem`（`src\client\system.ts`）安装 `window.__ModuleLoader__` 注册槽（L86-95），解析分支序：seed 词 → 静态模块 → 已物化记录 → 注册 factory（递归物化）→ 图行（拉取+物化）→ 其余 loud throw（L142-156）；`invalidate(id)` 是 HMR 全重置钩子（L192-195）。
5. `dsh-client-hmr` 经 `clientModuleRegistry.rebuilt(id)` 换 rev → 图重组合 → 浏览器刷新 bundle（`src\index.ts` L274-292）。

**Tauri 对接点**：整条链跑在 dsh web 进程 + 浏览器里，与壳无关，**零改动**。bundle 经 `http://127.0.0.1:<port>/plugins/…` 伺服，Tauri webview 里同源可拉。

### 1.2 slot 注入点

`ui-slots` 单一注册 API（`packages\client\ui-slots\src\index.ts`）：`SlotMap` 声明合并 + `ctx.slots.register({name,id,order,…}, Component)` + `ctx.slots.inject(name, fn)`（等声明出现、随声明撤销、HMR-safe）。dsh-hub 用到/相关：

| 槽位 | 声明方 | 用途 | 现状 |
|---|---|---|---|
| `settings.plugin.item` | ui-settings-plugins（`slot-contract.ts`，嵌套在「插件配置」tab 内的 list/root 卡片列表） | 插件设置卡片 | dsh-hub 卡片：`declare module '@deepseek-ai/dsh-client-ui-slots'` 合并 + `slots.inject('settings.plugin.item', …)`，`order:30`（`src\client\index.ts` L45-53, L219-225） |
| `settings.section` | ui-settings 契约（list/root，每功能一页），渲染在 ui-settings-general `SettingsRoot` | 独立设置页 | dsh-web-ui 各包用；dsh-hub 未用（卡片走 plugin.item） |
| `settings.plugins.tab` | ui-settings-plugins（list/root） | 插件分区内页签 | 未用 |
| `conversation.chat.turnTail` | ui-conversation | 助手消息尾部 | better-sidebar 用；dsh-hub 未用 |

dsh-hub 其余 UI 注入点（非 slot，DOM 层，保留）：
- **右侧栏 body portal**：`document.body.appendChild(host)` + `createRoot`（`src\client\index.ts` L236-247），镜像 better-sidebar 的 `[data-dsh-better-sidebar]` portal 模式；不占官方 details slot。
- **样式注入**：`injectCardStyle/injectRightSidebarStyle` 幂等 `<style>` 注入；皮肤/背景图经 `data-plugin` 样式 + frame 层背景叠加（`skins.ts`/`backgrounds.ts`）。
- **置顶会话 DOM 增强**：stable 锚点（`data-slot`/`role`），禁 CSS-module hash。

**Tauri 对接点**：无。slot 声明合并、`slots.inject` 都在 client bundle 内，跨环境一致。

### 1.3 HTTP 路由（`/api/dsh-hub/*`）

全部经 `ctx.webServer.register(WebRoute)` 注册（`src\index.ts` `registerRoutes` L284-304），WebRoute = `{kind:'exact'|'prefix', path, handler}`（`packages\host\webserver\src\index.ts` L28-34）：

| 路由 | 工厂 | 方法/语义 |
|---|---|---|
| `/api/dsh-hub/config` | `makeConfigRoutes`（config-api.ts L220） | GET 读 / POST 写（64KB 限体、字段白名单收窄、宽高 clamp 屏幕内、原子写） |
| `/api/dsh-hub/workspace/list` `/workspace/git` | `makeWorkspaceRoutes`（workspace-api.ts L120） | GET；`readdir` 目录树 + `spawn('git')` 状态（3s 超时） |
| `/api/dsh-hub/pins` | `makePinsRoutes`（pins-api.ts） | GET/PUT 置顶会话 |
| `/api/dsh-hub/backgrounds/*` | `makeBackgroundsRoutes`（backgrounds-api.ts） | 静态资源，正则白名单防穿越 |

WebServer 服务能力（迁移对照）：`register/registerUpgrade/registerFallback/tapIndex`；exact + 最长前缀匹配；**只绑 `127.0.0.1`/`0.0.0.0`，`--port 0` 取 OS 随机端口**（web-app patch L115-120）；源码注释明言「Electron 走 file://+IPC bridge，web shape 只走 HTTP」——Tauri 属于 web shape，走 HTTP。

**Tauri 对接点**：路由、持久化（`$DSH_HOME/dsh-hub/config.json` 等）、`ctx.get('webServer')` 时序（`index.ts` 等 webServer fiber ACTIVE 才开窗）全部保留。client 侧 `fetch('/api/dsh-hub/config')` 同源请求在 Tauri webview 照常工作，**唯一前提**是 CSP `connect-src` 允许 `http://127.0.0.1:*`（spacedrive `tauri.conf.json` L39 现成写法）。

### 1.4 配置 / 工作区 API（保留面）

- `ShellConfig` 11 字段 + `DEFAULT_SHELL_CONFIG` + POST 白名单三处一致（`config-api.ts` L42-88；AGENTS 铁律 5/三处一致）。文件 `$DSH_HOME/dsh-hub/config.json`，`.tmp`+rename 原子写；`migrateLegacyPaths` 旧名迁移。
- `workspace-api`：目录树 + Git 检测（`isGit/branch/head/changes`），路径白名单（`isAbsolute`）。
- **保留**：这三个文件在 `src\services\AGENTS.md` 的迁移表里全部标「保留」（`config-api/workspace-api/pins-api/backgrounds-api`），只有壳侧（`dwm-theme/tray/explorer/screen`）标「重写」。

### 1.5 profile / bundles / patch 装配流程（保留核心）

**现状（本机实况 + 代码）**：
- `$DSH_HOME\profiles\web\package.json` → `dsh.profile.bundles = ["@deepseek-ai/dsh-base", "@deepseek-ai/dsh-web-app", "@dsh-external/dsh-super-injector", "@marecgents/dsh-hub"]`；`profiles\web\cordis.yml` = `[]`（空根，整树由 patch 合成）；`profiles\web\cordis.patch.yml` 单条 `insert`：`id: dsh-hub / name: '@marecgents/dsh-hub' / disabled: !!js process.env.DSH_HUB_LAUNCHED !== '1' / config: {title,width,height,tray,theme}`（`cordis.patch.yml` 全 24 行）。
- **junction 装配**：`profiles\web\node_modules\@marecgents\dsh-hub` 是 junction → 包根（本机指向全局 npm 包；`bin\launcher.mjs` `ensureBundleInstalled` L107-228 每次启动自愈：bundles 补 scoped 名 + 建/重指 junction + 清 bare 名残留）。
- **dsh 侧装配（官方唯一实现，`packages\boot\app-boot`）**：
  - `profile.ts` `loadProfile`（L371-403）：`resolveProfileDir` → 无 manifest 时 `initProfile`（模板 web = `[dsh-base, dsh-web-app]`）→ 读 manifest → 每个 bundle `resolveBundleDir`（**安装锚点优先**，再 profile 目录）→ 读该包 `dsh.bundle.patch` 指向的 patch 文件 → 解析 patch 列表；profile 自有 `cordis.patch.yml` 作为用户层。
  - `composeEntries`（L413-419）：`applyEntryPatches([], flat(所有层 patches))` —— bundle 层按序 + 用户层 + `--patch` overlay，一次性合成 entry 列表。
  - `index.ts` `boot()`（L757-802）：`new Context()` → `ctx.plugin(Loader)` → `mountRootInclude`（根 Include entry `id:'include'`，`cordis:include` builtin，`ctx.loader.builtins.include/group` 挂载）→ `loader.await()` → `assertEntriesActivated`（逐 entry 审计 fiber 状态，pending 列缺失服务）。
  - `watchUserPatches`（L232-265）：HMR `registerConfig(cordis.patch.yml)` → 用户 patch 层热重载。
  - `healProfilesModuleFallback`（profile.ts L223-255）：BFS 安装闭包 → `$DSH_HOME/profiles/node_modules` 扁平 junction（每个包一条，Node 父目录上溯解析；**桌面壳 bundling 可复用**）。
  - entry 身份判定：`vendor\loader\src\config\entry.ts` `update()` diff（L142-246）：`name/inject/group` 变 → 整行 replace；仅 config 变 → `fiber.update(config,true)` 热补丁；patch 按 entry id 定位。
- **门控**：`DSH_HUB_LAUNCHED=1`（launcher spawn 时注入）→ patch 行激活；CLI 裸 `dsh web` 完全不挂壳（`src\index.ts` L208-212 + patch `disabled`）。

**Tauri 对接点**（详见 §4）：profile 目录、cordis.yml/patch.yml、bundles 清单、junction 布局全是 dsh 侧数据 + dsh 侧装配代码，**Rust 壳只承担 launcher 语义**（写 bundles/junction 自愈 + spawn `dsh web --port 0` + 注入 `DSH_HUB_LAUNCHED`），语义保留、实现替换。

---

## 2. Node 运行时承载方案调研（Tauri 壳如何跑 Cordis 插件层）

### 2.1 结论先行：sidecar（伴生二进制 + 外部子进程托管）是推荐方案

Cordis 插件层是 **Node ESM 生态**（`dsh` 的 `engines: node ^22.19||>=24`，插件可动态 import、native 模块如 koffi/node-pty），无法进 Rust 进程。三条路：

| 方案 | 结论 | 依据 |
|---|---|---|
| **A. Tauri sidecar**（`bundle.externalBin` 打包 Node 运行时 + `tauri-plugin-shell` 拉起） | **推荐**。三端各绑一个固定版本 Node 二进制，壳 spawn 它跑 `dsh web`；与「外部子进程托管」范式（§2.2）天然契合 | spacedrive `tauri.conf.json` L61 `"externalBin": ["../../../target/release/sd-daemon"]`；tauri-utils `config.rs` L1083「sidecars or DLLs」+ `config_v1\mod.rs` L1830-1834「Enable sidecar execution, allowing the JavaScript layer to spawn a sidecar command」+ shell 插件 `sidecar` 权限项（L1700-1702）；tauri-bundler `bundle.rs` L344-355 对 sidecar 二进制签名 |
| **B. 内嵌（node as a library / SEA 单文件应用）** | **否决**。Node SEA（Single Executable Application）是实验特性，动态 `import()`/native 模块（koffi、node-pty）受限，破坏插件自由形态；无成熟先例 | 未在本地仓库找到任何可抄实现；纯知识判断需在报告中明示 |
| **C. 壳直接 `Command::new("node")` 拉系统 Node** | 降级路径。要求用户装 Node，与「~10MB 免依赖安装包」目标冲突；可作为 sidecar 缺失时的 fallback | surrealist `database\mod.rs` L160-166：executable 可配置，缺省用 PATH 名——同思路 |

sidecar 打包细节（`reference\tauri-[desk-ui-core]`）：
- 命名约定：bundler 期望目标三元组后缀（`tauri-utils\config.rs` L700 注释：「if you're bundling a sidecar called `sqlite3`, the bundler expects…」），即 Windows 侧 `node-x86_64-pc-windows-msvc.exe` 形态。
- 权限：capabilities 里给 shell 插件开 `shell:allow-execute` / sidecar 执行（`config_v1\mod.rs` L1830+）；按窗口 label 白名单（surrealist `capabilities\surrealist.json` 写法）。
- 分发：Node 运行时三端各绑一个固定版本（迁移文档 §6 风险对策：volta pin 下载）；dsh 本体 + 插件走 npm 包或 resources 目录（§4.3 两种模型）。

### 2.2 外部子进程托管范式（surrealist 直抄模板）

`reference\surrealist-[desk-ui]\src-tauri\src\database\mod.rs`（整文件 215 行即完整范式）：
- 状态：`pub struct DatabaseState(pub Mutex<Option<Child>>)` + `app.manage(DatabaseState(Default::default()))`（L13, L86）。
- 启动命令 `start_database`（L16-115）：`start_surreal_process`（L160-214）用 `std::process::Command` 组参数 + `.stdout(Stdio::null()).stderr(Stdio::piped())` + `.env(...)` + `.spawn()`；随后 **`child_proc.stderr.take()` + `thread::spawn` + `BufReader::lines()` 逐行 `window.emit("database:output", line)` 回灌前端**（L64-112），并据此判启动成功/失败（<500ms 无输出 → `database:error`）。
- 停止：`stop_database`（L117-129）`state.0.lock().unwrap().take()` → `kill_surreal_process(child.id())`（shell.rs 按 OS 组 kill 命令）。
- **生命周期清理**：`main.rs` `RunEvent::Exit`（L134-141）取走 Child 并 `kill_surreal_process(child.id())`——壳退出必杀子进程。
- Windows 隐藏控制台：`creation_flags(0x08000000)`（CREATE_NO_WINDOW，shell.rs L68-73）。
- 前端：`adapter/desktop.tsx` `startDatabase/stopDatabase` = `invoke("start_database", {…})`；`initDatabaseEvents` 里 `listen("database:start/stop/output/error")` 更新 store（L332-394）。

**dsh-hub 映射**：`start_dsh(profile?, cwd)` Rust command = `Command::new(sidecar node) args [dshEntry, 'web', '--port', '0']` + env `DSH_HUB_LAUNCHED=1`（+ 保留 `DSH_CMD` 覆盖）；stderr/stdout 逐行 emit `dsh:output`（诊断窗/日志）；`DatabaseState`-等价 `DshProcessState(Mutex<Option<Child>>)`；`RunEvent::Exit`/`ExitRequested` kill；退出码回传 → 崩溃重启 watchdog（≤3 次，quit.marker 语义保留，见 §3.3）。launcher.mjs 的「spawn → 日志重定向 → exit code 判别」整体平移为 Rust 版。

### 2.3 dsh web 进程与 Tauri 主进程的关系（终态拓扑）

```
┌─ Tauri 主进程（Rust exe = 壳；窗口/托盘/单实例/主题/生命周期）─────────┐
│  DshProcessState(Mutex<Option<Child>>)                                │
│  spawn sidecar node → dsh web --port 0 (DSH_HUB_LAUNCHED=1)           │
│  stderr 管道线程 → emit "dsh:output" ；RunEvent::Exit → kill child     │
└───────────────┬───────────────────────────────────────────────────────┘
                │ WebviewUrl::External(http://127.0.0.1:<random-port>)
                ▼
┌─ webview（WebView2 / WKWebView / webkit2gtk）──────────────────────────┐
│  dsh web UI（__DSH_BOOT__/__ModuleLoader__ 加载官方 client bundle）      │
│  + dsh-hub client half（settings 卡片 / 右侧栏 / 皮肤 / 背景）           │
│  + shell-bridge adapter（__TAURI_INTERNALS__ 探测 → invoke/listen）     │
└───────────────┬───────────────────────────────────────────────────────┘
                │ 同源 HTTP（fetch /api/dsh-hub/*、/plugins/*、SSE）
                ▼
┌─ dsh web 进程（sidecar Node = Cordis 插件层，原样保留）────────────────┐
│  app-boot boot() → profile bundles 装配 → webserver(127.0.0.1:随机端口) │
│  host half（config/workspace/pins/backgrounds 路由 + 事件监听）          │
└───────────────────────────────────────────────────────────────────────┘
```

要点：**dsh host 自伺服 UI + API，壳只是窗口 + 子进程管家**（与 spacedrive「Rust core 守护进程 + Tauri 壳」同构，但 core 换成 Node）。`tauri-plugin-localhost`（surrealist L51 `Builder::new(24454)`）是「伺服 Tauri 自带前端」的工具，dsh-hub 不需要——前端 dist 已由 dsh host 伺服（web-app `resolveDistIndex` + frontend-static fallback）。

---

## 3. 前端-壳通信桥（webviewjs 桥 → Tauri IPC）

### 3.1 现状 webviewjs 桥的完整调用面（全部位于壳层 desktop.ts + client half 桥代码）

**host → page**（`src\desktop.ts`）：
| 方向/动作 | 实现 | 位置 |
|---|---|---|
| 托盘命令派发（`mg:shell-command`） | `wv.evaluateScriptWithCallback(dispatchScript)`：`window.__mgShellReady === true ? (dispatchEvent(new CustomEvent(name,{detail})), 1) : 0`，未就绪每 300ms 重试 ×20（覆盖 SPA 冷启动） | L506-544 |
| 请求当前工作区路径 | `wv.evaluateScript('window.__mgSendCurrentWorkspace ? … : null')` + 2s 超时回调 | L633-652 |

**page → host**：
| 动作 | 实现 | 位置 |
|---|---|---|
| 工作区路径回传 | `window.ipc.postMessage('mg:workspace-path:<encodeURIComponent(path)>')`，`wv.onIpcMessage` 前缀分发 | desktop.ts L348-371；client/index.ts L107-116 |
| 会话焦点上报（toast 抑制策略） | `window.ipc.postMessage('mg:session-focus:<id>')` | desktop.ts L363-367；client/index.ts L171-184 |
| 页面主题上报 | `WebViewThemeDetector.handleIpcMessage`（150ms 轮询 `data-ds-dark-theme`） | desktop.ts L290-297, L348-350 |

**client half 暴露的 window 全局**：`__mgShellReady`（模块级就绪旗，L43）、`__mgSendCurrentWorkspace`、`__mgGetCurrentWorkspace`（L159-162）；监听 `window` 事件 `mg:shell-command`（detail.command='new-task' → `workspaces.startSession()` 官方流，L119-154）。

### 3.2 Tauri IPC 对应（迁移映射）

| webviewjs 调用面 | Tauri 对应 | 迁移备注 |
|---|---|---|
| `wv.evaluateScript` 派发命令（拉模式+轮询） | `app.emit('shell:command', {command})` + 前端 `listen`（推模式，无轮询） | 托盘命令在 Rust 菜单回调里直接 emit；就绪竞态由「先 emit、client 挂上后补拉一次快照」或保留一次握手消除 |
| `evaluateScript` 请求工作区路径（请求-响应） | `invoke('get_workspace_path')`（前端主动调）或 Rust 侧读会话状态 | 比现状的「注入脚本+ipc 回传」干净一个往返 |
| `window.ipc.postMessage('mg:workspace-path:'…)` | `emit('workspace-path', path)` 或改 invoke 结果 | 同上 |
| `ipc.postMessage('mg:session-focus:…')` | `emit('session:focus', id)` → Rust 监听 | toast 抑制逻辑（desktop.ts L657-698）平移 |
| 主题同步（页面轮询 data-ds-dark-theme） | Rust 监听 `WindowEvent::ThemeChanged` + `window.set_theme()`；页面侧 `matchMedia('(prefers-color-scheme)')` 或保留轮询 | research-B §1#7 已映射 |
| 托盘/窗口管理（tray.ts / dwm-theme / screen / state-store） | `tauri::tray::TrayIconBuilder` / `set_theme` / `Monitor` API / `tauri-plugin-window-state` 或自写 JSON | 壳层整体重写（research-B §1 全表） |
| 任务完成通知（webviewjs Notification） | `tauri-plugin-notification`（**插件源码未在本地**，surrealist/spacedrive 均未用，排期靠后） | research-B §1#17 |
| 事件声音（playTaskSound） | 保留 Node 侧（sound.ts 在 host 内，非壳 API）或 Rust 侧播放 | 简单映射 |
| 打开文件夹（explorer.ts koffi ShellExecuteW） | `tauri-plugin-shell` `open` / `opener` 能力 | 壳侧重写（research-B §1#14） |

### 3.3 前置如何知道 Tauri 环境（adapter 模式直抄 surrealist）

`reference\surrealist-[desk-ui]\src\adapter\index.tsx`（33 行即完整范式）：
```ts
const useDesktop = "__TAURI_INTERNALS__" in window;      // L7 唯一探测点
const adapter: SurrealistAdapter = useDesktop ? new DesktopAdapter() : new BrowserAdapter();
export const isDesktop = adapter instanceof DesktopAdapter;
```
`DesktopAdapter`（`desktop.tsx`，516 行）是 **Tauri API 调用唯一集中点**：`invoke`（load_config/save_config/start_database…）、`listen`（database:* / window:open_settings / tauri://focus）、`getCurrentWindow()`、插件 API（dialog/fs/os/shell/updater/log）全部在类内，业务组件只调 `adapter.*`。Browser 与 Desktop 双跑共享同一前端，仅 adapter 分支。

**dsh-hub 落地**：新增 `src\client\shell-bridge.ts`（壳桥薄适配层，属插件层可保留，但实现按环境分支）：
- `detectShell()`：`"__TAURI_INTERNALS__" in window` → `'tauri'`；`window.ipc?.postMessage` 存在 → `'webviewjs'`（旧壳兼容期）；否则 `'browser'`（CLI 裸 `dsh web`）。
- 把 `src\client\index.ts` 里散落的 `window.ipc.postMessage(...)` / `__mgSendCurrentWorkspace` 收敛进 adapter 接口：`reportWorkspacePath(path)`、`reportSessionFocus(id)`、`onShellCommand(cb)`（tauri 分支 = `listen('shell:command')`，webviewjs 分支 = `window.addEventListener('mg:shell-command')`，browser 分支 = no-op）。
- 门控不变：`DSH_HUB_LAUNCHED` 决定 host 是否挂壳，client 只在壳存在时工作；adapter 使同一 bundle 在 Web/桌面双跑下行为自洽。
- **HTTP 传输不动**：config/workspace 等仍走 `fetch('/api/dsh-hub/*')` 同源（Tauri webview 里 CSP 放行 `http://127.0.0.1:*` 即可，spacedrive csp `connect-src` L39 现成写法）。

### 3.4 保留 vs 移动的边界（AGENTS 隔离不变式）

- **保留（插件层）**：`src\client\*`（settings 卡片/右侧栏/皮肤/背景/置顶）、`src\services\{config-api,workspace-api,pins-api,backgrounds-api,state-store,icons,png-decode,theme-sync(桥)}`、`tsdown.config.ts`、`cordis.patch.yml`、`package.json` 的 `dsh.{bundle,client}` 声明。
- **移动/重写（壳层）**：`desktop.ts` 整文件、`services\{dwm-theme,tray,explorer,screen}`、`bin\*` 的 launcher 语义（§4.2 实现替换）。
- 桥代码按 `src\services\AGENTS.md` 迁移表标注：`theme-sync.ts` 标「保留（桥）」——即桥的「页面→壳」端保留为 adapter 接口，传输层随环境切换。

---

## 4. 装配机制保留（profile / bundles / patch / junction 在 Tauri 时代）

### 4.1 不变的数据面（dsh 侧，全部原样）

`$DSH_HOME\profiles\<name>\`：`package.json`（`dsh.profile.bundles` 有序清单 + `dependencies`）、`cordis.yml`（空根）、`cordis.patch.yml`（用户 patch 层）、`pnpm-workspace.yaml`（hoisted linker）。`$DSH_HOME\profiles\node_modules\`（`healProfilesModuleFallback` 扁平 fallback）。patch 机制（include：id 定位、insert/override/disabled、`!!js` 表达式、`.tmp+rename` 原子写回、HMR 热重载）与 entry 身份判定（loader entry.ts diff）全在 dsh 进程内，**Tauri 时代一个字节不变**。`dev_fix_patch` / junction 自愈等开发工具依旧有效（它们作用于同一数据面）。

### 4.2 壳侧 launcher 语义：保留语义、替换实现（bin\AGENTS.md 明文）

现状 launcher（`bin\launcher.mjs`，412 行）职责 → Rust 壳对应：

| launcher 职责 | Rust 对应 |
|---|---|
| 单实例 PID 锁（lock.mjs） | `tauri-plugin-single-instance`（research-B §1#8；surrealist main.rs L52-66 可照抄） |
| 多实例共存防护（multi-instance.mjs，默认拒与 CLI dsh 共存） | socket ping 探活或互斥锁（research-B §1#9；语义不可削弱，AGENTS 铁律 4） |
| `ensureBundleInstalled`（bundles 写 scoped 名 + junction 自愈 + 清 bare 残留） | 两种实现（见 4.3）；**幂等 + 每次启动自愈 + scoped 装配**契约不变（铁律：双挂 = duplicate loader entry） |
| spawn `dsh web --port 0` + `DSH_HUB_LAUNCHED=1` | sidecar `Command` + env（§2.2 范式） |
| 崩溃重启 ≤3 次 + quit.marker 判别 | Rust 收 child exit code：0 → 正常退出；非 0 且无 quit.marker → 重启 ≤3；quit.marker 可退役（exe 即应用，托盘退出走 `app.exit(0)` 天然非崩溃） |
| 进程身份（hub-exe.mjs：rcedit 补丁 node.exe 换图标） | 不再需要——Rust exe 就是应用身份 |
| `--port 0` 不可改（随机端口） | 保留：`WebviewUrl::External` 等 dsh stdout 的 URL 行或经事件拿端口 |
| `DSH_HUB_ASSEMBLE_ONLY=1` 诊断模式 | 保留为 Rust 子命令或继续走 sidecar node 脚本 |

### 4.3 junction 装配的 Tauri 时代两种落地

- **模型 A（推荐，演进最平滑）：保持 npm 全局包分发 + Node sidecar 引导**。Tauri exe 里内置一个极薄 node 引导脚本（或直接复用现有 `bin\launcher.mjs` 的装配段）作为 sidecar 入口：它做 `ensureBundleInstalled`（js 里现成的 junction/symlink 逻辑零改动），再 `spawn('dsh', ['web','--port','0'])`。Rust 只 spawn 这个 sidecar + 接管生命周期事件。npm 升级链路（`npm i -g @marecgents/dsh-hub`）与 Tauri 更新（updater）并存。
- **模型 B：全量进安装包（resources + externalBin node）**。dsh + 插件打为 resources 目录，`dsh.profile.bundles` 指向包内资源；junction 改由 Rust 建（Windows `std::os::windows::fs::symlink_dir` = junction；macOS/Linux 普通 symlink，需要时可退回 copy）。profile 的 `node_modules` 布局不变（Loader 的 `baseUrl`/createRequire 解析不变），只是链接目标从「npm 全局包」换成「安装包资源」。
- 共同点：**`$DSH_HOME/profiles/web/package.json` 与 cordis.patch.yml 的写入语义不变**（bundles 数组 + patch 行由装配方写），`boot()` 的 `loadProfile → composeEntries → mountRootInclude → watchUserPatches` 完全在 dsh 进程内，壳不碰。

### 4.4 cordis.patch.yml 门控与 DSH_HUB_LAUNCHED

patch 行 `disabled: !!js process.env.DSH_HUB_LAUNCHED !== '1'` 是**启动门控**（AGENTS 铁律 3）。Tauri 时代由 Rust 在 spawn 时注入同一 env，门控语义不变：CLI 裸 `dsh web` 依旧不挂壳。`!!js` 表达式求值在 loader 侧（`vendor\loader\src\config\entry.ts` `disabledOf` L104-108），与壳无关。

---

## 5. 风险与坑（本调研新增，区别于 research-B）

1. **webview 渲染差异**：Tauri 在 Windows 仍是 WebView2（背景合成一致）；macOS WKWebView / Linux webkit2gtk 的 `position:fixed`/body-portal 合成行为可能不同——右侧栏/背景图是迁移冒烟项（迁移文档 §6 已列）。
2. **CSP 必须放行 dsh host**：Tauri 默认 CSP 较严，需 `connect-src` 含 `http://127.0.0.1:*` 与 `ipc:`，否则 client half 的 fetch 与 Tauri IPC 双双被拦（spacedrive csp 现成写法，L37-41）。
3. **端口获取时序**：`--port 0` 随机端口，Rust 壳需等 dsh stdout 的 `dsh web: http://127.0.0.1:<port>` URL 行（web-app `printUrl` 是 Loader 树 settle 后打印的**就绪信号**，官方注释明言 supervisor 靠它 RPC）或事件回传，再建窗/导航——比现状（host 在 dsh 进程内直接读 `webServer.port`）多一步跨进程取端口。
4. **Node sidecar 版本钉死**：插件生态对 Node 版本敏感（`engines >=24`），三端必须绑同一版本 Node 二进制；native 模块（koffi 等）需按平台预编译进 resources。
5. **quit 语义**：webviewjs 时代的 `process.exit(0)+quit.marker`（规避 0xC0000005）在 Tauri 下不复存在——Rust 壳正常退出即清理子进程（`RunEvent::Exit`），崩溃重启 watchdog 只看 child exit code。
6. **双 cordis 实例类型面**（外生态插件共性，dsh-hub 自身不涉及）：`reference\DSH-better-sidebar-[dsh-ui,dsh-plugin]\src\context-types.ts` L414-476 证明外部插件用 `declare module 'cordis'` + `declare module '@deepseek-ai/cordis'` 双实例合并 + 结构化服务镜像（webServer/sessions/slots…）；Tauri 迁移不改变这一点，但**新壳桥（shell-bridge）若暴露 cordis 服务**，需按同样方式做类型合并。

---

## 6. 一句话决策摘要（供报告直接引用）

- **保留清单**：lib/client.js（`__ModuleLoader__.load` 闭包 + 冻结模块表 externals）、`__DSH_BOOT__`/`/plugins/<id>/client.js` 加载链、`settings.plugin.item`/`settings.section` slot 注入、`/api/dsh-hub/{config,workspace,pins,backgrounds}` 路由、`$DSH_HOME/dsh-hub/config.json` 持久化、`profiles/web` + `cordis.patch.yml` + junction 装配、`DSH_HUB_LAUNCHED` 门控——全部零改动。
- **Node 承载**：sidecar（`bundle.externalBin` 三端各绑固定 Node + tauri-plugin-shell spawn），外部子进程托管直抄 surrealist（`Mutex<Option<Child>>` + stderr 线程逐行 emit + `RunEvent::Exit` kill）；否决 SEA 内嵌。
- **通信桥**：webviewjs 桥（evaluateScript 拉式派发 + `ipc.postMessage` 前缀消息）→ Tauri IPC（invoke 请求响应 + emit/listen 事件）；client half 新增 `__TAURI_INTERNALS__` 探测 adapter（直抄 surrealist `adapter/index.tsx`），HTTP 传输不动。
- **装配机制**：profile/bundles/patch 全在 dsh 进程内保留；Rust 壳只替换 launcher 语义（junction 自愈 + spawn + env 注入 + 崩溃重启），`cordis.patch.yml` 与 `DSH_HUB_LAUNCHED` 门控逐字保留。

---

### 附录：本报告引用的关键文件清单

| 事实 | 文件 |
|---|---|
| client bundle 形态/externals | `deepseek-harness-hub\tsdown.config.ts`；`reference\dsh-web-ui-[dsh-ui,dsh-plugin]\shared\{tsdown.client.ts,web-platform.ts}` |
| 加载链/__DSH_BOOT__/plugins 路由 | `deepseek-harness\packages\client\modules\src\{index.ts,client\{manifest,system}.ts}` |
| slot 系统 | `deepseek-harness\packages\client\ui-slots\src\index.ts`；slot 槽名 `settings.plugin.item/section`（`packages\client\ui-settings-plugins\src\client\{index,slot-contract}.ts`、`ui-settings\src\client\contract\slots.ts`、`ui-settings-general\src\client\index.ts`） |
| 路由注册/webserver 能力 | `deepseek-harness\packages\host\webserver\src\index.ts`；`deepseek-harness-hub\src\{index.ts,services\{config-api,workspace-api}.ts}` |
| profile/bundles/patch 装配 | `deepseek-harness\packages\boot\app-boot\src\{index.ts,profile.ts}`；`deepseek-harness\vendor\loader\src\config\entry.ts`；`deepseek-harness-hub\bin\launcher.mjs` + `cordis.patch.yml` |
| web profile 实况 | `%USERPROFILE%\.dsh\profiles\web\{package.json,cordis.yml,cordis.patch.yml}`（本机 junction 指向 npm 全局包） |
| sidecar/externalBin | `reference\spacedrive-[desk-ui]\apps\tauri\src-tauri\tauri.conf.json` L61；`reference\tauri-[desk-ui-core]\crates\tauri-utils\src\{config.rs,config_v1\mod.rs}` L1700-1860、`crates\tauri-bundler\src\bundle.rs` L344 |
| 外部子进程托管范式 | `reference\surrealist-[desk-ui]\src-tauri\src\database\mod.rs`（全文件）+ `main.rs` L134-141 |
| adapter 双跑/__TAURI_INTERNALS__ | `reference\surrealist-[desk-ui]\src\adapter\{index.tsx,desktop.tsx}` |
| 双 cordis 类型合并 | `reference\DSH-better-sidebar-[dsh-ui,dsh-plugin]\src\context-types.ts` L414-476 |
| 迁移路线/风险 | `deepseek-harness-hub\docs\dsh桌面端技术路线-2026-08-16.md` |
