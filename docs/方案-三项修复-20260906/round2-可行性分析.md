# 第二轮审查 · 可行性分析报告

> 输入：round1 三文档。本轮 3 个并行子代理（R2-A 正确性/时序 / R2-B 插件 API 深审 / R2-C 回归安全文档）。

## 决策收敛

### D1（问题2 注入方式）＝ **scoped `ctx.inject`**（推翻第一轮的顶层 inject 推荐）

R2-A/R2-C 双重证据：
1. 顶层 inject 使 hub **整个 client apply** 延后到 modelDirectories 就绪——而 `__mgShellReady` flag 在模块作用域置位（client/index.ts:58）、托盘命令 listener 在 apply 内注册（:223），host 侧重试脚本只看 flag 不等 listener（notify.rs:28、node.rs:143-155）→ 出现"flag 已置、listener 未挂"窗口，**期间托盘点击事件丢失且无重试**。
2. 顶层 inject 的残余失败模式 = boot 审计 throw → **整页 fail**（皮肤/标签/菜单全灭）；scoped 子 fiber PENDING 不进 boot 审计，最坏 = 回退内置 seat。官方 ui-model-selection 自身对此场景就用 scoped（其 client.js:849 `ctx.inject(["commandUi","modelDirectories"], …)`）。
3. README.md:36 已对外承诺"服务缺失自动降级、不阻塞"——scoped 保留该契约。

### D2（问题3 UI 落点）＝ **独立 `settings.section`**（order 35）

provider-card keyed slot 可行（key='llm-pi-ai'，owner props 给 settingsPath）但卡内空间小、draft 卡空态复杂、keyed 注册一次收到全部卡需自行分拣。独立 section 一页总览全部路由/模型、与 usage-stats 同款模板先例、order 35 与 usage(30) 不冲突。

### D3（问题3 写 ops 策略）＝ **modelOverrides 字典路径为唯一逐字段写法**（加硬约束）

R2-B 决定性发现：settings `applyPathOp` 的 set 会**自动创建中间节点，且中间节点若是数组会被整体替换为对象**——`providers.<route>.models.<idx>.reasoningEfforts` 这类数组下标 path 会**摧毁整个 models 数组**。因此：
- 逐字段写只允许 `providers.<route>.modelOverrides.<modelId>.reasoningEfforts`（V8：仅对已安装 catalog 路由合法）。
- 带 `models` 列表的手填路由：只能读-改-写**整组** `['providers', route, 'models']` 数组值。

## 第一轮蓝图的核实与修正

| 项 | 结论 |
|---|---|
| 引用核实 | 13 处 file:line 全部一致（2 处 ±1 行/目录微偏：commands.rs 属性行在 126、e2e.rs 在 helpers/ 子目录） |
| 时序竞态 | restore_window_state（setup 同步段）严格先于一切 applySize 帧（sidecar spawn 在 :871）→ 无竞态；DSH_CMD 单写者单读者 FIFO，无乱序 |
| skip 悬空态 | 存在且语义可接受；**修正**：退最大化后走 default_three_quarter_size（最大化时保存尺寸记 0 → <480 落 3/4），非"旧保存尺寸"；须写进 doc 注释防被当 bug 重修 |
| 既有 quirk（新发现） | "最大化时保存 0"导致任何一次退出最大化都落默认 3/4 而非用户上次尺寸——预先存在，登记踩坑记录，不在本次修复范围 |
| Option\<bool\> 缺参 | tauri 2.11.5 ipc/command.rs:128-136 逐行核实：缺失 key → visit_none → None，e2e 旧调用零影响 |
| cargo/脚本影响 | 无现有测试引用 set_window_size 签名；verify-protocol/ipc-smoke/shell-init 零触碰；ACL 零变更 |
| config-api 小缺口 | sizeChanged 判定 `'width' in record` 在畸形 POST（width:"abc"）下伪阳性——顺手改为基于 patch 判定 |

## 安全结论（插件3）

- host half `ctx.settings.mutate` 为 cordis 进程内调用：**零 HTTP 路由、零 Tauri command、零 ACL 变更**。
- client half 直调官方 remote RPC 与官方 Models 页同权同信任级（官方连接层自述非 auth 层）；llm-pi-ai section 无 role('secret') 字段 → 脱敏视图下模型条目与 reasoningEfforts **完整可读**（credential-ref 的 apiKeyEnv 不剥离）。
- 插件自身零路由 → 无需 token 守卫；显式声明防实现时顺手加路由。
- 附带发现（登记，不属本次）：dsh-usage-stats 的 POST prices 路由缺 host/origin/token 守卫，低于 hub P1-5 标准。

## 可行性总评

三项方案全部成立且已收敛到可编码精度；无阻断项。剩余不确定性（Windows 外平台 unmaximize 事件语义）不影响本仓 Windows-only 分发。
