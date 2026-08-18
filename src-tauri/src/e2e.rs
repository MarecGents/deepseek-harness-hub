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

use std::thread;
use std::time::Duration;
use log::info;
use tauri::WebviewWindow;

/// 若 DSH_HUB_E2E=1，启动脚本化验证线程（fire-and-forget）。
pub fn maybe_run_e2e(win: WebviewWindow) {
    let enabled = std::env::var("DSH_HUB_E2E").map(|v| v == "1").unwrap_or(false);
    if !enabled {
        return;
    }
    info!("e2e: DSH_HUB_E2E=1 — scripted verification started");
    thread::spawn(move || run_e2e(win));
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

    // ── ① 最小化到托盘（标题栏 ─ 按钮）──
    info!("e2e: clicking minimize button");
    let _ = win.eval("document.querySelector('#dsh-hub-titlebar .tb-controls .tb-btn:nth-child(1)').click();");
    sleep(2);
    info!("e2e: after minimize click visible={}", win.is_visible().unwrap_or(true));
    // 恢复窗口（最小化隐藏后需先 unminimize 再 show）。
    let _ = win.unminimize();
    let _ = win.show();
    sleep(1);

    // ── ① 关闭到托盘（标题栏 ✕ 按钮）──
    info!("e2e: clicking close button");
    let _ = win.eval("document.querySelector('#dsh-hub-titlebar .tb-controls .tb-btn:nth-child(3)').click();");
    sleep(2);
    info!("e2e: after close click visible={} (process must stay alive)", win.is_visible().unwrap_or(true));
    // 恢复窗口（关闭→隐藏，非最小化，show 即可）。
    let _ = win.show();
    sleep(1);

    // ── ③ 通知链（notify_task_complete 命令直达）──
    info!("e2e: invoking notify_task_complete");
    let _ = win.eval(
        "window.__TAURI_INTERNALS__.invoke('notify_task_complete', { title: 'DSH HUB E2E', body: '通知链路验证' }).catch(function(){});",
    );
    sleep(2);

    // ── ④ 自绘托盘菜单（Q5/Q7 新 API：__mgTrayMenuOpen/Close + 切换项）──
    info!("e2e: opening tray menu (label=show)");
    let _ = win.eval("window.__mgTrayMenuOpen && window.__mgTrayMenuOpen('show')");
    sleep(1);
    let _ = win.eval(
        r#"(function(){
            var m = document.getElementById('dsh-hub-tray-menu');
            var open = m !== null && m.classList.contains('mg-open');
            var items = m ? m.querySelectorAll('.tm-item').length : 0;
            var first = m && m.querySelector('.tm-item span:last-child') ? m.querySelector('.tm-item span:last-child').textContent : 'none';
            var bg = m ? getComputedStyle(m).backgroundColor : 'none';
            window.__TAURI_INTERNALS__.invoke('diag_report', {
                msg: 'E2E:tray-menu open=' + open + ' items=' + items + ' first=' + first + ' bg=' + bg
            }).catch(function(){});
        })();"#,
    );
    sleep(1);

    // 标签随可见性更新：可见态 → '隐藏主界面'。
    let _ = win.eval("window.__mgTrayMenuOpen && window.__mgTrayMenuOpen('hide')");
    sleep(1);
    let _ = win.eval(
        "window.__TAURI_INTERNALS__.invoke('diag_report', { msg: 'E2E:tray-first=' + ((document.querySelector('#dsh-hub-tray-menu .tm-item span:last-child')||{}).textContent || 'none') }).catch(function(){});",
    );
    sleep(1);

    // 关闭 → tray_menu_closed 上行（Rust 还原，幂等）。
    let _ = win.eval("window.__mgTrayMenuClose && window.__mgTrayMenuClose()");
    sleep(1);

    // 重开 → 点击「打开工作区」→ 断言 mg:shell-command CustomEvent 派发（同页）。
    let _ = win.eval("window.__mgTrayMenuOpen && window.__mgTrayMenuOpen('hide')");
    sleep(1);
    let _ = win.eval(
        r#"(function(){
            window.__e2eLastCmd = null;
            window.addEventListener('mg:shell-command', function(e){ window.__e2eLastCmd = e.detail && e.detail.command; }, { once: true });
            var items = document.querySelectorAll('#dsh-hub-tray-menu .tm-item');
            if (items.length >= 2) items[1].click();
        })();"#,
    );
    sleep(1);
    let _ = win.eval(
        "window.__TAURI_INTERNALS__.invoke('diag_report', { msg: 'E2E:tray-cmd=' + window.__e2eLastCmd }).catch(function(){});",
    );
    sleep(1);

    // 声音链（Q4）：play_sound 命令 → Rust eval → 页面 __mgPlaySound。
    info!("e2e: invoking play_sound");
    let _ = win.eval("window.__TAURI_INTERNALS__.invoke('play_sound', { kind: 'success' }).catch(function(){});");
    sleep(1);

    // 显示/隐藏切换（Q7）：window_toggle_visible → 隐藏到托盘。
    info!("e2e: invoking window_toggle_visible");
    let _ = win.eval("window.__TAURI_INTERNALS__.invoke('window_toggle_visible').catch(function(){});");
    sleep(2);
    info!("e2e: after toggle visible={} (expect false)", win.is_visible().unwrap_or(true));
    let _ = win.show();
    sleep(1);

    // 最后：菜单「退出」→ invoke('tray_quit') → Rust 写 quit.marker 并退出（预期行为）。
    info!("e2e: clicking quit item (expect clean exit)");
    let _ = win.eval(
        r#"(function(){
            var items = document.querySelectorAll('#dsh-hub-tray-menu .tm-item');
            for (var i = 0; i < items.length; i++) {
                if (items[i].textContent.indexOf('退出') !== -1) { items[i].click(); break; }
            }
        })();"#,
    );
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
