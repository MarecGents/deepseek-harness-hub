// commands.rs — M4 Tauri commands（T4.8）
//
// 模块类别：Server（壳）
// 职责：注册 Tauri invoke 命令（仅三个）。
//   - set_window_theme(dark): 主题切换
//   - set_window_size(w, h): 窗口大小设置
//   - get_workspace_path(): 获取当前工作区路径（D4 决策：页面主动上报，壳侧预置桩）
//
// shell_command 不作为 invoke 命令暴露——托盘/侧边栏事件由 Rust 侧触发后经主桥 SSE/WS 下行。

use tauri::Manager;

/// 主题切换命令（桥桩，M2 bridge.rs 也实现过，这里统一）。
#[tauri::command]
pub fn set_window_theme(app: tauri::AppHandle, theme: String) -> Result<(), String> {
    let tauri_theme = match theme.as_str() {
        "dark" => tauri::Theme::Dark,
        "light" => tauri::Theme::Light,
        _ => return Err(format!("unknown theme: {theme}")),
    };
    if let Some(win) = app.get_webview_window("main") {
        crate::theme::apply_theme(&win, tauri_theme).map_err(|e| e.to_string())
    } else {
        Err("main window not found".to_string())
    }
}

/// 窗口大小设置命令。
#[tauri::command]
pub fn set_window_size(app: tauri::AppHandle, width: f64, height: f64) -> Result<(), String> {
    if let Some(win) = app.get_webview_window("main") {
        let size = tauri::Size::Logical(tauri::LogicalSize::new(width, height));
        win.set_size(size).map_err(|e| e.to_string())
    } else {
        Err("main window not found".to_string())
    }
}

/// 工作区路径命令（D4 决策：页面主动上报，壳侧预置桩）。
/// 返回当前工作区目录路径（从 dsh web 会话状态获取）。
/// M4 初版：读 session 文件或 env；完整版待主桥就绪后走桥查询。
#[tauri::command]
pub fn get_workspace_path() -> String {
    // TODO(M4 完整版): 经主桥 POST 向页面查询（D4 决策：页面主动上报）
    // 当前桩：返回 env 或 DSH_HOME。
    std::env::var("DSH_HUB_WORKSPACE")
        .unwrap_or_else(|_| crate::state::dsh_home().to_string_lossy().to_string())
}
