/**
 * dsh-hub settings card — one card in the dsh settings → plugins
 * page, styled after the official PluginCard (collapsible header, themed
 * controls, save/discard footer). It edits the shell config (window size,
 * theme, tray behavior) through this plugin's own HTTP routes, and shows the
 * usage-stats ledger.
 *
 * The card renders only while the host serves the config API, which happens
 * only when the process was launched by this project (desktop shortcut /
 * `dsh-hub`); a plain command-line `dsh web` never mounts the bundle at all.
 */

import { Fragment, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import clsx from 'clsx'
import { IconChevronDownOutline14, Menu } from '@deepseek-ai/dsh-client-ui-primitives'
import { CARD_CSS_CLASSES as c } from './style.ts'
import { SKINS, DEFAULT_SKIN_ID, applySkin, markSkinUserPicked, type DshSkin } from './skins.ts'
import { BACKGROUNDS, DEFAULT_BACKGROUND_ID, applyBackground, markBackgroundUserPicked } from './backgrounds.ts'
import { refreshConversationRailPalette } from './conversation-rail.ts'
import { DESKTOP_ICONS, DEFAULT_DESKTOP_ICON_ID } from './desktop-icons.ts'

/** Owner share of a plugin card (the section supplies nothing). */
export interface DesktopSettingsCardProps {
  /** Marker field: card owner props are intentionally empty. */
  children?: never
}

/** Config document the card reads and writes (mirrors the host ShellConfig). */
interface ShellConfig {
  windowOpen: 'auto' | 'manual'
  width: number
  height: number
  theme: 'system' | 'light' | 'dark'
  minimizeToTray: boolean
  closeToTray: boolean
  notifyOnTaskComplete: boolean
  soundEnabled: boolean
  allowMultipleInstances: boolean
  skin: string
  background: string
  desktopIcon: string
}

/** Localized copy kept inline (the card is small; no locale plugin needed). */
const COPY = {
  title: 'DSH HUB 设置',
  description: '桌面壳配置：窗口尺寸、主题与托盘行为',
  unsaved: '未保存',
  readOnly: '当前文档只读，无法保存',
  windowSection: '窗口设置',
  widthLabel: '宽度 (px)',
  heightLabel: '高度 (px)',
  themeLabel: '主题',
  themeOptions: { system: '跟随 dsh 主题', light: '浅色', dark: '深色' } as const,
  themeHint: '跟随 dsh 主题：dsh 设为深色窗口即深色，设为浅色窗口即浅色',
  minimizeLabel: '最小化到托盘',
  minimizeHint: '最小化时隐藏到系统托盘，任务栏入口消失',
  closeLabel: '关闭到托盘',
  closeHint: '点 X 关闭窗口时保持进程与托盘存活（不勾选则完全退出）',
  notifyLabel: '会话完成通知',
  notifyHint: '任务回合完成时弹出系统通知',
  soundLabel: '提示音',
  soundHint: '用户提问、任务完成、AI 请求批准或任务出错时播放提示音（与系统通知互相独立）',
  multiInstanceLabel: '允许同时运行多个 dsh 实例',
  multiInstanceDanger:
    '⚠ 危险：多个 dsh 实例共享同一份会话数据（$DSH_HOME），' +
    '若同时在同一个会话中操作，会导致会话日志损坏（seq 冲突），' +
    '可能丢失对话内容且需要手工修复。强烈不建议开启。',
  multiInstanceHint: '不勾选时，若检测到已有 dsh 在运行，桌面壳将拒绝启动以保护数据',
  skinSection: '界面皮肤',
  skinLabel: '界面皮肤',
  skinHint: '点击即应用并保存；「默认」恢复原生外观。深色模式下的皮肤跟随 dsh 主题设置',
  skinDefaultName: '默认',
  skinDefaultDesc: '官方原生外观',
  skinApplyFailed: '皮肤切换失败，请重试',
  backgroundSection: '背景图',
  backgroundLabel: '背景图',
  backgroundHint: '点击即应用并保存；「无」关闭背景图，恢复原生/皮肤背景',
  backgroundDefaultName: '无',
  backgroundDefaultDesc: '不显示背景图',
  backgroundApplyFailed: '背景切换失败，请重试',
  desktopIconSection: '桌面图标',
  desktopIconHint: '点击即保存并应用到窗口标题栏与任务栏图标；「深鲸原版」为官方鲸鱼（跟随明暗主题）',
  desktopIconApplyFailed: '图标切换失败，请重试',
  discard: '放弃',
  save: '保存',
  saving: '保存中…',
  saveFailed: '保存失败，请重试',
  saved: '已保存',
}

/** Read one shell config document (GET), or null on failure. */
async function fetchConfig(): Promise<ShellConfig | null> {
  try {
    const res = await fetch('/api/dsh-hub/config')
    if (!res.ok) return null
    const body = (await res.json()) as { ok?: boolean; value?: ShellConfig }
    return body.ok === true && body.value !== undefined ? body.value : null
  } catch {
    return null
  }
}

/** Write the shell config document (POST); returns the persisted value. */
async function saveConfig(patch: Partial<ShellConfig>): Promise<ShellConfig | null> {
  try {
    const res = await fetch('/api/dsh-hub/config', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(patch),
    })
    const body = (await res.json()) as { ok?: boolean; value?: ShellConfig }
    return res.ok && body.ok === true && body.value !== undefined ? body.value : null
  } catch {
    return null
  }
}

