# AGENTS.md — bin/（shell 进程辅助层）开发约束

> 本目录是 dsh-hub 的 **shell 进程辅助层**。当前仅含 `bin/dsh-web-sidecar.mjs`（M4/T4.3 辅助脚本，M5 externalBin 场景预留）。
> 改动本目录任何文件前，**必须**先读根 [../AGENTS.md](../AGENTS.md) 与本文件。
>
> **WebView2 时代 launcher 家族已删除**（`launcher.mjs` / `dsh-hub.mjs` / `hub-exe.mjs` / `lock.mjs` / `multi-instance.mjs` / `tray-helper.mjs` / `launcher.vbs`）。其职责已由 **`src-tauri/src/lib.rs`（壳入口）+ `src-tauri/src/managers/node.rs`（Node sidecar 管理）+ `scripts/assemble-profile.mjs`（运行 profile 装配）** 承担；本目录不再包含任何启动器 / 托盘 / VBS 文件。

## 职责

| 文件 | 模块类别 | 职责 |
|---|---|---|
| `dsh-web-sidecar.mjs` | **Helper（bin 层辅助）** | ① 解析 `DSH_HOME`（env 或 `~/.dsh`）；② 调用 `scripts/assemble-profile.mjs`（传 `DSH_HOME` + `DSH_HUB_PACKAGE_ROOT=<仓库根>`）确保 web profile 装配（scoped bundle + junction 自愈，幂等）；③ 解析 node 路径（`DSH_HUB_NODE` env → PATH → `npm prefix -g`）；④ 解析 dsh 入口（`npm prefix -g` 下 `@deepseek-ai/dsh/lib/bin.js` → dsh 命令）；⑤ stdout 输出 JSON 摘要 |

## 对外接口（不可破坏）

```
node bin/dsh-web-sidecar.mjs [--json]
  stdout — 纯 JSON（默认单行；--json 格式化多行），供调用方解析
  stderr — 人类可读诊断（含 assemble-profile 日志转发）
  退出码 — 0 = 装配成功（node/dsh 未解析到仅 stderr 告警，不失败）
           1 = 装配失败或脚本错误
测试：DSH_HOME=<临时目录> node bin/dsh-web-sidecar.mjs
```

## 环境变量语义（命名不得随意改动）

- **`DSH_HOME`**：目标 dsh 数据目录（隔离测试 = 临时目录；缺省 `~/.dsh`）。sidecar 透传给 assemble-profile（后续 dsh web 进程由 Rust 壳 spawn 时注入）。
- **`DSH_HUB_PACKAGE_ROOT`**：profile 装配时 scoped junction 的目标路径（dev = 仓库根；M5 打包后 = externalBin 内嵌资产路径，`assemble-profile.mjs` 另支持 `--package-root` 显式覆盖）。**dev 仍以 junction 方式进入（隔离的）运行 profile**——这是装配自愈机制的一部分（踩坑 #33/#34），不是 WebView2 时代遗留。
- **`DSH_HUB_NODE`**：显式指定 node 可执行文件路径（优先于 PATH / `npm prefix -g` 探测）；M5 externalBin 场景用于锁定随包 node。

## 铁律

1. **spawn 语义在 Rust 壳**：`dsh web --port 0` 由 `src-tauri/src/managers/node.rs` spawn（`--port 0` 不可改，改固定端口会与 3080 CLI 冲突）；本脚本**不做 spawn**，只装配 + 解析 + 输出 JSON。
2. **装配幂等**：`assemble-profile.mjs` 先查 scoped 名 `@marecgents/dsh-hub` 已在 profile bundles → 直接 return；否则才建 junction + 追加。**防止同包双挂 = duplicate loader entry**（踩坑 #34）。
3. **scoped 装配不可回退 bare**：junction 只能建 `node_modules/@marecgents/dsh-hub`（scoped），bundles 只注册 scoped 名；bare 遗留（junction 或 bundle 名）幂等清理（踩坑 #33）。
4. **不复制 cordis.patch.yml**：bundles 是唯一装载机制；复制 patch = `duplicate loader entry id: dsh-hub` 启动即崩（踩坑 #34）。
5. **stdout 纯净**：stdout 只输出 JSON 摘要；一切日志走 stderr（人类可读诊断）。
6. **Windows 专属**：spawn 一律 `windowsHide`（CREATE_NO_WINDOW，防控制台闪现）；文件头注明平台依赖。

## 代码质量

- 文件头注释：职责、模块类别、对外接口。
- 函数前 JSDoc；错误路径不静默（`run.error` 必须写 stderr）。
- **Build 前推演**：改完本目录（纯 JS/MJS，无 build），先**逻辑推演**：env 透传、路径解析优先级、退出码语义、stdout/stderr 分离 → 推演通过再验证（`node --check` + `DSH_HOME=<临时目录> node bin/dsh-web-sidecar.mjs`）。
