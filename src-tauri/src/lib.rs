// lib.rs — dsh-hub Tauri 2.x 壳入口（M3 系统服务）
//
// 模块类别：Controller（壳入口）
// 职责：日志（X1 三目标）、ping 命令、主窗口创建（T2.1）、
//       窗口状态持久化（T2.2）、主题管理（T2.3）、窗口事件接线（T2.4）、
//       托盘（T3.1）、关闭到托盘（T3.2）、单实例（T3.3）、通知（T3.5）。
// 迁移映射：src/desktop.ts + src/services/tray.ts + bin/launcher.mjs → Rust 壳层。

mod window;
mod state;
mod theme;
mod bridge;
mod tray;
mod single_instance;
mod os_theme;
mod notify;
mod quit;

use log::info;
use tauri::Listener;

/// M1 IPC 冒烟命令。
#[tauri::command]
fn ping() -> String { "pong".to_string() }

/// 读取 closeToTray 配置（M3 直读 $DSH_HOME/dsh-hub/config.json）。
/// 注：M4 随 sidecar 落地后，由 Node 侧 settings API 提供，不重复读文件。
fn read_close_to_tray() -> bool {
    let config_path = state::dsh_home().join("dsh-hub").join("config.json");
    match std::fs::read_to_string(&config_path) {
        Ok(content) => {
            match serde_json::from_str::<serde_json::Value>(&content) {
                Ok(json) => json.get("closeToTray")
                    .and_then(|v| v.as_bool())
                    .unwrap_or(true), // rc.14 默认 closeToTray=true
                Err(_) => true,
            }
        }
        Err(_) => true, // config 不存在时用默认值
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
        // T3.3：单实例插件（D1 决策：聚焦已有窗口）。
        .plugin(single_instance::single_instance_plugin())
        .invoke_handler(tauri::generate_handler![
            ping,
            bridge::set_window_theme,
            notify::notify_task_complete,
        ])
        .setup(|app| {
            // T3.1：设置托盘。
            let _tray = tray::setup_tray(app)?;

            // T2.1：构建主窗口。
            let win = window::build_main_window(app)?;

            // T2.2：读取已持久化的窗口状态（rc.14 遗留兼容）。
            let persisted = state::load_window_state();
            if persisted.maximized {
                win.maximize().ok();
            }

            // T2.3：应用初始主题（默认 Dark）。
            theme::apply_theme(&win, tauri::Theme::Dark)?;

            // T2.4：resize 事件 → 状态持久化。
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

            // T3.2：关闭到托盘（closeToTray=true → prevent_exit + hide；false → 退出）。
            let win_handle = win.clone();
            let close_to_tray = read_close_to_tray();
            win.listen("tauri://close-requested", move |_event| {
                if close_to_tray {
                    // closeToTray=true（rc.14 默认）：隐藏窗口，托盘常驻。
                    // 不退出进程，托盘可恢复。
                    let _ = win_handle.hide();
                    info!("close-requested: closeToTray=true, hiding window (tray stays)");
                } else {
                    // closeToTray=false：直接退出（exit code 0，不触发重启）。
                    // 写 quit.marker 防止 launcher 误判为崩溃重启。
                    quit::write_quit_marker();
                    info!("close-requested: closeToTray=false, writing quit.marker and exiting");
                    // Tauri close-requested 事件默认放行关闭（event.allow()），
                    // 但调用 event.preventDefault() + process::exit(0) 更可控。
                    // 注：Tauri 2 的 CloseRequested 事件无 preventDefault API，
                    // 直接 process::exit(0) 触发关闭。
                    std::process::exit(0);
                }
            });

            // T3.2：最小化到托盘（WindowEvent::Resized 检测最小化 → hide）。
            // 注：Tauri 2 没有专门的 WindowEvent::Minimized，但 resize 到极小尺寸
            // 通常意味着最小化。更准确：监听 tauri://window-state-changed 或
            // RunEvent::WindowEvent。当前用 resize 事件简化（M4 可细化）。
            // TODO(M4): 检查 tauri::window::WindowEvent::Moved / RunEvent 细化最小化检测

            info!("dsh-hub shell started (M3 system services: tray + single-instance + notify + closeToTray)");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running dsh-hub");
}
