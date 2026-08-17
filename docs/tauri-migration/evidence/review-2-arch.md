# review-2-arch — 架构完整性审查意见（审查轮 2 / 3）

> 审查对象：《可行性分析报告》《代码迁移方案报告》《代码落地方案报告》（均 2026-08-17，docs/tauri-migration/，含「审查轮 1 修订记录」附录）
> 审查基线：`.planning/review-1-arch.md`（第一轮意见）、`.planning/research-A.md`、`REFERENCE.md`
> 审查角度：修订闭环验证（H1–H3）/ 新引入问题 / 架构完整性 / 遗留问题处理合理性
> 结论：**需修改后验收**（1 项高 + 4 项中 + 若干低，均为「补任务落点 / 对齐方向标签 / 消歧义」类，骨架不推倒）

---

## 一、修订验证结论（H1–H3）

### H1 桥选型收敛 —— 🔴 概念已收敛，未完全闭环（主桥服务端无任务）

**已闭环部分**：三报告已统一「主桥 = HTTP/SSE/WS（页面↔sidecar）+ Tauri IPC 仅壳级本地命令（本地窗口内）+ sidecar↔壳 stdio JSON-RPC」——可行性 §3.4、迁移 §2.1（含选型 blockquote）、落地 §5.1/T4.5–T4.8 已同步改写；可行性 P1 已改为「桥协议选型冻结」任务（盘点 mg:* 消息 + 安全分析 + 向后兼容声明）。轮 1 的三报告各执一词问题已消除。

**未闭环部分**：
- 收敛方向与轮 1 建议相反（轮 1 推荐「方案 A 主 + dangerousRemoteDomainIpcAccess」，修订选了「方案 B 主」）。方向本身可接受（B 主使远程页天然可用、无需 IPC 注入，H2 相应变为「默认不启用」，逻辑自洽），但 P1 只写了收敛结论，**未记录「否决方案 A」的理由**，选型决策记录不完整。
- 主桥**服务端**（`/api/dsh-hub/bridge` 的注册、SSE/WS 升级、mg:* 消息路由、token 校验/分发）在落地任务中**无任何落点**：T4.5 只是页面侧客户端（EventSource/fetch），X4-④ 只做鉴权，T4.1/T4.2/T4.3 均不涉及桥端点。且与「迁移 §3.1 index.ts 全原样保留」、可行性 §3.4「host 在 dsh webserver 上注册」、X4-④「Rust 侧校验」三方归属矛盾（详见新问题 N1）。

### H2 dangerousRemoteDomainIpcAccess / __TAURI_INTERNALS__ 死结 —— 🟠 概念已解，两个具体 IPC 依赖点残留

**已闭环部分**：可行性 §3.4/§5.6、迁移 §2.1/§5.2、落地 T1.3 已统一为「`dangerousRemoteDomainIpcAccess` 默认不配置、仅方案 A 需要；远程 dsh 页不依赖 Tauri IPC；`__TAURI_INTERNALS__` 探测仅用于本地窗口内壳命令可用性判断；壳侧注入自有探针 `window.__DSH_SHELL__`」；M1 验收新增「本地窗口内 IPC 冒烟」（T1.4 capabilities + __TAURI_INTERNALS__），远程页桥能力 M4 用 HTTP/SSE/WS 冒烟——「探测与注入开关同源」死结在概念层已消除。

**残留部分**：
- 落地 T4.1 的 stderr 回灌**仍是 `app.emit("dsh:output", line)`**——这是 Tauri IPC emit，远程 dsh 页在默认关闭注入下**收不到**（轮 1 H2 原文点名过该行，修订未动它）。X1 的 `tauri-plugin-log`「Webview（前端可看）」目标同理依赖页面 IPC。两条具体 IPC 依赖未随新架构迁移（详见 N3）。
- 探测判据存在二义：`__DSH_SHELL__` 经 initialization_script 注入**所有**页面（含远程 dsh 页），「adapter 只认该探针」与「`__TAURI_INTERNALS__` 判本地窗口」的角色关系、sidecar 的 index.ts 如何获知页面探针结果（握手）均未定义（详见 N5）。

### H3 sidecar↔壳命令通道 —— 🟠 路径已闭环，方向标签与进程拓扑存矛盾

