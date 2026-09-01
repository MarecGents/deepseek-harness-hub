// lib.rs — dsh-hub Tauri 2.x 壳入口（M4 Node sidecar 接入）
//
// 模块类别：Controller（壳入口）
// 职责：日志（X1 三目标）、托盘（T3.1）、单实例（T3.3）、通知（T3.5）、
//       窗口管理（T2.1-T2.4）、Node sidecar 接入（T4.1/T4.4）、
//       关闭到托盘（T3.2）、quit.marker 语义（T3.6）。
// 迁移映射：src/desktop.ts + bin/launcher.mjs → Rust 壳层。
// Bare CI retrigger: no code change — the first rust-gate run (main @ 52021e1)
// hit a transient GitHub-side startup failure (workflow graph could not be
// built; rerun blocked by the API), so this comment-only diff re-arms the gate.
//
// 启动流程（T4.4 SOP §5.4 步骤 4，先建窗 → 后台准备 → READY 后 navigate）：
//   0. 先建窗（占位页 frontendDist ../dev/index.html + shell-init.js 标题栏/Splash）
//   1. 多实例检测前置（T4.2 双通道）
//   2. 启动 Node sidecar（T4.1）→ spawn dsh web --port 0
//   3. 等 stdout READY（dsh web: http://127.0.0.1:N）
//   4. READY 先验证再导航（TCP 探测确认）
//   5. win.navigate("http://127.0.0.1:N") 复用窗口（不重建；initialization_script
//      每次导航重新注入，Splash/标题栏依然生效）

// 分层（SPT 架构借鉴，2026-08-18 重构）：
//   managers/ = 壳 Manager（tray/node/window/single_instance）
//   helpers/  = 无状态 Helper（theme/state/quit/boot_theme/winutil/e2e）
//   services/ = 领域 Services（notify）
//   commands/ = Tauri 命令薄胶水（Callback 层）
// #[path] 保留模块名（crate::tray 等），避免引用链改动。
#[path = "helpers/boot_theme.rs"]
mod boot_theme;
#[path = "commands/commands.rs"]
mod commands;
#[cfg(debug_assertions)]
#[path = "helpers/e2e.rs"]
mod e2e;
#[path = "managers/icon.rs"]
mod icon;
#[path = "managers/node.rs"]
mod node;
#[path = "services/notify.rs"]
mod notify;
#[path = "helpers/quit.rs"]
mod quit;
#[path = "managers/single_instance.rs"]
mod single_instance;
#[path = "helpers/state.rs"]
mod state;
#[path = "helpers/theme.rs"]
mod theme;
#[path = "managers/tray.rs"]
mod tray;
#[path = "managers/window.rs"]
mod window;
#[path = "managers/window_ops.rs"]
mod window_ops;
#[path = "helpers/winutil.rs"]
mod winutil;

use log::{info, warn};
use std::sync::atomic::{AtomicBool, Ordering};
use tauri::{Listener, Manager};

/// M1 IPC 冒烟命令。
#[tauri::command]
fn ping() -> String {
    "pong".to_string()
}

/// READY 先验证再导航（T4.4 强制步骤）：轮询 TCP 连接到 127.0.0.1:<port> 确认端口可达。
/// 升格为强制前置：60s 超时、500ms 间隔、连续 15 次连接失败报错。
/// 用 std::net::TcpStream 避免添加 reqwest 依赖。
fn wait_for_ready(port: u16) -> Result<(), String> {
    use std::net::TcpStream;
    use std::time::{Duration, Instant};

    let addr = format!("127.0.0.1:{port}");
    let mut failures = 0u32;
    let max_failures = 15u32;
    let timeout = Duration::from_secs(60);
    let start = Instant::now();

    loop {
        if start.elapsed() > timeout {
            return Err(format!(
                "READY verification timeout ({:.0}s)",
                timeout.as_secs()
            ));
        }
        match TcpStream::connect_timeout(&addr.parse().unwrap(), Duration::from_millis(500)) {
            Ok(_) => {
                info!("t4.4: READY verified — {addr} reachable");
                return Ok(());
            }
            Err(e) => {
                failures += 1;
                if failures >= max_failures {
                    return Err(format!(
                        "READY verification: {addr} connect failed ({e}) {failures}/{max_failures}"
                    ));
                }
                warn!("t4.4: {addr} connect failed ({e}), retry {failures}/{max_failures}");
            }
        }
        std::thread::sleep(Duration::from_millis(500));
    }
}

/// 读取 closeToTray 配置（默认 false，与 host DEFAULT_SHELL_CONFIG.closeToTray 一致；
/// 此前 Rust 侧默认 true 导致首启点 X 隐藏到托盘，与设置卡默认「完全退出」不符）。
fn read_close_to_tray() -> bool {
    read_shell_config_bool("closeToTray", false)
}

/// 读取 minimizeToTray 配置（默认 true，与 rc.14 一致）。
fn read_minimize_to_tray() -> bool {
    read_shell_config_bool("minimizeToTray", true)
}

/// 读取 allowMultipleInstances 配置（默认 false = 严格拒共存，红线不松）。
fn read_allow_multiple_instances() -> bool {
    read_shell_config_bool("allowMultipleInstances", false)
}

/// 双通道多实例检测结果（fail-closed 判定）。
struct InstanceScan {
    /// 判定出的运行中 dsh 实例 PID（排序）。单通道降级时仅含该通道证据。
    running: Vec<u32>,
    /// 两通道均失败/超时 = 无法判定。调用方必须直接拒绝启动（宁拦勿放）。
    indeterminate: bool,
}

