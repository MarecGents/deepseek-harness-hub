# 审查意见 3/3 — 兼容性与运维最终验收（dsh-hub Tauri 迁移三报告）

> 审查轮：3 / 3（兼容性与运维 · 最终）
> 审查员：兼容性与运维总收敛审查员（第三轮/最终）
> 日期：2026-08-17
> 审查对象（修订后版本）：
> - `docs/tauri-migration/可行性分析报告-2026-08-17.md`（「可行性」）
> - `docs/tauri-migration/代码迁移方案报告-2026-08-17.md`（「迁移」）
> - `docs/tauri-migration/代码落地方案报告-2026-08-17.md`（「落地」）
> 前两轮意见：`.planning/review-1-ops.md`（OPS-H1~H5 / M1~M9 / L1~L6）、`.planning/review-2-ops.md`（G1~G6 / R1~R7）
> 参照基线：`.planning/research-D.md`、`REFERENCE.md`（本轮全部实读）
> 核验纪律：只基于实际读到的报告正文、修订附录与基线文本；凡引用均给出任务号/行号/表行号。

**结论速览：可验收（approve），附 2 项非阻塞必补项。** 轮 1 全部 15 项（H1–H5/M1–M9/L1–L6）与轮 2 全部 6 项 G 已闭环，且轮 2 时「声明闭环、任务层未收口」的两处（OPS-H2 过渡演练、OPS-M7 诊断参数）已在当前版本补入任务层（落地 §6.3-5 / T4.4）；§9 验收表 28 行覆盖可行性 21 项能力无遗漏、平台列/状态列齐备、每行有验收方法；发布/运维闭环（CI 矩阵、安装器、签名/notarization、updater、过渡演练、卸载冒烟）任务落点齐备可执行。残留仅表述级低危（R1 基线未同步、R2/R3 可接受）与本轮新发现的 2 项「补条目即闭环」任务层小缺口（T5.5 缺 P5 验签显式条目；T5.5-⑥ 卸载冒烟无逐端命令），不构成阻塞，达到「可无缝迁移落地」标准。

---

## 1. 三轮闭环总验

### 1.1 轮 1（OPS-H1~H5 / M1~M9 / L1~L6）— 全部闭环

