# 皮肤风格文档 — 终端绿（terminal）

> 本文件是该皮肤的开发 harness。**开发/修改 `skins.ts` 中 `terminal` 皮肤相关代码前，必须先读本文件**与根 [../../AGENTS.md](../../AGENTS.md) 3.1 节。
>
> 皮肤是新视觉风格，**不受 dsh 官方 UI 风格约束**（允许硬编码色值）；但默认皮肤与非皮肤代码仍严格受约束。

## 设计意图

**磷光绿，命令行质感**。致敬经典 CRT 终端：深绿黑底 + 磷光绿文字（深色模式），浅色模式为柔和薄荷绿（低刺激护眼）。整体强调"机器/代码"的硬核氛围。

## 调色板

### 浅色（`body`）

| Token | 色值 | 说明 |
|---|---|---|
| bg-base / layer-1 / layer-2 / layer-3 | `#eef5ec` / `#e2efe0` / `#d7e9d4` / `#cce3c9` | 薄荷绿分层背景 |
| bg-overlay | `#f2f8f0` | 浮层最亮 |
| label-primary / secondary / tertiary / dimmed | `#1d301c` / `#3a5436` / `#55774f` / `#74996d` | 深绿黑文字层级 |
| border-l1 / l2 / l3 | `#cfe3cc` / `#bfd8bb` / `#aecda9` | 淡绿边框 |
| brand-primary | `#2e7d32` | 主品牌绿 |
| brand-primary-invert / brand-text | `#f2f8f0` | 反白文字 |
| button-primary-fill / hover / dimmed | `#2e7d32` / `#266a2a` / `#d8ecd5` | 绿按钮 |
| interactive-bg-hover / active | `#dcebda` / `#d0e4ce` | 悬停淡绿 |
| markdown-code-block / inline-code | `#dfeede` / `#d8ead6` | 代码薄荷 |
| scrollbar-bg-l1 / hover-l1 | `#cfe3cc` / `#b9d6b4` | 滚动条 |
| tooltip-bg / toast-bg | `#1d301c` | 深绿黑浮层 |

### 深色（`body[data-ds-dark-theme]`）

| Token | 色值 |
|---|---|
| bg-base / layer-1 / layer-2 / layer-3 | `#0a130b` / `#0e1c10` / `#132614` / `#17301a` |
| bg-overlay | `#0b150d` |
| label-primary / secondary / tertiary / dimmed | `#a9f0a9` / `#6fae6f` / `#558d55` / `#3f6e3f` |
| border-l1 / l2 / l3 | `#1c3a20` / `#244928` / `#2c5831` |
| brand-primary | `#33ff88` |
| brand-primary-invert / brand-text | `#0a130b` |
| button-primary-fill / hover / dimmed | `#1f6e3a` / `#278346` / `#14301c` |
| interactive-bg-hover / active | `#11241a` / `#162b1e` |
| markdown-code-block / inline-code | `#0c180e` / `#102215` |
| scrollbar-bg-l1 / hover-l1 | `#1c3a20` / `#2a5230` |
| tooltip-bg / toast-bg | `#a9f0a9`（磷光绿浮层） |

## 覆盖的 token

`bg-*`、`label-*`、`border-*`、`brand-*`（含 `brand-primary-invert` / `brand-text`）、`button-*`、`interactive-*`、`markdown-*`、`scrollbar-*`（`scrollbar-bg-l1` / `scrollbar-hover-l1`）、`tooltip-bg`、`toast-bg`。

## 与默认风格的关系

- 基于 dsh 原生语义 token 结构，仅替换色值。
- 深色模式品牌绿 `#33ff88` 是典型的 CRT 磷光绿，是全套皮肤中最"终端"的。
- 浅色模式柔和薄荷，兼顾护眼与可读性。

## 注意事项

- 深色下 `tooltip-bg` / `toast-bg` 用亮磷光绿（`#a9f0a9`）+ 深色文字，与其它皮肤"深底浅字"相反——这是有意为之（终端反色提示），开发时勿按惯性改回深底。
- 磷光绿高饱和，注意大块面积（按钮/浮层）下的对比度。
- 修改色板时同步更新本文件的色值表（单一事实来源：`src/client/skins.ts`）。