/// 运行命令并等待完成（带显式超时）。超时后强杀子进程并返回 Err——
/// 检测通道超时按失败处理，由 detect_running_dsh_instances 降级判定
/// （fail-closed，R-01）。并发排空 stdout/stderr，防止子进程写满管道
/// 缓冲阻塞 try_wait。
fn run_command_with_timeout(
    cmd: &mut std::process::Command,
    timeout: std::time::Duration,
) -> std::io::Result<std::process::Output> {
    use std::io::Read;

    let mut child = cmd
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .spawn()?;
    let mut stdout = child
        .stdout
        .take()
        .ok_or_else(|| std::io::Error::other("stdout pipe missing"))?;
    let mut stderr = child
        .stderr
        .take()
        .ok_or_else(|| std::io::Error::other("stderr pipe missing"))?;
    let (tx, rx) = std::sync::mpsc::channel();
    std::thread::spawn(move || {
        let mut out = Vec::new();
        let mut err = Vec::new();
        let _ = stdout.read_to_end(&mut out);
        let _ = stderr.read_to_end(&mut err);
        let _ = tx.send((out, err));
    });

    let start = std::time::Instant::now();
    let status = loop {
        match child.try_wait() {
            Ok(Some(status)) => break status,
            Ok(None) => {
                if start.elapsed() > timeout {
                    let _ = child.kill();
                    let _ = child.wait();
                    return Err(std::io::Error::new(
                        std::io::ErrorKind::TimedOut,
                        format!("command timed out after {}ms", timeout.as_millis()),
                    ));
                }
                std::thread::sleep(std::time::Duration::from_millis(50));
            }
            Err(e) => return Err(e),
        }
    };
    let (out, err) = rx.recv().unwrap_or_default();
    Ok(std::process::Output {
        status,
        stdout: out,
        stderr: err,
    })
}

/// T4.2 双通道多实例检测：枚举 TCP 监听端口的 PID，并与命令行匹配
/// `dsh.*web` 的 node.exe / dsh-hub.exe / dsh-hub-guard.exe 进程求交。
///
/// fail-closed 语义（R-01 修复，取代原「交集空集即放行」的 fail-open 设计）：
///   - 两通道均成功 → 取交集（与旧语义一致，命中即拦）；
///   - 单通道失败/超时 → warn! + 按另一通道结果判定（宁拦勿放）；
///   - 两通道均失败 → indeterminate=true，调用方直接拒绝启动。
///
/// 两个子进程均带 ~5s 显式超时（同步阻塞 setup 线程期间不无限等待，
/// AV/组策略环境 PowerShell 启动慢也不会挂死启动流程）。
fn detect_running_dsh_instances() -> InstanceScan {
    const DETECT_TIMEOUT: std::time::Duration = std::time::Duration::from_secs(5);

    // 通道 1：监听端口 → PID（netstat）。
    let mut netstat = std::process::Command::new("netstat");
    netstat.args(["-ano", "-p", "tcp"]);
    // CREATE_NO_WINDOW：netstat 是 console 程序，不隐藏会闪命令行窗口。
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        netstat.creation_flags(0x08000000);
    }
    let netstat_pids: Option<std::collections::HashSet<u32>> =
        match run_command_with_timeout(&mut netstat, DETECT_TIMEOUT) {
            Ok(out) if out.status.success() => {
                let mut pids = std::collections::HashSet::new();
                let text = String::from_utf8_lossy(&out.stdout);
                for line in text.lines() {
                    let cols: Vec<&str> = line.split_whitespace().collect();
                    if cols.len() >= 5 && cols[0] == "TCP" && cols[3] == "LISTENING" {
                        if let Ok(pid) = cols[4].parse::<u32>() {
                            pids.insert(pid);
                        }
                    }
                }
                Some(pids)
            }
            Ok(out) => {
                warn!(
                    "m4: netstat channel exited {:?} — treating as channel failure (fail-closed)",
                    out.status.code()
                );
                None
            }
            Err(e) => {
                warn!("m4: netstat channel failed: {e} (fail-closed)");
                None
            }
        };

    // 通道 2：进程命令行匹配（PowerShell CIM；括号化 OR 规避本机 WQL -or 解析失败，
    // 见 2026-08-19 实测：`Name='x' -or Name='y'` 报 0x80041017 无效查询）。
    let filter = "(Name='node.exe') OR (Name='dsh-hub.exe') OR (Name='dsh-hub-guard.exe')";
    let script = format!(
        "Get-CimInstance Win32_Process -Filter \"{filter}\" | Where-Object {{ $_.CommandLine -match 'dsh.*web' }} | Select-Object -ExpandProperty ProcessId"
    );
    let mut ps = std::process::Command::new("powershell.exe");
    ps.args(["-NoProfile", "-NonInteractive", "-Command", &script]);
    // CREATE_NO_WINDOW：powershell 是 console 程序，不隐藏会闪命令行窗口。
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        ps.creation_flags(0x08000000);
    }
    let cim_pids: Option<Vec<u32>> = match run_command_with_timeout(&mut ps, DETECT_TIMEOUT) {
        Ok(out) if out.status.success() => {
            let pids: Vec<u32> = String::from_utf8_lossy(&out.stdout)
                .lines()
                .filter_map(|pid| pid.trim().parse::<u32>().ok())
                .collect();
            Some(pids)
        }
        Ok(out) => {
            warn!(
                "m4: CIM channel exited {:?} — treating as channel failure (fail-closed)",
                out.status.code()
            );
            None
        }
        Err(e) => {
            warn!("m4: CIM channel failed: {e} (fail-closed)");
            None
        }
    };

    combine_channels(netstat_pids, cim_pids)
}

