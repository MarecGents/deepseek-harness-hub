# research-B — Tauri 2.x 能力调研：与 WebView2 壳能力映射表

> 调研子代理 B 产出，供 dsh-hub「Node+webviewjs 壳 → Tauri 2.x Rust 壳」迁移方案报告使用。
> 调研范围：只读本地参考仓库，结论全部基于实际读到的内容；找不到的明确标注「未在本地仓库中找到」。
>
> 本地依据（路径均相对 `E:\Workdata\Git_repositories\deepseek\`）：
> - `reference\tauri-[desk-ui-core]`：Tauri 2.x 框架源码（tauri=2.11.5 dev 分支），核心 API 权威来源
> - `reference\spacedrive-[desk-ui]\apps\tauri`：Tauri 2 完整桌面工程（多窗口/DWM 暗色标题栏/daemon TCP 代理/externalBin）
> - `reference\surrealist-[desk-ui]\src-tauri` + `src\`：Tauri 2 工程（单实例+深链+localhost+updater+子进程托管+adapter 双跑）
> - `reference\awesome-tauri-[desk-ui,desk-ui-plugin]\README.md`：官方插件索引（L91 指向 plugins-workspace，**该 workspace 未 clone 到本地**）
> - `deepseek-harness-hub\`（当前壳）：`bin\{launcher,lock,multi-instance,tray-helper}.mjs`、`src\desktop.ts`、`src\services\{tray,dwm-theme,theme-sync,screen,state-store,config-api}.ts`

---

## 0. 三个先说清的前提

1. **TrayIcon（托盘）在 Tauri 2 是核心 API，不是插件**：`crates/tauri/src/tray/mod.rs` 的 `TrayIconBuilder` 属于 `tauri` 主 crate，无需任何 `tauri-plugin-tray`。技术路线文档（`docs\dsh桌面端技术路线-2026-08-16.md` L42「services/tray.ts → tauri-plugin-tray」）的写法需更正。
2. **官方插件源码不在本地**：`single-instance / deep-link / updater / localhost / window-state / store / notification / shell` 等 `tauri-plugin-*` 的实现源码位于 `tauri-apps/plugins-workspace`（awesome-tauri README L91 仅有链接），**未 clone**。本报告对它们的结论来自两个真实工程的**使用样例**（Cargo.toml 插件清单 + 初始化代码 + capabilities + tauri.conf 配置），插件内部行为不做臆测。
3. **tao/wry 源码也不在本地**（独立仓库，Cargo.lock 锁定 tao 0.36.0 / wry 0.56.0）；窗口/WebView2 底层行为以 ARCHITECTURE.md 的描述与核心 API 签名为准。

---

## 1. 能力映射表（当前 WebView2 壳 → Tauri 2.x）

「当前壳」列给出 dsh-hub 现有实现文件（可查证）；「Tauri 对应」列给出核心 API / 官方插件；「本地参考」列给出可抄的本地文件与行号。

| # | 当前壳能力（实现位置） | Tauri 2.x 对应 | 关键 API / 配置 | 本地参考实现 | 备注 |
|---|---|---|---|---|---|
| 1 | 窗口创建（标题/尺寸/居中/最大化）：`src/desktop.ts` createWindow L307-337（`createBrowserWindow` + `setMinSize(480,360,true)` + `center()` + `setMaximized`） | `WebviewWindowBuilder`（运行时建窗）或 `tauri.conf.json → app.windows[]`（静态配置） | `WebviewWindowBuilder::new(app, label, WebviewUrl)`.title().inner_size().min_inner_size().center().resizable().build()（`window/mod.rs` L820-847，**inner_size/min_inner_size 均为逻辑像素 f64**） | surrealist `src-tauri/src/window.rs` L20-56；spacedrive `windows.rs` L404-449（create_window 助手）；splashscreen `tauri.conf.json` L11-27 | 可照抄 builder 形态；当前桌面壳只开 1 个主窗 |
| 2 | 逻辑像素换算：`desktop.ts` L328（`logical: size.logical`）、L412（`setSize(w,h,logical)`）；保存尺寸=逻辑、3/4 屏默认=物理 | `Window::set_size(Size::Logical\|Physical)`、`inner_size()→PhysicalSize<u32>`、`outer_size()`、`scale_factor()` | `set_size<S: Into<Size>>`（`window/mod.rs` L1840）、`inner_size` L1503、`scale_factor` L1486；`Monitor::size()` 返回物理、`Monitor::scale_factor` L101 | spacedrive `windows.rs` position_overlay_window L461-483（`width*scale_factor` 逻辑→物理换算 + `Position::Physical`） | **需改造**：当前 `setSize(w,h,logical)` 双参数语义 → 显式 `Size::Logical(LogicalSize::new(w,h))`；迁移时换算逻辑集中在 Rust 一处 |
| 3 | 位置/多显示器：`services/screen.ts` L55-90（koffi user32：光标→MonitorFromPoint→GetMonitorInfo）；`w.center()` | `window.center()`；`current_monitor/primary_monitor/available_monitors`（`window/mod.rs` L1602/1624/1634）；`Monitor::{position,size,scale_factor}` | `set_position(Position::Logical\|Physical)`（L1879） | spacedrive `windows.rs` L293-308（屏幕底部居中定位）、L461-483（多显示器定位助手） | **需改造**：koffi/user32 整块删除，改用 Monitor API；语义等价 |
| 4 | 无边框/透明/最小尺寸/置顶/跳过任务栏/阴影：`desktop.ts`（createBrowserWindow 选项 + setMinSize） | Builder 链：`.decorations(false).transparent(true).always_on_top(true).skip_taskbar(true).shadow(false).visible(false).focused(true)`；运行时：`set_decorations` L2032 / `set_shadow` L2049 / `set_always_on_top` L2107 / `set_skip_taskbar` L2177 | `WindowEvent::ThemeChanged` 等见 #7；Windows 透明窗需 `transparent: true` + 前端透明背景 | spacedrive `windows.rs` FloatingControls L276-312、VoiceOverlay L314-333、TagAssignment/SearchOverlay L248-273（无边框+透明+置顶组合） | 可照抄（当前壳未用透明，属新能力储备） |
| 5 | 窗口状态记忆：`services/state-store.ts`（`$DSH_HOME/dsh-hub-window-state.json`，`JsonWindowStateStore`，MIN 480×360 / MAX_POSITION 8000 防退化值） | 两条路：①保留现状语义，Rust 壳自读写同一 JSON（`$DSH_HOME` 路径不变）；②官方 `tauri-plugin-window-state`（**插件源码未在本地，仅知存在**） | 手写：`dirs` / `std::env::var("DSH_HOME")` + serde_json；插件：`tauri add window-state` | surrealist `src-tauri/src/paths.rs` + `config.rs` L27-77（手写文件持久化范式） | **需改造**：建议保留自写 JSON 以兼容现有 `dsh-hub-window-state.json`（升级平滑），插件是可选替代 |
| 6 | 系统托盘：`services/tray.ts` `WebViewTray`（独立 helper 进程 `bin/tray-helper.mjs` + 进程内兜底；菜单 show/open-workspace/new-task/quit；双击恢复） | **核心 API** `tauri::tray::TrayIconBuilder`（`crates/tauri/src/tray/mod.rs` L203-386：`new/icon/tooltip/title/menu/show_menu_on_left_click/on_menu_event/on_tray_icon_event/build`）+ `tauri::menu::{Menu,MenuItem}`；`AppHandle::{tray_by_id, remove_tray_by_id}`（`app.rs` L828/842） | 托盘常驻模式：`RunEvent::ExitRequested { api, code }` 且 `code.is_none()` → `api.prevent_exit()`（examples/api `lib.rs` L167-170） | examples/api `src-tauri/src/tray.rs` L13-127（完整托盘：菜单切换/动态改 icon/点击恢复窗口）；spacedrive 未用托盘（`capabilities` 有 core:tray:default 权限但无实现——**勿照抄**） | **可照抄**；helper 进程模式整体删除（Tauri 托盘回调在主事件循环内原生执行），注意 `show_menu_on_left_click(false)`（Windows 惯例：左键直接恢复窗口） |
| 7 | 主题同步（DWM 暗色标题栏）：`services/dwm-theme.ts`（koffi `DwmSetWindowAttribute(hwnd, 20, …)` + PowerShell 兜底）+ `theme-sync.ts`（页面 data-ds-dark-theme 轮询桥） | `Window::set_theme(Option<Theme>)`（`window/mod.rs` L1912；**Windows 下自动同步菜单主题** L1918-1931 走 muda `set_theme_for_hwnd`）+ `WindowEvent::ThemeChanged(Theme)`（`tauri-runtime/src/window.rs` L64，经 `RunEvent::WindowEvent` 接收）+ `Window::theme()` L1745 | 手动 DWM 增强：`DWMWA_USE_IMMERSIVE_DARK_MODE=20`、`DWMWA_CAPTION_COLOR=35`、`DWMWA_BORDER_COLOR=34`（spacedrive `windows.rs` L638-698） | spacedrive `windows.rs` L632-698 `apply_dark_titlebar`（DWM 三属性，可整段照抄）；examples/api 无主题示例 | **需改造**：优先 `set_theme`（官方路径，覆盖标题栏+菜单）；如需强制标题栏配色（覆盖用户强调色）再叠加 spacedrive 的 DWM 手动调用。当前 koffi/PowerShell 全部删除 |
| 8 | 单实例锁（桌面壳 PID 锁）：`bin/lock.mjs` + `bin/launcher.mjs` L277-282（acquireLock 失败 → 弹窗退出） | `tauri-plugin-single-instance`（**插件源码未在本地**；用法：`init(\|app, args, cwd\| { … })` 回调在第二实例启动时触发，可拿 args、聚焦已有窗口） | 回调内：`open::store_resources(app, args)` + `window::emit_last(app, "open-resource", ())` + `window.set_focus()` | surrealist `src-tauri/src/main.rs` L52-66（单实例回调：二次启动传参转事件 + 聚焦最后窗口——**可照抄**） | **可照抄用法**；PID 锁文件可退役（插件跨进程语义更强），但「随机端口无法用 netstat 判桌面实例」的坑（bin/AGENTS.md 铁律 4）不复存在 |
| 9 | 多实例共存检测（拒绝与 CLI `dsh web` 共存，保护 $DSH_HOME 会话）：`bin/multi-instance.mjs` L52-96（netstat + CIM 进程名匹配）+ L132-170（默认拦截 / 勾选后 Yes-No 确认） | **无官方插件**；等价物：对 dsh host 固定端口做 socket ping 探活（TCP connect + 超时），或复用 single-instance 插件的「第二实例必然触发回调」语义 | `TcpStream::connect` + 500ms timeout（tokio 或 std） | spacedrive `main.rs` is_daemon_running L1509-1558（TCP ping 判活——**可照抄**） | **需改造**：语义必须保留（AGENTS.md 铁律 4：默认拒共存）；检测目标从「netstat+CIM 进程表」改为「探 dsh host 端口」或保留一个互斥文件锁；确认对话框走 `tauri-plugin-dialog` 的 message（`DialogExt`，spacedrive `main.rs` L1735-1743 用法） |
| 10 | 崩溃重启：`bin/launcher.mjs` L29-32 + L376-407（child exit 非 0 → 自动重启 ≤3 次，quit.marker 永不重启） | **无内置「崩溃自动重启」**；仅 `AppHandle::restart() -> !` / `request_restart()`（`app.rs` L588-623，更新后主动重启用）+ `tauri-plugin-process` 的 `relaunch()`（surrealist 更新后调用） | 守护进程模式需自建：外部 watchdog（现有 launcher 概念保留，只是被守护对象从 node 进程变为 Tauri exe）或 Windows 计划任务/服务 | spacedrive `main.rs` daemon 探活+重启编排 L1509-1617（守护「伴生 daemon」而非自身） | **需改造**：launcher 语义保留；Tauri 下「托盘退出」天然不经过 launcher（exe 即应用），quit.marker 机制可删除，改由 `app.exit(0)` 正常退出 + watchdog 看退出码 |
| 11 | 深链唤醒：当前壳**无**（无自定义 scheme） | `tauri-plugin-deep-link`（**插件源码未在本地**）：`tauri.conf.json → plugins.deep-link.desktop.schemes: ["dsh-hub"]` + `.plugin(tauri_plugin_deep_link::init())`；macOS 另经 `RunEvent::Opened { urls }`（examples/api `lib.rs` L199） | Windows 侧：scheme 激活时以「第二实例 + 命令行参数」到达 → 由 single-instance 回调收 args（surrealist `open.rs` L19-35 store_resources 把 args 转 URL 分发，L83-88 按 `surrealist://` host 分发意图） | surrealist `main.rs` L49/L128-133 + `tauri.conf.json` L80-85 + `open.rs` L19-35 | **可照抄**；注意 Tauri 2 的 deep-link 在 Windows 依赖 single-instance 机制收参（本地证据：surrealist 两插件并用 + store_resources 处理 env::args） |
| 12 | 自动更新：当前**无**（npm 全局包分发，`npm i -g` + postinstall） | `tauri-plugin-updater`（**插件源码未在本地**）：`tauri.conf.json → plugins.updater.pubkey/endpoints` + `bundle.createUpdaterArtifacts: true`；前端 `check()` → `update.downloadAndInstall(progress)` → `relaunch()` | Windows 安装器注意：`bundle.windows.webviewInstallMode.embedBootstrapper`（spacedrive `tauri.conf.json` L94-99）；签名/证书在 `bundle.windows` 段 | surrealist `tauri.conf.json` L73-79（pubkey/endpoints）+ `src/hooks/updater.tsx` L51-85（check→downloadAndInstall 进度→relaunch，**可照抄**）；spacedrive `tauri.conf.json` L101-108 | **可照抄用法**；发布模型从 npm 迁移到 GitHub Release + latest.json（spacedrive L105 指向 GitHub Releases） |
| 13 | 本地 HTTP 服务（dsh host）：launcher `spawn dsh web --port 0`（随机端口）+ `desktop.ts` L373-376 `wv.loadUrl(targetUrl)` | **场景差异要分清**：dsh UI 由 dsh host（Node 进程）伺服 → 壳用 `WebviewUrl::External(url)`（examples/api `lib.rs` L95 用法）；`tauri-plugin-localhost`（surrealist L51 `Builder::new(24454)`）是**生产环境伺服 Tauri 自带前端**用的，**不是**连外部服务的工具 | 壳拿端口：spawn dsh 时解析 stdout/端口文件（现状 `--port 0` 语义保留）；`WebviewUrl::External` 直连 | surrealist `main.rs` L51（localhost 插件注册）+ `adapter/desktop.tsx`（前端探测桌面环境）；spacedrive 壳层只开窗不伺服（daemon HTTP server 自管） | **需改造**：dsh-hub 走「External + dsh host 自伺服」即可，localhost 插件仅在壳需要自带兜底页面时引入；client half 的 HTTP/WS 对接路径与现状完全相同（AGENTS.md §6） |
| 14 | 外部子进程托管：launcher spawn dsh（`bin/launcher.mjs` L333-408）+ 托盘 helper（`bin/tray-helper.mjs`）；`services/explorer.ts`（ShellExecuteW 打开文件夹） | Rust 侧 `std::process::Command`（同步/线程 + stderr 管道逐行 emit 回前端）；前端侧 `tauri-plugin-shell`（**插件源码未在本地**）；打包：`bundle.externalBin` 打伴生二进制（spacedrive `tauri.conf.json` L61）+ `find_daemon_binary` 目标三元组后缀（spacedrive `main.rs` L1561-1585）；`RunEvent::Exit` 钩子清理子进程（surrealist `main.rs` L134-141） | Windows 隐藏控制台：`creation_flags(0x08000000)`（CREATE_NO_WINDOW，surrealist `shell.rs` L68-73） | surrealist `database/mod.rs` L16-215（spawn + stderr 线程 → `window.emit("database:output")`）+ `shell.rs` L5-79（按 OS 组命令）——**可照抄**；spacedrive `main.rs` start_daemon L1588-1617 + 探活等待 | **可照抄**；explorer 打开文件夹 → `tauri-plugin-shell` 的 `open` 或 `opener` 能力（spacedrive `files.rs::reveal_file` 亦可参考，未细读标注） |
| 15 | 启动屏：`desktop.ts` L341-376（`splashHtml` + SPLASH_MS 后 loadUrl）+ L180-211 | 官方 splashscreen 模式：`tauri.conf.json` 主窗 `visible:false` + 独立 splash 窗（`decorations:false, resizable:false, url: splashscreen.html`）；前端就绪后 invoke `close_splashscreen` 命令（关 splash + show 主窗） | 配置见 splashscreen `tauri.conf.json` L11-27 | examples/splashscreen `main.rs` L9-19 + `tauri.conf.json` | **可照抄**；比现状（HTML 注入 + setTimeout）更干净：原生双窗，无 JS 定时器竞态 |
| 16 | 配置持久化：`services/config-api.ts`（`$DSH_HOME/dsh-hub/config.json`，原子写 + 旧名迁移；ShellConfig 11 字段） | 配置**属主仍是 dsh host**（Node），Tauri 壳原则上不再持有 ShellConfig 副本；壳自有的窗口状态走 #5；若 Rust 侧确需配置：`dirs::config_dir()` 或读 `DSH_HOME` env + serde_json（surrealist `config.rs` 范式），或 `tauri-plugin-store`（**插件源码未在本地**） | 版本备份范式：surrealist `config.rs` L54-77（`backup_config(version)` + `restore_config_backup`，大版本更新前备份） | surrealist `config.rs` L27-77（load/save/backup/restore + 目录自建）——**可照抄** | **需改造**：迁移时保持 `/api/dsh-hub/config` 路由与 `$DSH_HOME` 文件路径不变（升级平滑），Rust 只新增「壳侧窗口状态」读写 |
| 17 | 会话完成通知：`index.ts` 通知接线（Windows toast，webviewjs Notification） | `tauri-plugin-notification`（**插件源码未在本地**；awesome README L91 官方 plugins-workspace 含 notifications；surrealist/spacedrive 均未使用） | 用法需查 plugins-workspace | 本地无使用样例 | 未在本地仓库中找到实现/用法；迁移排期靠后 |
| 18 | 多窗口/右侧栏扩展位：`client/right-sidebar.tsx`（body portal，单窗内 DOM 层） | 需要新窗口时：`WebviewWindowBuilder` + **capabilities 按 window label 授权**（`capabilities/*.json` 的 `windows: ["label", "glob-*"]`） | capabilities 授权模型见 §2.2；label 生成 + 按类型建窗见 spacedrive | spacedrive `windows.rs` L4-448（SpacedriveWindow 枚举 → label → builder）+ `capabilities/default.json` L5-13；examples/multiwindow `main.rs` L10-34 | **可照抄**（未来需求，当前迁移可不做） |

