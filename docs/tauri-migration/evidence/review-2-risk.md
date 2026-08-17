# dsh-hub Tauri 2.x 迁移三报告 — 风险与安全审查意见（审查轮 2/3）

> 审查对象：《可行性分析报告》《代码迁移方案报告》《代码落地方案报告》（均 2026-08-17，含「审查轮 1 修订记录」附录）
> 审查角度：修订闭环验证（A1/A2/B1/B2/B3/C1/E1）/ 修订引入的新风险（stdio JSON-RPC、双通道检测误杀漏杀、token 分发）/ 安全设计完整性（capabilities 终审、信任边界、供应链可执行性）/ 第一轮中低危处理复核
> 依据：三报告全文 + 第一轮意见（`.planning/review-1-risk.md`）+ `.planning/research-B.md`、`.planning/research-C.md`、`REFERENCE.md` + 本地源码抽查（`reference/tauri-[desk-ui-core]/crates/tauri/build.rs`、`crates/tauri-schema-generator/schemas/*.json`；`deepseek-harness/packages/boot/app-boot/src/profile.ts`）
> 严重度：【S】阻断 ·【H】高 ·【M】中 ·【L】低（沿用轮 1 图例）

---

## 一、修订闭环验证（A1/A2/B1/B2/B3/C1/E1 逐项）

### A1【轮 1 S】多实例检测双通道 —— **迁移/落地已闭环；可行性报告未闭环（残留旧文本）**

- **已闭环证据**：
  - 迁移 §3.2（`multi-instance.mjs` 保留为 sidecar 模块，进程枚举「进程名+命令行匹配 `dsh.*web`」+ 端口探活双通道）、§4-5（双通道方案 + `TcpStream::connect + 500ms` 探活可照抄 spacedrive；**不依赖固定端口**，保留 rc.14 `--port 0` 随机端口语义，壳经 stdout READY/URL 行读端口；「原稿 portpicker 固定端口」显式取消）、§4-8（端口策略收敛，取消 portpicker）。
  - 落地 T4.2（双通道平移进 assemble-profile.mjs）、T4.4（多实例检测前置）、§5.4-8（**预启 CLI dsh（任意端口）后再启动壳 → 必须拦截**为 M4 硬验收）、T5.5-⑧（入 verify-tauri-release 门禁）、§9 行 9（验收口径「已核实（逻辑平移）」）。
  - 任务落位：✅（T4.2/T4.4/T5.5-⑧ 均有明确落点，轮 1 的「无任务」缺口已补）。
- **未闭环点（可行性侧）**：可行性 §2 表 #7 的「Tauri 对应」列仍写「**探测 3080 端口** / 复用 launcher.lock」——这是轮 1 已否定的固定端口旧设计残留，与迁移/落地的双通道文本直接矛盾；且可行性附录「审查轮 1 修订记录」**整表无 A1 行**（A2–A6 都在，唯独 A1 缺席），说明 A1 修订在可行性正文与修订记录两处均未落实。实现者以迁移/落地为准不会出错，但三报告一致性承诺（M13/M14 口径统一精神）被破坏。→ 见新问题 R1。

### A2【轮 1 H】回退线探测 —— **已闭环**

- **证据**：可行性 §3.4（`__TAURI_INTERNALS__` 探测仅用于「本地窗口内」判断，远程页探测结果不影响主桥；壳侧注入自有探针 `window.__DSH_SHELL__`）；迁移 §5.2（自有探针 `{ type: 'tauri', bridge: 'http' }`，adapter 只认该探针，「探测恒真但桥不通」死结消除）；落地 T4.5/T4.6（远程 dsh 页不依赖探测；回退语义下沉为「快捷方式/启动命令切换回 npm launcher」，`DSH_HUB_SHELL=webviewjs` 由 Rust 壳读取仅提示/退出；回退全链路冒烟含数据双向兼容入 T5.5）。
- **修订引入的新残留**：探针是普通 window 全局（页面/插件 client 代码可覆写，非完整性边界）；且落地 T4.6 的接线条件「`launchedByShortcut()` 且本地窗口探针 `window.__DSH_SHELL__` 命中」中，**index.ts 是 Node host 进程，如何读取页面 window 全局的机制未定义**（evaluateScript 往返？时序竞态？）→ 见新问题 R4。

