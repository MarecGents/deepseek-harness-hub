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
/** Serialize a palette block as `:root { --token:value; ... }` CSS. */
function block(selector, palette) {
    const body = Object.entries(palette)
        .map(([token, value]) => `--dsw-alias-${token}:${value};`)
        .join('');
    return `${selector}{${body}}`;
}
function buildCss(skin) {
    return `${block(':root', skin.light)}${block('body[data-ds-dark-theme]', skin.dark)}`;
}
/**
 * The built-in skins. Palettes are original compositions over the dsw alias
 * token set; adjust freely.
 */
export const SKINS = [
    {
        id: 'midnight',
        name: '午夜蓝',
        description: '深海蓝调，冷静专注',
        light: {
            'bg-base': '#eef1f8',
            'bg-layer-1': '#e4e9f4',
            'bg-layer-2': '#dbe2f0',
            'bg-layer-3': '#d3dcec',
            'bg-overlay': '#f4f7fd',
            'label-primary': '#1c2333',
            'label-secondary': '#3f4a63',
            'label-tertiary': '#5b6884',
            'label-dimmed': '#7c8aa8',
            'border-l1': '#d5dceb',
            'border-l2': '#c4cfe2',
            'border-l3': '#b3c0d8',
            'brand-primary': '#3b6fe0',
            'brand-primary-invert': '#ffffff',
            'brand-text': '#ffffff',
            'button-primary-fill': '#3b6fe0',
            'button-primary-hover': '#2f5cc4',
            'button-primary-dimmed': '#dbe4fa',
            'interactive-bg-hover': '#dce4f2',
            'interactive-bg-active': '#cfd9ec',
            'markdown-code-block': '#e2e8f4',
            'markdown-inline-code': '#dde5f2',
            'scrollbar-bg-l1': '#d5dceb',
            'scrollbar-hover-l1': '#c0cbe0',
            'tooltip-bg': '#1c2333',
            'toast-bg': '#1c2333',
        },
        dark: {
            'bg-base': '#0a1222',
            'bg-layer-1': '#0f1a30',
            'bg-layer-2': '#14223c',
            'bg-layer-3': '#192a48',
            'bg-overlay': '#0c1528',
            'label-primary': '#dbe6ff',
            'label-secondary': '#9fb3d9',
            'label-tertiary': '#7f93bb',
            'label-dimmed': '#617297',
            'border-l1': '#1c2b4a',
            'border-l2': '#24365a',
            'border-l3': '#2d4169',
            'brand-primary': '#5b8cff',
            'brand-primary-invert': '#0a1222',
            'brand-text': '#0a1222',
            'button-primary-fill': '#3b6fe0',
            'button-primary-hover': '#4c7ceb',
            'button-primary-dimmed': '#1d3050',
            'interactive-bg-hover': '#182742',
            'interactive-bg-active': '#1f3150',
            'markdown-code-block': '#0d1830',
            'markdown-inline-code': '#14223c',
            'scrollbar-bg-l1': '#1c2b4a',
            'scrollbar-hover-l1': '#2b4068',
            'tooltip-bg': '#1c2333',
            'toast-bg': '#1c2333',
        },
    },
    {
        id: 'paper',
        name: '旧纸张',
        description: '暖黄米色，护眼复古',
        light: {
            'bg-base': '#f4eee1',
            'bg-layer-1': '#ede4d2',
            'bg-layer-2': '#e7dcc6',
            'bg-layer-3': '#e0d3ba',
            'bg-overlay': '#f8f2e7',
            'label-primary': '#3d3527',
            'label-secondary': '#5c513d',
            'label-tertiary': '#7a6d54',
            'label-dimmed': '#98896c',
            'border-l1': '#d9cbaa',
            'border-l2': '#cdbb94',
            'border-l3': '#c0ab7f',
            'brand-primary': '#7a5c2e',
            'brand-primary-invert': '#f8f2e7',
            'brand-text': '#f8f2e7',
            'button-primary-fill': '#7a5c2e',
            'button-primary-hover': '#664c26',
            'button-primary-dimmed': '#e9dfc8',
            'interactive-bg-hover': '#e8ddc6',
            'interactive-bg-active': '#e0d3b8',
            'markdown-code-block': '#e9dfc8',
            'markdown-inline-code': '#e6dac0',
            'scrollbar-bg-l1': '#d9cbaa',
            'scrollbar-hover-l1': '#c8b688',
            'tooltip-bg': '#3d3527',
            'toast-bg': '#3d3527',
        },
        dark: {
            'bg-base': '#211d15',
            'bg-layer-1': '#2a2419',
            'bg-layer-2': '#332b1d',
            'bg-layer-3': '#3c3222',
            'bg-overlay': '#252016',
            'label-primary': '#e8dcc0',
            'label-secondary': '#b3a483',
            'label-tertiary': '#93855f',
            'label-dimmed': '#75684a',
            'border-l1': '#3a3122',
            'border-l2': '#463b29',
            'border-l3': '#524430',
            'brand-primary': '#c9a45c',
            'brand-primary-invert': '#211d15',
            'brand-text': '#211d15',
            'button-primary-fill': '#8a6a33',
            'button-primary-hover': '#9d7a3e',
            'button-primary-dimmed': '#37301f',
            'interactive-bg-hover': '#322a1c',
            'interactive-bg-active': '#3a3120',
            'markdown-code-block': '#262015',
            'markdown-inline-code': '#2e281b',
            'scrollbar-bg-l1': '#3a3122',
            'scrollbar-hover-l1': '#4a3f2b',
            'tooltip-bg': '#3d3527',
            'toast-bg': '#3d3527',
        },
    },
    {
        id: 'terminal',
        name: '终端绿',
        description: '磷光绿，命令行质感',
        light: {
            'bg-base': '#eef5ec',
            'bg-layer-1': '#e2efe0',
            'bg-layer-2': '#d7e9d4',
            'bg-layer-3': '#cce3c9',
            'bg-overlay': '#f2f8f0',
            'label-primary': '#1d301c',
            'label-secondary': '#3a5436',
            'label-tertiary': '#55774f',
            'label-dimmed': '#74996d',
            'border-l1': '#cfe3cc',
            'border-l2': '#bfd8bb',
            'border-l3': '#aecda9',
            'brand-primary': '#2e7d32',
            'brand-primary-invert': '#f2f8f0',
            'brand-text': '#f2f8f0',
            'button-primary-fill': '#2e7d32',
            'button-primary-hover': '#266a2a',
            'button-primary-dimmed': '#d8ecd5',
            'interactive-bg-hover': '#dcebda',
            'interactive-bg-active': '#d0e4ce',
            'markdown-code-block': '#dfeede',
            'markdown-inline-code': '#d8ead6',
            'scrollbar-bg-l1': '#cfe3cc',
            'scrollbar-hover-l1': '#b9d6b4',
            'tooltip-bg': '#1d301c',
            'toast-bg': '#1d301c',
        },
        dark: {
            'bg-base': '#0a130b',
            'bg-layer-1': '#0e1c10',
            'bg-layer-2': '#132614',
            'bg-layer-3': '#17301a',
            'bg-overlay': '#0b150d',
            'label-primary': '#a9f0a9',
            'label-secondary': '#6fae6f',
            'label-tertiary': '#558d55',
            'label-dimmed': '#3f6e3f',
            'border-l1': '#1c3a20',
            'border-l2': '#244928',
            'border-l3': '#2c5831',
            'brand-primary': '#33ff88',
            'brand-primary-invert': '#0a130b',
            'brand-text': '#0a130b',
            'button-primary-fill': '#1f6e3a',
            'button-primary-hover': '#278346',
            'button-primary-dimmed': '#14301c',
            'interactive-bg-hover': '#11241a',
            'interactive-bg-active': '#162b1e',
            'markdown-code-block': '#0c180e',
            'markdown-inline-code': '#102215',
            'scrollbar-bg-l1': '#1c3a20',
            'scrollbar-hover-l1': '#2a5230',
            'tooltip-bg': '#a9f0a9',
            'toast-bg': '#a9f0a9',
        },
    },
    {
        id: 'aurora',
        name: '极光紫',
        description: '紫罗兰辉光，梦幻渐变',
        light: {
            'bg-base': '#f1eefb',
            'bg-layer-1': '#e8e4f7',
            'bg-layer-2': '#e0daf4',
            'bg-layer-3': '#d8d0f0',
            'bg-overlay': '#f5f2fd',
            'label-primary': '#241f3d',
            'label-secondary': '#453d6b',
            'label-tertiary': '#645a94',
            'label-dimmed': '#8377b8',
            'border-l1': '#d6cdf0',
            'border-l2': '#c7bce8',
            'border-l3': '#b7a9df',
            'brand-primary': '#7c5cff',
            'brand-primary-invert': '#f5f2fd',
            'brand-text': '#f5f2fd',
            'button-primary-fill': '#7c5cff',
            'button-primary-hover': '#6a4ae8',
            'button-primary-dimmed': '#e0d8fb',
            'interactive-bg-hover': '#e6e0f8',
            'interactive-bg-active': '#dcd3f4',
            'markdown-code-block': '#e4def7',
            'markdown-inline-code': '#ded6f4',
            'scrollbar-bg-l1': '#d6cdf0',
            'scrollbar-hover-l1': '#c3b6e6',
            'tooltip-bg': '#241f3d',
            'toast-bg': '#241f3d',
        },
        dark: {
            'bg-base': '#0e0d1d',
            'bg-layer-1': '#151331',
            'bg-layer-2': '#1c1a40',
            'bg-layer-3': '#24214e',
            'bg-overlay': '#100f21',
            'label-primary': '#e2dcff',
            'label-secondary': '#a79fe0',
            'label-tertiary': '#877dc4',
            'label-dimmed': '#665ca6',
            'border-l1': '#2b2760',
            'border-l2': '#35306f',
            'border-l3': '#3f397e',
            'brand-primary': '#9f7cff',
            'brand-primary-invert': '#0e0d1d',
            'brand-text': '#0e0d1d',
            'button-primary-fill': '#6a45e8',
            'button-primary-hover': '#7a57f0',
            'button-primary-dimmed': '#241f4d',
            'interactive-bg-hover': '#1c1940',
            'interactive-bg-active': '#24214b',
            'markdown-code-block': '#121026',
            'markdown-inline-code': '#191632',
            'scrollbar-bg-l1': '#2b2760',
            'scrollbar-hover-l1': '#3a3480',
            'tooltip-bg': '#e2dcff',
            'toast-bg': '#e2dcff',
        },
    },
];
/** Sentinel id meaning "no override / native look". */
export const DEFAULT_SKIN_ID = 'default';
/** Find a skin by id (undefined for unknown or `default`). */
export function findSkin(id) {
    if (id === DEFAULT_SKIN_ID)
        return undefined;
    return SKINS.find((skin) => skin.id === id);
}
/**
 * Apply (or clear) a skin by injecting/updating one `<style id="mg-dsh-skin">`
 * element in the document head. Removing is a no-op when nothing was injected.
 */
export function applySkin(skinId) {
    let style = document.getElementById('mg-dsh-skin');
    if (style === null) {
        style = document.createElement('style');
        style.id = 'mg-dsh-skin';
        document.head.appendChild(style);
    }
    const skin = findSkin(skinId);
    style.textContent = skin === undefined ? '' : buildCss(skin);
}
/** Read the persisted skin id through the plugin's config API. */
export async function fetchStoredSkin() {
    try {
        const res = await fetch('/api/mg-dsh-desktop/config');
        if (!res.ok)
            return DEFAULT_SKIN_ID;
        const body = (await res.json());
        const skin = body.ok === true ? body.value?.skin : undefined;
        return typeof skin === 'string' && skin !== '' ? skin : DEFAULT_SKIN_ID;
    }
    catch {
        return DEFAULT_SKIN_ID;
    }
}
