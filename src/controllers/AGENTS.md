# AGENTS.md — src/controllers/（Controller 编排层）开发约束

> 本目录是 dsh-hub host half 的 **Controller（业务编排）层**（2026-08-18 第八轮落地：index.ts 编排下沉）。
> 改动本目录任何文件前，**必须**先读根 [../../AGENTS.md](../../AGENTS.md) 与 [../AGENTS.md](../AGENTS.md) 与本文件。

## 文件归类

| 文件 | 模块类别 | 职责 |
|---|---|---|
| `session-runtime.ts` | **Controller** | 会话运行时编排：聚焦 cwd 跟踪、事件提示音、任务完成通知、`getFocusedSessionState`（Q6） |
| `tray-pipe.ts` | **Controller** | 托盘双向管道编排：`MG_TRAY` 读 stdin → registry 分发 → `DSH_CMD` 上行 |
| `shell-runtime.ts` | **Controller** | 壳级编排：`effectiveConfig` / `exitProcess` / `sendDshCmd` / `open-workspace` / `new-task` 语义 + host 侧 `activeCwd` 状态 |

## Controller 层红线

1. **编排不实现**：Controller 只做业务编排（接线、门控、日志），不持有壳实现——壳副作用经 deps 注入（`getShell`/`sendDshCmd`/`getFocusedState` 等）。
2. **依赖注入**：函数签名以 `(ctx, deps)` 形式接收依赖；禁止 import `../index.ts`（环形依赖）；可依赖 core/managers/server/services/helpers/models/utils。
3. **行为一致性**：从 index.ts 下沉的编排必须保持行为逐字节一致（含日志文案与吞错语义）——验证以 E2E 全绿为准。
4. **装配点唯一**：Controller 的 setup 函数只在 `src/index.ts` 的 apply() 调用一次；拆卸函数（如返回的 disposer）随 fiber 生命周期处理。
5. **接口文档**：每个导出函数前写 JSDoc（作用、参数、返回、副作用）；deps 接口写清每个字段。

> 新增编排：先判断归属（会话/托盘/通知/声音 → 现有文件或新文件），命名表达职能；禁止把新逻辑留在 index.ts。
