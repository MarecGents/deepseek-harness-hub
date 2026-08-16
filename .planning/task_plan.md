# 任务计划 — PR #6 落地 + rc.12 发布

## 任务
按已批准方案（docs/PR6-兼容优化落地方案-2026-08-16-1815.md v4）执行：修复背景图渲染层 blocker → merge PR #6 → 收尾（decodeURIComponent/title/白名单/setSaving）→ 文档同步 → 构建冒烟 → 发布 rc.12。

## 技能映射
- 代码收尾/构建/发布 → 直接执行（无专项技能匹配；AGENTS.md §5 规定发布流程）

## 依赖链（串行）
0. merge PR #6（先决：后续修改在合并后代码上进行）— 已完成（4951df3）
1. 步骤0 渲染层修复 → 步骤3/4/5 收尾（同文件批次）→ 步骤6 文档 → 步骤7 构建冒烟 → 步骤8 发布

## 关键约定
- 渲染层：`#root div[style*="grid-template-columns"]` 锚点 + 双层背景 `linear-gradient(rgba(0,0,0,.25)) + url()`（蒙层 0.25 按实测微调）
- 静态路由拆 backgrounds-api.ts（同步改 index.ts 注册点）
- 发布按 AGENTS.md §5：merge main → main 重建 → publish --tag rc（显式 registry）→ latest → push 双分支
