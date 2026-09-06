/**
 * dsh-hub model selector — replaces the official composer model seat.
 *
 * Module category: client UI component.
 * Responsibility: render the composer model seat (`conversation.input.model`)
 * as TWO adjacent trigger buttons — left opens the provider -> model list,
 * right opens the thinking-effort list (PR #33 layout). Both share one
 * popup menu with three panes (providers / model / effort). The selector
 * uses the shared per-session model directory for every selection, so state
 * stays consistent with the /model command. When a custom model has no
 * reasoning metadata yet, the effort pane can declare the standard levels
 * through the official `llm-pi-ai` settings scope; the host then rebuilds
 * the catalog and the same pane shows the host-validated effort choices.
 */

import { Component, useCallback, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import clsx from 'clsx'
import {
  IconCheckOutline16,
  IconChevronDownOutline14,
  IconChevronLeftOutline14,
  IconChevronRightOutline14,
  IconWarningOutline16,
  Toast,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { Context as ClientContext } from '@deepseek-ai/cordis'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface SlotMap {
    'conversation.input.model': { kind: 'single'; scope: 'session'; owner: { locked?: boolean } }
  }
}

const CSS = [
  '._dshnms_root{min-width:0;position:relative}',
  '._dshnms_triggerRow{display:flex;align-items:center;gap:2px}',
  '._dshnms_trigger{min-width:0;max-width:200px;height:28px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:none;border-radius:24px;outline:none;align-items:center;gap:4px;padding:0 4px 0 8px;font-size:13px;font-weight:500;line-height:20px;display:flex}',
  '._dshnms_triggerEffort{min-width:0;max-width:120px;height:28px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:none;border-radius:24px;outline:none;align-items:center;gap:4px;padding:0 4px 0 8px;font-size:13px;font-weight:500;line-height:20px;display:flex}',
  '._dshnms_trigger:hover:not(:disabled),._dshnms_triggerEffort:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}',
  '._dshnms_trigger:focus-visible,._dshnms_triggerEffort:focus-visible{box-shadow:0 0 0 2px var(--dsw-alias-border-l3)}',
  '._dshnms_trigger:disabled,._dshnms_triggerEffort:disabled{color:var(--dsw-alias-label-dimmed);cursor:default}',
  '._dshnms_triggerLabel{text-overflow:ellipsis;white-space:nowrap;min-width:0;overflow:hidden}',
  '._dshnms_chevron{color:var(--dsw-alias-label-caption);flex:none;transition:transform .12s}',
  '._dshnms_chevronOpen{transform:rotate(180deg)}',
  '._dshnms_menu{z-index:2000;border:1px solid var(--dsw-alias-border-inverted);background:var(--dsw-specific-menu);width:min(260px,100vw - 32px);max-height:min(420px,100vh - 96px);box-shadow:var(--dsw-shadow-lv3);color:var(--dsw-alias-label-primary);--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);border-radius:12px;flex-direction:column;padding:4px;display:flex;position:fixed;bottom:auto;left:auto;overflow:hidden;transition:width .12s}',
  '._dshnms_menuDual{width:min(520px,100vw - 32px)}',
  '._dshnms_columns{min-height:0;flex:1 1 auto;display:flex;flex-direction:row}',
  '._dshnms_col{min-width:0;min-height:0;flex:0 0 260px;display:flex;flex-direction:column}',
  '._dshnms_colRight{min-width:0;min-height:0;flex:1 1 auto;display:flex;flex-direction:column;border-left:1px solid var(--dsw-alias-border-l2);animation:_dshnms_slideIn .12s ease-out}',
  '@keyframes _dshnms_slideIn{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:none}}',
  '._dshnms_colActive{background:var(--dsw-alias-interactive-bg-hover)}',
  '._dshnms_chevronLeft{transform:rotate(180deg)}',
  '._dshnms_status,._dshnms_empty{color:var(--dsw-alias-label-tertiary);padding:10px;font-size:13px;line-height:20px}',
  '._dshnms_error,._dshnms_warning{background:var(--dsw-alias-interactive-bg-hover-danger);color:var(--dsw-alias-state-error-primary);border-radius:8px;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:4px;padding:7px 8px;font-size:12px;line-height:18px;display:flex}',
  '._dshnms_warning{background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-state-warn-label)}',
  '._dshnms_retry{color:inherit;font:inherit;cursor:pointer;background:0 0;border:none;flex:none;padding:0;font-weight:600}',
  '._dshnms_groups{min-height:0;overflow-y:auto;overscroll-behavior:contain}',
  '._dshnms_option{width:100%;color:var(--dsw-alias-label-primary);background:0 0;border:none;border-radius:8px;outline:none;justify-content:space-between;align-items:center;gap:8px;padding:6px 8px;font-size:13px;font-weight:500;line-height:20px;text-align:left;display:flex;cursor:pointer}',
  '._dshnms_option:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}',
  '._dshnms_option:focus-visible{box-shadow:0 0 0 2px var(--dsw-alias-border-l3)}',
  '._dshnms_option:disabled{color:var(--dsw-alias-label-dimmed);cursor:default}',
  '._dshnms_selected{background:0 0}',
  '._dshnms_optionCopy{min-width:0;flex-direction:column;gap:1px;display:flex}',
  '._dshnms_modelName{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}',
  '._dshnms_description{color:var(--dsw-alias-label-caption);text-overflow:ellipsis;white-space:nowrap;overflow:hidden;font-size:11px;line-height:16px;font-weight:400}',
  '._dshnms_check{color:var(--dsw-alias-label-primary);flex:0 0 18px;place-items:center;display:grid}',
  '._dshnms_cell{width:100%;color:var(--dsw-alias-label-primary);background:0 0;border:none;border-radius:8px;outline:none;align-items:center;gap:8px;padding:7px 8px;font-size:13px;font-weight:500;line-height:20px;text-align:left;display:flex;cursor:pointer}',
  '._dshnms_cell:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}',
  '._dshnms_cell:focus-visible{box-shadow:0 0 0 2px var(--dsw-alias-border-l3)}',
  '._dshnms_cellLabel{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1 1 auto}',
  '._dshnms_cellValue{color:var(--dsw-alias-label-caption);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:none;max-width:140px}',
  '._dshnms_cellChevron{color:var(--dsw-alias-label-caption);flex:none;display:flex}',
  '._dshnms_back{color:var(--dsw-alias-label-caption);flex:none;display:flex;margin-right:2px}',
  '._dshnms_header{width:100%;align-items:center;gap:4px;padding:4px 4px 6px;font-size:12px;font-weight:600;line-height:18px;color:var(--dsw-alias-label-secondary);border-bottom:1px solid var(--dsw-alias-border-l2);margin-bottom:4px;display:flex}',
  '._dshnms_headerName{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
].join('')
const CSS_TAG = '@marecgents/dsh-hub/model-select.module.css'
if (typeof document !== 'undefined' && document.querySelector('style[data-plugin-css=' + JSON.stringify(CSS_TAG) + ']') === null) {
  const tag = document.createElement('style')
  tag.dataset.plugin = '@marecgents/dsh-hub'
  tag.dataset.pluginCss = CSS_TAG
  tag.textContent = CSS
  document.head.appendChild(tag)
}
const c = {
  root: '_dshnms_root', triggerRow: '_dshnms_triggerRow', trigger: '_dshnms_trigger', triggerEffort: '_dshnms_triggerEffort',
  triggerLabel: '_dshnms_triggerLabel', chevron: '_dshnms_chevron', chevronOpen: '_dshnms_chevronOpen', chevronLeft: '_dshnms_chevronLeft',
  menu: '_dshnms_menu', menuDual: '_dshnms_menuDual', columns: '_dshnms_columns', col: '_dshnms_col', colRight: '_dshnms_colRight', colActive: '_dshnms_colActive',
  status: '_dshnms_status', empty: '_dshnms_empty', error: '_dshnms_error', warning: '_dshnms_warning', retry: '_dshnms_retry',
  groups: '_dshnms_groups', option: '_dshnms_option', optionCopy: '_dshnms_optionCopy', modelName: '_dshnms_modelName',
  description: '_dshnms_description', selected: '_dshnms_selected', check: '_dshnms_check', cell: '_dshnms_cell', cellLabel: '_dshnms_cellLabel',
  cellValue: '_dshnms_cellValue', cellChevron: '_dshnms_cellChevron', back: '_dshnms_back', header: '_dshnms_header', headerName: '_dshnms_headerName',
}

const zh = {
  'trigger.fallback': '选择模型', 'trigger.selectAria': '选择模型',
  'trigger.aria': '选择模型：{model}', 'trigger.ariaEffort': '选择模型：{model}，思考强度：{effort}',
  'menu.aria': '模型与思考强度', 'menu.model': '模型', 'menu.effort': '思考强度', 'menu.back': '返回', 'menu.providers': '供应商',
  'menu.models': '{name} · 选择模型', 'effort.providerDefault': '默认', 'status.loading': '正在刷新模型列表…',
  'error.action': '模型操作失败：{message}', 'error.rejected': '选择被拒绝',
  'action.reload': '重新加载', 'warning.groupLoad': '{name} 加载失败：{message}',
  'empty.providers': '没有可用的供应商。', 'empty.models': '没有可用模型。', 'empty.efforts': '当前模型未提供思考强度。',
  'config.efforts': '为此自定义模型启用标准思考强度', 'config.busy': '正在启用…', 'config.failed': '无法声明思考强度，请检查模型配置。',
}
const en = {
  'trigger.fallback': 'Select model', 'trigger.selectAria': 'Select model',
  'trigger.aria': 'Select model: {model}', 'trigger.ariaEffort': 'Select model: {model}, reasoning effort: {effort}',
  'menu.aria': 'Model and reasoning effort', 'menu.model': 'Model', 'menu.effort': 'Reasoning effort', 'menu.back': 'Back', 'menu.providers': 'Providers',
  'menu.models': '{name} · Select model', 'effort.providerDefault': 'Default', 'status.loading': 'Refreshing model list…',
  'error.action': 'Model action failed: {message}', 'error.rejected': 'Selection rejected',
  'action.reload': 'Reload', 'warning.groupLoad': '{name} failed to load: {message}',
  'empty.providers': 'No providers available.', 'empty.models': 'No models available.', 'empty.efforts': 'This model does not provide reasoning efforts.',
  'config.efforts': 'Enable standard efforts for this custom model', 'config.busy': 'Enabling…', 'config.failed': 'Unable to declare reasoning efforts; check the model configuration.',
}
function t(key: keyof typeof zh, params?: Record<string, string>): string {
  const dict = (document.documentElement.getAttribute('lang') || '').startsWith('zh') ? zh : en
  let value = dict[key] ?? key
  if (params) value = value.replace(/\{([^}]+)\}/g, (_, k: string) => params[k] ?? '')
  return value
}

