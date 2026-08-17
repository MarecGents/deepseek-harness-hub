// lib.rs — dsh-hub Tauri 2.x 壳入口（M2 窗口管理）
//
// 模块类别：Controller（壳入口）
// 职责：日志（X1 三目标）、ping 命令、主窗口创建（T2.1）、
//       窗口状态持久化（T2.2）、主题管理（T2.3）、窗口事件接线（T2.4）。
// 迁移映射：src/desktop.ts 的窗口生命周期 → Rust 壳层。

mod window;
mod state;
mod theme;
mod bridge;

use log::info;
use tauri::Listener;

/// M1 IPC 冒烟命令。
#[tauri::command]
fn ping() -> String { "pong".to_string() }

pub fn run() {
    let log_dir = state::dsh_home().join("dsh-hub").join("logs");

    tauri::Builder::default()
        // X1 日志三目标：Stdout + Webview + Folder($DSH_HOME/dsh-hub/logs/)。
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
        .invoke_handler(tauri::generate_handler![
            ping,
            bridge::set_window_theme,
        ])
        .setup(|app| {
            // T2.1：构建主窗口（尺寸解析 / 最小尺寸 / 居中 / 最大化恢复）。
            let win = window::build_main_window(app)?;

            // T2.2：读取已持久化的窗口状态（rc.14 遗留兼容）。
            let persisted = state::load_window_state();
            if persisted.maximized {
                win.maximize().ok();
            }

            // T2.3：应用初始主题（默认 Dark，与 rc.14 一致）。
            theme::apply_theme(&win, tauri::Theme::Dark)?;

            // T2.4：接线 resize 事件 → 状态持久化。
            // listen() 需要 window handle（WebviewWindow 有 listen 方法）。
            let win_handle = win.clone();
            win.listen("tauri://resize", move |_event| {
                if let Ok(inner) = win_handle.inner_size() {
                    let _ = state::save_window_state(state::WindowState {
                        maximized: false, // resize = 非最大化
                        width: inner.width,
                        height: inner.height,
                    });
                }
            });

            // CloseRequested 桩（M3 closeToTray 完整实现）。
            // TODO(M3): use win_handle for window.hide() + api.prevent_exit()
            let _win_handle = win.clone();
            win.listen("tauri://close-requested", move |_event| {
                info!("close-requested (M3 closeToTray 桩，暂放行退出)");
            });

            info!("dsh-hub shell started (M2 window management)");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running dsh-hub");
}
