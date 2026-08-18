# D-1 桥选型冻结决策

> 日期：2026-08-17 · 拍板权：用户（已通过 SOP §5 审查流程确认）· SOP 前置：PC-1

## 背景

dsh-hub 迁移 Tauri 2.x 时，壳层与插件层（dsh web）的通信有三种候选方案：
- **方案 A**：Tauri IPC（invoke/event）——页面直接调 Rust 命令
- **方案 B**：HTTP/SSE/WS 主桥——页面经 Node sidecar HTTP 路由与 Rust 通信
- **方案 C**：stdio JSON-RPC——sidecar stdout 上行/ stdin 下行

## 决策

**三层并用，各司其职**：

| 通道 | 职责 | 谁发起 | 方向 |
|---|---|---|---|
| **主桥 HTTP/SSE/WS** | 页面↔壳主要通道（workspace/session/theme/通知/`dsh:output`） | 页面 fetch POST + EventSource/WS | 页面→sidecar HTTP → 事件下行 |
| **stdio JSON-RPC** | sidecar→壳辅助通道（notify/applyTheme/applySize/quit） | sidecar stdout 上行；stdin quit 下行 | sidecar↔壳 |
| **Tauri IPC invoke** | 壳级本地命令（set_window_theme/size/get_workspace_path） | 页面直接 invoke Rust 命令 | 页面→壳 |

## 否决方案 A 独占的理由

- `dangerousRemoteDomainIpcAccess` 配置复杂，且 `__TAURI_INTERNALS__` 注入对远程页（`WebviewUrl::External`）不保证可用
- 方案 A 依赖 Tauri 权限模型，页面需要 capability 授权，增加安全面
- 方案 B（HTTP/SSE）对远程页天然兼容，dsh host 已有 `ctx.webServer` 路由能力

## 否决方案 C 独占的理由

- stdout/stdin 是单向流，多路复用需自定义帧协议，复杂度高
- HTTP/SSE 是标准协议，生态工具丰富

## 状态

已落地：T4.1 node.rs（stdio READY 解析）、T4.4 lib.rs（External URL 导航）、T4.8 commands.rs（壳级 invoke）。
