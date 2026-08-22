// tray.rs — M3 系统托盘（T3.1）
//
// 模块类别：Manager（壳）
// 职责：系统托盘（TrayIconBuilder + 原生菜单）。
//   - 左键单击/双击 → 显示窗口（Q7：左键可打开界面）。
//   - 右键 → **原生菜单**（Q1：系统渲染、出现在鼠标位置；放弃自绘 HTML 菜单）。
//     菜单项：显示/隐藏主界面（label 随窗口可见性动态）、打开工作区、新建会话、
//     退出。打开工作区/新建会话经 win.eval 派发同页 CustomEvent → client 处理
//     （D-2：事件系统在 remote origin 不可用，Rust→页面用 eval）。
//   - 托盘图标随用户桌面图标选择（S6）：'default' 主题翻转白/黑鲸、鲸鱼娘固定，
//     与窗口/任务栏图标共用 theme::desktop_icon_png 内嵌资产。
//
// 外部接口：setup_tray(app)；set_tray_icon(app, icon_id)；
//           sync_toggle_label(app)（窗口可见性变化时刷新菜单 label）。

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

/// 托盘 ID（set_tray_icon 经 tray_by_id 定位；默认 id 不稳定，显式声明）。
const TRAY_ID: &str = "dsh-hub-tray";

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
    // include_bytes! 编译期内嵌：打包态不存在 CARGO_MANIFEST_DIR/icons/32x32.png
    // 的文件路径（env! 展开为打包机的源路径，安装到新电脑后 from_path 必失败，
    // 曾导致 setup 返回 Err → expect panic → 窗口刚显示进程就消失）。
    let icon = tauri::image::Image::from_bytes(include_bytes!("../../icons/32x32.png"))
        .map_err(|e| format!("load tray icon: {e}"))?;

    let tray = TrayIconBuilder::with_id(TRAY_ID)
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

/// 托盘图标跟随用户桌面图标选择（S6，PR #25）：'default' 随主题翻转白/黑鲸，
/// 鲸鱼娘固定。与窗口 SMALL/BIG 图标共用 theme::desktop_icon_png 内嵌资产
/// （同份 static，零额外打包）。失败仅 warn（不得破坏设置链路）。
pub fn set_tray_icon(app: &tauri::AppHandle, icon_id: &str) {
    let Some(tray) = app.tray_by_id(TRAY_ID) else {
        log::warn!("tray: set_tray_icon skipped (tray '{}' not found)", TRAY_ID);
        return;
    };
    let dark = app
        .get_webview_window("main")
        .map(|w| w.theme().unwrap_or(tauri::Theme::Dark) == tauri::Theme::Dark)
        .unwrap_or(true);
    let (bytes, name) = crate::theme::desktop_icon_png(dark, icon_id);
    match tauri::image::Image::from_bytes(bytes) {
        Ok(img) => match tray.set_icon(Some(img)) {
            Ok(_) => info!("tray: icon set ({})", name),
            Err(e) => log::warn!("tray: set_icon({}) failed: {}", name, e),
        },
        Err(e) => log::warn!("tray: decode {} failed: {}", name, e),
    }
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
            // rc.14 tray-helper 模式：托盘命令经独立进程管道（dsh web stdin）下行
            // → host 插件 → 页面 dispatchPageEvent（__mgShellReady 重试，页面未就绪
            // 不丢命令）。比 win.eval 更可靠（Q2 用户指定）。
            let command = if event.id().as_ref() == MENU_OPEN_WORKSPACE { "open-workspace" } else { "new-task" };
            crate::node::send_tray_command(app, command);
            info!("tray: menu '{}' → sent via stdin pipe", command);
        }
        MENU_QUIT => {
            info!("tray: quit requested");
            // 先杀 sidecar（dsh web 子进程），防孤儿进程残留占用端口。
            if let Some(state) = app.try_state::<std::sync::Arc<crate::node::NodeState>>() {
                crate::node::stop_dsh(&state);
            }
            crate::quit::write_quit_marker();
            std::process::exit(0);
        }
        _ => {}
    }
}
