# 皮肤风格文档 — 午夜蓝（midnight）

> 本文件是该皮肤的开发 harness。**开发/修改 `skins.ts` 中 `midnight` 皮肤相关代码前，必须先读本文件**与根 [../../AGENTS.md](../../AGENTS.md) 3.1 节。
>
> 皮肤是新视觉风格，**不受 dsh 官方 UI 风格约束**（允许硬编码色值）；但默认皮肤与非皮肤代码仍严格受约束。

## 设计意图

**深海蓝调，冷静专注**。整体以冷蓝灰色阶构建沉浸式深海氛围，降低视觉噪点，适合长时间专注工作。浅色模式为明亮蓝灰（纸面清爽），深色模式为深海军蓝（低眩光）。

## 调色板

### 浅色（`body`）

| Token | 色值 | 说明 |
|---|---|---|
| bg-base / layer-1 / layer-2 / layer-3 | `#eef1f8` / `#e4e9f4` / `#dbe2f0` / `#d3dcec` | 蓝灰分层背景，由浅入深 |
| bg-overlay | `#f4f7fd` | 浮层最亮 |
| label-primary / secondary / tertiary / dimmed | `#1c2333` / `#3f4a63` / `#5b6884` / `#7c8aa8` | 深蓝黑文字层级 |
| border-l1 / l2 / l3 | `#d5dceb` / `#c4cfe2` / `#b3c0d8` | 蓝灰边框 |
| brand-primary | `#3b6fe0` | 主品牌蓝 |
| button-primary-fill / hover / dimmed | `#3b6fe0` / `#2f5cc4` / `#dbe4fa` | 按钮蓝系 |
| interactive-bg-hover / active | `#dce4f2` / `#cfd9ec` | 悬停/按下蓝灰 |
| markdown-code-block / inline-code | `#e2e8f4` / `#dde5f2` | 代码块浅蓝 |
| scrollbar-bg-l1 / hover-l1 | `#d5dceb` / `#c0cbe0` | 滚动条 |
| tooltip-bg / toast-bg | `#1c2333` | 深蓝黑浮层 |
| bg-module-platform | `#d3dcec` | 卡片徽章/模块底（= bg-layer-3） |

### 导航与浮层（`--dsw-specific-*`，浅色）

| Token | 色值 |
|---|---|
| sidebar-fill | `#e4e9f4` |
| sidebar-nav-item-active-accent | `#3b6fe0` |
| sidebar-nav-item-active | `#dbe4fa` |
| sidebar-nav-item-hover | `#dce4f2` |
| menu | `#d3dcec` |
| bubble / bubble-highlight | `#e8edf8` / `#dbe4fa` |

### 深色（`body[data-ds-dark-theme]`）

| Token | 色值 |
|---|---|
| bg-base / layer-1 / layer-2 / layer-3 | `#0a1222` / `#0f1a30` / `#14223c` / `#192a48` |
| bg-overlay | `#0c1528` |
| label-primary / secondary / tertiary / dimmed | `#dbe6ff` / `#9fb3d9` / `#7f93bb` / `#617297` |
| border-l1 / l2 / l3 | `#1c2b4a` / `#24365a` / `#2d4169` |
| brand-primary | `#5b8cff` |
| button-primary-fill / hover / dimmed | `#3b6fe0` / `#4c7ceb` / `#1d3050` |
| interactive-bg-hover / active | `#182742` / `#1f3150` |
| markdown-code-block / inline-code | `#0d1830` / `#14223c` |
| scrollbar-bg-l1 / hover-l1 | `#1c2b4a` / `#2b4068` |
| tooltip-bg / toast-bg | `#1c2333` |
| bg-module-platform | `#192a48` |

### 导航与浮层（`--dsw-specific-*`，深色）

| Token | 色值 |
|---|---|
| sidebar-fill | `#0f1a30` |
| sidebar-nav-item-active-accent | `#5b8cff` |
| sidebar-nav-item-active | `#1d3050` |
| sidebar-nav-item-hover | `#182742` |
| menu | `#192a48` |
| bubble / bubble-highlight | `#14223c` / `#1d3050` |

## 覆盖的 token

`bg-*`、`label-*`、`border-*`、`brand-*`、`button-*`、`interactive-*`、`markdown-*`、`scrollbar-*`、`tooltip-bg`、`toast-bg`、`bg-module-platform`（语义色别名层），以及 `--dsw-specific-*` 的 `sidebar-fill` / `sidebar-nav-item-*` / `menu` / `bubble` / `bubble-highlight`（左导航、会话气泡与浮层，见上表）。

## 与默认风格的关系

- 基于 dsh 原生语义 token 结构，仅替换色值，不改布局/字体/组件。
- 浅色下品牌蓝较官方更饱和（`#3b6fe0` vs 官方 deepseek 蓝系）。
- 深色下 bg-base 极深（`#0a1222`），对比度高于默认。

## 注意事项

- 保持两套（浅/深）色板均满足可读性对比度。
- 修改色板时同步更新本文件的色值表（单一事实来源：`src/client/skins.ts`）。
