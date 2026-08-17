# research-D — 构建/发布/安装链路迁移调研（npm → Tauri 2.x）

> 调研子代理 D 产出。范围：当前 `@marecgents/dsh-hub`（npm 全局包）的**构建 → 打包 → 发布 → 安装 → 运行 → 升级**全链路逐环节梳理，及其到 Tauri 时代（原生安装器 + 二进制 + updater）的映射、门禁继承、安装体验差异。
> 依据：`deepseek-harness-hub` 仓库（package.json / scripts/* / bin/* / AGENTS.md / tsdown.config.ts）+ `REFERENCE.md` 条目 9（spacedrive）/ 10（surrealist）/ 11（tauri 官方）的实际文件内容。
> 日期：2026-08-17（P1 阶段）。

---

## 0. 一句话结论

当前链路是「**JS 包发布 + 运行时自装配**」模型：`npm publish` 只发布 JS 产物，安装/装配/自愈全部推迟到**用户机器上的启动时**（postinstall 建快捷方式 + launcher 建 junction + 每次启动 relink）。Tauri 迁移后是「**编译期打包 + 安装器固化**」模型：Rust 壳与全部资产在构建期打进安装器，装配/自愈从「运行时 Node 逻辑」改为「Rust 壳编排 + 安装器脚本」。**最大差异：安装期职责前移**（快捷方式/注册表/WebView2 由安装器负责，不再靠 postinstall），**最大新设计点：dsh 运行时（Node 进程）由谁提供**——这是唯一的「运行时依赖」无法被安装器固化。

---

## 1. 当前链路逐环节清单（基于实际文件）

### 1.1 构建（build）
| 步骤 | 命令/文件 | 事实依据 |
|---|---|---|
| host 编译 | `npm run build` = `tsc` → `lib/` | package.json L38 |
| client 编译 | `npm run build:client` = `node scripts/build-client.mjs`（tsdown + SDK junction；`npm install` 会清 junction，须重跑） | package.json L39；AGENTS.md §5 |
| 产物形态 | `lib/index.js`（host）+ `lib/client.js`（browser bundle，`__ModuleLoader__.load({id:'@marecgents/dsh-hub'})` banner，平台模块 external） | tsdown.config.ts L11/L46；package.json L7 |
| 打包前置 | `prepack` = build + build:client（每次 pack/publish 重建，保证 tarball 与源码一致） | package.json L41 |

### 1.2 打包（pack）
- `npm pack` → 触发 prepack → tarball `marecgents-dsh-hub-<ver>.tgz`。
- `files` 白名单：`lib / src / bin / scripts / assets / cordis.patch.yml / README.md`（package.json L25-33）。
- `bin` 映射：`dsh-hub` → `bin/dsh-hub.mjs`（命令 shim；package.json L34-36）。
- 门禁：`scripts/verify-release.mjs` 必须先 ALL PASS（见 §3）。

### 1.3 发布（publish）—— AGENTS.md §5.2/5.3 铁律
```
dev-v2 开发 → PR → main（admin merge）→ main 上：
  npm version 0.0.1-rc.<N+1>            # 版本不可覆盖，每次升版
  npm run build && npm run build:client
  npm publish --access public --tag rc --registry=https://registry.npmjs.org/
  npm dist-tag add @marecgents/dsh-hub@<v> latest --registry=...   # latest == rc == 当前版
  （Invoke-RestMethod .../dist-tags）校验；npm view 有镜像缓存不可信
  git push main + tag v0.0.1-rc.<N> → dev-v2 ff 回灌；dev-v1 冻结
```
- 关键约束：registry 显式官方（本机默认华为镜像）；`--allow-scripts=@marecgents/dsh-hub,koffi` 防 npm 安全机制拦 postinstall/koffi 原生构建；loader entry **必须 scoped 名** `@marecgents/dsh-hub`（bare 名 = 全新环境首启 `ERR_MODULE_NOT_FOUND`，rc.10–rc.13 事故，踩坑记录 #33）。
- 本地等价验证：`npm run install:local`（= `npm pack` → `npm i -g <tgz> --allow-scripts` → 校验版本/shim/快捷方式；scripts/install-local.mjs）。

### 1.4 安装（install）
| 步骤 | 事实依据 |
|---|---|
| `npm i -g @marecgents/dsh-hub --allow-scripts=@marecgents/dsh-hub,koffi` → 落 `npm prefix -g`/node_modules/@marecgents/dsh-hub + `dsh-hub`/`.cmd`/`.ps1` shim | AGENTS.md §5.5/5.6 |
| postinstall：① dsh CLI 检测（DSH_CMD → PATH → `npm prefix -g`），缺失则 `npm install -g @deepseek-ai/dsh`；② pnpm 同样检测安装；③ Windows 建桌面快捷方式 `DeepSeek Harness.lnk` → `wscript.exe bin/launcher.vbs`（隐藏控制台，UTF-16LE BOM） | scripts/postinstall.mjs L30-58/L101-152/L154-233 |
| postuninstall：删桌面快捷方式（`launcher.vbs` 留包内，防悬空链接） | scripts/postuninstall.mjs |

### 1.5 运行（run）—— bin/launcher.mjs（每步见代码）
1. `resetLog`（每次启动清空 `dsh.log`，防膨胀）L43-50
2. `ensureHubBinaries`：复制 node.exe → `dsh-hub.exe` / `dsh-hub-guard.exe`，rcedit 打图标+VERSIONINFO，缓存 `$DSH_HOME/dsh-hub/bin/` + stamp（node 构建+包版本，升级自动重建）bin/hub-exe.mjs
3. `relaunchAsGuard`：re-exec 为 guard.exe（Task Manager 进程身份）；失败回退纯 node L267
4. `acquireLock`（PID 锁 `$DSH_HOME/dsh-hub/launcher.lock`，单实例权威守卫，随机端口无法 netstat 判定）L277-282
5. `clearQuitMarker` L286
6. `DSH_HUB_ASSEMBLE_ONLY=1` 诊断模式：只装配不启动 L291-296
7. `enforceSingleInstance`：netstat+CIM 探测已有 dsh；默认拒绝共存（`allowMultipleInstances=false`），勾选后仍需是/否确认 L301-304
8. `findDsh`（PATH + npm prefix；缺失自动 `npm i -g @deepseek-ai/dsh`）L309-323
9. `ensureBundleInstalled`：web profile 不存在则按模板建（bundles=`@deepseek-ai/dsh-base`,`@deepseek-ai/dsh-web-app`）；注册 scoped 名入 `dsh.profile.bundles` + **junction** `profiles/web/node_modules/@marecgents/dsh-hub` → 包根；**每次启动自愈**（junction 指向非当前包根即 relink）；幂等清理 bare `dsh-hub` 遗留（防 duplicate loader entry id）L107-228
10. boot：优先 `dsh-hub.exe <dsh JS entry> web --port 0`（`DSH_HUB_LAUNCHED=1` 门控插件激活），失败回退 `cmd /c dsh web --port 0` L350-365
11. 崩溃处理：stdout/stderr 写 dsh.log；退出时 **quit.marker 存在 → 永不重启**；exit 0 → 正常退出；否则重启 ≤3 次（1.2s 间隔），超限弹「连续异常退出」L376-407

### 1.6 升级（upgrade）
- `npm i -g @marecgents/dsh-hub --allow-scripts=...`（同安装命令）→ postinstall 重建快捷方式；桌面壳运行中会 `EBUSY`，先退出。
- 版本更新对 profile 的影响：**launcher 每次启动自愈 relink junction** 指向新全局包 → 下次打开即新版本（AGENTS.md §5.5「两步缺一不可」）。
- 开发隔离铁律：运行 profile junction 必须指向 npm 全局包，禁止指向 dev 仓库（rc.10–13 事故根因）。

### 1.7 链路本质
- **安装 = JS 拷贝 + 快捷方式**；**装配 = 启动时 Node 逻辑**（junction 是「零依赖安装」的替代品，绕过 pnpm/`dsh plugin`）。
- 无签名、无注册表、无系统级集成；`dsh` 本体是**外部运行时依赖**（postinstall/launcher 兜底自动全局安装 `@deepseek-ai/dsh`）。

---

## 2. Tauri 对应映射（基于 spacedrive / surrealist / tauri 官方源码）

### 2.1 构建：`tsc+tsdown` → `cargo build` + tauri-bundler
- `tauri build` 流程（tauri-cli `build.rs` L92-146）：校验 identifier（`com.tauri.dev` 拒绝、仅 alnum/-/.；L172-187）→ 跑 `build.beforeBuildCommand`（前端构建进 frontendDist；spacedrive 用 `bun run build:daemon:release && bun run build`）→ cargo build 出主二进制 → `bundle`（tauri-bundler）。
- 平台配置合并：`tauri.conf.json` + `tauri.windows.conf.json`（spacedrive `tauri.windows.conf.json` 只覆写 `bundle.targets=["nsis","app"]` + resources）——对应 dsh-hub 的 Windows-only 现状。
- 双 half 保留：插件层（client + config/workspace API + cordis.patch.yml）**原样保留**，仍由 dsh web 装配；壳层（desktop.ts + Windows 专属 services）整体重写为 Rust（AGENTS.md §1 隔离边界即为迁移切口）。
- `beforeBuildCommand` 对应现 `prepack`：把「重建前端资产」从 npm 生命周期挪到 tauri 生命周期。

### 2.2 打包：`npm pack` → tauri-bundler 安装器产物
| PackageType（tauri-bundler settings.rs L24-45） | 产物 | 默认平台 |
|---|---|---|
| WindowsMsi / Nsis | `.msi`（WiX）/ `.exe`（NSIS） | Windows（两者都出，可用 `--bundles` 挑） |
| MacOsBundle / Dmg | `.app` / `.dmg`（dmg 依赖 app，priority 排序） | macOS |
| Deb / Rpm / AppImage | `.deb` / `.rpm` / `.AppImage` | Linux |
| Updater | `.zip`（win，装包+bin）/ `.tar.gz`（mac .app、linux AppImage） | `createUpdaterArtifacts: true` 时追加 |

- **externalBin（sidecar 打包）**：`bundle.externalBin` 声明伴生二进制，命名必须带 target triple（`sd-daemon-x86_64-pc-windows-msvc.exe`）；打包时 `copy_binaries` 剥掉 triple 后缀落到安装器（settings.rs L1196-1216；spacedrive 配置 `"../../../target/release/sd-daemon"` + main.rs `find_daemon_binary` 先查 triple 名再查裸名）。→ **dsh-hub 的 sidecar 候选：node 运行时（若决定内置）或装配 helper**；若仍要求全局 Node，则无 sidecar。
- 资源固化：`bundle.resources`（spacedrive 塞 `gen/**/*`、DLL）→ 取代 npm `files` 白名单。
- 自定义安装器：NSIS 支持自定义模板（surrealist `res/installer.nsi` 是官方模板 fork：桌面快捷方式、开始菜单、AppUserModelId、卸载时「删除应用数据」复选框、WebView2 三段模式、`/P /NS /UPDATE /R` 参数、注册表 Uninstall 键）。→ 现 postinstall 的快捷方式/PowerShell 逻辑全部由 NSIS 模板承担。

### 2.3 发布：`npm publish` → GitHub Release + updater 签名
- 现 `npm publish --tag rc + dist-tag` → **`gh release create v<ver>` + 上传各平台安装器 + `.sig`（updater 签名）+ `latest.json` 清单**（spacedrive AUTOUPDATER.md L223-246 的 tauri-action 一键模式）。
- 签名：`tauri signer generate` 生成密钥对；`TAURI_SIGNING_PRIVATE_KEY`（或 `_PATH`/`_PASSWORD`）env 在构建时给安装器签名；`tauri.conf.json plugins.updater.pubkey` 放公钥（spacedrive/surrealist 配置实测）。Windows 代码签名走 `signtool`（`certificateThumbprint`/`sign_command`，settings.rs L554-617）；macOS 走 `APPLE_CERTIFICATE`+`APPLE_ID/_PASSWORD/_TEAM_ID`（或 API key）notarization（ENVIRONMENT_VARIABLES.md L20-42）。
- 更新端点：GitHub Release 的 `latest.json`，JSON 格式 `{version, notes, pub_date, platforms: {"windows-x86_64": {signature, url}, ...}}`（AUTOUPDATER.md L79-104）；前端 `check()` → `downloadAndInstall(progress)` → `relaunch()`（surrealist `src/hooks/updater.tsx`；spacedrive 亦同）。Windows 更新 = 装包 zip 热替换 bin + relaunch（updater_bundle.rs L117-120 注释）。
- 版本单一来源：surrealist `tauri.conf.json version: "../package.json"`（Cargo.toml 恒 `0.0.0` + `publish=false`）；spacedrive 则 Cargo.toml 与 tauri.conf.json 手写同值。→ 推荐 surrealist 模式（npm/前端版本单一来源，cargo 版本无关化）。

### 2.4 安装：`npm i -g + postinstall` → 原生安装器（NSIS/MSI/dmg/AppImage/deb/rpm）
- 快捷方式/开始菜单/卸载项/文件关联/深链注册全由安装器（NSIS 模板或 WiX）完成，**不再需要 postinstall**。
- WebView2：`windows.webviewInstallMode: embedBootstrapper`（spacedrive 配置）把 bootstrapper 内嵌进安装器静默装（对应现 webviewjs 的 WebView2 依赖；surrealist NSIS 模板有 downloadBootstrapper/embedBootstrapper/offlineInstaller 三态）。
- 卸载清理：NSIS 模板自带「删除应用数据」复选框（删 `$APPDATA/<bundleId>`；surrealist 额外兼容旧路径 `$APPDATA\SurrealDB\Surrealist`）→ 对应现 `postuninstall` 只删快捷方式的弱清理，且补上 profile/会话数据清理选项。

### 2.5 运行：`launcher.mjs` → Rust 壳编排
| 现 launcher 职责 | Tauri 对应（参考实现） |
|---|---|
| `acquireLock` + `enforceSingleInstance`（PID 锁 + netstat 探测） | `tauri-plugin-single-instance`（surrealist main.rs L52-66：第二实例 args → 事件 → 聚焦窗口）；多实例共存拦截保留为自定义检查 |
| `ensureBundleInstalled`（junction 装配 + 自愈） | **Rust 壳启动时执行**：写 profile manifest + junction。⚠️ Rust `std::os::windows::fs::symlink_dir` 建的是目录 symlink 而非 junction，junction 需 `junction` crate 或 `mklink /J` 子进程——**自愈语义必须在 Rust 侧重写**（每次启动比对目标+relink，等价 launcher L184-203） |
| `spawn dsh web --port 0` + `DSH_HUB_LAUNCHED=1` | Rust `std::process::Command` spawn（surrealist `database.rs` 的 `surreal start` 托管范式：stderr 管道逐行 emit 回前端、`RunEvent::Exit` kill；spacedrive `start_daemon` + `is_daemon_running` socket 探活）；**env 门控必须由 Rust spawn 设置**（`DSH_HUB_LAUNCHED` 语义保留，铁律 §0.3） |
| 崩溃重启 ≤3 次 + quit.marker 判别 | Rust：spawn 的 child `wait`/exit status + 重启计数 + 退避；quit.marker 文件语义原样保留（托盘退出先写 marker → 永不重启，bin/AGENTS.md 铁律 3） |
| `ensureHubBinaries` + rcedit（进程身份） | **天然消失**：Rust 壳本身就是 `dsh-hub.exe`，图标/版本信息由 `tauri.conf.json bundle.icon` + `productName` 编译期固化（不再运行时 copy node.exe + rcedit） |
| `relaunchAsGuard`（看门狗身份） | 消失：主进程即壳；崩溃重启是 Rust 壳内部逻辑 |
| tray/theme/window-state/screen | `tauri-plugin-tray` / 官方 `window-state` / DWM 暗色（spacedrive windows.rs）/ 等（REFERENCE 条目 9/10/11 已覆盖） |
| 托盘退出写 quit.marker + `process.exit(0)` | Rust `RunEvent::ExitRequested { api, code } if code.is_none() => api.prevent_exit()` 保托盘常驻；`CloseRequested` → `prevent_close` + `destroy`（examples/api lib.rs L167-186） |

### 2.6 升级：`npm i -g + junction 自愈` → updater 闭环
- `tauri-plugin-updater`：检查 → 下载 → 装 → relaunch（带进度回调）；Windows 侧 `relaunch()` 后新版本生效。
- **junction 自愈不再需要**：安装器/updater 直接覆盖安装目录里的 exe + resources；profile 装配自愈仍在 Rust 启动时做（但目标从「npm 全局包」变为「安装目录内嵌资产」）。
- 降级策略：NSIS 默认禁降级（`allow_downgrades`，settings.rs L586-591；surrealist NSIS 模板 L249-260 的降级禁用 UI）；surrealist `downgrade.tsx` 大版本升级前 `backup_config`（config.rs 版本化备份/恢复）。

---

## 3. 门禁与规范如何继承（verify-release P1–P5 → Tauri）

| 现门禁（verify-release.mjs） | Tauri 时代对应 |
|---|---|
| **P1 插件身份四重相等**（package.json name == tsdown PLUGIN_ID == cordis.patch.yml insert.name == web profile bundles） | 拆分两层：① **插件层原样保留**，四重相等检查继续有效（装配目标仍是 dsh profile）；② **壳层新增**：`tauri.conf.json identifier`（com.marecgents.dsh-hub 类，仅 alnum/-/.，非 `com.tauri.dev`）+ `productName` == 应用显示名 == 安装器 productName（NSIS/WiX）。两个检查都进新 verify 脚本 |
| **P2 loader entry 必须 scoped** | 插件层保留（`@marecgents/dsh-hub` 仍作为 dsh bundle 名）。若 Tauri 壳内置装配，Rust 侧只认 scoped 名 + 拒绝 bare，等价语义 |
| **P3 lib 产物零漂移**（git status 无未提交 lib/launcher.vbs） | `src-tauri/gen/**` + `Cargo.lock` + 前端 dist 无漂移；发布前 `cargo build --release` 复现性检查；`frontendDist` 内不含 `node_modules/src-tauri`（tauri-cli build.rs L228-256 已内置检查） |
| **P4 干净安装 → 首启装配冒烟**（pack → 隔离 `npm i -g --prefix` → `DSH_HOME` 隔离 + `DSH_HUB_ASSEMBLE_ONLY=1` 跑 launcher → 断言 profile scoped 装配 + junction 指向包根） | 安装器冒烟：干净 VM/隔离目录装 NSIS/MSI（或 AppImage/dmg）→ 启动 → 断言：profile 装配成功、`DSH_HUB_LAUNCHED=1` 生效（窗口出现）、WebView2 就绪、quit.marker 语义、崩溃重启计数。**rc.10-13 事故的教训（全新环境测不出）直接映射到「干净机器装安装器」** |
| **P5 dist-tags 直查 registry**（latest == rc == 版本；npm view 不可信） | GitHub Release 直查 API：`latest` release tag == `tauri.conf.json version` == `Cargo.toml`（或 package.json）版本；`latest.json` 端点 200 + schema 合法 + 各平台 `signature` 可被 pubkey 验证（`tauri signer verify`）；updater 端点预演 |
| **发布铁律 §5.2**：registry 显式官方 / 版本不可覆盖 / main+tag+回灌 / 真机验证 | 映射：updater 端点与 Release 资产必须一致（防「端点指旧版」）；Git tag 不可覆盖（`gh release` 同 tag 拒绝）；发布流程改为 cargo/tauri 构建 + `gh release`，分支策略（dev-v2→main→回灌）可原样保留；真机验证 = 测试机装安装器首启冒烟 |
| 新增（现无） | `cargo clippy` / `cargo test` / `cargo fmt --check` 门禁（AGENTS.md §4 代码质量规范扩展到 Rust）；macOS notarization 状态、Windows signtool 证书有效性、updater 私钥存在性（CI secret 检查） |

**AGENTS.md §5 改写要点**：
- `npm version 0.0.1-rc.<N+1>` → 版本单一来源（建议 surrealist 式：`tauri.conf.json version = "../package.json"`，只 bump package.json；正式版起用 semver 如 `0.1.0`，弃 rc 后缀或保留 pre-release tag）。
- tag 策略：`v0.0.1-rc.<N>` → `v<semver>` 打在发布 commit；`gh release create v<ver> <artifacts> --generate-notes`（或 tauri-action 全自动）。
- `npm publish` + dist-tag 段删除；替换为「构建产物清单 + Release 上传 + latest.json + 签名校验」段。
- `install:local` 等价物：`cargo tauri build --bundles nsis`（本地构建安装器 → 手动装）或保留一个小 npm 包仅做 `dsh-hub` CLI 兼容（见 §4）。
- §5.4 首启崩溃教训改写为「全新机器安装器首启冒烟」作为发布前置。
- §5.5 开发/运行隔离：junction 目标从「npm 全局包」变「安装目录」；开发仓库不得指向运行安装。

---

## 4. 安装体验差异（npm 全局包 vs 原生安装器）

| 维度 | npm 全局包（现状） | Tauri 安装器（目标） |
|---|---|---|
| 前置依赖 | 用户必须装 Node ≥24 + npm；`dsh` CLI 缺失时 postinstall/launcher 自动 `npm i -g @deepseek-ai/dsh` | Windows 侧 WebView2 由安装器 embedBootstrapper 兜底；**Node 依赖策略是核心决策**（见下） |
| PATH 命令 `dsh-hub` | `dsh-hub`/`.cmd`/`.ps1` shim 自动进 PATH，终端可启桌面壳 | 安装器默认不建 PATH 命令（NSIS 默认只建开始菜单/桌面快捷方式）；若需保留 `dsh-hub` 终端命令，需 NSIS 模板加 PATH 注册或写一个启动器 exe 到 Program Files；或保留极简 npm shim 包 |
| 桌面快捷方式 | postinstall PowerShell 建（wscript → vbs → node launcher；每次 npm i 重建） | 安装器建（NSIS `CreateOrUpdateDesktopShortcut` + AppUserModelId + 开始菜单），卸载自动删；不再依赖 wscript/隐藏控制台技巧 |
| 卸载 | `npm uninstall -g` 仅删快捷方式，profile/会话数据残留 | 卸载器完整清理：快捷方式/注册表 Uninstall 键/（可选勾选）`$APPDATA` 应用数据 |
| `$DSH_HOME` 语义 | env 覆盖或 `~/.dsh`（launcher/hub-exe/state-store 三处同源） | **保留**：Rust 壳读 `DSH_HOME` env 或默认 `dirs::data_dir()`（可保持 `~/.dsh` 兼容既有 profile/会话数据，避免迁移丢数据） |
| profile 装配谁做 | Node launcher 每次启动自愈 junction | **Rust 壳**：启动时写 manifest + junction（junction 需 Rust 侧专门处理，见 §2.5 ⚠️）+ 设 `DSH_HUB_LAUNCHED=1` 再 spawn dsh；自愈逻辑保留 |
| 崩溃重启/单实例 | node launcher PID 锁 + netstat + ≤3 次重启 | `tauri-plugin-single-instance` + Rust child 管理 + quit.marker（语义不变） |
| 升级 | `npm i -g` 覆盖 + junction 自愈；EBUSY 需先退出 | updater 闭环（下载 → 安装 → relaunch），用户无感；安装器覆盖安装亦可 |
| 签名/信任 | 无签名（npm 生态信任链） | Windows signtool 代码签名（SmartScreen 白名单）、macOS notarization + entitlements（spacedrive Entitlements.plist 实测）、updater 签名（防中间人） |
| 进程身份 | 运行时 copy node.exe + rcedit 造假 exe（hub-exe.mjs） | 编译期真 exe，天然正确 |

### 4.1 核心决策点：dsh 运行时（Node 进程）由谁提供
dsh 本体是 Node 应用（`dsh web` 由 `@deepseek-ai/dsh` CLI 启动），Tauri 壳只是 WebView 宿主。技术路线文档已定「随机端口启动 dsh → Tauri sidecar 或外部进程管理」。三个选项：
1. **A：保持全局 npm dsh（推荐先行）**——Tauri 壳启动时探测 `dsh` CLI（等价现 findDsh），缺失提示/引导安装。壳小（~10MB 目标达成），dsh 生态零改动；但用户仍需 Node（体验差异最小化，与现状一致）。
2. **B：sidecar 内置 Node 运行时**——`externalBin` 打进 node.exe + dsh 全局布局（spacedrive 打包 sd-daemon 的范式；命名 `node-x86_64-pc-windows-msvc.exe`），壳全自包含、无需任何前置；代价是安装体积 +~50-100MB、dsh 升级要随壳发版。
3. **C：sidecar 内置装配 helper（小脚本/binary）**——只打包「装配 + 拉起 dsh web」的 helper，dsh 本体仍走全局 npm；折中但引入两个运行时的复杂度。

> 建议：正式版先走 A（Tauri 壳 + 全局 dsh），把 B 作为「免 Node 安装」的后续增强（sidecar 的 target-triple 命名与 `find_daemon_binary` 式查找逻辑可参照 spacedrive 直接复用）。

### 4.2 其他新设计点
- **updater 密钥管理**：`tauri signer generate` 私钥入 CI secret（`TAURI_SIGNING_PRIVATE_KEY`），公钥进 tauri.conf.json；对应现「registry 直查」的发布校验段。
- **MSI vs NSIS**：NSIS（per-user、embedBootstrapper、无管理员）作默认；MSI 留给企业场景；`wix.upgrade_code` 一旦发布**不可变**（settings.rs L420-428），productName 变更前先固化。
- **deep-link**（surrealist `surrealist://`）可选：未来「从浏览器/CLI 唤起桌面壳」的通道，安装器自动注册 scheme。
- **launcher 语义保留清单**（bin/AGENTS.md 铁律）：`--port 0`、多实例拦截、quit.marker、`DSH_HUB_LAUNCHED` 门控、scoped 装配幂等——全部要原样迁入 Rust 壳，实现替换、语义保留。

---

## 5. 附：参考仓库关键文件索引（供落地方案引用）

| 文件 | 引用点 |
|---|---|
| spacedrive `apps/tauri/src-tauri/tauri.conf.json` | externalBin / createUpdaterArtifacts / embedBootstrapper / updater pubkey+endpoints / 平台合并配置 |
| spacedrive `apps/tauri/src-tauri/tauri.windows.conf.json` | 平台级 bundle.targets 覆写（nsis/app） |
| spacedrive `apps/tauri/src-tauri/src/main.rs` | daemon 生命周期：spawn/探活/服务安装（schtasks/LaunchAgent/systemd）、`find_daemon_binary` triple 名查找 |
| spacedrive `apps/tauri/AUTOUPDATER.md` | signer 生成、TAURI_SIGNING_PRIVATE_KEY、.sig 产物、latest.json schema、tauri-action |
| surrealist `src-tauri/tauri.conf.json` | version 引用 package.json、targets 全平台、NSIS 自定义模板、deep-link、updater |
| surrealist `src-tauri/res/installer.nsi` | 完整 NSIS 模板：快捷方式/开始菜单/卸载删数据/WebView2/注册表/升级降级语义 |
| surrealist `src-tauri/src/main.rs` | single-instance 三合一（深链/二次启动传参）、RunEvent::Exit kill 子进程、日志 folder target |
| surrealist `src/hooks/updater.tsx` + `src-tauri/src/config.rs` | check→downloadAndInstall→relaunch；config 版本化备份 |
| tauri `crates/tauri-bundler/src/bundle/settings.rs` | PackageType 全集、WindowsSettings（signtool/thumbprint/sign_command）、MacOsSettings（notarization/entitlements）、WixSettings（upgrade_code）、NsisSettings（hooks/install_mode）、external_bin 命名约定 |
| tauri `crates/tauri-bundler/src/bundle/updater_bundle.rs` | 更新产物形态（zip/tar.gz、Windows 热替换 bin） |
| tauri `crates/tauri-cli/src/build.rs` | `tauri build` 管线、identifier 校验、beforeBuildCommand |
| tauri `crates/tauri-cli/ENVIRONMENT_VARIABLES.md` | 签名/notarization 全部 env、TAURI_ENV_* hook env |
| tauri `examples/api/src-tauri/src/lib.rs` | ExitRequested prevent_exit（托盘常驻）/ CloseRequested 拦截 |
