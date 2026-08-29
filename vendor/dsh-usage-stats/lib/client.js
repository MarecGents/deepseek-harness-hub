window.__ModuleLoader__.load({
  id: '@dsh-external/dsh-usage-stats',
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    const React = require('react');
    const { useEffect, useState, useCallback, useRef, createElement } = React;

    const PROVIDER_NAMES = {
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
      'openai': 'OpenAI',
      'anthropic': 'Anthropic',
      'google': 'Google',
      'groq': 'Groq',
      'mistral': 'Mistral'
    };
    const providerLabel = (p) => (p && PROVIDER_NAMES[p]) ? PROVIDER_NAMES[p] : (p || '未知');

    // 每百万 token 单价（估算；可按 provider 修改）。cacheWrite 暂不计费。
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
    const USD_CNY = 7.2;
    const costFor = (m) => {
      const p = PRICES[m.provider] || {};
      return ((m.input || 0) / 1e6 * (p.input || 0)) + ((m.output || 0) / 1e6 * (p.output || 0)) + ((m.cacheRead || 0) / 1e6 * (p.cacheRead || 0));
    };
    const fmtMoney = (n) => '$' + (isFinite(n) ? n.toFixed(2) : '—');

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
    const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekdayOf = (date) => { const d = new Date(date + 'T00:00:00'); return WEEKDAYS[d.getDay()] || ''; };
    const todayStr = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
    const monthStr = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); };
    const hitRate = (o) => {
      const denom = (o.input || 0) + (o.cacheRead || 0);
      return denom > 0 ? ((o.cacheRead || 0) / denom * 100) : null;
    };
    const pct = (n) => (n == null ? '—' : n.toFixed(1) + '%');

    function UsageStatsSection() {
      const [data, setData] = useState(null);
      const [error, setError] = useState('');
      const [loading, setLoading] = useState(true);
      const [refreshing, setRefreshing] = useState(false);
      const [selProvider, setSelProvider] = useState('');
      const [selModel, setSelModel] = useState('');
      const [timeRange, setTimeRange] = useState('all');
      const [selDay, setSelDay] = useState('');
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
        setPricesMsg('保存中…');
        try {
          const r = await fetch('/dsh-usage-stats/api/prices', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ modelPrices: priceDraft || {}, exchangeRate }) });
          const j = await r.json();
          setPricesMsg(j && j.ok ? '已保存，正在刷新…' : '保存失败: ' + JSON.stringify(j));
          if (j && j.ok) load(true);
        } catch (e) { setPricesMsg('保存失败: ' + String(e)); }
      };
      const pollTimer = useRef(null);
      const load = useCallback((force) => {
        setLoading(true);
        setError('');
        fetch('/dsh-usage-stats/api/overview' + (force ? '?refresh=1' : ''))
          .then((r) => r.json())
          .then((d) => {
            setData(d);
            setLoading(false);
            setRefreshing(!!d.refreshing);
            // 后台刷新中且尚未拿到完整数据：轮询回填，避免冷启动打开一直“加载中…”
            if (d && d.refreshing && !d.total) {
              if (pollTimer.current) clearTimeout(pollTimer.current);
              pollTimer.current = setTimeout(() => load(false), 1500);
            }
          })
          .catch((e) => { setError(String(e)); setLoading(false); setRefreshing(false); });
      }, []);
      useEffect(() => { load(false); }, [load]);
      useEffect(() => () => { if (pollTimer.current) clearTimeout(pollTimer.current); }, []);
      useEffect(() => {
        if (data && data.prices && data.prices.exchangeRate) {
          setExchangeRate(data.prices.exchangeRate);
        }
      }, [data]);

      const header = createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 } },
        createElement('span', { style: { fontSize: 16, fontWeight: 600 } }, '用量统计'),
        refreshing ? createElement('span', { style: { fontSize: 12, color: 'var(--dsw-alias-label-tertiary,#888)', marginRight: 8 } }, '后台刷新中…') : null,
        createElement('button', {
          onClick: () => { if (data) { setPricesText(JSON.stringify(data.prices || {}, null, 2)); setPricesMsg(''); } setShowPrices(!showPrices); },
          style: { border: '1px solid var(--dsw-alias-border-l2, #333)', background: 'transparent', color: 'var(--dsw-alias-label-primary,#eee)', borderRadius: 14, padding: '4px 12px', cursor: 'pointer', fontSize: 13, marginRight: 8 }
        }, '单价设置'),
        createElement('button', {
          onClick: () => load(true),
          style: { border: '1px solid var(--dsw-alias-border-l2, #333)', background: 'transparent', color: 'var(--dsw-alias-label-primary,#eee)', borderRadius: 14, padding: '4px 14px', cursor: 'pointer', fontSize: 13 }
        }, '刷新'));

      let body;
      if (loading) {
        body = createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 6 } },
          createElement('span', { style: label }, '统计聚合中…'),
          createElement('span', { style: { ...label, color: 'var(--dsw-alias-label-tertiary,#888)' } }, '后台计算中，完成后自动填充'));
      } else if (error) {
        body = createElement('div', { style: { color: '#e5484d' } }, '无法读取：' + error);
      } else if (!data || !data.total) {
        body = createElement('div', { style: label }, '无法读取（暂无数据）');
      } else {
        const raw = data.byModel || [];
        const now = Date.now();
        const cutoff = timeRange === '7d' ? now - 7 * 86400000 : timeRange === '30d' ? now - 30 * 86400000 : 0;
        const row = (lab, v) => createElement(StatCell, { label: lab, value: fmt(v) });
        // 单价：按模型配置，未配置的落到供应商内置默认
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

        // 每个模型按时间段窗口求和（时间段全局生效）
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

        // ── 顶栏范围（跟随筛选 + 时间段）──
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

        // ── 按天列表（跟随筛选 + 时间段）──
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
          createElement('span', { style: label }, '筛选'),
          createElement('select', { value: selProvider, onChange: (e) => { setSelProvider(e.target.value); setSelModel(''); }, style: selectStyle },
            createElement('option', { value: '' }, '全部供应商'),
            ...providers.map((p) => createElement('option', { key: p, value: p }, providerLabel(p)))),
          createElement('select', { value: selModel, onChange: (e) => setSelModel(e.target.value), style: selectStyle, disabled: !selProvider },
            createElement('option', { value: '' }, selProvider ? '全部模型' : '请先选供应商'),
            ...modelsOfProvider.map((mdl) => createElement('option', { key: mdl, value: mdl }, mdl))),
          createElement('select', { value: timeRange, onChange: (e) => setTimeRange(e.target.value), style: selectStyle },
            createElement('option', { value: 'all' }, '全部时间'),
            createElement('option', { value: '7d' }, '近 7 天'),
            createElement('option', { value: '30d' }, '近 30 天')),
          (selProvider || selModel || timeRange !== 'all')
            ? createElement('button', { onClick: () => { setSelProvider(''); setSelModel(''); setTimeRange('all'); }, style: { border: 'none', background: 'transparent', color: 'var(--dsw-alias-state-error-primary,#e5484d)', cursor: 'pointer', fontSize: 13 } }, '重置')
            : null);

        // ── 单价设置 ──
        let priceCard = null
        if (showPrices) {
          const inputStyle = { width: '100%', boxSizing: 'border-box', background: 'var(--dsw-alias-bg-layer-1,#1a1a1a)', color: 'var(--dsw-alias-label-primary,#eee)', border: '1px solid var(--dsw-alias-border-l2,#333)', borderRadius: 6, padding: '4px 6px', fontSize: 12 };
          const toggleStyle = (active) => ({ border: '1px solid var(--dsw-alias-border-l2,#333)', background: active ? 'var(--dsw-alias-brand-primary,#4f7cff)' : 'transparent', color: 'var(--dsw-alias-label-primary,#eee)', borderRadius: 6, padding: '3px 10px', cursor: 'pointer', fontSize: 12 });
          // 按供应商分组（参考用量统计：先供应商，点开才是模型）
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
                  createElement('button', { onClick: () => togglePin(provider), style: toggleStyle(pinnedProviders.has(provider)) }, pinnedProviders.has(provider) ? '已置顶' : '置顶'),
                  createElement('button', { onClick: () => togglePriceProvider(provider), style: toggleStyle(expanded) }, expanded ? '收起 ▴' : '展开 ▾'))),
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
              createElement('span', { style: { fontSize: 14, fontWeight: 600 } }, '单价设置（每百万 token）'),
              createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 4 } },
                createElement('button', { onClick: () => setCurrency('usd'), style: toggleStyle(currency === 'usd') }, 'USD'),
                createElement('button', { onClick: () => setCurrency('cny'), style: toggleStyle(currency === 'cny') }, 'RMB'))),
            createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 } },
              createElement('span', { style: label }, '汇率 (1 USD =)'),
              createElement('input', { type: 'number', step: '0.01', min: '0', value: exchangeRate, onChange: (e) => setExchangeRate(Number(e.target.value) || 0), style: { width: 80, ...inputStyle } }),
              createElement('span', { style: label }, 'RMB'),
              createElement('button', { onClick: () => setRateMsg('实时汇率获取暂未实现（占位）'), style: toggleStyle(false) }, '实时'),
              rateMsg ? createElement('span', { style: label }, rateMsg) : null),
            createElement('div', { style: { display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 8, padding: '6px 0', color: 'var(--dsw-alias-label-tertiary,#888)', fontSize: 12, borderBottom: '1px solid var(--dsw-alias-border-l2,#333)' } },
              createElement('span', {}, '模型'),
              createElement('span', {}, '输入'),
              createElement('span', {}, '输出'),
              createElement('span', {}, '缓存读')),
            ...priceBlocks,
            createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 } },
              createElement('button', { onClick: savePrices, style: { border: '1px solid var(--dsw-alias-brand-primary,#4f7cff)', background: 'transparent', color: 'var(--dsw-alias-label-primary,#eee)', borderRadius: 14, padding: '4px 16px', cursor: 'pointer', fontSize: 13 } }, '保存单价'),
              createElement('span', { style: label }, pricesMsg)));
        }

        // ── 顶栏用量卡片 ──
        const topTitle = scopeTitle ? scopeTitle + ' · 用量' : '总计 · 共 ' + data.sessionCount + ' 个会话' + (timeRange === 'all' ? '' : '（' + (timeRange === '7d' ? '近7天' : '近30天') + '）');
        const todayTokens = filteredDays.filter((d) => d.date === todayStr()).reduce((a, d) => a + (d.tokens != null ? d.tokens : sumTokens(d)), 0);
        const monthTokens = filteredDays.filter((d) => d.date.startsWith(monthStr())).reduce((a, d) => a + (d.tokens != null ? d.tokens : sumTokens(d)), 0);
        const scopeHit = hitRate(scope);
        const topCard = createElement('div', { style: scopeTitle ? Object.assign({}, card, { borderColor: 'var(--dsw-alias-brand-primary,#4f7cff)' }) : card },
          createElement('span', { style: label }, topTitle),
          createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 16 } },
            ...buckets.map(([key, , lab]) => row(lab, scope[key])),
            scopeReq != null ? row('请求数', scopeReq) : null,
            row('合计 tokens', sumTokens(scope)),
            row('今日', todayTokens),
            row('本月', monthTokens),
            row('缓存命中率', pct(scopeHit)),
            row('费用(估)', fmtMoney(scopeCost))));

        // ── 模型用量表（含费用列）──
        // ── 各模型用量（卡片式，按供应商分组，默认只显示用量最多的模型）──
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
          // 选中了该供应商（未进一步选具体模型）时自动展开，直接列出全部模型及各自用量，
          // 避免“只能看总用量、看不到按模型细分”。
          const autoExpanded = selProvider === provider && !selModel;
          const shown = (expanded || autoExpanded) ? models : [top];
          return createElement('div', { key: provider, style: { marginBottom: 10 } },
            createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '6px 2px' } },
              createElement('span', { style: { fontSize: 14, fontWeight: 600, color: 'var(--dsw-alias-label-primary,#eee)' } }, (pinned ? '📌 ' : '') + providerLabel(provider)),
              createElement('span', { style: { fontSize: 12, color: 'var(--dsw-alias-label-tertiary,#888)' } }, '合计 ' + fmt(total) + ' · ' + fmtMoney(cost)),
              createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6 } },
                createElement('button', { onClick: () => togglePin(provider), style: pinBtnStyle(pinned), title: pinned ? '取消置顶' : '置顶' }, pinned ? '已置顶' : '置顶'),
                createElement('button', {
                  onClick: () => toggleProvider(provider),
                  style: { display: 'inline-flex', alignItems: 'center', gap: 4, border: '1px solid var(--dsw-alias-border-l2,#333)', background: 'var(--dsw-alias-bg-layer-1,#1a1a1a)', color: 'var(--dsw-alias-label-primary,#eee)', borderRadius: 14, padding: '4px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600 },
                }, expanded ? '收起 ▴' : '展开 ▾'))),
            createElement('div', { style: { maxHeight: expanded ? 320 : undefined, overflowY: expanded ? 'auto' : 'visible', paddingRight: expanded ? 4 : 0 } },
              shown.map((m) => createElement('div', { key: m.provider + '/' + m.model, style: modelCardStyle },
                createElement('div', { style: modelLine1 }, m.model || 'unknown'),
                createElement('div', { style: modelLine2 },
                  createElement('span', {}, '请求 ' + fmt(m.requests)),
                  ...activeBuckets(m).map(([key, lab]) => createElement('span', { key: key }, (key === 'input' && !(m.cacheRead > 0) ? '输入' : lab) + ' ' + fmt(m[key] || 0))),
                  createElement('span', {}, '合计 ' + fmt(sumTokens(m))),
                  createElement('span', {}, '费用 ' + fmtMoney(costFor(m))),
                  !(m.cacheRead > 0) && createElement('span', { style: { gridColumn: '1 / -1', color: 'var(--dsw-alias-label-tertiary,#888)' } }, '（无法读取缓存命中，仅显示输入）'))))))
        });
        const modelCard = createElement('div', { style: card },
          createElement('span', { style: { fontSize: 14, fontWeight: 600, marginBottom: 4 } }, '各模型用量'),
          createElement('div', { style: { maxHeight: 260, overflowY: 'auto', paddingRight: 4 } },
            providerBlocks.length ? providerBlocks : createElement('div', { style: label }, '（无匹配数据）')));

        // ── 按天统计（趋势图 + 表格）──
        const daySum = filteredDays.reduce((a, d) => { a.input += d.input; a.output += d.output; a.cacheRead += d.cacheRead; a.cacheWrite += d.cacheWrite; return a; }, { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 });
        const dayBuckets = activeBuckets(daySum);
        const dayGridCols = 'minmax(0,1.2fr) repeat(' + (dayBuckets.length + 2) + ',minmax(0,1fr))';
        const dayHead = createElement('div', { style: { display: 'grid', gridTemplateColumns: dayGridCols, gap: 10, padding: '10px 0', color: 'var(--dsw-alias-label-tertiary,#888)', fontSize: 12, borderBottom: '1px solid var(--dsw-alias-border-l2,#333)' } },
          createElement('span', {}, '日期'),
          createElement('span', {}, '请求数'),
          ...dayBuckets.map(([, lab]) => createElement('span', { key: lab }, lab)),
          createElement('span', {}, '合计'));
        const dayRows = filteredDays.map((d) => createElement('div', { key: d.date, onClick: () => setSelDay(selDay === d.date ? '' : d.date), style: { display: 'grid', gridTemplateColumns: dayGridCols, gap: 10, padding: '10px 6px', alignItems: 'center', borderBottom: '1px solid var(--dsw-alias-border-l2,#222)', color: 'var(--dsw-alias-label-primary,#eee)', fontSize: 13, cursor: 'pointer', background: selDay === d.date ? 'var(--dsw-alias-brand-primary,#4f7cff)' : 'transparent' } },
          createElement('span', {}, d.date + ' ' + weekdayOf(d.date)),
          createElement('span', {}, fmt(d.requests)),
          ...dayBuckets.map(([key]) => createElement('span', { key: key }, fmt(d[key] || 0))),
          createElement('span', {}, fmt(d.tokens != null ? d.tokens : sumTokens(d)))));
        // ── 多模型每日 token 趋势图（不同模型不同颜色折线）──
        const LINE_COLORS = ['#4f7cff', '#ff6b6b', '#ffd93d', '#6bcb77', '#9b59b6', '#e67e22', '#1abc9c', '#e84393', '#f39c12', '#00cec9'];
        const trendModels = filtered.filter((m) => m.requests > 0 || m.input > 0 || m.output > 0);
        const dateSet = new Set();
        for (const m of trendModels) for (const d of (m.byDay || [])) if (!cutoff || dayTime(d.date) >= cutoff) dateSet.add(d.date);
        const trendDates = [...dateSet].sort();
        const series = trendModels.map((m) => {
          const byDate = new Map();
          for (const d of (m.byDay || [])) if (!cutoff || dayTime(d.date) >= cutoff) byDate.set(d.date, d.tokens != null ? d.tokens : sumTokens(d));
          return { label: m.model, provider: m.provider, values: trendDates.map((date) => byDate.get(date) || 0) };
        });
        const tMax = Math.max(1, ...series.flatMap((s) => s.values));
        const PLOT_W = 640, PLOT_H = 150, PAD_L = 44, PAD_B = 20, PAD_T = 8;
        const innerW = PLOT_W - PAD_L, innerH = PLOT_H - PAD_T - PAD_B;
        const xOf = (i) => PAD_L + (trendDates.length > 1 ? i / (trendDates.length - 1) * innerW : innerW / 2);
        const yOf = (v) => PAD_T + innerH - (v / tMax * innerH);
        const gridLines = [0, 0.25, 0.5, 0.75, 1].map((f) => {
          const y = PAD_T + innerH - f * innerH;
          return createElement('line', { key: 'g' + f, x1: PAD_L, x2: PLOT_W, y1: y, y2: y, stroke: 'var(--dsw-alias-border-l2,#333)', strokeWidth: 1, strokeDasharray: '3 3' });
        });
        const yLabels = [0, 0.25, 0.5, 0.75, 1].map((f) => {
          const y = PAD_T + innerH - f * innerH;
          return createElement('text', { key: 'yl' + f, x: PAD_L - 6, y: y + 3, textAnchor: 'end', fontSize: 9, fill: 'var(--dsw-alias-label-tertiary,#888)' }, fmt(tMax * f));
        });
        const xLabels = trendDates.map((date, i) => createElement('text', { key: 'xl' + i, x: xOf(i), y: PLOT_H - 6, textAnchor: 'middle', fontSize: 9, fill: 'var(--dsw-alias-label-tertiary,#888)' }, date.slice(5)));
        const lines = series.map((s, si) => {
          const pts = s.values.map((v, i) => xOf(i) + ',' + yOf(v)).join(' ');
          return createElement('polyline', { key: 'line' + si, points: pts, fill: 'none', stroke: LINE_COLORS[si % LINE_COLORS.length], strokeWidth: 2, strokeLinejoin: 'round', strokeLinecap: 'round' });
        });
        const trendSvg = createElement('svg', { width: PLOT_W, height: PLOT_H, viewBox: '0 0 ' + PLOT_W + ' ' + PLOT_H, style: { display: 'block', margin: '6px 0', maxWidth: '100%' } },
          gridLines, yLabels, xLabels, lines);
        const legend = createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '4px 12px', marginBottom: 6 } },
          series.map((s, i) => createElement('span', { key: s.provider + '/' + s.label, style: { display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--dsw-alias-label-primary,#eee)' } },
            createElement('span', { style: { width: 10, height: 10, borderRadius: 2, background: LINE_COLORS[i % LINE_COLORS.length], display: 'inline-block' } }),
            s.label)));
        const dayTitle = '按天统计' + (scopeTitle ? ' · ' + scopeTitle : '') + (timeRange === 'all' ? '' : ' · ' + (timeRange === '7d' ? '近 7 天' : '近 30 天'));
        // ── 按天下钻到模型：点某天 → 显示该天各模型用量 ──
        const dayDrill = selDay ? filtered
          .map((m) => ({ m, dd: (m.byDay || []).find((d) => d.date === selDay) }))
          .filter((x) => x.dd && (x.dd.requests > 0 || x.dd.input > 0 || x.dd.output > 0))
          .sort((a, b) => sumTokens(b.dd) - sumTokens(a.dd)) : [];
        const drillBlock = selDay ? createElement('div', { style: { marginTop: 8, borderTop: '1px solid var(--dsh-alias-border-l2,#333)', paddingTop: 8 } },
          createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 } },
            createElement('span', { style: { fontSize: 13, fontWeight: 600 } }, selDay + ' 各模型用量'),
            createElement('button', { onClick: () => setSelDay(''), style: { border: 'none', background: 'transparent', color: 'var(--dsh-alias-state-error-primary,#e5484d)', cursor: 'pointer', fontSize: 12 } }, '关闭')),
          dayDrill.length ? dayDrill.map(({ m, dd }) => createElement('div', { key: m.provider + '/' + m.model, style: { display: 'flex', justifyContent: 'space-between', gap: 8, padding: '4px 0', fontSize: 12, color: 'var(--dsh-alias-label-primary,#eee)' } },
            createElement('span', {}, providerLabel(m.provider) + ' / ' + m.model),
            createElement('span', {}, fmt(dd.tokens != null ? dd.tokens : sumTokens(dd))))) : createElement('div', { style: label }, '（该日无数据）')) : null;
        const dayCard = createElement('div', { style: card },
          createElement('span', { style: { fontSize: 14, fontWeight: 600, marginBottom: 4 } }, dayTitle),
          trendModels.length && trendDates.length ? legend : null,
          trendModels.length && trendDates.length ? trendSvg : null,
          createElement('div', { style: { maxHeight: 200, overflowY: 'auto', overflowX: 'auto' } },
            dayHead,
            dayRows.length ? dayRows : createElement('div', { style: label }, '（无数据）')),
          drillBlock);

        body = createElement('div', {}, filterBar, priceCard, dayCard, topCard, modelCard);
      }

      return createElement('div', { style: { fontFamily: 'system-ui, sans-serif', maxWidth: 880 } }, header, body);
    }

    exports.inject = ['slots'];
    exports.apply = function apply(ctx) {
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
            '用量统计'),
          inject: () => ({})
        }, UsageStatsSection)), 'dsh-usage-stats: section');
    };
    return module.exports;
  }
});