// single-instance.rs — M3 单实例（T3.3）
//
// 模块类别：Helper（壳）
// 职责：确保同时只有一个桌面壳实例运行（D1 决策：聚焦已有窗口）。
// 外部接口：single_instance_plugin()。

use log::info;
use tauri::plugin::TauriPlugin;
use tauri::Manager;

/// 创建并返回单实例插件（T3.3）。
/// D1 决策（用户拍板）：第二次启动 = 聚焦已有窗口（不弹窗）。
pub fn single_instance_plugin() -> TauriPlugin<tauri::Wry> {
    tauri_plugin_single_instance::init(|app, args, _cwd| {
        info!(
            "single-instance: second launch detected (args={:?}), focusing last window",
            args
        );

        // 聚焦最后一个窗口（D1）。
        // webview_windows() 返回 HashMap<String, WebviewWindow>。
        if let Some((_, win)) = app.webview_windows().into_iter().next() {
            let _ = win.show();
            let _ = win.set_focus();
            info!("single-instance: focused window {}", win.label());
        } else {
            info!("single-instance: no windows found");
        }
    })
}
