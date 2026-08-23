# dsh-hub

> **`@marecgents/dsh-hub`** —— DeepSeek Harness（`dsh`）的桌面端框架：以原生 Tauri 2.x 窗口运行 dsh Web UI，提供托盘、主题同步、窗口记忆、右侧栏与系统通知。
>
> **版本状态（2026-08-23）**：`dev-v2`（Tauri 2.x 壳）M5 打包闭环已真机验证（rc.3 起），当前 **`0.0.2-rc.7`**——NSIS 安装器**安装即用**（安装期自动下载私有 Node + dsh + 插件到安装目录，无需系统预装 Node），首启自动进 dsh UI；卸载走**快速通道**（PREUNINSTALL Get-Process + Defender 排除提速）。`0.0.1-rc.14` 是 WebView2 壳最终 rc（`dev-v1` 分支已冻结）。正式版将在体验达标后发布（多端支持 / 自定义壳 UI，见 [外部档案 docs/dsh桌面端技术路线-2026-08-16.md](../docs/dsh桌面端技术路线-2026-08-16.md)）。

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
| `main` | 发布分支（**唯一合并目标**） | 当前 = `0.0.2-rc.7`（Tauri 版当前 rc；rc.4–rc.7 已发布） |
| `dev-v1` | **永久冻结**（WebView2 时代存档） | 不再接收任何更新/同步；历史收尾 = `0.0.1-rc.13/rc.14`（WebView2 最终版） |
| `dev-v2` | **唯一开发分支**（Tauri 2.x 壳） | 所有更新在此开发，merge 只到 main |

---

## 功能特性

- **原生桌面化**：用 Tauri 2.x 原生窗口打开 dsh Web UI，无浏览器标签页干扰。
- **品牌化 Splash**：主题色 + dsh logo + spinner 覆盖从窗口打开到 SPA 首绘的加载过程，无白/黑闪块（`src-tauri/src/shell-init.js` 注入覆盖层，页面 load 或 3s 后淡出）。
- **系统托盘**：
  - 显示主界面 / 隐藏主界面（按窗口状态动态切换）
  - 打开工作区（自动激活并前置 Explorer）
  - 新建任务（走官方 `ctx.workspaces.startSession` 流程，UI 即时刷新；SPA 未就绪时命令自动重试——`__mgShellReady` 300ms×20 轮询不丢命令）
  - 退出（写 `quit.marker` 后干净退出，避免误判崩溃重启）
- **窗口状态记忆与尺寸管理**：最大化状态、分辨率、主题等持久化到 `$DSH_HOME/dsh-hub/config.json`；套用保存尺寸前若处于最大化先退最大化、退出时恢复保存尺寸；无保存尺寸时默认**光标所在屏 3/4**（multi-monitor aware，无上限，下限 480×360）。
- **主题跟随（system）**：MutationObserver 事件驱动，`apply_page_theme` 命令让标题栏深浅色、webview 背景与**窗口图标（icon-dark / icon-light 翻转）**实时跟随 dsh 页面主题（Tauri 壳 Rust Dwm 实现）。
- **桌面图标（S6，PR #25 + 08-23 重构）**：设置卡可选 5 张鲸鱼娘图标（sad/happy/duo/maid/blue）或默认主题翻转鲸鱼；切换即时生效于**任务栏按钮（WM_SETICON ICON_BIG，PostMessageW 异步）+ 标题栏/Alt-Tab（ICON_SMALL）+ 托盘 + 开始菜单/桌面快捷方式（.lnk IconLocation）+ AUMID IconUri + 自绘标题栏图标（与任务栏/托盘同源真实 PNG `/api/dsh-hub/icons/*.png`）**——六面统一编排（`managers/icon.rs` IconManager：面级幂等 + 全局串行锁 + 单 worker/pending 合并，快速连续切换不卡死）；持久化于 `config.json` 的 `desktopIcon`；`.ico` 多尺寸资产由 `scripts/generate-desktop-icons.py` 生成并随 resources 打包到 `$INSTDIR\icons\`。
- **模型选择（composer 嵌套菜单，PR #33）**：composer 模型 seat 替换为「provider → model」两级嵌套菜单 + 独立 thinking-effort 触发器——官方 `conversation.input.model` slot priority −1 遮蔽内置（复用官方 `modelDirectories` 服务，与 /model 命令状态一致；服务缺失自动降级内置 seat，不阻塞）。
- **findings-ledger 插件（PR #38）**：独立 dsh 插件（`plugins/dsh-findings-ledger/`）——baseline 快照 + 变更对账 + 覆盖度报告（双轨分发见 [BUILD.md §7](BUILD.md)）。
- **设置卡片**：dsh 设置 → 插件页提供桌面壳配置（窗口尺寸 / 主题 / 托盘行为 / 会话完成通知 / 提示音 / 多实例开关 / 界面皮肤 / 背景图 / 桌面图标）。
- **多实例保护**：启动时检测已有 dsh 实例（任意端口），默认拒绝共存以防会话数据损坏；确需共存可在设置中显式开启（附危险警告）。
- **右侧栏**：概览（Token 统计）、文件树、Git 变更三页；收起后保留窄栏快捷按钮。
- **对话定位条（rail）**：中栏左缘竖排小横条 minimap（每段对话一条，点击跳转；位置按段序近似，数据源官方 ConversationSnapshot turnTimings，只读）。**自适应配色**：采样 rail 下方的实际背景（皮肤表面色 × 背景图 cover 数学混合），按采样色相派生 tick 深/浅色调（WCAG 对比度择优，≥7:1）与激活态强调色——每套皮肤/背景图得到自己的 rail 色板，非固定两色；tick 附 1px 对比描边兜底。
- **置顶会话**：会话行 hover 置顶（同名会话安全跳过、不误标）；置顶区常驻列表顶部（可独立滚动）；持久化于 `$DSH_HOME/dsh-hub/pins.json`（localStorage 兜底）。注：多标签/多实例下 pins 为整体替换语义（最后写者胜）；同标签内 PUT 依赖 fetch 顺序保序。
- **会话完成通知 + 事件提示音**：
  - **提示音**（独立开关）：用户提交问题（开始音）、任务正常完成（完成音）、AI 请求批准（需要你）、任务出错（出错音）——**四段原创合成音效**（`scripts/synthesize-sounds.mjs` 生成，无第三方素材），窗口隐藏到托盘时依然可闻。
  - **Toast**：任务完成/出错时弹 Windows 原生通知（notify-rust 直弹，`wait_for_action` 点击回窗），30s 冷却。**聚焦会话策略**：正在查看的会话完成时只响提示音不弹 Toast（结果就在眼前）；后台会话完成或窗口隐藏时仍弹 Toast。
