# 第三轮审查 · 代码落地方案报告（终版）

> 输入：round3-修复方案.md。实施清单（唯一改动文件 src/client/model-select.tsx）。

## 实施清单

1. **CSS 数组** `._dshnms_chevronOpen` 行后插入：
   `'body.mg-dshnms-open [data-composer-seat]{z-index:60 !important}',`

2. **report 提升模块级**：`:579-588` 定义上提至 STUB_DIRECTORY 后，函数体不变；installModelSelect 内删除原定义，`:592/:607/:661` 调用点不动

3. **useEffect([open])** 重写为 round3-修复方案.md 形态（else remove 放早退前、effect 体 add、cleanup 恒 remove、report on/off）

## 验证门禁

1. `npm run build` + `build:client`
2. bundle grep `mg-dshnms-open` + `seat-lift`
3. cargo fmt/clippy/test + 插件测试 + verify-plugin + verify-tauri-release
4. lib 四路径同步（repo/_up_ release/install _up_/dsh-hub-win）
5. verify-release + T1 build:installer
6. 提交 dev-v2

## 事件链（仿真已 PASS）

t0 点模型按钮 → t1 class 挂 + report on → t2 CSS 匹配 seat z→60 → t3 根上下文 60>50 → t4 菜单绘制在侧栏上方（逐像素保证，与几何无关）→ t5 点供应商双栏不被遮 → t6 选择/Escape/外部点击 → class 卸 + report off → seat 回 7