**已闭环部分**：迁移 §4-9 定义了完整 stdio JSON-RPC 协议（notify/applyTheme/applySize/quit + READY{port}/output/exit）；落地 T4.1 增列 stdin 命令协议，T3.5 明确 `notifyTaskComplete`（sidecar session/event）→ stdio 下行 → notify.rs 弹 toast，T4.6 明确 applyTheme/applySize/notifyTaskComplete 统一走 sidecar↔壳通道（本地窗口内也可 invoke）——轮 1 的「notify 跨进程路径未定义」「窗口命令方向两报告未对齐」两个缺口已补。

**残留部分**：
- 协议**方向标签自相矛盾**：`notify`/`applyTheme`/`applySize` 起源在 sidecar（页面经桥上送或 session 事件触发），应按「sidecar → 壳」上行，但三报告一致把它们列在「**stdin 侧 JSON 行命令**」（Rust 父进程写给子进程 stdin 的方向）；可行性 §3.4 又把 notify 归入「窗口级命令下行（壳→sidecar）」。真正的 Rust→sidecar 命令只有 quit。方向语义在「stdin 命令」命名与「供 sidecar 调用」用法之间打架（详见 N2）。
- T4.1 与 T4.3 的进程拓扑重复：T4.1 让 Rust 直接 `Command::new(node).args([entry,"web","--port","0"])`，T4.3 又定义 sidecar 包装脚本自己做装配/探测/解析/spawn/退出码——两条启动链并存，stdio 通道属主、node 探测、装配职责未唯一化（详见 N4）。

---

## 二、新发现问题清单（修订引入 / 修订后暴露）

### 🔴 高

**N1. 主桥服务端无落地任务，且宿主/鉴权归属三方矛盾**
- 描述：主桥收敛为「页面↔sidecar HTTP/SSE/WS」后，唯一被任务化的只有页面侧客户端（落地 T4.5）与鉴权（X4-④）。**没有任何任务实现 `sidecar 侧注册 /api/dsh-hub/bridge` + SSE/WS 升级 + mg:* 消息路由 + 转发 stdio 窗口命令**。同时存在三处归属矛盾：① 可行性 §3.4「host 在 dsh webserver 上注册 /api/dsh-hub/bridge」要求改插件 Controller（index.ts），但迁移 §3.1 index.ts 行写「**全原样**保留」；② X4-④ 写 token「**Rust 侧校验**」，而端点在 sidecar（dsh webserver）进程内，校验方应为端点宿主；③ 一次性 token 如何**分发到远程页面**（页面怎么拿到 token 订阅/调用）未定义。
- 涉及：可行性 §3.4/§5.6；迁移 §2.1、§3.1（index.ts 行）、§4-9；落地 T4.1/T4.2/T4.3/T4.5、X4-④
- 修改建议：新增任务「主桥服务端（sidecar 侧）」，明确：注册路由与 SSE/WS 升级的文件级落点（允许改 index.ts 或新增 host 模块并同步改迁移 §3.1 的「全原样」表述）；token 由 Rust 壳 spawn 时生成 → 经 env/stdio 传给 sidecar → 端点侧校验（改掉「Rust 侧校验」表述）；token 分发通道（页面经桥端点注册时如何获取 token，或注入页面 HTML/初始化脚本）；mg:* 路由表（4+1 消息 → 上行 fetch / 下行 SSE/WS → 窗口命令转 stdio）。

### 🟠 中

**N2. stdio JSON-RPC 方向标签与语义矛盾（H3 收尾）**
- 描述：`notify`/`applyTheme`/`applySize` 的请求源在 sidecar（页面经桥上送 / session 事件），必须**上行**到壳（sidecar stdout 侧）才能让 Rust 改窗口/弹 toast；但迁移 §4-9 与落地 T4.1 把它们列在「**stdin 侧 JSON 行命令**」（Rust→sidecar 方向），可行性 §3.4 又写「窗口级命令**下行**（applyTheme/applySize/notify/quit）」且 T3.5 写「经该通道**下行**」——三处方向措辞互相矛盾，且与「stdout 侧事件（READY/output/exit）」分类冲突；quit 反而是真正的 Rust→sidecar stdin 命令。
- 涉及：可行性 §3.4；迁移 §4-9；落地 T4.1、T3.5、T4.6
- 修改建议：协议表改为「stdout 侧（sidecar→壳）请求行：notify/applyTheme/applySize + 事件行 READY/output/exit；stdin 侧（壳→sidecar）命令：quit（及未来壳驱动动作）」；或统一以「父进程（壳）视角」命名并全报告一致；T3.5/T4.6 的「下行」措辞同步改「上行」。

