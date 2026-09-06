/**
 * dsh-hub model selector — replaces the official composer model seat.
 *
 * Module category: client UI component.
 * Responsibility: render the official composer placement and interaction
 * contract (`conversation.input.model`) with a provider -> model -> effort
 * menu. The selector uses the shared per-session model directory for every
 * selection. When a custom model has no reasoning metadata yet, the effort
 * pane can declare the standard levels through the official `llm-pi-ai`
 * settings scope; the host then rebuilds the catalog and the same pane shows
 * the host-validated effort choices. No settings-page UI is involved.
 */

import { useCallback, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from 'react'
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
  '._dshnms_trigger{min-width:0;max-width:260px;height:28px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:none;border-radius:24px;outline:none;align-items:center;gap:5px;padding:0 5px 0 9px;font-size:13px;font-weight:500;line-height:20px;display:flex}',
  '._dshnms_trigger:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}',
  '._dshnms_trigger:focus-visible{box-shadow:0 0 0 2px var(--dsw-alias-border-l3)}',
  '._dshnms_trigger:disabled{color:var(--dsw-alias-label-dimmed);cursor:default}',
  '._dshnms_triggerLabel{text-overflow:ellipsis;white-space:nowrap;min-width:0;overflow:hidden}',
  '._dshnms_triggerEffort{color:var(--dsw-alias-label-caption);font-weight:400;white-space:nowrap}',
  '._dshnms_chevron{color:var(--dsw-alias-label-caption);flex:none;transition:transform .12s}',
  '._dshnms_chevronOpen{transform:rotate(180deg)}',
  '._dshnms_menu{z-index:20;border:1px solid var(--dsw-alias-border-inverted);background:var(--dsw-specific-menu);width:min(280px,100vw - 32px);max-height:min(420px,100vh - 96px);box-shadow:var(--dsw-shadow-lv3);color:var(--dsw-alias-label-primary);--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);border-radius:12px;flex-direction:column;padding:4px;display:flex;position:absolute;bottom:calc(100% + 8px);right:0;overflow:hidden}',
  '._dshnms_status,._dshnms_empty{color:var(--dsw-alias-label-tertiary);padding:10px;font-size:13px;line-height:20px}',
  '._dshnms_error,._dshnms_warning{background:var(--dsw-alias-interactive-bg-hover-danger);color:var(--dsw-alias-state-error-primary);border-radius:8px;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:4px;padding:7px 8px;font-size:12px;line-height:18px;display:flex}',
  '._dshnms_warning{background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-state-warn-label)}',
  '._dshnms_retry{color:inherit;font:inherit;cursor:pointer;background:0 0;border:none;flex:none;padding:0;font-weight:600}',
  '._dshnms_groups{min-height:0;overflow-y:auto;overscroll-behavior:contain}',
  '._dshnms_groupTitle{color:var(--dsw-alias-label-caption);padding:6px 8px 3px;font-size:11px;font-weight:600;line-height:16px}',
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
  root: '_dshnms_root', trigger: '_dshnms_trigger', triggerLabel: '_dshnms_triggerLabel', triggerEffort: '_dshnms_triggerEffort',
  chevron: '_dshnms_chevron', chevronOpen: '_dshnms_chevronOpen', menu: '_dshnms_menu', status: '_dshnms_status',
  empty: '_dshnms_empty', error: '_dshnms_error', warning: '_dshnms_warning', retry: '_dshnms_retry', groups: '_dshnms_groups',
  groupTitle: '_dshnms_groupTitle', option: '_dshnms_option', optionCopy: '_dshnms_optionCopy', modelName: '_dshnms_modelName',
  description: '_dshnms_description', selected: '_dshnms_selected', check: '_dshnms_check', cell: '_dshnms_cell', cellLabel: '_dshnms_cellLabel',
  cellValue: '_dshnms_cellValue', cellChevron: '_dshnms_cellChevron', back: '_dshnms_back', header: '_dshnms_header', headerName: '_dshnms_headerName',
}

