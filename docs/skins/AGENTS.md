# AGENTS.md — docs/skins/（皮肤风格 harness）

> 本目录是 dsh-hub 全部自定义皮肤的开发 harness。**开发/修改 `src/client/skins.ts` 或任一皮肤相关代码前，必须**先读根 [../../AGENTS.md](../../AGENTS.md) 3.1 节与本文件，再读对应皮肤的 `{skin-id}.md`。
>
> 皮肤是新视觉风格，**豁免 UI 风格铁律**（允许硬编码色值）；但覆盖纪律、对比度、结构与文档要求是强制的。

## 皮肤是什么

皮肤 = 通过覆盖 dsh web UI 的语义 token（`--dsw-alias-*` / `--dsw-specific-*`）实现的自定义视觉风格。浅色 `body` / 深色 `body[data-ds-dark-theme]` 各一套，跟随 dsh 自己的深浅设置。

## token 覆盖纪律（缺 = 覆盖不全 bug）

每套皮肤**必须**同时覆盖（浅/深两套）：

| 分组 | token | 作用表面 |
|---|---|---|
| alias 背景 | `bg-base` / `bg-layer-1/2/3` / `bg-overlay` | 中栏 / 框架 / 浮层 |
| alias 模块 | `bg-module-platform` | 卡片徽章 / 模块底 |
| alias 文字 | `label-primary/secondary/tertiary/dimmed` | 全部文字（对比度来源） |
| alias 边框 | `border-l1/l2/l3` | 分隔线 |
| alias 品牌 | `brand-primary` / `brand-primary-invert` / `brand-text` | 强调 / 反白 |
| alias 按钮 | `button-primary-fill/hover/dimmed` | 主按钮 |
| alias 交互 | `interactive-bg-hover/active` | 悬停 / 按下 |
| alias 代码 | `markdown-code-block` / `markdown-inline-code` | 代码块 |
| alias 滚动 | `scrollbar-bg-l1` / `scrollbar-hover-l1` | 滚动条 |
| alias 浮层 | `tooltip-bg` / `toast-bg` | 提示 / 通知 |
| specific 导航 | `sidebar-fill` / `sidebar-nav-item-active-accent` / `sidebar-nav-item-active` / `sidebar-nav-item-hover` | 左导航栏背景与状态 |
| specific 菜单 | `menu` | 下拉 / 右键浮层 |
| specific 会话 | `bubble` / `bubble-highlight` | 对话消息气泡 / 高亮气泡 |

> 背景：dsh 左导航用 `--dsw-specific-sidebar-fill`（alias token 覆盖不到它），右详情继承 `bg-base`，卡片徽章用 `bg-module-platform`，浮层菜单用 `--dsw-specific-menu`。只覆盖 alias bg 会导致浅色下左右侧边栏停留在官方白（真实事故）。

## 对比度规则（用户要求）

- 深色模式：背景深 → 文字用亮色系（`label-primary` 为亮字）
- 浅色模式：背景浅 → 文字用暗色系（`label-primary` 为暗字）
- 用户原话："深色用白色字，浅色用黑色字"——由每套皮肤**自己的 label 色系**承担（保留皮肤个性，不强制纯黑白）
- 验收：浅/深两套都要看 左导航 / 中栏 / 右详情 / 卡片，文字可读、无眩光

## 结构（src/client/skins.ts）

```ts
DshSkin {
  id, name, description,
  light: Palette,            // alias token（--dsw-alias-<key>）
  dark: Palette,
  specific: { light, dark }  // specific token（--dsw-specific-<key>）
}
```

- `buildCss` 输出两个选择器块（`body` / `body[data-ds-dark-theme]`），alias 与 specific 前缀不同（`block()` 第二参）
- **新增 token 时先分清前缀**：alias → `light`/`dark`；specific → `specific.light`/`specific.dark`。放错位置 = 生成的 CSS 前缀错误 = 覆盖无效

## 调色设计原则（frontend-design）

- **深度规律**（官方设计平台同款）：`sidebar-fill` 比 `bg-base` 向"内容侧"走一步（浅色更深、深色更浅）；`bg-module-platform` 再走一步；`menu` = `bg-layer-3`
- **导航状态**：`sidebar-nav-item-active-accent` = 皮肤 brand；`sidebar-nav-item-active` = brand-dimmed 药丸；`sidebar-nav-item-hover` = interactive-hover
- **风格延续**：系统美化时保持 PR 风格（每套皮肤延续自身色相与气质），先读 `{skin-id}.md` 再改
- 系统性美化（配色/层次）用 `frontend-design` 技能校准，避免模板化默认值

## 文档纪律

- 每套皮肤维护 `docs/skins/{skin-id}.md`：设计意图 / 浅深色板（显式 hex）/ 覆盖 token / 与默认关系 / 注意事项
- 改色板必须同步更新对应文档（单一事实来源：`src/client/skins.ts`）
- 新增皮肤 = `skins.ts` 条目 + 本文件清单 + `{skin-id}.md` 文档三件套

## 与背景图的关系（backgrounds.ts）

- 背景图是**独立于皮肤的视觉层**：注入应用 frame 层（`#root div[style*="grid-template-columns"]`）的双层背景（蒙层 + 图片），并把**左/中/右三栏表面设为 75% 半透明**（`color-mix(原 token 75%, transparent)`，背景图透出 ~25%）——左栏用 `--dsw-specific-sidebar-fill`，中/右栏内容根用 `--dsw-alias-bg-base`；皮肤 token 仍驱动全部表面色（未启用背景图时 100% 不透明）。
- 启用背景图时：三栏表面半透明，**背景图与皮肤共存**（token 色 75% + 图 25% 混合），内容控件（按钮/卡片/气泡）保持不透明。
- 可读性由双层保证：frame 自带 `linear-gradient` 蒙层（rgba(0,0,0,.25)）+ 表面 75% 底色；皮肤改动不需为背景图做适配，但换背景图时须按"深浅两模式文字可读"验收。