---

## 2. 关键差异与坑

### 2.1 逻辑像素 vs 物理像素（迁移第 1 坑）
- **Builder 侧全逻辑**：`WebviewWindowBuilder::{position, inner_size, min_inner_size}` 参数是 `f64` 逻辑像素（`window/mod.rs` L821-847 注释明确）。
- **Getter 侧全物理**：`Window::{inner_position, inner_size, outer_size}` 返回 `PhysicalPosition<i32>/PhysicalSize<u32>`（L1491-1512）；`Monitor::size()` 亦物理。
- **Setter 侧二选一**：`set_size<S: Into<Size>>`（L1840）与 `set_position<Pos: Into<Position>>`（L1879）接受 `Size::Logical\|Physical` / `Position::Logical\|Physical` 枚举。
- **换算**：`scale_factor()`（L1486，Result<f64>）；spacedrive 的 `position_overlay_window`（`windows.rs` L461-483）是现成换算模板：`物理 = round(逻辑 × scale_factor)`，`Monitor::position()` 做多显示器偏移。
- **现状对照**：dsh-hub `desktop.ts` 的 `setSize(w, h, logical)` 双参数（逻辑 flag）与保存尺寸=逻辑、3/4 屏默认=物理的混合——迁移时**统一为 `Size::Logical`**（保存尺寸/默认值全逻辑），只在需要贴显示器边缘（如 overlay）时换算物理。state-store 的 MAX_POSITION=8000 校验保留（防失效显示器坐标）。

