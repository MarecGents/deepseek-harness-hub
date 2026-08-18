// lib.rs — dsh-hub Tauri 2.x 壳入口（M4 Node sidecar 接入）
//
// 模块类别：Controller（壳入口）
// 职责：日志（X1 三目标）、托盘（T3.1）、单实例（T3.3）、通知（T3.5）、
//       窗口管理（T2.1-T2.4）、Node sidecar 接入（T4.1/T4.4）、
//       关闭到托盘（T3.2）、quit.marker 语义（T3.6）。
// 迁移映射：src/desktop.ts + bin/launcher.mjs → Rust 壳层。
//
// 启动流程（T4.4 SOP §5.4 步骤 4）：
//   1. 多实例检测前置（T4.2 双通道）
//   2. 启动 Node sidecar（T4.1）→ spawn dsh web --port 0
//   3. 等 stdout READY（dsh web: http://127.0.0.1:N）
//   4. READY 先验证再导航（HTTP 探测确认）
//   5. WebviewUrl::External("http://127.0.0.1:N") 建窗

mod window;
mod state;
mod theme;
mod tray;
mod single_instance;
mod os_theme;
mod notify;
mod quit;
mod node;
mod commands;

use log::{info, warn};
use tauri::{Listener, Manager};

/// M1 IPC 冒烟命令。
#[tauri::command]
fn ping() -> String { "pong".to_string() }

/// READY 先验证再导航（T4.4 强制步骤）：轮询 TCP 连接到 127.0.0.1:<port> 确认端口可达。
/// 升格为强制前置：60s 超时、500ms 间隔、连续 15 次连接失败报错。
/// 用 std::net::TcpStream 避免添加 reqwest 依赖。
fn wait_for_ready(port: u16) -> Result<(), String> {
    use std::net::TcpStream;
    use std::time::{Duration, Instant};

    let addr = format!("127.0.0.1:{port}");
    let mut failures = 0u32;
    let max_failures = 15u32;
    let timeout = Duration::from_secs(60);
    let start = Instant::now();

    loop {
        if start.elapsed() > timeout {
            return Err(format!("READY verification timeout ({:.0}s)", timeout.as_secs()));
        }
        match TcpStream::connect_timeout(&addr.parse().unwrap(), Duration::from_millis(500)) {
            Ok(_) => {
                info!("t4.4: READY verified — {addr} reachable");
                return Ok(());
            }
            Err(e) => {
                failures += 1;
                if failures >= max_failures {
                    return Err(format!("READY verification: {addr} connect failed ({e}) {failures}/{max_failures}"));
                }
                warn!("t4.4: {addr} connect failed ({e}), retry {failures}/{max_failures}");
            }
        }
        std::thread::sleep(Duration::from_millis(500));
    }
}

/// 读取 closeToTray 配置（M3 直读 $DSH_HOME/dsh-hub/config.json）。
fn read_close_to_tray() -> bool {
    let config_path = state::dsh_home().join("dsh-hub").join("config.json");
    match std::fs::read_to_string(&config_path) {
        Ok(content) => serde_json::from_str::<serde_json::Value>(&content)
            .ok()
            .and_then(|json| json.get("closeToTray").and_then(|v| v.as_bool()))
            .unwrap_or(true),
        Err(_) => true,
    }
}


