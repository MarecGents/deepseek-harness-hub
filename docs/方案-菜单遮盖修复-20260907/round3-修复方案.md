# 第三轮审查 · 修复方案报告（终版）

> 输入：round3-根因分析.md。方案 A 终版（终审 V1-V6 全 PASS，零阻塞项）。

## 方案 A（终版）：body class 抬 seat z-index

```css
body.mg-dshnms-open [data-composer-seat]{z-index:60 !important}
```

```ts
useEffect(() => {
  if (open) {
    document.body.classList.add('mg-dshnms-open')
    report('model-select:seat-lift:on')
  } else {
    document.body.classList.remove('mg-dshnms-open')
    report('model-select:seat-lift:off')
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

## 终审定稿要点

1. **CSS 特异性**：`body.mg-dshnms-open [data-composer-seat]` = (0,3,0) + !important，无条件压官方 (0,3,0) 非 important——**与注入顺序无关**（origin/importance 分组先于特异性）
2. **z 60**：∈(50, 1000) 空档——赢侧栏、不盖 rail/dock/标题栏/右键菜单
3. **生命周期同步**：open ↔ class ↔ z 严格同周期；8 条 setOpen(false) 路径全部收敛 → cleanup 必还原（closeOutside 直连 setOpen(false) 也走 effect cleanup）
4. **幂等**：classList.add/remove 幂等；StrictMode 双跑收敛到 open 值
5. **交互零回归**：菜单仍 absolute 在 seat 子树内，closeOutside/onBlur/onKeyDown 三守卫 DOM 前提不变
6. **可接受行为**：菜单打开期间 back-to-bottom/handles 被 seat 盖（官方 :has z9 语义放大版）
7. **hero/settling 无副作用**：trigger disabled，open 不可能为 true

## 备选触发条件

方案 A 理论必然生效（机制无环境依赖），B/C/D 无需进入。
