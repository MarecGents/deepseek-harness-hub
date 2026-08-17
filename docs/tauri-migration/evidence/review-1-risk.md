# dsh-hub Tauri 2.x 迁移三报告 — 风险与安全审查意见（审查轮 1/3）

> 审查对象：《可行性分析报告》《代码迁移方案报告》《代码落地方案报告》（均 2026-08-17）
> 审查角度：风险识别完备性 / 安全设计（capabilities、Node sidecar 信任边界、deep-link、localStorage、$DSH_HOME）/ 数据安全（SessionEvent、配置备份、卸载）/ 回退策略 / 供应链
> 依据：三报告全文 + `.planning/research-B.md`、`.planning/research-D.md`、`REFERENCE.md` 条目 2/3/5/6/9/10/11 + 仓库源码抽查（`bin/multi-instance.mjs`、`src/services/*`、`deepseek-harness/packages/host/webserver`、`reference/tauri-[desk-ui-core]/crates/tauri/src/{manager/webview.rs, ipc/*}`）
> 严重度：【S】阻断（动工前必须解决/重新设计）·【H】高（对应里程碑前必须补任务/验收）·【M】中 ·【L】低

---

## 一、问题清单

### A. 风险识别完备性

#### A1【S】多实例共存检测的替换方案存在设计矛盾，铁律 4 红线可能被实际削弱
- **描述**：现状 `bin/multi-instance.mjs` 用 `netstat -ano` + CIM 按进程命令行 `dsh.*web` **全量枚举**探测（文件 L43-45 明确注释："3080 只是其中一种可能——CLI `dsh web --port N` 绑任意空闲端口；桌面壳自己用 `--port 0` OS 分配"），因此能发现**任意端口**的 CLI dsh 实例。迁移方案改为"壳用 `portpicker` 预选**固定端口** + `TcpStream` 探活该端口"（迁移 §4-5、落地 T4.2/T4.4），只能发现壳自己托管的那个 dsh，**探不到随机/任意端口的 CLI dsh 实例** → 共存拦截失效 → 同 `$DSH_HOME` 双写损坏会话日志（seq 冲突，踩坑 #24 已实际发生）。落地 §9 验收 #9"双开 CLI dsh + 壳验证拦截"在纯 TCP 探活实现下必然失败，或实现被悄悄绕过。research-B §2.5 其实已提示"要么固定端口（改语义）要么保留探活文件"，但落地任务只取了固定端口+探活一半。
- **涉及**：可行性 §2 #7、§5.5；迁移 §3.2、§4-5；落地 T4.2/T4.4、§9 验收 #9；research-B §2.5
- **建议**：共存检测**保留进程枚举**（CIM 命令行匹配 `dsh.*web`，逻辑平移进 sidecar 模块），探活只作辅助；或在 dsh 侧引入 CLI 也遵守的互斥锁（现状 launcher.lock 仅壳间有效，CLI 不写）。将"预启 CLI dsh 后再启动壳 → 必须拦截"列为 M4 硬验收并进入 verify-tauri-release。

#### A2【H】回退线探测机制与方案 B 冲突：`"__TAURI_INTERNALS__" in window` 在远程页上不可靠
- **描述**：迁移 §5.2 / 落地 T4.6 照抄 surrealist 的 `"__TAURI_INTERNALS__" in window` 探测来二选一（tauri-shell vs desktop.ts）。但已核实 Tauri 对**所有** webview 主帧无条件注入 `window.isTauri=true` 与 `window.__TAURI_INTERNALS__`（含 `metadata`/`plugins:{}`，`crates/tauri/src/manager/webview.rs` L168-196），与页面是否远程无关；而方案 B 下页面是远程 origin `http://127.0.0.1:<port>`，未配 `dangerousRemoteDomainIpcAccess` 时 IPC 不可用/ACL 全拒。结果：探测恒真 → 前端走 tauri-shell 分支但桥实际不通，或探测语义随 Tauri 注入实现漂移。另 `DSH_HUB_SHELL=webviewjs` 回退开关**未定义读取方**（Rust 壳不读该 env 则开关无效，且 Tauri 壳自身无法承载 webviewjs 壳）。
- **涉及**：迁移 §5.2；落地 T4.6、M4 验收 #7；可行性 §3.4
- **建议**：壳侧用 `initialization_script` 显式注入自有探针（如 `window.__DSH_SHELL__ = { type: 'tauri', bridge: 'http' }`）或 URL query 参数，adapter 只认该探针；回退语义下沉到"快捷方式/启动命令切换回 npm launcher"（见 D1），补回退全链路冒烟。

