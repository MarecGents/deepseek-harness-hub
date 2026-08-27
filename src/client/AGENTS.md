# AGENTS.md — src/client/（插件 UI）开发约束

> 本目录是 dsh-hub 的 **client half**（浏览器内，React），是**插件 UI**，不是壳。改动本目录任何文件前，**必须**先读根 [../../AGENTS.md](../../AGENTS.md) 与本文件。

## 职责

| 文件 | 职责 |
|---|---|
| `index.ts` | client 入口：`inject` 声明（slots/workspaces/sessions）、slot 声明合并（`settings.plugin.item`）、设置卡片 + 右侧栏装配、托盘桥 `__mgShellReady` |
| `settings-card.tsx` | 设置卡片（DSH HUB 设置）：窗口尺寸/主题/托盘行为/通知/提示音/多实例开关/皮肤选择/桌面图标选择（S6，保存 → `set_desktop_icon` invoke）（Setting-Cell 行式），走 `/api/dsh-hub/config` |
| `skins.ts` | 皮肤注册表：`DshSkin` 定义 + 15 套皮肤（内置 5：午夜蓝/旧纸张/终端绿/ZCode/极光紫；Reasonix 8：rx-noir-gold 等；opencode 2：oc-classic/oc-graphite，见 docs/skins/）+ `findSkin`/`applySkin` |
| `backgrounds.ts` | 背景图注册表：`DshBackground` 定义 + 内置图片（远航）+ `applyBackground`（frame 层双层背景注入）/ `fetchStoredBackground` |
| `right-sidebar.tsx` | 右侧栏：概览（Token 统计）/ 文件树 / Git 三页，body portal 挂载 |
| `right-sidebar-style.ts` | 右侧栏样式（CSS 字符串注入，`mg-rs-*` 前缀） |
| `pin-conversations.ts` | 置顶会话：内容匹配行定位（零 CSS-hash）+ 置顶区/行按钮注入 + pins 状态机（dirtyDelta / ready 门控剪枝 / disposer 移除 DOM） |
| `pin-conversations-style.ts` | 置顶区/行按钮样式（CSS 字符串注入，`mg-pin-*` 前缀） |
| `model-select.tsx` | composer 模型嵌套菜单：slot `conversation.input.model` priority -1 阴影官方，自声明 `modelDirectories` 类型 |
| `session-tabs.ts` | 会话标签 store：`tabAdd`/`tabRemove`/`tabReplaceOrder` + `useTabs`（useSyncExternalStore），localStorage `dsh-hub:session-tabs` 持久化（旧键 `dsh-hub.session-tabs` 一次性迁移，读旧写新删旧） |
| `SessionTabs.tsx` | 会话标签栏：createPortal 渲染进标题栏 `#dsh-hub-titlebar .tb-title`——点击切换 / `+` 新建 / `×` 关闭 / 状态点（等待琥珀·完成绿·运行蓝+脉冲）/ 右键菜单复用 session-menu / 拖拽排序 / 内联重命名（IME 组合不误提交）/ 自动滚动 / 归档删除自动移除（空快照不剪枝门控，F1-F8） |
| `session-menu.ts` | 任务右键菜单：置顶/重命名/分叉/归档/资源管理器/复制路径 |
| `session-menu-style.ts` | 任务右键菜单样式（CSS 字符串注入，`mg-ctxmenu-*` 前缀） |
| `conversation-rail.ts` | 对话定位条：turnTimings 时间窗对齐真实节点 kind 预览（修 #35：extractNodeText / extractTurnSummaries），body portal 挂载 |
| `conversation-rail-style.ts` | 对话定位条样式（CSS 字符串注入，`--mg-rail-*` 变量） |
| `pty-store.ts` | 终端 PTY store：面板状态 + 每 tab SSE 订阅（JSON 信封 / token `?token=` / 重连重置 buffer）+ 写队列 40ms 批处理（per-tab 串行）+ 512KB ring buffer + entry cwd（sessions 快照 → `__mgGetCurrentWorkspace`）+ `ptyRetarget`（Set-Location 跟随工作区切换） |
| `terminal-dock.tsx` | 底部终端 dock（xterm.js 6.0.0）：多 tab 懒挂载（切换重放 ring buffer）/ 指针捕获拖拽调高 / composer 列压缩（padding-bottom 抬升）/ 设置弹层（字号+主题）/ 最大化；dsw token 采样 xterm 主题（canvas 安全 hex，probe 解析） |
| `terminal-prefs.ts` | 终端偏好 store：字号（9–24 clamp）+ 深/浅色主题，localStorage `dsh-hub:terminal-prefs` 持久化（旧键 `dsh-hub.terminal.prefs` 一次性迁移） |
| `xterm-css.ts` | xterm.js 6.0.0 官方 CSS 内联（`XTERM_CSS`，随 client bundle 注入） |
| `desktop-icons.ts` | 桌面图标注册表（S6）：preview 走 `/api/dsh-hub/icons` |
| `style.ts` | 设置卡片样式（CSS 字符串注入，`mg-card-*` 前缀） |

## UI 风格铁律（严格遵循 dsh web）

