// tray.rs — M3 系统托盘（T3.1）
//
// 模块类别：Manager（壳）
// 职责：系统托盘（TrayIconBuilder + 事件处理）。
//       T4.x：原生托盘菜单无法自定义样式（平台限制）→ 自绘 HTML 菜单浮层：
//         右键 → 显示窗口 + app.emit("mg:tray-menu-open") → init_script 在页面
//         右下角弹出皮肤跟随的菜单（背景/文字/边框随皮肤切换）；
//         左键 → 显示窗口并置顶（快速唤起，不弹菜单）。
// 外部接口：setup_tray(app) -> TrayIcon。
//
// 迁移映射：bin/tray-helper.mjs（WebView2 时代托盘）+ src/desktop.ts 托盘逻辑。

use tauri::{
    App, Manager,
    tray::{MouseButton, MouseButtonState, TrayIcon, TrayIconBuilder, TrayIconEvent},
};
use log::info;

/// 设置托盘（T3.1）。
pub fn setup_tray(app: &App) -> Result<TrayIcon, Box<dyn std::error::Error>> {
    // 内嵌 PNG 图标（tauri `image` feature 解码 PNG）。
    let icon_path = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("icons").join("32x32.png");
    let icon = tauri::image::Image::from_path(icon_path).map_err(|e| format!("load tray icon: {e}"))?;

    let tray = TrayIconBuilder::new()
        .icon(icon)
        .on_tray_icon_event(|tray, event| {
            let app_handle = tray.app_handle();
            // 统一恢复例程：窗口可能处于「最小化后隐藏到托盘」状态（minimizeToTray），
            // 必须先 unminimize 再 show，否则 ShowWindow 只把最小化窗口显示到任务栏。
            fn restore(win: &tauri::WebviewWindow) {
                let _ = win.unminimize();
                let _ = win.show();
            }
            // 左键单击 → 显示窗口并置顶到最前端（Windows 托盘左键惯例：快速唤起）。
            if let TrayIconEvent::Click { button: MouseButton::Left, button_state: MouseButtonState::Up, .. } = event {
                if let Some(win) = app_handle.get_webview_window("main") {
                    restore(&win);
                    // 置顶闪烁：临时 always-on-top 强制窗口到最前，再还原（不保持常驻置顶）。
                    let _ = win.set_always_on_top(true);
                    let _ = win.set_focus();
                    let _ = win.set_always_on_top(false);
                    info!("tray: left-click → show + focus main window");
                }
            }
            // 右键单击 → 显示窗口 + 打开自绘皮肤跟随菜单（替代无法美化的原生菜单）。
            // Rust→页面走 win.eval（D-2 实测：事件系统在 remote origin 不可用）。
            if let TrayIconEvent::Click { button: MouseButton::Right, button_state: MouseButtonState::Up, .. } = event {
                if let Some(win) = app_handle.get_webview_window("main") {
                    restore(&win);
                    let _ = win.set_focus();
                    let _ = win.eval("window.__mgTrayMenuToggle && window.__mgTrayMenuToggle()");
                }
                info!("tray: right-click → show window + open custom menu (eval __mgTrayMenuToggle)");
            }
            // 双击也显示（兼容保留）。
            if let TrayIconEvent::DoubleClick { .. } = event {
                if let Some(win) = app_handle.get_webview_window("main") {
                    restore(&win);
                    let _ = win.set_focus();
                    info!("tray: double-click → show + focus main window");
                }
            }
        })
        .tooltip("DeepSeek Harness Hub")
        .build(app)?;

    info!("tray: setup complete (left-click=show, right-click=custom skin menu)");
    Ok(tray)
}
