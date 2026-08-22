// node.rs — M4 Node sidecar manager（T4.1）
//
// 模块类别：Manager（壳）
// 职责：管理 dsh web Node sidecar 进程（spawn/stop/crash-restart/stdout parsing）。
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
//   - 非 0 退出 → supervisor 连续崩溃重启 ≤3 次（1.2s 间隔，READY 到达归零），
//     超限 error! dsh:crash → 写 marker → process::exit(1)（fail-fast，
//     下次启动 clear_quit_marker 后获得全新机会）

use std::fs;
use std::io::{BufRead, BufReader};
use std::path::{Path, PathBuf};
use std::process::{Child, Command, Stdio};
use std::sync::atomic::{AtomicU32, Ordering};
use std::sync::{Arc, Mutex};
use log::{error, info, warn};
use tauri::Manager;

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
        // S6：设置桌面图标（tauri-shell.ts setDesktopIcon 上行）。设置卡页面
        // 同时走页面→Rust invoke（ACL allow-set-desktop-icon）；本臂保证 host
        // 侧 config onChange 重放（DSH_CMD）也生效，二者幂等。
        "set_desktop_icon" => {
            if let Some(icon_id) = value.get("iconId").and_then(|v| v.as_str()) {
                let _ = crate::commands::set_desktop_icon(app.clone(), icon_id.to_string());
            }
        }
        "notify_task_complete" => {
            let title = value.get("title").and_then(|v| v.as_str()).unwrap_or("DeepSeek Harness");
            let body = value.get("body").and_then(|v| v.as_str()).unwrap_or("任务完成");
            // 项 4：第 4 参由 sound 改为 session_id（透传，暂不用于定位会话）。
            let session_id = value
                .get("sessionId")
                .and_then(|v| v.as_str())
                .map(|s| s.to_string());
            let _ = crate::notify::notify_task_complete(
                app.clone(),
                Some(title.to_string()),
                Some(body.to_string()),
                session_id,
            );
        }
        // Q4：提示音 — Node 进程无 Audio，经 eval 到浏览器 HTMLAudio 播放。
        "play_sound" => {
            if let Some(kind) = value.get("kind").and_then(|k| k.as_str()) {
                let _ = crate::commands::play_sound(app.clone(), kind.to_string());
            }
        }
        // 双向管道上行：host 解析聚焦会话工作区后回传 → Rust 打开目录（Q6 打开工作区）。
        "open_workspace_path" => {
            let path = value.get("path").and_then(|v| v.as_str()).unwrap_or("").to_string();
            info!("node: DSH_CMD open_workspace_path from host: '{}'", path);
            let _ = crate::commands::open_workspace_path(path);
        }
        // 双向管道上行：host 请求壳把页面事件派发到浏览器（D-2 win.eval 可靠通道）。
        // 替代坏掉的 Node 侧 dispatchPageEvent（globalThis.__mgShellReady 不存在）。
        // 项 5：改为带重试的 eval 脚本——页面未 ready（__mgShellReady !== true）时
        // 300ms × 20 次轮询，页面就绪后不再丢命令（托盘命令 boot 期可靠性）。
        "dispatch_page_event" => {
            let name = value.get("name").and_then(|v| v.as_str()).unwrap_or("");
            let detail = value.get("detail").cloned().unwrap_or(serde_json::json!({}));
            if name.is_empty() {
                warn!("node: DSH_CMD dispatch_page_event missing name");
            } else if let Some(win) = app.get_webview_window("main") {
                // name 是受控字符串（open-workspace/new-task），detail 是 JSON 对象；
                // 均经 serde_json::to_string 序列化后内插，避免拼接注入。
                let name_json = serde_json::to_string(name).unwrap_or_else(|_| "\"\"".to_string());
                let detail_json = serde_json::to_string(&detail).unwrap_or_else(|_| "{}".to_string());
                let js = format!(
                    "(function(){{var n={name_json},d={detail_json};var t=0;function f(){{if(window.__mgShellReady===true){{window.dispatchEvent(new CustomEvent(n,{{detail:d}}));}}else if(t<20){{t++;setTimeout(f,300);}}}}f();}})()"
                );
                match win.eval(&js) {
                    Ok(_) => info!("node: dispatch_page_event '{}' eval'd (retry script)", name),
                    Err(e) => warn!("node: dispatch_page_event '{}' eval failed: {}", name, e),
                }
            } else {
                warn!("node: dispatch_page_event '{}' skipped (no main window)", name);
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
    /// sidecar 连续崩溃次数（M4 supervisor 重启循环用；每次 READY 到达时归零）。
    pub restart_count: AtomicU32,
}

impl NodeState {
    pub fn new() -> Self {
        Self {
            child: Mutex::new(None),
            port: Mutex::new(None),
            ready: Mutex::new(false),
            stdin: Mutex::new(None),
            restart_count: AtomicU32::new(0),
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

/// 找 dsh 命令（M5 私有运行时优先，回退 PATH / npm 全局）。
fn find_dsh() -> Option<PathBuf> {
    // M5：私有 dsh.cmd shim（<repo_root>\dsh-hub-win\dsh.cmd）存在即用。
    if let Some(private) = find_private_dsh() {
        info!("node: using private dsh shim at {}", private.display());
        return Some(private);
    }
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
    let mut npm_cmd = Command::new("cmd");
    npm_cmd.args(["/d", "/s", "/c", "npm prefix -g"]);
    // CREATE_NO_WINDOW：cmd 是 console 程序，不隐藏会闪命令行窗口。
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        npm_cmd.creation_flags(0x08000000);
    }
    let npm_prefix = npm_cmd.output().ok()?;
    let prefix = String::from_utf8_lossy(&npm_prefix.stdout).trim().to_string();
    for name in &["dsh.cmd", "dsh.exe", "dsh"] {
        let candidate = Path::new(&prefix).join(name);
        if candidate.exists() {
            return Some(candidate);
        }
    }
    None
}

/// 查找 node 可执行文件（Windows: node.exe）。
/// M5：先探测私有 node（<repo_root>\dsh-hub-win\node\node.exe），再走 PATH。
fn find_node_in_path() -> Option<PathBuf> {
    // M5：私有 node 优先（安装器引导的私有运行时）。
    if let Some(private) = find_private_node() {
        info!("node: using private node at {}", private.display());
        return Some(private);
    }
    let path_var = std::env::var("PATH").unwrap_or_default();
    let name = if cfg!(windows) { "node.exe" } else { "node" };
    for dir in path_var.split(';') {
        if dir.is_empty() {
            continue;
        }
        let candidate = Path::new(dir).join(name);
        if candidate.exists() {
            return Some(candidate);
        }
    }
    None
}

/// 解析 dsh 命令为可直接 spawn 的 (node 可执行, dsh 入口 js)。
///
/// 1. 优先读 dsh.cmd（npm 全局 shim）内容：把 `%~dp0`（SET dp0 赋值源）与
///    `%dp0%`（引用）统一替换为 shim 所在目录 dir，再从引号包裹的 token 里提取
///    node.exe 与 node_modules\@deepseek-ai\dsh\lib\bin.js（npm 生成 shim 的标准
///    形态，形如 `"%dp0%\node.exe" "%dp0%\node_modules\@deepseek-ai\dsh\lib\bin.js" %*`）。
///    解析到 node+entry 且 entry 存在则直接返回——避免 cmd /c 兜底（cmd shim 的
///    node 孙进程无法被 child.kill() 覆盖，易留孤儿）。
/// 2. 解析失败再回退既有布局：<dir>/node_modules/@deepseek-ai/dsh/lib/bin.js。
///
/// CreateProcess 无法直接执行 .cmd，必须解析到 node.exe + entry 再 spawn
/// （或经 cmd /c 兜底，见 spawn_via_cmd_shim）。
fn resolve_dsh_entry(dsh_cmd: &Path) -> Result<(PathBuf, PathBuf), String> {
    // 1) npm shim 内容解析（读 dsh.cmd 文本）。
    if let Ok(content) = fs::read_to_string(dsh_cmd) {
        if let Some(dir) = dsh_cmd.parent() {
            let dir_str = dir.to_string_lossy();
            let expanded = content.replace("%~dp0", &dir_str).replace("%dp0%", &dir_str);
            // 提取引号包裹的路径 token（去掉空 token）。
            let tokens: Vec<&str> = expanded
                .split('"')
                .filter(|t| !t.trim().is_empty())
                .map(str::trim)
                .collect();
            let entry = tokens.iter().find(|t| {
                t.replace('\\', "/")
                    .ends_with("node_modules/@deepseek-ai/dsh/lib/bin.js")
            });
            let node = tokens.iter().find(|t| t.trim_end_matches('"').ends_with("node.exe"));
            if let Some(entry) = entry {
                let entry = PathBuf::from(entry.trim_end_matches('"'));
                if entry.exists() {
                    let node = node
                        .map(|n| PathBuf::from(n.trim_end_matches('"')))
                        .filter(|n| n.exists())
                        .or_else(find_node_in_path)
                        .ok_or("node not found in PATH")?;
                    info!(
                        "node: resolved dsh entry from shim: {} + {}",
                        node.display(),
                        entry.display()
                    );
                    return Ok((node, entry));
                }
            }
        }
    }

    // 2) 回退：既有目录布局。
    if let Some(dir) = dsh_cmd.parent() {
        let entry = dir
            .join("node_modules")
            .join("@deepseek-ai")
            .join("dsh")
            .join("lib")
            .join("bin.js");
        if entry.exists() {
            let node = if cfg!(windows) && dir.join("node.exe").exists() {
                dir.join("node.exe")
            } else {
                find_node_in_path().ok_or("node not found in PATH")?
            };
            return Ok((node, entry));
        }
    }
    Err(format!("cannot resolve dsh entry from {}", dsh_cmd.display()))
}

/// 仓库根目录（assemble-profile.mjs 所在处）：
/// 已打包态 = exe 相邻目录（$INSTDIR）；开发态 = CARGO_MANIFEST_DIR（src-tauri/）的父目录。
///
/// M5：打包态 resources 落在 `$INSTDIR\_up_\`（Tauri 2 NSIS 约定：tauri.conf.json
/// 里的 `../` 前缀资源映射为 `_up_`），含 scripts + **完整插件包**（package.json +
/// lib + assets，踩坑 #63 后打包）；dev 态在仓库根 `scripts\`。
///
/// ⚠️ 判断顺序**完整打包态优先**：exe 相邻 `_up_` 同具 package.json + lib +
/// scripts/assemble-profile.mjs 才判打包——这是安装器布局的最强信号，且天然排除
/// 历史「target/debug 残缺 _up_ 残留（仅 scripts）误判」事故（踩坑冒烟实测过）。
/// 此前「dev 态优先」的顺序有个缺陷：在打包机上直接运行安装后的 exe 时，
/// 编译期嵌入的 CARGO_MANIFEST_DIR 路径仍然存在，会永远误判为 dev、junction
/// 指向仓库而非安装包自带的 _up_ 全量插件。
/// 注：`cargo tauri build` 会把 resources staging 到 target/release/_up_（完整
/// 布局），因此打包机上直接运行 target/release/dsh-hub.exe 也判打包态——语义
/// 自洽（release 产物 + 同期冻结的插件副本，与安装到目标机的行为一致）；
/// `cargo tauri dev` 用 target/debug（无 staging）→ 正常判 dev 态。
fn repo_root() -> PathBuf {
    let dev_root = Path::new(env!("CARGO_MANIFEST_DIR")).parent().unwrap_or(Path::new("."));
    // 打包态：exe 相邻 _up_ 为完整插件包（$INSTDIR）。
    if let Ok(exe) = std::env::current_exe() {
        if let Some(exe_dir) = exe.parent() {
            let up = exe_dir.join("_up_");
            if up.join("package.json").is_file()
                && up.join("lib").is_dir()
                && up.join("scripts").join("assemble-profile.mjs").is_file()
            {
                return exe_dir.to_path_buf();
            }
        }
    }
    // 开发态：CARGO_MANIFEST_DIR 的父目录（src-tauri/ 的上级 = 仓库根）。
    if dev_root.join("scripts").join("assemble-profile.mjs").exists() {
        return dev_root.to_path_buf();
    }
    // 兜底：exe 相邻目录（残缺 _up_/scripts 也能定位装配脚本），最后 dev 路径。
    if let Some(exe_dir) = std::env::current_exe()
        .ok()
        .and_then(|exe| exe.parent().map(Path::to_path_buf))
    {
        if exe_dir.join("_up_").join("scripts").join("assemble-profile.mjs").exists() {
            return exe_dir;
        }
    }
    dev_root.to_path_buf()
}

/// assemble-profile.mjs 的绝对路径：打包态在 `$INSTDIR\_up_\scripts\`，dev 态在仓库根 `scripts\`。
fn assemble_script_path() -> PathBuf {
    let root = repo_root();
    let packed = root.join("_up_").join("scripts").join("assemble-profile.mjs");
    if packed.exists() {
        return packed;
    }
    root.join("scripts").join("assemble-profile.mjs")
}

/// M5 私有运行时根：<repo_root>\dsh-hub-win（NSIS 安装期引导脚本写入）。
fn private_runtime_root() -> PathBuf {
    repo_root().join("dsh-hub-win")
}

/// 私有 node.exe（存在才返回）。M5：安装器引导的私有运行时优先于 PATH。
fn find_private_node() -> Option<PathBuf> {
    let node = private_runtime_root().join("node").join("node.exe");
    node.is_file().then_some(node)
}

/// 私有 dsh.cmd shim（存在才返回）。M5：优先于 PATH / npm global。
fn find_private_dsh() -> Option<PathBuf> {
    let dsh = private_runtime_root().join("dsh.cmd");
    dsh.is_file().then_some(dsh)
}

/// 私有 node 目录注入子进程 PATH（M5）：目标机器可能没有系统级 Node，
/// dsh 自身派生的 node 子进程（MCP 等）依赖 PATH 里的 node —— 只注入
/// 子进程环境，不改系统 PATH，不污染全局。
fn prepend_private_node_path(cmd: &mut Command) {
    let Some(node) = find_private_node() else { return };
    let Some(node_dir) = node.parent() else { return };
    let mut path = node_dir.to_string_lossy().to_string();
    if let Ok(existing) = std::env::var("PATH") {
        path.push(';');
        path.push_str(&existing);
    }
    cmd.env("PATH", path);
}

/// 装配 web profile（调 scripts/assemble-profile.mjs，幂等）。
///
/// T4.4 诊断参数（--assemble-only / --smoke）与 start_dsh 共用的装配入口；
/// repo_root 推导见 repo_root()，env 注入 DSH_HOME + DSH_HUB_PACKAGE_ROOT。
/// 返回 Err = 脚本缺失 / 命令无法启动 / 退出码非 0（--assemble-only 据此 exit 1）。
pub fn assemble_profile() -> Result<(), String> {
    let repo_root = repo_root();
    let assemble_script = assemble_script_path();
    if !assemble_script.exists() {
        return Err(format!(
            "assemble-profile.mjs not found at {}",
            assemble_script.display()
        ));
    }
    info!("node: assembling profile via {}", assemble_script.display());
    // junction 目标三级优先（踩坑 #63：安装器曾从 npm registry 拉旧版插件 →
    // 安装包永远缺最新功能）：
    //   1. `$INSTDIR\_up_`——安装器 resources 自带的全量插件包（package.json +
    //      lib + assets + scripts，构建期随壳一起打包，与壳永远同版本）；
    //   2. `dsh-hub-win\node_modules\@marecgents\dsh-hub`——安装期引导脚本从
    //      registry 装的副本（老安装升级 / _up_ 资源缺失时的兜底，可能滞后）；
    //   3. repo_root——dev 态（插件内容就在仓库）。
    // 既有 junction 指向旧目标时，assemble-profile.mjs 会自动 relink（自愈）。
    let up_pkg = repo_root.join("_up_");
    let private_pkg = repo_root
        .join("dsh-hub-win")
        .join("node_modules")
        .join("@marecgents")
        .join("dsh-hub");
    let package_root = if up_pkg.join("package.json").is_file() && up_pkg.join("lib").is_dir() {
        info!("node: plugin package root = installer-bundled _up_ ({})", up_pkg.display());
        up_pkg
    } else if private_pkg.is_dir() {
        warn!("node: _up_ plugin payload missing, falling back to npm-installed copy (may be stale)");
        private_pkg
    } else {
        repo_root.clone()
    };
    // 直接 spawn node（不走 cmd /c）：安装目录可能含空格（如
    // "D:\Tools\DeepSeek Harness Hub"），cmd /c 拼路径不带引号会拆断
    // （Cannot find module 'D:\Tools\DeepSeek'）。node 优先用私有 node
    // （打包态引导），否则 PATH 里的 node（dev）。
    let node_exe = find_private_node().unwrap_or_else(|| PathBuf::from("node"));
    let mut asm = Command::new(node_exe);
    asm.arg(&assemble_script)
        .env("DSH_HOME", crate::state::dsh_home())
        .env("DSH_HUB_PACKAGE_ROOT", package_root);
    // Q3：子进程 CREATE_NO_WINDOW，防控制台闪现。
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        asm.creation_flags(0x08000000);
    }
    let asm_output = asm
        .output()
        .map_err(|e| format!("assemble-profile spawn failed: {e}"))?;
    if !asm_output.status.success() {
        let stderr = String::from_utf8_lossy(&asm_output.stderr);
        warn!("node: assemble-profile failed: {}", stderr.trim());
        return Err(format!(
            "assemble-profile exited with {:?}",
            asm_output.status.code()
        ));
    }
    info!("node: profile assembly complete");
    Ok(())
}

/// 启动 dsh web sidecar（T4.1）。
///
/// 1. 清除上次残留 quit.marker（前一轮 fail-fast 可能留下；清掉后本轮获得
///    全新 3 次重启机会，supervisor 判定以 marker 为「用户主动退出」）
/// 2. 组装 profile（调 assemble-profile.mjs，复用 assemble_profile；失败仅告警）
/// 3. spawn_inner 拉起 sidecar（解析 cmd shim / 兜底 cmd /c）
/// 4. 启动 supervisor 线程：监视 child 退出 → 崩溃 ≤3 次重启循环
pub fn start_dsh(state: Arc<NodeState>, app: tauri::AppHandle) -> Result<(), String> {
    // M4 启动时清除残留 marker（上轮 dsh:crash fail-fast 可能写入）。
    crate::quit::clear_quit_marker();

    // 确保 profile 已装配（幂等；失败仅告警，沿用既有继续启动语义）。
    if let Err(e) = assemble_profile() {
        warn!("node: assemble-profile failed ({e}), continuing with existing profile");
    }

    spawn_inner(state.clone(), app.clone())?;
    spawn_supervisor(state, app);
    Ok(())
}

/// 实际 spawn sidecar（初始启动与 supervisor 崩溃重启共用）。
///
/// - 重启语义：新进程是全新实例、端口会变 → 开头重置 ready=false / port=None。
/// - Windows：优先解析 .cmd shim → node.exe + entry 直接 spawn（CreateProcess
///   不能执行 .cmd）；解析失败退 cmd /c 兜底。非 Windows：直接 spawn dsh。
/// - 成功后在 state.child 放入新 child（supervisor 每轮 take 出来 try_wait）。
fn spawn_inner(state: Arc<NodeState>, app: tauri::AppHandle) -> Result<(), String> {
    // 重启后端口会变：先清 READY 状态，supervisor 重新等新端口。
    *state.ready.lock().unwrap() = false;
    *state.port.lock().unwrap() = None;

    let dsh_cmd = find_dsh().ok_or("dsh not found in PATH/npm global")?;

    let (node, entry) = if cfg!(windows) && dsh_cmd.extension().is_some_and(|e| e == "cmd") {
        match resolve_dsh_entry(&dsh_cmd) {
            Ok(pair) => pair,
            Err(e) => {
                warn!("node: dsh entry unresolved ({e}); falling back to cmd /c shim");
                return spawn_via_cmd_shim(state, app, &dsh_cmd);
            }
        }
    } else {
        (dsh_cmd.clone(), PathBuf::new())
    };

    let mut cmd = if entry.as_os_str().is_empty() {
        info!("node: spawning {} web --port 0 --no-open", node.display());
        let mut c = Command::new(&node);
        c.args(["web", "--port", "0", "--no-open"]);
        c
    } else {
        info!("node: spawning {} {} web --port 0 --no-open", node.display(), entry.display());
        let mut c = Command::new(&node);
        c.arg(&entry).args(["web", "--port", "0", "--no-open"]);
        c
    };
    cmd.stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .env("DSH_HOME", crate::state::dsh_home())
        .env("DSH_HUB_LAUNCHED", "1")
        .env("DSH_HUB_SHELL", "tauri");
    // M5：私有 node 目录注入子进程 PATH（无系统 Node 时 dsh 子进程仍可用）。
    prepend_private_node_path(&mut cmd);
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
                        // READY 到达 = 本轮启动成功，连续崩溃计数归零。
                        state_ready.restart_count.store(0, Ordering::SeqCst);
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

/// 兜底启动路径：`cmd /d /s /c "<dsh.cmd>" web --port 0`（仅当 entry 解析失败）。
/// 注意：此路径的 child 是 cmd.exe——kill 时需 taskkill /T 杀整棵进程树
/// （kill_sidecar 处理），防 node 孙进程孤儿。
fn spawn_via_cmd_shim(state: Arc<NodeState>, app: tauri::AppHandle, dsh_cmd: &Path) -> Result<(), String> {
    info!("node: spawning via cmd shim: {} web --port 0", dsh_cmd.display());
    let comspec = std::env::var("COMSPEC").unwrap_or_else(|_| "cmd.exe".to_string());
    let mut cmd = Command::new(comspec);
    cmd.args(["/d", "/s", "/c", &format!("\"{}\" web --port 0 --no-open", dsh_cmd.display())])
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .env("DSH_HOME", crate::state::dsh_home())
        .env("DSH_HUB_LAUNCHED", "1")
        .env("DSH_HUB_SHELL", "tauri");
    // M5：私有 node 目录注入子进程 PATH（与 spawn_inner 一致）。
    prepend_private_node_path(&mut cmd);
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        cmd.creation_flags(0x08000000);
    }

    let mut child = cmd.spawn().map_err(|e| format!("spawn dsh web via cmd failed: {e}"))?;

    let stdout = child.stdout.take().expect("stdout pipe");
    let stderr = child.stderr.take();
    *state.stdin.lock().unwrap() = child.stdin.take();

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
                        state_ready.restart_count.store(0, Ordering::SeqCst);
                        info!("node: READY on port {}", port);
                    } else if let Some(cmd_json) = l.strip_prefix("DSH_CMD ") {
                        dispatch_dsh_cmd(&app, cmd_json);
                    }
                }
                Err(e) => {
                    warn!("node: stdout read error: {}", e);
                    break;
                }
            }
        }
        info!("node: stdout loop ended (cmd shim)");
    });

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
    info!("node: child process spawned via cmd shim (waiting for READY)");
    Ok(())
}

