# 审查意见 1/3 — 兼容性与运维审查（dsh-hub Tauri 迁移三报告）

> 审查轮：1 / 3（兼容性与运维）
> 审查员：兼容性与运维审查子代理
> 日期：2026-08-17
> 审查对象：
> - `docs/tauri-migration/可行性分析报告-2026-08-17.md`（以下简称「可行性」）
> - `docs/tauri-migration/代码迁移方案报告-2026-08-17.md`（以下简称「迁移方案」）
> - `docs/tauri-migration/代码落地方案报告-2026-08-17.md`（以下简称「落地」）
> - 参照：`.planning/research-D.md`、`REFERENCE.md`、根 `AGENTS.md` §5、`docs/关键踩坑记录.md` #33/#32、`scripts/verify-release.mjs`
> 交叉核对源码：`src/desktop.ts`、`src/services/{state-store,sound,app-id,screen,config-api,pins-api}.ts`、`bin/launcher.mjs`、`package.json`、`docs/dsh桌面端技术路线-2026-08-16.md`

**结论速览：有条件通过（approve with conditions）。** 三报告的行为对齐纪律、铁律继承、踩坑史映射是最大亮点；但有 4 项高严重度缺口（$DSH_HOME 默认解析、存量 npm→安装器过渡、卸载清理语义、三端声音/逐端验收）必须在 M1 动工前闭合，另有 9 项中/低问题需在 M4/M5 前落地，否则会在发布期重现「干净环境测不出」类事故（#33 教训）。

---

## 1. 审查方法

1. 通读三报告全文，以 `落地 §9 验收总表（22 行）` 为行为对齐锚点，对照 `可行性 §2 能力映射表（21 项）` 与 `src/desktop.ts` 实际行为逐项核对覆盖度。
2. 以 `AGENTS.md §5（发布铁律）` + `scripts/verify-release.mjs`（P1–P5 现状）为门禁基线，核对 `迁移方案 §7.3` / `落地 T5.5` / `research-D §3` 的继承映射是否可执行。
3. 以 `state-store.ts / config-api.ts / pins-api.ts / launcher.mjs / app-id.ts / sound.ts / screen.ts` 源码核对 `$DSH_HOME` 路径、数据文件路径、AUMID、声音通道、日志位置等运维事实。
4. 以 `docs/关键踩坑记录.md` #33（干净安装冒烟）、#32（fixed 合成）、#10（splash 主题三态）核对冒烟项与渲染结论的继承完整性。

---

## 2. 行为对齐：§9 验收表覆盖度核对

以「可行性 §2 的 21 项能力 + desktop.ts 实际行为」为全集，对照 `落地 §9` 22 行表：

| 能力（rc.14 现状） | §9 行 | 覆盖判定 | 备注 |
|---|---|---|---|
| 窗口尺寸/最小/居中/最大化恢复 | 1 | ✅ | M2 §3.4 另有逐项对比表 |
| 逻辑像素换算（DPI 双屏） | 2 | ✅ | 双屏 + 100%/150% 比对 |
| 无边框 + 透明 + 背景色 | 1/10 | ⚠️ 部分 | 无边框透明仅 M1 验收 2.3 提及，§9 无显式行；背景图行 10 ✅ |
| 窗口记忆（只存 maximized + 老文件兼容） | 3 | ✅ | MAX_POSITION=8000 校验保留（迁移方案 §4-1） |
| 托盘常驻 + 4 菜单 + 动态 label | 4 | ✅ | |
| 关闭/最小化到托盘 | 5 | ✅ | keepalive 简化已标注等价 |
| 主题跟随（页面→DWM）+ OS 主题→图标 | 6/7 | ✅ | set_icon 待验证已标（落地 §10-3） |
| 单实例 / 多实例共存拦截 | 8/9 | ✅ | 行 8 为显式行为变更决策点 |
| 背景图 / 皮肤 / 右侧栏 / 设置卡 | 10/11/12/13 | ✅ | #32 锚点进冒烟项 |
| 打开工作区 / 新建任务（Explorer 前置激活） | 14 | ✅ | |
| 任务完成通知（点击回窗 + 30s 冷却 + 聚焦抑制） | 15 | ✅ | 聚焦抑制在 T3.5；依赖 notification 插件待验证 |
| 事件声音 | 15 | ⚠️ 有缺口 | **跨平台通道未定**（见 H4）：sound.ts 为 koffi/winmm Windows-only |
| profile 装配（junction + bundles + 自愈） | 16 | ✅ | #33 升级冒烟项继承（T4.2） |
| 崩溃重启 ≤3 + quit.marker | 17 | ✅ | |
| 启动门控 DSH_HUB_LAUNCHED | 18 | ✅ | Rust spawn 设置（铁律 3） |
| 启动画面 splash→SPA（300ms + 主题三态防闪白） | — | ❌ **缺失** | 见 M3；仅 T4.4 一句带过，无 §9 行 |
| 多显示器启动（光标屏 3/4 默认尺寸） | 1/2 | ⚠️ 部分 | DPI 双屏有比对，但「光标所在屏」无显式验收 |
| 进程身份 / AppUserModelID / 任务栏分组 | — | ❌ **缺失** | 见 M2；仅 T1.3 一句带过 |
| 深链（新增可选能力） | — | ❌ **缺失/范围不清** | 见 L3 |
| 自动更新 / 全新环境首启 / 身份四重相等 / 日志 | 19/20/21/22 | ✅ | |

