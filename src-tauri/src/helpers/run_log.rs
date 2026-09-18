// run_log.rs — 运行日志轮转（2026-09-18）
//
// 模块类别：Helpers（无状态）
// 职责：每次启动保留上一份 dsh.log，供「壳为什么退出/闪退」的事后取证。
//       tauri-plugin-log 的 Folder target 打开同名文件时会截断它，所以必须在
//       日志插件注册之前把上一份搬走，否则现场直接归零。
// 外部接口：rotate_run_log(log_dir)。
//
// 代际：dsh.log = 本次运行；dsh.log.prev = 上一次；dsh.log.prev2 = 上上次
//      （再老丢弃）。dsh.log 为空（上次启动即失败）时不轮转，避免把仍有内容
//      的 prev 挤掉。全部尽力而为：IO 失败只报错，不阻断启动。

use std::path::Path;

/// 启动时轮转日志：dsh.log → dsh.log.prev → dsh.log.prev2。
pub fn rotate_run_log(log_dir: &Path) {
    let current = log_dir.join("dsh.log");
    // 空文件（上次启动即崩/即退）不值得占用一代，保留更早的有效现场。
    let has_content = std::fs::metadata(&current)
        .map(|m| m.len() > 0)
        .unwrap_or(false);
    if !has_content {
        return;
    }

    let prev = log_dir.join("dsh.log.prev");
    let prev2 = log_dir.join("dsh.log.prev2");
    let _ = std::fs::remove_file(&prev2);
    if prev.is_file() {
        if let Err(e) = std::fs::rename(&prev, &prev2) {
            eprintln!("dsh-hub: rotate log (prev -> prev2) failed: {e}");
        }
    }
    if let Err(e) = std::fs::rename(&current, &prev) {
        eprintln!("dsh-hub: rotate log (dsh.log -> dsh.log.prev) failed: {e}");
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn tmpdir(tag: &str) -> std::path::PathBuf {
        let dir =
            std::env::temp_dir().join(format!("dsh-hub-run-log-{tag}-{}", std::process::id()));
        let _ = std::fs::remove_dir_all(&dir);
        std::fs::create_dir_all(&dir).unwrap();
        dir
    }

    #[test]
    fn rotates_current_into_prev_and_pushes_generations() {
        let dir = tmpdir("rotate");
        std::fs::write(dir.join("dsh.log"), "current").unwrap();
        std::fs::write(dir.join("dsh.log.prev"), "older").unwrap();
        rotate_run_log(&dir);
        assert_eq!(
            std::fs::read_to_string(dir.join("dsh.log.prev")).unwrap(),
            "current"
        );
        assert_eq!(
            std::fs::read_to_string(dir.join("dsh.log.prev2")).unwrap(),
            "older"
        );
        assert!(!dir.join("dsh.log").exists());
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn keeps_previous_generation_when_current_is_missing_or_empty() {
        let dir = tmpdir("keep");
        std::fs::write(dir.join("dsh.log.prev"), "older").unwrap();
        rotate_run_log(&dir); // dsh.log 不存在
        std::fs::write(dir.join("dsh.log"), "").unwrap();
        rotate_run_log(&dir); // dsh.log 为空
        assert_eq!(
            std::fs::read_to_string(dir.join("dsh.log.prev")).unwrap(),
            "older"
        );
        assert!(!dir.join("dsh.log.prev2").exists());
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn drops_third_generation() {
        let dir = tmpdir("drop");
        std::fs::write(dir.join("dsh.log"), "a").unwrap();
        std::fs::write(dir.join("dsh.log.prev"), "b").unwrap();
        std::fs::write(dir.join("dsh.log.prev2"), "c").unwrap();
        rotate_run_log(&dir);
        assert_eq!(
            std::fs::read_to_string(dir.join("dsh.log.prev")).unwrap(),
            "a"
        );
        assert_eq!(
            std::fs::read_to_string(dir.join("dsh.log.prev2")).unwrap(),
            "b"
        );
        let _ = std::fs::remove_dir_all(&dir);
    }
}