/// 重启后等待新 READY：轮询 state.port（最多 60s），拿到新端口且 TCP 可达后
/// 把主窗口 navigate 到新 URL（重启后端口会变，旧 127.0.0.1:<old> 已失效）。
/// 不在持锁期间 sleep；port 锁只短暂取用。
fn wait_restart_ready_and_navigate(state: &NodeState, app: &tauri::AppHandle) {
    use std::net::{SocketAddr, TcpStream};
    use std::time::{Duration, Instant};

    let start = Instant::now();
    loop {
        if let Some(port) = *state.port.lock().unwrap() {
            let addr = format!("127.0.0.1:{port}");
            if let Ok(addr) = addr.parse::<SocketAddr>() {
                if TcpStream::connect_timeout(&addr, Duration::from_millis(500)).is_ok() {
                    info!("node: restart READY verified — {addr} reachable, navigating main window");
                    if let Some(win) = app.get_webview_window("main") {
                        if let Ok(url) = tauri::Url::parse(&format!("http://127.0.0.1:{port}")) {
                            let _ = win.navigate(url);
                            info!("node: supervisor navigated main window to http://127.0.0.1:{port}");
                        } else {
                            // URL 解析失败（u16 端口理论上不会）——退 eval 兜底。
                            let _ = win.eval(format!("location.href='http://127.0.0.1:{port}'"));
                        }
                    }
                    return;
                }
            }
        }
        if start.elapsed() > Duration::from_secs(60) {
            warn!("node: restart READY timeout (60s), main window not navigated");
            return;
        }
        std::thread::sleep(Duration::from_millis(200));
    }
}

