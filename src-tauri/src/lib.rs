// lib.rs — dsh-hub Tauri 2.x 壳入口（M4 Node sidecar 接入）
//
// 模块类别：Controller（壳入口）
// 职责：日志（X1 三目标）、托盘（T3.1）、单实例（T3.3）、通知（T3.5）、
//       窗口管理（T2.1-T2.4）、Node sidecar 接入（T4.1/T4.4）、
//       关闭到托盘（T3.2）、quit.marker 语义（T3.6）。
// 迁移映射：src/desktop.ts + bin/launcher.mjs → Rust 壳层。
//
// 启动流程（T4.4 SOP §5.4 步骤 4）：
//   1. 多实例检测前置（T4.2 双通道）
//   2. 启动 Node sidecar（T4.1）→ spawn dsh web --port 0
//   3. 等 stdout READY（dsh web: http://127.0.0.1:N）
//   4. READY 先验证再导航（HTTP 探测确认）
//   5. WebviewUrl::External("http://127.0.0.1:N") 建窗

mod window;
mod state;
mod theme;
mod tray;
mod single_instance;
mod os_theme;
mod notify;
mod quit;
mod node;
mod commands;
#[cfg(debug_assertions)]
mod e2e;

use log::{info, warn};
use tauri::{Listener, Manager};

/// M1 IPC 冒烟命令。
#[tauri::command]
fn ping() -> String { "pong".to_string() }

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
            return Err(format!("READY verification timeout ({:.0}s)", timeout.as_secs()));
        }
        match TcpStream::connect_timeout(&addr.parse().unwrap(), Duration::from_millis(500)) {
            Ok(_) => {
                info!("t4.4: READY verified — {addr} reachable");
                return Ok(());
            }
            Err(e) => {
                failures += 1;
                if failures >= max_failures {
                    return Err(format!("READY verification: {addr} connect failed ({e}) {failures}/{max_failures}"));
                }
                warn!("t4.4: {addr} connect failed ({e}), retry {failures}/{max_failures}");
            }
        }
        std::thread::sleep(Duration::from_millis(500));
    }
}

/// 读取 closeToTray 配置（M3 直读 $DSH_HOME/dsh-hub/config.json）。
fn read_close_to_tray() -> bool {
    read_shell_config_bool("closeToTray", true)
}

/// 读取 minimizeToTray 配置（默认 true，与 rc.14 一致）。
fn read_minimize_to_tray() -> bool {
    read_shell_config_bool("minimizeToTray", true)
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

/// Q3/Q4：Windows 未打包应用的系统 toast 需要 AUMID 才会显示
/// （tauri-plugin-notification 用 config identifier = com.marecgents.dsh-hub）。
/// 三管齐下（幂等，失败仅告警；M5 打包后 NSIS 自带快捷方式）：
///   1. 注册表 HKCU\Software\Classes\AppUserModelId\{AUMID}（DisplayName/IconUri）
///   2. 开始菜单快捷方式 + AUMID 属性（微软文档最可靠的未打包 toast 显示方式）
///   3. 桌面快捷方式（用户手动启动测试入口）
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
            Ok(out) if out.status.success() => info!("notify: AUMID {} = {} registered", name, value),
            Ok(out) => warn!("notify: AUMID {} register failed: {}", name, String::from_utf8_lossy(&out.stderr)),
            Err(e) => warn!("notify: AUMID {} register error: {}", name, e),
        }
    };
    add("DisplayName", "DeepSeek Harness Hub");
    add("IconUri", &exe_str);

    // 2+3) 开始菜单 + 桌面快捷方式（带 AUMID 属性）。
    create_toast_shortcuts(&exe);
}