**结论**：22 行表覆盖了 rc.14 绝大部分核心行为，但存在 3 个明确缺口（**启动屏时序、AppUserModelID、深链范围**）与 2 个部分覆盖（**事件音跨平台、多显示器启动**），与用户点名的四类候选缺失吻合（任务完成通知/事件音实际已入表，但事件音只覆盖 Windows 通道；AppUserModelID 与启动屏确实缺失）。

---

## 3. 问题清单

### 3.1 高严重度（发布/数据安全级别，M1 前必须闭合）

#### OPS-H1：$DSH_HOME 默认路径解析在 Tauri 侧未定义，存量数据存在「失联」风险
- **描述**：rc.14 的 `state-store.ts dshHome()` 语义是 `env DSH_HOME` → 否则 `homedir()/.dsh`（state-store.ts L33-36，launcher/hub-exe/state-store 三处同源）。research-D §4 却写「Rust 壳读 `DSH_HOME` env 或默认 `dirs::data_dir()`（可保持 ~/.dsh 兼容既有 profile/会话数据）」——`dirs::data_dir()` 在 Windows 上是 `%APPDATA%`，**不是 `~/.dsh`**，括号内的兼容声明与实现提示自相矛盾。桌面快捷方式启动时环境里通常没有 `DSH_HOME`，若 Rust 侧按 `data_dir()` 兜底，已有用户的 profiles/sessions/config/pins 全部「找不到」（数据未删但被孤儿化），等于 #33 级别的迁移事故。同时报告未规定 Rust 把**解析后的** `$DSH_HOME` 显式传给 sidecar env（T4.1 只写 `.env("DSH_HOME",...)`，来源未定）。
- **涉及**：research-D §4（$DSH_HOME 行）、落地 T2.2/T4.1/T4.3、迁移方案 §4-10。
- **建议**：在 Rust 侧定义与 `state-store.ts dshHome()` **逐字一致**的解析函数（`env::var("DSH_HOME")` 非空 → 用之；否则 `home_dir()/.dsh`），在 spawn sidecar 前解析一次并显式 `env("DSH_HOME", 解析值)` 传递；把该函数及其单元测试列入 M1/T2.2；三报告统一改为「默认 `~/.dsh`（与 rc.14 完全一致）」并删除 `dirs::data_dir()` 表述。