/**
 * Fire the Tauri `set_desktop_icon` invoke down-link from the page
 * (D-2 channel: page → Rust via `__TAURI_INTERNALS__`, gated by the
 * `allow-set-desktop-icon` ACL entry; the host config onChange re-applies
 * through the DSH_CMD up-link as a fallback). Best-effort: when the bridge is
 * absent (plain browser / dev-server detached from the shell) the icon still
 * applies on next startup from the persisted config.
 */
function invokeDesktopIcon(iconId: string): void {
  try {
    const internals = (window as unknown as {
      __TAURI_INTERNALS__?: { invoke?: (c: string, a?: Record<string, unknown>) => Promise<unknown> }
    }).__TAURI_INTERNALS__
    internals?.invoke?.('set_desktop_icon', { iconId }).catch?.(() => {})
  } catch {
    // Best-effort; a failed page invoke must never break the settings save.
  }
}

/**
 * Group the built-in skins by source for the gallery (the group label derives
 * from the id prefix — rx- = Reasonix series, oc- = opencode series, anything
 * else = the original in-house series). Stable order: in-house first, then the
 * two ported series in the order they were created.
 */
function skinGroupsOf(skins: DshSkin[]): Array<{ label: string; skins: DshSkin[] }> {
  const bySource: Record<string, DshSkin[]> = {}
  for (const skin of skins) {
    const group = skin.id.startsWith('rx-') ? 'Reasonix 系列'
      : skin.id.startsWith('oc-') ? 'opencode 系列'
      : '内置系列'
    ;(bySource[group] ??= []).push(skin)
  }
  return ['内置系列', 'Reasonix 系列', 'opencode 系列']
    .filter((label) => bySource[label] !== undefined)
    .map((label) => ({ label, skins: bySource[label] ?? [] }))
}

/** Mini light|dark split preview of a skin, colored by its own palette. */
function SkinSwatch({ skin }: { skin: DshSkin }): ReactNode {
  const half = (mode: 'light' | 'dark'): CSSProperties => ({
    background: skin[mode]['bg-base'],
  })
  return (
    <span className={c.skinSwatch} aria-hidden="true">
      <span className={c.swatchHalf} style={half('light')}>
        <span className={c.swatchDot} style={{ background: skin.light['label-primary'] }} />
        <span className={c.swatchBar} style={{ background: skin.light['brand-primary'] }} />
      </span>
      <span className={c.swatchHalf} style={half('dark')}>
        <span className={c.swatchDot} style={{ background: skin.dark['label-primary'] }} />
        <span className={c.swatchBar} style={{ background: skin.dark['brand-primary'] }} />
      </span>
    </span>
  )
}

