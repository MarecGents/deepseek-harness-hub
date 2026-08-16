# ZCode 风格 UI 改造清单（marec-dsh-desktop）

> **勘误**：最初按「Zed」整理，后经本机核查确认——「z code」= **ZCode**（智谱 Z.ai 的 AI 编程 IDE，Electron 应用，本机已装 3.7.7 于 `D:\1111YINYONG\ZCode\`）。
> 皮肤已按 **ZCode 实测色板**落地（`skins.ts` 的 `zcode` 条目，浅色/深色均从运行中的 ZCode 窗口像素采样取得）：
> - 浅色：内容 `#ffffff` / 面板 `#ececee` / 标题·状态栏 `#f8f8f8` / 文字 `#262626` / 强调蓝 `#0095df`
> - 深色：内容 `#2b2b2b` / 浮层 `#363636` / 标题·状态栏 `#161616` / 文字 `#dcdcdc` / 强调蓝 `#0096e0`
> 下方 Zed 相关分析保留作参考（同为 VSCode 系 IDE 布局），落地时以 ZCode 为准。

---

## 0. 参考基准（ZCode 界面标准）

### 0.1 界面构成（Zed 工作区解剖）

| 区域 | Zed 的做法 | 我们 GUI 的对应物 |
|---|---|---|
| 标题栏 | 与状态栏同底色（`title_bar.background`），显示项目名/分支/头像/分享 | Tauri 窗口标题栏（`src-tauri` 侧） |
| Tab 栏 | 浏览器式圆角 tab（图标+文件名+关闭），激活 tab 用更暗的底（`tab.active_background`） | 会话切换条（如 DSH 有；无则新做顶部切换条） |
| 左 dock + 项目面板 | 最左一列图标（项目/搜索/终端…），项目面板显示文件树 + git 状态色 | 左侧会话栏（token 层 1-3 重排层次） |
| 编辑器/聊天区 | 底最暗（`editor.background #282c33`），面板比它亮（`#2f343e`），标题/状态栏最亮（`#3b414d`）——**反向分层** | 聊天主区、右侧栏、设置页 |
| 右侧 AI 面板 | `panel.background`，消息卡片 + 思考状态 + 模型选择器 | 我们已有的右侧栏（overview/files/git） |
| 底部状态栏 | 分支 / Ln·Col / 语言 / LSP 状态，与标题栏同底色 | 无 → 新建 |
| 命令面板 | Ctrl+Shift+P 模糊搜索、分组结果、键盘导航 | 无 → 新建 |

### 0.2 官方色板（`assets/themes/one/one.json`）

**One Dark（暗色）**

| Zed 语义 | 值 | 用途 |
|---|---|---|
| background | `#3b414d` | 标题栏/状态栏/最外层底 |
| surface / panel / elevated / tab_bar | `#2f343e` | 面板、侧栏、tab 栏底 |
| editor / toolbar / tab.active | `#282c33` | 内容区（比面板**更暗**） |
| element | `#2e343e` / hover `#363c46` / active `#454a56` | 列表行、按钮态 |
| border / border.variant | `#464b57` / `#363c46` | 边框；focus border `#47679e` |
| text / muted / faint | `#dce0e5` / `#a9afbc` / `#878a98` | 三级文字 |
| accent（text.accent/icon.accent） | `#74ade8` | 强调蓝（One Dark 蓝） |
| success / error / warning / info | `#a1c181` / `#d07277` / `#dec184` / `#74ade8` | 状态色 |
| git: added / modified / deleted | `#27a657` / `#d3b020` / `#e06c76` | Git 状态 |
| scrollbar.thumb / hover / track | `#c8ccd44c` / `#363c46` / 透明 | 细滚动条 |
| 语法（syntax） | 注释 `#5d636f`、字符串 `#a1c181`、关键字 `#b477cf`、函数 `#73ade9`、数字 `#bf956a`、类型 `#6eb4b6`、属性 `#d07277`、变量 `#acb2be` | 代码块高亮 |

**One Light（亮色）**

| Zed 语义 | 值 |
|---|---|
| background / status_bar | `#dcdcdd` |
| surface / panel / tab_bar | `#ebebec` |
| editor / toolbar / tab.active | `#fafafa` |
| element hover / active | `#dfdfe0` / `#cacaca` |
| border / variant | `#c9c9ca` / `#dfdfe0` |
| text / muted | `#242529` / `#58585a` |
| accent | `#5c78e2` |
| success / error / warning | `#669f59` / `#d36151` / `#a48819` |
| scrollbar.thumb | `#383a414c` |

### 0.3 字体与密度（官方文档）

- UI 字体：Zed Sans（目前是 IBM Plex）；等宽：Zed Mono（目前是 Lilex）→ 我们用 system-ui 优先 + 上述作为 fallback 引入。
- 密度：紧凑、小圆角（≈4px）、细边框、hover/active 微反馈、focus ring 用 accent 色。
- 动画：短促（100–150ms ease），不做大位移。