**N3. H2 具体残留：dsh:output 与日志 Webview 目标仍走 Tauri IPC emit**
- 描述：落地 T4.1 stderr 逐行 `app.emit("dsh:output", line)` 回灌前端、X1 日志三目标中的「Webview（前端可看）」——两者都是页面侧 IPC 依赖。主窗口加载的是远程 `http://127.0.0.1:<port>` 页，在 `dangerousRemoteDomainIpcAccess` 默认关闭下 `__TAURI_INTERNALS__` 不注入，**该回灌/日志在 M4 真实页面上静默失效**。轮 1 H2 原文点名过 T4.1 的 dsh:output，修订未改这一行。
- 涉及：落地 T4.1、X1、§9 行 22；迁移 §4-9
- 修改建议：dsh:output 改为主桥 SSE/WS 下行（页面订阅）或本地窗口 emit（仅壳内页可见，需写明）；X1 的 Webview 目标标注「仅本地窗口/壳内页生效，远程页日志走桥下行」；M4 验收加一条「kill sidecar → 远程页看到 dsh:output 流」。

**N4. T4.1 与 T4.3 进程拓扑重复/冲突**
- 描述：落地 T4.1 定义 Rust 直接 `spawn node <dsh entry> web --port 0` 并持有其 stdin/stdout（stdio JSON-RPC 通道属主）；T4.3 又定义 `dsh-web-sidecar.mjs` 作为「sidecar 主入口」自己做装配（调 T4.2）/node 探测与下载/解析 dsh 入口/spawn dsh/退出码原样返回。两条启动链在同一 M4 并存且职责重叠（node 探测在 T4.1 与 T4.3 各写一遍；stdio 通道到底终结于哪个进程未唯一化；T4.3 若被 spawn，dsh 的 stdout 需经它转发才能被壳读到，但其职责清单未含转发/协议）。
- 涉及：落地 T4.1、T4.3、§8 依赖图；迁移 §4-9、§3.2（launcher 行）
- 修改建议：二选一收敛——(a) Rust 直接 spawn dsh（T4.1 路径），T4.3 降级为「仅 M5 externalBin/离线场景的 node 解析+装配辅助脚本，不承担进程宿主」；(b) Rust spawn sidecar 包装（T4.3），则 stdio 协议、READY/output 转发、重启计数全部挂 T4.3，T4.1 只做壳侧收发。依赖图同步。

**N5. 探测判据与「探针读取方」二义（H2 收尾）**
- 描述：① `__DSH_SHELL__` 由 initialization_script 注入，会同时出现在远程 dsh 页与本地页——它只能证明「Tauri 壳环境」，**不能单独充当「本地窗口」判据**；② 迁移 §5.2 同时写「adapter 只认该探针（不依赖 Tauri 注入实现漂移）」与「`__TAURI_INTERNALS__` 探测仅用于判断本地窗口」，两者角色关系未说明（若通道选择靠 __TAURI_INTERNALS__，则 adapter 并非「只认该探针」）；③ index.ts（sidecar）按「本地窗口探针命中」决定 tauri-shell vs desktop.ts，但 sidecar 无法直接读页面 window（evaluateScript 是 Rust 侧能力），**探针结果的传递/握手路径未定义**。
- 涉及：迁移 §5.2；落地 T4.5、T4.6、T4.7；可行性 §3.4
- 修改建议：明确两级判据——`__DSH_SHELL__` 判「Tauri 壳环境」（index.ts 接线），`__TAURI_INTERNALS__` 判「本地窗口 vs 远程页」（通道选择 IPC vs 桥），并删/改「只认该探针」表述；新增「页面就绪握手」（页面上报 adapter 类型/通道 → sidecar 决定 tauri-shell 分支）任务，挂 M4。

