# 皮肤风格文档 — 极光紫（aurora）

> 本文件是该皮肤的开发 harness。**开发/修改 `skins.ts` 中 `aurora` 皮肤相关代码前，必须先读本文件**与根 [../../AGENTS.md](../../AGENTS.md) 3.1 节。
>
> 皮肤是新视觉风格，**不受 dsh 官方 UI 风格约束**（允许硬编码色值）；但默认皮肤与非皮肤代码仍严格受约束。

## 设计意图

**紫罗兰辉光，梦幻渐变**。以极光/紫罗兰为主题：浅色为淡紫罗兰（轻盈梦幻），深色为深空紫（深邃神秘）。品牌紫 `#7c5cff` 亮丽高饱和，是全套皮肤中最"个性"的配色。

## 调色板

### 浅色（`body`）

| Token | 色值 | 说明 |
|---|---|---|
| bg-base / layer-1 / layer-2 / layer-3 | `#f1eefb` / `#e8e4f7` / `#e0daf4` / `#d8d0f0` | 淡紫罗兰分层 |
| bg-overlay | `#f5f2fd` | 浮层最亮 |
| label-primary / secondary / tertiary / dimmed | `#241f3d` / `#453d6b` / `#645a94` / `#8377b8` | 深紫黑文字 |
| border-l1 / l2 / l3 | `#d6cdf0` / `#c7bce8` / `#b7a9df` | 淡紫边框 |
| brand-primary | `#7c5cff` | 主品牌紫 |
| brand-primary-invert / brand-text | `#f5f2fd` | 反白 |
| button-primary-fill / hover / dimmed | `#7c5cff` / `#6a4ae8` / `#e0d8fb` | 紫按钮 |
| interactive-bg-hover / active | `#e6e0f8` / `#dcd3f4` | 悬停淡紫 |
| markdown-code-block / inline-code | `#e4def7` / `#ded6f4` | 代码淡紫 |
| scrollbar-bg-l1 / hover-l1 | `#d6cdf0` / `#c3b6e6` | 滚动条 |
| tooltip-bg / toast-bg | `#241f3d` | 深紫浮层 |
| bg-module-platform | `#d8d0f0` | 卡片徽章/模块底（= bg-layer-3） |

### 导航与浮层（`--dsw-specific-*`，浅色）

| Token | 色值 |
|---|---|
| sidebar-fill | `#e8e4f7` |
| sidebar-nav-item-active-accent | `#7c5cff` |
| sidebar-nav-item-active | `#e0d8fb` |
| sidebar-nav-item-hover | `#e6e0f8` |
| menu | `#d8d0f0` |
| bubble / bubble-highlight | `#ece7fa` / `#e0d8fb` |

### 深色（`body[data-ds-dark-theme]`）

| Token | 色值 |
|---|---|
| bg-base / layer-1 / layer-2 / layer-3 | `#0e0d1d` / `#151331` / `#1c1a40` / `#24214e` |
| bg-overlay | `#100f21` |
| label-primary / secondary / tertiary / dimmed | `#e2dcff` / `#a79fe0` / `#877dc4` / `#665ca6` |
| border-l1 / l2 / l3 | `#2b2760` / `#35306f` / `#3f397e` |
| brand-primary | `#9f7cff` |
| brand-primary-invert / brand-text | `#0e0d1d` |
| button-primary-fill / hover / dimmed | `#6a45e8` / `#7a57f0` / `#241f4d` |
| interactive-bg-hover / active | `#1c1940` / `#24214b` |
| markdown-code-block / inline-code | `#121026` / `#191632` |
| scrollbar-bg-l1 / hover-l1 | `#2b2760` / `#3a3480` |
| tooltip-bg / toast-bg | `#151331` | 深紫浮层 |
| bg-module-platform | `#24214e` |

### 导航与浮层（`--dsw-specific-*`，深色）

| Token | 色值 |
|---|---|
| sidebar-fill | `#151331` |
| sidebar-nav-item-active-accent | `#9f7cff` |
| sidebar-nav-item-active | `#241f4d` |
| sidebar-nav-item-hover | `#1c1940` |
| menu | `#24214e` |
| bubble / bubble-highlight | `#1c1a40` / `#241f4d` |

## 覆盖的 token

`bg-*`、`label-*`、`border-*`、`brand-*`（含 invert/text）、`button-*`、`interactive-*`、`markdown-*`、`scrollbar-*`、`tooltip-bg`、`toast-bg`、`bg-module-platform`，以及 `--dsw-specific-*` 的 `sidebar-fill` / `sidebar-nav-item-*` / `menu` / `bubble` / `bubble-highlight`（左导航、会话气泡与浮层，见上表）。

## 与默认风格的关系

- 基于 dsh 原生语义 token 结构，仅替换色值。
- 品牌紫 `#7c5cff`（浅）/ `#9f7cff`（深）与 dsh 官方蓝差异最大，视觉个性最强。
- 深色下 `tooltip-bg` / `toast-bg` 用深紫（`#151331`），浮层文字（官方白）可读；早期版本曾用亮紫白（`#e2dcff`）导致官方白字不可读，2026-08-16 修复为深底。

## 注意事项

- 深色模式下浮层（tooltip/toast）为深底浅字（`#151331`），勿改回亮底。
- 紫色在低亮度下易偏灰，注意 `label-dimmed`（`#665ca6`）在小字号场景的可读性。
- 修改色板时同步更新本文件的色值表（单一事实来源：`src/client/skins.ts`）。
