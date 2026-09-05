# 第三轮审查 · 可行性分析报告（终审）

> 输入：round2 三文档。本轮 2 子代理（R3-A 问题1/2 终审——超时，其核实项由主进程亲自完成；R3-B 插件终审——返回）。

## R3-B 终审结论：插件 3 **有条件放行**（3 项修正后实施）

### 修正 1（关键 UX）：双路写入取代"拒绝+指引"

手填 `models` 数组的自定义路由（**最常见形态**）不能走 modelOverrides（V8）。R3-B 证实整组数组写入是合法通路：
- `applyPathOp` 终值可为数组（cloneJsonShaped 允许）；`mergeLayers` 对数组整体替换（user 层干净覆盖 base 层）；空数组与缺省同语义（catalog.ts:790-794），写回 `[]` 不会清空 catalog 路由。
- 坏数组在写点被 schema + assertServiceable 拒绝，永不静默落盘。
- **定稿**：resolved `models` 为 `[]`（纯 catalog 路由）→ `modelOverrides.<id>.reasoningEfforts` 逐键 set/unset；非空（手填路由）→ 单 op 整组 `['providers', route, 'models']` set（读-改-写 + revision 围栏）；host 拒绝（settings/rejected）→ 原样展示诊断。
- 写回前递归剥除 undefined；基于 resolved 值写回会把 schema 默认值钉进 user 层——v1 接受，v2 优化为基于 user 层改写。

### 修正 2（C1/C2）：v1 砍掉 host 意图 namespace

`installSection` 的 schema 参数必传且必须可调用（resolve 无条件执行 `schema(merged)`）——插件零构建器、无法 import zod/schemastery（4 个现有插件零 @deepseek-ai 运行时导入是铁则），手造 schemastery 信封过脆。且 client 直写 llm-pi-ai 后意图 namespace 成为第二真源（冗余 + onChange 回环风险）。**定稿：host half = 极简挂载壳**（name/inject=[]/空 apply + patch），全部逻辑在 client half。

### 修正 3（C4）：测试面结构

client.js 是经典脚本（`window.__ModuleLoader__.load`，非 ESM）——纯函数放 client.js 内、**守护加载**（`typeof window !== 'undefined' && window.__ModuleLoader__` 判定）+ 无条件挂 `globalThis.__dshModelEffortsInternals` 供 node:test 直测；ship 即所测，零重复。

## R3-A 核实项（主进程亲自完成，超时补偿）

| 项 | 结论 | 证据 |
|---|---|---|
| ctx.inject 可用性 | ✅ `inject(deps: Inject, callback: Plugin.Function<void>): Fiber & PromiseLike<Fiber>`，回调参数为子 ctx | cordis lib/types/registry.d.ts:111/:185 + lib/index.js 运行时实现 |
| slots.inject 调用形态 | ✅ 保持现有 2 参调用（round2 草稿的第 4 参 hint 取消，回归已验证形态） | model-select.tsx:393 现行调用 |
| node.rs 分发臂风格 | ✅ 现臂 :88-96 读法与新增 `allowUnmaximize` 可选字段读法一致 | node.rs:69-100 |
| config-api sizeChanged | ✅ 改为 patch 构建后判定 `patch.width !== undefined || patch.height !== undefined`（伪阳性消除，正常流程不变） | config-api.ts:69-84 |

## 最终可行性评估

| 项 | 结论 |
|---|---|
| 问题 1 | ✅ 放行——参数化贯通三链，时序无竞态，缺参向后兼容已逐行核实 |
| 问题 2 | ✅ 放行——scoped ctx.inject（官方同款范式），降级契约保留，成功/降级日志齐备 |
| 问题 3 | ✅ 放行（v1 范围）——client 直写 + host 壳 + 双路写入 + 测试面 |
| 门禁预期 | 全绿可期；T1 版本 0.1.6 无递增断言 |

**三轮审查闭环，进入实施。**