---

## 1. 落地载体（我们已有的工具，改造零成本）

| 载体 | 现状 | 新增 zed 皮肤要改什么 |
|---|---|---|
| `src/client/skins.ts` 的 `SKINS` 数组 | 4 个皮肤（midnight/paper/terminal/aurora），light+dark 双块覆盖 `--dsw-alias-*` | **只加一个条目**；设置卡的皮肤选择器自动列出（`settings-card.tsx` 里 `SKINS.map(...)`），无需改卡片 |
| `--dsw-alias-*` token 全集 | 见 `dsh-client-ui-theme/lib/styles/design-platform.css`（bg/label/border/brand/button/interactive/markdown/scrollbar/state/tooltip/toast…） | 逐个填 Zed 值 |
| 注入式 stylesheet（`mg-*` 固定类名） | 卡片 `style.ts`、右侧栏 `right-sidebar-style.ts` | 新增一个 `zed-chrome` 样式串做结构性微调 |
| 槽位 | `settings.plugin.item`、`shell.overlay` | 状态栏、命令面板走 `shell.overlay` 新增 |
| 持久化 | `/api/mg-dsh-desktop/config` | 皮肤选择即存即生效，无需改 |

---

## 2. 改造清单（按优先级）

### P0 —— 纯 token 覆盖，先出「一眼 Zed」的效果

- [ ] **2.1 新增 `zed` 皮肤**（`skins.ts` 追加一条，id `zed`，名「Zed」）
  - **暗色（One Dark）推荐映射**（起点值，最终以肉眼微调）：

    | DSH token | 值 | 依据 |
    |---|---|---|
    | bg-base（聊天主底） | `#282c33` | Zed editor.background（反向分层：内容底最暗） |
    | bg-layer-1（侧栏/面板） | `#2f343e` | Zed surface/panel |
    | bg-layer-2 | `#2f343e` | 同上 |
    | bg-layer-3（标题/浮层底） | `#3b414d` | Zed background |
    | bg-overlay | `#2f343e` | Zed elevated |
    | border-l1 / l2 / l3 | `#363c46` / `#464b57` / `#545a66` | border.variant / border / 略提亮 |
    | label-primary / secondary / tertiary / dimmed | `#dce0e5` / `#a9afbc` / `#878a98` / `#5d636f` | text / muted / faint / comment |
    | brand-primary / brand-primary-invert | `#74ade8` / `#282c33` | accent（备选：`#e2b714` Zed 黄，见 §4） |
    | button-primary-fill / hover / dimmed | `#74ade8` / `#85b4ec` / `#2e343e` | accent 系 |
    | interactive-bg-hover / active | `#363c46` / `#454a56` | element.hover / active |
    | markdown-code-block / inline-code | `#282c33` / `#2e343e` | editor / element |
    | scrollbar-bg-l1 / hover-l1 | `#c8ccd44c` / `#363c46` | 细滚动条 |
    | tooltip-bg / toast-bg | `#3b414d` | background |
    | state-success / warn / error / business-primary | `#a1c181` / `#dec184` / `#d07277` / `#74ade8` | 状态色 |

  - **亮色（One Light）映射**同构：bg-base `#fafafa`、layer-1/2 `#ebebec`、layer-3 `#dcdcdd`、border `#c9c9ca`、label `#242529`/`#58585a`、brand `#5c78e2`、state `#669f59`/`#a48819`/`#d36151`、scrollbar `#383a414c`。

- [ ] **2.2 代码块语法高亮对齐 One Dark**（`markdown-code-block` 背景 + 注入 shiki 覆盖色，用 §0.2 syntax 表）——可选但「代码编辑器像 Zed」的观感主要靠它。

### P1 —— 结构性样式（新增一个注入 stylesheet，如 `zed-chrome`，`mg-zc-*` 前缀）

- [ ] **2.3 圆角/边框/控件密度**：卡片与输入控件圆角压到 4–6px；边框统一用 Zed border 色；控件高 28px、字号 12–13px。
- [ ] **2.4 细滚动条**：thumb 半透明（`#c8ccd44c`），hover `#363c46`，track 透明。
- [ ] **2.5 focus ring**：accent 色 1–2px + 细 halo，替换现有蓝色 halo（`color-mix` 改为基于 brand token 即可自动跟随 zed 皮肤）。
- [ ] **2.6 字体栈**：UI 优先 `-apple-system/Segoe UI` + `'IBM Plex Sans'` fallback；代码块 `'Lilex'`/monospace。改 `--ds-font-family-ui` 与 `--ds-font-family-code`（需在 devtools 里确认这俩变量的宿主位置）。
- [ ] **2.7 标题栏/状态栏底色**：Tauri `src-tauri` 侧 + 页面侧把顶部条背景压成 `#3b414d`（暗）/`#dcdcdd`（亮），与 Zed title/status bar 同色。
- [ ] **2.8 左侧会话栏 → Zed 项目面板观感**：层次重排（面板 `#2f343e` 亮于内容底）、行高 26px、hover `#363c46`、会话项圆角 4px。（需要 devtools 一次探明实际类名；token 层解决不了的再写具体选择器。）
- [ ] **2.9 消息区 → Zed agent 面板卡片观感**：用户消息/助手消息卡片化：圆角、1px `#363c46` 边框、内边距 8–12px、引用/代码块底 `#282c33`。

