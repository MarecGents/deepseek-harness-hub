# AGENTS.md — src/managers/（壳 Manager 层）开发约束

> 本目录是 dsh-hub host half 的 **Manager（壳）层**：管理复杂对象生命周期/状态机（桌面壳、Tauri 桥、托盘）。2026-08-18 重构由 `src/desktop.ts`、`src/tauri-shell.ts`、`src/services/tray.ts` 迁入。
> 改动本目录任何文件前，**必须**先读根 [../../AGENTS.md](../../AGENTS.md) 与 [../AGENTS.md](../AGENTS.md) 与本文件。

## 文件归类

| 文件 | 模块类别 | 职责 | Tauri 迁移 |
|---|---|---|---|
| `desktop.ts` | **Manager（壳）** | WebView2 桌面壳生命周期（窗口/托盘装配） | **废弃**（迁移后删除） |
| `tauri-shell.ts` | **Manager（壳）** | Tauri 壳 facade：invoke 桥（DSH_CMD 上行）、声音/通知/主题/窗口命令、getTrayBehavior 实时读 | 保留（host 侧桥） |
| `tray.ts` | **Manager（壳）** | WebView2 托盘（helper 进程优先 + 进程内兜底） | **废弃**（迁移后删除） |

## Manager 层红线

1. **壳/插件隔离**：Manager 只做壳生命周期与系统交互，**禁止**写插件业务（会话、路由、设置卡片）。
2. **Windows 专属标记**：desktop.ts / tray.ts 文件头注明"Tauri 迁移后废弃"；跨平台代码不得直接依赖（经 tauri-shell / 工厂注入）。
3. **命令上行唯一通道**：Tauri 壳经 `sendDshCmd()`（stdout `DSH_CMD <json>`）上行；帧格式/命令名变更必须同步 `src-tauri/src/managers/node.rs` 分发表（三端同步：node.rs ↔ tauri-shell.ts ↔ index.ts）。
4. **单向依赖**：Manager 可依赖 `../helpers/*`、`../services/theme-sync.js`、`../core/registry.js`；**禁止** import `../index.ts`、`../server/*`。
5. **错误处理**：子进程/异步错误不得静默；空 catch 必须注释；console 日志前缀 `[dsh-hub]`（进 dsh.log）。
6. **Build 前推演**：改完先推演（壳生命周期、启动门控、管道协议、Windows 边界），再 `npm run build`。
