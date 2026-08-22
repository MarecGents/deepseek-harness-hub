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

/// 窗口图标随页面主题翻转（项 3，合并进 apply_page_theme 调用链）。
/// dark → icon-dark.png（白鲸，深色任务栏/标题栏图标）；light → icon-light.png
/// （黑鲸）。PNG 由 scripts/generate-titlebar-icons.mjs 生成（128×128 透明背景），
/// include_bytes! 内嵌（tauri `image-png` feature 解码）。set_icon 失败仅 warn。
pub fn apply_window_icon(win: &WebviewWindow, dark: bool) {
    let (bytes, name) = desktop_icon_png(dark, "default");
    apply_window_icons(win, bytes, name);
}

/// 用户选择的桌面图标（S6，PR #25）：SMALL + BIG 双槽位应用到窗口，
/// 再同步壳图标源（.lnk/AUMID，桌面快捷方式与 toast 图标用）。
/// 图标切换失败仅 warn（不得破坏设置保存链路）。
pub fn apply_desktop_icon(win: &WebviewWindow, icon_id: &str) {
    let dark = win.theme().unwrap_or(Theme::Dark) == Theme::Dark;
    let (bytes, name) = desktop_icon_png(dark, icon_id);
    apply_window_icons(win, bytes, name);

    // 桌面/开始菜单快捷方式图标来自 .lnk IconLocation（默认 exe 内嵌），
    // toast 图标来自 AUMID IconUri——窗口 WM_SETICON 改不到这两处，需同步更新。
    #[cfg(target_os = "windows")]
    update_shell_icon_sources(icon_id);
}

/// 双槽位应用窗口图标：
///   - SMALL（Tauri set_icon → WM_SETICON ICON_SMALL）：标题栏 / Alt-Tab；
///   - BIG（Win32 CreateIconIndirect → WM_SETICON ICON_BIG）：任务栏按钮。
///
/// tao 源码语义（platform_impl/windows/window.rs）：任务栏按钮图标走
/// set_taskbar_icon（ICON_BIG），而 Tauri 2 的 set_icon 只设 SMALL——BIG
/// 缺失时任务栏回退窗口类图标（exe 内嵌），表现为「任务栏图标不变」。
fn apply_window_icons(win: &WebviewWindow, bytes: &[u8], name: &str) {
    match tauri::image::Image::from_bytes(bytes) {
        Ok(img) => {
            #[cfg(target_os = "windows")]
            set_icon_big_win32(win, &img, name);
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
/// 上一枚 BIG HICON 记录在 LAST_BIG_ICON，替换时 DestroyIcon（WM_SETICON 不
/// 转移所有权，防泄漏）。失败仅 warn；跨线程 SendMessageW 与 tao set_icon
/// 同模式（主线程泵消息，同步返回）。
#[cfg(target_os = "windows")]
fn set_icon_big_win32(win: &WebviewWindow, img: &tauri::image::Image<'_>, name: &str) {
    use windows::Win32::Foundation::{HWND, LPARAM, WPARAM};
    use windows::Win32::UI::WindowsAndMessaging::{
        CreateIcon, DestroyIcon, HICON, ICON_BIG, SendMessageW, WM_SETICON,
    };

    static LAST_BIG_ICON: std::sync::Mutex<Option<isize>> = std::sync::Mutex::new(None);

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
                let old = LAST_BIG_ICON.lock().unwrap().replace(hicon.0 as isize);
                SendMessageW(hwnd, WM_SETICON, Some(WPARAM(ICON_BIG as usize)), Some(LPARAM(hicon.0 as isize)));
                if let Some(prev) = old {
                    let _ = DestroyIcon(HICON(prev as _));
                }
                log::info!("theme: window ICON_BIG set ({})", name);
            }
            Err(e) => log::warn!("theme: CreateIcon failed for ICON_BIG ({}): {}", name, e),
        }
    }
}

