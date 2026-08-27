# 皮肤风格文档 — 黑金（rx-noir-gold）

> 本文件是该皮肤的开发 harness。**开发/修改 `skins.ts` 中 `rx-noir-gold` 皮肤相关代码前，必须先读本文件**与根 [../../AGENTS.md](../../AGENTS.md) 3.1 节。
>
> 皮肤是新视觉风格，**不受 dsh 官方 UI 风格约束**（允许硬编码色值）；但默认皮肤与非皮肤代码仍严格受约束。

## 设计意图

**移植自 Reasonix 桌面端官方主题包 `official-noir-gold`**（`desktop/themes/official/official-noir-gold/theme.json`，参考仓库 `reference/DeepSeek-Reasonix-*`）。Noir Gold = 「黑金」：浅色为暖白纸金（奶油纸面 + 低饱和金棕强调），深色为墨黑鎏金（近黑暖底 + 哑金强调）——成熟、沉稳、工程质感。本皮肤是 dsh-hub 引入 Reasonix 风格系列的第一套样板。

## 移植规则（忠实优先，推导有据）

- **1:1 直映射**（Reasonix token → dsh token）：`chat→bg-base`、`bgSoft→bg-layer-1`、`bgElev/panel→bg-layer-3/menu`、`sidebar→sidebar-fill`、`fg/fgDim/fgFaint→label-primary/secondary/dimmed`、`accent/accentFg→brand-primary/brand-text/invert`、`border→border-l3`、`borderSoft→border-l1`。
- **推导值**（Reasonix 无对应 token 的中间层，统一规则）：
  - `label-tertiary` = mix(fgDim, fgFaint, 0.5)；`border-l2` = mix(borderSoft, border, 0.45)
  - `button-primary-fill` = accent（深色原值；浅色压暗 0.88 提可读）；`hover` = 再压暗 0.78（浅）/ lighten 12%（深）；`dimmed` = mix(accentFg, accent, 10% 浅 / 18% 深) 金色洗色
  - `interactive-*`、`sidebar-nav-item-hover` = mix(bgSoft, sidebar, 35%/60%)
  - `markdown-code-block` = mix(chat, bgSoft, 0.5)；`inline-code` = bgSoft
  - `scrollbar-bg-l1` = mix(borderSoft, border, 0.25)；`hover` = border
  - `bubble` = mix(chat, bgSoft, 0.5)（浅）/ mix(chat, bgElev, 0.5)（深，气泡比背景亮一度）
  - `bubble-highlight` / `sidebar-nav-item-active` = accent 洗色（同 dimmed 规则）
  - `bg-module-platform` = workspaceFiles（浅）/ panel（深）——比 bg-base 向内容侧走一步
  - `bg-layer-2` = workspaceFiles（浅）/ panel（深）；`bg-overlay` = panel（浅）/ sidebar（深）

## 调色板

### 浅色（`body`）

| Token | 色值 | 说明 |
|---|---|---|
| bg-base / layer-1 / layer-2 / layer-3 | `#FDFAF2` / `#F6F0DF` / `#F7F1E1` / `#FEFBF4` | 暖白纸面（chat/soft/workspaceFiles/panel） |
| bg-overlay | `#FEFBF4` | 浮层纸面 |
| label-primary / secondary / tertiary / dimmed | `#2A241B` / `#5C5340` / `#7B715A` / `#8F8469` | 暖棕灰文字（dimmed 调深至 ≥3.5:1，见注意事项） |
| border-l1 / l2 / l3 | `#EFE8D2` / `#DFD5B6` / `#CCBE94` | 浅金分隔线 |
| brand-primary | `#7A5A16` | 金棕 |
| brand-primary-invert / brand-text | `#FCF8EE` | 反白奶油 |
| button-primary-fill / hover / dimmed | `#6B4F13` / `#5F4611` / `#EFE8D8` | 金棕按钮 |
| interactive-bg-hover / active | `#F6F0DE` / `#F5EFDE` | 暖灰悬停 |
| markdown-code-block / inline-code | `#FAF5E8` / `#F6F0DF` | 代码浅纸 |
| scrollbar-bg-l1 / hover-l1 | `#E6DEC2` / `#CCBE94` | 滚动条 |
| tooltip-bg / toast-bg | `#2A241B` | 深暖浮层 |
| bg-module-platform | `#F7F1E1` | 卡片徽章/模块底 |

