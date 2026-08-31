># **`@marecgents/dsh-hub`** —— DeepSeek Harness（`dsh`）的桌面端框架：以原生 Tauri 2.x 窗口运行 dsh Web UI，提供托盘、主题同步、窗口记忆、右侧栏与系统通知。
>
> **版本状态（2026-08-30）**：**`0.1.2`**（npm `latest` / `rc` 双 tag 均为 `0.1.2`）——Tauri 2.x 壳 + dsh web 插件层，NSIS 安装器**安装即用**（安装期自动下载私有 Node + dsh + 插件到安装目录，无需系统预装 Node），首启自动进 dsh UI；卸载走快速通道并清理自有 profile 条目（保留 `.dsh` 本体与用户数据）。功能全貌见 [FUNCTIONS.md](FUNCTIONS.md)（11 大类、每项带来源与测试状态）：会话标签栏、交互终端（自定义 Shell）、对话定位条、置顶会话、右键菜单全量接管 + 双语 i18n、15 套皮肤 + 背景图 + 桌面图标六面同步、权限策略档位、四个独立插件、壳内拖放恢复、启动 Splash 皮肤配色。`0.0.2-rc.*` 与 `0.0.1-rc.14`（WebView2 壳 `dev-v1`，已冻结）为历史版本。

[![npm version](https://img.shields.io/npm/v/@marecgents/dsh-hub)](https://www.npmjs.com/package/@marecgents/dsh-hub)
[![npm rc](https://img.shields.io/npm/v/@marecgents/dsh-hub/rc)](https://www.npmjs.com/package/@marecgents/dsh-hub)
[![license](https://img.shields.io/npm/l/@marecgents/dsh-hub)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/MarecGents/deepseek-harness-hub?style=social)](https://github.com/MarecGents/deepseek-harness-hub)
[![dsh-plugin](https://img.shields.io/badge/dsh-plugin-DeepSeek%20Harness-blue)](https://github.com/topics/dsh-plugin)
[![platform](https://img.shields.io/badge/platform-Windows%20%7C%20Tauri-0078d4)]()

---

## 分支状态

| 分支 | 状态 | 说明 |
|---|---|---|
| `main` | 发布分支（**唯一合并目标**） | 已合并 dev-v2 → **`0.1.2`**（与 dev-v2 同步） |
| `dev-v1` | **永久冻结**（WebView2 时代存档） | 不再接收任何更新/同步；历史收尾 = `0.0.1-rc.13/rc.14`（WebView2 最终版） |
| `dev-v2` | **唯一开发分支**（Tauri 2.x 壳） | 所有更新在此开发，merge 只到 main；当前 = `0.1.2`（已 merge 进 main；npm latest/rc = 0.1.2） |

---

## 功能特性

- **原生桌面化**：用 Tauri 2.x 原生窗口打开 dsh Web UI，无浏览器标签页干扰。
- **品牌化 Splash（皮肤配色）**：启动覆盖层配色**跟随当前皮肤/主题**（`helpers/boot_theme.rs` 读配置注入，body/html 背景同步防导航闪白），带阶段文案（正在启动服务…/正在加载界面…）；占位页常驻到导航，dsh 页等 SPA **首绘后平滑淡出**（无白屏间隙）。
- **系统托盘**：
  - 显示主界面 / 隐藏主界面（按窗口状态动态切换）
  - 打开工作区（自动激活并前置 Explorer）
  - 新建任务（走官方 `ctx.workspaces.startSession` 流程，UI 即时刷新；SPA 未就绪时命令自动重试——`__mgShellReady` 300ms×20 轮询不丢命令）
  - 退出（写 `quit.marker` 后干净退出，避免误判崩溃重启）
- **窗口状态记忆与尺寸管理**：最大化状态、分辨率、主题等持久化到 `$DSH_HOME/dsh-hub/config.json`；套用保存尺寸前若处于最大化先退最大化、退出时恢复保存尺寸；无保存尺寸时默认**光标所在屏 3/4**（multi-monitor aware，无上限，下限 480×360）。
- **主题跟随（system）**：MutationObserver 事件驱动，`apply_page_theme` 命令让标题栏深浅色、webview 背景与**窗口图标（icon-dark / icon-light 翻转）**实时跟随 dsh 页面主题（Tauri 壳 Rust Dwm 实现）。
- **桌面图标（S6，PR #25 + 08-23 重构）**：设置卡可选 5 张鲸鱼娘图标（sad/happy/duo/maid/blue）或默认主题翻转鲸鱼；切换即时生效于**任务栏按钮（WM_SETICON ICON_BIG，PostMessageW 异步）+ 标题栏/Alt-Tab（ICON_SMALL）+ 托盘 + 开始菜单快捷方式 + 桌面快捷方式的 .lnk IconLocation 与 AUMID IconUri **统一指向 `icons\current.ico` 固定锚点**（rc.18：切换图标即重写锚点文件 + 通知 Explorer——**快捷方式移到任意文件夹图标仍跟随**，任务栏缓存经逐-lnk 通知 + ie4uinit 刷新） + 自绘标题栏图标（与任务栏/托盘同源真实 PNG `/api/dsh-hub/icons/*.png`）**——六面统一编排（`managers/icon.rs` IconManager：面级幂等 + 全局串行锁 + 单 worker/pending 合并，快速连续切换不卡死）；持久化于 `config.json` 的 `desktopIcon`；`.ico` 多尺寸资产由 `scripts/generate-desktop-icons.py` 生成并随 resources 打包到 `$INSTDIR\icons\`。
- **模型选择（composer 嵌套菜单，PR #33）**：composer 模型 seat 替换为「provider → model」两级嵌套菜单 + 独立 thinking-effort 触发器——官方 `conversation.input.model` slot priority −1 遮蔽内置（复用官方 `modelDirectories` 服务，与 /model 命令状态一致；服务缺失自动降级内置 seat，不阻塞）。
- **会话标签栏（M2）**：标题栏内浏览器式会话多页标签（`SessionTabs.tsx` createPortal 渲染进 `#dsh-hub-titlebar .tb-title`）——点击切换、`+` 新建、`×` 关闭；**固定宽度 180px + 多标签弹性压缩**（浏览器式，溢出隐藏不滚动）；标签文字**居中、关闭 × 贴最右**、字号 13；**状态点**（等待琥珀 / 后台完成绿 / 运行蓝 + 脉冲动画）；右键菜单复用 `session-menu`（分叉/归档/复制路径/资源管理器）+ **内联重命名**（IME 组合输入不误提交）；**拖拽排序**（`session-tabs.ts` localStorage `dsh-hub:session-tabs` 持久化）；激活标签自动滚动入视；归档/删除会话自动移除标签（空快照不剪枝门控 + blank「新会话」占位）。
- **交互终端（M4）**：底部 dock 真实交互终端（xterm.js 6.0.0 + node-pty）——`Ctrl+J` 开关；每 tab 一个独立会话（cwd = 打开时所在工作区）；**自定义 Shell（2026-08-26）**：默认终端可选 **PowerShell 5.1 / PowerShell 7 (pwsh) / 命令提示符 (cmd) / Bash (Git Bash / WSL)**——宿主先探测可用性（进程 PATH + 机器 PATH 扫描，**未安装的不列出**），设置面板仅显示已检测到的 shell，选择持久化（`terminal-prefs`），`ptyRetarget` 按 shell 语法重定向（PS `Set-Location` / cmd `cd /d` / bash `cd`）；多 tab + 懒挂载（切换重放 ring buffer）；**危险命令拦截**（`rm` / `Remove-Item` / `format` 等 UX 护栏，非安全边界）；输出走 SSE **JSON 信封**（`data: JSON.stringify(chunk)` + 15s 心跳）+ **进程级 token 鉴权**（`Authorization: Bearer` / EventSource `?token=`；token 经 `webserver/index-inject` 以 global `__DSH_HUB_TOKEN__` 注入页面，见 `src/index.ts`）；关闭 `taskkill /T /F` 杀整棵进程树防残留。（host：`src/services/pty-manager.ts`（`detectShells` + `createPty(shell)`）+ `src/server/terminal-pty-api.ts`（含 `GET /pty/shells`）+ `src/server/token.ts`；client：`pty-store.ts` / `terminal-dock.tsx` / `terminal-prefs.ts` / `xterm-css.ts`）
- **S0 安全（M3）**：**Origin 白名单校验**——POST/PUT 等状态变更请求校验 `Origin`（loopback / `tauri:`），缺失 Origin 拒绝；GET/HEAD 跳过（DNS-rebinding 已由 Host 校验覆盖）（`server/host-guard.ts`，路由工厂共享）。
- **工作区打开（M4）**：`POST /api/dsh-hub/workspace/open` 用 OS 默认方式打开文件/文件夹（host+origin+token 三重守卫，Windows `explorer.exe`）；壳 capability 放行 `dialog:allow-open`（M2，`src-tauri/capabilities/default.json`）。
- **findings-ledger 插件（PR #38）**：独立 dsh 插件（`plugins/dsh-findings-ledger/`）——baseline 快照 + 变更对账 + 覆盖度报告。
- **permission-guard 插件（PR #37）**：独立 dsh 插件（`plugins/dsh-permission-guard/`）——逐命令权限白名单 + 四级能力拦截（auto / give-command / confirm / never）。
- **project-memory 插件（PR #36）**：独立 dsh 插件（`plugins/dsh-project-memory/`）——每项目持久记忆（FACT.md + JOURNAL.jsonl，自动注入 systemPrompt.context + `memory_read`/`memory_log`/`memory_fact` 工具）。
- **usage-stats 插件（PR #34）**：独立 dsh 插件（`plugins/dsh-usage-stats/`）——全会话 token 用量统计（按 provider/model 聚合 + 设置页可视化：汇总/各模型卡片/按天表格/趋势图/单价费用估算 + HTTP API；0.1.0 修复读取 500 与表格透背景图两处缺陷）；provider 名与服务端文案均双语（zh/en，跟随 dsh 语言设置，独立加载插件同样生效）。
  以上 4 个独立插件**双轨分发**（随 hub resources + 独立 npm 轨，package.json 均已 `private:false` 就绪），见 [BUILD.md §7](BUILD.md) 与 AGENTS.md §1.1。
- **设置卡片**：dsh 设置 → 插件页提供桌面壳配置（窗口尺寸 / 主题 / 托盘行为 / 会话完成通知 / 提示音 / 多实例开关 / 界面皮肤 / 背景图 / 桌面图标）。**皮肤 15 套**：内置 5（午夜蓝/旧纸张/终端绿/ZCode/极光紫）+ **Reasonix 官方 8**（rx-*，黑金/绯红地平线/青蓝舞台/熔炉金红/玫瑰晨光/鼠尾草微风/火花笔记/紫罗兰星光）+ **opencode 2**（oc-* 经典/石墨）——由**统一推导规则生成器**产出（1:1 直映射 + 定向混合 + dimmed 夹取 ≥3.5:1），每套浅/深 × 33 token + `docs/skins/*.md` 文档；选择器为官方 Setting-Cell + Menu（菜单项与 pill 带皮肤浅|深色块预览），皮肤名/描述走词典、随 dsh 语言切换。
- **i18n（全量双语）**：hub 全部界面文案（设置卡/会话菜单/工作区菜单/皮肤名/空白右键菜单等）与 **usage-stats 插件**文案均收进 zh/en 词典（`src/client/locale.ts`；usage-stats 独立插件自带词典），语言源 = dsh 设置（General → Language）——官方 locale 插件写入的 `<html lang>`，切换即全量刷新。
- **右键菜单语义**：WebView2 原生右键菜单已在 Rust 侧禁用（`SetAreDefaultContextMenusEnabled(false)`）；右键全部由 DOM 接管——**对象行（会话/工作区）→ 各自专属菜单**（会话全功能菜单 / 工作区：新建任务、打开工作区），**空白处（含左栏空态）→ 刷新菜单**，输入框等文本编辑要素不干预。
- **壳内拖放恢复（0.1.0）**：关闭 Tauri 对 WebView2 拖放的文件专用覆盖——列表行拖拽排序（工作区/会话）、标签拖拽在壳内恢复浏览器同款行为；拖文件到输入区 = 官方附件上传，其他区域安全忽略（杜绝 file:// 导航）；拖拽状态 watchdog 兜底。
- **权限策略档位（rc.14）**：`dsh-permission-guard` 的 policy 三档（follow 跟随会话官方预设 / strict 白名单 / read-only），设置页与会话左下角 chip 双入口切换。
- **性能（rc.15）**：会话后台预热（长会话冷开 ~2s → ~0.2s）+ 聊天流 `content-visibility`（长历史滚动不卡顿）。
- **多实例保护**：启动时检测已有 dsh 实例（任意端口），默认拒绝共存以防会话数据损坏；确需共存可在设置中显式开启（附危险警告）。
- **右侧栏**：概览（Token 统计）、文件树、Git 变更三页；收起后保留窄栏快捷按钮。
- **对话定位条（rail）**：中栏左缘竖排小横条 minimap（每段对话一条，点击跳转；位置按段序近似，数据源官方 ConversationSnapshot turnTimings，只读）。**时间窗真实 kind 预览（修 #35）**：hover 预览按 turnTimings 时间窗 [startTime, endTime) + node.turn 对齐真实节点 kind（user/steering/context/assistant/command/compaction）提取开场文本，替换原 turn-tail 死代码（命令轮次回退助手回复）。**自适应配色**：采样 rail 下方的实际背景（皮肤表面色 × 背景图 cover 数学混合），按采样色相派生 tick 深/浅色调（WCAG 对比度择优，≥7:1）与激活态强调色——每套皮肤/背景图得到自己的 rail 色板，非固定两色；tick 附 1px 对比描边兜底。
- **置顶会话**：会话行 hover 置顶（同名会话安全跳过、不误标）；置顶区常驻列表顶部（可独立滚动）；持久化于 `$DSH_HOME/dsh-hub/pins.json`（localStorage 兜底）。注：多标签/多实例下 pins 为整体替换语义（最后写者胜）；同标签内 PUT 依赖 fetch 顺序保序。
- **会话完成通知 + 事件提示音**：
  - **提示音**（独立开关）：用户提交问题（开始音）、任务正常完成（完成音）、AI 请求批准（需要你）、任务出错（出错音）——**四段原创合成音效**（`scripts/synthesize-sounds.mjs` 生成，无第三方素材），窗口隐藏到托盘时依然可闻。
  - **Toast**：任务完成/出错时弹 Windows 原生通知（notify-rust 直弹，`wait_for_action` 点击回窗），30s 冷却。**点击跳会话**：点击 toast 回窗口并跳到对应会话（`mg:shell-command` focus-session 事件 + `__mgShellReady` 300ms×20 重试）。**聚焦会话策略**：正在查看的会话完成时只响提示音不弹 Toast（结果就在眼前）；后台会话完成或窗口隐藏时仍弹 Toast。
- **独立进程身份**：桌面壳为单一 Tauri 原生应用（`cargo tauri build` NSIS 安装），任务管理器显示 DeepSeek Harness Hub 图标与名称；WebView2 时代 `dsh-hub.exe` / `dsh-hub-guard.exe`（node.exe 复制 + rcedit 打补丁）机制已删除。
- **启动门控**：仅当通过本项目启动时注入桌面壳与插件页面；普通 `dsh web` 完全不受影响。

## 安装与使用

### 方式一：安装发布版（推荐，dev-v2 Tauri-only）

桌面壳为 **Tauri 原生应用**，安装 = 运行 **NSIS 安装器**（`build/<version>/DeepSeek Harness Hub_<version>_x64-setup.exe`，或按 [BUILD.md](BUILD.md) 自编译）：

- **安装即用（M5 闭环）**：安装期自动联网下载**私有 Node**（多源测速选最快）并安装 `@deepseek-ai/dsh` + `@marecgents/dsh-hub` + `pnpm` 到 `<安装目录>\dsh-hub-win\`（私有环境，不污染系统）——**无需系统预装 Node**。进度见安装器详情页 + `<安装目录>\dsh-hub-bootstrap.log`。
- **首启**：窗口显示「启动中」占位页 → 后台启动私有 dsh web → READY 后自动导航进 dsh UI（**不弹浏览器**）。
- **卸载清理（rc.9 第五次打包修复）**：卸载时 PREUNINSTALL 先执行随包安装的 `_up_\scripts\uninstall-cleanup.ps1`（此时安装目录尚在），从 `$DSH_HOME/profiles/*` 的 `dsh.profile.bundles` 过滤 dsh-hub 与 `@dsh-external/*` 插件、删除对应 junction（只删链接点不递归目标、悬空可删）并清除空 `@dsh-external` 目录，JSON **无 BOM** 回写；旧安装（无此脚本）由 POSTUNINSTALL 单行兜底做等价清理。**只清 dsh-hub 自有条目，`.dsh` 本体及用户数据绝不删**——修复根因：dsh 对无法解析的 bundle 直接抛错，卸载残留（bundles@dsh-external + 指向已删安装目录的悬空 junction）会导致裸 `dsh web` 启动即崩、重装卡在「启动中」无法完成 Init。
- 插件层 npm 包 `@marecgents/dsh-hub` 仍随 dsh 生态发布（见「发布」），postinstall 仅做 `dsh` / `pnpm` 依赖检查。
- **WebView2 时代已移除**：`npm i -g` launcher 安装链路、`koffi` 原生依赖、postinstall 创建的桌面快捷方式与 `dsh-hub` 命令 shim。

### 方式二：手动 / 从源码安装

```sh
git clone https://github.com/MarecGents/deepseek-harness-hub.git
cd deepseek-harness-hub
npm install
npm run build
npm run build:client
```

开发模式启动（dev-v2 Tauri-only）：

```sh
npm run tauri:dev          # = cargo tauri dev：Rust 壳 + dsh web sidecar 本地联动
```

> 测试用**隔离 DSH_HOME**（如 `DSH_HOME=<临时目录>`）验证，避免污染正式运行数据；dev 实例可与已运行的 3080 端口 dsh web 并存。
> 依赖 dsh 的 Web 端（`dsh web`）已可用。本项目作为 dsh 插件通过 `cordis.patch.yml` 挂载，不修改 dsh 源码。

### 方式三：构建本地安装器（自编译，等同发布安装）

从源码构建 **NSIS 安装器**——产物与发布安装器一致。**推荐一键打包**（自动检测工具链位置，位置无关，见 [BUILD.md](BUILD.md)）：

```sh
npm run build:installer    # 一键打包：检测 Node/npm/cargo/rustup → MSVC(vswhere→vcvars64.bat) 或 GNU(gcc) → 完整性预检（源/资源/资产/通配目录）→ build → build:client → host 依赖守卫 → lib 零漂移 → tauri:build → 复制到 build/<version>/ + SHA256 校验
npm run tauri:build        # 仅打包（需 vcvars/MSVC 环境或 GNU 配置，见 BUILD.md）
# 运行安装器 → 安装「DeepSeek Harness Hub」→ 启动
```

> **一键脚本自动防漏**（详见 [BUILD.md](BUILD.md) §5.3）：版本一致性（package.json == tauri.conf.json）、
> 完整性预检（关键源/资源/资产存在 + resources 通配目录非空——`icons/*.ico` 空通配会静默少文件）、
> host 依赖打包守卫（lib 外部 import 必须已在 resources 闭包）、lib 零漂移、产物 SHA256 校验。

> **前置依赖**（详见 [BUILD.md](BUILD.md)）：Node ≥24、rustup（`rust-toolchain.toml` 自动管 MSVC）、**VS Build Tools** 或 MinGW-w64 gcc；NSIS 与 WebView2 由 tauri CLI / embedBootstrapper 自动处理。
> 旧的 `npm run install:local`（`scripts/install-local.mjs`：npm pack → 全局包 + 快捷方式）已随 WebView2 壳删除。

### Tauri 2.x 壳开发（M1+，dev-v2）

Tauri 壳层（Rust）在 `src-tauri/` 下开发，流程与阶段指标见《迁移项目执行SOP》（外部档案仓库 `../docs/process/`）：

```sh
npm run tauri:dev        # dev 模式：起临时页 + Rust 壳窗口（M1 起）
npm run tauri:build      # 构建安装包（M5 起全量）
npm run m1:check         # M1 字段核对断言（tauri.conf/lib.rs，10 项）
npm run m1:ipc-smoke     # M1 本地窗口 IPC 冒烟断言（需 tauri dev 已运行）
```

- 前置：Rust 工具链（`rust-toolchain.toml` 已固定 stable MSVC，clone 后 rustup 自动安装 target，**无需手动指定工具链**）+ `@tauri-apps/cli`（已入 devDependencies）：
  - **MSVC（默认，可复现构建）**：装 **Visual Studio Build Tools**（含「使用 C++ 的桌面开发」工作负载，即 MSVC 工具集 + Windows SDK），cargo 经 vswhere 自动定位 `link.exe`，无需任何环境变量。构建：`npm run tauri:build`。
  - **GNU（备选）**：`rustup toolchain install stable-x86_64-pc-windows-gnu` + MinGW-w64 gcc，并需 `src-tauri/.cargo/config.toml` 的 `--exclude-all-symbols`（修复 mingw ld `export ordinal too large`，tauri-apps/tauri#10843）。注意 GNU 下 `WebView2Loader.dll` 为动态链接（见踩坑 #49），非标准路径不推荐。
- dev 模式临时页由 `scripts/dev-shell-page.mjs` 伺服（`http://127.0.0.1:17891`，即 `tauri.conf.json` 的 devUrl/beforeDevCommand）；**devUrl 未改指 dsh web 端口**——实际窗口在 sidecar READY 验证后以 `WebviewUrl::External` 导航到 dsh web 端口（`--port 0` 随机）
- 插件层（`src/client/*`、config/workspace API）全程零改动，壳层重写为 Rust

### 验证门控

```sh
dsh web
```

普通 CLI 启动不会加载桌面壳：无窗口、无托盘、无插件注入。

## 技术架构

### 双 half 模型

```
┌──────────────────────────────────────────────────────────┐
│ Tauri 壳（Rust，src-tauri/src/）                          │
│   lib.rs：窗口 / 托盘 / 通知 / 主题 / 单实例 / 多实例门禁    │
│   managers/node.rs：装配 profile + spawn dsh web           │
│   bin/dsh-web-sidecar.mjs：装配/入口解析辅助（M5 预留）     │
└───────────────┬──────────────────────────────────────────┘
                │ 双向管道：stdin MG_TRAY / stdout DSH_CMD
┌───────────────▼──────────────────────────────────────────┐
│ dsh web（Cordis 插件树）                                   │
│  ┌────────────────────────────────────────────────────┐  │
│  │ dsh-hub（host half，Node）                          │  │
│  │ src/index.ts ── managers/tauri-shell.ts            │  │
│  │             ── server/*（/api/dsh-hub/*）          │  │
│  └────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────┐  │
│  │ dsh Web UI（SPA）+ dsh-hub（client half）           │  │
│  │ src/client/*                                        │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

- **host half**（dsh 进程内，Node）：`src/index.ts` + `src/controllers/*` + `src/services/*` + `src/server/*` + `src/managers/tauri-shell.ts`（SPT 分层）。
- **client half**（浏览器内）：`src/client/*`，由 dsh 的 client-modules 自动编入 `__DSH_BOOT__`。

### 通信通道

| 通道 | 用途 |
| --- | --- |
| HTTP 路由 | 配置 `/api/dsh-hub/config`、工作区 `/api/dsh-hub/workspace/*`（含 open）、终端 PTY `/api/dsh-hub/pty/*`（含 SSE stream） |
| 双向管道（stdin/stdout JSON） | 壳 ↔ host：stdin `MG_TRAY`（壳→host）、stdout `DSH_CMD`（host→壳）；托盘命令、主题、窗口、退出 |
| 事件桥 | `session/event` → 会话完成通知 |

### 关键机制

- **启动链路**：Tauri 壳（`lib.rs`）→ 多实例检测（netstat + CIM，默认拒共存）→ Node sidecar 管理（`managers/node.rs`：调 `scripts/assemble-profile.mjs` 装配 web profile + spawn `dsh web --port 0`，`DSH_HUB_LAUNCHED=1` 门控；`bin/dsh-web-sidecar.mjs` 为独立装配/入口解析辅助，M5 externalBin 预留）→ READY 验证 → 建窗（`WebviewUrl::External`）加载 dsh Web UI。
- **主题跟随**：`body[data-ds-dark-theme]` 变化 → MutationObserver → `DSH_CMD` → Tauri 壳应用标题栏主题（Rust Dwm）。
- **托盘命令**：Rust 托盘（`tray.rs`）→ stdin `MG_TRAY` → host `core/registry.ts` 分发 → stdout `DSH_CMD` 回执。
- **退出语义**：托盘"退出"写 `quit.marker` → 干净退出（`quit.rs`）；不触发崩溃重启误判。
- **关闭到托盘**：Tauri close-requested 拦截（`window.rs`），按 `closeToTray` 配置隐藏保活。

## 目录结构

```
dsh-hub/
├── package.json            # dsh.bundle.patch + dsh.client + scripts（npm bin 字段已清空，launcher 家族已删）
├── cordis.patch.yml        # 插件行（启动来源门控）
├── tsconfig.json
├── tsdown.config.ts        # client bundle 构建配置
├── bin/
│   └── dsh-web-sidecar.mjs # 独立 sidecar 辅助（profile 装配 + node/dsh 入口解析；M5 externalBin 预留）
├── scripts/
│   ├── assemble-profile.mjs # 运行 profile 装配（scoped bundle + junction 自愈）
│   ├── dev-shell-page.mjs   # dev 模式临时页伺服（127.0.0.1:17891）
│   ├── build-client.mjs     # client 构建 + SDK junction
│   ├── build-installer.mjs  # 一键打包（工具链检测 + 完整性预检 + tauri:build + 产物校验）
│   ├── postinstall.mjs      # 检测 dsh/pnpm（不再建快捷方式）
│   ├── postuninstall.mjs    # 依赖检查清理
│   ├── dsh-deps-install.ps1 # 安装期引导（私有 Node/dsh/插件下载 + Defender 排除）
│   ├── uninstall-cleanup.ps1 # 卸载期 profile 清理（bundles 过滤 hub+@dsh-external/* + junction 删除，无 BOM 回写，保留 .dsh）
│   ├── synthesize-sounds.mjs # 四段提示音合成
│   ├── export-skin-colors.mjs # 皮肤色表导出（→ src-tauri/src/skin-colors.json，启动 Splash 配色）
│   ├── check-tauri-conf.mjs  # M1 字段核对断言
│   ├── ipc-smoke.mjs         # M1 窗口 IPC 冒烟
│   ├── verify-release.mjs    # 发布门禁（P1-P5）
│   ├── verify-m4-multi-instance.mjs # M4 多实例门禁断言
│   ├── generate-titlebar-icons.mjs  # 标题栏/窗口主题图标生成（icon-dark/light）
│   └── generate-desktop-icons.py    # 桌面图标 .ico 多尺寸生成（whale-girl*/whale）
├── assets/                 # dsh favicon（SVG）+ backgrounds/（背景图）+ sounds/（提示音）
├── plugins/                # 独立 dsh 插件（双轨分发：独立 npm + 随 hub，见 BUILD.md §7）
│   ├── dsh-findings-ledger/ # findings-ledger（PR #38）
│   ├── dsh-permission-guard/ # permission-guard（PR #37）
│   ├── dsh-project-memory/  # project-memory（PR #36）
│   └── dsh-usage-stats/     # usage-stats（PR #34）
├── src-tauri/              # Tauri 2.x 壳（Rust，lib.rs 入口 + NSIS 打包）
│   └── nsis/installer-hooks.nsi # NSIS 钩子（PREUNINSTALL 快速通道/Job Object 协同）
├── src/
│   ├── index.ts            # host 插件入口（Controller 装配）
│   ├── core/              # 命令注册表 / 生命周期（registry）
│   ├── controllers/       # 业务编排（session-runtime / tray-pipe / shell-runtime）
│   ├── services/           # 领域服务（config-store / pty-manager 终端会话）
│   ├── server/             # HTTP 路由工厂（/api/dsh-hub/*：config/workspace/pins/pty/backgrounds/sounds/icons/session-paths）
│   ├── managers/           # 壳 Manager（tauri-shell）
│   ├── helpers/            # 无状态工具（state-store）
│   ├── models/             # 共享类型/常量（pipe / shell-config / plugin-config / sound）
│   ├── utils/              # 纯函数（管道帧解析）
│   └── client/             # client half（设置卡片 + 右侧栏 + 模型嵌套菜单 + 会话标签栏 + 交互终端）
├── docs/
│   ├── 关键踩坑记录.md      # 踩坑索引
│   └── skins/              # 皮肤风格 harness（AGENTS.md + 各皮肤文档）
└── lib/                    # 构建产物
```

## 自编译

```sh
# 编译 host（tsc）
npm run build

# 构建 client bundle（tsdown，自动建立 SDK junction）
npm run build:client
```

> ⚠️ 执行 `npm i` 新依赖会清掉 `build-client` 建立的 SDK junction（`@deepseek-ai/dsh-*`），装完必须重新运行 `npm run build:client`。

## 依赖

| 类型 | 主要依赖 |
| --- | --- |
| runtime | `clsx`、`@deepseek-ai/schemastery`（WebView2 时代 `@webviewjs/webview`、`koffi` 已移除） |
| peer | `@deepseek-ai/cordis`、dsh host/client 相关包、`react`、`react-dom` |
| dev | `typescript`、`tsdown`、`@tauri-apps/cli`（Tauri 壳）、`@deepseek-ai/dsh-*` 系列、`react` / `react-dom` 类型 |

完整依赖见 [`package.json`](package.json)。

## 技术路线

- **当前壳层（dev-v2）**：**Tauri 2.x**（Rust）——WebView2 时代 `@webviewjs/webview` + koffi FFI 壳已删除，Tauri 为唯一壳模式；Windows 发布 = `cargo tauri build` 的 NSIS 安装器（M5）。
- **目标壳层**：自定义壳层 UI（`decorations: false` 自定义标题栏）、Linux / Windows / macOS 多端一致、包体 ~10MB、官方插件生态（tray / notification / window-state / single-instance / updater）。
- **正式版**：`0.1.0` 已发布（2026-08-30，Tauri 2.x + dev-v2 全部功能；tag `v0.1.0`）。
- **dsh 生态适配**：壳层与内容解耦（dsh Web UI 为独立 SPA），Tauri 壳仅负责窗口/托盘/通知/系统集成；client half（React）与 dsh 插件代码零改动。
- 详细决策见外部档案 `../docs/dsh桌面端技术路线-2026-08-16.md`。

## 发布

```sh
# scoped 包：发布必须 --access public + 官方 registry
npm publish --access public --registry=https://registry.npmjs.org/

# 发布候选版（rc 标签，不影响 latest）
npm publish --access public --tag rc --registry=https://registry.npmjs.org/
```

> **独立插件（`plugins/<name>`）走双轨**：独立 npm 发布 + 随 hub NSIS 分发（resources + assemble-profile + cordis.patch.yml），见 [BUILD.md §7](BUILD.md) 与 AGENTS.md §1.1 铁律 8。壳单一功能不发 npm（随 hub 编译）。

## 致谢

- [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) —— 一切皆插件的 DSH 生态。
- [dsh-web-ui](https://github.com/zhu1090093659/dsh-web-ui) —— 插件/皮肤集合与右侧栏参考。
- [DSH-better-sidebar](https://github.com/omdsh-dev/DSH-better-sidebar) —— body portal 右侧栏与工作台参考。
- [awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin) —— dsh 插件精选列表与生态索引。
- [DeepSeek Harness Desktop](https://github.com/anywhere-labs/deepseek-harness-desktop) —— 同生态桌面化项目参考。

## 文档

- [开发约束（AGENTS.md，开发前必读）](AGENTS.md) —— 全部开发 harness 总纲 + 分层子 harness 索引
- [调试与修复技术路线手册](docs/调试与修复技术路线手册.md) —— 会话 zstd 修复 / 崩溃定位 / 插件契约 / 验证矩阵（反复出现问题的调查路线，避免重新调研）
- [关键踩坑记录（勿重蹈）](docs/关键踩坑记录.md)