/// 找到所选图标的 .ico 文件路径（.lnk IconLocation 需要 .ico，不支持 .png）。
/// 打包态：`$INSTDIR\icons\`（tauri.conf.json resources 打包）；dev 态：仓库 `src-tauri/icons\`。
/// 注意 icon_id 已含完整前缀（'whale-girl-sad'）——文件名直接 `{icon_id}.ico`
/// （曾误写 `whale-girl-{icon_id}.ico` 拼出双重前缀，鲸鱼娘 .lnk 更新从未生效）。
fn desktop_icon_ico_path(icon_id: &str) -> Option<std::path::PathBuf> {
    let name = if icon_id == "default" {
        "whale.ico".to_string()
    } else {
        format!("{}.ico", icon_id)
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

/// 更新 Windows 壳图标源：开始菜单 + 桌面 .lnk 的 IconLocation、
/// AUMID 注册 IconUri，并广播 SHCNE_ASSOCCHANGED 让 Explorer 重读。
/// 同一 icon_id 去重（LAST_SHELL_ICON）：apply_page_theme 主题翻转对鲸鱼娘
/// 选择会重复进入此处，而 SHCNE_ASSOCCHANGED 会让 Explorer 重建图标缓存
/// （桌面短暂刷新），icon_id 未变时跳过。每进程首次（含启动恢复）必执行
/// ——create_toast_shortcuts 每次启动会重写 .lnk 重置 IconLocation。
/// 失败仅 warn（不得破坏图标设置链路）。
/// update_shell_icon_sources 的同 id 去重状态（见该函数注释）。
#[cfg(target_os = "windows")]
static LAST_SHELL_ICON: std::sync::Mutex<Option<String>> = std::sync::Mutex::new(None);

/// 强制同步壳图标源（清除去重后重跑 update_shell_icon_sources）。
/// 供 lib.rs 的 AUMID 后台注册线程收尾：注册线程建好 .lnk 后补上竞态窗口内
/// 漏掉的 IconLocation 更新（启动期 apply_desktop_icon 可能早于 .lnk 创建）。
#[cfg(target_os = "windows")]
pub fn sync_shell_icon_sources(icon_id: &str) {
    *LAST_SHELL_ICON.lock().unwrap() = None;
    update_shell_icon_sources(icon_id);
}

#[cfg(target_os = "windows")]
fn update_shell_icon_sources(icon_id: &str) {
    if LAST_SHELL_ICON.lock().unwrap().as_deref() == Some(icon_id) {
        return; // 同 id 已应用（主题翻转重入），壳图标源无需再动。
    }
    use windows::core::{Interface, PCWSTR};
    use windows::Win32::System::Com::{
        CoCreateInstance, CoInitializeEx, CoUninitialize, IPersistFile, CLSCTX_INPROC_SERVER,
        COINIT_APARTMENTTHREADED, STGM_READWRITE,
    };
    use windows::Win32::UI::Shell::{IShellLinkW, ShellLink, SHChangeNotify, SHCNE_ASSOCCHANGED, SHCNF_IDLIST};

    let Some(ico) = desktop_icon_ico_path(icon_id) else {
        log::warn!("theme: no .ico for '{}' (taskbar icon source not updated)", icon_id);
        return; // 未标记 LAST_SHELL_ICON——下次同 id 进入可重试（如 .ico 尚未就位）。
    };
    *LAST_SHELL_ICON.lock().unwrap() = Some(icon_id.to_string());

    // 定位两个 .lnk（与 register_toast_aumid 相同路径）。
    let mut lnk_paths: Vec<std::path::PathBuf> = Vec::new();
    if let Some(appdata) = std::env::var_os("APPDATA") {
        let start_menu = std::path::Path::new(&appdata)
            .join("Microsoft").join("Windows").join("Start Menu").join("Programs")
            .join("DeepSeek Harness Hub.lnk");
        lnk_paths.push(start_menu);
    }
    // 桌面：FOLDERID_Desktop（OneDrive 重定向安全；曾用 USERPROFILE\Desktop
    // 近似，重定向机器上会漏改桌面 .lnk）。
    let desktop = known_desktop_path().join("DeepSeek Harness Hub.lnk");
    if desktop.exists() {
        lnk_paths.push(desktop);
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
