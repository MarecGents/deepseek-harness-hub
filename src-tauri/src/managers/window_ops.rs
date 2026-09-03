// window_ops.rs — 壳窗口操作唯一实现（Callback invoke 与 DSH_CMD/托盘上行共用）
//
// 模块类别：Manager（壳）
// 职责：窗口相关操作的**唯一实现**，供 commands 层（invoke 命令）与 managers 层
//       （node.rs DSH_CMD 分发表 / tray.rs 托盘菜单）共用——消除
//       managers→commands 反向依赖（R1-3 发现 3，src-tauri/src/AGENTS.md
//       分层依赖红线），并保证双路径行为一致（set_window_size 统一
//       unmaximize-first，R2-3 发现 2）。
// 分层：本模块（managers 层）只依赖同层 managers（icon/tray）与 helpers
//       （theme/state），不 import commands 层。
// 外部接口：set_window_theme / set_desktop_icon / set_window_size / play_sound /
//           open_workspace_path / window_toggle_visible。

use tauri::Manager;

/// 主题切换命令（桥桩，M2 壳-前端桥接唯一实现）。
/// Q2 增强：外壳主题只控 chrome——跟随 dsh（system）不设属性（标题栏走皮肤 token）；
/// 深色/浅色 → 调页面侧 `__mgSetShellTheme`（shell-init.js）：从当前皮肤的对应
/// 色板解析标题栏颜色并内联覆盖（不再硬编码黑/白），即时动态切换。
pub fn set_window_theme(app: &tauri::AppHandle, theme: String) -> Result<(), String> {
    let tauri_theme = match theme.as_str() {
        "dark" => tauri::Theme::Dark,
        "light" => tauri::Theme::Light,
        _ => tauri::Theme::Dark,
    };
    if let Some(win) = app.get_webview_window("main") {
        crate::theme::apply_theme(&win, tauri_theme).map_err(|e| e.to_string())?;
        // 外壳 chrome 强制覆盖（Q2）：shell-init.js 按皮肤色板解析并设置标题栏
        // 颜色；system → 移除覆盖（回皮肤 token）。页面未就绪时（__mgSetShellTheme
        // 尚不存在）写入 __mgPendingShellTheme，initShell 就绪后补应用。
        let theme_json = serde_json::to_string(&theme).unwrap_or_else(|_| "\"system\"".to_string());
        let js = format!(
            "(window.__mgSetShellTheme && window.__mgSetShellTheme({theme_json})) || (({theme_json} === 'light' || {theme_json} === 'dark') && (window.__mgPendingShellTheme = {theme_json}))"
        );
        let _ = win
            .eval(&js)
            .map_err(|e| log::warn!("set_window_theme: shell theme eval failed: {e}"));
        // 强制主题模式下 shell-init.js 跳过 apply_page_theme → 窗口/托盘图标
        // 停在旧状态（'default' 翻转不随新主题）。此处按新主题重设全部图标面。
        // IconManager.apply 只记录 pending（worker 消费）——IPC 不阻塞（防卡死）。
        let dark = matches!(tauri_theme, tauri::Theme::Dark);
        app.state::<crate::icon::IconManager>()
            .apply_theme_aware(app, dark);
        Ok(())
    } else {
        Err("main window not found".to_string())
    }
}

/// 设置桌面/任务栏图标（S6，PR #25 唯一实现）：设置卡「桌面图标」网格选择 →
/// 页面 invoke（D-2，ACL allow-set-desktop-icon）或 host DSH_CMD 上行
/// （node.rs 分发）共用。icon_id：'default'（主题翻转鲸鱼）或 5 个鲸鱼娘之一；
/// 未知 id 回退白鲸。统一走 icon::IconManager（全部图标面 + 面级幂等，
/// 双通道同 id 自动去重）。
pub fn set_desktop_icon(app: &tauri::AppHandle, icon_id: String) -> Result<(), String> {
    // IconManager.apply 只记录 pending（worker 消费）——IPC 立即返回（防卡死）；
    // 快速连续切换 pending 覆盖（只保留最新），worker 只消费最后一次。
    let dark = app
        .get_webview_window("main")
        .map(|w| w.theme().unwrap_or(tauri::Theme::Dark) == tauri::Theme::Dark)
        .unwrap_or(true);
    app.state::<crate::icon::IconManager>()
        .apply(app, &icon_id, dark);
    log::info!("set_desktop_icon: queued '{}'", icon_id);
    Ok(())
}

