// window.rs — M2 窗口管理（T2.1，项 6：光标屏 3/4）
//
// 模块类别：Manager（壳）
// 职责：主窗口构建（尺寸解析 / 最小尺寸 / 居中 / 最大化恢复）+ 壳初始化脚本
//       注入（shell-init.js 标题栏/Splash/声音）+ autoplay 放行，
//       对齐 desktop.ts L231-251 / L335-337 窗口逻辑。
// 迁移映射：src/desktop.ts 的 openDesktopShell / ensureVisible。
// 外部接口：build_main_window(app) -> WebviewWindow；default_three_quarter_size(app_handle)。
//
// 项 6 变更：
//   - Windows 用 GetCursorPos + MonitorFromPoint + GetMonitorInfoW 取「光标所在屏」
//     rcMonitor（物理像素）+ GetDpiForMonitor 有效 DPI → 逻辑尺寸；非 Windows /
//     探测失败回退 primary_monitor。
//   - 去掉 1280..1600 × 720..1000 上限，纯 3/4（round），下限保持 480×360。

use tauri::{App, WebviewUrl, WebviewWindow, WebviewWindowBuilder};

/// 主窗口常量（与 rc.14 一致；兜底尺寸，正常路径被 3/4 计算取代）。
const DEFAULT_WIDTH: f64 = 1280.0;
const DEFAULT_HEIGHT: f64 = 720.0;
const MIN_WIDTH: f64 = 480.0;
const MIN_HEIGHT: f64 = 360.0;

/// Windows：光标所在屏的逻辑尺寸（rcMonitor 物理像素 / 有效 DPI）。
/// 返回 None = 探测失败（交由调用方回退 primary_monitor）。
#[cfg(target_os = "windows")]
fn cursor_monitor_logical_size() -> Option<(f64, f64)> {
    use windows::Win32::Foundation::POINT;
    use windows::Win32::Graphics::Gdi::{
        GetMonitorInfoW, MonitorFromPoint, MONITORINFO, MONITOR_DEFAULTTONEAREST,
    };
    use windows::Win32::UI::HiDpi::{GetDpiForMonitor, MDT_EFFECTIVE_DPI};
    use windows::Win32::UI::WindowsAndMessaging::GetCursorPos;

    unsafe {
        // SAFETY: GetCursorPos writes into a default-initialized POINT on the
        // stack; MonitorFromPoint consumes the POINT by value; GetMonitorInfoW
        // writes into a MONITORINFO whose cbSize is set to the struct size
        // (the API's documented input requirement); GetDpiForMonitor writes
        // the two u32 outputs. Every buffer is caller-allocated and outlives
        // its call; on any failure the function returns None and the caller
        // falls back to the primary monitor (no handle is leaked — hmon is a
        // borrowed monitor handle, not owned by us).
        let mut pt = POINT::default();
        if GetCursorPos(&mut pt).is_err() {
            return None;
        }
        let hmon = MonitorFromPoint(pt, MONITOR_DEFAULTTONEAREST);
        if hmon.is_invalid() {
            return None;
        }
        let mut info = MONITORINFO {
            cbSize: std::mem::size_of::<MONITORINFO>() as u32,
            ..Default::default()
        };
        if !GetMonitorInfoW(hmon, &mut info).as_bool() {
            return None;
        }
        let rect = info.rcMonitor;
        let (w, h) = (
            (rect.right - rect.left) as f64,
            (rect.bottom - rect.top) as f64,
        );
        let mut dpi_x = 96u32;
        let mut dpi_y = 96u32;
        let scale = if GetDpiForMonitor(hmon, MDT_EFFECTIVE_DPI, &mut dpi_x, &mut dpi_y).is_ok() {
            (dpi_x.min(dpi_y) as f64) / 96.0
        } else {
            1.0
        };
        Some((w / scale, h / scale))
    }
}

/// 兜底逻辑尺寸：primary_monitor（非 Windows / Windows 探测失败）。
fn fallback_screen_size(app: &tauri::AppHandle) -> (f64, f64) {
    match app.primary_monitor() {
        Ok(Some(monitor)) => {
            let scale = monitor.scale_factor();
            let size = monitor.size();
            (size.width as f64 / scale, size.height as f64 / scale)
        }
        _ => (DEFAULT_WIDTH, DEFAULT_HEIGHT),
    }
}

/// 「启动屏 3/4」逻辑尺寸：光标所在屏（Windows）3/4（round），下限 480×360，无上限。
/// lib.rs 退出最大化恢复（项 6）与 build_main_window 共用。
pub fn default_three_quarter_size(app: &tauri::AppHandle) -> (f64, f64) {
    #[cfg(target_os = "windows")]
    let (sw, sh) = cursor_monitor_logical_size().unwrap_or_else(|| fallback_screen_size(app));
    #[cfg(not(target_os = "windows"))]
    let (sw, sh) = fallback_screen_size(app);
    (
        (sw * 0.75).round().max(MIN_WIDTH),
        (sh * 0.75).round().max(MIN_HEIGHT),
    )
}

/// 构建主窗口（T2.1）。
///
/// 尺寸解析优先级（对齐 desktop.ts L231-251）：
///   1. 持久化的逻辑尺寸（M3 起，从 state.rs 读取）
///   2. 光标所在屏 3/4（项 6：纯 3/4，无 1600×1000 上限）
///   3. 默认 1280×720
pub fn build_main_window(app: &App) -> Result<WebviewWindow, Box<dyn std::error::Error>> {
    let (calc_w, calc_h) = default_three_quarter_size(app.handle());

    log::info!(
        "window: calc {}x{}, min {}x{}, default {}x{}",
        calc_w as u32,
        calc_h as u32,
        MIN_WIDTH as u32,
        MIN_HEIGHT as u32,
        DEFAULT_WIDTH as u32,
        DEFAULT_HEIGHT as u32
    );

    // 壳初始化脚本（shell-init.js：自绘标题栏 42px + Splash + 声音 + 主题跟随，
    // 见 shell-init.js 头注释）。initialization_script 在每次导航（含 READY 后
    // lib.rs 的 win.navigate 到 dsh web）都会重新注入 —— 占位页与 dsh web 页
    // 共享标题栏/Splash（先建窗后 navigate 的 UX 前提）。
    // Q4：浏览器侧 HTMLAudio 播放提示音——WebView2 默认自动播放策略可能拦截
    // 无用户手势的音频，放开限制（声音在 DSH_CMD 通道触发）。
    let win = WebviewWindowBuilder::new(app, "main", WebviewUrl::default())
        .title("DeepSeek Harness Hub")
        .inner_size(calc_w, calc_h)
        .min_inner_size(MIN_WIDTH, MIN_HEIGHT)
        .center()
        .decorations(false)
        .transparent(false)
        .additional_browser_args("--autoplay-policy=no-user-gesture-required")
        .initialization_script(include_str!("../shell-init.js"))
        .build()?;

    Ok(win)
}
