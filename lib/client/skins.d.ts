/**
 * Skin registry — self-written palettes that restyle the dsh web UI through
 * its semantic color tokens (`--dsw-alias-*`). Each skin ships a light and a
 * dark palette; dsh's own mode marker (`body[data-ds-dark-theme]`) decides
 * which block is active, so skins stay coherent with the user's light/dark
 * setting instead of fighting it.
 *
 * The `default` skin is not an entry: it means "no override" and removes the
 * injected stylesheet entirely.
 */
/** One semantic token override (alias token name without the leading `--dsw-alias-`). */
export interface Palette {
    [token: string]: string;
}
/** A selectable skin. */
export interface DshSkin {
    id: string;
    name: string;
    description: string;
    /** `--dsw-alias-*` overrides (the main semantic tokens). */
    light: Palette;
    dark: Palette;
    /**
     * `--dsw-specific-*` overrides — surfaces the alias tokens do not drive
     * (sidebar surface, sidebar nav item states, floating menus). Kept
     * separate so alias keys stay short and the specific set is explicit.
     */
    specific: {
        light: Palette;
        dark: Palette;
    };
}
/**
 * The built-in skins. Palettes are original compositions over the dsw alias
 * token set; adjust freely.
 */
export declare const SKINS: DshSkin[];
/** Sentinel id meaning "no override / native look". */
export declare const DEFAULT_SKIN_ID = "default";
/** Find a skin by id (undefined for unknown or `default`). */
export declare function findSkin(id: string): DshSkin | undefined;
/**
 * Apply (or clear) a skin by injecting/updating one `<style id="mg-dsh-skin">`
 * element in the document head. Removing is a no-op when nothing was injected.
 */
export declare function applySkin(skinId: string): void;
/** Mark that the user explicitly picked a skin (settings card onPickSkin). */
export declare function markSkinUserPicked(): void;
/** Whether the user already picked a skin in this page lifetime. */
export declare function hasUserPickedSkin(): boolean;
/** Read the persisted skin id through the plugin's config API. */
export declare function fetchStoredSkin(): Promise<string>;
