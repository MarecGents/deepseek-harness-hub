// lib.rs — dsh-hub Tauri 2.x 壳入口（M1 脚手架）
//
// 模块类别：Manager（壳）
// 职责：日志（X1 三目标）、M1 IPC 冒烟命令、主窗口创建（T1.6）、应用装配。
// 迁移映射：src/desktop.ts 的窗口生命周期将在 M2 逐项移植至此（尺寸/最小/居中/主题）。

use std::path::PathBuf;
use tauri::WebviewWindowBuilder;

/// 解析 $DSH_HOME（env || ~/.dsh），保留 rc.14 语义（PROCESS_QUALITY / SOP §2.2）。
fn dsh_home() -> PathBuf {
    match std::env::var("DSH_HOME") {
        Ok(v) if !v.trim().is_empty() => PathBuf::from(v.trim()),
        _ => dirs::home_dir()
            .unwrap_or_default()
            .join(".dsh"),
    }
}

/// M1 IPC 冒烟命令：前端 dev 页 invoke('ping') 证明 invoke + capabilities 链路可用。
#[tauri::command]
fn ping() -> String {
    "pong".to_string()
}

pub fn run() {
    let log_dir = dsh_home().join("dsh-hub").join("logs");

    tauri::Builder::default()
        // X1 日志三目标：Stdout + Webview + Folder($DSH_HOME/dsh-hub/logs/)。
        // 注意：日志不得打印桥 token（脱敏从第一天生效）。
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
        .invoke_handler(tauri::generate_handler![ping])
        .setup(|app| {
            // M1 主窗口（T1.6）：无边框、不透明、min 480×360、初始 1280×720。
            // transparent:false 与 rc.14 一致（#32 背景透出方案在 M3+ 按需开启并像素验证）。
            WebviewWindowBuilder::new(app, "main", tauri::WebviewUrl::default())
                .title("DeepSeek Harness Hub")
                .inner_size(1280.0, 720.0)
                .min_inner_size(480.0, 360.0)
                .decorations(false)
                .transparent(false)
                .build()?;

            // X1 启动日志：验证 Stdout/Webview/Folder 三目标写入。
            log::info!("dsh-hub shell started (M1)");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running dsh-hub");
}
