// tray.rs — M3 系统托盘（T3.1）
//
// 模块类别：Manager（壳）
// 职责：系统托盘（TrayIconBuilder + MenuBuilder + 事件处理），
//       对齐 desktop.ts 托盘逻辑（tray-helper.mjs / launcher.mjs）。
// 外部接口：setup_tray(app)。

use tauri::{
    App, Manager,
    tray::{TrayIcon, TrayIconBuilder, TrayIconEvent},
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
            if let TrayIconEvent::DoubleClick { .. } = event {
                // 双击托盘 → 显示/聚焦主窗口（T3.1）。
                if let Some(win) = tray.app_handle().get_webview_window("main") {
                    let _ = win.show();
                    let _ = win.set_focus();
                }
            }
        })
        .tooltip("DeepSeek Harness Hub")
        .build(app)?;

    info!("tray: setup complete (4-menu, double-click=show)");
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
            // TODO(M4): 经 sidecar 向前端 emit "open-workspace"
            info!("tray: open-workspace (M4 sidecar 后向主桥 emit)");
        }
        MENU_NEW_TASK => {
            // TODO(M4): 经 sidecar 向前端 emit "new-task"
            info!("tray: new-task (M4 sidecar 后向主桥 emit)");
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
