// node.rs — M4 Node sidecar manager（T4.1）
//
// 模块类别：Manager（壳）
// 职责：管理 dsh web Node sidecar 进程（start/stop/restart/stdout parsing）。
//       spawn node dsh-web-sidecar.mjs（或直接 node dsh web --port 0），
//       解析 stdout 路径行获取端口号，stderr 不处理。
//
// stdout 帧格式（T4.1 SOP）：
//   - `DSH_EVENT {"type":"ready","port":8279}` — sidecar 就绪，已绑定端口
//   - `DSH_EVENT {"type":"output","line":"..."}` — 日志输出（不信任第三方插件输出）
//   - `DSH_EVENT {"type":"exit","code":0}` — 进程退出
//   - `dsh web: http://127.0.0.1:8279` — dsh 原始输出（备选解析，READY 源）
//
// 另外支持 dsh 直接输出格式（rc.7 实测）：
//   - `dsh web: http://127.0.0.1:<port>` — 解析此行获取端口
//
// 退出语义（对齐 launcher.mjs L341-372）：
//   - quit.marker 存在 → 不重启（用户主动退出）
//   - exit code 0 → 不重启（正常退出）
//   - 非 0 退出 → ≤3 次重启（1.2s 间隔），超限发出 dsh:crash 事件

use std::fs;
use std::io::{BufRead, BufReader};
use std::path::{Path, PathBuf};
use std::process::{Child, Command, Stdio};
use std::sync::{Arc, Mutex};
use log::{info, warn};
use tauri::Manager;

/// dsh home 路径（rc.14 语义：DSH_HOME env || ~/.dsh）。
fn dsh_home() -> PathBuf {
    match std::env::var("DSH_HOME") {
        Ok(v) if !v.trim().is_empty() => PathBuf::from(v.trim()),
        _ => dirs::home_dir().unwrap_or_default().join(".dsh"),
    }
}

/// quit.marker 路径。
#[allow(dead_code)] // M4 完整接线后移除（tray quit handler / close-requested 调用）
fn quit_marker_path() -> PathBuf {
    dsh_home().join("dsh-hub").join("quit.marker")
}

/// 解析 dsh web 输出行中的端口号。
/// 匹配 `dsh web: http://127.0.0.1:<port>` 格式（rc.7 实测）。
fn parse_dsh_ready_port(line: &str) -> Option<u16> {
    // 尝试 `dsh web: http://127.0.0.1:<port>` 格式。
    if let Some(rest) = line.strip_prefix("dsh web: http://127.0.0.1:") {
        if let Some(port_str) = rest.split(|c: char| !c.is_ascii_digit()).next() {
            return port_str.parse().ok();
        }
    }
    // 尝试 `dsh web: http://[::]:<port>` 或其他模式。
    // 备选：搜索 `DSH_EVENT {"type":"ready","port":N}`（T4.1 SOP 帧格式）。
    if line.contains("DSH_EVENT") {
        // 简单 JSON 解析（仅提取 port 字段）。
        if let Some(port_pos) = line.find("\"port\":") {
            let after = &line[port_pos + 8..];
            if let Some(end) = after.find(|c: char| !c.is_ascii_digit()) {
                return after[..end].parse().ok();
            }
        }
    }
    None
}

/// 执行 tauri-shell.ts 经 stdout 上行的请求行（SOP D-1：stdio JSON-RPC）。
/// 格式：`DSH_CMD <json>`，json 为 `{ "cmd": "applyTheme|applySize|notify", ... }`。
fn dispatch_dsh_cmd(app: &tauri::AppHandle, cmd_json: &str) {
    let Ok(value) = serde_json::from_str::<serde_json::Value>(cmd_json) else {
        warn!("node: DSH_CMD unparseable: {}", cmd_json);
        return;
    };
    let Some(cmd) = value.get("cmd").and_then(|c| c.as_str()) else {
        warn!("node: DSH_CMD missing cmd field: {}", cmd_json);
        return;
    };
    info!("node: DSH_CMD received: {}", cmd);

    match cmd {
        // tauri-shell.ts 经 invoke() 发出的命令名（= Rust #[tauri::command] 名）。
        "set_window_theme" => {
            if let Some(theme) = value.get("theme").and_then(|t| t.as_str()) {
                // 统一走命令：DWM + 外壳 chrome 覆盖属性（Q2）。
                let _ = crate::commands::set_window_theme(app.clone(), theme.to_string());
            }
        }
        "set_window_size" => {
            let w = value.get("width").and_then(|v| v.as_f64());
            let h = value.get("height").and_then(|v| v.as_f64());
            if let (Some(w), Some(h)) = (w, h) {
                if let Some(win) = app.get_webview_window("main") {
                    let _ = win.set_size(tauri::Size::Logical(tauri::LogicalSize::new(w, h)));
                }
            }
        }
        "notify_task_complete" => {
            let title = value.get("title").and_then(|v| v.as_str()).unwrap_or("DeepSeek Harness");
            let body = value.get("body").and_then(|v| v.as_str()).unwrap_or("任务完成");
            let _ = crate::notify::notify_task_complete(app.clone(), Some(title.to_string()), Some(body.to_string()), None);
        }
        // Q4：提示音 — Node 进程无 Audio，经 eval 到浏览器 HTMLAudio 播放。
        "play_sound" => {
            if let Some(kind) = value.get("kind").and_then(|k| k.as_str()) {
                let _ = crate::commands::play_sound(app.clone(), kind.to_string());
            }
        }
        // 兼容旧名（早期实现）。
        "applyTheme" | "applySize" | "notify" => {
            warn!("node: DSH_CMD legacy name '{}' ignored (use set_window_theme/set_window_size/notify_task_complete)", cmd);
        }
        other => warn!("node: DSH_CMD unknown: {}", other),
    }
}

