# dsh-hub 功能清单（FUNCTIONS）

> 基线：`main` 分支 `v0.0.1-rc.14`（WebView2 时代最终版）。
> 更新：2026-08-24 · 当前开发分支 `dev-v2`（Tauri 2.x 壳 + dsh web 插件层）。本轮（08-22/23）新增：图标系统模块化重构（icon.rs 6 面编排）、图标快速切换防卡死（worker 合并）、卸载提速（Get-Process + Defender 排除）、Job Object 防 sidecar 残留、模型嵌套菜单（PR #33）、findings-ledger 插件（PR #38）、build:installer 完整性预检。（08-24 文档同步 M1-M4：会话标签栏（M2）、交互终端（M4）、notify focus-session（M1）、rail 数据源修复（M1）、S0 Origin 校验（M3）、工作区 dialog:allow-open（M2）+ workspace/open（M4），见 §13）
> 状态标记：✅ 已覆盖（Tauri 壳或插件层等价实现）· ⚠️ 部分/待补（M4/M5 收口项）· ➖ 不适用（被 Tauri 原生能力替代）。
> 依据：`git show main:<path>` 源码 + `docs/` 发布记录（rc10–rc14）。

---

## 1. 桌面壳 / 窗口管理

| # | 功能 | 说明（rc.14 行为） | 当前状态 |
|---|---|---|---|
| 1 | 原生窗口承载 dsh SPA | webserver ACTIVE 即开窗（早于 Loader 全量就绪），`--port 0` 随机端口 | ✅ Tauri 无边框窗口 + `WebviewUrl::External`（lib.rs），READY 先验证再导航 |
| 2 | 品牌化 Splash | 300ms 主题色 + dsh logo + spinner 覆盖到 SPA 首绘，无白/黑闪 | ✅ shell-init.js 注入覆盖层（鲸鱼 logo + spinner，load 或 3s 后淡出） |
| 3 | 窗口状态记忆 | 仅持久化 maximized（`dsh-hub-window-state.json`）；退出最大化恢复保存尺寸或 3/4 屏；最小 480×360 | ✅ `helpers/state.rs`（restore_window_state / resize 保存） |
| 4 | 默认尺寸策略 | 无保存尺寸 = 启动屏 3/4（光标所在屏，multi-monitor aware）；恰好默认值 1280×720 不算用户显式保存 | ✅ `managers/window.rs`（primary_monitor 3/4，上限 1600×1000） |
| 5 | 关闭/最小化到托盘 | closeToTray=true 关窗保进程+托盘；minimizeToTray 最小化即隐藏；行为实时读配置 | ✅ lib.rs `CloseRequested`（prevent_close+hide）/ `Resized+is_minimized` 检测 |
| 6 | 设置实时应用 | 主题/尺寸保存后即时 applyTheme/applySize；最大化时保存尺寸先退最大化再套用 | ✅ DSH_CMD 上行即时应用；最大化时先退再 set_size（2026-08-19 第十轮） |

## 2. 主题与外观

| # | 功能 | 说明（rc.14 行为） | 当前状态 |
|---|---|---|---|
| 7 | 标题栏主题跟随 | 'system' 监听页面 `data-ds-dark-theme`；DWM immersive dark；同步 webview 背景防帧错位 | ✅ apply_page_theme：DWM + webview 背景 + 窗口图标随 `data-ds-dark-theme`（MutationObserver） |
| 8 | 标题栏浅/深强制模式 | 主题选项「浅色/深色」强制 chrome 色；跟随 dsh 走 token | ✅ 增强：按当前皮肤浅/深色板解析（`#mg-dsh-skin` 样式表），皮肤切换自动重读；回退黑白 |
| 9 | 桌面图标（6 面同步） | 设置卡可选 5 鲸鱼娘/默认主题翻转；切换同步窗口 SMALL+BIG/托盘/.lnk×2/AUMID/自绘标题栏 | ✅ `managers/icon.rs` IconManager 6 面统一编排：面级幂等（去重键含 dark）+ 全局串行锁 + 单 worker/pending 合并（快速切换不卡死）；BIG 用 PostMessageW 异步；标题栏与任务栏/托盘同源真实 PNG（`/api/dsh-hub/icons/*.png`） |

