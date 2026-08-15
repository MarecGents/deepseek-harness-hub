# mg-dsh-desktop

DeepSeek Harness（`dsh`）的**桌面化**项目。以原生 Windows 窗口（系统 WebView2）运行 dsh 的 Web UI，提供主题同步、窗口状态记忆、系统托盘与托盘命令；设置 → 插件页提供桌面壳配置卡片。

## 定位

- **桌面化**：以原生 Windows 窗口（系统 WebView2）运行 dsh 的 Web UI。
- **插件配置卡片**：dsh 设置 → 插件页的 **Marec-DSH-Plugin** 卡片（窗口尺寸/主题/托盘行为），走插件自有 HTTP 路由。
- **启动体验**：品牌化 splash 页（主题色 + dsh logo + spinner）覆盖从窗口打开到 SPA 首绘的整个加载过程，无白/黑闪块。
- **托盘**：常驻系统托盘；右键菜单「显示主界面/隐藏主界面（按窗口状态动态切换） / 打开工作区 / 新建任务 / 退出」；最小化/关闭到托盘可配置；打开工作区后会自动激活并前置 Explorer 窗口。
- **状态记忆**：上次最大化状态恢复；配置持久化到 `$DSH_HOME/mg-dsh-desktop/config.json`。
- **窗口分辨率**：插件页设置的分辨率保存后立即生效；最大化时保存会先自动取消最大化并清除 maximized 标记；非最大化启动/普通还原固定为屏幕 3/4；输入自动限制在当前屏幕最大宽高内。

## 安装与使用

```sh
# 全局安装（自动检测 dsh/pnpm，未装则一并安装；Windows 自动创建桌面快捷方式）
npm i -g mg-dsh-desktop

# 方式一：桌面快捷方式（无控制台）
# 双击「DeepSeek Harness」

# 方式二：mg-dsh 命令（终端，继承输出）
mg-dsh

# 验证门控（CLI 启动不注入桌面壳）
dsh web            # 无窗口、无托盘、无注入
```

## 核心设计（严格遵循官方开发者文档 + 官方接口）

| 原则 | 实现 |
|---|---|
| 零改动 dsh | dsh 源码 `git status` 始终干净 |
| 官方插件形态 | bundle（`dsh.bundle.patch`）+ client 双 half（`dsh.client` + `exports["./client"]`），参照 dsh-web-ui / DSH-better-sidebar |
| 启动门控 | `cordis.patch.yml` 的行 `disabled: !!js process.env.MG_DSH_DESKTOP_LAUNCHED !== '1'` —— **非本项目启动的 `dsh web` 完全不加载插件**（无窗口、无 client row、无任何注入） |
| 配置面 | 插件自有 HTTP 路由 `/api/mg-dsh-desktop/config`（GET/POST）读写 `$DSH_HOME/mg-dsh-desktop/config.json`。**刻意不用 settings 命名空间**：dsh 的 RPC `settings.describe` 只暴露硬编码白名单（第三方插件命名空间是 "deferred work"），第三方配置 UI 的受支持模式是插件自有路由（dsh-web-ui 同款） |
| 随机端口 | 启动器固定传 `dsh web --port 0`（OS 随机分配），CLI `dsh web` 不受影响（默认 3080） |
| 单实例 | 桌面快捷方式与 `mg-dsh` 命令共用 `$DSH_HOME/mg-dsh-desktop/launcher.lock` PID 锁；随机端口下仍能可靠防止双开，并自动接管陈旧锁 |

## 代码架构

### 总览