#### A3【H】遗漏风险：Node 运行时下载/分发无供应链完整性校验
- **描述**：落地 T5.2 `fetch-node-runtime.mjs` 按平台下载固定 Node 版本，无"官方源固定 + SHASUMS256 校验 + 失败即中止"要求；§10-6 还把"首启联网按需下载运行时到 `$DSH_HOME/dsh-hub/runtime/`"作为备选正常路径——下载物被替换/中间人 = 任意代码执行。npm 现状链路有"registry 显式官方 + dist-tag 直查"（AGENTS.md §5.2），Tauri 侧未继承等价校验。
- **涉及**：落地 T5.2、§10-6；迁移 §7.1
- **建议**：固定版本 + 官方 SHASUMS256.txt 校验（TLS 源固定）+ 校验失败中止；externalBin 打包时在 verify-tauri-release 中对 node 二进制做哈希登记；按需下载路径默认关闭或仅限明确 opt-in。

#### A4【M】遗漏风险：企业网络/地域性分发（updater 端点 = GitHub Releases、运行时按需下载）
- **描述**：updater endpoints 指向 GitHub Releases（迁移 §7.2、research-D §2.3），方案 B 按需下载依赖公网；企业代理/离线/部分地区网络（现状 npm 已用镜像规避，AGENTS.md §5.2-5）下升级与首启失败，且无降级路径（NSIS 默认禁降级，research-D §2.6）。报告未把"更新服务器不可达"列为风险，无多端点/镜像/离线包设计。
- **涉及**：可行性 §5.2、P3；迁移 §7.2；落地 §10-6
- **建议**：updater 配多 endpoints（GitHub + 镜像/自建 tauri-update-server）；下载失败给可操作降级（提示全局 dsh / 离线安装包）；企业部署文档写明代理配置。

#### A5【M】遗漏风险：杀软/EDR 误报与未签名期信任链
- **描述**：可行性 §5.3 只覆盖 SmartScreen/公证，未提 AV 误报面：无签名新壳 + node.exe sidecar + junction/mklink 子进程 + `taskkill /f /t` 模式（surrealist 范式）+ 运行时下载，是典型误报组合；签名到位前的迁移期分发即触发。
- **涉及**：可行性 §5.3、P3；落地 T5.4
- **建议**：P3 前先用测试证书/OV 证书跑通签名；发布 SOP 含 AV 厂商白名单提交；T5.5 冒烟加"安装后首启被安全软件拦截"检查项。

#### A6【M】平台依赖矩阵不完整
- **描述**：WebView2 Runtime 依赖仅标"待验证"（可行性 §5.2）+ `embedBootstrapper`（迁移 §7.1），但 T5.5 冒烟无"Win10 无 WebView2 Runtime"用例；Linux AppImage 的 WebKitGTK/GTK 系统库缺失与 Wayland/X11 差异未提；macOS hardened runtime + entitlements 仅提"存在"（T5.4）无内容与验收。
- **涉及**：可行性 §5.2/§5.4；落地 T5.1/T5.4/T5.5
- **建议**：建平台依赖矩阵（最小 OS / 系统依赖 / WebView 运行时安装模式）并逐端进 T5.5 冒烟。

### B. 安全设计

#### B1【H】capabilities 最小授权未闭环：起步即含 `shell:default`，且"M4 收紧"无任务落点
- **描述**：落地 T1.4 起步集含 `shell:default`，注释"M4 收紧为 shell:allow-execute 白名单"但全报告无对应任务/验收；且已核实 Rust 侧 `std::process::Command` spawn sidecar **不走 capabilities ACL**（ACL 只约束 webview 前端 invoke），前端在方案 B 下也不需要 shell 能力（走 HTTP 桥）→ 该权限是纯多余面。另 `core:*:default` 权限集名称与范围"待验证"未排期确认（research-B §2.2：漏配 = 前端静默 reject，不报编译错）。
- **涉及**：落地 T1.4、X4-①；迁移 §7.3
- **建议**：起步集移除 shell；新增 X4 产物"capabilities 最终清单 + 每权限注释 + 与前端调用点对照表"；M4 收尾用 `tauri dev` ACL 报错驱动逐项最小化；权限集名并入 P4 核实。

