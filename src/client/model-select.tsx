/**
 * dsh-hub model-select override — replaces the built-in composer model seat
 * (`conversation.input.model`) with a nested provider -> model menu.
 *
 * The built-in ui-model-selection registers the seat at priority 0; this
 * entry registers at priority -1 so it shadows the built-in (lowest priority
 * wins per the slot registry). It reuses the built-in `modelDirectories`
 * service for the shared per-session model directory, so selection state and
 * the /model command stay consistent.
 *
 * Layout: two adjacent trigger buttons — left opens the supplier list, right
 * opens the thinking-effort list (only "default" when the model has none).
 */

import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import clsx from 'clsx'
import {
  IconCheckOutline16,
  IconChevronDownOutline14,
  IconChevronLeftOutline14,
  IconChevronRightOutline14,
  IconWarningOutline16,
  Toast,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface SlotMap {
    'conversation.input.model': { kind: 'single'; scope: 'session'; owner: { locked?: boolean } }
  }
}

/** Themed CSS (mirrors the built-in model seat look). */
const CSS = [
  '._dshnms_root{min-width:0;position:relative}',
  '._dshnms_trigger{min-width:0;max-width:220px;height:28px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:none;border-radius:24px;outline:none;align-items:center;gap:4px;padding:0 4px 0 8px;font-size:13px;font-weight:500;line-height:20px;display:flex}',
  '._dshnms_trigger:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}',
  '._dshnms_trigger:focus-visible{box-shadow:0 0 0 2px var(--dsw-alias-border-l3)}',
  '._dshnms_trigger:disabled{color:var(--dsw-alias-label-dimmed);cursor:default}',
  '._dshnms_triggerRow{display:flex;align-items:center;gap:2px}',
  '._dshnms_triggerLabel{text-overflow:ellipsis;white-space:nowrap;min-width:0;overflow:hidden}',
  '._dshnms_chevron{color:var(--dsw-alias-label-caption);flex:none;transition:transform .12s}',
  '._dshnms_chevronOpen{transform:rotate(180deg)}',
  '._dshnms_menu{z-index:20;border:1px solid var(--dsw-alias-border-inverted);background:var(--dsw-specific-menu);width:min(240px,100vw - 32px);max-height:min(400px,100vh - 96px);box-shadow:var(--dsw-shadow-lv3);color:var(--dsw-alias-label-primary);--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);border-radius:12px;flex-direction:column;padding:4px;display:flex;position:absolute;bottom:calc(100% + 8px);right:0;overflow:hidden}',
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
  '._dshnms_cell{width:100%;color:var(--dsw-alias-label-primary);background:0 0;border:none;border-radius:8px;outline:none;align-items:center;gap:8px;padding:6px 8px;font-size:13px;font-weight:500;line-height:20px;text-align:left;display:flex;cursor:pointer}',
  '._dshnms_cell:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}',
  '._dshnms_cell:focus-visible{box-shadow:0 0 0 2px var(--dsw-alias-border-l3)}',
  '._dshnms_cellLabel{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1 1 auto}',
  '._dshnms_cellValue{color:var(--dsw-alias-label-caption);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:none;max-width:120px}',
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
  root: '_dshnms_root', trigger: '_dshnms_trigger', triggerRow: '_dshnms_triggerRow', triggerLabel: '_dshnms_triggerLabel',
  chevron: '_dshnms_chevron', chevronOpen: '_dshnms_chevronOpen', menu: '_dshnms_menu', status: '_dshnms_status',
  empty: '_dshnms_empty', error: '_dshnms_error', warning: '_dshnms_warning', retry: '_dshnms_retry',
  groups: '_dshnms_groups', option: '_dshnms_option', optionCopy: '_dshnms_optionCopy', modelName: '_dshnms_modelName',
  description: '_dshnms_description', selected: '_dshnms_selected', check: '_dshnms_check', cell: '_dshnms_cell',
  cellLabel: '_dshnms_cellLabel', cellValue: '_dshnms_cellValue', cellChevron: '_dshnms_cellChevron',
  back: '_dshnms_back', header: '_dshnms_header', headerName: '_dshnms_headerName',
}

