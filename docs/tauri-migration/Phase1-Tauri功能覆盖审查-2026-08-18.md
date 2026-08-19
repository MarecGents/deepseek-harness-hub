# Phase 1 审查：Tauri 功能覆盖（2026-08-18）

> 审查方式：静态代码链路推演，不运行实例。

## 结论

Tauri 壳已覆盖 rc.14 的功能面，本次修复窗口状态记忆链路。

## 修复

- `src-tauri/src/lib.rs`
  - 新增 `restore_window_state()`，启动时恢复 maximized。
  - resize 保存真实 `is_maximized()`。
- `src/bridge/tauri.ts`
  - WorkspacePath 端点对齐 `/api/dsh-hub/bridge/workspace`。

## 审查项

- [x] 窗口：启动、最小化/关闭到托盘、最大化恢复
- [x] 托盘：显示/隐藏、打开工作区、新建会话、退出
- [x] 主题：DWM + 外壳覆盖
- [x] 通知 + 提示音
- [x] 单实例 + quit.marker
- [x] 插件层：设置卡 / 右侧栏 / 置顶 / 皮肤 / 背景
- [x] 共生链路：`MG_TRAY` / `DSH_CMD` / `invoke` / `win.eval`

通过。