interface ModelSelectProps {
  locked?: boolean
  available: boolean
  directory: { subscribe(fn: () => void): () => void; getSnapshot(): DirectorySnapshot }
  load(): void
  select(selection: Selection): Promise<boolean>
  configureEfforts?: (selection: Selection) => Promise<boolean>
}
interface DirectorySnapshot {
  current: Selection | null
  groups: Group[]
  failures: { id: string; name: string; message: string }[]
  status: string
  error: string | null
}
interface Group { id: string; name: string; models: Model[] }
interface Model { id: string; name: string; description?: string; reasoning?: Reasoning }
interface Reasoning { defaultEffort?: string; efforts: { id: string; name: string; description?: string }[] }
interface Selection { provider: string; model: string; reasoningEffort?: string }
interface EffortChoice { key: string; effort: string | undefined; label: string; description?: string }
interface SettingsProvider { models?: Array<Record<string, unknown>> }
interface SettingsScopeSnapshot {
  status: 'loading' | 'ready' | 'unavailable'
  value?: { providers?: Record<string, SettingsProvider> }
  revision?: number
  writable?: boolean
}
interface SettingsScope {
  getSnapshot(): SettingsScopeSnapshot
  mutate(ops: Array<{ op: 'set' | 'unset'; path: string[]; value?: unknown }>, expectedRevision?: number): Promise<void>
}
interface SettingsScopeBinder {
  bind<T>(spec: { namespace: string; decode?: (section: unknown) => T | undefined }): SettingsScope & { getSnapshot(): SettingsScopeSnapshot & { value?: T } }
}
interface ModelDirectoriesService {
  directoryFor(sessionId: string): {
    store: ModelSelectProps['directory']
    load(): Promise<unknown>
    select(selection: Selection): Promise<unknown>
  }
}

