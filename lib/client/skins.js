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
/** Serialize one selector block: alias tokens plus optional specific tokens. */
function block(selector, palette, specific) {
    const aliasBody = Object.entries(palette)
        .map(([token, value]) => `--dsw-alias-${token}:${value};`)
        .join('');
    const specificBody = specific === undefined ? '' : Object.entries(specific)
        .map(([token, value]) => `--dsw-specific-${token}:${value};`)
        .join('');
    return `${selector}{${aliasBody}${specificBody}}`;
}
function buildCss(skin) {
    // The web UI declares its alias tokens on `body` (light) and
    // `body[data-ds-dark-theme]` (dark). Overriding on `:root` would lose the
    // cascade (body wins for its own subtree), so both blocks must target the
    // same selectors the app uses; the injected stylesheet is appended to head
    // and therefore wins at equal specificity.
    return `${block('body', skin.light, skin.specific.light)}${block('body[data-ds-dark-theme]', skin.dark, skin.specific.dark)}`;
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
            'bg-module-platform': '#d3dcec',
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
            'bg-module-platform': '#192a48',
        },
        specific: {
            light: {
                'sidebar-fill': '#e4e9f4',
                'sidebar-nav-item-active-accent': '#3b6fe0',
                'sidebar-nav-item-active': '#dbe4fa',
                'sidebar-nav-item-hover': '#dce4f2',
                menu: '#d3dcec',
                bubble: '#e8edf8',
                'bubble-highlight': '#dbe4fa',
            },
            dark: {
                'sidebar-fill': '#0f1a30',
                'sidebar-nav-item-active-accent': '#5b8cff',
                'sidebar-nav-item-active': '#1d3050',
                'sidebar-nav-item-hover': '#182742',
                menu: '#192a48',
                bubble: '#14223c',
                'bubble-highlight': '#1d3050',
            },
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
            'bg-module-platform': '#e0d3ba',
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
            'bg-module-platform': '#3c3222',
        },
        specific: {
            light: {
                'sidebar-fill': '#ede4d2',
                'sidebar-nav-item-active-accent': '#7a5c2e',
                'sidebar-nav-item-active': '#e9dfc8',
                'sidebar-nav-item-hover': '#e8ddc6',
                menu: '#e0d3ba',
                bubble: '#f0e9d8',
                'bubble-highlight': '#e9dfc8',
            },
            dark: {
                'sidebar-fill': '#2a2419',
                'sidebar-nav-item-active-accent': '#c9a45c',
                'sidebar-nav-item-active': '#37301f',
                'sidebar-nav-item-hover': '#322a1c',
                menu: '#3c3222',
                bubble: '#332b1d',
                'bubble-highlight': '#37301f',
            },
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
            'bg-module-platform': '#cce3c9',
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
            'tooltip-bg': '#0e1c10',
            'toast-bg': '#0e1c10',
            'bg-module-platform': '#17301a',
        },
        specific: {
            light: {
                'sidebar-fill': '#e2efe0',
                'sidebar-nav-item-active-accent': '#2e7d32',
                'sidebar-nav-item-active': '#d8ecd5',
                'sidebar-nav-item-hover': '#dcebda',
                menu: '#cce3c9',
                bubble: '#e8f3e6',
                'bubble-highlight': '#d8ecd5',
            },
            dark: {
                'sidebar-fill': '#0e1c10',
                'sidebar-nav-item-active-accent': '#33ff88',
                'sidebar-nav-item-active': '#14301c',
                'sidebar-nav-item-hover': '#11241a',
                menu: '#17301a',
                bubble: '#132614',
                'bubble-highlight': '#14301c',
            },
        },
    },
    {
        id: 'zcode',
        name: 'ZCode',
        description: '智谱 ZCode IDE 实测色板（浅色/深色）',
        light: {
            // ZCode 浅色实测：内容 #ffffff → 面板 #ececee → 标题/状态栏 #f8f8f8
            'bg-base': '#ffffff',
            'bg-layer-1': '#ececee',
            'bg-layer-2': '#ececee',
            'bg-layer-3': '#f8f8f8',
            'bg-overlay': '#f8f8f8',
            'label-primary': '#262626',
            'label-secondary': '#55565a',
            'label-tertiary': '#8a8a8d',
            'label-dimmed': '#b0b0b2',
            'border-l1': '#e3e3e5',
            'border-l2': '#d9d9db',
            'border-l3': '#c9c9cb',
            'brand-primary': '#0095df',
            'brand-primary-invert': '#ffffff',
            'brand-text': '#ffffff',
            'button-primary-fill': '#0095df',
            'button-primary-hover': '#007fbf',
            'button-primary-dimmed': '#d9edf9',
            'interactive-bg-hover': '#e0e0e2',
            'interactive-bg-active': '#d3d3d5',
            'markdown-code-block': '#f4f4f6',
            'markdown-inline-code': '#ececee',
            'scrollbar-bg-l1': '#c8c8ca99',
            'scrollbar-hover-l1': '#a8a8aa',
            'bg-module-platform': '#f8f8f8',
            'tooltip-bg': '#262626',
            'toast-bg': '#262626',
            'state-success-primary': '#2da44e',
            'state-error-primary': '#cf222e',
            'state-warn-primary': '#bf8700',
            'state-business-primary': '#0095df',
        },
        dark: {
            // ZCode 深色实测：标题/状态栏 #161616（比内容更暗）→ 面板/侧栏/编辑器 #2b2b2b → 浮层 #363636
            'bg-base': '#2b2b2b',
            'bg-layer-1': '#2b2b2b',
            'bg-layer-2': '#363636',
            'bg-layer-3': '#161616',
            'bg-overlay': '#1f1f1f',
            'label-primary': '#dcdcdc',
            'label-secondary': '#a0a0a0',
            'label-tertiary': '#888888',
            'label-dimmed': '#6b6b6b',
            'border-l1': '#3c3c3c',
            'border-l2': '#545454',
            'border-l3': '#626262',
            'brand-primary': '#0096e0',
            'brand-primary-invert': '#161616',
            'brand-text': '#161616',
            'button-primary-fill': '#0096e0',
            'button-primary-hover': '#1ba5e8',
            'button-primary-dimmed': '#1d3a47',
            'interactive-bg-hover': '#3a3a3a',
            'interactive-bg-active': '#414141',
            'markdown-code-block': '#232323',
            'markdown-inline-code': '#363636',
            'scrollbar-bg-l1': '#54545499',
            'scrollbar-hover-l1': '#6e6e6e',
            'tooltip-bg': '#161616',
            'toast-bg': '#161616',
            'state-success-primary': '#3fb950',
            'state-error-primary': '#f85149',
            'state-warn-primary': '#d29922',
            'state-business-primary': '#0096e0',
            'bg-module-platform': '#161616',
        },
        specific: {
            light: {
                'sidebar-fill': '#ececee',
                'sidebar-nav-item-active-accent': '#0095df',
                'sidebar-nav-item-active': '#d9edf9',
                'sidebar-nav-item-hover': '#e0e0e2',
                menu: '#f8f8f8',
                bubble: '#f4f4f6',
                'bubble-highlight': '#d9edf9',
            },
            dark: {
                // ZCode 深色实测：侧栏 #363636（比内容 #2b2b2b 亮一步），标题栏 #161616 更暗
                'sidebar-fill': '#363636',
                'sidebar-nav-item-active-accent': '#0096e0',
                'sidebar-nav-item-active': '#1d3a47',
                'sidebar-nav-item-hover': '#3a3a3a',
                menu: '#161616',
                bubble: '#363636',
                'bubble-highlight': '#1d3a47',
            },
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
            'bg-module-platform': '#d8d0f0',
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
            'tooltip-bg': '#151331',
            'toast-bg': '#151331',
            'bg-module-platform': '#24214e',
        },
        specific: {
            light: {
                'sidebar-fill': '#e8e4f7',
                'sidebar-nav-item-active-accent': '#7c5cff',
                'sidebar-nav-item-active': '#e0d8fb',
                'sidebar-nav-item-hover': '#e6e0f8',
                menu: '#d8d0f0',
                bubble: '#ece7fa',
                'bubble-highlight': '#e0d8fb',
            },
            dark: {
                'sidebar-fill': '#151331',
                'sidebar-nav-item-active-accent': '#9f7cff',
                'sidebar-nav-item-active': '#241f4d',
                'sidebar-nav-item-hover': '#1c1940',
                menu: '#24214e',
                bubble: '#1c1a40',
                'bubble-highlight': '#241f4d',
            },
        },
    },
    {
        // Ported from the Reasonix desktop "Noir Gold" official theme
        // (desktop/themes/official/official-noir-gold/theme.json). Literal
        // surfaces/text/accent tokens map 1:1; intermediate tones (layer-2,
        // borders-l2, tertiary labels, button hover/dimmed, interactive washes,
        // bubble surfaces) are derived with a uniform mix/darken rule set,
        // documented in docs/skins/rx-noir-gold.md. Light dimmed nudged darker
        // (#8F8469) so it stays >= 3.5:1 on bg-base.
        id: 'rx-noir-gold',
        name: '黑金（Noir Gold）',
        description: 'Reasonix 官方 Noir Gold——暖纸金与墨黑鎏金',
        light: {
            'bg-base': '#FDFAF2',
            'bg-layer-1': '#F6F0DF',
            'bg-layer-2': '#F7F1E1',
            'bg-layer-3': '#FEFBF4',
            'bg-overlay': '#FEFBF4',
            'label-primary': '#2A241B',
            'label-secondary': '#5C5340',
            'label-tertiary': '#7B715A',
            'label-dimmed': '#8F8469',
            'border-l1': '#EFE8D2',
            'border-l2': '#DFD5B6',
            'border-l3': '#CCBE94',
            'brand-primary': '#7A5A16',
            'brand-primary-invert': '#FCF8EE',
            'brand-text': '#FCF8EE',
            'button-primary-fill': '#6B4F13',
            'button-primary-hover': '#5F4611',
            'button-primary-dimmed': '#EFE8D8',
            'interactive-bg-hover': '#F6F0DE',
            'interactive-bg-active': '#F5EFDE',
            'markdown-code-block': '#FAF5E8',
            'markdown-inline-code': '#F6F0DF',
            'scrollbar-bg-l1': '#E6DEC2',
            'scrollbar-hover-l1': '#CCBE94',
            'bg-module-platform': '#F7F1E1',
            'tooltip-bg': '#2A241B',
            'toast-bg': '#2A241B',
        },
        dark: {
            'bg-base': '#131009',
            'bg-layer-1': '#15120E',
            'bg-layer-2': '#171410',
            'bg-layer-3': '#1D1913',
            'bg-overlay': '#14110D',
            'label-primary': '#F8F1DF',
            'label-secondary': '#D6CBAE',
            'label-tertiary': '#B6AC8E',
            'label-dimmed': '#968C6E',
            'border-l1': '#2A2418',
            'border-l2': '#372E1F',
            'border-l3': '#463B27',
            'brand-primary': '#D9B45B',
            'brand-primary-invert': '#1D1503',
            'brand-text': '#1D1503',
            'button-primary-fill': '#D9B45B',
            'button-primary-hover': '#DEBD6F',
            'button-primary-dimmed': '#3F3213',
            'interactive-bg-hover': '#15120E',
            'interactive-bg-active': '#14110D',
            'markdown-code-block': '#14110C',
            'markdown-inline-code': '#15120E',
            'scrollbar-bg-l1': '#312A1C',
            'scrollbar-hover-l1': '#463B27',
            'bg-module-platform': '#171410',
            'tooltip-bg': '#241F16',
            'toast-bg': '#241F16',
        },
        specific: {
            light: {
                'sidebar-fill': '#F5EFDD',
                'sidebar-nav-item-active-accent': '#7A5A16',
                'sidebar-nav-item-active': '#EFE8D8',
                'sidebar-nav-item-hover': '#F6F0DE',
                menu: '#FEFBF4',
                bubble: '#FAF5E8',
                'bubble-highlight': '#EFE8D8',
            },
            dark: {
                'sidebar-fill': '#14110D',
                'sidebar-nav-item-active-accent': '#D9B45B',
                'sidebar-nav-item-active': '#3F3213',
                'sidebar-nav-item-hover': '#15120E',
                menu: '#1D1913',
                bubble: '#18140E',
                'bubble-highlight': '#392D10',
            },
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
/** True once the user explicitly picked a skin in this page lifetime. The
 * boot skin restore must not clobber a user pick that raced it (B8). */
let userPickedSkin = false;
/** Mark that the user explicitly picked a skin (settings card onPickSkin). */
export function markSkinUserPicked() {
    userPickedSkin = true;
}
/** Whether the user already picked a skin in this page lifetime. */
export function hasUserPickedSkin() {
    return userPickedSkin;
}
/** Read the persisted skin id through the plugin's config API. */
export async function fetchStoredSkin() {
    try {
        const res = await fetch('/api/dsh-hub/config');
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