| 意见 | 结论 | 本轮核验依据（实读位置） |
|---|---|---|
| OPS-H1 $DSH_HOME 解析 | ✅ 闭环 | 可行性 §5.4 路径/权限行 + P7「`DSH_HOME env \|\| ~/.dsh`（homedir），不用 `dirs::data_dir()`」；迁移 §4-10「与 `state-store.ts dshHome()` 逐字一致（trim 后非空）+ spawn 前显式 `env("DSH_HOME", 解析值)` + 单测覆盖 `' '`」；落地 T2.2/T4.1/T4.3 任务化 |
| OPS-H2 存量 npm→安装器过渡 | ✅ 闭环（任务层收口） | 迁移 §7.5 四步（① junction relink + 当前包根重定义 ② 快捷方式误删防护 ③ PATH 并存 ④ 数据与升级演练）；落地 §6.3-5 补过渡演练验收（数据保留 + 旧命令行为 + relink + 快捷方式无误删）；迁移 §8 M5 验证列同步；可行性 §5.2/P7 同步 |
| OPS-H3 卸载清理语义 | ✅ 闭环 | 落地 T5.1 三段清理（必删 / 可选勾选 `$DSH_HOME/dsh-hub/` 自有文件 + window-state / 默认保留 profiles+sessions）+ 杀主进程/sidecar（G6）+ 装配痕迹清理（R7）+ 升级检测（R13）；T5.5-⑥ 卸载冒烟（装→卸→断言三段边界 + 运行中卸载） |
| OPS-H4 声音跨平台 | ✅ 闭环 | 三报告统一三选一（HTMLAudio / Rust / afplay·paplay·aplay，落地 T4.6 已补 aplay），决策截止 M3/M4；§9 行 15 验收含逐端列 |
| OPS-H5 三端逐端验收 | ✅ 闭环 | §9 表 28 行全部带平台列；M5 §6.3-1 逐端清单（托盘 appindicator/通知授权/标题栏 traffic lights + `--titlebar-offset`/声音/深链/无边框 WM/#32 像素验证） |
| OPS-M1 桥接选型 | ✅ 闭环 | 可行性 §3.4/P1、迁移 §2.1、落地 T4.5–T4.9 统一主桥 HTTP/SSE/WS + stdio JSON-RPC + 壳级本地 IPC；主桥服务端归属 sidecar（T4.9） |
| OPS-M2 AppUserModelID | ✅ 闭环 | §9 行 24（任务栏名称/图标/同组/快捷方式 AUMID == 应用 AUMID/toast 回窗）+ 迁移 §3.1 app-id 行 + §9.2-9（identifier→AUMID 形态入 P5）+ 落地 T5.1 快捷方式 AUMID 一致 |
| OPS-M3 启动屏 | ✅ 闭环 | §9 行 23（冷启动无白/黑屏帧、splash 主题与 SPA 一致深/浅各一次、切换无闪烁）+ 落地 T4.4 官方双窗（visible:false 主窗 + splash 窗 + close_splashscreen）+ 迁移 §4-1 资源来源 |
| OPS-M4 dsh.log 位置 | ✅ 闭环 | 落地 X1「sidecar node 侧日志改写至 `$DSH_HOME/dsh-hub/logs/dsh.log` + 与 tauri-plugin-log Folder target 并列」+ §9 行 22 排障验收（模拟 node 缺失 → 两日志目标都有内容）+ resetLog 保留或轮转 |
| OPS-M5 PATH 命令决策 | ✅ 闭环（决策点） | 迁移 §3.2/§7.5-③、落地 T3.7/T5.1 三处口径统一：M5 显式决策「保留（安装器注册 PATH→`dsh-hub.exe` 开壳语义）或放弃（文档化替代）」；§6.3-5 升级演练断言旧命令行为一致 |
| OPS-M6 体积口径 | ✅ 闭环 | 可行性 §5.1/§7.1/P2、迁移 §7.1、落地 §6.3-4 统一「壳 ~10MB 级 + 安装包 40-80MB 级」双口径，删除「安装包 ~10MB」硬验收；A/B/C 决策前置 M5 |
| OPS-M7 CI 冒烟可执行性 | ✅ 闭环（实现任务已补） | 需求与逐端命令齐（迁移 §7.3 P4 == 落地 T5.5-②/③）；**实现落点 = 落地 T4.4**（解析 `--assemble-only`/`--smoke` → 调 T4.2 装配 → 验证窗口可创建 → exit 0，等价 `DSH_HUB_ASSEMBLE_ONLY=1`）；可行性 P2 注明等价关系 |
| OPS-M8 WebView2 installMode | ✅ 闭环 | 落地 T1.3 `webviewInstallMode: embedBootstrapper` + T5.5-③「Win10 无 WebView2 Runtime 隔离机自动装 Runtime 并成功启动」用例；迁移 §7.1 同步 |
| OPS-M9 AGENTS.md 改写 | ✅ 闭环 | 落地 T5.6 拆「改写稿（diff 草案）→ 评审 → 合入」三步，覆盖双门禁职责、铁律 8 改写（测试机装安装器首启冒烟）、`install:local` → `cargo tauri build --bundles nsis`、版本单一来源、postuninstall 不误删 |
| OPS-L1~L6 | ✅ 全部闭环 | L1（T1.1 Cargo 恒 0.0.0 + T1.3 version: ../package.json）；L2（X3/T5.3 精确路径：window-state 在 `$DSH_HOME` 根、config/pins 在 `$DSH_HOME/dsh-hub/` 下）；L3（§9 行 25 显式「v1 范围外」）；L4（X2 crash.log 头：版本+commit+OS+tauri/cargo 版本）；L5（§9 表末列「状态」）；L6（X4-⑦ 显式 `$DSH_HOME/dsh-hub/webview-data`） |

### 1.2 轮 2（G1~G6 / R1~R7）— G 全部闭环