/// dsh web 子进程状态（Arc 共享，background 线程可更新 port/ready）。
pub struct NodeState {
    pub child: Mutex<Option<Child>>,
    pub port: Mutex<Option<u16>>,
    pub ready: Mutex<bool>,
    /// dsh web 进程的 stdin 管道（rc.14 tray-helper 模式：壳下行托盘命令 →
    /// 独立进程管道 → host 插件 → 页面 dispatchPageEvent 带重试）。
    pub stdin: Mutex<Option<std::process::ChildStdin>>,
}

impl NodeState {
    pub fn new() -> Self {
        Self {
            child: Mutex::new(None),
            port: Mutex::new(None),
            ready: Mutex::new(false),
            stdin: Mutex::new(None),
        }
    }
}

/// 托盘命令经「独立进程管道」下行到 dsh web 的 stdin（rc.14 tray-helper 模式）。
/// 帧格式：`MG_TRAY <json>`，host 插件（src/index.ts）读 process.stdin 解析并
/// 以 dispatchPageEvent（__mgShellReady 重试）派发到页面 —— 比 win.eval 更可靠
/// （页面未就绪时重试，不丢命令）。
pub fn send_tray_command(app: &tauri::AppHandle, command: &str) {
    use std::io::Write;
    let Some(state) = app.try_state::<Arc<NodeState>>() else {
        warn!("node: tray command pipe unavailable (NodeState not managed)");
        return;
    };
    let mut stdin = state.stdin.lock().unwrap();
    match stdin.as_mut() {
        Some(s) => {
            let line = format!("MG_TRAY {}\n", serde_json::json!({ "command": command }));
            match s.write_all(line.as_bytes()) {
                Ok(_) => info!("node: tray command sent via stdin pipe: {}", command),
                Err(e) => warn!("node: tray command pipe write failed: {}", e),
            }
        }
        None => warn!("node: tray command pipe unavailable (dsh web stdin missing)"),
    }
}

/// 找 dsh 命令（npm 全局）。
fn find_dsh() -> Option<PathBuf> {
    // 按 launcher.mjs L61-91 逻辑：PATH + npm prefix -g。
    let path_var = std::env::var("PATH").unwrap_or_default();
    for dir in path_var.split(';') {
        for name in &["dsh.cmd", "dsh.exe", "dsh"] {
            let candidate = Path::new(dir).join(name);
            if candidate.exists() {
                return Some(candidate);
            }
        }
    }
    // 兜底：npm prefix -g。
    let npm_prefix = Command::new("cmd")
        .args(["/d", "/s", "/c", "npm prefix -g"])
        .output().ok()?;
    let prefix = String::from_utf8_lossy(&npm_prefix.stdout).trim().to_string();
    for name in &["dsh.cmd", "dsh.exe", "dsh"] {
        let candidate = Path::new(&prefix).join(name);
        if candidate.exists() {
            return Some(candidate);
        }
    }
    None
}