/// 用 IShellLink 创建开始菜单 + 桌面快捷方式并写入 AppUserModelID（Q3/Q4）。
#[cfg(target_os = "windows")]
fn create_toast_shortcuts(exe: &std::path::Path) {
    use windows::core::{Interface, PCWSTR};
    use windows::Win32::Foundation::PROPERTYKEY;
    use windows::Win32::System::Com::{
        CoCreateInstance, CoInitializeEx, CoUninitialize, IPersistFile, CLSCTX_INPROC_SERVER, COINIT_MULTITHREADED,
    };
    use windows::Win32::System::Com::StructuredStorage::{PROPVARIANT, PropVariantClear};
    use windows::Win32::UI::Shell::PropertiesSystem::IPropertyStore;
    use windows::Win32::UI::Shell::{IShellLinkW, ShellLink};

    // PKEY_AppUserModel_ID（windows crate 未生成该常量，手写 GUID+pid）。
    const PKEY_APP_USER_MODEL_ID: PROPERTYKEY = PROPERTYKEY {
        fmtid: windows::core::GUID::from_u128(0x9F4C2855_9F79_4B39_A8D0_E1D42DE1D5F3),
        pid: 3,
    };

    let Some(appdata) = std::env::var_os("APPDATA") else { return };
    let start_menu = std::path::Path::new(&appdata)
        .join("Microsoft").join("Windows").join("Start Menu").join("Programs");
    // 桌面路径（处理 OneDrive 重定向）：SHGetKnownFolderPath(FOLDERID_Desktop)。
    let desktop = known_desktop_path();

    let targets: Vec<(std::path::PathBuf, &str)> = vec![
        (start_menu, "start-menu"),
        (desktop, "desktop"),
    ];

    for (dir, tag) in targets {
        if dir.as_os_str().is_empty() {
            continue;
        }
        let _ = std::fs::create_dir_all(&dir);
        let lnk = dir.join("DeepSeek Harness Hub.lnk");
        unsafe {
            let _ = CoInitializeEx(None, COINIT_MULTITHREADED);
            let link: IShellLinkW = match CoCreateInstance(&ShellLink, None, CLSCTX_INPROC_SERVER) {
                Ok(l) => l,
                Err(e) => { warn!("shortcut({tag}): CoCreateInstance failed: {e}"); CoUninitialize(); continue; }
            };
            let exe_w = wide(&exe.to_string_lossy());
            let _ = link.SetPath(PCWSTR(exe_w.as_ptr()));
            let wd = wide(&exe.parent().unwrap_or(std::path::Path::new("")).to_string_lossy());
            let _ = link.SetWorkingDirectory(PCWSTR(wd.as_ptr()));
            let _ = link.SetDescription(PCWSTR(wide("DeepSeek Harness Hub").as_ptr()));
            let persist: IPersistFile = match link.cast() {
                Ok(p) => p,
                Err(_) => { CoUninitialize(); continue; }
            };
            let path_w = wide(&lnk.to_string_lossy());
            if let Err(e) = persist.Save(PCWSTR(path_w.as_ptr()), true) {
                warn!("shortcut({tag}): save failed: {e}");
                CoUninitialize();
                continue;
            }
            // 写 AppUserModelID 属性（toast 显示必需）。
            let props: IPropertyStore = match link.cast() {
                Ok(p) => p,
                Err(_) => { CoUninitialize(); continue; }
            };
            let mut pv = PROPVARIANT::from("com.marecgents.dsh-hub");
            let _ = props.SetValue(&PKEY_APP_USER_MODEL_ID, &pv);
            let _ = PropVariantClear(&mut pv);
            CoUninitialize();
            info!("shortcut({tag}): created {} with AUMID", lnk.display());
        }
    }
}

/// 宽字符串辅助（含结尾 NUL）。
#[cfg(target_os = "windows")]
fn wide(s: &str) -> Vec<u16> {
    s.encode_utf16().chain(std::iter::once(0)).collect()
}