#### OPS-H2：存量 npm rc.14 用户 → Tauri 安装器的过渡路径完全未设计
- **描述**：迁移后 junction 目标从「npm 全局包」变「安装目录」（research-D §2.6 承认），但三报告都没有回答过渡场景：① 存量 profile 的 junction 已指向 npm 全局包，新壳首启自愈能否把它 relink 到安装目录（旧 launcher 的裸包自愈逻辑随 `bin/legacy/` 冻结，新壳必须自带等价的「目标检测 + relink」）；② 新旧快捷方式同名（都是 `DeepSeek Harness.lnk`）：安装器覆盖创建后，**旧 npm 包卸载时 postuninstall.mjs 会删除同名快捷方式——可能误删安装器建的快捷方式**；③ 旧 npm 包的 `dsh-hub` PATH 命令仍指向 webviewjs 壳，用户可能「两个壳并存、版本错乱」；④ 升级演练（可行性 P7）只有条目没有场景脚本。
- **涉及**：可行性 §5.2/P7、research-D §2.6/§4、迁移方案 §3.3/§7.4、落地 §6.3/T5.6。
- **建议**：P7 升级设计必须包含「存量 npm 用户迁移清单」：安装器（或新壳首启）检测旧 profile junction 目标 → 非安装目录则 relink；检测旧快捷方式/旧 npm 包 → 提供一次性迁移（保留数据、移除旧入口或文档化卸载顺序）；明确「npm 包继续发布与否」的最终决策（落地 T5.6 说插件层降级为 sidecar 依赖，但 shell 分发是否还走 npm 未定）；升级演练写入 M5 验收（在装有 rc.14 的隔离环境跑「装安装器 → 首启 → 数据仍在 → 旧命令行为一致」）。

#### OPS-H3：安装器「删除应用数据」语义与 $DSH_HOME 冲突，卸载可能误删用户会话
- **描述**：research-D §2.4 说卸载清理「NSIS 模板自带删除应用数据复选框（删 `$APPDATA/<bundleId>`）」——但 dsh-hub 的应用数据在 `$DSH_HOME`（默认 `~/.dsh`，含 **profiles/ + sessions/ 用户会话库**），不是 `$APPDATA/<bundleId>`。照搬模板 = 要么删错位置、要么（若改成删 `$DSH_HOME`）默认勾选会把整个会话库删掉。rc.14 的 postuninstall 只删快捷方式，属于弱清理；迁移后必须自定义卸载项。
- **涉及**：research-D §2.4、迁移方案 §3.3（postuninstall 废弃）、落地 T5.1（NSIS 模板）。
- **建议**：自定义 NSIS 卸载逻辑分三层：① 必删：安装目录/快捷方式/开始菜单/注册表 Uninstall 键；② 可选勾选：dsh-hub **自有**文件 `$DSH_HOME/dsh-hub/`（bin/、browser-data、logs、backup、quit.marker、launcher.lock）+ `$DSH_HOME/dsh-hub-window-state.json`；③ **默认保留**：`$DSH_HOME/profiles/` 与 `$DSH_HOME/sessions/`（或单列独立勾选并强警示）。卸载冒烟进 T5.5 门禁（装→卸→断言三目录各自行为）。

#### OPS-H4：事件声音跨平台策略未定，「保留 Node 侧播放」在 macOS/Linux 静默失效
- **描述**：`sound.ts` 是 Windows-only（`process.platform !== 'win32'` 直接 return；koffi→winmm `PlaySoundW`，sound.ts L70）。可行性 §2#15 建议「保留 Node 侧播放（sidecar 内）」，落地 T4.6 写「playSound → 保留 sound.ts（…浏览器可自理或壳播放，**待验证 决策**）」——三端下 Node sidecar 仍是 Node 进程，调 `playTaskSound` 在 macOS/Linux **什么都不播**，而 §9 行 15 的验收方法是「完成一轮任务验证」，没有平台列，等于该行在非 Windows 上无法通过也无法被发现。声音由 session 事件驱动（插件层逻辑），正是跨端最容易「静默丢失」的能力。
- **涉及**：可行性 §2#15/§5.4、迁移方案 §3.1（sound.ts 行）、落地 T4.6/§9-15/M3。
- **建议**：M3/M4 前闭合声音通道决策，三选一并写验收：a) 页面侧 HTMLAudio（webview 播放 assets 里的 WAV，最省、三端同源，需确认 dsh 页面 CSP/音频策略）；b) Rust 壳播放（rodio/cpal，体积/依赖成本高）；c) 平台命令（macOS `afplay` / Linux `paplay`/`aplay` 子进程）。§9 行 15 增加平台列，macOS/Linux 验收方法各自明确。

