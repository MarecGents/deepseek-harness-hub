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

import { useEffect, useSyncExternalStore } from 'react'

/** Simplified Chinese dictionary — the key-set source of truth. */
export const zh = {
  'skin.name.midnight': '午夜蓝',
  'skin.name.paper': '旧纸张',
  'skin.name.terminal': '终端绿',
  'skin.name.zcode': 'ZCode',
  'skin.name.aurora': '极光紫',
  'skin.name.rx-noir-gold': '黑金',
  'skin.name.rx-crimson-horizon': '绯红地平线',
  'skin.name.rx-cyan-stage': '青蓝舞台',
  'skin.name.rx-fortune-forge': '熔炉金红',
  'skin.name.rx-rose-dawn': '玫瑰晨光',
  'skin.name.rx-sage-breeze': '鼠尾草微风',
  'skin.name.rx-spark-notebook': '火花笔记',
  'skin.name.rx-violet-starlight': '紫罗兰星光',
  'skin.name.oc-classic': 'opencode 经典',
  'skin.name.oc-graphite': 'opencode 石墨',
  'skin.desc.midnight': '深海蓝调，冷静专注',
  'skin.desc.paper': '暖黄米色，护眼复古',
  'skin.desc.terminal': '磷光绿，命令行质感',
  'skin.desc.zcode': '智谱 ZCode IDE 实测色板（浅色/深色）',
  'skin.desc.aurora': '紫罗兰辉光，梦幻渐变',
  'skin.desc.rx-noir-gold': 'Reasonix 官方 Noir Gold——暖纸金与墨黑鎏金',
  'skin.desc.rx-crimson-horizon': 'Reasonix 官方 Crimson Horizon——炽红地线，张力十足',
  'skin.desc.rx-cyan-stage': 'Reasonix 官方 Cyan Stage——冰川青蓝，冷静清晰',
  'skin.desc.rx-fortune-forge': 'Reasonix 官方 Fortune Forge——锻炉金红，炽热专注',
  'skin.desc.rx-rose-dawn': 'Reasonix 官方 Rose Dawn——玫瑰晨雾，柔和温暖',
  'skin.desc.rx-sage-breeze': 'Reasonix 官方 Sage Breeze——鼠尾草绿，自然清新',
  'skin.desc.rx-spark-notebook': 'Reasonix 官方 Spark Notebook——青瓷墨黑，专注书写',
  'skin.desc.rx-violet-starlight': 'Reasonix 官方 Violet Starlight——星辉紫韵，沉静深邃',
  'skin.desc.oc-classic': 'opencode 官方配方——近黑/近白中性底 + 鲜橙强调（#FF8C00 系）',
  'skin.desc.oc-graphite': 'opencode 石墨变体——暖灰中性底 + 炽橙强调（#E8590C 系）',
  'settings.skinSection': '界面皮肤',
  'settings.skinLabel': '界面皮肤',
  'settings.skinHint': '点击即应用并保存；「默认」恢复原生外观。深色模式下的皮肤跟随 dsh 主题设置',
  'settings.skinDefaultName': '默认',
  'settings.skinDefaultDesc': '官方原生外观',
  'settings.skinApplyFailed': '皮肤切换失败，请重试',
} satisfies Record<string, string>

/** The dictionary key union (kept complete by the `en` shape). */
export type HubKey = keyof typeof zh

