# 工作日志：SPT 分层重构 + Tauri-only 推进（2026-08-18）

> 本日志整理当前 dev-v2 分支上的推进过程、修改内容、审查结果与待办。
> 遵循：`AGENTS.md`、`PROCESS_QUALITY.md`。

---

## 1. 背景与目标

- 仓库：`E:\Workdata\Git_repositories\deepseek\deepseek-harness-hub`
- 当前分支：`dev-v2`
- 目标：
  1. 保证 rc.14 功能在 Tauri 壳中完整有效；
  2. dev-v2 明确为 **Tauri-only** 开发线；
  3. 参考 `E:\Workdata\Git_repositories\SPT\server-csharp-4.1.2` 的架构思想，按职责分层重构。

---

## 2. 推进阶段

### Phase 1：Tauri 功能覆盖审查

- 静态审查 Tauri 壳对 rc.14 功能的覆盖：
  - 窗口 / 托盘 / 主题 / 通知 / 提示音 / 单实例 / quit.marker
  - 设置卡 / 右侧栏 / 置顶 / 皮肤 / 背景
  - `MG_TRAY` / `DSH_CMD` / `invoke` / `win.eval` 共生链路
- 修复：
  - `src-tauri/src/lib.rs`
    - 新增 `restore_window_state()`，启动时恢复 `maximized`；
    - resize 保存真实 `is_maximized()`。
  - `src/bridge/tauri.ts`
    - `WorkspacePath` 端点对齐 `/api/dsh-hub/bridge/workspace`。

### Phase 2：WebView2 遗留冻结

- 将 `src/managers/desktop.ts`、`src/managers/tray.ts` 标记为：

```text
[FROZEN WebView2 legacy]
```

- 更新 `T3.7-bin-legacy-frozen-list.md`，确认 `bin/` 下 WebView2 启动链冻结。
- 更新 `src/AGENTS.md`，明确 dev-v2 不把 WebView2 作为功能承诺。

### Phase 3：SPT 职责分层收口

新增/调整：

- `src/models/plugin-config.ts`
- `src/services/config-store.ts`
- `src/services/pins-store.ts`
- `src/controllers/shell-runtime.ts`
- `src/index.ts` 改为从 controllers/services 引入能力
- 同步更新：
  - `src/AGENTS.md`
  - `src/controllers/AGENTS.md`
  - `src/services/AGENTS.md`
  - `src/models/AGENTS.md`
  - `README.md`

分层目标：

```text
host:  index.ts → controllers → core → managers/server/services → helpers → models/utils
Rust:  lib.rs → commands → managers/services → helpers
```

---

## 3. 已生成的审查文档

- `docs/tauri-migration/Phase1-Tauri功能覆盖审查-2026-08-18.md`
- `docs/tauri-migration/Phase2-WebView2冻结审查-2026-08-18.md`
- `docs/tauri-migration/Phase3-SPT分层收口审查-2026-08-18.md`
- `docs/tauri-migration/SPT分层-TauriOnly-阶段审查-2026-08-18.md`

---

## 4. 验证状态

当前工具环境无法执行 shell（win32 终端不可用），因此尚未运行：

```sh
npm run build
npm run build:client
cargo clippy --all-targets
cargo test
cargo build
```

下一步需要在本机执行上述命令，若出现错误再按 DMAIC 修复。

---

## 5. 环境备注

- Rust 路径：`D:\Tools\Environment\rust`
- GitHub CLI 路径：`D:\Tools\GitHub CLI`
- Node.js：当前使用 `nvm` 管理，当前版本为 `24.18.0`
- 用户执行 `nvm uninstall 24.18.0` 时提示 `Error removing node v24.18.0`，需手动删除：
  - `D:\Tools\Environment\NodeJs\nvm\v24.18.0`

---

## 6. 后续待办

1. 本机执行 `npm run build && npm run build:client`
2. 本机执行 `cargo clippy --all-targets && cargo test && cargo build`
3. 按构建/E2E 结果修复回归
4. Tauri 打包验证通过后，将 WebView2 冻结文件物理移入 `bin/legacy/` 或删除
5. 继续维护 SPT 分层约束与文档同步