### B1【轮 1 H】capabilities 最小授权 —— **任务层已闭环，表述有残留**

- **已闭环证据**：落地 T1.4 起步集**移除 `shell:default`**，理由正确且本地源码可证——capabilities 仅约束 webview 前端 invoke（tauri 能力 schema 明言「未匹配任何 capability 的 webview/window 对 IPC 层零访问」），Rust 侧 `std::process::Command` spawn sidecar 不走 ACL；X4-① 新增「capabilities 最终清单 + 每权限注释 + 与前端调用点对照表」产物 + M4 用 `tauri dev` ACL 报错驱动逐项最小化 + 权限集名并入 P4。
- **残留**：T1.4 起步集仍含 **`core:default`**（已核实本地 tauri `build.rs` L456-469：`core:default` = 全部核心插件 `:default` 集自动聚合，含 `core:path`（resolve/join/normalize 等路径命令）、`core:event`、`core:window`、`core:webview`、`core:app`、`core:image`、`core:menu`、`core:tray`、`core:resources`），再单列 `core:window:default` 等属冗余，且对本地窗口（splash/临时页）而言 `core:path:default` 等是多余面——「最小授权起步」表述与内容矛盾 → 见新问题 R5。

### B2【轮 1 H】桥鉴权 —— **任务已单列，实现层存在错位与未定义**

- **已闭环证据**：可行性 §5.6 + P1、落地 X4-④ 单列任务（Host 头白名单 `127.0.0.1:<port>` + Origin 校验 + 壳 spawn 时生成一次性 token + 「dsh-hub 自有层自建、不得引用 better-sidebar 围栏带过」）；迁移 §4-8 随机端口策略避免「桥目标可探测」；T4.5 引用 X4-④。
- **未闭环点**：
  1. **校验方错位**：主桥端点在 **sidecar（dsh webserver）** 上伺服（可行性 §3.4「页面↔sidecar HTTP/SSE/WS」、research-C §1.3），但可行性 §5.6 与 X4-④ 均写「**Rust 侧校验**」——Rust 壳不在该 HTTP 路径上，校验实现方应为 **Node host half**（token 由 Rust 生成后经 stdio/env 下发 sidecar）。实现者照字面会在 Rust 侧建校验而实际拦不到请求。
  2. **token 生命周期未定义**：「一次性 token」与 SSE/WS 长连接 + 多次 POST（workspace-path/session-focus/theme）冲突；签发→分发（页面如何拿到？经初始化脚本/服务端注入？）→有效期→轮换（壳重启后）→撤销→**日志脱敏**（不得入 URL query/日志）全缺。
  3. **WS/SSE upgrade 的 Origin 强制校验**未显式（WebSocket 不受 CORS 约束，恶意网页可直接连 `127.0.0.1:<port>`；Host 头对 IP 直连恒等于白名单值，拦不住——Origin + token 才是真闸门）。
  → 见新问题 R2。

### B3【轮 1 M】deep-link 输入校验 —— **已闭环（门控式）**

- **证据**：迁移 §4-7（args→URL→意图分发必须定义 scheme/host 白名单、URL 规范化、路径白名单、≤5MB；恶意 `dsh-hub://` 参数不得成为前端 fetch 目标/DOM 注入点；**安全设计落地前 M5 不启用**）；落地 X4-⑥（同语义任务）+ §9 行 25（显式「v1 范围外」+ M5 决策启用时补输入校验用例）。
- **残留（低）**：白名单具体取值（意图 host 清单、规范化算法、路径白名单与 `$DSH_HOME` 的关系）尚未落为产出物，属 M5 前决策点——可接受，但建议在 X4-⑥ 写明产出物清单 → R6。

