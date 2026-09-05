/**
 * @dsh-external/dsh-model-efforts — per-model reasoning-effort editor
 * (client half, loaded by the dsh web module loader)
 *
 * Renders a settings-page section (settings.section id='model-efforts',
 * order=35) that configures the reasoning/thinking-effort levels of custom
 * (pi-ai) models. Writes go through the OFFICIAL llm-pi-ai settings
 * namespace via ctx.settingsScope (same channel and trust level as the
 * official Models settings page): schema validation, revision fencing and
 * hot reload are provided by dsh. Effort levels declared here flow into the
 * host model catalog (`reasoning.efforts`), which is where the composer
 * model seat (official or dsh-hub's nested override) reads the selectable
 * levels from — the host rejects undeclared levels, so there is no way to
 * fake them client-side.
 *
 * Write paths (round-3 review decision):
 *  - catalog-only route (resolved `models` == []): per-model
 *    `providers.<route>.modelOverrides.<modelId>.reasoningEfforts`
 *    set/unset ops;
 *  - hand-declared route (resolved `models` non-empty): a single op setting
 *    the whole `providers.<route>.models` array (read-modify-write) — array
 *    index paths are FORBIDDEN (settings applyPathOp replaces an array
 *    mid-node with a plain object).
 *
 * Pure helpers are mirrored onto globalThis.__dshModelEffortsInternals so
 * node:test can exercise them without a browser.
 */

const THINKING_LEVELS = ['off', 'minimal', 'low', 'medium', 'high', 'xhigh', 'max']

/** Recursively drop undefined values (settings cloneJsonShaped rejects them). */
function stripUndefined(value) {
  if (Array.isArray(value)) return value.map(stripUndefined)
  if (value !== null && typeof value === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(value)) {
      if (v === undefined) continue
      out[k] = stripUndefined(v)
    }
    return out
  }
  return value
}

/**
 * Mirror of the llm-pi-ai write-time validation (catalog.ts:683-705).
 * Returns null when `efforts` is a valid declaration, else a reason string.
 * Valid forms: `false` (non-reasoning model) or a non-empty dict whose keys
 * are known thinking levels, where only `off` may map to null (declared but
 * valueless = never send a parameter), no empty-string values, and at least
 * one non-off level must be declared.
 */
function validateEfforts(efforts) {
  if (efforts === false) return null
  if (efforts === null || typeof efforts !== 'object' || Array.isArray(efforts)) {
    return 'reasoningEfforts must be false or an object'
  }
  const keys = Object.keys(efforts)
  if (keys.length === 0) return 'declare at least one effort level, set false, or omit'
  for (const key of keys) {
    if (!THINKING_LEVELS.includes(key)) return `unknown effort level: ${key}`
    const v = efforts[key]
    if (key !== 'off' && v === null) return `only the 'off' level may have a null value`
    if (typeof v === 'string' && v === '') return `effort level ${key} must not be an empty string`
    if (v !== null && typeof v !== 'string') return `effort level ${key} must be a string or null`
  }
  const nonOff = keys.filter((k) => k !== 'off')
  if (nonOff.length === 0) return 'declaring only "off" is not allowed'
  return null
}

/**
 * Route write mode: catalog-only routes take per-model modelOverrides;
 * hand-declared routes (models array non-empty) must be written as a whole
 * array (read-modify-write).
 */
function pickWriteMode(resolvedModels) {
  return Array.isArray(resolvedModels) && resolvedModels.length > 0 ? 'array' : 'override'
}

/**
 * Build settings path ops for one model intent.
 *
 * @param {string} route        provider route id (settings.yaml llm-pi-ai.providers key)
 * @param {string} modelId      model entry id
 * @param {object|false|null} efforts  declaration; null = remove (back to inherited)
 * @param {Array|null} resolvedModels  current resolved models array of the route
 * @returns {Array<{op:'set'|'unset', path:string[], value?:unknown}>}
 * @throws when the declaration fails validation or the route shape is unexpected
 */