| 意见 | 结论 | 本轮核验依据（实读位置） |
|---|---|---|
| G1 内置 dsh-hub 插件包无资源打包任务 | ✅ 闭环 | 落地 T5.1 `bundle.resources` 声明打包（lib/ + assets/ + client bundle）；T4.2/T4.3 装配源注入（`DSH_HUB_PACKAGE_ROOT` env 或相对 sidecar 脚本解析）；T5.5-② 断言装配源指向安装目录内嵌资产 |
| G2 junction 当前包根判定未定义 | ✅ 闭环 | 落地 T4.2「当前包根 = 安装器内嵌 dsh-hub 资产路径；junction 目标非该内嵌资产路径即 relink + 保留 bare 遗留清理」；迁移 §7.5-① 同步 |
| G3 rc.14→安装器过渡演练未入 M5 验收 | ✅ 闭环（任务层收口） | 落地 §6.3-5 新增第 5 条验收（$DSH_HOME 数据保留断言 + 旧 `dsh-hub` 命令行为断言 + junction relink + 快捷方式无误删）；迁移 §8 M5 验证列同步 |
| G4 `--assemble-only`/`--smoke` 无实现任务 | ✅ 闭环（实现任务已补） | 落地 T4.4 新增实现（解析参数 → T4.2 装配 → 验证窗口可创建 → exit 0）；T5.5-② 注明为消费方；可行性 P2 注明等价 `DSH_HUB_ASSEMBLE_ONLY=1` |
| G5 会话只读快照位置/触发未定义 | ✅ 闭环 | 落地 T5.3/X3/§9 行 26/§10-7：快照至 `$DSH_HOME/dsh-hub/backup/v<from>/sessions-snapshot/`（只读复制或硬链）+ 保留策略 + 与 config 备份同挂所有升级入口 |
| G6 卸载 dsh-hub.exe 占用未处理 | ✅ 闭环 | 落地 T5.1：卸载模板先结束 dsh-hub.exe 主进程 + sidecar（或弹「请先退出应用」）+ 超时强杀；T5.5-⑥ 加「运行中卸载」用例 |
| R4~R7（轮 2 低危） | ✅ 已处理确认 | R4（落地 T4.6 补 aplay）；R5（落地 T2.2 trim 后非空 + 单测覆盖 `DSH_HOME=' '`）；R6（可行性 P2 注明等价 `--assemble-only`/`--smoke`）；R7（落地 T5.1 ② 补 webview-data） |
| R1（research-D 基线未同步） | 🔶 仍残留（低危，见 §5） | 本轮实读 research-D 确认：§4 表「$DSH_HOME 语义」行（L155）仍写「默认 `dirs::data_dir()`（可保持 ~/.dsh 兼容）」自相矛盾原文、「卸载」行（L154）仍写 `$APPDATA` 应用数据、「PATH」行（L152）仍断言「安装器默认不建」。三报告已正确偏离并显式注明（迁移 §4-10 解释为何不用 data_dir），报告自身处理正确；残留仅影响基线文档检索 |
| R2/R3 | ✅ 可接受 | R2（无边框+透明无独立 §9 行 → M1 §2.3 透明像素验证 + 行 1 隐含覆盖，可接受）；R3（平台列偶混验证状态字样，与状态列信息重叠，表述级，不阻塞） |

**三轮闭环判定：轮 1 的 15 项 + 轮 2 的 6 项 G 全部在报告正文/修订附录/任务清单层闭环；轮 2 指出的两处「任务层未收口」已收口。** 剩余未处理项仅 R1（基线文档，非三报告本身）。

---

## 2. §9 验收表完整性核验

- **行数**：28 行（L278-307，行号 1–28）✔（≥28 行要求）
- **列结构**：行为 / rc.14 现状（已核实依据）/ Tauri 目标 / 验收方法 / 里程碑 / 平台 / 状态 七列齐备 ✔
- **平台列**：每行均有（行 4「Win/macOS 已核实用法；Linux appindicator 待实测」、行 6「Windows 已核实；macOS/Linux 逐端验证」、行 7「Windows」、行 10「Windows 同引擎；macOS/Linux 逐端像素验证」、行 14「Windows 激活；macOS/Linux open 直开」、行 15「全平台（逐端列）」、行 24「Windows」、行 28「Windows 已核实；macOS/Linux 待验证」等）✔
- **状态列**：每行均有（已核实 / 待验证 / 需用户确认 / 决策点）✔
- **验收方法**：28 行全部有验收方法列（部分指向 M2 §3.4 对比表、M3 §4.4-x、M4 §5.4-x 等具体验收节，均为可执行断言）✔
- **21 项能力覆盖映射**（可行性 §2 21 项 → §9 行号，逐项可复核）：