/** Standard effort declarations used by the inline custom-model action. */
const STANDARD_EFFORTS: Record<string, string | null> = {
  off: null,
  minimal: 'minimal',
  low: 'low',
  medium: 'medium',
  high: 'high',
  xhigh: 'xhigh',
  max: 'max',
}

/**
 * Crash-safe directory stub. If the inject factory throws (e.g.
 * directoryFor(subagentAddress) fails for a session), returning this
 * degraded face keeps the seat rendering instead of being abdicated by the
 * renderer's error boundary (which would hand the seat back to the official
 * component). The stable snapshot reference keeps useSyncExternalStore from
 * re-rendering forever.
 */
const STUB_DIRECTORY_SNAPSHOT: DirectorySnapshot = {
  current: null, groups: [], failures: [], status: 'idle', error: null,
}
const STUB_DIRECTORY: ModelSelectProps['directory'] = {
  subscribe: () => () => {},
  getSnapshot: () => STUB_DIRECTORY_SNAPSHOT,
}

/** Error boundary that reports render crashes to dsh.log, then lets the
 * error propagate so the slot renderer's own boundary abdicates (official
 * seat takes over) — but now we know exactly why. */
class ModelSelectErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(error: Error): { error: Error } { return { error } }
  componentDidCatch(error: Error): void {
    try {
      const internals = (window as unknown as {
        __TAURI_INTERNALS__?: { invoke?: (c: string, a?: Record<string, unknown>) => Promise<unknown> }
      }).__TAURI_INTERNALS__
      internals?.invoke?.('diag_report', { msg: 'model-select:render-crash:' + String(error?.message ?? error) }).catch?.(() => {})
    } catch {
      // Diagnostics must never mask the original error.
    }
  }
  render(): ReactNode {
    // No state-based fallback: rethrow semantics are preserved by not
    // swapping children — the slot boundary above will abdicate us.
    return this.props.children
  }
}