### 🟡 低

**N6. L2 假闭环：迁移指向不存在的落地任务**
- 描述：迁移 §3.1 png-decode 行写「决策任务见落地 M3『资产/解码器去留』」，但落地 M3 任务清单（T3.1–T3.7）**无此任务**；落地附录 B 也自称「本报告 M3 资产/解码器去留」——声称已处理，实际无任务落点。
- 涉及：迁移 §3.1（icons/png-decode 行）；落地 T3.1–T3.7、附录 B
- 修改建议：在落地 M2 或 M3 补一项「icons.ts/png-decode.ts 去留决策」（并入 Rust icons/ 或保留 Node 侧），或删除迁移侧的「见落地 M3」指认。

**N7. T3.2（M3）依赖 T4.5（M4）读 closeToTray 配置**
- 描述：M3 验收 2 要求 closeToTray=true/false 均生效，但 T3.2 写「读配置 closeToTray（配置读取走 X3/桥，见 T4.5）」——T4.5 是 M4 的桥，M3 阶段无桥可用，配置读取路径悬空。
- 涉及：落地 T3.2、M3 验收 2、T4.5
- 修改建议：M3 明确 Rust 直读 `$DSH_HOME/dsh-hub/config.json`（serde，路径见 X3/OPS-L2），或把「closeToTray 生效」验收顺延 M4 并写入验收差异。

**N8. M16 部分闭环：深链「启用路径」无实现任务**
- 描述：embedBootstrapper 已入 T1.3 ✓、deep-link 依赖已入 T1.1 ✓、安全前置 X4-⑥ 与 v1 范围外标注（§9 行 25）✓；但「M5 决策启用时：注册 scheme（plugins.deep-link.desktop.schemes）+ 意图分发（args→URL→host）」仍只有验收行，无实现任务；T5.1（tauri.conf 改写）未含深链配置位。
- 涉及：落地 T1.1、T5.1、X4-⑥、§9 行 25
- 修改建议：M5 加一行「深链：若决策启用 → T5.1 补 schemes 配置 + 注册插件 + 意图分发实现；若延后 → 显式写『v1 不做』」，二选一落纸。

**N9. 可行性 §2 #18 未随 M5 splash 收敛更新（附录与正文不一致）**
- 描述：splash 已收敛为官方双窗（迁移 §4-1、落地 T4.4/§9 行 23），但可行性 §2 #18 仍是旧「本地 splash 页 → 导航 WebviewUrl::External / on_page_load 驱动」单窗方案；且可行性修订记录表**缺 M5 行**（M6/M7/M13 等也缺行，但正文已更新；#18 是正文未更新的实际遗漏）。
- 涉及：可行性 §2 #18、附录修订记录
- 修改建议：#18 改「官方双窗（visible:false 主窗 + splash 窗 + close_splashscreen）」，修订记录补 M5 行。

**N10. 「透明窗口」措辞残留**
- 描述：M6 已收敛 transparent:false（T1.3/T1.6/验收一致），但落地 M1 目标（§2.1）「最小无边框透明窗口」与 M4 验收 1「无边框透明窗口 → 完整 dsh web UI」仍带「透明」字样，与正文决策冲突。
- 涉及：落地 §2.1 目标、§5.4-1
- 修改建议：删「透明」或改「无边框窗口（transparent:false）」。

**N11. 迁移 §5.1 的 invoke("bridge_message") 未入落地命令集**
- 描述：迁移 §5.1 wv.onIpcMessage 行写「本地窗口内才用 IPC（invoke("bridge_message") 变体）」，但落地 T4.8 命令集只有 set_window_theme/set_window_size/get_workspace_path/shell_command，无 bridge_message。
- 涉及：迁移 §5.1；落地 T4.8
- 修改建议：统一命令名（删 bridge_message 或加入 T4.8）。

