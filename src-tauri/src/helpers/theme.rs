// theme.rs — M2 主题管理（T2.3）+ S6 用户可选桌面图标
//
// 模块类别：Helper（壳）
// 职责：窗口主题应用（Tauri set_theme + DWM 暗色标题栏）+ 窗口图标
//       （主题翻转鲸鱼 / 用户选择的鲸鱼娘；SMALL+BIG 双槽位）+ 壳图标源
//       同步（.lnk IconLocation / AUMID IconUri，桌面快捷方式与 toast 用）。
// 迁移映射：src/services/dwm-theme.ts（koffi DwmSetWindowAttribute）。
// 外部接口：apply_theme(window, Theme)；apply_window_icon(window, dark)；
//           apply_desktop_icon(window, icon_id)；desktop_icon_png(dark, icon_id)
//           （窗口/托盘共用内嵌资产）；known_desktop_path()（FOLDERID_Desktop）。
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

/// 用户可选桌面图标的内嵌 PNG 资产（窗口 SMALL/BIG 双槽位 + 托盘共用，
/// include_bytes! 单份内嵌避免多模块重复打包）。icon_id：
///   - `'default'` → 主题翻转鲸鱼：dark → icon-dark.png（白鲸）/ light →
///     icon-light.png（黑鲸），dark 参数由调用方按窗口主题给出。
///   - `'whale-girl-*'` → 固定鲸鱼娘 PNG（256×256，与 assets/icons/ 同名
///     预览资产一致；两者在构建期各自打包，互不依赖）。
///   - 其它（未知 id）→ 回退白鲸（icon-dark.png）并 warn。
pub fn desktop_icon_png(dark: bool, icon_id: &str) -> (&'static [u8], &'static str) {
    match icon_id {
        "whale-girl-sad" => (include_bytes!("../../icons/whale-girl-sad.png"), "whale-girl-sad"),
        "whale-girl-happy" => (include_bytes!("../../icons/whale-girl-happy.png"), "whale-girl-happy"),
        "whale-girl-duo" => (include_bytes!("../../icons/whale-girl-duo.png"), "whale-girl-duo"),
        "whale-girl-maid" => (include_bytes!("../../icons/whale-girl-maid.png"), "whale-girl-maid"),
        "whale-girl-blue" => (include_bytes!("../../icons/whale-girl-blue.png"), "whale-girl-blue"),
        "default" => {
            if dark {
                (include_bytes!("../../icons/icon-dark.png"), "whale-dark")
            } else {
                (include_bytes!("../../icons/icon-light.png"), "whale-light")
            }
        }
        _ => {
            log::warn!("theme: unknown desktop icon id '{}', falling back to whale (icon-dark)", icon_id);
            (include_bytes!("../../icons/icon-dark.png"), "whale")
        }
    }
}

/// 双槽位应用窗口图标：
///   - SMALL（Tauri set_icon → WM_SETICON ICON_SMALL）：标题栏 / Alt-Tab；
///   - BIG（Win32 CreateIconIndirect → WM_SETICON ICON_BIG）：任务栏按钮。
///
/// tao 源码语义（platform_impl/windows/window.rs）：任务栏按钮图标走
/// set_taskbar_icon（ICON_BIG），而 Tauri 2 的 set_icon 只设 SMALL——BIG
/// 缺失时任务栏回退窗口类图标（exe 内嵌），表现为「任务栏图标不变」。
/// 应用窗口图标位图（SMALL via Tauri set_icon + BIG via Win32 ICON_BIG）。
/// 无状态纯函数：BIG HICON 生命周期由调用方（managers/icon.rs）持有，
/// `prev_big` 传入当前 HICON（替换时 Destroy 旧值，防泄漏）。失败仅 warn。
pub fn apply_window_icons(
    win: &WebviewWindow,
    bytes: &[u8],
    name: &str,
    prev_big: &mut Option<isize>,
) {
    match tauri::image::Image::from_bytes(bytes) {
        Ok(img) => {
            #[cfg(target_os = "windows")]
            set_icon_big_win32(win, &img, name, prev_big);
            match win.set_icon(img) {
                Ok(_) => log::info!("theme: window icon set ({})", name),
                Err(e) => log::warn!("theme: set_icon({}) failed: {}", name, e),
            }
        }
        Err(e) => log::warn!("theme: decode {} failed: {}", name, e),
    }
}

