# 皮肤风格文档 — ZCode

> 本文件是该皮肤的开发 harness。**开发/修改 `skins.ts` 中 `zcode` 皮肤相关代码前，必须先读本文件**与根 [../../AGENTS.md](../../AGENTS.md) 3.1 节。
>
> 皮肤是新视觉风格，**不受 dsh 官方 UI 风格约束**（允许硬编码色值）；但默认皮肤与非皮肤代码仍严格受约束。

## 设计意图

**智谱 ZCode IDE 实测色板**。以实际运行的 ZCode IDE 取色为基准（非臆造）：浅色接近 VS Code 系中性灰白，深色为暗灰层次（内容 `#2b2b2b`、标题/状态栏更暗 `#161616`）。强调**中性、工程化、IDE 原生感**。

## 调色板

### 浅色（`body`）

| Token | 色值 | 说明 |
|---|---|---|
| bg-base / layer-1 / layer-2 / layer-3 | `#ffffff` / `#ececee` / `#ececee` / `#f8f8f8` | 内容白 → 面板灰 → 标题/状态栏亮灰（实测） |
| bg-overlay | `#f8f8f8` | 浮层亮灰 |
| label-primary / secondary / tertiary / dimmed | `#262626` / `#55565a` / `#8a8a8d` / `#b0b0b2` | 中性灰黑文字 |
| border-l1 / l2 / l3 | `#e3e3e5` / `#d9d9db` / `#c9c9cb` | 细灰边框 |
| brand-primary | `#0095df` | ZCode 品牌蓝 |
| brand-primary-invert / brand-text | `#ffffff` | 反白 |
| button-primary-fill / hover / dimmed | `#0095df` / `#007fbf` / `#d9edf9` | 蓝按钮 |
| interactive-bg-hover / active | `#e0e0e2` / `#d3d3d5` | 悬停灰 |
| markdown-code-block / inline-code | `#f4f4f6` / `#ececee` | 代码浅灰 |
| scrollbar-bg-l1 / hover-l1 | `#c8c8ca99`（半透明）/ `#a8a8aa` | 滚动条 |
| tooltip-bg / toast-bg | `#262626` | 深灰浮层 |
| bg-module-platform | `#f8f8f8` | 卡片徽章/模块底（= bg-layer-3） |
| state-success / error / warn / business | `#2da44e` / `#cf222e` / `#bf8700` / `#0095df` | 状态色（GitHub 系绿/红/黄） |

### 导航与浮层（`--dsw-specific-*`，浅色）

| Token | 色值 |
|---|---|
| sidebar-fill | `#ececee` |
| sidebar-nav-item-active-accent | `#0095df` |
| sidebar-nav-item-active | `#d9edf9` |
| sidebar-nav-item-hover | `#e0e0e2` |
| menu | `#f8f8f8` |

### 深色（`body[data-ds-dark-theme]`）

| Token | 色值 |
|---|---|
| bg-base / layer-1 / layer-2 / layer-3 | `#2b2b2b` / `#2b2b2b` / `#363636` / `#161616`（标题/状态栏更暗，实测） |
| bg-overlay | `#1f1f1f` |
| label-primary / secondary / tertiary / dimmed | `#dcdcdc` / `#a0a0a0` / `#888888` / `#6b6b6b` |
| border-l1 / l2 / l3 | `#3c3c3c` / `#545454` / `#626262` |
| brand-primary | `#0096e0` |
| brand-primary-invert / brand-text | `#161616` |
| button-primary-fill / hover / dimmed | `#0096e0` / `#1ba5e8` / `#1d3a47` |
| interactive-bg-hover / active | `#3a3a3a` / `#414141` |
| markdown-code-block / inline-code | `#232323` / `#363636` |
| scrollbar-bg-l1 / hover-l1 | `#54545499`（半透明）/ `#6e6e6e` |
| tooltip-bg / toast-bg | `#161616` |
| state-success / error / warn / business | `#3fb950` / `#f85149` / `#d29922` / `#0096e0` |
| bg-module-platform | `#161616` |

### 导航与浮层（`--dsw-specific-*`，深色）

| Token | 色值 |
|---|---|
| sidebar-fill | `#363636` |
| sidebar-nav-item-active-accent | `#0096e0` |
| sidebar-nav-item-active | `#1d3a47` |
| sidebar-nav-item-hover | `#3a3a3a` |
| menu | `#161616` |

## 覆盖的 token

`bg-*`、`label-*`、`border-*`、`brand-*`（含 invert/text）、`button-*`、`interactive-*`、`markdown-*`、`scrollbar-*`、`tooltip-bg`、`toast-bg`、`bg-module-platform`，全套 `state-*`（success/error/warn/business）——是目前**唯一覆盖状态色**的皮肤；以及 `--dsw-specific-*` 的 `sidebar-fill` / `sidebar-nav-item-*` / `menu`（左导航与浮层，见上表）。

## 与默认风格的关系

- 基于 dsh 原生语义 token 结构，仅替换色值。
- 品牌色用 ZCode 蓝 `#0095df` / `#0096e0`（深色略亮），区分于 dsh 官方蓝。
- 深色下 `bg-layer-3`（`#161616`）比 `bg-base`（`#2b2b2b`）更暗——模拟 ZCode 标题/状态栏，与常规"层越深越暗"的方向相反，是有意复刻实测值。

## 注意事项

- `scrollbar-bg-l1` 带 8 位透明度（`#c8c8ca99` / `#54545499`）——其它皮肤为不透明值；改动时勿丢失 alpha。
- 深色 `bg-layer-3` 比 `bg-base` 暗是**刻意**的（复刻 ZCode 实测），不要"修正"成常规渐变方向。
- 修改色板时同步更新本文件的色值表（单一事实来源：`src/client/skins.ts`）。
