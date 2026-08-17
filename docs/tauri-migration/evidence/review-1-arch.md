# review-1-arch — 架构完整性审查意见（审查轮 1 / 3）

> 审查对象：《可行性分析报告》《代码迁移方案报告》《代码落地方案报告》（均 2026-08-17，docs/tauri-migration/）
> 参照基线：`.planning/research-A.md`（壳层文件清单）、`research-B.md`（能力映射）、`research-D.md`（发布链路）、`REFERENCE.md`、根 `AGENTS.md`
> 审查角度：三报告一致性 / 进程模型 / 模块划分 / 接口完整性 / 架构技术债
> 结论：**需修改后验收**（3 项高严重度问题先修，其余按清单补齐）

---

## 一、问题清单

### 🔴 高严重度

**H1. 桥接选型三报告不一致，落地实际只实现了方案 A，双轨桥未收敛**
- 描述：可行性 §3.4 推荐**方案 B（HTTP/SSE 桥）为主**、方案 A 仅作窗口级命令通道；迁移 §2.1 复述「B 为主、A 仅壳内窗口级命令，落地 T4.5 的 invoke 属 A 变体，若采纳 B 轨则降级为薄适配层」。但落地 §5.1 目标直接写「webviewjs 桥替换为 Tauri invoke/event」，T4.5/T4.6/T4.8 全部是 invoke/emit（方案 A），**全文没有任何 SSE/WS 桥端点的任务**。三份报告对"主桥"各执一词，且无「选型冻结」任务（可行性 P1 的"选型文档"也未落任何里程碑）。
- 涉及：可行性 §3.4、P1；迁移 §2.1、§5；落地 §5.1、T4.5–T4.8
- 建议：在 M1 前置条件里新增「桥协议选型冻结」任务（P1 落地），明确唯一主桥。推荐收敛为：**页面↔壳走方案 A（invoke/event）+ 落地 T1.3 补配 `dangerousRemoteDomainIpcAccess`（见 H2）**，sidecar↔壳走 stdio 命令通道（见 H3）；方案 B 明确降级为「非 Tauri 浏览器调试的可选适配层」，三报告同步改写，避免双轨并存。

**H2. 方案 A 成立的必要配置 `dangerousRemoteDomainIpcAccess` 在落地中缺失，且与 __TAURI_INTERNALS__ 探测自相矛盾**
- 描述：webview 加载的是远程 origin `http://127.0.0.1:<port>`，Tauri 默认不向远程页注入 IPC。可行性 §3.4/P1 已点出必须配置 `app.security.dangerousRemoteDomainIpcAccess`（白名单收窄到 127.0.0.1），但落地 T1.3 的 tauri.conf.json 字段清单（productName/identifier/windows/bundle/csp 等）**没有该项**。而落地 T4.5 的适配器探测 `"__TAURI_INTERNALS__" in window`、T4.6 的 invoke、T4.8 的 shell_command emit、T4.1 的 `dsh:output` 回灌——全部依赖该注入开关；不配则探测恒为 false、页面侧 invoke/listen 全部静默失败。这是"探测结果"与"注入开关"同源的逻辑死结。
- 涉及：可行性 §3.4、§5.6、P1；迁移 §2.1 通道 2；落地 T1.3、T4.1、T4.5、T4.6、T4.8、X4-②
- 建议：T1.3 增列 `app.security.dangerousRemoteDomainIpcAccess` 的 RemoteDomainAccessScope 配置（域 127.0.0.1、端口随机故按 IP 授权），并在 M1 验收加一条「远程页可 invoke/listen」冒烟；同时 T4.5 的探测逻辑注明「该探测成立的前提是本配置已启用」，避免把开关与探测写成循环论证。