### 2.2 capabilities ACL 权限模型（与 webviewjs 完全不同）
- Tauri 2 所有 `invoke` 命令、事件、窗口操作都要过 ACL：`capabilities/*.json` 声明 `identifier` + `windows`（label 或 **glob**，如 `["surrealist-*"]`）+ `permissions`（`core:default`、`core:window:allow-*`、插件 `plugin:allow-*` 等逐项白名单）。
- **按窗口 label 授权**：surrealist 主窗 `surrealist-*` 一次授权；spacedrive 对 `main/spacebot/voice-overlay/inspector-*` 等窗口名分组（`capabilities/default.json` L5-13）。**多窗口时必须给每个新 label 配权限，否则该窗口内前端调用直接失败**（examples/multiwindow `main.rs` L22-33 展示了运行时用 `runtime_authority_mut().__allow_command` 补授权，非配置态写法）。
- 常见权限集样例（surrealist `capabilities/surrealist.json` L6-46）：窗口操作（close/set-title/maximize/minimize/show/set-always-on-top/start-dragging）、`core:tray:default`、`updater:allow-check` / `allow-download-and-install`、`process:allow-restart`、`deep-link:default`、`shell:allow-open`、`fs:allow-read-*`、`dialog:allow-open`。
- **坑**：权限漏配的表现是前端 invoke 静默 reject（不报 Rust 编译错）；迁移时建议先按需最小授权、逐功能加（与 dsh-hub 的「配置三处一致」纪律同思路）。

