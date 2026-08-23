# AGENTS.md — dsh-hub 开发约束（总纲）

> **本文件是 dsh-hub 的全部开发 harness（总纲）。** 开发/修改任何部分之前，**必须**先阅读本文件，并阅读 [PROCESS_QUALITY.md](PROCESS_QUALITY.md)（SOP + 质量管理流程约束，铁律 7）与对应职能目录下的子 harness（见文末「分层 harness 索引」）。
>
> dsh-hub 是 **DeepSeek Harness（dsh）的桌面端框架**：以原生窗口（Tauri 2.x，dev-v2 Tauri-only；WebView2 时代壳已删除）承载 dsh Web UI，并提供系统托盘、主题同步、窗口记忆、右侧栏、会话通知等桌面能力。它是 **dsh 生态的插件 + 桌面壳**，**绝不修改 dsh 底层源码**。

---

## 0. 铁律（不可违反）

1. **绝不碰 dsh 底层代码**。本仓库不复制、不修改、不 patch `deepseek-harness` 源码；一切能力通过 dsh 官方插件接口（Cordis `ctx`、slot、HTTP 路由、事件）接入。参考 dsh 源码**只读**。
2. **插件身份一致性**（历史血泪：改名事故导致 `duplicate loader entry id` / `loaded without registering`）。以下四处**必须永远相等**：
   - `package.json` 的 `name`
   - `tsdown.config.ts` 的 `PLUGIN_ID`
   - `cordis.patch.yml` 的 `insert.name`
   - web profile `bundles` 里的条目
   改任一必须同步全部，并重新 `npm run build && npm run build:client`。