**H3. sidecar ↔ 壳命令通道（Node→Rust stdio JSON-RPC）无落地任务，notify 跨进程路径未定义**
- 描述：可行性 §3.4 与迁移 §2.1 通道 3 都定义了「sidecar↔壳：子进程 stdio JSON-RPC/事件行，承载窗口级命令 applyTheme/applySize/notify/quit，不经页面」。但落地任务中没有该通道：T4.1 node.rs 只有 stderr 管道逐行 emit `dsh:output`（单向日志），**没有 stdin 命令协议**；T4.6 反而把 applyTheme/applySize 实现为**页面→壳 invoke**（方向与可行性/迁移相反，且 rc.14 中 applySize 确实由页面驱动，方向本身合理，但两报告未对齐）；最严重的是 `notifyTaskComplete`（index.ts 的 session/event 在 Node sidecar 内触发）→ notify.rs 的跨进程调用路径**没有任何任务定义**——Node 进程如何告诉 Rust 弹 toast ？
- 涉及：可行性 §3.3/§3.4；迁移 §2.1 通道 3、§4-9；落地 T4.1、T4.6、T3.5
- 建议：新增任务「node.rs stdin 命令协议（JSON 行：notify/applyTheme/applySize/quit）」，T3.5/T4.6 的 notify/窗口命令统一走该通道；若决定窗口命令全部由页面 invoke 驱动（更符合 rc.14），则在三报告中显式改写通道 3 为「日志上行 + 命令下行仅 notify/quit」，二选一，不能两边都写。

### 🟠 中严重度

**M1. 安装包体积验收口径冲突（验收标准级矛盾）**
- 描述：落地 §6.3 验收 4「安装包体积 ~10MB 级（node sidecar 是主要增量）」直接与可行性 §5.1「~10MB 只能指 Rust 壳二进制本身，安装包实测预计 40-80MB 级，报告须向用户如实修正」、§6 收益表注、§7.1 评级边界矛盾；且落地 §10-6 自己又承认「与 ~10MB 目标冲突」。验收标准内部自相矛盾。
- 涉及：可行性 §5.1/§6/§7.1；落地 §6.3-4、§10-6；迁移 §7.1
- 建议：M5 验收改为「壳二进制 ~10MB 级 + sidecar 增量实测值（记录三端实测体积）」，删除"安装包 ~10MB"表述；将 externalBin vs 按需下载的决策（落地 §10-6）提前为 M5 前决策点。

**M2. 壳自身崩溃重启缺口（进程模型完整性）**
- 描述：rc.14 的 launcher 守护的是**整个进程**（shell+dsh 一起，≤3 次重启）；Tauri 化后 sidecar 由 node.rs 守护（落地 T4.1 ✓），但 **dsh-hub.exe 自身崩溃**由谁拉起？迁移 §4-6 第二层（外部 launcher 守护或 Windows 计划任务）在落地无任何任务；X2 只有 panic hook 写 crash.log + 重启计数文件，不重启。验收 §9#17「崩溃重启 ≤3 次」实际只覆盖 sidecar。
- 涉及：迁移 §4-6、§9.1；落地 X2、T4.1、§9#17；research-B §2.6
- 建议：在 M4/M5 增加「壳自崩溃守护」决策任务（外部轻量 launcher 或计划任务，或显式声明 Tauri 壳崩溃 = 用户手动重启可接受并写入验收差异），不能悬空。

**M3. 回退线（webviewjs 双壳并存）无退役条件，与"架构简化"收益冲突**
- 描述：迁移 §5.2/落地 T4.6 保留 desktop.ts + `DSH_HUB_SHELL=webviewjs` 回退线，意味着 @webviewjs/webview、koffi 依赖与整条 launcher 家族长期驻留 npm 包；可行性 §6 收益却宣称"消除 koffi FFI 面、webviewjs teardown 崩溃"。回退线合理（可回退原则），但两报告都没定义**何时移除**。
- 涉及：可行性 §6；迁移 §5.2、§7.4；落地 T4.6、§5.4-7
- 建议：定义退役条件（如「首个正式版发布 = 移除回退线」）+ 依赖清理门禁（verify-tauri-release 增加"webviewjs/koffi 不在 dependencies"检查），把双壳维护成本限定在 dev-v2 过渡期。

**M4. 多实例检测改造无任务落点，且 tauri-plugin-dialog 不在依赖清单**
- 描述：迁移 §3.2 说 multi-instance「netstat+CIM 探测 → TCP 探活（dsh host 端口）+ dialog 确认」，但落地 T4.2 只做 assemble-profile 提取，**没有把 multi-instance 改造成 TCP 探活的任何任务**；TCP 探活的前提（portpicker 端口预选）到 M4（T4.4）才落地，M3 之前多实例拦截语义如何保持未说明。且迁移 §4-5/T3.3 所需的 `tauri-plugin-dialog` 不在落地 T1.1 的 Cargo.toml 依赖清单里。
- 涉及：迁移 §3.2、§4-5；落地 T1.1、T4.2、T4.4、§9#9
- 建议：新增任务「multi-instance 模块 TCP 探活化」（依赖端口预选，故放 M4 同批）；T1.1 补 `tauri-plugin-dialog`；明确 M2/M3 阶段多实例检测继续由 legacy Node 模块承担并写进 T3.7。