### 2.3 tao/wry 底层：Windows 渲染不变，壳层全换
- ARCHITECTURE.md L79-86：TAO = winit 的 fork（窗口/菜单栏/系统托盘），WRY = WebView 抽象层。Windows 上 wry 走 **WebView2**（与当前 webviewjs 同一渲染内核），Linux 走 WebKitGTK，macOS 走 WKWebView——**dsh Web UI 的渲染兼容性不变**。
- 影响面：窗口/托盘/菜单/事件循环从「webviewjs + koffi FFI」换成「tao + muda + tray-icon + wry」，而**页面内容、HTTP/WS 对接、client half 零改动**（AGENTS.md §6 的迁移方向与 spacedrive「壳薄」范式一致）。
- 副作用：当前 koffi 直调（dwm-theme.ts、screen.ts、explorer.ts、hub-exe rcedit）全部退役；`0xC0000005` webviewjs teardown 崩溃、`quit.marker`、`process.exit(0)` 规避等 webviewjs 特有问题消失（Tauri 用 `app.exit(code)` 正常退出，examples/api `lib.rs` tray 的 quit 即 `app.exit(0)`）。

### 2.4 托盘在 Linux/GTK 的注意
- 托盘是核心 API（§0.1），但 Linux 上的呈现依赖系统托盘实现（StatusNotifierItem/appindicator），**本仓库内无相关细节**（tao/tray-icon 源码不在本地，awesome README 亦无 Linux 托盘条目）——迁移到 Linux 时需实测；Windows/macOS 托盘 API 行为以 examples/api `tray.rs` 为基准即可。
- `show_menu_on_left_click(false)`（examples/api `tray.rs` L49）是 Windows 惯例：左键直接触发 `on_tray_icon_event(Click)` 恢复窗口（L109-123），菜单由右键弹出——与当前 dsh-hub 托盘交互（显示/隐藏主界面、打开工作区、新建任务、退出 + 双击恢复）可 1:1 映射。

