# 皮肤风格文档 — 绯红地平线（rx-crimson-horizon）

> 本文件是该皮肤的开发 harness。**开发/修改 `skins.ts` 中 `rx-crimson-horizon` 皮肤相关代码前，必须先读本文件**与根 [../../AGENTS.md](../../AGENTS.md) 3.1 节。
>
> 皮肤是新视觉风格，**不受 dsh 官方 UI 风格约束**（允许硬编码色值）；但默认皮肤与非皮肤代码仍严格受约束。

## 设计意图

**移植自 Reasonix 桌面端官方主题包 `official-crimson-horizon`**（参考仓库 `reference/DeepSeek-Reasonix-*`）。Reasonix 官方 Crimson Horizon——炽红地线，张力十足。

## 移植规则

与 [rx-noir-gold.md](rx-noir-gold.md) 同一套规则（由移植生成器统一推导，禁止手改）：1:1 直映射（chat→bg-base、bgSoft→layer-1、panel→layer-3/menu、sidebar→sidebar-fill、fg/fgDim/fgFaint→label-*、accent→brand、border/borderSoft→border-l3/l1）+ 定向混合（tertiary/border-l2/button-dimmed/markdown-code-block/bubble 等）+ 夹取规则（浅色 dimmed 原值 < 3.5:1 时压暗 7%）。生成器回归检测与已提交条目逐键比对。

## 调色板

### 浅色（`body`）

| Token | 色值 |
|---|---|
| bg-base / layer-1 / layer-2 / layer-3 | `#FFFBFA` / `#F9EEEC` / `#FBF1EF` / `#FFFFFF` |
| bg-overlay | `#FFFFFF` |
| label-primary / secondary / tertiary / dimmed | `#301D1D` / `#6B4644` / `#8A6360` / `#9D7774` |
| border-l1 / l2 / l3 | `#F6E4E2` / `#ECCECA` / `#DFB3AD` |
| brand-primary | `#B92B38` |
| brand-primary-invert / brand-text | `#FFF8F7` / `#FFF8F7` |
| button-primary-fill / hover / dimmed | `#A32631` / `#90222C` / `#F8E4E4` |
| interactive-bg-hover / active | `#F9EDEB` / `#F9EDEB` |
| markdown-code-block / inline-code | `#FCF4F3` / `#F9EEEC` |
| scrollbar-bg-l1 / hover-l1 | `#F0D8D5` / `#DFB3AD` |
| tooltip-bg / toast-bg | `#301D1D` / `#301D1D` |
| bg-module-platform | `#FBF1EF` |

### 导航与浮层（`--dsw-specific-*`，浅色）

| Token | 色值 |
|---|---|
| sidebar-fill | `#F9ECEA` |
| sidebar-nav-item-active-accent | `#B92B38` |
| sidebar-nav-item-active | `#F8E4E4` |
| sidebar-nav-item-hover | `#F9EDEB` |
| menu | `#FFFFFF` |
| bubble / bubble-highlight | `#FCF4F3` / `#F8E4E4` |

### 深色（`body[data-ds-dark-theme]`）

| Token | 色值 |
|---|---|
| bg-base / layer-1 / layer-2 / layer-3 | `#201116` / `#221318` / `#25141A` / `#2B181E` |
| bg-overlay | `#14110D` |
| label-primary / secondary / tertiary / dimmed | `#FFF1F2` / `#DFB3B6` / `#C6989D` / `#AC7E84` |
| border-l1 / l2 / l3 | `#361B24` / `#45242F` / `#582F3C` |
| brand-primary | `#FF6772` |
| brand-primary-invert / brand-text | `#2A0E12` / `#2A0E12` |
| button-primary-fill / hover / dimmed | `#FF6772` / `#FF7983` / `#501E23` |
| interactive-bg-hover / active | `#221318` / `#211218` |
| markdown-code-block / inline-code | `#211217` / `#221318` |
| scrollbar-bg-l1 / hover-l1 | `#3E202A` / `#582F3C` |
| tooltip-bg / toast-bg | `#241F16` / `#241F16` |
| bg-module-platform | `#25141A` |

### 导航与浮层（`--dsw-specific-*`，深色）

| Token | 色值 |
|---|---|
| sidebar-fill | `#211218` |
| sidebar-nav-item-active-accent | `#FF6772` |
| sidebar-nav-item-active | `#501E23` |
| sidebar-nav-item-hover | `#221318` |
| menu | `#2B181E` |
| bubble / bubble-highlight | `#26141A` / `#4A1B20` |

## 与默认风格的关系

- 基于 dsh 原生语义 token 结构，仅替换色值；不新增 DOM、不改变布局。
- 品牌色用 Reasonix Crimson Horizon 的主题色系（浅 `#B92B38` / 深 `#FF6772`），区别于 dsh 官方蓝。
- 深/浅色 `bg-layer-3` 均比 layer-2 亮一步——浮层（menu）向亮侧走，符合 Reasonix 面板语义。

## 对比度与注意事项

- 主文字对比（bg-base）：浅 15.49:1 / 深 16.58:1，均 > 4.5:1；浅色 dimmed 3.84:1（< 3.5 时已被生成规则压暗）。
- 由`reasonix-port` 生成器产出；**修改色板时同步更新本文件的色值表**（单一事实来源：`src/client/skins.ts`），并优先改生成器规则以保持系列一致。
