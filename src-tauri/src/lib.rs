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
    let config_path = state::dsh_home().join("dsh-hub").join("config.json");
    match std::fs::read_to_string(&config_path) {
        Ok(content) => serde_json::from_str::<serde_json::Value>(&content)
            .ok()
            .and_then(|json| json.get("closeToTray").and_then(|v| v.as_bool()))
            .unwrap_or(true),
        Err(_) => true,
    }
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
        .invoke_handler(tauri::generate_handler![
            ping,
            commands::set_window_theme,
            commands::set_window_size,
            commands::get_workspace_path,
            notify::notify_task_complete,
        ])
        .setup(|app| {
            // ── M4 流程（T4.4 SOP §5.4 步骤 4）──
            // 1. 托盘。
            let _tray = tray::setup_tray(app)?;

            // 2. 启动 Node sidecar（T4.1）。
            let node_state = std::sync::Arc::new(node::NodeState::new());
            match node::start_dsh(node_state.clone()) {
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

            let win = tauri::WebviewWindowBuilder::new(app, "main", external_url)
                .title("DeepSeek Harness Hub")
                .inner_size(1440.0, 810.0)  // 3/4 屏幕（M2 window 计算值）
                .min_inner_size(480.0, 360.0)
                .center()
                .decorations(false)
                .transparent(false)
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

            let win_handle = win.clone();
            let close_to_tray = read_close_to_tray();
            win.listen("tauri://close-requested", move |_event| {
                if close_to_tray {
                    let _ = win_handle.hide();
                    info!("close-requested: closeToTray=true, hiding window");
                } else {
                    quit::write_quit_marker();
                    info!("close-requested: closeToTray=false, writing quit.marker and exiting");
                    std::process::exit(0);
                }
            });

            info!("dsh-hub shell started (M4: full dsh web UI on port {port})");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running dsh-hub");
}