### 2.5 「单实例/多实例」两层语义要分开落
- **单实例（桌面壳自己）**：`tauri-plugin-single-instance`（surrealist L52-66）替代 PID 锁——第二实例不再弹窗拒绝而是**唤醒已有实例**（聚焦 + 传参），体验更好；但 dsh-hub 现语义是「拒绝第二桌面壳」（AGENTS.md 铁律 4 的壳层部分），插件回调里可 `app.exit(0)` 保持拒绝，或改为唤醒（需产品决策）。
- **多实例共存（与 CLI dsh 共享 $DSH_HOME）**：没有官方插件，spacedrive 的 TCP ping（L1509-1558）是最接近的本地范式；dsh host 的端口是随机的（`--port 0`），所以要么壳在 spawn dsh 时固定端口（改语义）、要么保留探活文件（如现有 `launcher.lock` 或 dsh host 的某个固定探针），**默认拒绝共存的红线不能松**。

### 2.6 崩溃重启无内置
- Tauri 只有主动重启（`AppHandle::restart` / `request_restart`，`app.rs` L588-623；插件 `process:relaunch`）；**「非 0 退出自动拉起」没有内建**。方案：保留外部 launcher（守护进程）概念，被守护对象换成 Tauri exe；或 Windows 上用任务计划/服务兜底（spacedrive 对 daemon 就是这么做的：`schtasks`/`launchctl`/`systemd` 安装服务，`main.rs` L970-1405）。dsh-hub 现 launcher 的「≤3 次重启 + quit 不重启」逻辑可直接平移。

