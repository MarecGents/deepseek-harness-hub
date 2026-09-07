# 第一轮审查 · 根因分析报告

> 输入：三轮深度调研第一轮（3 子代理：层叠上下文链 / portal 事件链 / 官方参照）。

## 层叠上下文链（完整证据）

从 `._dshnms_menu` 到 html 的祖先链中，**唯一创建层叠上下文的节点是 `.composerSeat`**（`ConversationRoot.module.css:346-351`，active 阶段 `position:sticky; z-index:7`）。菜单自身 `z-index:2000` 被封死在 seat 上下文内（有效层=7）；右侧栏是 **body 级 portal**（`#dsh-hub-right-sidebar-root` → `.mg-rs-root`，fixed z:50），归根上下文。**7 < 50 → 右侧栏必胜**。链条上无其他 transform/opacity/filter/isolation 节点。

几何：`body #root{margin-right:calc(360px+…)}` 让中栏右缘紧贴侧栏左缘；单栏菜单（260px）通常不越界，**双栏菜单（520px）必然伸入侧栏盒内**——被遮盖主场景。

## portal 两次失败的精确根因（R1-B 决定性发现）

| 根因 | 版本 | 机制 |
|---|---|---|
| **A. `onBlur=close()` 未感知 portal** | 6bc029a + f4bda9b | 菜单 portal 到 body 后，焦点从 trigger 移入菜单时 `relatedTarget` 必不在 rootRef → `close()` 立即关菜单。mousedown 先于 click，React 18 discrete 事件同步 flush → 菜单在 click 前卸载 → `openModels` 永不执行 → "点击不弹出" |
| B. closeOutside 无 menuRef | 仅 6bc029a | 菜单内 mousedown 必命中 `!rootRef.contains(target)` → 立即关闭 |
| C（排除） | — | positionMenu rect 可读（trigger 已挂载）；left 计算在正常窗口可见；React 18.3.1 portal ref 正常挂载 |

**结论**：A 是共因、B 是特因，同为"菜单脱离 rootRef 后旧守卫失能"。portal 可救但需修 onBlur + 键盘 + 重定位，改动面 3-4 倍。

## 方案可行性矩阵

| 方案 | 可行性 | 说明 |
|---|---|---|
| **b1. body class + CSS**：`body.mg-dshnms-open [data-composer-seat]{z-index:60 !important}` | **高（首选）** | 视觉零变化、交互零回归（菜单仍在 rootRef 内，blur/键盘/外部关闭全保活）、无 :has 依赖、无 seat 重挂竞态（class 挂 body，seat 重挂规则自动生效）、约 10 行 |
| **b2. JS inline seat z-index**：open 时 `seat.style.zIndex='60'` | 高（备选） | 官方 `data-composer-seat` 是稳定契约（hub terminal-dock/right-sidebar 已有同款用法）；inline 压过一切非 important；React 不重写 seat inline style；还原在 useEffect([open]) |
| c. portal + 修正（onBlur+键盘+重定位） | 中 | 官方先例充分（Menu.tsx useDismissOnOutsidePointer），但改动面最大 |
| d. 减小菜单宽度 | 兜底 | 双栏 520px 是核心 UX，砍掉=砍功能；窗口更窄时单栏也会撞 |
| e. 右侧栏让位 | 排除 | 跨组件通信 + 体验割裂 |
| :has 抬座（63582fd 已试） | 排除 | 官方修法只抬到 z 9，本就不够打 z 50；且 WebView2 大概率支持 :has（Chromium 105+，用户 OS 26xxx 必然新版）——失败更可能是测试环节 |

## 关键文件

- hub：`src/client/model-select.tsx`（菜单 CSS :45；closeOutside/onBlur/onKeyDown :263-326）、`src/client/right-sidebar-style.ts`（z:50 :78）、`src/client/index.ts`（body portal :370）
- 官方：`ConversationRoot.module.css:346-372`（seat z7/:has z9）、`InputBar.module.css`（card relative）、`ModelSelect.module.css`（menu absolute right:0 z:20）
