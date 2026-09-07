# 第二轮审查 · 修复方案报告（升级版）

> 输入：round2-根因分析.md。方案 A 定稿（含坑清单与必改细节）。

## 方案 A（定稿）：body class 抬 seat z-index

**CSS**（`model-select.tsx` CSS 数组新增）：

```css
body.mg-dshnms-open [data-composer-seat]{z-index:60 !important}
```

**JS**（`useEffect([open])` 扩展，与 closeOutside 监听同处）：

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

## 必改细节（第二轮确认）

1. **!important 必需**：官方 seat 规则特异性 (0,3,0)，hub 的 (0,2,0) 无 !important 必败（无论注入顺序）。!important 后恒压官方非 important。
2. **class 挂卸同 useEffect**：effect 体 add、cleanup 恒 remove（幂等，8 条 setOpen(false) 路径全部收敛 → 正确还原）。
3. **z-index 60**：>50 侧栏、<1000 rail/dock，落空档；不需要 1000+（会盖工具层交互，引入新问题）。
4. **行为变化（记录）**：菜单打开时 back-to-bottom（z8）与 width handles（z8）被 seat 盖住——与官方 :has z9 语义一致（官方自己的"菜单打开盖 back-to-bottom"设计），可接受。
5. **诊断上报**：`model-select:seat-lift:on/off` 进 dsh.log（report 提升为模块级，复用现有 diag_report 通道）。
6. **hero/settling 无副作用**：无需专属规则。
7. **与官方 :has 共存**：互斥触发，!important hub 规则恒赢，无冲突。

## 备选方案（按序）

- **B**：JS inline seat z-index（open 时 `seat.style.zIndex='60'`）——需处理 seat 重挂，仅当 A 失败。
- **C**：portal + 官方模式复用（`useAnchoredPosition` + `useDismissOnOutsidePointer` 已在 rc.1 发布包导出）+ 修 onBlur + z 1100——改动面 3-4 倍，A 失败才用。
- **D**：减小菜单宽度（兜底）——定量：双栏 520px 在默认左栏需 W≥1160 才不越界；减到 `≤ W−360−S`。**A 修复后 D 不需要**。

## 决策

**实施方案 A**。仿真通过后执行；若 A 实测失败（理论不应），依次 B → C → D。