- **独立进程身份**：桌面壳为单一 Tauri 原生应用（`cargo tauri build` NSIS 安装），任务管理器显示 DeepSeek Harness Hub 图标与名称；WebView2 时代 `dsh-hub.exe` / `dsh-hub-guard.exe`（node.exe 复制 + rcedit 打补丁）机制已删除。
- **启动门控**：仅当通过本项目启动时注入桌面壳与插件页面；普通 `dsh web` 完全不受影响。

## 安装与使用

### 方式一：安装发布版（推荐，dev-v2 Tauri-only）

桌面壳为 **Tauri 原生应用**，安装 = 运行 **NSIS 安装器**（`build/<version>/DeepSeek Harness Hub_<version>_x64-setup.exe`，或按 [BUILD.md](BUILD.md) 自编译）：

- **安装即用（M5 闭环）**：安装期自动联网下载**私有 Node**（多源测速选最快）并安装 `@deepseek-ai/dsh` + `@marecgents/dsh-hub` + `pnpm` 到 `<安装目录>\dsh-hub-win\`（私有环境，不污染系统）——**无需系统预装 Node**。进度见安装器详情页 + `<安装目录>\dsh-hub-bootstrap.log`。
- **首启**：窗口显示「启动中」占位页 → 后台启动私有 dsh web → READY 后自动导航进 dsh UI（**不弹浏览器**）。
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
| HTTP 路由 | 配置读写：`/api/dsh-hub/config`、`/api/dsh-hub/workspace/*` |
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
│   ├── synthesize-sounds.mjs # 四段提示音合成
│   ├── check-tauri-conf.mjs  # M1 字段核对断言
│   ├── ipc-smoke.mjs         # M1 窗口 IPC 冒烟
│   ├── verify-release.mjs    # 发布门禁（P1-P5）
│   ├── verify-m4-multi-instance.mjs # M4 多实例门禁断言
│   ├── generate-titlebar-icons.mjs  # 标题栏/窗口主题图标生成（icon-dark/light）
│   └── generate-desktop-icons.py    # 桌面图标 .ico 多尺寸生成（whale-girl*/whale）
├── assets/                 # dsh favicon（SVG）+ backgrounds/（背景图）+ sounds/（提示音）
├── plugins/                # 独立 dsh 插件（双轨分发：独立 npm + 随 hub，见 BUILD.md §7）
│   └── dsh-findings-ledger/ # findings-ledger（PR #38）
├── src-tauri/              # Tauri 2.x 壳（Rust，lib.rs 入口 + NSIS 打包）
│   └── nsis/installer-hooks.nsi # NSIS 钩子（PREUNINSTALL 快速通道/Job Object 协同）
├── src/
│   ├── index.ts            # host 插件入口（Controller 装配）
│   ├── core/              # 命令注册表 / 生命周期（registry）
│   ├── controllers/       # 业务编排（session-runtime / tray-pipe / shell-runtime）
│   ├── services/           # 领域服务（config-store / pins-store）
│   ├── server/             # HTTP 路由工厂（/api/dsh-hub/*）
│   ├── managers/           # 壳 Manager（tauri-shell）
│   ├── helpers/            # 无状态工具（state-store）
│   ├── models/             # 共享类型/常量（pipe / shell-config / plugin-config / sound）
│   ├── utils/              # 纯函数（管道帧解析）
│   └── client/             # client half（设置卡片 + 右侧栏 + 模型嵌套菜单）
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
- **正式版前置条件**：迁移至 Tauri 2.x 并达到较好体验后再发布正式版（当前为 rc 预览版）。
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
- [关键踩坑记录（勿重蹈）](docs/关键踩坑记录.md)
