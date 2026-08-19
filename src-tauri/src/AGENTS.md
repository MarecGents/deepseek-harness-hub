# AGENTS.md — src-tauri/src/（Rust 壳层）开发约束

> 本目录是 dsh-hub 的 **Tauri 2.x 原生壳**（M4 现状：Node sidecar + WebView2 承载 dsh Web UI）。改动本目录任何文件前，**必须**先读根 [../../AGENTS.md](../../AGENTS.md) 与本文件；涉及双向管道协议时还要读 [../../src/AGENTS.md](../../src/AGENTS.md)（host 侧）与本文件。

## 分层结构（SPT 架构借鉴，2026-08-18 重构）

```
src-tauri/src/
  lib.rs                Controller（壳入口）：Builder 装配、setup 流程、窗口事件接线
  main.rs               引导（#![windows_subsystem = "windows"]）
  shell-init.js         注入初始化脚本（自绘标题栏 42px / 皮肤 token / 右侧栏偏移 / __mgPlaySound）
  commands/             Callback 层：#[tauri::command] 薄胶水（commands.rs）
  managers/             壳 Manager：tray.rs / node.rs / window.rs / single_instance.rs
  services/             Services：notify.rs（系统 toast）
  helpers/              Helper：theme.rs / state.rs / quit.rs / os_theme.rs / e2e.rs
```

> `#[path = "managers/tray.rs"] mod tray;` **保留模块名**（`crate::tray` / `crate::node` …），移动文件无需改引用链。新增文件在 lib.rs 增加 `#[path] mod` 声明并归类。

## 职责（现行文件）

| 文件 | 模块类别 | 职责 |
|---|---|---|
| `lib.rs` | **Controller** | 日志三目标、托盘、单实例、通知、窗口管理、Node sidecar 启动（M4）、close/minimize-to-tray、AUMID 注册（toast 快捷方式） |
| `main.rs` | **Controller** | `windows_subsystem` 引导 |
| `shell-init.js` | **Helper** | 标题栏 42px + `data-mg-shell-theme` 黑/白覆盖 + 右侧栏偏移 + `__mgPlaySound`；**DOMContentLoaded 后再碰 DOM**（parse-time 访问会杀掉脚本，踩坑 #35） |
| `commands/commands.rs` | **Callback** | invoke 命令：ping / diag_report / set_window_theme / set_window_size / get_workspace_path / window_minimize / window_toggle_maximize / window_close / tray_quit / window_toggle_visible / play_sound / open_workspace_path / notify_task_complete |
| `managers/tray.rs` | **Manager** | 原生托盘菜单（4 项）+ 单击/双击恢复 + toggle 标签同步（managed `TrayMenuHandles`，Tauri 无 `menu()` getter） |
| `managers/node.rs` | **Manager** | Node sidecar 生命周期（spawn/port/ready/stdin）+ `dispatch_dsh_cmd` 分发表（DSH_CMD 上行分发） |
| `managers/window.rs` | **Manager** | 主窗口构建（1440×810 / 无边框 / autoplay 放行） |
| `managers/single_instance.rs` | **Manager** | 多实例防护插件（allowMultipleInstances=false 语义） |
| `services/notify.rs` | **Services** | 系统 toast（NotificationExt + AUMID） |
| `helpers/theme.rs` | **Helper** | DWM 标题栏主题（apply_theme） |
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
9. **E2E**：`helpers/e2e.rs` 仅 debug_assertions + `DSH_HUB_E2E=1` 启用，**必须**用隔离 DSH_HOME（临时目录），**禁止**碰真实 ~/.dsh。
10. **clippy 零告警**：`cargo clippy --all-targets` 必须干净（`let _ =` 无意义丢弃、借用表达式 `&format!(...)`、`true.into()` 等按 clippy 修正）。
11. **窗口事件**：Tauri 无 Minimized 事件 → Resized + `is_minimized()` 检测最小化到托盘；`prevent_close` 必须 `on_window_event(CloseRequested{api})`（仅 JS listener 不满足）。

## 分层依赖红线

- 单向：`lib.rs → commands → managers/services → helpers`；下层禁止 import 上层。
- `#[path]` 保留的模块名即依赖面；跨层调用只在 lib.rs 装配点出现（如 `crate::tray::sync_toggle_label`）。
- 新增文件先归类（Manager/Services/Helper/Callback），命名表达职能；`cargo build` 前先推演（类型、协议、ACL、托管状态）。
