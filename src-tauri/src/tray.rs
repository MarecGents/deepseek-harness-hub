// tray.rs — M3 系统托盘（T3.1）
//
// 模块类别：Manager（壳）
// 职责：系统托盘（TrayIconBuilder + 事件处理）。
//   - 左键单击/双击 → 显示窗口（Q7：左键单/双可打开界面）。
//   - 右键 → 自绘皮肤菜单状态机（Q5/Q7）：窗口移到光标所在显示器工作区
//     右下角（贴托盘）→ 置顶 → eval 打开 HTML 菜单；关闭后还原原位置/
//     隐藏态。菜单本身由 shell-init.js 渲染（原生菜单无法样式化）。
//
// 外部接口：setup_tray(app)；TrayMenuState / close_menu（commands.rs 复用）。

use std::sync::Mutex;
use tauri::{
    App, Manager, WebviewWindow,
    tray::{MouseButton, MouseButtonState, TrayIcon, TrayIconBuilder, TrayIconEvent},
};
use log::{info, warn};

/// 托盘菜单弹出状态（右键菜单打开期间窗口被移到托盘角）。
pub struct TrayMenuState {
    /// 菜单当前是否打开。
    pub open: bool,
    /// 打开菜单前窗口是否可见（关闭菜单后据此还原隐藏态）。
    pub was_visible: bool,
    /// 打开菜单前窗口位置（关闭菜单后还原）。
    pub original_pos: Option<(i32, i32)>,
}

impl Default for TrayMenuState {
    fn default() -> Self {
        Self {
            open: false,
            was_visible: true,
            original_pos: None,
        }
    }
}

/// 设置托盘（T3.1）。
pub fn setup_tray(app: &App) -> Result<TrayIcon, Box<dyn std::error::Error>> {
    app.manage(Mutex::new(TrayMenuState::default()));

    // 内嵌 PNG 图标（tauri `image` feature 解码 PNG）。
    let icon_path = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("icons").join("32x32.png");
    let icon = tauri::image::Image::from_path(icon_path).map_err(|e| format!("load tray icon: {e}"))?;

    let tray = TrayIconBuilder::new()
        .icon(icon)
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
                    info!("tray: left-click → show + focus main window");
                }
            }
            // 双击也显示（Q7：左键双击兼容保留）。
            if let TrayIconEvent::DoubleClick { .. } = event {
                if let Some(win) = app_handle.get_webview_window("main") {
                    restore(&win);
                    let _ = win.set_focus();
                    info!("tray: double-click → show + focus main window");
                }
            }
            // 右键 → 自绘皮肤菜单状态机（Q5：跟随鼠标/置顶；Q7：不强行唤醒）。
            if let TrayIconEvent::Click { button: MouseButton::Right, button_state: MouseButtonState::Up, .. } = event {
                if let Some(win) = app_handle.get_webview_window("main") {
                    let st = app_handle.state::<Mutex<TrayMenuState>>();
                    let mut s = st.lock().unwrap();
                    if s.open {
                        // 已开 → 关闭并还原（再右键 = 收起菜单）。
                        let _ = win.eval("window.__mgTrayMenuClose && window.__mgTrayMenuClose()");
                        close_menu(&win, &mut s);
                        info!("tray: right-click → menu closed");
                    } else {
                        // 打开：记录原状态 → 移托盘角（跟随鼠标）→ 置顶 → eval 打开。
                        s.was_visible = win.is_visible().unwrap_or(true);
                        s.original_pos = win.outer_position().ok().map(|p| (p.x, p.y));
                        if !s.was_visible {
                            let _ = win.show();
                        }
                        move_to_tray_corner(&win);
                        let _ = win.set_always_on_top(true);
                        let label = if s.was_visible { "hide" } else { "show" };
                        let js = format!(
                            "window.__mgTrayMenuOpen && window.__mgTrayMenuOpen('{}')",
                            label
                        );
                        let _ = win.eval(&js);
                        s.open = true;
                        info!("tray: right-click → menu open (label={}, was_visible={})", label, s.was_visible);
                    }
                }
            }
        })
        .tooltip("DeepSeek Harness Hub")
        .build(app)?;

    info!("tray: setup complete (left-click=show, right-click=custom skin menu)");
    Ok(tray)
}

/// 关闭托盘菜单后还原窗口（还原位置/去置顶/恢复隐藏态）。
/// 页面任意关闭路径（外部点击/Esc/菜单项）都会 invoke tray_menu_closed 触发。
pub fn close_menu(win: &WebviewWindow, s: &mut TrayMenuState) {
    s.open = false;
    let _ = win.set_always_on_top(false);
    if let Some((x, y)) = s.original_pos.take() {
        let _ = win.set_position(tauri::PhysicalPosition::new(x, y));
    }
    if !s.was_visible {
        let _ = win.hide();
    }
}

/// 把窗口移到光标所在显示器的工作区右下角（贴托盘图标，Q5 跟随鼠标）。
fn move_to_tray_corner(win: &WebviewWindow) {
    let monitor = match win.cursor_position() {
        Ok(cursor) => win.monitor_from_point(cursor.x, cursor.y).ok().flatten(),
        Err(_) => None,
    }
    .or_else(|| win.primary_monitor().ok().flatten());

    let Some(monitor) = monitor else {
        warn!("tray: no monitor found for tray-corner placement");
        return;
    };
    let area = monitor.work_area();
    let size = win.outer_size().unwrap_or_default();
    let x = area.position.x + area.size.width as i32 - size.width as i32 - 8;
    let y = area.position.y + area.size.height as i32 - size.height as i32 - 8;
    let _ = win.set_position(tauri::PhysicalPosition::new(
        x.max(area.position.x),
        y.max(area.position.y),
    ));
}