```
┌──────────────────┐   spawn --port 0   ┌────────────────────────────────────┐
│ bin/launcher.mjs │ ─────────────────▶ │ dsh web（Cordis 插件树）            │
│ 桌面快捷方式 →     │  findDsh + junction│  ┌──────────────────────────────┐  │
│ wscript+VBS 隐藏  │  注册 bundle       │  │ mg-dsh-desktop（host half）    │  │
│ 控制台            │                   │  │ src/index.ts ── src/desktop.ts │  │
└──────────────────┘                   │  │      │  services/*             │  │
┌──────────────────┐                   │  └──────┼───────────────────────┘  │
│ bin/mg-dsh.mjs   │ ── spawn ────────▶│         │ WebView2 窗口            │
│ 终端命令           │                   │  ┌──────▼───────────────────────┐  │
└──────────────────┘                   │  │ dsh Web UI（SPA）              │  │
                                       │  │  + mg-dsh-desktop（client half）│  │
                                       │  │  src/client/*                  │  │
                                       │  └────────────────────────────────┘  │
                                       └────────────────────────────────────┘
```

### 双 half 模型

- **host half**（dsh 进程内，Node）：`lib/index.js` —— `src/index.ts`（插件入口/门控/路由/编排）+ `src/desktop.ts`（WebView2 壳）+ `src/services/*`（单职责服务）。由 `cordis.patch.yml` 插入的插件行挂载。
- **client half**（浏览器内）：`lib/client.js` —— `src/client/*`。由 dsh 的 client-modules 扫描 `dsh.client` 声明编入 `__DSH_BOOT__`，运行在 Web UI 页面里。

两者通过两条通道通信：**HTTP 路由**（配置读写）与 **evaluateScript 桥**（托盘命令派发，`mg:shell-command` 事件）。

### 模块划分（单职责，可独立删换）

```
src/
├── index.ts              # host 插件入口：门控、配置路由、窗口编排、托盘命令接线
├── desktop.ts            # WebView2 壳：splash/窗口生命周期/主题应用/托盘/页面桥
├── client/
│   ├── index.ts          # client 插件：卡片注入 + 托盘→页面桥监听
│   ├── settings-card.tsx # Marec-DSH-Plugin 卡片（窗口设置）
│   └── style.ts          # CSS 字符串 + injectCardStyle（官方 token）
└── services/
    ├── config-api.ts     # 配置路由 + $DSH_HOME 持久化 + 旧名迁移
    ├── dwm-theme.ts      # 标题栏深浅：koffi FFI 直调 dwmapi（+ PowerShell 兜底）
    ├── theme-sync.ts     # 主题检测：MutationObserver 事件驱动 + 轮询兜底
    ├── tray.ts           # 托盘菜单（独立 helper 进程 + 进程内 fallback）
    ├── state-store.ts    # 窗口几何记忆（校验防退化）
    └── icons.ts          # 图标加载/降采样/data URL
bin/
├── launcher.mjs          # 快捷方式启动器：findDsh → junction 注册 bundle → spawn
├── launcher.vbs          # 隐藏控制台包装（postinstall 生成）
├── tray-helper.mjs       # 独立托盘进程：stdin/stdout JSON IPC，不依赖 WebView2 事件循环
└── mg-dsh.mjs            # mg-dsh 命令（终端启动，继承输出）
scripts/
├── postinstall.mjs       # 检测 dsh/pnpm（未装则装）+ 创建桌面快捷方式
└── postuninstall.mjs     # 删除快捷方式
```

### 启动链路

1. **双击快捷方式** → wscript.exe 跑 `launcher.vbs`（`SW_HIDE` 隐藏控制台）→ `node bin/launcher.mjs`
2. **launcher**：获取**单实例锁**（`$DSH_HOME/mg-dsh-desktop/launcher.lock`，已运行则提示退出）→ `findDsh()`（`DSH_CMD` → PATH → npm 全局目录）找到已装 dsh → 首次启动时**junction 注册** bundle（`profile/node_modules/mg-dsh-desktop` → 包目录，dsh 用 `createRequire` 解析，无需 pnpm）→ `spawn dsh web --port 0`
3. **dsh 启动**：加载 bundles（base / web-app / mg-dsh-desktop）→ 插件 `apply()`（先做 `MG_DSH_DESKTOP_LAUNCHED` 门控检查 + 旧配置迁移）
4. **webserver ACTIVE** → `openDesktopShell()`：窗口 + splash 页 → 300ms 后 `loadUrl` 切 SPA（WebView2 在 SPA 解析期间保持 splash 画面，无白/黑闪块）

