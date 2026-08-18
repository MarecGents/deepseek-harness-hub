# AGENTS.md — src/services/（Services 层）开发约束

> 本目录是 dsh-hub host half 的 **Services（纯领域业务）层**。2026-08-18 重构后本目录仅存 `theme-sync.ts`；其余文件已按类别迁出：HTTP 路由 → `../server/`，纯工具 → `../helpers/`，壳生命周期 → `../managers/`。
> 改动本目录任何文件前，**必须**先读根 [../../AGENTS.md](../../AGENTS.md) 与 [../AGENTS.md](../AGENTS.md) 与本文件。

## 文件归类

| 文件 | 模块类别 | 职责 | Tauri 迁移 |
|---|---|---|---|
| `theme-sync.ts` | **Services** | 页面主题 → IPC 桥转发（配合壳层主题应用） | 保留（桥） |

## Services 层规范

1. **纯领域逻辑**：Services = 无 UI、无窗口、无托盘、无系统调用的业务服务；对外提供明确能力（函数/类）。窗口/托盘/系统调用属于 Manager 层。
2. **接口文档**：每个导出函数/类前写 JSDoc（作用、参数、返回、副作用）。
3. **单向依赖**：Services 只依赖 `../helpers/*` 与纯库；**禁止** import `../index.ts`、`../managers/*`、`../server/*`（下层不依赖上层）。
4. **错误处理**：空 catch 必须注释吞掉什么、为何无碍；console 日志前缀 `[dsh-hub]`（进 dsh.log，失效排查第一手证据）。
5. **Build 前推演**：改完本目录，先推演（类型自洽、分层依赖未反向、catch 覆盖），再 `npm run build`。

> 新增业务代码先归类：HTTP 路由 → `../server/`；纯工具 → `../helpers/`；复杂对象生命周期 → `../managers/`；命令注册 → `../core/`。只有"页面 ↔ 壳桥"类纯逻辑才放本目录。
