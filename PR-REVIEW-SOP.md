# PR-REVIEW-SOP — dsh-hub 外部 PR 评审与落地标准流程

> **本文件是 dsh-hub 处理外部贡献 PR（Pull Request）的标准化 SOP 与质量管理约束。** 收到任何指向本仓库的 PR（尤其外部 fork 提交、base 可能落后当前分支的）时，**必须**按本流程执行。与本文件冲突时，以根 [AGENTS.md](AGENTS.md) 铁律与 [PROCESS_QUALITY.md](PROCESS_QUALITY.md) 为准。
> 版本：v1.0 · 2026-08-21 · 状态：生效（基于 #24–#27 四轮真实 PR 处理经验固化）

---

## 0. 核心原则（为什么需要这套流程）

外部 PR 常见三类问题（#24–#27 实证）：
1. **基线落后**：PR 基于旧分支（如 WebView2 版 main）编写，合并到当前 Tauri main 会带回已删除代码/已修复 bug（#25 落后 5 轮、#27 落后 98 commits）。
2. **依赖不成立**：PR 依赖的外部接口/组件在目标生态**不存在**（#26 的 `window.__dshAppearanceCenter__` 全网实测缺失）——合入即破坏现有功能。
3. **落点错位**：PR 改的文件在当前架构已删除/迁移（#24 launcher 家族、#27 的 `src/services/` 旧布局）。

**铁律：PR 必须经「调研 → 判定 → 用户决策 → 按落地方案落地 → 质量门禁」全流程，禁止未经评估直接合并。** 判定基于真实证据（git/gh 实测），不是代码表面。

---

## 1. 阶段流程（6 阶段）

### 阶段 0：PR 接收与初筛
- `gh pr list --repo MarecGents/deepseek-harness-hub --state open` 拉取 open PR。
- 对每个 PR 记录：编号/标题/作者/head 分支/base 分支/创建时间/改动规模（+/-/文件数）。
- **关键初判**：`git merge-base origin/<pr-branch> origin/main` 看基线落后程度；`git log --oneline origin/main..origin/<pr-branch>` 看提交数。
- 输出：PR 元数据表（后续文档引用）。

### 阶段 1：调研（产出 5 件套文档，存外部档案仓库 `E:\Workdata\Git_repositories\deepseek\docs\`）
对每个值得调研的 PR（open 且非明显垃圾）产出 5 份文档，文件名带 `PR<N>-<类型>-<YYYY-MM-DD>.md`：

| # | 文档 | 核心内容 | 依据 |
|---|---|---|---|
| 1 | 调研报告 | 元数据/提交链/改动文件清单/机制依赖/dev-v2 现状对照/关键事实核查（API 是否真实存在） | `gh pr view` + `git diff/stat/log` + 读目标分支源码 |
| 2 | 合并可行性分析 | TL;DR 判定（✅/🟡/❌）+ 逐 commit 判定总表 + 文件级证据 | 同上 + dev-v2 现状 |
| 3 | 代码落地方案 | 每个可移植切片的「落到 dev-v2 哪个文件/怎么改/整合点/验收点」；不可合的理由 | 落地方案模板 |
| 4 | 三轮审查 | 每切片三轮：功能完整性/代码质量与边界/与 dev-v2 Tauri-only 架构一致性；遗留行动项 | 真实代码 diff |
| 5 | 落地 SOP 与质量管理 | 若用户决定落地：可执行 SOP + 质量门禁 + DMAIC + 缺陷登记 + 回归基线 | 前 4 份 |

**调研纪律**：
- **API 契约必须实测**（grep 目标分支 node_modules/源码/dsh 生态包），不凭 PR 描述信以为真（#26 教训）。
- **判定给证据**（文件:行/commit），不写"可能/大概"。
- 只读 git/gh + 读代码，**不改仓库文件**，不 commit。

### 阶段 2：判定矩阵（每切片/每 commit）
| 判定 | 含义 | 后续 |
|---|---|---|
| ✅ 可直接合并 | 基线一致、无冲突、契约成立 | 走 PR merge（gh pr merge --merge --admin） |
| 🟡 需改写移植 | 有价值但基线落后/落点错位/依赖旧守卫 | **不直接合分支**，按落地方案在 dev-v2 上重做切片 |
| ❌ 不可合 | 依赖不成立/已过时/将回退既有修复 | 记录理由，等用户决定（关闭或搁置） |

**总判定**：一个 PR 的不同切片可有不同判定（如 #27 = 4 切片全 🟡 可移植）。

### 阶段 3：用户决策门（强制）
- 调研完成后**必须**把全部文档核心结论汇报用户（大白话：这 PR 干了啥、能不能要、值不值、风险）。
- **由用户决定**：全部落地 / 部分落地 / 搁置 / 关闭。**禁止越过用户直接合并或关闭 PR。**

