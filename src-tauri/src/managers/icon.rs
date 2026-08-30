// icon.rs — 图标多面应用编排（Manager 层）
//
// 模块类别：Manager（壳）
// 职责：用户桌面图标选择（'default' 主题翻转鲸鱼 / 5 鲸鱼娘）的**统一编排**：
//       一次 apply(id, dark) 驱动全部图标面——窗口 SMALL+BIG、托盘、壳图标源
//       （.lnk×2 + AUMID IconUri + SHChangeNotify）、自绘标题栏 SVG。
//       面级幂等（去重键含 dark，失败不记录 → 同 id 可重试）、日志统一前缀
//       "icon:"、失败仅 warn（不得破坏设置链路）。
// 外部接口：IconManager（app.manage 注册）——apply / apply_theme_aware /
//           sync_after_shortcuts。
//
// 迁移来源（2026-08-22 重构，修「一改就崩」）：
//   - helpers/theme.rs 原 apply_desktop_icon / update_shell_icon_sources /
//     desktop_icon_ico_path / LAST_BIG_ICON / LAST_SHELL_ICON 全部收敛于此
//     （theme.rs 回归无状态纯函数）；BIG HICON 生命周期也由本管理器持有。
//   - commands/lib 各调用点收敛为一行；命令名/ACL/管道协议不变。

use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Condvar, Mutex};
use tauri::{AppHandle, Manager};

/// 各面去重键：
///   - window/tray：(icon_id, dark)——'default' 输出依赖主题，同 id 不同 dark
///     必须重应用（过去以 id 为键导致强制主题模式 + 同 id 重试 stale）。
///   - shell：icon_id（静态输出，.ico / SVG 与主题无关）。
///   - titlebar：**不设去重**——启动早期 eval 时页面图标容器可能尚未就绪或
///     icons-api 未起（img 404），相同 id 也必须重灌（页面端幂等）修复
///     「启动后标题栏图标一直空白、切换图标才出现」的时序竞态。
pub struct IconManager {
    /// 全局 apply 串行锁：worker 内各面串行执行（防并发竞争/卡死）。
    apply_lock: Mutex<()>,
    /// 待应用请求（合并：快速切换只保留**最新**，中间态丢弃——避免线程积压与
    /// shell 面风暴）。worker 消费后清空。
    pending: Mutex<Option<(String, bool)>>,
    pending_cv: Condvar,
    /// worker 是否已启动（只 spawn 一个常驻线程）。
    worker_started: AtomicBool,
    window: Mutex<Option<(String, bool)>>,
    tray: Mutex<Option<(String, bool)>>,
    shell: Mutex<Option<String>>,
    /// 窗口 BIG（ICON_BIG）HICON 句柄（isize），替换时 Destroy 旧值防泄漏。
    big_icon: Mutex<Option<isize>>,
}

impl Default for IconManager {
    fn default() -> Self {
        Self {
            apply_lock: Mutex::new(()),
            pending: Mutex::new(None),
            pending_cv: Condvar::new(),
            worker_started: AtomicBool::new(false),
            window: Mutex::new(None),
            tray: Mutex::new(None),
            shell: Mutex::new(None),
            big_icon: Mutex::new(None),
        }
    }
}

impl IconManager {
    /// 唯一业务入口：记录待应用请求并唤醒 worker（**立即返回，IPC 不阻塞**）。
    /// 快速连续切换时 pending 被覆盖（只保留最新请求）——worker 只消费最后一次，
    /// 中间态全部丢弃（最终图标 = 最后选择；无线程积压、无 shell 面风暴）。
    /// 面级幂等由 worker 内 apply_all 保证（同 id 跳过已应用面）。
    pub fn apply(&self, app: &AppHandle, icon_id: &str, dark: bool) {
        {
            let mut p = self.pending.lock().unwrap();
            *p = Some((icon_id.to_string(), dark));
        }
        self.pending_cv.notify_one();
        self.ensure_worker(app);
    }

    /// apply_page_theme 用：读持久化 desktopIcon 后按主题应用（'default' 翻转自然正确）。
    pub fn apply_theme_aware(&self, app: &AppHandle, dark: bool) {
        let id = crate::state::read_shell_config_str("desktopIcon", "default");
        self.apply(app, &id, dark);
    }

    /// AUMID 后台注册线程收尾：.lnk 刚建好时补上启动竞态窗口内漏掉的
    /// IconLocation 更新（强制清 shell 面去重后重跑）。**立即执行**（AUMID 线程
    /// 本身是后台；不排队——启动竞态窗口需要尽快补）。
    pub fn sync_after_shortcuts(&self, app: &AppHandle, icon_id: &str) {
        let _guard = self.apply_lock.lock().unwrap();
        *self.shell.lock().unwrap() = None;
        self.apply_shell_face(app, icon_id);
    }