**M5. splash 方案矛盾：迁移定官方双窗，落地定单窗 HTML 导航**
- 描述：迁移 §4-1「splash 用官方双窗模式（visible:false 主窗 + splash 窗 + close_splashscreen 命令）」；落地 T4.4「原 desktop.ts 的 300ms splash 保留：窗口先加载 splashHtml 再导航（初始化脚本或 navigate，待验证）」。两个报告规定了互斥的 splash 实现。
- 涉及：迁移 §4-1、§4-15；落地 T4.4；research-B #15
- 建议：收敛为一个方案（推荐官方双窗，行为更干净且避免 JS 定时器竞态），并把「M4 后 frontendDist 空壳下 splash 页面资源从哪来」一并定义。

**M6. transparent(true) 默认开启与可行性 #2"按需启用"及踩坑 #32 合成结论的关系未评估**
- 描述：可行性 §2 #2 明确「背景图穿透是页内 CSS（75% color-mix），非 OS 级透明窗口，transparent(true) 仅按需启用」；但落地 T1.3/T1.6 在 M1 就默认 `transparent:true`。webviewjs 时代**从未使用过 OS 级透明**，落地 M1 验收却写「WebView2 背景合成与 webviewjs 同引擎，理论一致」——"同引擎"≠"同行为"：OS 级透明会激活 WebView2 不同的背景合成路径，可能改变 #32 的 fixed/半透明结论。
- 涉及：可行性 §2 #2、§4.2；落地 T1.3、T1.6、§2.3-1；research-A §2.1
- 建议：M1 先按 `transparent:false`（与 rc.14 一致）起步，把 transparent 作为"需要时按需开"的配置项，并加一条像素验证「transparent:true 时 #32 结论是否仍然成立」；如必须开，则同步修正可行性 #2 的"仅按需"表述。

**M7. 装配归属三处矛盾：迁移 §6"Rust 侧重写 junction" vs 迁移 §3.1/落地 T4.2"提取 assemble-profile.mjs（sidecar）"**
- 描述：迁移 §6 表格警告「Rust `std::os::windows::fs::symlink_dir` 建的是目录 symlink 而非 junction……自愈语义在 Rust 侧重写」；但迁移 §3.1 与落地 T4.2 的方案是「ensureBundleInstalled 原样提取为 sidecar 脚本（Node 执行，junction 逻辑原样复用）」——若装配留在 Node 脚本，Rust 侧 junction 重写的警告根本不适用；两处默认结论相反（落地 T4.2 虽标"决策点"但默认 sidecar）。
- 涉及：迁移 §3.1、§6；落地 T4.2；research-D §2.5
- 建议：按落地 T4.2 的默认（sidecar 装配）定稿，删除/改写迁移 §6 的"Rust 侧重写"表述，仅在"未来 Rust 化装配"时保留 junction crate / mklink /J 备选说明。

**M8. 版本策略矛盾：Cargo.toml version 0.1.0 vs 恒 0.0.0**
- 描述：落地 T1.1 写 `[package] name="dsh-hub" version="0.1.0"`；迁移 §7.4 写「版本单一来源：surrealist 式 tauri.conf.json version: ../package.json（Cargo.toml 恒 0.0.0 + publish=false）」。两个报告规定了互斥的 Cargo 版本策略。
- 涉及：落地 T1.1；迁移 §7.4；research-D §2.3
- 建议：统一为 surrealist 式（Cargo.toml 恒 0.0.0、tauri.conf.json version 引用 package.json），T1.1 改之。

