# 第三轮审查 · 代码落地方案文档（终版·实施蓝图）

> 实施按本清单顺序执行；每步后跑对应门禁。

## S1 问题 1（Rust + TS）

| 文件 | 精确改动 |
|---|---|
| `src-tauri/src/managers/window_ops.rs` | `pub fn set_window_size(app, width, height, allow_unmaximize: bool)`；新增 `enum ResizeAction { Skip, UnmaximizeThenResize, Resize }` + `fn resize_action(is_maximized: bool, allow_unmaximize: bool) -> ResizeAction`（#[cfg(test)] 4 例）；主体按 action 分派；skip → `info!` + Ok；doc/模块头英文改写 |
| `src-tauri/src/commands/commands.rs` | `allow_unmaximize: Option<bool>` → `unwrap_or(true)` 透传；doc 一行 |
| `src-tauri/src/managers/node.rs` | 分发臂：`value.get("allowUnmaximize").and_then(|v| v.as_bool()).unwrap_or(true)`；`let _ =` → `warn!("node: set_window_size failed: {e}")`；注释改 |
| `src/models/pipe.ts` | 头注释 DSH_CMD 字段说明加 allowUnmaximize |
| `src/managers/tauri-shell.ts` | `applySize(width: number, height: number, opts?: { allowUnmaximize?: boolean })`；invoke 传 `allowUnmaximize: opts?.allowUnmaximize`；接口 doc |
| `src/index.ts` | :254 `h.applySize(effective.width, effective.height, { allowUnmaximize: false })` + 注释 |
| `src/server/config-api.ts` | 删除 :69 `const sizeChanged = 'width' in record…`；patch 构建后 `const sizeChanged = patch.width !== undefined \|\| patch.height !== undefined` |

门禁：`cargo fmt --check` + `cargo clippy --all-targets -- -D warnings` + `cargo test`。

## S2 问题 2（TS）

| 文件 | 精确改动 |
|---|---|
| `src/client/model-select.tsx` | `installModelSelect` 重构为 scoped：sessions 顶层守卫（warn+return）→ `ctx.effect(() => ctx.inject(['modelDirectories'], (scope) => {…}), 'dsh-hub: model-select override')`；scope 内 slots/models 守卫（warn+return）；成功 `console.log('[dsh-hub] model-select override installed')`；slots.inject 保持 2 参 |
| `src/client/index.ts` | :88-91 注释改写（英文原注释改中文口径按现状——原注释为英文，保持英文） |

门禁：`npm run build`（tsc）+ `npm run build:client` + lib 零漂移。

## S3 问题 3（新插件 7 文件）

按 round3-技术方案.md「问题 3（终版 v1 范围）」逐字实现：
1. `plugins/dsh-model-efforts/package.json`
2. `plugins/dsh-model-efforts/cordis.patch.yml`
3. `plugins/dsh-model-efforts/lib/index.js`（壳）
4. `plugins/dsh-model-efforts/lib/client.js`（守护加载 + internals 测试面 + section 组件）
5. `plugins/dsh-model-efforts/test/index.test.mjs`
6. `plugins/dsh-model-efforts/scripts/build.sh`
7. `plugins/dsh-model-efforts/README.md`

门禁：`node --test plugins/dsh-model-efforts/test/` + 全插件 `node --test` + `node scripts/verify-plugin.mjs`。

## S4 基建小改 + 文档同步

- `scripts/verify-tauri-release.mjs` P9 文案 4→5。
- FUNCTIONS.md / README.md / 关键踩坑记录.md（#105-#108）/ 打包记录.md。

## S5 收尾

1. 全量门禁复跑 + lib 零漂移。
2. 隔离冒烟（DSH_HOME=%TEMP% 沙箱 + DSH_HUB_PACKAGE_ROOT）：三断言（最大化保留 / `_dshnms_root` 渲染 / 插件 section 渲染与写入）——冒烟受 GUI 限制时降级为静态 + 门禁证据，并在报告注明。
3. 踩坑登记 + git 提交 dev-v2。
4. T1：`node scripts/verify-release.mjs` ALL PASS → `npm run build:installer`（版本 0.1.6 覆盖 build/0.1.6/）→ SHA256 → 推 dev-v2。
5. 归档任务日志 → 清理规划文件。