    /// 启动常驻 worker（只一次）：循环消费 pending → apply_all。
    /// Condvar 等待（无空转）；进程退出时线程随进程结束。
    fn ensure_worker(&self, app: &AppHandle) {
        if self.worker_started.swap(true, Ordering::SeqCst) {
            return;
        }
        let app2 = app.clone();
        std::thread::spawn(move || {
            let mgr = app2.state::<IconManager>();
            loop {
                let (id, dark) = {
                    let mut p = mgr.pending.lock().unwrap();
                    loop {
                        if let Some(v) = p.take() {
                            break v;
                        }
                        p = mgr.pending_cv.wait(p).unwrap();
                    }
                };
                mgr.apply_all(&app2, &id, dark);
            }
        });
    }

    /// worker 内执行全部面（串行 + 面级幂等）。
    /// 顺序：shell 面（AUMID IconUri + .lnk + Explorer 通知）**先于**窗口面——
    /// 任务栏按钮按 AppUserModelId 关联取图标（见 update_shell_icon_sources
    /// 注释），若窗口图标先换而 AUMID 仍指向旧 .ico，任务栏要等慢速的
    /// SHCNE_ASSOCCHANGED 落地才跟随（Bug-3 延迟根因）；先注册新 IconUri
    /// 再重绘窗口图标，任务栏按钮在窗口重绘时即取到新图标。
    fn apply_all(&self, app: &AppHandle, icon_id: &str, dark: bool) {
        let _guard = self.apply_lock.lock().unwrap();
        self.apply_shell_face(app, icon_id);
        self.apply_window_face(app, icon_id, dark);
        self.apply_tray_face(app, icon_id, dark);
        self.apply_titlebar_face(app, icon_id);
    }

    /// 窗口面（SMALL via Tauri set_icon + BIG via Win32 ICON_BIG）。
    fn apply_window_face(&self, app: &AppHandle, icon_id: &str, dark: bool) {
        let key = (icon_id.to_string(), dark);
        {
            let win = self.window.lock().unwrap();
            if win.as_ref() == Some(&key) {
                return; // 同 (id, dark) 已应用
            }
        }
        let Some(win) = app.get_webview_window("main") else {
            log::warn!("icon: main window not found, window face skipped");
            return;
        };
        let (bytes, name) = crate::theme::desktop_icon_png(dark, icon_id);
        // BIG HICON 生命周期：锁内替换（专用短锁，不做慢活之外的持有）。
        let mut prev_big = self.big_icon.lock().unwrap();
        crate::theme::apply_window_icons(&win, bytes, name, &mut prev_big);
        drop(prev_big);
        *self.window.lock().unwrap() = Some(key);
    }

    /// 托盘面（dark 显式传入，与窗口面同键判定）。
    fn apply_tray_face(&self, app: &AppHandle, icon_id: &str, dark: bool) {
        let key = (icon_id.to_string(), dark);
        {
            let tray = self.tray.lock().unwrap();
            if tray.as_ref() == Some(&key) {
                return;
            }
        }
        crate::tray::set_tray_icon(app, icon_id, dark);
        *self.tray.lock().unwrap() = Some(key);
    }

    /// 壳图标源面：开始菜单 + 桌面 .lnk IconLocation、AUMID IconUri、
    /// SHChangeNotify（Explorer 重读）。.ico 缺失时不记录（下次同 id 可重试）。
    fn apply_shell_face(&self, app: &AppHandle, icon_id: &str) {
        {
            let shell = self.shell.lock().unwrap();
            if shell.as_deref() == Some(icon_id) {
                return;
            }
        }
        update_shell_icon_sources(app, icon_id);
        // .ico 缺失时 update_shell_icon_sources 内部已返回且不置键 → 可重试。
        let ico_exists = desktop_icon_ico_path(icon_id).is_some();
        if ico_exists {
            *self.shell.lock().unwrap() = Some(icon_id.to_string());
        }
    }

    /// 自绘标题栏面（第 6 面）：Rust→页面 eval `__mgSetDesktopIcon(id)`。
    /// 页面未就绪时写入 `__mgPendingDesktopIcon`，initShell 补应用（与
    /// __mgSetShellTheme / __mgPendingShellTheme 同一容错模式）。
    fn apply_titlebar_face(&self, app: &AppHandle, icon_id: &str) {
        // No dedup: re-inject on every apply (page-side is idempotent). The
        // first boot eval can race the page container / icons-api being up
        // (blank img), so the next apply_page_theme or icon switch must retry.
        let Some(win) = app.get_webview_window("main") else {
            return;
        };
        let id_json = serde_json::to_string(icon_id).unwrap_or_else(|_| "\"default\"".to_string());
        let script = format!(
            "window.__mgSetDesktopIcon && window.__mgSetDesktopIcon({id_json}) || (window.__mgPendingDesktopIcon = {id_json})"
        );
        if let Err(e) = win.eval(&script) {
            log::warn!("icon: titlebar eval failed: {}", e);
            return;
        }
        log::info!("icon: titlebar face applied ({})", icon_id);
    }
}

