# 皮肤风格文档 — 熔炉金红（rx-fortune-forge）

> 本文件是该皮肤的开发 harness。**开发/修改 `skins.ts` 中 `rx-fortune-forge` 皮肤相关代码前，必须先读本文件**与根 [../../AGENTS.md](../../AGENTS.md) 3.1 节。
>
> 皮肤是新视觉风格，**不受 dsh 官方 UI 风格约束**（允许硬编码色值）；但默认皮肤与非皮肤代码仍严格受约束。

## 设计意图

**移植自 Reasonix 桌面端官方主题包 `official-fortune-forge`**（参考仓库 `reference/DeepSeek-Reasonix-*`）。Reasonix 官方 Fortune Forge——锻炉金红，炽热专注。

## 移植规则

与 [rx-noir-gold.md](rx-noir-gold.md) 同一套规则（由移植生成器统一推导，禁止手改）：1:1 直映射（chat→bg-base、bgSoft→layer-1、panel→layer-3/menu、sidebar→sidebar-fill、fg/fgDim/fgFaint→label-*、accent→brand、border/borderSoft→border-l3/l1）+ 定向混合（tertiary/border-l2/button-dimmed/markdown-code-block/bubble 等）+ 夹取规则（浅色 dimmed 原值 < 3.5:1 时压暗 7%）。生成器回归检测与已提交条目逐键比对。

## 调色板

### 浅色（`body`）

| Token | 色值 |
|---|---|
| bg-base / layer-1 / layer-2 / layer-3 | `#FFFBF1` / `#F9EFD5` / `#FAF1DC` / `#FFFDF6` |
| bg-overlay | `#FFFDF6` |
| label-primary / secondary / tertiary / dimmed | `#382116` / `#6E4E35` / `#8C6C4E` / `#9D8061` |
| border-l1 / l2 / l3 | `#F2E7CD` / `#E5D2A9` / `#D6B87E` |
| brand-primary | `#A92D22` |
| brand-primary-invert / brand-text | `#FFF8E8` / `#FFF8E8` |
| button-primary-fill / hover / dimmed | `#95281E` / `#84231B` / `#F6E4D4` |
| interactive-bg-hover / active | `#F9EED4` / `#F8EED4` |
| markdown-code-block / inline-code | `#FCF5E3` / `#F9EFD5` |
| scrollbar-bg-l1 / hover-l1 | `#EBDBB9` / `#D6B87E` |
| tooltip-bg / toast-bg | `#382116` / `#382116` |
| bg-module-platform | `#FAF1DC` |

### 导航与浮层（`--dsw-specific-*`，浅色）

| Token | 色值 |
|---|---|
| sidebar-fill | `#F8EDD3` |
| sidebar-nav-item-active-accent | `#A92D22` |
| sidebar-nav-item-active | `#F6E4D4` |
| sidebar-nav-item-hover | `#F9EED4` |
| menu | `#FFFDF6` |
| bubble / bubble-highlight | `#FCF5E3` / `#F6E4D4` |

### 深色（`body[data-ds-dark-theme]`）

| Token | 色值 |
|---|---|
| bg-base / layer-1 / layer-2 / layer-3 | `#231A11` / `#271C12` / `#291E13` / `#302417` |
| bg-overlay | `#14110D` |
| label-primary / secondary / tertiary / dimmed | `#FFF2D1` / `#DDC49C` / `#C3AB84` / `#A9926B` |
| border-l1 / l2 / l3 | `#3B2C1A` / `#43321E` / `#4D3A22` |
| brand-primary | `#E8AD38` |
| brand-primary-invert / brand-text | `#241606` / `#241606` |
| button-primary-fill / hover / dimmed | `#E8AD38` / `#EBB750` / `#47310F` |
| interactive-bg-hover / active | `#261C12` / `#261B11` |
| markdown-code-block / inline-code | `#251B12` / `#271C12` |
| scrollbar-bg-l1 / hover-l1 | `#40301C` / `#4D3A22` |
| tooltip-bg / toast-bg | `#241F16` / `#241F16` |
| bg-module-platform | `#291E13` |

### 导航与浮层（`--dsw-specific-*`，深色）

| Token | 色值 |
|---|---|
| sidebar-fill | `#251B11` |
| sidebar-nav-item-active-accent | `#E8AD38` |
| sidebar-nav-item-active | `#47310F` |
| sidebar-nav-item-hover | `#261C12` |
| menu | `#302417` |
| bubble / bubble-highlight | `#2A1F14` / `#412D0E` |

## 与默认风格的关系

- 基于 dsh 原生语义 token 结构，仅替换色值；不新增 DOM、不改变布局。
- 品牌色用 Reasonix Fortune Forge 的主题色系（浅 `#A92D22` / 深 `#E8AD38`），区别于 dsh 官方蓝。
- 深/浅色 `bg-layer-3` 均比 layer-2 亮一步——浮层（menu）向亮侧走，符合 Reasonix 面板语义。

## 对比度与注意事项

- 主文字对比（bg-base）：浅 14.54:1 / 深 15.38:1，均 > 4.5:1；浅色 dimmed 3.57:1（< 3.5 时已被生成规则压暗）。
- 由`reasonix-port` 生成器产出；**修改色板时同步更新本文件的色值表**（单一事实来源：`src/client/skins.ts`），并优先改生成器规则以保持系列一致。
