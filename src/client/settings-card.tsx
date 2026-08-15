/**
 * mg-dsh-desktop settings card — one card in the dsh settings → plugins
 * page, styled after the official PluginCard (collapsible header, themed
 * controls, save/discard footer). It edits the shell config (window size,
 * theme, tray behavior) through this plugin's own HTTP routes, and shows the
 * usage-stats ledger.
 *
 * The card renders only while the host serves the config API, which happens
 * only when the process was launched by this project (desktop shortcut /
 * `mg-dsh`); a plain command-line `dsh web` never mounts the bundle at all.
 */

import { useEffect, useState, type ReactNode } from 'react'
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
}

/** Localized copy kept inline (the card is small; no locale plugin needed). */
const COPY = {
  title: 'Marec-DSH-Plugin',
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
  discard: '放弃',
  save: '保存',
  saving: '保存中…',
  saveFailed: '保存失败，请重试',
  saved: '已保存',
}

/** Read one shell config document (GET), or null on failure. */
async function fetchConfig(): Promise<ShellConfig | null> {
  try {
    const res = await fetch('/api/mg-dsh-desktop/config')
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
    const res = await fetch('/api/mg-dsh-desktop/config', {
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

  // Load the config once on mount. The width/height fields seed from the
  // window's ACTUAL current size (the SPA viewport ≈ the native client area),
  // not the stale stored value — the user sees the real resolution.
  useEffect(() => {
    let alive = true
    void fetchConfig().then((value) => {
      if (!alive) return
      setConfig(value)
      setDraft(value === null
        ? null
        : { ...value, width: window.innerWidth, height: window.innerHeight })
      setLoading(false)
    })
    return () => { alive = false }
  }, [])

  const dirty = draft !== null && config !== null
    && (draft.width !== config.width
      || draft.height !== config.height
      || draft.theme !== config.theme
      || draft.minimizeToTray !== config.minimizeToTray
      || draft.closeToTray !== config.closeToTray)
  const blocked = !dirty || saving || draft === null

  const patchDraft = (patch: Partial<ShellConfig>): void => {
    setFailed(false)
    setSaved(false)
    setDraft((prev) => prev === null ? prev : { ...prev, ...patch })
  }

  const onSave = (): void => {
    if (draft === null) return
    setSaving(true)
    setFailed(false)
    setSaved(false)
    void saveConfig({
      width: draft.width,
      height: draft.height,
      theme: draft.theme,
      minimizeToTray: draft.minimizeToTray,
      closeToTray: draft.closeToTray,
    }).then((saved) => {
      setSaving(false)
      if (saved !== null) {
        setConfig(saved)
        setDraft(saved)
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
                    </div>
                  )}
                </>
              )}
            {failed ? <p className={c.failed} role="status">{COPY.saveFailed}</p> : null}
            {saved ? <p className={c.saved} role="status">{COPY.saved}</p> : null}
            <div className={c.footer}>
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