### 关键机制

#### 主题跟随链路（事件驱动，~0ms 延迟）

```
dsh 页面 ui-theme presenter 写 body[data-ds-dark-theme]
  → 注入的 MutationObserver 检测到变化
  → window.ipc.postMessage('mg-theme:1|0')
  → host webview.onIpcMessage 解析
  → applyWindowTheme：win.setTheme + webview 背景 + 标题栏图标（白/黑鲸鱼）
  → koffi FFI 直调 DwmSetWindowAttribute（~1ms，PowerShell 兜底）
```

轮询（100ms）仅作兜底（observer 注入失败时）。**实测延迟链路**：事件级 ~1ms（此前是 150ms 轮询 + 1.3s PowerShell 冷启动）。

#### 托盘命令链路

```
托盘菜单/双击 → bin/tray-helper.mjs（独立事件循环）
  → stdin/stdout JSON IPC → tray.ts 的 TrayActions（主进程执行）
  ├─ 显示主界面   → showWindow（重建窗口或显示隐藏保活窗口）
  ├─ 打开工作区   → ShellExecuteW（Invoke-Item 同路径）+ koffi 轮询激活窗口
  ├─ 新建任务     → 窗口可见时先 win.focus()（触发 WebView2 实时重绘）
  │                 → evaluateScriptWithCallback 派发 mg:shell-command 事件
  │                 → client 半部 ctx.workspaces.startSession（官方流程，UI 即时刷新）
  └─ 退出         → 写 quit.marker + process.exit(0)（不再走 app.exit，避免崩溃重启）
```

#### 配置链路

```
client 卡片（settings-card.tsx）→ fetch GET/POST /api/mg-dsh-desktop/config
  → host config-api 路由 → 读写 $DSH_HOME/mg-dsh-desktop/config.json
  → POST 后 onChange 回调 → shell.applyTheme（主题即时生效）
```

#### 关闭到托盘（webviewjs 无关闭拦截）

`win.on('close')`（closeToTray 开启时）→ **同步创建隐藏保活窗口**（visible:false 顶替）→ 旧窗口关、app 因仍有窗口而不退出、托盘存活；托盘"显示主界面"显示/重建窗口。最小化到托盘：轮询 `isMinimized()` → 先 `setMinimized(false)` 再 hide（防任务栏闪烁）。

#### 崩溃自动重启（launcher 兜底）

dsh/webviewjs 偶发的 SIGSEGV / `0xC0000005` 崩溃会使 dsh 以非 0 退出码结束。桌面快捷方式启动器会在**非正常退出**时自动重启，最多 3 次（间隔 1.2s），并在连续失败后弹窗提示查看 `dsh.log`。正常退出（退出码 0，如托盘「退出」或非关闭到托盘时关窗）不触发重启。

## 目录结构

```
mg-dsh-desktop/
├── package.json            # dsh.bundle.patch + dsh.client + bin(mg-dsh) + scripts
├── cordis.patch.yml        # 插件行（disabled 门控按启动来源）
├── tsconfig.json / tsdown.config.ts
├── bin/                    # launcher.mjs / launcher.vbs / mg-dsh.mjs
├── scripts/                # postinstall / postuninstall / build-client / generate-icon
├── assets/                 # dsh 官方 favicon（PNG/ICO）
├── src/                    # 见上文模块划分
└── lib/                    # 构建产物（tsc + tsdown）
```

## 开发

```sh
npm run build          # tsc 编译 host（src → lib/）
npm run build:client   # tsdown 构建 client bundle（自动建 SDK junction）
# 改动 src/ 后重编译，重启窗口生效；cordis.patch.yml 改动热重载
```

**注意**：`npm i` 新依赖会清掉 build-client 建的 SDK junction（`@deepseek-ai/dsh-*`），装完必须重跑 `npm run build:client` 重建。

## 发布

```sh
# 本机默认 registry 是华为云镜像，发布必须显式官方 registry
npm version patch
npm publish --registry=https://registry.npmjs.org/
```