/// Combine the two detection channels under fail-closed semantics (宁拦勿放):
///   - both succeeded → intersect (legacy semantics);
///   - one failed/timed-out → judge by the surviving channel (never relax to
///     "no evidence", which is how the old empty-intersection bug let
///     double-instance damage through);
///   - both failed → `indeterminate`, the caller refuses to start.
///
/// Pure decision table — unit-tested so the fail-closed contract cannot
/// regress silently (rust-skills test-*).
fn combine_channels(
    netstat: Option<std::collections::HashSet<u32>>,
    cim: Option<Vec<u32>>,
) -> InstanceScan {
    match (netstat, cim) {
        (Some(listeners), Some(cim_pids)) => {
            let mut matched: Vec<u32> = cim_pids
                .into_iter()
                .filter(|n| listeners.contains(n))
                .collect();
            matched.sort_unstable();
            InstanceScan {
                running: matched,
                indeterminate: false,
            }
        }
        (Some(listeners), None) => {
            warn!("m4: CIM channel failed — judging by netstat LISTENING pids only (fail-closed)");
            let mut running: Vec<u32> = listeners.into_iter().collect();
            running.sort_unstable();
            InstanceScan {
                running,
                indeterminate: false,
            }
        }
        (None, Some(cim_pids)) => {
            warn!(
                "m4: netstat channel failed — judging by CIM dsh.*web processes only (fail-closed)"
            );
            let mut running = cim_pids;
            running.sort_unstable();
            InstanceScan {
                running,
                indeterminate: false,
            }
        }
        (None, None) => {
            warn!("m4: both detection channels failed — refusing to start (fail-closed)");
            InstanceScan {
                running: Vec::new(),
                indeterminate: true,
            }
        }
    }
}

/// T4.2 多实例门禁：检测到运行中的 dsh web 实例时，
/// 默认（allowMultipleInstances=false）直接警告并退出；已勾选允许则仍要求是/否确认。
/// @returns true = 可以继续启动；false = 应退出。
fn enforce_multi_instance(app: &tauri::App) -> bool {
    // dev 构建 + 隔离 DSH_HOME（≠ 默认 ~/.dsh，SOP §5.5 测试隔离）→ 直接放行：
    // 隔离 home 与正式数据不共享，无 seq 冲突风险，不弹框。
    if cfg!(debug_assertions)
        && crate::state::dsh_home() != dirs::home_dir().unwrap_or_default().join(".dsh")
    {
        info!("m4: dev build with isolated DSH_HOME — skipping multi-instance gate");
        return true;
    }

    use tauri_plugin_dialog::{
        DialogExt, MessageDialogButtons, MessageDialogKind, MessageDialogResult,
    };

    let scan = detect_running_dsh_instances();
    // 两通道均失败/超时：无法判定运行状态 → 直接拒绝启动（宁拦勿放，
    // 仅 OK 按钮、无逃生口——检测失效时宁可误拦不可漏拦）。
    if scan.indeterminate {
        let msg = "⚠ 无法检测是否已有 dsh 实例在运行（多实例检测通道全部失败）。\n\n为保护会话数据，桌面壳将拒绝启动。\n请先关闭已运行的 dsh 窗口，再启动桌面壳。";
        let _resp = app
            .dialog()
            .message(msg)
            .title("dsh-hub")
            .kind(MessageDialogKind::Warning)
            .buttons(MessageDialogButtons::Ok)
            .blocking_show();
        info!("m4: blocked by multi-instance gate (both detection channels failed)");
        return false;
    }
    let running = scan.running;
    if running.is_empty() {
        return true;
    }
    let detail = running
        .iter()
        .map(|pid| format!("  · PID {pid}"))
        .collect::<Vec<_>>()
        .join("\n");
    warn!(
        "m4: detected {} running dsh instance(s):\n{}",
        running.len(),
        detail
    );

    if !read_allow_multiple_instances() {
        // 默认：拒绝。仅 OK 按钮，无"继续"逃生口（SOP：宁可误拦不可漏拦）。
        let msg = format!(
            "⚠ 检测到已有 {} 个 dsh 实例正在运行：\n{}\n\n为保护会话数据，默认禁止同时运行多个 dsh 实例。\n请先关闭已运行的 dsh 窗口，再启动桌面壳。\n（如确需共存，请到 设置 → DSH HUB 设置 中勾选「允许同时运行多个实例」。）",
            running.len(),
            detail
        );
        let resp = app
            .dialog()
            .message(msg)
            .title("dsh-hub")
            .kind(MessageDialogKind::Warning)
            .buttons(MessageDialogButtons::Ok)
            .blocking_show();
        let _ = resp;
        info!("m4: blocked by multi-instance gate (allowMultipleInstances=false)");
        return false;
    }

    // 已勾选允许：仍要求显式确认。
    let question = format!(
        "⚠ 检测到已有 {} 个 dsh 实例正在运行：\n{}\n\n多个实例共享 $DSH_HOME 会话数据，同时操作同一会话可能损坏会话日志（seq 冲突）。\n你已勾选「允许同时运行多个实例」。确认仍要启动桌面壳吗？",
        running.len(),
        detail
    );
    let resp = app
        .dialog()
        .message(question)
        .title("dsh-hub")
        .kind(MessageDialogKind::Warning)
        .buttons(MessageDialogButtons::YesNo)
        .blocking_show_with_result();
    if resp == MessageDialogResult::Yes {
        info!("m4: user confirmed coexistence; launching");
        true
    } else {
        info!("m4: user declined coexistence; exiting");
        false
    }
}

