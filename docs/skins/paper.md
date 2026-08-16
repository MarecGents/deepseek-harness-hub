# 皮肤风格文档 — 旧纸张（paper）

> 本文件是该皮肤的开发 harness。**开发/修改 `skins.ts` 中 `paper` 皮肤相关代码前，必须先读本文件**与根 [../../AGENTS.md](../../AGENTS.md) 3.1 节。
>
> 皮肤是新视觉风格，**不受 dsh 官方 UI 风格约束**（允许硬编码色值）；但默认皮肤与非皮肤代码仍严格受约束。

## 设计意图

**暖黄米色，护眼复古**。模拟旧纸张/羊皮纸质感：低饱和暖黄底 + 深棕文字，减少蓝光刺激，护眼且带复古书卷气。浅色为米黄纸张，深色为焦褐暗纸。

## 调色板

### 浅色（`body`）

| Token | 色值 | 说明 |
|---|---|---|
| bg-base / layer-1 / layer-2 / layer-3 | `#f4eee1` / `#ede4d2` / `#e7dcc6` / `#e0d3ba` | 米黄纸张分层 |
| bg-overlay | `#f8f2e7` | 浮层亮纸 |
| label-primary / secondary / tertiary / dimmed | `#3d3527` / `#5c513d` / `#7a6d54` / `#98896c` | 深棕文字层级 |
| border-l1 / l2 / l3 | `#d9cbaa` / `#cdbb94` / `#c0ab7f` | 亚麻边框 |
| brand-primary | `#7a5c2e` | 赭棕品牌色 |
| button-primary-fill / hover / dimmed | `#7a5c2e` / `#664c26` / `#e9dfc8` | 赭棕按钮 |
| interactive-bg-hover / active | `#e8ddc6` / `#e0d3b8` | 悬停米黄 |
| markdown-code-block / inline-code | `#e9dfc8` / `#e6dac0` | 代码米色 |
| scrollbar-bg / hover | `#d9cbaa` / `#c8b688` | 滚动条 |
| tooltip-bg / toast-bg | `#3d3527` | 深棕浮层 |
| bg-module-platform | `#e0d3ba` | 卡片徽章/模块底（= bg-layer-3） |

### 导航与浮层（`--dsw-specific-*`，浅色）

| Token | 色值 |
|---|---|
| sidebar-fill | `#ede4d2` |
| sidebar-nav-item-active-accent | `#7a5c2e` |
| sidebar-nav-item-active | `#e9dfc8` |
| sidebar-nav-item-hover | `#e8ddc6` |
| menu | `#e0d3ba` |

### 深色（`body[data-ds-dark-theme]`）

| Token | 色值 |
|---|---|
| bg-base / layer-1 / layer-2 / layer-3 | `#211d15` / `#2a2419` / `#332b1d` / `#3c3222` |
| bg-overlay | `#252016` |
| label-primary / secondary / tertiary / dimmed | `#e8dcc0` / `#b3a483` / `#93855f` / `#75684a` |
| border-l1 / l2 / l3 | `#3a3122` / `#463b29` / `#524430` |
| brand-primary | `#c9a45c` |
| button-primary-fill / hover / dimmed | `#8a6a33` / `#9d7a3e` / `#37301f` |
| interactive-bg-hover / active | `#322a1c` / `#3a3120` |
| markdown-code-block / inline-code | `#262015` / `#2e281b` |
| scrollbar-bg / hover | `#3a3122` / `#4a3f2b` |
| tooltip-bg / toast-bg | `#3d3527` |
| bg-module-platform | `#3c3222` |

### 导航与浮层（`--dsw-specific-*`，深色）

| Token | 色值 |
|---|---|
| sidebar-fill | `#2a2419` |
| sidebar-nav-item-active-accent | `#c9a45c` |
| sidebar-nav-item-active | `#37301f` |
| sidebar-nav-item-hover | `#322a1c` |
| menu | `#3c3222` |

## 覆盖的 token

`bg-*`、`label-*`、`border-*`、`brand-*`、`button-*`、`interactive-*`、`markdown-*`、`scrollbar-*`、`tooltip-bg`、`toast-bg`、`bg-module-platform`（语义色别名层），以及 `--dsw-specific-*` 的 `sidebar-fill` / `sidebar-nav-item-*` / `menu`（左导航与浮层，见上表）。

## 与默认风格的关系

- 基于 dsh 原生语义 token 结构，仅替换色值。
- 品牌色为暖赭棕（非 dsh 蓝），是风格区分点。
- 深色 bg 偏棕褐，营造暗纸感。

## 注意事项

- 暖色底上注意文字对比度（深棕 vs 米黄）。
- 修改色板时同步更新本文件的色值表（单一事实来源：`src/client/skins.ts`）。
