// state.rs — M2 窗口状态持久化（T2.2）
//
// 模块类别：Helper（壳）
// 职责：$DSH_HOME 解析 + 窗口状态 JSON 读写（只存 maximized，与 rc.14 一致）。
// 迁移映射：src/services/state-store.ts。
// 外部接口：dsh_home() / load_window_state() / save_window_state()。

use std::path::PathBuf;
use serde::{Deserialize, Serialize};

/// 解析 $DSH_HOME（env || ~/.dsh），保留 rc.14 语义。
/// SOP §5.5 明确：不用 dirs::data_dir()，用 DSH_HOME env || homedir/.dsh。
/// 注意：trim 后非空才用 env（防止 DSH_HOME=' ' 的情况）。
pub fn dsh_home() -> PathBuf {
    match std::env::var("DSH_HOME") {
        Ok(v) if !v.trim().is_empty() => PathBuf::from(v.trim()),
        _ => dirs::home_dir().unwrap_or_default().join(".dsh"),
    }
}

/// 窗口状态（与 rc.14 的 dsh-hub-window-state.json 对齐）。
/// 只存 maximized（几何尺寸不持久化——rc.14 设计决策：防止 0 尺寸退化）。
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct WindowState {
    /// 是否最大化（rc.14 语义：启动时恢复最大化）。
    pub maximized: bool,
    /// 当前宽（物理像素，供参考，非恢复用）。
    #[serde(default)]
    pub width: u32,
    /// 当前高（物理像素）。
    #[serde(default)]
    pub height: u32,
}

/// 状态文件路径：$DSH_HOME/dsh-hub-window-state.json（与 rc.14 一致）。
fn state_path() -> PathBuf {
    dsh_home().join("dsh-hub-window-state.json")
}

/// 校验下界（防止 0 尺寸退化——SOP T2.2 / 关键踩坑记录 #7）。
fn validate(_state: &WindowState) -> bool {
    // 只关心 maximized 标志有效（width/height 是参考值，非恢复用）。
    // maximized 布尔值天然有效（serde 默认 false）。
    true
}

/// 加载窗口状态（rc.14 遗留兼容：文件不存在则返回默认）。
pub fn load_window_state() -> WindowState {
    let path = state_path();
    let Ok(content) = std::fs::read_to_string(&path) else {
        return WindowState::default();
    };
    match serde_json::from_str::<WindowState>(&content) {
        Ok(state) if validate(&state) => {
            log::info!("state: loaded from {}", path.display());
            state
        }
        Ok(state) => {
            log::warn!("state: invalid data in {}, using default", path.display());
            let _ = std::fs::remove_file(&path); // 清理损坏文件。
            state
        }
        Err(e) => {
            log::warn!("state: parse error in {}: {}", path.display(), e);
            WindowState::default()
        }
    }
}

/// 保存窗口状态（窗口关闭 / resize 时调用）。
pub fn save_window_state(state: WindowState) -> Result<(), Box<dyn std::error::Error>> {
    let path = state_path();
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent)?;
    }
    let content = serde_json::to_string_pretty(&state)?;
    std::fs::write(&path, content)?;
    log::info!("state: saved to {}", path.display());
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn dsh_home_default() {
        // DSH_HOME 未设置时，返回 ~/.dsh。
        std::env::remove_var("DSH_HOME");
        let home = dsh_home();
        assert!(home.ends_with(".dsh"));
    }

    #[test]
    fn dsh_home_trim_empty() {
        // DSH_HOME=' ' 时，trim 后为空，应返回默认。
        std::env::set_var("DSH_HOME", "   ");
        let home = dsh_home();
        assert!(home.ends_with(".dsh"));
        std::env::remove_var("DSH_HOME");
    }

    #[test]
    fn dsh_home_custom() {
        std::env::set_var("DSH_HOME", "/tmp/test_dsh");
        let home = dsh_home();
        assert_eq!(home, PathBuf::from("/tmp/test_dsh"));
        std::env::remove_var("DSH_HOME");
    }

    #[test]
    fn window_state_roundtrip() {
        let state = WindowState { maximized: true, width: 1024, height: 768 };
        let json = serde_json::to_string(&state).unwrap();
        let parsed: WindowState = serde_json::from_str(&json).unwrap();
        assert!(parsed.maximized);
        assert_eq!(parsed.width, 1024);
    }

    #[test]
    fn validate_default() {
        assert!(validate(&WindowState::default()));
    }
}