#### OPS-H5：三端差异没有逐端验收维度
- **描述**：§9 表全部行为行都是平台无关表述，M5 §6.3-1 只有一句「三端产物均能生成、安装、启动出完整 UI」。而报告自己承认的差异点（托盘 Linux appindicator 待实测、通知 macOS 权限/Linux DBus、macOS 标题栏 overlay + 前端 `--titlebar-offset`、Linux WM 无边框、深链逐端注册）没有对应任何一端的验收项。尤其 macOS 无边框 + 红绿灯按钮叠在 dsh web UI 上，需要前端布局适配（dsh-hub 不拥有 dsh 前端，`--titlebar-offset` 变量由谁注入、dsh 页面是否响应，报告完全没提）。
- **涉及**：可行性 §5.4、迁移方案 §4-2/§4-7、落地 §9/M5 §6.3。
- **建议**：§9 表加「平台」列（Win/macOS/Linux/全平台），或 M5 新增「三端逐端验收清单」：托盘（Linux 需 appindicator 实测项）、通知（macOS 授权弹窗、Linux DBus）、标题栏（macOS traffic lights 不遮挡 + offset 注入点）、声音（H4）、深链（若在范围内）、无边框（Linux WM 兼容）。M1/M2 的像素验证（#32 结论跨端）也应以平台列形式纳入。

### 3.2 中严重度（M4/M5 前必须落地）

#### OPS-M1：桥接传输方案三报告不一致，P1「桥协议契约冻结」未闭合
- **描述**：可行性 §3.4 与迁移方案 §2.1 推荐**方案 B（HTTP/SSE 桥）为主**，且迁移方案明确「落地 T4.5 的 `invoke("bridge_message")` 属方案 A 变体，若采纳 B 轨则 tauri.ts 降级为薄适配层」；但落地 T4.5/T4.6 实际实现是 **invoke/emit（方案 A）**，未提 HTTP/SSE 桥。方案 A 需要 `dangerousRemoteDomainIpcAccess` 白名单（远程 origin 注入 IPC，安全面扩大）；方案 B 保持「client 可脱离 Tauri 调试」的零改动承诺。两者对 M4 验收（client half 零改动）与 X4 安全约束影响不同。
- **涉及**：可行性 §3.4/P1、迁移方案 §2.1/§5.2、落地 T4.5/T4.6。
- **建议**：开工前把 P1 升级为「选型 + 桥消息清单 + 安全分析」的正式决策记录，三报告统一口径；若选 B，T4.5/T4.6 任务描述改写为 SSE 客户端 + 薄 invoke 适配层；若选 A，明确 `dangerousRemoteDomainIpcAccess` 的 `RemoteDomainAccessScope` 配置与白名单收窄到 `127.0.0.1` 的验收项。

#### OPS-M2：AppUserModelID 无验收项（任务栏分组 + 通知点击激活都依赖它）
- **描述**：rc.14 用 `SetCurrentProcessExplicitAppUserModelID('DeepSeekHarness.Desktop')`（app-id.ts L14）保证任务栏分组/图标稳定。落地 T1.3 只说 identifier `com.marecgents.dsh-hub`「对应 AUMID 语义（待验证最终形态）」，但：① Tauri 实际 AUMID 由 identifier 推导，最终形态未验证；② NSIS 快捷方式的 AppUserModelId 必须与该值一致，否则任务栏不分组、**Windows toast 点击激活（通知回窗）失效**；③ §9 表无 AUMID 行，M3 通知验收（§4.4-6）无法真正闭环。
- **涉及**：落地 T1.3/§9-15/M3 §4.4、迁移方案 §3.1（app-id 行）、research-D §2.4。
- **建议**：§9 增加「进程身份/AUMID」行（M3/M5）：任务栏显示 dsh-hub 名称与图标、与托盘图标同组、快捷方式 AUMID == 应用 AUMID、toast 点击回窗；并把「identifier→AUMID 最终形态」列入 P5 待验证清单。

