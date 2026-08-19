# SPT 分层 + Tauri-only 阶段审查（2026-08-18）

> 本文件记录按用户指示推进的三个阶段：
> 1. 确认 Tauri 壳覆盖 rc.14 全部功能；
> 2. 冻结/移除 WebView2 遗留；
> 3. 完成 SPT 职责分层。
>
> 审查方式：**静态代码链路推演 + 模拟路径走查，不运行实例**。
> 遵循：`AGENTS.md` 铁律、`PROCESS_QUALITY.md` DMAIC。

---

## Phase 1：Tauri 功能覆盖审查

### 1.1 结论

dev-v2 的 Tauri 壳已经覆盖 rc.14 的主要功能面：

| rc.14 功能 | Tauri 落点 | 静态链路 |
|---|---|---|
| 原生窗口承载 dsh Web UI | `src-tauri/src/lib.rs` `WebviewUrl::External` | Rust sidecar → `node::start_dsh` → `dsh web --port 0` → READY 验证 → 建窗 |
| 自绘标题栏 / 窗口控制 | `shell-init.js` + `commands.rs` | 页面按钮 → `invoke('window_minimize'/'window_toggle_maximize'/'window_close')` |
| 系统托盘 | `managers/tray.rs` | 原生菜单 → `send_tray_command` → `MG_TRAY` 管道 → host → 页面 |
| 窗口状态记忆 | `helpers/state.rs` + `lib.rs` | **本次修复**：启动恢复 maximized；resize 保存 maximized 状态 |
| 主题同步 | `helpers/theme.rs` + `commands::set_window_theme` | 设置卡 → config API → `tauri-shell.ts` → `DSH_CMD set_window_theme` → Rust DWM |
| 任务完成通知 | `services/notify.rs` + `tauri-shell.ts` | session/event → host → `DSH_CMD notify_task_complete` → Rust toast |
| 提示音 | `shell-init.js` + `commands::play_sound` | host → `DSH_CMD play_sound` → Rust eval → 浏览器 HTMLAudio |
| 多实例防护 | `managers/single_instance.rs` | tauri-plugin-single-instance 聚焦已有窗口 |
| quit 语义 | `helpers/quit.rs` | quit.marker + `process::exit(0)` |
| 右侧栏 / 置顶 / 皮肤 / 背景 | `src/client/*` | client half 经 `/api/dsh-hub/*` 与 host 通信 |
| 打开工作区 | host `controllers/shell-runtime.ts` + Rust `open_workspace_path` | 托盘 → `MG_TRAY open-workspace` → host 解析 cwd → `DSH_CMD open_workspace_path` → Explorer |
| 新建会话 | host `controllers/tray-pipe.ts` + client | 托盘 → `MG_TRAY new-task` → `DSH_CMD dispatch_page_event` → client `workspaces.startSession()` |

### 1.2 本次修复

- `src-tauri/src/lib.rs`
  - 新增 `restore_window_state()`，在临时页 fallback 和 dsh 正式页两条建窗路径后恢复 `maximized`。
  - resize 保存时写入真实的 `is_maximized()`，不再固定 `false`，避免最大化状态丢失。
- `src/bridge/tauri.ts`
  - 将 `WorkspacePath` 端点从 `/workspace-path` 对齐到 bridge-server 实际实现的 `/workspace`。

### 1.3 静态模拟路径（不运行实例）

```
启动：
  Rust main → lib.rs setup
    → tray::setup_tray
    → node::start_dsh（spawn dsh web --port 0）
    → 等待 state.port READY
    → wait_for_ready TCP 探测
    → WebviewWindowBuilder(External URL).build()
    → restore_window_state()
    → theme::apply_theme()
    → 事件接线（resize / close / minimize）

托盘打开工作区：
  tray.rs MENU_OPEN_WORKSPACE
    → node::send_tray_command("open-workspace")
    → host stdin 读到 MG_TRAY
    → controllers/tray-pipe.ts → getFocusedSessionState
    → sendDshCmd({cmd:"open_workspace_path", path})
    → Rust node.rs dispatch_dsh_cmd
    → commands::open_workspace_path(path)

托盘新建会话：
  tray.rs MENU_NEW_TASK
    → node::send_tray_command("new-task")
    → host controllers/tray-pipe.ts
    → sendDshCmd({cmd:"dispatch_page_event", name:"mg:shell-command", detail:{command:"new-task"}})
    → Rust win.eval CustomEvent
    → client handleShellCommand → workspaces.startSession()
```

