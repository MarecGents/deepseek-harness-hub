fn main() {
    // 声明 app 命令 → 自动生成 allow-$command / deny-$command 权限
    // （tauri-build AppManifest::commands）。外部 URL 页面（remote origin）
    // 调用这些命令时，capability 必须引用对应 allow-* 权限，否则被 ACL 拒绝。
    tauri_build::try_build(
        tauri_build::Attributes::new().app_manifest(
            tauri_build::AppManifest::new().commands(&[
                "ping",
                "diag_report",
                "set_window_theme",
                "set_window_size",
                "get_workspace_path",
                "window_minimize",
                "window_toggle_maximize",
                "window_close",
                "notify_task_complete",
            ]),
        ),
    )
    .expect("failed to run tauri-build");
}