pub fn run() {
    let log_dir = state::dsh_home().join("dsh-hub").join("logs");

    tauri::Builder::default()
        // X1 日志三目标。
        .plugin(
            tauri_plugin_log::Builder::new()
                .targets([
                    tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::Stdout),
                    tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::Webview),
                    tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::Folder {
                        path: log_dir,
                        file_name: Some("dsh.log".to_string()),
                    }),
                ])
                .build(),
        )
        // T3.3：单实例插件。
        .plugin(single_instance::single_instance_plugin())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            ping,
            commands::diag_report,
            commands::set_window_theme,
            commands::set_window_size,
            commands::get_workspace_path,
            commands::window_minimize,
            commands::window_toggle_maximize,
            commands::window_close,
            notify::notify_task_complete,
        ])
        .setup(|app| {
            // ── M4 流程（T4.4 SOP §5.4 步骤 4）──
            // 1. 托盘。
            let _tray = tray::setup_tray(app)?;

            // 2. 启动 Node sidecar（T4.1）。
            let node_state = std::sync::Arc::new(node::NodeState::new());
            match node::start_dsh(node_state.clone(), app.handle().clone()) {
                Ok(_) => {
                    info!("m4: dsh web sidecar starting…");
                }
                Err(e) => {
                    warn!("m4: sidecar start failed ({e}), falling back to temporary page");
                    let win = window::build_main_window(app)?;
                    let _ = theme::apply_theme(&win, tauri::Theme::Dark);
                    app.manage(node_state);
                    return Ok(());
                }
            }

            // 3. 等 READY（dsh web: http://127.0.0.1:N）。
            //    start_dsh 里后台线程解析 stdout，state.port 在 READY 后更新。
            //    轮询 state.port（最多 60s）。
            let port = {
                let start = std::time::Instant::now();
                loop {
                    let p = *node_state.port.lock().unwrap();
                    if let Some(port) = p {
                        break port;
                    }
                    if start.elapsed().as_secs() > 60 {
                        warn!("m4: READY timeout, falling back to temporary page");
                        let win = window::build_main_window(app)?;
                        let _ = theme::apply_theme(&win, tauri::Theme::Dark);
                        app.manage(node_state);
                        return Ok(());
                    }
                    std::thread::sleep(std::time::Duration::from_millis(200));
                }
            };

            info!("m4: sidecar READY on port {port}");

            // 4. READY 先验证再导航（强制步骤）。
            if let Err(e) = wait_for_ready(port) {
                warn!("m4: READY verification failed ({e}), falling back");
                let win = window::build_main_window(app)?;
                let _ = theme::apply_theme(&win, tauri::Theme::Dark);
                app.manage(node_state);
                return Ok(());
            }

            // 5. 导航到 dsh web URL（WebviewUrl::External）。
            let url = format!("http://127.0.0.1:{port}");
            info!("m4: navigating to {}", url);

            // 构建窗口指向 dsh web（而非临时页）。
            // WebviewUrl::External 解析为远程 URL。
            let external_url = tauri::WebviewUrl::External(url.parse().map_err(|e| {
                format!("invalid sidecar URL: {e}")
            })?);

            // 注入壳标记 + 自绘标题栏 + 托盘事件桥（Tauri frameless 窗口标准做法）。
            // dsh web 无内置标题栏——壳层必须注入窗口控制（最小化/最大化/关闭/拖拽）。
            // 托盘菜单经 `app.emit("mg:shell-command")` 下行 → 此桥转 CustomEvent 给页面。
            let init_script = r#"
                window.__MG_SHELL_READY = true;
                window.__DSH_SHELL = 'tauri';
                window.__DSH_HUB_LAUNCHED = '1';

                // ── Tauri 事件 → 页面 CustomEvent 桥（托盘菜单 mg:shell-command）──
                // tray.rs 用 app.emit("mg:shell-command", payload) 下行；
                // dsh-hub client 监听 window 'mg:shell-command' CustomEvent。
                // __mgShellReady 让壳的重试探针直到此监听就位。
                if (window.__TAURI_INTERNALS__ && window.__TAURI_INTERNALS__.event) {
                    window.__TAURI_INTERNALS__.event.listen('mg:shell-command', (e) => {
                        window.dispatchEvent(new CustomEvent('mg:shell-command', { detail: e.payload }));
                    }).catch(() => {});
                    window.__TAURI_INTERNALS__.event.listen('mg:workspace-path', (e) => {
                        window.dispatchEvent(new CustomEvent('mg:workspace-path', { detail: e.payload }));
                    }).catch(() => {});
                }

                // ── 自绘标题栏（Tauri frameless 窗口窗口控制）──
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', injectTitleBar);
                } else {
                    injectTitleBar();
                }

                function injectTitleBar() {
                    if (document.getElementById('dsh-hub-titlebar')) return; // 幂等

                    const bar = document.createElement('div');
                    bar.id = 'dsh-hub-titlebar';
                    bar.style.cssText = [
                        'position:fixed', 'top:0', 'left:0', 'right:0', 'height:32px',
                        'z-index:99999', 'display:flex', 'align-items:center',
                        'justify-content:space-between', 'background:#181c24',
                        'border-bottom:1px solid #252a36', 'user-select:none',
                        '-webkit-user-select:none', 'pointer-events:auto',
                    ].join(';');

                    const title = document.createElement('div');
                    title.textContent = 'DeepSeek Harness Hub';
                    title.style.cssText = [
                        'padding-left:12px', 'font-size:12px', 'color:#8b9bb5',
                        'font-family:system-ui,sans-serif', 'flex:1',
                        '-webkit-app-region:drag', 'height:100%', 'display:flex',
                        'align-items:center', 'cursor:default',
                    ].join(';');
                    bar.appendChild(title);

                    const controls = document.createElement('div');
                    controls.style.cssText = 'display:flex;height:100%;-webkit-app-region:no-drag;';

                    const btnStyle = [
                        'width:46px', 'height:100%', 'border:none', 'background:transparent',
                        'color:#8b9bb5', 'font-size:14px', 'cursor:pointer', 'display:flex',
                        'align-items:center', 'justify-content:center',
                        'transition:background 0.15s', 'font-family:system-ui,sans-serif',
                    ].join(';');

                    const invoke = (cmd) => {
                        if (window.__TAURI_INTERNALS__ && window.__TAURI_INTERNALS__.invoke) {
                            // 诊断：先上报按钮点击（验证 remote origin invoke 链路）。
                            window.__TAURI_INTERNALS__.invoke('diag_report', { msg: 'btn:' + cmd }).catch(() => {});
                            window.__TAURI_INTERNALS__.invoke(cmd).catch(() => {});
                        }
                    };

                    function makeBtn(label, cmd) {
                        const b = document.createElement('button');
                        b.textContent = label;
                        b.style.cssText = btnStyle;
                        b.onmouseenter = () => { b.style.background = '#252a36' };
                        b.onmouseleave = () => { b.style.background = 'transparent' };
                        b.onclick = () => invoke(cmd);
                        return b;
                    }

                    controls.appendChild(makeBtn('─', 'window_minimize'));
                    const maxBtn = makeBtn('□', 'window_toggle_maximize');
                    controls.appendChild(maxBtn);
                    controls.appendChild(makeBtn('✕', 'window_close'));

                    bar.appendChild(controls);
                    document.body.prepend(bar);

                    const root = document.getElementById('root');
                    if (root) {
                        root.style.paddingTop = '32px';
                        root.style.boxSizing = 'border-box';
                    }
                }
            "#;

            let win = tauri::WebviewWindowBuilder::new(app, "main", external_url)
                .title("DeepSeek Harness Hub")
                .inner_size(1440.0, 810.0)  // 3/4 屏幕（M2 window 计算值）
                .min_inner_size(480.0, 360.0)
                .center()
                .decorations(false)
                .transparent(false)
                .initialization_script(init_script)
                .build()?;

            // 6. 应用主题（M2 DWM）。
            theme::apply_theme(&win, tauri::Theme::Dark)?;

            // 7. 事件接线（M2 resize + M3 closeToTray）。
            let win_handle = win.clone();
            win.listen("tauri://resize", move |_event| {
                if let Ok(inner) = win_handle.inner_size() {
                    let _ = state::save_window_state(state::WindowState {
                        maximized: false,
                        width: inner.width,
                        height: inner.height,
                    });
                }
            });

            // T3.2：关闭到托盘（closeToTray=true → prevent_close + hide；false → 退出）。
            // 用 on_window_event + api.prevent_close()：只有 JS 侧有 listener 时
            // tauri 才 prevent_close（manager/window.rs has_js_listener 检查），
            // Rust 侧 win.listen 不满足该条件，窗口会真正关闭导致进程退出。
            let win_handle = win.clone();
            let close_to_tray = read_close_to_tray();
            let on_close_win = win.clone();
            win.on_window_event(move |event| {
                if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                    if close_to_tray {
                        api.prevent_close();
                        let _ = on_close_win.hide();
                        info!("close-requested: closeToTray=true, prevent_close + hiding window");
                    } else {
                        quit::write_quit_marker();
                        info!("close-requested: closeToTray=false, writing quit.marker and exiting");
                        std::process::exit(0);
                    }
                }
            });
            let _ = win_handle;

            // Tray "Open workspace" 路径回传：client 经 __TAURI_INTERNALS__.event.emit
            // 上行 mg:workspace-path → 此处监听 → 平台命令打开 Explorer（跨平台，避免
            // tauri-plugin-shell open 弃用警告）。
            {
                app.listen("mg:workspace-path", move |event| {
                    let path: Option<String> = serde_json::from_str::<serde_json::Value>(event.payload()).ok()
                        .and_then(|v| v.get("path").and_then(|p| p.as_str()).map(String::from))
                        .filter(|p| !p.is_empty());
                    if let Some(path) = path {
                        info!("tray: open-workspace path received: {path}");
                        #[cfg(target_os = "windows")]
                        {
                            let _ = std::process::Command::new("explorer").arg(&path).spawn();
                        }
                        #[cfg(target_os = "macos")]
                        {
                            let _ = std::process::Command::new("open").arg(&path).spawn();
                        }
                        #[cfg(target_os = "linux")]
                        {
                            let _ = std::process::Command::new("xdg-open").arg(&path).spawn();
                        }
                    } else {
                        info!("tray: open-workspace path empty, skipped");
                    }
                });
            }

            info!("dsh-hub shell started (M4: full dsh web UI on port {port})");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running dsh-hub");
}