/// 找到所选图标的 .ico 文件路径（.lnk IconLocation 需要 .ico，不支持 .png）。
/// 打包态：`$INSTDIR\icons\`（tauri.conf.json resources 打包）；dev 态：仓库 `src-tauri/icons\`。
/// 注意 icon_id 已含完整前缀（'whale-girl-sad'）——文件名直接 `{icon_id}.ico`
/// （曾误写 `whale-girl-{icon_id}.ico` 拼出双重前缀，鲸鱼娘 .lnk 更新从未生效）。
#[cfg(target_os = "windows")]
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
    let dev = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("icons")
        .join(&name);
    if dev.exists() {
        return Some(dev);
    }
    None
}

/// 固定图标锚点：`current.ico`（exe 相邻 icons\ 下）。所有 .lnk 的
/// IconLocation 与 AUMID IconUri 统一指向它——切换图标时只重写这一个
/// 文件并通知 Explorer，**任何位置**的快捷方式（含被用户移走的桌面 lnk）
/// 都会立即跟随，无需找到每个 .lnk 逐个改写（2026-08-29 用户反馈：
/// 桌面 lnk 移走后切换图标，lnk 与任务栏图标不再跟随）。
/// dev 态落在仓库 icons\（.gitignore）。
#[cfg(target_os = "windows")]
fn current_ico_path() -> Option<std::path::PathBuf> {
    if let Ok(exe) = std::env::current_exe() {
        if let Some(dir) = exe.parent() {
            return Some(dir.join("icons").join("current.ico"));
        }
    }
    Some(
        std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
            .join("icons")
            .join("current.ico"),
    )
}

