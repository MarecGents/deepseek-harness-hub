# AGENTS.md — src/core/（Core 层）开发约束

> 本目录是 dsh-hub host half 的 **Core（全局服务注册表 + 生命周期顺序）层**——SPT `[Injectable]` 全局服务注册思想的最小实现（2026-08-18 重构新增）。
> 改动本目录任何文件前，**必须**先读根 [../../AGENTS.md](../../AGENTS.md) 与 [../AGENTS.md](../AGENTS.md) 与本文件。

## 文件归类

| 文件 | 模块类别 | 职责 |
|---|---|---|
| `registry.ts` | **Core** | `TrayCommandRegistry`：托盘命令声明式注册 + 分发（新增命令 = register，不改分发链） |

## Core 层红线

1. **命令分发唯一通道**：托盘/管道命令一律经注册表分发（`trayCommands.register(name, handler)`），**禁止**在 index.ts 或其他层散落 if/else 分发链。
2. **注册表无业务**：registry.ts 只做登记/查表/分发，不含任何业务逻辑；业务逻辑在 handler（注册方提供）里。
3. **单向依赖**：Core 只依赖类型与纯库；**禁止** import 上层（managers/server/services/index）。
4. **接口文档**：类与方法前写 JSDoc（作用、参数、返回、副作用）。

> 演进方向（SPT 对齐）：后续可加 `load-order.ts`（生命周期顺序）、全局服务容器（DI）。本轮仅 registry 一个文件，保持最小可用——不建空壳架子。
