# 皮肤风格文档 — opencode 石墨（oc-graphite)

> 本文件是该皮肤的开发 harness。**开发/修改 `skins.ts` 中 `oc-graphite` 皮肤相关代码前，必须先读本文件**与根 [../../AGENTS.md](../../AGENTS.md) 3.1 节。
>
> 皮肤是新视觉风格，**不受 dsh 官方 UI 风格约束**（允许硬编码色值）；但默认皮肤与非皮肤代码仍严格受约束。

## 设计意图

opencode 石墨变体——暖灰中性底（#101214 / #F8F8F6）+ 炽橙强调（#E8590C 系），比经典版更柔和的灰阶。

## 推导规则

与 [rx-noir-gold.md](rx-noir-gold.md) 同一套推导规则（移植生成器统一产出，禁止手改）：1:1 直映射（chat→bg-base、bgSoft→layer-1、panel/bgElev→layer-2/3、sidebar→sidebar-fill、fg/fgDim/fgFaint→label-*、accent→brand、border/borderSoft→border-l3/l1）+ 定向混合（tertiary/border-l2/button-dimmed/markdown/bubble/highlight）+ dimmed 夹取（<3.5:1 压暗 7%）。差异点：`bg-overlay`、`tooltip-bg`/`toast-bg` 走各自表面（深色浮层同 layer-3 系）。

## 调色板

### 浅色（`body`）

| Token | 色值 |
|---|---|
| bg-base / layer-1 / layer-2 / layer-3 | `#F8F8F6` / `#F1F1EE` / `#F1F1EE` / `#EAEAE6` |
| bg-overlay | `#EAEAE6` |
| label-primary / secondary / tertiary / dimmed | `#1B1B1A` / `#5D5D5A` / `#767673` / `#868682` |
| border-l1 / l2 / l3 | `#E2E2DE` / `#D4D4D0` / `#C4C4C0` |
| brand-primary | `#C24E02` |
| brand-primary-invert / brand-text | `#FFF6EC` / `#FFF6EC` |
| button-primary-fill / hover / dimmed | `#AB4502` / `#973D02` / `#F9E5D5` |
| interactive-bg-hover / active | `#EFEFEC` / `#EEEEEA` |
| markdown-code-block / inline-code | `#F4F4F2` / `#F1F1EE` |
| scrollbar-bg-l1 / hover-l1 | `#DADAD6` / `#C4C4C0` |
| tooltip-bg / toast-bg | `#1B1B1A` / `#1B1B1A` |
| bg-module-platform | `#EAEAE6` |

### 导航与浮层（`--dsw-specific-*`，浅色）

| Token | 色值 |
|---|---|
| sidebar-fill | `#ECECE8` |
| sidebar-nav-item-active-accent | `#C24E02` |
| sidebar-nav-item-active | `#F9E5D5` |
| sidebar-nav-item-hover | `#EFEFEC` |
| menu | `#EAEAE6` |
| bubble / bubble-highlight | `#F4F4F2` / `#F9E5D5` |

### 深色（`body[data-ds-dark-theme]`）

| Token | 色值 |
|---|---|
| bg-base / layer-1 / layer-2 / layer-3 | `#101214` / `#17191C` / `#1D2023` / `#25282C` |
| bg-overlay | `#17191C` |
| label-primary / secondary / tertiary / dimmed | `#E9ECEF` / `#9AA0A6` / `#7E848A` / `#5C6166` |
| border-l1 / l2 / l3 | `#26292D` / `#303439` / `#3D4147` |
| brand-primary | `#E8590C` |
| brand-primary-invert / brand-text | `#160A02` / `#160A02` |
| button-primary-fill / hover / dimmed | `#E8590C` / `#EB6D29` / `#3C1804` |
| interactive-bg-hover / active | `#15171A` / `#141618` |
| markdown-code-block / inline-code | `#141618` / `#17191C` |
| scrollbar-bg-l1 / hover-l1 | `#2C2F34` / `#3D4147` |
| tooltip-bg / toast-bg | `#25282C` / `#25282C` |
| bg-module-platform | `#1D2023` |

### 导航与浮层（`--dsw-specific-*`，深色）

| Token | 色值 |
|---|---|
| sidebar-fill | `#121416` |
| sidebar-nav-item-active-accent | `#E8590C` |
| sidebar-nav-item-active | `#3C1804` |
| sidebar-nav-item-hover | `#15171A` |
| menu | `#25282C` |
| bubble / bubble-highlight | `#1A1D20` / `#361604` |

## 与默认风格的关系

- 基于 dsh 原生语义 token 结构，仅替换色值；不新增 DOM、不改变布局（遵守用户红线：布局调整只在 dsh 原始布局上以插件注入微调）。
- 强调色用 opencode 橙（浅 `#C24E02` / 深 `#E8590C`），区分于 dsh 官方蓝。
- 深色 `bg-layer-3` 比 layer-2 亮一步（浮层向亮侧），还原 opencode 的浮层层级。

## 对比度与注意事项

- 由 opencode 移植生成器产出（对比度脚本实测，全局最小 ≥4.9:1）；浅色强调色为压暗变体（保证按钮反白 ≥4.5:1），改色板勿回退。
- 修改色板时同步更新本文件的色值表（单一事实来源：`src/client/skins.ts`）。
