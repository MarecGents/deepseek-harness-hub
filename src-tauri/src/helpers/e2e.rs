// e2e.rs — E2E 验证钩子（仅 debug 构建，DSH_HUB_E2E=1 启用）
//
// 模块类别：Helper（壳，验证用）
// 职责：脚本化验证壳行为（自绘标题栏皮肤跟随 / 最小化到托盘 / 关闭到托盘 /
//       通知链 / 自绘托盘菜单），断言经 info! 日志或页面 diag_report 上行
//       写入 dsh.log——与手工验证同链路，供 DMAIC「Control」阶段复用。
//
// 用法：`DSH_HUB_E2E=1 <dsh-hub.exe>`（配合隔离 DSH_HOME）。脚本跑完后
//       「退出」测试会真正退出进程（写 quit.marker，属预期行为）。
// 外部接口：maybe_run_e2e(win) — 窗口构建后调用；未启用时零开销。

use log::info;
use std::thread;
use std::time::Duration;
use tauri::{Manager, WebviewWindow};

/// 若 DSH_HUB_E2E=1，启动脚本化验证线程（fire-and-forget）。
/// 数据安全红线（铁律 8 / src-tauri AGENTS 红线 9）：启用前必须先断言
/// DSH_HOME 为隔离目录（≠ 真实 ~/.dsh），否则拒绝运行——E2E 会写
/// quit.marker、弹真实 toast，误跑会污染真实 ~/.dsh。
pub fn maybe_run_e2e(win: WebviewWindow) {
    let enabled = std::env::var("DSH_HUB_E2E")
        .map(|v| v == "1")
        .unwrap_or(false);
    if !enabled {
        return;
    }
    info!("e2e: DSH_HUB_E2E=1 — checking DSH_HOME isolation before starting");
    if !dsh_home_is_isolated() {
        log::error!("e2e: scripted verification REFUSED — isolated DSH_HOME required");
        return;
    }
    info!("e2e: DSH_HUB_E2E=1 — scripted verification started");
    thread::spawn(move || run_e2e(win));
}

/// e2e 专用的 DSH_HOME 隔离判定：返回 true 表示 e2e 可安全运行。
/// 要求：DSH_HOME 已设置、目录存在、且不等于真实默认 ~/.dsh。
/// Windows 下大小写/尾部分隔符经 canonicalize 或归一化比较（R1-3 发现 4 修复）。
fn dsh_home_is_isolated() -> bool {
    let Ok(env_home) = std::env::var("DSH_HOME") else {
        log::error!(
            "e2e: REFUSING to run — DSH_HOME not set. E2E requires an isolated DSH_HOME \
             (temp/E-drive dir), never the real ~/.dsh."
        );
        return false;
    };
    let home = crate::state::dsh_home();
    if !home.is_dir() {
        log::error!(
            "e2e: REFUSING to run — DSH_HOME '{}' does not exist. Create the isolated dir first.",
            home.display()
        );
        return false;
    }
    let default_home = dirs::home_dir().unwrap_or_default().join(".dsh");
    let equals_default = match (
        std::fs::canonicalize(&home),
        std::fs::canonicalize(&default_home),
    ) {
        (Ok(a), Ok(b)) => a == b,
        // canonicalize 失败（如权限）时退回大小写折叠 + 去尾部分隔符比较。
        _ => normalize_path(&home) == normalize_path(&default_home),
    };
    if equals_default {
        log::error!(
            "e2e: REFUSING to run — DSH_HOME '{}' equals the real default ~/.dsh '{}'. \
             Point DSH_HOME at an isolated temp/E-drive dir.",
            home.display(),
            default_home.display()
        );
        false
    } else {
        info!(
            "e2e: DSH_HOME isolation verified (DSH_HOME={}, default ~/.dsh={})",
            env_home,
            default_home.display()
        );
        true
    }
}

/// 路径字符串归一化（隔离判定兜底比较）：Windows 折叠大小写，去尾部分隔符。
fn normalize_path(p: &std::path::Path) -> String {
    let s = p.to_string_lossy();
    #[cfg(target_os = "windows")]
    let s = s.to_lowercase();
    s.trim_end_matches(['/', '\\']).to_string()
}

fn sleep(secs: u64) {
    thread::sleep(Duration::from_secs(secs));
}