const zh = {
  'trigger.fallback': '选择模型', 'trigger.loading': '正在加载模型…', 'trigger.selectAria': '选择模型',
  'trigger.aria': '选择模型：{model}', 'trigger.ariaEffort': '选择模型：{model}，思考强度：{effort}',
  'menu.aria': '模型与思考强度', 'menu.model': '模型', 'menu.effort': '思考强度', 'menu.back': '返回',
  'effort.providerDefault': '默认', 'status.loading': '正在刷新模型列表…', 'error.action': '模型操作失败：{message}',
  'action.reload': '重新加载', 'warning.groupLoad': '{name} 加载失败：{message}', 'empty.models': '没有可用模型。',
  'empty.efforts': '当前模型未提供思考强度。', 'config.efforts': '为此自定义模型启用标准思考强度', 'config.busy': '正在启用…',
  'config.failed': '无法声明思考强度，请检查模型配置。',
}
const en = {
  'trigger.fallback': 'Select model', 'trigger.loading': 'Loading models…', 'trigger.selectAria': 'Select model',
  'trigger.aria': 'Select model: {model}', 'trigger.ariaEffort': 'Select model: {model}, reasoning effort: {effort}',
  'menu.aria': 'Model and reasoning effort', 'menu.model': 'Model', 'menu.effort': 'Reasoning effort', 'menu.back': 'Back',
  'effort.providerDefault': 'Default', 'status.loading': 'Refreshing model list…', 'error.action': 'Model action failed: {message}',
  'action.reload': 'Reload', 'warning.groupLoad': '{name} failed to load: {message}', 'empty.models': 'No models available.',
  'empty.efforts': 'This model does not provide reasoning efforts.', 'config.efforts': 'Enable standard efforts for this custom model', 'config.busy': 'Enabling…',
  'config.failed': 'Unable to declare reasoning efforts; check the model configuration.',
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
interface SettingsProvider { models?: Array<Record<string, unknown>>; modelOverrides?: Record<string, Record<string, unknown>> }
interface SettingsScope {
  getSnapshot(): { status: string; value?: { providers?: Record<string, SettingsProvider> }; revision?: number; writable?: boolean }
  mutate(ops: Array<{ op: 'set' | 'unset'; path: string[]; value?: unknown }>, expectedRevision?: number): Promise<void>
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

function ModelSelectNested({ locked, available, directory, load, select, configureEfforts }: ModelSelectProps) {
  const state = useSyncExternalStore((fn) => directory.subscribe(fn), () => directory.getSnapshot())
  const [open, setOpen] = useState(false)
  const [pane, setPane] = useState<'root' | 'model' | 'effort'>('root')
  const [toast, setToast] = useState<{ seq: number; text: string } | null>(null)
  const [configuring, setConfiguring] = useState(false)
  const toastSeq = useRef(0)
  const lastActionRef = useRef<'load' | 'select'>('load')
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
  const id = useId()

  const choices = useMemo(() => state.groups.flatMap(group => group.models.map(model => ({
    group,
    model,
    selection: { provider: group.id, model: model.id, ...(model.reasoning?.defaultEffort === undefined ? {} : { reasoningEffort: model.reasoning.defaultEffort }) },
  }))), [state.groups])
  const selectedIndex = state.current === null ? -1 : choices.findIndex(choice => choice.selection.provider === state.current?.provider && choice.selection.model === state.current.model)
  const currentChoice = choices[selectedIndex]
  const reasoning = currentChoice?.model.reasoning
  const effectiveEffort = state.current?.reasoningEffort ?? reasoning?.defaultEffort
  const effortLabel = reasoning === undefined ? undefined : effectiveEffort === undefined ? t('effort.providerDefault') : reasoning.efforts.find(level => level.id === effectiveEffort)?.name ?? effectiveEffort
  const effortChoices = useMemo<readonly EffortChoice[]>(() => reasoning === undefined ? [] : [
    ...(reasoning.defaultEffort === undefined ? [{ key: 'provider-default', effort: undefined, label: t('effort.providerDefault') }] : []),
    ...reasoning.efforts.map(level => ({ key: `effort:${level.id}`, effort: level.id, label: level.name, ...(level.description === undefined ? {} : { description: level.description }) })),
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

  const close = (restoreFocus = false): void => {
    setOpen(false); setPane('root')
    if (restoreFocus) queueMicrotask(() => triggerRef.current?.focus())
  }
  const show = (): void => { setPane('root'); setOpen(true); reload() }
  const goBack = (): void => { if (pane !== 'root') setPane('root'); else close(true) }
  const moveFocus = (offset: number): void => {
    const items = itemRefs.current.filter((item): item is HTMLButtonElement => item !== null)
    if (items.length === 0) return
    const active = items.findIndex(item => item === document.activeElement)
    items[(Math.max(active, 0) + offset + items.length) % items.length]?.focus()
  }
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'Escape' && open) { event.preventDefault(); goBack(); return }
    if (open && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) { event.preventDefault(); moveFocus(event.key === 'ArrowDown' ? 1 : -1) }
  }
  const onBlur = (event: React.FocusEvent<HTMLDivElement>): void => {
    if (event.relatedTarget instanceof Node && rootRef.current?.contains(event.relatedTarget)) return
    close()
  }
  const settleSelection = (accepted: boolean): void => {
    if (accepted) { close(true); return }
    toastSeq.current += 1
    setToast({ seq: toastSeq.current, text: t('error.action', { message: directory.getSnapshot().error ?? t('config.failed') }) })
  }
  const choose = (selection: Selection): void => {
    if (state.current?.provider === selection.provider && state.current.model === selection.model) { close(true); return }
    lastActionRef.current = 'select'
    void select(selection).then(settleSelection, () => settleSelection(false))
  }
  const chooseEffort = (effort: string | undefined): void => {
    if (state.current === null || effectiveEffort === effort) { close(true); return }
    lastActionRef.current = 'select'
    void select({ provider: state.current.provider, model: state.current.model, ...(effort === undefined ? {} : { reasoningEffort: effort }) }).then(settleSelection, () => settleSelection(false))
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

  itemRefs.current = []
  let itemIndex = 0
  const itemRef = (): ((node: HTMLButtonElement | null) => void) => { const at = itemIndex++; return node => { itemRefs.current[at] = node } }
  const modelLabel = state.current === null ? t('trigger.fallback') : currentChoice?.model.name ?? `${state.current.provider}/${state.current.model}`
  const triggerLabel = effortLabel === undefined ? modelLabel : `${modelLabel} · ${effortLabel}`
  const triggerAria = state.current === null ? t('trigger.selectAria') : effortLabel === undefined ? t('trigger.aria', { model: modelLabel }) : t('trigger.ariaEffort', { model: modelLabel, effort: effortLabel })
  const activeModelGroup = pane === 'model' ? state.groups : []
  const back = <button ref={itemRef()} type="button" role="menuitem" className={c.cell} onClick={goBack}><IconChevronLeftOutline14 className={c.back} /><span className={c.cellLabel}>{t('menu.back')}</span></button>

  return <div ref={rootRef} className={c.root} onKeyDown={onKeyDown} onBlur={onBlur}>
    <button ref={triggerRef} type="button" className={c.trigger} aria-label={triggerAria} aria-haspopup="menu" aria-expanded={open} aria-controls={open ? `${id}-menu` : undefined} title={triggerLabel} disabled={locked} onClick={() => open ? close() : show()}>
      <span className={c.triggerLabel}>{modelLabel}</span>
      {effortLabel !== undefined && <span className={c.triggerEffort}>{effortLabel}</span>}
      <IconChevronDownOutline14 className={clsx(c.chevron, open && c.chevronOpen)} />
    </button>
    {open && <div id={`${id}-menu`} className={c.menu} role="menu" aria-label={t('menu.aria')} aria-busy={state.status === 'loading' || busy}>
      {pane === 'root' && <>
        <button ref={itemRef()} type="button" role="menuitem" className={c.cell} onClick={() => setPane('model')}><span className={c.cellLabel}>{t('menu.model')}</span><span className={c.cellValue}>{modelLabel}</span><IconChevronRightOutline14 className={c.cellChevron} /></button>
        {(reasoning !== undefined || (configureEfforts !== undefined && state.current !== null)) && <button ref={itemRef()} type="button" role="menuitem" className={c.cell} onClick={() => setPane('effort')}><span className={c.cellLabel}>{t('menu.effort')}</span><span className={c.cellValue}>{effortLabel ?? t('effort.providerDefault')}</span><IconChevronRightOutline14 className={c.cellChevron} /></button>}
      </>}
      {pane === 'model' && <>
        {back}
        {state.status === 'loading' && <div className={c.status}>{t('status.loading')}</div>}
        {state.error !== null && lastActionRef.current === 'load' && <div className={c.error}><span>{t('error.action', { message: state.error })}</span><button type="button" className={c.retry} onClick={reload}>{t('action.reload')}</button></div>}
        {state.failures.map(failure => <div className={c.warning} key={failure.id}><span>{t('warning.groupLoad', { name: failure.name, message: failure.message })}</span><button type="button" className={c.retry} onClick={reload}>{t('action.reload')}</button></div>)}
        <div className={clsx(c.groups, 'scrollable')}>
          {activeModelGroup.map(group => <section role="group" key={group.id}><div className={c.groupTitle}>{group.name}</div>{group.models.map(model => { const selected = state.current?.provider === group.id && state.current.model === model.id; return <button ref={itemRef()} type="button" role="menuitemradio" aria-checked={selected} className={clsx(c.option, selected && c.selected)} key={model.id} title={model.name} disabled={busy} onClick={() => choose({ provider: group.id, model: model.id })}><span className={c.optionCopy}><span className={c.modelName}>{model.name}</span>{model.description !== undefined && <span className={c.description}>{model.description}</span>}</span><span className={c.check}>{selected ? <IconCheckOutline16 /> : null}</span></button> })}</section>)}
        </div>
        {state.status === 'ready' && choices.length === 0 && <div className={c.empty}>{t('empty.models')}</div>}
      </>}
      {pane === 'effort' && <>
        {back}
        {reasoning === undefined && configureEfforts !== undefined && <button ref={itemRef()} type="button" role="menuitem" className={c.cell} disabled={busy} onClick={configure}><span className={c.cellLabel}>{configuring ? t('config.busy') : t('config.efforts')}</span><IconChevronRightOutline14 className={c.cellChevron} /></button>}
        {reasoning === undefined && configureEfforts === undefined && <div className={c.empty}>{t('empty.efforts')}</div>}
        {reasoning !== undefined && state.error !== null && lastActionRef.current === 'load' && <div className={c.error}><span>{t('error.action', { message: state.error })}</span><button type="button" className={c.retry} onClick={reload}>{t('action.reload')}</button></div>}
        {reasoning !== undefined && (effortChoices.length === 0 ? <div className={c.empty}>{t('empty.efforts')}</div> : effortChoices.map(level => <button ref={itemRef()} type="button" role="menuitemradio" aria-checked={effectiveEffort === level.effort} className={clsx(c.option, effectiveEffort === level.effort && c.selected)} key={level.key} disabled={busy} onClick={() => chooseEffort(level.effort)}><span className={c.optionCopy}><span className={c.modelName}>{level.label}</span>{level.description !== undefined && <span className={c.description}>{level.description}</span>}</span><span className={c.check}>{effectiveEffort === level.effort ? <IconCheckOutline16 /> : null}</span></button>))}
      </>}
    </div>}
    {toast !== null && <Toast key={toast.seq} text={toast.text} icon={<IconWarningOutline16 />} anchor={rootRef.current?.closest<HTMLElement>('[data-composer-card]') ?? null} onDone={() => setToast(null)} />}
  </div>
}

/** Build the official llm-pi-ai settings mutation for a custom model. */
async function declareStandardEfforts(scope: SettingsScope | undefined, selection: Selection): Promise<boolean> {
  if (scope === undefined) return false
  const snapshot = scope.getSnapshot()
  const provider = snapshot.value?.providers?.[selection.provider]
  if (snapshot.status !== 'ready' || snapshot.revision === undefined || snapshot.writable === false || provider === undefined) return false
  const models = Array.isArray(provider.models) ? provider.models : []
  const efforts = { ...STANDARD_EFFORTS }
  const ops = models.length > 0
    ? [{ op: 'set' as const, path: ['providers', selection.provider, 'models'], value: models.map(model => model.id === selection.model ? { ...model, reasoningEfforts: efforts } : model) }]
    : [{ op: 'set' as const, path: ['providers', selection.provider, 'modelOverrides', selection.model, 'reasoningEfforts'], value: efforts }]
  await scope.mutate(ops, snapshot.revision)
  const updated = scope.getSnapshot()
  return updated.status === 'ready'
    && updated.revision !== undefined
    && updated.revision > snapshot.revision
}

/** Register the model selector in the official composer seat. */
export function installModelSelect(ctx: ClientContext): void {
  const sessions = ctx.get('sessions') as unknown as { subagentAddress(sessionId: string): unknown } | undefined
  if (sessions === undefined) {
    console.warn('[dsh-hub] model-select skipped: sessions service unavailable')
    return
  }
  // Keep this dependency scoped: the hub client entry stays active even if a
  // future profile omits the model catalog, while the seat waits for the
  // official directory and settings services exactly like dsh's own seat.
  ctx.inject(['modelDirectories'], (scope: ClientContext) => {
    const slots = scope.get('slots')
    const models = scope.get('modelDirectories') as unknown as ModelDirectoriesService | undefined
    if (slots === undefined || models === undefined) {
      console.warn('[dsh-hub] model-select skipped: slots/modelDirectories unavailable')
      return
    }
    // The selector itself only waits for the official model directory. The
    // settings scope is read lazily when the inline declaration action is
    // clicked, so it never delays or disables the model seat.
    slots.inject('conversation.input.model', () => slots.register({
      name: 'conversation.input.model',
      priority: -1,
      inject: (sessionId: string) => {
        const directory = models.directoryFor(sessionId)
        const available = sessions.subagentAddress(sessionId) === undefined
        return {
          available,
          directory: directory.store as unknown as ModelSelectProps['directory'],
          load: () => { if (available) directory.load().catch(() => {}) },
          select: (selection: Selection) => available ? directory.select(selection).then(() => true, () => false) : Promise.resolve(false),
          configureEfforts: (selection: Selection) => declareStandardEfforts(
            scope.get('settingsScope') as unknown as SettingsScope | undefined,
            selection,
          ),
        }
      },
    }, (props: ModelSelectProps) => ModelSelectNested(props)))
    console.log('[dsh-hub] model-select override installed')
  })
}