### 导航与浮层（`--dsw-specific-*`，浅色）

| Token | 色值 |
|---|---|
| sidebar-fill | `#F5EFDD` |
| sidebar-nav-item-active-accent | `#7A5A16` |
| sidebar-nav-item-active | `#EFE8D8` |
| sidebar-nav-item-hover | `#F6F0DE` |
| menu | `#FEFBF4` |
| bubble / bubble-highlight | `#FAF5E8` / `#EFE8D8` |

### 深色（`body[data-ds-dark-theme]`）

| Token | 色值 |
|---|---|
| bg-base / layer-1 / layer-2 / layer-3 | `#131009` / `#15120E` / `#171410` / `#1D1913` |
| bg-overlay | `#14110D` |
| label-primary / secondary / tertiary / dimmed | `#F8F1DF` / `#D6CBAE` / `#B6AC8E` / `#968C6E` |
| border-l1 / l2 / l3 | `#2A2418` / `#372E1F` / `#463B27` |
| brand-primary | `#D9B45B` |
| brand-primary-invert / brand-text | `#1D1503` |
| button-primary-fill / hover / dimmed | `#D9B45B` / `#DEBD6F` / `#3F3213` |
| interactive-bg-hover / active | `#15120E` / `#14110D` |
| markdown-code-block / inline-code | `#14110C` / `#15120E` |
| scrollbar-bg-l1 / hover-l1 | `#312A1C` / `#463B27` |
| tooltip-bg / toast-bg | `#241F16` |
| bg-module-platform | `#171410` |

### 导航与浮层（`--dsw-specific-*`，深色）

| Token | 色值 |
|---|---|
| sidebar-fill | `#14110D` |
| sidebar-nav-item-active-accent | `#D9B45B` |
| sidebar-nav-item-active | `#3F3213` |
| sidebar-nav-item-hover | `#15120E` |
| menu | `#1D1913` |
| bubble / bubble-highlight | `#18140E` / `#392D10` |

## 对比度校验（WCAG，脚本实测）

- 主文字：浅 14.7:1（bg-base）/ 13.4:1（侧栏）/ 14.9:1（menu）；深 16.9:1 / 16.7:1 / 15.5:1 —— 全部 ≥ 7:1
- 次文字：浅 7.3:1 / 深 11.8:1 —— ≥ 4.5:1
- 按钮反白（brand-text on fill）：浅 7.2:1 / 深 9.2:1 —— ≥ 4.5:1
- 浅色 dimmed 3.6:1、tertiary 4.2:1、深色 dimmed 5.7:1 —— 装饰性弱化层级，达同角色阈值

## 与默认风格的关系

- 基于 dsh 原生语义 token 结构，仅替换色值；不新增 DOM、不改变布局。
- 品牌色用 Reasonix Noir Gold 的金棕（`#7A5A16` / 深色 `#D9B45B`），区别于 dsh 官方蓝。
- 深色 `bg-layer-3`（`#1D1913`）与浅色 `bg-layer-3`（`#FEFBF4`）均比 layer-2 亮一步——浮层（menu）向亮侧走，符合 Reasonix 面板语义。

## 注意事项

- 引入后续 Reasonix 皮肤时沿用本文件的映射/推导规则（批量移植的一致性基础）。
- 浅色 `label-dimmed` 从 Reasonix 原值 `#9A8F74`（3.07:1）压至 `#8F8469`（3.6:1）是有意修正，改色板勿回退到低于 3.5:1。
- `tooltip-bg`：浅色用 `label-primary`（深底白字）、深色用 `#241F16`（暖黑浮层）——勿改成浅色浮层（会破坏 tooltip 白字对比）。
- 修改色板时同步更新本文件的色值表（单一事实来源：`src/client/skins.ts`）。