## 3. 托盘

| # | 功能 | 说明（rc.14 行为） | 当前状态 |
|---|---|---|---|
| 10 | 常驻系统托盘 | 菜单：显示/隐藏主界面（动态标签）、打开工作区、新建会话、退出 | ✅ `managers/tray.rs` 原生菜单 + 左键单击显示 + `sync_toggle_label` 动态标签 |
| 11 | 打开工作区 | 打开**当前聚焦会话**所在工作区目录 | ✅ 修复（2026-08-19）：改走 client 聚焦会话解析 → `open_workspace_path` |
| 12 | 新建会话 | 派发页面事件 → 官方 `workspaces.startSession()`（当前会话→最近工作区）；SPA 未就绪重试不丢命令 | ✅ stdin 管道 → host → 页面事件（带 `__mgShellReady` 300ms×20 重试） |
| 13 | 托盘退出 | 写 `quit.marker` 后正常退出，不误判崩溃重启 | ✅ `helpers/quit.rs` + `tray_quit` 命令 |

## 4. 通知与声音

| # | 功能 | 说明（rc.14 行为） | 当前状态 |
|---|---|---|---|
| 14 | 任务完成 Toast | depth-0 会话 turn/end completed\|error 弹原生通知；30s 冷却；聚焦会话只响音不弹 | ✅ notify-rust 直弹 + 点击回窗口（wait_for_action）+ 30s 冷却 + 聚焦抑制 |
| 15 | 四段事件提示音 | 提问 start/完成 success/需批准 attention/出错 error，独立开关；隐藏到托盘仍可闻 | ✅ DSH_CMD `play_sound` → Rust eval → 页面 HTMLAudio（sounds-api 伺服 WAV，autoplay 放行） |
| 16 | 原创音效 | `scripts/synthesize-sounds.mjs` 合成四段 44.1kHz WAV（无第三方素材） | ✅ 保留（assets + sounds-api 路由） |

## 5. 会话与工作区

| # | 功能 | 说明（rc.14 行为） | 当前状态 |
|---|---|---|---|
| 17 | 活动 cwd 追踪 | session/event + agent/created 维护 activeCwd 兜底 | ✅ `controllers/session-runtime.ts` |
| 18 | 工作区 API | `/api/dsh-hub/workspace/list`（目录优先、1000 条截断）+ `/git`（branch/短哈希/porcelain 变更） | ✅ `server/workspace-api.ts` 保留 |

## 6. 置顶会话

| # | 功能 | 说明（rc.14 行为） | 当前状态 |
|---|---|---|---|
| 19 | 会话行置顶 | hover 注入 pin 按钮；内容匹配行→会话 id（零 CSS-module hash，同名整组跳过）；置顶区 = role=tree 兄弟 + 40vh 滚动块；搜索态隐藏 | ✅ `client/pin-conversations.ts` 保留（2026-08-19 加锚点/行匹配诊断，待复测确认） |
| 20 | 置顶持久化 | `pins.json` 原子写 + localStorage 兜底；phase='ready' 写门控、boot 合并、连缺 2 次剪枝、MAX 200；PUT 串行 | ✅ `server/pins-api.ts` + 客户端状态机保留 |

## 7. 右侧栏

| # | 功能 | 说明（rc.14 行为） | 当前状态 |
|---|---|---|---|
| 21 | body portal 右侧栏 | 独立于官方详情栏；360px/56px 收起窄栏，`--mg-sidebar-width` 占位 | ✅ `client/right-sidebar.tsx` + `right-sidebar-style.ts` 保留 |
| 22 | 三页内容 | 概览（上下文 Token 环形图/会话统计/本轮 Token 差分）、文件树（懒加载）、Git（分支/变更徽章） | ✅ 保留 |

## 8. 设置卡片

