# 任务计划 — 右侧栏透明度（真实环境重做）

## 问题
1. backdrop-filter 毛玻璃（0478485）→ 右侧栏消失+纯色（WebView2 真实环境）
2. 此前所有像素验证都在 CLI 实例（无插件、无右侧栏）→ 右侧栏从未被真实验证 = 盲区
3. 用户要求：回退 → 调研 → 模拟验证达 25% → 再落实

## 步骤
1. 回退 0478485（毛玻璃）
2. 启动带插件实例（DSH_HUB_LAUNCHED=1）→ Playwright 连端口 → 右侧栏存在
3. 真实环境验证：right-sidebar-root 75% color-mix（computed + 像素）
4. 理论达 25% 透出后，落实/保留代码
5. 文档 + 提交

## 教训（踩坑候选）
- body portal 元素只能在"加载插件的实例"验证；CLI 实例无插件
- backdrop-filter 在 WebView2 对该元素渲染异常 → 需真机验证后才可用
