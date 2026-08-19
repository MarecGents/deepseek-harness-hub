# dsh-hub 功能清单（FUNCTIONS）

> 基线：`main` 分支 `v0.0.1-rc.14`（WebView2 时代最终版）。
> 更新：2026-08-19 · 当前开发分支 `dev-v2`（Tauri 2.x 壳 + dsh web 插件层）。
> 状态标记：✅ 已覆盖（Tauri 壳或插件层等价实现）· ⚠️ 部分/待补（M4/M5 收口项）· ➖ 不适用（被 Tauri 原生能力替代）。
> 依据：`git show main:<path>` 源码 + `docs/` 发布记录（rc10–rc14）。

---

## 1. 桌面壳 / 窗口管理

| # | 功能 | 说明（rc.14 行为） | 当前状态 |
|---|---|---|---|
| 1 | 原生窗口承载 dsh SPA | webserver ACTIVE 即开窗（早于 Loader 全量就绪），`--port 0` 随机端口 | ✅ Tauri 无边框窗口 + `WebviewUrl::External`（lib.rs），READY 先验证再导航 |
| 2 | 品牌化 Splash | 300ms 主题色 + dsh logo + spinner 覆盖到 SPA 首绘，无白/黑闪 | ⚠️ 未实现（Tauri 直接导航；T4.4 官方双窗 splash 待 M4 收口） |
| 3 | 窗口状态记忆 | 仅持久化 maximized（`dsh-hub-window-state.json`）；退出最大化恢复保存尺寸或 3/4 屏；最小 480×360 | ✅ `helpers/state.rs`（restore_window_state / resize 保存） |
| 4 | 默认尺寸策略 | 无保存尺寸 = 启动屏 3/4（光标所在屏，multi-monitor aware）；恰好默认值 1280×720 不算用户显式保存 | ✅ `managers/window.rs`（primary_monitor 3/4，上限 1600×1000） |
| 5 | 关闭/最小化到托盘 | closeToTray=true 关窗保进程+托盘；minimizeToTray 最小化即隐藏；行为实时读配置 | ✅ lib.rs `CloseRequested`（prevent_close+hide）/ `Resized+is_minimized` 检测 |
| 6 | 设置实时应用 | 主题/尺寸保存后即时 applyTheme/applySize；最大化时保存尺寸先退最大化再套用 | ✅ DSH_CMD `set_window_theme`/`set_window_size` 上行 → Rust 执行 |

## 2. 主题与外观

| # | 功能 | 说明（rc.14 行为） | 当前状态 |
|---|---|---|---|
| 7 | 标题栏主题跟随 | 'system' 监听页面 `data-ds-dark-theme`；DWM immersive dark；同步 webview 背景防帧错位 | ✅ `helpers/theme.rs`（DWM attr 20/34/35）+ shell-init.js 皮肤 token 同向配色 |
| 8 | 标题栏浅/深强制模式 | 主题选项「浅色/深色」强制 chrome 色；跟随 dsh 走 token | ✅ 增强：按当前皮肤浅/深色板解析（`#mg-dsh-skin` 样式表），皮肤切换自动重读；回退黑白 |
| 9 | 双轨图标 | 标题栏图标随页面主题（深白鲸/浅黑鲸）；任务栏图标随 OS 主题；托盘图标按 OS 主题 | ⚠️ 托盘图标 ✅（32x32.png）；窗口/任务栏用 exe 内嵌图标，未做深浅翻转（M4 收口可选） |

## 3. 托盘

| # | 功能 | 说明（rc.14 行为） | 当前状态 |
|---|---|---|---|
| 10 | 常驻系统托盘 | 菜单：显示/隐藏主界面（动态标签）、打开工作区、新建会话、退出 | ✅ `managers/tray.rs` 原生菜单 + 左键单击显示 + `sync_toggle_label` 动态标签 |
| 11 | 打开工作区 | 打开**当前聚焦会话**所在工作区目录 | ✅ 修复（2026-08-19）：改走 client 聚焦会话解析 → `open_workspace_path` |
| 12 | 新建会话 | 派发页面事件 → 官方 `workspaces.startSession()`（当前会话→最近工作区）；SPA 未就绪重试不丢命令 | ✅ stdin 管道 → host → `dispatch_page_event` → client `startSession` |
| 13 | 托盘退出 | 写 `quit.marker` 后正常退出，不误判崩溃重启 | ✅ `helpers/quit.rs` + `tray_quit` 命令 |

