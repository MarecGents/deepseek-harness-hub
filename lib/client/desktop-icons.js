/**
 * Desktop-icon registry — selectable window/taskbar icons for the desktop
 * shell (S6, PR #25). Unlike skins (tokens) or backgrounds (page injection),
 * the icon is applied HOST-side (native window + taskbar glyph): the settings
 * card persists the id via `/api/dsh-hub/config` and fires the Tauri
 * `set_desktop_icon` invoke down-link (page → Rust, ACL allow-set-desktop-icon);
 * the Rust shell applies the icon with `include_bytes!`-embedded PNGs
 * (src-tauri/src/helpers/theme.rs apply_desktop_icon).
 *
 * This module only enumerates the choices and their preview thumbnails for
 * the settings card. Previews are served by `/api/dsh-hub/icons/<file>` from
 * `assets/icons/` (the `default` alias serves the white-whale thumbnail so
 * the "default" option gets a preview too).
 *
 * @module dsh-hub/client
 * @category Client (plugin UI)
 */
/** Sentinel id = the theme-aware DeepSeek whale (白鲸/黑鲸跟随明暗主题). */
export const DEFAULT_DESKTOP_ICON_ID = 'default';
/** The built-in desktop icons. Add entries here + assets/icons/*.png
 * (and the matching `include_bytes!` in src-tauri/src/helpers/theme.rs). */
export const DESKTOP_ICONS = [
    {
        id: 'default',
        name: '深鲸原版',
        description: 'DeepSeek 鲸鱼（白鲸/黑鲸跟随明暗主题）',
        url: '/api/dsh-hub/icons/default.png',
    },
    {
        id: 'whale-girl-sad',
        name: '鲸鱼娘·微光',
        description: '蓝色鲸鱼娘，安静伤感',
        url: '/api/dsh-hub/icons/whale-girl-sad.png',
    },
    {
        id: 'whale-girl-happy',
        name: '鲸鱼娘·干饭',
        description: '蓝发鲸鱼娘开心干饭',
        url: '/api/dsh-hub/icons/whale-girl-happy.png',
    },
    {
        id: 'whale-girl-duo',
        name: '鲸鱼娘·伴鲸',
        description: '鲸鱼娘与蓝色鲸鱼',
        url: '/api/dsh-hub/icons/whale-girl-duo.png',
    },
    {
        id: 'whale-girl-maid',
        name: '鲸鱼娘·女仆',
        description: '女仆装鲸鱼娘立绘',
        url: '/api/dsh-hub/icons/whale-girl-maid.png',
    },
    {
        id: 'whale-girl-blue',
        name: '鲸鱼娘·碧波',
        description: '蓝发少女与鲸鱼',
        url: '/api/dsh-hub/icons/whale-girl-blue.png',
    },
];
/** Find a desktop icon by id (includes the `default` entry). */
export function findDesktopIcon(id) {
    return DESKTOP_ICONS.find((icon) => icon.id === id);
}