| # | 功能 | 说明（rc.14 行为） | 当前状态 |
|---|---|---|---|
| 23 | DSH HUB 设置卡 | 官方设置→插件页；窗口尺寸/主题/托盘/通知/声音/多实例/皮肤/背景图；仅提交变更字段；saveSeq 防旧响应覆盖；皮肤/背景点击即应用 | ✅ `client/settings-card.tsx` + `/api/dsh-hub/config` 保留 |

## 9. 皮肤

| # | 功能 | 说明（rc.14 行为） | 当前状态 |
|---|---|---|---|
| 24 | 皮肤系统 | 5 套自绘（午夜蓝/旧纸张/终端绿/ZCode/极光紫），覆盖 `--dsw-alias-*`+`--dsw-specific-*`，浅深双色板跟随 `data-ds-dark-theme`；default 清空；boot 恢复不覆盖用户选择 | ✅ `client/skins.ts` 保留（标题栏强制模式按皮肤色板解析） |

## 10. 背景图

| # | 功能 | 说明（rc.14 行为） | 当前状态 |
|---|---|---|---|
| 25 | 背景图 | 内置「远航」boat；`/api/dsh-hub/backgrounds/*` 白名单防穿越；frame 层双层蒙层+图，三栏半透明透出；none 清空 | ✅ `client/backgrounds.ts` + `server/backgrounds-api.ts` 保留 |

## 11. 启动与多实例

| # | 功能 | 说明（rc.14 行为） | 当前状态 |
|---|---|---|---|
| 26 | 启动门控 | 仅 `DSH_HUB_LAUNCHED=1`（壳启动）装配 host+client；普通 `dsh web` 连插件都不挂载 | ✅ cordis.patch.yml `disabled` + index.ts `launchedByShortcut()` |
| 27 | 单实例 PID 锁 | `launcher.lock`（wx 原子、死 PID 接管、争用后验） | ✅ 替换为 `tauri-plugin-single-instance`（二次启动聚焦已有窗口） |
| 28 | 多实例防护 | 检测运行中 dsh web 实例（netstat+CIM 命令行匹配）；默认拒绝（无"继续"出口）；勾选后仍需 Yes 确认 | ✅ lib.rs 双通道门禁 + dialog；已加 dev 豁免（debug + 隔离 DSH_HOME 放行）。⚠️ CIM 通道失败会静默放行 |
| 29 | 崩溃自动重启 | 非 0 退出且无 quit.marker：≤3 次重启（1.2s 间隔）；0 退出/quit.marker 不重启 | ✅ supervisor 线程已接线（≤3 次 + READY 后 re-navigate；quit.marker 启动时清除） |
| 30 | 装配自愈 | 每次启动注册 web profile scoped bundle + junction 校验/重指、清理 bare 遗留；`--assemble-only` 诊断；dsh 缺失自动安装 | ⚠️ scoped 装配/junction 自愈/诊断均通；「dsh 缺失自动安装」仅 postinstall（npm 路径），运行期缺失只回退临时页 |

## 12. 安装与身份

| # | 功能 | 说明（rc.14 行为） | 当前状态 |
|---|---|---|---|
| 31 | 进程身份 | 复制 node.exe + rcedit 打补丁为 dsh-hub.exe/dsh-hub-guard.exe（任务管理器显示产品名） | ➖ 不适用：Tauri exe 原生身份（dsh-hub.exe 已由 cargo 构建，含图标/版本信息） |
| 32 | 安装脚本 | postinstall 建桌面快捷方式（VBS 隐藏控制台）；postuninstall 清理；install-local 本地打包 | ⚠️ postinstall 已简化（仅 dsh/pnpm 依赖检查，不再建 WebView2 快捷方式）；NSIS 安装器（M5）+ 快捷方式由壳 AUMID 注册生成 |
| 33 | AppUserModelID | `SetCurrentProcessExplicitAppUserModelID` 保证任务栏归属/Toast 显示 | ✅ `register_toast_aumid`（注册表 + 开始菜单/桌面快捷方式 AUMID 属性） |
| 34 | 模型嵌套菜单（PR #33） | composer 模型 seat 替换为 provider→model 两级菜单 + 独立 effort 触发器 | ✅ `src/client/model-select.tsx`：官方 slot `conversation.input.model` priority -1 阴影内置；复用官方 modelDirectories 服务；服务缺失降级内置 seat 不阻塞 |
| 35 | findings-ledger 插件（PR #38） | baseline 快照 + 变更对账 + 覆盖度报告 | ✅ `plugins/dsh-findings-ledger/`：独立插件（双轨分发见 BUILD.md §7）；turn/end 自动出报告 |
| 36 | 卸载快速通道 | 卸载器启动提速 + sidecar 强杀防残留 | ✅ installer-hooks.nsi PREUNINSTALL Get-Process（非 CIM）+ 去 Sleep；Job Object 随壳退出连带清理 sidecar |