## 4. 通知与声音

| # | 功能 | 说明（rc.14 行为） | 当前状态 |
|---|---|---|---|
| 14 | 任务完成 Toast | depth-0 会话 turn/end completed\|error 弹原生通知，点击恢复窗口；30s 冷却；聚焦会话只响音不弹 | ✅ `services/notify.rs`（NotificationExt + AUMID 注册 + 快捷方式）+ tauri-shell.ts 冷却/聚焦抑制 |
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
| 28 | 多实例防护 | 检测运行中 dsh web 实例（netstat+CIM 命令行匹配）；默认拒绝（无"继续"出口）；勾选后仍需 Yes 确认 | ✅ lib.rs `detect_running_dsh_instances` + dialog 门禁（2026-08-19 接线） |
| 29 | 崩溃自动重启 | 非 0 退出且无 quit.marker：≤3 次重启（1.2s 间隔）；0 退出/quit.marker 不重启 | ⚠️ quit.marker 语义 ✅（quit.rs/node.rs）；sidecar 重启循环未接线（M4 收口） |
| 30 | 装配自愈 | 每次启动注册 web profile scoped bundle + junction 校验/重指、清理 bare 遗留；`--assemble-only` 诊断；dsh 缺失自动安装 | ✅ `scripts/assemble-profile.mjs` + node.rs `assemble_profile()` + 壳 `--assemble-only`/`--smoke` |

## 12. 安装与身份

| # | 功能 | 说明（rc.14 行为） | 当前状态 |
|---|---|---|---|
| 31 | 进程身份 | 复制 node.exe + rcedit 打补丁为 dsh-hub.exe/dsh-hub-guard.exe（任务管理器显示产品名） | ➖ 不适用：Tauri exe 原生身份（dsh-hub.exe 已由 cargo 构建，含图标/版本信息） |
| 32 | 安装脚本 | postinstall 建桌面快捷方式（VBS 隐藏控制台）；postuninstall 清理；install-local 本地打包 | ⚠️ postinstall 已简化（仅 dsh/pnpm 依赖检查，不再建 WebView2 快捷方式）；NSIS 安装器（M5）+ 快捷方式由壳 AUMID 注册生成 |
| 33 | AppUserModelID | `SetCurrentProcessExplicitAppUserModelID` 保证任务栏归属/Toast 显示 | ✅ `register_toast_aumid`（注册表 + 开始菜单/桌面快捷方式 AUMID 属性） |

---

## 配置项

### 插件 Config（`cordis.patch.yml` / schema，默认值）
`title='DeepSeek Harness Hub'` · `width/height=1280/720` · `minimizeToTray=true` · `closeToTray=false` · `theme='system'|'light'|'dark'` · `notifyOnTaskComplete=true` · `soundEnabled=true`

### ShellConfig（持久化 `$DSH_HOME/dsh-hub/config.json`）
`windowOpen='auto'` · `width/height`（钳制 [480,屏宽]/[360,屏高]） · `theme='system'` · `minimizeToTray=true` · `closeToTray=false` · `notifyOnTaskComplete=true` · `soundEnabled=true` · `allowMultipleInstances=false` · `skin='default'` · `background='none'`

## 覆盖缺口（⚠️ 待 M4/M5 收口）

1. **Splash 启动画面**（T4.4 官方双窗方案未落地）
2. **sidecar 崩溃自动重启循环**（≤3 次；quit.marker 语义已就绪）
3. **NSIS 安装器 / 卸载清理 / 自动更新**（M5 范围）
4. **窗口/任务栏图标深浅翻转**（可选增强）