#### OPS-M3：启动屏（splash→SPA 时序 + 主题三态防闪白）无验收行
- **描述**：rc.14 的 300ms splash → SPA 导航是刻意的「无白/黑闪」体验（desktop.ts L339-376），且踩坑 #10 记录「splash 期间主题探测必须三态（na/-1），否则标题栏启动闪浅色」。落地 T4.4 只写「300ms splash 保留（待验证 API，M2 一并验证）」，§9 无对应行；Tauri 双窗 splash（visible:false 主窗 + splash 窗）只在迁移方案 §4-1 出现。启动闪白/主题闪烁是桌面壳最常见劣化点。
- **涉及**：落地 T4.4/§9、迁移方案 §4-1、踩坑 #10。
- **建议**：§9 增加「启动画面」行（M2/M4）：冷启动无白屏/黑屏帧、splash 主题与 SPA 一致（深/浅各一次）、splash→SPA 切换无闪烁；把 splash 主题三态探测（或 Tauri 等价机制）列为验收方法。

#### OPS-M4：dsh.log 位置在 Tauri 时代未迁移（安装目录可能只读）
- **描述**：rc.14 的 `LOG_FILE = join(PACKAGE_ROOT, 'dsh.log')`（launcher.mjs L27），且弹窗文案明示「dsh.log 在包旁边」。Tauri 时代包根在安装目录（per-machine 安装 = Program Files，**用户不可写**），落地 X1 只说「sidecar node 侧日志复用现有 dsh.log 机制（launcher log() 语义保留）」——复用机制但没说位置，照搬即「日志写不进 → 报错误导/排障失效」。同时 rc.14 `resetLog`（每次启动清空 dsh.log 防膨胀）语义也未交代是否保留。
- **涉及**：`bin/launcher.mjs` L27/L43-50、落地 X1/§9-22、迁移方案 §9.1。
- **建议**：明确 dsh.log 新位置 `$DSH_HOME/dsh-hub/dsh.log`（与 tauri-plugin-log 的 Folder target `$DSH_HOME/dsh-hub/logs/` 并列），Rust spawn sidecar 时用已解析的 `$DSH_HOME` 拼接；「每次启动 resetLog」保留或改为简单轮转（按大小/天数）；排障路径验收（§9-22）写明具体步骤（如模拟 node 缺失 → 断言两个日志目标都有内容）。

#### OPS-M5：`dsh-hub` PATH 命令三报告矛盾，未决策
- **描述**：迁移方案 §3.2 说 `bin/dsh-hub.mjs`「保留为 CLI 兼容入口（M5 决策）」；落地 T3.7 却把它与 launcher 一起「M4 起移入 `bin/legacy/` 冻结」；research-D §4 说安装器默认不建 PATH 命令，「或保留极简 npm shim 包」。三处口径互相矛盾，用户问题「dsh-hub 命令（PATH）在 Tauri 时代是否保留」无答案。
- **涉及**：迁移方案 §3.2、落地 T3.7、research-D §4、AGENTS.md §5.5（快捷方式入口）。
- **建议**：M5 前做显式决策：a) 保留——安装器注册 PATH 指向 `dsh-hub.exe`（CLI 启动 = 开壳，等价 `DSH_HUB_LAUNCHED=1` 语义）或保留极简 npm shim；b) 放弃——文档化替代（`dsh web` + 桌面快捷方式），并在 README/AGENTS.md 写明。无论哪种，`dsh-hub` 命令行为（开壳而非裸 CLI 模式）写入验收。