/// 读 $DSH_HOME/dsh-hub/config.json 的布尔字段。
fn read_shell_config_bool(key: &str, default: bool) -> bool {
    let config_path = state::dsh_home().join("dsh-hub").join("config.json");
    match std::fs::read_to_string(&config_path) {
        Ok(content) => serde_json::from_str::<serde_json::Value>(&content)
            .ok()
            .and_then(|json| json.get(key).and_then(|v| v.as_bool()))
            .unwrap_or(default),
        Err(_) => default,
    }
}

/// 恢复 rc.14 窗口记忆：只恢复 maximized 标志（几何尺寸不持久化）。
fn restore_window_state(win: &tauri::WebviewWindow) {
    if state::load_window_state().maximized {
        if let Err(e) = win.maximize() {
            warn!("window: restore maximized failed: {}", e);
        } else {
            info!("window: restored maximized state");
        }
    }
}

/// Q3/Q4：Windows 未打包应用的系统 toast 需要 AUMID 才会显示
/// （tauri-plugin-notification 用 config identifier = com.marecgents.dsh-hub）。
/// 三管齐下（幂等，失败仅告警；M5 打包后 NSIS 自带快捷方式）：
///   1. 注册表 HKCU\Software\Classes\AppUserModelId\{AUMID}（DisplayName/IconUri）
///   2. 开始菜单快捷方式 + AUMID 属性（微软文档最可靠的未打包 toast 显示方式）
///
/// 桌面快捷方式**只在 NSIS 安装时创建**（安装完成页的「创建桌面快捷方式」
/// 按钮，用户点击才创建）——启动不再创建/检查桌面 lnk：用户可能已把快捷
/// 方式移到其它文件夹，启动重建会覆盖用户布局（2026-08-28 改进点）。
#[cfg(target_os = "windows")]
fn register_toast_aumid() {
    use std::os::windows::process::CommandExt;

    // 1) 注册表 AUMID。
    let key = "HKCU\\Software\\Classes\\AppUserModelId\\com.marecgents.dsh-hub";
    let exe = std::env::current_exe().unwrap_or_default();
    let exe_str = exe.to_string_lossy().to_string();
    let add = |name: &str, value: &str| {
        let mut c = std::process::Command::new("reg");
        c.args(["add", key, "/v", name, "/t", "REG_SZ", "/d", value, "/f"]);
        c.creation_flags(0x08000000); // CREATE_NO_WINDOW
        match c.output() {
            Ok(out) if out.status.success() => {
                info!("notify: AUMID {} = {} registered", name, value)
            }
            Ok(out) => warn!(
                "notify: AUMID {} register failed: {}",
                name,
                String::from_utf8_lossy(&out.stderr)
            ),
            Err(e) => warn!("notify: AUMID {} register error: {}", name, e),
        }
    };
    add("DisplayName", "DeepSeek Harness Hub");
    add("IconUri", &exe_str);

    // 2) 开始菜单快捷方式（带 AUMID 属性）。桌面快捷方式由 NSIS 安装器
    //    负责（安装向导可取消勾选），启动不再创建。
    create_toast_shortcuts(&exe);
}

