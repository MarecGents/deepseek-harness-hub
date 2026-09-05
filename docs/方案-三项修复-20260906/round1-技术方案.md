# 第一轮审查 · 技术方案实施文档

> 输入：round1-可行性分析.md。本文给出三项修复的技术方案骨架；细节决策（D1-D3）留第二轮收敛。

## 问题 1：set_window_size 最大化保护参数化

**技术路线**：向后兼容的可选参数贯通三条链（invoke / DSH_CMD / TS handle），boot 同步与用户手动保存语义分流。

- Rust 唯一实现：`window_ops::set_window_size(app, width, height, allow_unmaximize: bool)`；`allow_unmaximize=false` 且窗口最大化时 **info! 留痕后直接 Ok 返回**（不 set_size，保持最大化；与 resize 监听"最大化时记 0"语义一致）。
- invoke 路径（commands.rs:127）：`allow_unmaximize: Option<bool>`，缺省 true（e2e.rs 等旧调用零改动兼容）。
- DSH_CMD 路径（node.rs 分发臂）：JSON 可选字段 `allowUnmaximize`，缺省 true——旧 sidecar ↔ 新壳互通。
- TS：`TauriShellHandle.applySize(width, height, opts?: { allowUnmaximize?: boolean })`；boot 路径（src/index.ts:252-255）传 `{ allowUnmaximize: false }`；设置卡保存路径（src/index.ts:191-193）不传（默认 true）。
- 可测性：把"最大化 + allow_unmaximize → 动作"判定抽为纯函数 `resize_action`，补 4 例 `#[cfg(test)]`（红线 16）。
- 文档同步：window_ops 模块头/函数 doc、commands.rs doc、node.rs 分发臂注释、pipe.ts 头注释、tauri-shell.ts 接口 doc、src/index.ts 注释——全部英文（红线 20）；显式声明无 ACL 变更。
- 事件链模拟（BUG_FIX_SOP 阶段四）：t0 setup `restore_window_state` maximize → t1 sidecar 插件 apply → boot applySize(allowUnmaximize:false) → node.rs → window_ops 检测 is_maximized → info + skip → **最大化保留**；手动路径 t0' 设置卡 PATCH（带 width/height）→ index.ts:193 applySize(默认 true) → unmaximize-first → 新尺寸生效。无死链。

## 问题 2：modelDirectories 注入 + 守卫显性化

**技术路线（拟，D1 待第二轮收敛）**：推荐**顶层 inject**——`src/client/index.ts:92` 改为 `['slots','workspaces','sessions','modelDirectories']`，同步改写 :88-91 注释（原文与新方案矛盾）；`installModelSelect` 守卫从静默 return 改为 `console.warn('[dsh-hub] model-select skipped: missing service(s): …')`；`slots.inject` 成功后加一行成功日志（冒烟双信号之一）。

- 依据：cordis PENDING-until-provided 保证 apply 时服务必在；web profile 无条件提供 modelDirectories；官方 roster 插件同款先例。
- 已知残余风险：上游未来移除 ui-model-selection → hub entry PENDING → boot 审计 throw 整页 fail。备选 scoped `ctx.inject`（ui-model-selection 自身范式）风险更低但失败静默。第二轮定夺（D1）。

## 问题 3：兼容插件 `@dsh-external/dsh-model-efforts`

**技术路线**：官方写路径复用——插件是「reasoningEfforts 的聚合编辑器」，不自造数据面。

- **host half**（lib/index.js）：`inject: ['settings']`（写路径）；`installSection` 注册自有命名空间（存用户意图档位表，含 per-model 配置）；提供「意图 → 官方 ops」翻译器：把意图表翻译为 `ctx.settings.mutate('llm-pi-ai', ops, expectedRevision)` 的 path set/unset 序列（**优先 `providers.<route>.modelOverrides.<modelId>.reasoningEfforts` 字典路径**，避开 models 数组 replace-by-value）；写前 describe/读 revision 做乐观并发；写入前镜像 catalog.ts:680-705 校验规则（空 dict/空串/null 值/仅 off → 拒绝；`false` 合法）。
- **client half**（lib/client.js）：`inject: ['slots', 'remote', 'remote.settings']`；UI 落点拟 `settings.section` 独立页（仿 usage-stats 先例；provider-card slot 内嵌为备选，D2 待收敛）——列出路由/模型/当前档位，编辑后走 `ctx.remote.settings.mutate` 直写官方 section；订阅 `settings/document-updated`、`llm/adapters-updated` 收敛展示。
- **校验/降级**：llm-pi-ai 未注册（如用户无自定义 provider）→ 插件页显示空态与指引，不报错；mutate 冲突（settings/rejected/conflict）→ 提示重试（重读 revision）。
- **装配链**：零基建改动（resources 通配 + assemble-profile 自动发现 + verify-plugin 自动覆盖）；工件 = package.json / cordis.patch.yml（顶层数组，id==name）/ lib/index.js + lib/client.js / scripts/build.sh / test/index.test.mjs / README.md。
- **双轨**：随 hub NSIS 分发（本任务 T1 范围）；独立 npm 发布留待 T2/T3（本任务不 publish）。

## 测试与验证策略（三案共用）

1. 门禁：tsc + build:client + cargo fmt/clippy/test + 4+1 插件 node --test + lib 零漂移。
2. 隔离冒烟（DSH_HOME=%TEMP% 沙箱）：最大化保留断言；`document.querySelector('[class*="_dshnms_root"]') !== null` 断言嵌套 seat；插件页渲染 + mutate 写入后 `settings.yaml` 出现 reasoningEfforts + UI 档位即时出现（热生效断言）。
3. 回归：e2e.rs 旧 invoke（缺参）行为不变；设置卡保存其他字段不触发 resize；相邻功能（标签栏/右键/设置卡）速览。