const NS = 'modelselect-nested'

/** Minimal locale binder (the hub keeps its own copy; no locale plugin dep). */
function t(key: string, params?: Record<string, string>): string {
  const dict = (zh as Record<string, string>)[key] ?? (en as Record<string, string>)[key] ?? key
  if (params === undefined) return dict
  return dict.replace(/\{([^}]+)\}/g, (_, k: string) => params[k] ?? '')
}
const zh = {
  'trigger.fallback': '选择模型',
  'trigger.selectAria': '选择模型',
  'menu.aria': '模型与思考强度',
  'menu.effort': '思考强度',
  'menu.back': '返回',
  'menu.models': '{name} · 选择模型',
  'effort.providerDefault': '默认',
  'status.loading': '正在刷新模型列表…',
  'error.action': '模型操作失败：{message}',
  'action.reload': '重新加载',
  'warning.groupLoad': '{name} 加载失败：{message}',
  'empty.providers': '没有可用的供应商。',
  'empty.efforts': '当前模型未提供思考强度。',
}
const en = {
  'trigger.fallback': 'Select model',
  'trigger.selectAria': 'Select model',
  'menu.aria': 'Model and thinking effort',
  'menu.effort': 'Thinking effort',
  'menu.back': 'Back',
  'menu.models': '{name} · Select model',
  'effort.providerDefault': 'Default',
  'status.loading': 'Refreshing model list…',
  'error.action': 'Model load failed: {message}',
  'action.reload': 'Reload',
  'warning.groupLoad': '{name} failed to load: {message}',
  'empty.providers': 'No providers available.',
  'empty.efforts': 'This model provides no thinking effort levels.',
}

interface ModelSelectProps {
  locked?: boolean
  available: boolean
  directory: { subscribe(fn: () => void): () => void; getSnapshot(): DirectorySnapshot }
  load(): void
  select(selection: Selection): Promise<boolean>
}

interface DirectorySnapshot {
  current: { provider: string; model: string; reasoningEffort?: string } | null
  groups: Group[]
  failures: { id: string; name: string; message: string }[]
  status: string
  error: string | null
}
interface Group { id: string; name: string; models: Model[] }
interface Model {
  id: string
  name: string
  description?: string
  reasoning?: { defaultEffort?: string; efforts: { id: string; name: string; description?: string }[] }
}
interface Selection { provider: string; model: string; reasoningEffort?: string }
interface EffortChoice { key: string; effort: string | undefined; label: string; description?: string }