**M9. 行为决策点清单缺项：端口预选、get_workspace_path 方向反转未列入落地 §10-5**
- 描述：迁移 §1.2 声明「行为变更（单实例二次启动聚焦、**端口预选**）显式列为决策点」；落地 §10-5 的决策点清单只有「① 单实例聚焦 ② 托盘命令隐藏时语义」，**端口预选缺失**；此外 T4.8 的 `get_workspace_path`「查 node 侧 vs 前端应答」方向待验证（rc.14 是壳问页面）也应是显式决策点。
- 涉及：迁移 §1.2、§4-8；落地 T4.3、T4.4、T4.8、§10-5
- 建议：§10-5 补齐「③ 端口预选（--port 0 → portpicker 固定端口）④ get_workspace_path 应答方向」，并给 T4.8 一个明确的 M4 前截止决策。

**M10. explorer 前置激活与 minimize-to-tray 两个行为无实现任务**
- 描述：rc.14 explorer.ts 的「EnumWindows 激活已开 Explorer 窗口」在 Tauri 侧无任务（落地 M4-4 只写"倾向 tauri-plugin-shell open"，open 不做前置激活）；rc.14 minimizeToTray（250ms 轮询→hide）在落地 T3.2 中只有关闭语义（prevent_exit+hide），minimize 到托盘的 Rust 实现（Resized/is_minimized→hide）无任务落点，但验收 §9#5 又要求该行为。
- 涉及：可行性 §2 #16；迁移 §3.1、§9.1；落地 T3.2、§5.4-4、§9#5/14；research-A §2.2
- 建议：T3.2 拆成「关闭到托盘 + 最小化到托盘」两个实现项；T4.x 增加 explorer 前置激活小段（Windows 专属）或显式声明"不激活"为验收差异。

**M11. 可行性 §7.1 覆盖度数字与 §2 表对不上**
- 描述：§7.1「约 14 项由核心 API/官方插件直接覆盖、5 项逻辑移植、2 项插件 API 待验证」；按 §2 表逐行统计实际为：**已覆盖 11（#1-4/6/9-12/17/19）+ 已覆盖-保留混合 1（#13）+ 需自研 5（#5/7/8/16/18）+ 有风险 1（#14）+ 保留 3（#15/20/21）= 21**。14/5/2 的分布无法从表中复算。
- 涉及：可行性 §2 表、§7.1
- 建议：在 §2 表尾加一行状态合计（或修正 §7.1 为"约 12 项直接覆盖、5 项逻辑移植、3 项保留、1 项待验证"），保证速览与明细一致。

**M12. 能力项计数口径未统一：21（可行性）/ 18（research-B）/ 16（research-A）**
- 描述：research-A §4 能力项 16、research-B §5 映射项 18、可行性 §2 映射 21（含深链/自动更新等新增与子进程/本地服务拆分）。三处数字都"对"，但没有一处说明增量关系，读者无法核对覆盖度。
- 涉及：可行性 §2、§7.1；research-A §4；research-B §5
- 建议：可行性 §2 表头注明「与 research-A 16 能力项、research-B 18 映射项的差异 = 新增深链/自动更新 + 拆分本地服务/子进程/通知」，三报告统一以可行性 21 项为验收口径。

**M13. 24 vs 26 文件计数未最终统一**
- 描述：任务口径与 research-A §4 是 24（host 15 + launcher 7 + 脚本 2），但 research-A §1.1 实际列出 **17 个 host 文件**（index+desktop+15 services），迁移 §3 也按 26（17+7+2）全量列示，迁移 §1.3 却又写「24 个壳层文件」。同一份迁移报告内 24/26 并存；scripts/ 下 generate-icon.mjs、synthesize-sounds.mjs、build-client.mjs、install-local.mjs 四个脚本没有任何报告分类。
- 涉及：research-A §1.1/§4；迁移 §1.3、§3；落地 附录 A
- 建议：在迁移 §3 开头给出**唯一的权威文件清单**（17 host + 7 launcher + 2 postinstall 配套 = 26 项迁移决策 + 4 个工具链脚本"不迁移、保留"显式归类），全报告统一引用 26。

**M14. 证据基线矛盾：可行性声称 research-A/B 不存在，迁移/落地却以之为准**
- 描述：可行性 依据口径（L7）写「.planning/research-A.md、research-B.md 在本仓库不存在……以 REFERENCE.md 与源码为准」；但迁移/落地大量引用 research-A/B/D 且这些文件实际已在 .planning/ 落盘；落地 附录 A 也称「research-*.md 尚未落盘」。
- 涉及：可行性 L7；迁移 附：证据索引；落地 附录 A
- 建议：可行性 L7 更新为「research-A/B/D 已落盘并作为能力/文件清单基线」，三报告统一证据引用链（research-* 为基线、REFERENCE 为参考工程、源码为已核实依据）。

