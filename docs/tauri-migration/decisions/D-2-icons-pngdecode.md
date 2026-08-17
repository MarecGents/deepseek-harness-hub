# D-2 icons/png-decode 去留决策

> 日期：2026-08-17 · 拍板权：迁移执行 agent · SOP 任务：T2.6（M3 前落地）

## 决策

**保留 Node 侧 icons.ts / png-decode.ts，标记 M4 冻结清单**（Rust 侧暂不替换）。

### 选项分析

| 选项 | 复杂度 | 体积 | 跨平台 | 推荐 |
|---|---|---|---|---|
| a) Rust `image` crate + ICO 解码 | 中 | +200KB crate 依赖 | 仅 Windows ICO | 体积增大 |
| b) 保留 Node 侧 + 侧边栏图标经桥下行 | 低 | 0 增量 | 需桥支持 | ✅ 当前 |

### 理由

- 当前唯一需要动态图标的是**托盘图标**（M3 已用 `Image::from_path` 加载 32×32 PNG，`tauri image-png` feature 已启用）
- `icons.ts` 的 `setAppUserModelId` / `setTaskbarIcon` 是 Windows 专属，在 Tauri 壳层 Rust 原生替代（`tauri::window::set_icon`）
- `png-decode.ts` 纯 Node 侧图片解码，Rust 壳不依赖
- M4 冻结清单登记：`icons.ts` / `png-decode.ts` → `bin/legacy/`（T3.7）