/// sidecar 崩溃重启 supervisor（M4 核心）：监视 child 退出状态。
///
/// 语义（对齐 launcher.mjs L341-372）：
///   - quit.marker 存在 → 用户主动退出，不重启，break
///   - exit code 0 → 正常退出，不重启，break
///   - 其他（崩溃）→ 连续崩溃计数 <3 → sleep 1.2s → clear marker → spawn_inner
///     重启（计数 +1，READY 到达归零）；计数 ≥3 → error! dsh:crash → 写 marker
///     → process::exit(1)（fail-fast，下次启动 clear 后获得新机会）
///
/// 锁纪律：try_wait 需要 &mut Child → 每轮 take 出来 wait，还在跑则放回；
/// 不在持 child 锁时 sleep / 调用 spawn / 拿 port 锁（防死锁）。
fn spawn_supervisor(state: Arc<NodeState>, app: tauri::AppHandle) {
    std::thread::spawn(move || {
        info!("node: supervisor started");
        loop {
            // 先取 child 再进 if-let：`if let` scrutinee 里的临时 MutexGuard 会存活
            // 到整个块结束，若在块内再次 lock 同一把锁会死锁（clippy::if_let_mutex）。
            let taken = state.child.lock().unwrap().take();
            if let Some(mut child) = taken {
                match child.try_wait() {
                    Ok(None) => {
                        // 还在跑：放回，200ms 后继续观察。
                        *state.child.lock().unwrap() = Some(child);
                        std::thread::sleep(std::time::Duration::from_millis(200));
                    }
                    Ok(Some(status)) => {
                        // 进程已退出（child 已被 try_wait 消费，无需放回）。
                        if crate::quit::has_quit_marker() {
                            info!("node: supervisor saw quit.marker — user exit, no restart");
                            break;
                        }
                        if status.code() == Some(0) {
                            info!("node: supervisor saw clean exit (code 0) — no restart");
                            break;
                        }
                        // 崩溃：连续计数（READY 到达时由 stdout 线程归零）。
                        let count = state.restart_count.load(Ordering::SeqCst);
                        if count < 3 {
                            warn!(
                                "node: sidecar crashed (exit {:?}), restart attempt {}/3 in 1.2s",
                                status.code(),
                                count + 1
                            );
                            std::thread::sleep(std::time::Duration::from_millis(1200));
                            // spawn 前清 marker：即使判定瞬间有残留 marker 也清掉，
                            // 保证本轮重启不被误判为「用户主动退出」。
                            crate::quit::clear_quit_marker();
                            if let Err(e) = spawn_inner(state.clone(), app.clone()) {
                                error!("node: restart spawn failed: {e}");
                                crate::quit::write_quit_marker();
                                std::process::exit(1);
                            }
                            state.restart_count.fetch_add(1, Ordering::SeqCst);
                            // 重启后端口会变：等新 READY 并把主窗口导航到新 URL。
                            wait_restart_ready_and_navigate(&state, &app);
                        } else {
                            error!("dsh:crash — sidecar crashed {} times consecutively, giving up", count);
                            crate::quit::write_quit_marker();
                            std::process::exit(1);
                        }
                    }
                    Err(e) => {
                        // try_wait 出错（罕见）：放回继续观察，避免误判崩溃。
                        warn!("node: supervisor try_wait error: {e}");
                        *state.child.lock().unwrap() = Some(child);
                        std::thread::sleep(std::time::Duration::from_millis(200));
                    }
                }
            } else {
                // child 槽位为空（尚未 spawn / 已被 kill_sidecar 消费）：短暂等待。
                std::thread::sleep(std::time::Duration::from_millis(200));
            }
        }
        info!("node: supervisor exited");
    });
}

