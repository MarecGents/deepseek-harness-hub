// quit.rs — M3 退出语义（T3.6）
//
// 模块类别：Services（壳）
// 职责：quit.marker 语义定义（Rust 侧写 marker → process::exit(0)）。
//       对齐 launcher.mjs L383-406 的 quit.marker 判别逻辑。
// 外部接口：write_quit_marker() / clear_quit_marker() / has_quit_marker()。
//
// quit.marker 语义（与 rc.14 完全对齐）：
//   1. 托盘「退出」点击 → 写 marker → process::exit(0)
//   2. launcher 看到 marker → 视为用户主动退出 → 不自动重启
//   3. 无 marker 的非 0 退出 → launcher 自动重启（M4 sidecar 崩溃重启 ≤3 次）

use log::info;
use std::path::PathBuf;

/// quit.marker 路径：$DSH_HOME/dsh-hub/quit.marker（与 rc.14 一致）。
fn marker_path() -> PathBuf {
    crate::state::dsh_home().join("dsh-hub").join("quit.marker")
}

/// 写 quit.marker（T3.6）。
///
/// 托盘「退出」调用此函数后 process::exit(0)，launcher 看到 marker 不重启。
#[cfg(test)]
fn marker_path_in(root: &std::path::Path) -> PathBuf {
    root.join("dsh-hub").join("quit.marker")
}

/// 内部实现（测试注入目录用）。
fn write_marker_at(path: &std::path::Path) {
    if let Some(parent) = path.parent() {
        // Best-effort: the write below surfaces the real failure if any.
        let _ = std::fs::create_dir_all(parent);
    }
    // Audit P2-2 (2026-09-02): the marker is the supervisor's only signal for
    // "voluntary exit" — a silent write failure would turn the next boot into
    // a crash-restart, so surface it.
    if let Err(e) = std::fs::write(path, "quit") {
        log::warn!("quit: marker write failed at {}: {e}", path.display());
    }
}

pub fn write_quit_marker() {
    let path = marker_path();
    write_marker_at(&path);
    info!("quit: wrote marker at {}", path.display());
}

/// 清除 quit.marker（M4 崩溃重启循环：每次启动/重启前清除残留 marker）。
pub fn clear_quit_marker() {
    let path = marker_path();
    if path.exists() {
        // Audit P2-2 (2026-09-02): a leftover marker suppresses crash-restart.
        if let Err(e) = std::fs::remove_file(&path) {
            log::warn!("quit: marker clear failed at {}: {e}", path.display());
        }
        info!("quit: cleared marker at {}", path.display());
    }
}

/// 检查 quit.marker 是否存在（M4 supervisor 退出判定：存在 = 用户主动退出，
/// 不重启；无 marker 的非 0 退出 = 崩溃，进入重启循环）。
pub fn has_quit_marker() -> bool {
    marker_path().exists()
}

/// 统一的「用户主动退出」收口：写 quit.marker 后 `process::exit(0)`。
/// 托盘退出 / 菜单退出 / --smoke 收尾共用——marker 必须先于 exit 写入，
/// supervisor 才能把这次退出判为「主动」而非崩溃。`process::exit` 刻意跳过
/// 析构（GUI 进程退出语义；单一退出点便于审查）。
pub fn quit_and_exit() -> ! {
    write_quit_marker();
    std::process::exit(0);
}

#[cfg(test)]
mod tests {
    use super::*;

    // 2026-09-01 audit P2: quit.marker 是 supervisor fail-fast 的唯一信号，
    // 之前零单测——补 write/exists/clear 的隔离目录契约。
    #[test]
    fn marker_write_exists_clear_roundtrip() {
        let dir = std::env::temp_dir().join(format!("dsh-hub-quit-test-{}", std::process::id()));
        let marker = marker_path_in(&dir);
        let _ = std::fs::remove_dir_all(&dir);
        assert!(!marker.exists());
        write_marker_at(&marker);
        assert!(marker.exists());
        assert_eq!(std::fs::read_to_string(&marker).unwrap(), "quit");
        let _ = std::fs::remove_file(&marker);
        assert!(!marker.exists());
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn marker_parent_dirs_created() {
        let dir = std::env::temp_dir().join(format!("dsh-hub-quit-parent-{}", std::process::id()));
        let marker = marker_path_in(&dir);
        let _ = std::fs::remove_dir_all(&dir);
        write_marker_at(&marker);
        assert!(marker.exists());
        let _ = std::fs::remove_dir_all(&dir);
    }
}