Phase 1 审查通过（静态）。

---

## Phase 2：WebView2 遗留冻结

### 2.1 处置

dev-v2 是 **Tauri-only** 开发线；WebView2 旧实现不再作为功能承诺。

| 文件 | 状态 |
|---|---|
| `src/managers/desktop.ts` | 已标记 `[FROZEN WebView2 legacy]` |
| `src/managers/tray.ts` | 已标记 `[FROZEN WebView2 legacy]` |
| `bin/launcher.mjs`、`bin/dsh-hub.mjs`、`bin/hub-exe.mjs`、`bin/lock.mjs`、`bin/multi-instance.mjs`、`bin/tray-helper.mjs`、`bin/launcher.vbs` | `T3.7-bin-legacy-frozen-list.md` 已确认冻结，不进入 dev-v2 功能链路 |

### 2.2 静态边界

- Rust sidecar 始终设置 `DSH_HUB_SHELL=tauri`，host 侧 Tauri 分支为 dev-v2 唯一生效链路。
- WebView2 旧文件即使保留在树中，也不会被 `src-tauri` 构建或 Tauri 启动路径引用。
- 后续完成 Tauri 打包验证后，可将上述文件物理移入 `bin/legacy/` 或删除。

Phase 2 审查通过（静态冻结）。

---

## Phase 3：SPT 职责分层收口

### 3.1 host half 最终结构

```
src/
  index.ts                 Controller（装配）
  core/registry.ts         Core（命令注册表）
  controllers/             Controller（session-runtime / tray-pipe / shell-runtime）
  services/                Services（theme-sync / config-store / pins-store）
  server/                  Server（config / workspace / pins / backgrounds / sounds / bridge）
  managers/                Manager（tauri-shell；desktop/tray 已冻结 WebView2 legacy）
  helpers/                 Helper（state-store / dwm-theme / explorer / screen / icons / sound / app-id …）
  models/                  Model（pipe / shell-config / plugin-config）
  utils/                   Utils（pipe 解析）
  client/                  插件 UI
  bridge/                  桥客户端（Tauri bridge，保留给未来 HTTP/SSE 主桥）
```

### 3.2 Rust half 最终结构

```
src-tauri/src/
  lib.rs                   Controller（壳入口）
  main.rs                  Controller（引导 / --assemble-only / --smoke）
  commands/                Callback（Tauri command 薄胶水）
  managers/                Manager（tray / node / window / single_instance）
  services/                Services（notify）
  helpers/                 Helper（theme / state / quit / os_theme / e2e）
  shell-init.js            壳内初始化脚本
```

### 3.3 本次新增/调整

- `src/models/plugin-config.ts`：插件 Config 纯类型。
- `src/services/config-store.ts`：壳配置持久化服务。
- `src/services/pins-store.ts`：置顶会话持久化服务。
- `src/controllers/shell-runtime.ts`：壳级编排（effectiveConfig / exitProcess / sendDshCmd / open-workspace / new-task / activeCwd）。
- `src/index.ts`：改为从 controllers/services 引入能力，入口更薄。
- `src/AGENTS.md`、`src/controllers/AGENTS.md`、`src/services/AGENTS.md`、`src/models/AGENTS.md`、`README.md` 已同步。

### 3.4 分层依赖红线

- `index.ts → controllers → core → managers/server/services → helpers → models/utils`
- `lib.rs → commands → managers/services → helpers`
- 未发现下层反向依赖上层。

Phase 3 审查通过（静态）。

---

## 后续执行建议

由于当前工具环境无法执行 shell（win32 终端不可用），上述均为静态代码推演。建议本机执行：

```sh
npm run build
npm run build:client
cargo clippy --all-targets
cargo test
cargo build
```

如静态审查中发现的问题在真实构建中暴露，按 DMAIC 登记并修复。