/// 仅杀 sidecar 进程（不写 quit.marker）。
///
/// Windows：child.kill() 后再补 taskkill /PID <pid> /T /F —— /T 杀整棵进程树，
/// 防 cmd-shim 兜底路径的 node 孙进程孤儿；仅当 child.kill() 成功拿到 pid 时
/// 执行，taskkill 失败忽略。
pub fn kill_sidecar(state: &NodeState) {
    if let Some(mut child) = state.child.lock().unwrap().take() {
        match child.kill() {
            Ok(_) => {
                info!("node: killed child process");
                #[cfg(target_os = "windows")]
                {
                    use std::os::windows::process::CommandExt;
                    let pid = child.id();
                    // taskkill /T：cmd-shim 兜底路径的 cmd.exe 树内 node 孙进程
                    // 一并杀掉，防孤儿占用端口。
                    let pid_str = pid.to_string();
                    let _ = Command::new("taskkill")
                        .args(["/PID", pid_str.as_str(), "/T", "/F"])
                        .creation_flags(0x08000000)
                        .output();
                    info!("node: taskkill /PID {pid} /T /F issued (tree kill)");
                }
            }
            Err(e) => warn!("node: child.kill failed: {}", e),
        }
    }
}

/// 停止 dsh web sidecar（T4.1）。
///
/// = kill_sidecar + 写 quit.marker（supervisor 见 marker 判定为用户退出，不重启）。
/// 调用方：托盘退出 / closeToTray=false 关闭 / --smoke 收尾。
pub fn stop_dsh(state: &NodeState) {
    kill_sidecar(state);
    crate::quit::write_quit_marker();
}
