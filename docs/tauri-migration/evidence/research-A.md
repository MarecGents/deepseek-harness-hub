# research-A — dev-v2 壳层（Shell Layer）全景盘点（Tauri 2.x 迁移输入）

> 调研范围：仅基于仓库实际文件（`src/desktop.ts`、`src/index.ts`、`src/services/*`、`bin/*`、`package.json`、`tsconfig.json`、`cordis.patch.yml`、`src/client/AGENTS.md`、`src/client/index.ts`、`scripts/postinstall.mjs`/`postuninstall.mjs` 相关片段）。
> 结论标注「迁移=保留/重写」均与根 AGENTS.md 的隔离边界一致：壳层（desktop.ts + Windows 专属 services + bin）在 Tauri 迁移时重写，插件层（client + config/workspace API）保留。
> 当前壳层 = Node 24 + `@webviewjs/webview@0.4.2`（WebView2）+ `koffi@3.1.5`（Win32 FFI）。**当前未使用无边框/透明窗口**（见 §2.1）。

---

## 1. 壳层文件清单（文件 → 模块类别 → 职责 → webviewjs/koffi API 使用点）

### 1.1 Host half（dsh 进程内，Node）

| 文件 | 模块类别 | 职责 | webviewjs / koffi API 使用点 |
|---|---|---|---|
| `src/index.ts` | **Controller（插件入口）** | `export const name='@marecgents/dsh-hub'`；Config schema（title/width/height/minimizeToTray/closeToTray/theme/notifyOnTaskComplete/soundEnabled）；`apply()` 装配：启动门控 `launchedByShortcut()`（`DSH_HUB_LAUNCHED==='1'`）、`setAppUserModelId()`、`installSettingsSection(ctx,'dsh-hub',…)`、`ctx.on('session/event')`（activeCwd 跟踪 + 事件音 + 任务完成通知）、`ctx.on('agent/created')`（cwd 兜底）、webserver ACTIVE 门控 `open()`、路由注册（config/workspace/pins/backgrounds）、`exitProcess()`（写 quit.marker + `process.exit(0)`）、`ctx.effect()` 逆操作 | 无直接调用；仅编排 desktop.ts / services（不 import webviewjs/koffi） |
| `src/desktop.ts` | **Manager（壳）** | WebView2 壳生命周期：窗口创建/尺寸/最小尺寸/最大化恢复/逻辑像素、splash→SPA 导航、主题应用（页面主题 → 窗口 chrome/背景/图标）、中央 IPC 槽（onIpcMessage 单槽分发）、minimize-to-tray 轮询、close-to-tray 隐藏保活窗口、托盘→页面事件派发（evaluateScriptWithCallback 重试）、workspace 路径请求（evaluateScript）、通知（Notification）、`app.whenReady` 事件泵 | `new Application()`；`app.createWebContext({dataDirectory})`；`app.createBrowserWindow({title,width,height,logical,visible})`；`w.setMinSize(480,360,true)` / `w.center()` / `w.setMaximized(bool)` / `w.isMaximized()` / `w.setSize(w,h,logical)` / `w.isMinimized()` / `w.setMinimized(false)` / `w.hide()` / `w.show()` / `w.focus()` / `w.isVisible()` / `w.isDisposed()`；`w.createWebview({html,webContext})`；`wv.setBackgroundColor(r,g,b,a)` / `wv.loadUrl(url)` / `wv.onIpcMessage(cb)` / `wv.evaluateScript(js)` / `wv.evaluateScriptWithCallback(js,cb)` / `wv.isDisposed()`；`w.getNativeHandle()`（→HWND bigint）；`w.setTheme(Theme.Dark/Light)`；`w.setWindowIcon(data,w,h)` / `w.setTaskbarIcon(data,w,h)`；事件：`w.on('focus')` / `w.on('resize')` / `w.on('close')` / `wv.on('page-load-finished')`（theme-sync 注册）/ `app.on('window-close-requested')`；`app.whenReady({interval:33,ref:true})`；`new Notification(title,{body,silent})` + `notification.on('error')` / `.onclick` / `.onclose` / `.close()` |
| `src/services/state-store.ts` | **Helper** | `dshHome()`（`DSH_HOME` 或 `~/.dsh`）；`JsonWindowStateStore`：窗口状态 JSON（`$DSH_HOME/dsh-hub-window-state.json`），只持久化 maximized 标志（几何尺寸有意不存）；校验 MIN_WIDTH=480 / MIN_HEIGHT=360 / MAX_POSITION=8000 | 无 |
| `src/services/dwm-theme.ts` | **Helper（Windows 专属，迁移重写）** | 标题栏明暗：`setTitleBarDark(hwnd,dark)` 走 koffi → `dwmapi.dll` `DwmSetWindowAttribute`（attr=20 = DWMWA_USE_IMMERSIVE_DARK_MODE）；失败回退 `setTitleBarDarkPowerShell`（spawn powershell.exe Add-Type P/Invoke 同 API） | koffi：`koffi.load('dwmapi.dll')` → `.func('int DwmSetWindowAttribute(int64 hwnd, int attr, void* value, int size)')` |
| `src/services/os-theme.ts` | **Helper（Windows 专属）** | OS 明暗检测（任务栏图标表面跟随 OS 而非页面）：`osThemeIsLight()` / `refreshOsTheme()`，`reg.exe query HKCU\…\Themes\Personalize` 的 `SystemUsesLightTheme` → 兜底 `AppsUseLightTheme` | 无（spawnSync reg.exe） |
| `src/services/theme-sync.ts` | **Services（桥，迁移=保留桥）** | `WebViewThemeDetector`：双通道——①注入 MutationObserver 脚本监视 `body[data-ds-dark-theme]`，经 `window.ipc.postMessage('mg-theme:1|0')` 事件驱动；②100ms 轮询兜底（`evaluateScriptWithCallback` 数字探针 1/0/-1）。`handleIpcMessage()` 与壳的中央 onIpcMessage 单槽协作；监听 `page-load-finished` | webviewjs：`JsWebview` 类型；`webview.on('page-load-finished')` / `.off()` / `.evaluateScript()` / `.evaluateScriptWithCallback()` |
| `src/services/tray.ts` | **Manager（托盘）** | `WebViewTray`：优先 spawn 独立进程 `bin/tray-helper.mjs`（JSON 行 stdin/stdout IPC）；失败回退进程内 `app.createTrayIcon`。菜单：show（动态“显示/隐藏主界面”）/open-workspace/new-task/quit；双击恢复窗口；`setShowCommandLabel` / `setTooltip` | webviewjs：`Application`/`JsTrayIcon`/`MenuOptions` 类型；`app.createTrayIcon({tooltip,icon:{data,width,height},menu,menuOnLeftClick:false,menuOnRightClick:true})`；`tray.on('double-click')`；`app.on('custom-menu-click')`；`tray.setMenu()` / `tray.setTooltip()` / `tray.dispose()`；`app.off('custom-menu-click')` |
| `src/services/config-api.ts` | **Server + Services（迁移=保留）** | 插件自有配置 API：`/api/dsh-hub/config` GET/POST；`ShellConfig` 接口（windowOpen/width/height/theme/minimizeToTray/closeToTray/notifyOnTaskComplete/soundEnabled/allowMultipleInstances/skin/background）；`DEFAULT_SHELL_CONFIG`；`readShellConfig`/`writeShellConfig`（tmp+rename 原子写）/`hasStoredWindowSize`/`storedNotifyOnTaskComplete`/`storedSoundEnabled`；`migrateLegacyPaths`（marec-dsh-desktop/mg-dsh-desktop → dsh-hub）；POST 白名单收窄 + 尺寸 clamp 到当前屏幕 | 无（纯 Node http/fs；读 `resolveLaunchScreen()` 用于 clamp） |
| `src/services/workspace-api.ts` | **Server + Services（迁移=保留）** | 右侧栏文件树/Git：`/api/dsh-hub/workspace/list?path=`（readdir，目录优先，MAX_ENTRIES=1000）；`/api/dsh-hub/workspace/git?path=`（git rev-parse/branch --show-current/status --porcelain=v1 -z，3s 超时） | 无（spawn git） |
| `src/services/pins-api.ts` | **Server + Services（迁移=保留）** | 置顶会话：`/api/dsh-hub/pins` GET/PUT；`$DSH_HOME/dsh-hub/pins.json` `{ids:[…]}`（去重/上限 200，tmp+renameSync 原子写） | 无 |
| `src/services/backgrounds-api.ts` | **Server + Services（迁移=保留）** | 背景图静态资源：前缀路由 `/api/dsh-hub/backgrounds/*`，正则白名单 `[a-z0-9-]+\.(jpg|jpeg|png|gif|webp)` 防穿越，服务 `assets/backgrounds/`，`cache-control: max-age=86400` | 无 |
| `src/services/explorer.ts` | **Helper（Windows 专属，迁移重写）** | 托盘“打开工作区”：`openFolderInExplorer` — Windows 走 koffi `shell32.ShellExecuteW('open')`（失败 spawn explorer.exe）；随后激活 Explorer 窗口：koffi `user32` EnumWindows 找 `CabinetWClass` + 标题匹配 → `SetForegroundWindow`/`BringWindowToTop`（200ms 轮询、8s 超时）；koffi 不可用时 PowerShell AppActivate 兜底；非 Windows 走 `open`/`xdg-open` | koffi：`shell32.ShellExecuteW`；`user32.EnumWindows`（回调）、`IsWindowVisible`、`GetWindowTextLengthW`、`GetWindowTextW`、`GetClassNameW`、`SetForegroundWindow`、`BringWindowToTop`（koffi proto/pointer/alias/opaque） |
| `src/services/screen.ts` | **Helper（Windows 专属，迁移重写）** | 多显示器感知的启动屏探测：`resolveLaunchScreen()` — koffi `user32.GetCursorPos` → `MonitorFromPoint(MONITOR_DEFAULTTONEAREST)` → `GetMonitorInfoW`（rcMonitor）→ 兜底 `GetSystemMetrics(SM_CXSCREEN/SM_CYSCREEN)`；壳用它定默认窗口 = 光标所在屏 3/4 | koffi：`user32.GetCursorPos`、`MonitorFromPoint`、`GetMonitorInfoW`、`GetSystemMetrics`；koffi.struct(MGPoint/MGRect/MGMonitorInfo)/pointer/sizeof/decode |
| `src/services/sound.ts` | **Helper（Windows 专属，迁移重写）** | 事件提示音：`playTaskSound(kind)` — koffi `winmm.PlaySoundW`（SND_FILENAME\|SND_ASYNC\|SND_NODEFAULT 播 `assets/sounds/*.wav`；资产缺失回退 SND_ALIAS 系统提示音）；四类：start/success/attention/error | koffi：`winmm.PlaySoundW(str16, void*, int flags)` |
| `src/services/app-id.ts` | **Helper（Windows 专属，迁移重写）** | 任务栏身份：`setAppUserModelId()` — koffi `shell32.SetCurrentProcessExplicitAppUserModelID('DeepSeekHarness.Desktop')`（否则任务栏归到 node.exe 绿六边形图标） | koffi：`shell32.SetCurrentProcessExplicitAppUserModelID` |
| `src/services/icons.ts` | **Helper（迁移=保留）** | 图标加载/选择：`loadPngRgba`、`dshFaviconDark/Black/DataUrl`、`downscaleIcon`（面积平均降采样）、`accentTile`（缺资产兜底）、`dshFaviconTray(dark)`（16px，深色托盘白鲸/浅色黑鲸） | 无（读 assets/*.png） |
| `src/services/png-decode.ts` | **Helper（迁移=保留）** | 极简 PNG 解码器（IHDR/IDAT + inflate + 5 种 filter 还原，输出 RGBA 给窗口/托盘绑定） | 无（node:zlib） |

### 1.2 Launcher / 独立进程（bin/，迁移时实现替换、语义保留）

| 文件 | 模块类别 | 职责 | webviewjs / koffi API 使用点 |
|---|---|---|---|
| `bin/launcher.mjs` | **Controller** | 桌面入口（快捷方式背后）：`relaunchAsGuard` re-exec → `acquireLock` 单实例 → `clearQuitMarker` → `ensureBundleInstalled`（web profile 装配：scoped `@marecgents/dsh-hub` 入 bundles + junction 自愈 + 清理 bare 遗留）→ `enforceSingleInstance` 多实例门 → `findDsh`（PATH/npm prefix，缺失则自动 `npm install -g @deepseek-ai/dsh`）→ spawn `dsh web --port 0`（`DSH_HUB_LAUNCHED=1`，优先 `dsh-hub.exe <entry> web --port 0`，回退 cmd shim）→ 崩溃自动重启 ≤3 次（1200ms 延迟）→ quit.marker 存在或 code 0 = 主动退出永不重启 → `dsh.log`（每次启动 resetLog）；`DSH_HUB_ASSEMBLE_ONLY=1` 诊断模式 | 无（spawn/spawnSync/symlink junction） |
| `bin/dsh-hub.mjs` | **Controller** | 终端命令入口（`bin.dsh-hub`）：同样 acquireLock + enforceSingleInstance，findDsh，转发参数（默认补 `--port 0`），`stdio:'inherit'` 直连，经 `dsh-hub.exe`（回退 cmd shim）启动 | 无 |
| `bin/hub-exe.mjs` | **Helper（Windows 专属）** | 进程身份：复制当前 node.exe → `$DSH_HOME/dsh-hub/bin/dsh-hub.exe`（app）+ `dsh-hub-guard.exe`（watchdog），rcedit 打补丁（icon `assets/dsh-favicon.ico` + VERSIONINFO：ProductName “DeepSeek Harness Hub”/“DeepSeek Harness Hub Launcher”等）；`stamp.json` 缓存键 `node版本|arch|包版本`；`relaunchAsGuard` 重执行；`resolveDshEntry`（npm-global 布局解析 dsh lib/bin.js） | 无（rcedit npm 包） |
| `bin/tray-helper.mjs` | **Helper（独立进程）** | 独立托盘进程（独立事件循环，点击不被 WebView2 窗口排队）：stdin 收 `{type:'init'|'set-show-label'|'exit'}`，stdout 发 `{type:'ready'|'double-click'|'command'}`；`app.whenReady` 泵；stdin close（父进程死）即退出防孤儿托盘 | webviewjs：`new Application()`；`app.createTrayIcon({tooltip,icon,menu,menuOnLeftClick:false,menuOnRightClick:true})`；`tray.on('double-click')`；`app.on('custom-menu-click')`；`tray.setMenu()` / `tray.dispose()`；`app.whenReady({interval:33,ref:true})` |
| `bin/lock.mjs` | **Helper** | 单实例 PID 锁：`$DSH_HOME/dsh-hub/launcher.lock`；`acquireLock`（'wx' 原子创建，EEXIST 读 PID → `process.kill(pid,0)` + EPERM 视为存活；死 PID 接管重取；claim 后复查防竞争）、`releaseLock`（仅本 PID 才删） | 无 |
| `bin/multi-instance.mjs` | **Helper（Windows 专属）** | 多实例检测/门：`detectRunningDshInstances`（`netstat -ano -p tcp` 收集 127.0.0.1/0.0.0.0/[::] LISTENING + PowerShell CIM `Win32_Process` 匹配 node.exe/dsh-hub.exe/dsh-hub-guard.exe 且 CommandLine 含 `dsh.*web`）；`allowMultipleInstances`（读 config.json，默认 false）；`alert`（PowerShell MessageBox）、`confirm`（YesNo）；`enforceSingleInstance`：默认拦截退出（仅 OK 无“继续”），opt-in 后仍须 Yes 确认 | 无（netstat/powershell spawnSync） |
| `bin/launcher.vbs` | **包装（postinstall 生成）** | `WScript.Shell.Run` 隐藏控制台启动 `node bin/launcher.mjs`（UTF-16LE BOM，勿手改） | 无（WScript COM） |

### 1.3 快捷方式配套（scripts/，支撑“快捷方式/vbs”能力）

| 文件 | 职责（依据实际内容） |
|---|---|
| `scripts/postinstall.mjs` | 安装后：① dsh 检测；② Windows 创建桌面快捷方式 `DeepSeek Harness.lnk`：TargetPath = `%SystemRoot%\System32\wscript.exe`、Arguments = `bin/launcher.vbs` 路径、WorkingDirectory = 包根、IconLocation = `assets/dsh-favicon.ico`（PowerShell WScript.Shell COM）；并生成 `bin/launcher.vbs` 模板（`WScript.Shell.Run(…, 0, True)` 隐藏控制台） |
| `scripts/postuninstall.mjs` | 卸载时移除桌面快捷方式（`Remove-Item`） |

---

## 2. 能力清单（现状 → Tauri 2.x 初步对应）

> “初步对应”为一句判断，供三报告引用，不做深入设计。

### 2.1 窗口管理（desktop.ts 全部）
- 创建：`app.createBrowserWindow({title,width,height,logical,visible})`；splash HTML（300ms）→ `wv.loadUrl('http://127.0.0.1:<port>')`；专用 WebView2 data 目录 `$DSH_HOME/dsh-hub/browser-data`（`createWebContext`，规避 E_ACCESSDENIED 且 close-to-tray 复用上下文）。
- 尺寸/单位：`logical` 标志区分逻辑像素（保存的 config 尺寸=逻辑）与物理像素（3/4 屏默认=物理）；`setMinSize(480,360,true)`；`center()`；`setSize(w,h,logical)`。
- 最大化记忆：启动时 `state.maximized → setMaximized(true)`；`resize` 事件里 un-maximize 恢复 `pendingCustomSize ?? restoreSize()` 并 `center()`；仅持久化 maximized 标志。
- 隐藏/恢复：minimize-to-tray 轮询（250ms，先 `setMinimized(false)` 再 `hide()` 防再次隐藏）；close-to-tray 时同步 `createWindow({hidden:true})` 保活；`showWindow()` 清 minimized 状态 + show + focus。
- **无边框/透明：未使用** —— `createBrowserWindow` 未传 frameless/transparent 选项；标题栏是原生装饰 + DWM 明暗；透明仅指 webview 背景色 `setBackgroundColor`（DARK_BG #18181b / LIGHT_BG #f6f8fa）。迁移时无需背负，未来若要自定义壳 UI 可新加。
- Tauri 对应：`tauri::WebviewWindowBuilder`（`title/inner_size/min_inner_size/center/visible/maximized`），`LogicalSize`/`PhysicalSize` 原生区分，`WindowEvent::Resized/CloseRequested`，`window.show()/hide()/set_focus()/is_visible()`；无边框/透明按需 `decorations(false)/transparent(true)`。

### 2.2 托盘（tray.ts + tray-helper.mjs）
- 常驻托盘；**helper 进程优先**（独立事件循环，JSON 行 IPC），失败回退进程内 `createTrayIcon`；菜单 4 项（动态“隐藏/显示主界面”、打开工作区、新建任务、退出）；双击恢复；tooltip；托盘图标按 OS 主题选白/黑鲸（创建时定）。
- Tauri 对应：`tauri_plugin_tray`（`TrayIconBuilder`：menu/icon/tooltip/menu_on_left_click，双击事件）；Rust 侧常驻，helper 进程机制删除。

### 2.3 主题同步（dwm-theme.ts + os-theme.ts + theme-sync.ts + desktop.ts）
- 页面主题 → 壳：MutationObserver（`window.ipc.postMessage('mg-theme:1|0')`）主通道 + 100ms 轮询兜底；变化时联动：`w.setTheme(Theme.Dark/Light)`、webview 背景色、窗口图标变体、DWM 标题栏（koffi `DwmSetWindowAttribute` attr=20，PowerShell 兜底）。
- 任务栏图标跟随 **OS** 主题（`reg.exe` 查询 `SystemUsesLightTheme`），窗口 focus 时 `refreshOsTheme()` 重读。
- 标题栏主题设置：'system'（跟随页面）/ 'light' / 'dark'（钉住）。
- Tauri 对应：`window.set_theme()`/`theme()` + 监听系统 `ThemeChanged`；原生标题栏明暗在 Windows 用 `windows` crate 的同一 `DwmSetWindowAttribute`（或 `window-vibrancy` 类 crate）；页面侧 MutationObserver 可保留，或改走 `tauri-plugin` 事件通道。

### 2.4 单实例锁（lock.mjs）
- PID 锁 `$DSH_HOME/dsh-hub/launcher.lock`：'wx' 原子创建、死 PID 接管、claim 后复查、EPERM=存活；launcher 与 dsh-hub 命令共用。
- Tauri 对应：`tauri_plugin_single_instance`（std feature）；若仍要与 CLI `dsh web` 互斥，可保留 PID 锁文件语义（Rust 侧写同一路径）。

### 2.5 多实例检测（multi-instance.mjs）
- netstat TCP 监听 + CIM 进程名/命令行匹配（node.exe / dsh-hub.exe / dsh-hub-guard.exe + `dsh.*web`）；默认拒绝共存（MessageBox 仅 OK），`allowMultipleInstances=true` 后仍需 Yes/No 确认；共享 $DSH_HOME 会话存储防 seq 损坏。
- Tauri 对应：Rust 侧用 `sysinfo`/`netstat2` 枚举进程与端口（或 dsh 提供 lock 文件），检测+确认对话框（`tauri-plugin-dialog`）语义保留——这是防数据损坏的硬约束，迁移不可削弱。

### 2.6 launcher 生命周期（launcher.mjs + dsh-hub.mjs + lock.mjs）
- 入口链：快捷方式 → `launcher.vbs`（隐藏控制台）→ `launcher.mjs` → re-exec `dsh-hub-guard.exe` → 锁 → 装配（profile bundles 加 scoped 名 + junction 自愈 + bare 清理，防 duplicate loader entry）→ 多实例门 → `findDsh`/自动安装 → spawn `dsh web --port 0`（`DSH_HUB_LAUNCHED=1`）→ 随子进程退出；`DSH_HUB_ASSEMBLE_ONLY=1` 诊断模式；`dsh.log` 每次启动重置。
- Tauri 对应：Tauri 壳本身就是 GUI 进程，直接 `std::process::Command` 启动 dsh（`tauri_plugin_shell` 可选）；junction/bundles 装配不再需要（壳改为 HTTP 对接 dsh 或内嵌 URL）；`--port 0` 随机端口语义保留。

### 2.7 崩溃重启（launcher.mjs）
- 子进程非 0 退出且无 quit.marker → 自动重启 ≤3 次（1200ms 延迟）；3 次后 MessageBox “连续异常退出”；code 0 / quit.marker → 永不重启（webviewjs teardown 0xC0000005 会报非 0，误判会无限重启）。
- Tauri 对应：Rust 壳若仍托管 dsh 子进程，保留 watchdog 语义（`Child::try_wait` + 重启计数）；若 dsh 并入 Rust 进程则不再需要。

### 2.8 quitter marker（index.ts + launcher.mjs）
- 插件 `exitProcess()`：写 `$DSH_HOME/dsh-hub/quit.marker`（内容=pid）→ `process.exit(0)`（**不用** `ctx.appExit`/`app.exit()`，规避 webviewjs 原生 teardown 崩溃）；launcher 见 marker 即主动退出。
- Tauri 对应：Rust 壳正常退出路径不再有 teardown 崩溃问题，marker 机制可删除（或保留为“不自动重启”信号）。

### 2.9 hub-exe 进程身份（hub-exe.mjs）
- 复制 node.exe → `dsh-hub.exe`/`dsh-hub-guard.exe` + rcedit（icon + VERSIONINFO）+ stamp 缓存（node 升级自动重建）；Task Manager 显示 “dsh-hub.exe”/“DeepSeek Harness Hub” 而非 “Node.js JavaScript Runtime”。
- Tauri 对应：Tauri 二进制自带 icon/VERSIONINFO/ProductName，整条复制+rcedit+缓存机制删除。

### 2.10 快捷方式 / vbs（scripts/postinstall.mjs + postuninstall.mjs + bin/launcher.vbs）
- 桌面快捷方式 `DeepSeek Harness.lnk` → `wscript.exe` + `bin/launcher.vbs`（隐藏控制台）+ 图标 `dsh-favicon.ico`；postuninstall 移除；vbs 为 postinstall 生成模板。
- Tauri 对应：tauri-bundler（NSIS/MSI）原生生成开始菜单/桌面快捷方式；vbs 隐藏控制台不再需要（Tauri 是 GUI 子系统）。

### 2.11 state-store 窗口记忆（state-store.ts）
- `$DSH_HOME/dsh-hub-window-state.json` 仅存 maximized（几何尺寸不存，A4 决策）；启动恢复最大化；un-maximize 恢复保存尺寸或 3/4 屏默认；MIN/MAX 校验。
- Tauri 对应：`tauri_plugin_window_state`（可配置只存 maximized 以对齐现有语义），或保留自定义 JSON store（`$DSH_HOME` 语义不变）。

### 2.12 screen / explorer 等系统调用（screen.ts + explorer.ts + os-theme.ts）
- screen：user32 光标屏探测（多显示器）→ 默认窗口 3/4 屏、config POST 尺寸 clamp 上限。
- explorer：shell32 `ShellExecuteW` 打开目录 + user32 枚举激活 `CabinetWClass` 窗口（托盘“打开工作区”）。
- os-theme：reg.exe 查询 OS 明暗（任务栏图标）。
- Tauri 对应：`Monitor`/`available_monitors()`/`primary_monitor()`（`current_monitor`）；`tauri_plugin_opener`（`reveal_item_in_dir`）+ `tauri_plugin_shell`；系统主题经 `theme()`/`ThemeChanged`（或保留 reg 查询）。

### 2.13 事件音（sound.ts + index.ts 接线）
- winmm `PlaySoundW` 播 4 类 WAV（start/success/attention/error）；`session/event` 深度 0 时按 turn/start、approval/asked、turn/end(completed/error) 触发；设置卡片开关（持久化优先）。
- Tauri 对应：`rodio`（或 `windows` crate PlaySoundW 复用）播放资产；事件订阅逻辑（dsh `session/event`）保留在插件层。

### 2.14 任务完成通知（desktop.ts Notification）
- 原生 Windows toast（title/body/silent:false）；30s 冷却；窗口可见且正看该会话时抑制（只响音）；点击恢复窗口；`notification.on('error')` 预挂防 ERR_UNHANDLED_ERROR。
- Tauri 对应：`tauri_plugin_notification`（Rust 侧）；点击回调 → `show()/set_focus()`；抑制策略（focused session 追踪）保留在插件层事件逻辑。

### 2.15 AppUserModelID（app-id.ts）
- koffi `SetCurrentProcessExplicitAppUserModelID('DeepSeekHarness.Desktop')` — 任务栏归属/分组/跳转列表。
- Tauri 对应：Windows 下 Rust 侧调用同一 Win32 API（`windows` crate）或 Tauri `identifier` 配置，AUMID 常量可复用。

### 2.16 启动门控（index.ts + cordis.patch.yml）
- `cordis.patch.yml` `disabled: !!js process.env.DSH_HUB_LAUNCHED !== '1'` + `launchedByShortcut()`：普通 `dsh web` 完全不加载壳/插件页（CLI 模式零副作用）。
- Tauri 对应：壳启动 dsh 时注入同一环境变量（或命令行参数）作为门控契约，`cordis.patch.yml` 的 disabled 表达式保留。

---

## 3. 与插件层的接口（Tauri 迁移必须保持）

### 3.1 HTTP 路由（插件自有路由，host 经 `ctx.webServer.register` 注册；迁移=保留）

| 路由 | 方法 | 用途 | 消费方 |
|---|---|---|---|
| `/api/dsh-hub/config` | GET / POST | 读写 `ShellConfig`（窗口尺寸/主题/托盘行为/通知/提示音/多实例开关/skin/background）；POST 白名单收窄 + 尺寸 clamp | client 设置卡片（settings-card.tsx）、skins.ts/backgrounds.ts 恢复 |
| `/api/dsh-hub/workspace/list?path=` | GET | 当前工作区文件树（目录优先、1000 条上限） | client 右侧栏（right-sidebar.tsx） |
| `/api/dsh-hub/workspace/git?path=` | GET | Git 状态（isGit/branch/head/changes，porcelain 解析） | client 右侧栏 Git 页 |
| `/api/dsh-hub/pins` | GET / PUT | 置顶会话 id 列表（pins.json 原子写） | client pin-conversations.ts |
| `/api/dsh-hub/backgrounds/*` | GET（prefix） | 背景图静态资产（正则白名单，防穿越） | client backgrounds.ts |

### 3.2 ctx 服务 / dsh 生态接口（index.ts 装配）

- `installSettingsSection(ctx, settingsNamespace('dsh-hub'), Config, config, …)` — 进程内 settings 命名空间注册（客户端卡片实际走自有 HTTP，此注册为 in-process 可见性，Tauri 迁移保留）。
- `ctx.get('webServer')` — 取 `port` 开窗口；**窗口打开时机**以 `@deepseek-ai/dsh-host-webserver` fiber 状态 ACTIVE（`internal/status`）为门，`loader.await()` 兜底（headless 无 server 则跳过）。
- `ctx.get('loader')` — entries 扫描（WEB_SERVER_ENTRY 名称 + `FIBER_ACTIVE=2` 数值判断）。
- `ctx.on('session/event')` — activeCwd 跟踪 + 事件音 + 任务完成通知（turn/start、approval/asked、turn/end completed/error，深度 0）。
- `ctx.on('agent/created')` — cwd 兜底跟踪。
- `ctx.effect()` — 壳/路由逆操作（fiber teardown 时 dispose）。
- client 注册契约：`inject = ['slots','workspaces','sessions']`（缺 workspaces 托盘“新建任务”静默失败）；`slots.inject('settings.plugin.item', …)` id=`dsh-hub`、order=30；右侧栏 body portal（`#dsh-hub-right-sidebar-root`）。

### 3.3 事件桥 / 页面全局（WebView2 IPC + 自定义事件；Tauri 迁移需重映射到 Tauri 事件或保留等效桥）

| 方向 | 通道 | 载荷 | 用途 |
|---|---|---|---|
| Host → 页面 | `window.dispatchEvent(new CustomEvent('mg:shell-command', {detail:{command}}))` | `{command:'new-task'}` | 托盘“新建任务”→ client 走官方 `workspaces.startSession()`（无 workspaceId 时先当前会话工作区再最近工作区）；派发前探 `window.__mgShellReady===true`，否则 300ms×20 重试（冷启动不丢点击） |
| 页面 → Host | `window.ipc.postMessage('mg:workspace-path:<encodeURIComponent(path)>')` | 当前会话 cwd（空=null） | 托盘“打开工作区”：host `evaluateScript('window.__mgSendCurrentWorkspace()')` 触发，`onIpcMessage` 单槽解析 → `openFolderInExplorer` |
| 页面 → Host | `window.ipc.postMessage('mg:session-focus:<encodeURIComponent(sessionId)>')` | 当前聚焦会话 id | 通知抑制策略（正看该会话 → 只响音不 toast） |
| 页面 → Host | `window.ipc.postMessage('mg-theme:1|0')` | 页面明暗（MutationObserver 注入，监视 `body[data-ds-dark-theme]`） | theme-sync 事件通道（100ms 轮询兜底） |
| Host 探针（页面全局） | `evaluateScript`/`evaluateScriptWithCallback` | `__mgShellReady`（模块级立即置 true）、`__mgSendCurrentWorkspace()`、`__mgGetCurrentWorkspace()`（页内用）、`__mgThemeObserver`（注入幂等标记） | 派发就绪探测 / workspace 请求 / 主题轮询（数字 1/0/-1，字符串带引号序列化 bug 规避） |

> 迁移要点：3.1 的路由由 dsh webserver 继续服务，**无需改**；3.3 的 IPC 桥是 WebView2 特有通道，Tauri 侧需映射为 `listen`/`emit`（或 `eval`/`dispatch` 等效机制）——桥的**消息协议字符串（mg:* 前缀）与页面全局名应保持稳定**，client half 才可零改动。

---

## 4. 关键数量（供报告引用）

- 壳层文件：host half 15 个（`src/index.ts` + `src/desktop.ts` + 13 个 `src/services/*`）+ launcher 层 7 个（6 mjs + 1 vbs）+ 快捷方式配套 2 个（scripts/postinstall、postuninstall）= **24 个**。
- webviewjs 依赖点：4 个文件直接 import（desktop.ts / tray.ts / tray-helper.mjs / theme-sync.ts），API 面 ≈ **25 个方法/事件**（Application、createBrowserWindow、BrowserWindow 尺寸/可见性/最大化/图标、createWebview、JsWebview evaluate/loadUrl/onIpcMessage/事件、createTrayIcon、custom-menu-click、Notification、whenReady）。
- koffi FFI 点：5 个文件（dwm-theme / explorer / screen / sound / app-id），Win32 函数 ≈ **15 个**（DwmSetWindowAttribute、ShellExecuteW、EnumWindows、IsWindowVisible、GetWindowTextLengthW、GetWindowTextW、GetClassNameW、SetForegroundWindow、BringWindowToTop、GetCursorPos、MonitorFromPoint、GetMonitorInfoW、GetSystemMetrics、PlaySoundW、SetCurrentProcessExplicitAppUserModelID）。
- 与插件层接口：HTTP 路由 **5 条**（config GET/POST、workspace/list、workspace/git、pins GET/PUT、backgrounds/*）+ ctx 服务 **6 处**（settings section、webServer、loader、session/event、agent/created、effect）+ 事件桥 **4 个 mg:* 消息前缀 + 1 个自定义事件**（mg-theme、mg:workspace-path、mg:session-focus、mg:shell-command）+ **3 个页面全局**（__mgShellReady、__mgSendCurrentWorkspace、__mgGetCurrentWorkspace）。
- 能力项：**16 项**（窗口管理、托盘、主题同步/DWM、单实例锁、多实例检测、launcher 生命周期、崩溃重启、quit marker、hub-exe 进程身份、快捷方式/vbs、state-store 窗口记忆、screen/explorer 系统调用、事件音、任务通知、AppUserModelID、启动门控）。
- 明确标记“迁移=保留”的模块：config-api / workspace-api / pins-api / backgrounds-api（HTTP+持久化）、theme-sync（桥）、state-store（$DSH_HOME 语义）、icons / png-decode（纯函数）、client half（零改动目标）。
- 明确标记“迁移=重写”的模块：desktop.ts（Manager 壳）、dwm-theme / tray / explorer / screen / sound / app-id（Windows 专属 services）、bin 全部（launcher/dsh-hub/hub-exe/tray-helper/lock/multi-instance/vbs）。