function buildOps(route, modelId, efforts, resolvedModels) {
  // Shape-drift guard: the resolved value is always an array (schema default
  // materializes []) — anything else non-null means the wire shape changed.
  if (resolvedModels != null && !Array.isArray(resolvedModels)) {
    throw new Error(`route ${route}: models is not an array`)
  }
  const mode = pickWriteMode(resolvedModels)
  if (mode === 'override') {
    const path = ['providers', route, 'modelOverrides', modelId, 'reasoningEfforts']
    if (efforts === null) return [{ op: 'unset', path }]
    const err = validateEfforts(efforts)
    if (err) throw new Error(err)
    return [{ op: 'set', path, value: stripUndefined(efforts) }]
  }
  if (!Array.isArray(resolvedModels)) throw new Error(`route ${route}: models is not an array`)
  const next = resolvedModels.map((m) => {
    if (!m || m.id !== modelId) return m
    const { reasoningEfforts, ...rest } = m
    return efforts === null ? rest : { ...rest, reasoningEfforts: stripUndefined(efforts) }
  })
  return [{ op: 'set', path: ['providers', route, 'models'], value: stripUndefined(next) }]
}

// Test-facing mirror (see test/index.test.mjs). Harmless on the web side.
globalThis.__dshModelEffortsInternals = {
  THINKING_LEVELS,
  stripUndefined,
  validateEfforts,
  pickWriteMode,
  buildOps,
}