/// 启动 dsh web sidecar（T4.1）。
///
/// 1. 组装 profile（调 assemble-profile.mjs）
/// 2. spawn node → dsh web --port 0
/// 3. 后台线程逐行解析 stdout：READY 信号 + DSH_CMD 上行请求行
///    （tauri-shell.ts 写 `DSH_CMD <json>` → 此处执行窗口操作）
pub fn start_dsh(state: Arc<NodeState>, app: tauri::AppHandle) -> Result<(), String> {
    // 确保 profile 已装配。
    // CARGO_MANIFEST_DIR = src-tauri/，assemble-profile.mjs 在仓库根 scripts/。
    let repo_root = Path::new(env!("CARGO_MANIFEST_DIR")).parent().unwrap();
    let assemble_script = repo_root.join("scripts").join("assemble-profile.mjs");
    if assemble_script.exists() {
        info!("node: assembling profile via {}", assemble_script.display());
        let mut asm = Command::new("cmd");
        asm.args(["/d", "/s", "/c", &format!("node {}", assemble_script.display())])
            .env("DSH_HOME", dsh_home())
            .env("DSH_HUB_PACKAGE_ROOT", repo_root);
        // Q3：子进程 CREATE_NO_WINDOW，防控制台闪现。
        #[cfg(target_os = "windows")]
        {
            use std::os::windows::process::CommandExt;
            asm.creation_flags(0x08000000);
        }
        let asm_output = asm.output().map_err(|e| format!("assemble-profile failed: {e}"))?;
        if !asm_output.status.success() {
            warn!("node: assemble-profile stderr: {}", String::from_utf8_lossy(&asm_output.stderr));
        }
    }

    let node = find_dsh().ok_or("dsh not found in PATH/npm global")?;
    info!("node: spawning {} web --port 0", node.display());

    let mut cmd = Command::new(&node);
    cmd.args(["web", "--port", "0"])
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .env("DSH_HOME", dsh_home())
        .env("DSH_HUB_LAUNCHED", "1")
        .env("DSH_HUB_SHELL", "tauri");
    // Q3：dsh.cmd 经 cmd.exe 解析会闪控制台，加 CREATE_NO_WINDOW。
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        cmd.creation_flags(0x08000000);
    }

    let mut child = cmd.spawn().map_err(|e| format!("spawn dsh web failed: {e}"))?;

    let stdout = child.stdout.take().expect("stdout pipe");
    let stderr = child.stderr.take();
    // stdin 管道保留给壳下行托盘命令（rc.14 tray-helper 模式）。
    *state.stdin.lock().unwrap() = child.stdin.take();

    // 后台线程：逐行读取 stdout，解析 READY 信号 + DSH_CMD 上行请求行。
    // port/ready 写入共享 state（Arc<NodeState>）；DSH_CMD 经 AppHandle 执行窗口操作。
    let state_ready = state.clone();
    std::thread::spawn(move || {
        let reader = BufReader::new(stdout);
        for line in reader.lines() {
            match line {
                Ok(l) => {
                    info!("dsh-stdout: {}", l);
                    if let Some(port) = parse_dsh_ready_port(&l) {
                        *state_ready.ready.lock().unwrap() = true;
                        *state_ready.port.lock().unwrap() = Some(port);
                        info!("node: READY on port {}", port);
                    } else if let Some(cmd_json) = l.strip_prefix("DSH_CMD ") {
                        // tauri-shell.ts 的 stdio 上行请求行（SOP D-1）。
                        dispatch_dsh_cmd(&app, cmd_json);
                    }
                }
                Err(e) => {
                    warn!("node: stdout read error: {}", e);
                    break;
                }
            }
        }
        info!("node: stdout loop ended");
    });

    // 后台线程：stderr 日志。
    if let Some(stderr) = stderr {
        std::thread::spawn(move || {
            let reader = BufReader::new(stderr);
            for line in reader.lines() {
                match line {
                    Ok(l) => info!("dsh-stderr: {}", l),
                    Err(e) => { warn!("dsh-stderr read error: {}", e); break; }
                }
            }
        });
    }

    *state.child.lock().unwrap() = Some(child);
    info!("node: child process spawned (waiting for READY)");
    Ok(())
}

/// 停止 dsh web sidecar（T4.1）。
///
/// 写 quit.marker + kill child → 不触发重启循环。
#[allow(dead_code)] // M4 完整接线后移除（tray quit handler / close-requested 调用）
pub fn stop_dsh(state: &NodeState) {
    // 写 quit.marker（不重启）。
    let marker = quit_marker_path();
    let _ = fs::create_dir_all(marker.parent().unwrap());
    let _ = fs::write(&marker, "quit");
    info!("node: wrote quit.marker at {}", marker.display());

    // kill child。
    if let Some(mut child) = state.child.lock().unwrap().take() {
        let _ = child.kill();
        info!("node: killed child process");
    }
}

/// 清除 quit.marker（M4 启动时清除残留）。
#[allow(dead_code)] // M4 完整接线后移除
pub fn clear_quit_marker() {
    let marker = quit_marker_path();
    if marker.exists() {
        let _ = fs::remove_file(&marker);
        info!("node: cleared quit.marker at {}", marker.display());
    }
}
