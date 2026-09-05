# 第二轮审查 · 代码落地方案文档（收敛版）

> 输入：round2-技术方案.md。最终文件级清单；第三轮终审后即按此实施。

## 问题 1（7 文件 + 1 测试段）

| # | 文件 | 改动 |
|---|---|---|
| 1 | `src-tauri/src/managers/window_ops.rs` | `set_window_size` +第4参 `allow_unmaximize: bool`；新增 `enum ResizeAction{Skip,UnmaximizeThenResize,Resize}` + 纯函数 `resize_action`；skip 分支 `info!`；模块头与函数 doc 改写（英文，含 skip 悬空语义说明） |
| 2 | `src-tauri/src/commands/commands.rs` | command 加 `allow_unmaximize: Option<bool>` → `unwrap_or(true)`；doc 更新 |
| 3 | `src-tauri/src/managers/node.rs` | 分发臂读 `allowUnmaximize` 可选字段；`let _ =` → `warn!`；注释同步 |
| 4 | `src/models/pipe.ts` | 头注释补 `allowUnmaximize` |
| 5 | `src/managers/tauri-shell.ts` | `applySize(width, height, opts?: {allowUnmaximize?: boolean})`；透传字段 |
| 6 | `src/index.ts` | :254 `h.applySize(w, h, { allowUnmaximize: false })` + 注释 |
| 7 | `src/server/config-api.ts` | :69/:106 sizeChanged 判定改基于 patch |
| 8 | window_ops.rs tests | `resize_action` 4 例 |

## 问题 2（2 文件）

| # | 文件 | 改动 |
|---|---|---|
| 1 | `src/client/model-select.tsx` | `installModelSelect` 重构：sessions 顶层守卫（warn）→ `ctx.effect(() => ctx.inject(['modelDirectories'], scope => {…slots.inject…}))`；成功日志 |
| 2 | `src/client/index.ts` | :88-91 注释改写（scoped 注入 + 降级契约）；:92 inject 数组**不变** |

## 问题 3（新目录 `plugins/dsh-model-efforts/`，7 新文件 + 2 基建小改）

| # | 文件 | 内容 |
|---|---|---|
| 1 | `plugins/dsh-model-efforts/package.json` | `@dsh-external/dsh-model-efforts@0.0.1`；exports `.`+`./client`；files `["lib","cordis.patch.yml"]`；peerDeps cordis ^4.0.1；`dsh.bundle.patch`；`dsh.client:{inject:[modules,ui-slots,api-remotes,ui-settings],platform:"web"}` |
| 2 | `plugins/dsh-model-efforts/cordis.patch.yml` | 顶层数组单 insert，id==name |
| 3 | `lib/index.js` | host：inject ['settings']；installSection 意图配置；buildOps（modelOverrides 路径专属 + models 数组路由检测拒绝）；校验镜像 V1-V9；applyEfforts（describe→mutate+revision，冲突重试≤3，未注册跳过）；onChange 联动 |
| 4 | `lib/client.js` | client：inject ['slots','remote','remote.settings','settingsScope']；settings.section(id model-efforts, order 35)；settingsScope.bind 驱动的 React 页（路由/模型/7 档编辑/false 开关/保存/冲突重试/空态两态）；document-updated(ns 过滤 llm-pi-ai)+adapters-updated 收敛；zh/en 内置词典 |
| 5 | `scripts/build.sh` | node --check 两个 lib |
| 6 | `test/index.test.mjs` | buildOps 翻译/路径硬约束/models 数组拒绝/校验镜像逐例/冲突重试逻辑 |
| 7 | `README.md` | 挂载/双轨/与官方 Models 页关系 |
| 8 | `scripts/verify-tauri-release.mjs` | P9 提示 4→5（INFO 文案） |
| 9 | 零其他基建改动 | tauri.conf resources / assemble-profile 均已通配（核实过） |

## 文档同步（4 文件）

FUNCTIONS.md（版本行/A3/A7/D3/I5）、README.md（:3/:36/:44-46/:211-215）、docs/关键踩坑记录.md（#105-#108）、docs/打包记录.md（T1 登记）。

## 实施顺序（第三轮通过后）

1. 问题 1 → cargo fmt/clippy/test
2. 问题 2 → tsc + build:client
3. 插件 3 → node --test + verify-plugin
4. 全量门禁 + verify-plugin 全插件 + lib 零漂移
5. 隔离冒烟三断言（最大化保留 / _dshnms_root 存在 / 插件页写入 settings.yaml 生效）
6. 文档同步 → 提交 → T1（版本 0.1.6 不变：门禁全跑 + verify-release + build:installer + 推 dev-v2）
