// quit.rs — M3 退出语义（T3.6）
//
// 模块类别：Services（壳）
// 职责：quit.marker 语义定义（Rust 侧写 marker → process::exit(0)）。
//       对齐 launcher.mjs L383-406 的 quit.marker 判别逻辑。
// 外部接口：write_quit_marker()。
//
// quit.marker 语义（与 rc.14 完全对齐）：
//   1. 托盘「退出」点击 → 写 marker → process::exit(0)
//   2. launcher 看到 marker → 视为用户主动退出 → 不自动重启
//   3. 无 marker 的非 0 退出 → launcher 自动重启（M4 sidecar 崩溃重启 ≤3 次）

use std::path::PathBuf;
use log::info;

/// quit.marker 路径：$DSH_HOME/dsh-hub/quit.marker（与 rc.14 一致）。
fn marker_path() -> PathBuf {
    crate::state::dsh_home().join("dsh-hub").join("quit.marker")
}

/// 写 quit.marker（T3.6）。
///
/// 托盘「退出」调用此函数后 process::exit(0)，launcher 看到 marker 不重启。
pub fn write_quit_marker() {
    let path = marker_path();
    if let Some(parent) = path.parent() {
        let _ = std::fs::create_dir_all(parent);
    }
    let _ = std::fs::write(&path, "quit");
    info!("quit: wrote marker at {}", path.display());
}

/// 清除 quit.marker（M4 崩溃重启循环：每次启动时清除残留 marker）。
#[allow(dead_code)] // M4 sidecar 落地时移除
pub fn clear_quit_marker() {
    let path = marker_path();
    if path.exists() {
        let _ = std::fs::remove_file(&path);
        info!("quit: cleared marker at {}", path.display());
    }
}
