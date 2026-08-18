// window.rs — M2 窗口管理（T2.1）
//
// 模块类别：Manager（壳）
// 职责：主窗口构建（尺寸解析 / 最小尺寸 / 居中 / 最大化恢复），
//       对齐 desktop.ts L231-251 / L335-337 窗口逻辑。
// 迁移映射：src/desktop.ts 的 openDesktopShell / ensureVisible。
// 外部接口：build_main_window(app) -> WebviewWindow。

use tauri::{App, WebviewWindow, WebviewWindowBuilder, WebviewUrl};

/// 主窗口常量（与 rc.14 一致）。
const DEFAULT_WIDTH: f64 = 1280.0;
const DEFAULT_HEIGHT: f64 = 720.0;
const MIN_WIDTH: f64 = 480.0;
const MIN_HEIGHT: f64 = 360.0;

/// 构建主窗口（T2.1）。
///
/// 尺寸解析优先级（对齐 desktop.ts L231-251）：
///   1. 持久化的逻辑尺寸（M3 起，从 state.rs 读取）
///   2. 3/4 当前屏幕尺寸（逻辑像素），上限 1600×1000
///   3. 默认 1280×720
pub fn build_main_window(app: &App) -> Result<WebviewWindow, Box<dyn std::error::Error>> {
    // 获取可用屏幕尺寸（逻辑像素）。
    // primary_monitor() 返回 Option<Monitor>；Monitor::size() 是 PhysicalSize<u32>。
    let (screen_w, screen_h) = match app.primary_monitor() {
        Ok(Some(monitor)) => {
            let scale = monitor.scale_factor();
            let size = monitor.size();
            (
                size.width as f64 / scale,
                size.height as f64 / scale,
            )
        }
        _ => (DEFAULT_WIDTH, DEFAULT_HEIGHT),
    };

    // 3/4 屏幕面积，宽高各自 75%，上限 1600×1000（对齐 desktop.ts L231）。
    let calc_w = (screen_w * 0.75).clamp(DEFAULT_WIDTH, 1600.0);
    let calc_h = (screen_h * 0.75).clamp(DEFAULT_HEIGHT, 1000.0);

    log::info!(
        "window: screen {}x{}, calc {}x{}, min {}x{}, default {}x{}",
        screen_w as u32, screen_h as u32,
        calc_w as u32, calc_h as u32,
        MIN_WIDTH as u32, MIN_HEIGHT as u32,
        DEFAULT_WIDTH as u32, DEFAULT_HEIGHT as u32
    );

    let win = WebviewWindowBuilder::new(app, "main", WebviewUrl::default())
        .title("DeepSeek Harness Hub")
        .inner_size(calc_w, calc_h)
        .min_inner_size(MIN_WIDTH, MIN_HEIGHT)
        .center()
        .decorations(false)
        .transparent(false)
        .build()?;

    Ok(win)
}