fn run_e2e(win: WebviewWindow) {
    // 等 dsh UI 完全加载（皮肤注入 + client 事件监听就位）。
    sleep(12);
    info!("e2e: page load grace period over");

    // ── ② 标题栏皮肤跟随（CSS 双块 + transition 断言）──
    // 浅色（无 data-ds-dark-theme）→ 深色标题栏；深色 → 浅色标题栏。
    // 等 400ms（transition 0.2s）让计算值稳定到目标色。
    show_titlebar_colors(&win);
    sleep(2);

    // ── M2 #4/#7 补验证（设置卡即时改尺寸链路）：invoke set_window_size →
    // 窗口尺寸实际变化（config API onChange → shell.applySize 走同一命令）。
    info!("e2e: invoking set_window_size (800x600)");
    let _ = win.eval("window.__TAURI_INTERNALS__.invoke('set_window_size', { width: 800, height: 600 }).catch(function(){});");
    sleep(2);
    if let Ok(inner) = win.inner_size() {
        info!(
            "e2e: after set_window_size inner={}x{}",
            inner.width, inner.height
        );
    }
    // 恢复默认尺寸（后续断言不依赖尺寸，恢复保持环境整洁）。
    let _ = win.eval("window.__TAURI_INTERNALS__.invoke('set_window_size', { width: 1440, height: 810 }).catch(function(){});");
    sleep(1);

    // ── ① 最小化到托盘（标题栏 ─ 按钮）──
    info!("e2e: clicking minimize button");
    let _ = win.eval(
        "document.querySelector('#dsh-hub-titlebar .tb-controls .tb-btn:nth-child(1)').click();",
    );
    sleep(2);
    info!(
        "e2e: after minimize click visible={}",
        win.is_visible().unwrap_or(true)
    );
    // 恢复窗口（最小化隐藏后需先 unminimize 再 show）。
    let _ = win.unminimize();
    let _ = win.show();
    sleep(1);

    // ── ① 关闭到托盘（标题栏 ✕ 按钮）──
    info!("e2e: clicking close button");
    let _ = win.eval(
        "document.querySelector('#dsh-hub-titlebar .tb-controls .tb-btn:nth-child(3)').click();",
    );
    sleep(2);
    info!(
        "e2e: after close click visible={} (process must stay alive)",
        win.is_visible().unwrap_or(true)
    );
    // 恢复窗口（关闭→隐藏，非最小化，show 即可）。
    let _ = win.show();
    sleep(1);

    // ── ③ 通知链（notify_task_complete 命令直达）──
    info!("e2e: invoking notify_task_complete");
    let _ = win.eval(
        "window.__TAURI_INTERNALS__.invoke('notify_task_complete', { title: 'DSH HUB E2E', body: '通知链路验证' }).catch(function(){});",
    );
    sleep(2);

    // ── ④ 原生托盘菜单派发路径（Q1：tray.rs 菜单事件 → win.eval 派发
    //    CustomEvent → client handleShellCommand → invoke）──
    // 诊断：client 是否挂载（__mgShellReady）+ invoke 可用性。
    let _ = win.eval(
        "window.__TAURI_INTERNALS__.invoke('diag_report', { msg: 'E2E:client-ready=' + (window.__mgShellReady === true) + ' invoke=' + typeof (window.__TAURI_INTERNALS__||{}).invoke }).catch(function(){});",
    );
    sleep(1);
    // 与原生菜单「打开工作区」完全相同的 JS（tray.rs handle_menu_event 生成）。
    info!("e2e: dispatching mg:shell-command open-workspace (same JS the native menu runs)");
    let _ = win.eval("window.dispatchEvent(new CustomEvent('mg:shell-command',{detail:{command:'open-workspace'}}))");
    sleep(2);
    // 独立进程管道全链路（Q6 双向）：Rust 写 dsh web stdin → host 解析聚焦会话
    // → 上行 DSH_CMD → Rust 执行（open_workspace_path / dispatch_page_event）。
    info!("e2e: sending open-workspace via stdin pipe (Q6 two-way)");
    crate::node::send_tray_command(win.app_handle(), "open-workspace");
    sleep(3);
    info!("e2e: sending new-task via stdin pipe (Q6 two-way)");
    crate::node::send_tray_command(win.app_handle(), "new-task");
    sleep(3);
    // 直接 invoke 探针：验证命令+ACL 链路本身（绕开 client）。
    let _ = win.eval("window.__TAURI_INTERNALS__.invoke('open_workspace_path', { path: '' }).catch(function(){});");
    sleep(1);
    // client 应触发 invoke('open_workspace_path')（隔离 profile 无工作区 → 兜底 $DSH_HOME，
    // Rust 会记录 open_workspace_path invoked from page: <path>）。
    // 「新建会话」同路径（new-task → startSession），这里只验证事件到达页面。
    let _ = win.eval(
        r#"(function(){
            window.__e2eLastCmd = null;
            window.addEventListener('mg:shell-command', function(e){ window.__e2eLastCmd = e.detail && e.detail.command; }, { once: true });
            window.dispatchEvent(new CustomEvent('mg:shell-command',{detail:{command:'new-task'}}));
        })();"#,
    );
    sleep(1);
    let _ = win.eval(
        "window.__TAURI_INTERNALS__.invoke('diag_report', { msg: 'E2E:tray-cmd=' + window.__e2eLastCmd }).catch(function(){});",
    );
    sleep(1);

    // 声音链（Q4）：play_sound 命令 → Rust eval → 页面 __mgPlaySound。
    info!("e2e: invoking play_sound");
    let _ = win.eval(
        "window.__TAURI_INTERNALS__.invoke('play_sound', { kind: 'success' }).catch(function(){});",
    );
    sleep(1);

    // S6：桌面图标命令（页面→Rust invoke，ACL allow-set-desktop-icon）。
    // 已知 id → dsh.log 应出现 "desktop icon set (whale-girl-sad)"；未知 id →
    // "unknown desktop icon id"（回退白鲸）——两行日志即命令+回退链路的证据。
    info!("e2e: invoking set_desktop_icon (known + unknown ids)");
    let _ = win.eval("window.__TAURI_INTERNALS__.invoke('set_desktop_icon', { iconId: 'whale-girl-sad' }).catch(function(){});");
    sleep(1);
    let _ = win.eval("window.__TAURI_INTERNALS__.invoke('set_desktop_icon', { iconId: 'not-a-real-icon' }).catch(function(){});");
    sleep(1);
    // 恢复默认（主题翻转鲸鱼），后续断言不受影响。
    let _ = win.eval("window.__TAURI_INTERNALS__.invoke('set_desktop_icon', { iconId: 'default' }).catch(function(){});");
    sleep(1);

    // 显示/隐藏切换（Q7）：window_toggle_visible —— 可见未最小化→隐藏；否则→显示。
    info!("e2e: invoking window_toggle_visible");
    let _ =
        win.eval("window.__TAURI_INTERNALS__.invoke('window_toggle_visible').catch(function(){});");
    sleep(2);
    info!(
        "e2e: after toggle visible={} minimized={}",
        win.is_visible().unwrap_or(true),
        win.is_minimized().unwrap_or(false)
    );
    let _ = win.show();
    sleep(1);

    // 外壳主题覆盖（Q2）：data-mg-shell-theme dark→黑 / light→白 / 移除→token。
    info!("e2e: checking shell theme override");
    let _ = win.eval(
        r#"(function(){
            var bar = document.getElementById('dsh-hub-titlebar');
            if (!bar) { window.__TAURI_INTERNALS__.invoke('diag_report', { msg: 'E2E:titlebar missing' }).catch(function(){}); return; }
            document.body.setAttribute('data-mg-shell-theme','dark');
            setTimeout(function(){
                var d = getComputedStyle(bar).backgroundColor;
                document.body.setAttribute('data-mg-shell-theme','light');
                setTimeout(function(){
                    var l = getComputedStyle(bar).backgroundColor;
                    document.body.removeAttribute('data-mg-shell-theme');
                    window.__TAURI_INTERNALS__.invoke('diag_report', {
                        msg: 'E2E:shelltheme dark=' + d + ' light=' + l
                    }).catch(function(){});
                }, 400);
            }, 400);
        })();"#,
    );
    sleep(2);

    // 最后：退出 → invoke('tray_quit') → Rust 写 quit.marker 并退出（预期行为）。
    info!("e2e: invoking tray_quit (expect clean exit)");
    let _ = win.eval("window.__TAURI_INTERNALS__.invoke('tray_quit').catch(function(){});");
    // 不 sleep：进程即将退出。
}