#### OPS-M6：安装包体积验收口径自相矛盾，sidecar 通道决策未闭合
- **描述**：可行性 §5.1 已权威修正「~10MB 只能指 Rust 壳，含 Node 捆绑实测预计 40-80MB，报告须向用户如实修正」；落地 §6.3-4 仍以「安装包体积 ~10MB 级」为验收目标（只在括注里留了退路）。同时 research-D §4.1 推荐方案 A（全局 npm dsh，先行）与迁移方案 §7.1「A 推荐先行」一致，但落地 T5.2 直接实现方案 B（externalBin 捆绑 Node），M5 验收和门禁 P2（sidecar 打包验证）都建立在未定通道上。
- **涉及**：可行性 §5.1、research-D §4.1、迁移方案 §7.1、落地 T5.2/§6.3-4。
- **建议**：M5 前闭合 A/B/C 决策（可 A 先行、B 后置增强）；§6.3-4 验收改为「按已选通道记录实测体积并对比预期（A：壳 ~10MB 级；B：40-80MB），显著偏差需说明」，删除「~10MB 级」作为硬验收；T5.2 任务加「通道决策前置」依赖。

#### OPS-M7：P4 干净安装冒烟的 CI 可执行性未落实
- **描述**：落地 T5.5-③「NSIS 静默安装 → 首启 → 断言窗口进程存活 + profile 装配正确（**待验证** CI 环境可行性）」——门禁继承里最关键的一条（#33 教训的直接映射）停留在「待验证」。现 verify-release.mjs P4 用 `DSH_HUB_ASSEMBLE_ONLY=1` 无窗口跑装配，Tauri 时代没有等价诊断入口；若冒烟必须起真实 GUI，Windows runner 可行，macOS/Linux runner（无显示/无 AppImage 运行环境）需要具体方案。
- **涉及**：落地 T5.5-③、迁移方案 §7.3 P4、verify-release.mjs P4。
- **建议**：给 Tauri exe 增加 `--assemble-only`（或 `--smoke`）诊断参数，等价 `DSH_HUB_ASSEMBLE_ONLY=1`（只装配 + 验证窗口可创建后立即退出，不进入完整 UI）；门禁脚本逐端给命令：Windows `NSIS /S` + 进程/装配断言；macOS `hdiutil attach` + 启动 .app（CI 有 WindowServer）或 `--smoke`；Linux AppImage `--appimage-extract`/xvfb + `--smoke`。并断言「空 `$DSH_HOME` + 首启 → scoped 装配 + 无连续异常退出」。

#### OPS-M8：WebView2 install mode 未进落地骨架配置
- **描述**：迁移方案 §7.1 与 research-D §2.4 都写了 `windows.webviewInstallMode: embedBootstrapper`，但落地 T1.3（骨架配置「一次到位」）与 T5.1 都没列该字段——Win10 无 WebView2 Runtime 的机器会白窗，正是安装体验的关键兜底，却不在落地文件级清单里。
- **涉及**：迁移方案 §7.1、research-D §2.4、落地 T1.3/T5.1。
- **建议**：T1.3 补 `bundle.windows.webviewInstallMode: "embedBootstrapper"`（或明确 M5 启用并在 T5.1 落地），并加验收：「无 WebView2 Runtime 的 Win10 隔离机安装后自动装 Runtime 并成功启动」（可并入 T5.5 冒烟）。

#### OPS-M9：AGENTS.md §5 改写只给了要点、未成稿，且双门禁职责未划清
- **描述**：迁移方案 §7.4 / research-D §3 只给「改写要点」，落地 T5.6 把「AGENTS.md §5/§6 改写」作为一个任务，未说明改写稿的完整性要求。关键缺口：① 铁律 6「发布前检查不可跳过」在 Tauri 时代是**双门禁**（npm 插件层 verify-release.mjs + 壳 verify-tauri-release.mjs），各自 gate 什么必须写明；② 铁律 8「发布后真机验证 npm i -g」必须改写为「测试机装安装器首启冒烟」；③ §5.5 运行隔离 junction 目标从「npm 全局包」变「安装目录」，同时旧 npm 包若继续发布，两条隔离纪律并存；④ §5.6 install:local → `cargo tauri build --bundles nsis` 的本地等价链路。
- **涉及**：落地 T5.6、迁移方案 §7.4、research-D §3、AGENTS.md §5.2/5.4/5.5/5.6。
- **建议**：把 T5.6 拆为「改写稿（diff 草案）+ 评审 + 合入」三步，改写稿必须逐条覆盖 §5.2 铁律 0-8、§5.3 命令、§5.4 教训、§5.5 隔离、§5.6 自编译、版本单一来源（package.json ↔ tauri.conf.json ↔ Cargo.toml ↔ GitHub Release tag ↔ latest.json）与发布记录模板。