### 2.7 前端与 Tauri 的对接形态（client half 零改动的前提）
- dsh-hub 的 client half（React）走 dsh host 的 HTTP/WS（`/api/dsh-hub/*`、`ctx.webServer`），**不需要** `__TAURI_INTERNALS__`；因此 `tauri.conf.json` 可保持 `withGlobalTauri: false`（surrealist L88），Tauri 的 IPC/event 仅壳内 Rust↔壳前端使用。
- 若壳内要显示自带页面（设置页等），注意 CSP：`connect-src` 需放行 `ipc: http://ipc.localhost`（splashscreen 示例 L29）+ dsh host 的 `http://127.0.0.1:*`（spacedrive `tauri.conf.json` L39）。
- adapter 双跑探测（surrealist `src/adapter/desktop.tsx` L48-120：`getCurrentWindow().show()`、`listen("config-updated"/"open-resource"/"tauri://focus")`、`--titlebar-offset` CSS 变量）是「同一前端 Web/桌面双跑」的现成样板，dsh-hub 未来若要让 web 前端感知桌面环境可直接照搬（当前 client half 靠 `mg:*` IPC 桥，可不改）。

### 2.8 其他
- **macOS 专属**：`TitleBarStyle::Overlay` + `hidden_title(true)`（surrealist `window.rs` L35-40）、`ns_window()` 原生句柄（spacedrive `windows.rs` L549-573）——仅 mac 迁移时用。
- **Windows 打包**：WebView2 引导 `embedBootstrapper`（spacedrive `tauri.conf.json` L94-99）处理无 WebView2 Runtime 的机器；NSIS 模板可完全自定义（surrealist `res/installer.nsi`）。
- **`externalBin` 目标三元组后缀**：spacedrive `find_daemon_binary`（L1561-1585）先找 `sd-daemon-<triple>.exe` 再退化裸名——伴生 dsh 二进制（如未来把 Node/dsh 打包进安装包）照此处理。
- **事件模型**：`Emitter::emit/emit_to/emit_filter` + `Listener::listen/once/unlisten`（`lib.rs` L825-1014）替代 webviewjs 的 `onIpcMessage` 字符串桥；壳内 Rust↔壳前端用事件，壳↔dsh host 仍走 HTTP/WS（与现状一致）。