/// 用 IShellLink 创建开始菜单快捷方式并写入 AppUserModelID（Q3/Q4）。
/// 桌面快捷方式不在启动时创建——安装期由 NSIS 负责，避免启动重建覆盖
/// 用户移动过的快捷方式（2026-08-28 改进点）。
#[cfg(target_os = "windows")]
fn create_toast_shortcuts(exe: &std::path::Path) {
    use crate::winutil::{wide, ComInit};
    use windows::core::{Interface, PCWSTR};
    use windows::Win32::Foundation::PROPERTYKEY;
    use windows::Win32::System::Com::StructuredStorage::{PropVariantClear, PROPVARIANT};
    use windows::Win32::System::Com::{
        CoCreateInstance, IPersistFile, CLSCTX_INPROC_SERVER, COINIT_MULTITHREADED,
    };
    use windows::Win32::UI::Shell::PropertiesSystem::IPropertyStore;
    use windows::Win32::UI::Shell::{IShellLinkW, ShellLink};

    // PKEY_AppUserModel_ID（windows crate 未生成该常量，手写 GUID+pid）。
    const PKEY_APP_USER_MODEL_ID: PROPERTYKEY = PROPERTYKEY {
        fmtid: windows::core::GUID::from_u128(0x9F4C2855_9F79_4B39_A8D0_E1D42DE1D5F3),
        pid: 3,
    };

    let Some(appdata) = std::env::var_os("APPDATA") else {
        return;
    };
    let start_menu = std::path::Path::new(&appdata)
        .join("Microsoft")
        .join("Windows")
        .join("Start Menu")
        .join("Programs");

    // 只创建开始菜单快捷方式。桌面快捷方式由 NSIS 安装器负责（安装向导
    // 可取消勾选）；启动不再创建，避免覆盖用户移动过的桌面 lnk。
    let targets: Vec<(std::path::PathBuf, &str)> = vec![(start_menu, "start-menu")];

    for (dir, tag) in targets {
        if dir.as_os_str().is_empty() {
            continue;
        }
        let _ = std::fs::create_dir_all(&dir);
        let lnk = dir.join("DeepSeek Harness Hub.lnk");
        // SAFETY (whole block): every Win32 call below takes NUL-terminated
        // UTF-16 buffers built by `wide()` (caller-held Vec stays alive for
        // the duration of the call) or pre-registered COM class IDs; the COM
        // apartment is opened via the ComInit RAII guard, so the paired
        // CoUninitialize is guaranteed even on error branches (no leak). The
        // IShellLinkW/IPropertyStore/IPersistFile objects are single-threaded
        // COM creatures confined to this thread; property storage uses a
        // PROPVARIANT cleared via PropVariantClear before it is dropped.
        unsafe {
            let Some(_com) = ComInit::new(COINIT_MULTITHREADED) else {
                warn!("shortcut({tag}): CoInitializeEx failed");
                continue;
            };
            let link: IShellLinkW = match CoCreateInstance(&ShellLink, None, CLSCTX_INPROC_SERVER) {
                Ok(l) => l,
                Err(e) => {
                    warn!("shortcut({tag}): CoCreateInstance failed: {e}");
                    continue;
                }
            };
            let exe_w = wide(&exe.to_string_lossy());
            let _ = link.SetPath(PCWSTR(exe_w.as_ptr()));
            let wd = wide(
                &exe.parent()
                    .unwrap_or(std::path::Path::new(""))
                    .to_string_lossy(),
            );
            let _ = link.SetWorkingDirectory(PCWSTR(wd.as_ptr()));
            let _ = link.SetDescription(PCWSTR(wide("DeepSeek Harness Hub").as_ptr()));
            // 先写 AUMID 属性、最后 Save（微软官方顺序）——曾在 Save 之后 SetValue
            // 且未再保存，AUMID 从未落盘（.lnk 缺 AUMID，toast 归组/图标关联失效）。
            let props: IPropertyStore = match link.cast() {
                Ok(p) => p,
                Err(_) => {
                    warn!("shortcut({tag}): cast to IPropertyStore failed");
                    continue;
                }
            };
            let mut pv = PROPVARIANT::from("com.marecgents.dsh-hub");
            let _ = props.SetValue(&PKEY_APP_USER_MODEL_ID, &pv);
            let _ = PropVariantClear(&mut pv);
            let persist: IPersistFile = match link.cast() {
                Ok(p) => p,
                Err(_) => {
                    warn!("shortcut({tag}): cast to IPersistFile failed");
                    continue;
                }
            };
            let path_w = wide(&lnk.to_string_lossy());
            if let Err(e) = persist.Save(PCWSTR(path_w.as_ptr()), true) {
                warn!("shortcut({tag}): save failed: {e}");
                continue;
            }
            info!("shortcut({tag}): created {} with AUMID", lnk.display());
        }
    }
}

// 桌面快捷方式由 NSIS 安装器负责（安装完成页按钮，用户点击才创建），
// 启动不再创建/更新桌面 lnk（2026-08-28 改进点）。宽字符串编码已迁至
// helpers/winutil.rs 的 winutil::wide（单一实现）。

/// --smoke 诊断模式标记（T4.4）：main.rs 解析参数后置位，
/// Disable the WebView2 native right-click menu (refresh / back / inspect).
/// That menu is browser-level: a page's `contextmenu` + `preventDefault`
/// CANNOT suppress it (that is why session/workspace rows still showed
/// "刷新" — Bug3 root cause). With it off, the DOM layer owns right-click:
/// object rows open their menus (pin-conversations / workspace-menu) and open
/// space shows the hub's own refresh menu. Best-effort; failure only logs.
#[cfg(target_os = "windows")]
fn disable_default_context_menu(app: &tauri::AppHandle) {
    use tauri::Manager;
    let Some(win) = app.get_webview_window("main") else {
        return;
    };
    // PlatformWebview (the with_webview callback argument) exposes the
    // webview2-com typed controller; the chain is
    // controller.CoreWebView2().Settings().SetAreDefaultContextMenusEnabled
    // (false) — mirrors wry's own set_webview_settings.
    if let Err(e) = win.with_webview(|wv| {
        let controller = wv.controller();
        // SAFETY: all three interface pointers come from tauri's live
        // WebView2 platform webview (valid for the webview lifetime),
        // acquired via wry/tauri; these calls only toggle a controller
        // setting and dereference no user-controlled memory.
        let disabled = unsafe {
            controller
                .CoreWebView2()
                .ok()
                .and_then(|core| core.Settings().ok())
                .and_then(|settings| settings.SetAreDefaultContextMenusEnabled(false).ok())
                .is_some()
        };
        if !disabled {
            log::warn!("webview: failed to disable default context menus");
        } else {
            // Visible confirmation for the Bug3 forensics: a menu STILL
            // appearing afterwards is a DOM menu (this hub's or the page's),
            // never the WebView2 native one.
            log::info!("webview: default context menus disabled");
        }
    }) {
        log::warn!("webview: with_webview callback failed: {e}");
    }
}

/// lib.rs setup 建窗成功（window build Ok）后检查 → 写 quit.marker + exit(0)。
/// 普通启动（无 --smoke）保持 false，行为完全不变。
static SMOKE_MODE: AtomicBool = AtomicBool::new(false);

