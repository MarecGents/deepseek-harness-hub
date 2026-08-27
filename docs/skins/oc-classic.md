# 皮肤风格文档 — opencode 经典（oc-classic)

> 本文件是该皮肤的开发 harness。**开发/修改 `skins.ts` 中 `oc-classic` 皮肤相关代码前，必须先读本文件**与根 [../../AGENTS.md](../../AGENTS.md) 3.1 节。
>
> 皮肤是新视觉风格，**不受 dsh 官方 UI 风格约束**（允许硬编码色值）；但默认皮肤与非皮肤代码仍严格受约束。

## 设计意图

opencode 官方配方移植（packages/ui/src/theme/resolve.ts 实测提取）——近黑/近白中性底 + 标志性鲜橙强调（#FF8C00 系），极简终端风、表面层级克制。浅色强调压暗（#C25E02）保证反白对比。

## 推导规则

与 [rx-noir-gold.md](rx-noir-gold.md) 同一套推导规则（移植生成器统一产出，禁止手改）：1:1 直映射（chat→bg-base、bgSoft→layer-1、panel/bgElev→layer-2/3、sidebar→sidebar-fill、fg/fgDim/fgFaint→label-*、accent→brand、border/borderSoft→border-l3/l1）+ 定向混合（tertiary/border-l2/button-dimmed/markdown/bubble/highlight）+ dimmed 夹取（<3.5:1 压暗 7%）。差异点：`bg-overlay`、`tooltip-bg`/`toast-bg` 走各自表面（深色浮层同 layer-3 系）。

## 调色板

### 浅色（`body`）

| Token | 色值 |
|---|---|
| bg-base / layer-1 / layer-2 / layer-3 | `#FCFCFD` / `#F6F6F7` / `#F6F6F7` / `#EFEFF0` |
| bg-overlay | `#EFEFF0` |
| label-primary / secondary / tertiary / dimmed | `#141517` / `#55595F` / `#70747A` / `#81868B` |
| border-l1 / l2 / l3 | `#E7E7E9` / `#DADADD` / `#C9CBCF` |
| brand-primary | `#C25E02` |
| brand-primary-invert / brand-text | `#FFF7ED` / `#FFF7ED` |
| button-primary-fill / hover / dimmed | `#AB5302` / `#974902` / `#F9E8D6` |
| interactive-bg-hover / active | `#F4F4F5` / `#F3F3F4` |
| markdown-code-block / inline-code | `#F9F9FA` / `#F6F6F7` |
| scrollbar-bg-l1 / hover-l1 | `#E0E0E2` / `#C9CBCF` |
| tooltip-bg / toast-bg | `#141517` / `#141517` |
| bg-module-platform | `#EFEFF0` |

### 导航与浮层（`--dsw-specific-*`，浅色）

| Token | 色值 |
|---|---|
| sidebar-fill | `#F1F1F2` |
| sidebar-nav-item-active-accent | `#C25E02` |
| sidebar-nav-item-active | `#F9E8D6` |
| sidebar-nav-item-hover | `#F4F4F5` |
| menu | `#EFEFF0` |
| bubble / bubble-highlight | `#F9F9FA` / `#F9E8D6` |

### 深色（`body[data-ds-dark-theme]`）

| Token | 色值 |
|---|---|
| bg-base / layer-1 / layer-2 / layer-3 | `#0B0C0E` / `#131518` / `#191C1F` / `#212529` |
| bg-overlay | `#131518` |
| label-primary / secondary / tertiary / dimmed | `#F0F2F5` / `#A8AEB5` / `#8B9198` / `#6E747B` |
| border-l1 / l2 / l3 | `#24272B` / `#2E3237` / `#3A4046` |
| brand-primary | `#FF8C00` |
| brand-primary-invert / brand-text | `#1A0F02` / `#1A0F02` |
| button-primary-fill / hover / dimmed | `#FF8C00` / `#FF9A1F` / `#432602` |
| interactive-bg-hover / active | `#121416` / `#111315` |
| markdown-code-block / inline-code | `#0F1013` / `#131518` |
| scrollbar-bg-l1 / hover-l1 | `#2A2D32` / `#3A4046` |
| tooltip-bg / toast-bg | `#212529` / `#212529` |
| bg-module-platform | `#191C1F` |

### 导航与浮层（`--dsw-specific-*`，深色）

| Token | 色值 |
|---|---|
| sidebar-fill | `#0F1113` |
| sidebar-nav-item-active-accent | `#FF8C00` |
| sidebar-nav-item-active | `#432602` |
| sidebar-nav-item-hover | `#121416` |
| menu | `#212529` |
| bubble / bubble-highlight | `#16181C` / `#3C2202` |

## 与默认风格的关系

- 基于 dsh 原生语义 token 结构，仅替换色值；不新增 DOM、不改变布局（遵守用户红线：布局调整只在 dsh 原始布局上以插件注入微调）。
- 强调色用 opencode 橙（浅 `#C25E02` / 深 `#FF8C00`），区分于 dsh 官方蓝。
- 深色 `bg-layer-3` 比 layer-2 亮一步（浮层向亮侧），还原 opencode 的浮层层级。

## 对比度与注意事项

- 由 opencode 移植生成器产出（对比度脚本实测，全局最小 ≥4.9:1）；浅色强调色为压暗变体（保证按钮反白 ≥4.5:1），改色板勿回退。
- 修改色板时同步更新本文件的色值表（单一事实来源：`src/client/skins.ts`）。