### C1【轮 1 H】SessionEvent 兼容 —— **基本闭环，两处残留**

- **已闭环证据**：落地 T5.3（升级前对 `$DSH_HOME/sessions/` 做**只读快照**）、§5.4-9（旧会话可继续读写、seq 无冲突 + dsh 版本兼容矩阵）、§9 行 26（M4 验收行）、迁移 §9.1（会话兼容入行为对齐清单）。
- **残留**：
  1. **「只读快照」操作语义未定义**：快照=复制/硬链/只读校验？存哪（`backup/v<from>/sessions`?）、保留期、体积（session.jsonl.zstd 可大）——T5.3 一句话带过。
  2. **轮 1 建议 ②「方案 B 随壳固定 dsh 版本」未落位**：迁移 §7.1 三通道（A 全局 npm dsh / B externalBin Node 运行时 / C 内置装配 helper）与落地 §10-6 只谈 Node 版本钉死，**dsh 版本在 A/B/C 下均不受壳控制**（research-C §2.1 明言「dsh 本体 + 插件走 npm 包或 resources」）。「记录兼容矩阵」是缓解不是控制；且 deepseek-harness 官方姿态是「SESSION_FORMAT_VERSION=0、无兼容承诺」（其根 AGENTS.md），格式漂移风险是真实的——报告应显式引用该姿态并说明矩阵+快照即为此设计的唯一缓解手段 → R11。

### E1【轮 1 H】签名密钥 SOP —— **基本闭环（大纲级）**

- **已闭环证据**：可行性 P3（生成→保管→轮换→泄露处置；轮换=客户端 pubkey 随版本更新，含旧签名兼容期）、迁移 §7.2（`tauri signer generate` → CI secret → 轮换 → 泄露处置）、落地 T5.4（同语义）。
- **残留**：SOP 仍是**一行枚举式大纲**，无具体操作（私钥备份/双人审批、轮换演练步骤、泄露后的吊销/强制更新路径、Authenticode 证书与 notarization 凭据的保管人）；「**旧签名兼容期**」的技术实现（tauri-plugin-updater 是否支持多 pubkey/双签名过渡）**未核实**，若仅支持单 pubkey，兼容期需要特殊过渡设计 → R12。

---

## 二、新发现问题清单（本轮新发现 / 修订引入）

### R1【L】可行性 §2 #7 残留「探测 3080 端口」+ 附录修订表缺 A1 行
- **描述**：可行性表 #7「Tauri 对应」仍写「枚举 `dsh web` 进程 / **探测 3080 端口** / 复用 launcher.lock」，与迁移 §4-5/§4-8、落地 T4.2 的「不依赖固定端口、随机端口 + 双通道」直接矛盾；修订记录表无 A1 行。若有人只读可行性即按 3080 实现，多实例拦截回到轮 1 已否定的设计。
- **涉及**：可行性 §2 #7、附录修订表。
- **建议**：可行性 #7 改为与迁移 §4-5 一致的双通道表述；附录补 A1 行（✅ 已处理，指向迁移/落地）。

### R2【M】桥 token：校验方错位 + 生命周期未定义 + WS/SSE Origin 未显式
- **描述**：①「Rust 侧校验」与主桥由 sidecar webserver 伺服的拓扑矛盾（见 B2）；②「一次性 token」与长连接/多次 POST 冲突，签发→分发→有效→轮换→撤销→日志脱敏全链未定义；③ WS/SSE upgrade 的 Origin 校验未显式（WS 无 CORS，恶意网页直连 IP 时 Host 头恒等于白名单值，Host 检查失效，Origin+token 才是真闸门）。
- **涉及**：可行性 §5.6、P1；落地 X4-④、T4.5。
- **建议**：X4-④ 扩为子任务清单——(a) token 由 Rust 生成，经 stdio `init{token}` 消息（或 env）下发 sidecar，**校验实现于 Node host half**（或明确定义桥端点改由壳代理，二选一不可含糊）；(b) 语义定为「会话级 token（每次壳启动换发），非单次使用」；(c) 页面经初始化脚本注入 `window.__DSH_BRIDGE_TOKEN__`，**禁止放 URL query**；(d) WS/SSE upgrade 与 POST 同强度校验 Origin + token；(e) 日志脱敏（X1 明确不打印 token）。

