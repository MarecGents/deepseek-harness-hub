// tray.rs — M3 系统托盘（T3.1）
//
// 模块类别：Manager（壳）
// 职责：系统托盘（TrayIconBuilder + 原生菜单）。
//   - 左键单击/双击 → 显示窗口（Q7：左键可打开界面）。
//   - 右键 → **原生菜单**（Q1：系统渲染、出现在鼠标位置；放弃自绘 HTML 菜单）。
//     菜单项：显示/隐藏主界面（label 随窗口可见性动态）、打开工作区、新建会话、
//     退出。打开工作区/新建会话经 win.eval 派发同页 CustomEvent → client 处理
//     （D-2：事件系统在 remote origin 不可用，Rust→页面用 eval）。
//
// 外部接口：setup_tray(app)；sync_toggle_label(app)（窗口可见性变化时刷新菜单 label）。

use std::sync::Mutex;
use tauri::{
    App, Manager, WebviewWindow,
    menu::{Menu, MenuItem, MenuEvent},
    tray::{MouseButton, MouseButtonState, TrayIcon, TrayIconBuilder, TrayIconEvent},
};
use log::info;

/// 菜单项 ID 常量。
const MENU_TOGGLE: &str = "toggle";
const MENU_OPEN_WORKSPACE: &str = "open-workspace";
const MENU_NEW_TASK: &str = "new-task";
const MENU_QUIT: &str = "quit";

/// 托盘菜单句柄（供 sync_toggle_label 动态改「显示/隐藏主界面」label）。
pub struct TrayMenuHandles {
    pub toggle: MenuItem<tauri::Wry>,
}

/// 设置托盘（T3.1）。
pub fn setup_tray(app: &App) -> Result<TrayIcon, Box<dyn std::error::Error>> {
    let toggle_item = MenuItem::with_id(app, MENU_TOGGLE, "显示主界面", true, None::<&str>)?;
    let open_ws = MenuItem::with_id(app, MENU_OPEN_WORKSPACE, "打开工作区", true, None::<&str>)?;
    let new_task = MenuItem::with_id(app, MENU_NEW_TASK, "新建会话", true, None::<&str>)?;
    let quit_item = MenuItem::with_id(app, MENU_QUIT, "退出", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&toggle_item, &open_ws, &new_task, &quit_item])?;
    app.manage(Mutex::new(TrayMenuHandles { toggle: toggle_item }));

    // 内嵌 PNG 图标（tauri `image` feature 解码 PNG）。
    let icon_path = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("icons").join("32x32.png");
    let icon = tauri::image::Image::from_path(icon_path).map_err(|e| format!("load tray icon: {e}"))?;

    let tray = TrayIconBuilder::new()
        .icon(icon)
        .menu(&menu)
        .on_menu_event(handle_menu_event)
        .on_tray_icon_event(|tray, event| {
            let app_handle = tray.app_handle();

            // 统一恢复例程：窗口可能处于「最小化后隐藏到托盘」状态（minimizeToTray），
            // 必须先 unminimize 再 show，否则 ShowWindow 只把最小化窗口显示到任务栏。
            fn restore(win: &WebviewWindow) {
                let _ = win.unminimize();
                let _ = win.show();
            }

            // 左键单击 → 显示窗口并置顶到最前端（Q7：左键可打开界面）。
            if let TrayIconEvent::Click { button: MouseButton::Left, button_state: MouseButtonState::Up, .. } = event {
                if let Some(win) = app_handle.get_webview_window("main") {
                    restore(&win);
                    let _ = win.set_always_on_top(true);
                    let _ = win.set_focus();
                    let _ = win.set_always_on_top(false);
                    sync_toggle_label(app_handle);
                    info!("tray: left-click → show + focus main window");
                }
            }
            // 双击也显示（Q7：左键双击兼容保留）。
            if let TrayIconEvent::DoubleClick { .. } = event {
                if let Some(win) = app_handle.get_webview_window("main") {
                    restore(&win);
                    let _ = win.set_focus();
                    sync_toggle_label(app_handle);
                    info!("tray: double-click → show + focus main window");
                }
            }
            // 右键：原生菜单由系统在鼠标位置弹出（无需处理；菜单事件走 on_menu_event）。
        })
        .show_menu_on_left_click(false)
        .tooltip("DeepSeek Harness Hub")
        .build(app)?;

    // 初始 label 同步。
    sync_toggle_label(app.handle());
    info!("tray: setup complete (native menu, left-click=show)");
    Ok(tray)
}

/// 刷新「显示/隐藏主界面」菜单项 label（Q1）。
/// 定义：窗口可见且在前端（可直视内容、叠加于所有窗口之上）→「隐藏主界面」；
/// 否则（含任务栏最小化/最小化到托盘/关闭到托盘）→「显示主界面」。
pub fn sync_toggle_label(app: &tauri::AppHandle) {
    let text = match app.get_webview_window("main") {
        Some(win) if win.is_visible().unwrap_or(false) && !win.is_minimized().unwrap_or(true) => "隐藏主界面",
        _ => "显示主界面",
    };
    if let Some(st) = app.try_state::<Mutex<TrayMenuHandles>>() {
        let handles = st.lock().unwrap();
        let _ = handles.toggle.set_text(text);
    }
}

/// 处理原生菜单事件。
fn handle_menu_event(app: &tauri::AppHandle, event: MenuEvent) {
    match event.id().as_ref() {
        MENU_TOGGLE => {
            // 显示/隐藏主界面（由 window_toggle_visible 按当前可见性判断）。
            let _ = crate::commands::window_toggle_visible(app.clone());
        }
        MENU_OPEN_WORKSPACE | MENU_NEW_TASK => {
            // D-2：Rust→页面走 win.eval 派发同页 CustomEvent → client handleShellCommand。
            let command = if event.id().as_ref() == MENU_OPEN_WORKSPACE { "open-workspace" } else { "new-task" };
            if let Some(win) = app.get_webview_window("main") {
                let js = format!(
                    "window.dispatchEvent(new CustomEvent('mg:shell-command',{{detail:{{command:'{}'}}}}))",
                    command
                );
                let _ = win.eval(&js);
            }
            info!("tray: menu '{}' → dispatch mg:shell-command", command);
        }
        MENU_QUIT => {
            info!("tray: quit requested");
            crate::quit::write_quit_marker();
            std::process::exit(0);
        }
        _ => {}
    }
}