## 关键踩坑记录（勿重蹈）

1. **settings 命名空间白名单**：dsh api-proxy 的 `settings.describe` 只返回硬编码 `WEB_SETTINGS_NAMESPACES` + model providers + product 名单 —— 第三方插件的命名空间 RPC 永远看不到（官方注释 "deferred work"）。第三方配置一律走自有 HTTP 路由。
2. **route 唯一性**：`ctx.webServer.register` 的 exact route 同 path 不能注册两次（GET/POST 需合并进一个 handler 按 method 分发）。
3. **窗口退化 bug**：状态记忆必须校验最小尺寸/坐标（防 boot 期 0 尺寸持久化，`??` 不跳过 0）。
4. **client 插件机制**：patch 行 name 用包名；client row 由 modules node half 扫描 `dsh.client` 自动编入 `__DSH_BOOT__`，无需特殊 client 行。
5. **host 侧创建会话 UI 不显示**：`apiProxy.sessions.create` 在 host 侧创建会话后**前端侧栏永不刷新**（客户端 store 只通过自身 create/merge、断线重连、mux 帧学习新会话）。托盘命令需要 UI 联动必须走 **client 半部官方流程**（`ctx.workspaces.startSession`），host → 页面用 `evaluateScriptWithCallback` 桥接。
6. **evaluateScriptWithCallback 返回值带引号**：字符串结果被带引号序列化（`'dark'` → `"dark"`），`.trim()` 无法匹配 —— 探测一律用数字（1/0/-1）避免歧义（主题"永远读成 light"的根因）。
7. **webviewjs 无关闭拦截**：`window-close-requested` 只是通知（无 preventDefault）；关闭到托盘用"不 exit + 隐藏保活窗口重建"方案。
8. **最小化到托盘恢复闪烁**：hide 前先 `setMinimized(false)` 清标志，showWindow 前同样清理。
9. **splash 期间主题探测**：splash 页无主题标记，探测必须三态（`na`/`-1`），否则标题栏在启动时闪浅色。
10. **事件类型合并**：`session/event` / `agent/created` 等 Events 由 `@deepseek-ai/dsh-session` / `@deepseek-ai/dsh-agent` 声明合并 —— 使用方需显式 `import type {} from` 这两个包。
11. **PowerShell 慢**：冷启动 ~1.3s/次，常驻 stdin pipeline 每行 ~1s —— 标题栏 Dwm 调用必须用 FFI（koffi，~1ms），PowerShell 仅兜底。
12. **dsh plugin 转发 pnpm**：`dsh plugin --profile web add` 在 Windows 用 `shell:true` 转发 pnpm（全新环境易 EINVAL）；bundle 注册改手动 junction（dsh 用 `createRequire` 从 `profile/node_modules` 解析）。
13. **client 使用 `ctx.workspaces` 必须注入 `workspaces`**：`inject` 只写 `slots` 时 `ctx.workspaces` 为 undefined，托盘“新建任务”会静默失败（`new-task ignored`）；官方 sidebar 同款用法是 `inject: ['slots', ..., 'workspaces']`。
14. **托盘桥返回值用数字**：`evaluateScriptWithCallback` 对字符串结果带引号序列化（`'ok'` → `"ok"`），host 判断永远失败并重复派发；`dispatchScript` 成功/未就绪返回 `1/0`。
15. **主动退出必须写 quit.marker + `process.exit(0)`**：webviewjs 的 `app.exit()` 在 Windows 可能以 `0xC0000005` 崩溃，launcher 会把非 0 退出误判为异常并自动重启；主动退出走 `$DSH_HOME/mg-dsh-desktop/quit.marker`，launcher 见 marker 永不重启。
16. **`explorer.exe` 不要加 `windowsHide: true`**：会导致 Explorer 文件夹窗口隐藏启动，“打开工作区”看起来无反应；打开后如需前置，用后台 PowerShell 按窗口标题查找并 `AppActivate` + 短暂 TOPMOST。
