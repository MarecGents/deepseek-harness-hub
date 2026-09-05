# 第二轮审查 · 技术方案实施文档（收敛版）

> 输入：round2-可行性分析.md（D1=scoped、D2=独立 section、D3=modelOverrides 唯一逐字段路径）。

## 问题 1：set_window_size 最大化保护（定稿）

- `window_ops::set_window_size(app, width, height, allow_unmaximize: bool)`；判定抽纯函数 `resize_action(is_maximized, allow_unmaximize) -> ResizeAction{Skip, UnmaximizeThenResize, Resize}`。
- Skip 分支语义（写入 doc 注释）：boot 同步让位于窗口最大化状态——配置尺寸本次生命周期内不应用；此后退出最大化恢复**默认 3/4**（最大化时保存尺寸记 0 → 低于 480 下限 → 走 three_quarter），非旧保存尺寸。
- invoke：`allow_unmaximize: Option<bool>` 缺省 true；DSH_CMD：`allowUnmaximize` 可选字段缺省 true；boot 传 false，手动路径不动。
- 顺手项：node.rs 分发臂 `let _ =` 改 `warn!`；config-api sizeChanged 判定改 `patch.width !== undefined || patch.height !== undefined`（:69/:106 两处）。
- 红线合规：新增注释英文；单测 4 例；无 ACL 变更；帧协议三端注释同步。

## 问题 2：model-select scoped 注入（定稿）

```ts
// model-select.tsx installModelSelect 重构：
export function installModelSelect(ctx: ClientContext): void {
  const sessions = ctx.get('sessions') as … | undefined
  if (sessions === undefined) { console.warn('[dsh-hub] model-select skipped: no sessions service'); return }
  ctx.effect(() => ctx.inject(['modelDirectories'], (scope: ClientContext) => {
    const slots = scope.get('slots')
    const models = scope.get('modelDirectories')
    if (slots === undefined || models === undefined) {
      console.warn('[dsh-hub] model-select skipped: missing service(s)')
      return
    }
    return slots.inject('conversation.input.model', () => slots.register({…priority:-1…}, …ModelSelectNested), undefined, 'dsh-hub: model-select override')
  }), 'dsh-hub: model-select override')
}
```
- `ctx.inject` 子 fiber：服务就绪才注册 seat；服务永缺 → 子 fiber PENDING，页面其余功能不受累（README 承诺保留）。
- 同步改写 `client/index.ts:88-91` 注释（新语义：scoped 注入 + 降级契约）。
- 成功日志 `console.log('[dsh-hub] model-select override installed')`（冒烟信号）。
- 旧守卫中的 sessions 探测保留在 installModelSelect 入口（sessions 已在顶层 inject 数组，必在）。

## 问题 3：插件 `@dsh-external/dsh-model-efforts`（定稿）

**host half**（lib/index.js，`inject: ['settings']`）：
- `ctx.settings.installSection(ctx, 'dsh-model-efforts', Config, config, {setSource, onChange})`——自有意图配置（0.1.2-rc.1 settings API，与 hub 同款签名）。
- Config schema：`{ models: z.dict(ModelIntent) }`，ModelIntent = `{ route: string, modelId: string, efforts: Partial<Record<ThinkingLevel, string|null>> | false }`。
- `buildOps(intent)`：**只产出** `['providers', route, 'modelOverrides', modelId, 'reasoningEfforts']` 的 set/unset（D3 硬约束：永不触碰 models 数组下标）；带 models 列表的路由写入前检测并拒绝（提示用 modelOverrides 或整组替换——v1 拒绝 + 指引）。
- 预校验镜像 V1-V9（V1 空 dict/valueless、V2 非 off null、V3 空串、V4 仅 off、V5 false 合法、V6 off 语义、V8 modelOverrides 仅 catalog 路由/不伴随 models/无 id 键、V9 JSON 兼容）。
- `applyEfforts()`：`ctx.settings.describe()` 找 llm-pi-ai 的 `revision` → 校验 → `ctx.settings.mutate('llm-pi-ai', ops, revision)`；`SettingsConflictError`（code SETTINGS_CONFLICT）→ 重读重试（≤3 次）；`settings namespace not registered` → 静默跳过（llm-pi-ai 未挂载完成，onChange/事件会再触发）。
- onChange：意图变更 → applyEfforts。零 HTTP 路由、零 ACL。

**client half**（lib/client.js，cordis `inject: ['slots','remote','remote.settings','settingsScope']`；package.json `dsh.client.inject: ['@deepseek-ai/dsh-client-modules','@deepseek-ai/dsh-client-ui-slots','@deepseek-ai/dsh-api-remotes','@deepseek-ai/dsh-client-ui-settings']`）：
- `settings.section` 注册（id `model-efforts`、order 35、label 词典化 zh/en）。
- 数据：`ctx.settingsScope.bind({ namespace: 'llm-pi-ai' })` → getSnapshot（status/value/base/user/revision/writable）+ `mutate(ops, expectedRevision)`（自带 revision 围栏、失败自动恢复读）；路由/模型枚举优先 `view.value.providers`（user+base 解析值直接展示）。
- UI（无构建器，React createElement 手写，仿 usage-stats/model-select 先例）：每条意图一卡（路由下拉 modelOverrides 可用性提示、模型 id、档位 7 键 off/minimal/low/medium/high/xhigh/max 编辑、false 开关）、保存即 host-less 直写（client mutate）、冲突提示重试。
- 收敛：`ctx.remote.$on('settings/document-updated', (ns) => { if (ns === 'llm-pi-ai') refresh() })` + `('llm/adapters-updated', refresh)`。
- 空态：snapshot `status==='unavailable'`（llm-pi-ai 未挂载）→ 显示"模型服务未就绪，稍后自动重试"；`providers:{}` → 指引（官方 Models 页添加 provider 后回到本页配置档位）。

**装配/身份**：目录名 `dsh-model-efforts` == 包名尾段（junction 名取目录名、bundle 名取 package.json name，二者独立读取——铁律）；cordis.patch.yml 顶层数组 id==name；verify-plugin P1-P5 自动覆盖。

## 文档同步与 T1（定稿清单）

- FUNCTIONS.md：版本行 0.1.5→0.1.6；A3/A7 补参数化语义；D3 补 scoped 注入与 warn 降级；I 节新增 I5 dsh-model-efforts。
- README.md：:3 版本；:36 模型选择描述；:44-46 设置页行为与插件列表；:211-215 目录树。
- docs/关键踩坑记录.md：新坑 #105-#108（boot applySize 打掉最大化 / applyPathOp 数组覆盖坑 / 最大化保存 0 的退最大化 3/4 quirk / usage-stats POST 路由缺守卫·待修）。
- scripts/verify-tauri-release.mjs P9 提示 `plugins/4 mounted` → 5。
- 打包记录：docs/打包记录.md 登记本次 T1（同版本覆盖，记 SHA256）。
- T1：版本保持 0.1.6（verify-release 无递增断言，已核实）；build/0.1.6 覆盖 + SHA256 对账；仅推 dev-v2。
