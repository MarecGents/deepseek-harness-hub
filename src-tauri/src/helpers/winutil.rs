// winutil.rs — shared Windows helpers (wide strings, COM apartment guard).
//
// Module category: Helper (stateless). Centralizes the NUL-terminated UTF-16
// encoding (`wide`) and the CoInitializeEx/CoUninitialize pairing that used to
// be hand-rolled in lib.rs / icon.rs with a manual-pairing footgun (every
// error branch must call CoUninitialize or the thread leaks a COM apartment).
// rust-skills: err-/unsafe-/mem- (single source of truth).
//
// `wide` is cross-platform (UTF-16 encoding is platform-neutral); `ComInit` is
// Windows-only and must only be used from Windows-gated callers.

/// Encode a `&str` as a NUL-terminated UTF-16 buffer for Win32 `PCWSTR` params.
pub fn wide(s: &str) -> Vec<u16> {
    s.encode_utf16().chain(std::iter::once(0)).collect()
}

/// RAII COM apartment initializer: `CoInitializeEx` on construction,
/// `CoUninitialize` on drop — the pairing can never be missed on an error
/// branch. Drop order is deterministic (reverse declaration per mem-drop-order).
pub struct ComInit;

impl ComInit {
    /// Open a COM apartment with the requested threading model.
    /// Returns `None` when CoInitializeEx fails (failure state is safe to
    /// ignore here: no apartment was opened, so nothing to undo).
    #[cfg(target_os = "windows")]
    pub fn new(mode: windows::Win32::System::Com::COINIT) -> Option<Self> {
        use windows::Win32::System::Com::CoInitializeEx;
        // SAFETY: CoInitializeEx with a null reserved pointer is the
        // documented call shape; on failure no apartment is open, so
        // returning None (never calling CoUninitialize) is sound.
        unsafe {
            if CoInitializeEx(None, mode).is_ok() {
                Some(ComInit)
            } else {
                None
            }
        }
    }
}

#[cfg(target_os = "windows")]
impl Drop for ComInit {
    fn drop(&mut self) {
        use windows::Win32::System::Com::CoUninitialize;
        // SAFETY: this guard owns exactly the one apartment CoInitializeEx
        // opened; the API contract requires exactly one matching
        // CoUninitialize per successful init.
        unsafe {
            CoUninitialize();
        }
    }
}