function ModelSelectNested({ locked, available, directory, load, select }: ModelSelectProps) {
  const state = useSyncExternalStore((fn) => directory.subscribe(fn), () => directory.getSnapshot())
  const [open, setOpen] = useState(false)
  const [pane, setPane] = useState<'providers' | 'model' | 'effort'>('providers')
  const [activeGroup, setActiveGroup] = useState<string | null>(null)
  const [toast, setToast] = useState<{ seq: number; text: string } | null>(null)
  const toastSeq = useRef(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const modelTriggerRef = useRef<HTMLButtonElement>(null)
  const effortTriggerRef = useRef<HTMLButtonElement>(null)
  const itemRefs = useRef<(HTMLElement | null)[]>([])
  const id = useId()

  const choices = useMemo(() => state.groups.flatMap((group) => group.models.map((model) => ({
    group,
    model,
    selection: {
      provider: group.id,
      model: model.id,
      ...(model.reasoning && model.reasoning.defaultEffort !== undefined ? { reasoningEffort: model.reasoning.defaultEffort } : {}),
    },
  }))), [state.groups])

  const currentChoice = choices[state.current === null ? -1 : choices.findIndex((c) => c.selection.provider === state.current!.provider && c.selection.model === state.current!.model)]
  const reasoning = currentChoice && currentChoice.model.reasoning
  const effectiveEffort = state.current && state.current.reasoningEffort !== undefined ? state.current.reasoningEffort : (reasoning && reasoning.defaultEffort)
  const effortLabel = effectiveEffort === undefined ? t('effort.providerDefault') : (((reasoning && reasoning.efforts.find((l) => l.id === effectiveEffort)) || {}).name || effectiveEffort)
  const effortChoices = useMemo<EffortChoice[]>(() => reasoning === undefined ? [{ key: 'provider-default', effort: undefined, label: t('effort.providerDefault') }] : [
    ...(reasoning.defaultEffort === undefined ? [{ key: 'provider-default', effort: undefined, label: t('effort.providerDefault') }] : []),
    ...reasoning.efforts.map((effort) => ({ key: 'effort:' + effort.id, effort: effort.id, label: effort.name, ...(effort.description === undefined ? {} : { description: effort.description }) })),
  ], [reasoning, t])

  const busy = state.status === 'selecting'
  const reload = (): void => { load() }
  useEffect(() => { if (available) load() }, [available, load])
  useEffect(() => {
    if (!open) return
    const closeOutside = (event: MouseEvent): void => { if (!rootRef.current || !rootRef.current.contains(event.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', closeOutside)
    return () => document.removeEventListener('mousedown', closeOutside)
  }, [open])

  if (!available) return null

  const showProviders = (): void => { setPane('providers'); setActiveGroup(null); setOpen(true); reload() }
  const showEffort = (): void => { setPane('effort'); setOpen(true); reload() }
  const close = (restoreFocus = false): void => {
    setOpen(false); setPane('providers'); setActiveGroup(null)
    if (restoreFocus) queueMicrotask(() => { modelTriggerRef.current?.focus() })
  }
  const goBack = (): void => {
    if (pane === 'model' || pane === 'effort') { setPane('providers'); return }
    if (pane === 'providers') { close(true) }
  }
  const moveFocus = (offset: number): void => {
    const items = itemRefs.current.filter((item): item is HTMLElement => item !== null)
    if (items.length === 0) return
    const active = items.findIndex((item) => item === document.activeElement)
    const next = items[(Math.max(active, 0) + offset + items.length) % items.length]
    next?.focus()
  }
  const onRootKeyDown = (event: React.KeyboardEvent): void => {
    if (event.key === 'Escape' && open) { event.preventDefault(); goBack(); return }
    if (!open) return
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); moveFocus(event.key === 'ArrowDown' ? 1 : -1) }
  }
  const onBlur = (event: React.FocusEvent): void => {
    if (event.relatedTarget instanceof Node && rootRef.current && rootRef.current.contains(event.relatedTarget)) return
    close()
  }
  const settleSelection = (accepted: boolean): void => {
    if (accepted) { if (rootRef.current !== null) close(true); return }
    const message = directory.getSnapshot().error
    if (message !== null) {
      toastSeq.current += 1
      setToast({ seq: toastSeq.current, text: t('error.action', { message }) })
    }
  }
  const choose = (selection: Selection): void => {
    if (state.current && state.current.provider === selection.provider && state.current.model === selection.model) { close(true); return }
    select(selection).then(settleSelection)
  }
  const chooseEffort = (effort: string | undefined): void => {
    if (state.current === null) return
    if (effectiveEffort === effort) { close(true); return }
    select({ provider: state.current.provider, model: state.current.model, ...(effort === undefined ? {} : { reasoningEffort: effort }) }).then(settleSelection)
  }

  const modelLabel = currentChoice ? currentChoice.model.name : t('trigger.fallback')
  itemRefs.current = []
  let itemIndex = 0
  const itemRef = (): ((node: HTMLElement | null) => void) => { const at = itemIndex++; return (node) => { itemRefs.current[at] = node } }

  const activeGroupObj = activeGroup === null ? undefined : state.groups.find((g) => g.id === activeGroup)

  const backCell = (
    <button ref={itemRef()} type="button" role="menuitem" className={c.cell} onClick={goBack}>
      <IconChevronLeftOutline14 className={c.back} />
      <span className={c.cellLabel}>{t('menu.back')}</span>
    </button>
  )

  const providersPane = (
    <>
      {backCell}
      {reasoning !== undefined && (
        <button ref={itemRef()} type="button" role="menuitem" className={c.cell} onClick={() => setPane('effort')}>
          <span className={c.cellLabel}>{t('menu.effort')}</span>
          <span className={c.cellValue}>{effortLabel}</span>
          <IconChevronRightOutline14 className={c.cellChevron} />
        </button>
      )}
      {state.status === 'loading' && <div className={c.status}>{t('status.loading')}</div>}
      {state.error !== null && (
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
      <div className={clsx(c.groups, 'scrollable')}>
        {state.groups.map((group) => (
          <button key={group.id} ref={itemRef()} type="button" role="menuitem" className={c.cell} onClick={() => { setActiveGroup(group.id); setPane('model') }}>
            <span className={c.cellLabel}>{group.name}</span>
            <IconChevronRightOutline14 className={c.cellChevron} />
          </button>
        ))}
      </div>
    </>
  )

  const modelPane = (
    <>
      {backCell}
      <div className={c.header}>
        <span className={c.headerName}>{activeGroupObj ? t('menu.models', { name: activeGroupObj.name }) : ''}</span>
      </div>
      {activeGroupObj && (
        <div className={clsx(c.groups, 'scrollable')}>
          {activeGroupObj.models.map((model) => {
            const selected = state.current && state.current.provider === activeGroupObj.id && state.current.model === model.id
            return (
              <button key={model.id} ref={itemRef()} type="button" role="menuitemradio" aria-checked={!!selected}
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
    </>
  )

  const effortPane = (
    <>
      {backCell}
      {effortChoices.length === 0 ? <div className={c.empty}>{t('empty.efforts')}</div> : effortChoices.map((level) => (
        <button key={level.key} ref={itemRef()} type="button" role="menuitemradio" aria-checked={effectiveEffort === level.effort}
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
          aria-haspopup="menu" aria-expanded={open && pane === 'providers'} aria-controls={open ? id + '-menu' : undefined}
          title={modelLabel} disabled={locked}
          onClick={() => { if (open && pane === 'providers') close(); else showProviders() }}>
          <span className={c.triggerLabel}>{modelLabel}</span>
          <IconChevronDownOutline14 className={clsx(c.chevron, open && pane === 'providers' && c.chevronOpen)} />
        </button>
        <button ref={effortTriggerRef} type="button" className={c.trigger} aria-label={t('menu.effort')}
          aria-haspopup="menu" aria-expanded={open && pane === 'effort'} aria-controls={open ? id + '-menu' : undefined}
          title={effortLabel} disabled={locked}
          onClick={() => { if (open && pane === 'effort') close(); else showEffort() }}>
          <span className={c.triggerLabel}>{effortLabel}</span>
          <IconChevronDownOutline14 className={clsx(c.chevron, open && pane === 'effort' && c.chevronOpen)} />
        </button>
      </div>
      {open && (
        <div id={id + '-menu'} className={c.menu} role="menu" aria-label={t('menu.aria')} aria-busy={state.status === 'loading' || busy}>
          {pane === 'providers' && providersPane}
          {pane === 'model' && modelPane}
          {pane === 'effort' && effortPane}
        </div>
      )}
      {toast !== null && (
        <Toast text={toast.text} icon={<IconWarningOutline16 />}
          anchor={rootRef.current ? rootRef.current.closest('[data-composer-card]') : null}
          onDone={() => setToast(null)} />
      )}
    </div>
  )
}

/** Register the model-select override into the composer model seat. */
export function installModelSelect(ctx: ClientContext): void {
  const slots = ctx.get('slots')
  const models = ctx.get('modelDirectories')
  const sessions = ctx.get('sessions') as unknown as { subagentAddress(sessionId: string): unknown } | undefined
  if (slots === undefined || models === undefined || sessions === undefined) return
  ctx.effect(() => {
    return slots.inject('conversation.input.model', () => slots.register({
      name: 'conversation.input.model',
      priority: -1,
      inject: (sessionId: string) => {
        const directory = models.directoryFor(sessionId)
        const available = sessions.subagentAddress(sessionId) === undefined
        return {
          available,
          directory: directory.store,
          load: () => { if (available) directory.load().catch(() => {}) },
          select: (selection: Selection) => available ? directory.select(selection).then(() => true, () => false) : Promise.resolve(false),
        }
      },
    }, (props: ModelSelectProps) => ModelSelectNested(props)))
  }, 'dsh-hub: model-select override')
}