/// ICON_BIG（任务栏按钮图标槽，tao `set_taskbar_icon` 语义）：Tauri 2 未暴露
/// 该 API，直接 Win32 实现。构造方式与 tao `RgbaIcon::into_windows_icon` 完全
/// 一致——CreateIcon(32bpp BGRA XOR + 逐字节反相 alpha 的 AND 掩码)：
///   - AND 掩码是**每像素一字节**（CreateIcon 约定，非紧缩位图）；
///   - 全零掩码曾被当作"全不透明"与 alpha 混合路径冲突，实测渲染错乱
///     （覆盖残缺/颜色异常），必须用 tao 同款反相 alpha。
///
/// 纯函数：创建并发送 WM_SETICON ICON_BIG，旧 HICON 由调用方传入的
/// `prev_big` 管理（WM_SETICON 不转移所有权，替换时 DestroyIcon 防泄漏）。
/// 失败仅 warn；跨线程 SendMessageW 与 tao set_icon 同模式（主线程泵消息，
/// 同步返回）。
#[cfg(target_os = "windows")]
fn set_icon_big_win32(
    win: &WebviewWindow,
    img: &tauri::image::Image<'_>,
    name: &str,
    prev_big: &mut Option<isize>,
) {
    use windows::Win32::Foundation::{HWND, LPARAM, WPARAM};
    use windows::Win32::UI::WindowsAndMessaging::{
        CreateIcon, DestroyIcon, HICON, ICON_BIG, PostMessageW, WM_SETICON,
    };

    let Ok(hwnd_raw) = win.hwnd() else {
        log::warn!("theme: hwnd() failed, ICON_BIG ({}) not set", name);
        return;
    };
    let hwnd = HWND(hwnd_raw.0 as _);
    let (w, h) = (img.width() as i32, img.height() as i32);
    if w <= 0 || h <= 0 {
        log::warn!("theme: bad image size {}x{} for ICON_BIG ({})", w, h, name);
        return;
    }

    let rgba = img.rgba();
    let mut bgra: Vec<u8> = Vec::with_capacity(rgba.len());
    let mut and_mask: Vec<u8> = Vec::with_capacity(rgba.len() / 4);
    for px in rgba.chunks_exact(4) {
        and_mask.push(255u8.wrapping_sub(px[3])); // 反相 alpha：不透明→0（绘制），透明→255
        bgra.extend_from_slice(&[px[2], px[1], px[0], px[3]]);
    }

    unsafe {
        match CreateIcon(None, w, h, 1, 32, and_mask.as_ptr(), bgra.as_ptr()) {
            Ok(hicon) => {
                let new_handle = hicon.0 as isize;
                // PostMessageW（异步，不等待窗口线程处理）：连续快速切换图标时
                // 窗口线程积压 WM_SETICON 消息会忙——SendMessageW 同步等待会阻塞
                // 调用线程（卡死根因之一）。PostMessage 投递后立即返回，窗口按
                // 消息队列顺序处理，最终图标一致。
                PostMessageW(Some(hwnd), WM_SETICON, WPARAM(ICON_BIG as usize), LPARAM(new_handle)).ok();
                if let Some(prev) = prev_big.replace(new_handle) {
                    let _ = DestroyIcon(HICON(prev as _));
                }
                log::info!("theme: window ICON_BIG set ({})", name);
            }
            Err(e) => log::warn!("theme: CreateIcon failed for ICON_BIG ({}): {}", name, e),
        }
    }
}


/// 解析桌面路径（FOLDERID_Desktop，处理 OneDrive 重定向）。
/// 从 lib.rs 迁入（Controller→Helper）：update_shell_icon_sources 与
/// create_toast_shortcuts（lib.rs）共用，保证两处改的是同一个 .lnk。
#[cfg(target_os = "windows")]
pub fn known_desktop_path() -> std::path::PathBuf {
    use windows::Win32::System::Com::CoTaskMemFree;
    use windows::Win32::UI::Shell::{FOLDERID_Desktop, KNOWN_FOLDER_FLAG, SHGetKnownFolderPath};
    unsafe {
        if let Ok(p) = SHGetKnownFolderPath(&FOLDERID_Desktop, KNOWN_FOLDER_FLAG(0), None) {
            let s = p.to_string().unwrap_or_default();
            CoTaskMemFree(Some(p.as_ptr() as _));
            if !s.is_empty() {
                return std::path::PathBuf::from(s);
            }
        }
    }
    // 兜底：%USERPROFILE%\Desktop。
    std::env::var_os("USERPROFILE")
        .map(|u| std::path::Path::new(&u).join("Desktop"))
        .unwrap_or_default()
}
