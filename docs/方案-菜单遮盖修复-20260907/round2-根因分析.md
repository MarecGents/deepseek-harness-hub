# 第二轮审查 · 根因分析报告（升级版）

> 输入：round1 三报告。本轮 2 子代理深化（方案 A 坑清单 / 交叉验证）。结论：方案 A 成立，无隐藏坑。

## 层叠上下文链（确认，补充 hero/settling）

- 唯一封顶：`.composerSeat`（`ConversationRoot.module.css:346-351`，active 阶段 sticky z7）。`#root`/`.frame`/`.centerCol` 均无 z-index/transform → seat 上下文直接参与根上下文。
- **hero/settling 补充**：composerSeat 无条件渲染（`ConversationRoot.tsx:366-373`），但 hero/settling 阶段 trigger disabled（`inert=true`，`InputBar.tsx:119-125`）→ 菜单不可能打开 → `body.mg-dshnms-open [data-composer-seat]{z-index:60}` 规则对三阶段无副作用（hero 下 seat 无 z，规则给它 60 但菜单不存在，视觉零变化）。**无需 hero 专属规则**。

## WebView2 :has 实锤（排除该根因）

- `tauri.conf.json` `webviewInstallMode: embedBootstrapper`（Evergreen），用户 OS Win11 24H2（build 26200）→ Chromium ≥105 → **`:has` 被支持**。
- 决定性旁证：官方生产 CSS 大量使用 `:has`（`ConversationRoot.module.css:275/370/376/392/398`，含 composer overlay 核心布局）——官方 UI 依赖 :has，若引擎不支持官方本身即坏。
- **结论**：63582fd 失败不是引擎问题（更可能是测试/其他环节），但方案 A 根本不依赖 :has，无需纠结。

## 遮盖几何定量（修正第一轮"双栏必然越界"结论）

- 中栏宽 `C = W−S−D`；卡宽 `K = min(W−S−D, W+32)`；菜单左缘 `x0 = S`（单栏恒定等于左栏右缘，与卡宽无关）；侧栏左缘 `x_side = W−360`。
- **越界条件**：`x0 + M > x_side`
  - 单栏 260px：W < S+620（默认 S=280 → **W<900 越界**；左栏折叠为 56 时 W<676）
  - 双栏 520px：W < S+880（默认 → **W<1160 越界**；S=420 → W<1300）
- **关键修正**：默认配置下 W≥1160 双栏不越界；但 **z-index 遮盖与越界无关**——只要几何重叠即被遮（单栏在 W<900 时也被遮）。方案 A 修复后越界与否都无遮盖问题。

## portal 两次失败的根因（确认，补充）

- A（共因）onBlur=close() 未感知 portal：菜单在 body 后 `relatedTarget` 必不在 rootRef → mousedown 先于 click 关菜单。
- B（特因）closeOutside 无 menuRef（6bc029a）。
- C（排除）positionMenu 时序/rect/React 18 portal ref 均无问题。
- **备选 C 可复用性**：官方 `useAnchoredPosition` + `useDismissOnOutsidePointer` 已在 `@deepseek-ai/dsh-client-ui-primitives@0.1.2-rc.1` 发布包导出（lib/types/index.d.ts:12-17，lib/index.js:1896/1961），hub 依赖已含——抄官方模式可行，但改动面 3-4 倍。

## 最终根因结论

菜单被右侧栏遮盖 = composerSeat（sticky z7）隔离层叠上下文 + 右侧栏 body portal（z50）同层比较 7 vs 50。修复必须让 seat 层 > 50（方案 A 抬到 60）或让菜单 DOM 逃出 seat 子树（portal）。方案 A 机制必然生效（特异性 !important 压过官方、z 60 落空档、交互零回归）。