1. **只用官方 token**：`--dsw-alias-*` / `--dsw-specific-*` / `--dsw-static-*`；**禁止硬编码 hex/灰度**（可保留 `var(..., fallback)` 双保险）。
2. **只用官方图标**：`@deepseek-ai/dsh-client-ui-primitives` 的 `Icon*Outline16` 系列；不自行造图标、不用 emoji 当图标。
   - **单点豁免（置顶 pin 图标）**：官方图标库无 pin/bookmark/star，`pin-conversations.ts` 自绘 1 个 24 视口填充路径 pin glyph（`currentColor`、`aria-hidden`）——**限定 1 个 glyph / 1 个模块**；官方提供 pin 图标后立即切换（根 AGENTS.md §3 交叉引用）。
3. **参照官方组件**：设置卡片 → `ui-settings-plugins` 的 `PluginCard.module.css` / `fields.module.css`；tab → `ConversationRoot.module.css`（13px/500、选中蓝 + 2px 蓝条）；tooltip → `ui-primitives/Tooltip.module.css`（tooltip-bg 深灰底 + bluish-00 白字、500ms 延迟）。
4. **右侧栏 body portal**：React root 挂 `document.body`（参考 DSH-better-sidebar），**不占用官方 details slot**；`--mg-sidebar-width`（360/56px）+ `body #root { margin-right }` 让中间栏让位；可与 better-sidebar 共存。
5. **文案**：产品文案中文；代码注释英文。

### 皮肤（skins）豁免（见根 AGENTS.md 3.1）

- **`skins.ts` 中的自定义皮肤不受上述 UI 风格铁律约束**：允许硬编码色值、自定义配色，是新的视觉风格。
- **背景图（`backgrounds.ts`）同样豁免**：`applyBackground` 注入 frame 层双层背景（锚点 `#root div[style*="grid-template-columns"]` + `linear-gradient` 蒙层 + 图片），允许 `!important` 图片层；禁止硬编码 hex 颜色；`'none'` 哨兵清空注入。
- **默认皮肤（default）严格受约束**；设置卡片/右侧栏等非皮肤代码**一律遵守铁律**（token/图标/官方组件）。
- 每套皮肤开发前先读 `docs/skins/{skin-id}.md` 风格文档与 `docs/skins/AGENTS.md`；新增皮肤必须同步建文档。
- 皮肤技术约束：覆盖选择器 `body`（浅）/ `body[data-ds-dark-theme]`（深）；样式 append `<head>`；`default` 移除注入样式表；id ≤64 字符、未知回退 default。
- **皮肤覆盖范围**：除 `--dsw-alias-*` 语义 token 外，必须同时覆盖 `--dsw-specific-*`（`sidebar-fill`、`sidebar-nav-item-*`、`menu`、`bubble`、`bubble-highlight`）与 `--dsw-alias-bg-module-platform`，保证左导航/右详情/卡片/浮层/会话气泡与中栏一致跟随皮肤；文字对比度由各皮肤自己的 `label-*` 色系保证（深色亮字/浅色暗字）。新增皮肤遗漏上述 token = 覆盖不全 bug。
- **DOM 增强纪律（置顶会话）**：对官方 slot cell 的增强只用 stable 锚点（`data-slot`/`role`），**禁止 CSS-module hash 定位**（dsh 升级即失效，见 docs/关键踩坑记录.md #29）；行→会话映射用内容匹配（行内文本 == displayTitle），同名整组跳过（宁缺毋错）；pins 写路径 phase 门控（空 byId 收缩会清空数据）、boot 结果与 dirtyDelta 合并、disposer 移除注入 DOM（HMR 重装防僵尸写）。

## client 注册规范

1. **inject 声明**：`inject = ['slots', 'workspaces', 'sessions']` —— 缺 `workspaces` 会导致托盘"新建任务"静默失败（真实事故）。
2. **slot 声明合并**：`declare module '@deepseek-ai/dsh-client-ui-slots'` 声明 `settings.plugin.item`，形状镜像 ui-settings-plugins 契约。
3. **配置读写走自有 HTTP**：`fetch('/api/dsh-hub/config')`，**不**用 dsh settings 命名空间 RPC（第三方 ns 不被白名单暴露）。
4. **保存逻辑**：只提交真正变化的字段（width/height 未改不提交）；新增配置字段必须同步 host 三处（接口/默认值/POST 白名单）。

## 数据订阅（body portal 上下文）

- portal 外无 `useProjection` props：通过 `ctx.sessions.binding(id).session.projections.faceOf(key)` + `useSyncExternalStore` 订阅 `sessionStats` / `tokenUsage`。
- 新对话/无数据时渲染 0（不显示空态闪断）。
- 本轮对话 Token：`chat.timeline.turnOrder` 检测 turn 变化，tokenUsage 差值计算，下轮清零。

## 代码质量

- 文件头注释：职责、模块类别、对外接口。
- 每个导出函数/组件前 JSDoc；props 接口写清字段。
- **Build 前推演**：改完本目录，执行 `npm run build:client` 前先推演——inject 完整、slot 声明正确、token 无硬编码、fetch 路径与 host 路由一致、portal 卸载清理（`ctx.effect` disposer）。推演通过再构建。
- 样式注入幂等：`injectCardStyle` / `injectRightSidebarStyle` 检查 `document.getElementById` 防重复。
