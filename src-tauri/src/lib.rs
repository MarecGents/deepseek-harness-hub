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
#[cfg(debug_assertions)]
mod e2e;

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
    read_shell_config_bool("closeToTray", true)
}

/// 读取 minimizeToTray 配置（默认 true，与 rc.14 一致）。
fn read_minimize_to_tray() -> bool {
    read_shell_config_bool("minimizeToTray", true)
}

/// 读 $DSH_HOME/dsh-hub/config.json 的布尔字段。
fn read_shell_config_bool(key: &str, default: bool) -> bool {
    let config_path = state::dsh_home().join("dsh-hub").join("config.json");
    match std::fs::read_to_string(&config_path) {
        Ok(content) => serde_json::from_str::<serde_json::Value>(&content)
            .ok()
            .and_then(|json| json.get(key).and_then(|v| v.as_bool()))
            .unwrap_or(default),
        Err(_) => default,
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
        // T3.5：通知插件（notify.rs 经 NotificationExt 弹系统 toast）。
        .plugin(tauri_plugin_notification::init())
        .invoke_handler(tauri::generate_handler![
            ping,
            commands::diag_report,
            commands::set_window_theme,
            commands::set_window_size,
            commands::get_workspace_path,
            commands::window_minimize,
            commands::window_toggle_maximize,
            commands::window_close,
            commands::tray_quit,
            commands::open_workspace_path,
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

                // ── 通道决策（D-2 实测）──
                // `__TAURI_INTERNALS__` 只注入 invoke/transformCallback/runCallback/
                // plugins，**没有 `.event` 对象**（事件 API 在 @tauri-apps/api 包里，
                // 页面不打包它）——event.listen/emit 全链路不可用（E2E 实测：
                // Rust app.emit、页面 emit 均不送达）。因此壳桥只用两个已验证通道：
                //   页面 → Rust：invoke 命令（ACL allow-*）
                //   Rust → 页面：win.eval（tray.rs 右键 → __mgTrayMenuToggle）
                // 菜单项 打开工作区/新建任务 = 同页 CustomEvent（client 已监听）；
                // 退出 = invoke('tray_quit')。__mgShellReady 标记保留（client 设置）。

                // ── 自绘标题栏（Tauri frameless 窗口窗口控制）──
                // 皮肤跟随：body（浅色皮肤）→ 深色标题栏；body[data-ds-dark-theme]
                // （深色皮肤）→ 浅色标题栏。transition 保证切换快速且人眼无感。
                //
                // 注意：初始化脚本在「文档创建时」（HTML 尚未解析）执行——此时
                // document.head/body 均为 null，任何解析期 DOM 访问都会抛错杀死
                // 整个脚本（标题栏/菜单全失效）。故样式注入与标题栏构建全部推迟
                // 到 DOMContentLoaded（initShell）。
                function ensureShellStyles() {
                    if (!document.getElementById('dsh-hub-titlebar-style')) {
                        const st = document.createElement('style');
                        st.id = 'dsh-hub-titlebar-style';
                        st.textContent = [
                            '#dsh-hub-titlebar{position:fixed;top:0;left:0;right:0;height:32px;z-index:99999;',
                            'display:flex;align-items:center;justify-content:space-between;user-select:none;',
                            '-webkit-user-select:none;pointer-events:auto;',
                            'background:#181c24;color:#8b9bb5;border-bottom:1px solid #252a36;',
                            'transition:background .2s ease,color .2s ease,border-color .2s ease;}',
                            '#dsh-hub-titlebar .tb-title{padding-left:12px;font-size:12px;color:inherit;',
                            'font-family:system-ui,sans-serif;flex:1;-webkit-app-region:drag;height:100%;',
                            'display:flex;align-items:center;cursor:default;}',
                            '#dsh-hub-titlebar .tb-controls{display:flex;height:100%;-webkit-app-region:no-drag;}',
                            '#dsh-hub-titlebar .tb-btn{width:46px;height:100%;border:none;background:transparent;',
                            'color:inherit;font-size:14px;cursor:pointer;display:flex;align-items:center;',
                            'justify-content:center;transition:background .15s;font-family:system-ui,sans-serif;}',
                            '#dsh-hub-titlebar .tb-btn:hover{background:rgba(128,128,128,.18);}',
                            // 深色皮肤：标题栏反转为浅色（深色内容 + 浅色 chrome，对比清晰）。
                            'body[data-ds-dark-theme] #dsh-hub-titlebar{background:#f0f2f7;color:#3a4356;border-bottom-color:#d5dae3;}',
                            'body[data-ds-dark-theme] #dsh-hub-titlebar .tb-btn:hover{background:rgba(0,0,0,.08);}',
                        ].join('');
                        document.head.appendChild(st);
                    }
                    if (!document.getElementById('dsh-hub-tray-menu-style')) {
                        const mst = document.createElement('style');
                        mst.id = 'dsh-hub-tray-menu-style';
                        mst.textContent = [
                            '#dsh-hub-tray-menu{position:fixed;right:12px;bottom:40px;z-index:100000;',
                            'width:200px;border-radius:10px;padding:6px;display:none;',
                            'background:#181c24;color:#8b9bb5;border:1px solid #252a36;',
                            'box-shadow:0 8px 24px rgba(0,0,0,.4);font-family:system-ui,sans-serif;',
                            'font-size:13px;user-select:none;-webkit-user-select:none;',
                            'transition:background .2s ease,color .2s ease,border-color .2s ease;}',
                            '#dsh-hub-tray-menu.mg-open{display:block;}',
                            '#dsh-hub-tray-menu .tm-item{display:flex;align-items:center;height:34px;',
                            'padding:0 12px;border-radius:6px;cursor:pointer;color:inherit;gap:8px;',
                            'transition:background .15s;}',
                            '#dsh-hub-tray-menu .tm-item:hover{background:rgba(128,128,128,.16);}',
                            '#dsh-hub-tray-menu .tm-item .tm-glyph{width:16px;text-align:center;opacity:.75;}',
                            '#dsh-hub-tray-menu .tm-sep{height:1px;margin:5px 8px;background:rgba(128,128,128,.18);}',
                            '#dsh-hub-tray-menu .tm-quit:hover{background:rgba(200,60,60,.22);color:#ff7b7b;}',
                            // 深色皮肤：菜单反转为浅色（与标题栏同色系 chrome 反转）。
                            'body[data-ds-dark-theme] #dsh-hub-tray-menu{background:#f0f2f7;color:#3a4356;border-color:#d5dae3;}',
                            'body[data-ds-dark-theme] #dsh-hub-tray-menu .tm-item:hover{background:rgba(0,0,0,.08);}',
                            'body[data-ds-dark-theme] #dsh-hub-tray-menu .tm-sep{background:rgba(0,0,0,.12);}',
                            'body[data-ds-dark-theme] #dsh-hub-tray-menu .tm-quit:hover{background:rgba(200,60,60,.16);color:#c03038;}',
                        ].join('');
                        document.head.appendChild(mst);
                    }
                }

                function initShell() {
                    ensureShellStyles();
                    injectTitleBar();
                }

                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', initShell);
                } else {
                    initShell();
                }

                function injectTitleBar() {
                    if (document.getElementById('dsh-hub-titlebar')) return; // 幂等

                    const bar = document.createElement('div');
                    bar.id = 'dsh-hub-titlebar';

                    const title = document.createElement('div');
                    title.className = 'tb-title';
                    title.textContent = 'DeepSeek Harness Hub';
                    bar.appendChild(title);

                    const controls = document.createElement('div');
                    controls.className = 'tb-controls';

                    const invoke = (cmd) => {
                        if (window.__TAURI_INTERNALS__ && window.__TAURI_INTERNALS__.invoke) {
                            // 诊断：先上报按钮点击（验证 remote origin invoke 链路）。
                            window.__TAURI_INTERNALS__.invoke('diag_report', { msg: 'btn:' + cmd }).catch(() => {});
                            window.__TAURI_INTERNALS__.invoke(cmd).catch(() => {});
                        }
                    };

                    function makeBtn(label, cmd) {
                        const b = document.createElement('button');
                        b.className = 'tb-btn';
                        b.textContent = label;
                        b.onclick = () => invoke(cmd);
                        return b;
                    }

                    controls.appendChild(makeBtn('─', 'window_minimize'));
                    controls.appendChild(makeBtn('□', 'window_toggle_maximize'));
                    controls.appendChild(makeBtn('✕', 'window_close'));

                    bar.appendChild(controls);
                    document.body.prepend(bar);

                    const root = document.getElementById('root');
                    if (root) {
                        root.style.paddingTop = '32px';
                        root.style.boxSizing = 'border-box';
                    }
                }

                // ── 自绘托盘菜单（原生 Tauri 托盘菜单无法自定义样式 → 自绘 HTML 浮层）──
                // tray.rs 右键 → app.emit("mg:tray-menu-open") → 此处打开菜单浮层。
                // 皮肤跟随：与标题栏同色系双块（浅色皮肤→深色菜单；深色皮肤→浅色菜单），
                // 背景/文字/边框均跟随皮肤，transition 保证切换平滑。
                // 样式注入见 ensureShellStyles()（DOMContentLoaded 后执行）。

                function hideTrayMenu() {
                    const menu = document.getElementById('dsh-hub-tray-menu');
                    if (menu) menu.classList.remove('mg-open');
                }

                function openTrayMenu() {
                    let menu = document.getElementById('dsh-hub-tray-menu');
                    if (!menu) {
                        menu = document.createElement('div');
                        menu.id = 'dsh-hub-tray-menu';
                        function item(glyph, label, action) {
                            const el = document.createElement('div');
                            el.className = 'tm-item';
                            const g = document.createElement('span');
                            g.className = 'tm-glyph';
                            g.textContent = glyph;
                            const t = document.createElement('span');
                            t.textContent = label;
                            el.appendChild(g);
                            el.appendChild(t);
                            el.onclick = () => { hideTrayMenu(); action(); };
                            return el;
                        }

                        // 「显示主界面」= 关闭菜单（窗口已由托盘点击显示/聚焦）。
                        menu.appendChild(item('▣', '显示主界面', () => {}));
                        // 打开工作区 / 新建任务：与原生菜单事件同一路径
                        // （CustomEvent mg:shell-command → dsh-hub client 处理）。
                        menu.appendChild(item('▤', '打开工作区', () => {
                            window.dispatchEvent(new CustomEvent('mg:shell-command', { detail: { command: 'open-workspace' } }));
                        }));
                        menu.appendChild(item('＋', '新建任务', () => {
                            window.dispatchEvent(new CustomEvent('mg:shell-command', { detail: { command: 'new-task' } }));
                        }));
                        const sep = document.createElement('div');
                        sep.className = 'tm-sep';
                        menu.appendChild(sep);
                        const quitItem = item('✕', '退出', () => {
                            // 上行 invoke('tray_quit') → Rust 写 quit.marker + 退出。
                            if (window.__TAURI_INTERNALS__ && window.__TAURI_INTERNALS__.invoke) {
                                window.__TAURI_INTERNALS__.invoke('tray_quit').catch(() => {});
                            }
                        });
                        quitItem.classList.add('tm-quit');
                        menu.appendChild(quitItem);

                        document.body.appendChild(menu);
                        // 点击菜单外部关闭（capture 阶段：先于 item.onclick 判断，菜单内点击不误关）。
                        document.addEventListener('click', (e) => {
                            if (!menu.contains(e.target)) hideTrayMenu();
                        }, true);
                    }
                    // 切换语义：已开 → 关闭（右键再次触发时收起）。
                    if (menu.classList.contains('mg-open')) {
                        menu.classList.remove('mg-open');
                        return;
                    }
                    menu.classList.add('mg-open');
                }

                // tray.rs 右键 → win.eval("window.__mgTrayMenuToggle()")（Rust→页面
                // 用 eval，见 D-2 通道决策；菜单构建/打开逻辑独立，无事件依赖）。
                window.__mgTrayMenuToggle = openTrayMenu;
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
            let minimize_to_tray = read_minimize_to_tray();
            let on_close_win = win.clone();
            let on_min_win = win.clone();
            win.on_window_event(move |event| {
                match event {
                    tauri::WindowEvent::CloseRequested { api, .. } => {
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
                    // 最小化到托盘：Tauri 无独立 Minimized 事件，用 Resized + is_minimized 检测。
                    tauri::WindowEvent::Resized(_)
                        if minimize_to_tray && on_min_win.is_minimized().unwrap_or(false) => {
                            let _ = on_min_win.hide();
                            info!("resized: minimized → hide to tray (minimizeToTray=true)");
                        }
                    _ => {}
                }
            });
            let _ = win_handle;

            // Tray "Open workspace" 路径回传：client 经 invoke('open_workspace_path')
            // 上行（D-2：事件系统在 remote origin 不可用，页面→Rust 走命令）。
            // 平台打开命令在 commands::open_workspace_path 实现。

            // E2E 验证钩子（仅 debug 构建，DSH_HUB_E2E=1 启用；见 e2e.rs）。
            #[cfg(debug_assertions)]
            e2e::maybe_run_e2e(win.clone());

            info!("dsh-hub shell started (M4: full dsh web UI on port {port})");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running dsh-hub");
}
