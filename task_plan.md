# task_plan.md — dsh-hub 皮肤覆盖修复 + 保存修复 + 选择器重设计 + 重命名

> 目标：① 皮肤全面覆盖左/中/右 + 卡片 + 文字高对比（frontend-design 系统性美化，保持 PR 风格）；② 勾选保存修复 + 复查；③ 皮肤选择器改方案 A（Setting-Cell 行式）；④ 重命名（设置卡片标题 + 窗口标题）；⑤ 文档同步（skins harness + 总 harness + 色板文档 + 踩坑记录）。构建并提交推送 dev-v1。

## 任务拆解与技能映射

- 皮肤 token 扩充 + 系统性美化（先行）→ 技能：frontend-design（用户指定，配色原则/一致性）
- 勾选保存修复（settings-card.tsx）→ 直接执行（bounded 修复）
- 皮肤选择器方案 A（同文件）→ 直接执行（参照官方 LanguageRow Setting-Cell 模式）
- 重命名（settings-card + cordis.patch.yml + launcher.mjs 引用）→ 直接执行
- 文档同步（依赖皮肤 token 定稿）→ 直接执行
- 构建/验证/提交 → 直接执行（harness 构建前推演）

## 阶段

- [x] 阶段1：skins.ts 新增 token（sidebar-fill / nav-item-* / bg-module-platform / specific-menu）×5 皮肤 ×2 模式
- [x] 阶段2：settings-card.tsx —— 皮肤选择器方案 A（行式 Menu + 动态 hint）
- [x] 阶段3：settings-card.tsx —— onSave 防御性修复 setDraft({...saved, ...patch}) + 复查
- [x] 阶段4：重命名 —— COPY.title→DSH HUB 设置；cordis.patch.yml 标题→DeepSeek Harness Hub；launcher.mjs 卡片名引用
- [x] 阶段5：文档 —— docs/skins/AGENTS.md（新 harness）+ 5×docs/skins/*.md 补 token 表 + 根/客户端 AGENTS.md §3.1 + 关键踩坑记录 #25/#26
- [ ] 阶段6：npm run build + build:client；代码级验证；git commit + push dev-v1
- [ ] 阶段7：归档任务日志 + 清理规划文件

## 关键决策（grill 已确认）

- Q1：全覆盖（sidebar/nav/module/menu token），frontend-design 美化，保持 PR 风格，深/浅两套适配
- Q2：文字用每套皮肤自己的 label 色系（不强制纯白纯黑）
- Q3：只改文本（卡片标题+窗口标题）；AUMID 保留
- Q4：重启后保存正常（旧内存代码）；仍做防御性修复
- Q5：文档同步 + skins harness + 总 harness 补充

## 遇到的错误

| 错误 | 尝试次数 | 解决方案 |
|------|---------|---------|
| （待记录） | | |
