// bridge.rs — M2 壳-前端桥接桩（T2.5）
//
// 模块类别：Services（壳）
// 职责：Tauri IPC 命令桩（本地窗口内 invoke）。
//       set_window_theme：前端主题切换 → Rust 壳设置主题 + DWM。
//       M4 起，远程页走主桥 HTTP POST（方案 B），invoke 保留为壳内页快速路径。
// 外部接口：set_window_theme（Tauri command）。

use tauri::{Manager, Theme};
use crate::theme::apply_theme;

/// 前端调用设置窗口主题（T2.5 桥桩）。
///
/// M2 实现：本地窗口内 invoke。
/// M4 扩展：远程页走主桥 HTTP POST（方案 B）。
///
/// # 参数
/// - `app`: Tauri 应用句柄（invoke 自动注入）
/// - `theme`: 主题名称（"dark" / "light"）
#[tauri::command]
pub fn set_window_theme(app: tauri::AppHandle, theme: String) -> Result<(), String> {
    let tauri_theme = match theme.as_str() {
        "dark" => Theme::Dark,
        "light" => Theme::Light,
        _ => return Err(format!("unknown theme: {theme}")),
    };

    // 取主窗口（label="main"）。
    let win = app
        .get_webview_window("main")
        .ok_or("main window not found")?;

    apply_theme(&win, tauri_theme).map_err(|e| e.to_string())
}