#### B2【H】方案 B 桥端点（`/api/dsh-hub/bridge`）信任边界未设计
- **描述**：已核实 dsh webserver 明确"**No TLS, auth, or origin policy**"（`deepseek-harness/packages/host/webserver/README.md`），且 dsh-hub 现有 `/api/dsh-hub/*` 路由**无 Host/Origin 校验**（源码抽查无 host 检查；报告所称"Host 头信任围栏"引自 better-sidebar，属另一插件，不是 dsh-hub 自有层）。新增桥端点（SSE/WS 下行 + 页面→壳 POST，含 `shell_command` 托盘命令、applySize/applyTheme）等于新增一条任意本地进程/恶意网页（CSRF/DNS rebinding 面）可调用的命令通道；叠加"端口固定化"（T4.4）使目标可探测。
- **涉及**：可行性 §3.4、§5.6；迁移 §2.1；落地 X4-④、T4.4/T4.8
- **建议**：桥端点强制 Host 头白名单（`127.0.0.1:<port>`）+ Origin 校验 + 壳 spawn 时生成一次性 token（页面订阅/调用必须携带，Rust 侧校验）；端口建议保留随机 + 壳经 stdout 读端口（rc.14 语义不变，双赢）；把"桥端点鉴权"单列为 X4 任务，不能写"插件层信任围栏零改动"带过。

#### B3【M】deep-link 输入注入面未落实安全细化任务
- **描述**：深链为新增能力，三报告引用 surrealist"文件白名单安全模型"（REFERENCE 10⑦）但落地无对应任务：args→URL→`open-resource` 流程照抄时未定义 scheme/host 白名单、URL 规范化、路径白名单与单文件大小限制；恶意 `dsh-hub://` 参数进页面后若被前端当 fetch 目标/DOM 注入点 → XSS/路径穿越面。
- **涉及**：可行性 §2 #9；迁移 §4-7；落地 §9
- **建议**：新增安全任务：deep-link 输入校验（仅接受已知意图 host + path 规范化 + 文件白名单 + 5MB 限制，参照 surrealist `open.rs` + REFERENCE 10⑦）；安全设计落地前 M5 不启用深链。

#### B4【M】localStorage / WebView2 userData 位置与迁移未管理
- **描述**：页面是远程 origin，localStorage/IndexedDB 落 WebView2 user data folder；Tauri(wry) 默认 data 目录 ≠ 现壳 webviewjs 的 userDataFolder → 升级/回退间 UI 状态（若 dsh web 或 client half 用 localStorage）不一致或旧数据残留磁盘。三报告只谈 `$DSH_HOME` JSON 文件，未谈 webview 存储。
- **涉及**：可行性 §2 #13；落地 X3
- **建议**：显式配置 WebView2 user data folder 指向固定路径（如 `$DSH_HOME/dsh-hub/webview-data`）并纳入备份/清理边界；核实 dsh web 是否依赖 localStorage，若依赖则做迁移或兼容说明。

#### B5【L】配置/数据文件敏感度说明缺失
- **描述**：config.json/pins.json 含工作区路径、会话标题等元数据，backup 目录无权限/敏感度说明；虽非凭据，迁移文档应声明"不存 token/密钥"边界并保持文件 ACL 与现状一致。
- **涉及**：落地 X3
- **建议**：X3 文档注明备份内容与敏感度边界；`$DSH_HOME` 权限继承现状即可。

### C. 数据安全

#### C1【H】SessionEvent / 会话数据兼容性无显式验证（含 dsh 版本不受控）
- **描述**：会话日志 append-only（JSONL/SQLite，REFERENCE 2），seq 冲突即损坏（踩坑 #24）。方案 A 下 sidecar 用**全局 dsh CLI**，dsh 版本由用户环境决定、壳不可控；升级 dsh 若改 SessionEvent 格式 → 迁移/回退期间会话不可读或双写损坏。三报告**未声明"SessionEvent 格式不变"的验证项**，也未固定 dsh 版本。
- **涉及**：可行性 §3.3；落地 T4.3、§10；REFERENCE 2
- **建议**：① 方案 A 记录 dsh 版本兼容矩阵 + 升级前会话只读快照；② 方案 B（内置运行时）随壳固定 dsh 版本；③ 验收加"旧会话可继续读写、seq 无冲突"用例（M4）。

#### C2【M】配置备份/恢复闭环不完整
- **描述**：X3 备份触发只挂 updater"大版本升级前置"（T5.3），**安装器覆盖升级路径不触发**；恢复流程（谁调 `restore_config_backup`、有无 UI、是否验证）未定义；备份失败未要求中止升级；"失败可回滚"缺演练。
- **涉及**：落地 X3、T5.3；迁移 §4-10
- **建议**：备份挂所有升级入口（updater + NSIS 升级脚本检测旧版本号）；定义恢复命令与入口；备份失败中止升级；T5.5 加"升级前备份 → 模拟失败 → 恢复"演练。

