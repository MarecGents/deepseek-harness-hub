// notify.rs — M3 任务完成通知（T3.5）
//
// 模块类别：Services（壳）
// 职责：任务完成通知命令接口（M4 随 sidecar 落地）。
// 外部接口：notify_task_complete（Tauri command）。
// 声音方案（D3）：HTMLAudio（M4 随主桥落地）。

use log::info;
use tauri::AppHandle;
use tauri_plugin_notification::NotificationExt;

/// Tauri command：弹出任务完成通知（T3.5 接口）。
#[tauri::command]
pub fn notify_task_complete(
    app: AppHandle,
    title: Option<String>,
    body: Option<String>,
    sound: Option<bool>,
) -> Result<(), String> {
    let title = title.unwrap_or_else(|| "DeepSeek Harness".to_string());
    let body = body.unwrap_or_else(|| "任务完成".to_string());
    let _ = sound; // M3 不播放声音，M4 用 HTMLAudio。

    // tauri-plugin-notification API：app.notification().builder().title().body().show()
    app.notification()
        .builder()
        .title(title)
        .body(body)
        .show()
        .map_err(|e| e.to_string())?;

    info!("notify: toast sent");
    Ok(())
}
