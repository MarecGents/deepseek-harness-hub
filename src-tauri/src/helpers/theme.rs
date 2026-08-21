// theme.rs — M2 主题管理（T2.3）+ S6 用户可选桌面图标
//
// 模块类别：Helper（壳）
// 职责：窗口主题应用（Tauri set_theme + DWM 暗色标题栏）+ 窗口图标
//       （主题翻转鲸鱼 / 用户选择的鲸鱼娘，set_icon）。
// 迁移映射：src/services/dwm-theme.ts（koffi DwmSetWindowAttribute）。
// 外部接口：apply_theme(window, Theme)；apply_window_icon(window, dark)；
//           apply_desktop_icon(window, icon_id)。
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

/// 用户选择的桌面图标（S6，PR #25）。icon_id：
///   - `'default'` → 主题翻转鲸鱼：dark → icon-dark.png（白鲸）/ light →
///     icon-light.png（黑鲸），按窗口当前主题（win.theme()）选择；未知/无
///     主题时取 dark（白鲸，与启动默认一致）。
///   - `'whale-girl-*'` → 固定鲸鱼娘 PNG（include_bytes! 内嵌，256×256，
///     与 assets/icons/ 同名资产一致；两者在构建期各自打包，互不依赖）。
///   - 其它（未知 id）→ 回退白鲸（icon-dark.png，与 apply_window_icon(dark)
///     同款；主题翻转行为不受影响——'default' 走 apply_window_icon 分支）。
///
/// 图标切换失败仅 warn（不得破坏设置保存链路）。
pub fn apply_desktop_icon(win: &WebviewWindow, icon_id: &str) {
    let (bytes, name): (&[u8], &str) = match icon_id {
        "whale-girl-sad" => (include_bytes!("../../icons/whale-girl-sad.png"), "whale-girl-sad"),
        "whale-girl-happy" => (include_bytes!("../../icons/whale-girl-happy.png"), "whale-girl-happy"),
        "whale-girl-duo" => (include_bytes!("../../icons/whale-girl-duo.png"), "whale-girl-duo"),
        "whale-girl-maid" => (include_bytes!("../../icons/whale-girl-maid.png"), "whale-girl-maid"),
        "whale-girl-blue" => (include_bytes!("../../icons/whale-girl-blue.png"), "whale-girl-blue"),
        "default" => {
            let dark = win.theme().unwrap_or(Theme::Dark) == Theme::Dark;
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
    };
    match tauri::image::Image::from_bytes(bytes) {
        Ok(img) => match win.set_icon(img) {
            Ok(_) => log::info!("theme: desktop icon set ({})", name),
            Err(e) => log::warn!("theme: set_icon({}) failed: {}", name, e),
        },
        Err(e) => log::warn!("theme: decode {} failed: {}", name, e),
    }

    // Windows 任务栏按钮图标来自 AUMID/.lnk 关联（而非窗口 WM_SETICON）——
    // 同步更新快捷方式与注册图标源，让任务栏/桌面快捷方式跟随所选图标。
    #[cfg(target_os = "windows")]
    update_shell_icon_sources(icon_id);
}

/// 找到所选图标的 .ico 文件路径（.lnk IconLocation 需要 .ico，不支持 .png）。
/// 打包态：`$INSTDIR\icons\`（tauri.conf.json resources 打包）；dev 态：仓库 `src-tauri/icons\`。
fn desktop_icon_ico_path(icon_id: &str) -> Option<std::path::PathBuf> {
    let name = if icon_id == "default" {
        "whale.ico".to_string()
    } else {
        format!("whale-girl-{}.ico", icon_id)
    };
    // 打包态：exe 相邻目录。
    if let Ok(exe) = std::env::current_exe() {
        if let Some(dir) = exe.parent() {
            let cand = dir.join("icons").join(&name);
            if cand.exists() {
                return Some(cand);
            }
        }
    }
    // dev 态：仓库 icons。
    let dev = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("icons").join(&name);
    if dev.exists() {
        return Some(dev);
    }
    None
}

/// 更新 Windows 任务栏图标来源：开始菜单 + 桌面 .lnk 的 IconLocation、
/// AUMID 注册 IconUri，并广播 SHCNE_ASSOCCHANGED 让 Explorer 重读。
/// 失败仅 warn（不得破坏图标设置链路）。
#[cfg(target_os = "windows")]
fn update_shell_icon_sources(icon_id: &str) {
    use windows::core::{Interface, PCWSTR};
    use windows::Win32::System::Com::{
        CoCreateInstance, CoInitializeEx, CoUninitialize, IPersistFile, CLSCTX_INPROC_SERVER,
        COINIT_APARTMENTTHREADED, STGM_READWRITE,
    };
    use windows::Win32::UI::Shell::{IShellLinkW, ShellLink, SHChangeNotify, SHCNE_ASSOCCHANGED, SHCNF_IDLIST};

    let Some(ico) = desktop_icon_ico_path(icon_id) else {
        log::warn!("theme: no .ico for '{}' (taskbar icon source not updated)", icon_id);
        return;
    };

    // 定位两个 .lnk（与 register_toast_aumid 相同路径）。
    let mut lnk_paths: Vec<std::path::PathBuf> = Vec::new();
    if let Some(appdata) = std::env::var_os("APPDATA") {
        let start_menu = std::path::Path::new(&appdata)
            .join("Microsoft").join("Windows").join("Start Menu").join("Programs")
            .join("DeepSeek Harness Hub.lnk");
        lnk_paths.push(start_menu);
    }
    // 桌面（OneDrive 重定向用 SHGetKnownFolderPath 才准；此处近似 USERPROFILE\Desktop）。
    if let Some(profile) = std::env::var_os("USERPROFILE") {
        let desktop = std::path::Path::new(&profile).join("Desktop").join("DeepSeek Harness Hub.lnk");
        if desktop.exists() {
            lnk_paths.push(desktop);
        }
    }

    let wide_ico: Vec<u16> = ico.to_string_lossy().encode_utf16().chain(std::iter::once(0)).collect();
    unsafe {
        if CoInitializeEx(None, COINIT_APARTMENTTHREADED).is_err() {
            log::warn!("theme: CoInitializeEx failed");
            return;
        }
        for lnk in &lnk_paths {
            if !lnk.exists() {
                continue;
            }
            let wide_lnk: Vec<u16> = lnk.to_string_lossy().encode_utf16().chain(std::iter::once(0)).collect();
            let link: Result<IShellLinkW, _> = CoCreateInstance(&ShellLink, None, CLSCTX_INPROC_SERVER);
            match link {
                Ok(link) => {
                    let pf: Result<IPersistFile, _> = link.cast();
                    match pf {
                        Ok(pf) => {
                            if pf.Load(PCWSTR(wide_lnk.as_ptr()), STGM_READWRITE).is_ok() {
                                link.SetIconLocation(PCWSTR(wide_ico.as_ptr()), 0).ok();
                                let _ = pf.Save(PCWSTR(wide_lnk.as_ptr()), true);
                                log::info!("theme: updated shortcut icon → {}", lnk.display());
                            }
                        }
                        Err(e) => log::warn!("theme: cast IPersistFile failed: {}", e),
                    }
                }
                Err(e) => log::warn!("theme: CoCreateInstance ShellLink failed: {}", e),
            }
        }
        CoUninitialize();
    }

    // AUMID 注册 IconUri → 所选 .ico（任务栏按 AppUserModelId 关联取图标）。
    {
        use std::os::windows::process::CommandExt;
        let key = "HKCU\\Software\\Classes\\AppUserModelId\\com.marecgents.dsh-hub";
        let ico_str = ico.to_string_lossy().to_string();
        let mut c = std::process::Command::new("reg");
        c.args(["add", key, "/v", "IconUri", "/t", "REG_SZ", "/d", &ico_str, "/f"]);
        c.creation_flags(0x08000000);
        match c.output() {
            Ok(out) if out.status.success() => log::info!("theme: AUMID IconUri → {}", ico_str),
            Ok(out) => log::warn!("theme: AUMID IconUri reg failed: {}", String::from_utf8_lossy(&out.stderr)),
            Err(e) => log::warn!("theme: AUMID IconUri reg error: {}", e),
        }
    }

    // 广播变更让 Explorer 重读（任务栏/快捷方式图标刷新）。
    unsafe {
        SHChangeNotify(SHCNE_ASSOCCHANGED, SHCNF_IDLIST, None, None);
    }
}
