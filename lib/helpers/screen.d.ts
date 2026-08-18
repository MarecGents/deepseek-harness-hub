/**
 * The screen the cursor is on (multi-monitor aware), falling back to the
 * primary screen; undefined when neither is resolvable.
 */
export declare function resolveLaunchScreen(): {
    width: number;
    height: number;
} | undefined;