/// 启用 --smoke 诊断模式（main.rs 调用）。
pub fn enable_smoke_mode() {
    SMOKE_MODE.store(true, Ordering::SeqCst);
}

/// 装配 web profile（T4.4 诊断参数入口，复用 managers/node.rs 装配逻辑）。
pub fn assemble_profile() -> Result<(), String> {
    node::assemble_profile()
}

/// --smoke 模式：建窗成功即验证通过 —— 短暂延迟（~500ms）让 webview 初始化，
/// 写 quit.marker + process::exit(0)（退出语义红线：quit.marker + exit(0)）。
/// sidecar 已启动时经 node::stop_dsh 收尾（kill 子进程，防 --smoke 后孤儿进程
/// 占用端口）；未托管 NodeState 时直接写 marker。普通启动零开销返回。
fn maybe_smoke_exit(app: &tauri::App) {
    if !SMOKE_MODE.load(Ordering::SeqCst) {
        return;
    }
    info!("smoke: window created OK — 500ms grace for webview init, then clean exit");
    std::thread::sleep(std::time::Duration::from_millis(500));
    // stop_dsh 已写 marker（sidecar 启动时）；quit_and_exit 再写一次幂等安全。
    if let Some(state) = app.try_state::<std::sync::Arc<node::NodeState>>() {
        // state 是 State<Arc<NodeState>>——&state 经 Deref 链（State→Arc→NodeState）收窄。
        crate::node::stop_dsh(&state);
    }
    crate::quit::quit_and_exit();
}