#### C3【M】卸载清理边界未细化（`$DSH_HOME` 是共享目录）
- **描述**：research-D §2.4 说 NSIS"删除应用数据"复选框补清理，但 `$DSH_HOME` 同时被 dsh CLI 与其他插件使用，整目录删除会毁用户 dsh 数据；未定义精确清理清单（`$DSH_HOME/dsh-hub/{logs,backup,bin,window-state,launcher.lock,quit.marker}` + `profiles/web` 中本插件的 junction/bundles/patch 条目），未提卸载时先杀 sidecar 进程。
- **涉及**：research-D §2.4；落地 T5.1、§6
- **建议**：NSIS 卸载段实现精确路径清理 + "保留 dsh 共享数据"说明 + 卸载前杀 sidecar；卸载冒烟入 T5.5（卸载后 dsh CLI 数据完好）。

### D. 回退策略

#### D1【H】dev-v1 rc.14 回退不具体
- **描述**：落地 §1.1-2 仅写"rc.14 随时可安装兜底"，无操作步骤（`npm i -g @marecgents/dsh-hub@rc.14` + 快捷方式回指）、无**数据双向兼容**验证（新壳写的 window-state/config 被 rc.14 读；junction 目标在"安装目录内嵌资产"与"npm 全局包"间被两代启动逻辑互 relink 的行为未验证）、无双壳并存规则（两个快捷方式/两套装配）。
- **涉及**：可行性 §5.5、P7；落地 §1.1、§9 验收 #3
- **建议**：P7 产出《回退运行手册》（步骤 + 数据兼容检查清单 + 并存规则），回退冒烟纳入 verify-tauri-release 门禁。

#### D2【H】双轨桥回退线真实性存疑（与 A2 同源，落地侧补）
- **描述**：`DSH_HUB_SHELL=webviewjs` 未定义读取方；"回退 = 跑 desktop.ts"需要 npm 全局包 launcher 环境，Tauri 壳自身无法承载；探测失效见 A2。
- **涉及**：落地 T4.6、M4 验收 #7
- **建议**：把回退定义为"快捷方式/启动命令切换回 npm launcher"，Rust 壳读 `DSH_HUB_SHELL` 时仅做提示/退出；M4 验收 #7 扩展为回退全链路冒烟（含数据兼容）。

### E. 供应链

#### E1【H】签名密钥全生命周期未定义
- **描述**：迁移 §7.2 有 `TAURI_SIGNING_PRIVATE_KEY` 入 CI secret + P5 `tauri signer verify` ✓；缺密钥轮换/泄露处置/备份/双人制、updater 公钥变更的客户端更新路径、Windows Authenticode 证书与 notarization 凭据保管（OV/EV 采购、CI `APPLE_*` env 名待验证）。
- **涉及**：迁移 §7.2；落地 T5.3/T5.4；research-D §2.3
- **建议**：P3 增密钥管理 SOP（生成→保管→轮换→泄露处置；轮换 = 客户端 pubkey 随版本更新流程，含旧签名兼容期）。

#### E2【M】Rust 依赖供应链仅"锁版本"，缺漏洞扫描
- **描述**：Cargo.lock 提交 + 无漂移门禁 ✓（迁移 §7.3 P3）；缺 `cargo audit`/`cargo deny` 定期扫描、crates.io 与 CI 缓存一致性、依赖来源记录；tauri 2.11 / 插件 2.2.x 的"待验证最新"需落到 lock。
- **涉及**：迁移 §7.3；落地 T1.1
- **建议**：门禁加 `cargo audit`（或周期任务）；发布记录含 Cargo.lock 变更摘要。

#### E3【L】供应链信任边界声明缺失
- **描述**：壳签名只保护壳与 sidecar 分发；插件层（第三方 dsh 插件）仍是运行时任意代码（dsh 生态信任链）。迁移文档应显式声明信任模型，避免用户误以为"签名 = 全链可信"。
- **涉及**：可行性 §5.3；落地 T5.4
- **建议**：README/文档增加信任模型说明（壳/运行时签名 vs 插件安装信任链）。

### 覆盖度核对（任务要求的风险清单 vs 三报告）

