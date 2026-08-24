// notify.rs — M3 任务完成通知（T3.5，项 4：notify-rust 直接依赖 + 点击回窗口）
//
// 模块类别：Services（壳）
// 职责：任务完成通知命令接口（M4 随 sidecar 落地）。
// 外部接口：notify_task_complete（Tauri command）。
//
// 项 4 变更：
//   - 命令签名 (app, title, body, session_id)：第 4 参由 sound 改为 session_id
//     （暂不用于定位会话，仅透传/忽略；node.rs 分发表把 value.sessionId 传入）。
//   - 用 notify-rust 直接弹 toast（Windows 走 winrt toast，app_id = AUMID
//     com.marecgents.dsh-hub——lib.rs register_toast_aumid 已注册，保证显示）。
//   - tauri-plugin-notification 的注册（lib.rs .plugin(init())）保留不动。
//   - 点击 toast → spawn_blocking 任务 wait_for_action → 窗口 unminimize/show/
//     set_focus（阻塞任务线程，不阻塞主线程）。

use log::info;
use tauri::{AppHandle, Manager};

/// Tauri command：弹出任务完成通知（T3.5 接口），点击回窗口（Q 增强）。
#[tauri::command]
pub fn notify_task_complete(
    app: AppHandle,
    title: Option<String>,
    body: Option<String>,
    session_id: Option<String>,
) -> Result<(), String> {
    let title = title.unwrap_or_else(|| "DeepSeek Harness".to_string());
    let body = body.unwrap_or_else(|| "任务完成".to_string());
    let _ = session_id; // 暂不用于定位会话，仅透传/忽略。

    let mut n = notify_rust::Notification::new();
    n.summary(&title)
        .body(&body)
        .timeout(notify_rust::Timeout::Default);
    // Windows：AUMID 已在 lib.rs register_toast_aumid 注册（未打包应用 toast
    // 显示必需；app_id 方法为 Windows-only，cfg 保护跨平台编译）。
    #[cfg(target_os = "windows")]
    n.app_id("com.marecgents.dsh-hub");

    let handle = n.show().map_err(|e| e.to_string())?;

    // 点击回窗口：wait_for_action 阻塞当前线程直到 toast 被点击/关闭/超时——
    // 放到 spawn_blocking 任务，不阻塞主线程。仅「点击激活」时回窗口；
    // 关闭/超时（"__closed"）不抢焦点。
    tauri::async_runtime::spawn_blocking(move || {
        handle.wait_for_action(|action| {
            if action == "__closed" {
                return;
            }
            if let Some(w) = app.get_webview_window("main") {
                let _ = w.unminimize();
                let _ = w.show();
                let _ = w.set_focus();
                info!("notify: toast activated ({}), window focused", action);
            }
        });
    });

    info!("notify: toast sent (click-to-focus armed)");
    Ok(())
}