/// 更新 Windows 壳图标源：开始菜单 + 桌面 .lnk 的 IconLocation、
/// AUMID 注册 IconUri，并广播 SHCNE_ASSOCCHANGED 让 Explorer 重读。
/// .ico 缺失时直接返回（调用方不置去重键 → 下次同 id 可重试）。
/// 失败仅 warn（不得破坏图标设置链路）。由 IconManager::apply_shell_face 调用。
///
/// 图标指向策略（2026-08-29 重构）：lnk/AUMID 不再指向随选择变化的
/// `{icon_id}.ico`，而是统一指向固定的 `current.ico`——切换时把选中的
/// .ico **复制**为 current.ico。这样快捷方式（无论被移到哪里）都经由
/// 稳定路径取图标；旧机制下移走的 lnk 停在旧 `{icon_id}.ico` 上不再
/// 跟随（找不到它）。已存在的 lnk 在本次更新中一并把 IconLocation
/// 改写为 current.ico，从此永久跟随。
#[cfg(target_os = "windows")]
fn update_shell_icon_sources(_app: &AppHandle, icon_id: &str) {
    use crate::winutil::{wide, ComInit};
    use windows::core::{Interface, PCWSTR};
    use windows::Win32::System::Com::{
        CoCreateInstance, IPersistFile, CLSCTX_INPROC_SERVER, COINIT_APARTMENTTHREADED,
        STGM_READWRITE,
    };
    use windows::Win32::UI::Shell::{
        IShellLinkW, SHChangeNotify, ShellLink, SHCNE_ASSOCCHANGED, SHCNE_UPDATEITEM, SHCNF_IDLIST,
        SHCNF_PATHW,
    };

    let Some(ico) = desktop_icon_ico_path(icon_id) else {
        log::warn!(
            "icon: no .ico for '{}' (taskbar icon source not updated)",
            icon_id
        );
        return; // 未置去重键——下次同 id 进入可重试（如 .ico 尚未就位）。
    };

    // 把选中的 .ico 复制为固定锚点 current.ico；lnk/AUMID 全部指向它。
    let Some(current) = current_ico_path() else {
        log::warn!("icon: no current.ico anchor path");
        return;
    };
    if let Some(parent) = current.parent() {
        let _ = std::fs::create_dir_all(parent);
    }
    if let Err(e) = std::fs::copy(&ico, &current) {
        log::warn!(
            "icon: copy {} -> {} failed: {} (shell icon sources not updated)",
            ico.display(),
            current.display(),
            e
        );
        return;
    }
    let ico = current;
    log::info!("icon: anchor current.ico refreshed from '{}'", icon_id);

    // 更新开始菜单快捷方式图标（与 lib.rs create_toast_shortcuts 同路径）；
    // 桌面快捷方式**存在时才更新**图标（安装时由 NSIS 创建、用户未移走时
    // 跟随自定义图标设置）——启动不创建/不检查，用户移走则不干预
    // （2026-08-29 修复：此前误删「存在才更新」导致桌面 lnk 图标不跟随）。
    let mut lnk_paths: Vec<std::path::PathBuf> = Vec::new();
    if let Some(appdata) = std::env::var_os("APPDATA") {
        let start_menu = std::path::Path::new(&appdata)
            .join("Microsoft")
            .join("Windows")
            .join("Start Menu")
            .join("Programs")
            .join("DeepSeek Harness Hub.lnk");
        lnk_paths.push(start_menu);
    }
    // 桌面：FOLDERID_Desktop（OneDrive 重定向安全）；仅在快捷方式已存在时更新。
    let desktop = crate::theme::known_desktop_path().join("DeepSeek Harness Hub.lnk");
    if desktop.exists() {
        lnk_paths.push(desktop);
    }

    let wide_ico = wide(&ico.to_string_lossy());
    // SAFETY (whole block): COM apartment is opened via the ComInit RAII guard
    // (CoUninitialize guaranteed even on error branches).
    unsafe {
        let Some(_com) = ComInit::new(COINIT_APARTMENTTHREADED) else {
            log::warn!("icon: CoInitializeEx failed");
            return;
        };
        for lnk in &lnk_paths {
            if !lnk.exists() {
                continue;
            }
            let wide_lnk = wide(&lnk.to_string_lossy());
            let link: Result<IShellLinkW, _> =
                CoCreateInstance(&ShellLink, None, CLSCTX_INPROC_SERVER);
            match link {
                Ok(link) => {
                    let pf: Result<IPersistFile, _> = link.cast();
                    match pf {
                        Ok(pf) => {
                            // SAFETY: wide_lnk / wide_ico are NUL-terminated
                            // buffers living for the duration of the calls;
                            // the shell link object is apartment-threaded and
                            // confined to this thread.
                            if pf.Load(PCWSTR(wide_lnk.as_ptr()), STGM_READWRITE).is_ok() {
                                link.SetIconLocation(PCWSTR(wide_ico.as_ptr()), 0).ok();
                                let _ = pf.Save(PCWSTR(wide_lnk.as_ptr()), true);
                                log::info!("icon: updated shortcut icon → {}", lnk.display());
                            }
                        }
                        Err(e) => log::warn!("icon: cast IPersistFile failed: {}", e),
                    }
                }
                Err(e) => log::warn!("icon: CoCreateInstance ShellLink failed: {}", e),
            }
        }
    }

    // AUMID 注册 IconUri → 所选 .ico（任务栏按 AppUserModelId 关联取图标）。
    {
        use std::os::windows::process::CommandExt;
        let key = "HKCU\\Software\\Classes\\AppUserModelId\\com.marecgents.dsh-hub";
        let ico_str = ico.to_string_lossy().to_string();
        let mut c = std::process::Command::new("reg");
        c.args([
            "add", key, "/v", "IconUri", "/t", "REG_SZ", "/d", &ico_str, "/f",
        ]);
        c.creation_flags(0x08000000);
        match c.output() {
            Ok(out) if out.status.success() => log::info!("icon: AUMID IconUri → {}", ico_str),
            Ok(out) => log::warn!(
                "icon: AUMID IconUri reg failed: {}",
                String::from_utf8_lossy(&out.stderr)
            ),
            Err(e) => log::warn!("icon: AUMID IconUri reg error: {}", e),
        }
    }

    // 广播变更让 Explorer 重读（任务栏/快捷方式图标刷新）。
    unsafe {
        // SAFETY: wide_ico0 is a NUL-terminated UTF-16 buffer that lives for
        // the duration of the SHChangeNotify call; SHCNF_PATHW consumes it
        // synchronously. The ASSOCCHANGED broadcast passes null items, which
        // the API documents as acceptable for this event.
        let wide_ico0 = wide(&ico.to_string_lossy());
        SHChangeNotify(
            SHCNE_UPDATEITEM,
            SHCNF_PATHW,
            Some(wide_ico0.as_ptr() as *const _),
            None,
        );
        SHChangeNotify(SHCNE_ASSOCCHANGED, SHCNF_IDLIST, None, None);
    }
}

// Windows 非目标平台（macOS/Linux）编译时提供 no-op 壳源面（避免 cfg 门控
// 散落调用点）。当前仓库仅 Windows 目标，保留为未来多端预留。
#[cfg(not(target_os = "windows"))]
fn update_shell_icon_sources(_app: &AppHandle, _icon_id: &str) {}