**M15. 落地 T2.1 把已核实 API 标"待验证"，与可行性 §2 证据状态冲突**
- 描述：落地 T2.1 对 `center()`、`maximize()`/`is_maximized()`、`set_min_size` 等标注「待验证」，而可行性 §2 #1 已给出这些 API 的本地源码行号（`window/mod.rs` L2010/L1525/L1849）并标「已核实」。同一证据库两种标注，弱化了"已核实"纪律的可信度。
- 涉及：可行性 §2 #1；落地 T2.1
- 建议：落地同步可行性/迁移的证据状态（已核实的去"待验证"，仅保留 monitor API 形态等真正未核实项）。

**M16. 深链与 webviewInstallMode 无落地任务（迁移提出、落地缺席）**
- 描述：迁移 §7.1 的 `embedBootstrapper`（WebView2 兜底）与 §4-7 的深链（新增能力）在落地 T1.3/T5.1/M1-M5 任务清单中均无对应项；深链甚至没有出现在 M5 的 targets/updater 相关任务里。deep-link、dialog 插件也不在 T1.1 依赖清单。
- 涉及：迁移 §4-7、§7.1；落地 T1.1、T1.3、T5.1；research-D §2.4
- 建议：T1.3 补 `windows.webviewInstallMode: embedBootstrapper`；M5 新增「深链落地或显式延后」决策任务（现壳无此能力，可接受延后，但要写进报告而非失踪）。

**M17. CI 构建矩阵（tauri-action）无落地任务**
- 描述：可行性 §6 收益、research-D §2.3 都提到 tauri-action 三端自动构建发布；落地 M5（T5.1–T5.6）没有任何 GitHub Actions workflow 任务，只有本地 verify-tauri-release.mjs。
- 涉及：可行性 §6；落地 T5.x；research-D §2.3
- 建议：M5 增加「.github/workflows 三端构建 + 上传 Release + latest.json」任务，与 T5.5/T5.6 串行依赖。

### 🟡 低严重度

**L1. 迁移 §2.2 目录结构缺文件**：§2.1 图含 `single-instance.rs`，§2.2 的 `src/{...}.rs` 清单漏掉它；且 §2.2 的 `src/ 保留` 段未列新增的 `src/bridge/tauri.ts`、`src/tauri-shell.ts`（落地 T4.5/T4.6 才出现）。→ 目录蓝图与任务清单同步。

**L2. icons.ts / png-decode.ts 去向留"可并入/退役（M3 决策）"但落地 M3 无决策任务**：迁移 §3.1 两个文件标注了 M3 决策，落地 M3（T3.1–T3.7）无对应项。→ 在 M2/M3 加一项"资产/解码器去留决策"。

**L3. 25 API 映射未逐项对账**：迁移 §5.1 把 ≈25 API 分组为 14 行，缺 `app.createWebContext`（`$DSH_HOME/dsh-hub/browser-data` 数据目录语义，research-A §1.1/§2.1）、`wv.isDisposed`、`app.off('custom-menu-click')` 的对应说明（Tauri 侧 WebView2 数据目录策略未提——值得一句话：wry 自行管理数据目录，browser-data 语义架构性消失）。→ 补一张逐项覆盖矩阵，标注"保留/映射/架构性消失"三态。

**L4. sound.ts 层归属三处不一致**：AGENTS.md §1 壳层清单未列 sound；research-A §1.1/§4 标"迁移=重写"；可行性 #15 / 迁移 §3.1 按插件层"保留 Node 侧"。→ 统一为"保留 Node 侧（sidecar 内 koffi 或浏览器播放）"并回写 AGENTS.md 壳层清单，落地 T4.6 的 playSound「待验证 决策」给截止点。

**L5. 新桥文件随 npm 包发布**：T4.5 `src/bridge/tauri.ts` 放 `src/` 下会进入 package.json files 白名单（src/ 整目录），随 npm 包发布——回退线需要它所以合理，但报告未说明。→ 一句话注明"桥文件随包发布是回退线要求"。

---

## 二、亮点（做得好的）

