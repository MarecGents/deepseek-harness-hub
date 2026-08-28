# 皮肤风格文档 — 玫瑰晨光（rx-rose-dawn）

> 本文件是该皮肤的开发 harness。**开发/修改 `skins.ts` 中 `rx-rose-dawn` 皮肤相关代码前，必须先读本文件**与根 [../../AGENTS.md](../../AGENTS.md) 3.1 节。
>
> 皮肤是新视觉风格，**不受 dsh 官方 UI 风格约束**（允许硬编码色值）；但默认皮肤与非皮肤代码仍严格受约束。

## 设计意图

**移植自 Reasonix 桌面端官方主题包 `official-rose-dawn`**（参考仓库 `reference/DeepSeek-Reasonix-*`）。Reasonix 官方 Rose Dawn——玫瑰晨雾，柔和温暖。

## 移植规则

与 [rx-noir-gold.md](rx-noir-gold.md) 同一套规则（由移植生成器统一推导，禁止手改）：1:1 直映射（chat→bg-base、bgSoft→layer-1、panel→layer-3/menu、sidebar→sidebar-fill、fg/fgDim/fgFaint→label-*、accent→brand、border/borderSoft→border-l3/l1）+ 定向混合（tertiary/border-l2/button-dimmed/markdown-code-block/bubble 等）+ 夹取规则（浅色 dimmed 原值 < 3.5:1 时压暗 7%）。生成器回归检测与已提交条目逐键比对。

## 调色板

### 浅色（`body`）

| Token | 色值 |
|---|---|
| bg-base / layer-1 / layer-2 / layer-3 | `#FFFCFC` / `#FBEFF1` / `#FDF3F4` / `#FFFFFF` |
| bg-overlay | `#FFFFFF` |
| label-primary / secondary / tertiary / dimmed | `#3A252C` / `#6D4A55` / `#8B626E` / `#A97B87` |
| border-l1 / l2 / l3 | `#F5E3E7` / `#ECD1D8` / `#E2BCC6` |
| brand-primary | `#B43F65` |
| brand-primary-invert / brand-text | `#FFF7F8` / `#FFF7F8` |
| button-primary-fill / hover / dimmed | `#9E3759` / `#8C314F` / `#F8E5E9` |
| interactive-bg-hover / active | `#FBEEF0` / `#FBEDF0` |
| markdown-code-block / inline-code | `#FDF6F6` / `#FBEFF1` |
| scrollbar-bg-l1 / hover-l1 | `#F0D9DF` / `#E2BCC6` |
| tooltip-bg / toast-bg | `#3A252C` / `#3A252C` |
| bg-module-platform | `#FDF3F4` |

### 导航与浮层（`--dsw-specific-*`，浅色）

| Token | 色值 |
|---|---|
| sidebar-fill | `#FBECEF` |
| sidebar-nav-item-active-accent | `#B43F65` |
| sidebar-nav-item-active | `#F8E5E9` |
| sidebar-nav-item-hover | `#FBEEF0` |
| menu | `#FFFFFF` |
| bubble / bubble-highlight | `#FDF6F6` / `#F8E5E9` |

### 深色（`body[data-ds-dark-theme]`）

| Token | 色值 |
|---|---|
| bg-base / layer-1 / layer-2 / layer-3 | `#231820` / `#281B21` / `#2A1D24` / `#312329` |
| bg-overlay | `#14110D` |
| label-primary / secondary / tertiary / dimmed | `#FFF3F6` / `#D9B3C0` / `#C098A6` / `#A87C8C` |
| border-l1 / l2 / l3 | `#3A2832` / `#422D38` / `#4C3440` |
| brand-primary | `#E26D91` |
| brand-primary-invert / brand-text | `#2A121D` / `#2A121D` |
| button-primary-fill / hover / dimmed | `#E26D91` / `#E57F9E` / `#4B2232` |
| interactive-bg-hover / active | `#271A21` / `#261A22` |
| markdown-code-block / inline-code | `#261A20` / `#281B21` |
| scrollbar-bg-l1 / hover-l1 | `#3E2B36` / `#4C3440` |
| tooltip-bg / toast-bg | `#241F16` / `#241F16` |
| bg-module-platform | `#2A1D24` |

### 导航与浮层（`--dsw-specific-*`，深色）

| Token | 色值 |
|---|---|
| sidebar-fill | `#251922` |
| sidebar-nav-item-active-accent | `#E26D91` |
| sidebar-nav-item-active | `#4B2232` |
| sidebar-nav-item-hover | `#271A21` |
| menu | `#312329` |
| bubble / bubble-highlight | `#2A1E24` / `#46202E` |

## 与默认风格的关系

- 基于 dsh 原生语义 token 结构，仅替换色值；不新增 DOM、不改变布局。
- 品牌色用 Reasonix Rose Dawn 的主题色系（浅 `#B43F65` / 深 `#E26D91`），区别于 dsh 官方蓝。
- 深/浅色 `bg-layer-3` 均比 layer-2 亮一步——浮层（menu）向亮侧走，符合 Reasonix 面板语义。

## 对比度与注意事项

- 主文字对比（bg-base）：浅 13.90:1 / 深 15.87:1，均 > 4.5:1；浅色 dimmed 3.51:1（< 3.5 时已被生成规则压暗）。
- 由`reasonix-port` 生成器产出；**修改色板时同步更新本文件的色值表**（单一事实来源：`src/client/skins.ts`），并优先改生成器规则以保持系列一致。