| 能力（可行性 #） | §9 行 | 判定 |
|---|---|---|
| #1 窗口创建（尺寸/最小/居中/最大化） | 1、2、3 | ✅ |
| #2 无边框+透明+背景色 | 1（隐含）、10（背景图）、M1 §2.3（透明像素验证） | ✅（R2 可接受） |
| #3 托盘 | 4、5 | ✅ |
| #4 标题栏主题 | 6 | ✅ |
| #5 主题同步 | 6、7 | ✅ |
| #6 单实例 | 8 | ✅ |
| #7 多实例检测 | 9 | ✅ |
| #8 崩溃自动重启 | 17、27 | ✅ |
| #9 深链（新增） | 25 | ✅ |
| #10 自动更新（新增） | 19 | ✅ |
| #11 本地 HTTP 服务 | 13/16/20（隐含，M4 §5.4-1 覆盖） | ✅ |
| #12 外部子进程 | 14、17 | ✅ |
| #13 配置持久化 | 3、13 | ✅ |
| #14 通知 | 15 | ✅ |
| #15 事件声音 | 15（含逐端） | ✅ |
| #16 Explorer 打开+激活 | 14 | ✅ |
| #17 屏幕探测 | 28 | ✅ |
| #18 启动画面 | 23 | ✅ |
| #19 进程身份/图标 | 24 | ✅ |
| #20 启动门控 | 18 | ✅ |
| #21 启动器装配 | 16 | ✅ |

**结论：覆盖无遗漏，21 项能力全部可映射到 §9 行（与轮 2 核验一致，本轮逐项复核通过）。**

---

## 3. 发布/运维闭环核验（本轮重点）

| 闭环项 | 任务落点（实读） | 可执行性判定 |
|---|---|---|
| **CI 矩阵（三端构建 + Release + latest.json）** | 落地 T5.7 `.github/workflows/release.yml`：tauri-action 三端构建（Windows NSIS/MSI、macOS dmg/app + notarization、Linux deb/AppImage）→ 上传 GitHub Release + latest.json；与 T5.5/T5.6 串行依赖（门禁全 PASS 才发 Release）；迁移 §8 M5 行同步 | ✅ 可执行（依赖 T5.5 门禁脚本先行） |
| **安装器（NSIS/MSI/dmg/deb/AppImage）** | 落地 T5.1：targets 三端全列；NSIS 自定义三段卸载清理 + 升级检测旧版本号（R13）+ 杀进程防占用（G6）+ 快捷方式 AUMID 一致 + PATH 决策 + `webviewInstallMode: embedBootstrapper`（T1.3） | ✅ 可执行（逐字段给了参考实现 surrealist/spacedrive） |
| **签名 / notarization** | 落地 T5.4：Windows `certificateThumbprint` + `digestAlgorithm:"sha256"` + `timestampUrl`；macOS `signingIdentity`/`providerShortName` + entitlements + notarization（CI `APPLE_*` env，env 名待验证）；Linux 免签；密钥生命周期 SOP（生成→保管→轮换→泄露处置，双人审批+保管人）入 P3；AV 缓解（测试证书先行 + 白名单提交） | ✅ 可执行（组织决策项 P3 前置，已标注） |
| **updater** | 落地 T5.3：updater 插件 + pubkey/endpoints + GitHub Release `latest.json` + 多端点降级 + 升级前备份/会话快照同挂所有升级入口 + dsh 版本钉死策略（B/C 通道）；前端 check→downloadAndInstall→relaunch | ✅ 可执行（latest.json 生成见 T5.6；**验证侧缺口见 §4 发现 1**） |
| **存量 rc.14 → 安装器过渡演练** | 落地 §6.3-5：装有 rc.14 的隔离环境「装安装器 → 首启 → $DSH_HOME 数据保留断言（profiles/sessions/config/pins）+ 旧 `dsh-hub` 命令行为断言 + junction relink + 快捷方式无误删」；迁移 §7.5 四步为前置设计 | ✅ 可执行 |
| **卸载冒烟** | 落地 T5.5-⑥：装 → 卸 → 断言三段清理边界（安装目录删净 / profiles+sessions 保留）+ 卸载后裸 `dsh web` 可启动 + 运行中卸载用例 | ✅ 可执行（**逐端命令见 §4 发现 2**） |
| **发布门禁** | 落地 T5.5 ①-⑨（cargo build/clippy/test/audit、assemble-only 冒烟、安装产物逐端冒烟、更新闭环 mock、身份四重相等、卸载冒烟、回退全链路、多实例硬验收、回退线退役 + 哈希登记） | ✅ 可执行（**P5 验签条目缺口见 §4 发现 1**） |

---

