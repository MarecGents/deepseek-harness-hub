# mg-dsh-desktop

DeepSeek Harness（`dsh`）的**桌面化 + 插件集成**项目（从零重写，替代早期 mg-dsh-desktop）。以原生 Windows 窗口（系统 WebView2）运行 dsh 的 Web UI，提供主题同步、窗口状态记忆、系统托盘与托盘命令；设置 → 插件页提供桌面壳配置卡片。

## 定位

- **桌面化**：以原生 Windows 窗口（系统 WebView2）运行 dsh 的 Web UI。
- **插件配置卡片**：dsh 设置 → 插件页的 **Marec-DSH-Plugin** 卡片（窗口尺寸/主题/托盘行为），走插件自有 HTTP 路由。
- **启动体验**：品牌化 splash 页（主题色 + dsh logo + spinner）覆盖从窗口打开到 SPA 首绘的整个加载过程，无白/黑闪块。
- **托盘**：常驻系统托盘；右键菜单「显示主界面 / 打开工作区 / 新建任务 / 退出」；最小化/关闭到托盘可配置。
- **状态记忆**：窗口分辨率可配置、上次最大化状态恢复；配置持久化到 `$DSH_HOME/mg-dsh-desktop/config.json`。

## 核心设计（严格遵循官方开发者文档 + 官方接口）

| 原则 | 实现 |
|---|---|
| 零改动 dsh | dsh 源码 `git status` 始终干净 |
| 官方插件形态 | bundle（`dsh.bundle.patch`）+ client 双 half（`dsh.client` + `exports["./client"]`），参照 dsh-web-ui / DSH-better-sidebar |
| 启动门控 | `cordis.patch.yml` 的行 `disabled: !!js process.env.MG_DSH_DESKTOP_LAUNCHED !== '1'` —— **非本项目启动的 `dsh web` 完全不加载插件**（无窗口、无 client row、无任何注入）；`mg-dsh` 命令或桌面快捷方式启动时开启桌面壳 |
| 配置面 | 插件自己的 HTTP 路由 `/api/mg-dsh-desktop/config`（GET/POST）读写 `$DSH_HOME/mg-dsh-desktop/config.json`。**刻意不用 settings 命名空间**：dsh 的 RPC `settings.describe` 只暴露硬编码白名单（源码注释明确第三方插件命名空间是 "deferred work"），第三方配置 UI 的受支持模式是插件自有路由（dsh-web-ui 的 `/api/pet/*` 同款） |

## 已完成功能

1. ✅ 桌面化：WebView2 窗口（`@webviewjs/webview`，N-API → wry/tao）
2. ✅ 无黑框启动：wscript.exe + VBS（SW_HIDE）隐藏控制台；`mg-dsh` 命令终端启动
3. ✅ 启动 splash：`createWebview({ html })` 主题色品牌页（logo 呼吸 + spinner），300ms 后 `loadUrl` 切 SPA；WebView2 在 SPA 解析期间保持 splash 画面 → 无白/黑块
4. ✅ 主题切换同步：150ms 轮询页面 `data-ds-dark-theme`（三态探测：splash/非 dsh 页返回 `na` 不发事件；轮询从首个 page-load-finished 才开始）；标题栏 + webview 背景一起跟随（兼容任何主题插件）
5. ✅ 窗口状态记忆：默认 1280×720 居中；**上次关闭为最大化则本次最大化恢复**（状态文件只记 `maximized`，避免几何漂移）；分辨率/主题/托盘经配置 API 持久化
6. ✅ 图标：桌面快捷方式图标、窗口栏/任务栏图标、托盘图标（dsh favicon）
7. ✅ 托盘常驻 + 行为：右键菜单「显示主界面 / 打开工作区 / 新建任务 / 退出」，双击恢复（单击不动作）；**最小化到托盘**（最小化 → 任务栏消失）、**关闭到托盘**（点 X → 进程+托盘存活，托盘重建窗口）均可配置、动态生效
8. ✅ 打开工作区 = 资源管理器打开当前工作区目录（`workspaceRegistry.list()[0]` > 当前会话 cwd > 启动目录）
9. ✅ 新建任务 = 托盘 → 页面桥：`webview.evaluateScriptWithCallback` 派发 `mg:shell-command` 事件，client 半部执行官方 `ctx.workspaces.startSession(workspaceId)`（侧栏"+"同款：当前工作区下创建并打开新会话，UI 即时刷新）；就绪探测 + 300ms×20 重试覆盖 SPA 冷启动
10. ✅ 插件配置卡片：Marec-DSH-Plugin（官方 PluginCard 风格折叠卡片）——窗口设置（分辨率/主题/最小化到托盘/关闭到托盘）；宽/高初始值显示**当前窗口实际分辨率**（SPA 视口尺寸），保存后固化为配置；走自有 HTTP 路由（`/api/mg-dsh-desktop/config`）