function ModelSelectNested({ locked, available, directory, load, select, configureEfforts }: ModelSelectProps) {
  const state = useSyncExternalStore((fn) => directory.subscribe(fn), () => directory.getSnapshot())
  const [open, setOpen] = useState(false)
  const [pane, setPane] = useState<'providers' | 'model' | 'effort'>('providers')
  const [activeGroup, setActiveGroup] = useState<string | null>(null)
  const [toast, setToast] = useState<{ seq: number; text: string } | null>(null)
  const [configuring, setConfiguring] = useState(false)
  // Fixed-position menu coordinates (viewport-relative). The menu is
  // rendered through a portal into document.body so it escapes the composer
  // card's stacking context — a plain z-index inside the card can never
  // outrank the right sidebar's body-level layers (Bug: menu hidden under
  // the right sidebar).
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null)
  const toastSeq = useRef(0)
  const lastActionRef = useRef<'load' | 'select'>('load')
  // Menu-generation guard: a selection settling after the menu was closed
  // and reopened must not close the fresh menu (R3-B finding 3).
  const epochRef = useRef(0)
  // Which trigger opened the menu — Escape-close restores focus to it.
  const lastOpenedRef = useRef<'providers' | 'effort'>('providers')
  const rootRef = useRef<HTMLDivElement>(null)
  const modelTriggerRef = useRef<HTMLButtonElement>(null)
  const effortTriggerRef = useRef<HTMLButtonElement>(null)
  // Column-scoped focus lists: left column (providers) and right column
  // (models) keep independent roving focus in dual-column mode (R3-C finding C).
  const leftItemRefs = useRef<(HTMLButtonElement | null)[]>([])
  const rightItemRefs = useRef<(HTMLButtonElement | null)[]>([])
  const providerRefs = useRef<Array<{ node: HTMLButtonElement; groupId: string }>>([])
  const id = useId()

  const choices = useMemo(() => state.groups.flatMap((group) => group.models.map((model) => ({
    group,
    model,
    selection: {
      provider: group.id,
      model: model.id,
      ...(model.reasoning?.defaultEffort === undefined ? {} : { reasoningEffort: model.reasoning.defaultEffort }),
    },
  }))), [state.groups])
  const selectedIndex = state.current === null ? -1 : choices.findIndex((choice) => choice.selection.provider === state.current?.provider && choice.selection.model === state.current.model)
  const currentChoice = choices[selectedIndex]
  const reasoning = currentChoice?.model.reasoning
  const effectiveEffort = state.current?.reasoningEffort ?? reasoning?.defaultEffort
  // PR #33 semantics: without reasoning metadata the effort trigger still
  // shows "Default" (provider default), never hides.
  const effortLabel = effectiveEffort === undefined ? t('effort.providerDefault') : reasoning?.efforts.find((level) => level.id === effectiveEffort)?.name ?? effectiveEffort
  const effortChoices = useMemo<readonly EffortChoice[]>(() => reasoning === undefined
    ? [{ key: 'provider-default', effort: undefined, label: t('effort.providerDefault') }]
    : [
        ...(reasoning.defaultEffort === undefined ? [{ key: 'provider-default', effort: undefined, label: t('effort.providerDefault') }] : []),
        ...reasoning.efforts.map((level) => ({ key: `effort:${level.id}`, effort: level.id, label: level.name, ...(level.description === undefined ? {} : { description: level.description }) })),
      ], [reasoning])
  const busy = state.status === 'selecting' || configuring
  const reload = useCallback(() => { lastActionRef.current = 'load'; load() }, [load])

  useEffect(() => {
    if (!open) return
    const closeOutside = (event: MouseEvent): void => { if (!rootRef.current?.contains(event.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', closeOutside)
    return () => { document.removeEventListener('mousedown', closeOutside) }
  }, [open])
  if (!available) return null

  const showProviders = (): void => {
    epochRef.current += 1
    lastOpenedRef.current = 'providers'
    setPane('providers'); setActiveGroup(null); setOpen(true)
    positionMenu()
    if (state.status !== 'loading') reload()
  }
  const showEffort = (): void => {
    epochRef.current += 1
    lastOpenedRef.current = 'effort'
    setPane('effort'); setOpen(true)
    positionMenu()
    if (state.status !== 'loading') reload()
  }
  const positionMenu = (): void => {
    const trigger = (lastOpenedRef.current === 'effort' ? effortTriggerRef : modelTriggerRef).current
    if (trigger === null) return
    const rect = trigger.getBoundingClientRect()
    // Menu opens upward from the trigger row, right-aligned to the trigger's
    // right edge (left-anchored: the provider column stays put when the
    // dual-column menu widens to the right).
    setMenuPos({ top: rect.top - 8, left: rect.right - 260 })
  }
  const close = (restoreFocus = false): void => {
    epochRef.current += 1
    setOpen(false); setPane('providers'); setActiveGroup(null); setMenuPos(null)
    if (restoreFocus) queueMicrotask(() => { (lastOpenedRef.current === 'effort' ? effortTriggerRef : modelTriggerRef).current?.focus() })
  }
  const goBack = (): void => {
    if (pane === 'model') { collapseModels(); return }
    if (pane === 'effort') { setPane('providers'); return }
    if (pane === 'providers') { close(true) }
  }
  const moveFocus = (offset: number, refs: (HTMLButtonElement | null)[]): void => {
    const items = refs.filter((item): item is HTMLButtonElement => item !== null)
    if (items.length === 0) return
    const active = items.findIndex((item) => item === document.activeElement)
    items[(Math.max(active, 0) + offset + items.length) % items.length]?.focus()
  }
  const onRootKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (!open) return
    if (event.key === 'Escape') { event.preventDefault(); goBack(); return }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const inRight = pane === 'model' && rightItemRefs.current.some((item) => item === document.activeElement)
      moveFocus(event.key === 'ArrowDown' ? 1 : -1, inRight ? rightItemRefs.current : leftItemRefs.current)
      return
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      if (pane === 'providers') {
        const hit = providerRefs.current.find((p) => p.node === document.activeElement)
        if (hit !== undefined) openModels(hit.groupId)
      } else if (pane === 'model') {
        rightItemRefs.current[0]?.focus()
      }
      return
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      if (pane === 'model') { collapseModels() } else if (pane === 'providers') { close(true) }
    }
  }
  const onBlur = (event: React.FocusEvent<HTMLDivElement>): void => {
    if (event.relatedTarget instanceof Node && rootRef.current?.contains(event.relatedTarget)) return
    close()
  }
  const settleSelection = (accepted: boolean): void => {
    if (accepted) { if (rootRef.current !== null) close(true); return }
    toastSeq.current += 1
    setToast({ seq: toastSeq.current, text: t('error.action', { message: directory.getSnapshot().error ?? t('error.rejected') }) })
  }
  const choose = (selection: Selection): void => {
    if (state.current?.provider === selection.provider && state.current.model === selection.model) { close(true); return }
    const epoch = epochRef.current
    lastActionRef.current = 'select'
    void select(selection).then((ok) => { if (epochRef.current === epoch) settleSelection(ok) }, () => { if (epochRef.current === epoch) settleSelection(false) })
  }
  const chooseEffort = (effort: string | undefined): void => {
    if (state.current === null || effectiveEffort === effort) { close(true); return }
    const epoch = epochRef.current
    lastActionRef.current = 'select'
    void select({ provider: state.current.provider, model: state.current.model, ...(effort === undefined ? {} : { reasoningEffort: effort }) }).then((ok) => { if (epochRef.current === epoch) settleSelection(ok) }, () => { if (epochRef.current === epoch) settleSelection(false) })
  }
  const configure = (): void => {
    if (!configureEfforts || state.current === null || configuring) return
    setConfiguring(true)
    void configureEfforts({ provider: state.current.provider, model: state.current.model }).then((ok) => {
      if (ok) { load(); return }
      toastSeq.current += 1
      setToast({ seq: toastSeq.current, text: t('config.failed') })
    }, () => {
      toastSeq.current += 1
      setToast({ seq: toastSeq.current, text: t('config.failed') })
    }).finally(() => setConfiguring(false))
  }

  const modelLabel = currentChoice ? currentChoice.model.name : t('trigger.fallback')
  leftItemRefs.current = []; rightItemRefs.current = []; providerRefs.current = []
  let leftIndex = 0; let rightIndex = 0
  const leftRef = (): ((node: HTMLButtonElement | null) => void) => { const at = leftIndex++; return (node) => { leftItemRefs.current[at] = node } }
  const rightRef = (): ((node: HTMLButtonElement | null) => void) => { const at = rightIndex++; return (node) => { rightItemRefs.current[at] = node } }
  const providerCellRef = (groupId: string): ((node: HTMLButtonElement | null) => void) => {
    const at = leftIndex++
    return (node) => {
      leftItemRefs.current[at] = node
      if (node !== null) providerRefs.current.push({ node, groupId })
    }
  }
  const activeGroupObj = activeGroup === null ? undefined : state.groups.find((g) => g.id === activeGroup)

  const openModels = (groupId: string): void => {
    setActiveGroup(groupId); setPane('model')
    queueMicrotask(() => { rightItemRefs.current[0]?.focus() })
  }
  const switchGroup = (groupId: string): void => {
    setActiveGroup(groupId)
    queueMicrotask(() => { rightItemRefs.current[0]?.focus() })
  }
  const collapseModels = (): void => {
    const g = activeGroup
    setPane('providers'); setActiveGroup(null)
    if (g !== null) queueMicrotask(() => { providerRefs.current.find((p) => p.groupId === g)?.node.focus() })
  }

  const statusBlock = (
    <>
      {state.status === 'loading' && <div className={c.status}>{t('status.loading')}</div>}
      {state.error !== null && lastActionRef.current === 'load' && (
        <div className={c.error}>
          <span>{t('error.action', { message: state.error })}</span>
          <button type="button" className={c.retry} onClick={reload}>{t('action.reload')}</button>
        </div>
      )}
      {state.failures.map((failure) => (
        <div className={c.warning} key={failure.id}>
          <span>{t('warning.groupLoad', { name: failure.name, message: failure.message })}</span>
          <button type="button" className={c.retry} onClick={reload}>{t('action.reload')}</button>
        </div>
      ))}
      {state.groups.length === 0 && state.status === 'ready' && <div className={c.empty}>{t('empty.providers')}</div>}
    </>
  )

  const providersPane = (
    <>
      {statusBlock}
      <div className={clsx(c.groups, 'scrollable')}>
        {state.groups.map((group) => (
          <button key={group.id} ref={providerCellRef(group.id)} type="button" role="menuitem" className={c.cell} onClick={() => openModels(group.id)}>
            <span className={c.cellLabel}>{group.name}</span>
            <IconChevronRightOutline14 className={c.cellChevron} />
          </button>
        ))}
      </div>
    </>
  )

  const modelPane = (
    <div className={c.columns}>
      <div className={c.col} role="group" aria-label={t('menu.providers')}>
        {statusBlock}
        <div className={clsx(c.groups, 'scrollable')}>
          {state.groups.map((group) => {
            const active = activeGroup === group.id
            return (
              <button key={group.id} ref={providerCellRef(group.id)} type="button" role="menuitem"
                aria-expanded={active} className={clsx(c.cell, active && c.colActive)}
                onClick={() => {
                  if (active) { collapseModels(); return }
                  if (pane === 'model') { switchGroup(group.id); return }
                  openModels(group.id)
                }}>
                <span className={c.cellLabel}>{group.name}</span>
                <IconChevronRightOutline14 className={clsx(c.cellChevron, active && c.chevronLeft)} />
              </button>
            )
          })}
        </div>
      </div>
      <div className={clsx(c.col, c.colRight)} role="group" aria-label={t('menu.model')}>
        <div className={c.header}>
          <span className={c.headerName}>{activeGroupObj ? t('menu.models', { name: activeGroupObj.name }) : ''}</span>
        </div>
        {activeGroupObj && (
          <div className={clsx(c.groups, 'scrollable')}>
            {activeGroupObj.models.map((model) => {
              const selected = state.current?.provider === activeGroupObj.id && state.current.model === model.id
              return (
                <button key={model.id} ref={rightRef()} type="button" role="menuitemradio" aria-checked={selected}
                  className={clsx(c.option, selected && c.selected)} title={model.name} disabled={busy}
                  onClick={() => choose({ provider: activeGroupObj.id, model: model.id })}>
                  <span className={c.optionCopy}>
                    <span className={c.modelName}>{model.name}</span>
                    {model.description !== undefined && <span className={c.description}>{model.description}</span>}
                  </span>
                  <span className={c.check}>{selected ? <IconCheckOutline16 /> : null}</span>
                </button>
              )
            })}
          </div>
        )}
        {activeGroupObj !== undefined && activeGroupObj.models.length === 0 && <div className={c.empty}>{t('empty.models')}</div>}
      </div>
    </div>
  )

  const effortPane = (
    <>
      {reasoning === undefined && configureEfforts !== undefined && (
        <button ref={leftRef()} type="button" role="menuitem" className={c.cell} disabled={busy} onClick={configure}>
          <span className={c.cellLabel}>{configuring ? t('config.busy') : t('config.efforts')}</span>
          <IconChevronRightOutline14 className={c.cellChevron} />
        </button>
      )}
      {reasoning !== undefined && state.error !== null && lastActionRef.current === 'load' && (
        <div className={c.error}>
          <span>{t('error.action', { message: state.error })}</span>
          <button type="button" className={c.retry} onClick={reload}>{t('action.reload')}</button>
        </div>
      )}
      {effortChoices.length === 0 ? <div className={c.empty}>{t('empty.efforts')}</div> : effortChoices.map((level) => (
        <button key={level.key} ref={leftRef()} type="button" role="menuitemradio" aria-checked={effectiveEffort === level.effort}
          className={clsx(c.option, effectiveEffort === level.effort && c.selected)} disabled={busy}
          onClick={() => chooseEffort(level.effort)}>
          <span className={c.optionCopy}>
            <span className={c.modelName}>{level.label}</span>
            {level.description !== undefined && <span className={c.description}>{level.description}</span>}
          </span>
          <span className={c.check}>{effectiveEffort === level.effort ? <IconCheckOutline16 /> : null}</span>
        </button>
      ))}
    </>
  )

  return (
    <div ref={rootRef} className={c.root} onKeyDown={onRootKeyDown} onBlur={onBlur}>
      <div className={c.triggerRow}>
        <button ref={modelTriggerRef} type="button" className={c.trigger} aria-label={t('trigger.selectAria')}
          aria-haspopup="menu" aria-expanded={open && (pane === 'providers' || pane === 'model')} aria-controls={open ? `${id}-menu` : undefined}
          title={modelLabel} disabled={locked}
          onClick={() => { if (open && (pane === 'providers' || pane === 'model')) close(); else showProviders() }}>
          <span className={c.triggerLabel}>{modelLabel}</span>
          <IconChevronDownOutline14 className={clsx(c.chevron, open && (pane === 'providers' || pane === 'model') && c.chevronOpen)} />
        </button>
        <button ref={effortTriggerRef} type="button" className={c.triggerEffort} aria-label={t('menu.effort')}
          aria-haspopup="menu" aria-expanded={open && pane === 'effort'} aria-controls={open ? `${id}-menu` : undefined}
          title={effortLabel} disabled={locked}
          onClick={() => { if (open && pane === 'effort') close(); else showEffort() }}>
          <span className={c.triggerLabel}>{effortLabel}</span>
          <IconChevronDownOutline14 className={clsx(c.chevron, open && pane === 'effort' && c.chevronOpen)} />
        </button>
      </div>
      {open && menuPos !== null && createPortal(
        <div id={`${id}-menu`} className={clsx(c.menu, pane === 'model' && c.menuDual)} role="menu" aria-label={t('menu.aria')} aria-busy={state.status === 'loading' || busy}
          style={{ top: menuPos.top, left: menuPos.left }}>
          {pane === 'providers' && providersPane}
          {pane === 'model' && modelPane}
          {pane === 'effort' && effortPane}
        </div>,
        document.body,
      )}
      {toast !== null && (
        <Toast key={toast.seq} text={toast.text} icon={<IconWarningOutline16 />}
          anchor={rootRef.current?.closest<HTMLElement>('[data-composer-card]') ?? null}
          onDone={() => setToast(null)} />
      )}
    </div>
  )
}