### 3.3 低严重度（可在开发中顺手修正）

- **OPS-L1（Cargo 版本矛盾）**：落地 T1.1 写 `Cargo.toml version="0.1.0"`，迁移方案 §7.4 写「Cargo.toml 恒 `0.0.0` + `publish=false`」——T1.1 应改为「版本无关（恒 0.0.0），单一来源走 tauri.conf.json version: ../package.json」。
- **OPS-L2（X3 备份路径歧义）**：落地 X3 备份对象写成「`$DSH_HOME/dsh-hub/config.json` + `window-state.json` + `pins.json`」——实际 `window-state.json` 在 `$DSH_HOME` **根**（state-store.ts L40），config/pins 在 `$DSH_HOME/dsh-hub/` 下（config-api.ts L92 / pins-api.ts L33）。备份清单必须写精确路径，避免实现时漏文件。
- **OPS-L3（深链范围三报告不一致）**：可行性 #9/迁移方案 §4-7 把深链列为能力（「M5 前不阻塞主线」），落地 §9 表完全无行——要么显式标注「v1 范围外」，要么加 M5 验收行（Windows 注册 scheme / macOS URL types / Linux .desktop + 意图分发安全模型）。
- **OPS-L4（崩溃现场信息不足）**：X2 只写 panic hook 落 crash.log，未含版本/commit/平台/backtrace 字段；建议 crash.log 头记录 `版本 + commit + OS + tauri/cargo 版本`，sidecar 崩溃的 stderr 已通过 `dsh:output` 回灌（保留）；minidump 可作后置增强，不阻塞。
- **OPS-L5（§9 表缺「状态」列）**：行 7（set_icon）、8（行为变更）、15（notification 插件待验证）、19（updater 待验证）等依赖 P4/P5 排查结果，表中无状态标记——建议加「已核实 / 待验证 / 需用户确认」列，M1-M5 可跟踪哪些行被插件 API 核实结果阻塞。
- **OPS-L6（WebView2 数据目录不迁移）**：rc.14 的 WebView2 上下文目录 `$DSH_HOME/dsh-hub/browser-data`（desktop.ts L223）在 Tauri 时代由系统接管，旧 localStorage/cookie 不随迁——影响面小（会话在 `$DSH_HOME/sessions` 不受影响），但建议在迁移文档中显式接受该差异。

---

## 4. 亮点

1. **行为对齐纪律是最大亮点**：落地 §9 的 22 行「rc.14 现状（带源码行号）→ Tauri 目标 → 验收方法 → 里程碑」结构，加上 M2 §3.4/M3 §4.4 的逐项对比表，把「行为对齐」从口号变成了可执行的验收资产；行为变更点（单实例聚焦、`--port 0`→portpicker、keepalive 窗口简化）全部显式标注为「需用户确认/等价说明」，没有悄悄改语义。
2. **$DSH_HOME 相关路径识别准确**：window-state「只存 maximized」+ 老文件兼容读 + MAX_POSITION 校验保留（迁移方案 §4-1/落地 T2.2）；config/pins 属主保留在 Node 侧；`DSH_HUB_LAUNCHED=1` 由 Rust spawn 设置——铁律 3 的工程化落地明确。
3. **踩坑史继承到位**：-#32 fixed 合成结论（Windows 同引擎成立 + macOS/Linux 逐端像素验证）列为 M1/M2 验证项；#33 干净安装冒烟直接映射为 Tauri P4「干净机器装安装器」；升级冒烟项（junction 删除重开自动补建、bare 遗留清理）写进 T4.2——rc.10-13 的事故教训没有被迁移丢掉。
4. **铁律/安全红线保留意识强**：多实例默认拒共存不松（TCP 探活 + dialog 确认）、身份四重相等进 verify-tauri-release、junction 自愈语义在 Rust 侧重写（research-D 明确提示 `symlink_dir` ≠ junction）、capabilities 最小授权 + IPC 命令显式注册、`dangerousRemoteDomainIpcAccess` 白名单收窄到 127.0.0.1。
5. **参考工程实证密度高**：spacedrive/surrealist 的可照抄点给到「文件:行」粒度（ExitRequested prevent_exit、DWM 三属性、子进程托管、config 备份、adapter 双跑、NSIS 模板），「待验证」与「已核实」标注纪律统一，未发现编造 Tauri API 的现象。
6. **门禁继承映射完整**：P1–P5 逐条给出 Tauri 对应（identifier/productName 校验、gen/Cargo.lock 零漂移、安装器冒烟、GitHub Release 直查 + `tauri signer verify`），并新增 cargo clippy/test/fmt 与签名/notarization/私钥存在性检查，延续「任一 FAIL 禁止发布」铁律 0。
7. **运维横切项前置**：X1 日志（多目标）M1 即引入、X2 崩溃处理、X3 配置备份恢复、X4 安全全程并行，且 X1「日志格式直接决定排障」的判断正确。