---

## 3. 参考实现摘录（spacedrive / surrealist 各 3 处）

### 3.1 spacedrive（`reference\spacedrive-[desk-ui]\apps\tauri`）

1. **`src-tauri/src/windows.rs` L632-698 — `apply_dark_titlebar`（Windows DWM 暗色标题栏）** — [可照抄]
   作用：`DwmSetWindowAttribute` 三连（`DWMWA_USE_IMMERSIVE_DARK_MODE=20` 暗色图标 + `DWMWA_CAPTION_COLOR=35` 覆盖用户强调色 + `DWMWA_BORDER_COLOR=34` 边框同色），`window.hwnd()` 取原生句柄。dsh-hub 的 `dwm-theme.ts`（koffi 同一调用）可直接被它替换；若走官方 `Window::set_theme` 则此段是「增强层」（强制标题栏配色）。注意 `#[cfg(target_os = "windows")]` + 内嵌 `mod dwm` 声明，无外部依赖。

2. **`src-tauri/src/windows.rs` L4-448 — `SpacedriveWindow` 枚举 + `label()` + `show()/create()` 多窗口范式** — [需改造]
   作用：17 类窗口统一由枚举驱动（`label()` 生成唯一名，含 `hash_string` 与参数拼接；`show()` 先查已存在则聚焦，否则 `create()`；`create_window` 助手收拢 size/min_size/decorations/transparent/always_on_top 五参数）。dsh-hub 当前单主窗，改造点：去掉与 dsh 无关的窗口类型，保留 label 生成 + 聚焦/复用 + `#[cfg(debug_assertions)] devtools(true)`（L432-435）+ `window.show()/set_focus()` 收尾（L445-446）。

3. **`src-tauri/src/main.rs` L623-675（`daemon_request`）+ L1509-1558（`is_daemon_running`）+ L1588-1617（`start_daemon`）— daemon TCP 代理 + 探活 + 伴生进程启动** — [需改造]
   作用：壳把前端 JSON 请求代理到 daemon 的 127.0.0.1 TCP JSON-RPC（`daemon_request` 每次短连接）；`is_daemon_running` 用「connect + 写 Ping + 500ms 超时读」判活；`start_daemon` 用 `std::process::Command` 拉起伴生二进制并轮询探活。dsh-hub 改造点：dsh host 对接不是 TCP JSON-RPC 而是 HTTP/WS，但**探活+启动+等待就绪**三段结构完全复用（尤其 `is_daemon_running` 直接用于 #9 多实例共存检测）；`find_daemon_binary`（L1561-1585）的 externalBin 三元组后缀查找可直接照抄。

### 3.2 surrealist（`reference\surrealist-[desk-ui]`）

1. **`src-tauri/src/main.rs` L43-66 — 插件链 + single-instance 回调三合一** — [可照抄]
   作用：`tauri_plugin_localhost::Builder::new(24454)`、`tauri_plugin_updater::Builder::new().build()`、`tauri_plugin_deep_link::init()`、`tauri_plugin_single_instance::init(|app, args, _| { store_resources; emit "open-resource"; set_focus })` 的完整注册顺序，外加 `RunEvent::Exit`（L134-141）清理子进程。dsh-hub 的 Tauri 壳插件装配清单 = 本段裁剪（去掉 localhost/database，保留 single-instance/deep-link/updater/process/log）+ 自己加 `dialog`（多实例确认弹窗）。

2. **`src-tauri/src/database/mod.rs` L16-215 + `shell.rs` L5-79 — 外部子进程托管（spawn + stderr 管道 → 事件）** — [可照抄]
   作用：`start_surreal_process` 组命令（`shell.rs` 按 OS 给 `cmd /c` / `zsh -l -c` / `bash -l -c`，Windows `creation_flags(0x08000000)` 隐藏控制台）；`start_database` 把 `child.stderr` 交给后台线程逐行 `window.emit("database:output", line)`，进程提前退出（<500ms 无输出）判定启动失败；`stop_database` 用 `taskkill /pid /f /t`。这正是 dsh-hub「壳托管 dsh 进程 + 日志回流前端」的现成模板——dsh-hub 的 `launcher.mjs` 日志管道逻辑整体平移为 Rust 线程 + emit。

