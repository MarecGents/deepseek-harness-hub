# AGENTS.md — bin/（启动器与独立进程）开发约束

> 本目录是 dsh-hub 的**启动器 / 独立进程**层（Node 脚本 + VBS 包装）。改动本目录任何文件前，**必须**先读根 [../AGENTS.md](../AGENTS.md) 与本文件。

## 职责

| 文件 | 模块类别 | 职责 |
|---|---|---|
| `launcher.mjs` | **Controller** | 桌面入口：re-exec 为 `dsh-hub-guard.exe`、单实例锁、多实例检测、bundle 装配检查、`spawn dsh web --port 0`（优先 `dsh-hub.exe` 直启）、崩溃自动重启（≤3 次）、quit.marker 判别 |
| `dsh-hub.mjs` | **Controller** | 终端命令入口（`dsh-hub`）：转发参数启动（子进程走 `dsh-hub.exe`），继承输出 |
| `hub-exe.mjs` | **Helper** | 进程身份：复制 node.exe → `dsh-hub.exe` / `dsh-hub-guard.exe`，rcedit 打补丁（图标+版本信息），缓存 `$DSH_HOME/dsh-hub/bin/` + stamp；`relaunchAsGuard` / `resolveDshEntry` |
| `tray-helper.mjs` | **Helper（独立进程）** | 独立托盘进程，stdin/stdout JSON IPC；helper 失败时 launcher 回退进程内托盘 |
| `lock.mjs` | **Helper** | 单实例 PID 锁（`$DSH_HOME/dsh-hub/launcher.lock`）：acquire/release/进程存活探测 |
| `launcher.vbs` | 包装 | 隐藏控制台启动 launcher.mjs（postinstall 生成，UTF-16LE BOM，勿手改） |

## 启动流程（不可破坏）

```
桌面快捷方式 → wscript launcher.vbs（隐藏控制台）→ node launcher.mjs
  ① relaunchAsGuard：re-exec 为 dsh-hub-guard.exe（进程身份；node 升级自动重建）
  ② acquireLock（单实例 PID 锁，失败 = 已在运行，退出）
  ③ clearQuitMarker（清陈旧退出标记）
  ④ detectRunningDshInstances（netstat + CIM 查 dsh web 进程）
     ├─ 有实例 & allowMultipleInstances=false → alert 严重警告 → 退出（不启动）
     └─ 有实例 & allowMultipleInstances=true  → confirm 是/否 → 用户选
  ⑤ findDsh → ensureBundleInstalled（scoped 名已在 bundles 则跳过 junction）
  ⑥ spawn dsh web --port 0（DSH_HUB_LAUNCHED=1）→ 桌面壳插件激活
     ├─ 优先：dsh-hub.exe <dsh入口> web --port 0（hub 进程身份）
     └─ 回退：cmd /c "dshCmd" web --port 0（补丁 exe 不可用时）
  ⑦ crash 自动重启 ≤3 次；quit.marker 存在 → 永不重启
```

## 铁律

1. **`--port 0` 不可改**：桌面壳用随机端口；改固定端口会与 3080 CLI 冲突。
2. **多实例防护不可削弱**：默认 `allowMultipleInstances=false` 时，检测到已有 dsh 必须**直接拦截退出**（仅确认按钮，无"继续"选项）；勾选允许后仍需**是/否确认**。任何修改不得默认放开。
3. **quit.marker 语义**：托盘退出先写 `$DSH_HOME/dsh-hub/quit.marker` → `process.exit(0)`；launcher 见 marker 视为主动退出，**永不自动重启**（webviewjs teardown 会报非 0 崩溃码，误判会无限重启）。
4. **单实例锁**：`lock.mjs` 的 PID 锁是权威守卫（随机端口无法用 netstat 判断桌面实例）；`process.kill(pid, 0)` + EPERM 兜底。
5. **bundle 装配幂等**：`ensureBundleInstalled` 先查 scoped 名 `@marecgents/dsh-hub` 已在 profile bundles → 直接 return；否则才建 junction + 追加。**防止同包双挂 = duplicate loader entry**。
6. **进程身份（hub-exe）**：`dsh-hub.exe`（应用）与 `dsh-hub-guard.exe`（守护）由 `hub-exe.mjs` 复制当前 node.exe + rcedit 打补丁生成，缓存于 `$DSH_HOME/dsh-hub/bin/`；stamp 记录 node 构建 + 包版本，node 升级自动重建。**不可**把补丁 exe 提交进 git；生成失败必须回退 cmd shim（老路径照常工作）。
7. **VBS 勿手改**：`launcher.vbs` 由 postinstall 生成（UTF-16LE BOM，含中文注释）；git 里它是模板，npm install 会重写——提交前确认无关改动则 `git checkout -- bin/launcher.vbs`。

## 代码质量

- 文件头注释：职责、模块类别、对外接口。
- 函数前 JSDoc；`log()` 统一写 `dsh.log`（每次启动 resetLog 防膨胀）。
- **Build 前推演**：改完本目录（纯 JS/MJS，无 build），先**逻辑推演**：锁获取/释放配对、marker 判别、多实例检测时序（在 spawn 前）、重启计数、错误路径（findDsh 失败/install 失败）→ 推演通过再验证（`node --check` + 实际启动）。
- 环境变量：`DSH_HUB_LAUNCHED`（门控）、`DSH_CMD`（显式 dsh 路径）——命名不得随意改动。
- Windows 专属：netstat/CIM/PowerShell MessageBox 均 Windows；文件头注明，未来 Tauri 迁移时 launcher 语义保留、实现替换。