### 阶段 4：落地执行（若用户决定落地）
- 按《代码落地方案》+《落地 SOP》在 **dev-v2** 上实现（不开合分支、不直接 merge PR）。
- **落地顺序按依赖**：先纯新增/独立切片，后依赖前者的收尾（如 #27：rail → 右键菜单+host → 内联重命名 → unify）。
- **严禁**：整文件 checkout 旧基线文件（会带回旧守卫/已删代码）；带入 PR 的旧 `lib/` 产物（落地后按 dev-v2 重建）。
- 每切片落地后立即过质量门禁（见 §2），**逐切片独立验收**，不攒批。

### 阶段 5：验收与归档
- 全部切片落地 → 总门禁 → 真机冒烟 → 用户确认。
- 归档：踩坑记录补录（新坑）、FUNCTIONS.md 功能状态更新、README（如需）、任务日志。
- commit（清晰分片）+ push dev-v2。
- 对 PR 本体：已吸收的 PR 可关闭（gh pr close + 说明"已在 dev-v2 按切片落地"）；❌ 的 PR 记录理由后由用户决定关闭/搁置。

---

## 2. 质量门禁（每阶段/每切片必查）

| 门禁 | 命令/检查 | FAIL 处理 |
|---|---|---|
| 构建门禁 | `npm run build`（host tsc）+ `npm run build:client`（client bundle）+ `git diff --stat origin/dev-v2` | 修到绿，禁止跳过 |
| lib 零漂移 | build 后 `git status` 无未提交 lib/ 变更（踩坑 #21） | 重建 lib 后提交 |
| Rust 门禁 | `cargo check --all-targets` + `cargo clippy --all-targets` 零告警（涉及壳时） | 修到绿 |
| 运行验证 | 隔离 DSH_HOME（`DSH_HOME=<临时目录>`）真机冒烟：新功能逐项 + dev-v2 通用回归清单 | 修复回归项 |
| 发布门禁 | 涉及发布才跑：`node scripts/verify-release.mjs` ALL PASS | FAIL 禁止 publish |
| 一致性必查 | 插件身份四重相等 / client 装配与 index.ts 一致 / host 路由走 `src/server/*` + host-guard / ACL 三处一致（壳侧）/ 管道三端同步（壳侧 IPC） | 修复 |

**5 条质量红线**：
1. 回退 dev-v2 既有修复（如 #27 带回旧 pin 守卫）——禁止。
2. 生成文件与源码不一致（旧 lib 入库）——禁止。
3. 跳过门禁直接提交——禁止。
4. host 落点回旧布局（`src/services/*` 而非 `src/server/*`）——禁止。
5. 踩坑记录编号冲突 / 发布未过 verify-release——禁止。

---

## 3. 质量管理（DMAIC 应用）

| DMAIC 阶段 | PR 评审中的落地 |
|---|---|
| **Define** | 明确 PR 目标功能、验收标准（从 PR 描述 + 官方契约） |
| **Measure** | 改动规模、基线落后 commit 数、API 存在性实测结果、质量门禁通过率 |
| **Analyze** | 根因分析：为何不能直接合（基线/依赖/落点），哪些切片可移植 |
| **Improve** | 按落地方案切片落地，逐切片门禁 + 真机冒烟 |
| **Control** | 归档（踩坑/FUNCTIONS/README）、回归基线固化、后续 PR 按本 SOP 复用 |

**缺陷登记表模板**（落地过程中发现的问题统一登记）：
| DEF-编号 | 切片 | 现象 | 根因 | 证据 | 修复 | 状态 |
|---|---|---|---|---|---|---|
| DEF-001 | rail | 锚点未命中 | data-slot 结构变化 | file:line | 降级/改锚点 | 待修/已修 |

**回归基线**：
- 自动化：`npm run build` / `build:client` / `cargo clippy` / `verify-release.mjs`（发布时）。
- 手动（dev-v2 通用）：首启出"启动中"→ 自动进 dsh UI；托盘四菜单；置顶/皮肤/背景/右侧栏；会话通知 + 提示音；多实例门禁。

---

## 4. 与既有规范的关系

- 根 [AGENTS.md](AGENTS.md) 铁律 7：开发必须遵循 PROCESS_QUALITY.md——本文件是其**「外部 PR 评审」专项落地**。
- [PROCESS_QUALITY.md](PROCESS_QUALITY.md)：通用 SOP + DMAIC 总纲——本文件提供 PR 场景的细化。
- 落地执行的代码规范（分层/ACL/管道/UI token）见 [AGENTS.md](AGENTS.md) 及各级子 harness，本文件不重复。

---

## 5. 模板附录

### 5.1 PR 元数据表模板
| # | 标题 | 作者 | head | base | 创建 | 规模 | 基线落后 | 初判 |
|---|---|---|---|---|---|---|---|---|

### 5.2 判定总表模板（每 commit 一行）
| PR | commit | 内容 | 判定 | 核心证据 |
|---|---|---|---|---|

### 5.3 切片落地步骤模板（每切片）
```
切片：<名称>（来源 commit）
落点：<dev-v2 文件路径>
改动：<新增/修改要点>
整合：<与现有代码的接缝>
验收：<真机验证点>
门禁：<build/build:client/冒烟>
```