3. **`src-tauri/src/config.rs` L27-77 + `src-tauri/tauri.conf.json` L73-86 — 配置持久化 + 更新/深链配置** — [可照抄]
   作用：`load_config/save_config/backup_config/has_config_backup/restore_config_backup` 一组 command，文件落 `dirs::config_dir()`，大版本更新前 `backup_config`（前端 `hooks/updater.tsx` L51-61 在 major 升级时先备份再 `downloadAndInstall` + `relaunch()`）。`tauri.conf.json` 的 `plugins.updater.pubkey/endpoints` + `bundle.createUpdaterArtifacts: true` 与 `plugins.deep-link.desktop.schemes` 是更新/深链的唯一配置面。dsh-hub 照抄点：更新闭环（含备份语义，可换为备份 dsh-hub config.json）+ 深链 scheme 注册；配置目录路径改为 `$DSH_HOME/dsh-hub`（读 `DSH_HOME` env）。

**附**：surrealist `src/adapter/desktop.tsx` L48-120（桌面适配器：`getCurrentWindow().show()`、`listen("config-updated"/"open-resource"/"tauri://focus")`、`--titlebar-offset`）与 `src/hooks/updater.tsx` L51-85（更新对话框）为前端侧第 4/5 处可抄点，前文 §1 #12/#16 已引用。

---

## 4. 未在本地仓库中找到的项（诚实清单）

1. **`tauri-plugin-single-instance` / `tauri-plugin-deep-link` / `tauri-plugin-updater` / `tauri-plugin-localhost` / `tauri-plugin-shell` / `tauri-plugin-notification` / `tauri-plugin-store` / `tauri-plugin-window-state` / `tauri-plugin-fs` / `tauri-plugin-dialog` / `tauri-plugin-process` / `tauri-plugin-log` / `tauri-plugin-os` 的实现源码**：官方插件集中在 `tauri-apps/plugins-workspace`（awesome README L91 仅链接），本地未 clone。本报告的插件结论全部来自 surrealist/spacedrive 的**使用样例**（初始化代码、Cargo.toml、capabilities、tauri.conf），插件内部行为（如 updater 签名校验算法、deep-link 的 Windows 注册表实现）未核实。
2. **tao / wry 源码**：独立仓库，本地仅有 ARCHITECTURE.md 的描述（L79-86）与 Cargo.lock 版本（tao 0.36.0 / wry 0.56.0，来自 REFERENCE.md）；WebView2 底层细节、Linux 托盘（StatusNotifierItem/appindicator）行为无法在本仓库验证。
3. **Linux 托盘/GTK 具体行为**：awesome README 的托盘条目均为应用案例（KFtray/GitBar/TrayFier 等，非实现细节），无 Linux 托盘 API 说明。
4. **崩溃后自动重启的内建机制**：确认不存在（Tauri 仅有主动 `restart`/`request_restart`），需自建守护（§2.6）。
5. **`tauri-plugin-notification` 的用法样例**：surrealist/spacedrive 均未使用（surrealist 甚至只用了 webview 内 toast），本地无参考实现。
6. **spacedrive 的 `files.rs::reveal_file`**：grep 命中未细读，打开资源管理器在 Tauri 侧的推荐路径为 `tauri-plugin-shell` 的 open 能力（未在本地验证其调用形态）。
7. **multi-instance「检测其他进程」官方插件**：不存在；仅 TCP 探活（spacedrive）与互斥文件两类本地证据。

---

## 5. 一句话结论（供迁移报告引用）

- 映射项 **18 项**，其中「可直接照抄」约 7 项（托盘 examples/api tray.rs、DWM 暗色标题栏 spacedrive windows.rs L632-698、单实例+深链+更新 surrealist main.rs/tauri.conf/hooks、子进程托管 surrealist database/、启动屏 examples/splashscreen、adapter 双跑 surrealist desktop.tsx）；「需改造」约 11 项（像素单位、capabilities ACL、多实例检测、崩溃守护、配置路径、external URL 加载、explorer/通知等）。
- 最关键差异：**像素单位（Builder 逻辑 / getter 物理 / setter 枚举）**、**capabilities ACL 按 label 白名单授权**（漏配 = 前端静默失败）、**托盘是核心 API 而非插件**、**崩溃重启无内置**、**deep-link 在 Windows 依赖 single-instance 收参**。
- 最大未知：官方插件源码（plugins-workspace）未在本地，正式动工前建议 clone 一次以核实 updater/deep-link/localhost 行为。
