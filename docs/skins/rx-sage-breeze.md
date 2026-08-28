# 皮肤风格文档 — 鼠尾草微风（rx-sage-breeze）

> 本文件是该皮肤的开发 harness。**开发/修改 `skins.ts` 中 `rx-sage-breeze` 皮肤相关代码前，必须先读本文件**与根 [../../AGENTS.md](../../AGENTS.md) 3.1 节。
>
> 皮肤是新视觉风格，**不受 dsh 官方 UI 风格约束**（允许硬编码色值）；但默认皮肤与非皮肤代码仍严格受约束。

## 设计意图

**移植自 Reasonix 桌面端官方主题包 `official-sage-breeze`**（参考仓库 `reference/DeepSeek-Reasonix-*`）。Reasonix 官方 Sage Breeze——鼠尾草绿，自然清新。

## 移植规则

与 [rx-noir-gold.md](rx-noir-gold.md) 同一套规则（由移植生成器统一推导，禁止手改）：1:1 直映射（chat→bg-base、bgSoft→layer-1、panel→layer-3/menu、sidebar→sidebar-fill、fg/fgDim/fgFaint→label-*、accent→brand、border/borderSoft→border-l3/l1）+ 定向混合（tertiary/border-l2/button-dimmed/markdown-code-block/bubble 等）+ 夹取规则（浅色 dimmed 原值 < 3.5:1 时压暗 7%）。生成器回归检测与已提交条目逐键比对。

## 调色板

### 浅色（`body`）

| Token | 色值 |
|---|---|
| bg-base / layer-1 / layer-2 / layer-3 | `#FAFAF4` / `#EFEFE2` / `#F1F1E5` / `#FCFCF6` |
| bg-overlay | `#FCFCF6` |
| label-primary / secondary / tertiary / dimmed | `#26332D` / `#4E6157` / `#65786D` / `#73857A` |
| border-l1 / l2 / l3 | `#E8E8D8` / `#D6D6BA` / `#BFC095` |
| brand-primary | `#47735F` |
| brand-primary-invert / brand-text | `#F7F7EF` / `#F7F7EF` |
| button-primary-fill / hover / dimmed | `#3E6554` / `#375A4A` / `#E5EAE1` |
| interactive-bg-hover / active | `#EFEFE1` / `#EEEEE1` |
| markdown-code-block / inline-code | `#F4F4EB` / `#EFEFE2` |
| scrollbar-bg-l1 / hover-l1 | `#DEDEC7` / `#BFC095` |
| tooltip-bg / toast-bg | `#26332D` / `#26332D` |
| bg-module-platform | `#F1F1E5` |

### 导航与浮层（`--dsw-specific-*`，浅色）

| Token | 色值 |
|---|---|
| sidebar-fill | `#EEEEE0` |
| sidebar-nav-item-active-accent | `#47735F` |
| sidebar-nav-item-active | `#E5EAE1` |
| sidebar-nav-item-hover | `#EFEFE1` |
| menu | `#FCFCF6` |
| bubble / bubble-highlight | `#F4F4EB` / `#E5EAE1` |

### 深色（`body[data-ds-dark-theme]`）

| Token | 色值 |
|---|---|
| bg-base / layer-1 / layer-2 / layer-3 | `#151E19` / `#17211C` / `#19231D` / `#1E2922` |
| bg-overlay | `#14110D` |
| label-primary / secondary / tertiary / dimmed | `#EEF6F0` / `#B7CDBF` / `#9AB2A4` / `#7E968A` |
| border-l1 / l2 / l3 | `#25322B` / `#2B3A32` / `#32443A` |
| brand-primary | `#84CBA7` |
| brand-primary-invert / brand-text | `#0E1A13` / `#0E1A13` |
| button-primary-fill / hover / dimmed | `#84CBA7` / `#93D1B2` / `#233A2E` |
| interactive-bg-hover / active | `#17201B` / `#16201B` |
| markdown-code-block / inline-code | `#16201A` / `#17211C` |
| scrollbar-bg-l1 / hover-l1 | `#28362F` / `#32443A` |
| tooltip-bg / toast-bg | `#241F16` / `#241F16` |
| bg-module-platform | `#19231D` |

### 导航与浮层（`--dsw-specific-*`，深色）

| Token | 色值 |
|---|---|
| sidebar-fill | `#161F1A` |
| sidebar-nav-item-active-accent | `#84CBA7` |
| sidebar-nav-item-active | `#233A2E` |
| sidebar-nav-item-hover | `#17201B` |
| menu | `#1E2922` |
| bubble / bubble-highlight | `#1A241E` / `#203529` |

## 与默认风格的关系

- 基于 dsh 原生语义 token 结构，仅替换色值；不新增 DOM、不改变布局。
- 品牌色用 Reasonix Sage Breeze 的主题色系（浅 `#47735F` / 深 `#84CBA7`），区别于 dsh 官方蓝。
- 深/浅色 `bg-layer-3` 均比 layer-2 亮一步——浮层（menu）向亮侧走，符合 Reasonix 面板语义。

## 对比度与注意事项

- 主文字对比（bg-base）：浅 12.58:1 / 深 15.49:1，均 > 4.5:1；浅色 dimmed 3.74:1（< 3.5 时已被生成规则压暗）。
- 由`reasonix-port` 生成器产出；**修改色板时同步更新本文件的色值表**（单一事实来源：`src/client/skins.ts`），并优先改生成器规则以保持系列一致。
