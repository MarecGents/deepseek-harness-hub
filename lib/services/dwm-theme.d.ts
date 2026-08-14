/**
 * Force the native title bar light/dark via koffi (fast path). Returns false
 * when the FFI binding is unavailable, so the caller can run the slow
 * PowerShell fallback.
 */
export declare function setTitleBarDark(hwnd: bigint, dark: boolean): boolean;
/** PowerShell fallback (≈1.3s per call; only used when koffi is unavailable). */
export declare function setTitleBarDarkPowerShell(hwnd: bigint, dark: boolean): void;
