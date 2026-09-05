# 第一轮审查 · 可行性分析报告

> 任务：问题1（最大化记忆）/ 问题2（模型菜单注入）/ 问题3（自定义模型思考强度·兼容插件）
> 基线：dev-v2 74182e4（v0.1.6）；诊断依据：docs/三项功能问题诊断-2026-09-06-0045.md
> 本轮调研：3 个并行子代理（R1-A Rust 影响面 / R1-B 注入时序 / R1-C 插件写路径）

## 问题 1：可行性 ✅（无阻断）

- 修改面收敛：`set_window_size` 全仓仅两个调用方（commands.rs:127-129 invoke 路径、node.rs:88-96 DSH_CMD 路径），lib.rs:784 的退最大化恢复尺寸走 `win.set_size` 不经过本函数，不受影响。
- 参数化可行：Tauri 2 command `Option<bool>` 天然容忍缺参；DSH_CMD JSON 可选字段向后兼容（旧 sidecar/新壳互通，缺省 = true = 现行为）。
- ACL 零变更（命令名不变，capabilities/build.rs 不动）。
- 边界全部可解释：boot+已最大化 → skip；boot+未最大化 → 正常同步；最大化下手动改尺寸 → 默认 true 保持 unmaximize-first；窗口不存在 → 维持 Err；插件热重载 → 幂等。
- 结论：**可行**，属低风险参数化改造。

## 问题 2：可行性 ✅（有一处需第二轮决策的设计分叉）

关键机制证据（dsh rc.1 源码逐条核实）：
- cordis `inject` 语义 = **PENDING-until-provided**（fiber.ts:194/:611-621/:625-638；reflect.ts:314-326 服务 provide 时唤醒），非拓扑排序。inject 声明即保证 apply 执行时服务必然可用。
- `ui-model-selection` 是 web-app bundle **无条件行**（cordis.patch.yml:282-284），`modelDirectories` Service 构造即注册（service.ts:35-37 + cordis service.ts:56-58）→ hub 唯一支持的 web profile 下**必然最终可用**。
- 官方先例充分：locale 插件 inject 他包的 `settingsScope`、runner inject `remote.dynamicCordisRunner` 等。
- **风险分叉（第二轮决策点）**：顶层 inject 若上游未来移除 ui-model-selection，hub entry 永久 PENDING → web boot 的 `assertEntriesActive`（boot.ts:141-158）**throw → 整页 fail**（连累皮肤/标签/菜单全部 client 功能）；备选 scoped `ctx.inject(['modelDirectories'], …)`（ui-model-selection 自身同款范式，index.ts:126/:144）子 fiber PENDING 不进 boot 审计，页面其余功能不受累。两者都保证就绪；顶层简单响亮、scoped 风险严格更低。
- 现状确认：`installModelSelect` 静默 return（model-select.tsx:391）是官方 seat 保留的直接根因；`sessions.subagentAddress` rc.1 仍存在（ui-commands client.js:526）。

## 问题 3：可行性 ✅（官方写路径存在，方案成立性大幅上调）

决定性发现：
1. **官方热生效运行时写路径存在**：Host 侧 `ctx.settings.mutate('llm-pi-ai', ops, expectedRevision)`（settings-controller Remote `settings` 的 mutate/replace/update；host 侧 `ctx.settings.mutate` 对已注册命名空间不限制调用者，settings/src/index.ts:602/:678-680）；client 侧官方 Models 页同款 `ctx.remote.settings.mutate`（ui-settings-models operations.ts:87-93）。写入过 llm-pi-ai schema + `assertServiceable` 校验（写入时拒绝坏数据），onChange → 原子换路由注册 → **下一请求即生效，无需重启**。
2. **官方 UI 无该字段编辑器是官方自认的缺口**：CustomProviderCard.tsx:17-21 明言"deliberately no reasoning-effort control"，且留了扩展位 `settings.models.provider-card` / `settings.models.footer` slot——插件补位有正当性。
3. **备选排除**：直改 settings.yaml（与官方文件锁/reconcile 竞争 + 跳过校验 → 坏数据静默禁用整命名空间）不推荐；纯 client 假合并（host 校验拒绝未声明档位，无旁路）只可做预览不可执行。
4. **写路径选择**：`modelOverrides` 字典 path set/unset 优于 `models` 数组下标操作（数组是 replace-by-value 语义，扰动风险高）。
5. 装配链零基建改动：tauri.conf.json resources 已通配 `plugins/**/*`，assemble-profile.mjs 自动发现，verify-plugin.mjs 自动覆盖。

## 汇总结论

三项均可行；进入第二轮需收敛的决策点：
- D1（问题2）：顶层 inject vs scoped inject。
- D2（问题3）：插件 UI 落点（provider-card slot 内嵌 vs 独立 settings.section）与 host/client 双半职责划分。
- D3（问题3）：写 ops 策略（modelOverrides 优先）与 revision 冲突处理。