/**
 * Declare the standard effort levels for a custom model through the official
 * llm-pi-ai settings namespace. The snapshot value is the schema-resolved
 * section: an absent `models` key materializes as `[]`, so the whole-array
 * write covers both pure-catalog routes and already-declared routes.
 * modelOverrides is NEVER written — the official resolveRouteModels refuses
 * it for any model the installed catalog does not describe, which is exactly
 * the custom-model case this action exists for. Success is judged by reading
 * the declared value back (mutate never throws on rejection; it recovers and
 * resolves, so the read-back is the only reliable failure signal).
 */
async function declareStandardEfforts(scope: SettingsScope | undefined, selection: Selection): Promise<boolean> {
  if (scope === undefined) return false
  const before = scope.getSnapshot()
  if (before.status !== 'ready' || before.writable !== true || before.revision === undefined) return false
  const provider = before.value?.providers?.[selection.provider]
  if (provider === undefined) return false
  const models = Array.isArray(provider.models) ? provider.models : []
  const efforts = { ...STANDARD_EFFORTS }
  const ops = [{
    op: 'set' as const,
    path: ['providers', selection.provider, 'models'],
    // Whole-array replacement: applyPathOp cannot address array indexes (a
    // non-plain-object intermediate is replaced by an object), so the array
    // is rebuilt from the resolved snapshot, which is JSON-shaped by
    // construction (no undefined entries to strip).
    value: models.map((model) => model.id === selection.model ? { ...model, reasoningEfforts: efforts } : model),
  }]
  await scope.mutate(ops, before.revision)
  const after = scope.getSnapshot()
  if (after.status !== 'ready') return false
  const p = after.value?.providers?.[selection.provider]
  const declared = Array.isArray(p?.models)
    ? p.models.find((m) => m.id === selection.model)?.reasoningEfforts
    : undefined
  return declared !== undefined
}