### R3【M】stdio JSON-RPC 解析面：无帧标识 + READY 端口无「先验证再导航」+ 无 schema 校验
- **描述**：落地 T4.1 / 迁移 §4-9 定义 stdout 侧为「JSON 行事件 `READY{port}` / `output{line}` / `exit{code,quitMarker}`」，但 dsh host 加载**第三方插件（任意代码）**，其 console.log 打出形似 `READY{...}`/`exit{...}` 的 JSON 行即可被 Rust 误解析（伪造端口 → 导航到攻击者本地服务 = webview 指向恶意源；伪造 exit → 干扰重启判别）。stderr 则逐行原样 `emit("dsh:output")` 回灌前端（内容应只作文本渲染）。sidecar 是被信任的子进程，但**其输出必须按不可信输入处理**。
- **涉及**：迁移 §4-9；落地 T4.1/T4.3/T4.4。
- **建议**：协议加帧前缀（如 `DSH_EVENT <json>` 或长度前缀），仅帧内 JSON 才解析；schema 严格校验（未知字段拒绝）；`READY` 端口**交叉验证**（连接 + HTTP 探测确认是该 sidecar 自己监听的端口）后才建窗导航（T4.4 已有「兜底轮询可连」——升格为强制前置步骤）；`exit` 判定以 `Child::try_wait` 为准，不以 stdout 为准；`dsh:output` 前端渲染强制 text（禁 innerHTML）。

### R4【M】`__DSH_SHELL__` 探针：页面可覆写（非完整性边界）+ Node host 读取机制未定义
- **描述**：探针是普通 window 全局，任何页面脚本（第三方插件 client bundle、XSS）可覆写 → 客户端 adapter 判断不可信；更关键的是落地 T4.6 的接线条件（`launchedByShortcut()` && 探针命中）发生在 **index.ts（Node host 进程）**，Node 读页面 window 全局的机制（evaluateScript 往返？时序竞态？）未定义——照抄无法实现。
- **涉及**：迁移 §5.2；落地 T4.5/T4.6。
- **建议**：壳侧决策信号改走 **env**（Rust spawn sidecar 时设 `DSH_HUB_SHELL=tauri`；npm launcher 设 `webviewjs`），index.ts 直接读 env，无往返无竞态；`window.__DSH_SHELL__` 仅保留为**客户端 adapter 提示**（且实现为「只在初始化脚本注入后由壳侧事件确认，不信任页面自设值」）。

### R5【L】capabilities 起步集含 `core:default`，与「最小授权」矛盾
- **描述**：`core:default`（本地 `crates/tauri/build.rs` 已核实）自动聚合全部核心插件 default 集（含 `core:path` 的 resolve/join/normalize 等），T1.4 再单列 `core:window:default` 等属冗余；对 splash/壳内临时页而言 path 等命令是多余面。ACL 面虽仅限本地窗口（远程 dsh 页无 IPC 能力），风险可控，但「最小授权起步」的验收标准不成立。
- **涉及**：落地 T1.4、X4-①。
- **建议**：X4-① 终审标准写死为——按 `generate_handler` 实际注册命令枚举 `core:window:allow-*` 等（去掉 `core:default` 全家桶）、按窗口 label 分组授权（main 窗 vs splash 窗）、对照表列出「页面/命令/权限」三元组；M4 ACL 报错驱动只允许「真实调用点 → 加对应权限」。

