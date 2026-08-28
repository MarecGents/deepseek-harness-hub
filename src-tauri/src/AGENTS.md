# AGENTS.md — src-tauri/src/（Rust 壳层）开发约束

> 本目录是 dsh-hub 的 **Tauri 2.x 原生壳**（Node sidecar 承载 dsh Web UI，wry 渲染引擎在 Windows 上底层为 WebView2 Runtime，与已删除的 @webviewjs「WebView2 壳」无代码关系）。改动本目录任何文件前，**必须**先读根 [../../AGENTS.md](../../AGENTS.md) 与本文件；涉及双向管道协议时还要读 [../../src/AGENTS.md](../../src/AGENTS.md)（host 侧）与本文件。

## 分层结构（SPT 架构借鉴，2026-08-18 重构）

```
src-tauri/src/
  lib.rs                Controller（壳入口）：Builder 装配、setup 流程、窗口事件接线
  main.rs               引导（#![windows_subsystem = "windows"]）
  shell-init.js         注入初始化脚本（自绘标题栏 42px / 皮肤 token / 右侧栏偏移 / __mgPlaySound）
  commands/             Callback 层：#[tauri::command] 薄胶水（commands.rs）
  managers/             壳 Manager：tray.rs / node.rs / window.rs / single_instance.rs / icon.rs
  services/             Services：notify.rs（系统 toast + 点击跳会话）
  helpers/              Helper：theme.rs / state.rs / quit.rs / os_theme.rs / e2e.rs
```

> `#[path = "managers/tray.rs"] mod tray;` **保留模块名**（`crate::tray` / `crate::node` …），移动文件无需改引用链。新增文件在 lib.rs 增加 `#[path] mod` 声明并归类。

## 职责（现行文件）

| 文件 | 模块类别 | 职责 |
|---|---|---|
| `lib.rs` | **Controller** | 日志三目标、托盘、单实例、通知、窗口管理、Node sidecar 启动（M4）、close/minimize-to-tray、AUMID 注册（toast 快捷方式） |
| `main.rs` | **Controller** | `windows_subsystem` 引导 |
| `shell-init.js` | **Helper** | 标题栏 42px + `data-mg-shell-theme` 黑/白覆盖 + 右侧栏偏移 + `__mgPlaySound` + 标题栏图标 `<img src="/api/dsh-hub/icons/*.png">`（与任务栏/托盘同源）+ `__mgSetDesktopIcon` / `__mgPendingDesktopIcon` 容错；**DOMContentLoaded 后再碰 DOM**（parse-time 访问会杀掉脚本，踩坑 #35） |
| `commands/commands.rs` | **Callback** | invoke 命令：ping / diag_report / set_window_theme / set_window_size / get_workspace_path / window_minimize / window_toggle_maximize / window_close / tray_quit / window_toggle_visible / play_sound / open_workspace_path / notify_task_complete（带 session_id，点击跳会话）/ apply_page_theme / set_desktop_icon |
| `managers/tray.rs` | **Manager** | 原生托盘菜单（4 项）+ 单击/双击恢复 + toggle 标签同步（managed `TrayMenuHandles`，Tauri 无 `menu()` getter）+ `set_tray_icon(app, icon_id, dark)`（显式 dark，由 icon.rs 调用） |
| `managers/node.rs` | **Manager** | Node sidecar 生命周期（spawn/port/ready/stdin）+ `dispatch_dsh_cmd` 分发表（DSH_CMD 上行分发） |
| `managers/window.rs` | **Manager** | 主窗口构建（1440×810 / 无边框 / autoplay 放行） |
| `managers/single_instance.rs` | **Manager** | 多实例防护插件（allowMultipleInstances=false 语义） |
| `managers/icon.rs` | **Manager** | IconManager：图标 6 面编排（窗口 SMALL+BIG / 托盘 / 壳源 .lnk×2+AUMID+SHChangeNotify / 自绘标题栏）、面级幂等（去重键含 dark）、全局 apply_lock 串行、单 worker+pending 合并（Condvar）、BIG HICON 生命周期持有；apply / apply_theme_aware / sync_after_shortcuts（迁移自 helpers/theme.rs） |
| `services/notify.rs` | **Services** | 系统 toast（NotificationExt + AUMID）+ focus-session：`notify_task_complete` 携带 session_id；点击 toast → wait_for_action（spawn_blocking）→ unminimize/show/set_focus + `mg:shell-command` focus-session 事件（`__mgShellReady` 300ms×20 重试）跳对应会话 |
| `helpers/theme.rs` | **Helper** | 无状态纯函数：DWM 主题（apply_theme）+ desktop_icon_png + apply_window_icons（SMALL+BIG，BIG HICON 生命周期交调用方）；图标编排迁至 managers/icon.rs |
| `helpers/state.rs` | **Helper** | `$DSH_HOME` 定位（dsh_home()）+ 窗口状态读写 |
| `helpers/quit.rs` | **Helper** | quit.marker 语义（write_quit_marker） |
| `helpers/os_theme.rs` | **Helper** | 系统深浅色探测 |
| `helpers/e2e.rs` | **Helper** | E2E 钩子（debug-only，`DSH_HUB_E2E=1` + 隔离 DSH_HOME） |

## 壳架构红线

