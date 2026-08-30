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
fn resolve() -> (bool, String, String) {
    let cfg = std::fs::read_to_string(config_path())
        .ok()
        .and_then(|s| serde_json::from_str::<Value>(&s).ok())
        .unwrap_or(Value::Null);
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
        if let Some(entry) = serde_json::from_str::<Value>(SKIN_COLORS)
            .ok()
            .and_then(|v| v.get(skin.as_str()).cloned())
            .and_then(|colors| colors.get(if dark { "dark" } else { "light" }).cloned())
        {
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
        .creation_flags(0x08000000)
        .output()
        .ok()
        .and_then(|o| String::from_utf8(o.stdout).ok())
        .map(|s| s.contains("0x0"))
        .unwrap_or(true)
}