### R6【L】深链参数规范未列产出物
- **描述**：X4-⑥ 定义了约束（意图 host + 规范化 + 文件白名单 + ≤5MB）但未列产出物（具体 scheme 清单、规范化算法选型、路径白名单范围）。
- **涉及**：落地 X4-⑥、§9 行 25。
- **建议**：X4-⑥ 补一行产出物：「深链参数规范（scheme/host 白名单表 + 规范化规则 + 路径白名单 + 大小限制）」，M5 决策启用前评审。

### R7【M】卸载后 junction 悬空 + bundles 残留 → 裸 `dsh web` 启动失败（未评估）
- **描述**：Tauri 时代 junction 目标 = **安装目录内嵌资产**（迁移 §7.5-1）。卸载按 T5.1 三段清理只删安装目录/可选 `$DSH_HOME/dsh-hub` 自有文件/保留 profiles——**profiles/web/package.json 的 `bundles` 条目与 `node_modules/@marecgents/dsh-hub` junction 均不清除**。已核实 dsh app-boot `resolveBundleDir`（`packages/boot/app-boot/src/profile.ts` L344-355）：两个锚点（dsh 安装锚点、profile 目录）都解析不到 bundle 时**抛错 fail loud**（`cannot resolve profile bundle ... run 'dsh plugin --profile ... install'`）——卸载后 junction 指向已删除目录 → 悬空 → 裸 `dsh web`（卸载器承诺保留的 dsh CLI 日常使用路径）可能直接启动失败。T5.5-⑥ 卸载冒烟只断言「profiles/sessions 保留」，**未断言卸载后裸 `dsh web` 可启动**。
- **涉及**：落地 T5.1、T5.5-⑥；迁移 §7.5。
- **建议**：卸载冒烟加断言「卸载后 `dsh web` 可正常启动」；若 fail，卸载器需清理本插件的 bundles 条目 + junction（属「本插件装配痕迹」，与「保留 dsh 共享数据」不冲突），或文档化「卸载后需 `dsh plugin --profile web remove @marecgents/dsh-hub`」补救步骤。

### R8【L】供应链校验可执行性细节：SHASUMS 无签名校验、哈希登记机制、cargo audit DB
- **描述**：T5.2「固定版本 + 官方 SHASUMS256.txt 校验（TLS 源固定）」——SHASUMS256.txt 本身无签名（Node 官方另有 `.sig` OpenPGP 签名），仅 TLS 传输的校验强度依赖 CA 链；「哈希登记」登记到哪、与构建产物如何比对未定义；T5.5-① `cargo audit` 依赖 rustsec advisory DB，CI 离线/缓存未说明更新机制。
- **涉及**：落地 T5.2、T5.5-①；迁移 §7.1。
- **建议**：下载脚本同时校验 SHASUMS256.txt.sig（固定 Node 官方签名密钥指纹）或至少注明 TLS+固定 URL 的残余风险；哈希登记 = 入仓 expected-hash 清单 + 构建产物比对 + 记入发布记录；CI 中 `cargo audit` 注明 advisory DB 拉取方式（定期 job 或缓存）。

