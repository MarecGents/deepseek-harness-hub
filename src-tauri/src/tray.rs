// tray.rs — M3 系统托盘（T3.1）
//
// 模块类别：Manager（壳）
// 职责：系统托盘（TrayIconBuilder + MenuBuilder + 事件处理），
//       对齐 desktop.ts 托盘逻辑（tray-helper.mjs / launcher.mjs）。
// 外部接口：setup_tray(app)。

use tauri::{
    App, Emitter, Manager,
    tray::{MouseButton, MouseButtonState, TrayIcon, TrayIconBuilder, TrayIconEvent},
    menu::{Menu, MenuItem, MenuEvent},
};
use log::info;

/// 菜单 ID 常量。
const MENU_SHOW: &str = "show";
const MENU_OPEN_WORKSPACE: &str = "open-workspace";
const MENU_NEW_TASK: &str = "new-task";
const MENU_QUIT: &str = "quit";

/// 设置托盘（T3.1）。
pub fn setup_tray(app: &App) -> Result<TrayIcon, Box<dyn std::error::Error>> {
    // T3.1：4 菜单项。
    let show_item = MenuItem::with_id(app, MENU_SHOW, "显示主界面", true, None::<&str>)?;
    let open_ws = MenuItem::with_id(app, MENU_OPEN_WORKSPACE, "打开工作区", true, None::<&str>)?;
    let new_task = MenuItem::with_id(app, MENU_NEW_TASK, "新建任务", true, None::<&str>)?;
    let quit_item = MenuItem::with_id(app, MENU_QUIT, "退出", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&show_item, &open_ws, &new_task, &quit_item])?;

    // 内嵌 PNG 图标（tauri `image` feature 解码 PNG）。
    // 注：Image::from_bytes 有编译条件限制（需 `image` crate feature + 全特性），
    //     改用 from_path 加载 icons/32x32.png（编译时路径相对于 Cargo.toml）。
    let icon_path = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("icons").join("32x32.png");
    let icon = tauri::image::Image::from_path(icon_path).map_err(|e| format!("load tray icon: {e}"))?;

    let tray = TrayIconBuilder::new()
        .icon(icon)
        .menu(&menu)
        .on_menu_event(handle_menu_event)
        .on_tray_icon_event(|tray, event| {
            // 左键单击 → 显示窗口并置顶到最前端（Windows 左键不弹菜单，见 show_menu_on_left_click(false)）。
            // 选择「单击」而非双击：响应即时、无双击延迟感（现代托盘习惯，如微信/QQ）。
            if let TrayIconEvent::Click { button: MouseButton::Left, button_state: MouseButtonState::Up, .. } = event {
                if let Some(win) = tray.app_handle().get_webview_window("main") {
                    let _ = win.show();
                    // 置顶闪烁：临时 always-on-top 强制窗口到最前，再还原（不保持常驻置顶）。
                    let _ = win.set_always_on_top(true);
                    let _ = win.set_focus();
                    let _ = win.set_always_on_top(false);
                    info!("tray: left-click → show + focus main window");
                }
            }
            // 双击也显示（兼容保留）。
            if let TrayIconEvent::DoubleClick { .. } = event {
                if let Some(win) = tray.app_handle().get_webview_window("main") {
                    let _ = win.show();
                    let _ = win.set_focus();
                }
            }
        })
        .show_menu_on_left_click(false)
        .tooltip("DeepSeek Harness Hub")
        .build(app)?;

    info!("tray: setup complete (4-menu, left-click=show, right-click=menu)");
    Ok(tray)
}

/// 处理菜单事件（T3.1）。
fn handle_menu_event(app: &tauri::AppHandle, event: MenuEvent) {
    match event.id().as_ref() {
        MENU_SHOW => {
            if let Some(win) = app.get_webview_window("main") {
                let _ = win.show();
                let _ = win.set_focus();
                info!("tray: show main window");
            }
        }
        MENU_OPEN_WORKSPACE => {
            // 经 app.emit 下行 mg:shell-command → init_script 桥 → 页面 CustomEvent
            // → dsh-hub client 的 __mgGetCurrentWorkspace 处理（rc.14 等价路径）。
            info!("tray: open-workspace → dispatch mg:shell-command");
            let _ = app.emit("mg:shell-command", serde_json::json!({ "command": "open-workspace" }));
        }
        MENU_NEW_TASK => {
            // 经 app.emit 下行 mg:shell-command → init_script 桥 → 页面 CustomEvent
            // → dsh-hub client 的 handleShellCommand（workspaces.startSession）。
            info!("tray: new-task → dispatch mg:shell-command");
            let _ = app.emit("mg:shell-command", serde_json::json!({ "command": "new-task" }));
        }
        MENU_QUIT => {
            // 写 quit.marker → process::exit(0)（对应 launcher quit.marker 语义）。
            info!("tray: quit requested");
            crate::quit::write_quit_marker();
            std::process::exit(0);
        }
        _ => {}
    }
}
