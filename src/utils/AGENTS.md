# AGENTS.md — src/utils/（Utils 层）开发约束

> 本目录是 dsh-hub host half 的 **Utils（纯函数工具）层**（2026-08-18 第八轮落地）。与 helpers/ 的区别：utils 是**绝对纯**（无 IO、无平台调用、无状态），helpers 允许文件型 IO 工具（state-store 等）。
> 改动本目录任何文件前，**必须**先读根 [../../AGENTS.md](../../AGENTS.md) 与 [../AGENTS.md](../AGENTS.md) 与本文件。

## 文件归类

| 文件 | 模块类别 | 职责 |
|---|---|---|
| `pipe.ts` | **Utils** | `parseMgTrayLine`：`MG_TRAY <json>` 帧解析（非法 → null，调用方负责日志） |

## Utils 层红线

1. **纯函数**：无副作用、无 IO、无全局状态、不抛异常（错误以返回值表达，如 null/false）；同一输入永远同一输出。
2. **零依赖**：只依赖 `../models/*` 类型与官方库；禁止 import 上层（index/controllers/managers/server/services/helpers）。
3. **无日志**：日志属于调用方（Controller/Manager）；utils 不 console。
4. **接口文档**：每个导出函数前写 JSDoc（作用、参数、返回、副作用）。

> 新增工具先判断归属：有 IO/平台调用 → `../helpers/`；纯字符串/JSON/数学 → 本目录。