## 13. 会话标签栏 / 交互终端 / 安全（M1-M4，2026-08-24 同步）

| # | 功能 | 说明（rc.14 行为） | 当前状态 |
|---|---|---|---|
| 37 | 会话标签栏（M2，C41） | 标题栏多页切换：状态点（等待琥珀 / 后台完成绿 / 运行蓝 + 脉冲）、右键菜单（复用 session-menu）、拖拽排序、内联重命名、自动滚动、归档自动移除 | ✅ `client/SessionTabs.tsx`（createPortal 渲染进 `#dsh-hub-titlebar .tb-title`）+ `client/session-tabs.ts`（localStorage `dsh-hub.session-tabs` 持久化）；F1-F8 修复（空快照不剪枝 / blank「新会话」占位 / 拖拽中断 blur 兜底 / IME 组合输入不误提交重命名） |
| 38 | 交互终端（M4，D 切片） | Ctrl+J 开关底部 dock；每 tab 一个真实 node-pty PowerShell 会话；多 tab；危险命令拦截（UX 护栏，非安全边界）；SSE JSON 信封 + 进程 token 鉴权 | ✅ host：`services/pty-manager.ts` + `server/terminal-pty-api.ts`（POST create/write/resize/close + GET list/stream，host+origin+token 三重守卫）+ `server/token.ts`（Bearer / `?token=`，常量时间比较）；client：`pty-store.ts` + `terminal-dock.tsx`（xterm.js 6.0.0，懒挂载 / 指针捕获拖拽 / composer 列压缩）+ `terminal-prefs.ts` + `xterm-css.ts` |
| 39 | 通知点击跳会话（M1） | toast 点击回窗口并跳到对应会话 | ✅ `src-tauri/src/services/notify.rs`：wait_for_action 点击 → unminimize/show/set_focus + `mg:shell-command` focus-session 事件（`__mgShellReady` 300ms×20 重试，与 node.rs dispatch_page_event 一致） |
| 40 | rail 数据源修复（M1，修 #35） | 时间窗真实 kind 预览：hover 按 turnTimings 时间窗 [startTime, endTime) + node.turn 对齐真实节点 kind（user/steering/context/assistant/command/compaction）提取开场文本，替换 turn-tail 死代码 | ✅ `client/conversation-rail.ts`：extractNodeText + extractTurnSummaries（命令轮次回退助手回复；空槽 tooltip 保留「第 N 段对话」） |
| 41 | S0 安全（M3） | Origin 白名单校验：POST/PUT 等状态变更请求校验 Origin（loopback / `tauri:`），缺失 Origin 拒绝；GET/HEAD 跳过（DNS-rebinding 已由 Host 校验覆盖） | ✅ `server/host-guard.ts`：`isOriginAllowed` / `rejectIfBadOrigin`，路由工厂共享（pty / workspace/open 等状态变更路由已接） |
| 42 | 工作区（M2+M4） | 壳 capability 放行 `dialog:allow-open`（M2）+ `POST /api/dsh-hub/workspace/open`（M4：文件/文件夹 OS 默认打开，Windows explorer.exe） | ✅ `src-tauri/capabilities/default.json` + `server/workspace-api.ts`（open 路由带 host+origin+token 三重守卫，路径校验同 list/git） |

