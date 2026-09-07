# 第二轮审查 · 代码落地方案报告（升级版）

> 输入：round2-修复方案.md。方案 A 的精确落地（唯一改动文件 model-select.tsx）。

## 改动清单

### 1. CSS 数组新增 1 条规则（在 `._dshnms_chevronOpen` 之后插入）

```ts
'body.mg-dshnms-open [data-composer-seat]{z-index:60 !important}',
```

### 2. `report` 提升为模块级函数（当前嵌套在 installModelSelect 内 :579）

从 `installModelSelect` 内抽出，提升到模块作用域（供组件 useEffect 与 installModelSelect 共用）：

```ts
/** Diagnostic uplink to dsh.log (browser console is not captured by the Folder target). */
function report(msg: string): void {
  try {
    const internals = (window as unknown as {
      __TAURI_INTERNALS__?: { invoke?: (c: string, a?: Record<string, unknown>) => Promise<unknown> }
    }).__TAURI_INTERNALS__
    internals?.invoke?.('diag_report', { msg }).catch?.(() => {})
  } catch {
    // Diagnostics must never break seat registration.
  }
}
```

installModelSelect 内删除原 report 定义，改引用模块级。

### 3. `useEffect([open])` 扩展（closeOutside 同处）

见 round2-修复方案.md 代码形态（class 挂卸 + report on/off + closeOutside 不变 + cleanup 恒 remove）。

## 边界确认（第二轮已核）

- 8 条 setOpen(false) 路径全部收敛 → useEffect cleanup 正确还原 class
- hero/settling 无副作用（trigger disabled）
- !important 压官方 (0,3,0)
- z 60 落空档（>50 <1000）
- 官方 :has 规则互斥触发无冲突
- 菜单打开期间 back-to-bottom/handles 被盖（官方语义一致，可接受）

## 事件链模拟（实施前静态推演升级版）

- t0 点模型按钮 → showProviders → setOpen(true) → useEffect → body class 挂 + report:on
- t1 CSS 规则生效 → seat z 7→60（根上下文比较）
- t2 菜单（absolute，仍在 rootRef 内）渲染 → seat 层 60 > 侧栏 50 → **菜单在侧栏上方绘制，任何宽度（单栏/双栏）均不被遮**
- t3 点供应商 → closeOutside（rootRef.contains=true 不关）→ openModels → 双栏渲染 → 不被遮
- t4 点模型 → select → settleSelection → close → setOpen(false) → useEffect cleanup → class 卸 + report:off → seat 回 7
- t5 Escape/外部点击/onBlur → 同 t4
- 失败降级：若 CSS 不生效（极端），行为=现状（被遮但功能不坏），report:on 可诊断

## 验证计划

1. `npm run build` + `build:client`
2. bundle grep `mg-dshnms-open` + `seat-lift`
3. 门禁（cargo fmt/clippy/test + 插件测试 + verify gates）
4. lib 同步四路径（repo/_up_ release/install/_up_ + dsh-hub-win）
5. verify-release + T1 build:installer