/** Render the desktop-shell settings card. */
export function DesktopSettingsCard(_props: DesktopSettingsCardProps): ReactNode {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [config, setConfig] = useState<ShellConfig | null>(null)
  const [draft, setDraft] = useState<ShellConfig | null>(null)
  const [saving, setSaving] = useState(false)
  const [failed, setFailed] = useState(false)
  const [saved, setSaved] = useState(false)
  const [skinId, setSkinId] = useState<string>(DEFAULT_SKIN_ID)
  const [skinFailed, setSkinFailed] = useState(false)
  const [backgroundId, setBackgroundId] = useState<string>(DEFAULT_BACKGROUND_ID)
  const [backgroundFailed, setBackgroundFailed] = useState(false)
  const [backgroundMenuOpen, setBackgroundMenuOpen] = useState(false)
  const [desktopIconId, setDesktopIconId] = useState<string>(DEFAULT_DESKTOP_ICON_ID)
  const [desktopIconFailed, setDesktopIconFailed] = useState(false)
  // B7: monotonic request sequence — only the LATEST config write's response
  // may commit state; a slow older response must not clobber a newer one
  // (overlapping onSave + skin pick, or two quick skin picks).
  const saveSeq = useRef(0)

  // Load the config once on mount. The width/height fields seed from the
  // window's ACTUAL current size (the SPA viewport ≈ the native client area),
  // not the stale stored value — the user sees the real resolution. Both
  // `config` and `draft` use this initial value so the card starts clean and
  // the save button is disabled until the user actually changes something.
  useEffect(() => {
    let alive = true
    void fetchConfig().then((value) => {
      if (!alive) return
      const initial = value === null
        ? null
        : { ...value, width: window.innerWidth, height: window.innerHeight }
      setConfig(initial)
      setDraft(initial)
      setSkinId(initial === null ? DEFAULT_SKIN_ID : initial.skin)
      setBackgroundId(initial === null ? DEFAULT_BACKGROUND_ID : initial.background)
      setDesktopIconId(initial === null || typeof initial.desktopIcon !== 'string' ? DEFAULT_DESKTOP_ICON_ID : initial.desktopIcon)
      setLoading(false)
    })
    return () => { alive = false }
  }, [])

  const dirty = draft !== null && config !== null
    && (draft.width !== config.width
      || draft.height !== config.height
      || draft.theme !== config.theme
      || draft.minimizeToTray !== config.minimizeToTray
      || draft.closeToTray !== config.closeToTray
      || draft.notifyOnTaskComplete !== config.notifyOnTaskComplete
      || draft.soundEnabled !== config.soundEnabled
      || draft.allowMultipleInstances !== config.allowMultipleInstances)
  const blocked = !dirty || saving || draft === null

  const patchDraft = (patch: Partial<ShellConfig>): void => {
    setFailed(false)
    setSaved(false)
    setDraft((prev) => prev === null ? prev : { ...prev, ...patch })
  }

  const onSave = (): void => {
    if (draft === null || config === null) return
    // Only send fields the user actually changed. In particular, width/height
    // must not be submitted just because the window is maximized and the card
    // seeded them from the maximized client area.
    const patch: Partial<ShellConfig> = {}
    if (draft.width !== config.width) patch.width = draft.width
    if (draft.height !== config.height) patch.height = draft.height
    if (draft.theme !== config.theme) patch.theme = draft.theme
    if (draft.minimizeToTray !== config.minimizeToTray) patch.minimizeToTray = draft.minimizeToTray
    if (draft.closeToTray !== config.closeToTray) patch.closeToTray = draft.closeToTray
    if (draft.notifyOnTaskComplete !== config.notifyOnTaskComplete) patch.notifyOnTaskComplete = draft.notifyOnTaskComplete
    if (draft.soundEnabled !== config.soundEnabled) patch.soundEnabled = draft.soundEnabled
    if (draft.allowMultipleInstances !== config.allowMultipleInstances) patch.allowMultipleInstances = draft.allowMultipleInstances
    if (Object.keys(patch).length === 0) return
    const seq = ++saveSeq.current
    setSaving(true)
    setFailed(false)
    setSaved(false)
    void saveConfig(patch).then((saved) => {
      if (seq !== saveSeq.current) return // superseded by a newer write
      setSaving(false)
      if (saved !== null) {
        setConfig(saved)
        // Replay the submitted patch over the server response so the user's
        // change is never silently reverted when the response omits a field
        // (stale host build, whitelist miss, config write war). `config`
        // keeps server truth, so a genuinely dropped field still shows as
        // unsaved (dirty badge + enabled save button) instead of vanishing.
        // Width/height are clamped to the SAME bounds the server applies, so a
        // hand-typed out-of-range value (e.g. 9000) can never make the draft
        // permanently differ from the persisted value (永久 dirty bug).
        const replay = { ...patch }
        if (typeof replay.width === 'number') replay.width = Math.floor(Math.min(Math.max(replay.width, 480), 7680))
        if (typeof replay.height === 'number') replay.height = Math.floor(Math.min(Math.max(replay.height, 360), 4320))
        setDraft({ ...saved, ...replay })
        setSaved(true)
      } else {
        setFailed(true)
      }
    })
  }

  const onDiscard = (): void => {
    setDraft(config)
    setFailed(false)
    setSaved(false)
  }

  /** Apply a skin immediately: persist, then restyle the page live. */
  const onPickSkin = (id: string): void => {
    if (id === skinId) return
    // Capture the last-good value so a failed persist rolls back to it (not to
    // 'default', which would leave the UI showing default while config still
    // holds the previous skin).
    const previous = skinId
    // A user pick must never be clobbered by the boot skin restore (B8).
    markSkinUserPicked()
    setSkinFailed(false)
    setSkinId(id)
    applySkin(id)
    refreshConversationRailPalette() // surface tokens changed — re-derive rail colors
    const seq = ++saveSeq.current
    void saveConfig({ skin: id }).then((value) => {
      // Superseded by a newer pick/save — never roll back a newer pick (B7).
      if (seq !== saveSeq.current) return
      if (value !== null) {
        setConfig((prev) => prev === null ? prev : { ...prev, skin: id })
        setDraft((prev) => prev === null ? prev : { ...prev, skin: id })
        setSaving(false)
      } else {
        // Roll back the live style to the last-good value.
        applySkin(previous)
        refreshConversationRailPalette()
        setSkinId(previous)
        setSkinFailed(true)
        setSaving(false)
      }
    })
  }

  /** Apply a background immediately: persist, then restyle the page live. */
  const onPickBackground = (id: string): void => {
    if (id === backgroundId) return
    // Last-good value for a failed-persist rollback (not 'none').
    const previous = backgroundId
    // A user pick must never be clobbered by the boot background restore.
    markBackgroundUserPicked()
    setBackgroundFailed(false)
    setBackgroundId(id)
    applyBackground(id)
    refreshConversationRailPalette() // backdrop image changed — re-derive rail colors
    const seq = ++saveSeq.current
    setSaving(true) // mirror onSave: only the latest write clears the flag
    void saveConfig({ background: id }).then((value) => {
      // Superseded by a newer pick/save — never roll back a newer pick (B7).
      if (seq !== saveSeq.current) return
      if (value !== null) {
        setConfig((prev) => prev === null ? prev : { ...prev, background: id })
        setDraft((prev) => prev === null ? prev : { ...prev, background: id })
        setSaving(false)
      } else {
        // Roll back the live style to the last-good value.
        applyBackground(previous)
        refreshConversationRailPalette()
        setBackgroundId(previous)
        setBackgroundFailed(true)
        setSaving(false)
      }
    })
  }

  /** Apply a desktop icon immediately: invoke the shell + persist the id.
   * The window/taskbar glyph is re-applied live; unknown ids fall back to the
   * white whale on the Rust side. */
  const onPickDesktopIcon = (id: string): void => {
    if (id === desktopIconId) return
    // Last-good value for a failed-persist rollback (not 'default').
    const previous = desktopIconId
    setDesktopIconFailed(false)
    setDesktopIconId(id)
    // Live apply through the page → Rust invoke down-link (D-2); the host
    // config onChange (DSH_CMD) and next startup re-apply the same id.
    invokeDesktopIcon(id)
    const seq = ++saveSeq.current
    setSaving(true)
    void saveConfig({ desktopIcon: id }).then((value) => {
      // Superseded by a newer pick/save — never roll back a newer pick (B7).
      if (seq !== saveSeq.current) return
      if (value !== null) {
        setConfig((prev) => prev === null ? prev : { ...prev, desktopIcon: id })
        setDraft((prev) => prev === null ? prev : { ...prev, desktopIcon: id })
        setSaving(false)
      } else {
        // Persist failed — keep the UI honest: restore the previous selection.
        setDesktopIconId(previous)
        setDesktopIconFailed(true)
        setSaving(false)
      }
    })
  }

  return (
    <li className={clsx(c.card, open && c.cardOpen)}>
      <button
        type="button"
        className={c.header}
        aria-expanded={open}
        aria-label={`${open ? '收起' : '展开'}: ${COPY.title}`}
        onClick={() => { setOpen(!open) }}
      >
        <span className={c.headText}>
          <span className={c.name}>{COPY.title}</span>
          <span className={c.description}>{COPY.description}</span>
        </span>
        {dirty ? <span className={c.pending}>{COPY.unsaved}</span> : null}
        <IconChevronDownOutline14 className={clsx(c.chevron, open && c.chevronOpen)} />
      </button>
      {open
        ? (
          <div className={c.body}>
            {loading
              ? <div className={c.loading} role="status" aria-label="读取配置…" />
              : (
                <>
                  {/* Window settings */}
                  {draft !== null && (
                    <div className={c.section}>
                      <div className={c.sectionTitle}>{COPY.windowSection}</div>
                      <div className={c.field}>
                        <span className={c.fieldLabel}>{COPY.widthLabel}</span>
                        <input
                          className={c.input}
                          type="number"
                          min={480}
                          max={Math.floor(window.screen.width)}
                          aria-label={COPY.widthLabel}
                          value={draft.width}
                          onChange={(event) => {
                            const width = Number(event.target.value)
                            patchDraft({ width: Number.isFinite(width) ? Math.floor(width) : draft.width })
                          }}
                        />
                      </div>
                      <div className={c.field}>
                        <span className={c.fieldLabel}>{COPY.heightLabel}</span>
                        <input
                          className={c.input}
                          type="number"
                          min={360}
                          max={Math.floor(window.screen.height)}
                          aria-label={COPY.heightLabel}
                          value={draft.height}
                          onChange={(event) => {
                            const height = Number(event.target.value)
                            patchDraft({ height: Number.isFinite(height) ? Math.floor(height) : draft.height })
                          }}
                        />
                      </div>
                      <div className={c.field}>
                        <span className={c.fieldLabel}>{COPY.themeLabel}</span>
                        <select
                          className={c.select}
                          aria-label={COPY.themeLabel}
                          value={draft.theme}
                          onChange={(event) => {
                            const theme = event.target.value as ShellConfig['theme']
                            if (theme === 'system' || theme === 'light' || theme === 'dark') patchDraft({ theme })
                          }}
                        >
                          <option value="system">{COPY.themeOptions.system}</option>
                          <option value="light">{COPY.themeOptions.light}</option>
                          <option value="dark">{COPY.themeOptions.dark}</option>
                        </select>
                        <div className={c.hint}>{COPY.themeHint}</div>
                      </div>
                      <label className={c.checkboxRow}>
                        <input
                          type="checkbox"
                          checked={draft.minimizeToTray}
                          onChange={(event) => patchDraft({ minimizeToTray: event.target.checked })}
                        />
                        <span>{COPY.minimizeLabel}</span>
                      </label>
                      <div className={c.hint}>{COPY.minimizeHint}</div>
                      <label className={c.checkboxRow}>
                        <input
                          type="checkbox"
                          checked={draft.closeToTray}
                          onChange={(event) => patchDraft({ closeToTray: event.target.checked })}
                        />
                        <span>{COPY.closeLabel}</span>
                      </label>
                      <div className={c.hint}>{COPY.closeHint}</div>
                      <label className={c.checkboxRow}>
                        <input
                          type="checkbox"
                          checked={draft.notifyOnTaskComplete}
                          onChange={(event) => patchDraft({ notifyOnTaskComplete: event.target.checked })}
                        />
                        <span>{COPY.notifyLabel}</span>
                      </label>
                      <div className={c.hint}>{COPY.notifyHint}</div>
                      <label className={c.checkboxRow}>
                        <input
                          type="checkbox"
                          checked={draft.soundEnabled}
                          onChange={(event) => patchDraft({ soundEnabled: event.target.checked })}
                        />
                        <span>{COPY.soundLabel}</span>
                      </label>
                      <div className={c.hint}>{COPY.soundHint}</div>
                      <label className={c.checkboxRow}>
                        <input
                          type="checkbox"
                          checked={draft.allowMultipleInstances}
                          onChange={(event) => patchDraft({ allowMultipleInstances: event.target.checked })}
                        />
                        <span>{COPY.multiInstanceLabel}</span>
                      </label>
                      {draft.allowMultipleInstances
                        ? <div className={c.dangerHint} role="alert">{COPY.multiInstanceDanger}</div>
                        : <div className={c.hint}>{COPY.multiInstanceHint}</div>}
                    </div>
                  )}
                  {/* Skin gallery — "默认" (native look) first, then grouped
                      swatch cells (light|dark split preview); one click
                      applies + persists, like the desktop-icon grid. */}
                  {draft !== null && (
                    <div className={c.section}>
                      <div className={c.sectionTitle}>{COPY.skinSection}</div>
                      <div className={c.skinGrid} role="radiogroup" aria-label={COPY.skinLabel}>
                        <button
                          key={DEFAULT_SKIN_ID}
                          type="button"
                          role="radio"
                          aria-checked={skinId === DEFAULT_SKIN_ID}
                          className={clsx(c.iconCell, skinId === DEFAULT_SKIN_ID && c.iconSelected)}
                          onClick={() => { onPickSkin(DEFAULT_SKIN_ID) }}
                          title={COPY.skinDefaultDesc}
                        >
                          <span className={clsx(c.skinSwatch, c.skinSwatchDefault)} />
                          <span className={c.iconName}>{COPY.skinDefaultName}</span>
                        </button>
                        {skinGroupsOf(SKINS).map((group) => (
                          <Fragment key={group.label}>
                            <div className={c.skinGroup}>{group.label}</div>
                            {group.skins.map((skin) => (
                              <button
                                key={skin.id}
                                type="button"
                                role="radio"
                                aria-checked={skinId === skin.id}
                                className={clsx(c.iconCell, skinId === skin.id && c.iconSelected)}
                                onClick={() => { onPickSkin(skin.id) }}
                                title={skin.description}
                              >
                                <SkinSwatch skin={skin} />
                                <span className={c.iconName}>{skin.name}</span>
                              </button>
                            ))}
                          </Fragment>
                        ))}
                      </div>
                      <div className={c.hint}>
                        {skinId === DEFAULT_SKIN_ID
                          ? COPY.skinDefaultDesc
                          : (SKINS.find((skin) => skin.id === skinId)?.description ?? '')}
                        {' — '}{COPY.skinHint}
                      </div>
                      {skinFailed ? <p className={c.failed} role="status">{COPY.skinApplyFailed}</p> : null}
                    </div>
                  )}
                  {/* Background picker — official Setting-Cell row like the skin picker. */}
                  {draft !== null && (
                    <div className={c.section}>
                      <div className={c.sectionTitle}>{COPY.backgroundSection}</div>
                      <div className={c.fieldRow}>
                        <span className={c.fieldLabel}>{COPY.backgroundLabel}</span>
                        <Menu
                          open={backgroundMenuOpen}
                          onClose={() => { setBackgroundMenuOpen(false) }}
                          items={[
                            { id: DEFAULT_BACKGROUND_ID, label: COPY.backgroundDefaultName },
                            ...BACKGROUNDS.map((background) => ({ id: background.id, label: background.name })),
                          ]}
                          selectedId={backgroundId}
                          onSelect={(id) => {
                            onPickBackground(id)
                            setBackgroundMenuOpen(false)
                          }}
                          align="end"
                          portal
                          anchor={(
                            <button
                              type="button"
                              className={c.selectPill}
                              aria-haspopup="menu"
                              aria-expanded={backgroundMenuOpen}
                              onClick={() => { setBackgroundMenuOpen(v => !v) }}
                            >
                              {backgroundId === DEFAULT_BACKGROUND_ID
                                ? COPY.backgroundDefaultName
                                : (BACKGROUNDS.find((background) => background.id === backgroundId)?.name ?? backgroundId)}
                              <IconChevronDownOutline14 />
                            </button>
                          )}
                        />
                      </div>
                      <div className={c.hint}>
                        {backgroundId === DEFAULT_BACKGROUND_ID
                          ? COPY.backgroundDefaultDesc
                          : (BACKGROUNDS.find((background) => background.id === backgroundId)?.description ?? '')}
                        {' — '}{COPY.backgroundHint}
                      </div>
                      {backgroundFailed ? <p className={c.failed} role="status">{COPY.backgroundApplyFailed}</p> : null}
                    </div>
                  )}
                  {/* Desktop icon picker — visual grid of preview thumbnails
                      (S6). One click applies + persists; the native window and
                      taskbar glyph switch immediately via the Tauri invoke
                      down-link, unknown ids fall back to the white whale. */}
                  {draft !== null && (
                    <div className={c.section}>
                      <div className={c.sectionTitle}>{COPY.desktopIconSection}</div>
                      <div className={c.hint}>{COPY.desktopIconHint}</div>
                      <div className={c.iconGrid} role="radiogroup" aria-label={COPY.desktopIconSection}>
                        {DESKTOP_ICONS.map((icon) => (
                          <button
                            key={icon.id}
                            type="button"
                            role="radio"
                            aria-checked={desktopIconId === icon.id}
                            className={clsx(c.iconCell, desktopIconId === icon.id && c.iconSelected)}
                            onClick={() => { onPickDesktopIcon(icon.id) }}
                            title={`${icon.name} — ${icon.description}`}
                          >
                            <img
                              className={c.iconPreview}
                              src={icon.url}
                              alt={icon.name}
                              width={56}
                              height={56}
                              draggable={false}
                            />
                            <span className={c.iconName}>{icon.name}</span>
                          </button>
                        ))}
                      </div>
                      {desktopIconFailed ? <p className={c.failed} role="status">{COPY.desktopIconApplyFailed}</p> : null}
                    </div>
                  )}
                </>
              )}
            <div className={c.footer}>
              {failed ? <p className={c.failed} role="status">{COPY.saveFailed}</p> : null}
              {saved ? <p className={c.saved} role="status">{COPY.saved}</p> : null}
              <button type="button" className={c.discard} disabled={blocked} onClick={onDiscard}>
                {COPY.discard}
              </button>
              <button type="button" className={c.save} disabled={blocked} onClick={onSave}>
                {COPY[saving ? 'saving' : 'save']}
              </button>
            </div>
          </div>
        )
        : null}
    </li>
  )
}