---

## 配置项

### 插件 Config（`cordis.patch.yml` / schema，默认值）
`title='DeepSeek Harness Hub'` · `width/height=1280/720` · `minimizeToTray=true` · `closeToTray=false` · `theme='system'|'light'|'dark'` · `notifyOnTaskComplete=true` · `soundEnabled=true`

### ShellConfig（持久化 `$DSH_HOME/dsh-hub/config.json`）
`windowOpen='auto'` · `width/height`（钳制 [480,屏宽]/[360,屏高]） · `theme='system'` · `minimizeToTray=true` · `closeToTray=false` · `notifyOnTaskComplete=true` · `soundEnabled=true` · `allowMultipleInstances=false` · `skin='default'` · `background='none'` · `desktopIcon='default'`（5 鲸鱼娘 sad/happy/duo/maid/blue）

## 覆盖缺口（⚠️ 待收口）

### 已修复（2026-08-23 更新）
- sidecar 崩溃自动重启循环（supervisor 线程 ≤3 次 + READY 后 re-navigate）
- cmd-shim 兜底孤儿 node（resolve 硬化 + taskkill /T /F）+ **Job Object KILL_ON_JOB_CLOSE 根治 sidecar 残留**（`assign_sidecar_to_kill_job` + SyncHandle）
- 插件 fiber 拆除硬杀进程（dispose 不再调 exitProcess）
- peerDependencies 区间（^0.0.1-rc.1 → ^0.1.0-rc.6，当前 dsh 0.1.1-rc.2）
- config 写入非原子（renameSync）、settings 永久 dirty、皮肤/背景失败回滚、workspace 双 decode
- 提示音双响、closeToTray 首启默认不一致
- bridge 死代码移除 + config/pins/workspace 路由 Host 白名单
- 多实例门禁 dev 豁免（隔离 DSH_HOME）
- **图标系统模块化重构**（managers/icon.rs 6 面编排 + theme.rs 无状态化）
- **图标快速切换卡死**（worker + pending 合并，快速切换只保留最新）
- **卸载提速**（PREUNINSTALL Get-Process + Defender 排除 Add-MpPreference）
- **build:installer 完整性预检**（assertSourceCompleteness/assertLibClean）
- **NSIS 安装器闭环**（rc.3 起真机验证，当前 rc.7；卸载快速通道 rc.5-rc.7）

### 已实现（2026-08-24 · M1-M4 同步）
- 会话标签栏（M2，C41 移植 + F1-F8 修复：标题栏多页 / 状态点 / 右键菜单 / 拖拽排序 / 内联重命名 / 自动滚动 / 归档移除）
- 交互终端（M4，D 切片：node-pty PowerShell + xterm.js dock + SSE JSON 信封 + token 鉴权 + 危险命令 UX 护栏）
- notify focus-session（M1：toast 点击回窗口并跳对应会话）
- rail 数据源修复（M1，修 #35 turn-tail 死代码：时间窗真实 kind 预览）
- S0 Origin 白名单（M3：POST/PUT 状态变更校验）
- 工作区 dialog:allow-open（M2）+ POST /api/dsh-hub/workspace/open（M4）

### 已实现（2026-08-19 第十轮）
- Splash 启动画面（shell-init.js 覆盖层，覆盖 SPA 白屏）
- system 主题跟随（apply_page_theme：DWM + webview 背景 + 窗口图标随 `body[data-ds-dark-theme]`）
- 通知点击回到窗口（notify-rust 直弹 + wait_for_action）
- 窗口图标深浅翻转（icon-dark/icon-light 鲸鱼 PNG）
- 托盘命令 boot 重试（`__mgShellReady` 300ms×20 轮询）
- 窗口尺寸管理：最大化先退再套用、退出最大化恢复保存尺寸、光标所在屏 3/4（去上限）

### 仍待收口（M5）
1. **NSIS 安装器 / 卸载清理 / 自动更新**（M5 范围，本轮不打包不发布）