if (typeof window !== 'undefined' && window.__ModuleLoader__) {
  window.__ModuleLoader__.load({
    id: '@dsh-external/dsh-model-efforts',
    factory: (require) => {
      var module = { exports: {} }
      var exports = module.exports
      const React = require('react')
      const { useState, useSyncExternalStore, createElement } = React

      // ── i18n (zh key source; en mirror) ────────────────────────────────
      const zh = {
        'ui.title': '思考强度配置',
        'ui.desc': '为自定义模型声明可用的思考强度档位。档位经官方 llm-pi-ai 设置通道写入，保存即生效（无需重启），并会出现在模型选择菜单中。',
        'ui.unavailable': '模型服务未就绪，稍后自动重试…',
        'ui.empty': '尚未发现自定义模型。请先在「模型」设置页添加供应商/模型，再回到本页配置思考强度。',
        'ui.readonly': '当前设置不可写，无法编辑。',
        'ui.mode.inherit': '继承',
        'ui.mode.false': '非推理模型',
        'ui.mode.custom': '自定义档位',
        'ui.level.off': '关闭（不发参数）',
        'ui.saved': '已保存',
        'ui.saveFailed': '保存失败：{message}',
        'ui.conflict': '设置已被其他窗口修改，已重新读取，请重试。',
        'ui.save': '保存',
        'ui.route': '路由',
        'ui.arrayHint': '该路由为手填模型列表，保存时整体写回。',
      }
      const en = {
        'ui.title': 'Reasoning efforts',
        'ui.desc': 'Declare the available reasoning-effort levels for custom models. Written through the official llm-pi-ai settings channel; saves apply on the next request (no restart) and appear in the model selection menu.',
        'ui.unavailable': 'Model service not ready, retrying automatically…',
        'ui.empty': 'No custom models found. Add a provider/model on the Models settings page first, then come back here.',
        'ui.readonly': 'Settings are read-only; editing is disabled.',
        'ui.mode.inherit': 'Inherit',
        'ui.mode.false': 'Non-reasoning model',
        'ui.mode.custom': 'Custom levels',
        'ui.level.off': 'off (no parameter)',
        'ui.saved': 'Saved',
        'ui.saveFailed': 'Save failed: {message}',
        'ui.conflict': 'Settings changed elsewhere; reloaded — please retry.',
        'ui.save': 'Save',
        'ui.route': 'Route',
        'ui.arrayHint': 'Hand-declared route: saved as a whole model list.',
      }
      const lang = () => (document.documentElement.getAttribute('lang') || '').startsWith('zh') ? zh : en
      const t = (key, params) => {
        const dict = lang()
        let s = dict[key] ?? zh[key] ?? key
        if (params) s = s.replace(/\{(\w+)\}/g, (_, k) => params[k] ?? '')
        return s
      }

      // Draft state of one model row: 'inherit' | 'false' | 'custom'
      function draftFromModel(currentEfforts) {
        if (currentEfforts === false) return { mode: 'false', levels: {} }
        if (currentEfforts && typeof currentEfforts === 'object') {
          return { mode: 'custom', levels: { ...currentEfforts } }
        }
        return { mode: 'inherit', levels: {} }
      }

      function draftToEfforts(draft) {
        if (draft.mode === 'false') return false
        if (draft.mode === 'custom') {
          const out = {}
          for (const level of THINKING_LEVELS) {
            if (level in draft.levels) out[level] = draft.levels[level]
          }
          return out
        }
        return null // inherit = remove declaration
      }

      function ModelEffortsSection({ controller }) {
        const snap = useSyncExternalStore((cb) => controller.subscribe(cb), () => controller.getSnapshot())
        const [drafts, setDrafts] = useState({})
        const [toast, setToast] = useState(null)
        const [saving, setSaving] = useState(false)

        const status = snap.status
        const writable = snap.writable !== false
        const providers = (status === 'ready' && snap.value && snap.value.providers) || {}
        const routes = Object.keys(providers).sort()

        const setDraft = (route, modelId, next) => {
          setDrafts((d) => ({ ...d, [route + '\u0000' + modelId]: next }))
        }
        const draftOf = (route, modelId, current) => {
          const key = route + '\u0000' + modelId
          return drafts[key] ?? draftFromModel(current)
        }

        const save = async () => {
          setSaving(true)
          setToast(null)
          try {
            const ops = []
            for (const route of routes) {
              const provider = providers[route] || {}
              const resolvedModels = Array.isArray(provider.models) ? provider.models : []
              const overrides = provider.modelOverrides || {}
              // Models visible for this route: hand-declared entries plus
              // existing overrides (catalog routes have no client-side
              // model list; v1 enumerates overrides only — see README).
              const modelIds = new Set()
              for (const m of resolvedModels) if (m && m.id) modelIds.add(m.id)
              for (const id of Object.keys(overrides)) {
                if (overrides[id] && 'reasoningEfforts' in overrides[id]) modelIds.add(id)
              }
              for (const modelId of modelIds) {
                const current = resolvedModels.find((m) => m && m.id === modelId)?.reasoningEfforts
                  ?? (overrides[modelId] && overrides[modelId].reasoningEfforts)
                  ?? undefined
                const draft = draftOf(route, modelId, current)
                const desired = draftToEfforts(draft)
                // Skip untouched rows (inherit rows with no existing declaration).
                if (draft.mode === 'inherit' && current === undefined) continue
                if (draft.mode !== 'inherit' && JSON.stringify(desired) === JSON.stringify(current === undefined ? null : current)) continue
                ops.push(...buildOps(route, modelId, desired, resolvedModels))
              }
            }
            if (ops.length === 0) { setToast({ kind: 'ok', text: t('ui.saved') }); return }
            await controller.mutate(ops, snap.revision)
            setDrafts({})
            setToast({ kind: 'ok', text: t('ui.saved') })
          } catch (error) {
            const message = error && error.message ? error.message : String(error)
            setToast({ kind: 'err', text: message.includes('conflict') ? t('ui.conflict') : t('ui.saveFailed', { message }) })
          } finally {
            setSaving(false)
          }
        }

        const children = []
        children.push(createElement('h3', { key: 'h', style: { margin: '0 0 4px', fontSize: 14 } }, t('ui.title')))
        children.push(createElement('p', { key: 'd', style: { margin: '0 0 12px', color: 'var(--dsw-alias-label-secondary, inherit)', fontSize: 12, lineHeight: '18px' } }, t('ui.desc')))

        if (status === 'unavailable' || status === 'loading') {
          children.push(createElement('div', { key: 'u', style: { padding: '12px 0', color: 'var(--dsw-alias-label-tertiary, inherit)', fontSize: 13 } }, t('ui.unavailable')))
        } else if (routes.length === 0) {
          children.push(createElement('div', { key: 'e', style: { padding: '12px 0', color: 'var(--dsw-alias-label-tertiary, inherit)', fontSize: 13 } }, t('ui.empty')))
        } else if (!writable) {
          children.push(createElement('div', { key: 'r', style: { padding: '12px 0', color: 'var(--dsw-alias-state-warn-label, inherit)', fontSize: 13 } }, t('ui.readonly')))
        } else {
          for (const route of routes) {
            const provider = providers[route] || {}
            const resolvedModels = Array.isArray(provider.models) ? provider.models : []
            const overrides = provider.modelOverrides || {}
            const rows = []
            const modelIds = new Set()
            for (const m of resolvedModels) if (m && m.id) modelIds.add(m.id)
            for (const id of Object.keys(overrides)) {
              if (overrides[id] && 'reasoningEfforts' in overrides[id]) modelIds.add(id)
            }
            for (const modelId of modelIds) {
              const current = resolvedModels.find((m) => m && m.id === modelId)?.reasoningEfforts
                ?? (overrides[modelId] && overrides[modelId].reasoningEfforts)
                ?? undefined
              const draft = draftOf(route, modelId, current)
              const key = route + '#' + modelId
              const modeControls = createElement('div', { key: 'm', style: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' } },
                [['inherit', t('ui.mode.inherit')], ['false', t('ui.mode.false')], ['custom', t('ui.mode.custom')]].map(([mode, label]) =>
                  createElement('label', { key: mode, style: { display: 'inline-flex', gap: 4, alignItems: 'center', fontSize: 12, cursor: 'pointer' } },
                    createElement('input', {
                      type: 'radio', name: key, checked: draft.mode === mode,
                      onChange: () => setDraft(route, modelId, draftFromModel(mode === 'inherit' ? undefined : mode === 'false' ? false : (current && typeof current === 'object' ? current : {}))),
                    }),
                    label)))
              const levelControls = draft.mode === 'custom'
                ? createElement('div', { key: 'l', style: { display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 } },
                    THINKING_LEVELS.map((level) => {
                      const on = level in draft.levels
                      return createElement('label', { key: level, style: { display: 'inline-flex', gap: 3, alignItems: 'center', fontSize: 12, cursor: 'pointer', border: '1px solid var(--dsw-alias-border-l2, transparent)', borderRadius: 12, padding: '1px 8px' } },
                        createElement('input', {
                          type: 'checkbox', checked: on,
                          onChange: (e) => {
                            const next = { ...draft.levels }
                            if (e.target.checked) next[level] = level === 'off' ? null : level
                            else delete next[level]
                            setDraft(route, modelId, { ...draft, levels: next })
                          },
                        }),
                        level === 'off' ? t('ui.level.off') : level)
                    }))
                : null
              rows.push(createElement('div', {
                key,
                style: { border: '1px solid var(--dsw-alias-border-l2, transparent)', borderRadius: 8, padding: '8px 10px', marginBottom: 6 },
              },
                createElement('div', { style: { fontWeight: 600, fontSize: 13, marginBottom: 4 } },
                  modelId,
                  createElement('span', { style: { fontWeight: 400, color: 'var(--dsw-alias-label-caption, inherit)', marginLeft: 8, fontSize: 11 } }, t('ui.route') + ': ' + route)),
                modeControls,
                levelControls))
            }
            children.push(createElement('div', { key: route, style: { marginBottom: 10 } },
              createElement('div', { style: { fontSize: 12, color: 'var(--dsw-alias-label-secondary, inherit)', margin: '6px 0 4px' } },
                t('ui.route') + ': ' + route + (resolvedModels.length > 0 ? ' · ' + t('ui.arrayHint') : '')),
              rows.length > 0 ? rows : createElement('div', { style: { fontSize: 12, color: 'var(--dsw-alias-label-tertiary, inherit)' } }, t('ui.empty'))))
          }
          children.push(createElement('button', {
            key: 'save', type: 'button', disabled: saving,
            onClick: () => { void save() },
            style: { marginTop: 8, padding: '5px 14px', borderRadius: 16, border: '1px solid var(--dsw-alias-border-l2, transparent)', cursor: 'pointer' },
          }, saving ? '…' : t('ui.save')))
        }

        if (toast) {
          children.push(createElement('div', {
            key: 'toast',
            style: { marginTop: 8, fontSize: 12, color: toast.kind === 'ok' ? 'var(--dsw-alias-state-success-primary, inherit)' : 'var(--dsw-alias-state-error-primary, inherit)' },
          }, toast.text))
        }

        return createElement('div', { style: { maxWidth: 880 } }, children)
      }

      exports.inject = ['slots', 'remote', 'remote.settings', 'settingsScope']
      exports.apply = function apply(ctx) {
        const controller = ctx.settingsScope.bind({ namespace: 'llm-pi-ai' })
        ctx.effect(() => ctx.slots.inject('settings.section', () =>
          ctx.slots.register({
            name: 'settings.section',
            id: 'model-efforts',
            order: 35,
            label: () => createElement('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 6 } }, t('ui.title')),
            inject: () => ({})
          }, (props) => ModelEffortsSection({ ...props, controller }))), 'dsh-model-efforts: section')
      }
      return module.exports
    }
  })
}
