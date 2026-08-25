# dsh-usage-stats

全会话 token 用量统计插件（PR #34，并入 dsh-hub monorepo 修订版）。遍历所有会话日志（`sessionPersistence`），折叠每次 assistant 消息 / usage 分片上报的 token 用量，按请求时的生效模型（provider/model）归属，聚合出「总 token 用量 + 各模型分布」，并在设置页提供可视化（趋势图、按天统计、费用估算、单价设置）。

## 功能
- **全量聚合**：输入 / 输出 / 缓存读 / 缓存写 tokens，按 `provider/model` 与按天归集，支持会话总数、请求数、费用估算。
- **增量缓存 + 防抖 + 预热**：按「会话 id + revision」缓存折叠结果，只重扫变化的会话；启动即后台预热，会话变化（`session/event`、`session/flush`）防抖触发后台重扫；周期刷新（5 分钟 TTL）。打开设置页时数据通常已就绪，且「陈旧即返回（stale-while-revalidate）」不阻塞请求。
- **设置页 section**：`settings.section`（id=`usage`）卡片：供应商/模型/时间范围筛选、各模型用量卡片、按天趋势图 + 表格、单价设置（USD/RMB 切换、汇率、置顶供应商）。
- **HTTP API**：`GET /dsh-usage-stats/api/overview`（`?refresh=1` 强制后台重扫）、`POST /dsh-usage-stats/api/prices`（保存单价，body `{ modelPrices, exchangeRate }`）。
- **headless 安全**：`webServer` 为可选服务（`ctx.get('webServer', null)` 守卫）——无服务端时不注册路由、不 PENDING；仅 `sessionPersistence` 为必选注入。

## 挂载（profile 级 patch）
纯 host + client 插件，通过 profile 级 `cordis.patch.yml` 的 `plugins` 段挂载（`id` 与 package.json `name` 一致）：
```yaml
plugins:
  - id: '@dsh-external/dsh-usage-stats'
    name: dsh-usage-stats
```
（需先装入 profile 的 node_modules；或并入 dsh-hub 仓库后随 `plugins/` 目录分发。）

## 数据与隐私
- 聚合缓存与单价数据写在 **dsh home 根目录的 `storages/`** 下：
  - `storages/dsh-usage-stats.json`（按会话指纹的聚合缓存）
  - `storages/dsh-usage-stats-sessions.json`（按会话 id+revision 的增量缓存）
  - `storages/dsh-usage-stats-prices.json`（单价配置）
- **DSH_HOME 优先**：设置了 `DSH_HOME` 时写入 `$DSH_HOME/storages/`（`DSH_HOME` 即 dsh home 根，等价于默认的 `~/.dsh`）；未设置时回退 `~/.dsh/storages/`——与 dsh 官方 `dsh-home-paths` / hub `helpers/state-store.ts` 的语义一致。测试环境建议使用隔离的 `DSH_HOME`，避免污染正式数据。
- 只落盘 token 计数与单价，不含会话正文。

## 配置（单价）
- 内置各供应商默认单价（每百万 token，估算；`cacheWrite` 暂不计费），未单独配置的模型落到供应商默认。
- 设置页「单价设置」可按 `provider/model` 覆盖单价、切换 USD/RMB 显示并设置汇率；保存后写入 `storages/dsh-usage-stats-prices.json`。

## 构建与检查
```sh
bash scripts/build.sh   # 语法冒烟：node --check lib/index.js + node --check lib/client.js
npm run check
```

## 发布说明
`package.json` 目前 `"private": true`（随 dsh-hub 仓库维护）；如独立发布 npm，请改为 `false` 并删除 `_comment` 字段。