**N12. M12 口径说明的算术与事实小误**
- 描述：可行性 §2 表尾说 21 与 16 的差异 =「新增 2 + 拆分（本地服务/外部子进程/通知）」，但 research-A §4 的 16 项中「任务通知」本就是独立项，并非合并项拆分；且按所述增量无法从 16 复算到 21。
- 涉及：可行性 §2 表尾口径说明；research-A §4
- 修改建议：给出可复核的拆分推导（如：16 中「launcher 生命周期」拆出崩溃重启/装配/子进程、「窗口管理」拆出创建/透明/启动画面、「screen/explorer」拆二 + 新增深链/自动更新），或直接写「21 = 16 + 2 新增 + 3 拆分净增」并列出净增来源。

**N13. dev/prod IPC 注入行为分叉**
- 描述：T1.7 说 M4 起 devUrl 改指 dsh web 端口——dev 模式下 dsh 页是「配置的应用 origin」，Tauri 会注入 `__TAURI_INTERNALS__`；生产 `WebviewUrl::External` 则不注入。探测/通道选择逻辑在 dev 与 prod 判定可能分叉（dev 下远程页被误判为本地窗口走 invoke）。
- 涉及：落地 T1.7、T4.4、T4.5
- 修改建议：明确 dev/prod 探测一致性（如 dev 也坚持 External + 主桥、或用显式 env 标识 dev），M4 验收加「dev 与打包产物各跑一次桥冒烟」。

**N14. T4.5 适配器如何进入远程页面未定义**
- 描述：主桥客户端（src/bridge/tauri.ts）要在远程 dsh 页运行，注入/打包路径未说明（initialization_script 注入编译产物？加入 client bundle？与「client half 零改动」「tsdown externals 不动」（T4.7）的关系未交代）。
- 涉及：落地 T4.5、T4.7；迁移 §2.2、§5.2
- 修改建议：一句话定义适配器交付方式（推荐 Rust initialization_script 注入编译后的适配器 + 探针，client bundle 不动），并验证与回退线（webviewjs 注入另一套）共存。

**N15. T4.8 shell_command 形态含糊**
- 描述：`shell_command(cmd)` 是 `#[tauri::command]`（invoke 上行语义），描述却写「托盘命令进页面的统一入口：经主桥 SSE/WS 下行」——下行是 Rust→页面方向，与 command 的 invoke 方向相反；到底是 Rust 侧内部函数 + 桥下行，还是页面 invoke 入口，未说清。
- 涉及：落地 T4.8；迁移 §2.1 通道 3
- 修改建议：明确「托盘事件在 Rust 侧触发 → 主桥 SSE/WS 下行（远程页）/ emit（本地窗口）」，`shell_command` 不作为 invoke 命令暴露（或改名并说明其上行用途）。

**N16. 通道 1 上下行清单自相矛盾**
- 描述：迁移 §2.1 通道 1 写「下行：shell-command/**主题请求/工作区路径回执**；上行：**workspace-path**/session-focus/theme」——workspace-path 回执同时出现在下行与上行；rc.14 语义（research-A §3.3）是页面→壳上行回执。
- 涉及：迁移 §2.1；可行性 §3.4（方向正确）
- 修改建议：下行只保留 shell-command（+壳→页主题请求若有），上行 = workspace-path/session-focus/theme。

---

## 三、残留问题清单（第一轮中/低严重度处理合理性评估）

**处理合理（已闭环）**：
- M1 体积口径（可行性 §5.1/§7.1/P2、迁移 §7.1、落地 §6.3-4 双口径，删「安装包 ~10MB」硬验收）✓
- M2 壳自崩溃守护（T4.1/X2/§9 行 27 决策任务 + 验收差异写入）✓
- M3 回退线退役条件（可行性 §5.5 + 迁移 §7.3 门禁 + 落地 T5.5-⑨）✓
- M4 多实例双通道 + dialog 依赖 + legacy 承担（T4.2/T1.1/T3.7）✓
- M5 splash（迁移/落地侧收敛官方双窗 + M4 后资源来源）✓（可行性侧漏同步 → N9）
- M6 transparent:false + M1 像素验证 ✓（措辞残留 → N10）
- M7 装配归属收敛 sidecar ✓；M8 Cargo 恒 0.0.0 ✓；M9 决策点 ③④ 补齐 + T4.8 截止 ✓；M10 T3.2 拆两项 + §9 行 14 ✓
- M11/M12/M13/M14 计数、口径、证据基线统一 ✓（M12 说明算术小误 → N12）
- M15 证据状态同步 ✓；M17 T5.7 CI workflow ✓
- L1 目录结构 ✓；L3 25 API 补三行 ✓；L4 sound 归属统一 + 决策截止 ✓；L5 随包发布注明 ✓