### R9【L】T5.1 卸载清理清单未含 webview-data（与 X4-⑦ 承诺不一致）
- **描述**：X4-⑦ 承诺 WebView2 user data folder「纳入备份/**清理**边界」，但 T5.1 ② 的可选勾选清单只有 `$DSH_HOME/dsh-hub/{bin,logs,backup,quit.marker,launcher.lock}` + window-state.json，**没有 webview-data**（localStorage/IndexedDB 残留磁盘）。
- **涉及**：落地 T5.1、X4-⑦。
- **建议**：T5.1 ② 补 `$DSH_HOME/dsh-hub/webview-data`（浏览器缓存类，卸载时可安全删，默认不删即可）；X3 备份范围显式声明不含 webview-data（UI 缓存无需备份）。

### R10【L】双通道检测执行细节：PID→端口解析、判定规则、竞态二次确认
- **描述**：迁移 §4-5 的探活通道输入是「已发现的 dsh host 端口」，但 **PID→监听端口**的解析步骤（netstat/Get-NetTCPConnection/sysinfo）未写——CLI 实例端口随机，没有该步探活通道无输入；**判定规则（AND/OR）未定义**——进程名+命令行命中但探活失败（僵尸进程/500ms 内未就绪）时拦不拦？命令行含 `dsh.*web` 子串的非 dsh 进程（误杀面）与重命名入口（漏杀面）如何权衡；**竞态**——检测通过后、spawn 前另一 CLI 启动（TOCTOU），下次启动才拦截。
- **涉及**：迁移 §4-5；落地 T4.2/T4.4。
- **建议**：T4.2 写明流水线「枚举（自排除当前 PID）→ PID→端口解析 → 逐端口探活」+ 判定规则（建议：进程枚举命中即进入「默认拒绝 + 确认框」流程，探活仅作展示/确认信息——与「默认拒共存红线」一致，宁可误拦不可漏拦；探活失败重试 2-3 次再判）+ spawn 后二次确认（命中则终止刚起的 sidecar 并提示）。

### R11【L/M】C1 残留：方案 B 未钉 dsh 版本 + 只读快照语义未定义
- **描述**：见 C1 验证。dsh 官方「无格式兼容承诺」前提下，矩阵+快照是合理缓解，但「方案 B 随壳固定 dsh 版本」（轮 1 建议 ②）在迁移 §7.1 / 落地 §10-6 均未落位；「只读快照」的存储/校验/保留期未定义。
- **涉及**：迁移 §7.1；落地 T5.3、§10-6。
- **建议**：M5 通道决策时写明「B/C 通道若内置 dsh 本体则版本随壳钉死」；T5.3 定义快照落地位置（`backup/v<from>/sessions/`）、只读校验方式与保留策略；报告正文显式引用 dsh「SESSION_FORMAT_VERSION=0 无兼容承诺」姿态。

### R12【L】E1 残留：SOP 大纲级 + 兼容期实现未核实
- **描述**：见 E1 验证。SOP 无具体步骤/演练/双人制；「旧签名兼容期」依赖 tauri-updater 多 pubkey 支持，未核实（插件源码不在本地，REFERENCE 3/10）。
- **涉及**：可行性 P3；迁移 §7.2；落地 T5.4。
- **建议**：P3 验收加「密钥轮换演练」已有——补「旧兼容期实现验证（updater 多 pubkey/双签名过渡）入 P4 插件核实清单」；SOP 细化私钥备份 + 双人审批 + Authenticode/notarization 凭据保管人。

---

## 三、残留问题清单（第一轮中低危处理复核）

| 轮 1 项 | 处理复核 | 结论 |
|---|---|---|
| A4（M）updater 端点/企业网络 | ✅ 多 endpoints（GitHub+镜像/自建）+ 降级路径（提示全局 dsh/离线包）+ 代理说明（迁移 §7.2、T5.3） | 合理，闭环 |
| A5（M）杀软/EDR | ✅ 测试证书先行 + AV 白名单提交 + T5.5-③「首启被安全软件拦截」检查项 | 合理，闭环 |
| A6（M）平台依赖矩阵 | ✅ §7.1 矩阵 + T5.5-③ Win10 无 Runtime 隔离机用例 + §9 平台列 | 合理，闭环 |
| B3（M）deep-link | ✅ X4-⑥ + v1 范围外门控（见 B3） | 闭环，残留 R6（L） |
| B4（M）localStorage/userData | ✅ X4-⑦ 显式配置 + 备份/清理边界 + localStorage 核实任务 | 闭环，残留 R9（清理清单缺 webview-data） |
| B5（L）敏感度说明 | ✅ X3 注明「config/pins 含路径/标题元数据，不含 token/密钥，ACL 与现状一致」 | 合理，闭环 |
| C2（M）备份闭环 | ✅ 挂所有升级入口（updater+NSIS 检测旧版本）+ 失败中止 + 恢复入口定义 + T5.5-④ 演练 | 合理，闭环；NSIS「检测旧版本号」实现细节与覆盖升级杀进程仍缺（并入 R13） |
| C3（M）卸载清理边界 | ✅ 三段清理 + 卸载前杀 sidecar + 卸载冒烟 | 主体合理，**残留 R7（卸载后裸 dsh web 启动未断言）** |
| D1/D2（H）回退 | ✅ 回退手册入 P7 + T5.5-⑦ 全链路冒烟（数据双向兼容）+ 语义下沉 | 闭环 |
| E2（M）Rust 供应链 | ✅ `cargo audit` 入门禁（T5.5-①） | 闭环，细节残留并入 R8 |
| E3（L）信任边界声明 | ✅ 归入 T5.6 README 信任模型说明（壳/运行时签名 vs 插件安装信任链） | 合理，闭环；建议 T5.6 验收加「信任模型段落存在性」断言 |

**新增残留（修订记录未覆盖 / 本轮补提）**：
- R13【L】NSIS 覆盖升级路径：X3/T5.3 说「NSIS 升级脚本检测旧版本号」但检测实现（读 Uninstall 键 DisplayVersion？安装目录 version 文件？）未写；覆盖安装时旧进程占用（EBUSY 类）需先杀/提示关闭——只有「卸载前杀 sidecar」，「升级前杀 sidecar」未提。

---

## 四、安全设计完整性评估

1. **capabilities 终审**：任务闭环（X4-① 产物 + ACL 报错驱动 + P4 权限集名核实），但终审标准需按 R5 收紧（去 `core:default`、按命令枚举、按 label 分组、三元组对照表）；M5 新增 updater/notification 前端调用时按「先加权限再放行」规则补（研究-B §2.2 已列 surrealist 权限写法可照抄）。
2. **信任边界声明**：E3 已落 T5.6 README（壳/运行时签名 vs 插件安装信任链）；建议加验收断言，避免「签名=全链可信」误解。
3. **供应链可执行性**：cargo audit ✅ 入门禁（补 advisory DB 更新注记，R8）；Node 下载固定版本 + SHASUMS256 + 失败中止 + externalBin 哈希登记 + 按需下载默认关闭/opt-in ✅（补 .sig 校验，R8）；`tauri signer verify` 验签入 P5 门禁 ✅。

---

## 五、结论

- **总体判断**：修订质量高——轮 1 的 1 个阻断项（A1）+ 7 个高危项中，**A1（迁移/落地侧）、A2、B1、B3 已闭环且任务落位**；**B2/C1/E1 任务已单列但实现层存在错位或大纲级残留**（B2 校验方与 token 生命周期、C1 快照语义与 dsh 版本钉死、E1 SOP 细节与兼容期验证）；**无新增阻断项**。
- **新发现**：2 个 M 级执行缺口（R2 桥 token 生命周期/校验方错位、R3 stdio JSON-RPC 解析面）与 1 个 M 级未评估影响（R7 卸载后裸 `dsh web` 启动失败，已用 dsh app-boot 源码佐证）；其余为 L 级文档一致性/细节项（R1 可行性 3080 残留、R5 core:default、R8-R13）。
- **需在对应里程碑前补齐**：M4 前——X4-④ token 生命周期 + 校验方更正、T4.1 stdio 帧/READY 交叉验证、T4.5/T4.6 探针机制（env 信号）；M5 前——T5.1/T5.5 卸载残留断言、T5.2 SHASUMS .sig、C1 快照语义与 dsh 版本钉死、E1 SOP 细化；文档一致性——可行性 §2 #7 修正 + 附录补 A1 行。
- **审查结论**：**有条件通过（需小修）**——第二轮修订已消除全部阻断项，剩余问题均为「执行细节未闭合 / 文档不一致」，不改变「可行性高」评级；建议三报告在 M1 开工前完成 R1/R2/R4 三处修正（成本低、直接决定 M4 实现正确性）。