## 4. 本轮新发现（非阻塞必补项）

1. **【中低】落地 T5.5 门禁清单缺「P5 直查/验签」显式条目（规范层已定义、任务层未收口）**。迁移 §7.3 P5 与 research-D §3 P5 均明确要求：「GitHub Release API：latest tag == 版本；`latest.json` 200 + schema 合法 + 各平台 `signature` 可被 pubkey 验证（`tauri signer verify`）；updater 端点预演」；落地 T5.6 有 `latest.json` **生成**侧（含 schema 待验证注记），但落地 T5.5 的 ①-⑨ 清单（发布门禁脚本的验证侧）**没有**对应条目——与轮 2 的 G3/G4 同类（规范层有、任务清单缺）。**建议**：T5.5 补第 ⑩ 条「Release 直查 + latest.json schema/验签（`gh api releases/latest` tag 比对 + `tauri signer verify`）」，M1 动工前补入即可闭环。
2. **【低】T5.5-⑥ 卸载冒烟无 macOS/Linux 逐端命令与断言**。T5.5-⑥ 的三段清理语义（安装目录删净 / `$DSH_HOME/profiles`+`sessions` 保留 / 运行中卸载）以 Windows NSIS 为对象；macOS/Linux 的卸载执行方式（dmg 拖删 / deb `dpkg -r` / AppImage 删除）与「卸载不删 `$DSH_HOME`」的逐端断言未写（M5 §6.3-1 逐端清单也未列卸载）。**建议**：T5.5-⑥ 补逐端卸载命令 + 断言（Linux 无 Uninstall 键、deb 卸载默认不删用户数据，属简化点，注明等价即可），M5 实现期顺手补。

两项均为「补条目即闭环」型，且需求在规范层（迁移 §7.3 / research-D §3）已定义，实现 verify-tauri-release 时不会漏；不构成迁移落地阻塞。

---

## 5. 残留问题确认（轮 2 遗留处置 + 本轮复核）

| # | 严重度 | 状态 | 说明 |
|---|---|---|---|
| R1 research-D 基线三行旧文 | 低 | 🔶 未改（建议项） | 本轮实读确认 research-D L152/L154/L155 仍为旧文（PATH「安装器默认不建」/ 卸载 `$APPDATA` / `$DSH_HOME` 默认 `data_dir()`）。三报告处理正确（已偏离并注明）；建议开发期在 research-D 文件头加「§4 三行已被三报告修订取代」注记或直接更新三行，不阻塞验收 |
| R2 无边框+透明无独立 §9 行 | 低 | ✅ 可接受 | M1 §2.3-5 透明像素验证 + 行 1/10 覆盖 |
| R3 平台列偶混验证状态 | 低 | ✅ 可接受 | 与状态列信息重叠，表述级；建议平台列只写平台范围（不阻塞） |
| R4–R7 | 低 | ✅ 已处理 | aplay / trim+单测 / P2 等价参数 / webview-data 均已落任务（§1.2 表） |

---

## 6. 最终结论

1. **三轮闭环全部达成**：轮 1（H1–H5 高、M1–M9 中、L1–L6 低）15 项 + 轮 2（G1–G6）6 项全部闭环，且轮 2 判定的两处「声明闭环、任务层未收口」（OPS-H2 过渡演练、OPS-M7 诊断参数）已在本版补入任务层（落地 §6.3-5、T4.4/T5.5-②）。
2. **§9 验收表达到完整标准**：28 行、平台列/状态列齐备、每行有可执行验收方法、可行性 21 项能力逐项可映射无遗漏。
3. **发布/运维闭环可执行**：CI 三端矩阵（T5.7）、安装器（T5.1）、签名/notarization（T5.4 + P3）、updater（T5.3）、过渡演练（§6.3-5）、卸载冒烟（T5.5-⑥）均有文件级任务落点与验收断言。
4. **非阻塞必补项 2 条**：T5.5 补 P5 直查/验签显式条目（建议 M1 动工前）；T5.5-⑥ 补 macOS/Linux 卸载逐端命令与断言（M5 实现期）。均「补条目即闭环」，且规范层已定义需求。
5. **最终判定：可验收（approve）。** 兼容运维维度达到「可无缝迁移落地」标准；若组织以「任务清单零缺口」为绝对签收口径，补上 §4 两条后即达最终签收——本审查判定不构成阻塞，M1 可按计划开工。
