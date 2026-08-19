# Phase 2 审查：WebView2 冻结（2026-08-18）

> 审查方式：静态代码链路推演，不运行实例。

## 结论

dev-v2 按 **Tauri-only** 处理；WebView2 旧实现冻结为历史参照，不作为功能承诺。

## 冻结清单

- `src/managers/desktop.ts`：已标记 `[FROZEN WebView2 legacy]`
- `src/managers/tray.ts`：已标记 `[FROZEN WebView2 legacy]`
- `bin/launcher.mjs`、`bin/dsh-hub.mjs`、`bin/hub-exe.mjs`、`bin/lock.mjs`、`bin/multi-instance.mjs`、`bin/tray-helper.mjs`、`bin/launcher.vbs`：按 `T3.7-bin-legacy-frozen-list.md` 冻结

## 边界

- Tauri sidecar 启动时设置 `DSH_HUB_SHELL=tauri`，host 走 Tauri 分支。
- WebView2 文件即使保留在树中，不参与 Tauri 启动链路。
- 物理移动/删除留到 Tauri 打包验证通过后执行。

通过。
