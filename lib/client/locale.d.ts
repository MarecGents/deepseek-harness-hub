/**
 * dsh-hub client dictionary + locale plumbing.
 *
 * Language source: the official dsh locale plugin writes the active locale to
 * `document.documentElement.lang` — the same settings surface (Settings →
 * General → Language) drives every consumer, including the standalone
 * usage-stats plugin (which reuses this key convention with its own
 * dictionaries). Copy flows through `t()` so a locale switch hands every
 * consumer the active language; React consumers re-render via
 * `useLocaleLang()`, native-DOM modules resolve `t()` at open time.
 *
 * @module dsh-hub/client/locale
 */
/** Simplified Chinese dictionary — the key-set source of truth. */
export declare const zh: {
    'skin.name.midnight': string;
    'skin.name.paper': string;
    'skin.name.terminal': string;
    'skin.name.zcode': string;
    'skin.name.aurora': string;
    'skin.name.rx-noir-gold': string;
    'skin.name.rx-crimson-horizon': string;
    'skin.name.rx-cyan-stage': string;
    'skin.name.rx-fortune-forge': string;
    'skin.name.rx-rose-dawn': string;
    'skin.name.rx-sage-breeze': string;
    'skin.name.rx-spark-notebook': string;
    'skin.name.rx-violet-starlight': string;
    'skin.name.oc-classic': string;
    'skin.name.oc-graphite': string;
    'skin.desc.midnight': string;
    'skin.desc.paper': string;
    'skin.desc.terminal': string;
    'skin.desc.zcode': string;
    'skin.desc.aurora': string;
    'skin.desc.rx-noir-gold': string;
    'skin.desc.rx-crimson-horizon': string;
    'skin.desc.rx-cyan-stage': string;
    'skin.desc.rx-fortune-forge': string;
    'skin.desc.rx-rose-dawn': string;
    'skin.desc.rx-sage-breeze': string;
    'skin.desc.rx-spark-notebook': string;
    'skin.desc.rx-violet-starlight': string;
    'skin.desc.oc-classic': string;
    'skin.desc.oc-graphite': string;
    'settings.skinSection': string;
    'settings.skinLabel': string;
    'settings.skinHint': string;
    'settings.skinDefaultName': string;
    'settings.skinDefaultDesc': string;
    'settings.skinApplyFailed': string;
    'settings.title': string;
    'settings.description': string;
    'settings.unsaved': string;
    'settings.readOnly': string;
    'settings.windowSection': string;
    'settings.widthLabel': string;
    'settings.heightLabel': string;
    'settings.themeLabel': string;
    'settings.themeSystem': string;
    'settings.themeLight': string;
    'settings.themeDark': string;
    'settings.themeHint': string;
    'settings.minimizeLabel': string;
    'settings.minimizeHint': string;
    'settings.closeLabel': string;
    'settings.closeHint': string;
    'settings.notifyLabel': string;
    'settings.notifyHint': string;
    'settings.soundLabel': string;
    'settings.soundHint': string;
    'settings.multiInstanceLabel': string;
    'settings.multiInstanceDanger': string;
    'settings.multiInstanceHint': string;
    'settings.backgroundSection': string;
    'settings.backgroundLabel': string;
    'settings.backgroundHint': string;
    'settings.backgroundDefaultName': string;
    'settings.backgroundDefaultDesc': string;
    'settings.backgroundApplyFailed': string;
    'settings.desktopIconSection': string;
    'settings.desktopIconHint': string;
    'settings.desktopIconApplyFailed': string;
    'settings.discard': string;
    'settings.save': string;
    'settings.saving': string;
    'settings.saveFailed': string;
    'settings.saved': string;
    'menu.openSession': string;
    'menu.pin': string;
    'menu.unpin': string;
    'menu.rename': string;
    'menu.fork': string;
    'menu.archive': string;
    'menu.openInExplorer': string;
    'menu.copyPath': string;
    'menu.pinTask': string;
    'menu.unpinTask': string;
    'menu.renameTask': string;
    'menu.forkSession': string;
    'menu.archiveSession': string;
    'menu.copyWorkspacePath': string;
    'menu.copyLogPath': string;
    'menu.copySessionId': string;
    'menu.gotoConfig': string;
    'menu.refresh': string;
    'ws.newTask': string;
    'ws.openWorkspace': string;
};
/** The dictionary key union (kept complete by the `en` shape). */
export type HubKey = keyof typeof zh;
/** English dictionary — checked complete against the zh key set. */
export declare const en: Record<HubKey, string>;
/** Translate a key in the active language; `{name}` placeholders are filled from params. */
export declare function t(key: HubKey, params?: Record<string, string | number>): string;
/** Subscribe to locale changes; returns an unsubscribe function. */
export declare function subscribeLocale(cb: () => void): () => void;
/** Re-sync the cached locale from `<html lang>`. */
export declare function getLocaleLang(): string;
/** React hook: the current locale lang (re-renders on switch). */
export declare function useLocaleLang(): string;
/** Skin display helper: dictionary name/desc with legacy fallback. */
export declare function skinText(key: HubKey | undefined, fallback: string): string;
