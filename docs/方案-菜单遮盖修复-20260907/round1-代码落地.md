# 第一轮审查 · 代码落地方案报告

> 输入：round1-修复方案.md。方案 A 的精确落地方案。

## 改动文件：`src/client/model-select.tsx`（唯一改动文件）

### 改动 1：CSS 数组加抬座规则（约第 53 行附近，`._dshnms_status` 之前插入）

```ts
// The composer seat (sticky z-index 7) isolates every child into its own
// stacking context; the hub right sidebar (body portal, fixed z-index 50)
// therefore always covers the model menu. Lift the seat above the sidebar
// while the menu is open (menu only exists while open).
'body.mg-dshnms-open [data-composer-seat]{z-index:60 !important}',
```

### 改动 2：菜单打开/关闭时挂/卸 body class

现有 `useEffect`（closeOutside 监听，约第 265-268 行）扩展：

```ts
useEffect(() => {
  if (open) {
    document.body.classList.add('mg-dshnms-open')
  } else {
    document.body.classList.remove('mg-dshnms-open')
  }
  if (!open) return
  const closeOutside = (event: MouseEvent): void => {
    if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
  }
  document.addEventListener('mousedown', closeOutside)
  return () => {
    document.body.classList.remove('mg-dshnms-open')
    document.removeEventListener('mousedown', closeOutside)
  }
}, [open])
```

### 需要确认的边界

1. **hero 阶段**：菜单只在 active 阶段存在（hero 是空态无 composer）——确认后无需 hero 规则；若不确认，加 `[data-phase="hero"] [data-composer-seat]:has(...)` 或 `body.mg-dshnms-open [data-composer-seat]` 规则已覆盖（active 与 hero 的 seat 都是 `[data-composer-seat]`，无需 :has，纯属性选择器对两者都生效——**规则天然覆盖两阶段**，无需额外处理）。hero 阶段 seat 无 z-index，规则给 60 使其成为层叠上下文，菜单（absolute 在 seat 内）随之抬升——成立。
2. **还原**：useEffect 清理时移除 class；`close()` 的所有路径（closeOutside/选择/Escape/onBlur）都走 `setOpen(false)` → useEffect 触发还原。
3. **与官方 `:has` 规则共存**：官方规则 z9 特异性低于 `body.mg-dshnms-open [data-composer-seat]`（(0,2,0) + !important），inline/important 恒赢；且两规则互不干扰（官方菜单与 hub 菜单不同时开）。

## 事件链模拟（实施前静态推演）

- t0 点模型按钮 → showProviders → setOpen(true) → useEffect 挂 `mg-dshnms-open` → CSS 规则把 seat 抬 60
- t1 菜单（absolute，仍在 rootRef 内）在 seat 子树中渲染 → seat 层 60 > 侧栏 50 → **菜单在右侧栏上方绘制**
- t2 点供应商 → mousedown → closeOutside：`rootRef.contains(target)` = true（菜单在 rootRef 内）→ 不关 → click → openModels → 二级菜单渲染（双栏 520px，仍在 seat 内，层 60）→ 不被侧栏遮
- t3 Escape/选择/外部点击 → close() → setOpen(false) → useEffect 卸 class → seat 回 7 → 还原官方行为
- 失败降级：若 CSS 规则不生效（极端），行为 = 现状（被遮，但功能不坏）——可诊断（diag_report 上报 class 是否挂上）

## 验证计划

1. `npm run build` + `build:client`
2. bundle grep `mg-dshnms-open` 确认编译
3. diag_report 上报 `model-select:seat-lift:on/off`（可选：验证 class 挂卸）——若加，进 dsh.log 可查
4. 门禁 + verify-release + T1
