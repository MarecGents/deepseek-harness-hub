# 第一轮审查 · 代码落地方案文档

> 输入：round1-技术方案.md。文件级改动清单；实现以本文为蓝图，第二轮审查后修正。

## 问题 1（Rust + TS，共 8 文件）

| # | 文件 | 改动 |
|---|---|---|
| 1 | `src-tauri/src/managers/window_ops.rs` | `set_window_size` 加第 4 参 `allow_unmaximize: bool`；新增纯函数 `resize_action(is_maximized: bool, allow_unmaximize: bool) -> ResizeAction`（Skip/UnmaximizeThenResize/Resize）；skip 分支 `info!`；模块头 :7-8 与函数 doc :68-72 改写（英文） |
| 2 | `src-tauri/src/commands/commands.rs` | `set_window_size` command 加 `allow_unmaximize: Option<bool>` → `unwrap_or(true)` 透传；doc 更新 |
| 3 | `src-tauri/src/managers/node.rs` | `set_window_size` 分发臂（:88-96）读 `allowUnmaximize` 可选字段 `unwrap_or(true)`；注释同步；`let _ =` 吞错改 `warn!` 留痕 |
| 4 | `src/models/pipe.ts` | 头注释补 `allowUnmaximize` 字段说明（帧协议三端同步，红线 1） |
| 5 | `src/managers/tauri-shell.ts` | `TauriShellHandle.applySize` 签名 `(width, height, opts?: { allowUnmaximize?: boolean })`；实现透传字段；接口 doc 更新 |
| 6 | `src/index.ts` | boot 路径 :252-255 改 `h.applySize(w, h, { allowUnmaximize: false })`；注释说明最大化优先；设置卡路径 :193 不动 |
| 7 | `src-tauri/src/managers/window_ops.rs`（tests） | `resize_action` 4 例单测：max+not-allowed→Skip；max+allowed→UnmaximizeThenResize；非 max 两 bool→Resize |
| 8 | ACL | **无变更**（命令名不变）——落地方案显式声明 |

## 问题 2（TS，共 2 文件，D1 待定）

| # | 文件 | 改动（顶层 inject 版） |
|---|---|---|
| 1 | `src/client/index.ts` | :92 inject 数组加 `'modelDirectories'`；:88-91 注释改写（说明 PENDING-until-provided 语义与 web profile 无条件提供的依据） |
| 2 | `src/client/model-select.tsx` | :388-391 守卫改 `console.warn`（列出缺失服务名）；`slots.inject` 注册成功后 `console.log('[dsh-hub] model-select override installed')`（冒烟信号） |

scoped 备选版（若 D1 选 scoped）：只改 model-select.tsx——守卫处改为 `ctx.inject(['modelDirectories'], (scope) => { …slots.inject… })`，index.ts 不动、注释更新。

## 问题 3（新插件目录 `plugins/dsh-model-efforts/`，共 7 新文件 + 0 基建改动）

| # | 文件 | 内容 |
|---|---|---|
| 1 | `package.json` | name `@dsh-external/dsh-model-efforts`；version 0.0.1；`private:false`；main/exports（`.` + `./client`）；`files:["lib","cordis.patch.yml"]`；peerDeps cordis ^4.0.1；`dsh.bundle.patch`；`dsh.client: { inject: [...], platform: "web" }`（仿 usage-stats） |
| 2 | `cordis.patch.yml` | 顶层 YAML 数组单条 insert，id==name==包名 |
| 3 | `lib/index.js`（host） | `inject:['settings']`；`installSection('dsh-model-efforts', …)` 注册意图配置（zod schema：per 模型 `{ efforts: {…}, off?: bool }`）；`buildMutateOps(intent)` 翻译器（modelOverrides 字典路径 set/unset）；`applyEfforts()`：describe 读 revision → 校验镜像 → `ctx.settings.mutate('llm-pi-ai', ops, revision)` → 成功/冲突处理；onChange：意图变更即重跑 applyEfforts |
| 4 | `lib/client.js`（client） | `inject:['slots','remote','remote.settings']` + 平台模块 external；`settings.section` 注册（id `model-efforts`，order 35）；React 小页：路由/模型列表（describe 的 user+base 合并视图）、档位编辑（含 off 与 provider-default）、保存 → `ctx.remote.settings.mutate`；订阅 `settings/document-updated`/`llm/adapters-updated` 收敛；冲突 → 重读 revision 提示重试 |
| 5 | `scripts/build.sh` | `node --check lib/index.js && node --check lib/client.js` |
| 6 | `test/index.test.mjs` | node:test：ops 翻译正确性（set/unset/嵌套路径）、校验镜像规则逐例（空 dict/空串/null/仅 off/false 合法）、revision 冲突分支 |
| 7 | `README.md` | 挂载说明（顶层 patch）、双轨说明、与官方 Models 页的关系（补位 per-model effort 编辑） |

**身份一致性（铁律 2）**：package.json name == cordis.patch.yml insert.name == verify-plugin P2 检查项；client bundle 无 PLUGIN_ID 概念（插件无 tsdown，直接手写 lib/，与现有 4 插件一致）。

**i18n**：插件页文案中英对照内置于 lib/client.js（仿 model-select.tsx 自带词典先例），或并入 hub locale 词典——插件独立分发，**自带词典**更符合双轨独立性。

## 实施顺序（阶段 4）

1. 问题 1（Rust+TS，含单测）→ cargo 门禁
2. 问题 2（TS）→ tsc/build:client
3. 插件 3（全新目录）→ node --test + verify-plugin
4. 全量门禁 + 隔离冒烟（三断言）+ lib 零漂移
5. 踩坑登记 + FUNCTIONS.md/README 同步 → T1
