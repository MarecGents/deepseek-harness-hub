# 任务计划：项目更名 dsh-hub（@marecgents/dsh-hub v0.0.1-rc.8）

## 目标
- npm 包名：`@marecgents/dsh-hub`，版本 `0.0.1-rc.8`
- GitHub 仓库名：`deepseek-harness-hub`（用户自行在网页改名）
- 全部旧名（`marec-dsh-desktop` / `mg-dsh-desktop` / `marec` / `mg-dsh` 命令）替换为新名
- README 信息全面更新
- 发布 npm（rc 标签，scoped 需 --access public）；旧包 deprecate
- Tauri 2.x 为未来技术方向（正式版发布前置条件），记入文档

## 阶段

### 阶段 1：调研与盘点（进行中）
- [ ] 全仓搜索旧名引用（package.json / README / src / scripts / bin / docs / cordis.patch.yml）
- [ ] 确认 bin 命令名（mg-dsh → dsh-hub?）
- [ ] 确认 npm scope 发布要求（@marecgents 归属 + --access public）

### 阶段 2：改名实施
- [ ] package.json：name + version + publishConfig.access + bin
- [ ] README 全面更新（标题/徽章/安装/命令/架构）
- [ ] src / scripts / bin / cordis.patch.yml 中旧名替换
- [ ] docs 文档（技术路线/交接/踩坑）同步

### 阶段 3：构建与发布
- [ ] npm run build + build:client
- [ ] commit + push
- [ ] npm publish --access public --tag rc
- [ ] 验证 npm + deprecate 旧包

### 阶段 4：收尾
- [ ] 写任务日志、清理规划文件

## 技能映射
- 改名/发布 → 直接执行（npm/git 命令 + 文本替换）
- 追踪 → planning-with-files-zh
