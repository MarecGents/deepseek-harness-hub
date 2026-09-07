# 第三轮审查 · 根因分析报告（终版）

> 输入：round2 三报告。终审确认：方案 A 根因分析完整、机制必然生效。补充决定性判定。

## 根因（终版）

**菜单被右侧栏遮盖的充要条件链**：
1. `.composerSeat`（active 阶段 sticky z7）是菜单祖先链上唯一创建层叠上下文的节点——菜单 z:2000 被封死在 seat 上下文内，有效层=7
2. 右侧栏是 body portal（fixed z:50），归根上下文
3. 根上下文比较：seat 层 7 vs 侧栏 50 → 侧栏必胜（与菜单是否伸入侧栏盒无关）

**修复充要条件**：把 seat 的层抬到 >50（方案 A 抬 60），或让菜单 DOM 逃出 seat 子树（portal）。

## 排除项（终审实锤）

- `:has`：WebView2 Evergreen（embedBootstrapper + Win11 24H2）必然 Chromium≥105，官方生产 CSS 大量依赖 :has——不是失败根因（63582fd 的失败是测试环节问题）
- portal：两次失败根因是 onBlur 未感知 portal（共因）+ closeOutside 无 menuRef（特因）；可救但改动面 3-4 倍
- fixed 不 portal：层叠上下文归属不变，无解
- 宽度缩减：仅窄窗口（W<1160 双栏）才必要，属兜底

## 关键证据

`right-sidebar-style.ts:78`（fixed z:50 body portal）vs `ConversationRoot.module.css:346-351`（sticky z:7）——7<50 是唯一根因；`#root`/`.frame`/`.centerCol` 均无 z-index/transform，seat 直接参与根上下文。
