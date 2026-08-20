/**
 * dsh-hub settings card — one card in the dsh settings → plugins
 * page, styled after the official PluginCard (collapsible header, themed
 * controls, save/discard footer). It edits the shell config (window size,
 * theme, tray behavior) through this plugin's own HTTP routes.
 * Skins / background images / wallpapers are no longer owned here: the card
 * embeds the unified appearance center from the dsh-web-ui skin-center
 * plugin (`window.__dshAppearanceCenter__`), which persists to its own
 * `appearance` settings namespace and migrates this card's legacy
 * skin/background config once.
 *
 * The card renders only while the host serves the config API, which happens
 * only when the process was launched by this project (desktop shortcut /
 * `dsh-hub`); a plain command-line `dsh web` never mounts the bundle at all.
 */

import { useEffect, useRef, useState, type ReactNode } from 'react'
import clsx from 'clsx'
import { IconChevronDownOutline14 } from '@deepseek-ai/dsh-client-ui-primitives'
import { CARD_CSS_CLASSES as c } from './style.ts'

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
  appearanceSection: '外观中心',
  appearanceHint: '皮肤、背景图与壁纸已统一到 dsh-web-ui 的外观中心（原皮肤中心），以下直接嵌入其面板：',
  appearanceFallback: '未检测到外观中心（dsh-web-ui 皮肤中心未安装）。请安装 @linxin666/dsh-skins 后刷新页面，或在「设置 → 皮肤中心」操作。',
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

/** Render the desktop-shell settings card. */
export function DesktopSettingsCard(_props: DesktopSettingsCardProps): ReactNode {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [config, setConfig] = useState<ShellConfig | null>(null)
  const [draft, setDraft] = useState<ShellConfig | null>(null)
  const [saving, setSaving] = useState(false)
  const [failed, setFailed] = useState(false)
  const [saved, setSaved] = useState(false)
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
      setLoading(false)
    })
    return () => { alive = false }
  }, [])

  // Appearance center embed: mount the dsh-web-ui skin-center panel into
  // this card once the card opens (the panel persists to the appearance
  // settings namespace on its own), and migrate the hub's own persisted
  // skin/background (still in /api/dsh-hub/config) into the appearance
  // namespace once so existing hub users keep their look.
  const appearanceHostRef = useRef<HTMLDivElement | null>(null)
  const [appearanceAvailable, setAppearanceAvailable] = useState<boolean>(
    (window as unknown as { __dshAppearanceCenter__?: { available?: boolean } }).__dshAppearanceCenter__?.available === true,
  )
  useEffect(() => {
    if (!open || !appearanceAvailable) return
    const bridge = (window as unknown as {
      __dshAppearanceCenter__?: {
        mount?: (host: HTMLElement) => () => void
        api?: { migrateFromHub?: (skin?: string, background?: string) => void }
      }
    }).__dshAppearanceCenter__
    if (bridge === undefined || bridge.mount === undefined) {
      setAppearanceAvailable(false)
      return
    }
    const host = appearanceHostRef.current
    if (host === null) return
    const unmount = bridge.mount(host)
    const legacy = config as unknown as { skin?: string; background?: string } | null
    bridge.api?.migrateFromHub?.(legacy?.skin, legacy?.background)
    return () => { unmount() }
  }, [open, appearanceAvailable, config])

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
                  {/* Appearance center — embedded from the dsh-web-ui skin-center
                      plugin (unified skins / backgrounds / wallpapers). The panel
                      persists to the appearance settings namespace on its own. */}
                  <div className={c.section}>
                    <div className={c.sectionTitle}>{COPY.appearanceSection}</div>
                    <div className={c.hint}>{COPY.appearanceHint}</div>
                    {appearanceAvailable
                      ? <div ref={appearanceHostRef} className={c.appearanceHost} />
                      : <div className={c.hint}>{COPY.appearanceFallback}</div>}
                  </div>
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