### P2 —— 组件级（新功能，走 `shell.overlay`）

- [ ] **2.10 右侧栏 Zed 化**（`right-sidebar-style.ts`，纯改样式串）：
  - 面板底 `#2f343e`（暗）/`#ebebec`（亮）；头部 tab 条参照 Zed tab 栏（激活 tab 更暗底 + 顶部 1px accent 条）；
  - 文件树行 hover `#363c46`、缩进对齐、文件夹/文件图标统一 14px；
  - Git 状态色：已加 `#27a657`、已改 `#d3b020`、已删 `#e06c76`；
  - Token 环形图配色从 `#3964fe/#16a34a` 换成 accent 系（跟随 token，避免硬编码蓝色）。
- [ ] **2.11 底部状态栏（新组件）**：`shell.overlay` 底部条，左侧工作区路径 + Git 分支，右侧模型名 + 本轮 token 计数——数据全部来自右侧栏已有的 projections（`tokenUsage`/`sessionStats`）。参考 Zed 状态栏布局（左分支 / 右状态）。
- [ ] **2.12 命令面板（新组件）**：`Ctrl+K`/`Ctrl+P` 唤起居中浮层，模糊搜索「切换会话 / 新建会话 / 切皮肤 / 展开收起侧栏」，键盘 ↑↓+Enter。参考 Zed command palette 交互（分组、高亮命中、空态）。
- [ ] **2.13 会话 Tab 条**：若 DSH 有会话 tab 则样式化（激活 tab 暗底 + accent 顶条）；若无，用状态栏/命令面板先覆盖切换需求，tab 条缓做。

### P3 —— 打磨

- [ ] **2.14 设置卡 → Zed settings 观感**（`style.ts`）：分组标题大写/字距、控件 28px、卡片圆角 6px、边框 `#464b57`。
- [ ] **2.15 toast/系统通知**：底色 `#3b414d`、accent 图标、圆角。
- [ ] **2.16 过渡动画**：hover/展开 100–150ms ease，与 Zed 一致（现有 `--ds-transition-duration-slow` 若偏慢则覆盖）。

---

## 3. 验证与发布

- [ ] 深浅两模式全过一遍（`body[data-ds-dark-theme]` 切到深色后 zed 皮肤不破）。
- [ ] 与既有 4 皮肤并存：切换互不污染（`applySkin` 单 style 元素覆盖逻辑已保证，回归一次即可）。
- [ ] 右键栏三个 tab（概览/文件/Git）在新皮肤下对比度达标。
- [ ] 构建装配：`npm run build`（tsc）+ `npm run build:client`（tsdown）→ 确认 `lib/` 同步；开发期可用热注入验证。
- [ ] 截图对比 Zed 原版（官方截图或本机 Zed）逐区域过一遍：标题栏 / 侧栏 / 消息区 / 状态栏 / 命令面板。
- [ ] 更新 `PR_NOTES.md` / README 皮肤列表。

---

## 4. 待确认

1. **强调色**：One Dark 蓝 `#74ade8`（推荐，与 DeepSeek 品牌冲突小、是 Zed 默认主题原色）还是 Zed 品牌黄 `#e2b714`（更「Zed 味」，但和代码块高亮、品牌按钮观感差异大）？
2. 「z code」是否指 **Zed**？若实际指 VS Code，换 §0.2 色板即可，其余不变。
3. 状态栏/命令面板属于**新组件**（改 tsx + 样式串），建议在 P0 皮肤落地、肉眼确认方向后再做，避免返工。

---

## 5. 建议执行顺序

1. **P0-2.1**：加 `zed` 皮肤（约 20 分钟，纯数据）→ 截图看整体色感，微调映射。
2. **P1**：zed-chrome 样式串（密度/圆角/滚动条/字体）→ 结构观感成型。
3. **P2-2.10**：右侧栏 Zed 化（改现有样式串，零新结构）。
4. **P2-2.11/2.12**：状态栏 + 命令面板（新组件，复用 projections 数据源）。
5. **P3**：打磨 + 深浅双模式回归 + 发布。
