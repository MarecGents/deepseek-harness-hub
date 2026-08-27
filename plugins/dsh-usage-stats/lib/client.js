/**
 * @dsh-external/dsh-usage-stats — usage statistics (client half)
 *
 * Renders a settings-page section (settings.section id='usage') showing the
 * aggregated token usage overview fetched from the same-origin
 * /dsh-usage-stats/api/overview endpoint (POST /dsh-usage-stats/api/prices
 * persists per-model unit prices). Loaded by the dsh client module loader;
 * requires the `slots` service.
 */
window.__ModuleLoader__.load({
  id: '@dsh-external/dsh-usage-stats',
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    const React = require('react');
    const { useEffect, useState, useCallback, createElement } = React;

    // Provider display names (UI copy — Chinese on purpose).
    const zhNames = {
  'deepseek-official': 'DeepSeek 官方',
  'deepseek': 'DeepSeek',
  'tokenrhythm': 'TokenRhythm',
  'opencode-go': 'OpenCode Go',
  'opencode-zen-free': 'OpenCode Zen 免费',
  'ollama-local': 'Ollama 本地',
  'ollama': 'Ollama',
  'amd': 'AMD',
  'sensenova': '商汤日日新',
  'moonshot': '月之暗面',
  'zhipu': '智谱 GLM',
  'baidu': '百度千帆',
  'aliyun': '阿里云百炼',
};
const enNames = {
  'deepseek-official': 'DeepSeek Official',
  'deepseek': 'DeepSeek',
  'tokenrhythm': 'TokenRhythm',
  'opencode-go': 'OpenCode Go',
  'opencode-zen-free': 'OpenCode Zen Free',
  'ollama-local': 'Ollama Local',
  'ollama': 'Ollama',
  'amd': 'AMD',
  'sensenova': 'SenseNova',
  'moonshot': 'Moonshot',
  'zhipu': 'Zhipu GLM',
  'baidu': 'Baidu Qianfan',
  'aliyun': 'Alibaba Bailian',
};
// i18n lookup — language follows dsh (Settings → General → Language writes
// <html lang>), same convention as the dsh-hub locale.ts. Resolved per call
// so a live language switch is picked up by the next render.
const zhDict = { 'ui.title': '用量统计', 'ui.prices': '单价设置', 'ui.pricePerM': '单价设置（每百万 token）', 'ui.refresh': '刷新', 'ui.savePrices': '保存单价', 'ui.saving': '保存中…', 'ui.savedRefreshing': '已保存，正在刷新…', 'ui.saveFailed': '保存失败: ', 'ui.refreshing': '后台刷新中…', 'ui.loading': '统计中…', 'ui.readFailed': '无法读取：', 'ui.empty': '无法读取（暂无数据）', 'ui.rate': '汇率 (1 USD =)', 'ui.rateLive': '实时', 'ui.ratePlaceholder': '实时汇率获取暂未实现（占位）', 'ui.headModel': '模型', 'ui.headInput': '输入', 'ui.headOutput': '输出', 'ui.headCacheRead': '缓存读', 'ui.date': '日期', 'ui.reqCount': '请求数', 'ui.req': '请求 ', 'ui.total': '合计', 'ui.estCost': '费用(估)', 'ui.perModel': '各模型用量', 'ui.byDay': '按天统计', 'ui.cost': '费用 ', 'ui.cacheMissNote': '（无法读取缓存命中，仅显示输入）', 'ui.noMatch': '（无匹配数据）', 'ui.noData': '（无数据）', 'ui.bucketTotal': '合计 tokens', 'sum.usage': ' · 用量', 'sum.total': '总计 · 共 ', 'sum.sessions': ' 个会话', 'sum.last7d': '近7天', 'sum.last30d': '近30天', 'bucket.cacheRead': '输入命中缓存', 'bucket.input': '输入未命中缓存', 'bucket.output': '输出', 'bucket.cacheWrite': '缓存写', 'filter.label': '筛选', 'filter.allProviders': '全部供应商', 'filter.allModels': '全部模型', 'filter.chooseProvider': '请先选供应商', 'filter.allTime': '全部时间', 'filter.last7d': '近 7 天', 'filter.last30d': '近 30 天', 'filter.reset': '重置', 'pin.pinned': '已置顶', 'pin.pin': '置顶', 'pin.unpin': '取消置顶', 'pin.collapse': '收起 ▴', 'pin.expand': '展开 ▾', 'p.unknown': '未知' };
const enDict = { 'ui.title': 'Usage statistics', 'ui.prices': 'Unit prices', 'ui.pricePerM': 'Unit prices (per million tokens)', 'ui.refresh': 'Refresh', 'ui.savePrices': 'Save prices', 'ui.saving': 'Saving…', 'ui.savedRefreshing': 'Saved, refreshing…', 'ui.saveFailed': 'Save failed: ', 'ui.refreshing': 'Refreshing in background…', 'ui.loading': 'Loading…', 'ui.readFailed': 'Failed to read: ', 'ui.empty': 'Failed to read (no data yet)', 'ui.rate': 'Exchange rate (1 USD =)', 'ui.rateLive': 'Live', 'ui.ratePlaceholder': 'Live exchange rate not implemented (placeholder)', 'ui.headModel': 'Model', 'ui.headInput': 'Input', 'ui.headOutput': 'Output', 'ui.headCacheRead': 'Cache read', 'ui.date': 'Date', 'ui.reqCount': 'Requests', 'ui.req': 'Req ', 'ui.total': 'Total', 'bucket.cacheRead': 'Cache hit (input)', 'bucket.input': 'Input (cache miss)', 'bucket.output': 'Output', 'bucket.cacheWrite': 'Cache write', 'filter.label': 'Filter', 'filter.allProviders': 'All providers', 'filter.allModels': 'All models', 'filter.chooseProvider': 'Select a provider first', 'filter.allTime': 'All time', 'filter.last7d': 'Last 7 days', 'filter.last30d': 'Last 30 days', 'filter.reset': 'Reset', 'pin.pinned': 'Pinned', 'pin.pin': 'Pin', 'pin.collapse': 'Collapse ▴', 'pin.expand': 'Expand ▾', 'p.unknown': 'Unknown', 'ui.estCost': 'Cost (est.)', 'ui.perModel': 'Per-model usage', 'ui.byDay': 'Daily breakdown', 'ui.cost': 'Cost ', 'ui.cacheMissNote': '(cache-hit data unavailable, input shown only)', 'ui.noMatch': '(no matching data)', 'ui.noData': '(no data)', 'ui.bucketTotal': 'Total tokens', 'sum.usage': ' · usage', 'sum.total': 'Total · ', 'sum.sessions': ' sessions', 'sum.last7d': 'Last 7d', 'sum.last30d': 'Last 30d', 'pin.unpin': 'Unpin' };
const t = (key) => {
  const en = (document.documentElement.lang || '').toLowerCase().startsWith('en');
  const d = en ? enDict : zhDict;
  return d[key] !== undefined ? d[key] : (zhDict[key] !== undefined ? zhDict[key] : key);
};
const bucketLabel = (key) => t(key);
const providerLabel = (p) => {
  if (!p) return t('p.unknown');
  if (zhNames[p] !== undefined) {
    const en = (document.documentElement.lang || '').toLowerCase().startsWith('en');
    return en ? (enNames[p] || zhNames[p]) : zhNames[p];
  }
  return p;
};

    // Default unit prices per million tokens (estimates; overridable per
    // provider/model from the settings page). cacheWrite is not billed.
    const PRICES = {
      'deepseek-official': { input: 0.14, output: 0.28, cacheRead: 0.014 },
      'deepseek': { input: 0.14, output: 0.28, cacheRead: 0.014 },
      'tokenrhythm': { input: 0.2, output: 0.4, cacheRead: 0.02 },
      'opencode-go': { input: 0.25, output: 0.5, cacheRead: 0.025 },
      'opencode-zen-free': { input: 0, output: 0, cacheRead: 0 },
      'ollama-local': { input: 0, output: 0, cacheRead: 0 },
      'ollama': { input: 0, output: 0, cacheRead: 0 },
      'amd': { input: 0.2, output: 0.4, cacheRead: 0.02 },
      'sensenova': { input: 0.15, output: 0.3, cacheRead: 0.015 },
      'zhipu': { input: 0.15, output: 0.3, cacheRead: 0.015 },
      'moonshot': { input: 0.2, output: 0.4, cacheRead: 0.02 },
      'bailian': { input: 0.15, output: 0.3, cacheRead: 0.015 }
    };

    const fmt = (n) => {
      if (!isFinite(n)) return '—'
      if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B'
      if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M'
      if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
      return String(n)
    }

    const card = {
      border: '1px solid var(--dsw-alias-border-l2, #333)',
      borderRadius: 12,
      padding: '14px 16px',
      marginBottom: 12,
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    };
    const label = { color: 'var(--dsw-alias-label-tertiary, #888)', fontSize: 12, lineHeight: '18px' };
    const value = { color: 'var(--dsw-alias-label-primary, #eee)', fontSize: 20, fontWeight: 600, lineHeight: '26px' };

    function StatCell(props) {
      return createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 2, minWidth: 90 } },
        createElement('span', { style: label }, props.label),
        createElement('span', { style: value }, props.value));
    }

    // [key, short label, full label] — UI copy kept Chinese.
    const BUCKET_DEFS = [
      ['cacheRead', '输入命中缓存', '输入命中缓存 tokens'],
      ['input', '输入未命中缓存', '输入未命中缓存 tokens'],
      ['output', '输出', '输出 tokens'],
      ['cacheWrite', '缓存写', '缓存写 tokens']
    ];
    const activeBuckets = (obj) => BUCKET_DEFS.filter(([k]) => (obj[k] || 0) > 0);
    const sumTokens = (o) => (o.input || 0) + (o.output || 0) + (o.cacheRead || 0) + (o.cacheWrite || 0);
    const dayTime = (date) => new Date(date + 'T00:00:00').getTime();
    const zeroDay = (date) => ({ date, requests: 0, input: 0, output: 0, cacheRead: 0, cacheWrite: 0 });

    function UsageStatsSection() {
      const [data, setData] = useState(null);
      const [error, setError] = useState('');
      const [loading, setLoading] = useState(true);
      const [refreshing, setRefreshing] = useState(false);
      const [selProvider, setSelProvider] = useState('');
      const [selModel, setSelModel] = useState('');
      const [timeRange, setTimeRange] = useState('all');
      const [showPrices, setShowPrices] = useState(false);
      const [pricesText, setPricesText] = useState('');
      const [pricesMsg, setPricesMsg] = useState('');
      const [currency, setCurrency] = useState('usd');
      const [priceDraft, setPriceDraft] = useState(null);
      const [exchangeRate, setExchangeRate] = useState(7.2);
      const [rateMsg, setRateMsg] = useState('');
      const [expandedPriceProviders, setExpandedPriceProviders] = useState(new Set(['deepseek-official']));
      const togglePriceProvider = (p) => {
        setExpandedPriceProviders((prev) => {
          const n = new Set(prev);
          if (n.has(p)) n.delete(p); else n.add(p);
          return n;
        });
      };
      const [expandedProviders, setExpandedProviders] = useState(new Set(['deepseek-official']));
      const toggleProvider = (p) => {
        setExpandedProviders((prev) => {
          const n = new Set(prev);
          if (n.has(p)) n.delete(p); else n.add(p);
          return n;
        });
      };
      // Provider pinning persists in localStorage.
      const [pinnedProviders, setPinnedProviders] = useState(() => {
        try { return new Set(JSON.parse(localStorage.getItem('dsh-usage-pins') || '[]')); } catch { return new Set(); }
      });
      const togglePin = (p) => {
        setPinnedProviders((prev) => {
          const n = new Set(prev);
          if (n.has(p)) n.delete(p); else n.add(p);
          try { localStorage.setItem('dsh-usage-pins', JSON.stringify([...n])); } catch {}
          return n;
        });
      };
      const savePrices = async () => {
        setPricesMsg(t('ui.saving'));
        try {
          const r = await fetch('/dsh-usage-stats/api/prices', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ modelPrices: priceDraft || {}, exchangeRate }) });
          const j = await r.json();
          setPricesMsg(j && j.ok ? t('ui.savedRefreshing') : t('ui.saveFailed') + JSON.stringify(j));
          if (j && j.ok) load(true);
        } catch (e) { setPricesMsg(t('ui.saveFailed') + String(e)); }
      };
      // Same-origin fetch of the overview (force=1 triggers a background rescan).
      const load = useCallback((force) => {
        setLoading(true);
        setError('');
        fetch('/dsh-usage-stats/api/overview' + (force ? '?refresh=1' : ''))
          .then((r) => r.json())
          .then((d) => { setData(d); setLoading(false); setRefreshing(!!d.refreshing); })
          .catch((e) => { setError(String(e)); setLoading(false); setRefreshing(false); });
      }, []);
      useEffect(() => { load(false); }, [load]);
      useEffect(() => {
        if (data && data.prices && data.prices.exchangeRate) {
          setExchangeRate(data.prices.exchangeRate);
        }
      }, [data]);

      const header = createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 } },
        createElement('span', { style: { fontSize: 16, fontWeight: 600 } }, t('ui.title')),
        refreshing ? createElement('span', { style: { fontSize: 12, color: 'var(--dsw-alias-label-tertiary,#888)', marginRight: 8 } }, t('ui.refreshing')) : null,
        createElement('button', {
          onClick: () => { if (data) { setPricesText(JSON.stringify(data.prices || {}, null, 2)); setPricesMsg(''); } setShowPrices(!showPrices); },
          style: { border: '1px solid var(--dsw-alias-border-l2, #333)', background: 'transparent', color: 'var(--dsw-alias-label-primary,#eee)', borderRadius: 14, padding: '4px 12px', cursor: 'pointer', fontSize: 13, marginRight: 8 }
        }, t('ui.prices')),
        createElement('button', {
          onClick: () => load(true),
          style: { border: '1px solid var(--dsw-alias-border-l2, #333)', background: 'transparent', color: 'var(--dsw-alias-label-primary,#eee)', borderRadius: 14, padding: '4px 14px', cursor: 'pointer', fontSize: 13 }
        }, t('ui.refresh')));

      let body;
      if (loading) {
        body = createElement('div', { style: label }, t('ui.loading'));
      } else if (error) {
        body = createElement('div', { style: { color: 'var(--dsw-alias-state-error-primary,#e5484d)' } }, t('ui.readFailed') + error);
      } else if (!data || !data.total) {
        body = createElement('div', { style: label }, t('ui.empty'));
      } else {
        const raw = data.byModel || [];
        const now = Date.now();
        const cutoff = timeRange === '7d' ? now - 7 * 86400000 : timeRange === '30d' ? now - 30 * 86400000 : 0;
        const row = (lab, v) => createElement(StatCell, { label: lab, value: fmt(v) });
        // Prices: per-model overrides win, falling back to provider defaults.
        const saved = data.prices || {};
        const modelPrices = saved.modelPrices || {};
        const costFor = (m) => {
          const mp = modelPrices[m.provider + '/' + m.model] || {};
          const p = PRICES[m.provider] || {};
          const input = mp.input !== undefined ? Number(mp.input) : (p.input || 0);
          const output = mp.output !== undefined ? Number(mp.output) : (p.output || 0);
          const cacheRead = mp.cacheRead !== undefined ? Number(mp.cacheRead) : (p.cacheRead || 0);
          return ((m.input || 0) / 1e6 * input) + ((m.output || 0) / 1e6 * output) + ((m.cacheRead || 0) / 1e6 * cacheRead);
        };
        const fmtMoney = (n) => {
          if (!isFinite(n)) return '—';
          return currency === 'cny' ? '¥' + (n * exchangeRate).toFixed(2) : '$' + n.toFixed(2);
        };

        // Sum each model over the selected time window (window applies globally).
        const winModels = raw.map((m) => {
          const days = (m.byDay || []).filter((d) => !cutoff || dayTime(d.date) >= cutoff);
          const s = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, requests: 0 };
          for (const d of days) { s.input += d.input || 0; s.output += d.output || 0; s.cacheRead += d.cacheRead || 0; s.cacheWrite += d.cacheWrite || 0; s.requests += d.requests || 0; }
          return { provider: m.provider, model: m.model, byDay: days, input: s.input, output: s.output, cacheRead: s.cacheRead, cacheWrite: s.cacheWrite, requests: s.requests };
        }).filter((m) => m.requests > 0 || m.input > 0 || m.output > 0);

        const global = winModels.reduce((a, m) => { a.input += m.input; a.output += m.output; a.cacheRead += m.cacheRead; a.cacheWrite += m.cacheWrite; a.requests += m.requests; return a; }, { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, requests: 0 });
        const providers = [...new Set(winModels.map((m) => m.provider).filter(Boolean))].sort();
        const modelsOfProvider = selProvider ? [...new Set(winModels.filter((m) => m.provider === selProvider).map((m) => m.model).filter(Boolean))].sort() : [];
        const filtered = winModels.filter((m) => (!selProvider || m.provider === selProvider) && (!selModel || m.model === selModel));
        const selected = selProvider && selModel ? filtered.find((m) => m.provider === selProvider && m.model === selModel) || null : null;

        // ── Top summary scope (follows filter + time range) ──
        let scope, scopeTitle, scopeReq, scopeCost;
        if (selected) {
          scope = { input: selected.input, output: selected.output, cacheRead: selected.cacheRead, cacheWrite: selected.cacheWrite };
          scopeTitle = providerLabel(selected.provider) + ' / ' + selected.model;
          scopeReq = selected.requests; scopeCost = costFor(selected);
        } else if (selProvider) {
          const rows = winModels.filter((m) => m.provider === selProvider);
          const sum = (k) => rows.reduce((a, m) => a + (m[k] || 0), 0);
          scope = { input: sum('input'), output: sum('output'), cacheRead: sum('cacheRead'), cacheWrite: sum('cacheWrite') };
          scopeTitle = providerLabel(selProvider); scopeReq = sum('requests'); scopeCost = rows.reduce((a, m) => a + costFor(m), 0);
        } else {
          scope = { input: global.input, output: global.output, cacheRead: global.cacheRead, cacheWrite: global.cacheWrite };
          scopeTitle = null; scopeReq = global.requests; scopeCost = winModels.reduce((a, m) => a + costFor(m), 0);
        }
        const buckets = activeBuckets(scope);

        // ── Per-day rows (follows filter + time range) ──
        let dayBase;
        if (selected) {
          dayBase = (selected.byDay || []).map((d) => ({ ...d }));
        } else if (selProvider) {
          const byDate = new Map();
          for (const mm of winModels.filter((m) => m.provider === selProvider)) {
            for (const dd of (mm.byDay || [])) {
              let acc = byDate.get(dd.date);
              if (!acc) { acc = zeroDay(dd.date); byDate.set(dd.date, acc); }
              acc.requests += dd.requests || 0; acc.input += dd.input || 0; acc.output += dd.output || 0; acc.cacheRead += dd.cacheRead || 0; acc.cacheWrite += dd.cacheWrite || 0;
            }
          }
          dayBase = [...byDate.values()];
        } else {
          const byDate = new Map();
          for (const mm of winModels) {
            for (const dd of (mm.byDay || [])) {
              let acc = byDate.get(dd.date);
              if (!acc) { acc = zeroDay(dd.date); byDate.set(dd.date, acc); }
              acc.requests += dd.requests || 0; acc.input += dd.input || 0; acc.output += dd.output || 0; acc.cacheRead += dd.cacheRead || 0; acc.cacheWrite += dd.cacheWrite || 0;
            }
          }
          dayBase = [...byDate.values()];
        }
        const filteredDays = dayBase.filter((d) => !cutoff || dayTime(d.date) >= cutoff)
          .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

        const selectStyle = { border: '1px solid var(--dsw-alias-border-l2,#333)', background: 'var(--dsw-alias-bg-layer-1,#1a1a1a)', color: 'var(--dsw-alias-label-primary,#eee)', borderRadius: 8, padding: '4px 8px', fontSize: 13 };
        const filterBar = createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 12 } },
          createElement('span', { style: label }, t('filter.label')),
          createElement('select', { value: selProvider, onChange: (e) => { setSelProvider(e.target.value); setSelModel(''); }, style: selectStyle },
            createElement('option', { value: '' }, t('filter.allProviders')),
            ...providers.map((p) => createElement('option', { key: p, value: p }, providerLabel(p)))),
          createElement('select', { value: selModel, onChange: (e) => setSelModel(e.target.value), style: selectStyle, disabled: !selProvider },
            createElement('option', { value: '' }, selProvider ? t('filter.allModels') : t('filter.chooseProvider')),
            ...modelsOfProvider.map((mdl) => createElement('option', { key: mdl, value: mdl }, mdl))),
          createElement('select', { value: timeRange, onChange: (e) => setTimeRange(e.target.value), style: selectStyle },
            createElement('option', { value: 'all' }, t('filter.allTime')),
            createElement('option', { value: '7d' }, t('filter.last7d')),
            createElement('option', { value: '30d' }, t('filter.last30d'))),
          (selProvider || selModel || timeRange !== 'all')
            ? createElement('button', { onClick: () => { setSelProvider(''); setSelModel(''); setTimeRange('all'); }, style: { border: 'none', background: 'transparent', color: 'var(--dsw-alias-state-error-primary,#e5484d)', cursor: 'pointer', fontSize: 13 } }, t('filter.reset'))
            : null);

        // ── Price settings ──
        let priceCard = null
        if (showPrices) {
          const inputStyle = { width: '100%', boxSizing: 'border-box', background: 'var(--dsw-alias-bg-layer-1,#1a1a1a)', color: 'var(--dsw-alias-label-primary,#eee)', border: '1px solid var(--dsw-alias-border-l2,#333)', borderRadius: 6, padding: '4px 6px', fontSize: 12 };
          const toggleStyle = (active) => ({ border: '1px solid var(--dsw-alias-border-l2,#333)', background: active ? 'var(--dsw-alias-brand-primary,#4f7cff)' : 'transparent', color: 'var(--dsw-alias-label-primary,#eee)', borderRadius: 6, padding: '3px 10px', cursor: 'pointer', fontSize: 12 });
          // Group prices by provider (provider first, models expand on click).
          const priceByProvider = new Map();
          for (const m of filtered) {
            const p = m.provider || '?';
            if (!priceByProvider.has(p)) priceByProvider.set(p, []);
            priceByProvider.get(p).push(m);
          }
          const priceProviderList = [...priceByProvider.entries()].sort((a, b) => {
            const pa = pinnedProviders.has(a[0]) ? 0 : 1;
            const pb = pinnedProviders.has(b[0]) ? 0 : 1;
            if (pa !== pb) return pa - pb;
            return a[0].localeCompare(b[0]);
          });
          const priceBlocks = priceProviderList.map(([provider, models]) => {
            const expanded = expandedPriceProviders.has(provider);
            const setModelVal = (model, key, v) => setPriceDraft((prev) => ({ ...(prev || {}), [provider + '/' + model]: { ...((prev && prev[provider + '/' + model]) || {}), [key]: v } }));
            return createElement('div', { key: provider, style: { marginBottom: 8 } },
              createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 2px' } },
                createElement('span', { style: { fontSize: 13, fontWeight: 600, color: 'var(--dsw-alias-label-primary,#eee)' } }, (pinnedProviders.has(provider) ? '📌 ' : '') + providerLabel(provider)),
                createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6 } },
                  createElement('button', { onClick: () => togglePin(provider), style: toggleStyle(pinnedProviders.has(provider)) }, pinnedProviders.has(provider) ? t('pin.pinned') : t('pin.pin')),
                  createElement('button', { onClick: () => togglePriceProvider(provider), style: toggleStyle(expanded) }, expanded ? t('pin.collapse') : t('pin.expand')))),
              expanded && models.map((m) => {
                const key = provider + '/' + m.model;
                const draft = (priceDraft && priceDraft[key]) || {};
                const base = modelPrices[key] || PRICES[provider] || {};
                return createElement('div', { key: key, style: { display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 8, alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--dsw-alias-border-l2,#222)' } },
                  createElement('span', { style: { fontSize: 12, color: 'var(--dsw-alias-label-primary,#eee)' } }, m.model),
                  createElement('input', { type: 'number', step: '0.001', min: '0', value: draft.input !== undefined ? draft.input : (base.input ?? 0), onChange: (e) => setModelVal(m.model, 'input', e.target.value), style: inputStyle }),
                  createElement('input', { type: 'number', step: '0.001', min: '0', value: draft.output !== undefined ? draft.output : (base.output ?? 0), onChange: (e) => setModelVal(m.model, 'output', e.target.value), style: inputStyle }),
                  createElement('input', { type: 'number', step: '0.001', min: '0', value: draft.cacheRead !== undefined ? draft.cacheRead : (base.cacheRead ?? 0), onChange: (e) => setModelVal(m.model, 'cacheRead', e.target.value), style: inputStyle }));
              }));
          });
          priceCard = createElement('div', { style: card },
            createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 } },
              createElement('span', { style: { fontSize: 14, fontWeight: 600 } }, t('ui.pricePerM')),
              createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 4 } },
                createElement('button', { onClick: () => setCurrency('usd'), style: toggleStyle(currency === 'usd') }, 'USD'),
                createElement('button', { onClick: () => setCurrency('cny'), style: toggleStyle(currency === 'cny') }, 'RMB'))),
            createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 } },
              createElement('span', { style: label }, t('ui.rate')),
              createElement('input', { type: 'number', step: '0.01', min: '0', value: exchangeRate, onChange: (e) => setExchangeRate(Number(e.target.value) || 0), style: { width: 80, ...inputStyle } }),
              createElement('span', { style: label }, 'RMB'),
              createElement('button', { onClick: () => setRateMsg(t('ui.ratePlaceholder')), style: toggleStyle(false) }, t('ui.rateLive')),
              rateMsg ? createElement('span', { style: label }, rateMsg) : null),
            createElement('div', { style: { display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 8, padding: '6px 0', color: 'var(--dsw-alias-label-tertiary,#888)', fontSize: 12, borderBottom: '1px solid var(--dsw-alias-border-l2,#333)' } },
              createElement('span', {}, t('ui.headModel')),
              createElement('span', {}, t('ui.headInput')),
              createElement('span', {}, t('ui.headOutput')),
              createElement('span', {}, t('ui.headCacheRead'))),
            ...priceBlocks,
            createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 } },
              createElement('button', { onClick: savePrices, style: { border: '1px solid var(--dsw-alias-brand-primary,#4f7cff)', background: 'transparent', color: 'var(--dsw-alias-label-primary,#eee)', borderRadius: 14, padding: '4px 16px', cursor: 'pointer', fontSize: 13 } }, t('ui.savePrices')),
              createElement('span', { style: label }, pricesMsg)));
        }

        // ── Top usage summary card ──
        const topTitle = scopeTitle ? scopeTitle + t('sum.usage') : t('sum.total') + data.sessionCount + t('sum.sessions') + (timeRange === 'all' ? '' : '（' + (timeRange === '7d' ? t('sum.last7d') : t('sum.last30d')) + '）');
        const topCard = createElement('div', { style: scopeTitle ? Object.assign({}, card, { borderColor: 'var(--dsw-alias-brand-primary,#4f7cff)' }) : card },
          createElement('span', { style: label }, topTitle),
          createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 16 } },
            ...buckets.map(([key]) => row(bucketLabel('bucket.' + key) + ' tokens', scope[key])),
            scopeReq != null ? row(t('ui.reqCount'), scopeReq) : null,
            row(t('ui.bucketTotal'), sumTokens(scope)),
            row(t('ui.estCost'), fmtMoney(scopeCost))));

        // ── Per-model usage (card list grouped by provider; only the top
        //    model is shown until a provider is expanded) ──
        const byProvider = new Map();
        for (const m of filtered) {
          const p = m.provider || '?';
          if (!byProvider.has(p)) byProvider.set(p, []);
          byProvider.get(p).push(m);
        }
        const providerList = [...byProvider.entries()]
          .map(([provider, models]) => {
            const total = models.reduce((a, m) => a + sumTokens(m), 0);
            const cost = models.reduce((a, m) => a + costFor(m), 0);
            const top = [...models].sort((a, b) => sumTokens(b) - sumTokens(a))[0];
            return { provider, models, total, cost, top };
          })
          .sort((a, b) => {
            const pa = pinnedProviders.has(a.provider) ? 0 : 1;
            const pb = pinnedProviders.has(b.provider) ? 0 : 1;
            if (pa !== pb) return pa - pb;
            return b.total - a.total;
          });
        const modelCardStyle = { border: '1px solid var(--dsw-alias-border-l2,#333)', borderRadius: 10, padding: '10px 12px', marginBottom: 8, background: 'var(--dsw-alias-bg-layer-1,#1a1a1a)' };
        const modelLine1 = { fontSize: 14, fontWeight: 600, color: 'var(--dsw-alias-label-primary,#eee)', marginBottom: 4 };
        const modelLine2 = { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: '4px 10px', fontSize: 12, color: 'var(--dsw-alias-label-tertiary,#888)' };
        const pinBtnStyle = (active) => ({ display: 'inline-flex', alignItems: 'center', gap: 4, border: '1px solid var(--dsw-alias-border-l2,#333)', background: active ? 'var(--dsw-alias-brand-primary,#4f7cff)' : 'var(--dsw-alias-bg-layer-1,#1a1a1a)', color: 'var(--dsw-alias-label-primary,#eee)', borderRadius: 14, padding: '4px 10px', cursor: 'pointer', fontSize: 12, fontWeight: 600 });
        const providerBlocks = providerList.map(({ provider, models, total, cost, top }) => {
          const expanded = expandedProviders.has(provider);
          const pinned = pinnedProviders.has(provider);
          const shown = expanded ? models : [top];
          return createElement('div', { key: provider, style: { marginBottom: 10 } },
            createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '6px 2px' } },
              createElement('span', { style: { fontSize: 14, fontWeight: 600, color: 'var(--dsw-alias-label-primary,#eee)' } }, (pinned ? '📌 ' : '') + providerLabel(provider)),
              createElement('span', { style: { fontSize: 12, color: 'var(--dsw-alias-label-tertiary,#888)' } }, t('ui.total') + ' ' + fmt(total) + ' · ' + fmtMoney(cost)),
              createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6 } },
                createElement('button', { onClick: () => togglePin(provider), style: pinBtnStyle(pinned), title: pinned ? t('pin.unpin') : t('pin.pin') }, pinned ? t('pin.pinned') : t('pin.pin')),
                createElement('button', {
                  onClick: () => toggleProvider(provider),
                  style: { display: 'inline-flex', alignItems: 'center', gap: 4, border: '1px solid var(--dsw-alias-border-l2,#333)', background: 'var(--dsw-alias-bg-layer-1,#1a1a1a)', color: 'var(--dsw-alias-label-primary,#eee)', borderRadius: 14, padding: '4px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600 },
                }, expanded ? t('pin.collapse') : t('pin.expand')))),
            createElement('div', { style: { maxHeight: expanded ? 320 : undefined, overflowY: expanded ? 'auto' : 'visible', paddingRight: expanded ? 4 : 0 } },
              shown.map((m) => createElement('div', { key: m.provider + '/' + m.model, style: modelCardStyle },
                createElement('div', { style: modelLine1 }, m.model || 'unknown'),
                createElement('div', { style: modelLine2 },
                  createElement('span', {}, t('ui.req') + fmt(m.requests)),
                  ...activeBuckets(m).map(([key]) => createElement('span', { key: key }, (key === 'input' && !(m.cacheRead > 0) ? t('ui.headInput') : bucketLabel('bucket.' + key)) + ' ' + fmt(m[key] || 0))),
                  createElement('span', {}, t('ui.total') + ' ' + fmt(sumTokens(m))),
                  createElement('span', {}, t('ui.cost') + fmtMoney(costFor(m))),
                  !(m.cacheRead > 0) && createElement('span', { style: { gridColumn: '1 / -1', color: 'var(--dsw-alias-label-tertiary,#888)' } }, t('ui.cacheMissNote')))))))
        });
        const modelCard = createElement('div', { style: card },
          createElement('span', { style: { fontSize: 14, fontWeight: 600, marginBottom: 4 } }, t('ui.perModel')),
          providerBlocks.length ? providerBlocks : createElement('div', { style: label }, t('ui.noMatch')));

        // ── Per-day statistics (trend chart + table) ──
        const daySum = filteredDays.reduce((a, d) => { a.input += d.input; a.output += d.output; a.cacheRead += d.cacheRead; a.cacheWrite += d.cacheWrite; return a; }, { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 });
        const dayBuckets = activeBuckets(daySum);
        const dayGridCols = 'minmax(0,1.2fr) repeat(' + (dayBuckets.length + 2) + ',minmax(0,1fr))';
        const dayHead = createElement('div', { style: { display: 'grid', gridTemplateColumns: dayGridCols, gap: 10, padding: '10px 0', color: 'var(--dsw-alias-label-tertiary,#888)', fontSize: 12, borderBottom: '1px solid var(--dsw-alias-border-l2,#333)' } },
          createElement('span', {}, t('ui.date')),
          createElement('span', {}, t('ui.reqCount')),
          ...dayBuckets.map(([key]) => createElement('span', { key: key }, bucketLabel('bucket.' + key))),
          createElement('span', {}, t('ui.total')));
        const dayRows = filteredDays.map((d) => createElement('div', { key: d.date, style: { display: 'grid', gridTemplateColumns: dayGridCols, gap: 10, padding: '10px 6px', alignItems: 'center', borderBottom: '1px solid var(--dsw-alias-border-l2,#222)', color: 'var(--dsw-alias-label-primary,#eee)', fontSize: 13 } },
          createElement('span', {}, d.date),
          createElement('span', {}, fmt(d.requests)),
          ...dayBuckets.map(([key]) => createElement('span', { key: key }, fmt(d[key] || 0))),
          createElement('span', {}, fmt(d.tokens != null ? d.tokens : sumTokens(d)))));
        // SVG trend chart (chronological, left to right).
        const chartDays = filteredDays.slice().reverse();
        const cMax = Math.max(1, ...chartDays.map((d) => (d.tokens != null ? d.tokens : sumTokens(d)) || 0));
        const BW = 30, GAP = 10, CH = 110, LABEL_H = 18;
        const CW = chartDays.length ? chartDays.length * (BW + GAP) : 0;
        const CHH = CH + LABEL_H + 4;
        const bars = chartDays.map((d, i) => {
          const v = (d.tokens != null ? d.tokens : sumTokens(d)) || 0;
          const bh = Math.max(1, v / cMax * CH);
          return createElement('rect', { key: 'b' + i, x: i * (BW + GAP), y: CH - bh, width: BW, height: bh, fill: 'var(--dsw-alias-brand-primary,#4f7cff)', rx: 3 });
        });
        const labels = chartDays.map((d, i) => createElement('text', { key: 'l' + i, x: i * (BW + GAP) + BW / 2, y: CH + LABEL_H - 4, textAnchor: 'middle', fontSize: 9, fill: 'var(--dsw-alias-label-tertiary,#888)' }, d.date.slice(5)));
        const trendSvg = createElement('svg', { width: CW, height: CHH, viewBox: '0 0 ' + CW + ' ' + CHH, style: { display: 'block', margin: '6px 0' } }, bars, labels);
        const dayTitle = t('ui.byDay') + (scopeTitle ? ' · ' + scopeTitle : '') + (timeRange === 'all' ? '' : ' · ' + (timeRange === '7d' ? t('filter.last7d') : t('filter.last30d')));
        const dayCard = createElement('div', { style: card },
          createElement('span', { style: { fontSize: 14, fontWeight: 600, marginBottom: 4 } }, dayTitle),
          createElement('div', { style: { overflowX: 'auto' } },
            filteredDays.length ? trendSvg : null,
            dayHead,
            dayRows.length ? dayRows : createElement('div', { style: label }, t('ui.noData'))));

        body = createElement('div', {}, filterBar, priceCard, topCard, modelCard, dayCard);
      }

      return createElement('div', { style: { fontFamily: 'system-ui, sans-serif', maxWidth: 880 } }, header, body);
    }

    exports.inject = ['slots'];
    exports.apply = function apply(ctx) {
      // Register the settings-page section (settings.section, id='usage').
      ctx.effect(() => ctx.slots.inject('settings.section', () =>
        ctx.slots.register({
          name: 'settings.section',
          id: 'usage',
          order: 30,
          label: () => React.createElement('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 6 } },
            React.createElement('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true' },
              React.createElement('path', { d: 'M3 21h18' }),
              React.createElement('path', { d: 'M6 16v-6' }),
              React.createElement('path', { d: 'M11 15V9' }),
              React.createElement('path', { d: 'M16 13V5' }),
              React.createElement('path', { d: 'M21 16V8' })),
            t('ui.title')),
          inject: () => ({})
        }, UsageStatsSection)), 'dsh-usage-stats: section');
    };
    return module.exports;
  }
});
