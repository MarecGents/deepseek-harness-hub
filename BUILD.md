# BUILD.md — dsh-hub 一键打包指南（Tauri 2.x · Windows · dev-v2）

> **目标**：任何 clone 本仓库的人，只要电脑上装有打包依赖工具（安装位置因人而异），就能按本文完成打包。
> 所有工具一律**动态检测、不硬编码路径**；推荐用一键脚本 `npm run build:installer`（见 §4）。
>
> 产物：NSIS 安装器 `build/<version>/DeepSeek Harness Hub_<version>_x64-setup.exe`
> （完整链路：`npm install` → `npm run build` → `npm run build:client` → `npm run tauri:build`（=`cargo tauri build`）→ 产物复制 + SHA256 校验）。
>
> **安装/卸载体验（踩坑 #67 后）**：安装期 bootstrap（私有 Node 运行时下载）异步执行，`DEP:` 进度行
> 实时镜像到安装器详情视图（ps1 `-LogPath` 落日志 + 钩子 700ms 轮询）；卸载走 `PREUNINSTALL`
> 快速通道（已知大目录一次性 `RMDir /r`，模板逐文件 Delete 变 no-op），并 best-effort 清理
> profile 的 bundles 条目与悬空 junction（防卸载后 `dsh web` 崩溃）。
> **自包含（踩坑 #63 后）**：安装器经 `tauri.conf.json` `bundle.resources` 携带**全部运行时内容**——
> Rust 壳 exe + 完整插件包（`../package.json`、`../cordis.patch.yml`、`../lib/**/*`、`../assets/**/*`、
> `../bin/**/*` → 安装到 `$INSTDIR\_up_\`）+ 桌面图标 .ico（`icons/*.ico` → `$INSTDIR\icons\`）+ 装配脚本。
> 首启 junction 直指 `_up_`（node.rs 三级优先：`_up_` → dsh-hub-win npm 副本 → dev 仓库根），
> **插件功能与壳永远同版本**，不再依赖 npm registry 上的插件版本。

---

## 0. 全流程速览

```
npm install            # 依赖（注意：会清掉 SDK junction，装完必须重跑 build:client，踩坑 #19）
npm run build          # host 编译（tsc → lib/）
npm run build:client   # client bundle（tsdown + SDK junction → lib/client.js）
npm run tauri:build    # cargo tauri build → release + NSIS（MSVC 需在 vcvars64.bat 环境）
# 产物复制到 build/<version>/ 并校验 SHA256（踩坑 #56：复制可能静默失败）
```

**一键完成上述全部步骤**：`npm run build:installer`（工具链检测 → 前置构建 → 打包 → 复制校验，见 §4）。

---

## 1. 前置依赖清单（含"为什么"）

| # | 依赖 | 版本要求 | 为什么需要 | 谁负责 |
|---|------|---------|-----------|--------|
| 1 | **Node.js（含 npm）** | **≥ 24**（`package.json` engines 强制） | host 插件层 `tsc` 构建（`npm run build`）、client bundle（`npm run build:client`）、`tauri` CLI 经 npm 调用 | 手动安装：https://nodejs.org |
| 2 | **Rust（rustup 安装）** | stable（自动） | 编译 Rust 壳（src-tauri/）。`src-tauri/rust-toolchain.toml` **固定 stable MSVC**，任何人 clone 后跑 cargo 命令 rustup 会自动装 `x86_64-pc-windows-msvc` target | 手动安装：https://rustup.rs |
| 3 | **VS Build Tools（MSVC C++ 工具链）** | 含 `VC.Tools.x86.x64` 组件 | MSVC 链接器 `link.exe` 需 `LIB`/`INCLUDE` 环境（`vcvars64.bat`）；**MSVC 下 WebView2Loader.dll 静态链接**，规避踩坑 #49；`webview2-com-sys` 无需额外配置 | VS Installer →「使用 C++ 的桌面开发」工作负载 |
| 3′ | **MinGW-w64 gcc（GNU 备选）** | 任一近期版本 | 仅当 MSVC 不可用时：GNU 工具链直接打包；`src-tauri/.cargo/config.toml` 已带 `--exclude-all-symbols`（踩坑 #40，mingw ld 导出序号溢出） | 手动安装并加入 PATH（如 https://winlibs.com） |
| 4 | **NSIS** | 自动 | NSIS 安装器制作；tauri CLI 首次打包**自动下载**，无需手装 | tauri CLI（自动） |
| 5 | **WebView2 Runtime** | 自动 | 渲染引擎；`tauri.conf.json` 配 `embedBootstrapper`，安装器自动携带引导，无需手装 | 安装器（自动） |

> 本机参考（仅作示例，脚本/文档不依赖这些路径）：Node `D:\Tools\Environment\NodeJs`、rustup/cargo `D:\Tools\Environment\rust`、VS `D:\Tools\Microsoft Visual Studio\18\Community`（`vcvars64.bat` 在 `VC\Auxiliary\Build\` 下）。

---

## 2. 工具链检测方法

以下命令用于自查；一键脚本会自动执行相同检测并以表格报告（§4）。

```bat
:: Node / npm
node -v
npm -v

:: Rust / 当前工具链（应含 x86_64-pc-windows-msvc；仓库 rust-toolchain.toml 已固定 stable MSVC）
cargo --version
rustup show
rustup show active-toolchain

:: MSVC（推荐）：vswhere 找装有 C++ 工具链的 VS 实例，输出 installationPath
"C:\Program Files (x86)\Microsoft Visual Studio\Installer\vswhere.exe" -latest -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath
::   → vcvars64.bat = <上一步输出>\VC\Auxiliary\Build\vcvars64.bat（存在才说明 MSVC 就绪）

:: GNU（备选）：MinGW gcc 在 PATH
gcc --version
```

判定：**vcvars64.bat 存在 → MSVC 模式（推荐）**；不存在但有 gcc → GNU 模式；两者都没有 → 无法打包，按 §1 装其一。

---

## 3. 手工打包步骤（可复制命令）

```bat
:: ① 安装依赖（首次较慢；npm install 会清掉 SDK junction，装完必须重跑 build:client —— 踩坑 #19）
npm install

:: ② host 编译（tsc → lib/）
npm run build

:: ③ client bundle（tsdown + SDK junction → lib/client.js；依赖全局 @deepseek-ai/dsh CLI 的 SDK 树）
npm run build:client

:: ④a MSVC（推荐）：在 vcvars64.bat 环境内打包（link.exe + LIB/INCLUDE 必需）
::     把 <vcvars64.bat> 换成 §2 检测到的路径
cmd /c "call "<vcvars64.bat>" >nul 2>&1 && npm run tauri:build"

:: ④b GNU（备选）：直接打包
::     前提：rustup 工具链已切到 gnu（rustup toolchain install stable-x86_64-pc-windows-gnu，
::     并以 RUSTUP_TOOLCHAIN=stable-x86_64-pc-windows-gnu 或 rustup default 生效）+ MinGW gcc 在 PATH
npm run tauri:build

:: ⑤ 产物复制 + SHA256 校验（踩坑 #56：复制可能静默失败，必须校验 hash）
set VERSION=0.0.2-rc.9
mkdir build\%VERSION% 2>nul
copy "src-tauri\target\release\bundle\nsis\DeepSeek Harness Hub_%VERSION%_x64-setup.exe" "build\%VERSION%\" && ^
certutil -hashfile "src-tauri\target\release\bundle\nsis\DeepSeek Harness Hub_%VERSION%_x64-setup.exe" SHA256 && ^
certutil -hashfile "build\%VERSION%\DeepSeek Harness Hub_%VERSION%_x64-setup.exe" SHA256
:: 两个 hash 必须一致；不一致 → 删掉 build 里的目标再复制一次
```

> 版本号约定：`package.json` version（当前 `0.0.2-rc.9`）与 `src-tauri/tauri.conf.json` version **必须一致**——NSIS 产物名和 `build/<version>/` 目录都以它命名；`src-tauri/Cargo.toml` 恒为 `0.0.0`（Tauri 模板约定，勿改）。

---

## 4. 一键打包（推荐）

```bat
npm run build:installer            :: 完整流程：检测 → 前置构建 → 打包 → 复制校验 → 总结
npm run build:installer -- --dry-run  :: 只检测工具链并打印执行计划（不构建、不复制）
```

脚本（`scripts/build-installer.mjs`，仅依赖 Node 内置模块）自动完成：

1. **工具链检测（位置无关，只报告）**：Node（`process.execPath`）/ npm（win32 用 `npm.cmd`）/ cargo（`CARGO_HOME\bin\cargo` → `rustup which cargo` → `where cargo`）/ rustup（同法 + `rustup show active-toolchain`）/ MSVC（vswhere 常见路径 → `-requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64` → `VC\Auxiliary\Build\vcvars64.bat`）/ GNU gcc（`gcc --version`）；缺失组件打印安装指引。vswhere 找到 VS 但 vcvars64.bat 缺失 → 警告并回退 GNU。
2. **前置检查**：`node_modules` 缺失 → 自动 `npm install`（提示可能慢）；`npm run build` + `npm run build:client` 必须成功。
3. **打包**：MSVC → `cmd /c call "<vcvars64.bat>" >nul 2>&1 && npm run tauri:build`；GNU → 直接 `npm run tauri:build`；继承 stdio 实时看进度，失败即非 0 退出。
4. **产物复制**：读 `package.json` version → `build/<version>/`（mkdir -p）→ 复制 NSIS exe → **SHA256 校验源/目标一致**（不一致先删目标重试一次，仍失败报错）。
5. **总结**：产物路径 + 大小 + SHA256 + 下一步（真机安装验证）。

---

## 5. 产物与验证清单

### 5.1 产物

| 项 | 值 |
|---|---|
| 安装器 | `build/<version>/DeepSeek Harness Hub_<version>_x64-setup.exe` |
| 中间产物（构建期） | `src-tauri/target/release/bundle/nsis/DeepSeek Harness Hub_<version>_x64-setup.exe` |
| 校验 | SHA256（源与复制目标一致；见 §3 ⑤ / §4 脚本内置） |

### 5.2 安装后验证清单（真机）

1. **安装目录布局**（默认 `%LOCALAPPDATA%\DeepSeek Harness Hub`，可自选）应包含：
   - `DeepSeek Harness Hub.exe` — 壳主程序（productName 命名）
   - `_up_\scripts\` — Tauri 2 resources 落点（踩坑 #50）：含 `assemble-profile.mjs`、`dsh-deps-install.ps1`
   - `dsh-hub-win\` — 安装期引导脚本生成的**私有 Node 运行时**（sidecar 优先使用，见 `src-tauri/src/managers/node.rs`）
   - `dsh-hub-bootstrap.log` — 安装期引导进度日志（`_up_\scripts\dsh-deps-install.ps1` 输出，失败不阻断安装）
2. **首启行为**：窗口先显示「启动中」占位页 → 自动导航进入 dsh UI；**不弹浏览器**（踩坑 #54 `--no-open`、#55 READY 后台等待已修复）
3. **进程树**：任务管理器可见 `DeepSeek Harness Hub.exe` + node sidecar 进程
4. **日志**：`$DSH_HOME/dsh-hub/logs/dsh.log`（t4.x / m4 / notify: / tray / pipe 前缀），首启异常先看这里（踩坑 #53 排查工具）
5. **托盘**：托盘图标 + 菜单正常（踩坑 #53 已修复：图标编译期内嵌 `include_bytes!`）

### 5.3 打包内容完整性清单（防漏内容，一键脚本已自动检查）

构建链每步**产出物**与**易漏项**如下——手工打包时逐项核对；`npm run build:installer` 会自动执行
（完整性预检 `assertSourceCompleteness` + host 依赖守卫 + lib 零漂移）：

| 构建步 | 产出物 | 易漏项（漏 = 安装后缺文件/功能） |
|---|---|---|
| `npm install` | `node_modules/` | **npm install 会清掉 SDK junction** → 装完必须重跑 `build:client`（踩坑 #19；脚本自动） |
| `npm run build` | `lib/`（host tsc） | **lib/ 必须提交入库**（发布铁律 3：prepack 重建，未提交 = 发布与仓库不一致；脚本 `assertLibClean` 检查） |
| `npm run build:client` | `lib/client.js` + `lib/client/*`（client bundle） | junction 缺失时构建失败（需全局 `@deepseek-ai/dsh` SDK 树）；dsh-hub client 代码若不进 bundle = 设置卡/置顶/rail/右键菜单全缺 |
| `npm run tauri:build`（MSVC） | `src-tauri/target/release/bundle/nsis/*-setup.exe` | resources 通配目录为空会**静默少文件**（如 `icons/*.ico` 缺失 → 快捷方式图标回退 exe 鲸鱼）；`src-tauri/icons/`、`assets/` 必须在 |
| 产物复制 | `build/<version>/*-setup.exe` | **SHA256 必须一致**（踩坑 #56：目标被占用会静默失败；脚本自动校验） |

**一键脚本自动检查**（防漏）：
- `assertSourceCompleteness`：关键源/资源/资产存在（`src/index.ts`、`shell-init.js`、`scripts/*.ps1|*.mjs`、`assets/backgrounds|icons`、`src-tauri/icons`）**+ resources 通配目录非空**——任一缺失直接 fail
- `assertHostImportCoverage`（踩坑 #64）：lib host 产物的外部 import 必须已被 resources 打包进 `_up_/node_modules` 闭包，否则目标机 `ERR_MODULE_NOT_FOUND`
- `assertLibClean`：构建后 `lib/` 无未提交变更（发布铁律 3）
- 版本一致性：`package.json` == `src-tauri/tauri.conf.json`（产物名/目录均用 version）
- 产物 SHA256：源与复制目标一致（不一致删目标重试一次）

**关键资产位置**（打包进安装器的完整内容）：
- 壳代码：`src-tauri/src/*`（含 `managers/icon.rs`、`shell-init.js` 内嵌）
- 安装期脚本（resources → `_up_\scripts\`）：`scripts/dsh-deps-install.ps1`、`scripts/assemble-profile.mjs`
- 独立插件（resources → _up_\plugins\，随 hub 分发轨）：plugins/<name>/**/*（如 dsh-findings-ledger，见 §7 双轨）
- 图标：`src-tauri/icons/`（PNG include_bytes 内嵌 + `*.ico` resources）
- client 资产：`assets/backgrounds/`（背景图）、`assets/icons/`（图标预览）
- 前端占位页：`dev/index.html`（frontendDist）