/// 标题栏验证（Q1/Q2）：高度 42px、右侧栏下移 42px、浅/深两态背景色不同
/// （皮肤 token 同向：浅色主题→浅色 chrome，深色主题→深色 chrome）。
/// 强制切换 data-ds-dark-theme 读取两态；transition 0.2s，每次等 400ms。
fn show_titlebar_colors(win: &WebviewWindow) {
    let _ = win.eval(
        r#"(function(){
            var bar = document.getElementById('dsh-hub-titlebar');
            if (!bar) {
                window.__TAURI_INTERNALS__.invoke('diag_report', { msg: 'E2E:titlebar missing' }).catch(function(){});
                return;
            }
            var h = bar.getBoundingClientRect().height;
            var rs = document.querySelector('#dsh-hub-right-sidebar-root .mg-rs-root');
            var rsTop = rs ? getComputedStyle(rs).top : 'none';
            var hadDark = document.body.hasAttribute('data-ds-dark-theme');
            document.body.removeAttribute('data-ds-dark-theme');
            setTimeout(function(){
                var light = getComputedStyle(bar).backgroundColor;
                var lightColor = getComputedStyle(bar).color;
                document.body.setAttribute('data-ds-dark-theme','');
                setTimeout(function(){
                    var dark = getComputedStyle(bar).backgroundColor;
                    var darkColor = getComputedStyle(bar).color;
                    if (!hadDark) document.body.removeAttribute('data-ds-dark-theme');
                    window.__TAURI_INTERNALS__.invoke('diag_report', {
                        msg: 'E2E:titlebar h=' + h + ' rsTop=' + rsTop + ' light=' + light + ' lc=' + lightColor + ' dark=' + dark + ' dc=' + darkColor
                    }).catch(function(){});
                }, 400);
            }, 400);
        })();"#,
    );
}

#[cfg(test)]
mod tests {
    use super::normalize_path;
    use std::path::Path;

    #[test]
    fn normalizes_windows_case_and_trailing_separator() {
        #[cfg(target_os = "windows")]
        assert_eq!(
            normalize_path(Path::new("C:\\Users\\Test\\")),
            "c:\\users\\test"
        );
        assert_eq!(normalize_path(Path::new("/tmp/x/")), "/tmp/x");
        assert_eq!(normalize_path(Path::new("/tmp/x")), "/tmp/x");
    }
}