**假闭环 / 部分闭环（需修）**：
- L2：**假闭环**——迁移声称「决策任务见落地 M3」，落地 M3 无此任务（N6）。
- M16：部分闭环——安全前置与范围标注到位，启用路径实现任务缺失（N8）。
- M5：迁移/落地已收敛，可行性 §2 #18 与修订表未同步（N9）。

**合并/忽略理由是否站得住**：站得住。C1/E3/OPS 系跨报告合并到落地任务（T5.3/T5.6/X1 等）均有指向；M6/M7/M13 等在可行性正文已就地更新（修订表缺行属记录不完整而非内容缺失，仅 #18 是真实遗漏）。唯一「声称处理但未处理」是 L2。

---

## 四、架构完整性总评（修订后）

- **三层进程模型**：Tauri 壳 / Node sidecar / webview 职责边界在修订后更清晰（壳=窗口/托盘/主题/单实例/sidecar 托管；sidecar=dsh host+插件层+主桥服务端（待补任务）；webview=零改动）。主要残点是 T4.1/T4.3 进程拓扑（N4）与主桥服务端归属（N1）。
- **模块划分**：26 文件权威清单与 4 工具链脚本归类已统一；新增 src/bridge/tauri.ts、src/tauri-shell.ts 已入目录蓝图；icons/png-decode 去留仍假闭环（N6）。
- **接口完整性**：mg:* 4+1 前缀、3 页面全局、DesktopShellHandle 保留、25 API 逐项对账均到位；缺口集中在**主桥服务端接口**（端点注册/消息路由/token 分发，N1）、**stdio 协议方向**（N2）、**探测握手**（N5）、**dsh:output/日志 IPC 依赖**（N3）。
- **未发现方向性错误**：B 主桥方案与 H2 默认关闭 IPC 的组合自洽；行为决策点（单实例聚焦、端口保留 --port 0、get_workspace_path 方向）均已显式化。

---

## 五、结论

**本角度：需修改后验收（进入审查轮 3）。**

修订质量较轮 1 显著提升：H1–H3 的核心死结（选型不一致、IPC 注入死结、notify 跨进程路径缺失）在概念层全部消除，M1–M17 中绝大多数已真闭环且证据状态纪律保持。但仍有 1 项高严重度（N1 主桥服务端无任务且归属矛盾）、4 项中严重度（N2 stdio 方向、N3 dsh:output 残留、N4 进程拓扑、N5 探测握手）需再修一轮——均为「补任务落点、对齐方向标签、消除二义」类收尾，不涉及推倒重来；N6–N16 为低严重度措辞/记录同步。建议第三轮重点：①新增主桥服务端任务并统一「Rust 生成 token / 端点校验 / 页面分发」链条；②stdio 协议按「sidecar→壳 上行请求 / 壳→sidecar 下行命令」重写方向标签；③dsh:output 与日志 Webview 目标改走主桥或标注壳内页可见；④收敛 T4.1/T4.3 启动拓扑；⑤修复 L2 假闭环与可行性 #18 遗漏。

---

## 附：审查对照速查（轮 2）

| 审查角度 | 结论 |
|---|---|
| 修订闭环（H1） | 概念收敛 ✓；主桥服务端无任务 + 归属矛盾（N1）→ 未完全闭环 |
| 修订闭环（H2） | 死结已解；dsh:output/日志 IPC 残留（N3）+ 探测握手二义（N5） |
| 修订闭环（H3） | notify 路径已闭环；方向标签矛盾（N2）+ 进程拓扑（N4） |
| 新引入问题 | 16 项（1 高 4 中 11 低），集中在任务落点缺失与方向/判据二义 |
| 遗留问题处理 | 中/低绝大多数合理闭环；L2 假闭环、M16 部分闭环、M5 可行性侧遗漏 |
| 三层进程模型 | 边界清晰，主桥服务端归属与 sidecar 拓扑待唯一化 |