| 审查项 | 三报告覆盖 | 备注 |
|---|---|---|
| plugins-workspace 未 clone（single-instance/updater/localhost 行为） | ✅ 已识别 | 可行性 P4、迁移 §9.2-1、落地 §10-1 |
| tao/wry 行为 | ✅ 已识别 | 可行性 P5、迁移 §9.2-2 |
| 三端渲染差异 | ✅ 已识别 | 可行性 §4.2/§5.4 |
| sidecar 体积 | ✅ 已识别 | 可行性 §5.1、落地 §10-6 |
| 签名/notarization 成本 | ✅ 已识别 | 可行性 §5.3、P3 |
| WebView2 runtime 依赖 | ⚠️ 部分 | 有配置无验收用例（A6） |
| 杀软误报 | ❌ 遗漏 | A5 |
| 企业环境代理/更新服务器可用性 | ❌ 遗漏 | A4 |
| Node 运行时下载供应链 | ❌ 遗漏 | A3 |
| 多实例检测手段替换矛盾 | ❌ 遗漏 | A1（研究文件有提示，报告未收敛） |
| SessionEvent 格式兼容 | ❌ 遗漏 | C1 |
| localStorage/userData 迁移 | ❌ 遗漏 | B4 |
| 桥端点鉴权 | ❌ 遗漏 | B2 |
| deep-link 注入面 | ⚠️ 部分 | 引用了安全模型未落任务（B3） |
| 密钥轮换/泄露处置 | ❌ 遗漏 | E1 |

---

## 二、亮点

1. **纪律性极佳**：每条结论标注「已核实/待验证」+ 源码出处（文件:行号），对本地无源码的 plugins-workspace、tao/wry 诚实列为前置条件（P4/P5），这是审查可展开的地基；"不编造 Tauri API"在三报告中执行到位。
2. **历史事故显式继承**：多实例红线、启动门控 `DSH_HUB_LAUNCHED`、插件身份四重相等、scoped 装配、rc.10-13 全新环境首启教训、踩坑 #32/#33 全部进验收表与门禁（落地 §9、T5.5），迁移不是"重写当新人"。
3. **选型方向正确**：方案 B（HTTP/SSE 桥）为主轨在安全面优于方案 A（不引入 remote-domain IPC、client 可脱离 Tauri 调试），且保留"窗口级命令走 Node→Rust 通道"的隔离；`DesktopShellHandle` 接口与 `mg:*` 协议冻结（P1）为 client half 零改动和回退留了正确切口。
4. **数据安全有骨架**：X3 配置备份（config/window-state/pins → `backup/v<from>/`）+ 升级前置挂钩 + research-D 对 NSIS 卸载/降级语义的梳理，方向正确；版本单一来源（tauri.conf.json 引用 package.json）与 Cargo.lock 无漂移门禁把 npm 时代"registry 直查不可信"的教训平移到了 GitHub Release 直查 + `tauri signer verify`。
5. **风险管理的"冻结"意识**：M4 前插件层冻结改动、桥协议契约冻结、dev-v1 永久冻结——用流程纪律抵消接口漂移，是可行的迁移风险管理姿势。

---

## 三、结论

- **总体判断**：三报告工程质量高，风险清单主体覆盖完整，"可行性评级高"在工程可行性层面成立；**但按风险与安全审查角度，存在 1 个阻断级设计矛盾（A1）与 7 个高危缺口（A2/A3/B1/B2/C1/D1/E1），均不在"不可行"范畴，而是"方案未收敛/任务未落位"**。
- **阻断项**：A1（多实例检测手段替换）与铁律 4 直接冲突、有已发生的会话损坏先例，必须在 **M4 动工前**（最好在迁移方案定稿时）重新设计；否则落地 §9 验收 #9 必失败。
- **需在对应里程碑前补任务**：M4 前——B1（capabilities 收紧）、B2（桥端点鉴权）、C1（会话兼容验证）、A2/D2（回退线探针）；M5 前——A3（Node 下载校验）、D1（回退手册）、E1（密钥生命周期）、A4/A5/A6/B3/B4/C2/C3/E2。
- **审查结论**：**有条件通过（需修订）**。建议三报告在下一轮（审查轮 2）前：① 把 A1 的共存检测改回"进程枚举 + 探活"双通道并加硬验收；② 新增 X4 子任务"桥端点鉴权 + capabilities 终审 + deep-link 输入校验"；③ 补"会话兼容 + 回退手册 + Node 供应链校验"三项验收；④ 风险清单补 A3/A4/A5/B4/C1/E1 六项遗漏。修订后安全设计与回退承诺方与"可行性高"评级匹配。
