// theme.rs — M2 主题管理（T2.3）
//
// 模块类别：Helper（壳）
// 职责：窗口主题应用（Tauri set_theme + DWM 暗色标题栏）+ 窗口图标随主题翻转。
// 迁移映射：src/services/dwm-theme.ts（koffi DwmSetWindowAttribute）。
// 外部接口：apply_theme(window, Theme)；apply_window_icon(window, dark)。
//
// DWM 暗色标题栏参照 spacedrive windows.rs L627-697：
//   attr 20 (DWMWA_USE_IMMERSIVE_DARK_MODE) / 34 (BORDER_COLOR) / 35 (CAPTION_COLOR)

use tauri::{WebviewWindow, Theme};

/// 应用窗口主题（T2.3）。
pub fn apply_theme(win: &WebviewWindow, theme: Theme) -> Result<(), Box<dyn std::error::Error>> {
    log::info!("theme: applying {:?}", theme);

    // Tauri set_theme（跨平台基础）。
    let tauri_theme = match theme {
        Theme::Dark => Some(tauri::Theme::Dark),
        Theme::Light => Some(tauri::Theme::Light),
        _ => None,
    };
    win.set_theme(tauri_theme)?;

    // Windows DWM 暗色标题栏（frameless 窗口需显式设置）。
    #[cfg(target_os = "windows")]
    {
        use windows::Win32::Foundation::HWND;
        use windows::Win32::Graphics::Dwm::{DwmSetWindowAttribute, DWMWINDOWATTRIBUTE};

        if let Ok(hwnd_raw) = win.hwnd() {
            let hwnd = HWND(hwnd_raw.0 as _);
            let is_dark = matches!(theme, Theme::Dark);

            // DWMWA_USE_IMMERSIVE_DARK_MODE = 20 (Windows 10 20H1+)。
            let dark_val: i32 = i32::from(is_dark);
            unsafe {
                let _ = DwmSetWindowAttribute(
                    hwnd,
                    DWMWINDOWATTRIBUTE(20),
                    &dark_val as *const _ as _,
                    std::mem::size_of::<i32>() as u32,
                );
            }

            // DWMWA_BORDER_COLOR = 34 (Windows 11 22H2+)。
            let border_color: u32 = if is_dark { 0x000000 } else { 0xFFFFFFFF };
            unsafe {
                let _ = DwmSetWindowAttribute(
                    hwnd,
                    DWMWINDOWATTRIBUTE(34),
                    &border_color as *const _ as _,
                    std::mem::size_of::<u32>() as u32,
                );
            }

            // DWMWA_CAPTION_COLOR = 35。
            let caption_color: u32 = if is_dark { 0x000000 } else { 0xFFFFFFFF };
            unsafe {
                let _ = DwmSetWindowAttribute(
                    hwnd,
                    DWMWINDOWATTRIBUTE(35),
                    &caption_color as *const _ as _,
                    std::mem::size_of::<u32>() as u32,
                );
            }

            log::info!("theme: DWM attributes set (dark={})", is_dark);
        }
    }

    Ok(())
}

/// 窗口图标随页面主题翻转（项 3，合并进 apply_page_theme 调用链）。
/// dark → icon-dark.png（白鲸，深色任务栏/标题栏图标）；light → icon-light.png
/// （黑鲸）。PNG 由 scripts/generate-titlebar-icons.mjs 生成（128×128 透明背景），
/// include_bytes! 内嵌（tauri `image-png` feature 解码）。set_icon 失败仅 warn。
pub fn apply_window_icon(win: &WebviewWindow, dark: bool) {
    let bytes: &[u8] = if dark {
        include_bytes!("../../icons/icon-dark.png")
    } else {
        include_bytes!("../../icons/icon-light.png")
    };
    let name = if dark { "icon-dark" } else { "icon-light" };
    match tauri::image::Image::from_bytes(bytes) {
        Ok(img) => match win.set_icon(img) {
            Ok(_) => log::info!("theme: window icon set ({})", name),
            Err(e) => log::warn!("theme: set_icon({}) failed: {}", name, e),
        },
        Err(e) => log::warn!("theme: decode {} failed: {}", name, e),
    }
}
