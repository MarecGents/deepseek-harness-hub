// commands.rs — M4 Tauri commands（T4.8）+ S6 桌面图标
//
// 模块类别：Callback（壳，invoke 薄胶水）
// 职责：注册 Tauri invoke 命令。
//   - set_window_theme(dark): 主题切换
//   - set_window_size(w, h): 窗口大小设置
//   - set_desktop_icon(icon_id): 用户可选桌面/任务栏图标（S6，鲸鱼娘预设）
//   - get_workspace_path(): 获取当前工作区路径（D4 决策：页面主动上报，壳侧预置桩）
//   - window_minimize / window_toggle_maximize / window_close: 自绘标题栏窗口控制
//
// 窗口操作类命令（set_window_theme / set_desktop_icon / set_window_size /
// window_toggle_visible / play_sound / open_workspace_path）的实现统一下沉
// managers/window_ops.rs——页面 invoke 与 DSH_CMD 上行/托盘共用同一实现
// （分层依赖红线：managers 不 import commands；C6 修复）。
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

/// 主题切换命令（桥桩，M2 壳-前端桥接唯一实现）。
/// Q2 增强：外壳主题只控 chrome——跟随 dsh（system）不设属性（标题栏走皮肤 token）；
/// 深色/浅色 → 调页面侧 `__mgSetShellTheme`（shell-init.js）：从当前皮肤的对应
/// 色板解析标题栏颜色并内联覆盖（不再硬编码黑/白），即时动态切换。
/// 实现已下沉 managers/window_ops.rs（DSH_CMD 上行与托盘共用，分层红线）。
#[tauri::command]
pub fn set_window_theme(app: tauri::AppHandle, theme: String) -> Result<(), String> {
    crate::window_ops::set_window_theme(&app, theme)
}

/// 页面主题跟随命令（项 2/3）：dsh 页面 body[data-ds-dark-theme] 变化时由
/// shell-init.js 的 MutationObserver 调用（仅「跟随 dsh」模式，不覆盖强制主题）。
/// 三件事：
///   1. DWM 标题栏主题（crate::theme::apply_theme）
///   2. webview 背景色：dark=#18181b / light=#f6f8fa
///   3. 图标（窗口/托盘/壳源/标题栏）：统一走 icon::IconManager::apply_theme_aware
///      ——读持久化 desktopIcon，按当前 dark 应用（'default' 主题翻转、鲸鱼娘
///      固定；面级幂等，未变的面自动跳过）。
#[tauri::command]
pub fn apply_page_theme(app: tauri::AppHandle, dark: bool) -> Result<(), String> {
    let theme = if dark { tauri::Theme::Dark } else { tauri::Theme::Light };
    if let Some(win) = app.get_webview_window("main") {
        crate::theme::apply_theme(&win, theme).map_err(|e| e.to_string())?;
        // webview 背景色（防 resize/导航时的白/黑闪屏；win 无 set_background 则跳过）。
        let color = tauri::window::Color(
            if dark { 0x18 } else { 0xF6 },
            if dark { 0x18 } else { 0xF8 },
            if dark { 0x1B } else { 0xFA },
            255,
        );
        if let Err(e) = win.set_background_color(Some(color)) {
            log::warn!("apply_page_theme: set_background_color failed: {}", e);
        }
        // 图标经 IconManager.apply（记录 pending + worker 消费）——IPC 不阻塞（防卡死）。
        app.state::<crate::icon::IconManager>().apply_theme_aware(&app, dark);
        log::info!("apply_page_theme: theme applied (dark={})", dark);
        Ok(())
    } else {
        Err("main window not found".to_string())
    }
}

/// 设置桌面/任务栏图标（S6，PR #25）：设置卡「桌面图标」网格选择 → 页面 invoke
/// 下行（D-2，ACL allow-set-desktop-icon）或 host DSH_CMD 上行（node.rs 分发）。
/// 实现已下沉 managers/window_ops.rs（双通道共用同一实现，幂等去重）。
#[tauri::command]
pub fn set_desktop_icon(app: tauri::AppHandle, icon_id: String) -> Result<(), String> {
    crate::window_ops::set_desktop_icon(&app, icon_id)
}

/// 窗口大小设置命令。
/// 项 6：最大化状态下 Windows 不允许直接 set_size——先 unmaximize 再设尺寸
/// （记录日志；unmaximize 触发的 resize 事件由 lib.rs 恢复逻辑兜底）。
/// 实现已下沉 managers/window_ops.rs（DSH_CMD 路径同实现，双路径行为一致）。
#[tauri::command]
pub fn set_window_size(app: tauri::AppHandle, width: f64, height: f64) -> Result<(), String> {
    crate::window_ops::set_window_size(&app, width, height)
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
/// 先杀 sidecar（dsh web 子进程）——否则壳退出后孤儿 sidecar 继续占用端口
/// （2026-08-19 实测：多次测试退出后残留 node dsh web --port 0 进程）。
#[tauri::command]
pub fn tray_quit(app: tauri::AppHandle) -> Result<(), String> {
    log::info!("tray_quit invoked from page");
    if let Some(state) = app.try_state::<std::sync::Arc<crate::node::NodeState>>() {
        crate::node::stop_dsh(&state);
    }
    crate::quit::write_quit_marker();
    std::process::exit(0);
}

/// 托盘菜单第一项「显示/隐藏主界面」切换（Q1/Q7）。
/// 判断：窗口可见且未最小化 → 隐藏到托盘；否则 → 显示并置顶到最前。
/// （按可见性而非聚焦：点击托盘会夺走焦点，用聚焦判断会误「显示」。）
/// 实现已下沉 managers/window_ops.rs（托盘菜单与页面 invoke 共用）。
#[tauri::command]
pub fn window_toggle_visible(app: tauri::AppHandle) -> Result<(), String> {
    crate::window_ops::window_toggle_visible(&app)
}

/// 提示音播放（Q4）：Node 侧（tauri-shell.ts）经 DSH_CMD 上行 →
/// 此处 eval 到浏览器执行 HTMLAudio（Node 进程无 Audio，D-2 通道）。
/// 实现已下沉 managers/window_ops.rs（DSH_CMD 与页面 invoke 共用）。
#[tauri::command]
pub fn play_sound(app: tauri::AppHandle, kind: String) -> Result<(), String> {
    crate::window_ops::play_sound(&app, kind)
}

/// 打开工作区目录（client 托盘「打开工作区」→ invoke 上行，Q6）。
/// 平台命令：Windows explorer / macOS open / Linux xdg-open。
/// 空路径兜底：打开 $DSH_HOME（无工作区时至少"有反应"）。
/// 实现已下沉 managers/window_ops.rs（DSH_CMD 上行与页面 invoke 共用）。
#[tauri::command]
pub fn open_workspace_path(path: String) -> Result<(), String> {
    crate::window_ops::open_workspace_path(path)
}