## 目录结构

```
mg-dsh-desktop/
├── package.json            # dsh.bundle.patch + dsh.client + bin(mg-dsh) + scripts
├── cordis.patch.yml        # 插件行（disabled 门控按启动来源）
├── tsconfig.json / tsdown.config.ts
├── bin/
│   ├── mg-dsh.mjs          # mg-dsh 命令（启动 dsh web + 注入标记）
│   ├── launcher.mjs        # 桌面快捷方式启动器（端口检测/惰性注册/启动）
│   └── launcher.vbs        # 隐藏控制台 VBS（postinstall 生成）
├── scripts/                # build-client / generate-icon / postinstall / postuninstall
├── assets/                 # dsh 官方 favicon（PNG/ICO）
└── src/
    ├── index.ts            # host 插件（门控 + 配置路由 + 窗口编排 + 托盘命令）
    ├── desktop.ts          # WebView2 壳（splash/窗口/主题同步/托盘/页面桥）
    ├── client/index.ts     # client 插件（卡片注册 + tray→页面桥）
    ├── client/settings-card.tsx  # Marec-DSH-Plugin 卡片（窗口设置）
    ├── client/style.ts     # CSS 字符串 + injectCardStyle（官方 token，注入 <style>）
    └── services/
        ├── config-api.ts   # 配置路由 + $DSH_HOME 持久化
        ├── state-store.ts  # 窗口几何记忆（校验防退化）
        ├── theme-sync.ts   # 主题检测（三态探测，150ms，首屏后启动）
        ├── tray.ts         # 托盘菜单（显示/打开工作区/新建任务/退出）
        └── icons.ts        # 图标加载/降采样/data URL
```

## 使用

```sh
# 安装进 web profile（首次）
dsh plugin --profile web add <本目录绝对路径>

# 方式一：mg-dsh 命令（终端，继承输出）
mg-dsh

# 方式二：桌面快捷方式（安装后 postinstall 自动创建，隐藏控制台）
# 双击「DeepSeek Harness」

# 验证门控
dsh web            # 命令行启动：不注入插件，无窗口
mg-dsh             # 本项目启动：窗口 + 托盘
```

## 开发

```sh
npm run build          # tsc 编译 host
npm run build:client   # tsdown 构建 client bundle（自动建 SDK junction）
# 改动 src/ 后重编译，重启 dsh 生效；cordis.patch.yml 改动热重载
```

## 关键踩坑记录（勿重蹈）

1. **settings 命名空间白名单**：dsh api-proxy 的 `settings.describe` 只返回硬编码 `WEB_SETTINGS_NAMESPACES` + model providers + product 名单 —— 第三方插件的命名空间 RPC 永远看不到（官方注释 "deferred work"）。第三方配置一律走自有 HTTP 路由。
2. **route 唯一性**：`ctx.webServer.register` 的 exact route 同 path 不能注册两次（GET/POST 需合并进一个 handler 按 method 分发）。
3. **窗口退化 bug**：状态记忆必须校验最小尺寸/坐标（防 boot 期 0 尺寸持久化，`??` 不跳过 0）。
4. **client 插件机制**：patch 行 name 用包名；client row 由 modules node half 扫描 `dsh.client` 自动编入 `__DSH_BOOT__`，无需特殊 client 行。
5. **host 侧创建会话 UI 不显示**：`apiProxy.sessions.create`（或 `sessions.create`）在 host 侧创建会话后**前端侧栏永不刷新** —— 客户端列表 store 只通过客户端自身 create/merge、断线重连、或 mux 帧（无"新会话入列"信号）学习新会话。托盘命令需要 UI 联动时必须走 **client 半部官方流程**（`ctx.workspaces.startSession`），host → 页面用 `webview.evaluateScriptWithCallback` 桥接。
6. **webviewjs 无关闭拦截**：`window-close-requested` 只是通知（无 preventDefault）；关闭到托盘用"不 exit + 隐藏保活窗口重建"方案。
7. **最小化到托盘恢复闪烁**：hide 前先 `setMinimized(false)` 清标志，showWindow 前同样清理。
8. **splash 期间主题探测**：splash 页无主题标记，探测必须三态（`na`），否则标题栏在启动时闪浅色。
9. **事件类型合并**：`session/event` / `agent/created` 等 Events 由 `@deepseek-ai/dsh-session` / `@deepseek-ai/dsh-agent` 声明合并 —— 使用方需显式 `import type {} from` 这两个包（删除其他依赖时注意别连这些传递导入一起丢掉）。
