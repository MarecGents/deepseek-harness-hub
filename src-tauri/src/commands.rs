// commands.rs — M4 Tauri commands（T4.8）
//
// 模块类别：Server（壳）
// 职责：注册 Tauri invoke 命令。
//   - set_window_theme(dark): 主题切换
//   - set_window_size(w, h): 窗口大小设置
//   - get_workspace_path(): 获取当前工作区路径（D4 决策：页面主动上报，壳侧预置桩）
//   - window_minimize / window_toggle_maximize / window_close: 自绘标题栏窗口控制
//
// 自绘标题栏按钮经 `invoke('window_minimize')` 等调用；不用猜测 Tauri
// 内部 `plugin:window|*` 命令名（跨版本不稳定）。

use tauri::Manager;

/// 诊断命令：页面按钮点击时上报，用于验证 remote origin 的 invoke 链路。
#[tauri::command]
pub fn diag_report(app: tauri::AppHandle, msg: String) -> Result<(), String> {
    log::info!("diag_report from page: {}", msg);
    let _ = app; // 占位，保持签名一致性
    Ok(())
}

/// 窗口最小化（自绘标题栏按钮）。
#[tauri::command]
pub fn window_minimize(app: tauri::AppHandle) -> Result<(), String> {
    log::info!("window_minimize invoked from page");
    if let Some(win) = app.get_webview_window("main") {
        win.minimize().map_err(|e| e.to_string())
    } else {
        Err("main window not found".to_string())
    }
}

/// 窗口最大化/还原切换（自绘标题栏按钮）。
#[tauri::command]
pub fn window_toggle_maximize(app: tauri::AppHandle) -> Result<(), String> {
    log::info!("window_toggle_maximize invoked from page");
    if let Some(win) = app.get_webview_window("main") {
        let is_max = win.is_maximized().map_err(|e| e.to_string())?;
        if is_max {
            win.unmaximize().map_err(|e| e.to_string())
        } else {
            win.maximize().map_err(|e| e.to_string())
        }
    } else {
        Err("main window not found".to_string())
    }
}

/// 窗口关闭（自绘标题栏按钮；走 close-requested → closeToTray 语义）。
#[tauri::command]
pub fn window_close(app: tauri::AppHandle) -> Result<(), String> {
    log::info!("window_close invoked from page");
    if let Some(win) = app.get_webview_window("main") {
        win.close().map_err(|e| e.to_string())
    } else {
        Err("main window not found".to_string())
    }
}

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

/// 托盘菜单「退出」（自绘 HTML 菜单 → invoke 上行）。
/// 写 quit.marker + 退出（launcher quit 语义；不依赖事件系统）。
#[tauri::command]
pub fn tray_quit() -> Result<(), String> {
    log::info!("tray_quit invoked from page");
    crate::quit::write_quit_marker();
    std::process::exit(0);
}

/// 托盘菜单关闭回调（页面任意关闭路径 → 还原窗口位置/隐藏态，Q5/Q7）。
#[tauri::command]
pub fn tray_menu_closed(app: tauri::AppHandle) -> Result<(), String> {
    let st = app.state::<std::sync::Mutex<crate::tray::TrayMenuState>>();
    let mut s = st.lock().unwrap();
    if s.open {
        if let Some(win) = app.get_webview_window("main") {
            crate::tray::close_menu(&win, &mut s);
        } else {
            s.open = false;
        }
        log::info!("tray_menu_closed: menu closed, window restored");
    }
    Ok(())
}

/// 托盘菜单第一项「显示/隐藏主界面」切换（Q7）。
/// label 来自菜单打开时的上下文：'show'（窗口此前隐藏 → 显示并还原位置）
/// / 'hide'（窗口此前可见 → 隐藏到托盘）。缺省按当前可见性反切。
#[tauri::command]
pub fn window_toggle_visible(app: tauri::AppHandle, label: Option<String>) -> Result<(), String> {
    let win = app.get_webview_window("main").ok_or("main window not found")?;
    let st = app.state::<std::sync::Mutex<crate::tray::TrayMenuState>>();
    let mut s = st.lock().unwrap();
    let show = match label.as_deref() {
        Some("show") => true,
        Some("hide") => false,
        _ => !win.is_visible().unwrap_or(true), // 无上下文：按可见性反切
    };
    if show {
        // 显示：还原到打开菜单前的位置。
        if let Some((x, y)) = s.original_pos.take() {
            let _ = win.set_position(tauri::PhysicalPosition::new(x, y));
        }
        s.open = false;
        let _ = win.set_always_on_top(false);
        let _ = win.show();
        let _ = win.set_focus();
        log::info!("window_toggle_visible: shown");
    } else {
        // 隐藏到托盘（菜单随窗口一起消失；无需还原位置）。
        s.open = false;
        let _ = win.set_always_on_top(false);
        let _ = win.hide();
        // 清除页面侧菜单打开态（否则再显示窗口时菜单残留打开）。
        let _ = win.eval("window.__mgTrayMenuClose && window.__mgTrayMenuClose()");
        log::info!("window_toggle_visible: hidden to tray");
    }
    Ok(())
}

/// 提示音播放（Q4）：Node 侧（tauri-shell.ts）经 DSH_CMD 上行 →
/// 此处 eval 到浏览器执行 HTMLAudio（Node 进程无 Audio，D-2 通道）。
#[tauri::command]
pub fn play_sound(app: tauri::AppHandle, kind: String) -> Result<(), String> {
    let valid = matches!(kind.as_str(), "start" | "success" | "attention" | "error");
    if !valid {
        return Err(format!("unknown sound kind: {kind}"));
    }
    if let Some(win) = app.get_webview_window("main") {
        let js = format!("window.__mgPlaySound && window.__mgPlaySound('{}')", kind);
        win.eval(&js).map_err(|e| e.to_string())?;
        log::info!("play_sound: '{}' dispatched to page", kind);
    }
    Ok(())
}

/// 打开工作区目录（client 托盘「打开工作区」→ invoke 上行，Q6）。
/// 平台命令：Windows explorer / macOS open / Linux xdg-open。
/// 空路径兜底：打开 $DSH_HOME（无工作区时至少"有反应"）。
#[tauri::command]
pub fn open_workspace_path(path: String) -> Result<(), String> {
    let path = if path.trim().is_empty() {
        crate::state::dsh_home().to_string_lossy().to_string()
    } else {
        path
    };
    log::info!("open_workspace_path invoked from page: {path}");
    #[cfg(target_os = "windows")]
    let result = std::process::Command::new("explorer").arg(&path).spawn();
    #[cfg(target_os = "macos")]
    let result = std::process::Command::new("open").arg(&path).spawn();
    #[cfg(target_os = "linux")]
    let result = std::process::Command::new("xdg-open").arg(&path).spawn();
    result.map(|_| ()).map_err(|e| e.to_string())
}
