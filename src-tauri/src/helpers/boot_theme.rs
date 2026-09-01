// boot_theme.rs — 启动配色注入（Splash 与主界面风格一致，2026-08-29 用户反馈）。
//
// 模块类别：Helper（无状态）。
// 职责：窗口创建前读 ShellConfig（theme / skin），生成一段动态
//       initialization_script（`window.__MG_BOOT_THEME = {...}`），
//       供 shell-init.js 的 Splash 使用——Splash 配色 = 当前皮肤的
//       bg-base / label-primary（浅或深），解决「启动页与启动后界面
//       风格差异大、深灰 Splash 突兀」的问题。
//
// 皮肤色表：`skin-colors.json` 由 `scripts/export-skin-colors.mjs` 从
// client/skins.ts 生成（皮肤增改后重跑一次），构建期 include 进二进制。
// 外部接口：boot_theme_script()。
//
// 深浅判定：theme='dark'/'light' 直接取；'system' 读注册表
// AppsUseLightTheme（0 = 深色）。解析失败一律回退内置深色板。

use serde_json::Value;

const SKIN_COLORS: &str = include_str!("../skin-colors.json");

/// 生成启动主题注入脚本（在 shell-init.js 之前执行，定义 `__MG_BOOT_THEME`）。
pub fn boot_theme_script() -> String {
    let (dark, bg, fg) = resolve();
    format!(
        "window.__MG_BOOT_THEME={{dark:{},bg:{:?},fg:{:?}}};",
        dark, bg, fg
    )
}

/// 解析 (是否深色, splash 背景, splash 前景)。
/// 2026-09-01 audit P2：config/皮肤查表失败仅静默回退会让启动配色错配难排查，
/// 解析失败分支补 log::warn 打点（Splash 属于启动期 UI，出错需可观测）。
fn resolve() -> (bool, String, String) {
    let raw_cfg = std::fs::read_to_string(config_path());
    let cfg = match raw_cfg {
        Ok(c) => match serde_json::from_str::<Value>(&c) {
            Ok(v) => v,
            Err(e) => {
                log::warn!("boot_theme: config parse failed, using defaults: {}", e);
                Value::Null
            }
        },
        Err(e) => {
            log::debug!("boot_theme: no config yet, using defaults: {}", e);
            Value::Null
        }
    };
    resolve_from_config(&cfg)
}

/// 纯推导：config JSON → (dark, bg, fg)。抽离以便单测（theme 显式 deep/light
/// 时不查系统注册表；'system' 分支调用 system_dark）。
fn resolve_from_config(cfg: &Value) -> (bool, String, String) {
    let theme = cfg
        .get("theme")
        .and_then(|v| v.as_str())
        .unwrap_or("system")
        .to_string();
    let skin = cfg
        .get("skin")
        .and_then(|v| v.as_str())
        .unwrap_or("default")
        .to_string();

    let dark = match theme.as_str() {
        "dark" => true,
        "light" => false,
        _ => system_dark(),
    };

    // 内置回退色板（与旧 Splash 一致：深灰/近白），皮肤查表成功则覆盖。
    let (mut bg, mut fg) = if dark {
        ("#18181b".to_string(), "#ffffff".to_string())
    } else {
        ("#f7f7f8".to_string(), "#1c1f24".to_string())
    };
    if skin != "default" {
        let parsed: Result<Value, _> = serde_json::from_str(SKIN_COLORS);
        let lookup = match parsed {
            Ok(root) => root
                .get(skin.as_str())
                .cloned()
                .and_then(|colors| colors.get(if dark { "dark" } else { "light" }).cloned()),
            Err(e) => {
                log::error!("boot_theme: skin-colors.json corrupt: {}", e);
                None
            }
        };
        if let Some(entry) = lookup {
            if let Some(v) = entry.get("bg").and_then(|v| v.as_str()) {
                bg = v.to_string();
            }
            if let Some(v) = entry.get("fg").and_then(|v| v.as_str()) {
                fg = v.to_string();
            }
        }
    }
    (dark, bg, fg)
}

fn config_path() -> std::path::PathBuf {
    crate::state::dsh_home().join("dsh-hub").join("config.json")
}

/// 系统深浅：注册表 AppsUseLightTheme（0x0 = 深色）。查询失败按深色（与旧 Splash 一致）。
fn system_dark() -> bool {
    use std::os::windows::process::CommandExt;
    std::process::Command::new("reg")
        .args([
            "query",
            r"HKCU\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize",
            "/v",
            "AppsUseLightTheme",
        ])
        .creation_flags(crate::CREATE_NO_WINDOW)
        .output()
        .ok()
        .and_then(|o| String::from_utf8(o.stdout).ok())
        .map(|s| s.contains("0x0"))
        .unwrap_or(true)
}

#[cfg(test)]
mod tests {
    use super::resolve_from_config;
    use serde_json::json;

    // 2026-09-01 audit: boot_theme.resolve 纯函数单测（之前零覆盖）。
    #[test]
    fn explicit_dark_uses_default_fallback_palette() {
        let cfg = json!({ "theme": "dark" });
        let (dark, bg, fg) = resolve_from_config(&cfg);
        assert!(dark);
        assert_eq!(bg, "#18181b");
        assert_eq!(fg, "#ffffff");
    }

    #[test]
    fn explicit_light_uses_default_fallback_palette() {
        let cfg = json!({ "theme": "light" });
        let (dark, bg, fg) = resolve_from_config(&cfg);
        assert!(!dark);
        assert_eq!(bg, "#f7f7f8");
        assert_eq!(fg, "#1c1f24");
    }

    #[test]
    fn known_skin_dark_applies_skin_palette() {
        // rx-sage-breeze 深色 bg-base=#151E19 fg(label) 来自 skins.ts 生成表。
        let cfg = json!({ "theme": "dark", "skin": "rx-sage-breeze" });
        let (dark, bg, fg) = resolve_from_config(&cfg);
        assert!(dark);
        assert_eq!(bg, "#151E19");
        assert_eq!(fg, "#EEF6F0");
    }

    #[test]
    fn unknown_skin_falls_back_to_default_palette() {
        let cfg = json!({ "theme": "dark", "skin": "definitely-not-a-skin" });
        let (dark, bg, _fg) = resolve_from_config(&cfg);
        assert!(dark);
        assert_eq!(bg, "#18181b");
    }
}