/** English dictionary — checked complete against the zh key set. */
export const en: Record<HubKey, string> = {
  'skin.name.midnight': 'Midnight Blue',
  'skin.name.paper': 'Old Paper',
  'skin.name.terminal': 'Terminal Green',
  'skin.name.zcode': 'ZCode',
  'skin.name.aurora': 'Aurora',
  'skin.name.rx-noir-gold': 'Noir Gold',
  'skin.name.rx-crimson-horizon': 'Crimson Horizon',
  'skin.name.rx-cyan-stage': 'Cyan Stage',
  'skin.name.rx-fortune-forge': 'Fortune Forge',
  'skin.name.rx-rose-dawn': 'Rose Dawn',
  'skin.name.rx-sage-breeze': 'Sage Breeze',
  'skin.name.rx-spark-notebook': 'Spark Notebook',
  'skin.name.rx-violet-starlight': 'Violet Starlight',
  'skin.name.oc-classic': 'opencode Classic',
  'skin.name.oc-graphite': 'opencode Graphite',
  'skin.desc.midnight': 'Deep-sea blue, calm and focused',
  'skin.desc.paper': 'Warm ivory, vintage paper',
  'skin.desc.terminal': 'Phosphor green, command-line feel',
  'skin.desc.zcode': 'ZhiPu ZCode IDE measured palette (light/dark)',
  'skin.desc.aurora': 'Violet glow, dreamy gradient',
  'skin.desc.rx-noir-gold': 'Reasonix official Noir Gold — warm paper gold & ink black',
  'skin.desc.rx-crimson-horizon': 'Reasonix official Crimson Horizon — vivid red, high tension',
  'skin.desc.rx-cyan-stage': 'Reasonix official Cyan Stage — glacier cyan, calm & clear',
  'skin.desc.rx-fortune-forge': 'Reasonix official Fortune Forge — forge gold-red, blazing focus',
  'skin.desc.rx-rose-dawn': 'Reasonix official Rose Dawn — rose mist, soft & warm',
  'skin.desc.rx-sage-breeze': 'Reasonix official Sage Breeze — sage green, natural & fresh',
  'skin.desc.rx-spark-notebook': 'Reasonix official Spark Notebook — celadon ink, focused writing',
  'skin.desc.rx-violet-starlight': 'Reasonix official Violet Starlight — starlit violet, deep & quiet',
  'skin.desc.oc-classic': 'opencode official recipe — near-black/white neutral base + vivid orange (#FF8C00 family)',
  'skin.desc.oc-graphite': 'opencode graphite variant — warm gray base + ember orange (#E8590C family)',
  'settings.skinSection': 'Interface skin',
  'settings.skinLabel': 'Interface skin',
  'settings.skinHint': 'Click to apply and save; "Default" restores the native look. Dark mode skins follow the dsh theme setting',
  'settings.skinDefaultName': 'Default',
  'settings.skinDefaultDesc': 'Official native look',
  'settings.skinApplyFailed': 'Failed to switch skin, please retry',
}

/** Current locale id, cached from `<html lang>` (falls back to zh). */
function detectLang(): 'zh' | 'en' {
  return document.documentElement.lang?.toLowerCase().startsWith('en') ? 'en' : 'zh'
}

let lang: 'zh' | 'en' = detectLang()
const listeners = new Set<() => void>()

function notify(): void {
  for (const cb of listeners) cb()
}

/** Translate a key in the active language; `{name}` placeholders are filled from params. */
export function t(key: HubKey, params?: Record<string, string | number>): string {
  const dict = lang === 'en' ? en : zh
  let text = dict[key] ?? zh[key] ?? key
  if (params !== undefined) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replaceAll(`{${k}}`, String(v))
    }
  }
  return text
}

/** Subscribe to locale changes; returns an unsubscribe function. */
export function subscribeLocale(cb: () => void): () => void {
  listeners.add(cb)
  return () => { listeners.delete(cb) }
}

/** Re-sync the cached locale from `<html lang>`. */
export function getLocaleLang(): string {
  return lang
}

// The official locale plugin owns `<html lang>`; observe it so a switch in
// Settings → General → Language re-renders every hub surface immediately.
const observer = new MutationObserver(() => {
  const next = detectLang()
  if (next !== lang) {
    lang = next
    notify()
  }
})
observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] })

/** React hook: the current locale lang (re-renders on switch). */
export function useLocaleLang(): string {
  useSyncExternalStore(subscribeLocale, getLocaleLang, getLocaleLang)
  return lang
}

/** Skin display helper: dictionary name/desc with legacy fallback. */
export function skinText(key: HubKey | undefined, fallback: string): string {
  return key === undefined ? fallback : t(key)
}