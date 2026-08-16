# 任务计划：PR 任务处理（本地合并 + 测试 + harness 更新）

## 目标（用户确认）
1. 本地合并 PR #2/#3 到 dev-v1，代码级测试功能生效
2. PR 处理方式：合并后关闭（不长期挂 open）
3. skins 新风格不受 UI 风格约束 → 更新根/UI harness + 每套 skin 建 {skin} 风格文档

## 阶段
- [ ] 阶段 1：合并 PR #2（零源码冲突）→ 构建 → 测试
- [ ] 阶段 2：合并 PR #3（解 settings-card/config-api 冲突）→ 构建 → 测试
- [ ] 阶段 3：harness 更新（根 AGENTS + client AGENTS + skins 风格文档）
- [ ] 阶段 4：处理 PR（close + comment）
- [ ] 阶段 5：构建验证 + 提交推送
- [ ] 阶段 6：收尾（日志 + 清理）

## 技能映射
- PR 操作 → gh CLI（GitHub 访问规范）
- 技术分析/修复 → 直接执行（AGENTS.md 约束）
- 追踪 → planning-with-files-zh