/// 窗口大小设置（项 6 唯一实现）。
/// 最大化状态下 Windows 不允许直接 set_size——先 unmaximize 再设尺寸
/// （记录日志；unmaximize 触发的 resize 事件由 lib.rs 恢复逻辑兜底）。
/// invoke（commands::set_window_size）与 DSH_CMD（node.rs 分发）双路径
/// 行为一致（R2-3 发现 2 修复）。
pub fn set_window_size(app: &tauri::AppHandle, width: f64, height: f64) -> Result<(), String> {
    if let Some(win) = app.get_webview_window("main") {
        if win.is_maximized().unwrap_or(false) {
            log::info!("set_window_size: window maximized, unmaximizing first");
            win.unmaximize().map_err(|e| e.to_string())?;
        }
        let size = tauri::Size::Logical(tauri::LogicalSize::new(width, height));
        win.set_size(size).map_err(|e| e.to_string())
    } else {
        Err("main window not found".to_string())
    }
}

/// 提示音播放（Q4 唯一实现）：Node 侧（tauri-shell.ts）经 DSH_CMD 上行 →
/// 此处 eval 到浏览器执行 HTMLAudio（Node 进程无 Audio，D-2 通道）。
pub fn play_sound(app: &tauri::AppHandle, kind: String) -> Result<(), String> {
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

/// Pure guard for `open_workspace_path` (audit P1-3): a client-supplied
/// target must be an absolute, existing directory. Workspaces live anywhere on
/// disk, so a DSH_HOME containment check would break every real workspace —
/// existence + directory-ness is the guard (blocks junk/device/nonexistent
/// paths; explorer only ever sees a real directory).
fn validate_open_target(path: &str) -> Result<(), String> {
    let p = std::path::Path::new(path);
    if !p.is_absolute() {
        return Err(format!("relative path is not allowed: {path}"));
    }
    match std::fs::metadata(p) {
        Ok(m) if m.is_dir() => Ok(()),
        Ok(_) => Err(format!("not a directory: {path}")),
        Err(e) => Err(format!("path not accessible: {path} ({e})")),
    }
}

/// 打开工作区目录（client 托盘「打开工作区」→ invoke 上行，Q6）。
/// 平台命令：Windows explorer / macOS open / Linux xdg-open。
/// 空路径兜底：打开 $DSH_HOME（无工作区时至少"有反应"）。
pub fn open_workspace_path(path: String) -> Result<(), String> {
    let path = if path.trim().is_empty() {
        crate::state::dsh_home().to_string_lossy().to_string()
    } else {
        // Audit P1-3 (2026-09-02): validate before spawning the OS handler.
        validate_open_target(&path)?;
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

/// 托盘菜单第一项「显示/隐藏主界面」切换（Q1/Q7 唯一实现）。
/// 判断：窗口可见且未最小化 → 隐藏到托盘；否则 → 显示并置顶到最前。
/// （按可见性而非聚焦：点击托盘会夺走焦点，用聚焦判断会误「显示」。）
pub fn window_toggle_visible(app: &tauri::AppHandle) -> Result<(), String> {
    let win = app
        .get_webview_window("main")
        .ok_or("main window not found")?;
    let front = win.is_visible().unwrap_or(false) && !win.is_minimized().unwrap_or(true);
    if front {
        // Audit P2-2 (2026-09-02): surface failures instead of silent `let _ =`.
        if let Err(e) = win.hide() {
            log::warn!("window_toggle_visible: hide failed: {e}");
        }
        log::info!("window_toggle_visible: hidden to tray");
    } else {
        if let Err(e) = win.unminimize() {
            log::warn!("window_toggle_visible: unminimize failed: {e}");
        }
        if let Err(e) = win.show() {
            log::warn!("window_toggle_visible: show failed: {e}");
        }
        if let Err(e) = win.set_focus() {
            log::warn!("window_toggle_visible: set_focus failed: {e}");
        }
        log::info!("window_toggle_visible: shown to front");
    }
    crate::tray::sync_toggle_label(app);
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::validate_open_target;

    #[test]
    fn rejects_relative_paths() {
        let err = validate_open_target("relative/dir").unwrap_err();
        assert!(err.contains("relative path"), "got: {err}");
    }

    #[test]
    fn rejects_nonexistent_paths() {
        let absent = std::env::temp_dir().join("dsh-hub-open-path-probe-absent");
        let _ = std::fs::remove_dir_all(&absent);
        let err = validate_open_target(&absent.to_string_lossy()).unwrap_err();
        assert!(err.contains("not accessible"), "got: {err}");
    }

    #[test]
    fn accepts_existing_directory() {
        let dir = std::env::temp_dir();
        validate_open_target(&dir.to_string_lossy()).expect("temp dir must be openable");
    }

    #[test]
    fn rejects_existing_file() {
        let file = std::env::temp_dir().join("dsh-hub-open-path-probe.txt");
        std::fs::write(&file, b"probe").expect("write probe file");
        let err = validate_open_target(&file.to_string_lossy()).unwrap_err();
        assert!(err.contains("not a directory"), "got: {err}");
        let _ = std::fs::remove_file(&file);
    }
}