pub fn run() {
    let log_dir = state::dsh_home().join("dsh-hub").join("logs");

    tauri::Builder::default()
        // X1 日志三目标。
        .plugin(
            tauri_plugin_log::Builder::new()
                .targets([
                    tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::Stdout),
                    tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::Webview),
                    tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::Folder {
                        path: log_dir,
                        file_name: Some("dsh.log".to_string()),
                    }),
                ])
                .build(),
        )
        // T3.3：单实例插件。
        .plugin(single_instance::single_instance_plugin())
        .plugin(tauri_plugin_shell::init())
        // T3.5：通知插件（notify.rs 经 NotificationExt 弹系统 toast）。
        .plugin(tauri_plugin_notification::init())
        // T4.2：多实例确认框（预启 CLI dsh web 时的拦截/确认对话框）。
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            ping,
            commands::diag_report,
            commands::set_window_theme,
            commands::apply_page_theme,
            commands::set_window_size,
            commands::get_workspace_path,
            commands::set_desktop_icon,
            commands::window_minimize,
            commands::window_toggle_maximize,
            commands::window_close,
            commands::tray_quit,
            commands::window_toggle_visible,
            commands::play_sound,
            commands::open_workspace_path,
            notify::notify_task_complete,
        ])
        .setup(|app| {
            // IconManager 尽早托管（任何 set_desktop_icon / apply_page_theme /
            // 启动应用路径都可能访问它——迟托管会在 sidecar 启动失败等路径 panic）。
            app.manage(icon::IconManager::default());
            // ── M4 流程（T4.4 SOP §5.4 步骤 4，先建窗 → 后台准备 → READY 后 navigate）──
            // 0. 先建窗（占位页立即显示，不再等 READY）：WebviewUrl::default() =
            //    frontendDist ../dev/index.html（M3 临时页）；build_main_window 注入
            //    shell-init.js（标题栏/Splash/声音）+ autoplay 放行。READY 后
            //    win.navigate 复用本窗口（不重建），initialization_script 每次导航
            //    重新注入，Splash/标题栏依然生效。
            let win = window::build_main_window(app)?;
            restore_window_state(&win);
            if let Err(e) = theme::apply_theme(&win, tauri::Theme::Dark) {
                warn!("window: apply theme failed: {}", e);
            }
            // S6: 启动即应用已保存的桌面图标（设置卡选择；'default' = 主题翻转
            // 鲸鱼，未知 id 回退白鲸）。页面加载后 apply_page_theme 会按实际
            // 明暗重新应用（'default' 翻转 / 鲸鱼娘固定），此处保证占位页
            // 期间图标即正确。统一走 icon::IconManager（面级幂等编排）。
            let desktop_icon = state::read_shell_config_str("desktopIcon", "default");
            let dark = win.theme().unwrap_or(tauri::Theme::Dark) == tauri::Theme::Dark;
            app.state::<icon::IconManager>().apply(app.handle(), &desktop_icon, dark);

            // Q4：toast 显示所需 AUMID 注册（Windows 未打包应用，幂等）。
            // 移后台线程：多次 reg.exe spawn + COM 快捷方式保存曾排在建窗前的
            // 关键路径上（拖慢首绘 ~0.5s）。注册建好 .lnk 后强制补一次壳图标源
            // 同步——apply 与本线程有竞态窗口（当时 .lnk 可能还没建好，
            // IconLocation 更新被跳过），sync_after_shortcuts 强制重跑壳源面。
            #[cfg(target_os = "windows")]
            {
                let app_handle = app.handle().clone();
                let icon_id = desktop_icon.clone();
                std::thread::spawn(move || {
                    register_toast_aumid();
                    app_handle.state::<icon::IconManager>().sync_after_shortcuts(&app_handle, &icon_id);
                });
            }

            // 事件接线（M2 resize 记忆 + T3.2 closeToTray/minimizeToTray；原 READY
            // 后建窗段落，逻辑原样搬移至此——占位页期间即生效）。注意：事件闭包
            // move 的是 win 的 clone，原 win 保留给后续 win.navigate 使用。
            let win_handle = win.clone();
            let prev_max = std::sync::Arc::new(std::sync::atomic::AtomicBool::new(
                win.is_maximized().unwrap_or(false),
            ));
            let prev_max_resize = prev_max.clone();
            win.listen("tauri://resize", move |_event| {
                let is_max = win_handle.is_maximized().unwrap_or(false);
                let was_max = prev_max_resize.swap(is_max, std::sync::atomic::Ordering::SeqCst);
                if let Ok(inner) = win_handle.inner_size() {
                    // 最大化时的 inner 是整屏尺寸，不覆盖保存尺寸（退出最大化后
                    // 恢复用）——只在非最大化时保存 width/height。
                    let _ = state::save_window_state(state::WindowState {
                        maximized: is_max,
                        width: if is_max { 0 } else { inner.width },
                        height: if is_max { 0 } else { inner.height },
                    });
                }
                // 项 6：退出最大化 → 恢复保存尺寸或默认 3/4（保存缺失/非法时用
                // 光标屏 3/4；保存的是物理像素，按当前 scale 转逻辑再 set_size）。
                if was_max && !is_max {
                    let saved = state::load_window_state();
                    let scale = win_handle.scale_factor().unwrap_or(1.0);
                    let (w, h) = if saved.width >= 480 && saved.height >= 360 {
                        (saved.width as f64 / scale, saved.height as f64 / scale)
                    } else {
                        crate::window::default_three_quarter_size(win_handle.app_handle())
                    };
                    log::info!("window: exit-maximize → restore size {}x{}", w as u32, h as u32);
                    let _ = win_handle.set_size(tauri::Size::Logical(tauri::LogicalSize::new(w, h)));
                }
            });

            // T3.2：关闭到托盘（closeToTray=true → prevent_close + hide；false → 退出）。
            // 用 on_window_event + api.prevent_close()：只有 JS 侧有 listener 时
            // tauri 才 prevent_close（manager/window.rs has_js_listener 检查），
            // Rust 侧 win.listen 不满足该条件，窗口会真正关闭导致进程退出。
            let on_close_win = win.clone();
            let on_min_win = win.clone();
            let on_sync_app = win.app_handle().clone();
            win.on_window_event(move |event| {
                match event {
                    tauri::WindowEvent::CloseRequested { api, .. } => {
                        // Bug 1 修复：每次事件重读配置（设置保存后立即生效，无需重启）。
                        if read_close_to_tray() {
                            api.prevent_close();
                            let _ = on_close_win.hide();
                            crate::tray::sync_toggle_label(&on_sync_app);
                            info!("close-requested: closeToTray=true, prevent_close + hiding window");
                        } else {
                            // 先杀 sidecar（dsh web 子进程），防孤儿进程残留。
                            if let Some(state) = on_sync_app.try_state::<std::sync::Arc<node::NodeState>>() {
                                node::stop_dsh(&state);
                            }
                            quit::write_quit_marker();
                            info!("close-requested: closeToTray=false, writing quit.marker and exiting");
                            std::process::exit(0);
                        }
                    }
                    // 最小化到托盘：Tauri 无独立 Minimized 事件，用 Resized + is_minimized 检测。
                    // Bug 1 修复：每次事件重读 minimizeToTray（设置保存后立即生效）。
                    tauri::WindowEvent::Resized(_)
                        if read_minimize_to_tray() && on_min_win.is_minimized().unwrap_or(false) => {
                            let _ = on_min_win.hide();
                            crate::tray::sync_toggle_label(&on_sync_app);
                            info!("resized: minimized → hide to tray (minimizeToTray=true)");
                        }
                    _ => {}
                }
            });

            // T4.4：--smoke 诊断模式 —— 建窗成功即验证通过（占位页已显示），
            // 写 quit.marker + process::exit(0)。此时 sidecar 尚未启动，无需
            // stop_dsh 收尾（也未托管 NodeState，maybe_smoke_exit 走写 marker 分支）。
            // 普通启动零开销返回。
            maybe_smoke_exit(app);

            // WebView2 原生右键菜单接管（DOM 侧全量右键：对象行菜单 / 空白刷新）。
            #[cfg(target_os = "windows")]
            disable_default_context_menu(app.handle());

            // 1. 多实例门禁（T4.2 双通道）：预启 CLI dsh web 必拦截 / 确认。
            //    对话框显示在已建窗口之上（用户能看到）。
            if !enforce_multi_instance(app) {
                std::process::exit(1);
            }

            // 2. 托盘（图标随用户桌面图标选择 / 主题翻转，S6）。
            let _tray = tray::setup_tray(app)?;
            // 托盘图标面走 IconManager（dark 按当前窗口主题；面级幂等，窗口面
            // 已应用则跳过）。
            let icon_id = state::read_shell_config_str("desktopIcon", "default");
            let dark = app
                .get_webview_window("main")
                .map(|w| w.theme().unwrap_or(tauri::Theme::Dark) == tauri::Theme::Dark)
                .unwrap_or(true);
            app.state::<icon::IconManager>().apply(app.handle(), &icon_id, dark);

            // 3. 启动 Node sidecar（T4.1）。
            let node_state = std::sync::Arc::new(node::NodeState::new());

            // 失败回退（start_dsh Err / READY 超时 / wait_for_ready 失败 / navigate
            // 失败共用）：复用已显示的占位窗口（不重建），restore + theme 幂等；
            // manage 仅在未托管时执行；kill_sidecar 在 sidecar 未 spawn 时是 no-op
            // （child 槽位空），已 spawn 时防孤儿进程占用端口。
            let fallback = |reason: &str| {
                warn!("m4: {reason} — keeping placeholder page");
                restore_window_state(&win);
                let _ = theme::apply_theme(&win, tauri::Theme::Dark);
                if app.try_state::<std::sync::Arc<node::NodeState>>().is_none() {
                    app.manage(node_state.clone());
                }
                maybe_smoke_exit(app);
                node::kill_sidecar(&node_state);
            };

            match node::start_dsh(node_state.clone(), app.handle().clone()) {
                Ok(_) => {
                    info!("m4: dsh web sidecar starting…");
                }
                Err(e) => {
                    fallback(&format!("sidecar start failed ({e})"));
                    return Ok(());
                }
            }
            // 成功路径也需托管 NodeState：托盘命令管道（send_tray_command）经
            // app.state 取 stdin 句柄（rc.14 tray-helper 模式）。
            app.manage(node_state.clone());

            // 4. 等 READY + 导航（后台线程，不阻塞 setup）：窗口已显示占位页
            //    （"连接中"），dsh web 冷启动（私有 node + 全新 ~/.dsh）可能远
            //    超 60s——阻塞等待会让窗口期间无响应（拖动/关闭都卡）。后台轮询
            //    state.port（最长 300s）→ READY 验证 → win.navigate 复用窗口。
            //    失败仅 warn（保持占位页），setup 立即返回让事件循环接管窗口。
            let nav_state = node_state.clone();
            let nav_win = win.clone();
            std::thread::spawn(move || {
                let start = std::time::Instant::now();
                let port = loop {
                    let p = *nav_state.port.lock().unwrap();
                    if let Some(port) = p {
                        break port;
                    }
                    if start.elapsed().as_secs() > 300 {
                        warn!("m4: READY timeout (300s), staying on placeholder page");
                        return;
                    }
                    std::thread::sleep(std::time::Duration::from_millis(200));
                };
                info!("m4: sidecar READY on port {port}");
                // READY 先验证再导航（强制步骤，T4.4）。
                if let Err(e) = wait_for_ready(port) {
                    warn!("m4: READY verification failed ({e}), staying on placeholder page");
                    return;
                }
                // 导航到 dsh web URL（复用已显示窗口）。平滑过渡：占位页先淡出
                // （220ms，dev/index.html 的 __mgFadeout），再切换到 dsh 页——
                // dsh 页自带同款 Splash 覆盖层（同底色/同鲸鱼脉冲）接管视觉。
                let _ = nav_win.eval("window.__mgFadeout && window.__mgFadeout()");
                std::thread::sleep(std::time::Duration::from_millis(240));
                let url = format!("http://127.0.0.1:{port}");
                info!("m4: navigating to {}", url);
                match tauri::Url::parse(&url) {
                    Ok(u) => {
                        if let Err(e) = nav_win.navigate(u) {
                            warn!("m4: navigate failed ({e}), staying on placeholder page");
                        }
                    }
                    Err(e) => warn!("m4: invalid sidecar URL ({e})"),
                }
            });

            // Tray "Open workspace" 路径回传：client 经 invoke('open_workspace_path')
            // 上行（D-2：事件系统在 remote origin 不可用，页面→Rust 走命令）。
            // 平台打开命令在 window_ops::open_workspace_path 实现（commands 为薄胶水）。

            // E2E 验证钩子（仅 debug 构建，DSH_HUB_E2E=1 启用；见 e2e.rs）。
            #[cfg(debug_assertions)]
            e2e::maybe_run_e2e(win.clone());

            info!("dsh-hub shell started (placeholder shown; navigating to dsh web on READY)");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running dsh-hub");
}

#[cfg(test)]
mod tests {
    use super::combine_channels;
    use std::collections::HashSet;

    fn set(pids: &[u32]) -> HashSet<u32> {
        pids.iter().copied().collect()
    }

    #[test]
    fn both_channels_ok_intersects() {
        let scan = combine_channels(Some(set(&[1, 2, 3])), Some(vec![3, 2, 5]));
        assert!(!scan.indeterminate);
        assert_eq!(scan.running, vec![2, 3]);
    }

    #[test]
    fn both_channels_ok_no_overlap_is_empty_but_indeterminate_false() {
        // Legacy semantics for an empty intersection: NOT indeterminate — the
        // caller proceeds (no listener + no CIM evidence = nothing running).
        let scan = combine_channels(Some(set(&[1])), Some(vec![2]));
        assert!(!scan.indeterminate);
        assert!(scan.running.is_empty());
    }

    #[test]
    fn cim_failed_judges_by_netstat() {
        let scan = combine_channels(Some(set(&[4, 1])), None);
        assert!(!scan.indeterminate);
        assert_eq!(scan.running, vec![1, 4]);
    }

    #[test]
    fn netstat_failed_judges_by_cim() {
        let scan = combine_channels(None, Some(vec![9, 3]));
        assert!(!scan.indeterminate);
        assert_eq!(scan.running, vec![3, 9]);
    }

    #[test]
    fn both_failed_is_indeterminate() {
        let scan = combine_channels(None, None);
        assert!(scan.indeterminate);
        assert!(scan.running.is_empty());
    }
}
