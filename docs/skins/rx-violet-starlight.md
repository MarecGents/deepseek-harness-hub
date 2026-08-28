# 皮肤风格文档 — 紫罗兰星光（rx-violet-starlight）

> 本文件是该皮肤的开发 harness。**开发/修改 `skins.ts` 中 `rx-violet-starlight` 皮肤相关代码前，必须先读本文件**与根 [../../AGENTS.md](../../AGENTS.md) 3.1 节。
>
> 皮肤是新视觉风格，**不受 dsh 官方 UI 风格约束**（允许硬编码色值）；但默认皮肤与非皮肤代码仍严格受约束。

## 设计意图

**移植自 Reasonix 桌面端官方主题包 `official-violet-starlight`**（参考仓库 `reference/DeepSeek-Reasonix-*`）。Reasonix 官方 Violet Starlight——星辉紫韵，沉静深邃。

## 移植规则

与 [rx-noir-gold.md](rx-noir-gold.md) 同一套规则（由移植生成器统一推导，禁止手改）：1:1 直映射（chat→bg-base、bgSoft→layer-1、panel→layer-3/menu、sidebar→sidebar-fill、fg/fgDim/fgFaint→label-*、accent→brand、border/borderSoft→border-l3/l1）+ 定向混合（tertiary/border-l2/button-dimmed/markdown-code-block/bubble 等）+ 夹取规则（浅色 dimmed 原值 < 3.5:1 时压暗 7%）。生成器回归检测与已提交条目逐键比对。

## 调色板

### 浅色（`body`）

| Token | 色值 |
|---|---|
| bg-base / layer-1 / layer-2 / layer-3 | `#FAF8FF` / `#EFEBFB` / `#F1EDFB` / `#FCFAFF` |
| bg-overlay | `#FCFAFF` |
| label-primary / secondary / tertiary / dimmed | `#251F3C` / `#544B74` / `#726A94` / `#877EA6` |
| border-l1 / l2 / l3 | `#E8E3F7` / `#DAD2F2` / `#CABDEC` |
| brand-primary | `#6242C7` |
| brand-primary-invert / brand-text | `#F7F4FF` / `#F7F4FF` |
| button-primary-fill / hover / dimmed | `#563AAF` / `#4C339B` / `#E8E2F9` |
| interactive-bg-hover / active | `#EFEAFB` / `#EEEAFA` |
| markdown-code-block / inline-code | `#F4F2FD` / `#EFEBFB` |
| scrollbar-bg-l1 / hover-l1 | `#E0DAF4` / `#CABDEC` |
| tooltip-bg / toast-bg | `#251F3C` / `#251F3C` |
| bg-module-platform | `#F1EDFB` |

### 导航与浮层（`--dsw-specific-*`，浅色）

| Token | 色值 |
|---|---|
| sidebar-fill | `#EEE9FA` |
| sidebar-nav-item-active-accent | `#6242C7` |
| sidebar-nav-item-active | `#E8E2F9` |
| sidebar-nav-item-hover | `#EFEAFB` |
| menu | `#FCFAFF` |
| bubble / bubble-highlight | `#F4F2FD` / `#E8E2F9` |

### 深色（`body[data-ds-dark-theme]`）

| Token | 色值 |
|---|---|
| bg-base / layer-1 / layer-2 / layer-3 | `#111630` / `#131834` / `#151B36` / `#1A2140` |
| bg-overlay | `#14110D` |
| label-primary / secondary / tertiary / dimmed | `#F4F2FF` / `#C2BDE8` / `#A49ED0` / `#8580B8` |
| border-l1 / l2 / l3 | `#222B4E` / `#273259` / `#2E3A66` |
| brand-primary | `#9B86FF` |
| brand-primary-invert / brand-text | `#14102E` / `#14102E` |
| button-primary-fill / hover / dimmed | `#9B86FF` / `#A795FF` / `#2C2554` |
| interactive-bg-hover / active | `#131833` / `#121733` |
| markdown-code-block / inline-code | `#121732` / `#131834` |
| scrollbar-bg-l1 / hover-l1 | `#252F54` / `#2E3A66` |
| tooltip-bg / toast-bg | `#241F16` / `#241F16` |
| bg-module-platform | `#151B36` |

### 导航与浮层（`--dsw-specific-*`，深色）

| Token | 色值 |
|---|---|
| sidebar-fill | `#121732` |
| sidebar-nav-item-active-accent | `#9B86FF` |
| sidebar-nav-item-active | `#2C2554` |
| sidebar-nav-item-hover | `#131833` |
| menu | `#1A2140` |
| bubble / bubble-highlight | `#161C38` / `#28224D` |

## 与默认风格的关系

- 基于 dsh 原生语义 token 结构，仅替换色值；不新增 DOM、不改变布局。
- 品牌色用 Reasonix Violet Starlight 的主题色系（浅 `#6242C7` / 深 `#9B86FF`），区别于 dsh 官方蓝。
- 深/浅色 `bg-layer-3` 均比 layer-2 亮一步——浮层（menu）向亮侧走，符合 Reasonix 面板语义。

## 对比度与注意事项

- 主文字对比（bg-base）：浅 14.88:1 / 深 16.08:1，均 > 4.5:1；浅色 dimmed 3.58:1（< 3.5 时已被生成规则压暗）。
- 由`reasonix-port` 生成器产出；**修改色板时同步更新本文件的色值表**（单一事实来源：`src/client/skins.ts`），并优先改生成器规则以保持系列一致。
