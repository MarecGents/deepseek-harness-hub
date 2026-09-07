# 第一轮审查 · 修复方案报告

> 输入：round1-根因分析.md。方案定稿：**body class 抬座为主，JS inline 为备，portal 修正为备选，宽度缩减为兜底**。

## 方案 A（首选）：body class + CSS 抬座

**机制**：菜单打开时挂 `body.mg-dshnms-open`，CSS 一条规则把 composerSeat 抬到 60（> 右侧栏 50）。seat 上下文直接参与根上下文（`#root`/`.frame`/`.centerCol` 均无 z-index/transform），抬 60 即菜单随 seat 整体胜出。active 阶段 seat 是 sticky+z7，规则覆盖；hero 阶段 seat 无 z 但菜单在 `.composerHero`（z1）内——需补 hero 规则或确认菜单不会在 hero 阶段打开（composer hero 是空态提示，无输入框，模型菜单只在 active 阶段存在——**确认后只需 active 规则**）。

**改动**（`model-select.tsx` 一处）：
```ts
// 现有 useEffect([open]) 内：
useEffect(() => {
  if (open) {
    document.body.classList.add('mg-dshnms-open')
  } else {
    document.body.classList.remove('mg-dshnms-open')
  }
  // closeOutside 监听保持……
  return () => {
    document.body.classList.remove('mg-dshnms-open')
    // …
  }
}, [open])
```
CSS 数组加一条（**必须 `!important`**：官方规则特异性 `(0,3,0)`，纯 data 属性 `(0,2,0)` 打不过）：
```
'body.mg-dshnms-open [data-composer-seat]{z-index:60 !important}'
```

**优点**：菜单仍 absolute 原地（视觉零变化）；blur/键盘/closeOutside 全保活；无 :has/引擎依赖；seat 重挂时规则自动生效。
**风险**：菜单打开期间整张卡片在侧栏上方绘制（仅 1px 边框缝被盖，无布局变化）；还原靠 useEffect 清理。

## 方案 B（备选）：JS inline seat z-index

open 时 `seat.style.zIndex = '60'`，close 时还原（存原值或置空）。`document.querySelector('[data-composer-seat]')` 是官方稳定契约（`ConversationRoot.tsx:367`，hub terminal-dock:355/right-sidebar:253 已用）。inline 天然压过一切非 important；官方不写 seat inline style（React 不重写）。**需处理 seat 重挂**（会话切换时 seat 可能重挂，inline 丢失）——比 A 多一层 MutationObserver 或每次 open 重设，故 A 更优。

## 方案 C（备选）：portal + 完整修正

照抄官方 `Menu.tsx`：`useLayoutEffect` 定位 + scroll/resize 重算 + 双 ref 关闭（`useDismissOnOutsidePointer` 同款 `rootRef`+`menuRef`）+ z 1100 + document pointerdown 关闭（弃 onBlur）。**必须**修 onBlur（R1-B 根因 A）。改动面 3-4 倍，仅当 A/B 失败才用。

## 方案 D（兜底）：减小菜单宽度

双栏 520px → ≤360px 可避免与 360px 侧栏重叠。但双栏是核心 UX（provider 列+model 列），且窗口更窄时单栏也会撞。**最后无奈之举**，用户已确认。

## 决策

- 首选 A：交互零回归、改动最小、机制必然生效（层叠上下文分析证明）。
- 若 A 实测仍被遮（理论不应）：B（inline，覆盖重挂）→ C（portal 修正，官方背书）→ D（宽度兜底）。
