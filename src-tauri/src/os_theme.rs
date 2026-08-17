// os-theme.rs — M3 OS 主题检测（T3.4）
//
// 模块类别：Helper（壳）
// 职责：检测 Windows OS 主题（亮/暗），用于托盘图标深浅跟随。
// 迁移映射：src/services/os-theme.ts（reg.exe query HKCU\...\Themes\Personalize）→ Rust 注册表 API。
// 外部接口：os_theme_is_light() -> bool。
//
// 实现：主选 windows crate 注册表 API（Win32_System_Registry），
//       读 HKCU\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize 的 SystemUsesLightTheme。
//       兜底（注册表不可用时）返回 true（亮色）。

/// 检测 OS 主题是否为亮色（T3.4）。
/// 返回 true = 亮色（SystemUsesLightTheme = 1），false = 暗色。
///
/// 调用时机：托盘图标更新、主窗口主题同步。
/// 非 Windows 平台返回 true（macOS/Linux 桌面主题由系统管理，不单独检测）。
#[allow(dead_code)] // M3 壳内调用点待接线，M4 sidecar 完整接入后移除
pub fn os_theme_is_light() -> bool {
    #[cfg(target_os = "windows")]
    {
        use windows::Win32::System::Registry::{RegOpenKeyExW, RegQueryValueExW, HKEY_CURRENT_USER, KEY_READ};
        use windows::core::HSTRING;

        let key_path = HSTRING::from(r"Software\Microsoft\Windows\CurrentVersion\Themes\Personalize");
        let value_name = HSTRING::from("SystemUsesLightTheme");

        unsafe {
            let mut hkey = std::mem::zeroed();
            let open_result = RegOpenKeyExW(
                HKEY_CURRENT_USER,
                &key_path,
                Some(0),
                KEY_READ,
                &mut hkey,
            );

            if open_result.is_ok() {
                let mut value: u32 = 0;
                let mut size = std::mem::size_of::<u32>() as u32;
                let query_result = RegQueryValueExW(
                    hkey,
                    &value_name,
                    None,
                    None,
                    Some(&mut value as *mut u32 as *mut u8),
                    Some(&mut size),
                );
                if query_result.is_ok() {
                    return value == 1;
                }
            }
        }
        // 注册表读取失败 → 回退兜底：亮色。
        log::warn!("os-theme: registry read failed, assuming light");
    }

    true
}
