# 皮肤风格文档 — 火花笔记（rx-spark-notebook）

> 本文件是该皮肤的开发 harness。**开发/修改 `skins.ts` 中 `rx-spark-notebook` 皮肤相关代码前，必须先读本文件**与根 [../../AGENTS.md](../../AGENTS.md) 3.1 节。
>
> 皮肤是新视觉风格，**不受 dsh 官方 UI 风格约束**（允许硬编码色值）；但默认皮肤与非皮肤代码仍严格受约束。

## 设计意图

**移植自 Reasonix 桌面端官方主题包 `official-spark-notebook`**（参考仓库 `reference/DeepSeek-Reasonix-*`）。Reasonix 官方 Spark Notebook——青瓷墨黑，专注书写。

## 移植规则

与 [rx-noir-gold.md](rx-noir-gold.md) 同一套规则（由移植生成器统一推导，禁止手改）：1:1 直映射（chat→bg-base、bgSoft→layer-1、panel→layer-3/menu、sidebar→sidebar-fill、fg/fgDim/fgFaint→label-*、accent→brand、border/borderSoft→border-l3/l1）+ 定向混合（tertiary/border-l2/button-dimmed/markdown-code-block/bubble 等）+ 夹取规则（浅色 dimmed 原值 < 3.5:1 时压暗 7%）。生成器回归检测与已提交条目逐键比对。

## 调色板

### 浅色（`body`）

| Token | 色值 |
|---|---|
| bg-base / layer-1 / layer-2 / layer-3 | `#FFFCF4` / `#F9F1DE` / `#FAF3E2` / `#FFFDF7` |
| bg-overlay | `#FFFDF7` |
| label-primary / secondary / tertiary / dimmed | `#2B2F35` / `#565D66` / `#6D757F` / `#7B838D` |
| border-l1 / l2 / l3 | `#F2E9D4` / `#E4D5B4` / `#D2BC8E` |
| brand-primary | `#007B78` |
| brand-primary-invert / brand-text | `#F3FBFA` / `#F3FBFA` |
| button-primary-fill / hover / dimmed | `#006C6A` / `#00605E` / `#DBEEED` |
| interactive-bg-hover / active | `#F9F1DD` / `#F8F0DD` |
| markdown-code-block / inline-code | `#FCF6E9` / `#F9F1DE` |
| scrollbar-bg-l1 / hover-l1 | `#EADEC2` / `#D2BC8E` |
| tooltip-bg / toast-bg | `#2B2F35` / `#2B2F35` |
| bg-module-platform | `#FAF3E2` |

### 导航与浮层（`--dsw-specific-*`，浅色）

| Token | 色值 |
|---|---|
| sidebar-fill | `#F8F0DC` |
| sidebar-nav-item-active-accent | `#007B78` |
| sidebar-nav-item-active | `#DBEEED` |
| sidebar-nav-item-hover | `#F9F1DD` |
| menu | `#FFFDF7` |
| bubble / bubble-highlight | `#FCF6E9` / `#DBEEED` |

### 深色（`body[data-ds-dark-theme]`）

| Token | 色值 |
|---|---|
| bg-base / layer-1 / layer-2 / layer-3 | `#191D21` / `#1B1F23` / `#1D2226` / `#23282D` |
| bg-overlay | `#14110D` |
| label-primary / secondary / tertiary / dimmed | `#F8F5E9` / `#C9CCBF` / `#AAAEA4` / `#8B918A` |
| border-l1 / l2 / l3 | `#2A3138` / `#303840` / `#38404A` |
| brand-primary | `#42D1C6` |
| brand-primary-invert / brand-text | `#08201E` / `#08201E` |
| button-primary-fill / hover / dimmed | `#42D1C6` / `#59D7CD` / `#12403C` |
| interactive-bg-hover / active | `#1B1F23` / `#1A1E22` |
| markdown-code-block / inline-code | `#1A1E22` / `#1B1F23` |
| scrollbar-bg-l1 / hover-l1 | `#2E353C` / `#38404A` |
| tooltip-bg / toast-bg | `#241F16` / `#241F16` |
| bg-module-platform | `#1D2226` |

### 导航与浮层（`--dsw-specific-*`，深色）

| Token | 色值 |
|---|---|
| sidebar-fill | `#1A1E22` |
| sidebar-nav-item-active-accent | `#42D1C6` |
| sidebar-nav-item-active | `#12403C` |
| sidebar-nav-item-hover | `#1B1F23` |
| menu | `#23282D` |
| bubble / bubble-highlight | `#1E2227` / `#113B37` |

## 与默认风格的关系

- 基于 dsh 原生语义 token 结构，仅替换色值；不新增 DOM、不改变布局。
- 品牌色用 Reasonix Spark Notebook 的主题色系（浅 `#007B78` / 深 `#42D1C6`），区别于 dsh 官方蓝。
- 深/浅色 `bg-layer-3` 均比 layer-2 亮一步——浮层（menu）向亮侧走，符合 Reasonix 面板语义。

## 对比度与注意事项

- 主文字对比（bg-base）：浅 13.12:1 / 深 15.52:1，均 > 4.5:1；浅色 dimmed 3.74:1（< 3.5 时已被生成规则压暗）。
- 由`reasonix-port` 生成器产出；**修改色板时同步更新本文件的色值表**（单一事实来源：`src/client/skins.ts`），并优先改生成器规则以保持系列一致。
