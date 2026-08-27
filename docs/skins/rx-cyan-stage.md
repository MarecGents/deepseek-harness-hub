# 皮肤风格文档 — 青蓝舞台（rx-cyan-stage）

> 本文件是该皮肤的开发 harness。**开发/修改 `skins.ts` 中 `rx-cyan-stage` 皮肤相关代码前，必须先读本文件**与根 [../../AGENTS.md](../../AGENTS.md) 3.1 节。
>
> 皮肤是新视觉风格，**不受 dsh 官方 UI 风格约束**（允许硬编码色值）；但默认皮肤与非皮肤代码仍严格受约束。

## 设计意图

**移植自 Reasonix 桌面端官方主题包 `official-cyan-stage`**（参考仓库 `reference/DeepSeek-Reasonix-*`）。Reasonix 官方 Cyan Stage——冰川青蓝，冷静清晰。

## 移植规则

与 [rx-noir-gold.md](rx-noir-gold.md) 同一套规则（由移植生成器统一推导，禁止手改）：1:1 直映射（chat→bg-base、bgSoft→layer-1、panel→layer-3/menu、sidebar→sidebar-fill、fg/fgDim/fgFaint→label-*、accent→brand、border/borderSoft→border-l3/l1）+ 定向混合（tertiary/border-l2/button-dimmed/markdown-code-block/bubble 等）+ 夹取规则（浅色 dimmed 原值 < 3.5:1 时压暗 7%）。生成器回归检测与已提交条目逐键比对。

## 调色板

### 浅色（`body`）

| Token | 色值 |
|---|---|
| bg-base / layer-1 / layer-2 / layer-3 | `#F6FDFE` / `#E4F5F7` / `#E8F6F8` / `#FAFEFE` |
| bg-overlay | `#FAFEFE` |
| label-primary / secondary / tertiary / dimmed | `#173238` / `#43606A` / `#5A7A84` / `#698992` |
| border-l1 / l2 / l3 | `#DAEDF0` / `#BEE0E5` / `#9CCFD7` |
| brand-primary | `#007C92` |
| brand-primary-invert / brand-text | `#F1FCFD` / `#F1FCFD` |
| button-primary-fill / hover / dimmed | `#006D80` / `#006172` / `#D9EFF2` |
| interactive-bg-hover / active | `#E4F5F7` / `#E3F4F6` |
| markdown-code-block / inline-code | `#EDF9FA` / `#E4F5F7` |
| scrollbar-bg-l1 / hover-l1 | `#CAE6EA` / `#9CCFD7` |
| tooltip-bg / toast-bg | `#173238` / `#173238` |
| bg-module-platform | `#E8F6F8` |

### 导航与浮层（`--dsw-specific-*`，浅色）

| Token | 色值 |
|---|---|
| sidebar-fill | `#E3F4F6` |
| sidebar-nav-item-active-accent | `#007C92` |
| sidebar-nav-item-active | `#D9EFF2` |
| sidebar-nav-item-hover | `#E4F5F7` |
| menu | `#FAFEFE` |
| bubble / bubble-highlight | `#EDF9FA` / `#D9EFF2` |

### 深色（`body[data-ds-dark-theme]`）

| Token | 色值 |
|---|---|
| bg-base / layer-1 / layer-2 / layer-3 | `#0A2027` / `#0C2229` / `#0E252D` / `#112C34` |
| bg-overlay | `#14110D` |
| label-primary / secondary / tertiary / dimmed | `#E9FCFF` / `#AEDBE2` / `#8EC0C8` / `#6FA5AF` |
| border-l1 / l2 / l3 | `#16333C` / `#1A3B45` / `#1F4550` |
| brand-primary | `#37D7E4` |
| brand-primary-invert / brand-text | `#04222a` / `#04222a` |
| button-primary-fill / hover / dimmed | `#37D7E4` / `#4FDCE7` / `#0D434B` |
| interactive-bg-hover / active | `#0C2229` / `#0B2128` |
| markdown-code-block / inline-code | `#0B2128` / `#0C2229` |
| scrollbar-bg-l1 / hover-l1 | `#183841` / `#1F4550` |
| tooltip-bg / toast-bg | `#241F16` / `#241F16` |
| bg-module-platform | `#0E252D` |

### 导航与浮层（`--dsw-specific-*`，深色）

| Token | 色值 |
|---|---|
| sidebar-fill | `#0B2128` |
| sidebar-nav-item-active-accent | `#37D7E4` |
| sidebar-nav-item-active | `#0D434B` |
| sidebar-nav-item-hover | `#0C2229` |
| menu | `#112C34` |
| bubble / bubble-highlight | `#0E262E` / `#0C3D46` |

## 与默认风格的关系

- 基于 dsh 原生语义 token 结构，仅替换色值；不新增 DOM、不改变布局。
- 品牌色用 Reasonix Cyan Stage 的主题色系（浅 `#007C92` / 深 `#37D7E4`），区别于 dsh 官方蓝。
- 深/浅色 `bg-layer-3` 均比 layer-2 亮一步——浮层（menu）向亮侧走，符合 Reasonix 面板语义。

## 对比度与注意事项

- 主文字对比（bg-base）：浅 13.16:1 / 深 15.88:1，均 > 4.5:1；浅色 dimmed 3.65:1（< 3.5 时已被生成规则压暗）。
- 由`reasonix-port` 生成器产出；**修改色板时同步更新本文件的色值表**（单一事实来源：`src/client/skins.ts`），并优先改生成器规则以保持系列一致。