---

## 6. 常见问题（打包相关，均已在当前代码修复；打包时了解现象便于真机排查）

| 现象 | 原因 | 修复/做法 | 踩坑条目 |
|---|---|---|---|
| 安装后启动报「找不到 WebView2Loader.dll」 | GNU 工具链动态链接 + 官方 tauri CLI 是 MSVC 预编译、运行时误判 target 跳过 DLL 打包 | **首选 MSVC 工具链**（静态链接，彻底无需 DLL）；GNU 需手工带 DLL | [docs/关键踩坑记录.md#49](docs/关键踩坑记录.md) |
| 首启窗口出现即退出（dsh.log 停在 theme: DWM） | 托盘图标用 `env!("CARGO_MANIFEST_DIR")` 编译期展开打包机路径，新电脑不存在 → setup panic | 已改 `include_bytes!` 内嵌；**打包态严禁 `env!` 拼运行时路径** | [docs/关键踩坑记录.md#53](docs/关键踩坑记录.md) |
| 壳显示占位页，同时默认浏览器弹出 dsh UI | 壳 spawn dsh web 缺 `--no-open` | 已修复：spawn 正常路径与 cmd shim 兜底路径都带 `--no-open` | [docs/关键踩坑记录.md#54](docs/关键踩坑记录.md) |
| 壳一直停在占位页不导航（dsh web 冷启动慢） | setup 主线程同步轮询 READY 60s 超时 | 已修复：改后台线程轮询最长 300s，窗口先显示「启动中」，READY 后复用窗口导航 | [docs/关键踩坑记录.md#55](docs/关键踩坑记录.md) |
| `build/<version>/` 里的包 hash 与 target 产物不一致 | 目标 exe 被占用（查看器/杀毒）时复制失败但命令不报错 | 复制后**校验 SHA256**，不一致先删目标再复制；`build:installer` 已内置 | [docs/关键踩坑记录.md#56](docs/关键踩坑记录.md) |
| GNU 链接 cdylib 报 `export ordinal too large` | mingw ld 自动导出全部符号超 PE/COFF 上限 | 已入库：`src-tauri/.cargo/config.toml` 带 `--exclude-all-symbols` | [docs/关键踩坑记录.md#40](docs/关键踩坑记录.md) |
| `npm install` 后 `build:client` 失败 | npm install 清掉 `@deepseek-ai/dsh-*` SDK junction | 装完依赖必须重跑 `npm run build:client`（`build:installer` 每次都会跑） | [docs/关键踩坑记录.md#19](docs/关键踩坑记录.md) |
| 全新电脑卸载器启动慢（3-5 分钟） | Defender 首扫 $INSTDIR（dsh-hub-win ~3.5 万文件私有运行时，见踩坑 #70） | dsh-deps-install.ps1 Add-MpPreference -ExclusionPath（try/catch）+ PREUNINSTALL 改 Get-Process 提速；需管理员才生效 | [docs/关键踩坑记录.md#70](docs/关键踩坑记录.md) |

---

## 7. 插件双轨发布（dsh plugin 分发，AGENTS.md §1.1 铁律 8）

独立 dsh 插件（`plugins/<name>/`）落地时**同时**走两条分发——**只发一条 = 未完成**：

### 7.1 独立 npm 发布
```sh
cd plugins/<name>
# 前置：package.json private:false + peerDeps @deepseek-ai/cordis + 装配链就绪
# 门禁：插件专用轻量门禁（verify-release.mjs 只对 hub 包有效，插件目录跑它必然 FAIL）。
#   P1 lib/ 语法（node --check） · P2 patch 身份（insert.id == insert.name == 包名）
#   P3 files 含 lib + cordis.patch.yml · P4 scoped @dsh-external/* 名
#   P5 npm pack --dry-run 清单核对（tarball 必须含 cordis.patch.yml 与全部 lib/ 文件）
node ../../scripts/verify-plugin.mjs             # 全部 PASS 才能发布（铁律 6）
npm publish --access public --tag rc --registry=https://registry.npmjs.org/
npm dist-tag add <pkg>@<ver> latest --registry=https://registry.npmjs.org/
# 校验（registry 直查，勿用 npm view）：
(Invoke-RestMethod 'https://registry.npmjs.org/-/package/<pkg>/dist-tags').latest
# 双轨验收（§7.3）：隔离环境 npm i -g <pkg> → 加入 profile bundles → 装载冒烟
```

**发布流程说明（插件 npm 轨，双轨之一）**：
1. **装配链就绪**：`cordis.patch.yml` 声明 `dsh.bundle.patch`（package.json），patch 内 `insert.id == insert.name == package.json name`（铁律 2 身份一致）。
2. **files 白名单**：`files` 必须同时含 `"lib"` 与 `"cordis.patch.yml"`——缺 patch 时 tarball 装上即崩（dsh `loadOverlayPatches` 对声明但缺失的 patch 直接 throw，R1-4 F2 / 踩坑教训）。
3. **门禁**：`node ../../scripts/verify-plugin.mjs`（仓库根跑 `node scripts/verify-plugin.mjs` 同样生效，自动发现全部 4 个插件；可传插件目录只验单个）。**任一 FAIL 禁止 publish**（铁律 6）。
4. **发布**：`npm publish --access public --tag rc --registry=https://registry.npmjs.org/`（显式官方 registry，铁律 5.2-5）→ `npm dist-tag add <pkg>@<ver> latest`。
5. **发布后校验 + 双轨验收**：registry 直查 dist-tags；按 §7.3 逐插件「pack → 隔离安装 → 加入 profile → 装载冒烟」。
6. **hub 轨**（本插件同时随 NSIS 分发）走 §7.2，两条轨缺一 = 未完成（铁律 8）。

### 7.2 随 hub 分发（NSIS 自带）
1. `src-tauri/tauri.conf.json` `bundle.resources` 加 `../plugins/<name>/**/*`（Tauri 2 约定解包到 `$INSTDIR\_up_\plugins\<name>`，见踩坑 #50）
2. `scripts/assemble-profile.mjs` 装配：插件随壳启动自动进入 profile——junction 到 profile `node_modules/@dsh-external/<name>` + 以 scoped 名注册进 `dsh.profile.bundles`（步骤 6；失败不阻断 hub 装配）
3. 插件自带 `cordis.patch.yml`（`package.json` 声明 `dsh.bundle.patch`）经 bundle 层生效；**根 `cordis.patch.yml` 不加插件挂载行**（插件 patch 必须是顶层 YAML 数组，`plugins:` 映射形式 dsh 解析失败，见各插件 README「挂载」节）
4. `npm run build:installer` → 安装后插件随壳进入 profile 自动装配

### 7.3 双轨验收
- [ ] 独立安装（`npm i -g <pkg>`）后插件可挂载生效
- [ ] hub 安装后插件自动装配生效（NSIS 自带，无需手动装）
- [ ] 两轨插件身份一致（package.json name == cordis.patch.yml insert.name）
- [ ] 壳单一功能（client UI/托盘/窗口）**不发布 npm**，仅随 hub（build:client 编译进 lib/ 或 Rust 编译进 exe）

---

## 7.5 bug 修复 → 验证 → 重打包 SOP 要点

- **修复门禁**：tsc（`npm run build`）与 client bundle（`npm run build:client`）**必须都跑**（漏 `build:client`＝新代码不进 lib/，dev/打包仍旧行为——踩坑 #85）；Rust 侧 `cargo fmt --check` + `clippy --all-targets -D warnings` + `cargo test --lib`；lib 零漂移（无未提交 lib/ 变更）。
- **隔离实例验证**：`DSH_HOME=%TEMP%\<sandbox>` 独立 + `DSH_HUB_PACKAGE_ROOT=<仓库>` 起 dev 实例；行为性 bug 以用户实操确认为准（按 BUG_FIX_SOP.md 全流程）。
- **多实例/端口冲突**：dev 实例退出后 dev-server 可能残留（占用 17891）→ 启动失败 EADDRINUSE。处置：`netstat -ano | grep :17891` 找 LISTENING PID → `Stop-Process -Id <pid> -Force`；`taskkill //F //IM dsh-hub.exe` 清壳残留；再重启。
- **验证收尾**：移除临时诊断探针（host 路由+页面打点）→ 门禁复跑 → 踩坑登记 → 提交 dev-v2（按指示推送/合并）。
- **重打包**（已发布版本后的修复）：dev-v2 升版本（用户指定，如 rc.10 → 下个 rc）→ package.json/package-lock.json/tauri.conf.json 三处一致 → `node scripts/verify-release.mjs` ALL PASS → `npm run build:installer` → 更新打包记录 → 真机验证。

## 8. 相关文档

- 全部踩坑记录：[docs/关键踩坑记录.md](docs/关键踩坑记录.md)
- 构建/发布铁律：[AGENTS.md §5](AGENTS.md)
- Rust 壳开发约束：[src-tauri/src/AGENTS.md](src-tauri/src/AGENTS.md)
- 构建管线：`npm run build`（tsc）→ `npm run build:client`（[scripts/build-client.mjs](scripts/build-client.mjs)）→ `npm run tauri:build`（tauri CLI）