3. **启动门控不可破坏**：`cordis.patch.yml` 的 `disabled: !!js process.env.DSH_HUB_LAUNCHED !== '1'` 保证普通 `dsh web` 不加载桌面壳。任何改动不得让 CLI 模式加载壳/插件页。
4. **多实例防护不可削弱**：默认拒绝与已运行的 dsh 共存（`allowMultipleInstances=false`）。多个 dsh 共享 `$DSH_HOME` 会话存储，同会话双写会损坏会话日志（seq 冲突，已实际发生并需手工修复，见 [docs/关键踩坑记录.md#24](docs/关键踩坑记录.md)）。任何修改不得默认放开共存。
5. **settings 命名空间约束**：`settingsNamespace('dsh-hub')` 强制小写 kebab-case；带 scope 的包名（`@marecgents/dsh-hub`）不能用作 settings ns 或 API 前缀。第三方配置 UI 一律走插件自有 HTTP 路由 `/api/dsh-hub/*`。
6. **发布前检查不可跳过**：每次 `npm publish` 之前**必须**运行 `node scripts/verify-release.mjs` 且**全部 PASS**（含「干净安装 → 首启装配」冒烟），FAIL 立即停止排查，**禁止发布**。发布流程与检查细则见 §5（rc.10–rc.13 曾因跳过"全新环境安装验证"连发 4 版首启即崩的包，见 [docs/关键踩坑记录.md#33](docs/关键踩坑记录.md)）。
7. **开发流程必须遵循 PROCESS_QUALITY**：任何开发任务（迁移、功能、修复、文档、发布）**必须严格遵循 [PROCESS_QUALITY.md](PROCESS_QUALITY.md) 的 SOP（标准作业程序）与质量管理规范**——含阶段输入/输出/门禁（Gate）逐项核查、验收表、回归基线、DMAIC 改进循环。**禁止跳过阶段门禁**；与本文件铁律冲突时，以本文件（AGENTS.md）为准。

---

## 1. 架构定位与职责隔离（壳 vs 插件）

dsh-hub 是**双 half** 结构，且**套壳代码与插件代码必须严格模块化隔离**：

```
┌─────────────────────────────────────────────────────────────┐
│ host half（dsh 进程内，Node）——分层结构见 src/AGENTS.md         │
│   src/index.ts          Controller：插件入口，编排装配          │
│   src/core/             Core：命令注册表 / 生命周期（registry）  │
│   src/managers/         壳 Manager：tauri-shell（唯一壳 Manager）│
│   src/server/           Server：HTTP 路由工厂（/api/dsh-hub/*） │
│   src/services/         Services：纯领域业务（config/pins-store）│
│   src/helpers/          Helper：无状态工具（state-store）          │
│   src/controllers/     Controller：业务编排（session-runtime/tray-pipe）│
│   src/models/          Model：共享类型/常量（pipe 帧、ShellConfig）     │
│   src/utils/           Utils：纯函数（管道帧解析）                      │
├─────────────────────────────────────────────────────────────┤
│ client half（浏览器内，React）                                 │
│   src/client/*          插件 UI：设置卡片 + 右侧栏（body portal）│
├─────────────────────────────────────────────────────────────┤
│ 独立 dsh 插件（双轨分发，见 §1.1 铁律 8）
│   plugins/<name>/      独立插件（独立 npm + 随 hub resources 分发）
├─────────────────────────────────────────────────────────────┤
│ Tauri 原生壳（Rust，src-tauri/src/）——见 src-tauri/src/AGENTS.md│
│   lib.rs / main.rs      Controller：壳入口                    │
│   commands/ managers/ services/ helpers/（SPT 分层）          │
├─────────────────────────────────────────────────────────────┤
│ 壳入口 / 装配（dev-v2 Tauri-only，launcher 家族已删）           │
│   src-tauri/src/lib.rs   Tauri 壳入口（见上）                  │
│   bin/dsh-web-sidecar.mjs    sidecar 辅助（装配/入口解析，M5 预留）│
│   scripts/assemble-profile.mjs  运行 profile 装配（幂等）      │
└─────────────────────────────────────────────────────────────┘
```

**隔离边界（dev-v2 Tauri-only，2026-08 更新）**：
- **壳层**（`src/managers/*` + `src/helpers/`（state-store；dwm-theme / explorer / screen 等 Windows 专属能力已随 WebView2 壳删除、迁入 Rust 壳）+ `src-tauri/src/` 整个 Rust 壳）——壳能力已整体落在 Rust 侧；**不得**让插件逻辑渗入壳层。
- **插件层**（client/* + `src/server/*` 路由 + settings-card）——与壳解耦，通过**明确定义的接口**（HTTP 路由 / IPC 桥 / 事件）通信；Tauri 迁移时保留。
- 新增代码时，先判断属于壳还是插件，落入对应目录；**禁止在壳层写插件业务、在插件层写窗口/托盘/系统调用**。

**模块化分级**（大厂级代码组织，新增文件必须归类）：

| 类别 | 职责 | 命名示例 |
|---|---|---|
| **Controller** | 入口编排、装配、生命周期挂钩 | `index.ts`、`lib.rs` |
| **Manager** | 管理复杂对象的生命周期/状态机 | `managers/tauri-shell.ts`（壳）、`managers/tray.rs`、`managers/icon.rs`（图标 6 面编排：面级幂等 + 全局串行锁 + 单 worker/pending 合并防快速切换卡死；`theme.rs` 回归无状态纯函数） |
| **Services** | 业务服务，对外提供能力 | `services/config-store.ts`、`services/notify.rs` |
| **Server** | HTTP 路由 / 对外端口 | `server/config-api.ts`、`server/workspace-api.ts` |
| **Helper** | 纯工具函数，无状态、无副作用 | `helpers/state-store.ts` |
| **Core** | 全局注册表 / 生命周期顺序 | `core/registry.ts` |

**分层依赖红线（SPT 单向依赖，2026-08-18 重构确立，防"改一处坏一处"）**：

- **单向依赖**：上层可依赖下层，下层**禁止**依赖上层。层级：`index.ts → controllers → core → managers/server/services → helpers → models/utils`（host half）；`lib.rs → commands → managers/services → helpers`（Rust 壳 half）。
- 跨层引用违规 = 审查必纠项；新增文件先归类（Core/Controller/Manager/Services/Server/Helper/Model/Utils），命名清晰表达职能。
- **命令分发**：托盘/管道命令一律走 `core/registry.ts` 注册表（新增命令 = `trayCommands.register(...)`），禁止在 index.ts 散落 if/else 分发链。
- **双向管道协议同步**：壳→host 走 stdin `MG_TRAY`；host→壳走 stdout `DSH_CMD`。帧格式与命令名变更必须同步 `src-tauri/src/managers/node.rs` 分发表 ↔ `src/managers/tauri-shell.ts`（sendDshCmd）↔ `src/index.ts`（MG_TRAY 读取）。

### 1.1 新功能分发策略（2026-08-23 确立，铁律 8）

新功能落地**先判定类型、再定分发**；**禁止"死目录"**（只放代码不接装配链——代码进仓库但无法生效 = 未完成的功能）。

| 功能类型 | 判定 | 分发策略 |
|---|---|---|
| **dsh plugin**（独立插件） | 纯 dsh 生态能力（`ctx.tools` / `systemPrompt` / `session/event` / `webServer` / 独立 client section），**可脱离本壳使用** | **双轨必须同时**：① 独立 npm 发布（`plugins/<name>/` 包 `private:false`，走 §5 发布流程 + verify-release 门禁）；② 随 hub 分发（tauri resources 含 `plugins/<name>/**/*` + assemble-profile 装配进 profile + cordis.patch.yml 挂载 → NSIS 自带） |
| **壳单一功能** | 壳/插件层增强（client UI、托盘、窗口、Rust 壳、设置卡），**只在本壳有意义** | **不发布 npm**：随 hub 仓库走（client 经 `build:client` 编译进 lib/；Rust 经 cargo 编译进 exe）；装配走 `src/client/index.ts` 或 `src-tauri` |
| **plugin + 壳联动** | 既有通用插件能力、又有壳侧集成（如插件 host 能力 + 壳 UI/托盘接线） | **拆分双轨**：插件部分（通用能力）→ 独立 npm 发布 **且** 随 hub 分发；壳侧集成（UI/装配/托盘接线）→ 随 hub。**两边都必须接装配链**（插件进 profile；壳侧走 hub 装配），禁止只发一半 |

**判定要点**：
- 依赖 dsh 官方扩展点（tools / systemPrompt / 事件 / webServer）且脱离本壳仍有用 = **plugin** → 双轨（npm + hub）。
- 依赖壳能力（tauri 命令、托盘、窗口、`DSH_CMD`、壳配置）或本壳专属视觉（皮肤/背景/rail/右侧栏）= **壳功能** → 随 hub，不发 npm。
- 每个新功能落地时必须回答："**不接装配链它能生效吗？**" 不能 = 必须补装配链（插件：cordis.patch.yml 挂载 + 进 profile；壳功能：index.ts 装配）；能 = 才算完成。

---

## 2. 严格遵循 dsh 架构接口与开发者文档

- 一切 dsh 能力通过**官方接口**接入：Cordis 插件（`ctx.effect` / `ctx.on` / `ctx.waterfall`）、client slot、`ctx.webServer.register`、dsh 事件（`session/event`、`agent/*`）。
- **开发某功能前**，若对 dsh 接口不熟：先读 `deepseek-harness/docs/` 下对应文档（`architecture.md`、`cordis-primer.md`、`web-styling.md`、`development.md` 等）；内容不足时**浏览整个 deepseek-harness 项目**找最适配的架构/技术路线作为参考（只读，不复制源码）。
- 使用 dsh 官方 client 包：`@deepseek-ai/dsh-client-ui-primitives`（图标）、`@deepseek-ai/dsh-client-*`（UI 组件）；client 构建时平台模块必须保持 external（见 `tsdown.config.ts` 的 `PLATFORM_MODULES`）。
- dsh 版本升级后，核对 `peerDependencies` / `devDependencies` 与 junction（`npm install` 会清掉 SDK junction，须重跑 `npm run build:client`）。

## 3. 严格遵循 dsh web 前端 UI 风格

- 颜色/字体/圆角/间距一律用官方 `--dsw-*` token（`--dsw-alias-*` / `--dsw-specific-*` / `--dsw-static-*`），**禁止硬编码 hex/灰度**（可保留 `var(..., fallback)` 双保险）。
- 图标用官方图标库 `@deepseek-ai/dsh-client-ui-primitives`（`Icon*Outline16` 系列），不自行造图标。
  - **单点豁免（置顶 pin 图标，到期条款）**：官方图标库无 pin/bookmark/star，`src/client/pin-conversations.ts` 自绘 **1 个** 24 视口填充路径 pin glyph（`currentColor`、`aria-hidden`）——限定 1 个 glyph / 1 个模块 / 不扩散；**官方提供 pin 图标后立即切换**（见 src/client/AGENTS.md §UI 铁律 2）。
- 遵循 dsh 官方组件样式：设置卡片参照 `ui-settings-plugins` 的 `PluginCard.module.css` / `fields.module.css`；tab 参照 `ConversationRoot.module.css`；tooltip 参照 `ui-primitives/Tooltip.module.css`。
- 右侧栏用 **body portal** 挂载（不占用官方 details slot），自管宽度；收起 rail 与左弹 tooltip 逻辑保持。
- **背景图（background image）豁免（与皮肤并列的新视觉层）**：`src/client/backgrounds.ts` 通过注入 `<style id="mg-dsh-background">` 给**应用 frame 层**（锚点 `#root div[style*="grid-template-columns"]`，结构契约非 CSS-module hash）叠加 `linear-gradient(蒙层) + url()` 双层背景，并把**左/中/右三栏表面设为 75% 半透明**（`color-mix(原 token 75%, transparent)`，背景图透出 ~25%；左栏 token `--dsw-specific-sidebar-fill`，中/右栏内容根 `--dsw-alias-bg-base`；锚点为 `[data-slot="sidebar"/"conversation"/"details"] > div` 官方 slot 契约）；**自研右侧栏（body portal）因 fixed 合成不透出背后，改为把背景图画在自身上**（多层背景 `[fill 75% 渐变] + [黑蒙] + [url]` + `background-attachment: fixed` 对齐 + 内部 `[class*="mg-rs-"]` 透明）——允许 `!important` 图片层（类比皮肤豁免），但禁止硬编码 hex 颜色；`'none'` 哨兵清空注入；图片资产放 `assets/backgrounds/`，由 `src/server/backgrounds-api.ts` 静态路由 `/api/dsh-hub/backgrounds/*` 服务（正则白名单防穿越）；蒙层 + 75% 表面双重保证文字可读；锚点均为升级冒烟项（见 docs/关键踩坑记录.md #32）。
- **对话定位条自适应配色（计算色豁免）**：`src/client/conversation-rail.ts` 在运行时采样 rail 下方有效背景（表面 computed color × 背景图 cover 采样混合），按采样色相经 HSL 推导 tick/active 颜色并写入 rail 根元素 CSS 变量（`--mg-rail-*`，样式层保留 token 回退）——运行时计算色无法用静态 token 表达，类比背景图豁免；禁止在样式层新增硬编码 hex（回退字面量除外）。
- 产品文案用中文；代码注释用英文（与 dsh 官方一致）。

### 3.1 皮肤（skins）风格豁免

- **「默认（default）」= 原生外观**，严格受上述 UI 风格约束（官方 token、官方图标、官方组件参照）。
- **自定义皮肤（skins）是新的视觉风格，不受上述 UI 风格约束**——皮肤通过覆盖 `--dsw-alias-*` / `--dsw-specific-*` 语义令牌实现自定义配色，允许使用硬编码色值。
- **每套皮肤必须自建风格 harness 文档**，存放于 `docs/skins/{skin-id}.md`，写明：设计意图、浅色/深色调色板（明确列出色值）、覆盖了哪些 token、与默认风格的关系、注意事项。开发该皮肤相关改动前先读对应文档与 `docs/skins/AGENTS.md`（皮肤公共 harness）。
- **皮肤覆盖范围（强制，缺 = 覆盖不全 bug）**：皮肤必须同时覆盖
  - `--dsw-alias-*` 语义 token（`bg-*`/`label-*`/`border-*`/`brand-*`/`button-*`/`interactive-*`/`markdown-*`/`scrollbar-*`/`tooltip-bg`/`toast-bg`/**`bg-module-platform`**）；
  - `--dsw-specific-*` 表面 token（`sidebar-fill`/`sidebar-nav-item-active-accent`/`sidebar-nav-item-active`/`sidebar-nav-item-hover`/`menu`/`bubble`/`bubble-highlight`）——左导航、右详情、卡片、浮层、会话气泡才与中栏一致跟随皮肤。
  - 文字对比度由各皮肤自己的 `label-*` 色系保证：深色模式亮字、浅色模式暗字，任一模式下文字/背景对比不得低于可读阈值。
- 皮肤实现约束（技术层面仍强制）：
  - 覆盖选择器必须与 app 声明一致：浅色 `body`、深色 `body[data-ds-dark-theme]`（`:root` 覆盖会输给 body 级联）。
  - 注入样式表 append 到 `<head>`，同特异性后声明者胜。
  - `default` 皮肤必须移除注入的样式表（零副作用）。
  - 皮肤 id 为不透明短字符串（≤64 字符）；未知 id 回退 `default`。
  - `skins.ts` 的 `DshSkin` 结构：`light`/`dark` = alias token（`--dsw-alias-` 前缀），`specific.light`/`specific.dark` = specific token（`--dsw-specific-` 前缀）；`buildCss` 双块输出。
- 皮肤清单见 `src/client/skins.ts`（当前 5 套：午夜蓝/旧纸张/终端绿/ZCode/极光紫）。

## 4. 代码质量规范（大厂级）

1. **文件头写职能**：每个源文件顶部注释写明「此文件的职责、所属模块类别（Controller/Manager/Services/Server/Helper）、对外接口」。
2. **接口信息**：每个导出函数/类/接口前写 JSDoc 注释（作用、参数、返回、副作用）；不写显而易见的注释，但接口契约必须写清。
3. **Build 前代码级逻辑推理（强制）**：任何代码改动后、执行 `npm run build` / `build:client` 之前，必须**先在代码层面推演**：
   - 改动是否自洽（类型、引用、作用域、空值边界）；
   - 是否破坏既有接口（调用方、patch 装配、client id、env 门控）；
   - 是否引入未处理错误路径（catch 是否吞错、Promise 是否遗漏）；
   - 是否符合本 AGENTS.md 约束（身份一致性、门控、多实例、UI token）。
   - 推演通过后再构建；**禁止**"先 build 报错再回改"的返工式开发。
4. **错误处理**：空 `catch` 必须注释吞掉什么、为何无碍；`try` 保持单一语句；进程退出用 `quit.marker` + `process.exit(0)`（webviewjs teardown 崩溃规避），不用 `app.exit()`。
5. **类型**：`strict: true`；`any` 必须解释为何无法收窄；ESM（`"type": "module"`）；相对导入用 `.ts` 后缀（host）或构建约定。
6. **文档同步**：行为/配置/接口变更必须同步更新 `README.md`、`FUNCTIONS.md`（功能状态事实源）、`docs/关键踩坑记录.md`（新坑补录）或本项目任务日志。

## 5. 构建 / 发布 / 分支 / 发包前强制检查

```sh
npm run build          # host（tsc → lib/）
npm run build:client   # client（tsdown + SDK junction）
```

- `npm install` 会清掉 SDK junction → 装完依赖必须重跑 `build:client`。

### 5.1 分支策略（2026-08-16 更新）

- `main` = **发布分支，唯一合并目标**。保护：`enforce_admins=false` + `required_approving_review_count=1` → 发布合并用 `gh pr merge N --merge --admin`。
- `dev-v2` = **唯一开发分支**（Tauri 2.x 壳迁移）。**所有更新（功能/文档/修复/脚本）只在 dev-v2 开发，merge 只到 main**（PR → admin merge），不再做"三分支同步"。
- `dev-v1` = **永久冻结存档**（WebView2 时代收尾：rc.13 / rc.14）。**不再接收任何更新与同步**；如未来确需改动，经用户明确同意后以 PR 形式合入 main（dev-v1 本身不改）。
- 发布流程：dev-v2 → PR → main（admin merge）→ main 上 bump/重建/发布 → **main ff 回灌 dev-v2**（保持开发分支最新）；dev-v1 冻结不动。

### 5.2 发布铁律（硬约束，任一 FAIL 禁止 publish）

0. **门禁**：先 `node scripts/verify-release.mjs`，**全部 PASS** 才可继续（脚本自动检查 P1–P5，含干净安装冒烟）。
1. **插件身份四重相等**（§0 铁律 2）：package.json name == tsdown PLUGIN_ID == cordis.patch.yml insert.name == web profile bundles 条目。
2. **loader entry 必须是 scoped 包名** `@marecgents/dsh-hub`：bare 名（`dsh-hub`）会让全新环境首启 `ERR_MODULE_NOT_FOUND` → 「连续异常退出」弹窗（rc.10–rc.13 真实事故，见 [docs/关键踩坑记录.md#33](docs/关键踩坑记录.md)）。launcher 装配必须 scoped（junction `node_modules/@marecgents/dsh-hub`），禁止 bare 兜底残留。
3. **lib 产物零漂移**：build 后 `git status` 无未提交 lib/ 变更（prepack 会重建 lib，发布前已提交）。
4. **dist-tags 直查 registry**：发布后 `Invoke-RestMethod 'https://registry.npmjs.org/-/package/@marecgents/dsh-hub/dist-tags'` 必须 `latest == rc == 当前版本`。**`npm view` 有镜像缓存，不可信**。
5. **registry 显式官方**：publish / dist-tag 一律 `--registry=https://registry.npmjs.org/`（本机默认是华为镜像）。
6. **版本不可覆盖**：`npm version <bump>` 每次升版本，同版本 publish 会被拒绝。
7. **main 发布 + dev-v2 回灌 + tag**：push main 与 `v0.0.2-rc.<N>` tag；dev-v2 ff 到 main；**dev-v1 冻结不动**（§5.1）。
8. **发布后真机验证**：测试电脑安装 `cargo tauri build` 的 **NSIS 安装器**（M5）后首启冒烟；插件层 npm 发布仍走 `node scripts/verify-release.mjs` 门禁（保留）。

### 5.3 发布命令（rc 流程，逐步执行）

```sh
# 0. 门禁（必须 ALL PASS，FAIL 禁止继续）
node scripts/verify-release.mjs

# 1. 合并 dev-v2 → main（唯一开发/合并路径；gh pr merge --merge --admin）
gh pr create --base main --head dev-v2 --title "..."
gh pr merge <N> --merge --admin

# 2. main 上 bump + 重建
git checkout main && git pull origin main
npm version 0.0.2-rc.<N+1>
npm run build && npm run build:client

# 3. 发布 + latest dist-tag（显式官方 registry）
npm publish --access public --tag rc --registry=https://registry.npmjs.org/
npm dist-tag add @marecgents/dsh-hub@0.0.2-rc.<N+1> latest --registry=https://registry.npmjs.org/

# 4. 校验（registry 直查，勿用 npm view）
(Invoke-RestMethod 'https://registry.npmjs.org/-/package/@marecgents/dsh-hub/dist-tags').latest   # 必须 = 0.0.1-rc.<N+1>

# 5. 推送 main + tag + 回灌 dev-v2（dev-v1 冻结不动）
git push origin main && git push origin v0.0.2-rc.<N+1>
git checkout dev-v2 && git merge main --ff-only && git push origin dev-v2

# 6. 发布记录 docs/发布记录-rc<N>-YYYY-MM-DD-HHmm.md → commit（main）→ 回灌 dev-v2
```

- **发布版本号策略**：当前 rc 预览期（`0.0.2-rc.x`，以 package.json 当前值为准）；正式版需在 **Tauri 2.x 迁移完成并达到良好体验后**再发布（见 [外部档案 docs/dsh桌面端技术路线-2026-08-16.md](../docs/dsh桌面端技术路线-2026-08-16.md)）。

### 5.4 全新环境首启崩溃事故（rc.10–rc.13，勿重蹈）

- **现象**：全新机器装好 Node + `npm i -g @marecgents/dsh-hub` 后首启弹「dsh-hub 连续异常退出」；dsh.log 见 `ERR_MODULE_NOT_FOUND: Cannot find package '@marecgents/dsh-hub' imported from C:\Users\...\.dsh\profiles\web\`，崩溃 3 次后放弃。
- **原因**：launcher 旧版在 profile 未注册 scoped 名时走 bare 兜底装配（junction `node_modules/dsh-hub` + bundles 加 `dsh-hub`），与 cordis.patch.yml 的 scoped loader entry 不匹配 → 启动即崩。**本机 npm link 环境永远测不出来**——发布验证必须包含「干净安装 → 首启装配」链路（P4）。
- **修复**（rc.14）：launcher 统一 scoped 装配 + 每次启动自愈 junction + 幂等清理 bare 遗留 + `DSH_HUB_ASSEMBLE_ONLY=1` 诊断模式。
- **详细**：[docs/关键踩坑记录.md#33](docs/关键踩坑记录.md)（含升级冒烟项）。

### 5.5 开发与运行隔离（dev-v2 Tauri-only，2026-08 更新）

**原则**：WebView2 时代的 npm launcher / 桌面快捷方式 / `install-local.mjs` 装配链路已随壳层整体删除（launcher 家族）。dev-v2 起 **Tauri 为唯一壳模式**：日常使用与测试电脑运行 **NSIS 安装器**安装的 Tauri 壳；开发仓库以**隔离 DSH_HOME + sidecar 装配**（`DSH_HUB_PACKAGE_ROOT=仓库根`）进入测试 profile——dev 仍会以 junction 方式挂载仓库（幂等自愈机制，非 WebView2 时代遗留）。

- **开发**：`npm run tauri:dev`（=`cargo tauri dev`）——Rust 壳 + Node sidecar 本地联动（`src-tauri/src/managers/node.rs` 调 `scripts/assemble-profile.mjs` 装配 profile 并 spawn `dsh web --port 0`；`bin/dsh-web-sidecar.mjs` 为独立装配/入口解析辅助，M5 externalBin 预留）。
- **测试隔离**：dev 测试用**隔离 DSH_HOME**（`DSH_HOME=<临时目录>`），不污染正式运行数据；dev 实例可与已运行的 3080 端口 dsh web **并存**。
- **运行 / 发布**：`npm run tauri:build`（=`cargo tauri build`）产出 **NSIS 安装器（M5）**；测试电脑安装后首启冒烟，运行真实 `$DSH_HOME`。
- **多实例门禁**：已由 **Rust 壳 `src-tauri/src/lib.rs`** 承担（single-instance + netstat/CIM 检测，默认拒绝共存），不再依赖 npm launcher 的 PID 锁（`lock.mjs` 已删）。
- **状态核查**（2026-08）：launcher 家族 / 桌面快捷方式等 WebView2 时代产物已从仓库删除；运行 profile 装配由 Rust 壳（node.rs → `scripts/assemble-profile.mjs`）承担，dev 时以 `DSH_HUB_PACKAGE_ROOT=仓库根` 建 scoped junction（幂等自愈，见 [docs/关键踩坑记录.md#33](docs/关键踩坑记录.md) / #34）。
- **sidecar 进程受 Job Object KILL_ON_JOB_CLOSE 约束**（node.rs ssign_sidecar_to_kill_job，`SyncHandle` 包装 HANDLE 解决 Send/Sync）：sidecar 及整棵子进程树绑进作业——壳退出/崩溃/被卸载强杀时，内核随最后一个作业句柄关闭连带清理，根治 node.exe 孤儿锁文件（卸载不净根因，见 [docs/关键踩坑记录.md#68](docs/关键踩坑记录.md)）；Cargo.toml windows features 需显式含 Win32_System_JobObjects + Win32_Security（CreateJobObjectW 依赖 Security 类型，勿靠传递依赖）。

### 5.6 自编译安装（install-local 已删除，dev-v2 Tauri-only）

- **现状**：`npm run install:local` 与 `scripts/install-local.mjs` 已随 WebView2 壳删除（package.json 无该 script）。本地构建/安装 = **Tauri 产物链路**：`npm run tauri:build`（=`cargo tauri build`）→ **NSIS 安装器（M5）** → 安装即等同发布安装（见 §5.5）。
- **发布前本地验证**：构建并安装本地 NSIS 包冒烟；插件层 npm 发布仍走 `node scripts/verify-release.mjs` 门禁（见 §5.2）。

## 6. 未来技术路线（约束方向，不立即实施）

- **目标**：Tauri 2.x 壳（自定义壳 UI、Windows/macOS/Linux 三端、~10MB、官方插件生态）。详细决策见外部档案 `../docs/dsh桌面端技术路线-2026-08-16.md`。
- **现状（2026-08-23）**：Tauri 2.x 迁移**已完成**（M5 打包闭环真机验证，当前 `0.0.2-rc.x`）；壳层落在 `src-tauri/`（Rust），插件层（client + server API）保留。
- **未来**：自定义壳 UI（decorations:false）/ Windows·macOS·Linux 三端 / 自动更新 / 包体 ~10MB / 官方插件生态。

---

## 7. 分层 harness 索引（开发前必读）

| 目录 | 子 harness | 覆盖内容 |
|---|---|---|
| `src/` | [src/AGENTS.md](src/AGENTS.md) | host 分层总纲：层级表、单向依赖红线、registry 路由、管道协议、日志 |
| `src/core/` | [src/core/AGENTS.md](src/core/AGENTS.md) | Core 层：命令注册表、生命周期、无业务 |
| `src/managers/` | [src/managers/AGENTS.md](src/managers/AGENTS.md) | 壳 Manager 红线、壳/插件隔离、命令上行通道 |
| `src/server/` | [src/server/AGENTS.md](src/server/AGENTS.md) | Server 路由规范、配置三处一致、请求体校验 |
| `src/services/` | [src/services/AGENTS.md](src/services/AGENTS.md) | Services 层（config-store / pins-store）规范 |
| `src/helpers/` | [src/helpers/AGENTS.md](src/helpers/AGENTS.md) | Helper 纯函数规范、零依赖、Windows 专属标记 |
| `src/client/` | [src/client/AGENTS.md](src/client/AGENTS.md) | UI 风格强制、client 注册规范、body portal 约束 |
| `src-tauri/src/` | [src-tauri/src/AGENTS.md](src-tauri/src/AGENTS.md) | Rust 壳红线：双向管道协议、ACL 三处一致、退出语义、E2E |
| `bin/` | [bin/AGENTS.md](bin/AGENTS.md) | sidecar 辅助（装配/入口解析）、M5 externalBin 预留 |

> **规则**：改动任何目录先读根 `AGENTS.md`；`src/` 各子目录（core/managers/server/services/helpers/controllers/models/utils）先读 `src/AGENTS.md` + 对应子目录 AGENTS.md；`src/client/` 读 `src/client/AGENTS.md`；`src-tauri/src/` 读 `src-tauri/src/AGENTS.md`；`bin/` 读 `bin/AGENTS.md`；全部改动先读本文件。
