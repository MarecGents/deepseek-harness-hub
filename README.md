# dsh-hub

> **`@marecgents/dsh-hub`** —— DeepSeek Harness（`dsh`）的桌面端框架：以原生 WebView2 窗口运行 dsh Web UI，提供托盘、主题同步、窗口记忆、右侧栏与系统通知。
>
> **版本状态（2026-08-16）**：`0.0.1-rc.13` 是 **WebView2 壳的最后一个 rc 版本**（`dev-v1` 分支已冻结）。正式版将在 **Tauri 2.x 壳**（`dev-v2`）迁移完成并达到良好体验后发布——多端支持（Windows / macOS / Linux）、~10MB 体积、自定义壳 UI。迁移期间插件层（client + config/workspace API）原样保留，壳层整体重写（见 [docs/dsh桌面端技术路线-2026-08-16.md](docs/dsh桌面端技术路线-2026-08-16.md)）。

[![npm version](https://img.shields.io/npm/v/@marecgents/dsh-hub)](https://www.npmjs.com/package/@marecgents/dsh-hub)
[![npm rc](https://img.shields.io/npm/v/@marecgents/dsh-hub/rc)](https://www.npmjs.com/package/@marecgents/dsh-hub)
[![license](https://img.shields.io/npm/l/@marecgents/dsh-hub)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/MarecGents/deepseek-harness-hub?style=social)](https://github.com/MarecGents/deepseek-harness-hub)
[![dsh-plugin](https://img.shields.io/badge/dsh-plugin-DeepSeek%20Harness-blue)](https://github.com/topics/dsh-plugin)
[![platform](https://img.shields.io/badge/platform-Windows%20%7C%20WebView2-0078d4)]()

---

## 分支状态

| 分支 | 状态 | 说明 |
|---|---|---|
| `main` | 发布分支 | 当前 = `0.0.1-rc.13`（WebView2 最终版） |
| `dev-v1` | **已冻结**（WebView2 壳） | 不再开发；仅安全/文档性修复可走 PR |
| `dev-v2` | **当前开发分支**（Tauri 2.x 壳） | 壳层重写中，插件层保留 |

---

## 功能特性

- **原生桌面化**：用系统 WebView2 打开 dsh Web UI，无浏览器标签页干扰。
- **品牌化 Splash**：主题色 + dsh logo + spinner 覆盖从窗口打开到 SPA 首绘的加载过程，无白/黑闪块。
- **系统托盘**：
  - 显示主界面 / 隐藏主界面（按窗口状态动态切换）
  - 打开工作区（自动激活并前置 Explorer）
  - 新建任务（走官方 `ctx.workspaces.startSession` 流程，UI 即时刷新）
  - 退出（写 `quit.marker` 后干净退出，避免误判崩溃重启）
- **窗口状态记忆**：最大化状态、分辨率、主题等持久化到 `$DSH_HOME/dsh-hub/config.json`。
- **主题同步**：MutationObserver 事件驱动，标题栏深浅色实时跟随 dsh 页面主题（koffi FFI 直调 Dwm API，~1ms）。
- **设置卡片**：dsh 设置 → 插件页提供桌面壳配置（窗口尺寸 / 主题 / 托盘行为 / 会话完成通知 / 提示音 / 多实例开关 / 界面皮肤 / 背景图）。
- **多实例保护**：启动时检测已有 dsh 实例（任意端口），默认拒绝共存以防会话数据损坏；确需共存可在设置中显式开启（附危险警告）。
- **右侧栏**：概览（Token 统计）、文件树、Git 变更三页；收起后保留窄栏快捷按钮。
- **置顶会话**：会话行 hover 置顶（同名会话安全跳过、不误标）；置顶区常驻列表顶部（可独立滚动）；持久化于 `$DSH_HOME/dsh-hub/pins.json`（localStorage 兜底）。注：多标签/多实例下 pins 为整体替换语义（最后写者胜）；同标签内 PUT 依赖 fetch 顺序保序。
- **会话完成通知 + 事件提示音**：
  - **提示音**（独立开关）：用户提交问题（开始音）、任务正常完成（完成音）、AI 请求批准（需要你）、任务出错（出错音）——**四段原创合成音效**（`scripts/synthesize-sounds.mjs` 生成，无第三方素材），窗口隐藏到托盘时依然可闻。
  - **Toast**：任务完成/出错时弹 Windows 原生通知，点击恢复窗口；30s 冷却。**聚焦会话策略**：正在查看的会话完成时只响提示音不弹 Toast（结果就在眼前）；后台会话完成或窗口隐藏时仍弹 Toast。
- **独立进程身份**：桌面壳以 `dsh-hub.exe`（应用）+ `dsh-hub-guard.exe`（守护）运行，任务管理器显示 DeepSeek Harness Hub 图标与名称，不再是 "Node.js JavaScript Runtime"（首次启动自动生成并缓存，Node 升级自动重建）。
- **启动门控**：仅当通过本项目启动时注入桌面壳与插件页面；普通 `dsh web` 完全不受影响。

## 安装与使用

### 方式一：自动安装（推荐）

按需选择版本：

```sh
# 正式版（稳定，推荐）
npm i -g @marecgents/dsh-hub

# 预览版（rc，尝鲜最新功能）
npm i -g @marecgents/dsh-hub@rc
```

| 版本 | 安装命令 | 说明 |
| --- | --- | --- |
| **正式版**（latest） | `npm i -g @marecgents/dsh-hub` | 稳定版本，适合日常使用 |
| **预览版**（rc） | `npm i -g @marecgents/dsh-hub@rc` | 候选版本（预览版），包含最新功能，可能有未完善之处 |

> 预览版以 npm `rc` 标签发布，不会覆盖正式版；随时可切换到正式版重装。

安装脚本会自动检测 `dsh` / `pnpm`（缺失则一并安装），并在 Windows 创建桌面快捷方式「DeepSeek Harness」。

启动：

```sh
# 方式 A：双击桌面快捷方式（无控制台）
# 方式 B：终端命令（继承输出）
dsh-hub
```

### 方式二：手动 / 从源码安装

```sh
git clone https://github.com/MarecGents/deepseek-harness-hub.git
cd deepseek-harness-hub
npm install
npm run build
npm run build:client
```

开发模式启动：

```sh
dsh-hub
```

> 依赖 dsh 的 Web 端（`dsh web`）已可用。本项目作为 dsh 插件通过 `cordis.patch.yml` 挂载，不修改 dsh 源码。

### 验证门控

```sh
dsh web
```

普通 CLI 启动不会加载桌面壳：无窗口、无托盘、无插件注入。

## 技术架构

### 双 half 模型

```
┌──────────────────┐   spawn --port 0   ┌────────────────────────────────────┐
│ bin/launcher.mjs │ ─────────────────▶ │ dsh web（Cordis 插件树）            │
│ 桌面快捷方式 →     │  findDsh + junction│  ┌──────────────────────────────┐  │
│ wscript+VBS 隐藏  │  注册 bundle       │  │ dsh-hub（host half）          │  │
│ 控制台            │                   │  │ src/index.ts ── src/desktop.ts │  │
└──────────────────┘                   │  │      │  services/*             │  │
┌──────────────────┐                   │  └──────┼───────────────────────┘  │
│ bin/dsh-hub.mjs  │ ── spawn ────────▶│         │ WebView2 窗口            │
│ 终端命令           │                   │  ┌──────▼───────────────────────┐  │
└──────────────────┘                   │  │ dsh Web UI（SPA）              │  │
                                       │  │  + dsh-hub（client half）      │  │
                                       │  │  src/client/*                  │  │
                                       │  └────────────────────────────────┘  │
                                       └────────────────────────────────────┘
```

- **host half**（dsh 进程内，Node）：`src/index.ts` + `src/desktop.ts` + `src/services/*`。
- **client half**（浏览器内）：`src/client/*`，由 dsh 的 client-modules 自动编入 `__DSH_BOOT__`。

### 通信通道

| 通道 | 用途 |
| --- | --- |
| HTTP 路由 | 配置读写：`/api/dsh-hub/config`、`/api/dsh-hub/workspace/*` |
| IPC / evaluateScript 桥 | 托盘命令派发、主题切换、当前工作区查询 |
| 事件桥 | `session/event` → 会话完成通知 |

### 关键机制

- **启动链路**：快捷方式 → `launcher.vbs`（隐藏控制台）→ `launcher.mjs`（单实例锁 + 找 dsh + junction 注册 bundle + `spawn dsh web --port 0`）→ dsh 加载插件 → `openDesktopShell()` 打开 WebView2。
- **主题跟随**：`body[data-ds-dark-theme]` 变化 → MutationObserver → IPC → 标题栏主题/图标。
- **托盘命令**：独立 `tray-helper.mjs` 进程 → JSON IPC → 主进程执行。
- **崩溃自动重启**：非正常退出时最多自动重启 3 次；主动退出写 `quit.marker` 不重启。
- **关闭到托盘**：隐藏保活窗口方案，规避 webviewjs 无关闭拦截的限制。

## 目录结构

```
dsh-hub/
├── package.json            # dsh.bundle.patch + dsh.client + bin + scripts
├── cordis.patch.yml        # 插件行（启动来源门控）
├── tsconfig.json
├── tsdown.config.ts        # client bundle 构建配置
├── bin/
│   ├── launcher.mjs        # 快捷方式启动器
│   ├── launcher.vbs        # 隐藏控制台包装
│   ├── dsh-hub.mjs          # 终端命令入口
│   └── tray-helper.mjs     # 独立托盘进程
├── scripts/
│   ├── postinstall.mjs     # 检测 dsh/pnpm + 创建快捷方式
│   ├── postuninstall.mjs   # 清理快捷方式
│   ├── build-client.mjs    # client 构建 + SDK junction
│   └── generate-icon.mjs
├── assets/                 # dsh favicon（PNG/ICO/SVG）
├── src/
│   ├── index.ts            # host 插件入口
│   ├── desktop.ts          # WebView2 壳
│   ├── client/             # client half（设置卡片 + 右侧栏）
│   └── services/           # config / theme / tray / state / icons ...
├── docs/
│   └── 关键踩坑记录.md      # 踩坑索引
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
| runtime | `@webviewjs/webview`、`koffi`、`clsx`、`@deepseek-ai/schemastery` |
| peer | `@deepseek-ai/cordis`、dsh host/client 相关包、`react`、`react-dom` |
| dev | `typescript`、`tsdown`、`@deepseek-ai/dsh-*` 系列、`react` / `react-dom` 类型 |

完整依赖见 [`package.json`](package.json)。

## 技术路线

- **当前壳层**：`@webviewjs/webview`（WebView2）+ koffi FFI，Windows 专属。
- **目标壳层**：**Tauri 2.x** —— 自定义壳层 UI（`decorations: false` 自定义标题栏）、Linux / Windows / macOS 多端一致、包体 ~10MB、官方插件生态（tray / notification / window-state / single-instance / updater）。
- **正式版前置条件**：迁移至 Tauri 2.x 并达到较好体验后再发布正式版（当前为 rc 预览版）。
- **dsh 生态适配**：壳层与内容解耦（dsh Web UI 为独立 SPA），Tauri 壳仅负责窗口/托盘/通知/系统集成；client half（React）与 dsh 插件代码零改动。
- 详细决策见外部文档 `docs/dsh桌面端技术路线-2026-08-16.md`。

## 发布

```sh
# scoped 包：发布必须 --access public + 官方 registry
npm publish --access public --registry=https://registry.npmjs.org/

# 发布候选版（rc 标签，不影响 latest）
npm publish --access public --tag rc --registry=https://registry.npmjs.org/
```

## 致谢

- [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) —— 一切皆插件的 DSH 生态。
- [dsh-web-ui](https://github.com/zhu1090093659/dsh-web-ui) —— 插件/皮肤集合与右侧栏参考。
- [DSH-better-sidebar](https://github.com/omdsh-dev/DSH-better-sidebar) —— body portal 右侧栏与工作台参考。
- [awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin) —— dsh 插件精选列表与生态索引。
- [DeepSeek Harness Desktop](https://github.com/anywhere-labs/deepseek-harness-desktop) —— 同生态桌面化项目参考。

## 文档

- [开发约束（AGENTS.md，开发前必读）](AGENTS.md) —— 全部开发 harness 总纲 + 分层子 harness 索引
- [关键踩坑记录（勿重蹈）](docs/关键踩坑记录.md)