1. **三报告角色分工与锚定机制清晰**：为什么（可行性 21 项映射 + P1–P8）→ 怎么做（迁移逐文件决策表 + 能力实现方案）→ 做什么/何时（落地 M1–M5 + T1.x–T5.x + §9 验收总表），任务号跨报告互引，M 阶段划分在迁移/落地间一致，可审计。
2. **逐文件迁移决策表质量高**：迁移 §3 对 26 个文件给出「迁移去向 + 关键行为对应（函数/事件级）+ 参考实现与行号」，与 research-A 的保留/重写标注基本吻合（仅 sound、icons/png-decode 有出入，已列入清单）。
3. **证据纪律诚实**：已核实/待验证两级标注贯穿三报告；对官方插件源码未 clone 的未知项（window-state/notification/dialog 等）如实列出并给出验证前置（可行性 P4、迁移 §9.2、落地 §10），没有编造 Tauri API。
4. **红线保留意识强**：DSH_HUB_LAUNCHED 门控、多实例默认拒共存、插件身份四重相等、scoped junction 装配、rc.10–13 首启事故直接映射为"干净机器装安装器"冒烟（落地 T5.5-③），AGENTS.md 铁律全部有继承落点。
5. **行为对齐方法论正确**：每行为一行「rc.14 现状 → Tauri 目标 → 验收方法」（落地 §9 共 22 行），有意的行为变更（单实例聚焦）显式列为决策点；DesktopShellHandle 接口保留 + `__TAURI_INTERNALS__` 探测 + `DSH_HUB_SHELL=webviewjs` 回退线，把"每阶段可回退"落到代码级。
6. **关键技术纠正到位**：托盘是核心 API 非插件（可行性 §2 修正说明）、window-state 插件行为激进故自实现、localhost 插件场景辨析（WebviewUrl::External 直连即可）、像素三态（builder 逻辑/getter 物理/setter 枚举）分析扎实、junction vs 目录 symlink 差异有警告、`set_theme` DWM 底层行为诚实标待验证。
7. **进程模型骨架成立**：Tauri 主进程（窗口/托盘/主题/sidecar 托管）/ Node sidecar（dsh host + 插件层 5 路由）/ webview（零改动）三层职责边界与 spacedrive/surrealist daemon-client 范式同构，插件层保留路径论证充分（client bundle 伺服、host API 属主不变）。

---

## 三、结论

**本角度：需修改后验收。**

架构骨架（三层进程模型、插件层保留路径、逐文件迁移决策、验收方法论）整体成立，无方向性错误；但存在 **3 项高严重度问题**必须先修：① 桥选型三报告不一致且落地只实现方案 A（H1）；② 方案 A 的必要配置 `dangerousRemoteDomainIpcAccess` 缺失、与 `__TAURI_INTERNALS__` 探测形成逻辑死结（H2）；③ sidecar↔壳命令通道无落地任务、notify 跨进程路径未定义（H3）。另需在修改稿中补齐中严重度清单：体积验收口径（M1）、壳自崩溃守护（M2）、回退线退役条件（M3）、多实例 TCP 探活任务与 dialog 依赖（M4）、splash/transparent/版本策略/装配归属/决策点清单等收敛项（M5–M9），以及文件计数、能力项口径、证据基线的统一（M11–M14）。以上修改集中在"选型冻结 + 配置补全 + 任务补缺 + 口径统一"四类，不涉及架构推倒重来；修改后可进入审查轮 2。

---

## 附：审查对照速查

| 审查角度 | 结论 |
|---|---|
| 三报告一致性 | 中——桥选型、体积验收、splash、版本策略、装配归属、Cargo version 六处矛盾（H1/M1/M5/M7/M8/M14） |
| 进程模型 | 中——三层边界清晰，但命令通道（H3）、壳自崩溃（M2）、多实例改造（M4）有缺口 |
| 模块划分 | 低中——26 文件去向覆盖完整，缺计数统一（M13）与少量行为任务落点（M10/L1/L2） |
| 接口完整性 | 中——5 路由/mg:* 4+1/3 页面全局/DesktopShellHandle 保留完整；25 API 缺逐项对账（L3）、6 ctx 未显式枚举、远程域 IPC 配置缺失（H2） |
| 架构技术债 | 中——双轨桥未收敛（H1）、回退线无退役条件（M3）、transparent 默认开启未评估（M6） |