---

## 5. 结论

三份报告在「行为对齐」「铁律继承」「踩坑史映射」上达到可执行标准，`落地 §9` 验收表覆盖 rc.14 绝大部分核心行为，未发现编造 API 或削弱红线的问题，可行性「高」评级成立。

但作为**兼容性与运维审查**，必须指出：**存量用户过渡（H2）、卸载清理（H3）、$DSH_HOME 默认解析（H1）、三端声音与逐端验收（H4/H5）** 四处高严重度缺口会直接决定迁移后的安装/升级/卸载体验是否「平滑」，其中 H1（数据孤儿化）与 H3（误删会话库）具备数据安全级别的影响，H2 会重现「干净环境测不出」类事故（#33 教训的 Tauri 翻版）；另有桥接选型（M1）、AUMID（M2）、启动屏（M3）、体积口径（M6）、PATH 命令（M5）等中等问题需在 M4/M5 前闭合。

**评级：有条件通过。** 建议：① H1–H5 作为 P7 前置条件的强制内容，在 M1 动工前出决策记录；② M1–M5 各里程碑验收时同步勾稽 §9 表新增的「平台列 + 状态列」；③ T5.6 的 AGENTS.md 改写稿需在合入前过一轮评审（双门禁职责 + 铁律 8 改写 + 版本单一来源）。以上缺口均为「补齐即闭环」的工程问题，不改变迁移可行性评级。

---

## 附：证据索引（本轮核对过的本地文件）

| 事实 | 出处 |
|---|---|
| `dshHome()` = env DSH_HOME 或 `~/.dsh` | `src/services/state-store.ts` L33-36 |
| window-state 文件在 `$DSH_HOME/dsh-hub-window-state.json`（根） | `state-store.ts` L40 |
| config.json / pins.json 在 `$DSH_HOME/dsh-hub/` 下 | `config-api.ts` L92 / `pins-api.ts` L33 |
| dsh.log 在包目录旁（PACKAGE_ROOT/dsh.log） | `bin/launcher.mjs` L27（L43-50 resetLog） |
| AUMID = `DeepSeekHarness.Desktop` | `src/services/app-id.ts` L14 |
| sound.ts 为 koffi/winmm，Windows-only | `src/services/sound.ts` L19-62/L70 |
| splash 300ms + 主题三态探测 | `src/desktop.ts` L339-376；踩坑 #10 |
| 通知策略（聚焦抑制 + 30s 冷却 + 点击回窗） | `desktop.ts` L657-698 |
| 多显示器 3/4 默认尺寸 | `desktop.ts` L231-237 + `screen.ts` |
| WebView2 数据目录 `$DSH_HOME/dsh-hub/browser-data` | `desktop.ts` L223 |
| verify-release P1–P5 现状（npm 时代） | `scripts/verify-release.mjs` 全文 |
| 干净安装冒烟教训（#33） | `docs/关键踩坑记录.md` L173-176 |
