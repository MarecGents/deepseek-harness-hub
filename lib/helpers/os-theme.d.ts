/**
 * Is the OS currently in light mode? Returns undefined when the registry
 * could not be read (callers should fall back to a sensible default).
 */
export declare function osThemeIsLight(): boolean | undefined;
/** Forget the cached value so the next call re-reads the registry. */
export declare function refreshOsTheme(): void;