/// 解析桌面路径（FOLDERID_Desktop，处理 OneDrive 重定向）。
#[cfg(target_os = "windows")]
fn known_desktop_path() -> std::path::PathBuf {
    use windows::Win32::System::Com::CoTaskMemFree;
    use windows::Win32::UI::Shell::{FOLDERID_Desktop, KNOWN_FOLDER_FLAG, SHGetKnownFolderPath};
    unsafe {
        if let Ok(p) = SHGetKnownFolderPath(&FOLDERID_Desktop, KNOWN_FOLDER_FLAG(0), None) {
            let s = p.to_string().unwrap_or_default();
            CoTaskMemFree(Some(p.as_ptr() as _));
            if !s.is_empty() {
                return std::path::PathBuf::from(s);
            }
        }
    }
    // 兜底：%USERPROFILE%\Desktop。
    std::env::var_os("USERPROFILE").map(|u| std::path::Path::new(&u).join("Desktop")).unwrap_or_default()
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
        .invoke_handler(tauri::generate_handler![
            ping,
            commands::diag_report,
            commands::set_window_theme,
            commands::set_window_size,
            commands::get_workspace_path,
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
            // Q4：toast 显示所需 AUMID 注册（Windows 未打包应用，幂等）。
            #[cfg(target_os = "windows")]
            register_toast_aumid();

            // ── M4 流程（T4.4 SOP §5.4 步骤 4）──
            // 1. 托盘。
            let _tray = tray::setup_tray(app)?;

            // 2. 启动 Node sidecar（T4.1）。
            let node_state = std::sync::Arc::new(node::NodeState::new());
            match node::start_dsh(node_state.clone(), app.handle().clone()) {
                Ok(_) => {
                    info!("m4: dsh web sidecar starting…");
                }
                Err(e) => {
                    warn!("m4: sidecar start failed ({e}), falling back to temporary page");
                    let win = window::build_main_window(app)?;
                    let _ = theme::apply_theme(&win, tauri::Theme::Dark);
                    app.manage(node_state);
                    return Ok(());
                }
            }
            // 成功路径也需托管 NodeState：托盘命令管道（send_tray_command）经
            // app.state 取 stdin 句柄（rc.14 tray-helper 模式）。
            app.manage(node_state.clone());

            // 3. 等 READY（dsh web: http://127.0.0.1:N）。
            //    start_dsh 里后台线程解析 stdout，state.port 在 READY 后更新。
            //    轮询 state.port（最多 60s）。
            let port = {
                let start = std::time::Instant::now();
                loop {
                    let p = *node_state.port.lock().unwrap();
                    if let Some(port) = p {
                        break port;
                    }
                    if start.elapsed().as_secs() > 60 {
                        warn!("m4: READY timeout, falling back to temporary page");
                        let win = window::build_main_window(app)?;
                        let _ = theme::apply_theme(&win, tauri::Theme::Dark);
                        app.manage(node_state);
                        return Ok(());
                    }
                    std::thread::sleep(std::time::Duration::from_millis(200));
                }
            };

            info!("m4: sidecar READY on port {port}");

            // 4. READY 先验证再导航（强制步骤）。
            if let Err(e) = wait_for_ready(port) {
                warn!("m4: READY verification failed ({e}), falling back");
                let win = window::build_main_window(app)?;
                let _ = theme::apply_theme(&win, tauri::Theme::Dark);
                app.manage(node_state);
                return Ok(());
            }

            // 5. 导航到 dsh web URL（WebviewUrl::External）。
            let url = format!("http://127.0.0.1:{port}");
            info!("m4: navigating to {}", url);

            // 构建窗口指向 dsh web（而非临时页）。
            // WebviewUrl::External 解析为远程 URL。
            let external_url = tauri::WebviewUrl::External(url.parse().map_err(|e| {
                format!("invalid sidecar URL: {e}")
            })?);

            // 注入壳初始化脚本（自绘标题栏 42px + 托盘菜单 + 声音，见 shell-init.js）。
            // D-2 通道：页面→Rust 走 invoke 命令；Rust→页面走 win.eval。
            let init_script = include_str!("shell-init.js");

            let win = tauri::WebviewWindowBuilder::new(app, "main", external_url)
                .title("DeepSeek Harness Hub")
                .inner_size(1440.0, 810.0)  // 3/4 屏幕（M2 window 计算值）
                .min_inner_size(480.0, 360.0)
                .center()
                .decorations(false)
                .transparent(false)
                // Q4：浏览器侧 HTMLAudio 播放提示音——WebView2 默认自动播放策略
                // 可能拦截无用户手势的音频，放开限制（声音在 DSH_CMD 通道触发）。
                .additional_browser_args("--autoplay-policy=no-user-gesture-required")
                .initialization_script(init_script)
                .build()?;

            // 6. 应用主题（M2 DWM）。
            theme::apply_theme(&win, tauri::Theme::Dark)?;

            // 7. 事件接线（M2 resize + M3 closeToTray）。
            let win_handle = win.clone();
            win.listen("tauri://resize", move |_event| {
                if let Ok(inner) = win_handle.inner_size() {
                    let _ = state::save_window_state(state::WindowState {
                        maximized: false,
                        width: inner.width,
                        height: inner.height,
                    });
                }
            });

            // T3.2：关闭到托盘（closeToTray=true → prevent_close + hide；false → 退出）。
            // 用 on_window_event + api.prevent_close()：只有 JS 侧有 listener 时
            // tauri 才 prevent_close（manager/window.rs has_js_listener 检查），
            // Rust 侧 win.listen 不满足该条件，窗口会真正关闭导致进程退出。
            let win_handle = win.clone();
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
            let _ = win_handle;

            // Tray "Open workspace" 路径回传：client 经 invoke('open_workspace_path')
            // 上行（D-2：事件系统在 remote origin 不可用，页面→Rust 走命令）。
            // 平台打开命令在 commands::open_workspace_path 实现。

            // E2E 验证钩子（仅 debug 构建，DSH_HUB_E2E=1 启用；见 e2e.rs）。
            #[cfg(debug_assertions)]
            e2e::maybe_run_e2e(win.clone());

            info!("dsh-hub shell started (M4: full dsh web UI on port {port})");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running dsh-hub");
}
