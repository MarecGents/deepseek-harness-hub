# 第三轮审查 · 技术方案实施文档（终版）

> 三轮收敛后的最终技术方案；实施严格按本文 + round3-代码落地.md 执行。

## 问题 1（终版）

`set_window_size(app, width, height, allow_unmaximize: bool)`：
- 纯函数 `resize_action(is_maximized: bool, allow_unmaximize: bool) -> ResizeAction`（Skip / UnmaximizeThenResize / Resize）。
- Skip：`info!("set_window_size: maximized, boot sync skipped (unmaximize not allowed)")` → Ok(())。
- invoke：`allow_unmaximize: Option<bool>` → `unwrap_or(true)`。
- DSH_CMD：`allowUnmaximize` 可选字段 → `unwrap_or(true)`；吞错 `let _ =` 改 `warn!`。
- TS：`applySize(width, height, opts?: { allowUnmaximize?: boolean })`；boot 传 false；手动路径不动。
- config-api：sizeChanged 判定移到 patch 构建后基于 patch 判定。
- 注释：英文；模块头/doc/pipe.ts/tauri-shell.ts/index.ts 同步；无 ACL 变更；单测 4 例。

## 问题 2（终版）

`installModelSelect` 重构（model-select.tsx 单文件 + index.ts 注释）：
1. 入口守卫：`sessions` 缺失 → `console.warn('[dsh-hub] model-select skipped: sessions service unavailable')` + return（sessions 在顶层 inject 数组，理论必在——纯防御）。
2. `ctx.effect(() => ctx.inject(['modelDirectories'], (scope) => {…}), 'dsh-hub: model-select override')`：scope 内取 slots/modelDirectories，任一缺失 → warn + return（子 fiber 静默 PENDING，页面其余功能不受累）。
3. 注册成功 `console.log('[dsh-hub] model-select override installed')`；slots.inject 保持现有 2 参形态。
4. client/index.ts:88-91 注释改写：scoped 注入语义 + README 降级契约不变。

## 问题 3（终版 v1 范围）

**结构**（`plugins/dsh-model-efforts/`，目录名==包名尾段）：
- `package.json`：`@dsh-external/dsh-model-efforts@0.0.1`；`type:module`；exports `.`→lib/index.js、`./client`→lib/client.js、`./package.json`；files `["lib","cordis.patch.yml"]`；peerDeps cordis ^4.0.1；`dsh.client: { inject: [dsh-client-modules, dsh-client-ui-slots, dsh-api-remotes, dsh-client-ui-settings], platform: "web" }`（platform 必填，缺省静默不出 client 行）；`dsh.bundle.patch`。
- `cordis.patch.yml`：顶层数组 `- insert: - id/name` 相邻行单引号 == 包名（P2 正则）。
- `lib/index.js`：极简壳（name/inject=[]/apply 空实现 + 注释说明逻辑在 client half）。
- `lib/client.js`：经典脚本守护加载；`globalThis.__dshModelEffortsInternals` 暴露纯函数（buildOps/buildModelOpsArray/validateEfforts/stripUndefined/pickWriteMode）供 node:test；factory 内 `exports.inject=['slots','remote','remote.settings','settingsScope']`；`apply(ctx)` 注册 `settings.section`（id `model-efforts`、order 35、zh/en 词典 label）。
- 组件（createElement 手写）：`ctx.settingsScope.bind({namespace:'llm-pi-ai'})`（apply 闭包捕获）→ useSyncExternalStore(subscribe, getSnapshot)；
  - 数据：`snapshot.value.providers`（resolved user+base）枚举路由/模型 + 既有 modelOverrides 键；
  - 写路径分派：路由 models 数组为空 → override 逐键 ops；非空 → 整组 models 数组 set（读-改-写 + stripUndefined）；
  - 保存：`scope.mutate(ops, snapshot.revision)`；conflict → 重读自动恢复 + 提示重试（≤3 自动，之后手动）；rejected → 展示 host 诊断原文；
  - 空态：status==='unavailable' → "模型服务未就绪"；providers 空 → 指引到官方 Models 页；writable===false → 禁编辑提示；
  - 收敛：`ctx.remote.$on('settings/document-updated', ns === 'llm-pi-ai' → refresh)`（settingsScope 镜像自刷，UI 仅需触发本地状态）+ `llm/adapters-updated`。
  - 预校验镜像（降拒绝率）：非 off 档位值 null/空串 → 禁保存；空 dict/仅 off → 禁保存；`false`（非推理模型）合法。
- `test/index.test.mjs`：import client.js → globals 内部面——双路 op 构建、路由分派判定、undefined 剥除、校验镜像逐例、冲突重试（stub scope mutate 拒一次再成功）。
- `scripts/build.sh`：node --check 两文件。
- `README.md`：挂载/双轨/定位（官方 Models 页无 per-model effort 编辑器，本插件补位）。

**安全声明**：零 HTTP 路由、零 Tauri command、零 ACL 变更；写路径=官方 settings API 同权（llm-pi-ai schema + assertServiceable 兜底）。

## 文档同步与发布（终版）

- FUNCTIONS.md：版本行 →0.1.6；A3/A7 参数化语义；D3 scoped 注入；I5 新条目。
- README.md：:3 版本；:36/:44-46；:211-215 目录树。
- docs/关键踩坑记录.md：#105 boot applySize 打掉最大化恢复；#106 applyPathOp 数组中间节点覆盖坑（下标 path 摧毁数组）；#107 最大化保存 0 → 退最大化总落 3/4 的既有 quirk；#108 usage-stats POST prices 路由缺守卫（待修登记）。
- scripts/verify-tauri-release.mjs：P9 文案 4→5。
- docs/打包记录.md：T1 登记（同版本覆盖 + SHA256）。
- T1：版本 0.1.6 不变；门禁全跑 + verify-release + build:installer + 推 dev-v2。
