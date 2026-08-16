# findings.md — 调研与发现

## dsh 官方 token 覆盖现状（2026-08-16）

- 中栏/框架：`--dsw-alias-bg-base`、`bg-layer-1/2/3` → 皮肤已覆盖 ✓
- 左导航栏：`--dsw-specific-sidebar-fill`（AppFrame.module.css L28）+ `--dsw-specific-sidebar-nav-item-active-accent/active/hover`（design-platform.css L241-244）→ **皮肤未覆盖** ✗（浅色下停留官方白，用户反馈）
- 右详情列：无背景声明，继承 bg-base → 已覆盖 ✓
- 我们自己的右侧栏（right-sidebar-style.ts L76）：`var(--dsw-specific-sidebar-fill, var(--dsw-alias-bg-layer-2, #fff))` → **跟随 sidebar-fill**，修复后自动生效
- 卡片/模块底色：`--dsw-alias-bg-module-platform`（浅 bluish-60 / 深 bluish-800）→ **未覆盖** ✗（右侧栏 L365/413 使用）
- 浮层菜单：`--dsw-specific-menu` = bg-layer-3 → 未覆盖 ✗
- 选中态 accent：浅 deepseek-100 / 深 bluish-800；hover：浅 bluish-75 / 深 bluish-850

## 官方深浅模式关系（design-platform.css）

- 浅：base=bluish-00(白) → sidebar-fill=bluish-50（比 base 深一步）→ module=bluish-60（更深一步）
- 深：base=bluish-950(最暗) → sidebar-fill=bluish-900（比 base 浅一步）→ module=bluish-800（再浅一步）
- 规律：**sidebar 与 module 永远比 base 向"内容侧"走一步**；皮肤按此规律取各皮肤色板相邻层

## 重命名事实

- 窗口标题来源：cordis.patch.yml `title: 'DeepSeek Harness Desktop'` → index.ts Config.title → desktop.ts（标题栏 L309 / 托盘 L525 / toast 标题 L659 三处同步）
- 设置卡片标题：settings-card.tsx COPY.title = 'MG DSH 设置'
- launcher.mjs L375 引用「设置 → MG DSH 设置 中勾选…」→ 卡片改名后需同步
- AUMID：src/services/app-id.ts `DeepSeekHarness.Desktop`（任务栏身份，非可见文案 → 保留）

## 保存回环

- host 回环实测正确（soundEnabled/skin/allowMultipleInstances 读回全部正常）
- 用户重启后保存正常 → 根因 = 运行实例 10:43 启动、内存旧代码（无皮肤/声音/新白名单）
- 防御性修复：onSave 成功路径 setDraft({...saved, ...patch}) 防响应缺字段静默回退