/** Register the model selector in the official composer seat. */
export function installModelSelect(ctx: ClientContext): void {
  // Diagnostic uplink (dsh.log): the desktop shell's Folder log target does
  // NOT capture browser console.log, so seat registration success/failure is
  // reported through the same diag_report channel pins/session-focus use —
  // this is the only page-side signal that lands in ~/.dsh/dsh-hub/logs/dsh.log.
  const report = (msg: string): void => {
    try {
      const internals = (window as unknown as {
        __TAURI_INTERNALS__?: { invoke?: (c: string, a?: Record<string, unknown>) => Promise<unknown> }
      }).__TAURI_INTERNALS__
      internals?.invoke?.('diag_report', { msg }).catch?.(() => {})
    } catch {
      // Diagnostic failure must never break seat registration.
    }
  }
  const sessions = ctx.get('sessions') as unknown as { subagentAddress(sessionId: string): unknown } | undefined
  if (sessions === undefined) {
    console.warn('[dsh-hub] model-select skipped: sessions service unavailable')
    report('model-select:skipped:sessions')
    return
  }
  // ONLY slots + modelDirectories are hard dependencies — the same pair the
  // official ui-model-selection declares. The seat registration must never
  // wait on settingsScope: a stalled settings service would keep this child
  // fiber PENDING forever and the OFFICIAL seat would win by default, which
  // user-visible tests mistook for "the override is missing". settingsScope
  // is fetched lazily on the first configure click (ui-settings is an
  // unconditional web-app row, so the binder exists by any click time).
  ctx.inject(['slots', 'modelDirectories'], (scope: ClientContext) => {
    const slots = scope.get('slots')
    const models = scope.get('modelDirectories') as unknown as ModelDirectoriesService | undefined
    if (slots === undefined || models === undefined) {
      console.warn('[dsh-hub] model-select skipped: slots/modelDirectories unavailable')
      report('model-select:skipped:slots-or-modelDirectories')
      return
    }
    // Lazy settings scope: bind once on the first configure click and reuse
    // the controller afterwards (bind registers an effect, so per-click bind
    // would leak; the disposer is owned by this scoped fiber).
    let effortsScope: SettingsScope | undefined
    let binderFetched = false
    const obtainEffortsScope = (): SettingsScope | undefined => {
      if (binderFetched) return effortsScope
      binderFetched = true
      const binder = scope.get('settingsScope') as unknown as SettingsScopeBinder | undefined
      if (binder !== undefined) {
        effortsScope = binder.bind<{ providers?: Record<string, SettingsProvider> }>({ namespace: 'llm-pi-ai' })
      }
      return effortsScope
    }
    slots.inject('conversation.input.model', () => slots.register({
      name: 'conversation.input.model',
      priority: -1,
      inject: (sessionId: string) => {
        // The inject factory runs on every session-scoped render. Any throw
        // here (directoryFor/subagentAddress) would abdicate the hub entry
        // via the renderer error boundary and hand the seat back to the
        // official component — exactly what "installed but official menu"
        // looks like. Degrade to a safe face instead; the crash is still
        // reported to dsh.log. available stays true so the seat renders
        // (an empty directory shows the providers list with a retry path)
        // rather than returning null and hiding the menu entirely.
        let directory: ModelSelectProps['directory'] = STUB_DIRECTORY
        let available = true
        try {
          directory = models.directoryFor(sessionId).store as unknown as ModelSelectProps['directory']
          available = sessions.subagentAddress(sessionId) === undefined
        } catch (error) {
          try {
            const internals = (window as unknown as {
              __TAURI_INTERNALS__?: { invoke?: (c: string, a?: Record<string, unknown>) => Promise<unknown> }
            }).__TAURI_INTERNALS__
            internals?.invoke?.('diag_report', { msg: 'model-select:inject-crash:' + String(error instanceof Error ? error.message : error) }).catch?.(() => {})
          } catch {
            // Diagnostics must never break the seat.
          }
        }
        return {
          available,
          directory,
          load: () => { if (available) models.directoryFor(sessionId).load().catch(() => {}) },
          select: (selection: Selection) => available ? models.directoryFor(sessionId).select(selection).then(() => true, () => false) : Promise.resolve(false),
          configureEfforts: (selection: Selection) => declareStandardEfforts(obtainEffortsScope(), selection),
        }
      },
    }, (props: ModelSelectProps) => <ModelSelectErrorBoundary><ModelSelectNested {...props} /></ModelSelectErrorBoundary>))
    console.log('[dsh-hub] model-select override installed')
    report('model-select:installed')
  })
}