1. **双向管道协议（三端同步）**：壳→host 写 stdin `MG_TRAY <json>`；host→壳读 stdout `DSH_CMD <json>`（`dispatch_dsh_cmd` 分发）。**命令名/帧格式变更必须同步**：`managers/node.rs` 分发表 ↔ `src/managers/tauri-shell.ts`（sendDshCmd）↔ `src/index.ts`（MG_TRAY 读取 + registry 注册）。
2. **NodeState 托管**：成功路径必须 `app.manage(node_state.clone())`（round-6 修复：未托管时 `app.state::<Arc<NodeState>>()` panic）；读取一律 `try_state`（返回 **Option**，不是 Result）。
3. **配置实时读**：closeToTray / minimizeToTray **每次事件重读**（Bug-1 修复），禁止 setup 期缓存。
4. **退出语义**：托盘退出 / closeToTray=false 关闭 → `quit::write_quit_marker()` + `process::exit(0)`；**禁止** `ctx.appExit` 类途径（0xC0000005 崩溃规避）。
5. **子进程**：一律 `creation_flags(0x08000000)`（CREATE_NO_WINDOW）。
6. **D-2 通道（remote origin 事实）**：页面无 `window.__TAURI_INTERNALS__.event`——页面→Rust 走 invoke（ACL allow-*）；Rust→页面走 `win.eval`。
7. **ACL 三处一致**：新增 invoke 命令必须同步 ① `lib.rs` invoke_handler ② `build.rs` 命令列表 ③ `capabilities/default.json` allow-*（漏一处 = 页面 invoke 被拒）。
8. **日志**：关键路径必须留日志（`info!`/`warn!`，前缀 `t4.x`/`m4`/`notify:`/`tray`/`pipe`/`shortcut`），经 tauri-plugin-log 三目标进 dsh.log——失效排查第一手证据。
9. **E2E**：`helpers/e2e.rs` 仅 debug_assertions + `DSH_HUB_E2E=1` 启用，**必须**用隔离 DSH_HOME（临时目录/E: 盘），**禁止**碰真实 ~/.dsh。
10. **数据安全（铁律 8）**：**禁止**删除/清空 `C:\Users\*`、`~`、真实 `~/.dsh` 下任何文件；任何 `rm`/`Remove-Item`/`RMDir`/`remove_dir_all` 的目标路径不得含 `~`、`$HOME`、`USERPROFILE`、`C:\Users`；复现/测试一律隔离 DSH_HOME，永不删真实 `~/.dsh`；删除前先打印目标绝对路径。
10. **clippy 零告警**：`cargo clippy --all-targets` 必须干净（`let _ =` 无意义丢弃、借用表达式 `&format!(...)`、`true.into()` 等按 clippy 修正）。
11. **窗口事件**：Tauri 无 Minimized 事件 → Resized + `is_minimized()` 检测最小化到托盘；`prevent_close` 必须 `on_window_event(CloseRequested{api})`（仅 JS listener 不满足）。
12. **sidecar 防残留**：spawn 成功路径必须 `assign_sidecar_to_kill_job`（KILL_ON_JOB_CLOSE 单例；HANDLE 非 Send/Sync → `SyncHandle` 包装）。
13. **跨线程窗口消息**：一律 `PostMessageW`（异步投递），`SendMessageW` 仅必须同步取返回值时使用。
14. **windows features 显式声明**：Cargo.toml 必须显式列 `Win32_System_JobObjects` / `Win32_Security`（features 不随依赖传递）。
15. **unsafe 必须 `// SAFETY:` 注释**（rust-skills unsafe-safety-comment）：每一处 `unsafe` 块上方注明前置条件/不变量（指针有效、字符串 NUL 结尾、HICON 生命周期、COM 初始化状态、窗口句柄跨线程安全性）；`unsafe fn` 需 `# Safety` 段。新增/修改含 `unsafe` 的代码必须遵守，零例外。
16. **纯函数/关键判定必须补 `#[cfg(test)]` 单元测试**（rust-skills test-*）：解析类（`parse_dsh_ready_port`）、掩码构造（BGRA/AND）、归一化（`normalize_path`）、多实例通道合并判定等无窗口/IO 依赖的逻辑，改动后必须同步测试；`cargo test` 为发布门禁（见 PROCESS_QUALITY §2.6）。
17. **release 构建必须启用编译优化 profile**：Cargo.toml `[profile.release]` 保持 `lto = "thin"` + `codegen-units = 1` + `strip = "symbols"`（体积/启动收益；改回默认需审查说明）。
18. **关键路径禁止静默吞错**（rust-skills anti-empty-catch / obs-*）：窗口图标/托盘/导航/`win.eval`/COM 调用等关键操作的失败必须 `warn!` 留痕；`let _ =` 仅允许「失败无碍且已注释原因」或「同一语句内已打日志」的场景。
19. **COM 初始化/反初始化必须配对且容错**：`CoInitializeEx` 与 `CoUninitialize` 必须成对（推荐 RAII Guard，禁止散落手动调用导致分支漏调）。
20. **新增 Rust 代码注释用英文**（根 AGENTS.md 第 3 节；历史中文注释逐步英文化，新增/修改处必须英文——保证 rustdoc / clippy doc lint / 外部贡献者可读）。

## 分层依赖红线

- 单向：`lib.rs → commands → managers/services → helpers`；下层禁止 import 上层。
- `#[path]` 保留的模块名即依赖面；跨层调用只在 lib.rs 装配点出现（如 `crate::tray::sync_toggle_label`）。
- 新增文件先归类（Manager/Services/Helper/Callback），命名表达职能；`cargo build` 前先推演（类型、协议、ACL、托管状态）。
